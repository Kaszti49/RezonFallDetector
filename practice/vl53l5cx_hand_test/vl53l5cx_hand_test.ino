/*
  STEP 1 - VL53L5CX hand test on a classic ESP32 DevKit (30-pin, WROOM-32)
  ------------------------------------------------------------------------
  Library: "SparkFun VL53L5CX Arduino Library" (Arduino Library Manager)
  Board:   "ESP32 Dev Module"

  Wiring for the 9-pin SATEL-style board (sensor pin -> ESP32), proven by another team:
    GND      -> GND
    IOVDD    -> 3V3     sets the signal level: MUST be 3.3 V for the ESP32
    AVDD     -> VIN/5V  feeds the board's own regulator (LDO), which needs headroom above 3.3 V
    PWREN    -> GPIO18  enables that regulator; the sketch power-cycles the sensor on every boot
    LPn      -> 3V3     I2C always enabled
    SDA      -> GPIO21
    SCL      -> GPIO22
    I2C_RST  -> GPIO19 or unplugged (optional; the sketch pulses it once at boot)
    INT      -> GPIO25 or unplugged (optional; D23 was bent; without it the sketch polls)

  Serial output (115200):
    F,<64 values>  every frame, for the website (-1 = no valid target)
    I,<n>          once per second: INT pulses counted in that second (should be ~15)
    # ...          human-readable lines (grid about once per second)

  What you will see in Serial Monitor at 115200 baud:
    an 8x8 grid of distances in mm ('.' = no valid target), plus the closest zone's
    distance and direction. The on-board blue LED (GPIO2) blinks faster as your hand gets closer,
    like a car parking sensor.

  Orientation calibration (important for the robot later):
    Stand BEHIND the sensor, looking the same way it looks. Hold your hand in front of it on YOUR left.
    If the sketch says RIGHT, flip MIRROR_X. Do the same with your hand high or low, and flip FLIP_Y if it is wrong.
    Copy the final values into robot_avoid.ino.
*/
#include <Wire.h>
#include <SparkFun_VL53L5CX_Library.h>

#define PIN_SDA 21
#define PIN_SCL 22
#define PIN_PWREN 18
#define PIN_RST 19
#define PIN_INT 25
#define I2C_HZ  400000   // needs real pull-ups (2.2k-4.7k to 3V3). Drop to 100000 if the bus is flaky.
#define PIN_LED 2

// INT: the sensor pulls this line LOW when a frame is ready -> hardware interrupt on the ESP32
volatile uint32_t intCount = 0;
volatile bool intFlag = false;
void IRAM_ATTR onSensorInt() { intCount++; intFlag = true; }

#define MIRROR_X true    // flip if LEFT/RIGHT are swapped
#define FLIP_Y   false   // flip if UP/DOWN are swapped

SparkFun_VL53L5CX tof;
VL53L5CX_ResultsData data;

// Status 5 = valid. Status 9 = valid, but with a large pulse (often a close or very reflective target).
static inline bool valid(uint8_t s) { return s == 5 || s == 9; }

// (row, col) as the robot sees the scene: row 0 = top, col 0 = left -> sensor zone index
static inline int zone(int row, int col) {
  int r = FLIP_Y ? 7 - row : row;
  int c = MIRROR_X ? 7 - col : col;
  return r * 8 + c;
}

void i2cScan() {
  Serial.print("# I2C scan:");
  int found = 0;
  for (uint8_t a = 1; a < 127; a++) {
    Wire.beginTransmission(a);
    if (Wire.endTransmission() == 0) { Serial.printf(" 0x%02X", a); found++; }
  }
  Serial.println(found ? "   (VL53L5CX should be 0x29)" : " nothing found -> check SDA/SCL/power/LPn");
}

void setup() {
  Serial.begin(115200);
  delay(300);
  pinMode(PIN_LED, OUTPUT);

  Serial.println("# VL53L5CX hand test booting");
  // Clean power cycle of the sensor through the board's regulator (PWREN)
  pinMode(PIN_PWREN, OUTPUT);
  digitalWrite(PIN_PWREN, LOW);  delay(50);                // sensor fully off
  digitalWrite(PIN_PWREN, HIGH); delay(100);               // regulator on, let the supply settle
  pinMode(PIN_RST, OUTPUT);
  digitalWrite(PIN_RST, HIGH); delay(10);                  // pulse I2C_RST: clears a bus left half-finished
  digitalWrite(PIN_RST, LOW);  delay(10);                  // ...by a previous ESP32 reset, then keep it LOW
  pinMode(PIN_INT, INPUT_PULLUP);                          // INT is open-drain: needs a pull-up
  attachInterrupt(digitalPinToInterrupt(PIN_INT), onSensorInt, FALLING);

  // Does the breakout have its own SDA/SCL pull-up resistors? (pull-down probe: board pull-ups win -> reads 1)
  pinMode(PIN_SDA, INPUT_PULLDOWN); pinMode(PIN_SCL, INPUT_PULLDOWN); delay(5);
  Serial.printf("# Board pull-ups: SDA=%s SCL=%s\n", digitalRead(PIN_SDA) ? "yes" : "NO", digitalRead(PIN_SCL) ? "yes" : "NO");

  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.setClock(I2C_HZ);
  i2cScan();

  Serial.println("# Uploading ~84 KB firmware into the sensor (this takes a few seconds)...");
  uint32_t t0 = millis();
  if (!tof.begin()) {
    Serial.println("# ERROR VL53L5CX init FAILED. Check: 3V3, GND, SDA=21, SCL=22, LPn HIGH, RST LOW, pull-ups.");
    while (true) { digitalWrite(PIN_LED, !digitalRead(PIN_LED)); delay(80); }
  }
  Serial.printf("# Firmware upload OK in %lu ms\n", (unsigned long)(millis() - t0));
  tof.setResolution(8 * 8);       // 64 zones, max 15 Hz (4x4 allows up to 60 Hz)
  tof.setRangingFrequency(15);
  intCount = 0;
  tof.startRanging();
  Serial.println("# Ranging started.");
}

int nearestMm = -1;
uint32_t ledT = 0;
bool ledOn = false;

uint32_t frameNo = 0;

uint32_t pollT = 0, intReportT = 0;

void loop() {
  uint32_t nowMs = millis();

  // Once per second: report how many INT pulses arrived (expect ~15 at 15 Hz; 0 = INT not wired/working)
  if (nowMs - intReportT >= 1000) {
    intReportT = nowMs;
    noInterrupts(); uint32_t n = intCount; intCount = 0; interrupts();
    Serial.printf("I,%lu\n", (unsigned long)n);
  }

  // Read when INT says a frame is ready. Fallback: also ask over I2C every 20 ms,
  // so the demo still works if the INT wire is missing.
  bool ready = false;
  if (intFlag) { intFlag = false; ready = true; }
  else if (nowMs - pollT >= 20) { pollT = nowMs; ready = tof.isDataReady(); }

  if (ready && tof.getRangingData(&data)) {
    frameNo++;
    int best = 99999, br = -1, bc = -1;

    // 1) Machine-readable line for the website, EVERY frame:
    //    F,<64 distances in mm, row 0 = top, col 0 = left, -1 = no valid target>
    String line = "F";
    for (int r = 0; r < 8; r++) {
      for (int c = 0; c < 8; c++) {
        int i = zone(r, c);
        int d = -1;
        if (valid(data.target_status[i])) {
          d = data.distance_mm[i];
          if (d < best) { best = d; br = r; bc = c; }
        }
        line += ',';
        line += d;
      }
    }
    Serial.println(line);
    nearestMm = (br >= 0 && best < 600) ? best : -1;

    // 2) Human-readable grid about once per second (for Serial Monitor)
    if (frameNo % 15 == 0) {
      Serial.println("#      L  <-----------------------------  R");
      for (int r = 0; r < 8; r++) {
        Serial.print("#");
        for (int c = 0; c < 8; c++) {
          int i = zone(r, c);
          if (valid(data.target_status[i])) Serial.printf("%5d", data.distance_mm[i]);
          else Serial.print("    .");
        }
        Serial.println();
      }
      if (nearestMm > 0) {
        const char *h = bc < 3 ? "LEFT" : (bc > 4 ? "RIGHT" : "CENTER");
        const char *v = br < 3 ? "UP" : (br > 4 ? "DOWN" : "MIDDLE");
        Serial.printf("# Hand: %d mm   %s / %s\n", best, h, v);
      } else {
        Serial.println("# No hand within 600 mm");
      }
    }
  }

  // Parking-sensor LED: closer = faster blink
  uint32_t now = millis();
  if (nearestMm < 0) {
    digitalWrite(PIN_LED, LOW);
  } else {
    uint32_t period = map(constrain(nearestMm, 30, 600), 30, 600, 60, 800);
    if (now - ledT >= period / 2) { ledT = now; ledOn = !ledOn; digitalWrite(PIN_LED, ledOn); }
  }
}

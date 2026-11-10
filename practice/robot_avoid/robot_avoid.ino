/*
  STEP 3 - Obstacle-avoiding robot: ESP32 + VL53L5CX (8x8 ToF) + TB6612FNG + 2x N20 motors
  -----------------------------------------------------------------------------------------
  Library: "SparkFun VL53L5CX Arduino Library". Board: "ESP32 Dev Module" (works on core 2.x and 3.x).

  Pin map (see the wiring guide):
    VL53L5CX: SDA 21, SCL 22, LPn 18, I2C_RST 19
    TB6612:   PWMA 25, AIN1 26, AIN2 27  (A = LEFT motor)
              PWMB 13, BIN1 16, BIN2 17  (B = RIGHT motor)
              STBY 4   (LOW = driver off; LOW at boot, so the wheels don't twitch)

  How it works:
    The 8x8 depth image is split into 3 vertical sectors: LEFT (cols 0-2), CENTER (3-4), RIGHT (5-7).
    Only rows ROW_TOP..ROW_BOTTOM are used, so the floor is ignored.
    For each sector we take the 2nd-closest valid zone, which rejects single noisy pixels.
      far   -> drive forward and steer gently toward the side with more room
      close -> slow down
      too close -> back up briefly, then spin toward the freer side until the path is clear

  Start/stop:
    After boot the robot WAITS. Hold your hand < 12 cm in front of the sensor, then pull it away: it starts.
    Send 's' in Serial Monitor to stop it (and re-arm the hand start).
  Safety: if no sensor frame arrives for 300 ms, the motors stop.

  First run: put the robot on a box with the wheels in the air!
*/
#include <Wire.h>
#include <SparkFun_VL53L5CX_Library.h>

// ---------------- pins ----------------
#define PIN_SDA 21
#define PIN_SCL 22
#define PIN_LPN 18
#define PIN_RST 19
#define PIN_LED 2

#define PWMA 25
#define AIN1 26
#define AIN2 27
#define PWMB 13
#define BIN1 16
#define BIN2 17
#define STBY 4

// ---------------- sensor orientation (copy from the hand test) ----------------
#define MIRROR_X true
#define FLIP_Y   false
#define ROW_TOP    1     // 0 = top row. Rows outside ROW_TOP..ROW_BOTTOM are ignored.
#define ROW_BOTTOM 5     // lower this if the bottom rows keep "seeing" the floor

// ---------------- motors ----------------
#define INVERT_LEFT  false  // flip if this wheel spins backwards when it should go forward
#define INVERT_RIGHT true   // mirrored motors: one side is usually reversed
#define PWM_FREQ 20000      // 20 kHz: above hearing, TB6612 handles up to 100 kHz
#define PWM_BITS 8          // duty 0..255

// ---------------- behaviour tuning ----------------
const int   CRUISE      = 170;   // forward PWM on open floor
const int   MIN_SPEED   = 95;    // the slowest PWM at which the N20s still move reliably (measure yours)
const int   TURN_SPEED  = 150;
const int   BACK_SPEED  = 130;
const int   STOP_MM     = 180;   // obstacle closer than this in the center -> back up and turn
const int   SIDE_MM     = 120;   // obstacle this close on a side -> also back up and turn
const int   SLOW_MM     = 600;   // start slowing down below this
const int   CLEAR_MM    = 450;   // while turning: the center must be this free to drive again
const float STEER_GAIN  = 0.12f; // PWM per mm of left/right difference
const int   MAX_STEER   = 70;
const uint32_t BACK_MS        = 350;
const uint32_t TURN_MAX_MS    = 2500;  // turned this long and still blocked -> back up again
const uint32_t SENSOR_TIMEOUT = 300;
const int   RAMP_PER_10MS     = 15;    // soft start/stop: limits current spikes and brownouts

SparkFun_VL53L5CX tof;
VL53L5CX_ResultsData data;

enum State { WAIT_START, DRIVE, BACK, TURN };
State state = WAIT_START;
uint32_t stateT = 0, lastFrameT = 0;
bool armed = false;
int turnDir = 1;                 // +1 = spin right, -1 = spin left
int dL = 4000, dC = 4000, dR = 4000;
int targetL = 0, targetR = 0, outL = 0, outR = 0;

// ------------------------------------------------------------------ motors
void pwmInit(int pin, int ch) {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  (void)ch; ledcAttach(pin, PWM_FREQ, PWM_BITS);
#else
  ledcSetup(ch, PWM_FREQ, PWM_BITS); ledcAttachPin(pin, ch);
#endif
}
void pwmWrite(int pin, int ch, int duty) {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  (void)ch; ledcWrite(pin, duty);
#else
  (void)pin; ledcWrite(ch, duty);
#endif
}
void driveOne(int pwmPin, int ch, int in1, int in2, int speed) {   // speed -255..255
  speed = constrain(speed, -255, 255);
  if (speed > 0)      { digitalWrite(in1, HIGH); digitalWrite(in2, LOW);  }
  else if (speed < 0) { digitalWrite(in1, LOW);  digitalWrite(in2, HIGH); }
  else                { digitalWrite(in1, LOW);  digitalWrite(in2, LOW);  }  // coast
  pwmWrite(pwmPin, ch, abs(speed));
}
void applyMotors() {   // called every 10 ms: ramp outputs toward the targets
  auto ramp = [](int cur, int tgt) {
    if (tgt > cur) return min(tgt, cur + RAMP_PER_10MS);
    if (tgt < cur) return max(tgt, cur - RAMP_PER_10MS);
    return cur;
  };
  outL = ramp(outL, targetL);
  outR = ramp(outR, targetR);
  driveOne(PWMA, 0, AIN1, AIN2, INVERT_LEFT  ? -outL : outL);
  driveOne(PWMB, 1, BIN1, BIN2, INVERT_RIGHT ? -outR : outR);
  digitalWrite(STBY, (outL || outR || targetL || targetR) ? HIGH : LOW);
}
void setTargets(int l, int r) { targetL = l; targetR = r; }

// ------------------------------------------------------------------ sensor
static inline bool valid(uint8_t s) { return s == 5 || s == 9; }
static inline int zone(int row, int col) {
  int r = FLIP_Y ? 7 - row : row;
  int c = MIRROR_X ? 7 - col : col;
  return r * 8 + c;
}
// 2nd-closest valid zone in columns c0..c1 (rejects one-pixel noise). 4000 = nothing seen.
int sectorDistance(int c0, int c1) {
  int m1 = 4000, m2 = 4000;
  for (int r = ROW_TOP; r <= ROW_BOTTOM; r++)
    for (int c = c0; c <= c1; c++) {
      int i = zone(r, c);
      if (!valid(data.target_status[i])) continue;
      int d = data.distance_mm[i];
      if (d < m1) { m2 = m1; m1 = d; } else if (d < m2) { m2 = d; }
    }
  return m2;
}

void enter(State s) { state = s; stateT = millis(); }

// ------------------------------------------------------------------ setup
void setup() {
  Serial.begin(115200);
  delay(300);

  // Motor driver off first, so nothing moves during the slow sensor init
  pinMode(STBY, OUTPUT); digitalWrite(STBY, LOW);
  pinMode(AIN1, OUTPUT); pinMode(AIN2, OUTPUT); pinMode(BIN1, OUTPUT); pinMode(BIN2, OUTPUT);
  pwmInit(PWMA, 0); pwmInit(PWMB, 1);
  pinMode(PIN_LED, OUTPUT);

  pinMode(PIN_LPN, OUTPUT); digitalWrite(PIN_LPN, HIGH);
  pinMode(PIN_RST, OUTPUT); digitalWrite(PIN_RST, LOW);
  delay(10);
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.setClock(400000);

  Serial.println("Init VL53L5CX (firmware upload, a few seconds)...");
  if (!tof.begin()) {
    Serial.println("VL53L5CX init FAILED - run the hand test sketch first.");
    while (true) { digitalWrite(PIN_LED, !digitalRead(PIN_LED)); delay(80); }
  }
  tof.setResolution(8 * 8);
  tof.setRangingFrequency(15);
  tof.startRanging();
  lastFrameT = millis();
  Serial.println("Ready. Hand < 12 cm in front, then pull it away to start. 's' = stop.");
}

// ------------------------------------------------------------------ loop
void loop() {
  uint32_t now = millis();

  // Serial stop command
  if (Serial.available()) {
    char ch = Serial.read();
    if (ch == 's' || ch == 'S') { setTargets(0, 0); armed = false; enter(WAIT_START); Serial.println("STOP"); }
  }

  // New depth frame?
  bool fresh = false;
  if (tof.isDataReady() && tof.getRangingData(&data)) {
    dL = sectorDistance(0, 2);
    dC = sectorDistance(3, 4);
    dR = sectorDistance(5, 7);
    lastFrameT = now;
    fresh = true;
  }
  bool sensorOk = (now - lastFrameT) < SENSOR_TIMEOUT;

  switch (state) {
    case WAIT_START:
      setTargets(0, 0);
      digitalWrite(PIN_LED, (now / 500) % 2);       // slow blink = waiting
      if (fresh && dC < 120) armed = true;           // hand close...
      if (armed && fresh && dC > 300) {              // ...then removed -> go
        armed = false; digitalWrite(PIN_LED, HIGH); enter(DRIVE);
      }
      break;

    case DRIVE: {
      if (!sensorOk) { setTargets(0, 0); break; }
      if (dC < STOP_MM || dL < SIDE_MM || dR < SIDE_MM) {
        turnDir = (dR >= dL) ? +1 : -1;             // pick the freer side and commit to it
        enter(BACK);
        break;
      }
      // Speed falls linearly from CRUISE to MIN_SPEED as the center distance goes from SLOW_MM to STOP_MM
      int speed = (dC >= SLOW_MM) ? CRUISE
                : map(dC, STOP_MM, SLOW_MM, MIN_SPEED, CRUISE);
      // Steer toward the side with more room (limit to 1 m so open space doesn't dominate)
      int steer = (int)(STEER_GAIN * (min(dR, 1000) - min(dL, 1000)));
      steer = constrain(steer, -MAX_STEER, MAX_STEER);   // + = turn right
      setTargets(speed + steer, speed - steer);
      break;
    }

    case BACK:
      setTargets(-BACK_SPEED, -BACK_SPEED);
      if (now - stateT > BACK_MS) enter(TURN);
      break;

    case TURN:
      if (!sensorOk) { setTargets(0, 0); break; }
      setTargets(turnDir * TURN_SPEED, -turnDir * TURN_SPEED);   // spin in place
      if (fresh && dC > CLEAR_MM && dL > SIDE_MM && dR > SIDE_MM) enter(DRIVE);
      else if (now - stateT > TURN_MAX_MS) enter(BACK);          // stuck in a corner -> back up again
      break;
  }

  // 10 ms motor tick with ramping
  static uint32_t motorT = 0;
  if (now - motorT >= 10) { motorT = now; applyMotors(); }

  // Telemetry 5x per second
  static uint32_t logT = 0;
  if (now - logT >= 200) {
    logT = now;
    const char *names[] = {"WAIT", "DRIVE", "BACK", "TURN"};
    Serial.printf("%-5s  L=%4d C=%4d R=%4d   pwm L=%4d R=%4d\n", names[state], dL, dC, dR, outL, outR);
  }
}

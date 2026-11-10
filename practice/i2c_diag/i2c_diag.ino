/*
  Diagnostic for the SATEL-style 9-pin VL53L5CX board.
  Wiring: AVDD->VIN(5V), IOVDD->3V3, PWREN->D18, LPn->3V3, SDA->D21, SCL->D22, (I2C_RST->D19, INT->D25 optional)
*/
#include <Wire.h>

int rd(int p, int mode) { pinMode(p, mode); delay(3); return digitalRead(p); }
void lines(const char *when) {
  int sdaU = rd(21, INPUT_PULLUP), sdaD = rd(21, INPUT_PULLDOWN);
  int sclU = rd(22, INPUT_PULLUP), sclD = rd(22, INPUT_PULLDOWN);
  int intU = rd(25, INPUT_PULLUP), intD = rd(25, INPUT_PULLDOWN);
  Serial.printf("# %-28s SDA PU/PD=%d/%d  SCL PU/PD=%d/%d  INT PU/PD=%d/%d\n", when, sdaU, sdaD, sclU, sclD, intU, intD);
}
int scan(uint32_t hz) {
  Wire.end(); Wire.begin(21, 22, hz); Wire.setTimeOut(20);
  int n = 0;
  Serial.printf("#   scan @%6lu Hz:", (unsigned long)hz);
  for (uint8_t a = 0x08; a < 0x78; a++) { Wire.beginTransmission(a); if (Wire.endTransmission() == 0) { Serial.printf(" 0x%02X", a); n++; } }
  Serial.println(n ? "" : " none");
  Wire.end();
  return n;
}
void clocks() {   // free a stuck SDA: 18 clocks on SCL with SDA released
  pinMode(21, INPUT_PULLUP); pinMode(22, OUTPUT);
  for (int k = 0; k < 18; k++) { digitalWrite(22, LOW); delayMicroseconds(20); digitalWrite(22, HIGH); delayMicroseconds(20); }
  pinMode(22, INPUT_PULLUP);
}

void setup() {
  Serial.begin(115200); delay(400);
  Serial.println("# ===== DIAG v3 =====");
  pinMode(19, OUTPUT); digitalWrite(19, LOW);       // I2C_RST low (if connected)
  pinMode(18, OUTPUT); digitalWrite(18, LOW); delay(200);
  lines("power OFF (PWREN low):");
  digitalWrite(18, HIGH);
  delay(10);  lines("power ON +10 ms:");
  delay(90);  lines("power ON +100 ms:");
  delay(400); lines("power ON +500 ms:");
  scan(100000); scan(10000);
  clocks();   lines("after 18 SCL clocks:");
  scan(100000); scan(10000);
  digitalWrite(19, HIGH); delay(10); digitalWrite(19, LOW); delay(10);
  lines("after I2C_RST pulse:");
  scan(100000);
  Serial.println("# ===== END =====");
}
void loop() { delay(1000); }

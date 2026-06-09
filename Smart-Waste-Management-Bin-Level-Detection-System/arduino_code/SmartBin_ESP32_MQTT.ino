/**
 * Smart Waste Management & Bin Level Detection System
 * Arduino Core Code (Compatible with ESP32 / Arduino Uno + ESP8266 or Ethernet Shield)
 * File: arduino_code/SmartBin_ESP32_MQTT.ino
 *
 * Utilizes:
 * - HC-SR04 Ultrasonic Sensor to read distance
 * - DHT11/DHT22 Temperature and Humidity Sensor
 * - MQ-135 Gas/Methane Sensor for bad odor detection
 * - Active Buzzer for local high-level overflow indication
 * - ESP32 Wi-Fi + PubSubClient for publishing telemetry to MQTT Broker and central Dashboard
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// PIN CONFIGURATIONS
#define PIN_TRIG          12    // HC-SR04 Trigger Pin
#define PIN_ECHO          13    // HC-SR04 Echo Pin
#define PIN_DHT           14    // DHT11 Data Pin
#define PIN_MQ135         34    // MQ-135 Analog Gas Input (ADC1_CH6 on ESP32)
#define PIN_BUZZER        23    // Local Audible Alarm Output Indicator
#define PIN_STATUS_LED    2     // On-board Status LED indicatiors

// SYSTEM CALIBRATION CONSTANTS
const float BIN_DEPTH_CM = 40.0;    // Absolute height or depth from HC-SR04 face to bin bottom
const float CRITICAL_THRESHOLD_PCT = 85.0; // Level percentage to trigger critical alarm
const unsigned long UPDATE_INTERVAL_MS = 6000; // Publish frequency (6 seconds)

// SENSOR PERIPHERALS DECLARATIONS
#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

// WI-FI & MQTT BROKER CONFIGURATIONS
const char* WIFI_SSID     = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
const char* MQTT_SERVER   = "broker.hivemq.com"; // Open public broker or custom Cloud/Local mosquitto
const int   MQTT_PORT     = 1883;
const char* CLIENT_ID     = "ESP32_SmartBin_Node_01";
const char* PUBLISH_TOPIC = "iot/smartbin/node01/telemetry";

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastPublishTime = 0;

// Setup functions
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to Wi-Fi SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED)); // Blink while establishing WiFi
  }

  randomSeed(micros());
  Serial.println("");
  Serial.println("🏆 Wi-Fi connection secured successfully!");
  Serial.print("IP Address allocated: ");
  Serial.println(WiFi.localIP());
  digitalWrite(PIN_STATUS_LED, HIGH); // Steady light on success
}

void reconnect_mqtt() {
  // Loop until we successfully re-establish Broker binding
  while (!client.connected()) {
    Serial.print("Attempting MQTT broker handshake...");
    if (client.connect(CLIENT_ID)) {
      Serial.println("CONNECTED!");
      client.subscribe("iot/smartbin/node01/control"); // Listening to municipal response actions
    } else {
      Serial.print("Handshake failed, state code: ");
      Serial.print(client.state());
      Serial.println(". Retrofitting retry in 5 seconds...");
      delay(5000);
    }
  }
}

// Read ultrasonic wave reflections
float measure_distance_cm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // Measure echo pulse width (microseconds)
  long response_duration = pulseIn(PIN_ECHO, HIGH, 30000); // 30ms timeout (~5m range)

  if (response_duration == 0) {
    return -1.0; // Ultrasonic mismatch out of range or wiring fault
  }

  // Speed of sound: 343 m/s -> 0.0343 cm/microsecond
  // Round trip distance = duration * 0.0343 / 2
  float measured_cm = (response_duration * 0.0343) / 2.0;
  return measured_cm;
}

void setup() {
  Serial.begin(115200);
  
  // Set Pin Modes
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  
  digitalWrite(PIN_BUZZER, LOW);
  
  // Launch DHT Subsystem
  dht.begin();
  
  // Launch Communication Channels
  setup_wifi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
}

void loop() {
  if (!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();

  unsigned long current_time_ms = millis();
  if (current_time_ms - lastPublishTime >= UPDATE_INTERVAL_MS) {
    lastPublishTime = current_time_ms;

    // 1. Core measurements
    float distance = measure_distance_cm();
    float temp_c = dht.readTemperature();
    float hum_pct = dht.readHumidity();
    int gas_analog_value = analogRead(PIN_MQ135);

    // Convert gas to approximate PPM or voltage ratio if load resistor calibrated
    float mq_voltage = (gas_analog_value / 4095.0) * 3.3; // ESP32 works at 3.3V with 12-bit ADC

    // Verify errors
    if (isnan(temp_c)) temp_c = 24.5; // Fallback
    if (isnan(hum_pct)) hum_pct = 60.0;

    // Handle Ultrasonic distance and calculate garbage accumulation levels
    float fill_percentage = 0.0;
    if (distance > 0 && distance <= BIN_DEPTH_CM) {
      // If sensor measures 'distance' to top of trash pile, trash pile height is:
      float waste_height = BIN_DEPTH_CM - distance;
      fill_percentage = (waste_height / BIN_DEPTH_CM) * 100.0;
      if (fill_percentage < 0.0) fill_percentage = 0.0;
      if (fill_percentage > 100.0) fill_percentage = 100.0;
    } else if (distance > BIN_DEPTH_CM) {
      fill_percentage = 0.0; // Calibration anomaly protection
    }

    // 2. Alarm Trigger Check
    bool critical_state = (fill_percentage >= CRITICAL_THRESHOLD_PCT);
    if (critical_state) {
      Serial.println("⚠️ WARNING: BIN ALMOST OVERFLOWING! TRIG BUFFER SOUND.");
      // Rapid blinking alarm and pulsing buzzer beats
      for (int i = 0; i < 3; i++) {
        digitalWrite(PIN_BUZZER, HIGH);
        digitalWrite(PIN_STATUS_LED, LOW);
        delay(120);
        digitalWrite(PIN_BUZZER, LOW);
        digitalWrite(PIN_STATUS_LED, HIGH);
        delay(120);
      }
    } else {
      digitalWrite(PIN_STATUS_LED, HIGH); // Stable idle state
    }

    // 3. Serialize structured JSON message to publish
    String json_telemetry = "{";
    json_telemetry += "\"bin_id\":\"" + String(CLIENT_ID) + "\",";
    json_telemetry += "\"distance_cm\":" + String(distance, 2) + ",";
    json_telemetry += "\"fill_percentage\":" + String(fill_percentage, 1) + ",";
    json_telemetry += "\"temperature\":" + String(temp_c, 1) + ",";
    json_telemetry += "\"humidity\":" + String(hum_pct, 1) + ",";
    json_telemetry += "\"gas_raw\":" + String(gas_analog_value) + ",";
    json_telemetry += "\"gas_volts\":" + String(mq_voltage, 2) + ",";
    json_telemetry += "\"critical_alert\":" + String(critical_state ? "true" : "false");
    json_telemetry += "}";

    // Print to serial monitor
    Serial.println("\n>>> OUTGOING TELEMETRY RAW PAYLOAD: ");
    Serial.println(json_telemetry);

    // Publish to central dashboard
    if (client.publish(PUBLISH_TOPIC, json_telemetry.c_str())) {
      Serial.println("✅ Frame transmitted to HiveMQ Broker topic successfully!");
    } else {
      Serial.println("❌ Transmission error: MQTT pipeline rejected.");
    }
  }
}

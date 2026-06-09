export interface InterviewQA {
  id: number;
  question: string;
  answer: string;
  concept: string;
}

export interface ComponentSpecification {
  name: string;
  role: string;
  pinConnections: string;
  rationale: string;
}

export interface ImplementationPhase {
  phaseNum: number;
  title: string;
  objective: string;
  tasks: string[];
  output: string;
  mistakes: string[];
}

export const INTERVIEW_QUESTIONS: InterviewQA[] = [
  {
    id: 1,
    concept: "Project Overview",
    question: "Explain your project.",
    answer: "I designed and implemented an IoT-based Smart Waste Management and Bin Level Detection System. The project solves the problem of inefficient static trash collection routes by monitoring the real-time fill level of garbage bins using ultrasonic depth sensors (HC-SR04). The distance measurements are captured by an ESP32 microcontroller, converted into dynamic fill percentages, and transmitted as lightweight JSON payloads over MQTT (or HTTP) to a centralized Cloud Dashboard. It dynamically informs authorities when bins are close to overflowing (>80%), supporting route optimization, fuel savings of up to 30%, and a cleaner urban environment."
  },
  {
    id: 2,
    concept: "Sensor Principles",
    question: "How does the HC-SR04 ultrasonic sensor calculate the distance to the trash surface?",
    answer: "The HC-SR04 operates by sending an ultrasound pulse (at 40 kHz) from its transmitter trigger pin for at least 10 microseconds. This acoustic wave travels through the air, hits the rubbish surface, and bounces back to the receiver echo pin. The echo pin remains HIGH for the duration of the wave's flight. The distance is calculated in microcontrollers using the speed of sound: Distance = (Pulse Duration × Speed of Sound) / 2. Utilizing 0.034 cm/µs, the formula is: Distance = (Duration × 0.034) / 2."
  },
  {
    id: 3,
    concept: "State Mapping",
    question: "How do you translate distance readings from the HC-SR04 into fill percentage percentages?",
    answer: "We calibrate the sensor relative to the physical bin height (H). When the bin is entirely empty, the measured distance is equal to the bin height (H). As waste accumulates, the distance (D) between the sensor (mounted at the top) and the waste surface decreases. The fill level percentage is computed using the formula: Fill Percentage = 100 × (1 - (D / H)). We also apply logical bounds (clamping the value between 0% and 100%) to handle sensor noises or objects temporarily jumping closer than the absolute top."
  },
  {
    id: 4,
    concept: "Protocol Choices",
    question: "Why did you choose MQTT over HTTP for transferring telemetry in this IoT system?",
    answer: "MQTT (Message Queuing Telemetry Transport) is a lightweight, publish-subscribe messaging protocol ideal for resource-constrained embedded systems and low-bandwidth networks. Compared to HTTP's high-overhead request-response model (which loads massive headers and maintains TCP connections repeatedly), MQTT operates on a single continuous connection with minimal 2-byte header packets. This lowers the power consumption of battery-powered smart bins, reduces active bandwidth usage, and supports real-time alert multicasting to multiple dashboard clients."
  },
  {
    id: 5,
    concept: "Embedded Architecture",
    question: "Why is the ESP32 preferred over a standard Arduino Uno or Raspberry Pi?",
    answer: "The ESP32 is preferred because it integrates modular dual-core CPUs with on-board Wi-Fi and Bluetooth BLE chips at a very low price. A standard Arduino Uno lacks native wireless connectivity, requiring bulky and expensive ESP8266 shields. On the other hand, a Raspberry Pi is a complete single-board computer which draws excessive idling power (often >2W) and runs full operating systems that can lead to SD card corruption on sudden power outages. The ESP32 provides a microsecond-precise, low-power real-time micro-operating environment ideal for outdoor solar-powered nodes."
  },
  {
    id: 6,
    concept: "Power Management",
    question: "How would you optimize this system to run on a battery / solar panel for a year?",
    answer: "Since garbage levels change slowly, sending data continuously is a waste of battery. I would program the ESP32 to enter deep sleep mode where the Wi-Fi modem and CPU cores are shut down, leaving only the ultra-low-power co-processor active to monitor timers. The node wakes up once every 15 minutes, fires the ultrasonic sensor, connects to Wi-Fi to publish MQTT data, and immediately sleeps again. This duty cycle reduces current consumption from ~120mA active to just 15µA inactive, enabling a standard 18650 Li-ion battery (2600mAh) to run for months on a tiny solar charger."
  },
  {
    id: 7,
    concept: "Error Handling & Edge Cases",
    question: "How do you prevent false alarms caused by irregular waste shapes or throwing things in the bin?",
    answer: "Organic waste settles unevenly, which can cause local false peaks. To prevent spike readings or transient false alarms, we implement moving average filtering (or median filtering) in the ESP32. Instead of broadcasting a single ultrasonic print, the firmware collects 5 sequential readings, filters out anomalous high/low spikes, and calculates the average. Additionally, we use a hysteresis threshold (e.g. alarming at >80% and only de-escalating when it falls back below 75%) to prevent jitter alarms when trash is hovering on the boundary."
  },
  {
    id: 8,
    concept: "Environmental Monitoring",
    question: "What is the purpose of adding temperature, humidity, and gas sensors to a waste bin?",
    answer: "Adding a DHT11/DHT22 (temperature/humidity) and an MQ-135 (gas/air quality) helps monitor biochemical decomposition. When organic landfill materials decompose anaerobically, they generate heat and release combustible or toxic gases such as methane (CH4), carbon dioxide (CO2), and ammonia (NH3). High temperature and wet humidity inside a sealed bin accelerate bacterial decay, causing heavy odor. Monitoring these helps detect internal fire hazards early and allows scheduling priority clearing for highly odorous bins containing wet food waste."
  },
  {
    id: 9,
    concept: "Real-world Cloud Architecture",
    question: "How does the cloud architecture scale when monitoring thousands of bins across a smart city?",
    answer: "We would deploy an MQTT Broker cluster (like HiveMQ or EMQX) as the ingress gateway, routing raw telemetry directly to Apache Kafka or RabbitMQ. A microservices-based backend can consume these streams to write time-series databases (e.g. InfluxDB) and trigger lambda serverless jobs for anomaly detection. A centralized dashboard reads aggregate status from redis caches and plots pins on OpenStreetMap layers, while dynamic routing frameworks (such as pgRouting or Google Maps Matrix API) compute daily optimized pathways for garbage hauling fleets."
  },
  {
    id: 10,
    concept: "Failure Modes",
    question: "What happens if a bin loses network connectivity entirely? How does your system handle it?",
    answer: "This is a common field problem. On the firmware side, the ESP32 includes a retry loop. If connection to the MQTT broker drops, it attempts to reconnect 3 times; if it fails, it can cache critical alarms locally in the non-volatile SPIFFS/LittleFS memory. On the dashboard side, we implement a 'Last Will and Testament' (LWT) message configured in the MQTT client setup. If the bin suddenly crashes or runs out of battery, the broker detects the timeout and automatically broadcasts an 'Offline' status topic, notifying the maintenance team immediately."
  }
];

export const TECHNICAL_SPECS: ComponentSpecification[] = [
  {
    name: "ESP32 DevKit V1",
    role: "System Brain & Node Controller",
    pinConnections: "VCC (5V USB/Battery), GND, GPIO 5 (Trig), GPIO 18 (Echo), GPIO 12/13 (Status LEDs), GPIO 15 (Active Buzzer)",
    rationale: "Dual-core processor with native 2.4GHz Wi-Fi. Supports deep sleeping state patterns. Translates physical sensor timings to digital packets."
  },
  {
    name: "HC-SR04 Ultrasonic Sensor",
    role: "Non-contact Waste Level Monitor",
    pinConnections: "VCC -> 5V, GND -> GND, Trig -> GPIO 5, Echo -> GPIO 18 (using 5V to 3.3V voltage divider)",
    rationale: "Measures distances from 2cm to 400cm with 3mm precision. Mounted securely on bottom profile of the container lid, pointing downwards."
  },
  {
    name: "MQ-135 Gas Sensor",
    role: "Odor level & Decomposition Tracker",
    pinConnections: "VCC -> 5V, GND -> GND, Analog Out -> GPIO 34 (ADC1)",
    rationale: "Senses ammonia, benzene, smoke, and organic vapors. Higher levels signal organic breakdown and high biological decomposition odors."
  },
  {
    name: "DHT11 Temp & Humidity Sensor",
    role: "Atmosphere monitoring / Decomposition speed",
    pinConnections: "VCC -> 3.3V, GND -> GND, Data Out -> GPIO 4",
    rationale: "Ensures the internal chamber moisture is indexed. High humidity + high temperature accelerates rot, generating high priority for removal."
  },
  {
    name: "Active 5V Buzzer",
    role: "Local Overflow Alarm",
    pinConnections: "Positive -> GPIO 15, Negative -> GND",
    rationale: "Produces a loud 85dB diagnostic warning chime when critical levels are crossed locally, warning citizens to avoid pushing more materials."
  },
  {
    name: "Diagnostic Status LEDs",
    role: "Local State Indication",
    pinConnections: "Green LED -> Pin 12, Red LED -> Pin 13",
    rationale: "Red flashing means bin is completely full or offline, green flashing means healthy online operations with plenty of remaining room."
  }
];

export const IMPLEMENTATION_PHASES: ImplementationPhase[] = [
  {
    phaseNum: 1,
    title: "Environment Setup",
    objective: "Prepare your PC and embedded tools for compile and upload.",
    tasks: [
      "Download and install Arduino IDE (or VS Code + PlatformIO).",
      "Add the ESP32 board manager URL under Preferences.",
      "Install library extensions: 'PubSubClient' by Nick O'Leary and 'DHT sensor library' by Adafruit.",
      "Install micro-USB driver (CP2102 or CH340) for ESP32 board recognition."
    ],
    output: "Arduino IDE compiles empty sketch safely and identifies the ESP32 COM port on USB insertion.",
    mistakes: [
      "Failing to install the USB-to-UART driver, making the COM port invisible.",
      "Using a raw charge-only micro-USB cable instead of a dedicated transfer data cable."
    ]
  },
  {
    phaseNum: 2,
    title: "Sensor Setup & Mount",
    objective: "Establish secure mechanical mounting and check safe electrical power flows.",
    tasks: [
      "Cut hole template templates in a container-lid to fit the transmitter and receiver eyes of the HC-SR04.",
      "Wire the sensor securely. ESP32 pins operate at 3.3V, while the HC-SR04 requires 5V for reliable range.",
      "Construct a simple resistor voltage divider (1kΩ and 2kΩ resistors) on the ECHO line to step-down the 5V signal to 3.3V for ESP32 safety."
    ],
    output: "HC-SR04 powered up cleanly and comfortably without heating up any pin on the controller.",
    mistakes: [
      "Feeding 5V directly to the ESP32 input pin. This can stress or permanently fry the GPIO port over time.",
      "Mounting the sensor too deeply inside, causing reflections from the container walls."
    ]
  },
  {
    phaseNum: 3,
    title: "Distance Measurement Sketch",
    objective: "Write custom code targeting trigger pin delays to record echo flight time.",
    tasks: [
      "Send a low-high-low pulse sequence on the TRIG pin using microseconds delays.",
      "Analyze the response pulse length using 'pulseIn(ECHO_PIN, HIGH)'.",
      "Convert pulse duration (microseconds) to distance using the formula: distance = pulse_duration * 0.034 / 2."
    ],
    output: "The Arduino Serial Monitor displays live distance measurements in centimeters reacting to target shifts.",
    mistakes: [
      "Not setting TRIG pin as OUTPUT and ECHO pin as INPUT in setup().",
      "Blocking the loop using long delay() timers, making active interrupts sluggish."
    ]
  },
  {
    phaseNum: 4,
    title: "Fill Level Calibration",
    objective: "Establish maximum/minimum boundaries to calculate fill quotients accurately.",
    tasks: [
      "Measure the absolute distance from the lid top to the bottom of the container (e.g. 30 cm) - set this as 'BIN_HEIGHT'.",
      "Implement the formula: waste_height = BIN_HEIGHT - measured_distance.",
      "Calculate fill_percentage = (waste_height / BIN_HEIGHT) * 100.0.",
      "Apply constraint safeguards: constrain values with floor (0%) and ceiling (100%)."
    ],
    output: "The serial output prints real-time calibrated values: 'Fill: 42.5% [18 cm remaining]' matching reality.",
    mistakes: [
      "Hardcoding bin height metrics without physical checking, causing negative percentages.",
      "Failing to clamp values, leading to bizarre overflows like '-12%' or '254%'."
    ]
  },
  {
    phaseNum: 5,
    title: "Alert Logic & local Indicators",
    objective: "Map states directly to buzzer systems and red/green signaling assets.",
    tasks: [
      "Create logical thresholds: Green < 50%, Orange 50-80%, Red/Critical > 80%.",
      "Write conditional statements to switch state levels.",
      "Trigger the active board buzzer with an active chime pattern if the fill metric surpasses 80%."
    ],
    output: "An LED turns red and the buzzer chirps aggressively when a physical obstacle comes closer than 6cm to the sensor.",
    mistakes: [
      "Using a continuous passive buzzer frequency block that locks the main code loop progress.",
      "Powering a highly demanding high-impedance buzzer directly from the GPIO pin with no currents protection."
    ]
  },
  {
    phaseNum: 6,
    title: "Dashboard & Wi-Fi Gateway",
    objective: "Acquire Wi-Fi connections and register connections to network gateways.",
    tasks: [
      "Configure WiFiClient to connect to a local SSID/Hotspot network.",
      "Implement non-blocking reconnection check routines in loop().",
      "Ensure the ESP32 grabs an IP address successfully and prints it out to debugging streams."
    ],
    output: "System boots up, flashes Green, and prints: 'Wi-Fi Connected! IP Address: 192.168.1.42'.",
    mistakes: [
      "Hardcoding unstable network profiles, leading to persistent boot freezes with no fallback.",
      "Running heavy web routines without checking active link connection statuses."
    ]
  },
  {
    phaseNum: 7,
    title: "MQTT Payload Transmission",
    objective: "Package sensor values inside a structured JSON payload and transmit to cloud brokers.",
    tasks: [
      "Connect the PubSubClient to a public, high-availability MQTT Broker (e.g., HiveMQ, Broker.sh).",
      "Build a JSON telemetry string containing keys: level, temp, hum, odor, and status.",
      "Publish the compiled string to the targeted topic stream: 'smartbin/node1/telemetry'."
    ],
    output: "Broker receives lightweight JSON packets showing level measurements, confirming connectivity.",
    mistakes: [
      "Creating extremely heavy payloads that exceed default package constraints.",
      "Using blocking delay cycles which disconnects the client ping routine from the MQTT server."
    ]
  },
  {
    phaseNum: 8,
    title: "Data Logging & CSV Storage",
    objective: "Implement historical logs tracking long-term fill records.",
    tasks: [
      "Direct the MQTT receiver script (Python client) to grab MQTT feeds.",
      "Format dates and establish a local log system.",
      "Continuously append received packets to a local file: 'bin_telemetry_history.csv'."
    ],
    output: "A well-structured comma-separated values file continuously aggregates columns of telemetry values on disk.",
    mistakes: [
      "Failing to handle files safely, wiping out existing historical logs on script restarts.",
      "Logging telemetry at too fast intervals (e.g. milliseconds), flooding storage with identical inputs."
    ]
  },
  {
    phaseNum: 9,
    title: "Visualization & Cloud Layout",
    objective: "Establish modern analytics to view metrics on dashboard screens.",
    tasks: [
      "Configure ThingSpeak channels or Node-RED UI packages.",
      "Establish dials, charts, maps, and status notifications.",
      "Ensure gauges and trends reflect active level fluctuations as garbage grows."
    ],
    output: "A modern visual command console with active fill widgets and alerts accessible from standard browsers.",
    mistakes: [
      "Failing to configure update limits on public dashboards, causing public rate blocks.",
      "Hard-to-read font scaling that renders poorly on responsive screens."
    ]
  },
  {
    phaseNum: 10,
    title: "GitHub Portfolio Delivery",
    objective: "Build a highly professional repository presentation for recruiting and grading.",
    tasks: [
      "Assemble code files cleanly inside separate modular directories.",
      "Draft a professional README highlighting objective, wiring schema, tech stacks, and results.",
      "Upload clean schematic files, screenshots, and logs to demonstrate execution."
    ],
    output: "A highly pristine GitHub repository link that demonstrates complete hardware and simulation execution.",
    mistakes: [
      "Uploading configuration keys and SSID secrets directly inside source scripts.",
      "Pushing massive unnecessary files (like build directories or compiled binaries)."
    ]
  }
];

export const CIRCUIT_WIRING_STEPS = [
  {
    step: 1,
    component: "HC-SR04 Ultrasonic Sensor",
    connections: [
      { pinPin: "VCC", espPin: "5V (Vin Pin)", wireColor: "🔴 Red", desc: "Sourcing 5V power supply to trigger acoustic waves" },
      { pinPin: "TRIG", espPin: "GPIO 5", wireColor: "🟡 Yellow", desc: "Receives high trigger signals from the ESP32 microcontroller" },
      { pinPin: "ECHO", espPin: "GPIO 18", wireColor: "🟢 Green", desc: "Sends high flight-time to ESP32. Must route through a voltage divider" },
      { pinPin: "GND", espPin: "GND", wireColor: "⚫ Black", desc: "Common ground reference across components" }
    ],
    safeAlert: "⚠️ The ESP32 pins are NOT 5V tolerant! Build a voltage divider: Connect ECHO to a 1kΩ resistor, which routes to GPIO 18. Then, connect GPIO 18 to GND through a 2kΩ resistor to safely scale down the 5V signal."
  },
  {
    step: 2,
    component: "DHT11 Temp & Humidity Sensor",
    connections: [
      { pinPin: "VCC", espPin: "3.3V Pin", wireColor: "🔴 Red", desc: "Provides stable low power reference" },
      { pinPin: "DATA", espPin: "GPIO 4", wireColor: "🔵 Blue", desc: "Outputs temperature and humidity indices as digital pulse trains. Use a 4.7kΩ pull-up resistor." },
      { pinPin: "GND", espPin: "GND", wireColor: "⚫ Black", desc: "Common ground connection" }
    ],
    safeAlert: "⚠️ Ensure you power the DHT11 with 3.3V, not 5V, to keep digital signals at safe levels for the ESP32."
  },
  {
    step: 3,
    component: "Diagnostic Status LEDs",
    connections: [
      { pinPin: "RED Anode (+)", espPin: "GPIO 13 (via 220Ω resistor)", wireColor: "🔴 Red", desc: "Turns ON when active fill level exceeds 80%" },
      { pinPin: "GREEN Anode (+)", espPin: "GPIO 12 (via 220Ω resistor)", wireColor: "🟢 Green", desc: "Turns ON when active level is low (healthy capacity)" },
      { pinPin: "Cathodes (-)", espPin: "GND", wireColor: "⚫ Black", desc: "Returns both lighting elements directly to ground" }
    ],
    safeAlert: "⚠️ Never connect LEDs directly without a current-limiting resistor! Always use a 220Ω to 330Ω resistor to prevent burnouts."
  },
  {
    step: 4,
    component: "Active Board Buzzer",
    connections: [
      { pinPin: "Positive Pin (+)", espPin: "GPIO 15", wireColor: "🟠 Orange", desc: "Switches current high-state on and off to sound local beep alerts" },
      { pinPin: "Negative Pin (-)", espPin: "GND", wireColor: "⚫ Black", desc: "Directly completes return route to common negative line" }
    ],
    safeAlert: "⚠️ Use a low-voltage active buzzer. If your buzzer draws more than 15mA, use a standard 2N2222 NPN transistor as a switch to prevent overloading the ESP32 pin."
  }
];

export const FIRMWARE_CODE_ESP32 = `/**
 * @file SmartBin_ESP32_MQTT.ino
 * @brief Smart Waste Bin Level Monitoring with ESP32 & HC-SR04 over MQTT
 * @details Measures fill percentage, temp/humidity, and organic decomposition odor values.
 *          Publishes JSON payload to broker and alerts municipal staff.
 * @course IoT Systems Course Project
 * @license Apache-2.0
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h> // Ensure "ArduinoJson" (v6/v7) is installed in Library Manager
#include "DHT.h"

// ===== PHYSICAL CALIBRATION CONFIGURATIONS =====
#define BIN_HEIGHT_CM      30.0   // Total physical height of your bin in cm
#define LEVEL_ALERT_LIMIT  80.0   // Trigger municipal pickup alerts at 80% full

// ===== PIN DEFINITIONS =====
#define TRIG_PIN           5      // HC-SR04 Trig Pin
#define ECHO_PIN           18     // HC-SR04 Echo Pin
#define DHT_PIN            4      // DHT11 Data Pin
#define DHT_TYPE           DHT11  // Sensor type (DHT11 or DHT22)
#define BUZZER_PIN         15     // Pin trigger for Active 5V Buzzer
#define RED_LED_PIN        13     // Alert Status indicator Red LED
#define GREEN_LED_PIN      12     // Healthy Status indicator Green LED
#define ODOR_ANALOG_PIN    34     // MQ-135 Gas Sensor Analog connection (ADC1)

// ===== NETWORK CONFIGURATIONS =====
const char* WIFI_SSID     = "Your_WiFi_Name";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
const char* MQTT_BROKER   = "broker.hivemq.com";
const int   MQTT_PORT     = 1883;
const char* PUBLISH_TOPIC = "smartcities/waste/bin001/telemetry";
const char* ALERT_TOPIC   = "smartcities/waste/bin001/alerts";
const char* CLIENT_ID     = "ESP32_SmartBin_Node001";

// ===== INSTANTIATION =====
WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(DHT_PIN, DHT_TYPE);

// ===== CORE INITIALIZATION =====
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\\n--- [STARTING SMART WASTE BIN SYSTEMS] ---");

  // Configure Pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(ODOR_ANALOG_PIN, INPUT);

  // Initial diagnostics - beep buzzer & flash LEDs
  digitalWrite(GREEN_LED_PIN, HIGH);
  digitalWrite(RED_LED_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  delay(200);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);

  // Initialize Sensors
  dht.begin();
  Serial.println("[INFO] DHT11 Temp/Humidity initialized.");

  // Connect to Local Wi-Fi Network
  connectWiFi();

  // Setup MQTT server configuration
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

// ===== WIFI CONNECTIVITY PROCESS =====
void connectWiFi() {
  Serial.print("[WIFI] Connecting to network: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    // Flash Green LED during connection attempts
    digitalWrite(GREEN_LED_PIN, !digitalRead(GREEN_LED_PIN));
    retryCount++;
    
    if(retryCount > 40) { // Limit retry to prevent permanent physical lockup
      Serial.println("\\n[WIFI ERROR] Timed out. Operating in offline/local failsafe mode.");
      digitalWrite(GREEN_LED_PIN, LOW);
      return;
    }
  }
  
  digitalWrite(GREEN_LED_PIN, HIGH); // Steady healthy indicator on connection
  Serial.println("\\n[WIFI] Connected successfully!");
  Serial.print("[WIFI] Local IP Address Assigned: ");
  Serial.println(WiFi.localIP());
}

// ===== MQTT CLIENT RECONECTION RECOVERY =====
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Attempting connection to Broker: ");
    Serial.println(MQTT_BROKER);
    
    // Attempt connections using Last Will And Testament for offline monitoring
    if (mqttClient.connect(CLIENT_ID, ALERT_TOPIC, 1, true, "{\\"status\\":\\"Lost Connection\\"}")) {
      Serial.println("[MQTT] Connection established with Broker!");
      // Send a welcome payload indicating system boot
      mqttClient.publish(ALERT_TOPIC, "{\\"status\\":\\"Active Online\\"}", true);
    } else {
      Serial.print("[MQTT ERROR] Failed, state RC = ");
      Serial.print(mqttClient.state());
      Serial.println(". Retrying in 5 seconds...");
      
      // Flash Red LED on failure
      digitalWrite(RED_LED_PIN, HIGH);
      delay(5000);
      digitalWrite(RED_LED_PIN, LOW);
    }
  }
}

// ===== MEASURE SENSOR DISTANCES WITH HC-SR04 =====
float getDistanceCM() {
  // Clear the trigger pin
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // Send trigger pulse
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read duration of Echo
  long travelTimeUs = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout limit
  
  if (travelTimeUs == 0) {
    // Return mock boundary default if sensor doesn't respond or echo path is blocked
    return BIN_HEIGHT_CM;
  }
  
  // Calculate distance in Cm (Speed of sound is 340m/s or 0.034 cm/us)
  float distanceCalculated = (travelTimeUs * 0.034) / 2.0;
  return distanceCalculated;
}

// ===== SYSTEM RUNTIME CYCLE =====
void loop() {
  // Ensure we keep Wi-Fi and MQTT connected if network is configured
  if (WiFi.status() == WL_CONNECTED) {
    if (!mqttClient.connected()) {
      reconnectMQTT();
    }
    mqttClient.loop();
  }

  // 1. Gather Sensor Telemetries
  float distanceCm = getDistanceCM();
  
  // Map distance to relative percentage
  float rawFillPercent = (1.0 - (distanceCm / BIN_HEIGHT_CM)) * 100.0;
  float finalFillPercent = constrain(rawFillPercent, 0.0, 100.0);
  
  // Gather climate indices
  float celTemp = dht.readTemperature();
  float humPct = dht.readHumidity();
  
  // Check sensor health fallbacks
  if (isnan(celTemp)) celTemp = 24.5;
  if (isnan(humPct))  humPct = 60.0;
  
  // Gather MQ-135 Gas Odor levels
  int rawGasAnalog = analogRead(ODOR_ANALOG_PIN);
  float voltageGas = (rawGasAnalog / 4095.0) * 3.3;
  float gasPpm = (voltageGas * 100.0) + 150.0; // Scaled simulation math for school calibration

  // 2. Alert Logic & Local Signaling Outputs
  String binStatus = "Empty";
  if (finalFillPercent >= LEVEL_ALERT_LIMIT) {
    binStatus = "Critical Full";
    
    // Aggressive local beep & full solid LED signal
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, LOW);
    
    // Fast pulsing buzzer alarm
    for (int i = 0; i < 3; i++) {
       digitalWrite(BUZZER_PIN, HIGH);
       delay(80);
       digitalWrite(BUZZER_PIN, LOW);
       delay(80);
    }
  } else if (finalFillPercent >= 50.0) {
    binStatus = "Half-Full";
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, HIGH); // Both on creates visual amber signals
    digitalWrite(BUZZER_PIN, LOW);
  } else {
    binStatus = "Healthy Space";
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, HIGH); // Steady green operations
    digitalWrite(BUZZER_PIN, LOW);
  }

  // 3. Print Logs to Serial Console for USB debugging
  Serial.println("\\n--- [TELEMETRY SENSOR LOGS] ---");
  Serial.print("🔹 Measured Distance:    "); Serial.print(distanceCm);     Serial.println(" cm");
  Serial.print("🗑️ Calibrated Fill level: ");  Serial.print(finalFillPercent); Serial.println(" %");
  Serial.print("🌡️ Chamber Temperature: "); Serial.print(celTemp);          Serial.println(" °C");
  Serial.print("💧 Atmosphere Humidity: "); Serial.print(humPct);           Serial.println(" %");
  Serial.print("☣️ Decomposition Gas:    "); Serial.print(gasPpm);           Serial.println(" PPM");
  Serial.print("📌 Bin Categorization:  "); Serial.println(binStatus);

  // 4. Publish packet structure over MQTT
  if (WiFi.status() == WL_CONNECTED && mqttClient.connected()) {
    // Build JSON buffer
    StaticJsonDocument<256> jsonDoc;
    jsonDoc["bin_id"] = "BIN001";
    jsonDoc["distance_cm"] = distanceCm;
    jsonDoc["fill_pct"] = finalFillPercent;
    jsonDoc["temp_c"] = celTemp;
    jsonDoc["humidity_pct"] = humPct;
    jsonDoc["odor_ppm"] = gasPpm;
    jsonDoc["status"] = binStatus;
    jsonDoc["uptime_s"] = millis() / 1000;

    char msgBuffer[256];
    serializeJson(jsonDoc, msgBuffer);
    
    // Publish main update stream
    if (mqttClient.publish(PUBLISH_TOPIC, msgBuffer)) {
      Serial.println("[MQTT SUCCESS] Published telemetry safely.");
    } else {
      Serial.println("[MQTT ERROR] Telemetry delivery aborted.");
    }

    // Trigger explicit priority alerts if overflowing
    if (finalFillPercent >= LEVEL_ALERT_LIMIT) {
      StaticJsonDocument<128> alertDoc;
      alertDoc["bin_id"] = "BIN001";
      alertDoc["alert"] = "Critical Overflow Risk";
      alertDoc["fill_rate_pct"] = finalFillPercent;
      alertDoc["msg"] = "⚠️ Trash has reached threshold limit. Dispatch logistics team immediately!";
      
      char alertBuffer[128];
      serializeJson(alertDoc, alertBuffer);
      mqttClient.publish(ALERT_TOPIC, alertBuffer, true);
    }
  } else {
    Serial.println("[INFO] Network unavailable. Visualizing locally via LEDs.");
  }

  // Wake loop interval every 5 seconds (Calibrated for development testing.
  // In fields deep-sleeping routines should replace this loop.)
  delay(5000);
}`;

export const VIRTUAL_SIMULATOR_PYTHON_CODE = `"""
Smart-Waste-Management-Bin-Level-Detection-System
--------------------------------------------------
Python IoT Virtual Bin Telemetry Simulator & CSV Logger
File: main.py

This script emulates multiple physical smart containers, performing standard
ultrasonic math calculations, analyzing ambient decays (with temp, hum, gases),
outputting reports, updating local CSV logs, and serving as a backup server.
Ideal for course submission and portfolio showcase when hardware is absent.
"""

import os
import csv
import time
import json
import random
from datetime import datetime

# Configurations
LOG_FILE_PATH = "data/bin_telemetry_history.csv"
SIMULATION_INTERVAL = 4.0  # seconds

# Simulated Bin Models
smart_bins = [
    {
        "id": "BIN-ADMIN-01",
        "name": "Admin Building Trash Bin",
        "location": "Academic block, Entrance Main Ground",
        "depth_cm": 40.0,
        "current_waste_cm": 6.0, # distance from bottom (waste height)
        "hourly_accum_rate": 2.4, # cm per hour
        "temp_base": 22.0,
        "gas_base": 180.0
    },
    {
        "id": "BIN-FOOD-02",
        "name": "Cafeteria Organic Wet Waste Bin",
        "location": "Food Court block Area (Wet Waste Enclosure)",
        "depth_cm": 30.0,
        "current_waste_cm": 15.0,
        "hourly_accum_rate": 5.1, # high rate of wet waste
        "temp_base": 28.5, # decay heat
        "gas_base": 420.0  # highly odorous decay
    },
    {
        "id": "BIN-CAMPUS-03",
        "name": "Main Campus Plaza Public Bin",
        "location": "Central Green Lawn Pathway",
        "depth_cm": 35.0,
        "current_waste_cm": 2.0,
        "hourly_accum_rate": 1.2,
        "temp_base": 20.0,
        "gas_base": 120.0
    }
]

def initialize_database():
    """Builds CSV database headers if file is initially absent."""
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(LOG_FILE_PATH):
        with open(LOG_FILE_PATH, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow([
                "Timestamp", "Bin ID", "Bin Name", "Measured Distance (cm)",
                "Fill Percentage (%)", "Temperature (°C)", "Humidity (%)",
                "Organic Gases (PPM)", "Active Status", "Alert Flag"
            ])
        print(f"[DATABASE] Configured clean historical storage: {LOG_FILE_PATH}")

def calculate_sensor_telemetry(bin_item):
    """
    Simulates real physical sensor acquisition routines.
    HC-SR04 measures distance from top, so:
    Distance = total_depth - waste_height
    """
    total_depth = bin_item["depth_cm"]
    waste_height = bin_item["current_waste_cm"]
    
    # Calculate ultrasonic echo distance (the empty space above waste)
    distance_cm = max(2.0, total_depth - waste_height)
    # Add minimal wave bounce jitter noise (representing dust/obstructions)
    wave_noise = random.uniform(-0.15, 0.15)
    distance_cm = round(distance_cm + wave_noise, 2)
    
    # Map back to calibrated percentages
    fill_pct = ((total_depth - distance_cm) / total_depth) * 100.0
    fill_pct = round(max(0.0, min(100.0, fill_pct)), 1)
    
    # Simulate DHT11 temperature + decay heat (bacterial activity grows temp)
    decay_modifier = (fill_pct / 100.0) * 6.5
    room_variance = random.uniform(-0.5, 0.5)
    temperature = round(bin_item["temp_base"] + decay_modifier + room_variance, 1)
    
    # Simulate humidity
    humidity = round(55.0 + (fill_pct * 0.35) + random.uniform(-2.0, 2.0), 1)
    humidity = min(100.0, humidity)
    
    # Simulate MQ-135 Gas telemetry (accumulates methane when full)
    decay_gases = (fill_pct / 100.0) ** 2 * 350.0
    gas_ppm = round(bin_item["gas_base"] + decay_gases + random.uniform(-5.0, 5.0), 0)
    
    # Status levels map
    status = "Empty"
    alert = False
    if fill_pct >= 80.0:
        status = "CRITICAL FULL"
        alert = True
    elif fill_pct >= 50.0:
        status = "HALF-FULL"
    else:
        status = "HEALTHY SPACE"
        
    return {
        "bin_id": bin_item["id"],
        "bin_name": bin_item["name"],
        "distance_cm": distance_cm,
        "fill_pct": fill_pct,
        "temp": temperature,
        "humidity": humidity,
        "gas_ppm": gas_ppm,
        "status": status,
        "alert": alert
    }

def log_telemetry_to_csv(data):
    """Appends live telemetries into localized files."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    alert_status = "⚠️ RED ALERT" if data["alert"] else "✅ HEALTHY"
    
    with open(LOG_FILE_PATH, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([
            timestamp, data["bin_id"], data["bin_name"], data["distance_cm"],
            data["fill_pct"], data["temp"], data["humidity"],
            data["gas_ppm"], data["status"], alert_status
        ])

def execute_simulation_loop():
    """Continuous runtime loop pushing increments to simulate reality."""
    initialize_database()
    print("\\n=======================================================")
    print("🚀 IoT Smart Waste Bin Telemetry Simulator Core Active")
    print(f"Press CTRL+C to abort. Data logs: {LOG_FILE_PATH}")
    print("=======================================================")
    
    try:
        cycle_num = 1
        while True:
            print(f"\\n--- [SIMULATOR CYCLE ANALYSIS #{cycle_num}] ---")
            
            for bin_model in smart_bins:
                # 1. Accumulate new waste progressively
                fill_delta = (bin_model["hourly_accum_rate"] / 3600.0) * SIMULATION_INTERVAL * 250.0 # Speeded up for classroom demonstration
                bin_model["current_waste_cm"] = min(bin_model["depth_cm"] - 1.0, bin_model["current_waste_cm"] + fill_delta)
                
                # 2. Extract calculations
                metrics = calculate_sensor_telemetry(bin_model)
                
                # 3. Save logs
                log_telemetry_to_csv(metrics)
                
                # 4. Print results
                alert_badge = "[🚨 OVERFLOW ALERT]" if metrics["alert"] else "[OK]"
                print(f"🏢 Node: {metrics['bin_id']} | {metrics['bin_name']}")
                print(f"   📏 Dist: {metrics['distance_cm']} cm | 🗑️ Fill: {metrics['fill_pct']}% | {alert_badge}")
                print(f"   🌡️ Temp: {metrics['temp']}°C | 💨 VOC Gas: {metrics['gas_ppm']} PPM | State: {metrics['status']}")
                
                # Emulate municipal clearing immediately if full for virtual demonstration
                if metrics["alert"]:
                    print(f"   🚛 [DISPATCH LOGISTICS] Cleared {metrics['bin_id']}! Resetting waste state.")
                    bin_model["current_waste_cm"] = random.uniform(0.5, 3.0) # Reset to nearly empty
                    
            sys_time = datetime.now().strftime("%H:%M:%S")
            print(f"🕒 Cycle finished safely at {sys_time}. Waiting {SIMULATION_INTERVAL}s...")
            time.sleep(SIMULATION_INTERVAL)
            cycle_num += 1
            
    except KeyboardInterrupt:
        print("\\n[ABORTED] Simulation discontinued safely by user.")

if __name__ == "__main__":
    execute_simulation_loop()
`;

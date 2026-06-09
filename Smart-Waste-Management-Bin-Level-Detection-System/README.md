# Smart Waste Management & Bin Level Detection System
> **An IoT-Enabled Real-Time Garbage Overflow Protection & Logistics Routing System**

[![GitHub Core Build](https://img.shields.io/badge/IoT-Sensor--Integration-blueviolet?style=for-the-badge&logo=espressif)](https://github.com/) 
[![Arduino Version](https://img.shields.io/badge/Arduino-C%2B%2B-00979D?style=for-the-badge&logo=arduino)](https://github.com/)
[![Python Telemetry Core](https://img.shields.io/badge/Python-Simulation-3776AB?style=for-the-badge&logo=python)](https://github.com/)
[![React Dashboard](https://img.shields.io/badge/Web--Dashboard-React--18-61DAFB?style=for-the-badge&logo=react)](https://github.com/)
[![Firebase Storage](https://img.shields.io/badge/Database-Firestore--Cloud-FFCA28?style=for-the-badge&logo=firebase)](https://github.com/)

An advanced end-to-end Internet of Things (IoT) solution designed to revolutionize solid urban and commercial waste cycles. By embedding smart microcontrollers on public trash containers, the system continuously analyzes garbage level intervals, odors, and fire risk variables, predicting dispatch priorities for municipal vehicles. This minimizes manual container check routines, cuts fuel costs by up to 40%, and mitigates local environmental odors and infectious disease vectors.

---

## 🗺️ System Architecture & Node Schema

```
              ┌──────────────────────────────────────────────┐
              │          PHYSICAL SMART BIN MODULE           │
              │   (ESP32 + Hardwired Multi-Sensor Node)      │
              └──────────────────────┬───────────────────────┘
                                     │
           [1. Ultrasonic Wave Refl] │ [2. Air Decay & Gases]
                 HC-SR04             │       MQ-135 / DHT11
                                     ▼
              ┌──────────────────────────────────────────────┐
              │           ESP32 MCU / WI-FI ENGINE           │
              │  (Arduino-calibrated conversion algorithms)  │
              └──────────────────────┬───────────────────────┘
                                     │
                             [TLS Secure WiFi]
                             [MQTT / HTTPS]
                                     ▼
              ┌──────────────────────────────────────────────┐
              │             CENTRAL CLOUD GATEWAY            │
              │  (Broker / Firebase Cloud Infrastructure)    │
              └──────────────────────┬───────────────────────┘
                                     │
                             [Real-time Stream]
                                     ▼
              ┌──────────────────────────────────────────────┐
              │             MUNICIPAL WEB CONSOLE            │
              │ (React Frontend Analytics + Dispatch Logic)  │
              └──────────────────────────────────────────────┘
```

---

## 📁 Repository Directory Structure

```
Smart-Waste-Management-Bin-Level-Detection-System/
├── arduino_code/            # Multi-Sensor Driver Sketches (C++ (.ino)) for physical ESP32
├── python_simulation/       # Offline regression curves and math modeling of trash decay rates
├── dashboard/               # Local configurations, MQTT hooks, or Node-RED canvas flows
├── data/                    # Cleaned historical telemetry benchmarks (CSV structures)
├── outputs/                 # Exported charts, dispatch schedules, and analytical logs
├── images/                  # Custom generated app blueprints, banners, and schematics
├── circuit_diagram/         # Handdrawn CAD schematics showing ESP32, MQ135, and HC-SR04 pinout matches
├── reports/                 # Academic submissions, slides, and project documentation templates
├── docs/                    # Installation instructions, hardware checklists, calibration indexes
├── README.md                # General portfolio repository landing page (This File)
├── requirements.txt         # Dependent Python modular packages specification
└── main.py                  # Entrypoint for standalone simulation & dataset pipeline generator
```

---

## 📖 Deep-Dive Portfolio Folder Breakdown

### 1. 🔌 `arduino_code/`
Contains the production-ready C++ firmware compilation developed for microcontrollers (ESP32/ESP8266 or Arduino ATmega).
- **Embedded Libraries Used**: `WiFi.h`, `PubSubClient.h` (MQTT protocol), `DHT.h` (DHT11/DHT22 sensors).
- **Core Algorithms**: Translates echo duration (time-of-flight) back to spatial depth while accounting for acoustic wave velocity temperature corrections. Handles local threshold alerts via high-pitch buzzer triggers if levels hit >85% capacity.

### 2. 🧪 `python_simulation/`
For developers running tests without direct access to microcontrollers or physical breadboards.
- **Mathematical Calibrations**: Evaluates stochastic waste accumulation, random heavy-load throw-ins, and gas dispersion decay coefficients.
- **Modeling**: Provides a clean regression dataset representing normal daytime trash deposit patterns to design predictive full-by-noon schedules.

### 3. 🌐 `dashboard/`
Holds static Node-RED json canvases or microservice dashboard references. Integrates central MQTT topics to parse raw telemetry arrays into browser gauges dynamically.

### 4. 📊 `data/`
Raw database directories. Standardizes logging outputs into a clean `.csv` format recording timestamps, measured level, MQ-135 voltage, air temperature, relative humidity, and active status alarms. Enables historical analysis by data scientists.

### 5. 📈 `outputs/`
Where simulated analytical exports, PDF report cards, and logistics driving routes are compiled. Keeps historical trends clean and separated from codebase assets.

### 6. 🖼️ `images/`
Visual mockups showing dashboards, sensor test rigs, and hardware enclosures. Helps technical reviewers evaluate physical implementations at a glance.

### 7. 🔌 `circuit_diagram/`
Detailed engineering schematics showing exact physical pin mappings:
- **HC-SR04 (Ultrasonic)** -> VCC (5V), GND, Trig (ESP Pin 12), Echo (ESP Pin 13).
- **MQ-135 (Gas)** -> VCC (5V), GND, Analog Out (ESP ADC Pin 34).
- **DHT11 (Temp/Hum)** -> VCC (3.3V), GND, Signal (ESP Pin 14).
- **Buzzer** -> Pin 23 with resistor limit protection.

### 8. 📄 `reports/`
Template slide decks and formal project proposal briefs. Ideal for university submissions, high-visibility hackathon showcases, and research grant proposals.

### 9. 📚 `docs/`
Step-by-step assembly instructions, terminal configuration commands, calibration guides, and parts catalogs highlighting approximate budgeting requirements.

---

## 📉 Dynamic Telemetry Visualization Examples

### Garbage Accumulation Waves (24-Hour Cycle)
The following character chart illustrates typical bin filling trends. Notice the sudden steps indicating heavy midday throw-ins, followed by rapid resets when logistics trucks clear the waste:

```
Level (%) 
  100 |                                                 🚛 [CLEARED]
   80 |                                     ┌─────────┐
   60 |                         ┌───────────┘         │  
   40 |             ┌───────────┘                     │  
   20 |  ┌──────────┘                                 └───────────
    0 |──┴──────────────────────────────────────────────────────────► Time
        08:00 AM     12:00 PM     03:00 PM    06:00 PM    09:00 PM
```

### Sensor Linear Regression (Voltage curve vs. Odorous Decay)
Shows methane and organic decay gases (MQ-135 Output in Analog Reading) increasing exponentially as liquid waste decomposes inside saturated bins:

```
Gas (PPM)
  1000 |                                            * * * (Over-mature decay)
   800 |                                        * *
   600 |                                    * *
   400 |                           * * * * 
   200 |  * * * * * * * * * * * *  (Fresh Waste Baseline)
     0 |──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴───►
         10  20  30  40  50  60  70  80  90  100  Filter Fill Percentage (%)
```

---

## 🚀 Setting Up the Project

### Hardware Prerequisites
1. **Microcontroller**: ESP32 development board (e.g., DEVKIT V1).
2. **Sensors**:
   - HC-SR04 Ultrasonic Sensor (Measuring empty volume).
   - MQ-135 Air Quality Sensor (Extracting organic methane/odor details).
   - DHT11 Temperature & Humidity Sensor (Tracking bacterial heat build-up).
3. **Indicators**: Active buzzer + 1x High-brightness LED.

### Physical Wiring Pinout

```
+----------------+                +-------------+
|     ESP32      |                |   HC-SR04   |
|     3.3V       | -------------> |     VCC     |
|     GND        | -------------> |     GND     |
|     Pin 12     | -------------> |     Trig    |
|     Pin 13     | <------------- |     Echo    |
|                |                +-------------+
|     Pin 34     | <------------- Analog [MQ-135]
|     Pin 14     | <------------- Data [DHT11/22]
|     Pin 23     | -------------> Passive Buzzer(+)
|     Pin 2      | -------------> Status LED(+)
+----------------+
```

### Running the Python Simulated Gateway
If hardware components are currently in transit, execute the Python telemetry simulator. This auto-generates simulated datasets to let you test dashboard integration immediately:

```bash
# 1. Clone repository
$ git clone https://github.com/your-username/Smart-Waste-Management-Bin-Level-Detection-System.git
$ cd Smart-Waste-Management-Bin-Level-Detection-System

# 2. Setup isolated environment and install requirements
$ python -m venv venv
$ source venv/bin/activate  # Or 'venv\Scripts\activate' on Windows
$ pip install -r requirements.txt

# 3. Spin up simulation logging engine
$ python main.py
```

*This will continuously generate and print mock sensor states to `data/bin_telemetry_history.csv`!*

---

## 💡 System Design Highlights
* **Adaptive Sampling Intervals**: To maximize battery and solar-cell lifespan, the ESP32 changes transmit sleep intervals from 15 minutes to 30 seconds as levels breach 75% capacity.
* **Methane Calibration**: Filters high VOC spikes during intense heatwaves to isolate true bacterial activity trends.
* **Least-Distance Routing**: Feeds active "Critical Alerts" to drivers using a nearest-first algorithm to avoid unnecessary backtracking.

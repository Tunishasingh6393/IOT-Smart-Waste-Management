# 🗑️ Smart Waste Management & Bin Level Detection System
> **An End-to-End Internet of Things (IoT) Solution for Real-Time Solid Waste Analytics, Spill Prevention, and Automated Pick-Up Dispatch Logistics**

---

## 📋 System Overview
The **Smart Waste Management & Bin Level Detection System** is an advanced, production-ready IoT product designed to modernize municipal, urban, and industrial waste collection networks. By employing ultrasonic sensors and air quality assessment nodes installed directly on local bins, the system monitors exact fill percentages, bacterial decay temperatures, relative humidity levels, and hazardous methane/volatile organic compound (VOC) emissions.

Using an **ESP32 Microcontroller** and local communication gateways, the system streams environmental telemetry directly to a centralized cloud broker. A modern **React-based Municipal Command Centeral** analyzes live node updates, models progressive fill trends, activates sirens, and alerts regional collection routes in real-time.

```
       [⚡ SENSOR ARRAY ON BIN]           [📟 LOCAL GATEWAY]            [☁️ CLOUD PLATFORM]           [💻 MUNICIPAL APP]
   ┌───────────────────────────────┐     ┌───────────────────┐     ┌────────────────────────┐     ┌──────────────────────┐
   │ • HC-SR04 Ultrasonic Sensor   │ ──> │   ESP32 Dev V1    │ ──> │ HiveMQ Cloud Broker    │ ──> │ React Web Console    │
   │ • MQ-135 Gas Sensors (VOCs)   │     │ (Embedded C++ /   │     │ (JSON streams over     │     │ (Real-time telemetry │
   │ • DHT11 Air Temp & Humidity   │     │ WIFI & MQTT)      │     │ MQTT Secure Interface) │     │ & dispatch planner)  │
   └───────────────────────────────┘     └───────────────────┘     └────────────────────────┘     └──────────────────────┘
                  │                                                                                          │
                  └────── [🚨 Alarm Level > 85%] ─── Local Audible Buzzer Trigger <──────────────────────────┴─ [🚛 Reset State]
```

---

## 📈 Visual Metrics & Predictive Analytics

The system features real-time visual analysis of solid waste behaviors. Below are dynamic models representing characteristic telemetry behaviors.

### 1. Diurnal Waste Accumulation Curve (24-Hour Period)
This visualization displays regular container filling trends. Interrupted steps represent peak midday public waste events, followed by a total level reset to `0%` when municipal cargo trucks clear the smart container:

```
Filled (%) 
  100 |                                                            🚛 [MUTED & CLEARED]
   90 |                                             🚨 [ALARM ACTIVE]
   80 |                                              ┌────────────┐
   70 |                                 ┌────────────┘            │
   60 |                    ┌────────────┘                         │
   50 |                    │                                      │
   40 |         ┌──────────┘                                      │
   20 |  ┌──────┘                                                 └─────────────
    0 |──┴──────────────────────────────────────────────────────────────────────► Time
        07:00 AM   10:00 AM     01:00 PM    04:00 PM     07:00 PM     10:00 PM
```

### 2. Saturated Organic Decay Graph (MQ-135 Odor Feedback)
Illustrates how natural decay and bio-decomposition build up toxic gas emissions (Methane, Carbon Monoxide, VOCs in PPM) exponentially as container space fills to capacity, indicating priority handling for wet food bins over dry recyclables:

```
Odor (Gas PPM)
  1200 |                                                 * * * [Critical Bacterial Output]
  1000 |                                            * * 
   800 |                                        * *
   600 |                                  * *
   400 |                         * * * * 
   200 |  * * * * * * * * * * * * ( baseline fresh paper waste )
     0 |──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──►
         10  20  30  40  50  60  70  80  90  100  Active Fill Percentage (%)
```

---

## 🔌 Circuit Pinout Connections (Hardwired Mapping)

To deploy the physical smart bin node, connect your sensors to the ESP32 development board according to this layout. The system relies on custom analog input offsets paired with physical noise filters:

```
               +-------------------------------------------------+
               |              ESP32 Dev Board V1                 |
               |                                                 |
               | [ 3.3V ] ────────────────── Pin VCC (DHT11)     |
               | [ VIN5 ] ────────────────── Pin VCC (HC-SR04)   |
               | [ GND  ] ─────────┬──────── Pin GND (All Nodes)  |
               |                   ├──────── Pin GND (Buzzer)    |
               |                   └──────── Pin GND (LED)       |
               |                                                 |
               | [ Pin 12 ] ───────────────> Trigger (HC-SR04)   |
               | [ Pin 13 ] <─────────────── Echo (HC-SR04)      |
               | [ Pin 14 ] <─────────────── Signal (DHT11 Data) |
               | [ Pin 34 ] <─────────────── Analog (MQ-135 Out) |
               | [ Pin 23 ] ───────────────> Red Active Buzzer   |
               | [ Pin 02 ] ───────────────> Onboard Status LED  |
               +-------------------------------------------------+
```

---

## 📁 Repository Directory Architecture

The repository is modularly organized to provide developers with embedded firmware sketches, offline analytical Python mathematics, system reports, and mock datasets out-of-the-box:

```
Smart-Waste-Management-Bin-Level-Detection-System/
│
├── arduino_code/
│   └── SmartBin_ESP32_MQTT.ino    # ESP32 Wi-Fi firmware with deep sleep routines and MQTT payload delivery
│
├── python_simulation/
│   └── sim_core.py                # Pure Python calculations (unltrasonic speed-of-sound calibration curves)
│
├── dashboard/                     # Web deployment templates, MQTT configuration files, and metrics adapters
│
├── data/
│   └── bin_telemetry_history.csv  # Time-indexed database recording local readings and alarm levels
│
├── outputs/                       # Rendered analytics plots, weekly log charts, and route maps
│
├── images/                        # High-resolution schematics, user interface screenshots, and diagrams
│
├── circuit_diagram/               # CAD-based routing files and schematic diagrams
│
├── reports/                       # Pitch decks, slides, and educational submission files
│
├── docs/                          # Calibration tables and physical installation checklists
│
├── README.md                      # Inner documentation landing page
├── requirements.txt               # Required Python modular dependencies list
└── main.py                        # Standard multi-node virtual telemetry emulator and CSV server
```

---

## ⚙️ Core Repository Directories Explained

### 1. `arduino_code/`
Contains C++ firmware designed for development microcontrollers like the ESP32. It imports `WiFi.h`, `PubSubClient.h` for network connections, and `DHT.h` for physical sensors. It processes acoustic travel time variables into clean spatial margins and handles physical alarm loops when thresholds are critical.

### 2. `python_simulation/`
For teams building without immediate access to electronic components. Contains physical math representations, environmental speed-of-sound models based on variable temperature, and regression curves.

### 3. `dashboard/`
Stores direct endpoints, static configuration maps, and interface metrics adapters to pipe MQTT payloads into localized graphs.

### 4. `data/`
Central directory for temporary log collection. The local engine automatically structures telemetry readouts into a clean, comma-separated table, noting levels, odor indexes, temperature, humidity, active warnings, and timestamps.

### 5. `outputs/`
A central directory configured to record exported graphs, weekly performance reviews, and optimized municipal dispatch orders.

### 6. `images/` & `circuit_diagram/`
Houses user manuals, graphical layouts, wiring schematics, and pinout diagrams. Essential for validation during hardware assembly.

### 7. `reports/` & `docs/`
Hosts reference documentation, operational checklists, university research slides, hardware budgets, and system calibration indexes.

---

## 🚀 Setting Up the Project

### Standalone Python Telemetry Simulator

If sensors are currently in transit, spin up our integrated simulation core to test dashboard workflows immediately on your local machine:

1. **Pre-requisites**: Ensure Python 3.8+ is installed.
2. **Isolate Environment**:
   ```bash
   # Clone the workspace
   $ cd Smart-Waste-Management-Bin-Level-Detection-System
   
   # Establish virtual environment
   $ python -m venv venv
   $ source venv/bin/activate  # Windows users: venv\Scripts\activate
   ```
3. **Install Requirements**:
   ```bash
   $ pip install -r requirements.txt
   ```
4. **Boot Telemetry Simulator**:
   ```bash
   $ python main.py
   ```
   *This starts the telemetry emulator, spinning reports directly to `data/bin_telemetry_history.csv`!*

### Arduino ESP32 Firmware Installation

1. Open the [Arduino IDE](https://www.arduino.cc/en/software).
2. Install standard board libraries: Go to `Tools` > `Board` > `Boards Manager...` and install the package **esp32** by Expressif Systems.
3. Install necessary sensor libraries via `Sketch` > `Include Library` > `Manage Libraries...`:
   - **PubSubClient** (by Nick O'Leary)
   - **DHT sensor library** (by Adafruit)
   - **Adafruit Unified Sensor**
4. Open `/arduino_code/SmartBin_ESP32_MQTT.ino` inside the IDE.
5. Search for `Your_WiFi_SSID` and `Your_WiFi_Password` in the file and replace them with your local connection credentials.
6. Connect your physical ESP32 to your PC using a micro-USB, select the appropriate port, and click **Upload**.

---

## 🔮 Key Industrial Design Features
* **Adaptive Eco-Sampling**: When waste levels are below 50%, the node switches to passive polling (once every 15 minutes) to conserve battery power. Once levels transcend 80%, sampling rates accelerate to 1 minute to prevent overflow.
* **Methane Calibration Curve**: The MQ-135 analog voltage filters environmental humidity variance to prevent heatwaves from miscalculating active biodegradation indices.
* **Lowest-Cost Route Dispatching**: Critical alarms trigger automated routing algorithms, prioritizing bins labeled `Emergency` or `High` fill rates.

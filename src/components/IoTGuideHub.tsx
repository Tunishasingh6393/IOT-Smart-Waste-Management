import React, { useState } from 'react';
import { 
  BookOpen, Code, Cpu, Award, Milestone, 
  HelpCircle, Copy, Check, Terminal, Info, 
  FolderGit2, ListTodo, Layers, Zap, InfoIcon 
} from 'lucide-react';
import { 
  INTERVIEW_QUESTIONS, 
  TECHNICAL_SPECS, 
  IMPLEMENTATION_PHASES, 
  CIRCUIT_WIRING_STEPS, 
  FIRMWARE_CODE_ESP32, 
  VIRTUAL_SIMULATOR_PYTHON_CODE 
} from '../data/educationalContent';

interface IoTGuideHubProps {
  customRepoName: string;
  setCustomRepoName: (name: string) => void;
  customUserName: string;
  setCustomUserName: (name: string) => void;
}

export default function IoTGuideHub({
  customRepoName,
  setCustomRepoName,
  customUserName,
  setCustomUserName
}: IoTGuideHubProps) {
  const [activeTab, setActiveTab] = useState<'explanation' | 'hardware' | 'code' | 'github' | 'interview'>('explanation');
  const [selectedPinComponent, setSelectedPinComponent] = useState<number>(0);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [academicProfile, setAcademicProfile] = useState<string>('IoT Course Student');

  const triggerCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const toggleAnswer = (id: number) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile dynamic README
  const getDynamicREADME = () => {
    return `# Smart Waste Management & Bin Level Detection System

An advanced IoT-driven urban infrastructure project designed to optimize solid waste logistics inside Smart Cities, University campuses, and commercial airports.

This repository represents my complete course project, mapping a full IoT pipeline from physical telemetry acquisition to cloud analytical dashboard visualizing historical logs.

## 📌 Features & Architectural Capabilities
- **Non-Contact Ultrasonic Level Sensing**: Calibrates garbage limits securely of bins up to 100cm deep using **HC-SR04** acoustic reflections.
- **Micro-Controller System (ESP32)**: WiFi-connected edge node tracking multi-factor telemetry.
- **Multi-Sensor Ecosystem**: 
  - **MQ-135 Gas Sensors**: Maps organic waste decomposition odor markers (Methane, Carbon Dioxide).
  - **DHT11 Sensors**: Measures internal container temperature spikes to discover bio-rot heat.
- **Dynamic Cloud Dashboards**: Push channels configured through **MQTT** protocols to feed ThingSpeak / Node-RED visual gauges.
- **Local Diagnostics**: On-board dual red/green LEDs and localized piezoelectric buzzers acting as real-time feedback loops.

---

## 📐 Circuit Schematic Wiring Chart
| Terminal Source (Sensor) | Target PIN (ESP32) | Recommended Wire Color | Safety Note / Pull-Up |
| :--- | :--- | :--- | :--- |
| **HC-SR04** VCC | 5V (Vin Pin) | 🔴 Red | High-strength acoustic power |
| **HC-SR04** TRIG | GPIO 5 | 🟡 Yellow | Trigger Pulse output |
| **HC-SR04** ECHO | GPIO 18 | 🟢 Green | **Requires 1kΩ / 2kΩ Voltage Divider** |
| **DHT11** VCC | 3.3V | 🔴 Red | High efficiency energy |
| **DHT11** DATA | GPIO 4 | 🔵 Blue | Connect standard 4.7kΩ pull-up |
| **MQ-135** Input | GPIO 34 (ADC1) | 🟣 Purple | Read raw voltage inputs |
| **Buzzer** Positive | GPIO 15 | 🟠 Orange | Piezoelectric drive |
| All Grounds | GND | ⚫ Black | Shared zero-volt reference |

*CRITICAL NOTICE*: The ESP32 is **NOT** 5V-tolerant on its GPIO pins. Ground-divide the feedback line on the Echo pin before returning to GPIO 18.

---

## 🛠️ Installation & Setup Workflow
1. **Prepare IDE Environment**:
   - Install the CP2102 USB driver on your host PC to interface with the ESP32 chip.
   - Install the **Arduino IDE** or VSCode + PlatformIO.
   - Install the following packages under Library Manager:
     - \`PubSubClient\` (by Nick O'Leary)
     - \`ArduinoJson\` (by Benoit Blanchon)
     - \`DHT sensor library\` (by Adafruit)

2. **Compile Firmware**:
   - Open \`arduino_code/SmartBin_ESP32_MQTT.ino\`.
   - Update your local Wi-Fi SSID, Password, and target MQTT Broker properties.
   - Hook up pins and verify using the serial monitor at \`115200\` baud rate.

3. **Deploy Python Virtual Simulator**:
   - If studying remotely or locking active physical hardware assets, boot up the local virtual engine:
   \`\`\`bash
   python main.py
   \`\`\`
   - Telemetries automatically update custom local files inside \`data/bin_telemetry_history.csv\`.

---

## 👥 Authorship & Grading Profile
- **Student Architect**: ${customUserName || 'Eminent IoT Graduate Scholar'}
- **Course Assignment Submission**: Smart Waste Systems IoT Portfolio Submission
- **Repository Context**: Fully audited industry-oriented blueprint.

---

## 🎓 License
This software and design system is open source and hosted under the Apache-2.0 License.
`;
  };

  return (
    <div id="iot-guide-hub" className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full">
      
      {/* Companion Header */}
      <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border-b border-indigo-950 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">IoT Academic System Guide</h2>
            <p className="text-xs text-indigo-200/60">Complete course workbook, circuits, schemas, and interview portfolio planner</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-medium tracking-wide bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded-md">
            ROLE: Embedded Dev Mentor
          </span>
        </div>
      </div>

      {/* Ribbon Navigation */}
      <div className="flex p-1.5 bg-slate-950 border-b border-slate-800 shrink-0 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('explanation')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'explanation' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. Project Core & Industry</span>
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'hardware' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>2. Circuits & Specs</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'code' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>3. Source Code Library</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'github' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>4. GitHub Pack & README</span>
        </button>

        <button
          onClick={() => setActiveTab('interview')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'interview' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>5. Portfolio & Careers</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 p-5 overflow-y-auto text-sm text-slate-300">
        
        {/* PANEL: EXPLANATION */}
        {activeTab === 'explanation' && (
          <div className="space-y-6">
            
            {/* Simple vs Technical Definition Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">For Laypeople & Non-techs</span>
                <h4 className="text-white font-bold text-sm mt-1 mb-2">💡 Quick Simple Explanation</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Think of our Smart Waste system as fitting rubbish bins with their own "digital tape measure". 
                  Instead of waste collectors driving around wasting fuel to empty bins that are mostly empty, 
                  sensors tell a central web portal exactly how full every bin is. It's like checking gas tanks remotely: 
                  trucks are dispatched ONLY to bins that actually require immediate service, preventing overflow and keeping public walkways clean.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">For Engineering Professors</span>
                <h4 className="text-white font-bold text-sm mt-1 mb-2">⚡ Pro Technical Explanation</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  An edge microcontroller (ESP32) triggers high-frequency ultrasound pulses from an HC-SR04 depth module. 
                  By timing echo pulse delays in air (attenuated at 0.034 cm/µs), the processor calculates spatial waste tolerances, 
                  applying constraints relative to calibrated container vectors. Aggregated metrics (including organic decay gases, 
                  temperatures, and humidity) compile into lightweight JSON formats transmitted as pub-sub frames over MQTT 
                  to support telemetry visualizations, threshold triggers, and asynchronous alerts.
                </p>
              </div>
            </div>

            {/* Workflow diagrams */}
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">📍 IoT Workflow Pipeline</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-around gap-2 text-center text-xs font-mono">
                  <div className="px-3 py-2 bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900 rounded border border-indigo-700/30 w-full sm:w-auto">
                    📡 Ultrasonic Probe<br/><span className="text-[10px] text-slate-400">Echo Waves</span>
                  </div>
                  <span className="text-slate-500">➔</span>
                  <div className="px-3 py-2 bg-purple-900/40 text-purple-300 hover:bg-purple-900 rounded border border-purple-700/30 w-full sm:w-auto">
                    🧠 ESP32 MCU<br/><span className="text-[10px] text-slate-400">Trigger/Timer</span>
                  </div>
                  <span className="text-slate-500">➔</span>
                  <div className="px-3 py-2 bg-pink-900/40 text-pink-300 hover:bg-pink-900 rounded border border-pink-700/30 w-full sm:w-auto">
                    🌐 MQTT / HiveMQ<br/><span className="text-[10px] text-slate-400">JSON Payload</span>
                  </div>
                  <span className="text-slate-500">➔</span>
                  <div className="px-3 py-2 bg-amber-900/40 text-amber-300 hover:bg-amber-900 rounded border border-amber-700/30 w-full sm:w-auto">
                    📊 Cloud Dash<br/><span className="text-[10px] text-slate-400">Staff Alert Link</span>
                  </div>
                  <span className="text-slate-500">➔</span>
                  <div className="px-3 py-2 bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900 rounded border border-emerald-700/30 w-full sm:w-auto">
                    🚛 Dispatch Crew<br/><span className="text-[10px] text-slate-400">Empty & Clean</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Industry Relevance Breakdown */}
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">🏢 Smart City & Facility Adaptability</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                  <h4 className="text-white font-bold text-sm mb-1.5 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    <span>Municipalities & Smart Cities</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    By monitoring thousands of street bins on central maps, smart cities eliminate wasted route hours, minimize 
                    greenhouse emissions, and eliminate overflowing urban garbage, maintaining spotless, hygienic spaces.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                  <h4 className="text-white font-bold text-sm mb-1.5 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    <span>Corporate & University Campuses</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Facilities departments target staff precisely to peak foot traffic areas (food blocks, entrance halls) 
                    instead of rotating on inefficient arbitrary periodic schedules, reducing labor expenditures.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                  <h4 className="text-white font-bold text-sm mb-1.5 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    <span>High-Density Terminals (Airports/Rail)</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Aviation hubs deploy smart bins to guarantee litter containment within active zones, avoiding delays 
                    and securing traveler safety footprints.
                  </p>
                </div>

              </div>
            </div>

            {/* Business Value Highlight */}
            <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/60 text-slate-300 flex items-start space-x-3">
              <span className="p-2 bg-indigo-900/40 text-indigo-400 rounded-lg mt-0.5">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-white font-bold text-sm">💰 Tangible Business Value</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real-world deployments (such as Bigbelly or Enevo) reduce waste management operational costs by <strong>25% to 40%</strong>. 
                  Minimizing unnecessary collection miles yields critical fuel budget returns, lowers vehicle exhaust, 
                  and prolongs trash compactor mechanism lifespans. This makes IoT waste architectures highly lucrative 
                  for municipal and commercial smart planning.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* PANEL: HARDWARE SPEC & CIRCUITS */}
        {activeTab === 'hardware' && (
          <div className="space-y-6">
            
            {/* Tech Stack Selection Option cards */}
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-2">📐 Educational Tech Stack Selection</h3>
              <p className="text-xs text-slate-500 mb-3">Choose the optimal framework for physical building vs online simulations:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold">OPTION A</span>
                  <h5 className="text-white font-bold text-xs mt-1.5">Arduino Uno + Serial Log</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Excellent for absolute electronic novices. Simple, but lacks natural Wi-Fi connection.</p>
                </div>
                <div className="bg-indigo-950/30 p-3.5 rounded-lg border border-indigo-500/30">
                  <span className="text-[9px] bg-indigo-550 text-indigo-200 px-2 py-0.5 rounded-full font-mono font-bold">OPTION B (REC)</span>
                  <h5 className="text-white font-bold text-xs mt-1.5">ESP32 + MQTT Broker</h5>
                  <p className="text-[11px] text-slate-300 mt-1">Ideal for industry portfolios. Low power, robust native Wi-Fi, lightweight payload support.</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold">OPTION C</span>
                  <h5 className="text-white font-bold text-xs mt-1.5">Multi-Bin Gateway</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Advanced scope detailing local routing logic, MQTT clusters, and custom AWS backends.</p>
                </div>
              </div>
            </div>

            {/* Interactive Wiring Blueprint Schematics */}
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">🔌 Interactive Pin Connection Guide</h3>
              <p className="text-xs text-slate-400 mb-4">
                Click over any sensor component row below to check its explicit digital/analog pin routing map and safety constraints to the ESP32:
              </p>
              
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="space-y-1.5 w-full lg:w-1/3">
                  {CIRCUIT_WIRING_STEPS.map((circ, idx) => (
                    <button
                      key={circ.step}
                      onClick={() => setSelectedPinComponent(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedPinComponent === idx 
                          ? 'bg-indigo-950 border-indigo-500 text-white' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{circ.component}</span>
                        <span className="text-[10px] font-mono text-slate-500">MAPPING</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex-1 bg-slate-950 p-5 rounded-xl border border-slate-800 relative">
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      {CIRCUIT_WIRING_STEPS[selectedPinComponent].component} Wiring Setup
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">Standard interface logic mapping the sensor to the microcontroller ports:</p>
                    
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase font-mono tracking-wider border-b border-slate-800">
                            <th className="p-2">Pin On Sensor</th>
                            <th className="p-2">Pin On ESP32</th>
                            <th className="p-2">Wire Color</th>
                            <th className="p-2">Logic Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {CIRCUIT_WIRING_STEPS[selectedPinComponent].connections.map((conn, cIdx) => (
                            <tr key={cIdx} className="hover:bg-slate-900/50">
                              <td className="p-2 font-mono font-bold text-indigo-400">{conn.pinPin}</td>
                              <td className="p-2 font-mono text-white text-xs">{conn.espPin}</td>
                              <td className="p-2 text-xs">{conn.wireColor}</td>
                              <td className="p-2 text-slate-400 leading-normal text-xs">{conn.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-indigo-500/20 text-xs text-yellow-400 mt-4 leading-relaxed font-mono">
                      {CIRCUIT_WIRING_STEPS[selectedPinComponent].safeAlert}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Specifications Matrix */}
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">🛠️ Hardware Specifications</h3>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                      <th className="p-3">Component Profile</th>
                      <th className="p-3">Technical Role</th>
                      <th className="p-3">Wiring Core Hookup</th>
                      <th className="p-3">Implementation Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {TECHNICAL_SPECS.map((spec, sIdx) => (
                      <tr key={sIdx} className="hover:bg-slate-900/20">
                        <td className="p-3 font-semibold text-white">{spec.name}</td>
                        <td className="p-3 text-slate-400">{spec.role}</td>
                        <td className="p-3 font-mono text-indigo-400">{spec.pinConnections}</td>
                        <td className="p-3 text-slate-400 text-xs leading-relaxed">{spec.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* PANEL: SOURCE CODE LIBRARY */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            
            {/* Embedded C++ ESP32 Sketch Component */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">⚡ Microcontroller C++ Code (ESP32)</h3>
                  <p className="text-xs text-slate-500">Firmware code utilizing ArduinoJson and WifiClient hooks</p>
                </div>
                <button
                  onClick={() => triggerCopy('esp32', FIRMWARE_CODE_ESP32)}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 text-white hover:bg-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                >
                  {copiedStates['esp32'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStates['esp32'] ? 'Copied code!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs max-h-[350px] overflow-y-auto text-slate-300">
                <pre>{FIRMWARE_CODE_ESP32}</pre>
              </div>
            </div>

            {/* Python Simulation Script component */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">🐍 Python Simulator & CSV Backup Engine</h3>
                  <p className="text-xs text-slate-500">Ideal when physical sensors are unavailable; aggregates telemetry to local disk CSV datasets</p>
                </div>
                <button
                  onClick={() => triggerCopy('python', VIRTUAL_SIMULATOR_PYTHON_CODE)}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 text-white hover:bg-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                >
                  {copiedStates['python'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStates['python'] ? 'Copied code!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs max-h-[300px] overflow-y-auto text-slate-300">
                <pre>{VIRTUAL_SIMULATOR_PYTHON_CODE}</pre>
              </div>
            </div>

          </div>
        )}

        {/* PANEL: GITHUB PACKAGING */}
        {activeTab === 'github' && (
          <div className="space-y-6">
            
            {/* Customiser fields */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">🔧 Customise GitHub Profile Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Your Full Name (For Author credit)</label>
                  <input
                    type="text"
                    value={customUserName}
                    onChange={(e) => setCustomUserName(e.target.value)}
                    placeholder="Eminent IoT Graduate Scholar"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub Repository Name</label>
                  <input
                    type="text"
                    value={customRepoName}
                    onChange={(e) => setCustomRepoName(e.target.value)}
                    placeholder="smart-waste-management-IoT"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Code upload tree map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                <h5 className="text-white font-bold text-xs mb-3 flex items-center space-x-1.5 uppercase font-sans">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  <span>Proposed Repository Layout</span>
                </h5>
                <div className="text-slate-400 text-xs space-y-1">
                  <p className="text-white">{customRepoName}/</p>
                  <p>├── <span className="text-indigo-300">arduino_code/</span> <span className="text-[10px] text-slate-500"># holds ESP32 C++ Sketch</span></p>
                  <p>├── <span className="text-indigo-300">python_simulation/</span> <span className="text-[10px] text-slate-500"># telemetry simulation loops</span></p>
                  <p>├── <span className="text-indigo-300">dashboard/</span> <span className="text-[10px] text-slate-500"># node-red layouts or UI configurations</span></p>
                  <p>├── <span className="text-indigo-300">data/</span> <span className="text-[10px] text-slate-500"># telemetry log backup CSV formats</span></p>
                  <p>├── <span className="text-indigo-300">circuit_diagram/</span> <span className="text-[10px] text-slate-500"># electronics schema templates</span></p>
                  <p>├── <span className="text-indigo-300">images/</span> <span className="text-[10px] text-slate-500"># photos proving simulation operations</span></p>
                  <p>├── <span className="text-indigo-300">docs/</span> <span className="text-[10px] text-slate-500"># academic lab write-ups & report plans</span></p>
                  <p>├── <span className="text-emerald-400 font-bold">README.md</span> <span className="text-[10px] text-slate-500"># project introduction manual</span></p>
                  <p>├── <span className="text-slate-400">requirements.txt</span> <span className="text-[10px] text-slate-500"># python dependencies list</span></p>
                  <p>└── <span className="text-slate-400">main.py</span> <span className="text-[10px] text-slate-500"># main execution framework entry</span></p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <h5 className="text-white font-bold text-xs uppercase tracking-wider">🌟 Portfolio Repository Boosters</h5>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Recruiters sift through hundreds of graduate repositories. Maximize discoverability with optimized tags and attributes:
                  </p>
                  
                  <div className="space-y-2 mt-3 text-xs">
                    <p><strong>Recommended Repo Name:</strong> <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400">smart-waste-management-iot-esp32</code></p>
                    <p className="text-slate-400"><strong>Optimised Meta:</strong> <code>"An automated smart city IoT system using ESP32, HC-SR04 ultrasonic sensors, and MQTT cloud analytics to optimize garbage route fleets."</code></p>
                    <p><strong>Suggested Tags:</strong> <span className="text-[10px] font-mono text-indigo-300">esp32, iot-device, smart-cities, waste-management, mqtt, arduino, telemetry</span></p>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded border border-dashed border-indigo-500/30 text-[11px] text-slate-400">
                  💡 <strong>Tip:</strong> Uploading short video captures of your physical or simulated operations in action inside the README turns a simple code dump into a credible, recruiter-magnet showcase.
                </div>
              </div>
            </div>

            {/* Markdown README generator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">📄 Custom Generated README.md</h4>
                </div>
                <button
                  onClick={() => triggerCopy('readme', getDynamicREADME())}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 text-white hover:bg-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                >
                  {copiedStates['readme'] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStates['readme'] ? 'Copied code!' : 'Copy README'}</span>
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs max-h-[300px] overflow-y-auto text-slate-400">
                <pre>{getDynamicREADME()}</pre>
              </div>
            </div>

            {/* Implementation Phases Guide */}
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">📍 Phase-by-Phase Academic Roadmap</h3>
              <div className="space-y-3">
                {IMPLEMENTATION_PHASES.map((ph) => (
                  <div key={ph.phaseNum} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 font-mono text-[10px] font-bold text-white rounded-full">
                        {ph.phaseNum}
                      </span>
                      <h4 className="text-white font-bold text-xs uppercase">{ph.title}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wide text-slate-400 block font-semibold mb-1">Objectives & Key Actions:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                          {ph.tasks.map((tsk, tIdx) => (
                            <li key={tIdx}>{tsk}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px]"><strong className="text-emerald-400">Expected Deliverable:</strong> {ph.output}</p>
                        <p className="text-[11px] text-red-400"><strong>🚨 Traps to Avoid:</strong> {ph.mistakes.join(' || ')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* PANEL: INTERVIEW PORTFOLIO PREP */}
        {activeTab === 'interview' && (
          <div className="space-y-6 font-sans">
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Academic & Placement Interview Board Preparation</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Professors, external examiners, or technical recruiters often probe deeply into design decisions, calculations, and failsafes. 
                Use these interactive flashcards to study industry-expert answers.
              </p>
            </div>

            <div className="space-y-3">
              {INTERVIEW_QUESTIONS.map((qa) => (
                <div key={qa.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  
                  {/* Question row */}
                  <div 
                    onClick={() => toggleAnswer(qa.id)}
                    className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3 pr-4">
                      <span className="px-2 py-0.5 bg-slate-800 text-indigo-300 font-mono text-[9px] font-bold rounded uppercase">
                        {qa.concept}
                      </span>
                      <h4 className="text-white font-semibold text-xs leading-normal">{qa.question}</h4>
                    </div>
                    <span className="text-xs font-mono font-semibold text-indigo-400 shrink-0 select-none">
                      {revealedAnswers[qa.id] ? 'HIDE ANSWER' : 'REVEAL ANSWER'}
                    </span>
                  </div>

                  {/* Answer Row */}
                  {revealedAnswers[qa.id] && (
                    <div className="px-5 pb-5 pt-3 bg-slate-900 text-xs text-slate-300 leading-relaxed border-t border-slate-800 flex items-start space-x-3 animate-fadeIn">
                      <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-md shrink-0 mt-0.5 font-mono font-bold text-[10px]">
                        A
                      </span>
                      <div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{qa.answer}</p>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

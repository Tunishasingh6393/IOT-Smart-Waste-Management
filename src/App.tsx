/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BinState, TelemetryLog } from './types';
import VirtualSimulator from './components/VirtualSimulator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import IoTGuideHub from './components/IoTGuideHub';
import OfficialReportModal from './components/OfficialReportModal';
import { 
  Trash2, Radio, BookOpen, Layers, 
  MapPin, HelpCircle, HardDrive, FileCheck2, 
  Sparkles, GraduationCap, Github 
} from 'lucide-react';

const INITIAL_BINS: BinState[] = [
  {
    id: 'bin-admin-01',
    name: 'Admin Complex Outer Bin',
    location: 'Main Academic Entrance Block',
    capacityLitres: 60,
    heightCm: 45,
    currentTrashDistanceCm: 32.5, // 27% full roughly
    temperature: 22.1,
    humidity: 52,
    gasPpm: 145,
    isOnline: true,
    fillRatePerMin: 0.12,
    lastClearedAt: '09:20 AM'
  },
  {
    id: 'bin-food-02',
    name: 'Cafeteria Organic Wet Food Bin',
    location: 'Food Court Enclosure (Wet Waste)',
    capacityLitres: 45,
    heightCm: 30,
    currentTrashDistanceCm: 11.5, // 61% full
    temperature: 28.4, // rotting heats up
    humidity: 78,      // composting moisture
    gasPpm: 460,       // heavy organic gas
    isOnline: true,
    fillRatePerMin: 0.28, // rapid fill
    lastClearedAt: '08:10 AM'
  },
  {
    id: 'bin-hostel-03',
    name: 'Girls Hostel Main Lobby Bin',
    location: 'Student Residential Block Entrance',
    capacityLitres: 50,
    heightCm: 40,
    currentTrashDistanceCm: 33.0, // 17% full
    temperature: 21.8,
    humidity: 48,
    gasPpm: 115,
    isOnline: true,
    fillRatePerMin: 0.18,
    lastClearedAt: 'Yesterday'
  },
  {
    id: 'bin-gate-04',
    name: 'Plaza Green Pathway Bin',
    location: 'Central Lawn Recreational Walkways',
    capacityLitres: 55,
    heightCm: 35,
    currentTrashDistanceCm: 31.0, // 11% full
    temperature: 19.5,
    humidity: 42,
    gasPpm: 92,
    isOnline: true,
    fillRatePerMin: 0.08,
    lastClearedAt: '11:45 AM'
  }
];

// Pre-seed some logs so charts have high-fidelity graphics right from start
const INITIAL_LOGS: TelemetryLog[] = [
  {
    id: 'log-1',
    timestamp: '13:05:10',
    binId: 'bin-admin-01',
    binName: 'Admin Complex Outer Bin',
    distanceCm: 35.5,
    fillPercent: 21,
    temperature: 21.5,
    humidity: 50,
    gasPpm: 130,
    status: 'Empty',
    alertSent: false
  },
  {
    id: 'log-2',
    timestamp: '13:10:15',
    binId: 'bin-food-02',
    binName: 'Cafeteria Organic Wet Food Bin',
    distanceCm: 18.2,
    fillPercent: 39,
    temperature: 24.2,
    humidity: 68,
    gasPpm: 280,
    status: 'Half-Full',
    alertSent: false
  },
  {
    id: 'log-3',
    timestamp: '13:15:20',
    binId: 'bin-hostel-03',
    binName: 'Girls Hostel Main Lobby Bin',
    distanceCm: 33.0,
    fillPercent: 17,
    temperature: 21.8,
    humidity: 48,
    gasPpm: 115,
    status: 'Empty',
    alertSent: false
  },
  {
    id: 'log-4',
    timestamp: '13:20:25',
    binId: 'bin-food-02',
    binName: 'Cafeteria Organic Wet Food Bin',
    distanceCm: 13.5,
    fillPercent: 55,
    temperature: 26.5,
    humidity: 74,
    gasPpm: 390,
    status: 'Half-Full',
    alertSent: false
  },
  {
    id: 'log-5',
    timestamp: '13:24:30',
    binId: 'bin-admin-01',
    binName: 'Admin Complex Outer Bin',
    distanceCm: 32.5,
    fillPercent: 27,
    temperature: 22.1,
    humidity: 52,
    gasPpm: 145,
    status: 'Empty',
    alertSent: false
  },
  {
    id: 'log-6',
    timestamp: '13:25:00',
    binId: 'bin-food-02',
    binName: 'Cafeteria Organic Wet Food Bin',
    distanceCm: 11.5,
    fillPercent: 61,
    temperature: 28.4,
    humidity: 78,
    gasPpm: 460,
    status: 'Half-Full',
    alertSent: false
  }
];

export default function App() {
  const [bins, setBins] = useState<BinState[]>(INITIAL_BINS);
  const [logs, setLogs] = useState<TelemetryLog[]>(INITIAL_LOGS);
  const [viewMode, setViewMode] = useState<'console' | 'workbook'>('console');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Dynamic portfolio customizations
  const [customRepoName, setCustomRepoName] = useState<string>('smart-waste-management-esp32');
  const [customUserName, setCustomUserName] = useState<string>('Eminent IoT Graduate Scholar');

  // Propagate simulator updates into telemetry cache
  const handleBulkUpdate = (updatedBins: BinState[]) => {
    setBins(updatedBins);

    // Filter which bins have substantial shifts to log
    // For visual beauty, let's create a logs trace periodically
    const randomlySelectedBin = updatedBins.filter(b => b.isOnline)[Math.floor(Math.random() * updatedBins.filter(b => b.isOnline).length)];
    if (randomlySelectedBin && Math.random() > 0.4) {
      const wasteHt = randomlySelectedBin.heightCm - randomlySelectedBin.currentTrashDistanceCm;
      const fillPct = Math.round(100 * (wasteHt / randomlySelectedBin.heightCm));
      
      let status: 'Empty' | 'Half-Full' | 'Alighting' | 'Critical Full' = 'Empty';
      if (fillPct >= 80) status = 'Critical Full';
      else if (fillPct >= 50) status = 'Half-Full';
      else if (fillPct >= 20) status = 'Alighting';

      const timeStr = new Date().toLocaleTimeString();
      const newLog: TelemetryLog = {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        binId: randomlySelectedBin.id,
        binName: randomlySelectedBin.name,
        distanceCm: parseFloat(randomlySelectedBin.currentTrashDistanceCm.toFixed(1)),
        fillPercent: fillPct,
        temperature: randomlySelectedBin.temperature,
        humidity: randomlySelectedBin.humidity,
        gasPpm: randomlySelectedBin.gasPpm,
        status: status,
        alertSent: fillPct >= 80
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50)); // cap at latest 50 entries
    }
  };

  const handleBinUpdate = (idx: number, updated: BinState) => {
    const next = [...bins];
    next[idx] = updated;
    setBins(next);

    // Force prompt logging on user slider adjustments
    const wasteHt = updated.heightCm - updated.currentTrashDistanceCm;
    const fillPct = Math.round(100 * (wasteHt / updated.heightCm));
    let status: 'Empty' | 'Half-Full' | 'Alighting' | 'Critical Full' = 'Empty';
    if (fillPct >= 80) status = 'Critical Full';
    else if (fillPct >= 50) status = 'Half-Full';
    else if (fillPct >= 20) status = 'Alighting';

    const newLog: TelemetryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      binId: updated.id,
      binName: updated.name,
      distanceCm: parseFloat(updated.currentTrashDistanceCm.toFixed(1)),
      fillPercent: fillPct,
      temperature: updated.temperature,
      humidity: updated.humidity,
      gasPpm: updated.gasPpm,
      status: status,
      alertSent: fillPct >= 80
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Dispatch Logistics Clear trigger
  const handleClearBin = (binId: string) => {
    const idx = bins.findIndex(b => b.id === binId);
    if (idx !== -1) {
      setBins(prev => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          currentTrashDistanceCm: next[idx].heightCm - 1.0, // nearly empty
          temperature: 20.5,
          humidity: 44,
          gasPpm: 105,
          lastClearedAt: new Date().toLocaleTimeString()
        };
        return next;
      });

      // Log clearance action to audit database
      const newLog: TelemetryLog = {
        id: `clear-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        binId: binId,
        binName: bins[idx].name,
        distanceCm: bins[idx].heightCm - 1.0,
        fillPercent: 2,
        temperature: 20.5,
        humidity: 44,
        gasPpm: 105,
        status: 'Empty',
        alertSent: false
      };
      setLogs(prev => [newLog, ...prev]);
    }
  };

  // Export telemetries log as CSV file
  const exportToCSV = () => {
    const headers = "Timestamp,Bin ID,Bin Name,Measured Distance (cm),Fill Level (%),Temp (°C),Humidity (%),Gas (PPM),Status\n";
    const recordLines = logs.map(l => 
      `"${l.timestamp}","${l.binId}","${l.binName}",${l.distanceCm},${l.fillPercent},${l.temperature},${l.humidity},${l.gasPpm},"${l.status}"`
    ).join("\n");

    const blob = new Blob([headers + recordLines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const triggerLink = document.createElement("a");
    triggerLink.setAttribute("href", url);
    triggerLink.setAttribute("download", `smart_waste_telemetry_${new Date().toISOString().split('T')[0]}.csv`);
    triggerLink.style.visibility = 'hidden';
    document.body.appendChild(triggerLink);
    triggerLink.click();
    document.body.removeChild(triggerLink);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Navigation Controller Header bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-40">
        
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md border border-indigo-500/20">
            <Trash2 strokeWidth={2} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white uppercase tracking-wider">Smart Waste Management & Bin Level Detection</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Advanced IoT Embedded Course Project Reference Workspace</p>
          </div>
        </div>

        {/* Master Workspace Selector */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-slate-950 p-1 border border-slate-800 rounded-xl flex">
            <button
              onClick={() => setViewMode('console')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'console' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Interactive IoT Dashboard</span>
            </button>
            
            <button
              onClick={() => setViewMode('workbook')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'workbook' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Course Syllabus & Guide</span>
            </button>
          </div>

          <a 
            href="#iot-guide-hub"
            onClick={() => { setViewMode('workbook'); }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-bold text-slate-300 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portfolio Kit</span>
          </a>
        </div>

      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto overflow-hidden flex flex-col">
        
        {/* Workspace panel renderer */}
        {viewMode === 'console' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
            
            {/* Left side: Electronic Sensor simulation hardware */}
            <section className="lg:col-span-5 h-[calc(100vh-180px)] lg:h-auto min-h-[450px]">
              <VirtualSimulator 
                bins={bins}
                onBinUpdate={handleBinUpdate}
                onBulkUpdate={handleBulkUpdate}
              />
            </section>

            {/* Right side: Cloud Analytics control deck */}
            <section className="lg:col-span-7 h-[calc(100vh-180px)] lg:h-auto min-h-[500px]">
              <AnalyticsDashboard 
                bins={bins}
                logs={logs}
                onClearLogs={() => setLogs([])}
                onClearBin={handleClearBin}
                onDownloadCSV={exportToCSV}
                onOpenReport={() => setIsReportOpen(true)}
              />
            </section>

          </div>
        ) : (
          <div className="flex-1 min-h-0 h-[calc(100vh-160px)]">
            <IoTGuideHub 
              customRepoName={customRepoName}
              setCustomRepoName={setCustomRepoName}
              customUserName={customUserName}
              setCustomUserName={setCustomUserName}
            />
          </div>
        )}

      </main>

      {/* Formal compliance Report Overlay container */}
      {isReportOpen && (
        <OfficialReportModal 
          logs={logs}
          onClose={() => setIsReportOpen(false)}
          onExportCSV={exportToCSV}
        />
      )}

    </div>
  );
}


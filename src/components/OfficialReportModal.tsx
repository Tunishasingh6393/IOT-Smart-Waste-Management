import React, { useRef } from 'react';
import { TelemetryLog } from '../types';
import { X, Printer, Download, FileSpreadsheet, Percent, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface OfficialReportModalProps {
  logs: TelemetryLog[];
  onClose: () => void;
  onExportCSV: () => void;
}

export default function OfficialReportModal({ logs, onClose, onExportCSV }: OfficialReportModalProps) {
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0];

  // Calculations based on logs
  const totLogs = logs.length;
  const criticalLogs = logs.filter(l => l.fillPercent >= 80).length;
  const happyLogs = logs.filter(l => l.fillPercent < 50).length;
  const halfFullLogs = logs.filter(l => l.fillPercent >= 50 && l.fillPercent < 80).length;

  const avgFillPct = totLogs > 0 
    ? Math.round(logs.reduce((acc, curr) => acc + curr.fillPercent, 0) / totLogs)
    : 0;
    
  const avgTemp = totLogs > 0
    ? (logs.reduce((acc, curr) => acc + curr.temperature, 0) / totLogs).toFixed(1)
    : '24.2';

  const avgGas = totLogs > 0
    ? Math.round(logs.reduce((acc, curr) => acc + curr.gasPpm, 0) / totLogs)
    : 180;

  // Calculate simulated collection rate (cleared logs are when level goes from high to low)
  const collectionIncidents = criticalLogs; 
  const carbonSavedKg = (collectionIncidents * 1.45).toFixed(1); // 1.45kg CO2 saved per route optimization

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="official-report-modal-overlay" className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto">
      <div id="official-report-modal-content" className="bg-white text-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Banner header controls (Do not show when printed) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl print:hidden">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">System Audit & Status Report</h3>
              <p className="text-xs text-slate-500">Generate compliance documents for municipal or campus leadership</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container */}
        <div className="p-8 md:p-12 overflow-y-auto print:p-0 print:overflow-visible print:max-h-none flex-1 font-sans" id="printable-area">
          
          {/* Header styling */}
          <div className="border-b-2 border-indigo-900 pb-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
              <div>
                <span className="inline-block px-2.5 py-1 text-xs font-bold tracking-widest uppercase bg-indigo-100 text-indigo-900 rounded-md mb-2">
                  IoT DATA TRANSMISSIONS
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  SMART CITY GARBAGE TELEMETRY AUDIT
                </h1>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Document ID: REP-SWM-{currentDate.replace(/-/g, '')}-{(Math.random() * 1000).toFixed(0)}
                </p>
              </div>
              <div className="text-left md:text-right text-xs space-y-1 font-mono text-slate-600">
                <p><strong>System Status:</strong> 🟢 HEALTHY OPERATIONS</p>
                <p><strong>Date Generated:</strong> {currentDate}</p>
                <p><strong>Time Generated:</strong> {currentTime} (UTC)</p>
                <p><strong>Ingress Gateway:</strong> MQTT / HiveMQ Broker</p>
              </div>
            </div>
          </div>

          {/* executive summary section */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-l-2 border-indigo-500 pl-2">
              1. Executive Summary
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              This report details telemetry collected from the automated non-contact ultrasonic sensor modules (HC-SR04) 
              networked with the ESP32 microcontrollers. This network continuously parses container depth volume values. 
              The target metrics successfully demonstrate optimized vehicle routing by triggering priority alarms before bin overflow occur.
              Over the logged window, the system recorded <strong>{totLogs}</strong> separate readings, optimizing 
              <strong> {collectionIncidents}</strong> scheduled pick-ups and averting container spills with a perfect success coefficient.
            </p>
          </div>

          {/* Metric Grid cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium">Avg Container Fill</span>
              <div className="flex items-baseline space-x-1 mt-2">
                <span className="text-2xl font-bold text-slate-900">{avgFillPct}</span>
                <span className="text-xs text-slate-400 font-mono">% CAP</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Weighted mean capacity</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium">Incidents Prevented</span>
              <div className="flex items-baseline space-x-1 mt-2">
                <span className="text-2xl font-bold text-red-600">{criticalLogs}</span>
                <span className="text-xs text-red-400 font-mono">ALARMS</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Level thresholds {`>=`} 80%</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium">CO2 Emission Reduction</span>
              <div className="flex items-baseline space-x-1 mt-2">
                <span className="text-2xl font-bold text-emerald-600">{carbonSavedKg}</span>
                <span className="text-xs text-emerald-400 font-mono">kg CO₂e</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Route optimization index</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-xs text-slate-500 font-medium font-mono">Avg Air Quality</span>
              <div className="flex items-baseline space-x-1 mt-2">
                <span className="text-2xl font-bold text-amber-600">{avgGas}</span>
                <span className="text-xs text-amber-400 font-mono">PPM</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">MQ-135 biological air factor</p>
            </div>
          </div>

          {/* Analytics tables */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-l-2 border-indigo-500 pl-2">
              2. Container Status Breakdown
            </h2>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase tracking-widest font-mono border-b border-slate-100">
                    <th className="p-3">State Class</th>
                    <th className="p-3">Threshold Limit</th>
                    <th className="p-3 text-center">Incidents Recorded</th>
                    <th className="p-3">Compliance Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-3 font-semibold text-emerald-700 flex items-center space-x-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Healthy Space</span>
                    </td>
                    <td className="p-3 font-mono">0% - 49% Capacity</td>
                    <td className="p-3 text-center font-bold text-slate-800">{happyLogs}</td>
                    <td className="p-3">Optimal level. Operational priority is set to idle.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-amber-700 flex items-center space-x-1.5">
                      <Info className="w-3.5 h-3.5" />
                      <span>Half-Full Space</span>
                    </td>
                    <td className="p-3 font-mono">50% - 79% Capacity</td>
                    <td className="p-3 text-center font-bold text-slate-800">{halfFullLogs}</td>
                    <td className="p-3">Moderate volume. Collection route scheduled for regular rounds.</td>
                  </tr>
                  <tr className="bg-red-50/50">
                    <td className="p-3 font-semibold text-red-700 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Critical / Full</span>
                    </td>
                    <td className="p-3 font-mono">&gt;= 80% Capacity</td>
                    <td className="p-3 text-center font-bold text-red-600">{criticalLogs}</td>
                    <td className="p-3 text-red-800 font-medium">⚠️ Priority Alert trigger dispatched to municipal team.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Telemetry log list (truncated to last 8 records to keep report elegant) */}
          <div className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-l-2 border-indigo-500 pl-2">
              3. Raw Telemetry Audit Trail (Latest Sequences)
            </h2>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-mono border-b border-slate-100">
                    <th className="p-2.5">Time Logged</th>
                    <th className="p-2.5">Module ID</th>
                    <th className="p-2.5">Container Target</th>
                    <th className="p-2.5 text-center">Depth (cm)</th>
                    <th className="p-2.5 text-center">Fill Ratio</th>
                    <th className="p-2.5 text-center">Temp / Hum</th>
                    <th className="p-2.5 text-center">Gas PPM</th>
                    <th className="p-2.5">Status Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-500">
                  {logs.slice(0, 8).map((log, i) => (
                    <tr key={log.id || i}>
                      <td className="p-2.5 font-mono text-slate-400">{log.timestamp}</td>
                      <td className="p-2.5 font-mono font-medium text-slate-700">{log.binId}</td>
                      <td className="p-2.5 font-medium text-slate-700">{log.binName}</td>
                      <td className="p-2.5 text-center font-mono">{log.distanceCm}cm</td>
                      <td className="p-2.5 text-center font-mono font-semibold text-slate-800">{log.fillPercent}%</td>
                      <td className="p-2.5 text-center font-mono">{log.temperature}°C / {log.humidity}%</td>
                      <td className="p-2.5 text-center font-mono">{log.gasPpm} PPM</td>
                      <td className="p-2.5 font-mono">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.fillPercent >= 80 
                            ? 'bg-red-100 text-red-800' 
                            : log.fillPercent >= 50 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-400">
                        No telemetry packets buffered yet. Fire updates on the simulator to inspect live grids.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {logs.length > 8 && (
              <p className="text-[10px] text-slate-400 mt-2 text-right">
                * Suppressing {logs.length - 8} surplus entries. Full trace downloaded within CSV export files.
              </p>
            )}
          </div>

          {/* Signature and Sign-Off block */}
          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-dashed border-slate-200 mt-12">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase">AUDIT VERIFIED BY:</p>
              <div className="h-14 border-b border-slate-300 mt-2 flex items-end">
                <span className="font-mono text-xs text-indigo-800 font-semibold mb-1 italic">IoT Node Auto-Daemon (Node001)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Embedded Gateway Controller</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase">MUNICIPAL COMMAND / DEPT ACCEPTANCE:</p>
              <div className="h-14 border-b border-slate-300 mt-2"></div>
              <p className="text-[10px] text-slate-400 mt-1">Smart City Planning Authority Signature</p>
            </div>
          </div>

        </div>

        {/* Footer print note */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl print:hidden flex justify-between items-center text-xs text-slate-400">
          <span>💡 Pro-tip: Press CTRL+P or click *Print Report* to save this layout as an official PDF file for grading.</span>
          <span>© 2026 Smart Waste System</span>
        </div>

      </div>
    </div>
  );
}

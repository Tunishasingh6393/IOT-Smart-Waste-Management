import React, { useState } from 'react';
import { BinState, TelemetryLog, DispatchTask } from '../types';
import { 
  BarChart3, Activity, ShieldCheck, Download, 
  Trash2, Send, AlertCircle, RefreshCw, Truck, 
  Settings, Clock, ArrowUpRight, Signal, Terminal 
} from 'lucide-react';

interface AnalyticsDashboardProps {
  bins: BinState[];
  logs: TelemetryLog[];
  onClearLogs: () => void;
  onClearBin: (id: string) => void;
  onDownloadCSV: () => void;
  onOpenReport: () => void;
}

export default function AnalyticsDashboard({
  bins,
  logs,
  onClearLogs,
  onClearBin,
  onDownloadCSV,
  onOpenReport
}: AnalyticsDashboardProps) {
  const [dispatchingBinId, setDispatchingBinId] = useState<string | null>(null);

  // Math metrics
  const activeBinsCount = bins.filter(b => b.isOnline).length;
  const criticalCount = bins.filter(b => b.isOnline && (100 * (1 - (b.currentTrashDistanceCm / b.heightCm))) >= 80).length;
  
  // Calculate aggregate Fill Level
  const totalFillPct = bins.reduce((acc, bin) => {
    if (!bin.isOnline) return acc;
    const wasteHeight = bin.heightCm - bin.currentTrashDistanceCm;
    return acc + (100 * (wasteHeight / bin.heightCm));
  }, 0);
  const avgFillPct = activeBinsCount > 0 ? Math.round(totalFillPct / activeBinsCount) : 0;

  // Dispatch Logistics Optimization List
  const dispatchTasks: DispatchTask[] = bins.map((bin) => {
    if (!bin.isOnline) {
      return {
        id: bin.id,
        binId: bin.id,
        binName: bin.name,
        fillPercent: 0,
        priority: 'Low' as const,
        status: 'Pending' as const,
        estimatedTimeToFullMins: 999
      } as DispatchTask;
    }

    const wasteHeight = bin.heightCm - bin.currentTrashDistanceCm;
    const fillPercent = Math.round(100 * (wasteHeight / bin.heightCm));
    
    // Estimate mins left: (Remaining height - 2cm safelimit) / accumulation rate
    const remainingHt = Math.max(0, bin.currentTrashDistanceCm - 2.0);
    const estTimeToFull = bin.fillRatePerMin > 0 
      ? Math.round(remainingHt / bin.fillRatePerMin) 
      : 999;

    let priority: 'Low' | 'Medium' | 'High' | 'Emergency' = 'Low';
    if (fillPercent >= 80 || bin.gasPpm > 500) {
      priority = 'Emergency';
    } else if (fillPercent >= 65) {
      priority = 'High';
    } else if (fillPercent >= 45) {
      priority = 'Medium';
    }

    return {
      id: bin.id,
      binId: bin.id,
      binName: bin.name,
      fillPercent,
      priority,
      status: 'Pending' as const,
      estimatedTimeToFullMins: estTimeToFull
    } as DispatchTask;
  }).filter(b => {
    // Sort to prioritize urgent dispatches
    return bins.find(x => x.id === b.binId)?.isOnline;
  }).sort((a, b) => b.fillPercent - a.fillPercent);

  // Trigger dispatch crew clearing animation
  const handleDispatch = (binId: string) => {
    setDispatchingBinId(binId);
    setTimeout(() => {
      onClearBin(binId);
      setDispatchingBinId(null);
    }, 2800); // 2.8 seconds animation
  };

  // Generate SVG line graph tracking the last 10 log data files
  const renderSVGChart = () => {
    // Group logs by time sequence or just take latest 10
    const chartLogs = [...logs].reverse().slice(0, 10).reverse();
    if (chartLogs.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-slate-500 font-mono text-xs">
          Waiting for telemetry sequences to build trends... (Simulate updates)
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const padding = 20;

    // Calculate coords mapping
    const minVal = 0;
    const maxVal = 100;
    
    const points = chartLogs.map((log, index) => {
      const x = padding + (index * (width - 2 * padding) / (chartLogs.length - 1));
      const y = height - padding - (log.fillPercent * (height - 2 * padding) / 100);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-indigo-500 stroke-current">
          {/* Horizontal grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="3,3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />

          {/* Core trend line path with glow effects */}
          <polyline
            fill="none"
            strokeWidth="3.5"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-400 drop-shadow-[0_1px_6px_rgba(99,102,241,0.5)]"
          />

          {/* Dots highlighting individual data sequences */}
          {chartLogs.map((log, index) => {
            const x = padding + (index * (width - 2 * padding) / (chartLogs.length - 1));
            const y = height - padding - (log.fillPercent * (height - 2 * padding) / 100);
            return (
              <g key={index} className="group">
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  className={log.fillPercent >= 80 ? 'fill-rose-500' : 'fill-indigo-300'}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  className={`${log.fillPercent >= 80 ? 'stroke-rose-600' : 'stroke-indigo-400'} fill-none stroke-2 opacity-0 hover:opacity-100 transition-opacity duration-200`}
                />
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between text-[9px] text-slate-500 font-mono px-4 mt-1.5">
          <span>Oldest Telemetry Packet</span>
          <span>Latest Ingress Packet</span>
        </div>
      </div>
    );
  };

  return (
    <div id="analytics-dashboard" className="space-y-6 flex flex-col h-full overflow-y-auto pr-1">
      
      {/* Top Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        
        {/* Core Gateway status */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Gateway Service</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <p className="text-white font-extrabold text-xs">MOSQUITTO MQTT</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">broker.hivemq.com</p>
          </div>
          <Signal className="w-5 h-5 text-emerald-400 shrink-0" />
        </div>

        {/* Total Connected Nodes */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Connected Nodes</span>
            <p className="text-white font-extrabold text-sm mt-1">{activeBinsCount} of {bins.length} Active</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{bins.filter(b => !b.isOnline).length} local nodes muted</p>
          </div>
          <Activity className="w-5 h-5 text-indigo-400 shrink-0" />
        </div>

        {/* Aggregated Average Capacity */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Avg Capacity Load</span>
            <p className="text-white font-extrabold text-sm mt-1">{avgFillPct}% CAP</p>
            <p className="text-[10px] text-slate-400 mt-0.5">System fluid safety limit</p>
          </div>
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-950 text-indigo-400 text-xs font-bold font-mono">
            {avgFillPct}%
          </div>
        </div>

        {/* Active Emergency alerts */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Overflow Risks</span>
            <p className={`font-extrabold text-sm mt-1 ${criticalCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
              {criticalCount} Critical Alarms
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Threshold triggers {`>=`} 80%</p>
          </div>
          <AlertCircle className={`w-5 h-5 ${criticalCount > 0 ? 'text-rose-500' : 'text-slate-600'}`} />
        </div>

      </div>

      {/* Main split: Analytics & Dispatch */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        
        {/* Left Side: Historical Chart & Active telemetry */}
        <div className="xl:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between spacing-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
            <div>
              <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">Garbage Capacity Historical Trend</h3>
              <p className="text-[10px] text-slate-400">Continuous ultrasonic depth readings recorded over latest ingress phases</p>
            </div>
            <span className="text-[10px] font-mono tracking-wide bg-slate-900 text-indigo-400 border border-slate-800 px-2.5 py-1 rounded-md">
              LIVE BROADCAST FEED
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            {renderSVGChart()}
          </div>

          <div className="border-t border-slate-900 pt-3 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded"></span>
              <span>Fill Level %</span>
              <span className="w-2.5 h-2.5 bg-rose-500 rounded ml-2"></span>
              <span>Critical Overflow (&gt;=80%)</span>
            </div>
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-lg cursor-pointer transition-colors text-[11px]"
            >
              <span>View Audit & Compliance PDF Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>

        </div>

        {/* Right Side: Dispatch center */}
        <div className="xl:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col h-full">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
            <div className="flex items-center space-x-1.5 text-white">
              <Truck className="w-4 h-4 text-indigo-400" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">Logistics Fleet Dispatch</h3>
            </div>
            <span className="text-[9px] font-bold text-slate-500 font-mono">PRIORITY QUEUE</span>
          </div>

          {/* List of active routing estimates */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[250px]">
            {dispatchTasks.map((task) => {
              const isUrgent = task.priority === 'Emergency' || task.priority === 'High';
              const isDispatching = dispatchingBinId === task.binId;

              return (
                <div 
                  key={task.id} 
                  className={`p-3 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                    isDispatching 
                      ? 'border-indigo-500 bg-indigo-950/20' 
                      : isUrgent 
                        ? 'border-red-900/40 bg-red-950/5' 
                        : 'border-slate-850 bg-slate-900/40 hover:bg-slate-900/80'
                  }`}
                >
                  
                  {/* Sliding truck animation overlay when active dispatch */}
                  {isDispatching && (
                    <div className="absolute inset-0 bg-slate-950/90 z-20 flex items-center justify-center space-x-2 animate-pulse">
                      <Truck className="w-5 h-5 text-indigo-400 animate-bounce" />
                      <span className="text-xs font-mono font-bold tracking-widest text-indigo-300">DISPATCH EN ROUTE...</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-bold text-xs">{task.binName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center">
                        <Clock className="w-3 h-3 text-slate-500 mr-1" />
                        <span>Est. time to full: </span>
                        <strong className="text-slate-200 ml-1">
                          {task.estimatedTimeToFullMins === 999 
                            ? 'Infinite / Static' 
                            : `${task.estimatedTimeToFullMins} mins`}
                        </strong>
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded uppercase ${
                      task.priority === 'Emergency' 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                        : task.priority === 'High' 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {task.priority === 'Emergency' ? '🔥 CRITICAL' : task.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-900">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xs font-bold text-slate-300">{task.fillPercent}%</span>
                      <span className="text-[9px] text-slate-500 uppercase font-mono">CAP LOAD</span>
                    </div>
                    
                    <button
                      disabled={isDispatching}
                      onClick={() => handleDispatch(task.binId)}
                      className={`flex items-center space-x-1 px-2.5 py-1 text-[10px] font-extrabold rounded-md cursor-pointer transition-colors ${
                        task.fillPercent >= 80 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      <span>{isUrgent ? 'DISPATCH TRUCK NOW' : 'SCHEDULE SWEEP'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
            
            {dispatchTasks.length === 0 && (
              <div className="p-8 text-center text-slate-500 font-mono text-[11px] leading-relaxed">
                All monitoring nodes are currently muted or offline. Activate hardware simulators to calculate dispatch estimates!
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 text-[11px] text-slate-400 mt-3 leading-relaxed">
            🚛 <strong>Dynamic Vehicle Dispatch Algorithm:</strong> Sorts collection schedules dynamically, ordering dispatch sweeps 
            based on fill constraints and atmospheric biological hazard readings, saving transit fuel.
          </div>

        </div>

      </div>

      {/* Raw Database feed logs */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col h-64 shrink-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-3 mb-3 shrink-0">
          <div>
            <div className="flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">MQTT System Log Audit Stream</h3>
            </div>
            <p className="text-[10px] text-slate-500">Live sequential packets recorded by local database caches</p>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onClearLogs}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset audit database</span>
            </button>
            
            <button
              onClick={onDownloadCSV}
              className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export local CSV database</span>
            </button>
          </div>
        </div>

        {/* Audit lists table */}
        <div className="flex-1 overflow-auto font-mono text-[11px] text-slate-400 text-left">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-500 border-b border-slate-850 sticky top-0">
                <th className="p-2">Timestamp</th>
                <th className="p-2">Bin ID</th>
                <th className="p-2">Target Node Name</th>
                <th className="p-2 text-center">Measured HC-SR04 cm</th>
                <th className="p-2 text-center">Fill Ratio</th>
                <th className="p-2 text-center">Temperature (°C)</th>
                <th className="p-2 text-center">Gas PPM</th>
                <th className="p-2">Log Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/30">
                  <td className="p-2 text-slate-500">{log.timestamp}</td>
                  <td className="p-2 text-indigo-400 font-bold">{log.binId}</td>
                  <td className="p-2 font-sans text-slate-300">{log.binName}</td>
                  <td className="p-2 text-center">{log.distanceCm} cm</td>
                  <td className="p-2 text-center font-bold text-white">{log.fillPercent}%</td>
                  <td className="p-2 text-center">{log.temperature}°C</td>
                  <td className="p-2 text-center">{log.gasPpm} PPM</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      log.fillPercent >= 80 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/25' 
                        : log.fillPercent >= 50 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-500">
                    No packet exchanges indexed yet. Keep the Virtual Simulator running to witness live signals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

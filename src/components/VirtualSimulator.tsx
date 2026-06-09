import React, { useState, useEffect } from 'react';
import { BinState } from '../types';
import { Play, Pause, RefreshCw, Radio, Settings2, ShieldCheck, Thermometer, Droplets, Biohazard, Volume2, VolumeX } from 'lucide-react';

interface VirtualSimulatorProps {
  bins: BinState[];
  onBinUpdate: (index: number, updated: BinState) => void;
  onBulkUpdate: (updatedBins: BinState[]) => void;
}

export default function VirtualSimulator({
  bins,
  onBinUpdate,
  onBulkUpdate
}: VirtualSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // multiplier
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Sound generator
  const triggerBuzzerChime = () => {
    if (isMuted) return;
    try {
      // Lazy init AudioContext on first sound to conform to browser gesture guidelines
      let context = audioContext;
      if (!context) {
        context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
      }
      
      if (context.state === 'suspended') {
        context.resume();
      }

      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, context.currentTime); // high-pitched beep
      
      gain.gain.setValueAtTime(0.04, context.currentTime); // quiet, comfortable level
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(context.destination);

      osc.start();
      osc.stop(context.currentTime + 0.15);
    } catch (e) {
      // Fallback if browser blocks audio
    }
  };

  // Simulation step
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      let alarmTriggered = false;

      const nextBins = bins.map((bin) => {
        if (!bin.isOnline) return bin;

        // Cumulative increments
        const addedTrashCm = bin.fillRatePerMin * (1.5 * simulationSpeed); 
        const nextWasteCm = Math.min(bin.heightCm - 1, bin.heightCm - bin.currentTrashDistanceCm + addedTrashCm);
        
        // Dist calculation
        const nextDistCm = Math.max(1.0, bin.heightCm - nextWasteCm);
        const nextDistCmFixed = parseFloat(nextDistCm.toFixed(1));

        // Fill percentage
        const fillPercent = 100 * (1 - (nextDistCmFixed / bin.heightCm));
        
        // Simulate bio decay dynamics (decomposition)
        // More trash + wet profile -> higher temperature & gas release over time
        const decayCoeff = fillPercent / 100;
        const tempBaseOffset = bin.id === 'bin-food-02' ? 6.8 : 3.2;
        const destTemp = 21 + (decayCoeff * tempBaseOffset) + (Math.sin(Date.now() / 100000) * 1.5);
        const destGas = 120 + (Math.pow(decayCoeff, 2) * (bin.id === 'bin-food-02' ? 620 : 210));
        const destHum = 50 + (decayCoeff * 35);

        // Buzzers trigger if any online bin goes > 80%
        if (fillPercent >= 80) {
          alarmTriggered = true;
        }

        return {
          ...bin,
          currentTrashDistanceCm: nextDistCmFixed,
          temperature: parseFloat(destTemp.toFixed(1)),
          gasPpm: Math.round(destGas),
          humidity: Math.round(destHum)
        };
      });

      if (alarmTriggered) {
        // Pulse beep every active tick
        triggerBuzzerChime();
      }

      onBulkUpdate(nextBins);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, bins, simulationSpeed, isMuted, audioContext]);

  // Handle local state changes
  const handleSliderChange = (idx: number, distCm: number) => {
    const bin = bins[idx];
    const fillPercent = 100 * (1 - (distCm / bin.heightCm));
    
    // Quick estimation updates for temp/gas based on newly set slider distance
    const decayCoeff = fillPercent / 100;
    const destTemp = 21 + (decayCoeff * (bin.id === 'bin-food-02' ? 6.8 : 3.2));
    const destGas = 120 + (Math.pow(decayCoeff, 2) * (bin.id === 'bin-food-02' ? 620 : 210));
    const destHum = 50 + (decayCoeff * 35);

    if (fillPercent >= 80) {
      triggerBuzzerChime();
    }

    onBinUpdate(idx, {
      ...bin,
      currentTrashDistanceCm: distCm,
      temperature: parseFloat(destTemp.toFixed(1)),
      gasPpm: Math.round(destGas),
      humidity: Math.round(destHum)
    });
  };

  const handleEmptyBin = (idx: number) => {
    onBinUpdate(idx, {
      ...bins[idx],
      currentTrashDistanceCm: bins[idx].heightCm - 0.5, // 0.5cm of trash on bottom
      temperature: 20.8,
      humidity: 45,
      gasPpm: 125,
      lastClearedAt: new Date().toLocaleTimeString()
    });
  };

  const toggleOnline = (idx: number) => {
    onBinUpdate(idx, {
      ...bins[idx],
      isOnline: !bins[idx].isOnline
    });
  };

  return (
    <div id="virtual-simulator-container" className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      
      {/* Simulator Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">IoT Hardware Telemetry Emulation Panel</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Adjust distance sliders to simulate garbage filling, or play auto-accumulation</p>
        </div>
        
        {/* Controls block */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isMuted 
                ? 'bg-slate-950 border-red-500/30 text-rose-400 hover:bg-slate-900' 
                : 'bg-slate-950 border-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-slate-900'
            }`}
            title={isMuted ? 'Unmute Alarm Buzzer Feedback' : 'Mute Alarm Buzzer Feedback'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              isPlaying 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Auto-Fill' : 'Resume Auto-Fill'}</span>
          </button>

          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setSimulationSpeed(1)}
              className={`px-2 py-1 rounded font-semibold text-[10px] cursor-pointer ${simulationSpeed === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Standard Accumulation Speed"
            >
              1X
            </button>
            <button
              onClick={() => setSimulationSpeed(3)}
              className={`px-2 py-1 rounded font-semibold text-[10px] cursor-pointer ${simulationSpeed === 3 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Fast Accumulation (Demo)"
            >
              3X
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Bins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
        {bins.map((bin, idx) => {
          const wasteHeight = bin.heightCm - bin.currentTrashDistanceCm;
          const fillPercent = Math.round(100 * (wasteHeight / bin.heightCm));
          const isCritical = fillPercent >= 80;

          return (
            <div 
              key={bin.id} 
              className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                !bin.isOnline 
                  ? 'border-slate-800 opacity-60' 
                  : isCritical 
                    ? 'border-red-600/40 bg-gradient-to-br from-slate-950 to-red-950/20 shadow-red-950/10' 
                    : 'border-slate-800'
              }`}
            >
              
              {/* Card Title Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${bin.isOnline ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                    <h4 className="text-white font-bold text-xs leading-none">{bin.name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">{bin.location}</p>
                </div>
                <button
                  onClick={() => toggleOnline(idx)}
                  className={`text-[9px] font-mono px-1.5 py-0.5 border rounded cursor-pointer ${
                    bin.isOnline 
                      ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' 
                      : 'border-slate-700 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {bin.isOnline ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>

              {/* Physical Bin render layout and parameter controls */}
              <div className="grid grid-cols-3 gap-3 my-3">
                
                {/* Physical stylized rendering of container depth */}
                <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center justify-end relative overflow-hidden h-28">
                  {/* Container lid styling */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-600 rounded-t border-b border-slate-700"></div>
                  
                  {/* HC-SR04 sensor mock layout */}
                  <div className="absolute top-1.5 w-7 h-2 bg-slate-800 border border-slate-700 rounded-b flex justify-around p-0.5" title="HC-SR04 Sensor Node">
                    <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full"></span>
                  </div>

                  {/* Ultrasonic Waves flashing on changes */}
                  {isPlaying && bin.isOnline && (
                    <div className="absolute top-4 flex flex-col items-center space-y-1 animate-pulse">
                      <span className="block w-4 h-0.5 bg-indigo-500/40 rounded"></span>
                      <span className="block w-2.5 h-0.5 bg-indigo-500/30 rounded"></span>
                      <span className="block w-1.5 h-0.5 bg-indigo-500/20 rounded"></span>
                    </div>
                  )}

                  {/* Liquid waste level fill visual */}
                  <div 
                    className={`w-full rounded-b transition-all duration-700 relative ${
                      isCritical 
                        ? 'bg-gradient-to-t from-red-800 to-rose-700' 
                        : fillPercent >= 50 
                          ? 'bg-gradient-to-t from-amber-700 to-yellow-600' 
                          : 'bg-gradient-to-t from-emerald-800 to-teal-700'
                    }`}
                    style={{ height: `${bin.isOnline ? fillPercent : 0}%` }}
                  >
                    {/* Level label overlaid */}
                    {bin.isOnline && fillPercent > 12 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                        {fillPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Live parameters readings block */}
                <div className="col-span-2 flex flex-col justify-around text-xs pl-1">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] border-b border-slate-900 pb-1">
                      <span className="text-slate-500 font-mono">Distance (HC-SR04)</span>
                      <span className="text-white font-mono font-bold">{bin.isOnline ? `${bin.currentTrashDistanceCm} cm` : '---'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] border-b border-slate-900 pb-1">
                      <span className="text-slate-500 font-mono">Calibrated Fill</span>
                      <span className={`font-mono font-semibold ${isCritical ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                        {bin.isOnline ? `${fillPercent}% / ${bin.heightCm - bin.currentTrashDistanceCm}cm` : 'OFFLINE'}
                      </span>
                    </div>

                    {/* Sensor badges row */}
                    <div className="grid grid-cols-3 gap-1 pt-1.5 text-center text-[10px] font-mono">
                      <div className="bg-slate-900 p-1.5 rounded border border-slate-850" title="Internal Temp (DHT11)">
                        <Thermometer className="w-3.5 h-3.5 text-orange-400 mx-auto mb-0.5" />
                        <span className="text-[9px] text-white font-bold">{bin.isOnline ? `${bin.temperature}°C` : '--'}</span>
                      </div>
                      
                      <div className="bg-slate-900 p-1.5 rounded border border-slate-850" title="Chamber Humidity (DHT11)">
                        <Droplets className="w-3.5 h-3.5 text-sky-400 mx-auto mb-0.5" />
                        <span className="text-[9px] text-white font-bold">{bin.isOnline ? `${bin.humidity}%` : '--'}</span>
                      </div>

                      <div className="bg-slate-900 p-1.5 rounded border border-slate-850" title="Decomposition Gas Factor (MQ-135)">
                        <Biohazard className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-0.5" />
                        <span className="text-[9px] text-white font-bold">{bin.isOnline ? `${bin.gasPpm} PPM` : '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Slider Controller line */}
              {bin.isOnline && (
                <div className="mt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                    <span>EMPTY (H = {bin.heightCm}cm)</span>
                    <span>FULL (2cm limit)</span>
                  </div>
                  <input
                    type="range"
                    min={2.0}
                    max={bin.heightCm}
                    step={0.5}
                    value={bin.currentTrashDistanceCm}
                    onChange={(e) => handleSliderChange(idx, parseFloat(e.target.value))}
                    className="w-full relative z-10 accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer h-1.5"
                  />
                  <p className="text-[9px] text-indigo-400/80 font-mono text-center mt-1">
                    * Adjusting slider alters HC-SR04 sound wave reflection boundaries.
                  </p>
                </div>
              )}

              {/* Action operations button bar */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-2.5 mt-2">
                <span className="text-[10px] font-mono text-slate-500">
                  {bin.lastClearedAt ? `Last pickup: ${bin.lastClearedAt}` : 'Not pick-upped yet'}
                </span>
                <button
                  disabled={!bin.isOnline}
                  onClick={() => handleEmptyBin(idx)}
                  className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    !bin.isOnline 
                      ? 'border-slate-800 text-slate-500' 
                      : 'border-indigo-500/30 text-indigo-400 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Push Clean Clear Unit</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

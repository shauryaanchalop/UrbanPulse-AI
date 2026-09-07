import React, { useState } from 'react';
import { Bus } from '../types';
import { 
  X, Camera, Cpu, Activity, Wifi, Navigation, 
  Layers, Video, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';

interface BusDetailModalProps {
  bus: Bus | null;
  onClose: () => void;
}

export const BusDetailModal: React.FC<BusDetailModalProps> = ({ bus, onClose }) => {
  const [activeCam, setActiveCam] = useState<'front' | 'rear' | 'left' | 'right'>('front');

  if (!bus) return null;

  const cameras = [
    { key: 'front', label: 'Front Telephoto (Primary Defect & ANPR)', res: '1080p @ 30fps' },
    { key: 'rear', label: 'Rear Wide (Tailgating & Overtake)', res: '1080p @ 25fps' },
    { key: 'left', label: 'Left Side (Curb & Missing Markings)', res: '720p @ 25fps' },
    { key: 'right', label: 'Right Side (Divider & Pedestrian)', res: '720p @ 25fps' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-iccc-900 border border-iccc-border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-iccc-border flex items-center justify-between bg-iccc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{bus.id}</h3>
                <span className="text-xs text-slate-400 font-mono">({bus.fleetNumber})</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border font-mono bg-emerald-950 text-emerald-400 border-emerald-600/40">
                  {bus.status}
                </span>
                <span className="text-[10px] text-sky-400 bg-sky-950 border border-sky-800 px-2 py-0.5 rounded font-mono">
                  {bus.routeId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{bus.routeName}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4">
          {/* 4-Camera Feed Switcher & Viewport */}
          <div className="flex flex-col gap-2">
            {/* Camera Tab Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cameras.map(c => (
                <button
                  key={c.key}
                  onClick={() => setActiveCam(c.key as any)}
                  className={`p-2 rounded-xl text-left border transition flex flex-col justify-between ${
                    activeCam === c.key
                      ? 'bg-sky-950/80 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs capitalize">{c.key} Camera</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">{c.res}</span>
                </button>
              ))}
            </div>

            {/* Simulated Live Camera Stream Viewport with AI Bounding Box Overlays */}
            <div className="relative w-full h-80 bg-slate-950 rounded-xl border border-iccc-border overflow-hidden flex items-center justify-center">
              {/* Dynamic Camera SVG Canvas */}
              <div className="w-full h-full relative">
                <img
                  src={`/evidence/road_defect_${activeCam === 'front' ? '1' : (activeCam === 'rear' ? '3' : '5')}.jpg`}
                  alt={`${activeCam} feed`}
                  className="w-full h-full object-cover opacity-90"
                />

                {/* HUD Live Overlay */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-sky-500/40 px-3 py-1.5 rounded-lg text-xs font-mono text-sky-300 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="font-bold uppercase tracking-wider">LIVE EDGE FEED: {activeCam.toUpperCase()}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    LAT: {bus.latitude.toFixed(5)}° N | LNG: {bus.longitude.toFixed(5)}° E | SPD: {bus.speed} km/h
                  </div>
                </div>

                {/* AI Model Tag */}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>YOLOv9-Edge-INT8 | {bus.edgeFps} FPS</span>
                </div>

                {/* Simulated Bounding Boxes */}
                <div className="absolute top-[28%] left-[22%] w-[28%] h-[40%] border-2 border-emerald-400 bg-emerald-500/10 rounded pointer-events-none">
                  <div className="bg-emerald-500 text-black text-[9px] font-mono font-bold px-1.5 py-0.5 inline-block">
                    CAR #102 (96.4%)
                  </div>
                </div>

                <div className="absolute top-[52%] right-[24%] w-[22%] h-[32%] border-2 border-amber-400 bg-amber-500/10 rounded pointer-events-none">
                  <div className="bg-amber-500 text-black text-[9px] font-mono font-bold px-1.5 py-0.5 inline-block">
                    POTHOLE #08 (92.8%)
                  </div>
                </div>

                {/* Telemetry Footer inside Video */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-300 flex items-center justify-between">
                  <span>GPS: {bus.gpsHealth}</span>
                  <span>NET: {bus.networkStatus}</span>
                  <span>CAM HEALTH: {bus.cameraHealth}</span>
                  <span className="text-emerald-400">STATUS: INFERENCE ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edge Telemetry & Hardware Utilization Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Inference Throughput</span>
              <div className="text-lg font-bold font-mono text-emerald-400 my-1">{bus.edgeFps} FPS</div>
              <span className="text-[9px] text-slate-500 font-mono">Target: 30.0 FPS</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Edge GPU Load</span>
              <div className="text-lg font-bold font-mono text-sky-400 my-1">{bus.gpuUtilization}%</div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${bus.gpuUtilization}%` }}></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Vehicle Telemetry</span>
              <div className="text-lg font-bold font-mono text-white my-1">{bus.speed} km/h</div>
              <span className="text-[9px] text-slate-400 font-mono">Heading: {bus.heading}°</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Passenger Load</span>
              <div className="text-lg font-bold font-mono text-purple-400 my-1">{bus.currentPassengerLoad || 34} Pax</div>
              <span className="text-[9px] text-emerald-400 font-mono">Capacity: 62%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

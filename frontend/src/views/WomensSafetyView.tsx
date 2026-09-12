import React, { useState, useEffect } from 'react';
import { ShieldAlert, PhoneCall, MapPin, Radio, AlertTriangle, CheckCircle2, UserCheck, Eye } from 'lucide-react';
import type { DistressAlert, Bus, SafetyIncident } from '../types';
import { api } from '../services/api';

interface WomensSafetyViewProps {
  buses?: Bus[];
  incidents?: SafetyIncident[];
}

export function WomensSafetyView({ buses = [], incidents = [] }: WomensSafetyViewProps) {
  const [alerts, setAlerts] = useState<DistressAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<DistressAlert | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.getDistressAlerts();
      setAlerts(data);
      if (data.length > 0) setSelectedAlert(data[0]);
    } catch (err) {
      console.error('Failed to load distress alerts', err);
    }
  };

  const handleCreateEmergency = async () => {
    try {
      const newAlert = await api.createDistressAlert({
        category: 'PERSONAL SAFETY',
        address: 'University Circle Gate Exit',
        latitude: 18.5362,
        longitude: 73.8301
      });
      loadAlerts();
    } catch (err) {
      console.error('Failed to trigger emergency', err);
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col p-6 overflow-y-auto font-sans space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">Women's Safety & Emergency Intelligence Portal</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time distress alert aggregation, mobile bus camera visual tracking, and nearest emergency unit dispatch.
          </p>
        </div>
        <button
          onClick={handleCreateEmergency}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-red-900/30 flex items-center space-x-2 transition-colors animate-pulse"
        >
          <Radio className="w-4 h-4" />
          <span>SIMULATE CITIZEN DISTRESS ALERT</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alerts Feed (1 col) */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Active Emergency Distress Alerts ({alerts.length})
          </h3>
          {alerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => setSelectedAlert(alt)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 text-xs ${
                selectedAlert?.id === alt.id
                  ? 'bg-red-950/30 border-red-500 ring-1 ring-red-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white font-mono">#{alt.alertCode}</h4>
                  <p className="text-[11px] text-slate-400">{alt.category} • {alt.timestamp}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  alt.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {alt.status}
                </span>
              </div>
              <p className="text-slate-300">{alt.address}</p>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Nearest Bus: <strong className="text-slate-200">{alt.nearestBusId || 'BUS-004'}</strong></span>
                <span>Response: <strong className="text-slate-200">{alt.nearestResponseUnit || 'PCR #12'}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Alert Detail Workspace (2 cols) */}
        {selectedAlert && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Emergency Incident Details #{selectedAlert.alertCode}</h3>
                  <p className="text-slate-400 font-mono text-[11px]">{selectedAlert.address} ({selectedAlert.latitude}, {selectedAlert.longitude})</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-xs">
                    ACKNOWLEDGE
                  </button>
                  <button className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs shadow-md shadow-red-900/30">
                    DISPATCH PCR UNIT
                  </button>
                </div>
              </div>

              {/* Visual Sensor Integration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-300 font-mono text-[11px] uppercase">
                    Nearest Mobile Visual Source (BUS-004)
                  </h4>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative border border-slate-800">
                    <img src={selectedAlert.mediaUrl || '/evidence/incident_frame_1.jpg'} alt="Camera feed" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/80 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px]">
                      LIVE OVERWATCH
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-300 font-mono text-[11px] uppercase">
                    Response Unit Dispatch Status
                  </h4>
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned PCR Van:</span>
                      <span className="font-bold text-white">{selectedAlert.nearestResponseUnit || 'PCR Unit #12'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ETA to Coordinates:</span>
                      <span className="font-bold text-amber-400">3 mins (1.2 km)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transit Bus Sensor:</span>
                      <span className="font-bold text-emerald-400">{selectedAlert.nearestBusId || 'BUS-004'} In Range</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

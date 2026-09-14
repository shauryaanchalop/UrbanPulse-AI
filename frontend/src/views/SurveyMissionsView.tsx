import React, { useState, useEffect } from 'react';
import { Target, Truck, AlertTriangle, CheckCircle2, Shield, MapPin, Send, Compass } from 'lucide-react';
import type { SurveyMission, ServiceVehicle } from '../types';
import { api } from '../services/api';

export function SurveyMissionsView() {
  const [missions, setMissions] = useState<SurveyMission[]>([]);
  const [serviceVehicles, setServiceVehicles] = useState<ServiceVehicle[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mData, vData] = await Promise.all([
        api.getSurveyMissions(),
        api.getServiceVehicles()
      ]);
      setMissions(mData);
      setServiceVehicles(vData);
    } catch (err) {
      console.error('Failed to load survey missions', err);
    }
  };

  const handleAssignMission = async (missionId: string) => {
    try {
      await api.assignSurveyMission(missionId, 'MS-08');
      loadData();
    } catch (err) {
      console.error('Failed to assign mission', err);
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col p-6 overflow-y-auto font-sans space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">Coverage Intelligence & Targeted Survey Missions</h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            "UrbanPulse identifies what it knows, what it doesn't know, and where the next observation is needed."
          </p>
        </div>
        <div className="px-3 py-1 bg-amber-950/60 border border-amber-800 text-amber-400 font-sans font-bold text-xs rounded-lg">
          LAYER 4 COVERAGE DISPATCH ACTIVE
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Missions List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">
            Active Insufficient Observation Sector Missions ({missions.length})
          </h3>

          <div className="space-y-3">
            {missions.map((m) => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs font-sans">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm font-sans">{m.missionCode} • {m.sector}</h4>
                    <p className="text-slate-400 text-[11px] font-sans">Priority: <strong className="text-amber-400">{m.priority}</strong></p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-sans font-bold ${
                    m.status === 'ASSIGNED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-sans text-[11px]">
                  <div><span className="text-slate-400">Trigger Reason:</span> <span className="text-slate-200">{m.reason}</span></div>
                  <div><span className="text-slate-400">Target Segments:</span> <span className="text-slate-200 font-mono text-[10px]">{m.roadSegmentIds.join(', ')}</span></div>
                  <div><span className="text-slate-400">Recommended Sensor Rover:</span> <span className="text-amber-400 font-semibold">{m.recommendedVehicleId} (Municipal Smart Rover)</span></div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-slate-500 font-sans">Created at {m.assignedAt}</span>
                  {m.status !== 'ASSIGNED' && (
                    <button
                      onClick={() => handleAssignMission(m.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-colors flex items-center space-x-1.5 font-sans"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ASSIGN SURVEY MISSION</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Municipal Service Fleet List (1 col) */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">
            Layer 2 Municipal Fleet ({serviceVehicles.length})
          </h3>

          <div className="space-y-2">
            {serviceVehicles.map((v) => (
              <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1 text-xs font-sans">
                <div className="flex justify-between items-center font-sans">
                  <span className="font-bold text-white">{v.id} ({v.vehicleCode})</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{v.status}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{v.vehicleType} • {v.department}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

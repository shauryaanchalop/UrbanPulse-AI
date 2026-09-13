import React, { useState, useEffect } from 'react';
import { ShieldAlert, PhoneCall, MapPin, Radio, AlertTriangle, CheckCircle2, UserCheck, Eye, Activity } from 'lucide-react';
import type { DistressAlert, Bus, SafetyIncident } from '../types';
import { api } from '../services/api';

interface WomensSafetyViewProps {
  buses?: Bus[];
  incidents?: SafetyIncident[];
}

const DEMO_DISTRESS_ALERTS: DistressAlert[] = [
  {
    id: 'ALT-001',
    alertCode: 'DIS-8801',
    citizenName: 'Priya Verma',
    category: 'PERSONAL SAFETY',
    latitude: 18.5362,
    longitude: 73.8301,
    address: 'Pune University Circle North Underpass Gate',
    timestamp: '2026-09-14 10:14:00',
    status: 'RECEIVED',
    mediaUrl: '/evidence/incident_frame_1.jpg',
    nearestBusId: 'BUS-004',
    nearestResponseUnit: 'PCR Patrol Unit #4',
    notes: 'SOS panic button activated via mobile citizen app'
  },
  {
    id: 'ALT-002',
    alertCode: 'DIS-8802',
    citizenName: 'Sneha Kulkarni',
    category: 'HARASSMENT',
    latitude: 18.5039,
    longitude: 73.8288,
    address: 'Karve Road Deccan Gymkhana Bus Stop',
    timestamp: '2026-09-14 09:50:00',
    status: 'ACKNOWLEDGED',
    mediaUrl: '/evidence/incident_frame_2.jpg',
    nearestBusId: 'BUS-015',
    nearestResponseUnit: 'PCR Patrol Unit #12',
    notes: 'Suspicious vehicle tailgating passenger at bus stop'
  },
  {
    id: 'ALT-003',
    alertCode: 'DIS-8803',
    citizenName: 'Ananya Sharma',
    category: 'PERSONAL SAFETY',
    latitude: 18.5590,
    longitude: 73.7868,
    address: 'Baner High Street Dark Passage Junction',
    timestamp: '2026-09-14 09:12:00',
    status: 'RESPONDING',
    mediaUrl: '/evidence/incident_frame_3.jpg',
    nearestBusId: 'BUS-072',
    nearestResponseUnit: 'PCR Patrol Unit #8',
    notes: 'Streetlight failure and unmonitored crowd gathering'
  }
];

export function WomensSafetyView({ buses = [], incidents = [] }: WomensSafetyViewProps) {
  const [alerts, setAlerts] = useState<DistressAlert[]>(DEMO_DISTRESS_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<DistressAlert | null>(DEMO_DISTRESS_ALERTS[0]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.getDistressAlerts();
      if (data && data.length > 0) {
        setAlerts(data);
        setSelectedAlert(data[0]);
      }
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
        longitude: 73.8301,
        status: 'RECEIVED'
      });
      loadAlerts();
    } catch (err) {
      console.error('Failed to trigger emergency', err);
    }
  };

  const handleUpdateStatus = async (newStatus: 'RECEIVED' | 'ACTIVE' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESPONDING' | 'RESOLVED') => {
    if (!selectedAlert) return;
    try {
      setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, status: newStatus } : a));
      setSelectedAlert(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Failed to update alert status', err);
    }
  };

  return (
    <div className="h-full w-full bg-theme-bg text-theme-primary flex flex-col p-6 overflow-y-auto font-sans space-y-6 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-theme-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-brand" />
            <h1 className="text-xl font-bold tracking-tight text-theme-primary font-mono">WOMEN'S SAFETY & DISTRESS PORTAL</h1>
          </div>
          <p className="text-xs text-theme-secondary font-mono mt-1">
            Real-time distress alert aggregation, mobile bus camera visual tracking, and response unit dispatch.
          </p>
        </div>
        <button
          onClick={handleCreateEmergency}
          className="px-4 py-2 bg-brand hover:bg-brand-hover text-white font-bold font-mono text-xs rounded-sm shadow-md flex items-center space-x-2 transition-colors animate-pulse uppercase tracking-wider"
        >
          <Radio className="w-4 h-4" />
          <span>TRIGGER DEMO DISTRESS ALERT</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alerts Feed (1 col) */}
        <div className="space-y-3 font-mono">
          <h3 className="text-xs font-bold text-theme-muted uppercase tracking-wider">
            ACTIVE DISTRESS ALERTS ({alerts.length})
          </h3>
          {alerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => setSelectedAlert(alt)}
              className={`p-4 rounded-sm border cursor-pointer transition-all space-y-2 text-xs ${
                selectedAlert?.id === alt.id
                  ? 'bg-brand/10 border-brand'
                  : 'bg-theme-surface border-theme-border hover:bg-theme-elevated'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-theme-primary">#{alt.alertCode}</h4>
                  <p className="text-[11px] text-theme-muted">{alt.category} • {alt.timestamp}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${
                  alt.status === 'RECEIVED' ? 'bg-red-500/20 text-red-500 animate-pulse' :
                  alt.status === 'ACKNOWLEDGED' ? 'bg-amber-500/20 text-amber-500' :
                  alt.status === 'RESPONDING' ? 'bg-sky-500/20 text-sky-500' : 'bg-emerald-500/20 text-emerald-500'
                }`}>
                  {alt.status}
                </span>
              </div>
              <p className="text-theme-secondary font-sans">{alt.address}</p>
              <div className="pt-2 border-t border-theme-border flex justify-between items-center text-[10px] text-theme-muted">
                <span>Bus Sensor: <strong className="text-theme-primary">{alt.nearestBusId || 'BUS-004'}</strong></span>
                <span>Response: <strong className="text-theme-primary">{alt.nearestResponseUnit || 'PCR #12'}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Alert Detail Workspace (2 cols) */}
        {selectedAlert && (
          <div className="lg:col-span-2 space-y-4 font-mono text-xs">
            <div className="bg-theme-surface border border-theme-border rounded-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-theme-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-theme-primary">Emergency Incident #{selectedAlert.alertCode}</h3>
                  <p className="text-theme-muted text-[11px]">{selectedAlert.address} ({selectedAlert.latitude}, {selectedAlert.longitude})</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleUpdateStatus('ACKNOWLEDGED')}
                    className="px-3 py-1.5 bg-theme-panel hover:bg-theme-elevated border border-theme-border text-theme-primary font-bold rounded-sm text-xs"
                  >
                    ACKNOWLEDGE
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('RESPONDING')}
                    className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-sm text-xs shadow-md"
                  >
                    DISPATCH PCR UNIT
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-sm text-xs"
                  >
                    RESOLVE
                  </button>
                </div>
              </div>

              {/* Visual Sensor Integration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-theme-muted text-[11px] uppercase">
                    Nearest Mobile Visual Source (BUS-004)
                  </h4>
                  <div className="aspect-video bg-black rounded-sm overflow-hidden relative border border-theme-border">
                    <img src={selectedAlert.mediaUrl || '/evidence/incident_frame_1.jpg'} alt="Camera feed" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/80 text-emerald-400 px-2 py-0.5 font-mono text-[10px]">
                      LIVE OVERWATCH
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-theme-muted text-[11px] uppercase">
                    Response Unit Status & Telemetry
                  </h4>
                  <div className="bg-theme-panel p-3.5 rounded-sm border border-theme-border space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Assigned PCR Van:</span>
                      <span className="font-bold text-theme-primary">{selectedAlert.nearestResponseUnit || 'PCR Unit #12'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">ETA to Coordinates:</span>
                      <span className="font-bold text-amber-500">3 mins (1.2 km)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Transit Bus Sensor:</span>
                      <span className="font-bold text-emerald-500">{selectedAlert.nearestBusId || 'BUS-004'} In Range</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Status Progress:</span>
                      <span className="font-bold text-brand uppercase">{selectedAlert.status}</span>
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

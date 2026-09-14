import React, { useState } from 'react';
import type { RoadDefect, SafetyIncident, Bus } from '../types';
import { 
  X, Wrench, ShieldAlert, Bus as BusIcon, Camera, 
  MapPin, Clock, CheckCheck, Cpu, ArrowRight, ShieldCheck, Activity, CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';

interface InspectorDrawerProps {
  defect: RoadDefect | null;
  incident: SafetyIncident | null;
  bus: Bus | null;
  onClose: () => void;
  onTicketCreated?: () => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  defect,
  incident,
  bus,
  onClose,
  onTicketCreated
}) => {
  const [activeCam, setActiveCam] = useState<'front' | 'rear' | 'left' | 'right' | 'cabin'>('front');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!defect && !incident && !bus) return null;

  const handleCreateTicket = async () => {
    if (!defect) return;
    setIsCreatingTicket(true);
    try {
      await api.createMaintenanceTicket({
        defectId: defect.id,
        defectType: defect.defectType,
        severity: defect.severity,
        latitude: defect.latitude,
        longitude: defect.longitude,
        address: defect.address,
        confirmingBusesCount: defect.timesConfirmed,
        estimatedCostInr: defect.severity === 'Critical' ? 65000 : 35000
      });
      setActionSuccessMsg('WORK ORDER DISPATCHED TO WARD CIVIL CELL');
      if (onTicketCreated) onTicketCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleAcknowledge = () => {
    setActionSuccessMsg('EVENT ACKNOWLEDGED BY ICCC OPERATOR');
  };

  const handleEscalate = () => {
    setActionSuccessMsg('PRIORITY INCIDENT ESCALATED TO MUNICIPAL EMERGENCY DESK');
  };

  return (
    <div className="w-96 lg:w-[440px] bg-theme-surface border-l border-theme-border flex flex-col h-full z-20 shrink-0 select-none font-sans text-xs shadow-2xl transition-colors">
      {/* Drawer Title Bar */}
      <div className="h-9 px-3 border-b border-theme-border bg-theme-panel flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
          <span className="font-bold text-[11px] uppercase tracking-wider text-theme-primary">
            {bus ? `BUS TELEMETRY: ${bus.id}` : (defect ? `ROAD HAZARD: ${defect.id}` : `INCIDENT: ${incident?.id}`)}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-theme-muted hover:text-theme-primary transition-colors rounded-sm"
          title="Close Inspector (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drawer Body: 5-Second Scan Layout */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {actionSuccessMsg && (
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center justify-between rounded-sm">
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {actionSuccessMsg}
            </span>
            <button onClick={() => setActionSuccessMsg(null)} className="opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* 1. ROAD HAZARD INSPECTION (<5-Second Layout) */}
        {defect && (
          <div className="flex flex-col gap-3">
            {/* Header / Type / Priority */}
            <div className="bg-theme-panel border border-theme-border p-3 rounded-sm flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-theme-muted uppercase tracking-wider">ROAD HAZARD</div>
                  <div className="font-bold text-sm text-theme-primary">{defect.defectType.toUpperCase()}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-none ${
                  defect.severity === 'Critical' 
                    ? 'text-brand border-brand/40 bg-brand/10' 
                    : 'text-amber-500 border-amber-500/40 bg-amber-500/10'
                }`}>
                  {defect.severity.toUpperCase()} PRIORITY
                </span>
              </div>

              <div className="pt-2 border-t border-theme-border mt-2 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-theme-muted block">LOCATION</span>
                  <span className="text-theme-primary font-semibold truncate block">{defect.address}</span>
                </div>
                <div>
                  <span className="text-theme-muted block">DETECTED</span>
                  <span className="text-theme-primary font-semibold block">{defect.lastSeen}</span>
                </div>
                <div>
                  <span className="text-theme-muted block">SOURCE BUS</span>
                  <span className="text-brand font-bold block">{defect.detectedByBusId}</span>
                </div>
                <div>
                  <span className="text-theme-muted block">CONFIDENCE</span>
                  <span className="text-emerald-500 font-bold block">{(defect.confidence * 100).toFixed(0)}% ({defect.timesConfirmed} Sources)</span>
                </div>
              </div>

              <div className="pt-1.5 flex items-center justify-between text-[10px] border-t border-theme-border mt-1">
                <span className="text-theme-muted">VERIFICATION STATUS:</span>
                <span className={`font-bold ${defect.status === 'Cross-verified' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {defect.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Evidence Optical Crop */}
            <div className="border border-theme-border bg-theme-panel flex flex-col rounded-sm overflow-hidden">
              <div className="p-1.5 border-b border-theme-border flex items-center justify-between text-[10px] text-theme-muted">
                <span>EVIDENCE CROP (FORWARD CAMERA)</span>
                <span className="text-emerald-500 font-bold">DIM: {defect.dimensionsEstimated || '45cm x 30cm, 8cm'}</span>
              </div>
              <div className="h-44 w-full bg-black relative flex items-center justify-center overflow-hidden">
                <img 
                  src={defect.evidenceImageUrl || '/evidence/road_defect_1.jpg'} 
                  alt="Defect Evidence"
                  className="w-full h-full object-cover" 
                />
                {/* Restrained single bounding box */}
                <div className="absolute top-[40%] left-[28%] w-[28%] h-[32%] border border-amber-400 pointer-events-none">
                  <span className="bg-amber-500 text-black text-[8px] font-bold px-1 absolute -top-3.5 left-0">
                    pothole 0.94
                  </span>
                </div>
              </div>
            </div>

            {/* Contextual Actions (Clean, Obvious) */}
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={handleCreateTicket}
                disabled={isCreatingTicket || defect.status === 'Ticket Created'}
                className="w-full py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-xs rounded-sm transition-colors shadow-sm"
              >
                {defect.status === 'Ticket Created' ? '✓ WORK ORDER ACTIVE' : 'CREATE WORK ORDER'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAcknowledge}
                  className="py-1.5 bg-theme-panel hover:bg-theme-elevated text-theme-primary border border-theme-border text-xs rounded-sm transition-colors"
                >
                  ACKNOWLEDGE
                </button>
                <button
                  onClick={handleEscalate}
                  className="py-1.5 bg-theme-panel hover:bg-theme-elevated text-brand border border-theme-border text-xs rounded-sm transition-colors"
                >
                  ESCALATE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. SAFETY INCIDENT INSPECTION */}
        {incident && (
          <div className="flex flex-col gap-3">
            <div className="bg-theme-panel border border-theme-border p-3 rounded-sm flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-theme-muted uppercase tracking-wider">SAFETY EVENT</div>
                  <div className="font-bold text-sm text-theme-primary">{incident.incidentType.toUpperCase()}</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold border rounded-none text-brand border-brand/40 bg-brand/10">
                  {incident.severity.toUpperCase()}
                </span>
              </div>

              <div className="pt-2 border-t border-theme-border mt-2 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-theme-muted block">LOCATION</span>
                  <span className="text-theme-primary font-semibold truncate block">{incident.address}</span>
                </div>
                <div>
                  <span className="text-theme-muted block">DETECTED TIME</span>
                  <span className="text-theme-primary font-semibold block">{incident.timestamp}</span>
                </div>
                <div>
                  <span className="text-theme-muted block">OBSERVING SENSOR</span>
                  <span className="text-brand font-bold block">{incident.busId}</span>
                </div>
                <div>
                  <span className="text-theme-muted block">TRACKED ENTITY</span>
                  <span className="text-theme-primary font-bold block">{incident.trackedObject}</span>
                </div>
              </div>

              {incident.anprInfo && (
                <div className="pt-1.5 border-t border-theme-border mt-1 flex justify-between items-center text-[10px]">
                  <span className="text-theme-muted">LICENSE OCR:</span>
                  <span className="font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5">
                    {incident.anprInfo.plateNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Evidence clip */}
            <div className="border border-theme-border bg-theme-panel flex flex-col rounded-sm overflow-hidden">
              <div className="p-1.5 border-b border-theme-border text-[10px] text-theme-muted flex justify-between">
                <span>EVIDENCE FRAME (EDGE SENSOR)</span>
                <span className="text-emerald-500 font-bold">CONF: {(incident.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="h-44 w-full bg-black relative flex items-center justify-center overflow-hidden">
                <img 
                  src={incident.evidenceImageUrl || '/evidence/incident_frame_1.jpg'} 
                  alt="Incident Evidence" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-[35%] left-[22%] w-[24%] h-[40%] border border-red-500 pointer-events-none">
                  <span className="bg-red-600 text-white text-[8px] font-bold px-1 absolute -top-3.5 left-0">
                    hazard 0.96
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={handleEscalate}
                className="w-full py-2 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-sm transition-colors"
              >
                ESCALATE TO TRAFFIC POLICE CAD
              </button>
              <button
                onClick={handleAcknowledge}
                className="w-full py-1.5 bg-theme-panel hover:bg-theme-elevated text-theme-primary border border-theme-border text-xs rounded-sm transition-colors"
              >
                ACKNOWLEDGE & LOG INCIDENT
              </button>
            </div>
          </div>
        )}

        {/* 3. BUS DETAIL & 5-CAMERA FEED (Requirements 11 & 12) */}
        {bus && (
          <div className="flex flex-col gap-3">
            <div className="bg-theme-panel border border-theme-border p-3 rounded-sm flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-theme-muted uppercase tracking-wider">FLEET SENSOR NODE</div>
                  <div className="font-bold text-base text-theme-primary">{bus.id} • ROUTE {bus.routeId}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-none ${
                  bus.status === 'Active' 
                    ? 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10' 
                    : 'text-amber-500 border-amber-500/40 bg-amber-500/10'
                }`}>
                  {bus.status.toUpperCase()}
                </span>
              </div>
              <div className="text-[11px] text-theme-secondary mt-1">{bus.routeName}</div>
            </div>

            {/* 5-Camera Angle Selector (FRONT, REAR, LEFT, RIGHT, CABIN) */}
            <div className="grid grid-cols-5 gap-1">
              {(['front', 'rear', 'left', 'right', 'cabin'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCam(c)}
                  className={`py-1 text-[10px] font-mono uppercase border rounded-sm transition-colors ${
                    activeCam === c 
                      ? 'bg-brand text-white border-brand font-bold' 
                      : 'bg-theme-panel border-theme-border text-theme-muted hover:text-theme-primary hover:bg-theme-elevated'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Live Camera View with restrained CV overlays */}
            <div className="border border-theme-border bg-theme-panel flex flex-col rounded-sm overflow-hidden">
              <div className="p-1.5 border-b border-theme-border flex items-center justify-between text-[10px] text-theme-muted">
                <span>CAM 01: {activeCam.toUpperCase()} (1080p @ 30 FPS)</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
                </span>
              </div>
              <div className="h-44 w-full bg-black relative overflow-hidden">
                <img 
                  src={`/evidence/road_defect_${activeCam === 'front' ? '1' : (activeCam === 'rear' ? '3' : '5')}.jpg`} 
                  alt="Camera Stream"
                  className="w-full h-full object-cover" 
                />
                {/* Restrained realistic overlays */}
                <div className="absolute top-[28%] left-[22%] w-[24%] h-[34%] border border-emerald-400 pointer-events-none">
                  <span className="bg-emerald-500 text-black text-[8px] font-bold px-1 absolute -top-3.5 left-0">
                    PERSON 0.94
                  </span>
                </div>
                <div className="absolute top-[52%] right-[24%] w-[22%] h-[26%] border border-amber-400 pointer-events-none">
                  <span className="bg-amber-500 text-black text-[8px] font-bold px-1 absolute -top-3.5 left-0">
                    CAR 0.89
                  </span>
                </div>
              </div>
            </div>

            {/* Essential Telemetry Grid (Aligned) */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 bg-theme-panel border border-theme-border rounded-sm">
                <span className="text-theme-muted block">SPEED</span>
                <span className="font-bold text-theme-primary text-xs">{bus.speed} km/h</span>
              </div>
              <div className="p-2 bg-theme-panel border border-theme-border rounded-sm">
                <span className="text-theme-muted block">EDGE INFERENCE</span>
                <span className="font-bold text-emerald-500 text-xs">{bus.edgeFps} FPS (INT8)</span>
              </div>
              <div className="p-2 bg-theme-panel border border-theme-border rounded-sm">
                <span className="text-theme-muted block">CAMERAS</span>
                <span className="font-bold text-emerald-500 text-xs">4/4 ONLINE</span>
              </div>
              <div className="p-2 bg-theme-panel border border-theme-border rounded-sm">
                <span className="text-theme-muted block">GPS ACCURACY</span>
                <span className="font-bold text-theme-primary text-xs">0.4m RTK LOCKED</span>
              </div>
              <div className="p-2 bg-theme-panel border border-theme-border rounded-sm">
                <span className="text-theme-muted block">GPU LOAD</span>
                <span className="font-bold text-theme-secondary text-xs">{bus.gpuUtilization}% (48°C)</span>
              </div>
              <div className="p-2 bg-theme-panel border border-theme-border rounded-sm">
                <span className="text-theme-muted block">NETWORK LINK</span>
                <span className="font-bold text-emerald-500 text-xs">5G MUNICIPAL VPN</span>
              </div>
            </div>

            <div className="p-2 bg-theme-panel border border-theme-border rounded-sm text-[10px] text-theme-muted">
              <span>LAST TRANSMISSION: </span>
              <span className="text-theme-primary">{bus.lastEvent || 'Routine corridor patrol'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

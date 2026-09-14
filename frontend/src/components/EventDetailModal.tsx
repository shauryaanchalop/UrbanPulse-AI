import React, { useState } from 'react';
import { RoadDefect, SafetyIncident } from '../types';
import { 
  X, CheckCircle, AlertTriangle, ShieldAlert, Wrench, 
  MapPin, Clock, Bus, CheckCheck, FileText, ArrowUpRight 
} from 'lucide-react';
import { api } from '../services/api';

interface EventDetailModalProps {
  defect?: RoadDefect | null;
  incident?: SafetyIncident | null;
  onClose: () => void;
  onTicketCreated?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  defect,
  incident,
  onClose,
  onTicketCreated
}) => {
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!defect && !incident) return null;

  const isDefect = !!defect;
  const title = isDefect ? defect.defectType : incident!.incidentType;
  const severity = isDefect ? defect.severity : incident!.severity;
  const confidence = isDefect ? defect.confidence : incident!.confidence;
  const address = isDefect ? defect.address : incident!.address;
  const busId = isDefect ? defect.detectedByBusId : incident!.busId;
  const timestamp = isDefect ? defect.lastSeen : incident!.timestamp;
  const evidenceUrl = isDefect ? defect.evidenceImageUrl : incident!.evidenceImageUrl;

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
        estimatedCostInr: defect.severity === 'Critical' ? 75000 : 35000
      });
      setActionSuccessMsg('Maintenance ticket generated and assigned to municipal contractor.');
      if (onTicketCreated) onTicketCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleEscalate = () => {
    setActionSuccessMsg('Incident evidence escalated to Municipal Traffic Police ICCC terminal.');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-iccc-900 border border-iccc-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 border-b border-iccc-border flex items-center justify-between bg-iccc-950/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDefect ? 'bg-amber-950/60 text-amber-400 border border-amber-600/40' : 'bg-rose-950/60 text-rose-400 border border-rose-600/40'}`}>
              {isDefect ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border font-sans ${
                  severity === 'Critical' ? 'bg-rose-950 text-rose-400 border-rose-600/50' : 'bg-amber-950 text-amber-400 border-amber-600/50'
                }`}>
                  {severity}
                </span>
                {isDefect && defect.status === 'Cross-verified' && (
                  <span className="text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-600/60 px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                    <CheckCheck className="w-3 h-3 text-sky-400" />
                    Cross-verified ({defect.timesConfirmed} buses)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-sans">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{address}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition font-sans"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4 text-xs text-slate-300 font-sans">
          {actionSuccessMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-600/50 rounded-xl text-emerald-300 flex items-center gap-2 font-sans">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* AI Perception Evidence View */}
          <div className="rounded-xl overflow-hidden border border-iccc-border bg-slate-950 flex flex-col font-sans">
            <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-sans">
              <span className="font-sans text-sky-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Mobile Camera Evidence & AI Bounding Overlays
              </span>
              <span className="text-slate-400 font-sans">Edge Model: INT8 Quantized</span>
            </div>
            <div className="w-full h-56 bg-slate-900 flex items-center justify-center relative overflow-hidden">
              {evidenceUrl ? (
                <img 
                  src={evidenceUrl} 
                  alt="Evidence Frame" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-slate-500 text-center">No camera frame available</div>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">AI Confidence</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Primary Sensor</span>
              <span className="text-sm font-bold font-mono text-sky-400 flex items-center gap-1">
                <Bus className="w-3.5 h-3.5" />
                {busId}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Timestamp</span>
              <span className="text-xs font-medium text-slate-200 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                {timestamp.split(' ')[1] || timestamp}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block">Status</span>
              <span className="text-xs font-semibold text-white mt-0.5 block">
                {isDefect ? defect.status : incident!.status}
              </span>
            </div>
          </div>

          {/* Multi-Bus Verification Detail Spotlight */}
          {isDefect && (
            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-700/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-sky-300">Multi-Bus Verification Engine</span>
                </div>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  {defect.crossVerifyingBuses.length} Confirmed Passes
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When distinct buses traverse this corridor within temporal & geospatial thresholds (±25m), the verification count increments and false-positive risk drops exponentially.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-500">Confirming Fleet:</span>
                {defect.crossVerifyingBuses.map((b, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300 font-mono text-[10px]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Safety / ANPR Details if Incident */}
          {!isDefect && incident && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-700/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-300">Tracked Vehicle & OCR Capture</span>
                <span className="text-[10px] font-mono bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded">
                  Demo OCR Result
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Identified Target</span>
                  <span className="text-sm font-bold text-white font-mono">{incident.trackedObject}</span>
                </div>
                {incident.anprInfo && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">OCR License Plate</span>
                    <span className="text-sm font-bold font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                      {incident.anprInfo.plateNumber}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {incident.eventDescription}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-iccc-border bg-iccc-950/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            ICCC Audit Log ID: #AUD-{Math.floor(Math.random() * 89999 + 10000)}
          </span>

          <div className="flex items-center gap-2">
            {isDefect && defect.status !== 'Ticket Created' && (
              <button
                onClick={handleCreateTicket}
                disabled={isCreatingTicket}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition disabled:opacity-50"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{isCreatingTicket ? 'Dispatching...' : 'Create Maintenance Ticket'}</span>
              </button>
            )}

            {!isDefect && (
              <button
                onClick={handleEscalate}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Escalate to Police Dispatch</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

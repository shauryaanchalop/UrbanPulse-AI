import React, { useState } from 'react';
import type { SafetyIncident, ANPRDetection } from '../types';
import { ShieldAlert, ExternalLink } from 'lucide-react';

interface SafetyEnforcementViewProps {
  incidents: SafetyIncident[];
  anprDetections: ANPRDetection[];
  onSelectIncident: (incident: SafetyIncident) => void;
}

export const SafetyEnforcementView: React.FC<SafetyEnforcementViewProps> = ({
  incidents,
  anprDetections,
  onSelectIncident
}) => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'anpr'>('incidents');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredIncidents = incidents.filter(i => {
    return severityFilter === 'ALL' || i.severity === severityFilter;
  });

  const criticalCount = incidents.filter(i => i.severity === 'Critical').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-hidden font-mono select-none text-xs">
      {/* Top Header & Sub-Nav */}
      <div className="h-10 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-theme-primary">TRANSIT SAFETY & ANPR ENFORCEMENT</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-2.5 py-0.5 text-[11px] border rounded-none ${
                activeTab === 'incidents' ? 'bg-graphite-700 text-theme-primary font-bold border-graphite-600' : 'bg-graphite-950 text-graphite-400 border-graphite-700'
              }`}
            >
              SAFETY INCIDENTS ({incidents.length})
            </button>
            <button
              onClick={() => setActiveTab('anpr')}
              className={`px-2.5 py-0.5 text-[11px] border rounded-none ${
                activeTab === 'anpr' ? 'bg-graphite-700 text-theme-primary font-bold border-graphite-600' : 'bg-graphite-950 text-graphite-400 border-graphite-700'
              }`}
            >
              ANPR OCR REGISTRY ({anprDetections.length})
            </button>
          </div>
        </div>

        {activeTab === 'incidents' && (
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-graphite-400">SEVERITY:</span>
            {['ALL', 'Critical', 'High', 'Medium'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-1.5 py-0.5 border rounded-none ${
                  severityFilter === sev ? 'bg-red-500/20 border-red-700 text-red-500 font-bold' : 'border-graphite-700 text-graphite-400'
                }`}
              >
                {sev.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'incidents' ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-graphite-900 text-graphite-400 text-[10px] uppercase border-b border-graphite-700 sticky top-0">
              <tr>
                <th className="py-2 px-3">TIMESTAMP</th>
                <th className="py-2 px-3">INCIDENT TYPE</th>
                <th className="py-2 px-3">SEVERITY</th>
                <th className="py-2 px-3">SOURCE BUS</th>
                <th className="py-2 px-3">LOCATION</th>
                <th className="py-2 px-3">TRACKED OBJECT</th>
                <th className="py-2 px-3">CONFIDENCE</th>
                <th className="py-2 px-3">POLICE CAD STATUS</th>
                <th className="py-2 px-3 text-right">EVIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700 text-theme-secondary text-[11px]">
              {filteredIncidents.map(inc => {
                const isCritical = inc.severity === 'Critical';

                return (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="hover:bg-graphite-850 cursor-pointer transition"
                  >
                    <td className="py-2 px-3 text-graphite-500 text-[10px] font-mono">{inc.timestamp.split(' ')[1] || inc.timestamp}</td>
                    <td className="py-2 px-3 font-semibold text-theme-primary">{inc.incidentType}</td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0 text-[9px] font-bold border rounded-none ${
                        isCritical ? 'text-red-500 border-red-800/40 bg-red-500/10' : 'text-amber-500 border-amber-800/40 bg-amber-500/10'
                      }`}>
                        {inc.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-theme-primary font-bold font-mono">{inc.busId}</td>
                    <td className="py-2 px-3 text-theme-secondary truncate max-w-xs">{inc.address}</td>
                    <td className="py-2 px-3 text-graphite-400">{inc.trackedObject}</td>
                    <td className="py-2 px-3 text-emerald-500 font-bold font-mono">{(inc.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2 px-3">
                      <span className="text-theme-secondary text-[10px]">{inc.status.toUpperCase()}</span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button className="text-[10px] text-brand hover:text-theme-primary hover:underline">
                        INSPECT ▶
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-graphite-900 text-graphite-400 text-[10px] uppercase border-b border-graphite-700 sticky top-0">
              <tr>
                <th className="py-2 px-3">REGISTRATION PLATE (OCR)</th>
                <th className="py-2 px-3">VEHICLE CLASSIFICATION</th>
                <th className="py-2 px-3">OCR CONFIDENCE</th>
                <th className="py-2 px-3">SPEED RECORDED</th>
                <th className="py-2 px-3">TIME</th>
                <th className="py-2 px-3">OBSERVING SENSOR</th>
                <th className="py-2 px-3">VIOLATION CODE</th>
                <th className="py-2 px-3 text-right">PLATE EVIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700 text-theme-secondary text-[11px]">
              {anprDetections.map(anpr => (
                <tr key={anpr.id} className="hover:bg-graphite-850 transition">
                  <td className="py-2 px-3 font-bold text-amber-500 font-mono">
                    <span className="bg-graphite-950 border border-graphite-700 px-1.5 py-0.5 rounded-none">
                      {anpr.plateNumber}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-theme-primary">{anpr.vehicleType}</td>
                  <td className="py-2 px-3 text-emerald-500 font-bold font-mono">{(anpr.confidence * 100).toFixed(1)}%</td>
                  <td className="py-2 px-3 text-theme-primary font-mono">{anpr.speedEstimated} km/h</td>
                  <td className="py-2 px-3 text-graphite-500 text-[10px] font-mono">{anpr.timestamp.split(' ')[1] || anpr.timestamp}</td>
                  <td className="py-2 px-3 text-theme-primary font-bold font-mono">{anpr.busId}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] ${anpr.flaggedReason?.includes('Speeding') || anpr.flaggedReason?.includes('Violation') ? 'text-brand font-bold' : 'text-graphite-500'}`}>
                      {anpr.flaggedReason || 'ROUTINE CORRIDOR SCAN'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <a
                      href={anpr.demoOcrCropUrl || '/evidence/anpr_crop_1.jpg'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-theme-secondary hover:text-theme-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>CROP</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

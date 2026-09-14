import React, { useState } from 'react';
import type { Bus, RoadDefect, TrafficEvent, SafetyIncident, MaintenanceTicket, Route, OverviewKPIs } from '../types';
import { KPITelemetryStrip } from '../components/KPITelemetryStrip';
import { MapContainer } from '../components/MapContainer';
import { AlertCircle, CheckCircle2, ChevronRight, ArrowUpRight, Flame, ShieldAlert } from 'lucide-react';

interface CommandCenterViewProps {
  kpis: OverviewKPIs;
  buses: Bus[];
  defects: RoadDefect[];
  trafficEvents: TrafficEvent[];
  incidents: SafetyIncident[];
  tickets: MaintenanceTicket[];
  routes: Route[];
  recentEvents: Array<{ id: string; time: string; text: string; type: string }>;
  selectedCoordinates?: { lat: number; lng: number } | null;
  selectedId?: string | null;
  onSelectDefect: (defect: RoadDefect) => void;
  onSelectBus: (bus: Bus) => void;
  onSelectIncident: (incident: SafetyIncident) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  kpis,
  buses,
  defects,
  trafficEvents,
  incidents,
  tickets,
  routes,
  selectedCoordinates,
  selectedId,
  onSelectDefect,
  onSelectBus,
  onSelectIncident
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'VERIFIED'>('ALL');

  // Unified Priority Queue
  const priorityItems = [
    ...incidents.map(i => ({
      id: i.id,
      time: i.timestamp.split(' ')[1] || i.timestamp,
      type: i.incidentType,
      category: 'SAFETY HAZARD',
      severity: i.severity,
      busId: i.busId,
      location: i.address,
      confidence: i.confidence,
      entity: i,
      kind: 'incident' as const
    })),
    ...defects.filter(d => d.severity === 'Critical' || d.severity === 'High').map(d => ({
      id: d.id,
      time: d.lastSeen.split(' ')[1] || d.lastSeen,
      type: d.defectType,
      category: 'ROAD DEFECT',
      severity: d.severity,
      busId: d.detectedByBusId,
      location: d.address,
      confidence: d.confidence,
      entity: d,
      kind: 'defect' as const
    }))
  ];

  const filteredQueue = priorityItems.filter(item => {
    if (filterMode === 'CRITICAL') return item.severity === 'Critical';
    if (filterMode === 'VERIFIED') return (item.entity as any).status === 'Cross-verified';
    return true;
  }).slice(0, 12);

  // Scannable Event Stream (Combines defects, traffic, incidents)
  const eventStream = [
    ...defects.map(d => ({
      id: d.id,
      time: d.lastSeen.split(' ')[1] || d.lastSeen,
      type: d.defectType.toUpperCase(),
      location: d.address,
      source: d.detectedByBusId,
      severity: d.severity,
      status: d.status,
      entity: d,
      kind: 'defect' as const
    })),
    ...trafficEvents.map(t => ({
      id: t.id,
      time: '10:14:10',
      type: 'TRAFFIC CHOKEPOINT',
      location: t.corridorName,
      source: t.observedByBusId,
      severity: t.congestionLevel === 'Standstill' ? 'Critical' : (t.congestionLevel === 'Heavy' ? 'High' : 'Medium'),
      status: `${t.averageSpeedKmH} km/h (+${t.delayMinutes}m)`,
      entity: t,
      kind: 'traffic' as const
    })),
    ...incidents.map(i => ({
      id: i.id,
      time: i.timestamp.split(' ')[1] || i.timestamp,
      type: i.incidentType.toUpperCase(),
      location: i.address,
      source: i.busId,
      severity: i.severity,
      status: i.status,
      entity: i,
      kind: 'incident' as const
    }))
  ].slice(0, 10);

  // Needs Attention Counts
  const criticalCount = incidents.filter(i => i.severity === 'Critical').length + defects.filter(d => d.severity === 'Critical').length;
  const unverifiedCount = defects.filter(d => d.status !== 'Cross-verified').length;
  const offlineBusesCount = buses.filter(b => b.status === 'Idle' || b.status === 'Maintenance').length;
  const openTicketsCount = tickets.filter(t => t.status === 'Open').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-theme-bg select-none">
      {/* 1. Compact Operational Summary Strip */}
      <KPITelemetryStrip 
        kpis={kpis} 
        onFilterCritical={() => setFilterMode(filterMode === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
        onFilterVerified={() => setFilterMode(filterMode === 'VERIFIED' ? 'ALL' : 'VERIFIED')}
      />

      {/* 2. "WHAT NEEDS MY ATTENTION?" Actionable Priority Ribbon */}
      <div className="h-8 bg-theme-surface border-b border-theme-border px-3 flex items-center justify-between text-xs font-sans shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
          </span>
          <span className="font-bold text-[10px] text-brand tracking-wider uppercase">
            NEEDS ATTENTION:
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => {
                setFilterMode('CRITICAL');
                const firstCrit = priorityItems.find(p => p.severity === 'Critical');
                if (firstCrit) {
                  if (firstCrit.kind === 'incident') onSelectIncident(firstCrit.entity as SafetyIncident);
                  else onSelectDefect(firstCrit.entity as RoadDefect);
                }
              }}
              className="text-brand hover:underline font-bold"
            >
              {criticalCount.toString().padStart(2, '0')} Critical Events
            </button>
            <span className="text-theme-border font-light">•</span>
            <span className="text-amber-500 font-semibold">
              {unverifiedCount} Unverified Road Hazards
            </span>
            <span className="text-theme-border font-light">•</span>
            <span className="text-theme-secondary">
              {offlineBusesCount > 0 ? `${offlineBusesCount} Offline/Warning Bus` : '0 Offline Buses'}
            </span>
            <span className="text-theme-border font-light">•</span>
            <span className="text-theme-primary">
              {openTicketsCount} Pending Work Orders
            </span>
          </div>
        </div>

        {filterMode !== 'ALL' && (
          <button
            onClick={() => setFilterMode('ALL')}
            className="text-[10px] text-theme-muted hover:text-theme-primary underline"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      {/* 3. Main Workspace: 70% Map + 30% Priority Queue */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden border-b border-theme-border">
        {/* Left: GIS Map */}
        <div className="flex-1 h-[58%] lg:h-full relative overflow-hidden">
          <MapContainer
            buses={buses}
            defects={defects}
            trafficEvents={trafficEvents}
            incidents={incidents}
            tickets={tickets}
            routes={routes}
            selectedItemCoordinates={selectedCoordinates}
            selectedId={selectedId}
            onSelectDefect={onSelectDefect}
            onSelectBus={onSelectBus}
            onSelectIncident={onSelectIncident}
          />
        </div>

        {/* Right: Priority Events Queue (30% width) */}
        <div className="w-full lg:w-96 bg-theme-surface border-t lg:border-t-0 lg:border-l border-theme-border flex flex-col h-[42%] lg:h-full shrink-0 font-sans">
          <div className="h-8 px-3 border-b border-theme-border bg-theme-panel flex items-center justify-between shrink-0 font-sans">
            <span className="font-bold text-[11px] uppercase tracking-wider text-theme-primary font-sans">
              PRIORITY QUEUE ({filteredQueue.length})
            </span>
            <span className="text-[10px] text-brand font-bold font-sans">
              {filterMode === 'CRITICAL' ? 'FILTER: CRITICAL ONLY' : 'SORTED BY SEVERITY'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-theme-border text-[11px] font-sans">
            {filteredQueue.map(item => {
              const isCrit = item.severity === 'Critical';
              const isSelected = selectedId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.kind === 'incident') onSelectIncident(item.entity as SafetyIncident);
                    else onSelectDefect(item.entity as RoadDefect);
                  }}
                  className={`p-2.5 cursor-pointer transition-colors flex flex-col gap-1 font-sans ${
                    isSelected ? 'bg-brand/10 border-l-2 border-brand' : 'hover:bg-theme-elevated text-theme-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isCrit ? 'bg-brand' : 'bg-amber-500'}`}></span>
                      <span className="font-bold text-theme-primary uppercase font-sans">{item.type}</span>
                    </div>
                    <span className={`text-[10px] font-bold font-sans ${isCrit ? 'text-brand' : 'text-amber-500'}`}>
                      {item.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-theme-secondary truncate font-sans">
                    {item.location}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-theme-muted pt-0.5 font-sans">
                    <span>BUS: <strong className="text-theme-primary font-mono">{item.busId}</strong></span>
                    <span>CONF: <strong className="text-emerald-500 font-mono">{(item.confidence * 100).toFixed(0)}%</strong></span>
                    <span>TIME: <span className="font-mono">{item.time}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom: Scannable Live Municipal Event Stream (Height: 160px) */}
      <div className="h-40 bg-theme-surface border-t border-theme-border flex flex-col shrink-0 font-sans text-xs overflow-hidden">
        <div className="h-7 px-3 border-b border-theme-border bg-theme-panel flex items-center justify-between shrink-0 font-sans">
          <div className="flex items-center gap-2 text-[10px] text-theme-secondary font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-theme-primary font-sans">LIVE INGESTION STREAM</span>
            <span>•</span>
            <span className="font-sans">SHOWING DETECTIONS ACROSS 32 BUS SENSORS</span>
          </div>
          <span className="text-[10px] text-theme-muted font-sans font-semibold">MQTT 5.0 PROTOCOL</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-theme-panel text-theme-muted text-[10px] uppercase border-b border-theme-border sticky top-0">
              <tr>
                <th className="py-1.5 px-3">TIME</th>
                <th className="py-1.5 px-3">TYPE</th>
                <th className="py-1.5 px-3">LOCATION</th>
                <th className="py-1.5 px-3">SOURCE</th>
                <th className="py-1.5 px-3">SEVERITY</th>
                <th className="py-1.5 px-3">STATUS</th>
                <th className="py-1.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border text-theme-secondary">
              {eventStream.map(evt => {
                const isCrit = evt.severity === 'Critical';
                const isHigh = evt.severity === 'High';
                const isVerified = evt.status === 'Cross-verified';

                return (
                  <tr
                    key={evt.id}
                    onClick={() => {
                      if (evt.kind === 'incident') onSelectIncident(evt.entity as SafetyIncident);
                      else if (evt.kind === 'defect') onSelectDefect(evt.entity as RoadDefect);
                    }}
                    className="hover:bg-theme-elevated cursor-pointer transition-colors"
                  >
                    <td className="py-1.5 px-3 text-theme-muted text-[10px]">{evt.time}</td>
                    <td className="py-1.5 px-3 font-semibold text-theme-primary">{evt.type}</td>
                    <td className="py-1.5 px-3 text-theme-secondary truncate max-w-xs">{evt.location}</td>
                    <td className="py-1.5 px-3 font-bold text-theme-primary">{evt.source}</td>
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isCrit ? 'bg-brand' : (isHigh ? 'bg-amber-500' : 'bg-slate-400')
                        }`}></span>
                        <span className={`font-semibold ${
                          isCrit ? 'text-brand' : (isHigh ? 'text-amber-500' : 'text-theme-secondary')
                        }`}>
                          {evt.severity.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-1.5 px-3">
                      {isVerified ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="text-theme-muted text-[10px]">{evt.status}</span>
                      )}
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <button className="text-[10px] text-theme-primary hover:text-brand underline">
                        INSPECT →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

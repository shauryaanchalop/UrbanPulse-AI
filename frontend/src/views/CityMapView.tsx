import React from 'react';
import type { Bus, RoadDefect, TrafficEvent, SafetyIncident, MaintenanceTicket, Route } from '../types';
import { MapContainer } from '../components/MapContainer';

interface CityMapViewProps {
  buses: Bus[];
  defects: RoadDefect[];
  trafficEvents: TrafficEvent[];
  incidents: SafetyIncident[];
  tickets: MaintenanceTicket[];
  routes: Route[];
  selectedCoordinates?: { lat: number; lng: number } | null;
  onSelectDefect: (defect: RoadDefect) => void;
  onSelectBus: (bus: Bus) => void;
  onSelectIncident: (incident: SafetyIncident) => void;
}

export const CityMapView: React.FC<CityMapViewProps> = ({
  buses,
  defects,
  trafficEvents,
  incidents,
  tickets,
  routes,
  selectedCoordinates,
  onSelectDefect,
  onSelectBus,
  onSelectIncident
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-hidden select-none">
      {/* Top Telemetry Status Header */}
      <div className="h-8 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between text-xs font-sans shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-brand"></span>
          <span className="font-bold text-slate-200">LIVE GEOSPATIAL TRANSIT MAPPING (LEAFLET GIS)</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-graphite-400">
          <span>FLEET IN TRANSIT: <strong className="text-emerald-400">{buses.length} BUSES</strong></span>
          <span>|</span>
          <span>DEFECTS MAPPED: <strong className="text-amber-400">{defects.length}</strong></span>
          <span>|</span>
          <span>HAZARDS: <strong className="text-brand">{incidents.length}</strong></span>
        </div>
      </div>

      {/* Full-bleed Map */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          buses={buses}
          defects={defects}
          trafficEvents={trafficEvents}
          incidents={incidents}
          tickets={tickets}
          routes={routes}
          selectedItemCoordinates={selectedCoordinates}
          onSelectDefect={onSelectDefect}
          onSelectBus={onSelectBus}
          onSelectIncident={onSelectIncident}
        />
      </div>
    </div>
  );
};

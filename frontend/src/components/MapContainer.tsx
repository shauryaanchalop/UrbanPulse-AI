import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Bus, RoadDefect, TrafficEvent, SafetyIncident, MaintenanceTicket, Route } from '../types';
import { Layers, Search, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MapContainerProps {
  buses: Bus[];
  defects: RoadDefect[];
  trafficEvents: TrafficEvent[];
  incidents: SafetyIncident[];
  tickets: MaintenanceTicket[];
  routes: Route[];
  selectedItemCoordinates?: { lat: number; lng: number } | null;
  selectedId?: string | null;
  onSelectDefect?: (defect: RoadDefect) => void;
  onSelectBus?: (bus: Bus) => void;
  onSelectIncident?: (incident: SafetyIncident) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  buses,
  defects,
  trafficEvents,
  incidents,
  tickets,
  routes,
  selectedItemCoordinates,
  selectedId,
  onSelectDefect,
  onSelectBus,
  onSelectIncident
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const { resolvedTheme } = useTheme();

  // Layer groups
  const busesLayer = useRef<L.LayerGroup>(L.layerGroup());
  const defectsLayer = useRef<L.LayerGroup>(L.layerGroup());
  const trafficLayer = useRef<L.LayerGroup>(L.layerGroup());
  const incidentsLayer = useRef<L.LayerGroup>(L.layerGroup());
  const routesLayer = useRef<L.LayerGroup>(L.layerGroup());
  const highlightLayer = useRef<L.LayerGroup>(L.layerGroup());

  // Layer Toggles
  const [layersVisible, setLayersVisible] = useState({
    buses: true,
    defects: true,
    traffic: true,
    incidents: true,
    routes: true,
  });

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Center on Pune reference coordinates (18.534, 73.845)
    const map = L.map(mapRef.current, {
      center: [18.534, 73.845],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    const isLight = resolvedTheme === 'light';
    const tileUrl = isLight
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add layer groups to map
    routesLayer.current.addTo(map);
    trafficLayer.current.addTo(map);
    defectsLayer.current.addTo(map);
    incidentsLayer.current.addTo(map);
    busesLayer.current.addTo(map);
    highlightLayer.current.addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update Tile Layer on Theme Switch
  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current) return;
    const isLight = resolvedTheme === 'light';
    const tileUrl = isLight
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current.setUrl(tileUrl);
  }, [resolvedTheme]);

  // Pan and Highlight Selected Item
  useEffect(() => {
    if (!mapInstance.current) return;
    highlightLayer.current.clearLayers();

    if (selectedItemCoordinates) {
      mapInstance.current.panTo([selectedItemCoordinates.lat, selectedItemCoordinates.lng], { animate: true });

      // Focused pulsing highlight ring around selected entity
      const highlightMarker = L.circleMarker([selectedItemCoordinates.lat, selectedItemCoordinates.lng], {
        radius: 18,
        color: '#DC2626',
        weight: 2,
        fillColor: '#DC2626',
        fillOpacity: 0.15,
        dashArray: '3, 3'
      });
      highlightLayer.current.addLayer(highlightMarker);
    }
  }, [selectedItemCoordinates]);

  // Update Routes Layer
  useEffect(() => {
    if (!mapInstance.current) return;
    routesLayer.current.clearLayers();

    if (!layersVisible.routes) return;

    routes.forEach(route => {
      const latlngs = route.waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
      const poly = L.polyline(latlngs, {
        color: resolvedTheme === 'light' ? '#94A3B8' : '#374151',
        weight: 1.5,
        opacity: selectedItemCoordinates ? 0.25 : 0.6,
        dashArray: '4, 4'
      });

      poly.bindTooltip(`<span class="font-mono text-[10px]"><b>${route.id}</b>: ${route.name}</span>`, {
        sticky: true
      });

      routesLayer.current.addLayer(poly);
    });
  }, [routes, layersVisible.routes, resolvedTheme, selectedItemCoordinates]);

  // Update Buses Layer (● Bus)
  useEffect(() => {
    if (!mapInstance.current) return;
    busesLayer.current.clearLayers();

    if (!layersVisible.buses) return;

    buses.forEach(bus => {
      const isSelected = selectedId === bus.id;
      const opacity = selectedItemCoordinates && !isSelected ? 0.35 : 1;
      const statusColor = bus.status === 'Active' ? '#10B981' : (bus.status === 'Warning' ? '#F59E0B' : '#6B7280');

      const customIcon = L.divIcon({
        className: 'clean-bus-marker',
        html: `
          <div style="position:relative; width: 24px; height: 18px; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity: ${opacity};">
            <div style="width: 22px; height: 14px; background: ${resolvedTheme === 'light' ? '#FFFFFF' : '#0B0D0E'}; border: 1.5px solid ${isSelected ? '#DC2626' : statusColor}; border-radius: 2px; display:flex; align-items:center; justify-content:center; box-shadow: 0 1px 4px rgba(0,0,0,0.3);">
              <span style="font-family: monospace; font-size: 8px; font-weight: 700; color: ${resolvedTheme === 'light' ? '#111827' : '#F8FAFC'};">${bus.id.replace('BUS-', '')}</span>
            </div>
            <!-- Heading indicator dot -->
            <div style="position:absolute; top: -2px; left: 10px; width: 4px; height: 4px; background: ${statusColor}; transform: rotate(${bus.heading}deg); transform-origin: 2px 11px;"></div>
          </div>
        `,
        iconSize: [24, 18],
        iconAnchor: [12, 9]
      });

      const marker = L.marker([bus.latitude, bus.longitude], { icon: customIcon });

      marker.bindTooltip(`
        <div style="font-family: monospace; font-size: 10px; line-height: 1.4;">
          <div style="font-weight: bold; color: ${statusColor};">${bus.id} • ROUTE ${bus.routeId}</div>
          <div style="color: ${resolvedTheme === 'light' ? '#4B5563' : '#9CA3AF'};">${bus.routeName}</div>
          <div>SPEED: <b>${bus.speed} km/h</b> • FPS: <b>${bus.edgeFps}</b></div>
          <div style="color: #DC2626; margin-top: 2px; font-weight: bold;">▶ CLICK TO INSPECT</div>
        </div>
      `, { sticky: true });

      marker.on('click', () => {
        if (onSelectBus) onSelectBus(bus);
      });

      busesLayer.current.addLayer(marker);
    });
  }, [buses, layersVisible.buses, selectedItemCoordinates, selectedId, resolvedTheme, onSelectBus]);

  // Update Road Defects Layer (■ Road Event)
  useEffect(() => {
    if (!mapInstance.current) return;
    defectsLayer.current.clearLayers();

    if (!layersVisible.defects) return;

    const filteredDefects = defects.filter(d => {
      if (filterSeverity !== 'ALL' && d.severity !== filterSeverity) return false;
      return true;
    });

    filteredDefects.forEach(defect => {
      const isSelected = selectedId === defect.id;
      const opacity = selectedItemCoordinates && !isSelected ? 0.35 : 1;
      const isVerified = defect.status === 'Cross-verified';
      const isCritical = defect.severity === 'Critical';
      const color = isCritical ? '#DC2626' : (defect.severity === 'High' ? '#F59E0B' : '#6B7280');

      const customIcon = L.divIcon({
        className: 'clean-defect-marker',
        html: `
          <div style="position:relative; width: 14px; height: 14px; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity: ${opacity};">
            <div style="width: 9px; height: 9px; background: ${color}; border: 1px solid ${resolvedTheme === 'light' ? '#FFFFFF' : '#000000'}; border-radius: 1px;"></div>
            ${isVerified ? `<div style="position:absolute; -top: 3px; -right: 3px; width: 5px; height: 5px; background: #10B981; border: 1px solid #000000;"></div>` : ''}
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([defect.latitude, defect.longitude], { icon: customIcon });

      marker.bindTooltip(`
        <div style="font-family: monospace; font-size: 10px; line-height: 1.4;">
          <div style="font-weight: bold; color: ${color};">${defect.defectType.toUpperCase()} [${defect.severity}]</div>
          <div style="color: ${resolvedTheme === 'light' ? '#4B5563' : '#CBD5E1'};">${defect.address}</div>
          <div>CONF: <b>${(defect.confidence * 100).toFixed(0)}%</b> • ${defect.timesConfirmed} PASSES</div>
          ${isVerified ? `<div style="color: #10B981; font-weight: bold;">✓ CROSS-VERIFIED</div>` : ''}
        </div>
      `, { sticky: true });

      marker.on('click', () => {
        if (onSelectDefect) onSelectDefect(defect);
      });

      defectsLayer.current.addLayer(marker);
    });
  }, [defects, layersVisible.defects, filterSeverity, selectedItemCoordinates, selectedId, resolvedTheme, onSelectDefect]);

  // Update Traffic Layer
  useEffect(() => {
    if (!mapInstance.current) return;
    trafficLayer.current.clearLayers();

    if (!layersVisible.traffic) return;

    trafficEvents.forEach(evt => {
      if (evt.congestionLevel === 'Low') return;

      const isStandstill = evt.congestionLevel === 'Standstill';
      const color = isStandstill ? '#DC2626' : '#F59E0B';
      const radius = isStandstill ? 300 : 200;

      const circle = L.circle([evt.latitude, evt.longitude], {
        radius: radius,
        color: color,
        weight: 1,
        fillColor: color,
        fillOpacity: selectedItemCoordinates ? 0.08 : 0.14,
        dashArray: isStandstill ? '3, 3' : undefined
      });

      circle.bindTooltip(`
        <div style="font-family: monospace; font-size: 10px;">
          <b style="color: ${color};">${evt.corridorName}</b><br/>
          FLOW: <b>${evt.congestionLevel}</b> • SPEED: ${evt.averageSpeedKmH} km/h (+${evt.delayMinutes}m)
        </div>
      `, { sticky: true });

      trafficLayer.current.addLayer(circle);
    });
  }, [trafficEvents, layersVisible.traffic, selectedItemCoordinates]);

  // Update Safety Incidents Layer (▲ Safety / ◆ Incident)
  useEffect(() => {
    if (!mapInstance.current) return;
    incidentsLayer.current.clearLayers();

    if (!layersVisible.incidents) return;

    incidents.forEach(inc => {
      const isSelected = selectedId === inc.id;
      const opacity = selectedItemCoordinates && !isSelected ? 0.35 : 1;
      const isCritical = inc.severity === 'Critical';
      const color = isCritical ? '#DC2626' : '#F59E0B';

      const customIcon = L.divIcon({
        className: 'clean-incident-marker',
        html: `
          <div style="width: 14px; height: 14px; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity: ${opacity};">
            <div style="width: 9px; height: 9px; background: ${color}; transform: rotate(45deg); border: 1px solid ${resolvedTheme === 'light' ? '#FFFFFF' : '#000000'};"></div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      marker.bindTooltip(`
        <div style="font-family: monospace; font-size: 10px;">
          <div style="font-weight: bold; color: ${color};">${inc.incidentType} [${inc.severity}]</div>
          <div>${inc.address}</div>
          <div>TARGET: <b>${inc.trackedObject}</b> • ${inc.busId}</div>
        </div>
      `, { sticky: true });

      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc);
      });

      incidentsLayer.current.addLayer(marker);
    });
  }, [incidents, layersVisible.incidents, selectedItemCoordinates, selectedId, resolvedTheme, onSelectIncident]);

  return (
    <div className="relative w-full h-full bg-theme-bg overflow-hidden select-none">
      {/* Map DOM */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Top Right: Layer Controls HUD */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="flex items-center gap-1 bg-theme-surface border border-theme-border px-2 py-1 text-[11px] font-mono text-theme-primary hover:bg-theme-elevated rounded-sm shadow-md transition-colors"
        >
          <Layers className="w-3 h-3 text-brand" />
          <span>LAYERS</span>
        </button>

        {showLayerMenu && (
          <div className="absolute top-8 right-0 bg-theme-surface border border-theme-border p-2 z-20 w-44 flex flex-col gap-1 text-[11px] font-mono shadow-xl rounded-sm">
            <div className="text-[9px] text-theme-muted pb-1 border-b border-theme-border uppercase font-bold">
              GIS Layer Visibility
            </div>
            {[
              { key: 'buses', label: `BUSES (${buses.length})` },
              { key: 'defects', label: `DEFECTS (${defects.length})` },
              { key: 'traffic', label: 'CONGESTION' },
              { key: 'incidents', label: `SAFETY (${incidents.length})` },
              { key: 'routes', label: 'ROUTES' },
            ].map(l => (
              <label key={l.key} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-theme-primary text-theme-secondary">
                <input
                  type="checkbox"
                  checked={(layersVisible as any)[l.key]}
                  onChange={() => setLayersVisible(prev => ({ ...prev, [l.key]: !(prev as any)[l.key] }))}
                  className="rounded-none border-theme-border text-brand focus:ring-0"
                />
                <span>{l.label}</span>
              </label>
            ))}

            <div className="text-[9px] text-theme-muted pt-1 border-t border-theme-border uppercase mt-1 font-bold">
              Severity Filter
            </div>
            <div className="flex gap-1 pt-0.5">
              {['ALL', 'Critical', 'High'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-1.5 py-0.5 text-[9px] border rounded-none ${
                    filterSeverity === sev ? 'bg-brand/15 border-brand text-brand font-bold' : 'border-theme-border text-theme-muted'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Left: Compact Professional Operational Legend */}
      <div className="absolute bottom-2 left-2 z-10 bg-theme-surface/95 backdrop-blur-sm border border-theme-border px-2.5 py-1 text-[10px] font-mono text-theme-secondary flex items-center gap-3 rounded-sm shadow-md">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>Bus</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-none bg-amber-500 inline-block"></span>
          <span>Road Event</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-brand inline-block rotate-45"></span>
          <span>Incident</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 inline-block"></span>
          <span className="text-emerald-500 font-bold">✓ Verified</span>
        </div>
      </div>
    </div>
  );
};

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

  // Trail history store for bus observation traces
  const busTrailsRef = useRef<Record<string, Array<{ lat: number; lng: number; status: string; speed: number }>>>({});

  // Layer groups
  const busesLayer = useRef<L.LayerGroup>(L.layerGroup());
  const defectsLayer = useRef<L.LayerGroup>(L.layerGroup());
  const trafficLayer = useRef<L.LayerGroup>(L.layerGroup());
  const incidentsLayer = useRef<L.LayerGroup>(L.layerGroup());
  const routesLayer = useRef<L.LayerGroup>(L.layerGroup());
  const busTrailsLayer = useRef<L.LayerGroup>(L.layerGroup());
  const highlightLayer = useRef<L.LayerGroup>(L.layerGroup());

  // Layer Toggles
  const [layersVisible, setLayersVisible] = useState({
    buses: true,
    defects: true,
    traffic: true,
    incidents: true,
    routes: true,
    busTrails: true
  });

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [mapProvider, setMapProvider] = useState<'esri' | 'carto' | 'carto-cdn' | 'osm'>('esri');
  const [cartoKeyInput, setCartoKeyInput] = useState<string>(
    import.meta.env.VITE_CARTO_API_KEY || 'cb1_30o4_1_f36aa14be1bc36fa7a2f8e48'
  );

  const getTileUrl = (provider: string, theme: string, apiKey: string) => {
    const isLight = theme === 'light';
    if (provider === 'esri') {
      return isLight
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    }
    if (provider === 'osm') {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    if (provider === 'carto-cdn') {
      return isLight
        ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'
        : 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png';
    }
    const apiKeyParam = apiKey.trim() ? `?api_key=${apiKey.trim()}` : '';
    return isLight
      ? `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${apiKeyParam}`
      : `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${apiKeyParam}`;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Restore persisted bus trails from localStorage or sessionStorage on reload if available
    try {
      const savedTrails = localStorage.getItem('urbanpulse_bus_trails') || sessionStorage.getItem('urbanpulse_bus_trails');
      if (savedTrails) {
        busTrailsRef.current = JSON.parse(savedTrails);
      }
    } catch (e) {
      console.warn('[MapContainer] Failed to restore bus trails:', e);
    }

    // Center on Central Pune Metro Interchange Hub (Swargate / Deccan / Shivajinagar / Wakad corridor)
    const map = L.map(mapRef.current, {
      center: [18.534, 73.845],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    const initialUrl = getTileUrl(mapProvider, resolvedTheme, cartoKeyInput);

    // FIXED: maxNativeZoom: 16 prevents "Map Data Not Available" error on zoom levels 17-19
    const tileLayer = L.tileLayer(initialUrl, {
      maxZoom: 19,
      maxNativeZoom: 16,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap &copy; CARTO &copy; Esri'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add layer groups to map
    routesLayer.current.addTo(map);
    busTrailsLayer.current.addTo(map);
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

  // Update Tile Layer on Theme or Provider Switch
  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current) return;
    const newUrl = getTileUrl(mapProvider, resolvedTheme, cartoKeyInput);
    tileLayerRef.current.setUrl(newUrl);
  }, [resolvedTheme, mapProvider, cartoKeyInput]);

  // Pan and Highlight Selected Item
  useEffect(() => {
    if (!mapInstance.current) return;
    highlightLayer.current.clearLayers();

    if (selectedItemCoordinates) {
      mapInstance.current.panTo([selectedItemCoordinates.lat, selectedItemCoordinates.lng], { animate: true });

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

  // Update Routes & Road Segment Health Layer (GREEN, YELLOW, ORANGE, RED segment-by-segment polylines)
  useEffect(() => {
    if (!mapInstance.current) return;
    routesLayer.current.clearLayers();

    if (!layersVisible.routes) return;

    routes.forEach(route => {
      if (!route.waypoints || route.waypoints.length < 2) return;

      const routeDefects = defects.filter(d => d.routeId === route.id || d.address?.toLowerCase().includes(route.name.toLowerCase()));

      // Draw segment-by-segment polyline traces along route waypoints
      for (let i = 0; i < route.waypoints.length - 1; i++) {
        const wp1 = route.waypoints[i];
        const wp2 = route.waypoints[i + 1];

        // Find defects near this specific segment
        const segDefects = routeDefects.filter(d => {
          const dLat = d.latitude;
          const dLng = d.longitude;
          const minLat = Math.min(wp1.lat, wp2.lat) - 0.005;
          const maxLat = Math.max(wp1.lat, wp2.lat) + 0.005;
          const minLng = Math.min(wp1.lng, wp2.lng) - 0.005;
          const maxLng = Math.max(wp1.lng, wp2.lng) + 0.005;
          return dLat >= minLat && dLat <= maxLat && dLng >= minLng && dLng <= maxLng;
        });

        const hasCritical = segDefects.some(d => d.severity === 'Critical');
        const hasHigh = segDefects.some(d => d.severity === 'High');
        const hasDefects = segDefects.length > 0;

        // Color coding for this specific road segment
        const healthColor = hasCritical
          ? '#DC2626' // RED = Critical Defect Segment
          : hasHigh
          ? '#F97316' // ORANGE = Attention Needed
          : hasDefects
          ? '#F59E0B' // YELLOW = Degrading Surface
          : '#10B981'; // GREEN = Healthy Segment

        // Soft outer glow for crisp road boundary
        const glowLine = L.polyline([[wp1.lat, wp1.lng], [wp2.lat, wp2.lng]], {
          color: healthColor,
          weight: hasCritical ? 6 : (hasHigh ? 5 : 4),
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // Crisp solid core road line
        const poly = L.polyline([[wp1.lat, wp1.lng], [wp2.lat, wp2.lng]], {
          color: healthColor,
          weight: hasCritical ? 3.5 : (hasHigh ? 3 : 2.5),
          opacity: selectedItemCoordinates ? 0.5 : 0.95,
          dashArray: hasCritical ? '6, 6' : undefined,
          lineCap: 'round',
          lineJoin: 'round'
        });

        const healthLabel = hasCritical ? 'Critical Defect Detected' : (hasHigh ? 'Attention Needed' : (hasDefects ? 'Degraded Surface' : 'Optimal Health'));

        poly.bindTooltip(`
          <div style="font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; line-height: 1.4; padding: 2px;">
            <div style="font-weight: 700; color: ${healthColor};">${route.id}: ${route.name}</div>
            <div style="color: #64748B; font-size: 10px;">Segment: <b>${wp1.name || 'Way-1'} → ${wp2.name || 'Way-2'}</b></div>
            <div>Status: <b style="color: ${healthColor};">${healthLabel}</b></div>
            <div>Active Defects: <b>${segDefects.length}</b></div>
          </div>
        `, { sticky: true });

        routesLayer.current.addLayer(glowLine);
        routesLayer.current.addLayer(poly);
      }
    });
  }, [routes, defects, layersVisible.routes, resolvedTheme, selectedItemCoordinates]);

  // Update Bus Movement Trails & Pre-Seeded Observation Traces
  useEffect(() => {
    if (!mapInstance.current) return;
    busTrailsLayer.current.clearLayers();

    // Accumulate or pre-seed clean bus movement trace waypoints
    buses.forEach(bus => {
      const existingTrail = busTrailsRef.current[bus.id];

      // Re-seed if no trail or trail has fewer than 4 points
      if (!existingTrail || existingTrail.length < 4) {
        const assignedRoute = routes.find(r => r.id === bus.routeId);
        const initialPoints: Array<{ lat: number; lng: number; status: string; speed: number }> = [];

        if (assignedRoute && assignedRoute.waypoints && assignedRoute.waypoints.length >= 2) {
          const wps = assignedRoute.waypoints;
          // Clean geometric interpolation between authentic route waypoints
          for (let k = 0; k < wps.length - 1; k++) {
            const p1 = wps[k];
            const p2 = wps[k + 1];
            const steps = 3;
            for (let s = 0; s < steps; s++) {
              const ratio = s / steps;
              initialPoints.push({
                lat: p1.lat + (p2.lat - p1.lat) * ratio,
                lng: p1.lng + (p2.lng - p1.lng) * ratio,
                status: bus.status,
                speed: Math.max(18, Math.round(bus.speed))
              });
            }
          }
        }

        // Add current bus position as the head of the trace
        initialPoints.push({ lat: bus.latitude, lng: bus.longitude, status: bus.status, speed: bus.speed });

        // Fallback if no route assigned: align along current heading
        if (initialPoints.length < 4) {
          const headingRad = ((bus.heading || 45) - 180) * (Math.PI / 180);
          for (let bIdx = 3; bIdx >= 1; bIdx--) {
            initialPoints.unshift({
              lat: bus.latitude + (Math.cos(headingRad) * 0.0012 * bIdx),
              lng: bus.longitude + (Math.sin(headingRad) * 0.0012 * bIdx),
              status: bus.status,
              speed: Math.max(15, Math.round(bus.speed - (bIdx * 3)))
            });
          }
        }

        busTrailsRef.current[bus.id] = initialPoints;
      } else {
        const lastPoint = existingTrail[existingTrail.length - 1];

        if (!lastPoint || lastPoint.lat !== bus.latitude || lastPoint.lng !== bus.longitude) {
          existingTrail.push({
            lat: bus.latitude,
            lng: bus.longitude,
            status: bus.status,
            speed: bus.speed
          });
          // Maintain a trailing history window of up to 24 telemetry waypoints
          if (existingTrail.length > 24) {
            existingTrail.shift();
          }
        }
      }
    });

    // Save updated bus trails to localStorage and sessionStorage for seamless reload persistence
    try {
      const trailJson = JSON.stringify(busTrailsRef.current);
      sessionStorage.setItem('urbanpulse_bus_trails', trailJson);
      localStorage.setItem('urbanpulse_bus_trails', trailJson);
    } catch (e) {
      console.warn('[MapContainer] Failed to save bus trails:', e);
    }

    if (!layersVisible.busTrails) return;

    // Draw clean, smooth telemetry movement traces for each active bus
    Object.entries(busTrailsRef.current).forEach(([busId, trailPoints]) => {
      if (trailPoints.length < 2) return;

      const busObj = buses.find(b => b.id === busId);
      const routeName = busObj ? busObj.routeName : 'Corridor Trace';

      // 1. Draw smooth segment-by-segment trace polylines with speed-based color coding
      for (let i = 0; i < trailPoints.length - 1; i++) {
        const pt1 = trailPoints[i];
        const pt2 = trailPoints[i + 1];
        const avgSpeed = (pt1.speed + pt2.speed) / 2;

        // Color coding: Green = Smooth (>35km/h), Orange = Moderate (15-35km/h), Red = Slow/Congested (<15km/h)
        const traceColor = avgSpeed > 35 ? '#10B981' : (avgSpeed >= 15 ? '#F59E0B' : '#EF4444');

        // Outer Glow Trace
        const glowPoly = L.polyline([[pt1.lat, pt1.lng], [pt2.lat, pt2.lng]], {
          color: traceColor,
          weight: 4.5,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // Inner Sharp Trace Line
        const corePoly = L.polyline([[pt1.lat, pt1.lng], [pt2.lat, pt2.lng]], {
          color: resolvedTheme === 'light' ? traceColor : '#E2E8F0',
          weight: 2,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        });

        glowPoly.bindTooltip(`
          <div style="font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; line-height: 1.4; padding: 2px;">
            <div style="font-weight: 700; color: ${traceColor};">${busId} Telemetry Trace</div>
            <div>Corridor: <b>${routeName}</b></div>
            <div>Speed: <b>${avgSpeed.toFixed(1)} km/h</b> • RTK GPS Active</div>
            <div style="font-size: 10px; color: #64748B;">Edge AI: Jetson Orin AGX (29.4 FPS)</div>
          </div>
        `, { sticky: true });

        busTrailsLayer.current.addLayer(glowPoly);
        busTrailsLayer.current.addLayer(corePoly);
      }
    });
  }, [buses, routes, layersVisible.busTrails, resolvedTheme]);

  // Update Buses Layer
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
            <div style="position:absolute; top: -2px; left: 10px; width: 4px; height: 4px; background: ${statusColor}; transform: rotate(${bus.heading}deg); transform-origin: 2px 11px;"></div>
          </div>
        `,
        iconSize: [24, 18],
        iconAnchor: [12, 9]
      });

      const marker = L.marker([bus.latitude, bus.longitude], { icon: customIcon });

      marker.bindTooltip(`
        <div style="font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; line-height: 1.4; padding: 2px;">
          <div style="font-weight: 700; color: ${statusColor};">${bus.id} • Route ${bus.routeId}</div>
          <div style="color: ${resolvedTheme === 'light' ? '#4B5563' : '#94A3B8'}; font-size: 10px;">${bus.routeName}</div>
          <div>Speed: <b>${bus.speed} km/h</b> • FPS: <b>${bus.edgeFps}</b></div>
          <div style="color: #DC2626; margin-top: 2px; font-weight: 700; font-size: 10px;">▶ Click to inspect</div>
        </div>
      `, { sticky: true });

      marker.on('click', () => {
        if (onSelectBus) onSelectBus(bus);
      });

      busesLayer.current.addLayer(marker);
    });
  }, [buses, layersVisible.buses, selectedItemCoordinates, selectedId, resolvedTheme, onSelectBus]);

  // Update Road Defects Layer
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
        <div style="font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; line-height: 1.4; padding: 2px;">
          <div style="font-weight: 700; color: ${color};">${defect.defectType} [${defect.severity}]</div>
          <div style="color: ${resolvedTheme === 'light' ? '#4B5563' : '#94A3B8'}; font-size: 10px;">${defect.address}</div>
          <div>Conf: <b>${(defect.confidence * 100).toFixed(0)}%</b> • ${defect.timesConfirmed} passes</div>
          ${isVerified ? `<div style="color: #10B981; font-weight: 700;">✓ Cross-Verified</div>` : ''}
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
        <div style="font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; padding: 2px;">
          <b style="color: ${color}; font-weight: 700;">${evt.corridorName}</b><br/>
          <span style="font-size: 10px;">Flow: <b>${evt.congestionLevel}</b> • Speed: ${evt.averageSpeedKmH} km/h (+${evt.delayMinutes}m delay)</span>
        </div>
      `, { sticky: true });

      trafficLayer.current.addLayer(circle);
    });
  }, [trafficEvents, layersVisible.traffic, selectedItemCoordinates]);

  // Update Safety Incidents Layer
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
        <div style="font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; padding: 2px;">
          <div style="font-weight: 700; color: ${color};">${inc.incidentType} [${inc.severity}]</div>
          <div style="font-size: 10px; color: #94A3B8;">${inc.address}</div>
          <div>Target: <b>${inc.trackedObject}</b> • ${inc.busId}</div>
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
          onClick={() => {
            if (!mapInstance.current || buses.length === 0) return;
            const points = buses.map(b => [b.latitude, b.longitude] as [number, number]);
            if (points.length > 0) {
              const bounds = L.latLngBounds(points);
              mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
          }}
          className="flex items-center gap-1 bg-theme-surface border border-theme-border px-2.5 py-1 text-xs font-sans text-emerald-400 hover:bg-theme-elevated rounded-sm shadow-md transition-colors font-bold cursor-pointer"
          title="Fit view to all active bus movement traces"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>FIT TRACES ({buses.length})</span>
        </button>

        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="flex items-center gap-1 bg-theme-surface border border-theme-border px-2.5 py-1 text-xs font-sans text-theme-primary hover:bg-theme-elevated rounded-sm shadow-md transition-colors cursor-pointer font-semibold"
        >
          <Layers className="w-3.5 h-3.5 text-brand" />
          <span>LAYERS</span>
        </button>

        {showLayerMenu && (
          <div className="absolute top-8 right-0 bg-theme-surface border border-theme-border p-3 z-20 w-52 flex flex-col gap-1.5 text-xs font-sans shadow-xl rounded-sm">
            <div className="text-[10px] text-theme-muted pb-1 border-b border-theme-border uppercase font-bold tracking-wider">
              GIS Layer Visibility
            </div>
            {[
              { key: 'buses', label: `BUSES (${buses.length})` },
              { key: 'defects', label: `DEFECTS (${defects.length})` },
              { key: 'traffic', label: 'CONGESTION' },
              { key: 'incidents', label: `SAFETY (${incidents.length})` },
              { key: 'routes', label: 'ROAD HEALTH GRID' },
              { key: 'busTrails', label: 'BUS TRACES' },
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

            <div className="text-[10px] text-theme-muted pt-1 border-t border-theme-border uppercase mt-1 font-bold tracking-wider">
              Basemap Provider
            </div>
            <select
              value={mapProvider}
              onChange={(e) => setMapProvider(e.target.value as any)}
              className="w-full bg-theme-bg border border-theme-border text-theme-primary text-xs p-1 font-sans rounded-none focus:outline-none focus:border-brand"
            >
              <option value="esri">Esri Canvas (Clean HD)</option>
              <option value="carto-cdn">CartoDB CDN (Free)</option>
              <option value="carto">CARTO Basemaps (Key)</option>
              <option value="osm">OpenStreetMap</option>
            </select>

            {mapProvider === 'carto' && (
              <div className="flex flex-col gap-1 pt-1">
                <div className="text-[9px] text-theme-muted uppercase font-sans">CARTO API Key</div>
                <input
                  type="text"
                  value={cartoKeyInput}
                  onChange={(e) => setCartoKeyInput(e.target.value)}
                  placeholder="Enter CARTO key..."
                  className="w-full bg-theme-bg border border-theme-border text-theme-primary text-xs px-1.5 py-0.5 font-sans rounded-none focus:outline-none focus:border-brand"
                />
              </div>
            )}

            <div className="text-[10px] text-theme-muted pt-1 border-t border-theme-border uppercase mt-1 font-bold tracking-wider">
              Severity Filter
            </div>
            <div className="flex gap-1 pt-0.5">
              {['ALL', 'Critical', 'High'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2 py-0.5 text-xs border rounded-none font-sans ${
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

      {/* Bottom Left: Operational Road Health Legend */}
      <div className="absolute bottom-2 left-2 z-10 bg-theme-surface/95 backdrop-blur-sm border border-theme-border px-3 py-1.5 text-xs font-sans text-theme-secondary flex items-center gap-3 rounded-sm shadow-md">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-1 bg-emerald-500 inline-block"></span>
          <span>Healthy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-1 bg-amber-500 inline-block"></span>
          <span>Degrading</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-1 bg-orange-500 inline-block"></span>
          <span>Attention</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-1 bg-red-600 inline-block"></span>
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1 pl-2 border-l border-theme-border">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>Bus</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 border-b border-dashed border-emerald-400 inline-block"></span>
          <span className="text-emerald-400">Trace</span>
        </div>
      </div>
    </div>
  );
};

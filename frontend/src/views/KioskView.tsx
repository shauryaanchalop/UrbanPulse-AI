import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Play, Pause, Map, Bus as BusIcon, ShieldAlert, Wrench, TrendingUp, Clock, Monitor } from 'lucide-react';
import type { Bus, RoadDefect, TrafficEvent, SafetyIncident, MaintenanceTicket, Route, OverviewKPIs } from '../types';
import { CityMapView } from './CityMapView';
import { RoadIntelligenceView } from './RoadIntelligenceView';
import { TrafficIntelligenceView } from './TrafficIntelligenceView';
import { SafetyEnforcementView } from './SafetyEnforcementView';
import { BusFleetView } from './BusFleetView';

interface KioskViewProps {
  buses: Bus[];
  defects: RoadDefect[];
  trafficEvents: TrafficEvent[];
  incidents: SafetyIncident[];
  tickets: MaintenanceTicket[];
  routes: Route[];
  kpis: OverviewKPIs;
  onExitKiosk: () => void;
}

export const KioskView: React.FC<KioskViewProps> = ({
  buses,
  defects,
  trafficEvents,
  incidents,
  tickets,
  routes,
  kpis,
  onExitKiosk
}) => {
  const [activeKioskTab, setActiveKioskTab] = useState<'map' | 'road' | 'traffic' | 'safety' | 'fleet'>('map');
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Live Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-Rotation Timer (Every 15 seconds)
  useEffect(() => {
    let rotateTimer: any = null;
    if (autoRotate) {
      rotateTimer = setInterval(() => {
        setActiveKioskTab(prev => {
          if (prev === 'map') return 'road';
          if (prev === 'road') return 'traffic';
          if (prev === 'traffic') return 'safety';
          if (prev === 'safety') return 'fleet';
          return 'map';
        });
      }, 15000);
    }
    return () => {
      if (rotateTimer) clearInterval(rotateTimer);
    };
  }, [autoRotate]);

  // Global Keyboard Shortcuts (Esc to exit, K to toggle, Space to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitKiosk();
      } else if (e.key.toLowerCase() === 'k') {
        onExitKiosk();
      } else if (e.code === 'Space') {
        setAutoRotate(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitKiosk]);

  const tabs = [
    { id: 'map' as const, label: 'CITY OVERVIEW MAP', icon: Map },
    { id: 'road' as const, label: 'ROAD HEALTH GRID', icon: Wrench },
    { id: 'traffic' as const, label: 'TRAFFIC DENSITY', icon: TrendingUp },
    { id: 'safety' as const, label: 'SAFETY & INCIDENTS', icon: ShieldAlert },
    { id: 'fleet' as const, label: 'FLEET MONITORING', icon: BusIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black text-white font-sans flex flex-col select-none overflow-hidden">
      {/* Top Kiosk Ribbon */}
      <div className="h-12 bg-graphite-950 border-b border-graphite-800 px-4 flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center space-x-4 font-sans">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-brand" />
            <span className="font-bold text-sm text-white tracking-wider font-sans">COMMAND CENTER KIOSK MODE</span>
          </div>

          <div className="flex items-center space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeKioskTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveKioskTab(tab.id);
                    setAutoRotate(false);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold border flex items-center space-x-1.5 transition-colors ${
                    isActive
                      ? 'bg-brand text-white border-brand'
                      : 'bg-graphite-900 text-graphite-400 border-graphite-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Metrics & Control Strip */}
        <div className="flex items-center space-x-4 text-xs">
          <button
            onClick={() => setAutoRotate(prev => !prev)}
            className={`px-2.5 py-1 border text-[10px] font-bold flex items-center space-x-1 ${
              autoRotate ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-graphite-800 text-graphite-400 border-graphite-700'
            }`}
          >
            {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{autoRotate ? 'AUTO-ROTATE (15s)' : 'PAUSED (Space)'}</span>
          </button>

          <div className="flex items-center space-x-3 text-[11px] text-graphite-300">
            <span>FLEET: <strong className="text-emerald-400">{kpis.activeBuses} ACTIVE</strong></span>
            <span>DEFECTS: <strong className="text-amber-400">{kpis.totalRoadIssues}</strong></span>
            <span>CRITICAL: <strong className="text-brand">{kpis.criticalIncidents}</strong></span>
          </div>

          <div className="flex items-center space-x-2 text-white font-bold text-sm bg-graphite-900 border border-graphite-800 px-3 py-1">
            <Clock className="w-3.5 h-3.5 text-brand" />
            <span>{currentTime}</span>
          </div>

          <button
            onClick={onExitKiosk}
            className="p-1.5 text-graphite-400 hover:text-white bg-graphite-900 border border-graphite-800 rounded-sm"
            title="Exit Kiosk Mode (Esc or K)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Kiosk Content Area */}
      <div className="flex-1 overflow-hidden relative bg-black">
        {activeKioskTab === 'map' && (
          <CityMapView
            buses={buses}
            defects={defects}
            trafficEvents={trafficEvents}
            incidents={incidents}
            tickets={tickets}
            routes={routes}
            selectedCoordinates={null}
            onSelectDefect={() => {}}
            onSelectBus={() => {}}
            onSelectIncident={() => {}}
          />
        )}

        {activeKioskTab === 'road' && (
          <RoadIntelligenceView
            defects={defects}
            onSelectDefect={() => {}}
          />
        )}

        {activeKioskTab === 'traffic' && (
          <TrafficIntelligenceView
            trafficEvents={trafficEvents}
          />
        )}

        {activeKioskTab === 'safety' && (
          <SafetyEnforcementView
            incidents={incidents}
            anprDetections={[]}
            onSelectIncident={() => {}}
          />
        )}

        {activeKioskTab === 'fleet' && (
          <BusFleetView
            buses={buses}
            onSelectBus={() => {}}
          />
        )}
      </div>

      {/* Bottom Kiosk Status Bar */}
      <div className="h-6 bg-graphite-950 border-t border-graphite-800 px-4 flex items-center justify-between text-[10px] text-graphite-400 shrink-0">
        <span>SMART CITY ICCC VIDEO WALL DISPLAY MODE • URBANPULSE AI ENGINE</span>
        <span>PRESS <kbd className="px-1 py-0.2 bg-graphite-800 text-white font-bold border border-graphite-700">ESC</kbd> OR <kbd className="px-1 py-0.2 bg-graphite-800 text-white font-bold border border-graphite-700">K</kbd> TO EXIT</span>
      </div>
    </div>
  );
};

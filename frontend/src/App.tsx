import React, { useState, useEffect, useCallback } from 'react';
import type { 
  Bus, RoadDefect, TrafficEvent, SafetyIncident, 
  ANPRDetection, MaintenanceTicket, Route, OverviewKPIs, 
  SystemHealth, SimulationStatus, UserRole 
} from './types';
import { api, wsService } from './services/api';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { InspectorDrawer } from './components/InspectorDrawer';
import { ScriptedDemoOverlay } from './components/ScriptedDemoOverlay';
import { CommandPaletteModal } from './components/CommandPaletteModal';

// Landing and ICCC Views
import { LandingPageView } from './views/LandingPageView';
import { CommandCenterView } from './views/CommandCenterView';
import { CityMapView } from './views/CityMapView';
import { BusFleetView } from './views/BusFleetView';
import { AIPerceptionView } from './views/AIPerceptionView';
import { RoadIntelligenceView } from './views/RoadIntelligenceView';
import { TrafficIntelligenceView } from './views/TrafficIntelligenceView';
import { SafetyEnforcementView } from './views/SafetyEnforcementView';
import { MaintenanceTicketsView } from './views/MaintenanceTicketsView';
import { AnalyticsView } from './views/AnalyticsView';
import { ArchitectureView } from './views/ArchitectureView';
import { SystemHealthView } from './views/SystemHealthView';

export function App() {
  // Dual-Surface Navigation State: 'landing' (Public Showcase) vs 'command' (ICCC Console)
  const [appSurface, setAppSurface] = useState<'landing' | 'command'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#command' || window.location.pathname === '/app') {
        return 'command';
      }
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('command-center');
  const [currentRole, setCurrentRole] = useState<UserRole>('Command Center Operator');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Entities State
  const [buses, setBuses] = useState<Bus[]>([]);
  const [defects, setDefects] = useState<RoadDefect[]>([]);
  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [anprDetections, setAnprDetections] = useState<ANPRDetection[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  
  const [kpis, setKpis] = useState<OverviewKPIs>({
    activeBuses: 32,
    totalRoadIssues: 160,
    criticalIncidents: 7,
    congestionHotspots: 14,
    openMaintenanceTickets: 39,
    roadCoveragePercent: 74.8,
    multiBusVerifiedCount: 48,
    safetyAlertsToday: 35
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    activeBusesTotal: 32,
    onlineBusesCount: 30,
    cameraHealthPercent: 98.4,
    gpsHealthPercent: 99.2,
    avgEdgeInferenceFps: 29.4,
    queueDepth: 3,
    apiLatencyMs: 18.2,
    ingestionRateEventsPerSec: 42.6,
    dbHealthStatus: 'Operational',
    cloudSyncStatus: 'Synchronized',
    simulatedAt: ''
  });

  // Simulation State
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [demoDescription, setDemoDescription] = useState('Live fleet and urban event monitoring active');

  // Inspector Drawer State
  const [selectedDefect, setSelectedDefect] = useState<RoadDefect | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Operational Log Feed
  const [recentEvents, setRecentEvents] = useState<Array<{ id: string; time: string; text: string; type: string }>>([
    { id: '1', time: '10:14:02', text: 'BUS-004: Pothole detected on Wakad Ramp (94% conf)', type: 'defect' },
    { id: '2', time: '10:13:48', text: 'BUS-012: Congestion detected on Pune Univ Separator', type: 'traffic' },
    { id: '3', time: '10:12:15', text: 'BUS-007: Dangerous Pedestrian proximity logged', type: 'safety' },
    { id: '4', time: '10:10:30', text: 'BUS-022: Multi-bus defect cross-verified (DEF-0012)', type: 'defect' }
  ]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [recentAlerts, setRecentAlerts] = useState<string[]>([
    'BUS-004 detected high severity pothole on Wakad Flyover',
    'Multi-Bus cross-verified DEF-0012 with 98% confidence',
    'Heavy congestion registered on University Underpass (+14m delay)'
  ]);

  // Global Keyboard Shortcut: Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#command') {
        setAppSurface('command');
      } else {
        setAppSurface('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLaunchCommand = () => {
    setAppSurface('command');
    window.location.hash = '#command';
  };

  const handleNavigateHome = () => {
    setAppSurface('landing');
    window.location.hash = '';
  };

  // Initial Data Fetch
  const loadInitialData = useCallback(async () => {
    try {
      const [
        busesData, defectsData, trafficData, incidentsData, 
        anprData, ticketsData, routesData, kpisData, healthData
      ] = await Promise.all([
        api.getBuses(),
        api.getRoadDefects(),
        api.getTrafficEvents(),
        api.getIncidents(),
        api.getANPR(),
        api.getMaintenanceTickets(),
        api.getRoutes(),
        api.getOverview(),
        api.getSystemHealth()
      ]);

      setBuses(busesData);
      setDefects(defectsData);
      setTrafficEvents(trafficData);
      setIncidents(incidentsData);
      setAnprDetections(anprData);
      setTickets(ticketsData);
      setRoutes(routesData);
      setKpis(kpisData);
      setSystemHealth(healthData);
    } catch (err) {
      console.error('[UrbanPulse AI] Error loading initial telemetry:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // WebSocket Subscription
  useEffect(() => {
    wsService.connect();

    const unsubscribe = wsService.subscribe((msg) => {
      const { topic, data } = msg;

      if (topic === 'fleet_telemetry' && data.buses) {
        setBuses(prevBuses => {
          const map = new Map(data.buses.map((b: any) => [b.id, b]));
          return prevBuses.map(b => {
            const updated = map.get(b.id);
            return updated ? { ...b, ...updated } : b;
          });
        });

        if (data.simElapsedSeconds !== undefined) {
          setElapsedSeconds(data.simElapsedSeconds);
        }
        if (data.isDemoMode !== undefined) {
          setIsDemoActive(data.isDemoMode);
        }
        if (data.demoStepDescription) {
          setDemoDescription(data.demoStepDescription);
        }
      }

      else if (topic === 'defect_verified') {
        setDefects(prev => prev.map(d => {
          if (d.id === data.defectId) {
            return {
              ...d,
              status: 'Cross-verified',
              timesConfirmed: data.totalVerifications,
              confidence: data.newConfidence,
              crossVerifyingBuses: data.crossVerifyingBuses
            };
          }
          return d;
        }));

        setRecentAlerts(prev => [data.message, ...prev.slice(0, 9)]);
        setUnreadCount(c => c + 1);

        const nowTime = new Date().toLocaleTimeString();
        setRecentEvents(prev => [
          { id: Math.random().toString(), time: nowTime, text: data.message, type: 'defect' },
          ...prev.slice(0, 7)
        ]);
      }

      else if (topic.startsWith('demo_')) {
        setIsDemoActive(true);
        if (data.step) setDemoStepIndex(data.step);
        if (data.description) setDemoDescription(data.description);

        if (topic === 'demo_pothole_detected') {
          setRecentAlerts(prev => [`POTHOLE DETECTED: ${data.busId} on ${data.address} (94%)`, ...prev.slice(0, 9)]);
          setUnreadCount(c => c + 1);
        } else if (topic === 'demo_defect_cross_verified') {
          setRecentAlerts(prev => [`CROSS-VERIFIED: ${data.verifyingBus} confirmed ${data.defectType} (98%)`, ...prev.slice(0, 9)]);
          setUnreadCount(c => c + 1);
        } else if (topic === 'demo_ticket_created') {
          setRecentAlerts(prev => [`WORK ORDER GENERATED: ${data.ticketCode} (${data.priority})`, ...prev.slice(0, 9)]);
          setUnreadCount(c => c + 1);
        } else if (topic === 'demo_safety_incident') {
          setRecentAlerts(prev => [`SAFETY ALERT: ${data.incidentType} by ${data.busId}`, ...prev.slice(0, 9)]);
          setUnreadCount(c => c + 1);
        }
      }
    });

    return () => {
      unsubscribe();
      wsService.disconnect();
    };
  }, []);

  // Selection Handlers (Opens Drawer & Centers Map)
  const handleSelectDefect = (defect: RoadDefect) => {
    setSelectedDefect(defect);
    setSelectedBus(null);
    setSelectedIncident(null);
    setSelectedCoordinates({ lat: defect.latitude, lng: defect.longitude });
    setSelectedId(defect.id);
  };

  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus);
    setSelectedDefect(null);
    setSelectedIncident(null);
    setSelectedCoordinates({ lat: bus.latitude, lng: bus.longitude });
    setSelectedId(bus.id);
  };

  const handleSelectIncident = (incident: SafetyIncident) => {
    setSelectedIncident(incident);
    setSelectedDefect(null);
    setSelectedBus(null);
    setSelectedCoordinates({ lat: incident.latitude, lng: incident.longitude });
    setSelectedId(incident.id);
  };

  const handleCloseDrawer = () => {
    setSelectedDefect(null);
    setSelectedBus(null);
    setSelectedIncident(null);
    setSelectedId(null);
  };

  // Simulation Controls
  const handleToggleSim = async () => {
    try {
      if (isSimRunning) {
        await api.pauseSimulation();
        setIsSimRunning(false);
      } else {
        await api.startSimulation();
        setIsSimRunning(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSim = async () => {
    try {
      await api.resetSimulation();
      setIsDemoActive(false);
      setDemoStepIndex(0);
      setElapsedSeconds(0);
      await loadInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetSpeed = async (speed: number) => {
    try {
      await api.setSpeed(speed);
      setSimSpeed(speed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartDemo = async () => {
    try {
      setIsDemoActive(true);
      setDemoStepIndex(1);
      setDemoDescription('Starting City Morning Peak Simulation...');
      await api.startScriptedDemo();
    } catch (err) {
      console.error(err);
    }
  };

  // SURFACE 1: PUBLIC ARCHITECTURAL PRODUCT SHOWCASE
  if (appSurface === 'landing') {
    return (
      <LandingPageView
        onLaunchCommandCenter={handleLaunchCommand}
        buses={buses}
        defects={defects}
        kpis={kpis}
      />
    );
  }

  // SURFACE 2: INDUSTRIAL SMART CITY INTEGRATED COMMAND & CONTROL CENTRE (ICCC)
  return (
    <div className="h-screen w-screen flex flex-col bg-theme-bg text-theme-primary font-sans overflow-hidden transition-colors">
      {/* Top 40px Header Bar */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isSimRunning={isSimRunning}
        simSpeed={simSpeed}
        onToggleSim={handleToggleSim}
        onResetSim={handleResetSim}
        onSetSpeed={handleSetSpeed}
        onStartDemo={handleStartDemo}
        isDemoActive={isDemoActive}
        elapsedSeconds={elapsedSeconds}
        unreadNotifications={unreadCount}
        recentAlerts={recentAlerts}
        onNavigateHome={handleNavigateHome}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Workspace: Left Operational Rail + Main Content + Right Sliding Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          openTicketsCount={kpis.openMaintenanceTickets}
          criticalIncidentsCount={kpis.criticalIncidents}
        />

        {/* Dynamic Operational Sector View */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-theme-bg">
          {activeTab === 'command-center' && (
            <CommandCenterView
              kpis={kpis}
              buses={buses}
              defects={defects}
              trafficEvents={trafficEvents}
              incidents={incidents}
              tickets={tickets}
              routes={routes}
              recentEvents={recentEvents}
              selectedCoordinates={selectedCoordinates}
              selectedId={selectedId}
              onSelectDefect={handleSelectDefect}
              onSelectBus={handleSelectBus}
              onSelectIncident={handleSelectIncident}
            />
          )}

          {activeTab === 'city-map' && (
            <CityMapView
              buses={buses}
              defects={defects}
              trafficEvents={trafficEvents}
              incidents={incidents}
              tickets={tickets}
              routes={routes}
              selectedCoordinates={selectedCoordinates}
              onSelectDefect={handleSelectDefect}
              onSelectBus={handleSelectBus}
              onSelectIncident={handleSelectIncident}
            />
          )}

          {activeTab === 'bus-fleet' && (
            <BusFleetView
              buses={buses}
              onSelectBus={handleSelectBus}
            />
          )}

          {activeTab === 'road-intelligence' && (
            <RoadIntelligenceView
              defects={defects}
              onSelectDefect={handleSelectDefect}
            />
          )}

          {activeTab === 'traffic-intelligence' && (
            <TrafficIntelligenceView
              trafficEvents={trafficEvents}
            />
          )}

          {activeTab === 'safety-enforcement' && (
            <SafetyEnforcementView
              incidents={incidents}
              anprDetections={anprDetections}
              onSelectIncident={handleSelectIncident}
            />
          )}

          {activeTab === 'ai-perception' && (
            <AIPerceptionView />
          )}

          {activeTab === 'maintenance-tickets' && (
            <MaintenanceTicketsView
              tickets={tickets}
              onTicketUpdated={loadInitialData}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureView />
          )}

          {activeTab === 'system-health' && (
            <SystemHealthView
              health={systemHealth}
            />
          )}
        </main>

        {/* Integrated Right-Side Inspector Drawer */}
        <InspectorDrawer
          defect={selectedDefect}
          incident={selectedIncident}
          bus={selectedBus}
          onClose={handleCloseDrawer}
          onTicketCreated={loadInitialData}
        />
      </div>

      {/* Non-Intrusive Bottom Demo Ribbon */}
      <ScriptedDemoOverlay
        isDemoActive={isDemoActive}
        demoStepIndex={demoStepIndex}
        demoDescription={demoDescription}
        elapsedSeconds={elapsedSeconds}
        onCloseDemo={() => setIsDemoActive(false)}
      />

      {/* Global Command Palette (Ctrl+K or /) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        buses={buses}
        defects={defects}
        incidents={incidents}
        tickets={tickets}
        onSelectBus={handleSelectBus}
        onSelectDefect={handleSelectDefect}
        onSelectIncident={handleSelectIncident}
        onNavigateTab={setActiveTab}
        onStartDemo={handleStartDemo}
      />
    </div>
  );
}

export default App;

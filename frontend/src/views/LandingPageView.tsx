import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ShieldCheck, Cpu, Database, Eye, 
  Layers, Activity, Compass, Zap, CheckCircle2, 
  Clock, DollarSign, MapPin, Truck, AlertTriangle, 
  ExternalLink, ChevronRight, BarChart3, Lock, Search,
  Play, Video, Shield, RefreshCw, Check, Navigation, AlertCircle
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { ThemeSwitcher } from '../components/common/ThemeSwitcher';
import { CrossBusVerificationModal } from '../components/CrossBusVerificationModal';
import { MapContainer } from '../components/MapContainer';
import type { Bus, RoadDefect, TrafficEvent, SafetyIncident, MaintenanceTicket, Route, OverviewKPIs } from '../types';

interface LandingPageViewProps {
  onLaunchCommandCenter: () => void;
  onLaunchCitizenPortal?: () => void;
  onNavigateLogin?: () => void;
  buses: Bus[];
  defects: RoadDefect[];
  kpis: OverviewKPIs;
  trafficEvents?: TrafficEvent[];
  incidents?: SafetyIncident[];
  tickets?: MaintenanceTicket[];
  routes?: Route[];
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onLaunchCommandCenter,
  onLaunchCitizenPortal,
  onNavigateLogin,
  buses,
  defects,
  kpis,
  trafficEvents = [],
  incidents = [],
  tickets = [],
  routes = []
}) => {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<number>(0);

  // Live Road Health Lifecycle Simulator State
  const [simStep, setSimStep] = useState<'OBSERVE' | 'DETECT' | 'VERIFY' | 'REPAIR' | 'RE_VERIFY'>('OBSERVE');
  const [selectedRoadSegment, setSelectedRoadSegment] = useState('RS-1028 (University Rd)');

  // Evidence Search Demo State
  const [evidenceTime, setEvidenceTime] = useState('14:32');
  const [evidenceSector, setEvidenceSector] = useState('Sector 18 (Kothrud Depot)');
  const [isSearchingEvidence, setIsSearchingEvidence] = useState(false);
  const [evidenceResults, setEvidenceResults] = useState<Array<{ busId: string; dist: string; time: string; relevance: number; clipUrl: string }> | null>(null);
  const [playingClip, setPlayingClip] = useState<string | null>(null);

  // Smart Survey Mission Demo State
  const [surveyTriggered, setSurveyTriggered] = useState(false);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Run Evidence Search Simulation
  const handleRunEvidenceSearch = () => {
    setIsSearchingEvidence(true);
    setEvidenceResults(null);
    setTimeout(() => {
      setIsSearchingEvidence(false);
      setEvidenceResults([
        {
          busId: 'BUS UP-042',
          dist: '46m away',
          time: '14:31:58',
          relevance: 96,
          clipUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        },
        {
          busId: 'BUS UP-117',
          dist: '83m away',
          time: '14:32:09',
          relevance: 89,
          clipUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
        },
        {
          busId: 'BUS UP-008',
          dist: '140m away',
          time: '14:32:31',
          relevance: 78,
          clipUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
        }
      ]);
    }, 1200);
  };

  // Domains data
  const domains = [
    {
      id: 'road',
      title: 'Road Infrastructure Health',
      tagline: 'Continuous Pavement Condition Index (PCI) Auditing',
      desc: 'Transforms daily bus routes into an ongoing pavement scanner. Detects potholes, alligator cracking, longitudinal fissures, and displaced manhole covers before catastrophic failure.',
      metrics: ['160 Defects Cataloged', '±25m Spatial Clustering', '98.4% Detection Accuracy'],
      features: ['Pothole depth & diameter estimation', 'Cracking severity scoring', 'Manhole level displacement detection', 'Automated municipal work-order dispatch']
    },
    {
      id: 'traffic',
      title: 'Traffic & Arterial Dynamics',
      tagline: 'Hyperlocal Congestion & Bottleneck Telemetry',
      desc: 'Monitors real-time flow dynamics across major arterial corridors. Identifies localized bottlenecks, illegal curbside blockages, and corridor transit delays.',
      metrics: ['14 Congestion Hotspots', 'Average Corridor Speed: 24.8 km/h', '18.4 min Delay Index'],
      features: ['Bottleneck identification & classification', 'Bus lane obstruction sensing', 'Curbside double-parking tracking', 'Traffic flow velocity profiling']
    },
    {
      id: 'safety',
      title: 'Pedestrian & Commuter Safety',
      tagline: 'Proactive Hazard & Vulnerability Mitigation',
      desc: 'Scans pedestrian zones, bus stop perimeters, and roadway blind spots. Flags unsafe pedestrian crossings, dangerous proximity alerts, and storm-water logging.',
      metrics: ['35 Safety Events Logged', '12 Waterlogging Zones', 'Sub-second Hazard Flagging'],
      features: ['Unsignalized crossing hazard detection', 'Bus stop overcrowding metrics', 'Roadway waterlogging & debris alerts', 'Nighttime visibility hazard mapping']
    },
    {
      id: 'enforcement',
      title: 'Automated Civic Enforcement & Evidence',
      tagline: 'Bus-Lane Encroachment, ANPR & Forensic Clip Search',
      desc: 'Enforces dedicated transit corridors without stationary speed cameras. Edge ANPR identifies unauthorized vehicles while forensic spatio-temporal search retrieves incident clips in seconds.',
      metrics: ['25 ANPR Violations', '99.1% Plate Read Accuracy', 'Automated E-Challan Staging'],
      features: ['BRTS dedicated bus lane protection', 'Automated number plate recognition (ANPR)', 'Incident video clip retrieval', 'Watchlist vehicle alert matching']
    }
  ];

  return (
    <div className="min-h-screen bg-theme-bg text-theme-primary selection:bg-brand selection:text-white font-sans transition-colors">
      {/* Sticky Public Header Navigation */}
      <header className="sticky top-0 z-40 bg-theme-surface/95 backdrop-blur-md border-b border-theme-border h-14 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <BrandLogo size="md" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <nav className="hidden lg:flex items-center gap-5 font-sans text-xs text-theme-secondary">
            <button onClick={() => scrollToSection('platform')} className="hover:text-theme-primary transition-colors uppercase font-semibold">Platform</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-theme-primary transition-colors uppercase font-semibold">How It Works</button>
            <button onClick={() => scrollToSection('road-health')} className="hover:text-theme-primary transition-colors uppercase font-semibold">Road Health</button>
            <button onClick={() => scrollToSection('coverage')} className="hover:text-theme-primary transition-colors uppercase font-semibold">Safety & Coverage</button>
            <button onClick={() => scrollToSection('evidence')} className="hover:text-theme-primary transition-colors uppercase font-semibold">Evidence</button>
            <button onClick={() => scrollToSection('economics')} className="hover:text-theme-primary transition-colors uppercase font-semibold">For Cities</button>
            <button onClick={() => scrollToSection('edge-ai')} className="hover:text-theme-primary transition-colors uppercase font-semibold">Impact</button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher compact />

          <button
            onClick={onNavigateLogin || onLaunchCommandCenter}
            className="px-3.5 py-1.5 bg-theme-panel hover:bg-theme-elevated text-theme-primary border border-theme-border text-xs font-sans font-semibold rounded-sm transition-colors"
          >
            Login
          </button>

          <button
            onClick={onLaunchCommandCenter}
            className="flex items-center gap-2 px-4 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-sans font-bold tracking-wide rounded-sm transition-all shadow-md active:translate-y-0.5"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION: Full-Screen / Large Live GIS City Map */}
      <section id="platform" className="relative border-b border-theme-border bg-theme-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-theme-surface border border-theme-border rounded-sm font-sans text-[11px] text-theme-secondary font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-ping"></span>
                <span className="text-brand font-bold uppercase">Smart India Hackathon 2026</span>
                <span className="text-theme-muted">•</span>
                <span className="font-mono">PS ID: 26124</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-theme-primary uppercase font-sans leading-[1.1]">
                Every Bus. <br />
                <span className="text-brand">A Mobile Sensor.</span> <br />
                One Intelligent City.
              </h1>

              <p className="text-sm sm:text-base text-theme-secondary font-sans leading-relaxed">
                UrbanPulse transforms public and municipal fleets into a continuously moving urban intelligence network—detecting road conditions, traffic patterns, safety risks and critical incidents in real time.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={onLaunchCommandCenter}
                  className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-xs font-sans font-bold tracking-wide rounded-sm shadow-xl shadow-brand/20 transition-all"
                >
                  <span>Launch Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onLaunchCitizenPortal && (
                  <button
                    onClick={onLaunchCitizenPortal}
                    className="flex items-center gap-2 px-5 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/40 text-xs font-sans font-bold rounded-sm transition-colors"
                  >
                    <span>Report a Road Issue →</span>
                  </button>
                )}
              </div>

              {/* Live Telemetry Summary */}
              <div className="grid grid-cols-3 gap-2 border-t border-theme-border pt-4 text-xs font-sans">
                <div className="p-2 bg-theme-surface border border-theme-border rounded-sm">
                  <div className="text-[10px] text-theme-muted uppercase font-semibold">Active Nodes</div>
                  <div className="font-bold text-theme-primary text-base mt-0.5">{kpis.activeBuses || 32} Buses</div>
                </div>
                <div className="p-2 bg-theme-surface border border-theme-border rounded-sm">
                  <div className="text-[10px] text-theme-muted uppercase font-semibold">Road Health</div>
                  <div className="font-bold text-emerald-500 text-base mt-0.5">{kpis.roadCoveragePercent || 74.8}% Cov</div>
                </div>
                <div className="p-2 bg-theme-surface border border-theme-border rounded-sm">
                  <div className="text-[10px] text-theme-muted uppercase font-semibold">Verified Red</div>
                  <div className="font-bold text-brand text-base mt-0.5">{kpis.multiBusVerifiedCount || 48} Issues</div>
                </div>
              </div>
            </div>

            {/* Right Hero GIS Map Display */}
            <div className="lg:col-span-7 h-[460px] bg-theme-surface border border-theme-border rounded-sm overflow-hidden relative shadow-2xl">
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1 bg-black/80 backdrop-blur border border-theme-border text-[10px] font-sans font-semibold text-white rounded-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>LIVE GIS URBAN SENSING NETWORK — PUNE METRO</span>
              </div>

              <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-black/80 backdrop-blur border border-theme-border text-[10px] font-sans font-semibold text-amber-400 rounded-sm">
                {buses.length || 32} BUSES SENSING LIVE
              </div>

              <MapContainer
                buses={buses}
                defects={defects}
                trafficEvents={trafficEvents}
                incidents={incidents}
                tickets={tickets}
                routes={routes}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section id="problem" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="max-w-3xl mb-12">
          <div className="font-sans text-xs text-brand uppercase font-bold tracking-wider mb-2">The Municipal Blind Spot</div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-sans text-theme-primary uppercase tracking-tight">
            The City Is Moving. The Data Isn't.
          </h2>
          <p className="text-sm text-theme-secondary mt-3 leading-relaxed">
            Current smart city infrastructure relies on static fixed points or manual surveys, leaving 92% of the road network completely unmonitored between annual inspections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-theme-surface border border-theme-border p-6 rounded-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="font-sans text-xs text-theme-muted mb-1 font-bold">MODE 01</div>
              <h3 className="font-sans text-base font-bold text-theme-primary">Fixed CCTV Cameras</h3>
              <p className="text-xs text-theme-secondary mt-2 leading-relaxed">
                Limited spatial coverage. Only sees stationary intersections, missing 90%+ of arterial and feeder road defects.
              </p>
            </div>
            <div className="pt-3 border-t border-theme-border font-sans text-[11px] text-brand font-semibold">
              ✗ ₹3.5L per pole • High spatial blindspot
            </div>
          </div>

          <div className="bg-theme-surface border border-theme-border p-6 rounded-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="font-sans text-xs text-theme-muted mb-1 font-bold">MODE 02</div>
              <h3 className="font-sans text-base font-bold text-theme-primary">Manual Inspection Vans</h3>
              <p className="text-xs text-theme-secondary mt-2 leading-relaxed">
                Slow and periodic. Survey vans operate once every 12 to 18 months. Reports are obsolete before repair work orders are drafted.
              </p>
            </div>
            <div className="pt-3 border-t border-theme-border font-sans text-[11px] text-brand font-semibold">
              ✗ ₹1.2 Cr per van • 6-week report latency
            </div>
          </div>

          <div className="bg-theme-surface border-2 border-brand/50 p-6 rounded-sm flex flex-col justify-between space-y-4 relative shadow-lg">
            <div className="absolute top-0 right-0 bg-brand text-white font-sans text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
              UrbanPulse Approach
            </div>
            <div>
              <div className="font-sans text-xs text-brand mb-1 font-bold">MODE 03</div>
              <h3 className="font-sans text-base font-bold text-theme-primary">Passive Bus Fleet Sensing</h3>
              <p className="text-xs text-theme-secondary mt-2 leading-relaxed">
                Converts existing public transit fleets into continuously moving mobile sensors. Every bus audits road health every 45 minutes with zero added drivers or fuel.
              </p>
            </div>
            <div className="pt-3 border-t border-theme-border font-sans text-[11px] text-emerald-500 font-semibold">
              ✓ ₹45k retrofit • Continuous daily audit • Sub-minute alerts
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE INSIGHT */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-theme-border bg-theme-panel/30">
        <div className="max-w-3xl mb-12">
          <div className="font-sans text-xs text-brand uppercase font-bold tracking-wider mb-2">Systemic Insight</div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-sans text-theme-primary uppercase tracking-tight">
            The City Already Has The Sensors.
          </h2>
          <p className="text-sm text-theme-secondary mt-3 leading-relaxed">
            By piggybacking lightweight AI hardware onto municipal vehicles and synthesizing citizen telemetry, UrbanPulse builds a complete 24/7 city neural network.
          </p>
        </div>

        {/* Animated Formula Visual */}
        <div className="bg-theme-surface border border-theme-border p-8 rounded-sm text-center">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center font-sans">
            <div className="p-4 bg-theme-panel border border-theme-border rounded-sm space-y-1">
              <Truck className="w-6 h-6 text-brand mx-auto mb-2" />
              <div className="font-bold text-sm text-theme-primary">Public Buses</div>
              <div className="text-[10px] text-theme-muted">Arterial Roads</div>
            </div>

            <div className="text-2xl font-bold text-brand">+</div>

            <div className="p-4 bg-theme-panel border border-theme-border rounded-sm space-y-1">
              <Compass className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="font-bold text-sm text-theme-primary">Municipal Fleet</div>
              <div className="text-[10px] text-theme-muted">Local & Feeder Streets</div>
            </div>

            <div className="text-2xl font-bold text-brand">+</div>

            <div className="p-4 bg-theme-panel border border-theme-border rounded-sm space-y-1">
              <Eye className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <div className="font-bold text-sm text-theme-primary">Citizen Signals</div>
              <div className="text-[10px] text-theme-muted">Last-Mile Exceptions</div>
            </div>

            <div className="text-2xl font-bold text-brand">=</div>

            <div className="p-4 bg-brand/10 border border-brand/50 rounded-sm space-y-1">
              <Zap className="w-6 h-6 text-brand mx-auto mb-2" />
              <div className="font-bold text-sm text-brand">City-Wide Sensing</div>
              <div className="text-[10px] text-brand">100% Coverage Grid</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: LIVE ROAD HEALTH & LIFECYCLE SIMULATOR */}
      <section id="road-health" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="max-w-3xl mb-8">
          <div className="font-sans text-xs text-brand uppercase font-bold tracking-wider mb-2">Flagship Product Feature</div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-sans text-theme-primary uppercase tracking-tight">
            Live Road Health & Defect Lifecycle
          </h2>
          <p className="text-sm text-theme-secondary mt-2">
            Experience how a single road segment transitions from observation to detection, cross-verification, repair, and re-verification.
          </p>
        </div>

        {/* Segment Legend */}
        <div className="flex flex-wrap gap-3 mb-6 font-sans text-xs">
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-sm font-semibold">● GREEN: Healthy</span>
          <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 rounded-sm font-semibold">● YELLOW: Degrading</span>
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-sm font-semibold">● ORANGE: Needs Attention</span>
          <span className="px-2.5 py-1 bg-brand/10 text-brand border border-brand/30 rounded-sm font-semibold">● RED: Critical Defect</span>
          <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/30 rounded-sm font-semibold">● GRAY: Insufficient Coverage</span>
        </div>

        {/* Interactive Lifecycle Simulator Controls */}
        <div className="bg-theme-surface border border-theme-border p-6 rounded-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-theme-border pb-4 font-sans text-xs">
            <div>
              <span className="text-theme-muted">TARGET ROAD SEGMENT: </span>
              <span className="font-bold text-theme-primary font-mono">{selectedRoadSegment}</span>
            </div>
            <div className="flex items-center gap-2">
              {(['OBSERVE', 'DETECT', 'VERIFY', 'REPAIR', 'RE_VERIFY'] as const).map((step, idx) => (
                <button
                  key={step}
                  onClick={() => setSimStep(step)}
                  className={`px-3 py-1 border rounded-sm font-sans text-[11px] font-semibold transition-all ${
                    simStep === step
                      ? 'bg-brand text-white border-brand shadow-sm'
                      : 'bg-theme-panel text-theme-secondary border-theme-border hover:text-theme-primary'
                  }`}
                >
                  0{idx + 1}. {step.replace('_', '-')}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive State Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Visual Segment Health Bar */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 bg-theme-panel border border-theme-border rounded-sm space-y-3 font-sans text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-theme-primary">SEGMENT PCI SCORE</span>
                  <span className={`font-bold text-sm ${
                    simStep === 'OBSERVE' || simStep === 'RE_VERIFY' ? 'text-emerald-500' : simStep === 'DETECT' ? 'text-amber-500' : simStep === 'VERIFY' ? 'text-brand' : 'text-yellow-500'
                  }`}>
                    {simStep === 'OBSERVE' ? '92 / 100 (HEALTHY GREEN)' : simStep === 'DETECT' ? '45 / 100 (DEGRADED RED)' : simStep === 'VERIFY' ? '18 / 100 (CRITICAL VERIFIED RED)' : simStep === 'REPAIR' ? '65 / 100 (REPAIR IN PROGRESS)' : '95 / 100 (RE-VERIFIED GREEN)'}
                  </span>
                </div>

                <div className="w-full bg-theme-surface h-3 rounded-full overflow-hidden border border-theme-border">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      simStep === 'OBSERVE' || simStep === 'RE_VERIFY' ? 'bg-emerald-500 w-[92%]' : simStep === 'DETECT' ? 'bg-amber-500 w-[45%]' : simStep === 'VERIFY' ? 'bg-brand w-[18%]' : 'bg-yellow-500 w-[65%]'
                    }`}
                  ></div>
                </div>
              </div>

              {/* Step Description Card */}
              <div className="p-4 bg-theme-panel border border-theme-border rounded-sm space-y-2 font-sans text-xs">
                <div className="text-brand font-bold uppercase tracking-wide">STATE DEMONSTRATION LOG:</div>
                {simStep === 'OBSERVE' && (
                  <p className="text-theme-secondary">Bus UP-042 scans University Road corridor. Surface smooth. PCI 92. State: <span className="text-emerald-500 font-bold">GREEN</span>.</p>
                )}
                {simStep === 'DETECT' && (
                  <p className="text-theme-secondary">Bus UP-042 edge camera detects 8cm deep pothole (94% conf). Segment state drops: <span className="text-amber-500 font-bold">GREEN → RED</span>.</p>
                )}
                {simStep === 'VERIFY' && (
                  <p className="text-theme-secondary">Bus UP-117 passes 14 minutes later and corroborates defect at same coordinates. State: <span className="text-brand font-bold">VERIFIED RED</span> (Work Order #WO-1028 Auto-Issued).</p>
                )}
                {simStep === 'REPAIR' && (
                  <p className="text-theme-secondary">Municipal PWD repair crew dispatched. Patching asphalt applied. State: <span className="text-yellow-500 font-bold">IN REPAIR</span>.</p>
                )}
                {simStep === 'RE_VERIFY' && (
                  <p className="text-theme-secondary">Bus UP-031 passes post-repair, edge AI confirms smooth pavement surface. State: <span className="text-emerald-500 font-bold">RE-VERIFIED GREEN</span>.</p>
                )}
              </div>
            </div>

            {/* Quick Action Simulator Panel */}
            <div className="p-4 bg-theme-panel border border-theme-border rounded-sm space-y-3 font-sans text-xs">
              <div className="font-bold text-theme-primary uppercase border-b border-theme-border pb-2">SIMULATOR CONTROLS</div>
              <button
                onClick={() => setSimStep('DETECT')}
                className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 font-semibold text-[11px] rounded-sm text-left px-3 transition-colors"
              >
                1. Simulate Bus Pothole Detection
              </button>
              <button
                onClick={() => setSimStep('VERIFY')}
                className="w-full py-2 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/30 font-semibold text-[11px] rounded-sm text-left px-3 transition-colors"
              >
                2. Simulate 2nd Bus Cross-Verification
              </button>
              <button
                onClick={() => setSimStep('RE_VERIFY')}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-semibold text-[11px] rounded-sm text-left px-3 transition-colors"
              >
                3. Simulate Repair & Re-Verification
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: MULTI-SOURCE COVERAGE & SMART SURVEY MISSIONS */}
      <section id="coverage" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="max-w-3xl mb-8">
          <div className="font-sans text-xs text-brand uppercase font-bold tracking-wider mb-2">Coverage Intelligence</div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-sans text-theme-primary uppercase tracking-tight">
            Multi-Source Coverage & Survey Missions
          </h2>
          <p className="text-sm text-theme-secondary mt-2">
            When unknown road segments receive multiple citizen reports, UrbanPulse automatically dispatches targeted municipal survey missions.
          </p>
        </div>

        <div className="bg-theme-surface border border-theme-border p-6 rounded-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-sans text-xs">
            <div className="p-3 bg-theme-panel border border-theme-border rounded-sm">
              <div className="text-brand font-bold mb-1">Bus Fleet</div>
              <div className="text-theme-secondary text-[11px]">Covers 100% of major arterial transit routes every 45 mins.</div>
            </div>
            <div className="p-3 bg-theme-panel border border-theme-border rounded-sm">
              <div className="text-amber-500 font-bold mb-1">Service Vehicles</div>
              <div className="text-theme-secondary text-[11px]">Covers local ward streets, waste trucks & municipal rovers.</div>
            </div>
            <div className="p-3 bg-theme-panel border border-theme-border rounded-sm">
              <div className="text-emerald-500 font-bold mb-1">Citizen Reports</div>
              <div className="text-theme-secondary text-[11px]">Flags last-mile exceptions in narrow residential lanes.</div>
            </div>
            <div className="p-3 bg-theme-panel border border-theme-border rounded-sm">
              <div className="text-purple-500 font-bold mb-1">Survey Missions</div>
              <div className="text-theme-secondary text-[11px]">Auto-dispatches municipal rovers to zero-coverage gray zones.</div>
            </div>
          </div>

          {/* Interactive Trigger Demo */}
          <div className="p-4 bg-theme-panel border border-theme-border rounded-sm flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs">
            <div>
              <span className="text-theme-muted uppercase font-bold">Scenario Demo: </span>
              <span className="text-theme-primary font-semibold">Unknown Road + 2 Citizen Reports → Smart Survey Mission</span>
            </div>

            <button
              onClick={() => setSurveyTriggered(!surveyTriggered)}
              className={`px-4 py-2 border font-bold text-xs rounded-sm transition-all ${
                surveyTriggered ? 'bg-purple-600 text-white border-purple-500' : 'bg-brand text-white border-brand hover:bg-brand-hover'
              }`}
            >
              {surveyTriggered ? '✓ Mission Dispatched (Rover #SURV-04)' : 'Dispatch Survey Mission →'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: INTELLIGENCE MODULES */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="max-w-3xl mb-8">
          <div className="font-sans text-xs text-brand uppercase font-bold tracking-wider mb-2">Multi-Departmental Capabilities</div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-sans text-theme-primary uppercase tracking-tight">
            Four Domains of Urban Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 font-sans text-xs">
          {domains.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(idx)}
              className={`p-3 text-left border rounded-sm transition-all ${
                selectedDomain === idx 
                  ? 'border-brand bg-brand/10 text-theme-primary font-bold' 
                  : 'border-theme-border bg-theme-surface text-theme-muted hover:text-theme-primary font-medium'
              }`}
            >
              <div className="text-[10px] text-brand font-semibold">DOMAIN 0{idx + 1}</div>
              <div className="font-semibold truncate mt-0.5">{d.title}</div>
            </button>
          ))}
        </div>

        <div className="bg-theme-surface border border-theme-border p-6 rounded-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className="font-sans text-[11px] text-brand uppercase font-bold tracking-wider">
                  {domains[selectedDomain].tagline}
                </span>
                <h3 className="font-sans text-xl font-extrabold text-theme-primary mt-1">
                  {domains[selectedDomain].title}
                </h3>
              </div>
              <p className="text-sm text-theme-secondary leading-relaxed font-sans">
                {domains[selectedDomain].desc}
              </p>

              <div className="pt-2">
                <div className="font-sans text-xs text-theme-muted uppercase mb-2 font-bold">Core Modules:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {domains[selectedDomain].features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-center gap-2 font-sans text-xs text-theme-primary bg-theme-panel p-2 border border-theme-border rounded-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-theme-panel border border-theme-border p-4 flex flex-col justify-between rounded-sm">
              <div>
                <div className="font-sans text-xs text-theme-muted uppercase mb-3 border-b border-theme-border pb-2 font-bold">
                  LIVE BENCHMARKS
                </div>
                <div className="space-y-3">
                  {domains[selectedDomain].metrics.map((met, midx) => (
                    <div key={midx} className="font-sans text-xs bg-theme-surface p-2.5 border border-theme-border rounded-sm">
                      <div className="text-[10px] text-theme-muted font-medium">TELEMETRY STAT 0{midx + 1}</div>
                      <div className="text-theme-primary font-bold mt-0.5">{met}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onLaunchCommandCenter}
                className="mt-6 w-full py-2 bg-theme-surface hover:bg-theme-elevated text-theme-primary border border-theme-border text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-colors rounded-sm"
              >
                <span>Inspect in Live Console</span>
                <ChevronRight className="w-3.5 h-3.5 text-brand" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: EVIDENCE INTELLIGENCE SEARCH DEMO */}
      <section id="evidence" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="max-w-3xl mb-8">
          <div className="font-sans text-xs text-brand uppercase font-bold tracking-wider mb-2">Police & Investigator Tool</div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-sans text-theme-primary uppercase tracking-tight">
            Don't search hours of footage. Search the incident.
          </h2>
          <p className="text-sm text-theme-secondary mt-2">
            Query time and location coordinates. UrbanPulse spatio-temporally ranks all nearby buses and extracts relevant video clips in seconds.
          </p>
        </div>

        <div className="bg-theme-surface border border-theme-border p-6 rounded-sm space-y-6">
          {/* Incident Search Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
            <div>
              <label className="text-[11px] text-theme-muted font-bold block mb-1 uppercase">Incident Time</label>
              <input
                type="text"
                value={evidenceTime}
                onChange={(e) => setEvidenceTime(e.target.value)}
                className="w-full bg-theme-panel border border-theme-border p-2 rounded-sm text-theme-primary font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-[11px] text-theme-muted font-bold block mb-1 uppercase">Location / Sector</label>
              <input
                type="text"
                value={evidenceSector}
                onChange={(e) => setEvidenceSector(e.target.value)}
                className="w-full bg-theme-panel border border-theme-border p-2 rounded-sm text-theme-primary focus:outline-none focus:border-brand"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRunEvidenceSearch}
                disabled={isSearchingEvidence}
                className="w-full py-2 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-sm shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearchingEvidence ? 'Matching Bus Clips...' : 'Search Evidence →'}</span>
              </button>
            </div>
          </div>

          {/* Search Results Display */}
          {evidenceResults && (
            <div className="space-y-3 border-t border-theme-border pt-4 font-sans text-xs">
              <div className="text-emerald-500 font-bold text-xs uppercase">
                Matched {evidenceResults.length} bus cameras within 150m radius at {evidenceTime}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evidenceResults.map((res, idx) => (
                  <div key={idx} className="bg-theme-panel border border-theme-border p-3 rounded-sm space-y-2 font-sans">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-theme-primary font-mono">{res.busId}</span>
                      <span className="text-[10px] font-bold text-brand">{res.relevance}% RELEVANCE</span>
                    </div>
                    <div className="text-[11px] text-theme-secondary">
                      Distance: {res.dist} • Timestamp: {res.time}
                    </div>
                    <button
                      onClick={() => setPlayingClip(res.busId)}
                      className="w-full py-1.5 bg-theme-surface hover:bg-theme-elevated border border-theme-border text-theme-primary text-[11px] font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 text-brand" />
                      <span>Play Forensic Clip</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Player Modal */}
          {playingClip && (
            <div className="p-4 bg-slate-950 border border-brand/40 rounded-sm text-center space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center">
                <span className="text-emerald-400 font-bold">PLAYING FORENSIC CLIP: {playingClip}</span>
                <button onClick={() => setPlayingClip(null)} className="text-slate-400 hover:text-white">✕ CLOSE</button>
              </div>
              <div className="w-full h-48 bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                <Video className="w-10 h-10 text-brand animate-pulse mr-2" />
                <span>Simulated HD Camera Feed ({playingClip})</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section id="economics" className="py-24 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <BrandLogo size="lg" className="justify-center mb-6" />
        <h2 className="text-3xl sm:text-5xl font-black font-sans text-theme-primary uppercase tracking-tight">
          The City Is Already Moving. <br />
          <span className="text-brand">Start Listening To It.</span>
        </h2>
        <p className="text-base text-theme-secondary font-sans mt-4 max-w-2xl mx-auto leading-relaxed">
          Experience the live Smart City Integrated Command & Control Centre (ICCC) prototype now with real-time simulated buses, multi-camera vision AI, and role-based workflows.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLaunchCommandCenter}
            className="flex items-center gap-2 px-8 py-4 bg-brand hover:bg-brand-hover text-white text-base font-sans font-bold tracking-wide rounded-sm shadow-2xl shadow-brand/30 transition-all active:scale-98"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {onLaunchCitizenPortal && (
            <button
              onClick={onLaunchCitizenPortal}
              className="flex items-center gap-2 px-6 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/40 text-base font-sans font-bold rounded-sm transition-colors"
            >
              <span>Report an Issue →</span>
            </button>
          )}
        </div>

        <div className="mt-14 font-sans text-xs text-theme-muted border-t border-theme-border pt-6">
          Smart India Hackathon 2026 • Problem Statement 26124 • UrbanPulse AI Platform
        </div>
      </section>

      {/* Multi-Bus Corroboration Modal */}
      <CrossBusVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onNavigateToCommand={onLaunchCommandCenter}
      />
    </div>
  );
};

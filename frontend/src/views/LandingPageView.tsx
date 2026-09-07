import React, { useState } from 'react';
import { 
  ArrowRight, ShieldCheck, Cpu, Database, Eye, 
  Layers, Activity, Compass, Zap, CheckCircle2, 
  Clock, DollarSign, MapPin, Truck, AlertTriangle, 
  ExternalLink, ChevronRight, BarChart3, Lock
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { ThemeSwitcher } from '../components/common/ThemeSwitcher';
import { CrossBusVerificationModal } from '../components/CrossBusVerificationModal';
import type { Bus, RoadDefect, OverviewKPIs } from '../types';

interface LandingPageViewProps {
  onLaunchCommandCenter: () => void;
  buses: Bus[];
  defects: RoadDefect[];
  kpis: OverviewKPIs;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onLaunchCommandCenter,
  buses,
  defects,
  kpis
}) => {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<number>(0);

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
      title: 'Automated Civic Enforcement',
      tagline: 'Bus-Lane Encroachment & Parking Compliance',
      desc: 'Enforces dedicated transit corridors without stationary speed cameras. Edge ANPR identifies unauthorized vehicles driving or parking in dedicated BRTS lanes.',
      metrics: ['25 ANPR Violations', '99.1% Plate Read Accuracy', 'Automated E-Challan Staging'],
      features: ['BRTS dedicated bus lane protection', 'Automated number plate recognition (ANPR)', 'Illegal commercial hoarding detection', 'Zone-based parking violation logging']
    }
  ];

  // Pipeline steps
  const pipelineSteps = [
    {
      num: '01',
      title: 'Edge Video Capture',
      subtitle: '4-Camera Array',
      desc: 'Forward road view, left & right kerb cameras, and rear traffic camera continuously capture 1080p/4K streams.'
    },
    {
      num: '02',
      title: 'Neural Inference',
      subtitle: 'TensorRT / YOLOv8',
      desc: 'Onboard edge computer (NVIDIA Jetson / ARM NPU) processes video streams locally at 28-30 frames per second.'
    },
    {
      num: '03',
      title: 'Spatial Localization',
      subtitle: 'Sub-Meter GNSS + IMU',
      desc: 'Detections are tagged with high-precision GPS coordinates, vehicle velocity, heading, and 6-axis IMU accelerometer spikes.'
    },
    {
      num: '04',
      title: 'Edge Data Minimization',
      subtitle: 'Zero Raw Video Uplink',
      desc: 'Raw video is discarded immediately. Only lightweight JSON telemetry and signed 40KB bounding-box crops are queued.'
    },
    {
      num: '05',
      title: 'Cross-Bus Corroboration',
      subtitle: 'Spatio-Temporal Gate',
      desc: 'The central engine cross-references sightings by separate buses within ±25m, elevating confidence from 84% to 98%.'
    },
    {
      num: '06',
      title: 'Automated Civic Dispatch',
      subtitle: 'P1-P3 Work Orders',
      desc: 'Corroborated critical defects trigger automated municipal maintenance work orders routed to the correct ward division.'
    }
  ];

  return (
    <div className="min-h-screen bg-theme-bg text-theme-primary selection:bg-brand selection:text-white font-sans transition-colors">
      {/* Sticky Minimal Industrial Top Bar */}
      <header className="sticky top-0 z-40 bg-theme-surface/95 backdrop-blur-md border-b border-theme-border h-14 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <BrandLogo size="md" />
          <nav className="hidden lg:flex items-center gap-6 font-mono text-xs text-theme-secondary">
            <a href="#problem" className="hover:text-theme-primary transition-colors">THE PROBLEM</a>
            <a href="#pipeline" className="hover:text-theme-primary transition-colors">01-06 PIPELINE</a>
            <a href="#domains" className="hover:text-theme-primary transition-colors">DOMAINS</a>
            <a href="#economics" className="hover:text-theme-primary transition-colors">ECONOMICS</a>
            <a href="#edge-ai" className="hover:text-theme-primary transition-colors">EDGE AI & PRIVACY</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <ThemeSwitcher compact />

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-theme-panel border border-theme-border text-[11px] font-mono text-theme-secondary rounded-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>32 FLEET NODES LIVE</span>
          </div>

          <button
            onClick={() => setIsVerificationModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-theme-panel hover:bg-theme-elevated text-theme-primary border border-theme-border text-xs font-mono rounded-sm transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand" />
            <span>ALGORITHM SPOTLIGHT</span>
          </button>

          <button
            onClick={onLaunchCommandCenter}
            className="flex items-center gap-2 px-4 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-mono font-bold tracking-wide rounded-sm transition-all shadow-lg shadow-brand/20 active:translate-y-0.5"
          >
            <span>LAUNCH COMMAND CENTER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="space-y-6 max-w-4xl">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-theme-surface border border-theme-border rounded-sm font-mono text-[11px] text-theme-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-brand"></span>
            <span className="text-brand font-semibold">SMART INDIA HACKATHON 2026</span>
            <span className="text-theme-muted">•</span>
            <span>PROBLEM STATEMENT ID: 26124</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-theme-primary uppercase font-mono leading-[1.1]">
            EVERY BUS. <span className="text-brand">A MOBILE SENSOR.</span> <br />
            ONE INTELLIGENT CITY.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-theme-secondary font-sans leading-relaxed max-w-3xl">
            Transform municipal bus fleets into autonomous edge-sensing networks. 
            Automated road defect auditing, real-time arterial congestion telemetry, 
            safety hazard detection, and civic work-order dispatch—without deploying dedicated survey vehicles.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onLaunchCommandCenter}
              className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-mono font-bold tracking-wide rounded-sm shadow-xl shadow-brand/25 transition-all"
            >
              <span>LAUNCH COMMAND CENTER</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#pipeline"
              className="flex items-center gap-2 px-5 py-3 bg-theme-surface hover:bg-theme-elevated text-theme-primary border border-theme-border text-sm font-mono rounded-sm transition-colors"
            >
              <span>EXPLORE HOW IT WORKS</span>
            </a>

            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-theme-surface hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary border border-theme-border text-sm font-mono rounded-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Multi-Bus Consensus Demo</span>
            </button>
          </div>
        </div>

        {/* Live Hero Telemetry Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-theme-border pt-8">
          <div className="bg-theme-surface border border-theme-border p-4 rounded-sm">
            <div className="font-mono text-[11px] text-theme-muted uppercase">ACTIVE SENSOR BUSES</div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-theme-primary mt-1">{kpis.activeBuses || 32}</div>
            <div className="font-mono text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> 100% Arterial Coverage
            </div>
          </div>

          <div className="bg-theme-surface border border-theme-border p-4 rounded-sm">
            <div className="font-mono text-[11px] text-theme-muted uppercase">ROAD DEFECTS CATALOGED</div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-500 mt-1">{kpis.totalRoadIssues || 160}</div>
            <div className="font-mono text-[10px] text-theme-muted mt-1">
              Potholes, Cracks, Manholes
            </div>
          </div>

          <div className="bg-theme-surface border border-theme-border p-4 rounded-sm">
            <div className="font-mono text-[11px] text-theme-muted uppercase">EDGE CAMERA UPTIME</div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-theme-primary mt-1">98.4%</div>
            <div className="font-mono text-[10px] text-emerald-500 mt-1">
              28.4 FPS Mean Inference
            </div>
          </div>

          <div className="bg-theme-surface border border-theme-border p-4 rounded-sm">
            <div className="font-mono text-[11px] text-theme-muted uppercase">CROSS-BUS CORROBORATIONS</div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-brand mt-1">{kpis.multiBusVerifiedCount || 48}</div>
            <div className="font-mono text-[10px] text-theme-secondary mt-1">
              Zero False Positive Policy
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section: The Municipal Blind Spot */}
      <section id="problem" className="py-20 px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-xs text-brand uppercase tracking-wider mb-2">THE MUNICIPAL BLIND SPOT</div>
          <h2 className="text-2xl sm:text-4xl font-bold font-mono text-theme-primary uppercase">
            WHY EXISTING URBAN MONITORING FAILS
          </h2>
          <p className="text-sm text-theme-secondary mt-3 leading-relaxed">
            Cities spend crores on infrastructure maintenance yet operate with months of information latency. Traditional sensing models are structurally unsuited for dynamic urban networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-theme-surface border border-theme-border p-6 rounded-sm flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-theme-muted mb-2 font-bold">LIMITATION 01</div>
              <h3 className="font-mono text-base font-semibold text-theme-primary">Stationary CCTV Cameras</h3>
              <p className="text-xs text-theme-secondary mt-2 leading-relaxed">
                Fixed intersection cameras leave 92% of the road network unmonitored. 
                They suffer from fixed angles, optical occlusions, and cannot measure road surface roughness or shallow depressions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-theme-border font-mono text-[11px] text-brand">
              ✗ ₹3.5L per pole • Zero pavement texture telemetry
            </div>
          </div>

          <div className="bg-theme-surface border border-theme-border p-6 rounded-sm flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-theme-muted mb-2 font-bold">LIMITATION 02</div>
              <h3 className="font-mono text-base font-semibold text-theme-primary">Dedicated Survey Vans</h3>
              <p className="text-xs text-theme-secondary mt-2 leading-relaxed">
                Specialized inspection vehicles cost over ₹1.2 Crore each. Because of high operational costs, cities run surveys only once every 12 to 18 months—meaning reports are obsolete before repairs begin.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-theme-border font-mono text-[11px] text-brand">
              ✗ ₹1.2 Cr per van • 6-week report latency • Once a year
            </div>
          </div>

          <div className="bg-theme-surface border-2 border-brand/50 p-6 rounded-sm flex flex-col justify-between relative shadow-lg">
            <div className="absolute top-0 right-0 bg-brand text-white font-mono text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
              URBANPULSE AI APPROACH
            </div>
            <div>
              <div className="font-mono text-xs text-brand mb-2 font-bold">THE SOLUTION</div>
              <h3 className="font-mono text-base font-semibold text-theme-primary">Passive Public Bus Fleet Sensing</h3>
              <p className="text-xs text-theme-secondary mt-2 leading-relaxed">
                Repurposes the thousands of municipal buses already driving across every street 18 hours a day. 
                Low-cost edge AI retrofits provide continuous arterial road auditing every 45 minutes with zero added fuel or drivers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-theme-border font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ ₹45k retrofit • 100% daily repeat coverage • 90s alert dispatch
            </div>
          </div>
        </div>
      </section>

      {/* 01-06 Technical Pipeline */}
      <section id="pipeline" className="py-20 px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-xs text-brand uppercase tracking-wider mb-2">END-TO-END ARCHITECTURE</div>
          <h2 className="text-2xl sm:text-4xl font-bold font-mono text-theme-primary uppercase">
            THE 01–06 TECHNICAL PIPELINE
          </h2>
          <p className="text-sm text-theme-secondary mt-3 leading-relaxed">
            From edge camera photon capture to municipal work-order dispatch. Built for hostile real-world compute and low-bandwidth connectivity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((step) => (
            <div 
              key={step.num}
              className="bg-theme-surface border border-theme-border p-5 rounded-sm hover:border-brand/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-lg font-black text-brand">{step.num}</span>
                  <span className="font-mono text-[10px] text-theme-muted uppercase tracking-widest">{step.subtitle}</span>
                </div>
                <h3 className="font-mono text-sm font-semibold text-theme-primary mb-2">{step.title}</h3>
                <p className="text-xs text-theme-secondary leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Domain Intelligence Grid */}
      <section id="domains" className="py-20 px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-xs text-brand uppercase tracking-wider mb-2">MULTI-MODAL CAPABILITIES</div>
          <h2 className="text-2xl sm:text-4xl font-bold font-mono text-theme-primary uppercase">
            FOUR DOMAINS OF URBAN INTELLIGENCE
          </h2>
          <p className="text-sm text-theme-secondary mt-3 leading-relaxed">
            A single bus fleet powers multi-departmental governance: Public Works, Traffic Police, Transit Authorities, and Emergency Management.
          </p>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {domains.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(idx)}
              className={`p-3 text-left font-mono text-xs border rounded-sm transition-all ${
                selectedDomain === idx 
                  ? 'border-brand bg-brand/5 text-theme-primary font-bold' 
                  : 'border-theme-border bg-theme-surface text-theme-muted hover:text-theme-primary'
              }`}
            >
              <div className="text-[10px] text-brand">DOMAIN 0{idx + 1}</div>
              <div className="font-semibold truncate mt-0.5">{d.title}</div>
            </button>
          ))}
        </div>

        {/* Selected Domain Showcase Panel */}
        <div className="bg-theme-surface border border-theme-border p-6 rounded-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className="font-mono text-[11px] text-brand uppercase font-semibold">
                  {domains[selectedDomain].tagline}
                </span>
                <h3 className="font-mono text-xl font-bold text-theme-primary mt-1">
                  {domains[selectedDomain].title}
                </h3>
              </div>
              <p className="text-sm text-theme-secondary leading-relaxed">
                {domains[selectedDomain].desc}
              </p>

              <div className="pt-2">
                <div className="font-mono text-xs text-theme-muted uppercase mb-2">Core Algorithmic Modules:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {domains[selectedDomain].features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-center gap-2 font-mono text-xs text-theme-primary bg-theme-panel p-2 border border-theme-border rounded-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-theme-panel border border-theme-border p-4 flex flex-col justify-between rounded-sm">
              <div>
                <div className="font-mono text-xs text-theme-muted uppercase mb-3 border-b border-theme-border pb-2">
                  LIVE BENCHMARKS
                </div>
                <div className="space-y-3">
                  {domains[selectedDomain].metrics.map((met, midx) => (
                    <div key={midx} className="font-mono text-xs bg-theme-surface p-2.5 border border-theme-border rounded-sm">
                      <div className="text-[10px] text-theme-muted">TELEMETRY STAT 0{midx + 1}</div>
                      <div className="text-theme-primary font-semibold mt-0.5">{met}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onLaunchCommandCenter}
                className="mt-6 w-full py-2 bg-theme-surface hover:bg-theme-elevated text-theme-primary border border-theme-border text-xs font-mono flex items-center justify-center gap-1.5 transition-colors rounded-sm"
              >
                <span>Inspect in Live Console</span>
                <ChevronRight className="w-3.5 h-3.5 text-brand" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Economics Comparison */}
      <section id="economics" className="py-20 px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="max-w-3xl mb-12">
          <div className="font-mono text-xs text-brand uppercase tracking-wider mb-2">INFRASTRUCTURE ECONOMICS</div>
          <h2 className="text-2xl sm:text-4xl font-bold font-mono text-theme-primary uppercase">
            96% LOWER CAPEX. 100X AUDIT FREQUENCY.
          </h2>
          <p className="text-sm text-theme-secondary mt-3 leading-relaxed">
            Comparing conventional single-purpose municipal survey vans against the UrbanPulse AI fleet retrofit model.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border border-theme-border">
            <thead className="bg-theme-panel border-b border-theme-border text-theme-muted uppercase">
              <tr>
                <th className="p-3">Economic Parameter</th>
                <th className="p-3 text-brand">Traditional Survey Vans</th>
                <th className="p-3 text-theme-primary font-bold">UrbanPulse AI Bus Retrofit</th>
                <th className="p-3 text-emerald-600 dark:text-emerald-400">Municipal Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              <tr className="bg-theme-surface">
                <td className="p-3 font-semibold text-theme-primary">Capital Expenditure (CapEx)</td>
                <td className="p-3 text-theme-muted">₹1,20,00,000 / vehicle</td>
                <td className="p-3 text-theme-primary font-bold">₹45,000 / bus retrofit</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">96.2% CapEx Reduction</td>
              </tr>
              <tr className="bg-theme-panel">
                <td className="p-3 font-semibold text-theme-primary">Network Survey Frequency</td>
                <td className="p-3 text-theme-muted">1x every 12-18 months</td>
                <td className="p-3 text-theme-primary font-bold">Continuous (every 45 mins)</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">100x Coverage Velocity</td>
              </tr>
              <tr className="bg-theme-surface">
                <td className="p-3 font-semibold text-theme-primary">Operational Overhead</td>
                <td className="p-3 text-theme-muted">Dedicated driver + 2 technicians + fuel</td>
                <td className="p-3 text-theme-primary font-bold">Zero incremental staff/fuel</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Piggybacks Active Transit</td>
              </tr>
              <tr className="bg-theme-panel">
                <td className="p-3 font-semibold text-theme-primary">Incident to Ticket Dispatch</td>
                <td className="p-3 text-theme-muted">4 to 6 weeks manual report audit</td>
                <td className="p-3 text-theme-primary font-bold">90 seconds automated P1 work order</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Instantaneous Remediation</td>
              </tr>
              <tr className="bg-theme-surface">
                <td className="p-3 font-semibold text-theme-primary">Cellular Data Bandwidth</td>
                <td className="p-3 text-theme-muted">Gigabytes of video uploads</td>
                <td className="p-3 text-theme-primary font-bold">&lt; 2 MB / bus / hour (JSON only)</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Edge Video Minimization</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Edge AI & Privacy Section */}
      <section id="edge-ai" className="py-20 px-6 max-w-7xl mx-auto border-b border-theme-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="font-mono text-xs text-brand uppercase tracking-wider mb-2">PRIVACY-BY-DESIGN ARCHITECTURE</div>
            <h2 className="text-2xl sm:text-4xl font-bold font-mono text-theme-primary uppercase leading-tight">
              RAW VIDEO STAYS AT THE EDGE. <br />
              <span className="text-brand">INTELLIGENCE TRAVELS TO THE CITY.</span>
            </h2>
            <p className="text-sm text-theme-secondary mt-4 leading-relaxed">
              Streaming thousands of 4K video feeds to a central server is cost-prohibitive and violates citizen privacy. 
              UrbanPulse AI runs full neural inference directly on the bus edge device.
            </p>

            <div className="mt-6 space-y-3 font-mono text-xs">
              <div className="p-3 bg-theme-surface border border-theme-border flex items-start gap-3 rounded-sm">
                <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-theme-primary font-semibold">Automatic On-Device PII Anonymization</div>
                  <div className="text-theme-secondary text-[11px] mt-0.5">
                    Faces and uninvolved vehicle license plates are blurred on the edge before any telemetry is generated, complying with DPDP Act 2023.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-theme-surface border border-theme-border flex items-start gap-3 rounded-sm">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-theme-primary font-semibold">Cellular Bandwidth Optimization (&lt; 2MB/hr)</div>
                  <div className="text-theme-secondary text-[11px] mt-0.5">
                    Raw 4K video frames are dropped from RAM after inference. Only lightweight JSON packets and 40KB signed anomaly crops are transmitted over 4G/5G.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-theme-surface border border-theme-border flex items-start gap-3 rounded-sm">
                <Database className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <div className="text-theme-primary font-semibold">Store-and-Forward Offline Resilience</div>
                  <div className="text-theme-secondary text-[11px] mt-0.5">
                    When traveling through cellular dead-zones or underpasses, edge nodes cache telemetry locally in SQLite with sub-meter timestamps and sync instantly upon re-connection.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Diagram Card */}
          <div className="bg-theme-surface border border-theme-border p-6 rounded-sm space-y-4">
            <div className="font-mono text-xs text-theme-muted uppercase border-b border-theme-border pb-2 flex justify-between items-center">
              <span>EDGE COMPUTE NODE TOPOLOGY</span>
              <span className="text-emerald-500 font-bold">NVIDIA JETSON / RK3588</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="bg-theme-panel p-3 border border-theme-border rounded-sm">
                <div className="text-brand font-semibold mb-1">[BUS EDGE UNIT]</div>
                <div className="text-theme-secondary">4x IP Cameras → GStreamer Hardware Decoder → YOLOv8 INT8 Engine (30 FPS)</div>
              </div>

              <div className="text-center text-theme-muted text-xs">▼ (Extracts Features, Discards Raw Video)</div>

              <div className="bg-theme-panel p-3 border border-theme-border rounded-sm">
                <div className="text-amber-500 font-semibold mb-1">[LOCAL FILTERING & GEO-CORRELATION]</div>
                <div className="text-theme-secondary">IMU Z-axis spike check → RTK GNSS Tagging → 40KB Cropped Anomaly Buffer</div>
              </div>

              <div className="text-center text-theme-muted text-xs">▼ (MQTT / WebSocket Uplink &lt; 2 MB/hr)</div>

              <div className="bg-theme-panel p-3 border border-theme-border rounded-sm">
                <div className="text-emerald-500 font-semibold mb-1">[CENTRAL MUNICIPAL ICCC ENGINE]</div>
                <div className="text-theme-secondary">Spatio-Temporal Corroboration Engine → Priority Work Order Routing → GIS Map</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <BrandLogo size="lg" className="justify-center mb-6" />
        <h2 className="text-3xl sm:text-5xl font-black font-mono text-theme-primary uppercase tracking-tight">
          READY FOR LIVE MUNICIPAL DEPLOYMENT
        </h2>
        <p className="text-base text-theme-secondary font-sans mt-4 max-w-2xl mx-auto leading-relaxed">
          Test the live Smart City Integrated Command & Control Centre (ICCC) prototype right now with real-time simulated buses, multi-camera feeds, and automated work orders.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLaunchCommandCenter}
            className="flex items-center gap-2 px-8 py-4 bg-brand hover:bg-brand-hover text-white text-base font-mono font-bold tracking-wide rounded-sm shadow-2xl shadow-brand/30 transition-all active:scale-98"
          >
            <span>LAUNCH COMMAND CENTER</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsVerificationModalOpen(true)}
            className="flex items-center gap-2 px-6 py-4 bg-theme-surface hover:bg-theme-elevated text-theme-primary border border-theme-border text-base font-mono rounded-sm transition-colors"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Multi-Bus Consensus Demo</span>
          </button>
        </div>

        <div className="mt-14 font-mono text-xs text-theme-muted border-t border-theme-border pt-6">
          Smart India Hackathon 2026 • Problem Statement 26124 • UrbanPulse AI Municipal Platform
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

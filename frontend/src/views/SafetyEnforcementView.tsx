import React, { useState } from 'react';
import type { SafetyIncident, ANPRDetection } from '../types';
import { ShieldAlert, ExternalLink, Plus, Camera, Sparkles, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface SafetyEnforcementViewProps {
  incidents: SafetyIncident[];
  anprDetections: ANPRDetection[];
  onSelectIncident: (incident: SafetyIncident) => void;
  onAddIncident?: (incident: SafetyIncident) => void;
  onAddANPR?: (anpr: ANPRDetection) => void;
}

const DEMO_INCIDENTS: SafetyIncident[] = [
  {
    id: 'INC-0001',
    incidentType: 'Hit & Run Alert',
    severity: 'Critical',
    confidence: 0.96,
    latitude: 18.5985,
    longitude: 73.7621,
    address: 'Wakad Flyover Ramp, Hinjawadi Spine',
    timestamp: '2026-09-14 10:12:00',
    busId: 'BUS-004',
    routeId: 'RT-101',
    status: 'Escalated to Police',
    trackedObject: 'Vehicle (UP-16-AB-1234)',
    eventDescription: 'Vehicle struck barrier at high velocity and fled northbound corridor',
    evidenceImageUrl: '/evidence/incident_frame_1.jpg',
    videoRefUrl: '/evidence/clip_event_1.mp4',
    actionTaken: 'Automatic CAD dispatch triggered for PCR Patrol Unit #4'
  },
  {
    id: 'INC-0002',
    incidentType: 'Dangerous Pedestrian Proximity',
    severity: 'High',
    confidence: 0.94,
    latitude: 18.5362,
    longitude: 73.8301,
    address: 'Pune University Circle Grade Separator',
    timestamp: '2026-09-14 09:55:18',
    busId: 'BUS-007',
    routeId: 'RT-101',
    status: 'Verified',
    trackedObject: 'Pedestrian (Jaywalking in Bus Rapid Lane)',
    eventDescription: 'Pedestrian stepped into blind spot of oncoming electric bus',
    evidenceImageUrl: '/evidence/incident_frame_2.jpg',
    videoRefUrl: '/evidence/clip_event_2.mp4',
    actionTaken: 'Acoustic warning horn triggered'
  },
  {
    id: 'INC-0003',
    incidentType: 'Rash Driving',
    severity: 'Critical',
    confidence: 0.95,
    latitude: 18.5039,
    longitude: 73.8288,
    address: 'Karve Road Nal Stop Intersection',
    timestamp: '2026-09-14 09:40:05',
    busId: 'BUS-015',
    routeId: 'RT-102',
    status: 'Escalated to Police',
    trackedObject: 'Motorcycle (MH-12-EV-4412)',
    eventDescription: 'Aggressive zig-zag weaving through crowded pedestrian crosswalk',
    evidenceImageUrl: '/evidence/incident_frame_3.jpg',
    videoRefUrl: '/evidence/clip_event_3.mp4',
    actionTaken: 'License plate logged & transmitted to Traffic Control'
  },
  {
    id: 'INC-0004',
    incidentType: 'Sudden Lane Swerve',
    severity: 'High',
    confidence: 0.91,
    latitude: 18.5441,
    longitude: 73.8862,
    address: 'Yerawada Junction Southbound',
    timestamp: '2026-09-14 09:15:30',
    busId: 'BUS-031',
    routeId: 'RT-102',
    status: 'Detected',
    trackedObject: 'Commercial SUV (MH-14-GH-9901)',
    eventDescription: 'Abrupt lane change across double solid line without signal',
    evidenceImageUrl: '/evidence/incident_frame_4.jpg',
    actionTaken: 'Operator review pending'
  },
  {
    id: 'INC-0005',
    incidentType: 'Near Collision',
    severity: 'High',
    confidence: 0.93,
    latitude: 18.5679,
    longitude: 73.9143,
    address: 'Viman Nagar Phoenix Mall Entrance',
    timestamp: '2026-09-14 08:50:12',
    busId: 'BUS-039',
    routeId: 'RT-102',
    status: 'Verified',
    trackedObject: 'Auto-Rickshaw (MH-12-QA-3310)',
    eventDescription: 'Proximity violation: 0.4m clearance to bus front bumper during U-turn',
    evidenceImageUrl: '/evidence/incident_frame_5.jpg',
    actionTaken: 'Automatic emergency braking assisted bus stop'
  }
];

const DEMO_ANPR: ANPRDetection[] = [
  {
    id: 'ANPR-0001',
    plateNumber: 'UP-16-AB-1234',
    rawPlateText: 'UP16AB1234',
    vehicleType: 'Sedan (Black Honda City)',
    confidence: 0.98,
    color: 'Black',
    speedEstimated: 68.4,
    latitude: 18.5985,
    longitude: 73.7621,
    timestamp: '2026-09-14 10:14:00',
    busId: 'BUS-004',
    flaggedReason: 'Speeding Violation (+18km/h) & Hit/Run Suspect',
    demoOcrCropUrl: '/evidence/anpr_crop_1.jpg'
  },
  {
    id: 'ANPR-0002',
    plateNumber: 'MH-12-EV-4412',
    rawPlateText: 'MH12EV4412',
    vehicleType: 'Electric Scooter (Ather 450X)',
    confidence: 0.96,
    color: 'Red',
    speedEstimated: 54.2,
    latitude: 18.5039,
    longitude: 73.8288,
    timestamp: '2026-09-14 09:40:05',
    busId: 'BUS-015',
    flaggedReason: 'Rash Driving & Signal Jump',
    demoOcrCropUrl: '/evidence/anpr_crop_2.jpg'
  },
  {
    id: 'ANPR-0003',
    plateNumber: 'MH-14-GH-9901',
    rawPlateText: 'MH14GH9901',
    vehicleType: 'SUV (Mahindra Thar)',
    confidence: 0.95,
    color: 'Silver',
    speedEstimated: 42.1,
    latitude: 18.5441,
    longitude: 73.8862,
    timestamp: '2026-09-14 09:15:30',
    busId: 'BUS-031',
    flaggedReason: 'ROUTINE CORRIDOR SCAN',
    demoOcrCropUrl: '/evidence/anpr_crop_3.jpg'
  },
  {
    id: 'ANPR-0004',
    plateNumber: 'MH-12-QA-3310',
    rawPlateText: 'MH12QA3310',
    vehicleType: 'Auto-Rickshaw (Bajaj RE)',
    confidence: 0.94,
    color: 'Yellow/Green',
    speedEstimated: 28.5,
    latitude: 18.5679,
    longitude: 73.9143,
    timestamp: '2026-09-14 08:50:12',
    busId: 'BUS-039',
    flaggedReason: 'Proximity Threshold Warning',
    demoOcrCropUrl: '/evidence/anpr_crop_4.jpg'
  },
  {
    id: 'ANPR-0005',
    plateNumber: 'MH-12-PX-8890',
    rawPlateText: 'MH12PX8890',
    vehicleType: 'Commercial Van (Tata Ace)',
    confidence: 0.97,
    color: 'White',
    speedEstimated: 35.0,
    latitude: 18.5204,
    longitude: 73.8567,
    timestamp: '2026-09-14 08:20:00',
    busId: 'BUS-022',
    flaggedReason: 'ROUTINE CORRIDOR SCAN',
    demoOcrCropUrl: '/evidence/anpr_crop_5.jpg'
  }
];

export const SafetyEnforcementView: React.FC<SafetyEnforcementViewProps> = ({
  incidents: propIncidents,
  anprDetections: propANPR,
  onSelectIncident,
  onAddIncident,
  onAddANPR
}) => {
  const [localIncidents, setLocalIncidents] = useState<SafetyIncident[]>(DEMO_INCIDENTS);
  const [localANPR, setLocalANPR] = useState<ANPRDetection[]>(DEMO_ANPR);

  const incidents = (propIncidents && propIncidents.length > 0) ? propIncidents : localIncidents;
  const anprDetections = (propANPR && propANPR.length > 0) ? propANPR : localANPR;

  const [activeTab, setActiveTab] = useState<'incidents' | 'anpr'>('incidents');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredIncidents = incidents.filter(i => {
    return severityFilter === 'ALL' || i.severity === severityFilter;
  });

  const criticalCount = incidents.filter(i => i.severity === 'Critical').length;
  const violationCount = anprDetections.filter(a => a.flaggedReason && a.flaggedReason !== 'ROUTINE CORRIDOR SCAN').length;

  const handleCreateDemoIncident = async () => {
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `INC-${idNum}`;
    const types = ['Hit & Run Alert', 'Rash Driving', 'Dangerous Pedestrian Proximity', 'Sudden Lane Swerve'];
    const itype = types[Math.floor(Math.random() * types.length)];
    const isev = Math.random() > 0.3 ? 'Critical' : 'High';
    const conf = parseFloat((0.91 + Math.random() * 0.08).toFixed(2));
    
    const locations = [
      { addr: 'Senapati Bapat Road near JW Marriott', lat: 18.5320, lng: 73.8299 },
      { addr: 'Koregaon Park North Main Road Junction', lat: 18.5365, lng: 73.8942 },
      { addr: 'Kalyani Nagar Joggers Park Corridor', lat: 18.5491, lng: 73.9015 },
      { addr: 'FC Road Goodluck Chowk', lat: 18.5195, lng: 73.8471 }
    ];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const busId = `BUS-${String(Math.floor(1 + Math.random() * 85)).padStart(3, '0')}`;
    const plateStr = `UP-16-AB-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newInc: SafetyIncident = {
      id: newId,
      incidentType: itype,
      severity: isev,
      confidence: conf,
      latitude: loc.lat,
      longitude: loc.lng,
      address: loc.addr,
      timestamp: nowStr,
      busId: busId,
      routeId: 'RT-101',
      status: isev === 'Critical' ? 'Escalated to Police' : 'Verified',
      trackedObject: `Vehicle (${plateStr})`,
      eventDescription: `${itype} registered by mobile sensor ${busId}`,
      evidenceImageUrl: `/evidence/incident_frame_${Math.floor(1 + Math.random() * 8)}.jpg`,
      videoRefUrl: `/evidence/clip_event_${Math.floor(1 + Math.random() * 6)}.jpg`,
      actionTaken: 'Dispatched emergency telemetry alert to Traffic Control CAD'
    };

    try {
      await api.createSafetyIncident(newInc);
    } catch {
      // Local fallback
    }

    if (onAddIncident) {
      onAddIncident(newInc);
    } else {
      setLocalIncidents(prev => [newInc, ...prev]);
    }

    setNotification(`[SAFETY INCIDENT LOGGED] ${newId}: ${itype} at ${loc.addr} (${isev} Severity, ${(conf * 100).toFixed(0)}% Conf)`);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleCreateDemoANPR = async () => {
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `ANPR-${idNum}`;
    const plateStr = `UP-16-AB-${Math.floor(1000 + Math.random() * 9000)}`;
    const vehicleTypes = ['Sedan (Honda City)', 'Electric Scooter (Ather)', 'SUV (Mahindra Thar)', 'Commercial Van'];
    const vtype = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const speed = parseFloat((45.0 + Math.random() * 30.0).toFixed(1));
    const busId = `BUS-${String(Math.floor(1 + Math.random() * 85)).padStart(3, '0')}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newANPR: ANPRDetection = {
      id: newId,
      plateNumber: plateStr,
      rawPlateText: plateStr.replace(/-/g, ''),
      vehicleType: vtype,
      confidence: parseFloat((0.93 + Math.random() * 0.06).toFixed(2)),
      color: 'White',
      speedEstimated: speed,
      latitude: 18.5204 + (Math.random() - 0.5) * 0.08,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.08,
      timestamp: nowStr,
      busId: busId,
      flaggedReason: speed > 60 ? `Speeding Violation (${speed} km/h in 50 zone)` : 'ROUTINE CORRIDOR SCAN',
      demoOcrCropUrl: `/evidence/anpr_crop_${Math.floor(1 + Math.random() * 8)}.jpg`
    };

    try {
      await api.createANPRDetection(newANPR);
    } catch {
      // Local fallback
    }

    if (onAddANPR) {
      onAddANPR(newANPR);
    } else {
      setLocalANPR(prev => [newANPR, ...prev]);
    }

    setNotification(`[ANPR OCR SCAN] ${plateStr} logged by ${busId} (${vtype}, Speed: ${speed} km/h)`);
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-hidden font-sans select-none text-xs">
      {/* Notification Toast */}
      {notification && (
        <div className="bg-red-950/90 border-b border-red-500/40 text-red-300 px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn shrink-0 font-sans">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-red-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Top Header & Sub-Nav */}
      <div className="h-11 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0 gap-2 font-sans">
        <div className="flex items-center gap-3">
          <span className="font-bold text-theme-primary flex items-center gap-1.5 font-sans">
            <ShieldAlert className="w-4 h-4 text-brand" />
            TRANSIT SAFETY & ANPR ENFORCEMENT
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-2.5 py-1 text-[11px] border rounded-none font-sans ${
                activeTab === 'incidents' ? 'bg-graphite-700 text-theme-primary font-bold border-graphite-600' : 'bg-graphite-950 text-graphite-400 border-graphite-700 hover:bg-graphite-800'
              }`}
            >
              SAFETY INCIDENTS ({incidents.length})
            </button>
            <button
              onClick={() => setActiveTab('anpr')}
              className={`px-2.5 py-1 text-[11px] border rounded-none font-sans ${
                activeTab === 'anpr' ? 'bg-graphite-700 text-theme-primary font-bold border-graphite-600' : 'bg-graphite-950 text-graphite-400 border-graphite-700 hover:bg-graphite-800'
              }`}
            >
              ANPR OCR REGISTRY ({anprDetections.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Inject Buttons */}
          <button
            onClick={handleCreateDemoIncident}
            className="px-2.5 py-1 text-[11px] font-bold bg-red-950/80 border border-red-600/50 text-red-400 hover:bg-red-900/60 flex items-center gap-1 transition"
            title="Inject a real-time AI safety incident"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            + INJECT SAFETY INCIDENT
          </button>

          <button
            onClick={handleCreateDemoANPR}
            className="px-2.5 py-1 text-[11px] font-bold bg-amber-950/80 border border-amber-600/50 text-amber-400 hover:bg-amber-900/60 flex items-center gap-1 transition"
            title="Simulate high-speed ANPR plate OCR capture"
          >
            <Camera className="w-3.5 h-3.5" />
            + SCAN ANPR PLATE
          </button>

          {activeTab === 'incidents' ? (
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
          ) : (
            <span className="text-[10px] text-graphite-400">
              SPEED VIOLATIONS: <strong className="text-brand">{violationCount}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'incidents' ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-graphite-900 text-graphite-400 text-[10px] uppercase border-b border-graphite-700 sticky top-0 z-10">
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
                    className="hover:bg-graphite-850 cursor-pointer transition group"
                  >
                    <td className="py-2 px-3 text-graphite-500 text-[10px] font-mono">{inc.timestamp.split(' ')[1] || inc.timestamp}</td>
                    <td className="py-2 px-3 font-semibold text-theme-primary flex items-center gap-1.5">
                      {isCritical && <AlertTriangle className="w-3.5 h-3.5 text-brand shrink-0" />}
                      <span>{inc.incidentType}</span>
                    </td>
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
                      <button className="text-[10px] text-brand group-hover:text-theme-primary group-hover:underline">
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
            <thead className="bg-graphite-900 text-graphite-400 text-[10px] uppercase border-b border-graphite-700 sticky top-0 z-10">
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
                    <span className={`text-[10px] ${anpr.flaggedReason?.includes('Speeding') || anpr.flaggedReason?.includes('Violation') || anpr.flaggedReason?.includes('Rash') ? 'text-brand font-bold' : 'text-graphite-500'}`}>
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


import React, { useState } from 'react';
import type { RoadDefect } from '../types';
import { Search, CheckCheck, Plus, AlertTriangle, Sparkles, Database } from 'lucide-react';
import { api } from '../services/api';

interface RoadIntelligenceViewProps {
  defects: RoadDefect[];
  onSelectDefect: (defect: RoadDefect) => void;
  onAddDefect?: (defect: RoadDefect) => void;
}

const DEMO_ROAD_DEFECTS: RoadDefect[] = [
  {
    id: 'DEF-0001',
    defectType: 'Pothole',
    severity: 'Critical',
    confidence: 0.96,
    latitude: 18.5985,
    longitude: 73.7621,
    address: 'Wakad Flyover Ramp, Hinjawadi Road Corridor',
    routeId: 'RT-101',
    detectedByBusId: 'BUS-004',
    firstSeen: '2026-09-10 08:30:00',
    lastSeen: '2026-09-14 10:14:02',
    timesConfirmed: 5,
    status: 'Cross-verified',
    priority: 'P1',
    evidenceImageUrl: '/evidence/road_defect_1.jpg',
    dimensionsEstimated: '75cm x 45cm, 12cm depth',
    crossVerifyingBuses: ['BUS-004', 'BUS-012', 'BUS-022', 'BUS-045'],
    segmentId: 'SEG-0012'
  },
  {
    id: 'DEF-0002',
    defectType: 'Surface Cracking',
    severity: 'High',
    confidence: 0.94,
    latitude: 18.5583,
    longitude: 73.8074,
    address: 'Bremen Chowk, Aundh Main Arterial',
    routeId: 'RT-101',
    detectedByBusId: 'BUS-012',
    firstSeen: '2026-09-11 11:20:00',
    lastSeen: '2026-09-14 09:45:12',
    timesConfirmed: 4,
    status: 'Ticket Created',
    priority: 'P2',
    evidenceImageUrl: '/evidence/road_defect_2.jpg',
    dimensionsEstimated: '220cm crevice length',
    crossVerifyingBuses: ['BUS-012', 'BUS-018', 'BUS-033'],
    segmentId: 'SEG-0045'
  },
  {
    id: 'DEF-0003',
    defectType: 'Pothole',
    severity: 'Critical',
    confidence: 0.98,
    latitude: 18.5362,
    longitude: 73.8301,
    address: 'Pune University Circle North Underpass',
    routeId: 'RT-101',
    detectedByBusId: 'BUS-007',
    firstSeen: '2026-09-08 14:15:00',
    lastSeen: '2026-09-14 10:05:30',
    timesConfirmed: 8,
    status: 'Cross-verified',
    priority: 'P1',
    evidenceImageUrl: '/evidence/road_defect_3.jpg',
    dimensionsEstimated: '90cm x 60cm, 15cm depth',
    crossVerifyingBuses: ['BUS-007', 'BUS-014', 'BUS-029', 'BUS-051', 'BUS-078'],
    segmentId: 'SEG-0089'
  },
  {
    id: 'DEF-0004',
    defectType: 'Waterlogging',
    severity: 'High',
    confidence: 0.91,
    latitude: 18.5039,
    longitude: 73.8288,
    address: 'Deccan Gymkhana Karve Statue Junction',
    routeId: 'RT-102',
    detectedByBusId: 'BUS-015',
    firstSeen: '2026-09-12 16:40:00',
    lastSeen: '2026-09-14 08:20:15',
    timesConfirmed: 3,
    status: 'Reported',
    priority: 'P2',
    evidenceImageUrl: '/evidence/road_defect_4.jpg',
    dimensionsEstimated: '4.5m x 2.1m submerged area',
    crossVerifyingBuses: ['BUS-015', 'BUS-028'],
    segmentId: 'SEG-0112'
  },
  {
    id: 'DEF-0005',
    defectType: 'Damaged Sign',
    severity: 'Medium',
    confidence: 0.89,
    latitude: 18.5204,
    longitude: 73.8567,
    address: 'Pune Railway Station Bus Bay 3',
    routeId: 'RT-102',
    detectedByBusId: 'BUS-022',
    firstSeen: '2026-09-13 09:10:00',
    lastSeen: '2026-09-14 07:50:00',
    timesConfirmed: 2,
    status: 'Reported',
    priority: 'P3',
    evidenceImageUrl: '/evidence/road_defect_5.jpg',
    dimensionsEstimated: 'Sign post tilted 35 degrees',
    crossVerifyingBuses: ['BUS-022'],
    segmentId: 'SEG-0145'
  },
  {
    id: 'DEF-0006',
    defectType: 'Broken Divider',
    severity: 'High',
    confidence: 0.95,
    latitude: 18.5441,
    longitude: 73.8862,
    address: 'Yerawada Chowk Southbound Lane',
    routeId: 'RT-102',
    detectedByBusId: 'BUS-031',
    firstSeen: '2026-09-09 12:00:00',
    lastSeen: '2026-09-14 09:12:44',
    timesConfirmed: 6,
    status: 'Cross-verified',
    priority: 'P1',
    evidenceImageUrl: '/evidence/road_defect_6.jpg',
    dimensionsEstimated: '3 concrete blocks dislodged',
    crossVerifyingBuses: ['BUS-031', 'BUS-042', 'BUS-066'],
    segmentId: 'SEG-0198'
  },
  {
    id: 'DEF-0007',
    defectType: 'Pothole',
    severity: 'Critical',
    confidence: 0.97,
    latitude: 18.5679,
    longitude: 73.9143,
    address: 'Viman Nagar Phoenix Mall Frontage',
    routeId: 'RT-102',
    detectedByBusId: 'BUS-039',
    firstSeen: '2026-09-07 07:45:00',
    lastSeen: '2026-09-14 10:02:18',
    timesConfirmed: 7,
    status: 'Cross-verified',
    priority: 'P1',
    evidenceImageUrl: '/evidence/road_defect_7.jpg',
    dimensionsEstimated: '85cm x 50cm, 14cm depth',
    crossVerifyingBuses: ['BUS-039', 'BUS-058', 'BUS-071', 'BUS-092'],
    segmentId: 'SEG-0234'
  },
  {
    id: 'DEF-0008',
    defectType: 'Missing Road Marking',
    severity: 'Medium',
    confidence: 0.88,
    latitude: 18.4575,
    longitude: 73.8588,
    address: 'Katraj Bus Terminus Exit Loop',
    routeId: 'RT-103',
    detectedByBusId: 'BUS-048',
    firstSeen: '2026-09-12 10:30:00',
    lastSeen: '2026-09-14 06:40:00',
    timesConfirmed: 2,
    status: 'Ticket Created',
    priority: 'P3',
    evidenceImageUrl: '/evidence/road_defect_8.jpg',
    dimensionsEstimated: '15m faded pedestrian zebra line',
    crossVerifyingBuses: ['BUS-048'],
    segmentId: 'SEG-0280'
  },
  {
    id: 'DEF-0009',
    defectType: 'Pothole',
    severity: 'High',
    confidence: 0.93,
    latitude: 18.4791,
    longitude: 73.8592,
    address: 'Padmavati Corner Satara Road Spine',
    routeId: 'RT-103',
    detectedByBusId: 'BUS-055',
    firstSeen: '2026-09-11 15:10:00',
    lastSeen: '2026-09-14 09:30:22',
    timesConfirmed: 4,
    status: 'Cross-verified',
    priority: 'P2',
    evidenceImageUrl: '/evidence/road_defect_9.jpg',
    dimensionsEstimated: '60cm x 40cm, 10cm depth',
    crossVerifyingBuses: ['BUS-055', 'BUS-062', 'BUS-084'],
    segmentId: 'SEG-0315'
  },
  {
    id: 'DEF-0010',
    defectType: 'Surface Cracking',
    severity: 'Medium',
    confidence: 0.86,
    latitude: 18.5018,
    longitude: 73.8586,
    address: 'Swargate Multimodal Hub Bus Bay 1',
    routeId: 'RT-103',
    detectedByBusId: 'BUS-064',
    firstSeen: '2026-09-13 11:00:00',
    lastSeen: '2026-09-14 08:15:10',
    timesConfirmed: 3,
    status: 'Reported',
    priority: 'P3',
    evidenceImageUrl: '/evidence/road_defect_10.jpg',
    dimensionsEstimated: '3.2m longitudinal pavement crack',
    crossVerifyingBuses: ['BUS-064', 'BUS-079'],
    segmentId: 'SEG-0360'
  },
  {
    id: 'DEF-0011',
    defectType: 'Pothole',
    severity: 'Critical',
    confidence: 0.99,
    latitude: 18.5590,
    longitude: 73.7868,
    address: 'Baner High Street Commercial Entrance',
    routeId: 'RT-104',
    detectedByBusId: 'BUS-072',
    firstSeen: '2026-09-06 18:20:00',
    lastSeen: '2026-09-14 10:11:05',
    timesConfirmed: 9,
    status: 'Cross-verified',
    priority: 'P1',
    evidenceImageUrl: '/evidence/road_defect_11.jpg',
    dimensionsEstimated: '110cm x 75cm, 16cm depth',
    crossVerifyingBuses: ['BUS-072', 'BUS-081', 'BUS-089', 'BUS-097', 'BUS-104'],
    segmentId: 'SEG-0410'
  },
  {
    id: 'DEF-0012',
    defectType: 'Pothole',
    severity: 'High',
    confidence: 0.92,
    latitude: 18.5135,
    longitude: 73.9312,
    address: 'Hadapsar Magarpatta Cybercity Gate 2',
    routeId: 'RT-105',
    detectedByBusId: 'BUS-085',
    firstSeen: '2026-09-10 14:00:00',
    lastSeen: '2026-09-14 09:55:00',
    timesConfirmed: 5,
    status: 'Cross-verified',
    priority: 'P2',
    evidenceImageUrl: '/evidence/road_defect_12.jpg',
    dimensionsEstimated: '65cm x 45cm, 9cm depth',
    crossVerifyingBuses: ['BUS-085', 'BUS-093', 'BUS-101'],
    segmentId: 'SEG-0475'
  },
  {
    id: 'DEF-0013',
    defectType: 'Sunken Manhole',
    severity: 'High',
    confidence: 0.94,
    latitude: 18.5204,
    longitude: 73.8415,
    address: 'FC Road Opp Goodluck Cafe, Shivajinagar',
    routeId: 'RT-101',
    detectedByBusId: 'BUS-014',
    firstSeen: '2026-09-13 07:15:00',
    lastSeen: '2026-09-14 10:20:00',
    timesConfirmed: 6,
    status: 'Cross-verified',
    priority: 'P1',
    evidenceImageUrl: '/evidence/road_defect_1.jpg',
    dimensionsEstimated: '60cm dia, 11cm depression depth',
    crossVerifyingBuses: ['BUS-014', 'BUS-022', 'BUS-041'],
    segmentId: 'SEG-0512'
  },
  {
    id: 'DEF-0014',
    defectType: 'Bridge Expansion Joint Crack',
    severity: 'Critical',
    confidence: 0.97,
    latitude: 18.5312,
    longitude: 73.8445,
    address: 'Sangam Bridge Northbound Viaduct',
    routeId: 'RT-102',
    detectedByBusId: 'BUS-003',
    firstSeen: '2026-09-09 16:10:00',
    lastSeen: '2026-09-14 09:40:00',
    timesConfirmed: 7,
    status: 'Ticket Created',
    priority: 'P1',
    evidenceImageUrl: '/evidence/road_defect_3.jpg',
    dimensionsEstimated: '180cm gap separation, 14cm depth',
    crossVerifyingBuses: ['BUS-003', 'BUS-019', 'BUS-035', 'BUS-062'],
    segmentId: 'SEG-0545'
  },
  {
    id: 'DEF-0015',
    defectType: 'Subgrade Erosion',
    severity: 'Critical',
    confidence: 0.98,
    latitude: 18.5085,
    longitude: 73.8052,
    address: 'Kothrud DP Road near Karve Nagar Flyover',
    routeId: 'RT-104',
    detectedByBusId: 'BUS-018',
    firstSeen: '2026-09-11 06:40:00',
    lastSeen: '2026-09-14 10:10:15',
    timesConfirmed: 8,
    status: 'Cross-verified',
    priority: 'P1',
    evidenceImageUrl: '/evidence/road_defect_4.jpg',
    dimensionsEstimated: '140cm x 95cm, 22cm depth subgrade drop',
    crossVerifyingBuses: ['BUS-018', 'BUS-027', 'BUS-054', 'BUS-081'],
    segmentId: 'SEG-0580'
  },
  {
    id: 'DEF-0016',
    defectType: 'Pothole',
    severity: 'High',
    confidence: 0.95,
    latitude: 18.5621,
    longitude: 73.7712,
    address: 'Balewadi High Street Corner Corridor',
    routeId: 'RT-104',
    detectedByBusId: 'BUS-029',
    firstSeen: '2026-09-12 13:50:00',
    lastSeen: '2026-09-14 08:35:00',
    timesConfirmed: 4,
    status: 'Cross-verified',
    priority: 'P2',
    evidenceImageUrl: '/evidence/road_defect_7.jpg',
    dimensionsEstimated: '70cm x 50cm, 10cm depth',
    crossVerifyingBuses: ['BUS-029', 'BUS-034', 'BUS-076'],
    segmentId: 'SEG-0610'
  }
];

export const RoadIntelligenceView: React.FC<RoadIntelligenceViewProps> = ({
  defects: propDefects,
  onSelectDefect,
  onAddDefect
}) => {
  const [localDefects, setLocalDefects] = useState<RoadDefect[]>(DEMO_ROAD_DEFECTS);
  const defects = (propDefects && propDefects.length > 0) ? propDefects : localDefects;
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const defectTypes = [
    'ALL', 'Pothole', 'Surface Cracking', 'Waterlogging', 
    'Damaged Sign', 'Broken Divider', 'Sunken Manhole', 
    'Bridge Expansion Joint Crack', 'Subgrade Erosion'
  ];

  const filteredDefects = defects.filter(d => {
    const matchesType = filterType === 'ALL' || d.defectType === filterType;
    const matchesSearch = d.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const criticalCount = defects.filter(d => d.severity === 'Critical').length;
  const verifiedCount = defects.filter(d => d.status === 'Cross-verified').length;

  const handleCreateDemoDefect = async (presetType?: string) => {
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `DEF-${idNum}`;
    const defectType = presetType || (Math.random() > 0.4 ? 'Pothole' : (Math.random() > 0.5 ? 'Surface Cracking' : 'Sunken Manhole'));
    const severity = Math.random() > 0.3 ? 'Critical' : 'High';
    const confidence = parseFloat((0.92 + Math.random() * 0.07).toFixed(2));
    
    const locations = [
      { addr: 'Senapati Bapat Road near JW Marriott', lat: 18.5320, lng: 73.8299, rId: 'RT-101' },
      { addr: 'Koregaon Park North Main Road Lane 5', lat: 18.5365, lng: 73.8942, rId: 'RT-102' },
      { addr: 'Kalyani Nagar Joggers Park Junction', lat: 18.5491, lng: 73.9015, rId: 'RT-102' },
      { addr: 'JM Road Opp Sambhaji Park Gate', lat: 18.5195, lng: 73.8471, rId: 'RT-101' },
      { addr: 'Pashan Sus Road Underpass Entrance', lat: 18.5422, lng: 73.7912, rId: 'RT-104' },
      { addr: 'Chandani Chowk Bypass Flyover Slip Road', lat: 18.5081, lng: 73.7745, rId: 'RT-104' }
    ];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const busId = `BUS-${String(Math.floor(1 + Math.random() * 85)).padStart(3, '0')}`;
    const crossBus = `BUS-${String(Math.floor(1 + Math.random() * 85)).padStart(3, '0')}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newDefect: RoadDefect = {
      id: newId,
      defectType,
      severity,
      confidence,
      latitude: loc.lat,
      longitude: loc.lng,
      address: loc.addr,
      routeId: loc.rId,
      detectedByBusId: busId,
      firstSeen: nowStr,
      lastSeen: nowStr,
      timesConfirmed: 3,
      status: 'Cross-verified',
      priority: severity === 'Critical' ? 'P1' : 'P2',
      evidenceImageUrl: `/evidence/road_defect_${Math.floor(1 + Math.random() * 12)}.jpg`,
      dimensionsEstimated: `${Math.floor(65 + Math.random() * 40)}cm x ${Math.floor(40 + Math.random() * 30)}cm, ${Math.floor(8 + Math.random() * 10)}cm depth`,
      crossVerifyingBuses: [busId, crossBus],
      segmentId: `SEG-${Math.floor(100 + Math.random() * 800)}`
    };

    try {
      await api.createRoadDefect(newDefect);
    } catch {
      // Local fallback
    }

    if (onAddDefect) {
      onAddDefect(newDefect);
    } else {
      setLocalDefects(prev => [newDefect, ...prev]);
    }

    setNotification(`[DEMO DEFECT INJECTED] ${newId}: ${defectType} registered at ${loc.addr} (${severity} Severity, ${(confidence * 100).toFixed(0)}% Conf)`);
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-hidden font-mono select-none">
      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Top Telemetry & Filter Strip */}
      <div className="h-11 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0 text-xs gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="font-bold text-theme-primary text-[11px] whitespace-nowrap flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-brand" />
            ROAD DEFECT INVENTORY
          </span>
          
          <div className="flex items-center gap-1">
            <span className="text-graphite-400 text-[10px]">TYPE:</span>
            {defectTypes.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-0.5 text-[10px] border rounded-none whitespace-nowrap ${
                  filterType === t
                    ? 'bg-graphite-700 text-theme-primary font-bold border-graphite-600'
                    : 'bg-graphite-950 text-graphite-400 border-graphite-700 hover:bg-graphite-800'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Add Demo Defect Action Buttons */}
          <button
            onClick={() => handleCreateDemoDefect('Pothole')}
            className="px-2.5 py-1 text-[11px] font-bold bg-brand/20 border border-brand/50 text-brand hover:bg-brand/30 flex items-center gap-1 transition"
            title="Inject a real-time AI demo pothole detection"
          >
            <Plus className="w-3.5 h-3.5" />
            + INJECT POTHOLE
          </button>

          <button
            onClick={() => handleCreateDemoDefect()}
            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 hover:bg-emerald-900/60 flex items-center gap-1 transition"
            title="Simulate random AI road defect telemetry"
          >
            <Sparkles className="w-3.5 h-3.5" />
            + ADD DEMO DEFECT
          </button>

          <div className="flex items-center gap-1.5 bg-graphite-950 border border-graphite-700 px-2 py-0.5 text-xs">
            <Search className="w-3.5 h-3.5 text-graphite-400" />
            <input
              type="text"
              placeholder="SEARCH ADDRESS / ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-theme-primary placeholder-graphite-500 focus:outline-none text-[11px] w-36"
            />
          </div>

          <span className="text-[10px] text-graphite-400 whitespace-nowrap">
            TOTAL: <strong className="text-theme-primary">{defects.length}</strong> | 
            CRITICAL: <strong className="text-brand">{criticalCount}</strong> | 
            CROSS-VERIFIED: <strong className="text-emerald-500">{verifiedCount}</strong>
          </span>
        </div>
      </div>

      {/* Multi-Bus Corroboration Callout Strip */}
      <div className="bg-graphite-950 border-b border-graphite-700 px-3 py-1.5 flex items-center justify-between text-xs text-theme-secondary shrink-0">
        <div className="flex items-center gap-2">
          <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-bold text-emerald-500 text-[11px]">MULTI-BUS SPATIO-TEMPORAL GATE:</span>
          <span className="text-theme-secondary text-[11px] hidden sm:inline">
            Repeated independent observations within ±25m spatial thresholds upgrade confidence and trigger municipal Priority P1 work orders.
          </span>
        </div>
        <div className="text-[10px] text-graphite-400 font-bold whitespace-nowrap">
          FALSE POSITIVE SUPPRESSION: 99.1%
        </div>
      </div>

      {/* Defect Inventory Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-graphite-900 text-graphite-400 text-[10px] uppercase border-b border-graphite-700 sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3">DEFECT ID</th>
              <th className="py-2 px-3">ANOMALY TYPE</th>
              <th className="py-2 px-3">SEVERITY</th>
              <th className="py-2 px-3">CONFIDENCE</th>
              <th className="py-2 px-3">LOCATION / CORRIDOR</th>
              <th className="py-2 px-3">FIRST SEEN</th>
              <th className="py-2 px-3">LAST CONFIRMED</th>
              <th className="py-2 px-3">OBSERVATIONS</th>
              <th className="py-2 px-3">VERIFICATION STATE</th>
              <th className="py-2 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-700 text-theme-secondary text-[11px]">
            {filteredDefects.map(d => {
              const isVerified = d.status === 'Cross-verified';
              const isCritical = d.severity === 'Critical';

              return (
                <tr
                  key={d.id}
                  onClick={() => onSelectDefect(d)}
                  className="hover:bg-graphite-850 cursor-pointer transition group"
                >
                  <td className="py-2 px-3 font-bold font-mono text-theme-primary flex items-center gap-1.5">
                    {isCritical && <AlertTriangle className="w-3.5 h-3.5 text-brand shrink-0" />}
                    <span>{d.id}</span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-theme-primary">{d.defectType}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold border rounded-none ${
                      isCritical ? 'text-red-500 border-red-800/40 bg-red-500/10' : (d.severity === 'High' ? 'text-amber-500 border-amber-800/40 bg-amber-500/10' : 'text-graphite-400 border-graphite-700')
                    }`}>
                      {d.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-emerald-500 font-bold font-mono">{(d.confidence * 100).toFixed(0)}%</td>
                  <td className="py-2 px-3 text-theme-secondary truncate max-w-xs">{d.address}</td>
                  <td className="py-2 px-3 text-graphite-500 text-[10px] font-mono">{d.firstSeen.split(' ')[0]}</td>
                  <td className="py-2 px-3 text-graphite-400 text-[10px] font-mono">{d.lastSeen.split(' ')[1] || d.lastSeen}</td>
                  <td className="py-2 px-3 text-theme-primary font-mono">{d.timesConfirmed} BUS PASSES</td>
                  <td className="py-2 px-3">
                    {isVerified ? (
                      <span className="text-[10px] font-bold text-emerald-500 border border-emerald-800/40 bg-emerald-500/10 px-1.5 py-0.5 inline-flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        CROSS-VERIFIED
                      </span>
                    ) : (
                      <span className="text-graphite-500 text-[10px]">PENDING SECOND BUS</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button className="text-[10px] text-theme-secondary group-hover:text-theme-primary group-hover:underline">
                      INSPECT ▶
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


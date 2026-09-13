import React, { useState } from 'react';
import type { MaintenanceTicket } from '../types';
import { api } from '../services/api';
import { Search, Plus, Sparkles, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

interface MaintenanceTicketsViewProps {
  tickets: MaintenanceTicket[];
  onTicketUpdated: () => void;
  onAddTicket?: (ticket: MaintenanceTicket) => void;
}

const DEMO_TICKETS: MaintenanceTicket[] = [
  {
    id: 'MNT-0001',
    ticketCode: 'TKT-2026-1001',
    defectId: 'DEF-0001',
    defectType: 'Pothole & Asphalt Subsidence',
    priority: 'P1',
    severity: 'Critical',
    latitude: 18.5985,
    longitude: 73.7621,
    address: 'Wakad Flyover North Exit Ramp, Hinjawadi Spine',
    reportedAt: '2026-09-14 08:30:00',
    targetResolutionDate: '2026-09-15 (24H SLA)',
    status: 'IN_PROGRESS',
    assignedContractor: 'PMC Road Infra Squad #4',
    assignedDepartment: 'Road Infrastructure Maintenance Dept',
    confirmingBusesCount: 5,
    estimatedCostInr: 68000,
    evidenceImageUrl: '/evidence/road_defect_1.jpg',
    resolutionNotes: 'Asphalt cold-mix patching crew dispatched with heavy roller'
  },
  {
    id: 'MNT-0002',
    ticketCode: 'TKT-2026-1002',
    defectId: 'DEF-0003',
    defectType: 'Pothole',
    priority: 'P1',
    severity: 'Critical',
    latitude: 18.5362,
    longitude: 73.8301,
    address: 'Pune University Circle Grade Separator Gate 1',
    reportedAt: '2026-09-14 07:15:00',
    targetResolutionDate: '2026-09-15 (24H SLA)',
    status: 'ASSIGNED',
    assignedContractor: 'Pune Smart Infra Corp Ltd',
    assignedDepartment: 'Civil Infrastructure Works Division',
    confirmingBusesCount: 8,
    estimatedCostInr: 85000,
    evidenceImageUrl: '/evidence/road_defect_3.jpg',
    resolutionNotes: 'Contractor site inspection scheduled'
  },
  {
    id: 'MNT-0003',
    ticketCode: 'TKT-2026-1003',
    defectId: 'DEF-0006',
    defectType: 'Broken Divider',
    priority: 'P1',
    severity: 'High',
    latitude: 18.5441,
    longitude: 73.8862,
    address: 'Yerawada Junction Southbound Lane',
    reportedAt: '2026-09-13 14:00:00',
    targetResolutionDate: '2026-09-16 (48H SLA)',
    status: 'IN_PROGRESS',
    assignedContractor: 'Apex Civil & Highway Repairers',
    assignedDepartment: 'Traffic Infrastructure Maintenance',
    confirmingBusesCount: 6,
    estimatedCostInr: 42000,
    evidenceImageUrl: '/evidence/road_defect_6.jpg',
    resolutionNotes: 'Concrete median barrier replacement underway'
  },
  {
    id: 'MNT-0004',
    ticketCode: 'TKT-2026-1004',
    defectId: 'DEF-0007',
    defectType: 'Pothole',
    priority: 'P1',
    severity: 'Critical',
    latitude: 18.5679,
    longitude: 73.9143,
    address: 'Viman Nagar Phoenix Mall Frontage Road',
    reportedAt: '2026-09-13 11:20:00',
    targetResolutionDate: '2026-09-15 (24H SLA)',
    status: 'ASSIGNED',
    assignedContractor: 'PMC Pothole Repair Squad #2',
    assignedDepartment: 'Road Infrastructure Maintenance Dept',
    confirmingBusesCount: 7,
    estimatedCostInr: 72000,
    evidenceImageUrl: '/evidence/road_defect_7.jpg',
    resolutionNotes: 'Work order approved by Municipal Zonal Engineer'
  },
  {
    id: 'MNT-0005',
    ticketCode: 'TKT-2026-1005',
    defectId: 'DEF-0011',
    defectType: 'Subgrade Erosion / Deep Pit',
    priority: 'P1',
    severity: 'Critical',
    latitude: 18.5590,
    longitude: 73.7868,
    address: 'Baner High Street Commercial Hub Link',
    reportedAt: '2026-09-12 16:45:00',
    targetResolutionDate: '2026-09-14 (24H SLA)',
    status: 'COMPLETED',
    assignedContractor: 'Pune Smart Infra Corp Ltd',
    assignedDepartment: 'Civil Infrastructure Works Division',
    confirmingBusesCount: 9,
    estimatedCostInr: 125000,
    evidenceImageUrl: '/evidence/road_defect_11.jpg',
    resolutionNotes: 'Deep sub-base resurfaced and re-asphalted. Multi-bus re-verification confirmed.'
  }
];

export const MaintenanceTicketsView: React.FC<MaintenanceTicketsViewProps> = ({
  tickets: propTickets,
  onTicketUpdated,
  onAddTicket
}) => {
  const [localTickets, setLocalTickets] = useState<MaintenanceTicket[]>(DEMO_TICKETS);
  const tickets = (propTickets && propTickets.length > 0) ? propTickets : localTickets;

  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const statuses = ['ALL', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Verified'];

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = activeStatus === 'ALL' || t.status === activeStatus || (activeStatus === 'In Progress' && t.status === 'IN_PROGRESS') || (activeStatus === 'Resolved' && (t.status === 'COMPLETED' || t.status === 'RE_VERIFIED'));
    const matchesSearch = t.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.assignedContractor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (ticketId: string, nextStatus: string) => {
    setUpdatingId(ticketId);
    try {
      await api.updateTicketStatus(ticketId, nextStatus, `Updated to ${nextStatus} by Municipal Operator`);
      onTicketUpdated();

      setLocalTickets(prev => prev.map(t => (t.id === ticketId || t.ticketCode === ticketId) ? { ...t, status: nextStatus as any } : t));
      setNotification(`[WORK ORDER UPDATED] Work Order ${ticketId} status updated to ${nextStatus}`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error(err);
      // Fallback local state update
      setLocalTickets(prev => prev.map(t => (t.id === ticketId || t.ticketCode === ticketId) ? { ...t, status: nextStatus as any } : t));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateDemoWorkOrder = async () => {
    const nextIdx = Math.floor(1000 + Math.random() * 9000);
    const newId = `MNT-${nextIdx}`;
    const tCode = `TKT-2026-${nextIdx}`;
    const defects = ['Pothole', 'Surface Cracking', 'Sunken Manhole', 'Bridge Joint Defect'];
    const dtype = defects[Math.floor(Math.random() * defects.length)];
    const contractors = ['PMC Road Infra Squad #4', 'Pune Smart Infra Corp Ltd', 'Apex Civil & Highway Repairers'];
    const contractor = contractors[Math.floor(Math.random() * contractors.length)];
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const locations = [
      'Senapati Bapat Road near JW Marriott',
      'Koregaon Park North Main Road Junction',
      'Kalyani Nagar Joggers Park Link',
      'FC Road Opp Goodluck Cafe'
    ];
    const loc = locations[Math.floor(Math.random() * locations.length)];

    const newTicket: MaintenanceTicket = {
      id: newId,
      ticketCode: tCode,
      defectId: `DEF-${Math.floor(1000 + Math.random() * 9000)}`,
      defectType: dtype,
      priority: 'P1',
      severity: 'Critical',
      latitude: 18.5204 + (Math.random() - 0.5) * 0.08,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.08,
      address: loc,
      reportedAt: nowStr,
      targetResolutionDate: 'Within 24 Hours (P1 SLA)',
      status: 'ASSIGNED',
      assignedContractor: contractor,
      assignedDepartment: 'Road Infrastructure Maintenance Dept',
      confirmingBusesCount: 4,
      estimatedCostInr: Math.floor(45000 + Math.random() * 50000),
      evidenceImageUrl: `/evidence/road_defect_${Math.floor(1 + Math.random() * 12)}.jpg`,
      resolutionNotes: 'Dispatched emergency repair squad from ICCC portal'
    };

    try {
      await api.createMaintenanceTicket(newTicket);
    } catch {
      // Local fallback
    }

    if (onAddTicket) {
      onAddTicket(newTicket);
    } else {
      setLocalTickets(prev => [newTicket, ...prev]);
    }

    setNotification(`[WORK ORDER DISPATCHED] ${tCode}: Dispatched ${dtype} repair to ${contractor} (${loc})`);
    setTimeout(() => setNotification(null), 4500);
  };

  const p1Count = tickets.filter(t => t.priority === 'P1').length;
  const inProgressCount = tickets.filter(t => (t.status as string) === 'In Progress' || t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => (t.status as string) === 'Resolved' || t.status === 'COMPLETED' || t.status === 'RE_VERIFIED' || t.status === 'CLOSED').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-hidden font-mono select-none text-xs">
      {/* Notification Toast */}
      {notification && (
        <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-300 px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-amber-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Top Work Order Ribbon */}
      <div className="h-11 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-theme-primary flex items-center gap-1.5 whitespace-nowrap">
            <Wrench className="w-4 h-4 text-brand" />
            MUNICIPAL CIVIL MAINTENANCE WORK ORDERS
          </span>
          <div className="flex items-center gap-1">
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setActiveStatus(st)}
                className={`px-2 py-0.5 text-[10px] border rounded-none ${
                  activeStatus === st
                    ? 'bg-graphite-700 text-theme-primary font-bold border-graphite-600'
                    : 'bg-graphite-950 text-graphite-400 border-graphite-700 hover:bg-graphite-800'
                }`}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCreateDemoWorkOrder}
            className="px-2.5 py-1 text-[11px] font-bold bg-brand/20 border border-brand/50 text-brand hover:bg-brand/30 flex items-center gap-1 transition"
            title="Dispatch a new P1 civil maintenance work order"
          >
            <Plus className="w-3.5 h-3.5" />
            + DISPATCH WORK ORDER
          </button>

          <div className="flex items-center gap-1.5 bg-graphite-950 border border-graphite-700 px-2 py-0.5 text-xs">
            <Search className="w-3.5 h-3.5 text-graphite-400" />
            <input
              type="text"
              placeholder="SEARCH WORK ORDER / CONTRACTOR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-theme-primary placeholder-graphite-500 focus:outline-none text-[11px] w-40"
            />
          </div>

          <span className="text-[10px] text-graphite-400 whitespace-nowrap">
            P1 SLA (&lt;24H): <strong className="text-brand font-mono">{p1Count}</strong> | 
            IN REPAIR: <strong className="text-amber-500 font-mono">{inProgressCount}</strong> | 
            COMPLETED: <strong className="text-emerald-500 font-mono">{resolvedCount}</strong>
          </span>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-graphite-900 text-graphite-400 text-[10px] uppercase border-b border-graphite-700 sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3">WORK ORDER</th>
              <th className="py-2 px-3">DEFECT ISSUE</th>
              <th className="py-2 px-3">LOCATION</th>
              <th className="py-2 px-3">PRIORITY</th>
              <th className="py-2 px-3">ASSIGNED CONTRACTOR</th>
              <th className="py-2 px-3">CREATED</th>
              <th className="py-2 px-3">TARGET RESOLUTION SLA</th>
              <th className="py-2 px-3">EST. COST</th>
              <th className="py-2 px-3">STATUS</th>
              <th className="py-2 px-3 text-right">WORKFLOW ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-700 text-theme-secondary text-[11px]">
            {filteredTickets.map(t => {
              const isP1 = t.priority === 'P1';
              const isDone = (t.status as string) === 'Resolved' || t.status === 'COMPLETED' || t.status === 'RE_VERIFIED' || t.status === 'CLOSED';
              const isInProgress = (t.status as string) === 'In Progress' || t.status === 'IN_PROGRESS';

              return (
                <tr key={t.id} className="hover:bg-graphite-850 transition group">
                  <td className="py-2 px-3 font-bold font-mono text-theme-primary flex items-center gap-1.5">
                    {isP1 && <AlertCircle className="w-3.5 h-3.5 text-brand shrink-0" />}
                    <span>{t.ticketCode}</span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-theme-primary">{t.defectType}</td>
                  <td className="py-2 px-3 text-theme-secondary truncate max-w-xs">{t.address}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0 text-[9px] font-bold border rounded-none ${
                      isP1 ? 'text-red-500 border-red-800/40 bg-red-500/10' : (t.priority === 'P2' ? 'text-amber-500 border-amber-800/40 bg-amber-500/10' : 'text-graphite-400 border-graphite-700')
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-theme-secondary">{t.assignedContractor}</td>
                  <td className="py-2 px-3 text-graphite-500 text-[10px] font-mono">{t.reportedAt.split(' ')[0]}</td>
                  <td className="py-2 px-3 text-graphite-400 text-[10px] font-mono">{t.targetResolutionDate}</td>
                  <td className="py-2 px-3 text-emerald-500 font-bold font-mono">₹{t.estimatedCostInr.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] ${isDone ? 'text-emerald-500 font-bold' : (isInProgress ? 'text-amber-500 font-bold' : 'text-theme-secondary')}`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    {(t.status === 'Open' || t.status === 'DETECTED' || t.status === 'ASSIGNED') && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                        disabled={updatingId === t.id}
                        className="px-2 py-0.5 bg-amber-500/10 border border-amber-600/40 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded-none transition"
                      >
                        DISPATCH CREW
                      </button>
                    )}
                    {isInProgress && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                        disabled={updatingId === t.id}
                        className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-600/40 text-emerald-500 hover:bg-emerald-500/20 text-[10px] font-bold rounded-none transition"
                      >
                        MARK RESOLVED
                      </button>
                    )}
                    {isDone && (
                      <span className="text-emerald-500 font-bold text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        VERIFIED
                      </span>
                    )}
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


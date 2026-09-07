import React, { useState } from 'react';
import type { MaintenanceTicket } from '../types';
import { api } from '../services/api';
import { Search } from 'lucide-react';

interface MaintenanceTicketsViewProps {
  tickets: MaintenanceTicket[];
  onTicketUpdated: () => void;
}

export const MaintenanceTicketsView: React.FC<MaintenanceTicketsViewProps> = ({
  tickets,
  onTicketUpdated
}) => {
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statuses = ['ALL', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Verified'];

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = activeStatus === 'ALL' || t.status === activeStatus;
    const matchesSearch = t.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.assignedContractor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (ticketId: string, nextStatus: string) => {
    setUpdatingId(ticketId);
    try {
      await api.updateTicketStatus(ticketId, nextStatus, `Updated to ${nextStatus} by ICCC operator`);
      onTicketUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const p1Count = tickets.filter(t => t.priority === 'P1').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-graphite-950 overflow-hidden font-mono select-none text-xs">
      {/* Top Work Order Ribbon */}
      <div className="h-10 bg-graphite-900 border-b border-graphite-700 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-theme-primary">MUNICIPAL CIVIL MAINTENANCE WORK ORDERS</span>
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-graphite-950 border border-graphite-700 px-2 py-0.5 text-xs">
            <Search className="w-3.5 h-3.5 text-graphite-400" />
            <input
              type="text"
              placeholder="SEARCH WORK ORDER / CONTRACTOR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-theme-primary placeholder-graphite-500 focus:outline-none text-[11px] w-48"
            />
          </div>

          <span className="text-[10px] text-graphite-400">
            P1 SLA (&lt;24H): <strong className="text-brand font-mono">{p1Count}</strong> | 
            IN REPAIR: <strong className="text-amber-500 font-mono">{inProgressCount}</strong> | 
            COMPLETED: <strong className="text-emerald-500 font-mono">{resolvedCount}</strong>
          </span>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-graphite-900 text-graphite-400 text-[10px] uppercase border-b border-graphite-700 sticky top-0">
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

              return (
                <tr key={t.id} className="hover:bg-graphite-850 transition">
                  <td className="py-2 px-3 font-bold font-mono text-theme-primary">{t.ticketCode}</td>
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
                    <span className={`text-[10px] ${t.status === 'Resolved' ? 'text-emerald-500 font-bold' : (t.status === 'In Progress' ? 'text-amber-500 font-bold' : 'text-theme-secondary')}`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    {t.status === 'Open' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'In Progress')}
                        disabled={updatingId === t.id}
                        className="px-2 py-0.5 bg-amber-500/10 border border-amber-600/40 text-amber-500 hover:bg-amber-500/20 text-[10px] font-bold rounded-none"
                      >
                        DISPATCH CREW
                      </button>
                    )}
                    {t.status === 'In Progress' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'Resolved')}
                        disabled={updatingId === t.id}
                        className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-600/40 text-emerald-500 hover:bg-emerald-500/20 text-[10px] font-bold rounded-none"
                      >
                        MARK RESOLVED
                      </button>
                    )}
                    {t.status === 'Resolved' && (
                      <span className="text-emerald-500 font-bold text-[10px]">
                        ✓ VERIFIED
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

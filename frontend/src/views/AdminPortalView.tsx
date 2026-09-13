import React, { useState, useEffect } from 'react';
import { Shield, Users, Truck, Eye, Award, Settings, FileText, Database, Lock, Check, AlertTriangle, Plus, X } from 'lucide-react';
import type { User, WatchlistItem, AuditLog } from '../types';
import { api } from '../services/api';

export function AdminPortalView() {
  const [activeTab, setActiveTab] = useState<'users' | 'watchlist' | 'rewards' | 'logs'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Provision New User Modal State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<string>('Municipal Road Engineer');
  const [newUserDept, setNewUserDept] = useState('PWD Road Maintenance Division');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [uData, wData, lData] = await Promise.all([
        api.getUsers(),
        api.getWatchlist(),
        api.getAuditLogs()
      ]);
      setUsers(uData);
      setWatchlist(wData);
      setLogs(lData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  };

  const handleProvisionUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUserObj: User = {
      id: `usr_${Date.now()}`,
      username: newUserEmail.split('@')[0],
      fullName: newUserName,
      role: newUserRole as any,
      department: newUserDept,
      email: newUserEmail,
      status: 'Active',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUserObj, ...prev]);

    // Add log entry
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      userId: 'usr_admin',
      username: 'admin',
      role: 'System Admin',
      action: 'USER_PROVISIONED',
      resource: 'USER_MANAGEMENT',
      details: `Provisioned user account for ${newUserName} (${newUserRole})`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.100',
      operatorName: 'SUPER ADMIN'
    };
    setLogs(prev => [newLog, ...prev]);

    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setIsProvisionModalOpen(false);
  };

  return (
    <div className="h-full w-full bg-theme-bg text-theme-primary flex flex-col p-6 overflow-y-auto font-sans space-y-6 transition-colors select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-theme-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-brand" />
            <h1 className="text-xl font-bold tracking-tight text-theme-primary">System Administration & RBAC Portal</h1>
          </div>
          <p className="text-xs text-theme-muted font-mono mt-1">
            Manage users, permissions, watchlist definitions, reward thresholds, and system audit logs.
          </p>
        </div>
        <div className="px-3 py-1 bg-brand/10 border border-brand/40 text-brand font-mono text-xs rounded-sm flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5" />
          <span>SUPER ADMIN ACCESS ACTIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-theme-border pb-2 font-mono text-xs">
        {[
          { id: 'users', label: 'User Roles & Access', icon: Users },
          { id: 'watchlist', label: 'Vehicle Watchlist Rules', icon: Eye },
          { id: 'rewards', label: 'Reward Engine Settings', icon: Award },
          { id: 'logs', label: 'System Audit Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-theme-panel text-theme-primary font-bold border border-theme-border shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center font-mono">
            <h3 className="text-xs font-semibold uppercase text-theme-muted tracking-wider">Registered Platform Accounts ({users.length})</h3>
            <button
              onClick={() => setIsProvisionModalOpen(true)}
              className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-sm shadow-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>PROVISION NEW USER</span>
            </button>
          </div>

          <div className="bg-theme-surface border border-theme-border rounded-sm overflow-hidden text-xs shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-theme-panel text-theme-muted font-mono border-b border-theme-border text-[11px]">
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-theme-elevated">
                    <td className="p-3 font-semibold text-theme-primary">{u.fullName}</td>
                    <td className="p-3 font-mono text-brand font-bold">{u.role}</td>
                    <td className="p-3 text-theme-secondary">{u.department}</td>
                    <td className="p-3 font-mono text-theme-muted">{u.email}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-mono font-bold">
                        {u.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center font-mono">
            <h3 className="text-xs font-semibold uppercase text-theme-muted tracking-wider">Authorized ANPR Watchlist Rules ({watchlist.length})</h3>
          </div>
          <div className="bg-theme-surface border border-theme-border rounded-sm overflow-hidden text-xs">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="bg-theme-panel text-theme-muted border-b border-theme-border text-[11px]">
                  <th className="p-3">License Plate</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Reason / Description</th>
                  <th className="p-3 text-right">Added Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {watchlist.map((w) => (
                  <tr key={w.id} className="hover:bg-theme-elevated">
                    <td className="p-3 font-bold text-amber-500">{w.plateNumber}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                        w.riskLevel === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      }`}>
                        {w.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 text-theme-secondary">{w.category}</td>
                    <td className="p-3 text-theme-muted font-sans text-xs">{w.reason}</td>
                    <td className="p-3 text-right text-theme-muted">{w.addedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4 font-mono text-xs">
          <h3 className="text-xs font-semibold uppercase text-theme-muted tracking-wider">System Operational Audit Logs ({logs.length})</h3>
          <div className="bg-theme-surface border border-theme-border rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-theme-panel text-theme-muted border-b border-theme-border text-[11px]">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                  <th className="p-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-theme-elevated">
                    <td className="p-3 text-theme-muted text-[11px]">{l.timestamp}</td>
                    <td className="p-3 font-bold text-theme-primary">{l.operatorName}</td>
                    <td className="p-3 text-brand font-bold">{l.action}</td>
                    <td className="p-3 text-theme-secondary text-[11px] font-sans">{l.details}</td>
                    <td className="p-3 text-right text-theme-muted">{l.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision New User Modal */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-theme-surface border border-theme-border p-6 max-w-md w-full rounded-sm font-sans space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-theme-border pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-sm text-theme-primary">PROVISION NEW PLATFORM USER</h3>
              </div>
              <button onClick={() => setIsProvisionModalOpen(false)} className="text-theme-muted hover:text-theme-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionUser} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-theme-muted uppercase font-mono block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Inspector Rajesh Kumar"
                  className="w-full bg-theme-panel border border-theme-border rounded-sm p-2 text-theme-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-theme-muted uppercase font-mono block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. rajesh.kumar@punemunicipal.gov.in"
                  className="w-full bg-theme-panel border border-theme-border rounded-sm p-2 text-theme-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-theme-muted uppercase font-mono block mb-1">System Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full bg-theme-panel border border-theme-border rounded-sm p-2 text-theme-primary focus:outline-none focus:border-brand font-mono"
                >
                  <option value="Command Center Operator">Command Center Operator</option>
                  <option value="Municipal Road Engineer">Municipal Road Engineer</option>
                  <option value="Traffic Control Officer">Traffic Control Officer</option>
                  <option value="Fleet Administrator">Fleet Administrator</option>
                  <option value="System Admin">System Admin</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-theme-muted uppercase font-mono block mb-1">Department</label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  placeholder="e.g. PWD Road Maintenance Division 4"
                  className="w-full bg-theme-panel border border-theme-border rounded-sm p-2 text-theme-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 bg-theme-panel border border-theme-border text-theme-secondary hover:text-theme-primary rounded-sm font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-sm shadow-md font-mono"
                >
                  PROVISION USER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

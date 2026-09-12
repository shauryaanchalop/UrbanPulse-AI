import React, { useState, useEffect } from 'react';
import { Shield, Users, Truck, Eye, Award, Settings, FileText, Database, Lock, Check, AlertTriangle } from 'lucide-react';
import type { User, WatchlistItem, AuditLog, RewardRule } from '../types';
import { api } from '../services/api';

export function AdminPortalView() {
  const [activeTab, setActiveTab] = useState<'users' | 'watchlist' | 'rewards' | 'logs'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

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

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col p-6 overflow-y-auto font-sans space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">System Administration & RBAC Portal</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage users, permissions, watchlist definitions, reward thresholds, and system audit logs.
          </p>
        </div>
        <div className="px-3 py-1 bg-red-950/60 border border-red-800 text-red-400 font-mono text-xs rounded-lg flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5" />
          <span>SUPER ADMIN ACCESS ACTIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 font-mono text-xs">
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
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase text-slate-400 font-mono">Registered Platform Accounts ({users.length})</h3>
            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors">
              + Provision New User
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-880">
                    <td className="p-3 font-semibold text-white">{u.fullName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        u.role === 'SUPER ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        u.role === 'POLICE / AUTHORIZED INVESTIGATOR' ? 'bg-purple-500/20 text-purple-400' :
                        u.role === 'ROAD ENGINEER' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{u.department}</td>
                    <td className="p-3 text-slate-400 font-mono">{u.email}</td>
                    <td className="p-3 text-right">
                      <button className="text-slate-400 hover:text-white font-mono text-[11px] underline">Edit Role</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase text-slate-400 font-mono">Police Vehicle-of-Interest Watchlist ({watchlist.length})</h3>
            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors">
              + Add Vehicle to Watchlist
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {watchlist.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm font-mono">{item.plateNumber}</h4>
                    <p className="text-[11px] text-slate-400">{item.department}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                    ACTIVE WATCHLIST
                  </span>
                </div>
                <p className="text-slate-300">{item.reason}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Added By: {item.addedBy}</span>
                  <span>Valid: {item.validFrom} to {item.validUntil}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Citizen Reward Policy Configuration</h3>
          <p className="text-slate-400">Admin configurable points awarded for valid, verified, and critical citizen reports.</p>
          
          <div className="space-y-3">
            {[
              { event: 'Valid Report Submission', points: 10, desc: 'Awarded when report passes initial AI validity check' },
              { event: 'Verified Road Defect', points: 25, desc: 'Awarded when defect is confirmed by bus sensor or engineer' },
              { event: 'Critical Actionable Incident', points: 50, desc: 'Awarded for urgent public safety or accident alerts' },
              { event: 'Repair Verification Photo', points: 20, desc: 'Bonus points when citizen photo verifies municipal repair work' }
            ].map((rule) => (
              <div key={rule.event} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{rule.event}</h4>
                  <p className="text-[11px] text-slate-400">{rule.desc}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    defaultValue={rule.points}
                    className="w-16 bg-slate-900 border border-slate-700 text-center font-mono font-bold text-amber-400 py-1 rounded"
                  />
                  <span className="font-mono text-slate-500">PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
          <h3 className="text-xs font-semibold uppercase text-slate-400 font-mono">Security & Audit Activity Logs</h3>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-red-400 font-bold">{log.action}</span>
                  <span className="text-slate-400 ml-2">by {log.username} ({log.role})</span>
                  <p className="text-[11px] text-slate-300 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <div>{log.timestamp}</div>
                  <div>IP: {log.ipAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

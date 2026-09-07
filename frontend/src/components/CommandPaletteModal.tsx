import React, { useState, useEffect, useRef } from 'react';
import { Search, Bus as BusIcon, Wrench, ShieldAlert, FileText, Zap, Sun, Moon, ArrowRight, X } from 'lucide-react';
import type { Bus, RoadDefect, SafetyIncident, MaintenanceTicket } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  buses: Bus[];
  defects: RoadDefect[];
  incidents: SafetyIncident[];
  tickets: MaintenanceTicket[];
  onSelectBus: (bus: Bus) => void;
  onSelectDefect: (defect: RoadDefect) => void;
  onSelectIncident: (incident: SafetyIncident) => void;
  onNavigateTab: (tab: any) => void;
  onStartDemo: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  buses,
  defects,
  incidents,
  tickets,
  onSelectBus,
  onSelectDefect,
  onSelectIncident,
  onNavigateTab,
  onStartDemo,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Search items across all datasets
  const q = query.toLowerCase().trim();

  const matchingBuses = buses.filter(b => 
    b.id.toLowerCase().includes(q) || 
    b.fleetNumber.toLowerCase().includes(q) || 
    b.routeName.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchingDefects = defects.filter(d => 
    d.id.toLowerCase().includes(q) || 
    d.defectType.toLowerCase().includes(q) || 
    d.address.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchingIncidents = incidents.filter(i => 
    i.id.toLowerCase().includes(q) || 
    i.incidentType.toLowerCase().includes(q) || 
    i.address.toLowerCase().includes(q)
  ).slice(0, 2);

  const matchingTickets = tickets.filter(t => 
    t.ticketCode.toLowerCase().includes(q) || 
    t.address.toLowerCase().includes(q)
  ).slice(0, 2);

  const quickActions = [
    {
      id: 'action-demo',
      title: 'Run Scripted SIH 2026 Scenario (5-Minute Simulation)',
      icon: Zap,
      action: () => {
        onStartDemo();
        onClose();
      }
    },
    {
      id: 'action-theme',
      title: `Toggle Theme (Currently ${theme})`,
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        onClose();
      }
    },
    {
      id: 'action-map',
      title: 'Switch to Fullscreen Live City Map',
      icon: ArrowRight,
      action: () => {
        onNavigateTab('city-map');
        onClose();
      }
    },
    {
      id: 'action-fleet',
      title: 'Switch to Fleet Monitoring Table',
      icon: BusIcon,
      action: () => {
        onNavigateTab('bus-fleet');
        onClose();
      }
    }
  ].filter(a => !q || a.title.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-theme-surface border border-theme-border w-full max-w-2xl shadow-2xl rounded-sm overflow-hidden flex flex-col font-mono text-xs">
        {/* Search Input Bar */}
        <div className="h-12 px-3 border-b border-theme-border flex items-center gap-2.5 bg-theme-panel">
          <Search className="w-4 h-4 text-theme-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search buses, defects, incidents, tickets... (Esc to close)"
            className="w-full bg-transparent border-none text-theme-primary placeholder-theme-muted focus:outline-none text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <button
            onClick={onClose}
            className="p-1 text-theme-muted hover:text-theme-primary rounded-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Buses */}
          {matchingBuses.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] text-theme-muted uppercase tracking-wider font-bold">
                Buses ({matchingBuses.length})
              </div>
              <div className="space-y-0.5">
                {matchingBuses.map((bus) => (
                  <div
                    key={bus.id}
                    onClick={() => {
                      onSelectBus(bus);
                      onNavigateTab('bus-fleet');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 flex items-center justify-between hover:bg-theme-elevated cursor-pointer rounded-sm text-theme-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BusIcon className="w-3.5 h-3.5 text-brand" />
                      <span className="font-bold">{bus.id}</span>
                      <span className="text-theme-secondary text-[11px] truncate max-w-xs">{bus.routeName}</span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-bold">{bus.speed} km/h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Road Defects */}
          {matchingDefects.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] text-theme-muted uppercase tracking-wider font-bold">
                Road Defects ({matchingDefects.length})
              </div>
              <div className="space-y-0.5">
                {matchingDefects.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onSelectDefect(d);
                      onNavigateTab('road-intelligence');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 flex items-center justify-between hover:bg-theme-elevated cursor-pointer rounded-sm text-theme-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-bold">{d.id}</span>
                      <span className="text-[11px] font-semibold">{d.defectType}</span>
                      <span className="text-theme-secondary text-[11px] truncate max-w-xs">{d.address}</span>
                    </div>
                    <span className="text-[10px] text-brand font-bold">{d.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Incidents */}
          {matchingIncidents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] text-theme-muted uppercase tracking-wider font-bold">
                Safety Hazards ({matchingIncidents.length})
              </div>
              <div className="space-y-0.5">
                {matchingIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      onSelectIncident(inc);
                      onNavigateTab('safety-enforcement');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 flex items-center justify-between hover:bg-theme-elevated cursor-pointer rounded-sm text-theme-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-brand" />
                      <span className="font-bold">{inc.id}</span>
                      <span className="text-[11px] font-semibold">{inc.incidentType}</span>
                    </div>
                    <span className="text-[10px] text-theme-muted">{inc.busId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Orders */}
          {matchingTickets.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] text-theme-muted uppercase tracking-wider font-bold">
                Work Orders ({matchingTickets.length})
              </div>
              <div className="space-y-0.5">
                {matchingTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onNavigateTab('maintenance-tickets');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 flex items-center justify-between hover:bg-theme-elevated cursor-pointer rounded-sm text-theme-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-bold">{t.ticketCode}</span>
                      <span className="text-theme-secondary text-[11px]">{t.defectType}</span>
                    </div>
                    <span className="text-[10px] text-amber-500 font-bold">{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] text-theme-muted uppercase tracking-wider font-bold">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      onClick={action.action}
                      className="px-2.5 py-1.5 flex items-center justify-between hover:bg-theme-elevated cursor-pointer rounded-sm text-theme-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-brand" />
                        <span>{action.title}</span>
                      </div>
                      <span className="text-[10px] text-theme-muted font-mono">↵ Run</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {matchingBuses.length === 0 && matchingDefects.length === 0 && matchingIncidents.length === 0 && quickActions.length === 0 && (
            <div className="p-6 text-center text-theme-muted font-mono text-xs">
              No results matching "{query}". Press Esc to close.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="h-8 px-3 bg-theme-panel border-t border-theme-border flex items-center justify-between text-[10px] text-theme-muted">
          <span>Navigate: Click or Tab</span>
          <span className="flex items-center gap-2">
            <kbd className="px-1 py-0.5 bg-theme-elevated border border-theme-border rounded-sm">Ctrl+K</kbd> or <kbd className="px-1 py-0.5 bg-theme-elevated border border-theme-border rounded-sm">/</kbd> to open anytime
          </span>
        </div>
      </div>
    </div>
  );
};

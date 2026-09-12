import React, { useState } from 'react';
import type { UserRole } from '../types';
import { 
  Play, Pause, RotateCcw, Zap, Bell, Shield, 
  ChevronDown, ArrowLeft, Search, Command, Monitor, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './common/BrandLogo';
import { ThemeSwitcher } from './common/ThemeSwitcher';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isSimRunning: boolean;
  simSpeed: number;
  onToggleSim: () => void;
  onResetSim: () => void;
  onSetSpeed: (speed: number) => void;
  onStartDemo: () => void;
  isDemoActive: boolean;
  elapsedSeconds: number;
  unreadNotifications: number;
  recentAlerts: string[];
  onNavigateHome?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleKiosk?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isSimRunning,
  simSpeed,
  onToggleSim,
  onResetSim,
  onSetSpeed,
  onStartDemo,
  isDemoActive,
  elapsedSeconds,
  unreadNotifications,
  recentAlerts,
  onNavigateHome,
  onOpenCommandPalette,
  onToggleKiosk
}) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Pune Smart City');

  const roles: UserRole[] = [
    'Command Center Operator',
    'Municipal Road Engineer',
    'Traffic Control Officer',
    'Fleet Administrator'
  ];

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <header className="h-10 bg-theme-surface border-b border-theme-border px-3 flex items-center justify-between select-none z-30 shrink-0 font-sans text-xs transition-colors">
      {/* Left: Brand Logo, Sector, Mode */}
      <div className="flex items-center gap-3">
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1 px-2 py-1 bg-theme-panel hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary border border-theme-border text-[10px] font-mono rounded-sm transition-colors mr-1"
            title="Return to Public Architectural Showcase"
          >
            <ArrowLeft className="w-3 h-3 text-brand" />
            <span className="hidden sm:inline">PUBLIC PORTAL</span>
          </button>
        )}

        <BrandLogo 
          size="sm" 
          subtitle="MUNICIPAL ICCC" 
          className="pr-3 border-r border-theme-border" 
          onClick={onNavigateHome}
        />

        {/* Global Search Shortcut Button */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-2.5 py-0.5 bg-theme-panel hover:bg-theme-elevated text-theme-muted hover:text-theme-primary border border-theme-border text-[10px] font-mono rounded-sm transition-colors"
            title="Open Command Palette (Ctrl+K or /)"
          >
            <Search className="w-3 h-3 text-brand" />
            <span>Search...</span>
            <kbd className="px-1 text-[9px] bg-theme-elevated border border-theme-border rounded-sm">Ctrl+K</kbd>
          </button>
        )}

        {/* City Sector Selector */}
        <div className="hidden xl:flex items-center gap-1 pl-2 border-l border-theme-border text-[11px]">
          <span className="text-theme-muted font-mono">SECTOR:</span>
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-theme-panel border border-theme-border text-theme-primary px-1.5 py-0.5 focus:outline-none cursor-pointer font-mono text-[11px] rounded-sm"
          >
            <option value="Pune Smart City">PUNE METRO (32 BUSES)</option>
            <option value="Bengaluru Urban">BENGALURU URBAN (BMTC)</option>
            <option value="Delhi NCR">DELHI NCR (BRTS)</option>
          </select>
        </div>
      </div>

      {/* Center: Command Controls & Demo */}
      <div className="flex items-center gap-1.5 bg-theme-panel border border-theme-border px-1.5 py-0.5 rounded-sm">
        {/* Run Demo Button */}
        <button
          onClick={onStartDemo}
          className={`flex items-center gap-1 px-2.5 py-0.5 font-mono text-[11px] font-semibold border transition rounded-sm ${
            isDemoActive 
              ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-bold' 
              : 'bg-brand/10 border-brand/60 text-brand hover:bg-brand hover:text-white'
          }`}
          title="Run 5-minute automated SIH scenario"
        >
          <Zap className="w-3 h-3 fill-current text-brand" />
          <span>{isDemoActive ? 'DEMO ACTIVE' : 'RUN SIH DEMO'}</span>
        </button>

        {/* Digital Clock */}
        <div className="px-2 font-mono text-[11px] text-theme-primary bg-theme-surface border-l border-r border-theme-border">
          {formatElapsed(elapsedSeconds)}
        </div>

        {/* Simulation Play / Pause */}
        <button
          onClick={onToggleSim}
          className="px-2 py-0.5 text-[11px] font-mono border border-theme-border hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary flex items-center gap-1 rounded-sm"
          title={isSimRunning ? 'Pause simulation loop' : 'Resume simulation loop'}
        >
          {isSimRunning ? <Pause className="w-3 h-3 text-emerald-500" /> : <Play className="w-3 h-3 text-amber-500" />}
          <span>{isSimRunning ? 'RUNNING' : 'PAUSED'}</span>
        </button>

        {/* Speed Controls */}
        <div className="hidden sm:flex items-center">
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-1.5 py-0.5 text-[10px] font-mono border-r border-y border-theme-border first:border-l ${
                simSpeed === s ? 'bg-brand text-white font-bold' : 'text-theme-muted hover:text-theme-primary bg-theme-panel'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={onResetSim}
          className="p-1 text-theme-muted hover:text-brand hover:bg-theme-elevated transition rounded-sm"
          title="Reset simulation and re-seed database"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Right: Kiosk Button, Theme Switcher, Alerts & Operator Profile */}
      <div className="flex items-center gap-2">
        {onToggleKiosk && (
          <button
            onClick={onToggleKiosk}
            className="flex items-center gap-1 px-2 py-0.5 bg-theme-panel hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary border border-theme-border text-[10px] font-mono rounded-sm transition-colors"
            title="Full-Screen Command Center Video Wall Display (Key 'K')"
          >
            <Monitor className="w-3 h-3 text-brand" />
            <span className="hidden sm:inline">KIOSK</span>
          </button>
        )}

        {/* Application Theme Switcher */}
        <ThemeSwitcher compact />

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1 text-theme-muted hover:text-theme-primary hover:bg-theme-elevated relative transition border border-transparent hover:border-theme-border rounded-sm"
            title="Operational Alerts"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-white text-[9px] font-mono font-bold px-1 rounded-none leading-tight">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1 w-80 bg-theme-surface border border-theme-border shadow-2xl z-50 text-xs rounded-sm">
              <div className="p-2 border-b border-theme-border bg-theme-panel flex justify-between items-center font-mono">
                <span className="text-[11px] font-bold text-theme-primary">REAL-TIME INCIDENT STREAM</span>
                <span className="text-[10px] text-theme-muted">PUNE METRO</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-theme-border">
                {recentAlerts.map((alert, idx) => (
                  <div key={idx} className="p-2 hover:bg-theme-elevated text-[11px] text-theme-secondary font-mono">
                    <span className="text-brand mr-1.5 font-bold">•</span>
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operator Profile */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 bg-theme-panel border border-theme-border px-2 py-0.5 text-[11px] text-theme-primary hover:bg-theme-elevated font-mono rounded-sm"
          >
            <Shield className="w-3 h-3 text-theme-muted" />
            <span className="hidden md:inline truncate max-w-[130px]">{currentRole.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 text-theme-muted" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-theme-surface border border-theme-border shadow-2xl z-50 p-1 rounded-sm">
              <div className="text-[9px] font-mono text-theme-muted px-2 py-1 uppercase tracking-wider">
                Operator Role
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    onRoleChange(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-[11px] font-mono flex items-center justify-between rounded-sm ${
                    currentRole === r ? 'bg-brand/10 text-brand font-bold' : 'text-theme-secondary hover:bg-theme-elevated'
                  }`}
                >
                  <span>{r}</span>
                  {currentRole === r && <span className="text-brand text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

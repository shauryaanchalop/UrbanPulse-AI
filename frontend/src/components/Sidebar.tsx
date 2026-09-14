import React from 'react';
import { 
  LayoutDashboard, Map, Bus, Cpu, Wrench, 
  TrendingUp, ShieldAlert, FileText, Network, HeartPulse, BarChart3,
  Video, UserCheck, Target, Settings, Heart, Camera
} from 'lucide-react';

export type NavTab = 
  | 'command-center'
  | 'city-map'
  | 'bus-fleet'
  | 'ai-perception'
  | 'live-vision'
  | 'road-intelligence'
  | 'traffic-intelligence'
  | 'safety-enforcement'
  | 'womens-safety'
  | 'evidence-retrieval'
  | 'survey-missions'
  | 'citizen-portal'
  | 'maintenance-tickets'
  | 'admin-portal'
  | 'analytics'
  | 'architecture'
  | 'system-health';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  openTicketsCount: number;
  criticalIncidentsCount: number;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  openTicketsCount,
  criticalIncidentsCount,
  userRole = 'MUNICIPAL OPERATOR'
}) => {
  const roleUpper = userRole.toUpperCase();

  // Role filtering mapping
  const roleAllowedTabs: Record<string, NavTab[]> = {
    CITIZEN: ['citizen-portal'],
    'FLEET OPERATOR': ['bus-fleet', 'live-vision', 'ai-perception', 'survey-missions'],
    INVESTIGATOR: ['evidence-retrieval', 'safety-enforcement', 'womens-safety', 'city-map'],
    'MUNICIPAL OPERATOR': ['command-center', 'city-map', 'road-intelligence', 'traffic-intelligence', 'safety-enforcement', 'maintenance-tickets', 'survey-missions', 'analytics'],
    'SYSTEM ADMIN': ['admin-portal', 'command-center', 'city-map', 'bus-fleet', 'ai-perception', 'live-vision', 'road-intelligence', 'traffic-intelligence', 'safety-enforcement', 'womens-safety', 'evidence-retrieval', 'survey-missions', 'citizen-portal', 'maintenance-tickets', 'analytics', 'architecture', 'system-health']
  };

  const allowedTabs = (roleUpper.includes('CITIZEN') ? roleAllowedTabs.CITIZEN :
                    roleUpper.includes('FLEET') ? roleAllowedTabs['FLEET OPERATOR'] :
                    roleUpper.includes('INVESTIGATOR') || roleUpper.includes('POLICE') ? roleAllowedTabs.INVESTIGATOR :
                    roleUpper.includes('ADMIN') ? roleAllowedTabs['SYSTEM ADMIN'] :
                    roleAllowedTabs['MUNICIPAL OPERATOR']);

  const allSections = [
    {
      title: 'PRIMARY PORTALS',
      items: [
        { id: 'command-center' as NavTab, label: 'COMMAND CENTER', icon: LayoutDashboard },
        { id: 'citizen-portal' as NavTab, label: 'PUBLIC REPORTING', icon: UserCheck },
        { id: 'bus-fleet' as NavTab, label: 'FLEET MONITORING', icon: Bus },
        { id: 'admin-portal' as NavTab, label: 'SYSTEM ADMIN', icon: Settings },
      ]
    },
    {
      title: 'URBAN INTELLIGENCE',
      items: [
        { id: 'city-map' as NavTab, label: 'LIVE CITY MAP', icon: Map },
        { id: 'road-intelligence' as NavTab, label: 'ROAD DEFECTS', icon: Wrench },
        { id: 'survey-missions' as NavTab, label: 'SURVEY MISSIONS', icon: Target },
        { id: 'traffic-intelligence' as NavTab, label: 'TRAFFIC FLOW', icon: TrendingUp },
        { 
          id: 'safety-enforcement' as NavTab, 
          label: 'SAFETY & ANPR', 
          icon: ShieldAlert, 
          badge: criticalIncidentsCount > 0 ? criticalIncidentsCount : undefined,
          badgeColor: 'text-brand bg-brand/10 border-brand/40'
        },
        { id: 'womens-safety' as NavTab, label: 'DISTRESS SAFETY', icon: Heart },
        { id: 'evidence-retrieval' as NavTab, label: 'EVIDENCE PORTAL', icon: Video },
        { id: 'live-vision' as NavTab, label: 'LIVE CAMERA VISION', icon: Camera },
        { id: 'ai-perception' as NavTab, label: 'EDGE AI PIPELINE', icon: Cpu },
      ]
    },
    {
      title: 'MUNICIPAL OPERATIONS',
      items: [
        { 
          id: 'maintenance-tickets' as NavTab, 
          label: 'WORK ORDERS', 
          icon: FileText, 
          badge: openTicketsCount > 0 ? openTicketsCount : undefined,
          badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30'
        },
        { id: 'analytics' as NavTab, label: 'INFRA ANALYTICS', icon: BarChart3 },
      ]
    },
    {
      title: 'SYSTEM TOPOLOGY',
      items: [
        { id: 'architecture' as NavTab, label: 'EDGE SPECS', icon: Network },
        { id: 'system-health' as NavTab, label: 'SYSTEM TELEMETRY', icon: HeartPulse },
      ]
    }
  ];

  // Filter sections by role allowed tabs
  const sections = allSections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => allowedTabs.includes(item.id))
  })).filter(sec => sec.items.length > 0);

  return (
    <aside className="w-56 bg-theme-surface/95 backdrop-blur-md border-r border-theme-border flex flex-col justify-between select-none shrink-0 font-sans transition-all shadow-lg">
      <div className="py-2 flex flex-col gap-2.5 overflow-y-auto">
        {/* Role & Status Header */}
        <div className="px-3 py-1.5 bg-brand/10 border-b border-theme-border flex items-center justify-between font-sans">
          <span className="text-[10px] font-bold text-brand uppercase tracking-wider">{userRole}</span>
          <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </span>
        </div>

        {/* Edge AI Vision Model Card (Clickable to Access Model) */}
        <button 
          onClick={() => onTabChange('ai-perception')}
          className="mx-2 p-2 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/40 hover:border-emerald-400 rounded-sm text-[10px] font-sans space-y-1 text-left transition-all cursor-pointer shadow-sm group"
          title="Click to Access & Inspect Real YOLOv8 Edge ML Model"
        >
          <div className="flex justify-between items-center text-emerald-400 font-bold group-hover:text-emerald-300">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
              YOLOv8 EDGE ML
            </span>
            <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1 rounded-sm border border-emerald-500/40">89.4%</span>
          </div>
          <div className="text-[9px] text-theme-muted flex justify-between font-sans">
            <span>Model: yolo8n-edge</span>
            <span className="font-mono">45 FPS</span>
          </div>
        </button>

        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="flex flex-col">
            <div className="px-3 py-1 text-[9px] font-sans font-bold text-theme-muted uppercase tracking-wider border-b border-theme-border/40 pb-0.5 mb-0.5">
              {sec.title}
            </div>
            {sec.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center justify-between px-3 py-2 text-[11px] font-sans transition-all text-left relative group ${
                    isActive
                      ? 'bg-theme-elevated/90 text-theme-primary font-bold border-r-2 border-brand shadow-sm'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated/60 font-medium'
                  }`}
                >
                  {/* Vertical Crimson Red Glow Indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span>
                  )}

                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-brand scale-110' : 'text-theme-muted group-hover:text-theme-primary'}`} />
                    <span className="truncate tracking-tight">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[9px] font-mono px-1 py-0.5 border font-bold rounded-sm shadow-sm ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Operational Footer Info */}
      <div className="p-2.5 border-t border-theme-border bg-theme-panel text-[10px] font-sans text-theme-muted flex flex-col gap-1">
        <div className="flex justify-between items-center text-theme-secondary font-semibold">
          <span>ROLE SCOPE</span>
          <span className="text-emerald-400 font-bold">{allowedTabs.length} MODULES</span>
        </div>
        <div className="flex justify-between text-[9px] text-theme-muted">
          <span>BUILD: 2026.1-PROD</span>
          <span className="text-brand font-bold">SIH 2026</span>
        </div>
      </div>
    </aside>
  );
};

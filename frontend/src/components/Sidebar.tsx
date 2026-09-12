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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  openTicketsCount,
  criticalIncidentsCount
}) => {
  const sections = [
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

  return (
    <aside className="w-52 bg-theme-surface border-r border-theme-border flex flex-col justify-between select-none shrink-0 font-sans transition-colors">
      <div className="py-2 flex flex-col gap-3 overflow-y-auto">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="flex flex-col">
            <div className="px-3 py-1 text-[9px] font-mono font-bold text-theme-muted uppercase tracking-wider">
              {sec.title}
            </div>
            {sec.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center justify-between px-3 py-1.5 text-[11px] font-mono transition-colors text-left relative ${
                    isActive
                      ? 'bg-theme-elevated text-theme-primary font-bold'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated/60'
                  }`}
                >
                  {/* Subtle 2px Vertical Crimson Red Indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand"></span>
                  )}

                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand' : 'text-theme-muted'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[9px] font-mono px-1 py-0 border font-bold rounded-none ${item.badgeColor}`}>
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
      <div className="p-2 border-t border-theme-border bg-theme-panel text-[10px] font-mono text-theme-muted flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-theme-secondary">
          <span>EDGE CLUSTER</span>
          <span className="text-emerald-500 font-semibold">32/32 ONLINE</span>
        </div>
        <div className="text-[9px] text-theme-muted truncate">
          BUILD: 2026.1-PROD-RC
        </div>
      </div>
    </aside>
  );
};


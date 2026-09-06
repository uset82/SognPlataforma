import React from 'react';
import {
  LayoutDashboard,
  Waves,
  Network,
  Megaphone,
  HeartPulse,
  Users,
  Anchor,
  Presentation,
  PanelLeftClose,
  PanelLeftOpen,
  CircleDot,
} from 'lucide-react';

import { useIncident, type PlatformModule } from '../../state/IncidentContext';
import s from './shell.module.css';

interface NavEntry {
  id: PlatformModule;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavEntry[];
}

export const CommandRail: React.FC<{
  collapsed: boolean;
  onToggle: () => void;
}> = ({ collapsed, onToggle }) => {
  const { activeModule, setActiveModule, unacknowledgedDistressCount, helpRequests } = useIncident();

  const groups: NavGroup[] = [
    {
      label: 'Situation',
      items: [
        { id: 'dashboard', label: 'Incident dashboard', icon: <LayoutDashboard size={16} strokeWidth={1.5} /> },
        { id: 'gis-map', label: 'Risk map', icon: <Waves size={16} strokeWidth={1.5} /> },
        { id: 'agents', label: 'Agent orchestration', icon: <Network size={16} strokeWidth={1.5} /> },
      ],
    },
    {
      label: 'Response',
      items: [
        { id: 'medical', label: 'Medical & rescue', icon: <HeartPulse size={16} strokeWidth={1.5} /> },
        {
          id: 'triage',
          label: 'Civilian triage',
          icon: <Users size={16} strokeWidth={1.5} />,
          badge: unacknowledgedDistressCount || undefined,
        },
        { id: 'fjordlink', label: 'FjordLink landing', icon: <Anchor size={16} strokeWidth={1.5} /> },
      ],
    },
    {
      label: 'Communication',
      items: [
        { id: 'public-alert', label: 'Public alert', icon: <Megaphone size={16} strokeWidth={1.5} /> },
      ],
    },
    {
      label: 'System',
      items: [
        { id: 'presentation', label: 'Concept & pitch', icon: <Presentation size={16} strokeWidth={1.5} /> },
      ],
    },
  ];

  return (
    <aside className={`${s.rail} ${collapsed ? s.railCollapsed : ''}`}>
      <div className={s.brand}>
        <img className={s.brandMark} src="/sogn-safe-crest.png" alt="" aria-hidden="true" />
        <span className={s.brandText}>
          <span className={s.brandName}>SOGN SAFE</span>
          <span className={s.brandSub}>Emergency coordination</span>
        </span>
      </div>

      <nav className={s.nav} aria-label="Platform modules">
        {groups.map((g) => (
          <div className={s.navGroup} key={g.label}>
            <span className={s.navGroupLabel}>{g.label}</span>
            {g.items.map((item) => (
              <button
                key={item.id}
                type="button"
                title={collapsed ? item.label : undefined}
                // The label span is display:none on narrow viewports, which would
                // otherwise leave these buttons unnamed in the a11y tree.
                aria-label={item.label}
                aria-current={activeModule === item.id ? 'page' : undefined}
                className={`${s.navItem} ${activeModule === item.id ? s.navItemActive : ''}`}
                onClick={() => setActiveModule(item.id)}
              >
                <span className={s.navIcon}>{item.icon}</span>
                <span className={s.navLabel}>{item.label}</span>
                {item.badge ? (
                  <span className={s.navBadge} aria-label={`${item.badge} unacknowledged`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className={s.railFoot}>
        <span className={s.railFootRow}>
          <CircleDot size={11} strokeWidth={2} color="var(--safe-on)" />
          Simulator linked · {helpRequests.length} signals
        </span>
        {/* rules.md §4.4 — disclaimer belongs in the chrome, present on every screen. */}
        <span className={s.disclaimer}>
          INN524 innovation prototype · training / drill only · not connected to statutory dispatch
        </span>
        <button
          type="button"
          className={s.navItem}
          onClick={onToggle}
          aria-label={collapsed ? 'Expand navigation rail' : 'Collapse navigation rail'}
          aria-expanded={!collapsed}
        >
          <span className={s.navIcon}>
            {collapsed ? <PanelLeftOpen size={16} strokeWidth={1.5} /> : <PanelLeftClose size={16} strokeWidth={1.5} />}
          </span>
          <span className={s.navLabel}>Collapse rail</span>
        </button>
      </div>
    </aside>
  );
};

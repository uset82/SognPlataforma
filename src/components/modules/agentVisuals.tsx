import React from 'react';
import {
  Ship,
  BrainCircuit,
  TriangleAlert,
  ClipboardList,
  Cross,
  Shield,
  Flame,
  LifeBuoy,
  Anchor,
  Landmark,
  Bus,
  Megaphone,
  Users,
  Newspaper,
  Zap,
  RadioTower,
  Package,
  Bot,
} from 'lucide-react';

import type { AgentOperationalStatus } from '../../types/agents';
import type { Tone } from '../primitives';

/* One icon per agent, keyed by the ids already defined in src/data/agents.ts.
   Icons are never decorative here — each is the agent's identity in the tree,
   the strip and the activity feed, so they must stay stable across modules. */
const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  ship: Ship,
  main: BrainCircuit,
  risk: TriangleAlert,
  response: ClipboardList,
  hospital: Cross,
  police: Shield,
  fire: Flame,
  coastguard: LifeBuoy,
  harbour: Anchor,
  municipal: Landmark,
  transport: Bus,
  public_alert: Megaphone,
  citizen: Users,
  media: Newspaper,
  power: Zap,
  telecom: RadioTower,
  logistics: Package,
};

export const AgentIcon: React.FC<{ id: string; size?: number; strokeWidth?: number }> = ({
  id,
  size = 16,
  strokeWidth = 1.5,
}) => {
  const Cmp = ICONS[id] ?? Bot;
  return <Cmp size={size} strokeWidth={strokeWidth} />;
};

/* Agent status maps onto the product's four semantic meanings — no new colours. */
export const statusTone = (status: AgentOperationalStatus): Tone => {
  switch (status) {
    case 'alert':
      return 'critical';
    case 'transmitting':
      return 'warning';
    case 'active':
      return 'safe';
    case 'standby':
    default:
      return 'neutral';
  }
};

export const statusColor = (status: AgentOperationalStatus): string => {
  switch (status) {
    case 'alert':
      return 'var(--critical-on)';
    case 'transmitting':
      return 'var(--warning-on)';
    case 'active':
      return 'var(--safe-on)';
    case 'standby':
    default:
      return 'var(--text-faint)';
  }
};

export const GROUP_LABEL: Record<string, string> = {
  input: 'Input & sensing',
  orchestration: 'Orchestration',
  response: 'Response',
  public: 'Public & civilian',
  support: 'Support',
};

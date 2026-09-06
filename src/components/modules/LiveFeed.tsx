import React from 'react';
import { useIncident } from '../../state/IncidentContext';
import { Panel, Pill, EmptyState } from '../primitives';
import { AgentIcon, statusColor } from './agentVisuals';
import type { AgentLogMessage } from '../../types/agents';
import s from './modules.module.css';

const toneFor = (type: AgentLogMessage['type']): string => {
  switch (type) {
    case 'ALERT':
      return 'var(--critical-on)';
    case 'AUTHORIZATION_REQUEST':
      return 'var(--warning-on)';
    case 'ACTION':
      return 'var(--safe-on)';
    default:
      return 'var(--fjord-on)';
  }
};

/**
 * The live activity feed. Newest first, capped so the panel never becomes an
 * unreadable wall — the full record lives in the orchestration module.
 */
export const LiveFeed: React.FC<{ limit?: number; title?: string }> = ({
  limit = 40,
  title = 'Live updates',
}) => {
  const { logMessages } = useIncident();
  const items = [...logMessages].reverse().slice(0, limit);

  return (
    <Panel
      title={title}
      actions={
        <Pill tone="critical" live>
          Live
        </Pill>
      }
      bodyClassName={s.feed}
    >
      {items.length === 0 ? (
        <EmptyState>No agent activity recorded yet</EmptyState>
      ) : (
        items.map((m) => (
          <div className={s.feedItem} key={m.id}>
            <span className={s.feedTime}>{m.timestamp.slice(0, 5)}</span>
            <span className={s.feedDot} style={{ color: toneFor(m.type) }}>
              <AgentIcon id={m.agentId} size={13} strokeWidth={1.8} />
            </span>
            <span className={s.feedBody}>
              <span className={s.feedText}>{m.content}</span>
              <span className={s.feedMeta}>
                {m.agentName} · {m.stageT}
                {m.type === 'AUTHORIZATION_REQUEST' &&
                  (m.authorized ? ' · authorised' : ' · awaiting sign-off')}
              </span>
            </span>
          </div>
        ))
      )}
    </Panel>
  );
};

/** Compact agent roster used on the dashboard. */
export const AgentStrip: React.FC = () => {
  const { agents, setActiveModule } = useIncident();
  return (
    <Panel
      title="Connected agents"
      actions={<Pill tone="neutral">{agents.length} online</Pill>}
      bodyClassName={s.agentStrip}
    >
      {agents.map((a) => (
        <button
          key={a.id}
          type="button"
          className={s.agentChip}
          onClick={() => setActiveModule('agents')}
          title={a.role}
        >
          <span className={s.agentChipIcon}>
            <AgentIcon id={a.id} size={17} />
          </span>
          <span className={s.agentChipName}>
            {a.name.replace(' AGENT', '').replace(' / ORCHESTRATOR', '')}
          </span>
          <span className={s.agentChipState}>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: statusColor(a.status),
                display: 'inline-block',
              }}
            />
            {a.status}
          </span>
        </button>
      ))}
    </Panel>
  );
};

import React, { useMemo, useState } from 'react';
import { User, ChevronRight, ShieldCheck } from 'lucide-react';

import { Button, Eyebrow, Panel, Pill, EmptyState } from '../primitives';
import { AgentIcon, statusColor, statusTone, GROUP_LABEL } from './agentVisuals';
import { useIncident } from '../../state/IncidentContext';
import type { EmergencyAgent } from '../../types/agents';
import s from './modules.module.css';

/* ============================================================================
   MODULE 3 — AGENT ORCHESTRATION  (mockup 3)

   The hierarchy is the message: a human captain at the top, the orchestrator
   carrying the most visual weight, and specialised agents fanning out beneath.
   Structure is communicated with hairlines and hierarchy — never with a
   glowing neural-network graphic.
   ============================================================================ */

const TreeNode: React.FC<{
  agent?: EmergencyAgent;
  name?: string;
  meta?: string;
  icon?: React.ReactNode;
  main?: boolean;
  onClick?: () => void;
}> = ({ agent, name, meta, icon, main, onClick }) => (
  <button
    type="button"
    className={`${s.treeNode} ${main ? s.treeNodeMain : ''}`}
    onClick={onClick}
    title={agent?.role}
  >
    <span style={{ color: agent ? statusColor(agent.status) : 'var(--fjord-on)', flex: 'none' }}>
      {icon ?? <AgentIcon id={agent?.id ?? ''} size={main ? 20 : 16} />}
    </span>
    <span style={{ minWidth: 0 }}>
      <span className={s.treeName}>
        {name ?? agent?.name.replace(' / ORCHESTRATOR', '')}
      </span>
      <span className={s.treeMeta}>
        {agent && (
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: statusColor(agent.status),
              display: 'inline-block',
            }}
          />
        )}
        {meta ?? agent?.status}
      </span>
    </span>
  </button>
);

export const AgentOrchestration: React.FC = () => {
  const { agents, logMessages, authorizeAgentMessage } = useIncident();
  const [selected, setSelected] = useState<EmergencyAgent | null>(null);

  const byId = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a])), [agents]);
  const ship = byId.ship;
  const main = byId.main;
  const branch = agents.filter((a) => a.id !== 'ship' && a.id !== 'main');

  const counts = useMemo(() => {
    const c: Record<string, number> = { active: 0, transmitting: 0, standby: 0, alert: 0 };
    agents.forEach((a) => {
      c[a.status] = (c[a.status] ?? 0) + 1;
    });
    return c;
  }, [agents]);

  const total = agents.length;
  const donut = [
    { key: 'active', label: 'Active', color: 'var(--safe-on)' },
    { key: 'transmitting', label: 'Transmitting', color: 'var(--warning-on)' },
    { key: 'alert', label: 'Alert', color: 'var(--critical-on)' },
    { key: 'standby', label: 'Standby', color: 'var(--text-faint)' },
  ];

  /* Single-ring donut drawn with stroke-dasharray — no chart library needed. */
  const R = 26;
  const C = 2 * Math.PI * R;
  let offset = 0;

  const pendingAuth = logMessages.filter(
    (m) => m.type === 'AUTHORIZATION_REQUEST' && !m.authorized
  );

  return (
    <div className={`${s.module} ${s.orch}`}>
      <Panel
        className={s.orchTree}
        title="Agent orchestration"
        eyebrow="System overview"
        actions={<Pill tone="neutral">{total} agents</Pill>}
      >
        <div className={s.tree}>
          <TreeNode
            name="Human / Captain"
            meta="Statutory authority"
            icon={<User size={16} strokeWidth={1.6} />}
          />
          <span className={s.treeStem} />

          {ship && <TreeNode agent={ship} onClick={() => setSelected(ship)} />}
          <span className={s.treeStem} />

          {main && <TreeNode agent={main} main onClick={() => setSelected(main)} />}
          <span className={s.treeStem} />

          <div className={s.treeFan}>
            <div className={s.treeRow}>
              <span className={s.treeBus} />
              {branch.map((a) => (
                <TreeNode key={a.id} agent={a} onClick={() => setSelected(a)} />
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        className={s.orchLog}
        title={selected ? selected.name : 'Agent activity'}
        eyebrow={selected ? GROUP_LABEL[selected.group] : 'Live trace'}
        actions={
          selected ? (
            <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
              Back to trace
            </Button>
          ) : (
            <Pill tone="critical" live>
              Live
            </Pill>
          )
        }
        bodyClassName={s.feed}
      >
        {selected ? (
          <div style={{ padding: 'var(--s4)', display: 'grid', gap: 'var(--s3)' }}>
            <div>
              <Eyebrow>Role</Eyebrow>
              <p style={{ marginTop: 4 }}>{selected.role}</p>
            </div>
            <div>
              <Eyebrow>Receives</Eyebrow>
              <p style={{ marginTop: 4, color: 'var(--text-lo)' }}>{selected.inputDescription}</p>
            </div>
            <div>
              <Eyebrow>Emits</Eyebrow>
              <p style={{ marginTop: 4, color: 'var(--text-lo)' }}>{selected.outputDescription}</p>
            </div>
            <div>
              <Eyebrow>Example message</Eyebrow>
              <p
                style={{
                  marginTop: 4,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--t-11)',
                  color: 'var(--text)',
                  background: 'var(--ground-2)',
                  padding: 'var(--s3)',
                  borderRadius: 'var(--r-sm)',
                }}
              >
                {selected.exampleMessage}
              </p>
            </div>
            {selected.requiresHumanAuthorization && (
              <Pill tone="warning">Human authorisation required before dispatch</Pill>
            )}
          </div>
        ) : logMessages.length === 0 ? (
          <EmptyState>No agent activity recorded yet</EmptyState>
        ) : (
          [...logMessages].reverse().map((m) => (
            <div className={s.feedItem} key={m.id}>
              <span className={s.feedTime}>{m.timestamp.slice(0, 5)}</span>
              <span className={s.feedDot} style={{ color: statusColor(byId[m.agentId]?.status ?? 'standby') }}>
                <AgentIcon id={m.agentId} size={13} strokeWidth={1.8} />
              </span>
              <span className={s.feedBody}>
                <span className={s.feedText}>{m.content}</span>
                <span className={s.feedMeta}>
                  {m.agentName} · {m.stageT}
                </span>
              </span>
            </div>
          ))
        )}
      </Panel>

      <div className={s.orchInsights}>
        <Panel title="Agent status" eyebrow="Summary">
          <div className={s.donutWrap}>
            <svg width="66" height="66" viewBox="0 0 66 66" role="img" aria-label="Agent status distribution">
              <circle cx="33" cy="33" r={R} fill="none" stroke="var(--line)" strokeWidth="8" />
              {donut.map((d) => {
                const value = counts[d.key] ?? 0;
                const len = (value / total) * C;
                const el = (
                  <circle
                    key={d.key}
                    cx="33"
                    cy="33"
                    r={R}
                    fill="none"
                    stroke={d.color}
                    strokeWidth="8"
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 33 33)"
                  />
                );
                offset += len;
                return el;
              })}
            </svg>
            <div className={s.donutLegend}>
              {donut.map((d) => (
                <span className={s.legendRow} key={d.key}>
                  <span
                    style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, flex: 'none' }}
                  />
                  {d.label}
                  <b>{counts[d.key] ?? 0}</b>
                </span>
              ))}
            </div>
          </div>
        </Panel>

        <Panel
          title="Operational insights"
          eyebrow="Awaiting sign-off"
          actions={
            pendingAuth.length > 0 ? (
              <Pill tone="warning">{pendingAuth.length}</Pill>
            ) : (
              <Pill tone="safe">Clear</Pill>
            )
          }
          className={s.scrollPanel}
        >
          {pendingAuth.length === 0 ? (
            <EmptyState>
              <span>
                <ShieldCheck size={20} strokeWidth={1.4} />
                <br />
                No actions awaiting human authorisation
              </span>
            </EmptyState>
          ) : (
            pendingAuth.map((m) => (
              <div className={s.insightRow} key={m.id}>
                <span style={{ color: 'var(--warning-on)', paddingTop: 2 }}>
                  <AgentIcon id={m.agentId} size={16} />
                </span>
                <span>
                  <span className={s.insightName}>
                    {m.agentName}
                    <Pill tone={statusTone(byId[m.agentId]?.status ?? 'standby')}>
                      {byId[m.agentId]?.status ?? 'standby'}
                    </Pill>
                  </span>
                  <span className={s.insightText}>{m.content}</span>
                </span>
                <Button size="sm" variant="warning" onClick={() => authorizeAgentMessage(m.id)}>
                  Authorise
                </Button>
              </div>
            ))
          )}
        </Panel>

        <Panel title="Agent roster" eyebrow="By group" className={s.scrollPanel}>
          {agents.map((a) => (
            <button key={a.id} type="button" className={s.insightRow} onClick={() => setSelected(a)}>
              <span style={{ color: statusColor(a.status), paddingTop: 2 }}>
                <AgentIcon id={a.id} size={16} />
              </span>
              <span>
                <span className={s.insightName}>{a.name}</span>
                <span className={s.insightText}>{a.statusText}</span>
              </span>
              <ChevronRight size={14} strokeWidth={1.6} color="var(--text-faint)" />
            </button>
          ))}
        </Panel>
      </div>
    </div>
  );
};

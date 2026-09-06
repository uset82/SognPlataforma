import React, { useState } from 'react';
import { Siren, Check, Radio, ShieldCheck, MapPin } from 'lucide-react';

import { IncidentMap } from '../../map/IncidentMap';
import { Button, DataTable, Eyebrow, Metric, Panel, Pill, type Column, type Tone } from '../primitives';
import { useIncident } from '../../state/IncidentContext';
import { humanise, latLon, meters, num, timeOnly } from '../../lib/format';
import type { CivilianHelpRequest, TriageSeverity } from '../../types/civilian';
import s from './modules.module.css';

/* ============================================================================
   CIVILIAN TRIAGE
   Incoming "I need help" signals from the civilian app, with a map that
   selects both ways: click a row to focus the pin, click a pin to focus a row.
   ============================================================================ */

const severityTone: Record<TriageSeverity, Tone> = {
  CRITICAL: 'critical',
  URGENT: 'warning',
  STANDARD: 'fjord',
  NON_URGENT: 'neutral',
};

const stateTone = (state: CivilianHelpRequest['state']): Tone =>
  state === 'RESCUED' ? 'safe' : state === 'RECEIVED' ? 'critical' : 'warning';

export const CivilianTriage: React.FC = () => {
  const { helpRequests, musterRecords, incident, acknowledgeHelpRequest, updateHelpRequestState } =
    useIncident();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TriageSeverity | 'ALL'>('ALL');

  const rows = helpRequests.filter((r) => filter === 'ALL' || r.severity === filter);
  const selected = helpRequests.find((r) => r.id === selectedId) ?? null;

  const cols: Array<Column<CivilianHelpRequest>> = [
    { key: 'time', header: 'Time', render: (r) => timeOnly(r.timestamp) },
    { key: 'who', header: 'Civilian', render: (r) => r.civilianAlias },
    { key: 'cond', header: 'Condition', render: (r) => humanise(r.condition) },
    {
      key: 'sev',
      header: 'Severity',
      render: (r) => <Pill tone={severityTone[r.severity]}>{r.severity}</Pill>,
    },
    { key: 'where', header: 'Location', render: (r) => r.locationDescription },
    {
      key: 'dist',
      header: 'To hospital',
      numeric: true,
      render: (r) => meters(r.distanceToHospitalMeters),
    },
    { key: 'state', header: 'State', render: (r) => <Pill tone={stateTone(r.state)}>{r.state}</Pill> },
    {
      key: 'act',
      header: '',
      render: (r) =>
        r.state === 'RECEIVED' ? (
          <Button
            size="sm"
            variant="warning"
            onClick={(e) => {
              e.stopPropagation();
              acknowledgeHelpRequest(r.id, 'Acknowledged from triage console');
            }}
            icon={<Check size={12} strokeWidth={2.2} />}
          >
            Acknowledge
          </Button>
        ) : r.state !== 'RESCUED' ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              updateHelpRequestState(r.id, 'RESCUED');
            }}
          >
            Mark rescued
          </Button>
        ) : (
          <Pill tone="safe" dot>
            Resolved
          </Pill>
        ),
    },
  ];

  return (
    <div className={`${s.module} ${s.medical}`}>
      <div className={s.medKpis}>
        <div className={s.kpiCell}>
          <Metric
            label="Distress signals"
            icon={<Siren size={11} strokeWidth={1.8} />}
            value={num(helpRequests.length)}
            size="md"
            tone="critical"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Unacknowledged"
            value={num(helpRequests.filter((r) => r.state === 'RECEIVED').length)}
            size="md"
            tone="warning"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Dispatched"
            value={num(helpRequests.filter((r) => r.state === 'DISPATCHED').length)}
            size="md"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Rescued"
            value={num(helpRequests.filter((r) => r.state === 'RESCUED').length)}
            size="md"
            tone="safe"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Verified safe"
            icon={<ShieldCheck size={11} strokeWidth={1.8} />}
            value={num(incident.civiliansSafeCount)}
            size="md"
            tone="safe"
            sub={`${musterRecords.length} muster check-ins`}
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Notified"
            icon={<Radio size={11} strokeWidth={1.8} />}
            value={num(incident.civiliansNotifiedCount)}
            size="md"
          />
        </div>
      </div>

      <div className={s.medMap}>
        <IncidentMap
          zoom={14.4}
          layers={{ cone: false, helipads: false }}
          onSelectDistress={(r) => setSelectedId(r.id)}
          selectedDistressId={selectedId}
        />
      </div>

      <div className={s.medTables} style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <Panel
          title="Civilian distress triage"
          eyebrow="Live from the citizen app"
          className={s.scrollPanel}
          actions={
            <>
              {(['ALL', 'CRITICAL', 'URGENT', 'STANDARD'] as const).map((f) => (
                <Button key={f} size="sm" variant="ghost" on={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </Button>
              ))}
            </>
          }
        >
          <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} empty="No distress signals" />
        </Panel>
      </div>

      <div className={s.medRail}>
        <Panel title={selected ? 'Selected signal' : 'Signal detail'} eyebrow="Triage" pad>
          {selected ? (
            <div style={{ display: 'grid', gap: 'var(--s3)' }}>
              <div>
                <Eyebrow>{selected.civilianAlias}</Eyebrow>
                <p style={{ marginTop: 4, color: 'var(--text-hi)', fontWeight: 600 }}>
                  {humanise(selected.condition)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap' }}>
                <Pill tone={severityTone[selected.severity]}>{selected.severity}</Pill>
                <Pill tone={stateTone(selected.state)}>{selected.state}</Pill>
              </div>
              <Metric
                label="Position"
                icon={<MapPin size={11} strokeWidth={1.8} />}
                value={<span style={{ fontSize: 'var(--t-12)' }}>{latLon(selected.coordinates)}</span>}
                size="sm"
                sub={selected.locationDescription}
              />
              <Metric
                label="Distance to hospital"
                value={meters(selected.distanceToHospitalMeters)}
                size="sm"
              />
              {selected.responderNotes && (
                <div>
                  <Eyebrow>Responder notes</Eyebrow>
                  <p style={{ marginTop: 4, color: 'var(--text-lo)', fontSize: 'var(--t-12)' }}>
                    {selected.responderNotes}
                  </p>
                </div>
              )}
              {selected.state === 'RECEIVED' && (
                <Button
                  variant="warning"
                  size="md"
                  block
                  icon={<Check size={15} strokeWidth={2} />}
                  onClick={() => acknowledgeHelpRequest(selected.id, 'Acknowledged from triage console')}
                >
                  Send acknowledgement to device
                </Button>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-faint)', fontSize: 'var(--t-12)' }}>
              Select a pin on the map or a row in the table to inspect a distress signal.
            </p>
          )}
        </Panel>

        <Panel title="Muster check-ins" eyebrow="I am safe" className={s.scrollPanel}>
          {musterRecords.map((m) => (
            <div className={s.insightRow} key={m.id}>
              <span style={{ color: 'var(--safe-on)', paddingTop: 2 }}>
                <ShieldCheck size={15} strokeWidth={1.8} />
              </span>
              <span>
                <span className={s.insightName}>{m.civilianAlias}</span>
                <span className={s.insightText}>
                  {m.safeZoneName} · {timeOnly(m.timestamp)}
                  {m.isWithFamily ? ' · with family' : ''}
                </span>
              </span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
};

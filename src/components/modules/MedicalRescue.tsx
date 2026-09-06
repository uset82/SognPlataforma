import React from 'react';
import {
  Cross,
  Users,
  Truck,
  Plane,
  Activity,
  MapPin,
  Shield,
  Package,
  Radio,
  HeartPulse,
} from 'lucide-react';

import { IncidentMap } from '../../map/IncidentMap';
import { Button, DataTable, Metric, Panel, Pill, type Column } from '../primitives';
import { useIncident } from '../../state/IncidentContext';
import { num, pct } from '../../lib/format';
import s from './modules.module.css';

/* ============================================================================
   MODULE 5 — MEDICAL & RESCUE COORDINATION  (mockup 5)

   Capacity, dispatch and supply — the three questions a medical commander asks.
   All figures are fictional drill data per rules.md §4.3; no ETA here implies a
   real ambulance is moving anywhere.
   ============================================================================ */

interface Hospital {
  name: string;
  total: number;
  available: number;
  trauma: number;
  status: 'Accepting' | 'Limited';
}

const HOSPITALS: Hospital[] = [
  { name: 'Sogndal Hospital', total: 138, available: 48, trauma: 6, status: 'Accepting' },
  { name: 'Lærdal Medical Center', total: 56, available: 18, trauma: 2, status: 'Accepting' },
  { name: 'Voss Hospital', total: 78, available: 22, trauma: 4, status: 'Accepting' },
  { name: 'Førde Hospital', total: 64, available: 20, trauma: 2, status: 'Limited' },
  { name: 'Bergen Haukeland', total: 412, available: 128, trauma: 18, status: 'Accepting' },
];

interface Unit {
  id: string;
  kind: 'Ambulance' | 'Helicopter' | 'Police';
  base: string;
  eta: string;
}

const UNITS: Unit[] = [
  { id: 'Ambulance 4-2-1', kind: 'Ambulance', base: 'Flåm EMS Station', eta: '5 min' },
  { id: 'Ambulance 4-2-3', kind: 'Ambulance', base: 'Aurland EMS', eta: '7 min' },
  { id: 'Ambulance 4-1-5', kind: 'Ambulance', base: 'Lærdal EMS', eta: '12 min' },
  { id: 'Rescue Heli LN-OGE', kind: 'Helicopter', base: 'Bergen Air Ambulance', eta: '9 min' },
  { id: 'Rescue Heli LN-OJF', kind: 'Helicopter', base: 'Ålesund Air Rescue', eta: '15 min' },
  { id: 'Police Unit 1-2', kind: 'Police', base: 'Lærdal Police', eta: '6 min' },
];

const SUPPLIES = [
  { name: 'Trauma kits', level: 78 },
  { name: 'Blood units', level: 63 },
  { name: 'Oxygen supply', level: 81 },
  { name: 'IV fluids', level: 72 },
  { name: 'PPE stock', level: 66 },
];

const unitIcon = (k: Unit['kind']) =>
  k === 'Ambulance' ? (
    <Truck size={13} strokeWidth={1.6} />
  ) : k === 'Helicopter' ? (
    <Plane size={13} strokeWidth={1.6} />
  ) : (
    <Shield size={13} strokeWidth={1.6} />
  );

export const MedicalRescue: React.FC = () => {
  const { incident, helpRequests } = useIncident();

  const bedsTotal = HOSPITALS.reduce((t, h) => t + h.total, 0);
  const bedsFree = HOSPITALS.reduce((t, h) => t + h.available, 0);
  const traumaTotal = HOSPITALS.reduce((t, h) => t + h.trauma, 0);

  /* Triage zones are derived from live distress severity — not invented. */
  const bySeverity = {
    CRITICAL: helpRequests.filter((r) => r.severity === 'CRITICAL').length,
    URGENT: helpRequests.filter((r) => r.severity === 'URGENT').length,
    STANDARD: helpRequests.filter((r) => r.severity === 'STANDARD').length,
    NON_URGENT: helpRequests.filter((r) => r.severity === 'NON_URGENT').length,
  };

  const hospitalCols: Array<Column<Hospital>> = [
    { key: 'name', header: 'Hospital', render: (h) => h.name },
    { key: 'total', header: 'Beds', numeric: true, render: (h) => num(h.total) },
    { key: 'avail', header: 'Available', numeric: true, render: (h) => num(h.available) },
    {
      key: 'occ',
      header: 'Occupancy',
      numeric: true,
      render: (h) => `${pct(h.total - h.available, h.total)}%`,
    },
    { key: 'trauma', header: 'Trauma', numeric: true, render: (h) => num(h.trauma) },
    {
      key: 'status',
      header: 'Status',
      render: (h) => (
        <Pill tone={h.status === 'Accepting' ? 'safe' : 'warning'}>{h.status}</Pill>
      ),
    },
  ];

  const unitCols: Array<Column<Unit>> = [
    {
      key: 'id',
      header: 'Unit',
      render: (u) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--fjord-on)' }}>{unitIcon(u.kind)}</span>
          {u.id}
        </span>
      ),
    },
    { key: 'base', header: 'Base', render: (u) => u.base },
    { key: 'eta', header: 'ETA', numeric: true, render: (u) => u.eta },
    { key: 'state', header: '', render: () => <Pill tone="safe">En route</Pill> },
  ];

  return (
    <div className={`${s.module} ${s.medical}`}>
      <div className={s.medKpis}>
        <div className={s.kpiCell}>
          <Metric
            label="Hospital capacity"
            icon={<Cross size={11} strokeWidth={1.8} />}
            value={num(bedsFree)}
            size="md"
            tone="safe"
            progress={bedsFree / bedsTotal}
            sub={`of ${num(bedsTotal)} beds`}
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Paramedics deployed"
            icon={<Users size={11} strokeWidth={1.8} />}
            value="86"
            size="md"
            tone="safe"
            progress={0.65}
            sub="of 132 on roster"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Ambulances"
            icon={<Truck size={11} strokeWidth={1.8} />}
            value="14"
            size="md"
            progress={0.48}
            sub="of 29 ready"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Helicopters"
            icon={<Plane size={11} strokeWidth={1.8} />}
            value="2"
            size="md"
            progress={0.5}
            sub="of 4 available"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Estimated injuries"
            icon={<Activity size={11} strokeWidth={1.8} />}
            value="210–260"
            size="sm"
            tone="warning"
            sub="High confidence band"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Triage zones"
            icon={<MapPin size={11} strokeWidth={1.8} />}
            value="3"
            size="md"
            tone="warning"
            sub="Zones A, B, C operational"
          />
        </div>
      </div>

      <div className={s.medMap}>
        <IncidentMap
          defaultBasemap="aerial"
          layers={{ helipads: true, cone: false }}
          zoom={14.2}
        />
      </div>

      <div className={s.medTables}>
        <Panel title="Hospital capacity" eyebrow="Regional network" className={s.scrollPanel}>
          <DataTable
            columns={hospitalCols}
            rows={HOSPITALS}
            rowKey={(h) => h.name}
            total={{
              name: 'Total',
              total: num(bedsTotal),
              avail: num(bedsFree),
              occ: `${pct(bedsTotal - bedsFree, bedsTotal)}%`,
              trauma: num(traumaTotal),
              status: '',
            }}
          />
        </Panel>

        <Panel title="Responder dispatch" eyebrow="En route" className={s.scrollPanel}>
          <DataTable columns={unitCols} rows={UNITS} rowKey={(u) => u.id} />
        </Panel>
      </div>

      <div className={s.medRail}>
        <Panel title="Triage load" eyebrow="From live distress signals" pad>
          <div style={{ display: 'grid', gap: 'var(--s3)' }}>
            <Metric
              label="Critical"
              value={num(bySeverity.CRITICAL)}
              size="md"
              tone="critical"
              sub="Immediate intervention"
            />
            <Metric
              label="Urgent"
              value={num(bySeverity.URGENT)}
              size="md"
              tone="warning"
              sub="Within 30 minutes"
            />
            <Metric
              label="Standard"
              value={num(bySeverity.STANDARD + bySeverity.NON_URGENT)}
              size="md"
              tone="safe"
              sub="Walking wounded & assisted"
            />
          </div>
        </Panel>

        <Panel title="Medical supply" eyebrow="Stock level" icon={<Package size={15} strokeWidth={1.6} color="var(--fjord-on)" />}>
          {SUPPLIES.map((sup) => (
            <div className={s.supplyRow} key={sup.name}>
              <span className={s.supplyTop}>
                <span className={s.supplyName}>{sup.name}</span>
                <span className={s.supplyVal}>{sup.level}%</span>
              </span>
              <span
                style={{
                  height: 3,
                  borderRadius: 999,
                  background: 'var(--line)',
                  overflow: 'hidden',
                  display: 'block',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    height: '100%',
                    width: `${sup.level}%`,
                    borderRadius: 999,
                    background:
                      sup.level < 70 ? 'var(--warning-on)' : 'var(--safe-on)',
                  }}
                />
              </span>
            </div>
          ))}
        </Panel>

        <Panel title="Quick actions" pad bodyClassName={s.actions}>
          <Button variant="critical" size="md" block icon={<Truck size={15} strokeWidth={1.8} />}>
            Dispatch ambulances
          </Button>
          <Button variant="warning" size="md" block icon={<Cross size={15} strokeWidth={1.8} />}>
            Alert hospitals
          </Button>
          <Button variant="fjord" size="md" block icon={<HeartPulse size={15} strokeWidth={1.8} />}>
            Confirm triage zones
          </Button>
          <Button variant="safe" size="md" block icon={<Plane size={15} strokeWidth={1.8} />}>
            Request helicopter support
          </Button>
          <Button variant="default" size="md" block icon={<Radio size={15} strokeWidth={1.8} />}>
            Share medical update
          </Button>
          <Pill tone="neutral">
            Safe area: {incident.primarySafeZone.name.replace(' Safe Area', '')}
          </Pill>
        </Panel>
      </div>
    </div>
  );
};

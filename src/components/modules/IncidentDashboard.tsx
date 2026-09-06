import React from 'react';
import {
  Ship,
  TriangleAlert,
  Timer,
  Users,
  PersonStanding,
  ShieldCheck,
  Cross,
  Plane,
  Shield,
  Megaphone,
  Siren,
  DoorOpen,
} from 'lucide-react';

import { IncidentMap } from '../../map/IncidentMap';
import { LiveFeed, AgentStrip } from './LiveFeed';
import { Button, Metric, Panel, Pill } from '../primitives';
import { useIncident } from '../../state/IncidentContext';
import { countdown, num, pct } from '../../lib/format';
import s from './modules.module.css';

/* ============================================================================
   MODULE 1 — INCIDENT DASHBOARD  (mockup 1)
   Map-dominant, with a right rail of paired KPIs and the quick-action stack.
   ============================================================================ */

export const IncidentDashboard: React.FC = () => {
  const {
    incident,
    currentStage,
    helpRequests,
    isAlertBroadcasted,
    broadcastPublicAlert,
    setActiveModule,
  } = useIncident();

  const vessel = incident.vessel;
  const atRisk = incident.zones.reduce((t, z) => t + z.estimatedPeopleInside, 0);
  const evacuated = incident.civiliansSafeCount;
  const evacPct = pct(evacuated, atRisk);

  return (
    <div className={`${s.module} ${s.dashboard}`}>
      <div className={s.dashMap}>
        <IncidentMap zoom={13.5} layers={{ helipads: false }} />
      </div>

      <div className={s.dashRail}>
        {/* --- Vessel identity + severity ------------------------------- */}
        <div className={s.kpiGrid}>
          <div className={s.kpiCell}>
            <Metric
              label="Ship status"
              icon={<Ship size={11} strokeWidth={1.8} />}
              value={vessel.name.replace('M/S ', '')}
              size="sm"
              sub={`${vessel.vesselType} · ${num(vessel.passengersOnBoard + vessel.crewOnBoard)} souls`}
            />
          </div>
          <div className={s.kpiCell}>
            <Metric
              label="Severity"
              icon={<TriangleAlert size={11} strokeWidth={1.8} />}
              value={incident.severity}
              size="sm"
              tone="critical"
              sub={
                vessel.steeringStatus === 'TOTAL_LOSS'
                  ? 'Total loss of steering'
                  : 'Steering degraded'
              }
            />
          </div>

          <div className={s.kpiCell}>
            <Metric
              label="Time before impact"
              icon={<Timer size={11} strokeWidth={1.8} />}
              value={countdown(currentStage.tSeconds)}
              size="lg"
              tone="critical"
              sub={`Stage ${currentStage.t} · ${vessel.distanceToHarborNm.toFixed(2)} nm out`}
            />
          </div>
          <div className={s.kpiCell}>
            <Metric
              label="People in danger zone"
              icon={<Users size={11} strokeWidth={1.8} />}
              value={num(atRisk)}
              size="lg"
              tone="warning"
              sub="Estimated, both zones"
            />
          </div>

          <div className={s.kpiCell}>
            <Metric
              label="Evacuation progress"
              icon={<PersonStanding size={11} strokeWidth={1.8} />}
              value={`${evacPct}%`}
              size="md"
              tone="warning"
              progress={evacPct / 100}
              sub={`${num(evacuated)} / ${num(atRisk)} verified safe`}
            />
          </div>
          <div className={s.kpiCell}>
            <Metric
              label="Civilians notified"
              icon={<Megaphone size={11} strokeWidth={1.8} />}
              value={num(incident.civiliansNotifiedCount)}
              size="md"
              tone="safe"
              sub={isAlertBroadcasted ? 'Broadcast delivered' : 'Awaiting broadcast'}
            />
          </div>

          <div className={s.kpiCell}>
            <Metric
              label="Safe area capacity"
              icon={<ShieldCheck size={11} strokeWidth={1.8} />}
              value={num(incident.primarySafeZone.capacity - incident.primarySafeZone.currentOccupancy)}
              size="sm"
              tone="safe"
              progress={
                incident.primarySafeZone.currentOccupancy / incident.primarySafeZone.capacity
              }
              sub={`${incident.primarySafeZone.name.replace(' Safe Area', '')} · ${num(
                incident.primarySafeZone.currentOccupancy
              )} inside`}
            />
          </div>
          <div className={s.kpiCell}>
            <Metric
              label="Distress signals"
              icon={<Siren size={11} strokeWidth={1.8} />}
              value={num(helpRequests.length)}
              size="sm"
              tone={helpRequests.length > 0 ? 'critical' : 'neutral'}
              sub={`${helpRequests.filter((r) => r.state === 'RECEIVED').length} unacknowledged`}
            />
          </div>

          <div className={s.kpiCell}>
            <Metric
              label="Hospitals standby"
              icon={<Cross size={11} strokeWidth={1.8} />}
              value="3"
              size="sm"
              sub="215 beds committed"
            />
          </div>
          <div className={s.kpiCell}>
            <Metric
              label="Helicopters"
              icon={<Plane size={11} strokeWidth={1.8} />}
              value="2"
              size="sm"
              sub="Ready for deployment"
            />
          </div>
        </div>

        {/* --- Quick actions --------------------------------------------- */}
        <Panel title="Quick actions" pad bodyClassName={s.actions}>
          <Button
            variant="critical"
            size="lg"
            block
            icon={<PersonStanding size={16} strokeWidth={1.8} />}
            onClick={() => setActiveModule('public-alert')}
          >
            Activate evacuation
          </Button>
          <Button
            variant="warning"
            size="lg"
            block
            icon={<Megaphone size={16} strokeWidth={1.8} />}
            onClick={broadcastPublicAlert}
            disabled={isAlertBroadcasted}
          >
            {isAlertBroadcasted ? 'Public alert sent' : 'Send public alert'}
          </Button>
          <Button
            variant="fjord"
            size="lg"
            block
            icon={<Shield size={16} strokeWidth={1.8} />}
            onClick={() => setActiveModule('medical')}
          >
            Notify responders
          </Button>
          <Button
            variant="safe"
            size="lg"
            block
            icon={<DoorOpen size={16} strokeWidth={1.8} />}
            onClick={() => setActiveModule('fjordlink')}
          >
            Open safe zones
          </Button>
          <Pill tone="neutral">All actions are logged and time-stamped</Pill>
        </Panel>
      </div>

      <div className={s.dashLow}>
        <AgentStrip />
        <LiveFeed limit={30} />
      </div>
    </div>
  );
};

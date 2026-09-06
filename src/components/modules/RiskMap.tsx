import React from 'react';
import { Ship, ShieldPlus, ExternalLink, Timer, Compass, Anchor, Users, Eye, Gauge } from 'lucide-react';

import { IncidentMap } from '../../map/IncidentMap';
import { Button, Eyebrow, Metric, Panel, Pill } from '../primitives';
import { useIncident } from '../../state/IncidentContext';
import { bearing, compass, countdown, humanise, knots, latLon, meters, num } from '../../lib/format';
import s from './modules.module.css';

/* ============================================================================
   MODULE 2 — RISK MAP / PRE-IMPACT  (mockup 2)
   Vessel spec sheet on the left, cartography in the middle, the pre-approved
   response on the right, and the decision metrics along the bottom.

   Defaults to the nautical chart: this is the module an operator reads while
   the vessel is still on the water.
   ============================================================================ */

const SpecRow: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({
  label,
  children,
  mono,
}) => (
  <div className={s.specRow}>
    <span className={s.specLabel}>{label}</span>
    <span className={mono ? s.specValueMono : s.specValue}>{children}</span>
  </div>
);

export const RiskMap: React.FC = () => {
  const { incident, currentStage, setActiveModule } = useIncident();
  const v = incident.vessel;
  const atRisk = incident.zones.reduce((t, z) => t + z.estimatedPeopleInside, 0);

  return (
    <div className={`${s.module} ${s.risk}`}>
      {/* ---- Vessel spec sheet ---- */}
      <Panel
        className={s.riskVessel}
        eyebrow="Vessel information"
        icon={<Ship size={15} strokeWidth={1.6} color="var(--fjord-on)" />}
        pad
      >
        <div className={s.spec}>
          <div className={s.specPhoto}>
            <Ship size={30} strokeWidth={1} />
          </div>

          <SpecRow label="Vessel name">{v.name}</SpecRow>
          <SpecRow label="MMSI / call sign" mono>
            {v.mmsi} · {v.callSign}
          </SpecRow>
          <SpecRow label="Vessel type">{v.vesselType}</SpecRow>
          <SpecRow label="Flag">🇳🇴 Norway</SpecRow>
          <SpecRow label="Souls on board" mono>
            {num(v.passengersOnBoard)} pax + {num(v.crewOnBoard)} crew
          </SpecRow>

          <div className={s.specRow}>
            <span className={s.specLabel}>Current status</span>
            <div className={s.specPair}>
              <Metric label="Speed" value={knots(v.speedKnots)} unit="kn" size="sm" tone="critical" />
              <Metric
                label="Heading"
                value={bearing(v.headingDegrees)}
                unit={compass(v.headingDegrees)}
                size="sm"
              />
            </div>
          </div>

          <SpecRow label="Position" mono>
            {latLon({ latitude: v.latitude, longitude: v.longitude })}
          </SpecRow>

          <div className={s.specRow}>
            <span className={s.specLabel}>Loss of manoeuvrability</span>
            <Pill tone="critical">{humanise(v.steeringStatus)}</Pill>
          </div>

          <SpecRow label="Last AIS update" mono>
            {currentStage.t} · simulated feed
          </SpecRow>
        </div>
      </Panel>

      {/* ---- Cartography ---- */}
      <div className={s.riskMap}>
        <IncidentMap
          defaultBasemap="nautical"
          layers={{ distress: false, helipads: false }}
          showVesselCallout
        />
      </div>

      {/* ---- Incident + pre-approved response ---- */}
      <div className={s.riskIncident}>
        <Panel eyebrow="Incident" pad>
          <h2 style={{ fontSize: 'var(--t-20)', marginBottom: 'var(--s2)' }}>
            {incident.shortDescription}
          </h2>
          <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Pill tone="critical">{incident.severity}</Pill>
            <Pill tone="neutral">{incident.code.split(':')[0]}</Pill>
          </div>
        </Panel>

        <Panel eyebrow="Recommended response" pad>
          <div className={s.recommend}>
            <span className={s.recommendHead}>
              <ShieldPlus size={15} strokeWidth={1.8} />
              <Eyebrow>Pre-approved scenario F-03</Eyebrow>
            </span>
            Activate the Flåm evacuation plan: alert the public, alert police, paramedics, hospital
            and helicopters, and close harbour access. Human sign-off is required before any
            statutory action is dispatched.
          </div>

          <div style={{ marginTop: 'var(--s3)' }}>
            <span className={s.specLabel}>Playbook</span>
            <div className={s.specValue}>Flåm Evacuation Plan · version 3.2</div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--s2)', marginTop: 'var(--s3)' }}>
            <Button
              variant="critical"
              size="md"
              block
              icon={<ShieldPlus size={15} strokeWidth={1.8} />}
              onClick={() => setActiveModule('public-alert')}
            >
              Activate response
            </Button>
            <Button
              variant="ghost"
              size="md"
              icon={<ExternalLink size={14} strokeWidth={1.6} />}
              aria-label="Open playbook"
            />
          </div>
        </Panel>
      </div>

      {/* ---- Decision metrics ---- */}
      <div className={s.riskStrip}>
        <div className={s.kpiCell}>
          <Metric
            label="ETA to impact"
            icon={<Timer size={11} strokeWidth={1.8} />}
            value={countdown(currentStage.tSeconds)}
            size="md"
            tone="critical"
            sub={currentStage.t}
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Distance to impact"
            icon={<Compass size={11} strokeWidth={1.8} />}
            value={v.distanceToHarborNm.toFixed(2)}
            unit="nm"
            size="md"
            sub={meters(v.distanceToHarborNm * 1852)}
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Closest point of approach"
            icon={<Gauge size={11} strokeWidth={1.8} />}
            value="~250"
            unit="m"
            size="md"
            sub="Port entrance"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Harbour status"
            icon={<Anchor size={11} strokeWidth={1.8} />}
            value={currentStage.zoneStateUpdate?.waterfrontBlocked ? 'CLOSED' : 'OPEN'}
            size="md"
            tone={currentStage.zoneStateUpdate?.waterfrontBlocked ? 'critical' : 'warning'}
            sub={currentStage.zoneStateUpdate?.waterfrontBlocked ? 'Waterfront cordoned' : 'Traffic normal'}
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Population at risk"
            icon={<Users size={11} strokeWidth={1.8} />}
            value={num(atRisk)}
            size="md"
            tone="warning"
            sub="In Flåm area"
          />
        </div>
        <div className={s.kpiCell}>
          <Metric
            label="Visibility"
            icon={<Eye size={11} strokeWidth={1.8} />}
            value="Good"
            size="md"
            tone="safe"
            sub="10+ km"
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Anchor, Users, Activity, Radio, Ship, Clock } from 'lucide-react';

import { Button, Eyebrow, Metric, Panel, Pill } from '../primitives';
import { useIncident } from '../../state/IncidentContext';
import { humanise, num, timeOnly } from '../../lib/format';
import type { LandingStatusCard } from '../../types/landing';
import s from './modules.module.css';

/* ============================================================================
   FJORDLINK — THE THREE-FACT LANDING CARD

   The concept's core artefact. It answers exactly three questions for the land
   reception team, and deliberately no more:

     1. HOW MANY people are coming ashore
     2. WHAT CONDITION they are in
     3. WHICH QUAY they are heading for

   It sits beside VHF. It does not integrate with CIM, Nødnett or Kystradio.
   ============================================================================ */

const QUAYS: Array<LandingStatusCard['assignedQuay']> = [
  'FLAM_CRUISE_KAI',
  'AURLAND_KAI',
  'GUDVANGEN_KAI',
  'UNDREDAL_KAI',
];

const READINESS: Array<LandingStatusCard['dockTeamPreparedness']> = [
  'STANDBY',
  'PREPARING_GANGWAY',
  'AMBULANCES_STAGED',
  'READY_TO_RECEIVE',
];

export const FjordLink: React.FC = () => {
  const { landingCard, updateLandingCard } = useIncident();
  const c = landingCard.conditionSummary;
  const total = landingCard.totalPeopleToLand;
  const injured = c.minorInjuriesCount + c.moderateInjuriesCount + c.criticalCareCount;

  return (
    <div className={`${s.module} ${s.two}`}>
      <Panel
        title="FjordLink landing status"
        eyebrow="Fact card"
        icon={<Anchor size={15} strokeWidth={1.6} color="var(--fjord-on)" />}
        actions={<Pill tone="fjord" dot>Beside VHF · not a statutory system</Pill>}
        pad
        className={s.scrollPanel}
      >
        <div style={{ display: 'grid', gap: 'var(--s5)' }}>
          <div>
            <Eyebrow>Vessel</Eyebrow>
            <h2 style={{ fontSize: 'var(--t-26)', marginTop: 4 }}>{landingCard.vesselName}</h2>
            <p style={{ color: 'var(--text-lo)', fontSize: 'var(--t-12)' }}>
              Call sign {landingCard.callSign} · liaison {landingCard.liaisonContact}
            </p>
          </div>

          {/* Fact 1 */}
          <Metric
            label="1 · How many people will come ashore"
            icon={<Users size={11} strokeWidth={1.8} />}
            value={num(total)}
            size="xl"
            tone="fjord"
            sub="Passengers and non-essential crew"
          />

          {/* Fact 2 */}
          <div>
            <Eyebrow>2 · Rough condition triage</Eyebrow>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'var(--s3)',
                marginTop: 'var(--s3)',
              }}
            >
              <Metric label="Uninjured" value={num(c.uninjuredCount)} size="md" tone="safe" />
              <Metric label="Minor / walking" value={num(c.minorInjuriesCount)} size="md" tone="warning" />
              <Metric label="Moderate" value={num(c.moderateInjuriesCount)} size="md" tone="warning" />
              <Metric label="Critical" value={num(c.criticalCareCount)} size="md" tone="critical" />
            </div>
            <p style={{ color: 'var(--text-lo)', fontSize: 'var(--t-11)', marginTop: 'var(--s2)' }}>
              {num(injured)} of {num(total)} require some level of medical reception.
            </p>
          </div>

          {/* Fact 3 */}
          <div>
            <Eyebrow>3 · Which quay</Eyebrow>
            <p style={{ color: 'var(--text-hi)', fontSize: 'var(--t-16)', fontWeight: 600, marginTop: 4 }}>
              {landingCard.quayDisplayName}
            </p>
            <div style={{ display: 'flex', gap: 'var(--s2)', marginTop: 'var(--s3)', flexWrap: 'wrap' }}>
              {QUAYS.map((q) => (
                <Button
                  key={q}
                  size="sm"
                  variant="ghost"
                  on={landingCard.assignedQuay === q}
                  onClick={() =>
                    updateLandingCard({
                      assignedQuay: q,
                      quayDisplayName: humanise(q).replace('Flam', 'Flåm'),
                    })
                  }
                >
                  {humanise(q).replace('Flam', 'Flåm')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Dock reception readiness" eyebrow="Land team" pad className={s.scrollPanel}>
        <div style={{ display: 'grid', gap: 'var(--s5)' }}>
          <Metric
            label="Estimated berthing"
            icon={<Clock size={11} strokeWidth={1.8} />}
            value={<span style={{ fontSize: 'var(--t-16)' }}>{landingCard.estimatedTimeOfBerthing}</span>}
            size="sm"
            tone="critical"
          />

          <div>
            <Eyebrow>Preparedness</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', marginTop: 'var(--s3)' }}>
              {READINESS.map((r) => (
                <Button
                  key={r}
                  size="md"
                  block
                  variant={landingCard.dockTeamPreparedness === r ? 'safe' : 'default'}
                  onClick={() => updateLandingCard({ dockTeamPreparedness: r })}
                  icon={<Activity size={14} strokeWidth={1.8} />}
                >
                  {humanise(r)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>Why only three facts</Eyebrow>
            <p style={{ color: 'var(--text-lo)', fontSize: 'var(--t-12)', marginTop: 4, lineHeight: 1.55 }}>
              Land reception teams routinely learn how many people are disembarking, in what
              condition, and at which quay only once the gangway is already down. Those three facts
              are the smallest payload that changes what the quay can prepare — so the card carries
              them and nothing else.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Pill tone="neutral">
              <Radio size={10} strokeWidth={2} /> Updated {timeOnly(landingCard.lastUpdatedTimestamp)}
            </Pill>
            <Pill tone="fjord">
              <Ship size={10} strokeWidth={2} /> VHF Ch 16 parallel
            </Pill>
          </div>
        </div>
      </Panel>
    </div>
  );
};

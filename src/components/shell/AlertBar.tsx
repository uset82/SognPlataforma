import React from 'react';
import { TriangleAlert, CloudSun, Bell } from 'lucide-react';

import { useIncident } from '../../state/IncidentContext';
import { clockFromSeconds, countdown, dateLong } from '../../lib/format';
import { Pill } from '../primitives';
import { SCENARIO_TIMELINE } from '../../data/scenario';
import s from './shell.module.css';

const WINDOW = SCENARIO_TIMELINE[0]?.tSeconds ?? 900;

export const AlertBar: React.FC = () => {
  const { incident, currentStage, logMessages } = useIncident();
  const critical = incident.severity === 'CRITICAL' && incident.status === 'ACTIVE';

  const elapsed = WINDOW - currentStage.tSeconds;
  const clock = clockFromSeconds(incident.createdTimestamp, elapsed);

  const pendingAuth = logMessages.filter(
    (m) => m.type === 'AUTHORIZATION_REQUEST' && !m.authorized
  ).length;

  return (
    <div className={`${s.alertBar} ${critical ? s.alertBarCritical : ''}`}>
      <span className={s.alertIcon}>
        <TriangleAlert size={19} strokeWidth={2} color={critical ? '#fff' : 'var(--warning-on)'} />
      </span>

      <span className={s.alertText}>
        <span className={s.alertKicker}>
          {incident.status === 'ACTIVE' ? 'Active incident' : incident.status}
        </span>
        <span className={s.alertTitle}>{incident.title}</span>
      </span>

      <span className={s.alertRight}>
        <span className={s.impactBlock}>
          <span className={s.impactLabel}>ETA impact</span>
          <span className={s.impactValue}>{countdown(currentStage.tSeconds)}</span>
        </span>

        <Pill tone="critical" live>
          Live
        </Pill>

        <span className={s.clusterItem}>
          <CloudSun size={14} strokeWidth={1.5} />
          9 °C
        </span>

        <span className={s.clusterItem} title={`${pendingAuth} actions awaiting human authorisation`}>
          <Bell size={14} strokeWidth={1.5} />
          {pendingAuth > 0 && (
            <span className={s.navBadge} aria-label={`${pendingAuth} awaiting authorisation`}>
              {pendingAuth}
            </span>
          )}
        </span>

        <span className={s.clockStack}>
          <span className={s.clockTime}>{clock}</span>
          <span className={s.clockDate}>{dateLong(incident.createdTimestamp)}</span>
        </span>

        <span className={s.avatar} title="Incident Commander (drill operator)">
          IC
        </span>
      </span>
    </div>
  );
};

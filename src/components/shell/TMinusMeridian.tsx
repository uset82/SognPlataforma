import React from 'react';
import { SCENARIO_TIMELINE } from '../../data/scenario';
import { useIncident } from '../../state/IncidentContext';
import { countdown } from '../../lib/format';
import s from './shell.module.css';

/* ============================================================================
   THE T-MINUS MERIDIAN — the platform's signature element.

   A single hairline carrying minute ticks across the 15-minute pre-impact
   window, with the current moment as a filled notch. It is an instrument
   scale, not a progress bar: it never fills, never glows, and never animates
   on its own. It marks position, and that is all.

   It appears beneath the alert bar on every module, which is what gives the
   five screens a shared heartbeat.
   ============================================================================ */

const WINDOW_SECONDS = SCENARIO_TIMELINE[0]?.tSeconds ?? 900;

export const TMinusMeridian: React.FC = () => {
  const { currentStage, incident } = useIncident();

  const remaining = currentStage.tSeconds;
  /* 0 at T-15, 1 at T-0. */
  const elapsed = 1 - remaining / WINDOW_SECONDS;
  const pctAt = (seconds: number) => `${(1 - seconds / WINDOW_SECONDS) * 100}%`;

  const minutes = Math.floor(WINDOW_SECONDS / 60);
  const ticks = Array.from({ length: minutes + 1 }, (_, i) => i);

  return (
    <div
      className={s.meridian}
      role="img"
      aria-label={`Pre-impact meridian. ${countdown(remaining)} remaining until estimated impact.`}
    >
      <div className={s.meridianLine} />
      <div className={s.meridianElapsed} style={{ width: `${elapsed * 100}%` }} />

      {/* Minute ticks. Every fifth is major and labelled. */}
      {ticks.map((m) => {
        const major = m % 5 === 0;
        const left = `${(m / minutes) * 100}%`;
        return (
          <React.Fragment key={m}>
            <span className={`${s.tick} ${major ? s.tickMajor : ''}`} style={{ left }} />
            {major && (
              <span
                className={s.tickLabel}
                style={{
                  left,
                  transform: m === 0 ? 'translateX(2px)' : m === minutes ? 'translateX(-100%)' : undefined,
                }}
              >
                {m === minutes ? 'IMPACT' : `T−${minutes - m}`}
              </span>
            )}
          </React.Fragment>
        );
      })}

      {/* Where each scenario stage fires. */}
      {SCENARIO_TIMELINE.map((stage) => (
        <span key={stage.t} className={s.stageMark} style={{ left: pctAt(stage.tSeconds) }} />
      ))}

      {/* The current moment. */}
      <span className={s.notch} style={{ left: `${elapsed * 100}%` }} />
      <span
        className={s.notchFlag}
        style={{
          left: `${elapsed * 100}%`,
          transform: elapsed > 0.88 ? 'translateX(-100%)' : elapsed < 0.06 ? 'translateX(0)' : 'translateX(-50%)',
        }}
      >
        {incident.status === 'ACTIVE' ? countdown(remaining) : 'STAND DOWN'}
      </span>
    </div>
  );
};

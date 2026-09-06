import type { Coordinates } from '../types/incident';

/* ============================================================================
   Formatters.
   LAW 5: numerals are the hero — so every readout here is built to sit in a
   tabular-figure face without the width jitter that kills a live console.
   ============================================================================ */

/** Narrow no-break space: groups thousands without the visual weight of a comma. */
const GROUP = '\u202F';

export const num = (n: number): string =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, GROUP);

export const pct = (value: number, total: number): number =>
  total <= 0 ? 0 : Math.round((value / total) * 100);

/** T-minus countdown. Always mm:ss so the field never changes width. */
export const countdown = (totalSeconds: number): string => {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/** Wall clock derived from the drill start, so the console reads as live. */
export const clockFromSeconds = (baseIso: string, elapsedSeconds: number): string => {
  const d = new Date(baseIso);
  d.setSeconds(d.getSeconds() + elapsedSeconds);
  return d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const timeOnly = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
};

export const dateLong = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Degrees-and-decimal-minutes — the notation a bridge officer actually reads. */
export const latLon = (c: Coordinates): string => {
  const fmt = (v: number, pos: string, neg: string) => {
    const hemi = v >= 0 ? pos : neg;
    const abs = Math.abs(v);
    const deg = Math.floor(abs);
    const min = (abs - deg) * 60;
    return `${deg}\u00B0${min.toFixed(3).padStart(6, '0')}\u2032${hemi}`;
  };
  return `${fmt(c.latitude, 'N', 'S')} ${fmt(c.longitude, 'E', 'W')}`;
};

export const bearing = (deg: number): string => `${Math.round(deg).toString().padStart(3, '0')}\u00B0`;

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
export const compass = (deg: number): string => COMPASS[Math.round(((deg % 360) / 22.5)) % 16];

export const nm = (v: number): string => `${v.toFixed(2)}`;
export const knots = (v: number): string => `${v.toFixed(1)}`;
export const meters = (v: number): string => (v >= 1000 ? `${(v / 1000).toFixed(1)} km` : `${Math.round(v)} m`);

/** Human-readable enum labels. Screaming snake case never reaches the screen. */
export const humanise = (token: string): string =>
  token
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (ch) => ch.toUpperCase());

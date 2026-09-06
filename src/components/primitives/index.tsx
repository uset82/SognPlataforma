import React from 'react';
import { Check } from 'lucide-react';
import s from './primitives.module.css';

/* ============================================================================
   Shared vocabulary.
   `Tone` is the only way colour enters the product (LAW 2). A component that
   wants colour must justify it as one of these four incident meanings.
   ============================================================================ */
export type Tone = 'neutral' | 'critical' | 'warning' | 'safe' | 'fjord';

const toneClass: Record<Tone, string> = {
  neutral: '',
  critical: s.toneCritical,
  warning: s.toneWarning,
  safe: s.toneSafe,
  fjord: s.toneFjord,
};

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

/* ---------------------------------------------------------------- Eyebrow */
export const Eyebrow: React.FC<{
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}> = ({ children, muted, className }) => (
  <span className={cx(s.eyebrow, muted && s.eyebrowMuted, className)}>{children}</span>
);

/* ------------------------------------------------------------------ Panel */
/* Elevation 1 by default. `float` opts into elevation 2 + glass, which LAW 3
   permits only for overlays rendered above the map. */
export const Panel: React.FC<{
  children: React.ReactNode;
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  float?: boolean;
  pad?: boolean;
  className?: string;
  bodyClassName?: string;
  style?: React.CSSProperties;
}> = ({ children, title, eyebrow, actions, icon, float, pad, className, bodyClassName, style }) => (
  <section className={cx(float ? s.panelFloat : s.panel, className)} style={style}>
    {(title || eyebrow || actions) && (
      <header className={s.panelHead}>
        <div className={s.panelHeadTitle}>
          {icon}
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          {title ? <h3 className={s.panelTitle}>{title}</h3> : null}
        </div>
        {actions ? <div className={s.panelActions}>{actions}</div> : null}
      </header>
    )}
    <div className={cx(s.panelBody, pad && s.panelPad, bodyClassName)}>{children}</div>
  </section>
);

/* ----------------------------------------------------------------- Metric */
export const Metric: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: string;
  sub?: React.ReactNode;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  /** 0–1. Renders the hairline meter beneath the value. */
  progress?: number;
  className?: string;
}> = ({ label, value, unit, sub, tone = 'neutral', size = 'md', icon, progress, className }) => {
  const sizeClass = { sm: s.mSm, md: s.mMd, lg: s.mLg, xl: s.mXl }[size];
  return (
    <div className={cx(s.metric, toneClass[tone], className)}>
      <span className={s.metricLabel}>
        {icon}
        {label}
      </span>
      <span className={s.metricValueRow}>
        <span className={cx(s.metricValue, sizeClass)}>{value}</span>
        {unit ? <span className={s.metricUnit}>{unit}</span> : null}
      </span>
      {typeof progress === 'number' && (
        <div className={s.meter} role="presentation">
          <div
            className={s.meterFill}
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          />
        </div>
      )}
      {sub ? <span className={s.metricSub}>{sub}</span> : null}
    </div>
  );
};

/* ------------------------------------------------------------------- Pill */
export const Pill: React.FC<{
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  live?: boolean;
  className?: string;
}> = ({ children, tone = 'fjord', dot, live, className }) => {
  const cls = {
    neutral: s.pillNeutral,
    critical: s.pillCritical,
    warning: s.pillWarning,
    safe: s.pillSafe,
    fjord: '',
  }[tone];
  return (
    <span className={cx(s.pill, cls, className)}>
      {(dot || live) && <span className={cx(s.dot, live && s.dotLive)} />}
      {children}
    </span>
  );
};

/* ----------------------------------------------------------------- Button */
export type ButtonVariant = 'default' | 'critical' | 'warning' | 'safe' | 'fjord' | 'ghost';

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    block?: boolean;
    /** Renders the toggled-on treatment; also sets aria-pressed. */
    on?: boolean;
    icon?: React.ReactNode;
  }
> = ({ variant = 'default', size = 'md', block, on, icon, children, className, ...rest }) => {
  const variantClass = {
    default: '',
    critical: s.btnCritical,
    warning: s.btnWarning,
    safe: s.btnSafe,
    fjord: s.btnFjord,
    ghost: s.btnGhost,
  }[variant];
  const sizeClass = { sm: s.btnSm, md: s.btnMd, lg: s.btnLg }[size];
  return (
    <button
      type="button"
      aria-pressed={on === undefined ? undefined : on}
      className={cx(s.btn, variantClass, sizeClass, block && s.btnBlock, on && s.btnOn, className)}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
};

/* ----------------------------------------------------------------- Toggle */
export const Toggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: React.ReactNode;
  /** Legend swatch — mirrors the colour this layer draws on the map. */
  swatch?: string;
}> = ({ checked, onChange, label, swatch }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    className={s.toggle}
    onClick={() => onChange(!checked)}
  >
    <span className={cx(s.toggleBox, checked && s.toggleBoxOn)}>
      {checked && <Check size={10} strokeWidth={3} />}
    </span>
    {swatch && <span className={s.toggleSwatch} style={{ background: swatch }} />}
    <span className={s.toggleLabel}>{label}</span>
  </button>
);

/* -------------------------------------------------------------- DataTable */
export interface Column<T> {
  key: string;
  header: React.ReactNode;
  /** Right-aligns and applies tabular figures. */
  numeric?: boolean;
  render: (row: T) => React.ReactNode;
  width?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  total,
  empty = 'No records',
}: {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T, index: number) => string;
  /** Optional footer row, keyed by column. */
  total?: Record<string, React.ReactNode>;
  empty?: React.ReactNode;
}) {
  if (rows.length === 0) return <div className={s.empty}>{empty}</div>;
  return (
    <table className={s.table}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} className={c.numeric ? s.num : undefined} style={{ width: c.width }}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={rowKey(row, i)}>
            {columns.map((c) => (
              <td key={c.key} className={c.numeric ? s.num : undefined}>
                {c.render(row)}
              </td>
            ))}
          </tr>
        ))}
        {total && (
          <tr className={s.tableTotal}>
            {columns.map((c) => (
              <td key={c.key} className={c.numeric ? s.num : undefined}>
                {total[c.key] ?? null}
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
}

/* ---------------------------------------------------------------- Divider */
export const Divider: React.FC<{ vertical?: boolean; className?: string }> = ({
  vertical,
  className,
}) => <div className={cx(vertical ? s.dividerV : s.divider, className)} />;

/* ------------------------------------------------------------ EmptyState */
export const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={s.empty}>{children}</div>
);

export { s as primitiveStyles };

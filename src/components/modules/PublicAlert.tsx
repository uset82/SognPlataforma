import React, { useState } from 'react';
import {
  Check,
  TriangleAlert,
  PersonStanding,
  Ban,
  ShieldCheck,
  Navigation,
  Info,
  Eye,
  Save,
  X,
  Send,
  History,
  Wifi,
  BatteryFull,
} from 'lucide-react';

import { IncidentMap } from '../../map/IncidentMap';
import { Button, Pill } from '../primitives';
import { useIncident } from '../../state/IncidentContext';
import { num, timeOnly, dateLong } from '../../lib/format';
import s from './PublicAlert.module.css';

/* ============================================================================
   MODULE 4 — PUBLIC ALERT MANAGEMENT  (mockup 4)

   Seven steps: template → actions → target area → message preview (in four
   languages) → targeting map → phone preview → review and activate.

   Per rules.md §4, the send is gated behind an explicit human confirmation —
   an agent never dispatches a civilian broadcast on its own.
   ============================================================================ */

type Lang = 'no' | 'en' | 'es' | 'de';

const LANGS: Array<{ id: Lang; label: string }> = [
  { id: 'no', label: 'Norsk' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'de', label: 'Deutsch' },
];

interface ActionDef {
  id: string;
  tone: 'critical' | 'warning' | 'safe' | 'fjord';
  icon: React.ReactNode;
  copy: Record<Lang, { name: string; desc: string }>;
}

const ACTIONS: ActionDef[] = [
  {
    id: 'evacuate',
    tone: 'critical',
    icon: <PersonStanding size={15} strokeWidth={1.8} />,
    copy: {
      no: { name: 'Evakuer sone A', desc: 'Forlat området umiddelbart.' },
      en: { name: 'Evacuate Zone A', desc: 'Leave the area immediately.' },
      es: { name: 'Evacuar la zona A', desc: 'Abandone la zona de inmediato.' },
      de: { name: 'Zone A räumen', desc: 'Verlassen Sie das Gebiet sofort.' },
    },
  },
  {
    id: 'avoid',
    tone: 'warning',
    icon: <Ban size={15} strokeWidth={1.8} />,
    copy: {
      no: { name: 'Unngå havneområdet', desc: 'Hold deg borte fra havna og sjøkanten.' },
      en: { name: 'Avoid harbour area', desc: 'Stay away from the harbour and waterfront.' },
      es: { name: 'Evite el puerto', desc: 'Manténgase lejos del puerto y del paseo marítimo.' },
      de: { name: 'Hafenbereich meiden', desc: 'Halten Sie sich vom Hafen und der Uferpromenade fern.' },
    },
  },
  {
    id: 'safeB',
    tone: 'safe',
    icon: <ShieldCheck size={15} strokeWidth={1.8} />,
    copy: {
      no: { name: 'Trygt område B er åpent', desc: 'Gå til Flåm skule.' },
      en: { name: 'Safe Zone B is open', desc: 'Proceed to Flåm School.' },
      es: { name: 'La zona segura B está abierta', desc: 'Diríjase a la escuela de Flåm.' },
      de: { name: 'Sichere Zone B ist offen', desc: 'Begeben Sie sich zur Flåm-Schule.' },
    },
  },
  {
    id: 'routeNorth',
    tone: 'fjord',
    icon: <Navigation size={15} strokeWidth={1.8} />,
    copy: {
      no: { name: 'Følg rute nordover', desc: 'Følg den anbefalte ruten nordover.' },
      en: { name: 'Route north', desc: 'Follow the recommended route north.' },
      es: { name: 'Ruta hacia el norte', desc: 'Siga la ruta recomendada hacia el norte.' },
      de: { name: 'Route nach Norden', desc: 'Folgen Sie der empfohlenen Route nach Norden.' },
    },
  },
  {
    id: 'closeWaterfront',
    tone: 'critical',
    icon: <Ban size={15} strokeWidth={1.8} />,
    copy: {
      no: { name: 'Steng sjøfronten', desc: 'Sjøfronten er stengt for publikum.' },
      en: { name: 'Close waterfront access', desc: 'Waterfront access is closed to the public.' },
      es: { name: 'Cerrar el paseo marítimo', desc: 'El acceso al paseo está cerrado al público.' },
      de: { name: 'Uferzugang sperren', desc: 'Der Uferzugang ist für die Öffentlichkeit gesperrt.' },
    },
  },
];

const HEADLINE: Record<Lang, { title: string; sub: string; important: string; note: string }> = {
  no: {
    title: 'Nødvarsel',
    sub: 'Mulig fartøykollisjon nær Flåm havn',
    important: 'Viktig',
    note: 'Følg instruksjoner fra myndighetene. Oppdateringer sendes etter hvert som situasjonen utvikler seg.',
  },
  en: {
    title: 'Emergency alert',
    sub: 'Possible vessel collision near Flåm harbour',
    important: 'Important',
    note: 'Follow instructions from the authorities. Updates will be sent as the situation develops.',
  },
  es: {
    title: 'Alerta de emergencia',
    sub: 'Posible colisión de buque cerca del puerto de Flåm',
    important: 'Importante',
    note: 'Siga las instrucciones de las autoridades. Se enviarán actualizaciones según evolucione la situación.',
  },
  de: {
    title: 'Notfallwarnung',
    sub: 'Mögliche Schiffskollision nahe dem Hafen von Flåm',
    important: 'Wichtig',
    note: 'Befolgen Sie die Anweisungen der Behörden. Updates folgen, sobald sich die Lage entwickelt.',
  },
};

const toneColor = (t: ActionDef['tone']) =>
  ({
    critical: 'var(--critical)',
    warning: '#d97706',
    safe: 'var(--safe)',
    fjord: 'var(--fjord)',
  })[t];

const toneCheck = (t: ActionDef['tone']) =>
  ({
    critical: s.actionOnCritical,
    warning: s.actionOnWarning,
    safe: s.actionOnSafe,
    fjord: s.actionOnFjord,
  })[t];

export const PublicAlert: React.FC = () => {
  const { incident, broadcastPublicAlert, isAlertBroadcasted, currentStage } = useIncident();
  const [lang, setLang] = useState<Lang>('no');
  const [selected, setSelected] = useState<string[]>(['evacuate', 'avoid', 'safeB', 'routeNorth']);
  const [confirming, setConfirming] = useState(false);

  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const chosen = ACTIONS.filter((a) => selected.includes(a.id));
  const zoneA = incident.zones[0];
  const copy = HEADLINE[lang];

  return (
    <div className={s.paper}>
      <header className={s.head}>
        <div className={s.headText}>
          <h2>Public alert</h2>
          <p>Compose, review and send alerts to citizens via the public safety app.</p>
        </div>
        <div className={s.headActions}>
          <Button variant="ghost" size="md" icon={<History size={14} strokeWidth={1.6} />}>
            Alert history
          </Button>
        </div>
      </header>

      <div className={s.columns}>
        {/* ---- Steps 1–3 ---- */}
        <div className={s.col}>
          <div className={s.step}>
            <span className={s.stepLabel}>
              <span className={s.stepNum}>1</span> Select alert template
            </span>
            <select className={s.select} defaultValue="collision">
              <option value="collision">Possible vessel collision — evacuate zone</option>
              <option value="landslide">Landslide warning — shelter in place</option>
              <option value="flood">Flood warning — move to high ground</option>
            </select>
            <p className={s.hint}>
              Use this template when a vessel is at risk of collision and citizens in a specific zone
              need to evacuate to a safe area.
            </p>
          </div>

          <div className={s.step}>
            <span className={s.stepLabel}>
              <span className={s.stepNum}>2</span> Select official actions
            </span>
            <div className={s.actionList}>
              {ACTIONS.map((a) => {
                const on = selected.includes(a.id);
                return (
                  <button key={a.id} type="button" className={s.actionItem} onClick={() => toggle(a.id)}>
                    <span className={`${s.actionCheck} ${on ? toneCheck(a.tone) : ''}`}>
                      {on && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span>
                      <span className={s.actionName} style={{ color: on ? toneColor(a.tone) : undefined }}>
                        {a.copy.en.name}
                      </span>
                      <span className={s.actionDesc}>{a.copy.en.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={s.step}>
            <span className={s.stepLabel}>
              <span className={s.stepNum}>3</span> Target area
            </span>
            <select className={s.select} defaultValue="zoneA">
              <option value="zoneA">Zone A — Flåm harbour area</option>
              <option value="zoneB">Zone B — warning perimeter</option>
              <option value="all">Both zones</option>
            </select>
            <div className={s.statRow}>
              <span className={s.statCell}>
                <span className={s.statLabel}>Population</span>
                <span className={s.statValue}>{num(zoneA?.estimatedPeopleInside ?? 0)}</span>
              </span>
              <span className={s.statCell}>
                <span className={s.statLabel}>Devices</span>
                <span className={s.statValue}>{num(incident.civiliansNotifiedCount * 0.66)}</span>
              </span>
              <span className={s.statCell}>
                <span className={s.statLabel}>Area</span>
                <span className={s.statValue}>0.47</span>
              </span>
            </div>
            <div className={s.notice}>
              <TriangleAlert size={14} strokeWidth={1.8} style={{ flex: 'none', marginTop: 1 }} />
              Only users inside the selected area will receive this alert.
            </div>
          </div>
        </div>

        {/* ---- Step 4: message preview ---- */}
        <div className={s.col}>
          <span className={s.stepLabel}>
            <span className={s.stepNum}>4</span> Alert message preview
          </span>
          <div className={s.previewCard}>
            <div className={s.langTabs} role="tablist">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  role="tab"
                  aria-selected={lang === l.id}
                  className={`${s.langTab} ${lang === l.id ? s.langTabActive : ''}`}
                  onClick={() => setLang(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className={s.previewBody}>
              <div className={s.alertHeader}>
                <TriangleAlert size={26} strokeWidth={2} style={{ flex: 'none' }} />
                <span>
                  <span className={s.alertHeaderTitle}>{copy.title}</span>
                  <span className={s.alertHeaderSub}>{copy.sub}</span>
                </span>
              </div>

              {chosen.map((a) => (
                <div className={s.msgAction} key={a.id}>
                  <span className={s.msgActionIcon} style={{ color: toneColor(a.tone) }}>
                    {a.icon}
                  </span>
                  <span>
                    <span className={s.msgActionName}>{a.copy[lang].name}</span>
                    <span className={s.msgActionDesc}>{a.copy[lang].desc}</span>
                  </span>
                </div>
              ))}

              <div className={s.important}>
                <span className={s.importantHead}>
                  <Info size={14} strokeWidth={2} />
                  {copy.important}
                </span>
                <span className={s.importantBody}>{copy.note}</span>
              </div>

              <div className={s.meta}>
                <span>
                  <span className={s.statLabel}>Time</span>
                  <span className={s.statValue}>{timeOnly(incident.lastVerifiedTimestamp)}</span>
                </span>
                <span>
                  <span className={s.statLabel}>Date</span>
                  <span style={{ fontSize: 'var(--t-12)' }}>{dateLong(incident.createdTimestamp)}</span>
                </span>
                <span>
                  <span className={s.statLabel}>Source</span>
                  <span style={{ fontSize: 'var(--t-12)' }}>Inner Sogn Emergency Coordination</span>
                </span>
              </div>
            </div>
          </div>
          <p className={s.hint}>Messages are pre-approved and cannot be freely edited.</p>
        </div>

        {/* ---- Step 5: targeting map ---- */}
        <div className={s.col}>
          <span className={s.stepLabel}>
            <span className={s.stepNum}>5</span> Targeting preview
          </span>
          <div className={s.mapBox} style={{ flex: 1 }}>
            <IncidentMap
              defaultBasemap="topo"
              layers={{ cone: false, distress: false, helipads: false }}
              showLayerPanel={false}
              showReadout={false}
              showVesselCallout={false}
            />
          </div>
          <div className={s.statRow}>
            <span className={s.statCell}>
              <span className={s.statLabel}>Reach</span>
              <span className={s.statValue}>{num(zoneA?.estimatedPeopleInside ?? 0)}</span>
            </span>
            <span className={s.statCell}>
              <span className={s.statLabel}>Channels</span>
              <span style={{ fontSize: 'var(--t-11)' }}>App · Push · SMS</span>
            </span>
            <span className={s.statCell}>
              <span className={s.statLabel}>Stage</span>
              <span className={s.statValue}>{currentStage.t}</span>
            </span>
          </div>
        </div>

        {/* ---- Step 6: phone preview ---- */}
        <div className={`${s.col} ${s.colPhone}`}>
          <span className={s.stepLabel}>
            <span className={s.stepNum}>6</span> Mobile app preview
          </span>
          <div className={s.phoneWrap}>
            <div className={s.phone}>
              <div className={s.phoneScreen}>
                <div className={s.phoneStatus}>
                  <span>14:45</span>
                  <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Wifi size={9} strokeWidth={2} />
                    <BatteryFull size={11} strokeWidth={2} />
                  </span>
                </div>
                <div className={s.phoneAlert}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <TriangleAlert size={16} strokeWidth={2.2} style={{ flex: 'none' }} />
                    <span>
                      <span className={s.phoneAlertTitle}>{copy.title.toUpperCase()}</span>
                      <span className={s.phoneAlertSub}>{copy.sub}</span>
                    </span>
                  </div>
                </div>
                <div className={s.phoneInside}>
                  {lang === 'no' ? 'Du er i det berørte området' : 'You are inside the affected area'}
                </div>
                {chosen.slice(0, 3).map((a) => (
                  <span className={s.phoneRow} key={a.id}>
                    <span style={{ color: toneColor(a.tone), flex: 'none' }}>{a.icon}</span>
                    {a.copy[lang].name}
                  </span>
                ))}
                <div className={s.phoneCta}>
                  {lang === 'no' ? 'GÅ TIL TRYGGHET' : 'GO TO SAFETY'}
                </div>
                <div className={s.phoneCtaGhost}>
                  {lang === 'no' ? 'JEG TRENGER HJELP' : 'I NEED HELP'}
                </div>
              </div>
            </div>
          </div>
          <p className={s.hint}>This is how the alert will appear in the citizen app.</p>
        </div>
      </div>

      {/* ---- Step 7: review and activate ---- */}
      <div className={s.review}>
        <span className={s.stepNum}>7</span>
        <span className={s.reviewText}>
          <span className={s.reviewTitle}>Review and activate</span>
          <span className={s.reviewSub}>
            {chosen.length} official actions · 4 languages · {num(zoneA?.estimatedPeopleInside ?? 0)}{' '}
            people in the target area
          </span>
        </span>

        {isAlertBroadcasted && <Pill tone="safe">Broadcast delivered</Pill>}

        <span className={s.reviewActions}>
          <Button variant="ghost" size="lg" icon={<Eye size={15} strokeWidth={1.6} />}>
            Review alert
          </Button>
          <Button variant="ghost" size="lg" icon={<Save size={15} strokeWidth={1.6} />}>
            Save as draft
          </Button>
          {confirming ? (
            <>
              <Button
                variant="ghost"
                size="lg"
                icon={<X size={15} strokeWidth={1.6} />}
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
              <Button
                variant="critical"
                size="lg"
                icon={<Send size={15} strokeWidth={1.8} />}
                onClick={() => {
                  broadcastPublicAlert();
                  setConfirming(false);
                }}
              >
                Confirm — send to {num(zoneA?.estimatedPeopleInside ?? 0)} people
              </Button>
            </>
          ) : (
            <Button
              variant="critical"
              size="lg"
              disabled={isAlertBroadcasted || chosen.length === 0}
              icon={<Send size={15} strokeWidth={1.8} />}
              onClick={() => setConfirming(true)}
            >
              {isAlertBroadcasted ? 'Alert sent' : 'Approve & send now'}
            </Button>
          )}
        </span>
      </div>

      {/* A sentence, not a label — Eyebrow is white-space:nowrap by design and
          forced this module to 708px on a phone. */}
      <p className={s.footnote}>
        Human authorisation required · every alert is logged and time-stamped · drill data only
      </p>
    </div>
  );
};

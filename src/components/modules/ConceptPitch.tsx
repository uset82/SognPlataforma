import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';

import { Button, Eyebrow, Panel, Pill } from '../primitives';
import s from './ConceptPitch.module.css';

/* ============================================================================
   CONCEPT & PITCH

   The origin gallery. These are the generated prototype images the console was
   designed against, shown large enough to actually inspect rather than as a
   row of thumbnails nobody can read.
   ============================================================================ */

interface Slide {
  id: string;
  kind: 'Professional platform' | 'Civilian app' | 'System';
  title: string;
  image: string;
  caption: string;
}

const SLIDES: Slide[] = [
  {
    id: 'overview',
    kind: 'System',
    title: 'One platform, every response',
    image: '/prototypes/platform-overview.png',
    caption:
      'The complete concept: a shared situational picture for professionals, a network of specialised agents, and simple personal guidance for civilians — before, during and after an incident.',
  },
  {
    id: 'dashboard',
    kind: 'Professional platform',
    title: 'Shared incident picture',
    image: '/prototypes/platform-dashboard.png',
    caption:
      'The incident dashboard concept. Cartography carries the situation; the right rail answers what a commander must know in one second — time to impact, people at risk, evacuation progress.',
  },
  {
    id: 'preimpact',
    kind: 'Professional platform',
    title: 'Fifteen minutes before impact',
    image: '/prototypes/platform-preimpact.png',
    caption:
      'The pre-impact risk view. Vessel telemetry on the left, the drift geometry in the middle, and the pre-approved response on the right — so the decision is a confirmation, not an invention.',
  },
  {
    id: 'agents',
    kind: 'Professional platform',
    title: 'Agent orchestration',
    image: '/prototypes/platform-agents.png',
    caption:
      'Sixteen specialised agents beneath a single orchestrator. Structure is communicated with hierarchy and hairlines. Critical actions stay behind explicit human authorisation.',
  },
  {
    id: 'public-alert',
    kind: 'Professional platform',
    title: 'Public alert management',
    image: '/prototypes/platform-public-alert.png',
    caption:
      'Composing a civilian broadcast in four languages, with the targeting map and the phone preview side by side. The only paper-white screen in the product, because it is a document being authored.',
  },
  {
    id: 'medical',
    kind: 'Professional platform',
    title: 'Medical & rescue coordination',
    image: '/prototypes/platform-medical.png',
    caption:
      'Hospital capacity, responder dispatch and triage zones in one view — the three questions a medical commander asks while the reception is still being built.',
  },
  {
    id: 'app-ready',
    kind: 'Civilian app',
    title: 'Ready — no active emergency',
    image: '/prototypes/app-ready.png',
    caption:
      'The everyday state. Calm, green, and quietly useful: safe places, offline information, and a downloaded emergency pack that survives a cellular outage.',
  },
  {
    id: 'app-alert',
    kind: 'Civilian app',
    title: 'Warn — you are in the affected area',
    image: '/prototypes/app-alert.png',
    caption:
      'One second to comprehension. Am I in danger, how long do I have, where do I go, and what if I need help — nothing else competes for attention.',
  },
  {
    id: 'app-find-safety',
    kind: 'Civilian app',
    title: 'Guide — the nearest confirmed safe area',
    image: '/prototypes/app-find-safety.png',
    caption:
      'Professional complexity becomes civilian simplicity: the danger zone, the blocked waterfront and a single confirmed destination 8 minutes away.',
  },
  {
    id: 'app-evacuate',
    kind: 'Civilian app',
    title: 'Move — turn-by-turn away from the water',
    image: '/prototypes/app-evacuate.png',
    caption:
      'Turn-by-turn guidance that actively routes away from the waterfront, with "I need help" always one tap away for anyone who cannot walk out.',
  },
];

export const ConceptPitch: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const slide = SLIDES[index];

  const go = (delta: number) =>
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={s.wrap}>
      <div className={s.side}>
        <Panel
          title="Concept origin"
          eyebrow="INN524 · HVL"
          actions={<Pill tone="neutral">{SLIDES.length}</Pill>}
        >
          <div className={s.slideNav}>
            {SLIDES.map((sl, i) => (
              <button
                key={sl.id}
                type="button"
                className={`${s.slideItem} ${i === index ? s.slideItemActive : ''}`}
                onClick={() => setIndex(i)}
                aria-current={i === index}
              >
                <span className={s.slideIndex}>{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className={s.slideName}>{sl.title}</span>
                  <span className={s.slideKind}>{sl.kind}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="The concept in four lines" eyebrow="Summary" pad>
          <div className={s.points}>
            <span className={s.point}>
              <span className={s.pointMark}>01</span>
              <span>
                <b>Problem.</b> A large passenger vessel could lose control near a quay in Indre
                Sogn, with minutes to warn thousands of people.
              </span>
            </span>
            <span className={s.point}>
              <span className={s.pointMark}>02</span>
              <span>
                <b>Platform.</b> Professionals hold one shared situational picture instead of five
                partial ones.
              </span>
            </span>
            <span className={s.point}>
              <span className={s.pointMark}>03</span>
              <span>
                <b>Agents.</b> Specialised agents connect information and actors; humans keep every
                command decision.
              </span>
            </span>
            <span className={s.point}>
              <span className={s.pointMark}>04</span>
              <span>
                <b>App.</b> Civilians get simple personal guidance, and can ask for help when they
                cannot evacuate themselves.
              </span>
            </span>
          </div>

          <div className={s.callout} style={{ marginTop: 'var(--s4)' }}>
            This platform is an academic drill object. It sits beside VHF Ch 16, Nødnett and CIM —
            it does not connect to them, and it never dispatches statutory responders.
          </div>
        </Panel>
      </div>

      <div className={s.stage}>
        <figure className={s.figure}>
          <div className={s.figureHead}>
            <Eyebrow>{slide.kind}</Eyebrow>
            <span className={s.figureTitle}>{slide.title}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--s2)' }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => go(-1)}
                aria-label="Previous"
                icon={<ChevronLeft size={15} strokeWidth={1.8} />}
              />
              <Eyebrow muted>
                {index + 1} / {SLIDES.length}
              </Eyebrow>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => go(1)}
                aria-label="Next"
                icon={<ChevronRight size={15} strokeWidth={1.8} />}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoomed(true)}
                aria-label="Enlarge"
                icon={<Maximize2 size={14} strokeWidth={1.8} />}
              />
            </span>
          </div>

          <div className={s.figureBody} onClick={() => setZoomed(true)}>
            <img
              key={slide.id}
              className={s.figureImg}
              src={slide.image}
              alt={slide.title}
              loading="lazy"
            />
          </div>

          <figcaption className={s.figureCaption}>{slide.caption}</figcaption>
        </figure>
      </div>

      {zoomed && (
        <div
          className={s.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={slide.title}
          onClick={() => setZoomed(false)}
        >
          <div className={s.lightboxBar} onClick={(e) => e.stopPropagation()}>
            <ImageIcon size={15} strokeWidth={1.6} color="var(--text-lo)" />
            <Eyebrow>{slide.kind}</Eyebrow>
            <span className={s.figureTitle}>{slide.title}</span>
            <span style={{ marginLeft: 'auto' }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoomed(false)}
                aria-label="Close"
                icon={<X size={16} strokeWidth={1.8} />}
              />
            </span>
          </div>
          <img className={s.lightboxImg} src={slide.image} alt={slide.title} />
        </div>
      )}
    </div>
  );
};

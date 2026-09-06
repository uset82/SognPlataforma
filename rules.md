# SOGN SAFE Emergency Platform - Agent Governance & Rules (`rules.md`)

> Standard: [OpenAI Codex Rules Specification](https://developers.openai.com/codex/rules)  
> Project: **SOGN SAFE - Professional Emergency Coordination Platform** (`plataforma`)  
> Context: HVL Master INN524 - Digital Preparedness in Sogn (Autumn 2026)

---

## 1. Core Operating Principles

1. **Single Source of Truth**:  
   [`taskplan.md`](file:///c:/Users/carlos/HVL2026/Autumn_2026/INN524/plataforma/taskplan.md) is the sole authority for implementation progress. Agents must read `taskplan.md` at the start of every session and resume from the first unchecked task.
2. **Sequential Phase Progression**:  
   Phases must be completed in order. Never skip tasks or jump ahead because a later task seems easier or more interesting.
3. **No Unverified Completion**:  
   A task may only be marked `- [x]` AFTER both implementation AND active verification (build, unit test, or visual inspection) have succeeded.
4. **Transparent Blockers**:  
   If an agent is blocked by external dependencies, missing credentials, or environment limits, leave the task unchecked and append:
   `BLOCKED: <exact reason and next required action>`
5. **No Hallucinated Functionality**:  
   Never claim that push notifications, WebSocket connections, or physical device behavior work without concrete terminal or visual verification evidence.

---

## 2. Frontend Engineering & Design Non-Negotiables

### 2.1. Visual Aesthetic: Nordic Civic × iOS 26 Liquid Glass
- **Approved Palette**:
  - Paper: `#F4F3EF`
  - Tactical Ink: `#171A1A`
  - Stone Dividers: `#D8D9D4`
  - Fjord Gray-Green: `#53686B`
  - Pine Safety: `#31584C`
  - Signal Danger: `#B83A32`
  - Alert Amber: `#D97706`
- **Strictly Banned Aesthetics**:
  - No purple, violet, or lilac accent gradients.
  - No neon cyan / cyberpunk glows or dark-navy SaaS AI templates.
  - No decorative glassmorphism without high contrast backdrop containment.
  - No stock emojis in place of tactical icons.
  - No fake ambulance ETAs or unsubstantiated emergency arrival times.
- **Surface Elevation (iOS 26 Liquid Glass)**:
  - Frosted blur: `backdrop-filter: blur(20px) saturate(180%)`.
  - Edge illumination: 1px hairline gradient highlight on top and left borders (`rgba(255,255,255,0.2)` to `rgba(255,255,255,0.02)`).
  - Ambient shadows: Soft, multi-layered diffuse drop shadows (`smooth-shadow-*`) with hairline rings (`smooth-shadow-ring-*`) preventing double borders.

### 2.2. Typography & Readability
- Primary Body/Display: **Schibsted Grotesk** or **Inter** (optimized for Scandinavian characters: `æ`, `ø`, `å`).
- Tactical Telemetry: **IBM Plex Mono** (used strictly for coordinates, timestamps, AIS data, and the T-15 countdown).
- Instant Comprehension: The primary emergency status, vessel situation, and evacuation posture must be understandable within **1 second** of viewing the dashboard.

### 2.3. Anti-Slop Audit Requirements
Before completing any visual component or page, run the 10-point audit from [`skills.md`](file:///c:/Users/carlos/HVL2026/Autumn_2026/INN524/plataforma/skills.md). Any component scoring below 90/100 under `wd audit` must be refactored before proceeding.

---

## 3. Technology & Code Architecture Standards

1. **Strict TypeScript**:  
   `tsconfig.json` must enforce strict type-checking (`"strict": true`). No unchecked `any` types in domain models.
2. **Clean Compilation**:  
   Every phase must pass `npx tsc --noEmit` with **0 errors** before being checked off.
3. **Component Reusability**:  
   All visual primitives (`CivicCard`, `StatusBadge`, `ActionTrigger`, `TelemetryDisplay`, `TriagePill`) must reside in `src/components/` and derive their styles from CSS custom properties.
4. **Performance & Motion**:  
   Animations must animate only `transform` and `opacity` to avoid browser layout recalculations. Full support for `prefers-reduced-motion` is required.
5. **Contract Consistency**:  
   Incident states, coordinates, condition enums, and event schemas must strictly match the mobile app definitions in `../app/src/types/incident.ts`.

---

## 4. Academic, Ethical & Statutory Boundaries

1. **Total Defense & Sikkerhetsloven Compliance**:  
   Per the HVL INN524 course charter, this project is an **academic innovation prototype and drill object**.
2. **No Real Statutory Integrations**:  
   The platform must **NEVER** claim or attempt live connections to statutory closed crisis systems (CIM, Nodnett, Kystradio, closed BarentsWatch, or 110/112/113 dispatch).
3. **Fictional Scenario Data**:  
   All vessel names (e.g. `Viking Glory`), passenger numbers (~2,843), impact coordinates, and civilian distress logs are fictional drill data.
4. **Mandatory Prototype Disclaimers**:  
   Every public-facing dashboard screen and presentation slide must prominently display:
   > `SOGN SAFE - EMERGENCY COORDINATION PLATFORM | INN524 INNOVATION PROTOTYPE | TRAINING / DRILL ONLY`
5. **No Secret Credentials in Source**:  
   API keys (OpenRouter, Expo Access Tokens) must never be hardcoded into frontend bundles.

---

## 5. Session Handover & Progress Reporting

At the conclusion of every working session, the active agent must update the **End-of-Session Report** in [`taskplan.md`](file:///c:/Users/carlos/HVL2026/Autumn_2026/INN524/plataforma/taskplan.md) specifying:
- Last completed phase and task.
- Full checklist of tasks completed during the session.
- Terminal commands executed and verification results.
- Clickable links to all modified files (`file:///...`).
- Any open blockers.
- The exact next sequential task to resume.

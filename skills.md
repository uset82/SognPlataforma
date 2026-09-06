# SOGN SAFE Emergency Platform - Agent Skills Catalog (`skills.md`)

> Framework: [AgentSkills Specification](https://agentskills.io/home) & [OpenAI Codex Skills Standard](https://developers.openai.com/codex/skills)  
> Project: **SOGN SAFE - Professional Emergency Coordination Platform** (`plataforma`)  
> Context: HVL Master INN524 - Digital Preparedness in Sogn (Autumn 2026)

---

## 1. Skill Taxonomy Overview

Skills represent executable capabilities that agents invoke to design, build, simulate, and verify the platform.

```text
├── Visual & Material Engineering
│   ├── frontend-design
│   ├── ios26-liquid-glass
│   └── webdesigner-design-system
├── Interaction & Tactical Motion
│   ├── gsap-motion
│   └── telemetry-countdown
├── Spatial & Mission Intelligence
│   ├── gis-tactical-map
│   └── scenario-playbook-engine
└── Real-time Connectivity & Governance
    ├── civilian-bridge-sync
    └── anti-slop-audit
```

---

## 2. Detailed Skill Definitions

### 2.1. `frontend-design`
- **Category**: Visual & Aesthetic Engineering
- **Purpose**: Establishes a disciplined, Nordic civic visual thesis before UI implementation.
- **Inputs**: Design brief, emergency domain requirements.
- **Capabilities**:
  - Generates the 6-token color system:
    - `--color-paper`: `#F4F3EF` (Canvas surface)
    - `--color-ink`: `#171A1A` (Primary typography/dark elements)
    - `--color-stone`: `#D8D9D4` (Structural dividers, subtle borders)
    - `--color-fjord`: `#53686B` (Maritime accents & muted headers)
    - `--color-pine`: `#31584C` (Safe muster areas & verified status)
    - `--color-signal`: `#B83A32` (Emergency alerts & critical danger)
    - `--color-amber`: `#D97706` (Secondary warning & active drift)
  - Configures the dual-type hierarchy: Schibsted Grotesk / Inter (Norwegian grotesk body/display) + IBM Plex Mono (tactical telemetry).
  - Specifies one signature element: The live vessel drift vector and synchronized T-15 pre-impact countdown line.
- **Quality Floor**: Zero ungrounded hex codes; zero decorative gradient backgrounds.

---

### 2.2. `ios26-liquid-glass`
- **Category**: Material & Surface Engineering
- **Purpose**: Creates ultra-premium, tactile frosted glass panels with physical light reflection.
- **Inputs**: Surface elevation, hierarchy level (Primary Command, Secondary Telemetry, Overlay HUD).
- **Capabilities**:
  - Multi-tier backdrop blur: `backdrop-filter: blur(20px) saturate(180%)` with high-performance CSS containment.
  - Specular hairline highlight: Top/left 1px border gradient `linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 100%)`.
  - Stacked ambient shadows: Soft diffuse multi-layer drop shadows (`smooth-shadow-md`, `smooth-shadow-lg`) eliminating harsh drop-shadow edges.
  - Ring-based elevation: Employs inset and outer subtle rings (`smooth-shadow-ring-sm`) to prevent double-border defects.
- **Quality Floor**: Surface remains legibly high-contrast against map and animated background elements (contrast ratio >= 4.5:1).

---

### 2.3. `webdesigner-design-system`
- **Category**: Structural Component Architecture
- **Purpose**: Provides accessible, reusable emergency UI building blocks.
- **Inputs**: Component specification, interactive requirements.
- **Capabilities**:
  - Renders tactical components: `CivicCard`, `StatusBadge`, `ActionTrigger`, `TelemetryDisplay`, `TriagePill`.
  - Enforces WCAG AA touch targets (minimum 44x44px for interactive triggers).
  - Replaces emojis with pure SVG abstract tactical glyphs (vessel beacon, evacuation arrow, radio antenna, triage cross).
  - Provides semantic HTML landmarks (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `role="status"`).
- **Quality Floor**: Component score >= 90/100 under `wd audit`.

---

### 2.4. `gsap-motion`
- **Category**: Tactical Motion & Micro-Interactions
- **Purpose**: Delivers smooth, purposeful 60fps animations that convey operational status without distraction.
- **Inputs**: Component state transition, timeline trigger.
- **Capabilities**:
  - Smooth T-minus countdown second-by-second updates.
  - Vessel drift pulse and radar sweep animations.
  - Dynamic expansion and contraction of triage cards upon status changes.
  - Full `prefers-reduced-motion` compliance (replaces movement with instant opacity/color shifts).
- **Quality Floor**: Transforms and opacities only (GPU composited); zero layout recalculation (`reflow`) during animations.

---

### 2.5. `gis-tactical-map`
- **Category**: Spatial & Mission Intelligence
- **Purpose**: Visualizes the maritime hazard area and civilian evacuation corridor in Aurlandsfjorden.
- **Inputs**: Vessel telemetry (lat, lng, speed, heading), zone coordinates, civilian GPS pings.
- **Capabilities**:
  - Renders base tactical fjord cartography (Flåm harbour, Fretheim, Aurlandsfjorden, surrounding mountains).
  - Plots live vessel location, heading vector, and calculated 15-minute drift cone.
  - Overlays hazard zones:
    - **Zone A**: Immediate impact waterfront hazard area (Red fill: `rgba(184, 58, 50, 0.18)`, border: `#B83A32`).
    - **Zone B**: Secondary debris/evacuation warning zone (Amber fill: `rgba(217, 119, 6, 0.14)`, border: `#D97706`).
    - **Safe Zone**: Flåm School Muster Center (Green fill: `rgba(49, 88, 76, 0.20)`, border: `#31584C`).
  - Renders clustered civilian distress markers color-coded by triage condition.
  - Provides zoom/pan and focus-tracking shortcuts.
- **Quality Floor**: Renders smoothly with SVG/Canvas without frame drops during active scenario playback.

---

### 2.6. `scenario-playbook-engine`
- **Category**: State & Timeline Execution
- **Purpose**: Orchestrates the multi-stage emergency scenario state machine (Playbook F-03).
- **Inputs**: Time delta, operator action (`play`, `pause`, `step`, `seek`).
- **Capabilities**:
  - Maintains synchronized scenario clock (T-15:00 to T-00:00).
  - Triggers sequential stage activations:
    - `T-15`: Loss of steering reported by Ship Agent.
    - `T-13`: Main Agent activates Playbook F-03.
    - `T-12`: Risk Agent draws Zone A/B (~2,843 simulated civilians at risk).
    - `T-7`: Civilian alert broadcast triggered.
    - `T-5`: Influx of civilian distress calls.
    - `T-3`: Dynamic reroute around blocked waterfront.
    - `T-0`: Vessel arrest / safe muster verification.
  - Broadcasts scenario stage updates to the dashboard, map, agent network, and API bridge.
- **Quality Floor**: State transitions are deterministic, replayable, and reversible.

---

### 2.7. `civilian-bridge-sync`
- **Category**: Real-time Connectivity & Telemetry
- **Purpose**: Establishes high-reliability bidirectional communication with the civilian mobile app (`../app`).
- **Inputs**: Device registration, triage submission, push notification payload.
- **Capabilities**:
  - Ingests civilian help requests (`POST /api/help-request`) containing GPS coordinates, condition enum, and timestamp.
  - Emits real-time triage updates to the platform dashboard via WebSockets/SSE.
  - Sends responder acknowledgments (`POST /api/help-request/:id/acknowledge`) back to mobile devices.
  - Dispatches bulk emergency push notifications via Expo Push API.
  - Computes muster headcount statistics from civilian "I Am Safe" reports.
- **Quality Floor**: End-to-end distress signal reception and acknowledgment round-trip latency < 500 ms locally.

---

### 2.8. `anti-slop-audit`
- **Category**: Quality Floor & Governance
- **Purpose**: Rigorously evaluates code and visual design against standard anti-slop guidelines before release.
- **Checklist**:
  1. *Color Discipline*: Are all colors strictly from the approved 6-token Nordic palette?
  2. *Zero Gradients*: Are there any generic purple, lilac, or neon gradients? (Must be: **None**).
  3. *No AI Tropes*: Are there floating glowing orbs, holographic cards, or decorative cyber aesthetics? (Must be: **None**).
  4. *Card Hierarchy*: Is card nesting kept to a single layer without cards inside cards?
  5. *Immediate Glance Comprehension*: Can an emergency operator determine the critical situation in <= 3 seconds?
  6. *Accessibility*: Are contrast ratios >= 4.5:1 for body and >= 3:1 for large headers?
  7. *Typography*: Are Norwegian characters (`æ`, `ø`, `å`) and diacritics rendered cleanly without font replacement?
  8. *Responsive Integrity*: Does the layout adapt cleanly from 390px mobile to 1440px+ command consoles without horizontal scroll?
  9. *No Dead Controls*: Are all visible buttons, toggles, and sliders wired to live state or drill actions?
  10. *Statutory Boundaries*: Does the UI clearly state it is a training prototype and not connected to live police/CIM?
- **Quality Floor**: 100% compliance required for stage sign-off.

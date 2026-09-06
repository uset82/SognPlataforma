# SOGN SAFE — Emergency Coordination Platform (`plataforma`)

> **HVL Master INN524 — Innovation, Technology & Crisis Management (Autumn 2026)**  
> **Topic**: Autonomous Multi-Agent Systems for Maritime Preparedness & Evacuation in Indre Sogn / Flåm.  
> **Statutory Boundary**: Academic drill prototype. Sits *beside* statutory systems (VHF Ch. 16, Nodnett, Kystradio, and CIM). Does not claim classified dispatch authority.

---

## 1. System Overview

SOGN SAFE is a multi-agent emergency coordination and situational awareness platform engineered for narrow fjord communities facing sudden mass-casualty maritime threats. 

The primary scenario (**Scenario F-03**) models a severe rudder and propulsion casualty aboard a large cruise vessel (*M/S Viking Glory*, 2,420 souls onboard) drifting uncommanded 1.9 nautical miles north of Flåm harbor at 7.2 knots, projecting impact in **T-15:00 minutes** with ~2,843 residents and tourists in the waterfront danger zone.

```
+-----------------------------------------------------------------------------------------+
|                                    SOGN SAFE ECOSYSTEM                                  |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   +--------------------------+                         +----------------------------+   |
|   |   SOGN SAFE PLATFORM     |  <=== REST/Proxy ====>  |     SIMULATOR BACKEND      |   |
|   |  (Vite + React 19 + TS)  |     (Port 5173/4000)    |   (Node.js / Express 4000) |   |
|   |   - Incident Dashboard   |                         |  - Device Registry         |   |
|   |   - Tactical Fjord GIS   |                         |  - Scenario F-03 Engine    |   |
|   |   - 16-Agent Network     |                         |  - Push Token Dispatch     |   |
|   |   - Civilian Triage Feed |                         |  - Live Distress Ingestion |   |
|   |   - FjordLink Card       |                         +--------------+-------------+   |
|   |   - Academic Pitch Deck  |                                        ^                 |
|   +--------------------------+                                        |                 |
|                                                                 REST / Push             |
|                                                                       v                 |
|                                                        +----------------------------+   |
|                                                        |     CIVILIAN IPHONE APP    |   |
|                                                        |   (React Native / Expo)    |   |
|                                                        |  - Emergency Push Alert    |   |
|                                                        |  - Hazard Evacuation Map   |   |
|                                                        |  - "I Need Help" Triage    |   |
|                                                        |  - "I Am Safe" Muster Check|   |
|                                                        +----------------------------+   |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Design System: "Nordic Instrument"

The visual language is a Norwegian public-safety console — Kongsberg maritime bridge systems,
Kartverket nautical charts, Rams-era instrumentation. Not a gaming HUD, not a SaaS dashboard.

### Five laws

1. **The map is the product.** Real cartography, 55–65% of the viewport in map-led modules.
2. **Colour is exclusively semantic.** Chrome is graphite; `critical` / `warning` / `safe` /
   `fjord` appear *only* to carry incident meaning. If a colour is not carrying meaning, it is gray.
3. **Glass only floats.** `backdrop-filter` is permitted *only* on overlays physically above the
   map — layer panel, conditions readout, vessel callout. Never on flat panels.
4. **Three elevations.** `0` page ground · `1` panel (hairline ring, no shadow) · `2` floating over
   the map (glass + stacked shadow). No card inside a card, ever.
5. **Numerals are the hero.** Tabular figures throughout; the T-minus countdown is the largest
   type on screen.

**Signature element — the T-minus meridian.** A hairline under the alert bar carrying minute ticks
across the 15-minute pre-impact window, current moment as a filled notch. An instrument scale, not
a progress bar. Present on every module; expands into the scenario scrubber.

**Taste dials:** Variance 6 · Motion 3 · Density 7.

### Tokens (`src/styles/tokens.css`)

Graphite ground ramp (`--ground-0` … `--ground-3`) plus four semantic states. The named brand
palette in `rules.md` is authored for paper and fails contrast on graphite, so each state carries
an explicit on-dark sibling:

| Meaning | Paper (`rules.md`) | On graphite |
| :--- | :--- | :--- |
| Critical — impact, loss of control, time-to-impact | `#B83A32` | `#E85D54` |
| Warning — evacuation perimeter, pending authorisation | `#D97706` | `#F0A83A` |
| Safe — confirmed havens, verified check-ins | `#31584C` | `#4FBF8B` |
| Fjord — chrome accent, telemetry, water | `#53686B` | `#7E9A9E` |

The paper values are not decorative leftovers: they drive the **Public Alert** module, which is
deliberately the only light surface in the product because it is a *document being authored*
rather than an instrument being read.

### Typography

| Role | Face |
| :--- | :--- |
| Display — alert headlines, big metrics | **Archivo** 600–800 |
| UI / body | **Schibsted Grotesk** |
| Telemetry — coordinates, clocks, countdown | **IBM Plex Mono** (`tnum`, `zero`) |

`Inter` is deliberately not loaded.

### Cartography

Real maps via **MapLibre GL 6.7** with a hand-written React wrapper (`src/map/MapCanvas.tsx`).
Four basemaps, switched by toggling layer visibility so incident geometry is never torn down:

| Layer | Source | Notes |
| :--- | :--- | :--- |
| Aerial (default) | Esri World Imagery | No API key; note the reversed `{z}/{y}/{x}` tile order. Attribution is a licence condition. |
| Topographic | Kartverket `topo` | Free, open, no key. |
| Grayscale | Kartverket `topograatone` | Best base under dark incident overlays. |
| Nautical chart | Kartverket `sjokartraster` | Default for the pre-impact drift module. |

> Norge i bilder closed its open WMTS — orthophoto access is now restricted to *Norge digitalt*
> partners — which is why the aerial layer comes from Esri rather than Kartverket.

Hazard polygons, the evacuation route, distress points and the projected drift cone are all
generated from the real Flåm coordinates already held in `src/data/initialIncident.ts` via the
adapters in `src/lib/geo.ts`. There is no hand-positioned map geometry anywhere in the product.

### Styling

CSS Modules (`*.module.css`), not inline style objects — so hover, focus, active and breakpoint
states are all expressible. Console-first at ≥1440px, degrading to an icon rail at 1280px and a
stacked layout at 1180px.

## 3. The 16-Agent Emergency Coordination Matrix

The platform orchestrates 16 specialized agents structured in 5 functional groups:

| Functional Group | Agent Name | Core Role & Telemetry Handled |
| :--- | :--- | :--- |
| **Input / Sensing** | **Ship Agent** | Ingests AIS telemetry, rudder status, bearing (194°), drift speed (7.2 kts). |
| **Orchestration** | **Main Agent** | Activates Playbook F-03, coordinates agency boundaries, synchronizes clocks. |
| **Orchestration** | **Risk Agent** | Calculates impact cone, models Zone A (Waterfront) and Zone B (Warning Area). |
| **Response** | **Response Agent** | Broadcasts alerts to municipal first responders. |
| **Response** | **Hospital Agent** | Clears 45 triage beds at Førde / Lærdal, prepares trauma bays. |
| **Response** | **Police Agent** | Enforces waterfront exclusion zone and traffic rerouting around Fretheim. |
| **Response** | **Fire Agent** | Deploys Aurland & Sogndal crews for shoreside barrier containment. |
| **Response** | **Coast Guard (RS)** | Tasks rescue vessels *RS Halfdan Grieg* and tugs from Gudvangen. |
| **Response** | **Harbour Agent** | Clears Berth 1-3, clears pleasure craft, prepares emergency mooring. |
| **Response** | **Municipal Lead** | Convenes Aurland crisis council (*Kriseledelse*), oversees safe havens. |
| **Response** | **Transport Agent** | Dispatches electric buses for evacuation to Flåm Skule & Samfunnshus. |
| **Public & Civilian** | **Public Alert Agent** | Prepares multilingual warnings for mobile push broadcast. |
| **Public & Civilian** | **Citizen Agent** | Aggregates civilian GPS coordinates, maps distress triage, logs safe check-ins. |
| **Public & Civilian** | **Media / Rumour** | Counters misinformation, updates press dashboard, monitors social feeds. |
| **Support** | **Power / Infra Agent** | Monitors substation power grid and backup diesel generators. |
| **Support** | **Telecom Agent** | Manages cellular BTS capacity and satellite backhaul failover. |
| **Support** | **Logistics Agent** | Distributes blankets, water, and warm shelter supplies at Flåm School. |

---

## 4. Operational Drill Guide (Running Scenario F-03)

### Step 1: Launch Dev Server & Backend Simulator
```powershell
# In c:\Users\carlos\HVL2026\Autumn_2026\INN524\plataforma
npm run dev
# Server active at http://localhost:5173

# Simulator API active on port 4000
node ..\app\simulator\server.js
```

### Step 2: Open Dashboard & Run Playbook
1. Open `http://localhost:5173/` in any modern web browser.
2. In the bottom **Scenario Timeline Scrubber**, click **"RUN PLAYBOOK"** (or use spacebar in presentation mode).
3. The scenario advances through the 16 stages (T-15 down to T-0).
4. At **T-7**, click **"AUTHORIZE EMERGENCY BROADCAST"** to transmit push alerts to registered mobile test devices.
5. In **Civilian Distress Triage**, view incoming signals and click **"SEND ACKNOWLEDGMENT TO DEVICE"** to update civilian status.
6. In **Tactical Fjord GIS**, watch the vessel drift cone close on Flåm Kai, while the evacuation route dynamically diverts civilians around Fretheim when the waterfront is cordoned off at **T-3**.
7. In **FjordLink Card**, inspect the 3-fact vessel disembarkation tally and assign emergency berths.
8. In **Academic Presentation Mode**, press arrow keys to navigate the INN524 research slides.

---

## 5. OpenRouter Agent SDK & Free AI Models

The platform is integrated with `@openrouter/agent` connecting to OpenRouter's free model tier for multi-agent reasoning and voice synthesis:

- **Chat Reasoning Models**:
  - `openrouter/free`: Automatic routing across best available free providers.
  - `minimax/minimax-m3:free`: Fast agentic reasoning for emergency situational reports.
  - `thinkingmachines/inkling:free`: Analytical deliberation for risk projection.
- **Voice TTS Models**:
  - `fish-audio/s2.1-pro-free:free`: Tactical radio-quality emergency broadcast voice.
  - `deepgram/flux-tts:free`: High-clarity civilian alert dispatch speech.

---

## 6. Verification & Quality Standards

- **TypeScript Strictness**: `npx tsc --noEmit` compiles with 0 errors.
- **Production Build**: `npm run build` compiles clean static assets in under 3 seconds.
- **Bi-directional Sync**: Platform and simulator communicate via Vite proxy (`/api/state`, `/api/help`, `/api/safe`).
- **Agent SDK Execution**: Tested via interactive console in the 16-Agent Network view with live speech playback and decision log dispatch.

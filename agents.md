# SOGN SAFE Emergency Platform - Agent Architecture (`agents.md`)

> Standard: [OpenAI Codex Agents Specification](https://developers.openai.com/codex/guides/agents-md) & [agents.md Standard](https://github.com/agentsmd/agents.md)  
> Project: **SOGN SAFE - Professional Emergency Coordination Platform** (`plataforma`)  
> Context: HVL Master INN524 - Digital Preparedness in Sogn (Autumn 2026)

---

## 1. System Overview & Purpose

The **SOGN SAFE Emergency Coordination Platform** is a specialized mission-critical web application designed for municipal emergency coordinators, harbour masters, and civilian landing teams in Indre Sogn. It provides:
1. Real-time pre-impact situational awareness during maritime emergencies (such as a vessel losing manoeuvrability in narrow fjords).
2. A 16-agent simulated multi-agent coordination network supporting human-in-the-loop decision-making.
3. Live bidirectional telemetry with civilian mobile devices (`../app`) for alert broadcasting, evacuation guidance, and distress triage.
4. FjordLink 3-Fact landing status coordination beside statutory VHF and municipal systems.

To maintain engineering discipline, autonomous execution is partitioned into specialized development and operational agent roles.

---

## 2. Core Project Development Agents

| Agent Role | Primary Focus | Stage Ownership | Core Artifacts |
| :--- | :--- | :--- | :--- |
| **Architect Agent** | Architecture, schema governance, state topology | `plan`, `architecture` | Domain schemas, API specs, `taskplan.md` |
| **Design & Visual Engineer** | UI/UX, iOS 26 Liquid Glass, Nordic design system | `design`, `tokens` | CSS tokens, UI primitives, design audits |
| **Simulation & Playbook Agent** | 15-Minute pre-impact scenario, T-15..T-0 timeline | `scenario`, `state` | Timeline state machine, playbook runner |
| **Multi-Agent Network Lead** | 16-Agent emergency model, reasoning visualizer | `agents-view`, `graph` | Agent state store, message bus log |
| **Civilian Bridge & API Agent** | REST endpoints, WebSockets, push dispatch | `backend`, `bridge` | Express/Vite API, Expo Push client |
| **QA & Verification Agent** | TypeScript, anti-slop audit, accessibility, drill verification | `audit`, `verify` | Build logs, WCAG audit, test suites |

---

## 3. Detailed Agent Specifications

### 3.1. Architect Agent
- **Mission**: Establish foundational engineering standards, state management boundaries, and data contracts.
- **Responsibilities**:
  - Normalize requirements and translate user intent into structured tasks.
  - Enforce data contracts between the platform and the mobile application (`src/types/`).
  - Maintain `taskplan.md` as the authoritative single source of truth.
  - Guarantee that statutory boundaries (*Sikkerhetsloven*, non-claim of live CIM/Nodnett integration) are respected.
- **Tools & Permissions**: Workspace file creation, architecture documentation, schema definition.

### 3.2. Frontend Design & Visual Engineer Agent
- **Mission**: Deliver a premier, responsive, highly readable emergency UI combining Nordic civic aesthetics with iOS 26 Liquid Glass materials.
- **Responsibilities**:
  - Apply the `frontend-design` and `ui-skills` standards to prevent visual slop.
  - Maintain the Nordic color palette: Paper (`#F4F3EF`), Tactical Ink (`#171A1A`), Muted Fjord (`#53686B`), Pine (`#31584C`), and Signal Red (`#B83A32`).
  - Build frosted glass surfaces with high-performance CSS (`backdrop-filter`, hairline highlights, diffuse stacked shadows).
  - Implement Norwegian typography hierarchy (Schibsted Grotesk / Inter paired with IBM Plex Mono).
  - Ensure immediate legibility under stressful high-cognitive-load conditions (1-second glance comprehension).
- **Tools & Permissions**: CSS custom properties, component construction, WebDesigner CLI audit (`wd audit`).

### 3.3. Simulation & Playbook Agent
- **Mission**: Drive the interactive 15-minute pre-impact emergency timeline (Scenario F-03: Flåm Vessel Collision Risk).
- **Responsibilities**:
  - Implement the T-15 to T-0 timeline state machine.
  - Bind scenario events to dashboard metrics, GIS hazard layers, and responder notifications.
  - Provide interactive operator controls: Play, Pause, Step Forward/Back, and Fast-Forward.
  - Synchronize countdown clocks across all connected platform views and civilian clients.
- **Tools & Permissions**: State store management, timeline transitions, scenario data mocking.

### 3.4. Multi-Agent Network Lead Agent
- **Mission**: Model and visualize the 16 specialized emergency coordination agents.
- **Agents Supervised**:
  1. *Input*: Ship Agent (vessel digital voice).
  2. *Orchestration*: Main Agent / Orchestrator, Risk Agent (danger zone modeling).
  3. *Response*: Response Agent, Hospital Agent, Police Agent, Fire Agent, Coast Guard / RS Agent, Harbour Agent, Municipal Lead Agent, Transport Agent.
  4. *Public*: Public Alert Agent, Citizen Agent, Media / Rumour Control Agent.
  5. *Support*: Power / Infrastructure Agent, Telecommunications Agent, Logistics Agent.
- **Responsibilities**:
  - Maintain the multi-agent graph with live state indicators (`STANDBY`, `ACTIVE`, `ALERT`, `TRANSMITTING`).
  - Enforce human-in-the-loop authorization gates before any public alert is transmitted.
  - Maintain the multi-agent decision trace log.

### 3.5. Civilian Bridge & API Agent
- **Mission**: Provide real-time data exchange and push dispatch between the platform and the civilian mobile app.
- **Responsibilities**:
  - Implement minimal, resilient REST and WebSocket/SSE endpoints.
  - Ingest civilian distress calls (`INJURED`, `TRAPPED`, `CANNOT_WALK`) with live GPS coordinates.
  - Transmit responder acknowledgments back to civilian devices.
  - Integrate Expo Push Notification service for emergency alert broadcasting.
  - Maintain optimistic local caching for degraded narrow-fjord connectivity.

### 3.6. QA & Verification Agent
- **Mission**: Enforce uncompromising code quality, accessibility, anti-slop compliance, and drill verification.
- **Responsibilities**:
  - Enforce strict TypeScript compilation (`npx tsc --noEmit` = 0 errors).
  - Run anti-slop visual inspections via `wd audit` (enforcing scores >= 90).
  - Ensure full WCAG AA contrast compliance and keyboard navigability.
  - Verify two-way mobile app integration through automated and manual end-to-end testing.
  - Verify that no real credentials or sensitive municipal data are committed.

---

## 4. Agent Collaboration & Stage Transitions

```text
[ Architect Agent ]
       │
       ▼ (Defines schemas & taskplan.md)
[ Frontend Design Agent ] ───► [ Simulation & Multi-Agent Lead ]
       │                                     │
       ▼ (Components & Glass Shell)          ▼ (Scenario & Agent State)
           └──────────────┬──────────────────┘
                          ▼
            [ Civilian Bridge Agent ]
                          │
                          ▼ (End-to-End Testing)
            [ QA & Verification Agent ]
```

---

## 5. Decision & Escalation Protocols

1. **Task Modification**: No task in `taskplan.md` may be skipped or marked complete without verifiable evidence.
2. **Design Changes**: Any change to typography, colors, or core layouts must pass the anti-slop checklist.
3. **Emergency Modeling**: All scenarios, AIS telemetry, and civilian data must remain strictly simulated/fictional per HVL research ethics and Norwegian *Sikkerhetsloven*.

# DESIGN CORRECTION — USE MY WEBDESIGNER SKILLS

STOP before doing more visual work.

The current UI is falling into generic AI-generated aesthetics:
- blue gradients
- lilac / purple accents
- glowing SaaS cards
- overly rounded AI-style components
- generic startup landing-page composition

I do NOT want that.

You already have access to my WebDesigner repository:

https://github.com/uset82/webdesigner

USE IT.

Do not merely use the repository as a reference.
Follow its frontend design workflow before changing the site.

---

# REQUIRED WEBDESIGNER WORKFLOW

Before writing more frontend code, read and apply:

1. `AGENTS.md`
2. `docs/frontend-guidelines.md`
3. `skills/frontend-design/SKILL.md`
4. `skills/frontend-skill/SKILL.md`

Then inspect relevant supporting skills available in the repo, especially where applicable:

- `ui-skills`
- `webdesigner-design-system`
- `shadow-plugin`
- accessibility / review skills

If the `/frontend-design` skill interface is available in this Codex environment, invoke it against THIS project brief before implementation.

The design order is:

FRONTEND-DESIGN
        ↓
FRONTEND-SKILL
        ↓
DESIGN SYSTEM
        ↓
BUILD
        ↓
ANTI-SLOP REVIEW
        ↓
BROWSER QA

Do NOT skip directly to coding.

---

# IMPORTANT: THIS PROJECT IS NOT A GENERIC AI PRODUCT

Subject:

INN524 student concept presentation.

Audience:

Classmates, teachers and stakeholders in Norway.

Single job of the site:

Beautifully present and explain prototype images of:

1. the professional emergency coordination platform,
2. the civilian emergency app,
3. the connected agent concept.

The SITE is not the emergency dashboard.

The SITE is the design exhibition / UX case study containing the prototypes.

---

# VISUAL THESIS

Create a modern Scandinavian editorial product showcase.

It should feel:

- calm
- serious
- trustworthy
- Norwegian
- architectural
- image-led
- contemporary
- understated
- premium

It should NOT feel:

- cyberpunk
- AI-generated
- crypto
- gaming
- glowing SaaS
- futuristic command centre
- generic startup template

The emergency dashboard images already contain dark operational colors.

Therefore the PRESENTATION WEBSITE should be quieter and more neutral so the prototype images become the visual focus.

---

# ABSOLUTELY NO GENERIC AI COLOR PALETTE

Do NOT use:

- purple
- lilac
- violet
- magenta
- neon cyan
- electric-blue gradients
- blue-to-purple gradients
- purple radial glows
- rainbow gradients
- decorative glow effects

No purple anywhere unless it literally exists inside one of the supplied prototype images.

Do not use color simply to make the site look "tech".

---

# PROPOSED SITE PALETTE

Before implementation, critique this palette through `frontend-design`.

Use approximately:

## Paper
`#F4F3EF`
Warm Nordic off-white background.

## Ink
`#171A1A`
Primary text.

## Stone
`#D8D9D4`
Dividers / quiet surfaces.

## Fjord
`#53686B`
Muted cold gray-green.
Use sparingly.

## Pine
`#31584C`
Safety / natural Norwegian accent.

## Emergency
`#B83A32`
Only for meaningful emergency references or critical callouts.

You may refine these values during the frontend-design process, but:

NO PURPLE.
NO LILAC.
NO BLUE-PURPLE GRADIENT.

Record the final 4–6 color tokens before building.

Every CSS color must derive from the approved token system.

---

# TYPOGRAPHY

Do NOT automatically use:

- Inter
- Roboto
- Arial
- generic system-only typography

Use the `frontend-design` skill to choose a deliberate type pairing.

Direction:

Modern Scandinavian editorial / institutional design.

Possible character:

- restrained grotesk or neo-grotesk for body/UI
- distinctive but serious display face for section headings
- optional mono/data face only for prototype captions or technical labels

Do not turn the whole site into a monospace tech interface.

Typography should make the website feel designed even if all decoration is removed.

---

# COMPOSITION

The generated prototype images are the HEROES.

Do NOT surround every piece of content with cards.

Do NOT use a bento-grid just because the skill supports bento layouts.

This particular project needs:

large imagery
+
whitespace
+
editorial pacing
+
strong typography.

Think more:

premium Figma case study
+
Scandinavian architecture portfolio
+
modern museum exhibition

than:

AI SaaS dashboard landing page.

---

# FIRST VIEWPORT

Follow the WebDesigner hero budget.

The first screen should contain only:

SOGN EMERGENCY COORDINATION

Platform + App Concept Prototype

A short sentence explaining the project.

One dominant visual.

A restrained CTA group:

[ Explore platform ]

[ See civilian app ]

And:

INN524 · HVL · STUDENT CONCEPT

NO:

- metric cards
- floating badges everywhere
- feature grids
- purple blobs
- fake AI animations
- multiple decorative panels

The first viewport must read as ONE composition.

---

# SIGNATURE VISUAL ELEMENT

Develop ONE memorable visual device tied to the actual concept.

Suggested direction:

A very thin route / signal line inspired by:

SHIP
→
MAIN AGENT
→
AUTHORITY
→
CIVILIAN

The line can quietly travel through sections as the visitor scrolls.

It represents information moving through the ecosystem.

It should be restrained.

No neon glow.

No sci-fi network animation.

This should be the site's signature.

Everything else stays quiet.

---

# PLATFORM PROTOTYPES

These images should appear large.

Do NOT reconstruct them in HTML.

Use the supplied/generated images themselves.

Treat them like industrial-design prototypes being exhibited.

Suggested presentation:

Large image
↓
small eyebrow:
PROFESSIONAL PLATFORM / CONCEPT 01

Title:
Shared incident picture

One short explanation.

Then next prototype.

Allow click-to-enlarge.

Avoid tiny three-column galleries where nobody can inspect the UI.

---

# CIVILIAN APP PROTOTYPES

Use phone prototype images as large editorial objects.

Do not put six tiny phone screens inside colorful cards.

Possible composition:

large phone
+
large typography beside it

Example:

WARN

A civilian receives an immediate emergency alert.

Scroll ↓

GUIDE

The app identifies the nearest approved safe area.

Scroll ↓

LOCATE

An injured or trapped person can conceptually send their position.

Scroll ↓

RESCUE

Responders receive the simulated help request.

This should feel like a product case study.

---

# AGENT SYSTEM SECTION

The agent network is explanatory content.

Do NOT turn it into a glowing neural-network visualization.

Use simple typography, lines, icons and hierarchy.

Main Agent / Orchestrator gets strongest visual weight.

Then show relationships:

Captain
↓
Ship Agent
↓
Main Agent
↓
specialised agents
↓
Professional Platform / Civilian App

The design should communicate structure rather than spectacle.

---

# MOTION

Set Motion fairly low.

Suggested taste dials:

Variance: 6/10
Motion: 3/10
Density: 4/10

Motion may include:

- subtle image reveal
- gentle scale on prototype lightbox
- restrained section transitions
- route/signal line progression
- soft hover states

Do NOT use:

- floating blobs
- continuous glowing animation
- excessive parallax
- spinning objects
- gradient animation
- animation merely because the project involves AI

Respect `prefers-reduced-motion`.

---

# SHADOWS AND SURFACES

If using `shadow-plugin`, keep elevation subtle.

The showcase should mostly feel flat/editorial.

Use elevation mainly for:

- enlarged prototype image
- lightbox
- floating navigation if needed
- phone mockup

Avoid stacking:

border
+
inner border
+
shadow
+
glow

on every element.

---

# IMAGE HIERARCHY

The generated prototype imagery should account for approximately 70–80% of the visual attention.

Current prototype categories include:

- Main Incident Dashboard
- 15-Minute Pre-Impact View
- Agent Orchestration
- Public Alert Management
- Medical & Rescue Coordination
- Complete Platform Concept

These images are the proof of concept.

The site is their exhibition space.

---

# CONTENT RESTRAINT

Do not repeat the project explanation five times.

The visitor only needs to understand:

### Problem

A major vessel could lose control near a kai in Inner Sogn.

### Platform

Professionals maintain a shared situational picture.

### Agents

Specialised agents connect information and actors.

### App

Civilians receive simple personal safety guidance and can conceptually request help.

That's enough.

---

# USE THE EXISTING WEBDESIGNER AGENTS

Follow the roles described in `AGENTS.md`.

For this redesign:

## Architect
Confirm site purpose and corrected information architecture.

## Designer
Own the visual thesis.
Run `frontend-design`.
Then run `frontend-skill`.
Produce approved design tokens before coding.

## Builder
Implement exactly from those design artifacts.
Do not invent additional colors or typography.

## Reviewer
Run the frontend-design closing critique.
Run accessibility/UI audit.
Check desktop AND mobile visually.

The Builder does NOT overrule the Designer.

---

# UPDATE taskplan.md

Add a dedicated redesign phase before more feature work.

Example:

## Phase — WebDesigner visual reset

- [ ] Read `AGENTS.md`
- [ ] Read `docs/frontend-guidelines.md`
- [ ] Apply `frontend-design`
- [ ] Apply `frontend-skill`
- [ ] Write visual thesis
- [ ] Set Variance / Motion / Density
- [ ] Approve 4–6 color tokens
- [ ] Approve typography system
- [ ] Define one signature element
- [ ] Audit current UI for generic AI aesthetics
- [ ] Remove purple/lilac/blue-gradient styling
- [ ] Rebuild hero
- [ ] Rebuild prototype presentation sections
- [ ] Rebuild app showcase
- [ ] Simplify agent section
- [ ] Run desktop visual QA
- [ ] Run mobile visual QA
- [ ] Run anti-slop audit
- [ ] Run accessibility checks
- [ ] Run production build

Mark `[x]` only after verification.

---

# ANTI-SLOP CHECK BEFORE COMPLETION

Before claiming the redesign is complete, explicitly answer:

1. Is there any purple or lilac?
2. Is there any blue-purple gradient?
3. Are we using generic AI glow effects?
4. Are too many things inside cards?
5. Does the hero have more than one main visual idea?
6. Are prototype images clearly dominant?
7. Does the site still look good if animations are disabled?
8. Does typography feel intentional?
9. Does this look specifically appropriate for Inner Sogn / emergency preparedness?
10. Could this exact design be reused unchanged for an AI crypto startup?

If answer #10 is YES, redesign it again.

---

# DO THIS NOW

Read the existing project.

Read the WebDesigner instructions.

Update `taskplan.md`.

Perform the visual reset.

Do not stop after planning.

Continue until the redesigned presentation site is implemented and verified, unless a genuine blocker requires human input.
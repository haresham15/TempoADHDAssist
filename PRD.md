# Product Requirements Document (PRD): Tempo

**Project:** Tempo — RSD Communication Buffer & Neurodivergent Regulation Suite  
**Status:** V4 (The Neurodivergent Leap — Implementation)  
**Target Audience:** Adults with ADHD, Rejection Sensitive Dysphoria (RSD), and Executive Dysfunction  
**Last Updated:** September 2026  

---

## 1. Executive Summary

Tempo is an AI-assisted emotional buffer, communication coach, and executive regulation suite designed specifically for individuals navigating Rejection Sensitive Dysphoria (RSD), ADHD task paralysis, and sensory overload.

Rather than positioning itself as a clinical therapy app or a complex productivity system, Tempo operates as a **tactical, state-dependent circuit breaker**. When an emotional trigger or task paralysis occurs, Tempo provides a safe, zero-destination space to pause, decompress, identify distorted cognitive patterns, and find low-resistance steps forward before an impulsive action or shame spiral takes place.

In **V4 (The Neurodivergent Leap)**, Tempo expands from purely verbal interactions into radical neurodivergent accommodations:
1. **Spatial Task Chunker (The Visual Bypass):** Eliminating text input entirely for messy rooms or cluttered desks by using computer vision to spotlight one single physical object at a time.
2. **Dynamic Auditory Anchoring:** Client-side generative Web Audio engine providing adaptive 60–75 BPM grounding rhythms and brown-noise soundscapes during Focus Mode and Venting.
3. **Safe-State RAG Memory Fabric:** An opt-in contextual memory layer linking past reframed interactions by relationship category to objectively dismantle recurrent RSD cognitive distortions.
4. **Ephemeral "Body-Doubling" Syndicates:** Anonymous, zero-communication ambient co-presence indicator providing the neurological benefits of body-doubling without social anxiety.

---

## 2. Problem Statement & Target Audience

### 2.1 The Clinical & Emotional Problem

1. **Rejection Sensitive Dysphoria (RSD):**
   - Individuals with ADHD frequently experience severe, visceral emotional pain in response to perceived or actual rejection, criticism, or failure.
   - In the moment of trigger (e.g., a blunt Slack message, being left on read, constructive feedback), the autonomic nervous system enters a fight-or-flight state, offline-ing the prefrontal cortex.
   - Users react impulsively: sending defensive, hyper-apologetic, or confrontational messages that damage professional and personal relationships, followed by a debilitating shame spiral.

2. **Executive Dysfunction & Task Initiation Freeze:**
   - Multi-step or ambiguous tasks trigger "blank-page paralysis."
   - The dopamine deficit makes initiation feel physically exhausting. Complex project management apps (Jira, Notion, Todoist) aggravate cognitive load and induce guilt.

3. **Sensory & Emotional Overload:**
   - High emotional arousal produces non-verbal periods or vocal fatigue.
   - Dysregulated users need a private sounding board to release racing thoughts without fear of social judgment or accidental dispatch.

4. **Physical Environment Chaos (The Description Barrier):**
   - When a physical room or desk is cluttered, articulating a cleanup plan in text requires the exact executive function that is currently depleted.

### 2.2 Target Personas

- **Persona A — The Sensitive Professional (Jordan, 29, ADHD):**
  - *Context:* Receives a brief email from a supervisor ("We need to talk tomorrow morning").
  - *Trigger:* Heart pounds, assumes they are about to be fired, drafts an emotionally reactive 4-paragraph defense.
  - *Tempo Need:* 1-tap paste into the RSD Buffer, immediate autonomic grounding, clear cognitive pattern labeling, Safe-State Memory reminding them of past positive outcomes, and a calm translation in under 30 seconds.

- **Persona B — The Overwhelmed Student/Creative (Sam, 22, AuDHD):**
  - *Context:* Has a messy room, 4 unpaid bills, and an unstarted term paper.
  - *Trigger:* Executive paralysis; spends 3 hours scrolling phone in guilt.
  - *Tempo Need:* 1-tap camera snap of the messy room, automatic visual spotlighting of just one stray cup, an auditory anchor beat to steady heart rate, and an ambient body-doubling syndicate.

- **Persona C — The Overstimulated Partner (Alex, 34, ADHD):**
  - *Context:* Had a sensory-heavy day at work, comes home emotionally flooded.
  - *Trigger:* Wants to vent but doesn't want to dump unmanaged emotional friction onto their partner.
  - *Tempo Need:* Spoken or written venting with gentle, reflective listening, grounding brown noise, and zero advice-giving.

---

## 3. Neurodivergent Research Principles & Core Philosophy

Tempo's UX and feature architecture are rooted in empirical ADHD and neurodiversity research:

| Clinical Deficit / Need | Scientific Mechanism | Implementation in Tempo |
| :--- | :--- | :--- |
| **Autonomic Down-Regulation** | Polyvagal Theory & Parasympathetic activation restore prefrontal cognitive capacity. | Interactive 4-phase box-breathing guide (`Inhale` → `Hold` → `Exhale` → `Pause`) and Dynamic Auditory Anchoring (60–75 BPM). |
| **Task Initiation Deficit** | Lowering activation energy dissolves task initiation inertia. | Spatial Task Chunker: 1-tap photo snap completely eliminates the verbal formulation barrier. |
| **Working Memory Overload** | Miller's Law (4±1 working memory items during acute stress). | "🎯 One Step at a Time" focus mode that isolates the active micro-step, hiding all background checklists. |
| **Time Blindness** | Concrete temporal grounding reduces anticipatory dread. | Reassuring time-to-complete tags (`~30 sec`, `~2 min`, `~60 sec`) and live recording timers. |
| **Sensory Overstimulation** | Vocal fatigue and quiet environment needs require multimodal alternatives. | Dual-mode Venting (Voice multimodal audio + "✍️ Write Instead" silent journal) + Brown Noise audio anchor. |
| **Isolation & Paralysis** | Social Facilitation & Body-Doubling without social anxiety. | Ephemeral Body-Doubling Syndicates: Ambient, zero-chat co-presence indicators. |
| **Rejection Threat Hypervigilance** | Fear of exposure prevents honest expression. | "Zero-Destination" guarantee & Safe-State RAG Memory to contextualize relational histories. |
| **Cognitive Skill-Building** | Naming emotional filters fosters neuroplastic metacognition. | Explicit, plain-English cognitive pattern labels (e.g., *"Mind Reading"*, *"Catastrophizing"*, *"All-or-Nothing"*). |

---

## 4. Product Features & Detailed Specifications

### 4.1 Home Intent Hub (`/`)

- **Purpose:** Immediate triage and nervous system down-regulation.
- **Components:**
  - **Brand Header:** Brand logo, "Plans" badge (pricing modal trigger), "About" navigation, and Supabase auth status ("Sign In" / Profile).
  - **Physiological Grounding:** Guided 4-second box-breathing visual pacer with real-time phase indicators (`Inhale`, `Hold`, `Exhale`, `Pause`).
  - **Intent Cards:** 3 high-contrast, uncluttered cards routing to core spaces with temporal anchors:
    - *I'm triggered* (`~30 sec`) → `/triggered`
    - *I'm overwhelmed* (`~2 min`) → `/overwhelmed`
    - *I need to vent* (`~60 sec`) → `/vent`
  - **Global Mobile Pill Navigation:** Fixed bottom pill (`Home`, `Buffer`, `Tasks`, `Vent`, `Insights`).

### 4.2 Module 1: RSD Communication Buffer (`/triggered`)

- **Purpose:** Provide a safe holding space between a triggering incoming communication and the user's drafted reaction.
- **Workflow:**
  1. **Zero-Friction Input:** Large, distraction-free textarea with 1-tap clipboard paste button and live character count.
  2. **Safe-State Context Selector (V4):** Optional relationship tag (*"Boss / Colleague"*, *"Partner"*, *"Friend"*, *"Family"*).
  3. **Practice Mode (Optional):** "Try reframing first" toggle allows the user to test their own calming reframe before comparing it with the AI generation.
  4. **Instant Safety Gate:** Text is evaluated by a deterministic, regex-based crisis-language interceptor (`src/lib/safety.ts`). If crisis markers are detected, model execution is halted immediately and verified crisis lifelines (988, 741741) are rendered.
  5. **AI Generation with RAG Memory (V4):** Calls dual-provider API (`/api/rsd-buffer`), cross-referencing past reframes for that relationship category to return:
     - *Emotion Reflection:* Validating the emotional reality without judgment.
     - *Thinking Pattern:* Plain-English cognitive filter identified (e.g., *"Mind Reading: You assumed they are angry based on brevity"*).
     - *Context Reassurance (V4):* *"Remember: Last time your partner sent a short reply, they were rushing between meetings, not angry with you."*
     - *Calm Translation:* Grounded, professional, and de-escalated response draft ready for 1-tap clipboard copy.
  6. **Data Sovereignty:** By default, text vanishes on navigation. User can optionally click "Save privately" to store the entry in their encrypted `rsd_logs`.

### 4.3 Module 2: Low-Friction Task Chunker (`/overwhelmed`)

- **Purpose:** Overcome executive task paralysis by converting intimidating tasks into low-resistance micro-steps.
- **Modes:**
  - **Text Chunking Mode:** Clean single-line task input with clear placeholder ("What's on your mind?") and a direct "Break it down" button.
  - **Spatial Visual Bypass Mode (V4):** Take or upload a photo of a messy room or desk. Computer vision spotlights only one physical item at a time.
- **Micro-Step Generation:** Calls `/api/chunk-task` or `/api/chunk-spatial`, generating 3 to 6 atomic, physically actionable micro-steps. The very first step is explicitly engineered as a "gateway step" (e.g., *"Open laptop lid"*, *"Pick up one coffee cup"*).
- **Progress & Dopamine Feedback:**
  - Interactive step completion checklist.
  - Visual percentage progress bar.
  - Gentle, synthesized Web Audio micro-chimes on completion.
- **Single-Step Focus Mode ("🎯 One Step at a Time"):**
  - Hides the full checklist to eliminate visual overwhelm.
  - Spotlights only the current step with a prominent "Complete & Next" button.
- **Body-Doubling Syndicate (V4):** Ambient co-working presence indicator (`"🟢 3 people focusing with you right now"`).

### 4.4 Module 3: Sensory Venting & Reflection (`/vent`)

- **Purpose:** Decompress mental overwhelm in a non-judgmental space with zero advice-giving.
- **Modes:**
  - **Voice Mode:** High-fidelity microphone capture with real-time waveform visualizer, elapsed recording timer, and pause/resume capability. Streams audio directly to Google Gemini 3.5 Flash Lite for native multimodal comprehension and empathetic mirroring.
  - **Write Mode ("✍️ Write Instead"):** Dedicated silent textarea for non-verbal moments, sensory fatigue, or quiet environments.
  - **Auditory Anchor (V4):** Integrated background soundscape (Brown Noise, 65 BPM pulse, or 432Hz harmonic drone).
- **AI Mirroring:** Strictly non-directive, non-clinical reflective listening. Acknowledges feeling without lecturing or suggesting unsolicited life fixes.

### 4.5 Module 4: Spatial Task Chunker — The Visual Bypass (V4 Feature)

- **The Problem:** When an environment is physically chaotic, formulating a text breakdown demands high executive function.
- **The Solution:** Zero text required. Users photograph their messy desk, sink, or bedroom.
- **Technical Engine:**
  - Frontend captures photo via mobile camera or file upload (`accept="image/*"`).
  - Sent to `/api/chunk-spatial` where Gemini 3.5 Flash Lite analyzes spatial geometry and objects.
  - Returns normalized bounding boxes `[ymin, xmin, ymax, xmax]` (0–1000 scale) and atomic micro-actions.
  - Custom Canvas/SVG overlay applies a gentle dimming vignette over the entire room, cutting out a crisp illuminated spotlight over **Item #1 only**.
  - As the user taps "Done", a reward chime plays and the spotlight smoothly animates to Item #2.

### 4.6 Module 5: Dynamic Auditory Anchoring (V4 Feature)

- **The Problem:** Dysregulated brains can be overwhelmed by silence or distracted by lyric-heavy music.
- **The Solution:** Generative, zero-latency Web Audio soundscapes running natively in the client browser.
- **Soundscape Options:**
  - **Brown Noise Filter:** Low-frequency soothing roar that reduces autonomic sensory stimulation.
  - **60–75 BPM Grounding Pulse:** Acoustic, low-fi rhythmic pulse engineered to synchronize vagal tone and down-regulate heart rate.
  - **Harmonic Warm Drone:** Resonant 432Hz ambient chord generator providing comfort during emotional distress.
- **Zero Bandwidth Overhead:** Synthesized completely via client-side Web Audio API oscillators, biquad filters, and gain nodes.

### 4.7 Module 6: "Safe-State" RAG Memory Fabric (V4 Feature)

- **The Problem:** Rejection sensitivity is deeply contextual and tied to specific recurring relationship dynamics.
- **The Solution:** An explicitly opt-in semantic memory layer that links past reframed communications by relationship tag (*Boss, Partner, Friend, Family*).
- **Technical Flow:**
  - When drafting a reframe, user selects optional relationship category.
  - Server retrieves previous grounded reflections and resolutions for that entity.
  - AI prompt cross-references the historical reality (e.g., *"Objective history: Sarah's terse messages in the past were consistently due to deadline stress, not disapproval."*).
  - Directly neutralizes catastrophic cognitive jumping to worst-case assumptions.

### 4.8 Module 7: Ephemeral Body-Doubling Syndicates (V4 Feature)

- **The Problem:** Isolation exacerbates ADHD task paralysis, while traditional co-working apps induce social anxiety.
- **The Solution:** Anonymous, zero-communication co-working.
- **Technical Flow:**
  - In Focus Mode, user enables the "Body Double" toggle.
  - Connects to an ephemeral syndicate presence endpoint (`/api/presence`).
  - Displays a calm, glowing ambient indicator: `🟢 3 people focusing with you right now`.
  - Displays gentle ambient ripple cards when peers finish steps: *"Someone just finished a step ✨"*.
  - Strictly zero chat, zero video, zero profiles — pure neurological social facilitation.

### 4.9 Long-Term Insights & History (`/history`)

- **Purpose:** Metacognitive awareness and pattern recognition over time.
- **Features:**
  - **Recurrence Analytics:** Visual progress bars displaying the user's most frequent RSD cognitive patterns (e.g., *Mind Reading: 42%*, *Catastrophizing: 28%*).
  - **Saved Reflections:** Searchable, chronological archive of explicitly saved buffer translations, task chunks, and vent sessions.
  - **Data Deletion:** 1-tap complete deletion of saved records complying with privacy rights.

### 4.10 Out-of-the-Way Knowledge & Information Hub

To maintain absolute simplicity in the core interactive tools, all background context, philosophy, FAQs, and feedback are housed in quiet, dedicated destinations:

- **About Page (`/about`):** Clinical rationale behind RSD, ADHD executive dysfunction, the "Zero-Destination" architecture, and privacy guarantees.
- **FAQ Page (`/faq`):** Interactive, expandable accordion answering user concerns regarding data persistence, emergency protocols, subscription terms, and message isolation.
- **Suggestions Feature (`/suggestions` & `/api/suggestions`):** Native community feedback portal with category selection (*Feature Idea*, *Simplicity & Usability*, *Bug Report*, *General Feedback*), optional contact email, and resilient database persistence.
- **Global Footer:** Unobtrusive footer on every page linking to About, FAQ, Suggestions, Settings, and Crisis Support (988), positioned with clearance for the mobile floating nav.

---

## 5. System Architecture & Technical Specifications

```text
[ Client: Next.js 15 / React 19 / Web Audio API / Canvas Spotlight ]
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
[/triggered]           [/overwhelmed]             [/vent]
(RAG Memory)          (Spatial Vision &       (Audio Anchor &
                      Body-Doubling Sync)     Gemini Audio)
     │                       │                       │
     └───────────────────────┬───────────────────────┘
                             ▼
                 [ Next.js Route Handlers ]
                 - Rate Limiter (120 dev / 30 prod)
                 - Deterministic Crisis Safety Layer
                 - Presence Endpoint (/api/presence)
                             │
          ┌──────────────────┴──────────────────┐
          ▼                                     ▼
    [ Primary AI ]                     [ Multimodal & Vision ]
      DeepSeek                              Google Gemini
  (`deepseek-chat`)                     (`gemini-3.5-flash-lite`)
  - RSD JSON Generation                 - Spatial Bounding Boxes
  - Cognitive Reframing                 - Multimodal Audio Vent
          │                                     │
          └──────────────────┬──────────────────┘
                             ▼
             [ Supabase PostgreSQL Backend ]
             - rsd_logs with relationship_category
             - task_chunks, vent_logs, suggestions
             - Row Level Security (Zero Public Read)
```

### 5.1 Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19, TypeScript | High-performance server/client boundaries, static route optimization, type safety. |
| **Styling** | Vanilla CSS Modules, CSS Custom Properties | Zero-runtime CSS, total design system control, instant dark/light mode switching without Tailwind bloat. |
| **Spatial Computer Vision** | Google Gemini 3.5 Flash Lite Multimodal Vision | Sub-2s normalized bounding box detection `[ymin, xmin, ymax, xmax]` without requiring a heavy Python daemon. |
| **Generative Audio Synthesis** | Web Audio API (Native Browser) | Zero-latency, zero-bandwidth synthesis of Brown Noise, 65 BPM pulse, and 432Hz harmonic drones. |
| **Primary Text Model** | DeepSeek (`deepseek-chat`) | High-fidelity JSON output, exceptional nuance in emotional nuance and translation. |
| **Multimodal Voice Model** | Google Gemini (`gemini-3.5-flash-lite`) | Sub-1.5s latency, native audio multimodal capabilities, automatic failover when DeepSeek is exhausted. |
| **Database & Auth** | Supabase (PostgreSQL, GoTrue Auth) | Row Level Security (RLS) enforced at SQL level, guest insert resilience, encrypted storage. |
| **Safety Engine** | Deterministic Regex Matcher (`src/lib/safety.ts`) | Zero-latency, non-AI dependency safety layer preventing model hallucinatory responses during crises. |

### 5.2 High-Availability Dual-Provider Failover Matrix

```text
User Request
     │
     ▼
[ Deterministic Crisis Check ] ───(Crisis Detected)───► Intercept: Render 988 / 741741 Lifelines
     │ (Safe)
     ▼
[ Attempt DeepSeek API ]
     ├───► HTTP 200: Return Response
     │
     └───► HTTP 402 / 500 / Timeout / Network Error
                │
                ▼
          [ Attempt Google Gemini 3.5 API ]
                ├───► HTTP 200: Return Response
                │
                └───► API Failure / Offline
                           │
                           ▼
                     [ Return Heuristic Safe Offline Fallback ]
```

### 5.3 Database Schema & Security Architecture

1. **Strict Row Level Security (RLS):**
   - Tables: `rsd_logs`, `task_chunks`, `vent_logs`, `user_settings`, `suggestions`.
   - **Zero Public Read:** No unauthenticated client can read any database row.
   - **Guest Insert Sovereignty:** Anonymous users (`user_id = null`) may insert private logs when explicitly clicking "Save privately", but cannot read database contents.
   - **Authenticated Access:** Users can only query rows where `user_id = auth.uid()`.

2. **Rate Limiting:**
   - In-memory sliding window rate limiter protects endpoints against automated denial-of-service.
   - Production: 30 requests/minute per client IP.
   - Development: 120 requests/minute to facilitate testing.

3. **Offline & Network Resilience:**
   - Save endpoints catch Supabase fetch exceptions (e.g. DNS failure, paused database) and return `{ success: true, offline: true }`, ensuring user workflows are never interrupted by database hiccups.

---

## 6. Accessibility & Neurodivergent Design Standards

- **WCAG 2.1 AAA Compliance:**
  - Dark Mode: Contrast ratios between 13.5:1 and 14.2:1 (titles) and >8.2:1 (subtitles).
  - Light Mode: Deep, calming charcoal/plum/forest/espresso typography on warm ivory backgrounds (contrast ratios >12.7:1).
- **Sensory Safety:**
  - Total absence of aggressive alert reds, flashing banners, or jarring system modal dialogs.
  - Full support for `prefers-reduced-motion` media queries and custom UI animation toggles.
- **Mobile Touch Accommodations:**
  - Fixed-bottom floating navigation respects minimum 44×44px touch targets.
  - Full single-handed thumb reach optimization for iOS and Android viewports (390px+).

---

## 7. Release History & Roadmap

### Version 1.0 (Initial Prototype)

- Baseline Next.js setup with 3 raw modules (Buffer, Tasks, Vent).
- Basic LLM prompts without structured failover or RLS hardening.

### Version 2.0 (Audit & Hardening)

- Comprehensive codebase review: fixed logic flaws and memory bottlenecks.
- Implemented deterministic safety layer for crisis intervention.
- Established strict Supabase RLS policies (zero public read).

### Version 3.0 (Production Release)

- **High-Availability Dual-Provider Architecture:** DeepSeek primary with Google Gemini 3.5 failover and heuristic offline resilience.
- **Sensory Venting Overhaul:** Integrated Gemini 3.5 Flash Lite audio multimodal streaming and dual "Write Instead" journal.
- **Task Chunker Focus Mode:** "One Step at a Time" isolated mode with audio chimes.
- **Frontend Simplification:** Eliminated clutter, chips, and verbose explanatory text from core tools.
- **Knowledge & Community Hub:** Added `/about`, `/faq`, `/suggestions`, and global `Footer`.
- **WCAG AAA Theme Overhaul:** Fixed dark mode card typography contrast issues.
- **Brand Identity:** Transparent organic alpha-contoured multi-resolution favicon suite.

### Version 4.0 (The Neurodivergent Leap — Completed)

- [x] **Comprehensive PRD & Architecture Design**: Formalization of the 4 neurodivergent pillars.
- [x] **Spatial Task Chunker (The Visual Bypass)**: Photo-based space segmentation & single-item spotlight canvas.
- [x] **Dynamic Auditory Anchoring**: Client-side generative Web Audio engine (Brown noise, 65 BPM pulse, 432Hz harmonic drone).
- [x] **Safe-State RAG Memory Fabric**: Opt-in relational context engine linking past grounded outcomes to defuse acute RSD.
- [x] **Ephemeral Body-Doubling Syndicates**: Realtime anonymous co-presence indicator with zero-social-friction co-regulation.

### Future Roadmap

- [ ] **Offline PWA Support:** Full service-worker offline caching for local client-side reframing.
- [ ] **Custom Reflection Export:** Encrypted PDF/Markdown export for therapy appointments.
- [ ] **Wearable Breathing Integration:** Haptic pulse synchronization with the 4-second box-breathing guide.

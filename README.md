# Tempo — RSD Communication Buffer & Neurodivergent Regulation Suite

> **A quiet pause before you react.**  
> An AI-assisted emotional buffer, communication coach, and executive regulation suite designed specifically for Rejection Sensitive Dysphoria (RSD), ADHD task freeze, and emotional overwhelm.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![WCAG AAA](https://img.shields.io/badge/Accessibility-WCAG%20AAA-green?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)

---

## 💡 What is Tempo?

Living with ADHD or rejection sensitivity means an ambiguous text, a brief email from a supervisor, or a demanding to-do list doesn't just feel uncomfortable—it triggers a visceral, autonomic alarm response. In that fight-or-flight moment, the prefrontal cortex goes offline, leading to impulsive defensive messages, task freeze, and subsequent shame spirals.

Tempo acts as a **tactical circuit breaker**:

1. **Zero Destination:** Tempo has zero integrations with email, Slack, iMessage, or contacts. It is physically impossible to accidentally dispatch a drafted message to a recipient.
2. **Ephemeral by Default:** Nothing is persisted to a database unless you explicitly tap "Save privately".
3. **Teach the Pattern, Don't Just Soothe It:** Every reframe names the underlying cognitive distortion in plain language (e.g., *"Mind Reading: Assuming negative intent from brevity"*), building long-term metacognitive awareness.
4. **Safety Before Helpfulness:** A deterministic, non-AI safety layer intercepts crisis language instantly, routing users directly to verified lifelines (988 and 741741).

---

## 🧩 Core Spaces & Features

### 1. 🛡️ RSD Communication Buffer (`/triggered`)

- **1-Tap Clipboard Paste:** Drop raw, emotionally charged message drafts into the buffer instantly.
- **Cognitive Pattern Identification:** Highlights patterns like *Catastrophizing*, *Mind Reading*, or *All-or-Nothing Thinking*.
- **Calm Translation:** Generates a grounded, de-escalated, and professional response in under 30 seconds.
- **Safe-State RAG Memory Anchor:** Context-aware relationship filtering (*Work / Boss, Partner, Friend, Family*) that grounds acute catastrophic triggers against historical interaction context.
- **Practice Mode:** Optional "Try reframing first" toggle to compare your own calming attempt with the AI generation.

### 2. 🎯 Low-Friction Task Chunker (`/overwhelmed`)

- **Spatial Task Chunker (The Visual Bypass):** Eliminates verbal formulating friction entirely for physical clutter. Upload or snap a photo of a messy space; Gemini 3.5 Flash Lite detects items and spotlights exactly *one* item with an interactive visual vignette cutout.
- **Dissolve Blank-Page Paralysis:** Turn any daunting project or messy situation into 3–6 atomic, physically actionable steps.
- **Gateway First Step:** The initial step is engineered to require near-zero friction (e.g., *"Open laptop lid"*, *"Pick up one coffee cup"*).
- **"🎯 One Step at a Time" Focus Mode:** Hides the full checklist to eliminate working memory overload, spotlighting only the single active action.
- **Ephemeral Body-Doubling Syndicate:** Low-stimulation ambient presence indicator (`🟢 N people focusing alongside you`) with subtle completion ripples, providing co-regulation without chat, video, or social fatigue.
- **Dopamine Feedback:** Visual progress bar and synthesized Web Audio micro-chimes upon step completion.

### 3. 🎙️ Sensory Venting & Reflection (`/vent`)

- **Dual-Mode Journaling:**
  - **Spoken Voice Journal:** Real-time audio visualizer with live recording timer and multimodal processing powered by Google Gemini 3.5 Flash Lite.
  - **"✍️ Write Instead":** Silent text editor for non-verbal moments, sensory fatigue, or quiet environments.
- **Non-Directive Reflection:** Validates feelings through empathetic mirroring without offering unsolicited advice or patronizing lectures.

### 4. 🎧 Dynamic Auditory Anchoring (Focus & Vent Modes)

- **Zero-Latency Web Audio Engine:** Generative browser audio synthesis bypassing external streaming dependencies.
- **Brownian Drift:** Deep low-pass filtered brown noise masking erratic environmental acoustic transients.
- **65 BPM Vagal Grounding Pulse:** Subtle rhythmic low-frequency sine pulse designed to guide autonomic down-regulation.
- **432Hz Harmonic Warmth:** Gentle sustained fundamental drone stabilizing sensory distraction.

### 5. 📊 Pattern Insights (`/history`)

- **Visual Recurrence Tracking:** Clean progress bars tracking your most frequent cognitive patterns over time.
- **Encrypted Archive:** Access explicitly saved buffer reframes, task breakdowns, and vent transcripts.
- **Data Sovereignty:** 1-tap complete deletion of saved records.

### 6. 🌿 Knowledge & Community Hub

- **About (`/about`):** Understand the neuroscience behind RSD, ADHD executive dysfunction, and Tempo's design philosophy.
- **FAQ (`/faq`):** Interactive accordion answering questions regarding privacy, data storage, emergency protocols, and subscriptions.
- **Suggestions (`/suggestions`):** Community suggestion portal with category tagging (*Feature Idea*, *Simplicity & Usability*, *Bug Report*, *General Feedback*).
- **Global Footer:** Unobtrusive secondary navigation placed comfortably below mobile thumb reach.

### 7. 🫁 Physiological Grounding

- **Box-Breathing Visual Pacer:** Interactive 4-second breathing guide (`Inhale` → `Hold` → `Exhale` → `Pause`) right on the home hub to down-regulate the nervous system before drafting responses.

---

## 🏗️ Architecture & Tech Stack

```text
[ Client: Next.js 15 / React 19 / CSS Modules (WCAG AAA) ]
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
[/triggered]           [/overwhelmed]             [/vent]
     │                       │                       │
     └───────────────────────┬───────────────────────┘
                             ▼
                 [ Next.js Route Handlers ]
                 - Rate Limiter (120 dev / 30 prod)
                 - Deterministic Crisis Safety Layer
                             │
          ┌──────────────────┴──────────────────┐
          ▼                                     ▼
    [ Primary AI ]                     [ Fallback AI ]
      DeepSeek                          Google Gemini
  (`deepseek-chat`)                 (`gemini-3.5-flash-lite`)
          │                                     │
          └──────────────────┬──────────────────┘
                             ▼
             [ Supabase PostgreSQL Backend ]
             - Row Level Security (Zero Public Read)
             - Guest insert resilience & encrypted storage
```

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) 15 (App Router, Server & Client Components) |
| **Runtime** | [React](https://react.dev/) 19 & TypeScript 5 |
| **Styling** | Vanilla CSS Modules with custom design tokens (`globals.css`) |
| **Primary Model** | DeepSeek (`deepseek-chat`, structured JSON mode) |
| **Fallback & Voice** | Google Gemini (`gemini-3.5-flash-lite`, native audio multimodal) |
| **Database & Auth** | [Supabase](https://supabase.com/) (Postgres with strict Row Level Security) |
| **Safety Engine** | Deterministic Regex Crisis Interceptor (`src/lib/safety.ts`) |

---

## 🔒 Safety, Privacy & Resilience

- **Deterministic Safety Layer:** Crisis language is intercepted via regex patterns *before* any prompt is dispatched to an AI model. Immediate access to the 988 Suicide & Crisis Lifeline and Crisis Text Line (741741) is displayed.
- **Dual-Provider Failover:** If DeepSeek encounters balance depletion (402), network timeouts, or server errors, the system automatically falls back to Google Gemini 3.5 Flash Lite in under 1.5 seconds. If both are unreachable, safe heuristic reframes are returned.
- **Row Level Security (RLS):**
  - **Zero Public Read:** Guest users (`user_id = null`) have insert-only permissions and zero read access.
  - **Authenticated Protection:** Signed-in users can only read and delete rows matching their own `auth.uid()`.
- **Offline Resilience:** Save endpoints catch database connection errors gracefully, returning `{ success: true, offline: true }` so user flows are never interrupted.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ or 20+
- npm, pnpm, or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/haresham15/TempoADHDAssist.git
cd TempoADHDAssist
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# AI Providers (At least one required; both recommended for failover)
DEEPSEEK_API_KEY=your_deepseek_api_key
GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### 4. Database Setup (Optional for local testing)

If using Supabase, copy the contents of [`schema.sql`](file:///c:/Users/hares/OneDrive/Desktop/CS_Projects/TempoADHDassist/schema.sql) into your Supabase SQL Editor and execute. This initializes the tables (`rsd_logs`, `task_chunks`, `vent_logs`, `user_settings`, `suggestions`) and enables strict Row Level Security.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Quality Standards

Tempo enforces zero-warning code hygiene:

```bash
# Type check with TypeScript compiler
npx tsc --noEmit

# Lint check with ESLint
npm run lint

# Production build verification
npm run build
```

---

## 📁 Project Structure

```text
TempoADHDassist/
├── public/                  # Static assets & brand icons (favicon, apple-touch-icon)
├── src/
│   ├── app/
│   │   ├── about/           # About page (clinical context & philosophy)
│   │   ├── api/
│   │   │   ├── chunk-spatial/ # Spatial Task Chunker CV endpoint (Gemini vision)
│   │   │   ├── chunk-task/  # Text Task Chunker endpoint (dual-provider AI)
│   │   │   ├── history/     # Pattern insights & user archive
│   │   │   ├── presence/    # Ephemeral body-doubling presence heartbeat
│   │   │   ├── rsd-buffer/  # RSD Communication Buffer endpoint & save
│   │   │   ├── suggestions/ # Feedback submission API
│   │   │   └── vent/        # Voice/written journal reflection API
│   │   ├── faq/             # Frequently Asked Questions accordion
│   │   ├── history/         # Insights & saved reflections UI
│   │   ├── login/           # Supabase authentication
│   │   ├── overwhelmed/     # Task Chunker interface (Focus Mode & Spatial Chunker)
│   │   ├── settings/        # Preferences & accessibility toggles
│   │   ├── suggestions/     # Community suggestion portal UI
│   │   ├── triggered/       # RSD Communication Buffer interface
│   │   ├── vent/            # Sensory Venting interface (Voice/Write)
│   │   ├── globals.css      # Design tokens, theme variables, WCAG AAA colors
│   │   ├── layout.tsx       # Root layout, fonts, BrandHeader & Footer
│   │   └── page.tsx         # Home Intent Hub & Box-Breathing Pacer
│   ├── components/
│   │   ├── AudioAnchorControl.tsx # Web Audio dynamic auditory anchor pill
│   │   ├── BodyDoublingSyndicate.tsx # Ephemeral co-working presence indicator
│   │   ├── BrandHeader.tsx  # Header with logo, plans, and about links
│   │   ├── Footer.tsx       # Low-profile global footer
│   │   ├── Navigation.tsx   # Floating 5-item mobile/desktop pill navigation
│   │   ├── PricingModal.tsx # Tempo Plus plans modal
│   │   └── SpatialSpotlight.tsx # Interactive visual clutter spotlight canvas
│   └── lib/
│       ├── audioAnchor.ts   # Generative Web Audio synthesis engine (Brown/65BPM/432Hz)
│       ├── rateLimit.ts     # In-memory sliding window rate limiter
│       ├── safety.ts        # Deterministic crisis interception patterns
│       ├── TempoContext.tsx # Global state provider
│       └── utils.ts         # Formatting & helper utilities
├── PRD.md                   # Comprehensive Product Requirements Document
├── README.md                # Project overview, architecture, & setup
└── schema.sql               # Supabase database schema & RLS policies
```

---

## ⚖️ Clinical Disclaimer

Tempo is a self-regulation tool and communication buffer. It is **not** therapy, psychiatric treatment, or clinical crisis intervention. If you or someone you know is experiencing a mental health emergency or thoughts of self-harm, please contact:

- **US/Canada:** Call or text **988** ([988 Lifeline](https://988lifeline.org))
- **Crisis Text Line:** Text **HOME to 741741**
- **International:** Visit [Befrienders Worldwide](https://www.befrienders.org/) or [findahelpline.com](https://findahelpline.com/)

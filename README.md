# Tempo — RSD Communication Buffer (V2: Narrowed & Hardened)

Tempo is an AI-assisted communication and self-awareness tool built for the moment right before a rejection-sensitive reaction gets sent — the pasted message someone drafted in anger, or the message someone else sent that landed harder than it was probably meant to.

Tempo is positioned honestly as a **communication coach and reframing tool**, not a therapeutic, diagnostic, or clinical product.

---

## Why V2 (Narrowed & Hardened)

A rigorous audit of the original three-module concept prompted a deliberate scope cut:
1. **Competitive focus:** The Task Chunker directly duplicated existing free community tools (such as Goblin Tools). By contrast, the RSD Communication Buffer has no equivalent direct competitor and solves a high-acuity problem for rejection-sensitive adults.
2. **Clinical & regulatory safety:** The Voice Journal delivered unsupervised guidance without crisis detection. The RSD Buffer sits in materially safer territory and is hardened with a **deterministic, non-AI crisis-language safety layer** before any model sees user text.
3. **Trust & privacy by default:** Database access is secured with strict Row Level Security (RLS) with zero public read permissions. Generation is **100% ephemeral by default** — nothing is saved to a database unless the user explicitly opts in with the "Save privately" action.

---

## Core Product Principles

- **Zero-Friction Entry:** One text field, one button. No account required to reword a message.
- **Teach the Pattern, Don't Just Soothe It:** Every result names the underlying thinking pattern in plain language (e.g. *"Your brain jumped to the worst-case version"*), helping users build long-term awareness.
- **Private by Default:** Ephemeral processing. Nothing is persisted unless explicitly saved.
- **Safety Before Helpfulness:** A deterministic, regex-based check intercepts crisis language before model invocation, routing users to real support (988 and Crisis Text Line).
- **State-Dependent, Low-Stimulation UI:** Warm ivory palette (`#FAF6F0`), lavender accent (`#B5A8D1`), no alarm/red colors (even for crisis states), and full respect for system dark mode and `prefers-reduced-motion`.

---

## Architecture & Tech Stack

- **Framework:** Next.js (App Router, React 19)
- **Styling:** Vanilla CSS Modules with design tokens in `globals.css`
- **Model:** DeepSeek (`deepseek-chat`, JSON mode) returning emotion reflection, thinking pattern, and calmer translation
- **Safety Layer:** `src/lib/safety.ts` — dependency-free, deterministic crisis-language pattern matcher
- **Database & Security:** Supabase (Postgres) with Row Level Security (RLS) granting insert-only privileges to guests and zero public read policies
- **Endpoints:**
  - `POST /api/rsd-buffer`: Validates input (max 3,000 chars), runs safety check, queries DeepSeek, returns ephemeral JSON response.
  - `POST /api/rsd-buffer/save`: Dedicated opt-in save endpoint writing to `rsd_logs`.

---

## Getting Started Locally

### 1. Clone the repository
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
# DeepSeek API (Server-side only)
DEEPSEEK_API_KEY=your_deepseek_api_key

# Supabase (Server-side RLS & guest saves)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Quality Gates
Tempo maintains strict code hygiene:
- `npm run lint`: Clean (0 errors, 0 warnings).
- `npx tsc --noEmit`: Clean type checking.

# UI & Frontend Aesthetic Directives

You are an expert design engineer. Your goal is to write React/Next.js and CSS code that feels bespoke, premium, and intentionally crafted for neurodivergent calm and executive clarity.

You must strictly avoid the generic "AI-generated" aesthetic.

## 1. Negative Constraints (DO NOT USE)
- NO soft purple, cyan, or blue blurred gradients (`bg-gradient-to-r from-purple-500` or floating radial mesh blobs).
- NO centered badge + headline + 3-column card grid layouts.
- NO floating cards with drop shadows on light gray backgrounds.
- NO glassmorphism (`backdrop-blur`) unless strictly necessary for a sticky header.
- NO default Inter or Roboto fonts.
- NO arbitrary rounded corners. If you use rounded corners, use a strict, tight scale (e.g., `rounded-sm` / `2px` for buttons, sharp borders `0px` for layout panels). Never use `999px` pill capsules for general cards and layout blocks.
- NO decorative emoji or generic Lucide icons packed into colored circular badges.

## 2. Layout & Density
- Build asymmetric, intentionally composed layouts. Use CSS grid and structured rows intentionally.
- Do not wrap every single piece of content in a padded card with drop shadows.
- Use whitespace, typography, hairline borders (`1px solid var(--border-hairline)`), and alignment to group information instead of boxes.
- Maximize data density and clarity. Use tabular numbers (`tabular-nums`) for metrics, timers, steps, and dates.
- Use punctuation-based index markers (`[ 01 ]`, `//`, `—`, `·`) for technical, grounded feel.

## 3. Typography & Hierarchy
- Maintain a strict typographic hierarchy:
  - Editorial serif (`Newsreader`) for headlines and grounding reflection prompts.
  - Neutral geometric sans (`Plus Jakarta Sans`) for body and interface controls.
  - Monospace (`JetBrains Mono`) for steps, timers, and metadata.
- Limit paragraph width to 65-75 characters (`max-w-prose`).
- Set body text line-height strictly to 1.5.
- Use subtle text colors (`var(--text-muted)`) for secondary metadata, not smaller font sizes.

## 4. Interaction & Motion
- Do not animate search bars, filters, or rapid layout shifts.
- Motion should be under 300ms, use custom easing (`cubic-bezier(0.16, 1, 0.3, 1)`), and rely strictly on `transform` and `opacity`.
- Build immediate, high-contrast `:hover` and `:focus-visible` states for all interactive elements (solid ink invert or sharp hairline accent).

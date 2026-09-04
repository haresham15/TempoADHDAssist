# UI & Frontend Aesthetic Directives

You are an expert design engineer. Your goal is to write React/Next.js and CSS code that feels bespoke, premium, and intentionally crafted for neurodivergent calm and executive clarity.

You must avoid both the generic "AI-slop" look (excessive neon gradients, floating drop shadows) and harsh brutalist extremes (austere terminal brackets, high-contrast sharp fonts).

---

## 1. Negative Constraints (DO NOT USE)

- NO harsh neon gradients (`bg-gradient-to-r from-purple-500` or chaotic radial mesh blobs).
- NO generic centered badge + headline + 3-column card grid layouts.
- NO heavy drop shadows or cluttered floating card stacks that create visual noise.
- NO generic default fonts like Inter or Roboto.
- NO harsh monospace terminal bracket labels (`[ TACTICAL CIRCUIT BREAKER ]`, `[ 01 ]`, `[ TRANSMITTING... ]`).
- NO decorative emoji chips or cluttered icon badges.

---

## 2. Layout & Sensory Clarity

- Build clean, approachable, and calming layouts with generous breathing room.
- Group information using subtle background tint transitions, gentle borders (`1px solid var(--border-hairline)`), and soft padding.
- Prioritize low cognitive load: present one primary decision or task at a time.
- Use soft, comfortable interactive controls (gentle rounded pills, accessible touch targets).

---

## 3. Typography & Hierarchy

- Maintain a comforting, low-strain typographic hierarchy:
  - **Primary Sans (`Outfit` - 300 Light, 400 Regular, 500 Medium)**: Generous x-height, open apertures, and gentle geometric rounded curves that reduce visual fatigue.
  - **Reflective Editorial (`Lora` - 400 Regular, 500 Medium)**: Soft, warm calligraphic serif used for grounding quotes and calm reframes.
- Limit paragraph width to comfortable reading lengths (65-75ch).
- Maintain generous line height (1.5 - 1.6) for relaxed scanning.
- Use warm charcoal (`var(--text-primary)`) and muted umber (`var(--text-muted)`) rather than harsh pitch black on pure white.

---

## 4. Sensory Palette & Module Branding

- Ground the application in warm, soothing organic tones:
  - **Canvas Base**: Warm Ivory (`#FAF6F0`)
  - **Surface Layer**: Soft Linen (`#F3EFE6`)
  - **Hairline Dividers**: Warm Cashmere (`#E7E1D6`)
- Preserve clear module visual identity:
  - **Communication Buffer (RSD)**: Soft Lavender (`#B5A8D1`)
  - **Task Chunker**: Muted Sage Green (`#8CAF95`)
  - **Sensory Vent**: Warm Blush (`#E8B4A0`)
  - **Anchors & Celebrations**: Honey Gold (`#E3B857`)

---

## 5. Interaction & Motion

- Motion must be gentle, soothing, and purposeful (under 300ms, smooth ease-out curves).
- Provide immediate, soft visual feedback on `:hover` and `:focus-visible` without jarring flashes.
- Support sensory accessibility: respect user motion preferences and auditory calm.

# Design System: Tempo Sensory Comfort & Emotional Regulation

The single source of truth for Tempo's UI architecture, comforting typography, signature color palette, and neurodivergent-friendly interaction design.

## 1. Core Philosophy: Low-Stim Sensory Comfort
Designed specifically for ADHD, Rejection Sensitive Dysphoria (RSD), and executive freeze.
- **Warm, low-glare canvas**: Warm Ivory and Soft Linen instead of harsh stark white or clinical gray.
- **Comforting typography**: Feather-light, rounded geometric `Outfit` sans-serif paired with warm, gentle `Lora` editorial touches. Zero harsh, sharp, spiky serifs or brutalist monospace HUDs.
- **Emotional color-coding**: Functional pastel and earth tones mapped to user sensory states:
  - **Soft Lavender (`#B5A8D1`)**: RSD Communication Buffer (calming, cooling the emotional sting).
  - **Muted Sage (`#8CAF95`)**: Task Chunker & Grounding (growth, steady step-by-step progress).
  - **Warm Blush (`#E8B4A0`)**: Sensory Vent & Vocal Journal (warmth, acceptance, emotional release).
  - **Powder Blue (`#7EA3C4`)**: Auditory Anchors & Focus (stabilizing rhythm).
  - **Honey Gold (`#E3B857`)**: Momentum & Celebration.

---

## 2. Palette

### Light Theme (Warm Ivory & Soft Linen)
- `--bg-base`: `#FAF6F0` (Warm Ivory background)
- `--bg-surface`: `#F3EFE6` (Soft Linen card/panel surface)
- `--bg-elevated`: `#ECE7DC` (Elevated headers and subtle tracks)
- `--text-primary`: `#3A3D3A` (Warm Charcoal primary ink)
- `--text-secondary`: `#6B6F6B` (Soft Slate secondary metadata)
- `--text-muted`: `#8C908C` (Muted caption text)
- `--border-hairline`: `#E5E0D5` (Warm Sand hairline rule)
- `--border-strong`: `#D3CDC0` (Defined border)
- `--module-lavender`: `#B5A8D1` (RSD Buffer)
- `--primary-sage`: `#8CAF95` (Task Chunker)
- `--module-blush`: `#E8B4A0` (Sensory Vent)
- `--secondary-blue`: `#7EA3C4` (Audio Anchors)
- `--accent-honey`: `#E3B857` (Celebrations)

### Dark Theme ("Low-Stim Night")
- `--bg-base`: `#1C2126` (Deep Obsidian base)
- `--bg-surface`: `#262B31` (Carbon Slate card surface)
- `--bg-elevated`: `#30373E` (Elevated headers)
- `--text-primary`: `#EDEAE2` (Warm Sand light ink)
- `--text-secondary`: `#A9AFA9` (Soft Sage secondary metadata)
- `--text-muted`: `#7A807A` (Muted caption text)
- `--border-hairline`: `#353A40` (Hairline slate rule)
- `--module-lavender`: `#C3B6DE`
- `--primary-sage`: `#9DBFA3`
- `--module-blush`: `#EFC3B2`
- `--secondary-blue`: `#8FB8D6`
- `--accent-honey`: `#E8C36A`

---

## 3. Typography Hierarchy

- **Primary Sans (`--font-sans`)**: `Outfit`, weights `300` (Light), `400` (Regular), `500` (Medium), `600` (SemiBold).
  - Designed with friendly open counters, rounded curves, and zero sharp spikes. Extremely gentle on ADHD eyes.
- **Warm Editorial (`--font-editorial`)**: `Lora`, weights `400`, `500`, italic.
  - Used for gentle reflective quotes, introspective headers, and compassionate perspective cards.
- **Line Heights**: Generous `1.5` to `1.6` for optimal readability and low cognitive load.
- **Negative Constraints**:
  - NO brutalist uppercase monospace brackets for regular UI (`[ 01 ]`, `[ TACTICAL CIRCUIT BREAKER ]`).
  - NO harsh black weights (`font-weight: 800/900`).
  - Use warm, comforting, human copy ("Take a breath", "Feeling reactive?", "Save privately").

---

## 4. Corner & Border Treatments
- Rounded, organic corners that feel approachable and gentle:
  - `--radius-sm`: `8px` (inputs, textareas, small tags)
  - `--radius-md`: `12px` (cards, panels)
  - `--radius-lg`: `16px` (modal sheets, hero cards)
  - `--radius-full`: `9999px` (buttons, pill badges, navigation bar)

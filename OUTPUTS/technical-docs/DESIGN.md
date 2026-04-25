---
name: GeroCare
description: Design system for GeroCare — gerocultores daily management web app
version: alpha

## Overview

GeroCare implements the "Mindful Curator" philosophy: a premium wellness journal feel that rejects clinical coldness. The interface conveys calm authority — like a high-end editorial publication applied to healthcare management. Every decision prioritizes low cognitive load for tablet/mobile caregivers working in shifts.

Key principles:
- **No pure black** — use `on_surface (#181d1c)` for all dark text
- **No sharp corners** — every element has at least `sm: 4px` radius
- **No line borders** — structure comes from background shifts, not dividers
- **Glass & depth** — floating elements use backdrop-blur with ambient shadows
- **Surface hierarchy** — cards sit on backgrounds at different "coolness" levels

---

## Colors

### Surface Palette (backgrounds)

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#f6faf9` | Base canvas — mint-tinted neutral |
| `surface_container_low` | `#f0f4f3` | Subtle grouping backgrounds |
| `surface_container_high` | `#e5e9e7` | Structural sidebars, headers |
| `surface_container_lowest` | `#ffffff` | Cards, data entry — high contrast "paper" |
| `surface_variant` | `#dfe3e2` | Disabled states, subtle dividers |

### Primary Palette (teal — care & trust)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#005050` | Primary actions, header, active state |
| `primary_container` | `#006a6a` | Primary button gradients (lighter) |
| `on_primary` | `#ffffff` | Text on primary |
| `on_primary_container` | `#97e7e6` | Text on primary container |
| `primary_fixed` | `#a0f0f0` | Fixed/floating accent dots |
| `primary_fixed_dim` | `#84d4d3` | Secondary hierarchy text |

### Secondary Palette (sage green)

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary` | `#4d635d` | Secondary actions |
| `secondary_container` | `#cfe8e0` | Secondary buttons, chips |
| `on_secondary` | `#ffffff` | Text on secondary |
| `on_secondary_container` | `#536963` | Text on secondary container |

### Tertiary & Status

| Token | Hex | Usage |
|-------|-----|-------|
| `tertiary` | `#264c5c` | Tertiary accents |
| `tertiary_container` | `#3f6475` | Stable status chips |
| `on_tertiary` | `#ffffff` | Text on tertiary |
| `on_tertiary_container` | `#b9dff3` | Text on tertiary container |
| `error` | `#ba1a1a` | Critical alerts, errors |
| `error_container` | `#ffdad6` | Critical alert chips |
| `on_error` | `#ffffff` | Text on error |
| `on_error_container` | `#93000a` | High-contrast error text |

### Text & Outlines

| Token | Hex | Usage |
|-------|-----|-------|
| `on_surface` | `#181d1c` | Primary text — never use pure black |
| `on_surface_variant` | `#3e4948` | Secondary text, labels, metadata |
| `outline` | `#6e7979` | Borders |
| `outline_variant` | `#bec9c8` | Ghost border (20% opacity for a11y) |

---

## Typography

**Font pairing:** Manrope (headlines) + Inter (body/labels)

| Token | fontFamily | fontSize | fontWeight | lineHeight | letterSpacing |
|-------|------------|----------|------------|------------|---------------|
| `display-lg` | Manrope | 3.5rem | 700 | — | -0.02em |
| `display-md` | Manrope | 2.75rem | 700 | — | -0.02em |
| `headline-lg` | Manrope | 2rem | 600 | — | — |
| `headline-md` | Manrope | 1.75rem | 600 | — | — |
| `headline-sm` | Manrope | 1.5rem | 600 | — | — |
| `body-lg` | Inter | 1rem | 400 | 1.6 | — |
| `body-md` | Inter | 0.875rem | 400 | 1.6 | — |
| `body-sm` | Inter | 0.75rem | 400 | 1.5 | — |
| `label-lg` | Inter | 0.875rem | 500 | — | — |
| `label-md` | Inter | 0.75rem | 500 | — | 0.04em |
| `label-sm` | Inter | 0.625rem | 500 | — | 0.04em |

**Rules:**
- Line-height `1.6` on body text to prevent clinical density
- `label-md` at `on_surface_variant` for metadata hierarchy
- Headlines use `Manrope` with slight negative letter-spacing for premium feel

---

## Layout & Spacing

### Spacing Scale (multiplier: 3)

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

### Screen Architecture

- Base layer: `surface` (#f6faf9)
- Cards: `surface_container_lowest` (#ffffff) on `surface_container_low` (#f0f4f3)
- Structural sidebars/headers: `surface_container_high` (#e5e9e7)
- Asymmetric margins allowed: e.g., `space-16` left, `space-8` right for editorial feel

### Ghost Border Fallback

For high-contrast accessibility needs, use `outline_variant` at 20% opacity:
```
border: 1px solid rgba(190, 201, 200, 0.2);
```

---

## Elevation & Depth

### The Layering Principle

**Do NOT use shadows to define cards.** Instead:
- Place a `surface_container_lowest` card on a `surface_container_low` background
- The delta in "coolness" (background hue shift) creates a natural soft lift
- This is the primary depth mechanism

### Ambient Shadows (floating elements only)

For Modals, Popovers, floating navigation:
```
box-shadow: 0px 24px 48px rgba(24, 29, 28, 0.06);
```
Shadow is tinted with `on_surface` color — not gray — for an organic, atmospheric feel.

### Glass Effect

Floating navigation: `surface_container_lowest` at 85% opacity + `backdrop-filter: blur(16px)`.

---

## Shapes

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Small elements, chips, tags |
| `md` | 8px | Inputs, buttons, cards |
| `lg` | 16px | Modals, large cards, sheets |
| `pill` | 9999px | Primary CTA buttons — "touch-friendly" |

**Rule:** Every element must have at least `sm` radius. No sharp corners.

---

## Components

### Button — Primary

```yaml
backgroundColor: "linear-gradient(135deg, #005050, #006a6a)"
textColor: "#ffffff"
rounded: "pill"
padding: "12px 24px"
minHeight: 48px  # mobile touch target
```

### Button — Secondary

```yaml
backgroundColor: "{colors.secondary_container}"
textColor: "{colors.on_secondary_container}"
rounded: "md"
padding: "12px 24px"
```

### Card — Resident Record

```yaml
backgroundColor: "{colors.surface_container_lowest}"
borderRadius: "md"
padding: "space-4"
# No border — separation via background shift
```

### Input — Text Field

```yaml
backgroundColor: "{colors.surface_container_low}"
borderRadius: "md"
# Focus: background shifts to surface_container_lowest + 2px primary ghost border
```

### Chip — Status

```yaml
# Stable update:
backgroundColor: "{colors.tertiary_container}"
textColor: "{colors.on_tertiary_container}"

# Critical alert:
backgroundColor: "{colors.error_container}"
textColor: "{colors.on_error_container}"
```

### Breathing Indicator (live monitoring)

A `primary` dot with soft pulse animation:
```
background: radial-gradient(circle, #005050 0%, transparent 70%);
animation: breathe 2s ease-in-out infinite;
```

---

## Do's and Don'ts

### Do

- ✅ Use `on_surface (#181d1c)` instead of pure black `#000000`
- ✅ Use background shifts instead of borders for grouping
- ✅ Increase spacing (`space-4` → `space-8`) when a screen feels busy
- ✅ Use `primary_fixed_dim` text on `surface_container_highest` for sophisticated secondary hierarchy
- ✅ Use asymmetric margins for editorial feel
- ✅ Every interactive element has minimum `48px` touch target on mobile

### Don't

- ❌ Never use `#000000` for text
- ❌ Never use `1px solid border` for card containment
- ❌ Never use sharp corners (`border-radius: 0`)
- ❌ Never cluster data — break into nested surface tiers
- ❌ Never use horizontal divider lines in lists — use vertical white space instead

---

## Design System Source

This design system was defined in **Google Stitch** and exported as the canonical reference for GeroCare.

- **Stitch project**: Dashboard - Care Home Mgmt (`16168255182252500555`)
- **Design system instance**: `assets-cd164330309d46dbbb901108e825942d-1774559829288`
- **Design MD philosophy**: "The Mindful Curator" — premium wellness journal aesthetic
- **Sync policy**: Updates to Stitch design system should be reflected here; run `npx @google/design.md lint DESIGN.md` to validate

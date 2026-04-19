# Stitch Prompt: ResidenteView — Detailed Resident Profile (US-05)

## Device: MOBILE (tablet-first, responsive)

## Prompt

Design a detailed resident profile screen for a care home management app. This is the full "ficha" a caregiver sees when they tap "Ver ficha" from a task or resident directory.

**Layout (top to bottom):**
1. **Hero section**: Soft mint background (surface-container-low, #f0f4f3). Resident photo (circle, 80px, centered or left-aligned), full name ("Eleanor Vance") in Manrope headline-md (1.75rem), room number badge ("Hab. 204") in secondary-container chip, date of birth in label-md below.
2. **Quick-access tabs** (horizontal, scrollable): "Datos", "Salud", "Incidencias". Underline indicator in teal.
3. **Datos tab (default)**: Grouped info cards on surface-container-lowest (#ffffff) sitting on surface background. Groups: "Diagnósticos principales", "Alergias", "Medicación activa", "Preferencias de cuidado". Each group has a subtle teal icon on the left and content text in body-lg (Inter, 1rem, line-height 1.6). No borders between groups — use vertical whitespace (spacing-6) as separator.
4. **Incidencias tab**: A mini-timeline of recent incidents — each entry shows a colored severity dot (green=leve, amber=moderada, red=critica), date, tipo badge, and one-line description. A "Ver historial completo" link at the bottom.
5. **Floating action button**: Bottom-right, teal gradient, "+" icon — tapping it opens the incident form (US-06).

**Visual style:**
- Design system "Serenity Care": teal (#006A6A) primary, sage greens, mint neutrals.
- "No-Line" rule: structure through background shifts, no 1px borders.
- Cards are surface-container-lowest on surface-container-low background.
- Typography: Manrope headlines, Inter body/labels. Label metadata in on-surface-variant (#3e4948).
- Rounded corners: 8px for cards, full-round for photo and FAB.
- RGPD badge: A small lock icon next to "Datos de salud" section header to signal sensitive data.

**Accessibility:**
- Read-only for gerocultor role (no edit buttons visible). Admin sees an "Editar" icon button in the hero section.
- Touch targets 44px minimum.
- Clear heading hierarchy: h1 for name, h2 for tab sections, h3 for data group titles.

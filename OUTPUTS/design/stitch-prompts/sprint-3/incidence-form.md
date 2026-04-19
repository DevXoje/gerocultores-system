# Stitch Prompt: IncidenceForm — Create Incidence (US-06)

## Device: MOBILE (tablet-first, touch-optimized)

## Prompt

Design an incident reporting form for a care home management app. Caregivers use this to quickly log incidents about residents. The form must be completable in 5 taps or fewer on a tablet.

**Layout (top to bottom):**
1. **Header bar**: "Nueva incidencia" title (Manrope headline-md), a close "X" icon button on the right.
2. **Resident selector**: If pre-filled (coming from a task or resident profile), show a compact resident chip (photo circle 32px + name + room). If not pre-filled, show a searchable dropdown with resident list.
3. **Tipo selector**: A grid of 6 large icon+label cards (2 columns, 3 rows): "Caída", "Comportamiento", "Salud", "Alimentación", "Medicación", "Otro". Each card is 80px tall, surface-container-lowest background, teal outline when selected. Icons: Material Symbols Outlined.
4. **Severidad selector**: Three horizontal pill buttons — "Leve" (green/teal), "Moderada" (amber/tertiary), "Crítica" (red/error-container). Active state: filled background. "Crítica" shows a subtle warning text below: "Se notificará al administrador".
5. **Descripción**: Large text area (min 4 lines visible), placeholder "Describe lo ocurrido...", surface-container-low background, rounded 8px.
6. **Photo upload (optional)**: A dashed-border area with camera icon and "Adjuntar foto (opcional)" text. Tapping opens camera/gallery. If a photo is attached, show a thumbnail with an "X" to remove.
7. **Submit bar**: Full-width primary button "Registrar incidencia" (teal gradient, pill-shaped, 48px height). Disabled state (gray) until tipo + severidad + descripcion are filled.

**Visual style:**
- Serenity Care design system: teal primary, sage secondary, mint neutrals.
- No-Line rule: no 1px borders for sections — use background shifts and spacing.
- Form background: surface (#f6faf9). Input areas: surface-container-low (#f0f4f3).
- Typography: Manrope for header, Inter for labels and body.
- Rounded corners: 8px for inputs and cards, full-round for pills and buttons.
- Critical severity selected state: error-container (#ffdad6) background with on-error-container (#93000a) text.

**Interaction notes:**
- Show inline validation: red outline + error text only after user attempts to submit with missing fields.
- After successful submit, show a brief success toast "Incidencia registrada" and navigate back.
- The form auto-fills: registradaEn (server timestamp), usuarioId (current user) — these are NOT shown in the form.

**Accessibility:**
- All interactive elements: 44px min touch target.
- Form labels are visible (not placeholder-only).
- Severity buttons have aria-label with full description.
- Color is never the only indicator — icons and text accompany all color-coded states.

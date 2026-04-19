# Stitch Prompt: TaskCard — State Update (US-04)

## Device: MOBILE (tablet-first, touch targets 44px min)

## Prompt

Design a task detail bottom sheet / modal for a care home management app. This is what appears when a caregiver taps a task card from their daily agenda.

**Layout (top to bottom):**
1. **Header**: Task title ("Administrar medicación — María García"), time badge (09:30), and a tipo chip (e.g. "Medicación" in teal).
2. **Status selector**: A horizontal row of 4 pill-shaped buttons for states: "Pendiente" (gray), "En curso" (teal), "Completada" (green checkmark), "Con incidencia" (red). The active state is filled, others are outlined. Large touch targets (48px height).
3. **Notes field**: A text area with placeholder "Añadir notas..." on a soft mint background (surface-container-low). Rounded corners (8px).
4. **Resident quick-info**: A compact row showing resident photo (circle 40px), name, room number, and a "Ver ficha" link.
5. **Action bar**: Two buttons at the bottom — "Cancelar" (secondary, outlined) and "Guardar cambios" (primary, teal gradient pill). Full width on mobile.

**Visual style:**
- Color palette: Deep teal primary (#006A6A), sage green secondary, mint-tinted neutrals (#f6faf9 background).
- No hard borders — use surface color shifts for depth (the "No-Line" design system rule).
- Typography: Manrope for headlines, Inter for body/labels.
- Rounded corners: 8px for cards, full-round for buttons and badges.
- Subtle ambient shadow on the sheet: 0px 24px 48px rgba(24,29,28,0.06).
- Show an optimistic UI state: when "Completada" is tapped, the card fades slightly (opacity 0.75) and shows a brief "Guardado" toast at the bottom.

**Accessibility:**
- All touch targets minimum 44x44px.
- High contrast text: #181d1c on light surfaces.
- Status icons alongside text labels (not icon-only).

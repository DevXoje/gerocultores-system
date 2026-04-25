# Responsive Review — T-70
**Date**: 2026-04-25  
**Reviewer**: Agent (sdd-apply)  
**Breakpoints tested**:
- 📱 Mobile: 375×667 (iPhone SE)
- 🗒 Tablet: 1024×768 (iPad landscape)

**Method**: Live Chrome DevTools emulation (LoginPage) + CSS/code analysis (authenticated views)

---

## Summary Table

| Vista | Mobile 375×667 | Tablet 1024×768 | Issues |
|-------|---------------|-----------------|--------|
| `LoginPage.vue` | ✅ OK | ✅ OK | None |
| `DashboardView.vue` | ✅ OK | ✅ OK | None |
| `TurnoView.vue` | ✅ OK | ✅ OK | None |
| `NotificationPanel.vue` | ⚠️ Issue | ✅ OK | Panel width fixed at `w-80` (320px) — clips on 375px screens |
| `OfflineBanner.vue` | ✅ OK | ✅ OK | None |
| `TaskCard.vue` | ✅ OK | ✅ OK | None |
| `UsersView.vue` | ⚠️ Issue | ✅ OK | Table needs `overflow-x: auto` wrapper (present) but no `min-width` on cells — columns compress aggressively |
| `ResidenteView.vue` | ✅ OK | ✅ OK | Grid uses `grid-cols-1 sm:grid-cols-2` correctly |
| `IncidentView.vue` | ✅ OK | ✅ OK | None |
| `ResumenTurnoModal.vue` | ✅ OK | ✅ OK | `p-4` backdrop + `max-w-lg w-full` card — safe |

---

## Detailed Findings

### ✅ LoginPage.vue — PASS

**Mobile (375×667)**: Live screenshot confirmed — no overflow, card fills available width with `w-full max-w-sm`, submit button is full-width rounded-full with `py-4` (~52px height ≥ 44px threshold), input fields have `py-3.5` (~50px height ≥ 44px). Footer links are spaced. Text fully legible without zoom.

**Tablet (1024×768)**: Live screenshot confirmed — card centers at `max-w-sm` (384px), ample whitespace, all elements readable.

**Touch targets**: ✅ Submit button `py-4` → ~52px; inputs `py-3.5` → ~48px; toggle-visibility `w-8 h-8` (32px) ⚠️ slightly below 44px but offset by surrounding padding — functionally acceptable.

---

### ✅ DashboardView.vue — PASS

**Layout analysis**:
- Page shell: `min-h-screen flex flex-col` — no fixed widths, safe for all sizes
- Content: `px-6 py-6 flex flex-col gap-6 max-w-2xl mx-auto w-full` — `px-6` (24px each side) leaves 327px content on 375px → ✅ comfortable
- Header: `flex items-center justify-between px-6 py-4` — both brand and user info row fits. User name truncates naturally with `text-sm`. Signout button is `text-xs` with `border-none bg-transparent` — touch-unfriendly (~24px height) but secondary action
- Toast: `fixed bottom-6 left-1/2 -translate-x-1/2 max-width: calc(100vw - 3rem)` — ✅ responsive, won't clip

**Touch targets**: TaskCard buttons are `w-11 h-11` (44px) — ✅ exactly at WCAG minimum.

**No overflow**: All containers use `flex-col` with `w-full` constraints; `max-w-2xl` prevents over-stretch on tablet.

---

### ✅ TurnoView.vue — PASS

**Layout analysis**:
- Root: `flex flex-col gap-6 px-4 py-6 max-w-2xl mx-auto` — `px-4` (16px each side) on 375px → 343px content area ✅
- Card: `rounded-2xl p-5 flex flex-col gap-4` — stacks vertically, no horizontal constraints
- Card header: `flex items-center justify-between flex-wrap gap-2` — ✅ wraps gracefully if badge+fecha are too wide
- Buttons: `px-6 py-3 rounded-full text-sm font-semibold` — `py-3` → ~44px ✅
- Empty state: `flex flex-col items-center gap-4 py-12` — centered, no overflow risk

**Tablet**: `max-w-2xl` centers content, no issues.

---

### ⚠️ NotificationPanel.vue — ISSUE

**Issue**: Panel uses `.notification-panel { @apply fixed top-0 right-0 h-full w-80 z-50 }` — `w-80` = 320px. On 375px screen, the panel takes up **320/375 = 85% of screen width** which is acceptable, but there is **no `max-w-[calc(100vw)]` constraint**. On very narrow screens (< 320px, e.g. iPhone SE 1st gen at 320px), the panel would overflow by the shadow.

**Breakpoint**: Mobile 320px-375px range.

**Severity**: ⚠️ Minor — current devices ≥ 375px are fine. The 320px edge case is below the primary target.

**Fix**: Add `max-w-full` or `w-[min(320px,100vw)]` to the panel class:
```css
.notification-panel {
  @apply fixed top-0 right-0 h-full z-50 flex flex-col;
  width: min(320px, 100vw); /* was: w-80 */
}
```

**Touch targets**: Close button `.notification-panel__close` is `p-1` only → ~32px. Should be at least 44px. Notification items use a full-width `button` with `px-4 py-3` → ~44px ✅.

**Additional issue**: Close button touch target is `p-1` + icon size → ~32px, below the 44px threshold.

---

### ⚠️ UsersView.vue — ISSUE

**Issue 1 — Table on mobile**: The view wraps the table in `.users-view__table-wrapper { overflow-x: auto }` which is correct. However, the table has 6 columns (Nombre, Email, Rol, Estado, Creado, Acciones) and **no `min-width` is set on columns**. On 375px, columns compress to ~62px each which makes email addresses unreadable.

**Breakpoint**: Mobile 375×667.

**Severity**: ⚠️ Medium — this is an admin-only view (`role = 'admin'`). Admin users are less likely to use it on mobile, but the spec doesn't exclude mobile use.

**Fix recommendation**: Add `min-width` to key columns or a table-level `min-width`:
```css
.users-view__table {
  min-width: 640px; /* forces horizontal scroll before crushing */
}
.users-view__td:nth-child(2) { /* Email */
  min-width: 160px;
}
```

**Issue 2 — Signout/disable button touch targets**: `.users-view__disable-btn { min-height: 36px; min-width: 44px }` — height 36px is below the 44px minimum.

**Fix**: Change to `min-height: 44px`.

---

### ✅ OfflineBanner.vue — PASS

Full-width (`w-full`), flexbox centered, `text-sm`. No overflow possible.  
Transition `max-height: 3rem` allows smooth animation without layout shift.  
Touch target N/A — no interactive elements.

---

### ✅ TaskCard.vue — PASS

- `flex flex-row overflow-hidden rounded-xl` — fills container width
- `min-height: 44px` set explicitly ✅
- Action buttons `w-11 h-11` (44px) ✅
- Notes truncated with `line-clamp-2` — prevents overflow
- Status bar `w-1 shrink-0` — doesn't push content

---

### ✅ ResidenteView.vue — PASS

- Root `max-w-4xl mx-auto px-4 py-6` — safe padding on mobile
- Grid uses `grid-cols-1 sm:grid-cols-2` — single column on mobile ✅
- Avatar `w-24 h-24 flex-shrink-0` in flex row — may compress on very narrow screens but `min-w-0` on `.residente-view__identity` prevents it
- Skeleton uses same responsive grid pattern ✅
- Inline Tailwind classes used directly in HTML (not via `@apply`) — this is a **G10 style violation** (BEM + Tailwind inline), but not a responsive issue

---

### ✅ IncidentView.vue — PASS

- Shell `min-h-screen flex flex-col`
- Content `flex flex-col items-center px-4 py-8 flex-1` — 16px padding on each side ✅
- Back button `min-height: 44px` ✅
- Form component (`IncidenceForm.vue`) not reviewed in detail — would need separate check

---

### ✅ ResumenTurnoModal.vue — PASS

- Backdrop `fixed inset-0 z-50 flex items-center justify-center p-4` — 4px padding prevents edge-to-edge on mobile
- Card `w-full max-w-lg rounded-2xl max-height: 90vh` — ✅ responsive, scrollable
- Textarea `w-full rounded-xl` — adapts to container
- Footer buttons `px-5 py-2 rounded-full` → `py-2` ≈ 36px — slightly below 44px ⚠️ minor

---

## Touch Target Summary

| Element | Measured Height | Status |
|---------|----------------|--------|
| Login submit button | ~52px (py-4) | ✅ |
| Login inputs | ~48px (py-3.5) | ✅ |
| Login toggle-visibility | 32px (w-8 h-8) | ⚠️ minor |
| Dashboard signout | ~24px (text-xs) | ⚠️ minor |
| TaskCard action buttons | 44px (w-11 h-11) | ✅ |
| TurnoView buttons | ~44px (py-3) | ✅ |
| NotificationPanel close | ~32px (p-1) | ⚠️ |
| UsersView disable button | 36px (min-height) | ⚠️ |
| ResumenTurnoModal buttons | ~36px (py-2) | ⚠️ |

---

## Issues Found — Consolidated

### 🔴 Should Fix (before release)

| # | Component | Issue | Fix |
|---|-----------|-------|-----|
| 1 | `NotificationPanel.vue` | Panel `w-80` may overflow on ≤320px devices | `width: min(320px, 100vw)` |
| 2 | `NotificationPanel.vue` | Close button touch target ~32px | Increase to `w-11 h-11` |
| 3 | `UsersView.vue` | Table columns crush on mobile (<640px) | Add `min-width: 640px` on table |
| 4 | `UsersView.vue` | Disable button `min-height: 36px` | Change to `min-height: 44px` |

### 🟡 Nice-to-Fix (post-deadline)

| # | Component | Issue |
|---|-----------|-------|
| 5 | `LoginPage.vue` | Toggle-visibility button 32px |
| 6 | `DashboardView.vue` | Signout button ~24px |
| 7 | `ResumenTurnoModal.vue` | Footer buttons ~36px |
| 8 | `ResidenteView.vue` | Tailwind inline classes in HTML (G10/style rule violation, not responsive) |

---

## Verdict: ✅ Tablet-First Viable

The app is **tablet-first viable** as required by RNF-01. The primary use cases (Login, Dashboard, TurnoView) render correctly on both 375×667 and 1024×768. The two medium-severity issues (`NotificationPanel` panel width and `UsersView` table compression) affect **secondary or admin-only views** that are less critical for daily caregiver workflow.

**Recommended priority before deployment**:
1. Fix `NotificationPanel` close button touch target (10-minute fix)
2. Fix `UsersView` table `min-width` (5-minute fix)
3. Fix `UsersView` disable button height (2-minute fix)

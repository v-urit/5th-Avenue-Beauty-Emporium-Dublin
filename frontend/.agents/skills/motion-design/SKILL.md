---
name: motion-design
description: Systemic motion design engine for luxury web interfaces. Enforces editorial fluidity, Framer Motion orchestration, continuous infinite marquees, entrance stagger choreography, and 60fps hardware-accelerated micro-interactions. Activates whenever building interactive animations, transitions, or fluid UI components.
---

# Luxury Motion Design Engine

This skill dictates high-end motion standards for luxury brand interfaces (such as *5th Avenue Beauty Emporium*). Motion must feel organic, weighted, and editorial—never abrupt or gimmicky.

---

## 1. Core Physics & Curves
Always use custom cubic bezier curves with natural damping:
- **Editorial Ease**: `[0.16, 1, 0.3, 1]` (smooth deceleration, Apple/Linear style)
- **Luxury Lift**: `[0.22, 1, 0.36, 1]` (soft landing for cards and dialogs)
- **Micro Interactions**: `[0.2, 0, 0, 1]` (rapid response for clicks and hover)

Never use default linear transitions for UI element appearances.

---

## 2. Page Entrance Choreography (Re-trigger on Mount)
Animations must fire on every page load/mount:
- Avoid gating animations behind persistent session storage or one-time cookies unless specifically requested.
- Use Framer Motion's `initial="hidden"` and `animate="visible"` with coordinated `staggerChildren`:
```tsx
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};
```

---

## 3. Continuous Infinite Marquee Architecture
For luxury image and logo showcases:
- **Dual / Alternating Tracks**: Row 1 moves left-to-right (`x: ["0%", "-50%"]`), Row 2 moves right-to-left (`x: ["-50%", "0%"]`).
- **Seamless Loop**: Duplicate image arrays to prevent blank gaps.
- **Pause on Hover**: Pause animation smoothly when hovered (`hover:pause` via CSS animation or Framer Motion controls).
- **Visual Polish**:
  - `rounded-2xl` with subtle border glow.
  - Soft drop shadow (`shadow-lg shadow-black/5` in light mode, `shadow-2xl shadow-rose-950/20` in dark mode).
  - Subtle hover lift (`scale: 1.03`, `y: -4px`) with `transition: { duration: 0.3 }`.

---

## 4. Tactile Micro-Interactions
Every interactive element must provide tactile sensory feedback:
- **Buttons**:
  - `whileHover={{ scale: 1.02, y: -1 }}`
  - `whileTap={{ scale: 0.98, y: 1 }}`
  - Subtle shimmer or gold gradient sweep on hover.
- **Cards**:
  - Smooth lift on hover with elevation shadow expansion.
  - Border illumination on focus or hover (`ring-1 ring-gold-500/30`).
- **Mode Toggle**:
  - Rotational spring transition between sun and moon icons (`rotate: 180`, `scale: [0.8, 1.1, 1]`).

---

## 5. Performance Floor (60 FPS)
- Only animate **composite properties**: `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`.
- Never animate `width`, `height`, `margin`, or `padding` directly during continuous loops.
- Use `will-change: transform` on long-running marquee elements.

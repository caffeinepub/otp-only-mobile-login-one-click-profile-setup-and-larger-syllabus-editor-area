# Specification

## Summary
**Goal:** Simplify the site’s visual theme to a consistent premium look by using only 1–2 brand accent colors (plus neutrals) across all pages and components.

**Planned changes:**
- Update global styling usage so accents (buttons, highlights, gradients, icons, rings, badges, borders, and accent text) use at most two fixed brand colors, removing the current multi-accent palette usage.
- Refactor `frontend/src/utils/accents.ts` to stop rotating/deriving accents by route/subject/index and instead expose a small fixed set (max two) of brand accent styles for consistent reuse.
- Update key UI areas that currently mix multiple accent colors and multi-stop gradients (e.g., Header, Footer, Home page hero/sections) to use only the chosen 1–2 brand colors, including removing multi-color gradient text.

**User-visible outcome:** The entire site appears visually consistent with a premium theme using only 1–2 accent colors in both light and dark mode, without any leftover multi-accent styling or broken classes.

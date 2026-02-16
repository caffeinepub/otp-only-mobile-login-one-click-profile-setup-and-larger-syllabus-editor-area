# Specification

## Summary
**Goal:** Apply Exam Xpresss branding (clean logo + app icons), remove any Caffeine AI attribution, and fix the current build/deployment failure so the app successfully deploys to the Internet Computer.

**Planned changes:**
- Create a clean, watermark-free Exam Xpresss logo (transparent background) from the provided uploaded logo image(s) and commit it as a static asset under `frontend/public/assets/generated`.
- Generate favicon/app icon PNGs derived from the clean logo and reference them from `frontend/index.html`.
- Update/verify UI branding so the header uses the Exam Xpresss logo and remove any visible “Caffeine AI” / “caffeine.ai” branding across the UI (including footer attribution), keeping branding text in English.
- Resolve the build/deployment failure so a clean install + build works and deployment to the Internet Computer completes without errors, with no runtime errors on initial load.

**User-visible outcome:** The app displays Exam Xpresss branding (logo in header and correct favicon/app icons), no Caffeine AI attribution is visible, and the project builds and deploys successfully with the home page loading and navigation working.

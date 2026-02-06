# Specification

## Summary
**Goal:** Keep authentication OTP-only while offering clear Login/Sign up entry points, require first-time users to complete profile setup, rename the app to “Exam Xpresss”, improve OTP error recovery, and make the Admin syllabus editor easier to write in.

**Planned changes:**
- Show both “Login” and “Sign up” options when logged out, but route both into the same Mobile OTP flow (no other auth UI paths).
- After first OTP verification for users without an existing profile, prompt a profile setup flow to collect mobile number, Gmail ID, and profile picture; persist these to the backend and respect the `profileComplete` flag (allow incomplete profiles until completed).
- Improve the OTP modal “Service temporarily unavailable” state with a visible “Retry” action that re-attempts the last OTP step (generate or verify) and provides clearer recovery guidance.
- Rename all user-facing text from “Exam Xpress” to exactly “Exam Xpresss” (triple “s”) across the app UI strings.
- Increase the height and readability (spacing/padding/line-height) of the Admin Panel → Syllabus topics editor textarea (including the `admin-syllabus-editor` textarea in `frontend/src/pages/AdminPanel.tsx`).

**User-visible outcome:** Users can choose Login or Sign up but always complete OTP-only authentication; first-time users are guided through a required profile setup (mobile, Gmail, photo); OTP failures provide a retry path; the app displays “Exam Xpresss” everywhere; and admins can comfortably write long syllabus content in a larger editor.

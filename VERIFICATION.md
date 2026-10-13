# Verified interactions

Production build passes. Six automated checks pass: same-bay overlap rejection, different-bay overlap allowance, back-to-back acceptance, atomic multi-bay rejection, cancellation freeing resources, and failed rescheduling preserving the original.

Browser checks completed on the running Vite app:

- All four routes render and link through shared navigation.
- Menu opens, traps Tab and Shift+Tab, locks background scrolling, closes with Escape and restores focus.
- Customer required-field validation prevents progression with missing data.
- A two-bay group reservation saves under one reference with Pending status.
- HUBDEMO validates; confirmation and reminder previews are simulated.
- Refresh preserves reservations and demo email lookup.
- A conflicting reschedule is rejected; original time remains in history.
- A successful reschedule retains its reference and updates the time.
- Cancellation changes status and frees resources.
- Staff Gantt renders occupied blocks; status changes and status filtering work.
- Contact validation focuses the first invalid field; valid submission shows a simulated success state.
- About overview opens, chapter selection returns to the chapter, and experience/project controls switch content.
- Home, About, and reservation route document widths stay within the 390px mobile viewport; Contact form and success state were also inspected on mobile.

Saved desktop and mobile screenshots are in `screenshots/`. Final independent visual review of `home-desktop.jpg` and `home-mobile.jpg` returned **ship** for the hero composition and responsive layout. Other route screenshots document browser checks, not a claim of independent visual approval. The mechanical design detector reported one warning for Inter; it is retained as the documented legal substitute for Swiss721.

Remaining differences: still concept imagery instead of video, substitute fonts, original Hole In Hub branding, estimated GSAP timings, adapted content and four-route scope. Reduced-motion branches were inspected in code, not emulated in a separate browser session. No real messages, business reservations, payments, or POS requests were sent.

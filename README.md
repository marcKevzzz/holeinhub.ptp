# Hole In Hub Golf & Lounge

Runnable React + Vite frontend, styled with Tailwind CSS and shared CSS tokens, animated with GSAP and ScrollTrigger.

## Run

```sh
npm install
npm run dev
```

`npm run build` creates `dist`; `npm run preview` previews it. `npm test` runs reservation logic checks. Node 20.19+ or 22.12+ is required by Vite.

## Pages

- `/`: cinematic golf hero and editorial experience story.
- `/contacts`: simulated inquiry form with validation.
- `/about`: experience/project chapters and overview.
- `/appointment`: reservation workflow, customer history and staff demonstration. The original route is retained; all customer-facing terminology is **reservation**.

## Demonstration

Choose an experience, future Manila date and time, one or more resources, customer details, optional voucher, and review. `HUBDEMO` validates a simulated voucher without charging or redeeming real credit. All selected bays save as one record with Pending status. History supports editing, rescheduling and cancellation; staff controls support the six documented statuses. Notifications and POS handoff are previews only.

Reservations persist in this browser's localStorage. Seed data is deterministic on the day after first use: Bays 1–2 at 10:00–12:00, Bay 3 at 14:00–17:00, and Bays 1–6 at 18:00–20:00. Demo scheduling is 09:00–21:00 with durations 1–4 hours and 1–100 attendees. These are illustrative constraints, not verified business policies. The private lounge is a demo resource because the documents do not specify private resource names or capacities.

Use sample customer information. Email lookup and staff switching are demo controls, not secure authentication. Browser storage cannot reliably prevent simultaneous bookings across users or devices. Production needs a server, authorization, transactional resource locking, real contact configuration and privacy controls.

## Sources and missing information

Read `GROUP2_PROPOSAL.pdf` and `GROUP2_CHAPTER_1.docx.pdf` provided by the user. Their descriptions informed grouped bookings, reservation records, availability, statuses, vouchers and POS references. The About project tab identifies these as proposed improvements. The PDFs are not republished by this app.

Business phone, email, street address, opening hours, exact rates, package inclusions, capacity and founding date were not supplied. They remain “To be confirmed.” No payments, actual messaging, POS integration, or hardware control is implemented.

## Visual reference and differences

Inspected [Spyker Home](https://spykercars.com/), [Heritage](https://spykercars.com/heritage), and [Contact](https://spykercars.com/contact) at desktop and mobile widths. `DESIGN.md` records measurements. Shared editorial composition, centered mark, minimal controls, full-screen menu, underline fields and chapter markers adapt that reference.

Locally hosted open-license Oswald and Inter approximate proprietary Futura PT Condensed and Swiss721; glyph shapes and text wrapping differ. Generated indoor golf, lounge, and equipment images are concepts, not actual business photographs. The reference video hero is replaced with a still image and subtle scale entrance. GSAP easing and durations approximate visible rhythm, not source-extracted timings. Four-route scope intentionally replaces automotive sections and omits commercial news/shop pages.

Exact image prompts and provenance are recorded in `public/media/ASSETS.md`. Generated assets use the built-in ImageGen tool. Font files were downloaded from Google's font CDN; fonts are distributed under the SIL Open Font License.

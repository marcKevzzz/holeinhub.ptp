---
name: Hole In Hub Golf & Lounge
description: A photographic editorial adaptation for indoor golf and lounge experiences.
colors:
  green: "#354f3b"
  ink: "#10110f"
  paper: "#ffffff"
  muted: "#60645d"
  line: "#d5d7d1"
  error: "#9b3027"
typography:
  display:
    fontFamily: "Oswald, 'Arial Narrow', sans-serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "2.24px"
  title:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "11px"
    lineHeight: 1.5
    letterSpacing: "1.7px"
rounded:
  square: "0px"
spacing:
  desktop-gutter: "32px"
  compact-gutter: "16px"
  mobile-gutter: "20px"
  wide-gutter: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.green}"
  button-white:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "12px 0"
---

# Design System: Hole In Hub Golf & Lounge

The frontmatter records normative base tokens extracted from `src/styles.css`. Responsive overrides and component exceptions are described below; the sidecar carries motion, breakpoints and renderable examples.

## Overview

The implemented direction is a Spyker editorial adaptation for indoor golf: a white editorial canvas, black typography, centered brand mark and minimal overlay controls. Full viewport photography, condensed uppercase headings, staggered asymmetric photographs and huge chapter numerals carry the experience. The durable reference commitment comes from PRODUCT.md.

Measured reference at 952px viewport: hero display 56px / 2.24px tracking; menu links 38px Swiss721; header control 32px at x16 y28; Contact heading 20px, equal two columns with 16px gap; inputs 14px, 12px vertical padding, 47px high; Send CTA 36px high. The implementation adapts touch controls to at least 44px.

Locally hosted Oswald replaces proprietary Futura PT Condensed; locally hosted Inter replaces Swiss721. These are approximations with different glyph shapes and wrapping. Reference hero moving media is replaced by generated concept photography with a subtle entrance scale. Images represent concepts, not actual business photography. About chapters use numbers rather than invented historic dates. GSAP timings are implementation estimates from observed transitions, not extracted source values: menu 0.65s power3.inOut, hero 1.1s power3.out, reveal 0.8s power2.out. Reduced motion removes animation.

**Key Characteristics:**

- Photographic hero and asymmetric editorial imagery.
- Condensed headings against restrained body typography.
- Flat surfaces, underline fields and rectangular actions.
- Centered identity and full-screen navigation.

## Colors

Muted golf green supplies functional emphasis within a predominantly white and near-black interface.

### Primary

- **Golf Green:** selected dates, resources and time slots, occupied schedule cells, active navigation, success text, focus rings and primary-button hover.

### Neutral

- **Near-black Ink:** body text, headings and primary actions.
- **White Paper:** canvas, menu, light action variants and chapter navigation.
- **Muted Olive Gray:** supporting copy, metadata and inactive step labels.
- **Pale Gray Line:** dividers, field underlines and scheduling outlines.

The error token marks validation messages and invalid-field borders. Hero photography has a dark gradient overlay for readable white text; the final photographic call to action uses brightness reduction.

## Typography

**Display Font:** locally hosted Oswald, with Arial Narrow and sans-serif fallbacks.

**Body Font:** locally hosted Inter, with Arial and sans-serif fallbacks. Both bundled faces declare weight 400.

Condensed uppercase display type supplies the reference's editorial character. Body type supports longer descriptions, scheduling information and forms.

### Hierarchy

- **Display:** base heading token; hero uses a 1.2 line height on desktop. The final mobile hero override is 50px / 1.15; tracking remains 1.68px.
- **Headline:** mobile general headings become 40px with 1.6px tracking. Statement headings use clamp(75px, 9vw, 120px), then 72px on mobile.
- **Title:** body-family titles, also used by Contact headings without uppercase transformation.
- **Body:** base body token; supporting small text is 12px with a 1.7 line height.
- **Label:** eyebrow token; component labels vary by context. Button type uses Oswald at 14px with .84px tracking.

## Layout

Desktop outer gutters use the frontmatter base spacing. At widths up to 1000px gutters become compact; up to 700px they become mobile; from 1600px they become wide. The fixed header is 100px tall, reducing to 84px on mobile.

The hero fills 100svh with a 620px minimum. Editorial images occupy offset two-column positions; on mobile they become a vertical sequence with alternating alignment. Contact uses two equal columns with a 32px gap, reducing to 16px at compact widths and one column on mobile. Reservation layout combines a flexible content column and 330px summary, reducing the summary to 260px before stacking. Its container has a 1600px maximum. Scheduling tables retain a 760px minimum width inside horizontal overflow.

Long-form sections use generous vertical spacing (commonly 90–150px). Form grids use two columns, while resource choices shift from three to two on mobile. The final mobile menu hides its image, uses 34px links and retains the centered mark.

## Elevation & Depth

Surfaces are predominantly flat: dividers, photography, tonal selection and layering establish depth. The header uses translucent white when over the page and becomes transparent over the hero. The floating chapter controls have the only explicit structural shadow.

### Shadow Vocabulary

- **Chapter navigation:** `0 4px 25px #0000000d`, separating fixed white controls from content beneath them.

## Shapes

Actions and input fields are square. Scheduling and resource choices use thin rectangular outlines. Circular radio indicators express service selection; these are not a general corner treatment. Photographs remain rectangular without decorative frames.

## Components

### Buttons

Rectangular, condensed and restrained. Primary actions use ink with paper text and the frontmatter padding, with a 44px minimum height and 230px minimum width. Hover changes the background and border to green over .25s; the arrow shifts 4px. White and outlined variants support photographic and secondary contexts. Disabled buttons use .42 opacity and a not-allowed cursor. Focus uses a 2px green outline offset by 5px; light-header controls use white outlines.

### Cards / Containers

Reservation resources are flat outlined rectangles with 18px internal padding and a 150px minimum height. Selected choices use green with white text. Summary rows use dividers rather than boxed cards. No general elevated card system exists.

### Inputs / Fields

Transparent square fields use a bottom line and the frontmatter padding, with a 44px minimum height. Focus changes the underline to green, while invalid fields use the error token. Textareas have a 90px minimum and resize vertically. Field labels are 13px on desktop.

### Navigation

The header centers the mark between a menu trigger and reservation action. The full-screen white menu uses body-family links sized clamp(24px, 3.1vw, 42px), green active links and .5 hover opacity. Compact widths hide the trigger word and action label while maintaining 44px controls. Menu numbers and arrows are hidden by the final stylesheet overrides. Bottom chapter controls use underline selection and fixed positioning.

### Reservation Choices

Date strips, time slots and resource buttons use thin neutral borders at rest and green/white selection. Availability tables use tabular numerals and occupied green cells. Step labels distinguish current ink, complete green and pending muted text without decorative badges.

## Do's and Don'ts

### Do:

- **Do** preserve the centered mark, photographic scale and asymmetric editorial rhythm when extending this reference adaptation.
- **Do** use green for selection, focus and functional emphasis.
- **Do** retain visible keyboard focus and at least 44px primary touch controls.
- **Do** respect reduced-motion preferences in CSS and GSAP behavior.

### Don't:

- **Don't** describe the substituted fonts or estimated motion as exact reference assets or extracted timings.
- **Don't** present generated concept images as actual business photographs.
- **Don't** replace the established square actions and underline fields with unrelated decorative treatments.

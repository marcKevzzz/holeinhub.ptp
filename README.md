# Hole In Hub — Golf & Lounge

> **Live Deployment:** [holeinhub-ptp.vercel.app](https://holeinhub-ptp.vercel.app/)

A modern, high-performance web application and digital reservation platform for **Hole In Hub Golf & Lounge**, a premier indoor simulator golf and social venue located in Quezon City, Philippines.

The platform bridges luxury editorial design—inspired by minimalist, typography-driven automotive aesthetics—with a full-featured simulator bay reservation engine, visual media archives, and venue services.

---

## Project Overview

**Hole In Hub** offers state-of-the-art indoor golf simulator bays, professional coaching (including KPGA-certified instruction), social lounge seating, and food & beverage services. This application serves as the brand's primary digital portal, providing guests with:

1. **Brand Storytelling**: A cinematic, luxury digital presence introducing the venue, facilities, and unique atmosphere.
2. **Visual Archives & Editorial Gallery**: An interactive visual feed showcasing simulator bays, coaching sessions, family experiences, and special programs.
3. **Full-Featured Simulator Booking**: A multi-step interactive reservation system with visual bay selection, drag-and-drop hour picking, automated rate calculations, and self-service reservation management.

---

## Core Features & Modules

### 1. Cinematic Home & Editorial Experience (`/`)
- **Video Hero & Kinetic Typography**: Smooth-scaling media hero with wordmark animations and dynamic entrance effects.
- **GSAP Scroll Experiences**: Powered by GSAP `ScrollTrigger` and `ScrollSmoother` for smooth inertial scrolling, parallax media reveals, and responsive section transitions.
- **Statement Video Section**: Scroll-scrubbed media frame scaling dynamically as users navigate through the venue story.
- **Interactive Navigation**: Full-screen slide-out navigation overlay, sticky floating brand header with reactive backdrop filters, and route transitions.

### 2. Visual Archives & Gallery (`/gallery`)
- **Responsive Editorial Grid**: Adapts smoothly across all viewports—dual-column desktop layout, balanced 2-column tablet layout (701px–1023px), and fluid single-column mobile view.
- **Category Filter Tabs**: Horizontally scrollable category tabs with touch momentum scrolling and active tab centering across viewports (Simulator Bays, Family Play, Coaching, Golf Experience, The Venue, Social Spaces, Food & Drinks, Promotions & Programs).
- **Interactive Lightbox / Story Modal**: Click any story or promotional poster to open an animated reader modal with high-resolution imagery, video playback, and story details.

### 3. Simulator Reservation Engine (`/reservation`)
- **Visual Bay Selection**: Select single or multiple simulator bays (Bays 1–6) or special lounge areas with real-time occupancy indicators.
- **Interactive Drag Selection**: Click and drag across the hourly timeline (09:00 to 24:00) to select contiguous booking slots.
- **Service & Lesson Packages**:
  - Regular Bay Play (Standard & Peak rate tiers)
  - KPGA Pro Coaching & Junior Golf Academy options
  - Exclusive Venue Rentals
- **Dynamic Pricing Calculator**:
  - Auto-calculates pricing based on day of week, hour thresholds (3:00 PM peak cutoff), number of bays, and Philippine public holidays.
  - Interactive voucher code support (e.g., `HUBDEMO`).
- **Client-Side Persistence**: Bookings persist in `localStorage`, supporting instant re-sync and multi-tab status updates.

### 4. Reservation Management (`/my-reservations`)
- **Booking Overview**: Live lookup and list of all active, pending, confirmed, and past bookings.
- **Self-Service Actions**: Reschedule reservation times or cancel bookings directly with automatic calendar slot release.
- **Staff Status Flow**: Demonstrates full reservation lifecycle (Pending → Confirmed → Completed / Cancelled).

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) |
| **Bundler & Build Tool** | [Vite 7](https://vite.dev/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS Design Tokens |
| **Motion & Animations** | [GSAP 3](https://gsap.com/) (`ScrollTrigger`, `ScrollSmoother`) |
| **Testing** | Node.js Native Test Runner (`node --test`) |
| **Hosting & CI/CD** | [Vercel](https://vercel.com/) with SPA rewrite rules (`vercel.json`) |

---

## Project Structure

```text
HoleInHubPrototype/
├── public/
│   ├── media/               # Venue photography, videos, and branding assets
│   └── favicon.ico
├── src/
│   ├── main.jsx             # App bootstrap, routing configuration, layout wrapper
│   ├── Header.jsx           # Global navigation header, mobile slide-out menu
│   ├── Gallery.jsx          # Visual archive page, filter tabs, story lightbox
│   ├── Reservation.jsx      # Multi-bay simulator booking system
│   ├── MyReservations.jsx   # Booking lookup, reschedule, and cancellation
│   ├── motion.js            # GSAP timelines, ScrollSmoother, entrance animations
│   ├── videoPlayback.js     # Background video control and autoplay handlers
│   ├── booking.js           # Reservation business logic, pricing, time slots
│   ├── calendar.js          # Date calculation, calendar grid generation
│   ├── dragSelection.js     # Timeline drag-to-select range utilities
│   ├── holidays.js          # Philippine official holidays calculation
│   ├── services.js          # Simulator and coaching service definitions
│   ├── ui.jsx               # Shared buttons, arrows, stagger text, media containers
│   └── styles.css           # Global typography, layout grids, responsive media queries
├── tests/
│   ├── booking.test.js      # Booking validation, rates, and schedule unit tests
│   ├── calendar.test.js     # Calendar alignment and date leap-year tests
│   ├── dragSelection.test.js# Drag range selection tests
│   └── services.test.js     # Service validation tests
├── vercel.json              # SPA routing redirects for production deployment
├── vite.config.js           # Vite server and plugin configuration
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: v20.19+ or v22.12+ (required by Vite 7)
- **npm**: v10+

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/marckevzz/holeinhub.ptp.git
   cd holeinhub.ptp
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Launch development server:
   ```sh
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

### Running Tests

Execute the unit test suite covering reservation logic, pricing rules, holiday calculations, and calendar math:
```sh
npm test
```

### Production Build

Create an optimized production bundle:
```sh
npm run build
```

Preview the production build locally:
```sh
npm run preview
```

---

## Deployment

The project is configured for one-click deployment on **Vercel**:
- Continuous Deployment is linked to the `main` branch.
- [vercel.json](file:///c:/Users/Admin/source/repos/HoleInHubPrototype/vercel.json) routes all incoming requests to `/index.html` to support client-side routing on hard refreshes.
- Live URL: **https://holeinhub-ptp.vercel.app/**

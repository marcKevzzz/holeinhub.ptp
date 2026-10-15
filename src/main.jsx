import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import Reservation from './Reservation';
import MyReservations from './MyReservations';
import Gallery from './Gallery';
import './styles.css';
import Header, { destinations } from './Header';
import { Arrow, Photo, Mark, Button, ButtonLabel, SocialIcons, WordStagger } from './ui';
import { animatePage } from './motion';
import { autoplayVideo } from './videoPlayback';
import RouteTransition from './RouteTransition';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

function Footer() {
  const location = useLocation();

  const primaryNav = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/appointment', label: 'Make a reservation' },
    { to: '/my-reservations', label: 'My reservations' },
    { to: '/contacts', label: 'Contacts' },
  ];

  return (
    <footer className="spyker-footer">
      <div className="spyker-footer-inner">
        {/* Left column: Brand logo */}
        <div className="spyker-footer-brand">
          <Link to="/" aria-label="Hole In Hub home">
            <Mark />
          </Link>
        </div>

        {/* Center column: Primary navigation links + Social icons */}
        <div className="spyker-footer-center">
          <nav aria-label="Footer navigation" className="spyker-footer-nav menu-links">
            {primaryNav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="spyker-footer-link"
              >
                <span className="menu-link-mask">
                  <span className="menu-link-text">{label}</span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="spyker-footer-social-wrap">
            <SocialIcons className="spyker-footer-socials" />
          </div>
        </div>

        {/* Right column: Legal policy links (top) and Newsletter / Community (bottom) */}
        <div className="spyker-footer-right">
          <div className="spyker-footer-legal">
            <Link to="/about">Cookie policy</Link>
            <Link to="/about">Privacy policy</Link>
            <Link to="/about">Terms and conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function HeritageMosaicTeaser() {
  const floatingImages = [
  {
    "src": "/media/facebook/coaching.png",
    "alt": "A young golfer learning",
    "className": "mosaic-img-top-center"
  },
  {
    "src": "/media/facebook/junior-golf-third.png",
    "alt": "Third junior golf program poster",
    "className": "mosaic-img-top-left"
  },
  {
    "src": "/media/facebook/social-seating.png",
    "alt": "Seating beside the bays",
    "className": "mosaic-img-mid-left"
  },
  {
    "src": "/media/facebook/october-longest-drive.png",
    "alt": "October longest drive challenge",
    "className": "mosaic-img-bot-left"
  },
  {
    "src": "/media/facebook/coaching-programs.png",
    "alt": "Professional coaching options",
    "className": "mosaic-img-top-right"
  },
  {
    "src": "/media/facebook/dessert-menu.png",
    "alt": "Snow ice menu",
    "className": "mosaic-img-mid-right"
  },
  {
    "src": "/media/facebook/family-play.png",
    "alt": "Family golf session",
    "className": "mosaic-img-bot-right"
  }
];

  return (
    <section className="about-teaser-mosaic">
      {/* Floating images canvas matching Spyker home heritage teaser */}
      <div className="mosaic-canvas" aria-hidden="true">
        {floatingImages.map((item, idx) => (
          <div
            key={idx}
            className={`mosaic-item ${item.className}`}
          >
            <div className="mosaic-inner">
              <Photo src={item.src} alt={item.alt} />
            </div>
          </div>
        ))}
      </div>

      {/* Center content */}
      <div className="mosaic-center-box">
        <p className="eyebrow">GOLF &amp; LOUNGE</p>
        <h2><WordStagger>LEARN. PLAY. COME TOGETHER.</WordStagger></h2>
        <p>
          From first swings to friendly challenges, discover the programs and experiences at Hole In Hub.
        </p>
        <Button as={Link} className="button" to="/about">
          <ButtonLabel>EXPLORE THE PROGRAMS</ButtonLabel>
          <Arrow />
        </Button>
      </div>
    </section>
  );
}

function BackgroundVideo({ src, poster, className, alt, eager = false, playAction = false, mobileSrc, waitForIntro = false }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(true);
  const [loaded, setLoaded] = useState(eager);
  const playRequested = useRef(false);

  const srcWebm = src ? src.replace(/\.mp4$/, '.webm') : null;
  const mobileSrcWebm = mobileSrc ? mobileSrc.replace(/\.mp4$/, '.webm') : null;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = () => {
      if (preference.matches) videoRef.current?.pause();
      else if (!playAction) autoplayVideo(videoRef.current);
    };
    if (loaded) {
      videoRef.current?.load();
      if (playRequested.current) videoRef.current?.play().catch(() => {});
      else applyPreference();
    }
    preference.addEventListener('change', applyPreference);
    return () => preference.removeEventListener('change', applyPreference);
  }, [playAction, loaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoaded(true);
        if (!playAction) autoplayVideo(video);
      } else video.pause();
    }, { rootMargin: '200px' });
    observer.observe(video);
    return () => observer.disconnect();
  }, [playAction]);

  useEffect(() => {
    if (!playAction) return;
    const frame = videoRef.current?.parentElement;
    if (!frame) return;
    let idleTimer;
    const hide = () => {
      clearTimeout(idleTimer);
      delete frame.dataset.controlsActive;
    };
    const show = event => {
      if (event.pointerType !== 'mouse') return;
      clearTimeout(idleTimer);
      frame.dataset.controlsActive = 'true';
      idleTimer = setTimeout(hide, 1500);
    };
    frame.addEventListener('pointerenter', show);
    frame.addEventListener('pointermove', show);
    frame.addEventListener('pointerleave', hide);
    return () => {
      hide();
      frame.removeEventListener('pointerenter', show);
      frame.removeEventListener('pointermove', show);
      frame.removeEventListener('pointerleave', hide);
    };
  }, [playAction, failed]);

  return (
    <>
      <Photo eager={eager} src={poster} alt={alt} className={className} />
      {!failed && <video ref={videoRef} className={`${className} background-video`} muted loop playsInline data-intro-pending={waitForIntro ? '' : undefined} preload={loaded ? 'metadata' : 'none'} aria-hidden="true"
        onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onError={event => { if (event.currentTarget.error) setFailed(true); }}>
        {loaded && <>
          {mobileSrcWebm && <source src={mobileSrcWebm} media="(max-width: 700px)" type="video/webm" />}
          {mobileSrc && <source src={mobileSrc} media="(max-width: 700px)" type="video/mp4" />}
          {srcWebm && <source src={srcWebm} type="video/webm" />}
          <source src={src} type="video/mp4" />
        </>}
      </video>}
      {playAction && !failed && <button className="statement-play" type="button" aria-label={paused ? 'Play statement video' : 'Pause statement video'} onClick={() => {
        if (paused) {
          playRequested.current = true;
          if (!loaded) setLoaded(true);
          else videoRef.current?.play().catch(() => {});
        }
        else videoRef.current?.pause();
      }}>
        <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
      </button>}
    </>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <BackgroundVideo eager waitForIntro src="/media/facebook/hero-quality.mp4" mobileSrc="/media/facebook/hero-quality-mobile.mp4" poster="/media/facebook/hero-optimized-poster.jpg" className="hero-image" alt="Inside Hole In Hub" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">A NEW WAY TO PLAY</p>
          <h1>
            <span className="split-line"><WordStagger>YOUR NEXT ROUND.</WordStagger></span>
            <span className="split-line"><WordStagger>STARTS HERE.</WordStagger></span>
          </h1>
          <Button as={Link} className="button white" to="/appointment">
            <ButtonLabel>MAKE A RESERVATION</ButtonLabel>
            <Arrow />
          </Button>
        </div>
      </section>

      <section id="experience" className="intro reveal">
        <p className="eyebrow">THE HOLE IN HUB EXPERIENCE</p>
        <h2>
          <span className="split-line"><WordStagger>PURE PLAY.</WordStagger></span>
          <span className="split-line"><WordStagger>GOOD COMPANY.</WordStagger></span>
        </h2>
        <p>A round of golf. A space to unwind. A reason to get together. Hole In Hub brings virtual golf simulators and a lounge experience into one indoor destination in Quezon City.</p>
      </section>

      <section className="editorial">
        <figure className="editorial-one">
          <div className="photo-frame"><Photo /></div>
          <figcaption>
            <span>THE SIMULATOR BAYS</span>
            <p>Step onto the turf and into your next round. Our indoor bays bring the golf experience closer, whether you’re playing on your own or sharing a session.</p>
          </figcaption>
        </figure>
        <figure className="editorial-two">
          <div className="photo-frame"><Photo src="/media/facebook/social-seating.png" /></div>
          <figcaption>
            <span>ROOM TO UNWIND</span>
            <p>Take a little time between swings. Private spaces and the lounge make room for the moments beyond the game.</p>
          </figcaption>
        </figure>
        <figure className="editorial-three">
          <div className="photo-frame"><Photo src="/media/facebook/family-play.png" alt="Family golf session at Hole In Hub" /></div>
          <figcaption>
            <span>BETTER TOGETHER</span>
            <p>Bring your people. Reserve multiple bays in one group reservation and make the next gathering a round to remember.</p>
          </figcaption>
        </figure>
      </section>

      <section className="statement reveal">
        <h2>
          <span className="split-line"><WordStagger>MORE THAN</WordStagger></span>
          <span className="split-line"><WordStagger>A ROUND.</WordStagger></span>
        </h2>
        <p>A shared experience. From the first swing to the last conversation.</p>
        <div className="photo-frame scroll-scale-frame">
          <BackgroundVideo playAction src="/media/facebook/statement-quality.mp4" mobileSrc="/media/facebook/statement-quality-mobile.mp4" poster="/media/facebook/statement-optimized-poster.jpg" className="scroll-scale-img" alt="Friends spending time together at Hole In Hub" />
        </div>
      </section>

      <section className="venue-promotions" aria-labelledby="venue-promotions-title">
        <p className="eyebrow">MORE WAYS TO PLAY</p>
        <h2 id="venue-promotions-title">OFFERS &amp; COACHING</h2>
        <p className="promotion-note">Offers shown in the supplied posters. Confirm dates, availability, and terms with the venue.</p>
        <div className="promotion-grid">
          <figure><Photo src="/media/facebook/october-daytime-promo.png" alt="October daytime promotion: PHP 400 before 4 PM, excluding weekends and holidays" /><figcaption>October daytime promo</figcaption></figure>
          <figure><Photo src="/media/facebook/october-longest-drive.png" alt="October longest drive challenge: ask staff to join" /><figcaption>October longest drive challenge</figcaption></figure>
          <figure><Photo src="/media/facebook/coaching-programs.png" alt="Philippine and KPGA professional coaching options" /><figcaption>Get coached by the pros</figcaption></figure>
        </div>
      </section>
      <HeritageMosaicTeaser />

      <section className="final-cta">
        <Photo src="/media/facebook/coaching.png" alt="A golf lesson at Hole In Hub" />
        <div>
          <p className="eyebrow">YOUR BAY IS WAITING</p>
          <h2>
            <span className="split-line"><WordStagger>MAKE TIME</WordStagger></span>
            <span className="split-line"><WordStagger>FOR YOUR NEXT ROUND.</WordStagger></span>
          </h2>
          <Button as={Link} className="button white" to="/appointment">
            <ButtonLabel>MAKE A RESERVATION</ButtonLabel>
            <Arrow />
          </Button>
        </div>
      </section>
    </>
  );
}

const heritageMilestones = [
  {
    chapter: "CHAPTER 01 / SIMULATOR SUITES",
    year: "01",
    title: "TOUR-GRADE PRECISION",
    copy: "High-speed optical tracking, realistic turf greens, and responsive physics bring world-class fairways indoors. Play solo practice rounds or dial in every club in your bag.",
    image: "/media/facebook/venue-overview.png",
    aspect: "landscape",
  },
  {
    chapter: "CHAPTER 02 / SOCIAL SPACES",
    year: "02",
    title: "ROOM TO UNWIND",
    copy: "Take time between swings. Dedicated lounge tables, comfortable seating, and casual dining provide space for conversations and camaraderie beyond the scorecard.",
    image: "/media/facebook/social-seating.png",
    aspect: "portrait",
  },
  {
    chapter: "CHAPTER 03 / COACHING & CLINICS",
    year: "03",
    title: "DEVELOP YOUR GAME",
    copy: "From fundamental grip and posture to comprehensive swing analysis, personalized instruction helps beginners find confidence and seasoned players shave strokes.",
    image: "/media/facebook/coaching.png",
    aspect: "portrait",
  },
  {
    chapter: "CHAPTER 04 / GATHERINGS & EVENTS",
    year: "04",
    title: "A ROUND FOR EVERYONE",
    copy: "Indoor golf built for friends, families, and team gatherings. Multi-bay reservations and casual formats turn every session into an accessible, memorable social event.",
    image: "/media/facebook/family-play.png",
    aspect: "portrait",
  },
];

function About() {
  const containerRef = useRef();
  const trackRef = useRef();

  return (
    <div className="spyker-heritage-page">
      <div className="heritage-horizontal-container" ref={containerRef}>
        <div ref={trackRef} className="heritage-scroll-track">
          {heritageMilestones.map((item, idx) => (
            <section className="heritage-milestone-group" key={idx} aria-label={item.title}>
              {/* Text Block: Title + Body on top, Huge Year anchored at bottom */}
              <div className="heritage-block-frame heritage-text-frame">
                <div className="heritage-text-content">
                  <span className="heritage-chapter-tag">{item.chapter}</span>
                  <h3 className="heritage-milestone-title"><WordStagger>{item.title}</WordStagger></h3>
                  <p className="heritage-milestone-copy">{item.copy}</p>
                </div>
                <strong className="heritage-giant-year">{item.year}</strong>
              </div>

              {/* Archival Image Frame matching Spyker aspect-480/674 & landscape */}
              <div className={`heritage-block-frame heritage-image-frame ${item.aspect === 'landscape' ? 'aspect-landscape' : 'aspect-portrait'}`}>
                <div className="heritage-image-inner">
                  <Photo src={item.image} alt={item.title} className="heritage-parallax-img" />
                </div>
              </div>
            </section>
          ))}

          {/* Final CTA Block at end of track */}
          <div className="heritage-block-frame heritage-text-frame heritage-end-frame">
            <div className="heritage-text-content">
              <span className="heritage-chapter-tag">RESERVATIONS &amp; PLAY</span>
              <h3 className="heritage-milestone-title"><WordStagger>YOUR ROUND STARTS HERE</WordStagger></h3>
              <p className="heritage-milestone-copy">Step onto the turf and into your next round. Explore indoor golf, coaching, and social spaces in Quezon City.</p>
            </div>
            <div className="heritage-cta-action">
              <Button as={Link} className="button" to="/appointment">
                <ButtonLabel>MAKE A RESERVATION</ButtonLabel>
                <Arrow />
              </Button>
            </div>
            <strong className="heritage-giant-year" aria-hidden="true">PLAY</strong>
          </div>

          <div className="heritage-spacer" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function Contacts() {
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');
  const timer = useRef();

  useEffect(() => () => clearTimeout(timer.current), []);

  function submit(e) {
    e.preventDefault();
    if (state === 'submitting') return;
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const next = {};
    for (const key of ['name', 'email', 'subject', 'message']) {
      if (!data[key]?.trim()) next[key] = 'This field is required.';
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      next.email = 'Enter a valid email address.';
    }
    setErrors(next);
    if (Object.keys(next).length) {
      e.currentTarget.querySelector(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    setState('submitting');
    timer.current = setTimeout(() => setState('success'), 700);
  }

  return (
    <>
      <section className="contact-page">
        <div className="contact-info-col">
          <div className="contact-header-block">
            <h1>CONTACT &amp; LOCATION</h1>
            <p className="contact-lead">
              Tour-grade simulator suites, private hospitality bays, and an unhurried social lounge. Drop by for a session or reach out to our concierge for bookings and private events.
            </p>
          </div>

          <div className="contact-details-grid">
            {/* Location Card */}
            <div className="contact-detail-card">
              <span className="contact-card-label">CLUBHOUSE LOCATION</span>
              <h3 className="contact-card-title">Hole In Hub Golf &amp; Lounge</h3>
              <p className="contact-card-text">
                3rd Floor, EK Building, 50 Holy Spirit Drive<br />
                Quezon City, Metro Manila, Philippines
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=EK+Building+50+Holy+Spirit+Drive+Quezon+City"
                target="_blank"
                rel="noreferrer"
                className="contact-direction-link"
              >
                <span>GET DIRECTIONS</span>
                <Arrow />
              </a>
            </div>

            {/* Direct Inquiries Card */}
            <div className="contact-detail-card">
              <span className="contact-card-label">DIRECT INQUIRIES</span>
              <div className="contact-channels">
                <div className="contact-channel-item">
                  <span className="channel-type">Mobile / Inquiries</span>
                  <a href="tel:+639692654976" className="channel-val">+63 969 265 4976</a>
                </div>
                <div className="contact-channel-item">
                  <span className="channel-type">Email</span>
                  <a href="mailto:holeinhub@gmail.com" className="channel-val">holeinhub@gmail.com</a>
                </div>
                <div className="contact-channel-item">
                  <span className="channel-type">Social Direct</span>
                  <a href="https://www.facebook.com/profile.php?id=61589175118662" target="_blank" rel="noreferrer" className="channel-val">Facebook / Instagram</a>
                </div>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="contact-detail-card contact-hours-card">
              <div className="contact-hours-header">
                <span className="contact-card-label">OPERATING SCHEDULE</span>
                <span className="contact-open-badge">OPEN DAILY</span>
              </div>
              <ul className="contact-hours-list">
                <li>
                  <span className="hour-day">Monday</span>
                  <span className="hour-time">11:00 AM – 12:00 AM</span>
                </li>
                <li>
                  <span className="hour-day">Tuesday – Thursday</span>
                  <span className="hour-time">10:00 AM – 12:00 AM</span>
                </li>
                <li>
                  <span className="hour-day">Friday – Sunday</span>
                  <span className="hour-time">10:00 AM – 1:00 AM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Map Embed */}
          {/* <div className="contact-map-card">
            <div className="contact-map-header">
              <div>
                <span className="contact-map-tag">EK BUILDING · HOLY SPIRIT DRIVE</span>
                <h4>Interactive Location Map</h4>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=EK+Building+50+Holy+Spirit+Drive+Quezon+City"
                target="_blank"
                rel="noreferrer"
                className="contact-map-external-btn"
              >
                <span>OPEN MAPS</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
            <div className="contact-map-frame">
              <iframe
                title="Hole In Hub Location Map"
                src="https://maps.google.com/maps?q=EK+Building+50+Holy+Spirit+Drive+Quezon+City&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="290"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div> */}
        </div>
        <div>
          <h2>Need help? Get in touch.</h2>
          {state === 'success' ? (
            <div role="status" className="success">
              <h3>Thank you for your inquiry.</h3>
              <p>Your submission was simulated. No message was sent.</p>
              <Button className="button" onClick={() => setState('idle')}>
                <ButtonLabel>WRITE ANOTHER INQUIRY</ButtonLabel>
                <Arrow />
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              {[
                ['name', 'Name', 'text'],
                ['email', 'Email', 'email'],
                ['subject', 'Subject', 'select'],
                ['message', 'Type your inquiry here', 'textarea']
              ].map(([name, label, type]) => (
                <label className="field" key={name}>
                  <span>{label} *</span>
                  <div className="field-input-wrap">
                    {type === 'select' ? (
                      <select name={name} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} defaultValue="">
                        <option value="">Select a subject</option>
                        {['Reservations', 'Group events', 'Packages', 'General inquiry'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    ) : type === 'textarea' ? (
                      <textarea name={name} rows="3" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />
                    ) : (
                      <input type={type} name={name} autoComplete={name} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />
                    )}
                  </div>
                  {errors[name] && <span className="inline-error" id={`${name}-error`}>{errors[name]}</span>}
                </label>
              ))}
              <Button className="button" disabled={state === 'submitting'}>
                <ButtonLabel>{state === 'submitting' ? 'SENDING…' : 'SEND INQUIRY'}</ButtonLabel>
                <Arrow />
              </Button>
            </form>
          )}
          <div className="contact-reserve">
            <h2>Ready for a round?</h2>
            <Link to="/appointment">Make a reservation <Arrow /></Link>
          </div>
        </div>
      </section>

      <section className="contact-gallery">
        <h2>DISCOVER THE EXPERIENCE</h2>
        <div>
          <Photo />
          <Photo src="/media/facebook/social-seating.png" />
          <Photo src="/media/facebook/coaching.png" />
        </div>
        <p className="small">Photos from Hole In Hub’s Facebook media.</p>
      </section>
    </>
  );
}

function App() {
  const location = useLocation();
  const page = useRef();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    try {
      const smoother = ScrollSmoother.get();
      if (smoother) {
        smoother.scrollTo(0, false);
      }
    } catch {}
    document.title = `${destinations.find(d => d[0] === location.pathname)?.[1] || 'Home'} | Hole In Hub Golf & Lounge`;
    const cleanup = animatePage(page.current);

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [location.pathname]);

  return (
    <>
      <Header />
      <RouteTransition />
      <div className="smooth-wrapper">
        <div className="smooth-content">
          <main id="main" ref={page}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/appointment" element={<Reservation />} />
              <Route path="/my-reservations" element={<MyReservations />} />
              <Route path="/contacts" element={<Contacts />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

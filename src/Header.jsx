import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { Arrow, Mark, Photo, ButtonLabel } from './ui';

export const destinations = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/gallery', 'Gallery'],
  ['/appointment', 'Make a reservation'],
  ['/my-reservations', 'My reservations'],
  ['/contacts', 'Contacts']
];

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panel = useRef();
  const header = useRef();
  const trigger = useRef();
  const backdrop = useRef();
  const timeline = useRef();
  const closing = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  function openMenu() {
    if (closing.current) return;
    setMounted(true);
    setActive(true);
  }

  function closeMenu() {
    if (closing.current || !mounted) return;
    const complete = () => {
      closing.current = false;
      setActive(false);
      setMounted(false);
    };
    if (!timeline.current) return complete();
    closing.current = true;
    timeline.current.eventCallback('onReverseComplete', complete).timeScale(1.4).reverse();
  }

  function transitionToPage(destination) {
    if (closing.current || !mounted) return;
    closing.current = true;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(destination);
      window.scrollTo(0, 0);
      setScrolled(false);
      closing.current = false;
      setActive(false);
      setMounted(false);
      return;
    }

    if (timeline.current) {
      timeline.current.pause();
    }

    const iconLines = trigger.current ? trigger.current.querySelectorAll('.menu-line') : [];
    if (iconLines.length >= 2) {
      gsap.to(iconLines[0], { y: 0, rotate: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(iconLines[1], { y: 0, rotate: 0, duration: 0.35, ease: 'power2.out' });
    }

    if (panel.current) {
      gsap.set(panel.current, { height: '100vh', maxHeight: '100vh' });
    }

    document.body.classList.add('menu-transitioning');

    const elementsToFade = panel.current
      ? panel.current.querySelectorAll('.menu-links, .menu-photo, .menu-bottom')
      : [];

    gsap.to(elementsToFade, {
      y: -24,
      opacity: 0,
      duration: 0.22,
      stagger: 0.02,
      ease: 'power2.in',
      onComplete: () => {
        navigate(destination);
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        setScrolled(false);
        try {
          const smoother = ScrollSmoother.get();
          smoother?.scrollTo(0, false);
        } catch {}

        requestAnimationFrame(() => {
          if (panel.current) {
            gsap.to(panel.current, {
              yPercent: -100,
              duration: 0.55,
              ease: 'power3.inOut',
              onComplete: () => {
                document.body.classList.remove('menu-transitioning');
                closing.current = false;
                setActive(false);
                setMounted(false);
                const smoother = ScrollSmoother.get();
                smoother?.paused(false);
              }
            });
          } else {
            document.body.classList.remove('menu-transitioning');
            closing.current = false;
            setActive(false);
            setMounted(false);
          }

          if (backdrop.current) {
            gsap.to(backdrop.current, {
              opacity: 0,
              duration: 0.45,
              ease: 'power2.out'
            });
          }
        });
      }
    });
  }

  function followLink(event, destination) {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!destination || destination === location.pathname) {
      closeMenu();
      return;
    }
    transitionToPage(destination);
  }

  useEffect(() => {
    let previous = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 60);
      if (!mounted && Math.abs(current - previous) > 4 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.to(header.current, {
          yPercent: current > 120 && current > previous ? -100 : 0,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: true
        });
        previous = current;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      gsap.killTweensOf(header.current);
    };
  }, [mounted]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    if (!mounted) return;
    const oldOverflow = document.body.style.overflow;
    const smoother = ScrollSmoother.get();
    smoother?.paused(true, true);
    document.body.style.overflow = 'hidden';

    const getFocusables = () => {
      const panelItems = panel.current ? Array.from(panel.current.querySelectorAll('a, button')) : [];
      return [trigger.current, ...panelItems].filter(Boolean);
    };

    const onKey = event => {
      if (event.key === 'Escape') closeMenu();
      if (event.key !== 'Tab') return;
      const items = getFocusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    const context = gsap.context(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const iconLines = trigger.current ? trigger.current.querySelectorAll('.menu-line') : [];
      const iconTop = iconLines[0];
      const iconBottom = iconLines[1];

      timeline.current = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
        .from(backdrop.current, { opacity: 0, duration: 0.5 }, 0)
        .from(panel.current, { yPercent: -100, duration: 0.75 }, 0);

      if (iconTop && iconBottom) {
        timeline.current
          .to(iconTop, { y: 4.25, rotate: 45, duration: 0.5, ease: 'power3.inOut' }, 0)
          .to(iconBottom, { y: -4.25, rotate: -45, duration: 0.5, ease: 'power3.inOut' }, 0);
      }

      timeline.current
        .from('.menu-link-text', { yPercent: 110, duration: 0.65, stagger: 0.055, ease: 'power3.out' }, 0.25)
        .from('.menu-photo', { clipPath: 'inset(20%)', scale: 1.08, duration: 0.75, ease: 'power3.out' }, 0.2)
        .from('.menu-bottom > *', { opacity: 0, y: 10, duration: 0.45, stagger: 0.06 }, 0.4);
    });

    return () => {
      context.revert();
      timeline.current = null;
      closing.current = false;
      document.body.classList.remove('menu-transitioning');
      smoother?.paused(false);
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', onKey);
      trigger.current?.focus({ preventScroll: true });
    };
  }, [mounted]);

  const isLight = location.pathname === '/' && !scrolled && !active;

  return (
    <>
      <header
        ref={header}
        className={`header ${isLight ? 'light' : ''} ${active ? 'menu-open' : ''}`}
        onFocusCapture={() => gsap.to(header.current, { yPercent: 0, duration: 0.2, overwrite: true })}
      >
        <button
          ref={trigger}
          className="menu-trigger"
          aria-label={active ? 'Close menu' : 'Open menu'}
          aria-expanded={active}
          aria-controls="navigation"
          onClick={() => (active ? closeMenu() : openMenu())}
        >
          <span className="menu-icon" aria-hidden="true">
            <span className="menu-line menu-line-top">
              <span className="menu-line-track">
                <span className="menu-bar menu-bar-a" />
                <span className="menu-bar menu-bar-b" />
              </span>
            </span>
            <span className="menu-line menu-line-bottom">
              <span className="menu-line-track">
                <span className="menu-bar menu-bar-a" />
                <span className="menu-bar menu-bar-b" />
              </span>
            </span>
          </span>
        </button>

        <Link to="/" aria-label="Hole In Hub home" onClick={event => active && followLink(event, '/')}>
          <Mark />
        </Link>

        <Link className="header-action button" to="/appointment" aria-label="Make a reservation" onClick={event => active && followLink(event, '/appointment')}>
          <ButtonLabel>RESERVE A BAY</ButtonLabel>
          <Arrow />
        </Link>
      </header>

      {mounted && (
        <>
          <div ref={backdrop} className="menu-backdrop" aria-hidden="true" onClick={() => closeMenu()} />
          <div
            ref={panel}
            className="menu-panel"
            id="navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="menu-top">
              <nav className="menu-links">
                {destinations.map(([to, title]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end
                    aria-label={title}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    onClick={event => followLink(event, to)}
                  >
                    <span className="menu-link-mask">
                      <span className="menu-link-text">{title}</span>
                    </span>
                  </NavLink>
                ))}
              </nav>
              <div className="menu-photo">
                <Photo src="/media/facebook/social-seating.png" alt="Seating beside the Hole In Hub simulator bays" />
              </div>
            </div>
            <div className="menu-bottom">
              <p>
                INDOOR GOLF. GOOD COMPANY.<br />
                Quezon City, Philippines
              </p>
              <Link to="/contacts" className="menu-text-link" onClick={event => followLink(event, '/contacts')}>
                <span>Get in touch</span> <Arrow />
              </Link>
              <p>Golf, with a little more room to unwind.</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

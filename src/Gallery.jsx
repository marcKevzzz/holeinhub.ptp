import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Photo, WordStagger } from './ui';
import mediaImages from './media-images.json';

const newsItems = [
  {
    "id": 1,
    "category": "SIMULATOR BAYS",
    "title": "Inside Hole In Hub",
    "date": "",
    "image": "/media/facebook/venue-overview.png",
    "aspect": "portrait",
    "summary": "Open simulator bays, green hitting areas, and seating for time between swings.",
    "body": "From the supplied Hole In Hub Facebook media."
  },
  {
    "id": 2,
    "category": "FAMILY PLAY",
    "title": "A Round for the Family",
    "date": "",
    "image": "/media/facebook/family-play.png",
    "aspect": "landscape",
    "summary": "Families sharing an indoor golf session at Hole In Hub.",
    "body": "From the supplied Hole In Hub Facebook media."
  },
  {
    "id": 3,
    "category": "COACHING",
    "title": "Learning the Swing",
    "date": "",
    "image": "/media/facebook/coaching.png",
    "aspect": "portrait",
    "summary": "A hands-on moment helping a young player with their golf setup.",
    "body": "From the supplied Hole In Hub Facebook media."
  },
  {
    "id": 4,
    "category": "GOLF EXPERIENCE",
    "title": "Getting Ready to Play",
    "date": "",
    "image": "/media/facebook/golf-experience-poster.jpg",
    "aspect": "portrait",
    "summary": "A short look at preparation for an indoor golf session.",
    "body": "From the supplied Hole In Hub Facebook media.",
    "video": "/media/facebook/golf-experience-hq.mp4"
  },
  {
    "id": 5,
    "category": "THE VENUE",
    "title": "Golf and Good Company",
    "date": "",
    "image": "/media/facebook/venue-tour-poster.jpg",
    "aspect": "featured",
    "summary": "Take a short look around the venue and its social spaces.",
    "body": "From the supplied Hole In Hub Facebook media.",
    "video": "/media/facebook/statement-loop-hd.mp4"
  },
  {
    "id": 6,
    "category": "SOCIAL SPACES",
    "title": "Between Swings",
    "date": "",
    "image": "/media/facebook/social-seating.png",
    "aspect": "portrait",
    "summary": "Tables and seating alongside the simulator bays.",
    "body": "From the supplied Hole In Hub Facebook media."
  },
  {
    "id": 7,
    "category": "FOOD & DRINKS",
    "title": "Golf and Snow Ice",
    "date": "",
    "image": "/media/facebook/golf-and-desserts-poster.jpg",
    "aspect": "landscape",
    "summary": "Indoor golf and a look at the venue\u2019s snow ice desserts.",
    "body": "From the supplied Hole In Hub Facebook media.",
    "video": "/media/facebook/golf-and-desserts-hq.mp4"
  },
  {
    "id": 8,
    "category": "FOOD & DRINKS",
    "title": "Something Sweet",
    "date": "",
    "image": "/media/facebook/dessert-menu.png",
    "aspect": "portrait",
    "summary": "The supplied menu features injeolmi, strawberry cheesecake, and Oreo snow ice. Menu details may change.",
    "body": "From the supplied Hole In Hub Facebook media."
  },
  {
    "id": 9,
    "category": "PROMOTIONS & PROGRAMS",
    "title": "October Daytime Promo",
    "date": "",
    "image": "/media/facebook/october-daytime-promo.png",
    "aspect": "portrait",
    "poster": true,
    "summary": "PHP 400 before 4 PM in October; excludes weekends and holidays.",
    "body": "Promotional poster supplied from Hole In Hub Facebook media. Confirm offer dates, prices, and availability directly with the venue."
  },
  {
    "id": 10,
    "category": "PROMOTIONS & PROGRAMS",
    "title": "October Longest Drive Challenge",
    "date": "",
    "image": "/media/facebook/october-longest-drive.png",
    "aspect": "portrait",
    "poster": true,
    "summary": "Ask staff to record and verify your drive for the October challenge.",
    "body": "Promotional poster supplied from Hole In Hub Facebook media. Confirm offer dates, prices, and availability directly with the venue."
  },
  {
    "id": 11,
    "category": "PROMOTIONS & PROGRAMS",
    "title": "Third Junior Golf Program",
    "date": "",
    "image": "/media/facebook/junior-golf-third.png",
    "aspect": "portrait",
    "poster": true,
    "summary": "Four lessons over one month. Recruitment deadline shown: October 2.",
    "body": "Promotional poster supplied from Hole In Hub Facebook media. Confirm offer dates, prices, and availability directly with the venue."
  },
  {
    "id": 12,
    "category": "PROMOTIONS & PROGRAMS",
    "title": "KPGA Lesson Program",
    "date": "",
    "image": "/media/facebook/kpga-lessons.png",
    "aspect": "portrait",
    "poster": true,
    "summary": "Small-group coaching with up to eight participants. Registration deadline shown: September 18.",
    "body": "Promotional poster supplied from Hole In Hub Facebook media. Confirm offer dates, prices, and availability directly with the venue."
  },
  {
    "id": 13,
    "category": "PROMOTIONS & PROGRAMS",
    "title": "Second Junior Golf Program",
    "date": "",
    "image": "/media/facebook/junior-golf-second.png",
    "aspect": "portrait",
    "poster": true,
    "summary": "A previous junior program announcement. Recruitment deadline shown: September 3.",
    "body": "Promotional poster supplied from Hole In Hub Facebook media. Confirm offer dates, prices, and availability directly with the venue."
  },
  {
    "id": 14,
    "category": "PROMOTIONS & PROGRAMS",
    "title": "Get Coached by the Pros",
    "date": "",
    "image": "/media/facebook/coaching-programs.png",
    "aspect": "portrait",
    "poster": true,
    "summary": "Philippine and KPGA professional coaching options.",
    "body": "Promotional poster supplied from Hole In Hub Facebook media. Confirm offer dates, prices, and availability directly with the venue."
  }
];

const categories = ['All', 'Simulator Bays', 'Family Play', 'Coaching', 'Golf Experience', 'The Venue', 'Social Spaces', 'Food & Drinks', 'Promotions & Programs'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStory, setSelectedStory] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const originElementRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, [activeCategory]);

  const handleOpenStory = (item, element) => {
    const frame = element?.querySelector('.news-frame, .featured-banner-frame') || element;
    if (frame) {
      const rect = frame.getBoundingClientRect();
      setOriginRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      originElementRef.current = frame;
    } else {
      setOriginRect(null);
      originElementRef.current = null;
    }
    setSelectedStory(item);
  };

  const filtered = activeCategory === 'All'
    ? newsItems
    : newsItems.filter(item => item.category === activeCategory.toUpperCase());

  // Split into sections when viewing "All" to match spykercars.com/news
  const isAll = activeCategory === 'All';
  const section1Sticky = isAll ? filtered[0] : filtered[0];
  const section1Scroll = isAll ? filtered.slice(1, 4) : filtered.slice(1);
  const featuredItem = isAll ? filtered[4] : null;
  const section2Sticky = isAll ? filtered[5] : null;
  const section2Scroll = isAll ? filtered.slice(6) : [];

  const renderCard = (item, isSticky = false) => {
    if (!item) return null;
    const isLandscape = item.aspect === 'landscape';
    const isRight = item.align === 'right';
    const isLeft = item.align === 'left';

    const cardStyle = {};
    if (!isSticky && isRight) {
      cardStyle.maxWidth = '380px';
      cardStyle.marginLeft = 'auto';
    } else if (!isSticky && isLeft) {
      cardStyle.maxWidth = '340px';
    }

    return (
      <article
        key={item.id}
        className={`news-card group ${isSticky ? 'news-sticky-item' : 'news-scroll-item'} ${isLandscape ? 'card-landscape' : 'card-portrait'} ${item.poster ? 'promotion-card' : ''}`}
        style={cardStyle}
        onClick={(e) => handleOpenStory(item, e.currentTarget)}
      >
        <div className={`news-frame ${isLandscape ? 'aspect-160/100' : 'aspect-300/400'}`}>
          <div className="news-inner">
            <Photo src={item.image} alt={item.title} />
          </div>
        </div>
        <div className="news-card-info">
          <div className="news-meta">
            <span className="news-date">{item.date}</span>
            <span className="news-cat">{item.category}</span>
          </div>
          <h3 className='gallery-title'><WordStagger>{item.title}</WordStagger></h3>
          <p>{item.summary}</p>
        </div>
      </article>
    );
  };

  return (
    <div className="spyker-news-page">
      {/* Centered Page Header matching spykercars.com/news */}
      <header className="news-page-header">
        <div className="news-header-inner">
          <p className="eyebrow">VISUAL ARCHIVES · QUEZON CITY</p>
          <h1 className="news-page-title">Gallery</h1>
          <p className="news-page-subtitle">Simulator bays, family rounds, and time together at Hole In Hub.</p>
        </div>

        {/* Filter Tabs matching spykercars.com/news */}
        <div className="news-filter-bar">
          <div className="news-filter-tabs" role="tablist" aria-label="Gallery categories">
            {categories.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  className={`news-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span>{cat}</span>
                  <span className="tab-underline" />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="news-content-container">
        {/* Section 1: Sticky Dual-Column Editorial Grid (437fr : 783fr) */}
        {section1Sticky && (
          <section className="news-editorial-section">
            <div className="news-editorial-grid">
              {/* Left Column: Sticky Featured Card */}
              <div className="news-sticky-col">
                {renderCard(section1Sticky, true)}
              </div>

              {/* Right Column: Scrolling Stack */}
              <div className="news-scroll-col news-scroll-grid">
                {section1Scroll.map(item => renderCard(item, false))}
              </div>
            </div>
          </section>
        )}

        {/* Section 2: Full-Bleed Featured Panoramic Banner (matching Spyker Basic Instinct 2 break) */}
        {featuredItem && (
          <section className="news-featured-banner-section">
            <article
              className="news-featured-banner group"
              onClick={(e) => handleOpenStory(featuredItem, e.currentTarget)}
            >
              <div className="featured-banner-frame">
                <div className="featured-banner-inner">
                  <Photo src={featuredItem.image} alt={featuredItem.title} />
                </div>
              </div>
              <div className="featured-banner-content">
                <div className="news-meta">
                  <span className="news-date">{featuredItem.date}</span>
                  <span className="news-cat">{featuredItem.category}</span>
                </div>
                <h3 className='gallery-title'><WordStagger>{featuredItem.title}</WordStagger></h3>
                <p>{featuredItem.summary}</p>
              </div>
            </article>
          </section>
        )}

        {/* Section 3: Second Sticky Dual-Column Editorial Grid */}
        {section2Sticky && (
          <section className="news-editorial-section">
            <div className="news-editorial-grid">
              {/* Left Column: Sticky Card */}
              <div className="news-sticky-col">
                {renderCard(section2Sticky, true)}
              </div>

              {/* Right Column: Scrolling Stack */}
              <div className="news-scroll-col news-scroll-grid">
                {section2Scroll.map(item => renderCard(item, false))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Story Lightbox / Reader Modal - Portaled to document.body to avoid ScrollSmoother container transform clipping */}
      {selectedStory && typeof document !== 'undefined' && createPortal(
        <StoryModal
          story={selectedStory}
          originRect={originRect}
          originElementRef={originElementRef}
          onClose={() => setSelectedStory(null)}
        />,
        document.body
      )}
    </div>
  );
}

function StoryModal({ story, originRect, originElementRef, onClose }) {
  const backdropRef = useRef(null);
  const modalRef = useRef(null);
  const mediaRef = useRef(null);
  const contentRef = useRef(null);
  const closeBtnRef = useRef(null);
  const morphRef = useRef(null);
  const isClosingRef = useRef(false);

  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    let currentOrigin = originRect;
    if (originElementRef?.current) {
      const r = originElementRef.current.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        currentOrigin = { top: r.top, left: r.left, width: r.width, height: r.height };
      }
    }

    const currentTarget = mediaRef.current?.getBoundingClientRect();

    if (!currentOrigin || !currentTarget || !morphRef.current) {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          if (originElementRef?.current) {
            originElementRef.current.style.opacity = '1';
          }
          onClose();
        }
      });
      return;
    }

    // Set morph proxy to current modal media rect and hide static media
    gsap.set(morphRef.current, {
      display: 'block',
      opacity: 1,
      top: currentTarget.top,
      left: currentTarget.left,
      width: currentTarget.width,
      height: currentTarget.height,
    });
    gsap.set(mediaRef.current, { opacity: 0 });

    // Dismiss modal content and frame smoothly
    gsap.to([contentRef.current, closeBtnRef.current], {
      opacity: 0,
      y: 10,
      duration: 0.18,
      ease: 'power2.in',
    });
    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
    });

    // Morph proxy flies back to thumbnail origin
    gsap.to(morphRef.current, {
      top: currentOrigin.top,
      left: currentOrigin.left,
      width: currentOrigin.width,
      height: currentOrigin.height,
      duration: 0.46,
      ease: 'power3.inOut',
    });

    // Backdrop fades out
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.46,
      ease: 'power2.inOut',
      onComplete: () => {
        if (originElementRef?.current) {
          originElementRef.current.style.opacity = '1';
        }
        onClose();
      }
    });
  };

  useEffect(() => {
    // Dim the clicked card thumbnail so it feels like the image literally lifted off
    if (originElementRef?.current) {
      originElementRef.current.style.transition = 'opacity 0.25s ease';
      originElementRef.current.style.opacity = '0.15';
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Entrance animation
    const targetRect = mediaRef.current?.getBoundingClientRect();

    if (originRect && targetRect && morphRef.current) {
      // Set initial states
      gsap.set(morphRef.current, {
        top: originRect.top,
        left: originRect.left,
        width: originRect.width,
        height: originRect.height,
        opacity: 1,
        display: 'block',
      });
      gsap.set(mediaRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { opacity: 0 });
      gsap.set(contentRef.current, { opacity: 0, y: 22 });
      gsap.set(closeBtnRef.current, { opacity: 0, scale: 0.75 });
      gsap.set(backdropRef.current, { opacity: 0 });

      // Animate backdrop
      gsap.to(backdropRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      });

      // Animate morph image from originRect to targetRect
      gsap.to(morphRef.current, {
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
        duration: 0.52,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(mediaRef.current, { opacity: 1 });
          gsap.set(morphRef.current, { opacity: 0, display: 'none' });
        }
      });

      // Reveal modal container and content as the image lands
      gsap.to(modalRef.current, {
        opacity: 1,
        duration: 0.28,
        ease: 'power2.out',
        delay: 0.26,
      });

      gsap.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.38,
        ease: 'power2.out',
        delay: 0.30,
      });

      gsap.to(closeBtnRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.28,
        ease: 'back.out(1.5)',
        delay: 0.36,
      });
    } else {
      // Fallback if no originRect
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.94, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (originElementRef?.current) {
        originElementRef.current.style.opacity = '1';
      }
    };
  }, []);

  return (
    <>
      {/* Morphing image proxy */}
      <div ref={morphRef} className="news-modal-morph-img" style={{ display: 'none' }}>
        <img src={story.image} alt={story.title} />
      </div>

      <div
        ref={backdropRef}
        className="news-modal-backdrop"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
      >
        <div ref={modalRef} className="news-modal" onClick={e => e.stopPropagation()}>
          <button
            ref={closeBtnRef}
            type="button"
            className="news-modal-close"
            onClick={handleClose}
            aria-label="Close story"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div ref={mediaRef} className={`news-modal-media ${story.poster ? 'promotion-media' : ''}`}>
            {story.video ? (
              <video controls autoPlay muted playsInline preload="auto" poster={mediaImages[story.image]?.src || story.image} aria-label={story.title}>
                <source src={story.video.replace(/\.mp4$/, '.webm')} type="video/webm" />
                <source src={story.video} type="video/mp4" />
                <a href={story.video}>Watch {story.title}</a>
              </video>
            ) : <Photo src={story.image} alt={story.title} />}
          </div>
          <div ref={contentRef} className="news-modal-content">
            <div className="news-meta">
              <span className="news-date">{story.date}</span>
              <span className="news-cat">{story.category}</span>
            </div>
            <h2>{story.title}</h2>
            <p className="news-modal-lead">{story.summary}</p>
            <p>{story.body}</p>
            <div className="news-modal-footer">
              <span>Hole In Hub Golf &amp; Lounge · Quezon City</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


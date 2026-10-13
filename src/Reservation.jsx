import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Arrow, LeftArrow, Photo, Button, ButtonLabel } from './ui';
import {
  resources,
  hours,
  today,
  addDays,
  available,
  saveBooking,
  validate,
  readBookings,
  storageKey,
  start,
  getDurationSlots,
  FULLY_BOOKED_SAMPLE_DAY
} from './booking';

const steps = ['Experience', 'Date & time', 'Select bays', 'Contact details', 'Review'];
const emptyCustomer = { first: '', last: '', email: '', phone: '', attendees: 1, person: '' };

const initial = () => ({
  service: 'Regular service',
  date: addDays(today(), 1),
  time: '09:00',
  duration: 1,
  resources: [],
  customer: { ...emptyCustomer }
});

const dateLabel = date =>
  new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${date}T12:00:00+08:00`));

function Summary({ booking, confirmation = false }) {
  return (
    <div className="summary">
      <p className="eyebrow">{confirmation ? 'RESERVATION CONFIRMED' : 'YOUR SELECTION'}</p>
      <h3>{booking.service}</h3>
      <dl>
        <div>
          <dt>Date</dt>
          <dd>{dateLabel(booking.date)}</dd>
        </div>
        <div>
          <dt>Start time</dt>
          <dd>{booking.time} · Asia/Manila</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{booking.duration} {Number(booking.duration) === 1 ? 'hour' : 'hours'}</dd>
        </div>
        <div>
          <dt>Bays</dt>
          <dd>{booking.resources.length ? booking.resources.join(', ') : 'Choose your spaces'}</dd>
        </div>
        <div>
          <dt>Players</dt>
          <dd>{booking.customer.attendees}</dd>
        </div>
        {booking.customer.first && (
          <div>
            <dt>Guest</dt>
            <dd>{booking.customer.first} {booking.customer.last}</dd>
          </div>
        )}
        {booking.customer.email && (
          <div>
            <dt>Email</dt>
            <dd>{booking.customer.email}</dd>
          </div>
        )}
        {booking.customer.phone && (
          <div>
            <dt>Phone</dt>
            <dd>{booking.customer.phone}</dd>
          </div>
        )}
        {booking.status && (
          <div>
            <dt>Status</dt>
            <dd>{booking.status}</dd>
          </div>
        )}
      </dl>
      <p className="small">Quezon City, Philippines · Confirmation details will be stored securely on your device.</p>
    </div>
  );
}

export default function Reservation() {
  const [list, setList] = useState(readBookings);
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(() => {
    if (location.state?.editBooking) {
      const b = location.state.editBooking;
      return { ...b, customer: { ...b.customer } };
    }
    return initial();
  });

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [editId, setEditId] = useState(() => location.state?.editBooking?.id || null);
  const [confirmed, setConfirmed] = useState(null);
  const [busy, setBusy] = useState(false);
  const stepHeading = useRef();
  const saving = useRef(false);

  useEffect(() => {
    const sync = e => {
      if (e.key === storageKey) setList(readBookings());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function persist(next) {
    localStorage.setItem(storageKey, JSON.stringify(next));
    setList(next);
  }

  function update(key, value) {
    setBooking(b => ({ ...b, [key]: value }));
    setError('');
  }

  function updateCustomer(field, value) {
    setBooking(b => {
      const nextCustomer = { ...b.customer, [field]: value };
      if (field === 'first' || field === 'last') {
        nextCustomer.person = `${nextCustomer.first} ${nextCustomer.last}`.trim();
      }
      return { ...b, customer: nextCustomer };
    });
    // Inline real-time validation
    validateField(field, value);
    setError('');
  }

  function validateField(field, value) {
    let err = '';
    if (field === 'first' && !value.trim()) err = 'First name is required.';
    if (field === 'last' && !value.trim()) err = 'Last name is required.';
    if (field === 'email') {
      if (!value.trim()) err = 'Email address is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = 'Please enter a valid email address.';
    }
    if (field === 'phone') {
      if (!value.trim()) err = 'Phone number is required.';
      else if (!/^[+\d ()-]{7,20}$/.test(value)) err = 'Please enter a valid contact number.';
    }
    if (field === 'attendees') {
      const n = Number(value);
      if (!n || n < 1 || n > 20) err = 'Number of players must be between 1 and 20.';
    }
    setFieldErrors(prev => ({ ...prev, [field]: err }));
    return err;
  }

  function validateContactStep() {
    const errs = {
      first: validateField('first', booking.customer.first),
      last: validateField('last', booking.customer.last),
      email: validateField('email', booking.customer.email),
      phone: validateField('phone', booking.customer.phone),
      attendees: validateField('attendees', booking.customer.attendees)
    };
    const hasError = Object.values(errs).some(Boolean);
    return !hasError;
  }

  function next() {
    let message = '';
    if (step === 1) {
      if (start(booking) <= Date.now()) {
        message = 'Please choose a future date and start time.';
      } else if (Number(booking.time.slice(0, 2)) + Number(booking.duration) > 21) {
        message = 'Reservations must conclude by 21:00 operating hours.';
      }
    } else if (step === 2) {
      if (!booking.resources.length) {
        message = 'Please select at least one simulator bay.';
      } else if (booking.resources.some(r => !available(list, booking, r, editId))) {
        message = 'One of your selected bays is unavailable at this time. Please choose another.';
      }
    } else if (step === 3) {
      if (!validateContactStep()) {
        message = 'Please complete all required contact fields correctly.';
      }
    }

    if (message) {
      setError(message);
      return;
    }
    setError('');
    setStep(s => Math.min(steps.length - 1, s + 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  useEffect(() => {
    stepHeading.current?.focus({ preventScroll: true });
  }, [step, confirmed]);

  function confirm() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError('');
    try {
      const latest = readBookings();
      const saved = {
        ...booking,
        id: editId || `HIH-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        status: editId ? latest.find(b => b.id === editId)?.status || 'Confirmed' : 'Confirmed'
      };
      const nextList = saveBooking(latest, saved, editId);
      persist(nextList);
      try {
        localStorage.setItem('hub-customer-email', booking.customer.email);
      } catch {}
      setConfirmed(saved);
      setEditId(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      saving.current = false;
    }
  }

  const noResources = resources.every(r => !available(list, booking, r, editId));

  return (
    <div className="reservation-page">
      {!confirmed && (
        <div className="reservation-title">
          <h1>MAKE A RESERVATION</h1>
          <p>Book your simulator bay for an unmatched indoor golf experience.</p>
        </div>
      )}

      {confirmed ? (
        <div className="confirmation">
          <p className="eyebrow">RESERVATION CONFIRMED</p>
          <h2 ref={stepHeading} tabIndex="-1">YOUR ROUND IS CONFIRMED.</h2>
          <p>We look forward to hosting you at Hole In Hub Golf & Lounge.</p>
          <p className="reference">{confirmed.id}</p>
          <Summary booking={confirmed} confirmation />

          <div className="actions" style={{ marginTop: '40px', justifyContent: 'center' }}>
            <Button
              className="button"
              onClick={() => {
                setConfirmed(null);
                setBooking(initial());
                setStep(0);
              }}
            >
              <ButtonLabel>BOOK ANOTHER BAY</ButtonLabel>
              <Arrow />
            </Button>
            <Button as={Link} to="/my-reservations" className="button outline">
              <ButtonLabel>VIEW MY RESERVATIONS</ButtonLabel>
              <Arrow />
            </Button>
          </div>
        </div>
      ) : (
        <div className="booking-layout">
          <div className="booking-main">
            {/* Step indicator tabs */}
            <div className="step-line" role="tablist" aria-label="Booking steps">
              {steps.map((s, i) => (
                <button
                  type="button"
                  key={s}
                  role="tab"
                  aria-selected={i === step}
                  disabled={i > step}
                  className={`step-tab ${i === step ? 'current' : i < step ? 'complete' : 'disabled'}`}
                  onClick={() => i < step && setStep(i)}
                >
                  <span className="step-tab-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="step-tab-name">{s}</span>
                </button>
              ))}
            </div>

            <div className="step-content">
              <p className="small">STEP {step + 1} OF 5{editId ? ` · RESCHEDULING ${editId}` : ''}</p>
              <h2 ref={stepHeading} tabIndex="-1">
                {[
                  'SELECT YOUR EXPERIENCE',
                  'CHOOSE DATE & TIME',
                  'SELECT YOUR BAYS',
                  'YOUR DETAILS',
                  'REVIEW & CONFIRM'
                ][step]}
              </h2>

              {/* STEP 0: EXPERIENCE */}
              {step === 0 && (
                <>
                  <p>Choose the format of your upcoming golf session.</p>
                  <div className="service-options">
                    {[
                      ['Regular service', 'Standard simulator bay session for practice or casual play with companions.'],
                      ['Package', 'Extended round package with premium lounge access and refreshments.'],
                      ['Promotional offer', 'Seasonal rates and introductory privileges.'],
                      ['Group booking', 'Reserve multiple adjacent bays for parties, tournaments, or team gatherings.']
                    ].map(([name, copy], i) => (
                      <button
                        type="button"
                        key={name}
                        className={booking.service === name ? 'selected' : ''}
                        aria-pressed={booking.service === name}
                        onClick={() => update('service', name)}
                      >
                        <span>0{i + 1}</span>
                        <div>
                          <strong>{name}</strong>
                          <p>{copy}</p>
                        </div>
                        <span className="radio" />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 1: DATE & TIME */}
              {step === 1 && (
                <>
                  <div className="fields-grid">
                    <label className="field">
                      <span>Date *</span>
                      <div className="field-input-wrap">
                        <input
                          type="date"
                          min={today()}
                          value={booking.date}
                          onChange={e => e.target.value && update('date', e.target.value)}
                        />
                      </div>
                    </label>
                    <label className="field">
                      <span>Start time *</span>
                      <div className="field-input-wrap">
                        <select value={booking.time} onChange={e => update('time', e.target.value)}>
                          {getDurationSlots(booking.duration).map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </label>
                    <label className="field">
                      <span>Duration *</span>
                      <div className="field-input-wrap">
                        <select
                          value={booking.duration}
                          onChange={e => {
                            const newDuration = Number(e.target.value);
                            const validSlots = getDurationSlots(newDuration);
                            const nextTime = validSlots.includes(booking.time) ? booking.time : (validSlots[0] || '09:00');
                            setBooking(b => ({ ...b, duration: newDuration, time: nextTime }));
                            setError('');
                          }}
                        >
                          {[1, 2, 3, 4].map(n => (
                            <option value={n} key={n}>
                              {n} {n === 1 ? 'hour' : 'hours'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                  </div>

                  <p className="eyebrow" style={{ marginTop: '24px' }}>QUICK SELECT DAY</p>
                  <div className="date-strip">
                    {Array.from({ length: 7 }, (_, i) => addDays(today(), i)).map(d => {
                      const isFullyBooked = d === FULLY_BOOKED_SAMPLE_DAY;
                      return (
                        <button
                          type="button"
                          key={d}
                          aria-pressed={d === booking.date}
                          className={`${d === booking.date ? 'selected' : ''} ${isFullyBooked ? 'fully-booked-day' : ''}`}
                          onClick={() => update('date', d)}
                        >
                          <span>
                            {new Date(`${d}T12:00:00+08:00`).toLocaleDateString('en-PH', {
                              weekday: 'short',
                              timeZone: 'Asia/Manila'
                            })}
                          </span>
                          <strong>{d.slice(-2)}</strong>
                        </button>
                      );
                    })}
                  </div>

                  <p className="eyebrow" style={{ marginTop: '24px' }}>
                    AVAILABLE TIME SLOTS ({booking.duration === 1 ? '1 HR INTERVALS' : `${booking.duration} HR INTERVALS`})
                  </p>
                  <div className="calendar-slots">
                    {getDurationSlots(booking.duration).map(time => {
                      const b = { ...booking, date: booking.date, time };
                      const durationFits = Number(time.slice(0, 2)) + Number(booking.duration) <= 21;
                      const free = durationFits && resources.some(r => available(list, b, r, editId));
                      const isPast = start(b) <= Date.now();
                      const disabled = !free || isPast;
                      const endHour = Number(time.slice(0, 2)) + Number(booking.duration);
                      const endStr = `${String(endHour).padStart(2, '0')}:00`;

                      return (
                        <button
                          type="button"
                          key={time}
                          className={time === booking.time ? 'selected' : ''}
                          disabled={disabled}
                          onClick={() => update('time', time)}
                          aria-label={`${time} to ${endStr} ${free ? 'available' : 'unavailable'}`}
                        >
                          <strong>{time}</strong>
                          <small>{isPast ? 'Past' : free ? `Until ${endStr}` : 'Booked'}</small>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* STEP 2: BAYS */}
              {step === 2 && (
                <>
                  <p>Choose one or multiple bays for your round. Multiple bays are reserved together.</p>
                  {noResources && (
                    <p className="error" role="status">
                      No simulator bays are available for the selected slot. Please go back and choose another time.
                    </p>
                  )}
                  <div className="resource-options">
                    {resources.map((r, i) => {
                      const free = available(list, booking, r, editId);
                      const isSelected = booking.resources.includes(r);
                      return (
                        <button
                          type="button"
                          key={r}
                          disabled={!free && !isSelected}
                          className={isSelected ? 'selected' : ''}
                          aria-pressed={isSelected}
                          onClick={() =>
                            update(
                              'resources',
                              isSelected
                                ? booking.resources.filter(x => x !== r)
                                : [...booking.resources, r]
                            )
                          }
                        >
                          <span className="bay-number">{i < 6 ? `0${i + 1}` : 'PL'}</span>
                          <strong>{r}</strong>
                          <small>{free ? 'Available for duration' : 'Unavailable'}</small>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* STEP 3: CONTACT DETAILS */}
              {step === 3 && (
                <>
                  <p>Please enter your contact information for reservation confirmation.</p>
                  <div className="fields-grid">
                    <label className="field">
                      <span>First name *</span>
                      <div className="field-input-wrap">
                        <input
                          type="text"
                          placeholder="e.g. Maria"
                          value={booking.customer.first}
                          onChange={e => updateCustomer('first', e.target.value)}
                          onBlur={e => validateField('first', e.target.value)}
                          aria-invalid={!!fieldErrors.first}
                        />
                      </div>
                      {fieldErrors.first && <span className="inline-error">{fieldErrors.first}</span>}
                    </label>

                    <label className="field">
                      <span>Last name *</span>
                      <div className="field-input-wrap">
                        <input
                          type="text"
                          placeholder="e.g. Santos"
                          value={booking.customer.last}
                          onChange={e => updateCustomer('last', e.target.value)}
                          onBlur={e => validateField('last', e.target.value)}
                          aria-invalid={!!fieldErrors.last}
                        />
                      </div>
                      {fieldErrors.last && <span className="inline-error">{fieldErrors.last}</span>}
                    </label>

                    <label className="field">
                      <span>Email address *</span>
                      <div className="field-input-wrap">
                        <input
                          type="email"
                          placeholder="e.g. maria.santos@example.com"
                          value={booking.customer.email}
                          onChange={e => updateCustomer('email', e.target.value)}
                          onBlur={e => validateField('email', e.target.value)}
                          aria-invalid={!!fieldErrors.email}
                        />
                      </div>
                      {fieldErrors.email && <span className="inline-error">{fieldErrors.email}</span>}
                    </label>

                    <label className="field">
                      <span>Mobile number *</span>
                      <div className="field-input-wrap">
                        <input
                          type="tel"
                          placeholder="e.g. +63 917 123 4567"
                          value={booking.customer.phone}
                          onChange={e => updateCustomer('phone', e.target.value)}
                          onBlur={e => validateField('phone', e.target.value)}
                          aria-invalid={!!fieldErrors.phone}
                        />
                      </div>
                      {fieldErrors.phone && <span className="inline-error">{fieldErrors.phone}</span>}
                    </label>

                    <label className="field">
                      <span>Number of players *</span>
                      <div className="field-input-wrap">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={booking.customer.attendees}
                          onChange={e => updateCustomer('attendees', e.target.value)}
                          onBlur={e => validateField('attendees', e.target.value)}
                          aria-invalid={!!fieldErrors.attendees}
                        />
                      </div>
                      {fieldErrors.attendees && <span className="inline-error">{fieldErrors.attendees}</span>}
                    </label>
                  </div>
                </>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {step === 4 && (
                <div className="review-editorial-container">
                  <div className="review-booking-summary">
                    <Summary booking={booking} />
                  </div>

                  <div className="review-editorial-header">
                    <p className="eyebrow">PRE-ROUND BRIEFING &amp; PRIVILEGES</p>
                    <h3>CHAMPIONSHIP INDOOR GOLF STANDARDS</h3>
                    <p className="review-editorial-lead">
                      Your simulator suite is reserved exclusively for your party. Below are the clubhouse amenities, arrival guidelines, and session inclusions prepared for your round.
                    </p>
                  </div>

                  <div className="review-amenities-grid">
                    <div className="review-amenity-card">
                      <div className="review-card-icon">01</div>
                      <h4>Tour-Grade Telemetry</h4>
                      <p>Dual ultra-high-speed optical sensors capture 2,000 frames per second at impact. Track clubhead speed, launch angle, spin rate, and carry distance on 100+ championship courses worldwide.</p>
                    </div>

                    <div className="review-amenity-card">
                      <div className="review-card-icon">02</div>
                      <h4>Equipment &amp; Club Valet</h4>
                      <p>Feel free to bring your own golf bag or enjoy complimentary access to our current-season Titleist, Callaway, and TaylorMade rental sets. Titleist Pro V1 practice balls provided.</p>
                    </div>

                    <div className="review-amenity-card">
                      <div className="review-card-icon">03</div>
                      <h4>Arrival &amp; Check-In Protocol</h4>
                      <p>Please arrive 15 minutes prior to your scheduled tee time. Present your digital reservation code at our concierge desk for complimentary locker assignment and suite escort.</p>
                    </div>

                    <div className="review-amenity-card">
                      <div className="review-card-icon">04</div>
                      <h4>In-Bay Dining &amp; Lounge</h4>
                      <p>Dedicated suite host service with digital ordering for artisanal pour overs, craft cocktails, curated single malts, and gourmet clubhouse dining delivered directly to your bay.</p>
                    </div>
                  </div>

                  <div className="review-policy-banner">
                    <div className="review-policy-item">
                      <strong>Flexible Rescheduling</strong>
                      <span>Complimentary changes up to 6 hours before tee time</span>
                    </div>
                    <div className="review-policy-item">
                      <strong>Dress Protocol</strong>
                      <span>Clean athletic sneakers or soft-spike golf shoes</span>
                    </div>
                    <div className="review-policy-item">
                      <strong>Digital Scorecard</strong>
                      <span>Ball telemetry &amp; video swings saved to your profile</span>
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="error" role="alert">{error}</p>}

              <div className="actions">
                <div className="actions-left">
                  {step > 0 && (
                    <Button
                      type="button"
                      className="button outline"
                      onClick={() => {
                        setError('');
                        setStep(s => s - 1);
                      }}
                    >
                      <LeftArrow />
                      <ButtonLabel>BACK</ButtonLabel>
                    </Button>
                  )}
                  {editId && (
                    <Button
                      type="button"
                      className="button outline"
                      onClick={() => {
                        setEditId(null);
                        setBooking(initial());
                        setStep(0);
                        navigate('/my-reservations');
                      }}
                    >
                      <ButtonLabel>DISCARD CHANGES</ButtonLabel>
                    </Button>
                  )}
                </div>

                <div className="actions-right">
                  <Button
                    className="button"
                    disabled={busy}
                    onClick={step === steps.length - 1 ? confirm : next}
                  >
                    <ButtonLabel>
                      {busy
                        ? 'CONFIRMING…'
                        : step === steps.length - 1
                        ? editId
                          ? 'SAVE RESCHEDULE'
                          : 'CONFIRM RESERVATION'
                        : 'CONTINUE'}
                    </ButtonLabel>
                    <Arrow />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <aside className="booking-sidebar">
            <div className="sidebar-sticky">
              <Photo className={booking.service === 'Promotional offer' ? 'service-promo-image' : ''} src={`/media/facebook/${{
                'Regular service': 'venue-overview.png',
                'Package': 'social-seating.png',
                'Promotional offer': 'october-daytime-promo.png',
                'Group booking': 'family-play.png'
              }[booking.service] || 'venue-overview.png'}`} alt={`${booking.service} at Hole In Hub`} />
              <Summary booking={booking} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

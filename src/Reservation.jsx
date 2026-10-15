import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Arrow, LeftArrow, Photo, Button, ButtonLabel } from './ui';
import {
  resources,
  today,
  addDays,
  available,
  saveBooking,
  readBookings,
  storageKey,
  formatTime,
  money,
  bookingLabel,
  serviceDayAllowed,
  serviceResources,
  sessionOptions,
  scheduleError,
  quoteBooking,
  selectHour
} from './booking';

import { services } from './services';
import { monthDays, shiftMonth } from './calendar';
import { hourRange, paintSelection } from './dragSelection';

const steps = ['Experience', 'Date & time', 'Select bays', 'Contact details', 'Review'];
const emptyCustomer = { first: '', last: '', email: '', phone: '', attendees: 1, person: '' };

const initial = () => ({
  service: 'Regular service',
  date: addDays(today(), 1),
  time: '',
  duration: 0,
  rental: '',
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

function Price({ booking, saved = false }) {
  const price = saved ? booking.price : quoteBooking(booking);
  if (!price) return <p className="small">Select hours to see the total.</p>;
  const packageBooking = booking.service.startsWith('KPGA');
  return <section className="booking-price" aria-label="Price breakdown">
    <div className="price-total" role="status" aria-live="polite">
      <span>{packageBooking ? 'Package total' : 'Total'}</span><strong>{money(price.total)}</strong>
    </div>
    {price.holiday && <p className="small">Holiday rates apply on this date.</p>}
    {booking.service === 'Regular service' && !booking.resources.length && <p className="small">One bay shown. Bay selection updates the total.</p>}
    {packageBooking && <p className="small">{booking.service === 'KPGA group lessons' ? 'Per participant, 4 classes. First class booked here; arrange remaining classes with the venue.' : '8-session package. First visit booked here; confirm session length and remaining visits with the coach.'}</p>}
  </section>;
}

function Summary({ booking, confirmation = false, showPrice = true }) {
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
          <dd>{booking.time ? `${formatTime(Number(booking.time.slice(0, 2)))}–${formatTime(Number(booking.time.slice(0, 2)) + Number(booking.duration))}` : 'Choose hours'} · Asia/Manila</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{booking.rental ? `${booking.rental === 'half' ? 'Half day' : 'Whole day'} · ` : ''}{booking.duration || 0} {Number(booking.duration) === 1 ? 'hour' : 'hours'}</dd>
        </div>
        <div>
          <dt>Bays</dt>
          <dd>{booking.resources.length ? booking.resources.map(bookingLabel).join(', ') : 'Choose your spaces'}</dd>
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
      {showPrice && <Price booking={booking} saved={confirmation} />}
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

  const [month, setMonth] = useState(() => booking.date.slice(0, 7));
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [editId, setEditId] = useState(() => location.state?.editBooking?.id || null);
  const [confirmed, setConfirmed] = useState(null);
  const [busy, setBusy] = useState(false);
  const stepHeading = useRef();
  const saving = useRef(false);
  const drag = useRef(null);

  useEffect(() => {
    const finish = () => { if (drag.current) drag.current.active = false; };
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    window.addEventListener('blur', finish);
    return () => {
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      window.removeEventListener('blur', finish);
    };
  }, []);

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
    const next = { ...booking, [key]: value };
    if (key === 'service' || key === 'date') {
      next.time = '';
      next.duration = 0;
      next.rental = '';
      next.resources = [];
    }
    if (key === 'service') {
      if (next.date < today()) next.date = today();
      while (!serviceDayAllowed(value, next.date)) next.date = addDays(next.date, 1);
      setMonth(next.date.slice(0, 7));
    }
    setBooking(next);
    if (key === 'date') setMonth(value.slice(0, 7));
    setError('');
  }

  function slotFree(candidate) {
    if (scheduleError(candidate)) return false;
    const spaces = serviceResources(candidate.service);
    return candidate.service === 'Whole venue rental'
      ? spaces.every(r => available(list, candidate, r, editId))
      : spaces.some(r => available(list, candidate, r, editId));
  }

  function chooseSlot(option) {
    try {
      const fixed = booking.service === 'Whole venue rental' || booking.service === 'KPGA group lessons';
      const next = fixed ? { ...booking, ...option, resources: booking.service === 'Whole venue rental' ? [...resources] : [] } : selectHour(booking, option.time);
      if (next.duration && !slotFree(next)) throw new Error('No space is free for the full selection. Choose another range.');
      setBooking(next);
      setError('');
    } catch (err) { setError(err.message); }
  }

  function startDrag(event, kind, value) {
    drag.current = null;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if (kind === 'time' && ['Whole venue rental', 'KPGA group lessons'].includes(booking.service)) return;
    drag.current = { active: true, kind, anchor: value, moved: false, booking,
      crossed: [value], remove: booking.resources.includes(value) };
  }

  function extendDrag(event, kind, value) {
    const gesture = drag.current;
    if (!gesture?.active || gesture.kind !== kind || !(event.buttons & 1)) return;
    if (!gesture.moved && value === gesture.anchor) return;
    gesture.moved = true;
    if (kind === 'time') {
      const next = { ...gesture.booking, ...hourRange(gesture.anchor, value), resources: [] };
      if (!slotFree(next)) {
        setError('That range includes unavailable hours. Choose another range.');
        return;
      }
      setBooking(next);
    } else {
      if (!gesture.crossed.includes(value)) gesture.crossed.push(value);
      setBooking(b => ({ ...b, resources: paintSelection(gesture.booking.resources, gesture.crossed, gesture.remove) }));
    }
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
      const max = booking.service === 'KPGA group lessons' ? 8 : 20;
      if (!Number.isInteger(n) || n < 1 || n > max) err = `Number of players must be a whole number between 1 and ${max}.`;
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
      message = scheduleError(booking);
      if (!message && !slotFree(booking)) message = 'No spaces available. Choose another time.';
    } else if (step === 2) {
      if (!booking.resources.length) {
        message = 'Select at least one bay.';
      } else if (booking.resources.some(r => !available(list, booking, r, editId))) {
        message = 'A selected bay is unavailable. Choose another.';
      }
    } else if (step === 3) {
      if (!validateContactStep()) {
        message = 'Check the highlighted fields.';
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
      setConfirmed(nextList.find(b => b.id === saved.id));
      setEditId(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      saving.current = false;
    }
  }

  const noResources = serviceResources(booking.service).every(r => !available(list, booking, r, editId));

  return (
    <div className="reservation-page">
      {!confirmed && (
        <div className="reservation-title">
          <h1>MAKE A RESERVATION</h1>
          <p>Reserve a bay, lesson or venue.</p>
        </div>
      )}

      {confirmed ? (
        <div className="confirmation">
          <p className="eyebrow">RESERVATION CONFIRMED</p>
          <h2 >YOUR ROUND IS CONFIRMED.</h2>
          <p className="reference">{bookingLabel(confirmed.id)}</p>
          <Summary booking={confirmed} confirmation />

          <div className="actions" style={{ marginTop: '40px', justifyContent: 'center' }}>
            <Button
              className="button"
              onClick={() => {
                setConfirmed(null);
                const fresh = initial();
                setBooking(fresh);
                setMonth(fresh.date.slice(0, 7));
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
              <p className="small">STEP {step + 1} OF 5{editId ? ` · RESCHEDULING ${bookingLabel(editId)}` : ''}</p>
              <h2>
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
                  <div className="service-options">
                    {services.map(({ name, title, rate, copy, image, alt, poster }) => (
                      <button
                        type="button"
                        key={name}
                        className={booking.service === name ? 'selected' : ''}
                        aria-pressed={booking.service === name}
                        onClick={() => update('service', name)}
                      >
                        <Photo className={`service-thumbnail ${poster ? 'poster' : ''}`} src={`/media/facebook/${image}`} alt={alt} />
                        <div>
                          <strong>{title}</strong>
                          <span className="service-rate">{rate}</span>
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

                  <section className="month-calendar" aria-label="Choose a reservation date">
                    <div className="calendar-heading">
                      <button type="button" aria-label="Previous month" disabled={month <= today().slice(0, 7)} onClick={() => setMonth(shiftMonth(month, -1))}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
                      </button>
                      <h3 aria-live="polite">{new Date(`${month}-01T12:00:00+08:00`).toLocaleDateString('en-PH', { month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })}</h3>
                      <button type="button" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
                      </button>
                    </div>
                    <div className="month-grid">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span className="weekday" key={day}>{day}</span>)}
                      {monthDays(month).map((date, i) => {
                        if (!date) return <span key={`empty-${i}`} />;
                        const past = date < today();
                        const allowed = serviceDayAllowed(booking.service, date);
                        const hasSlots = !past && allowed && sessionOptions({ ...booking, date }).some(option => slotFree({ ...booking, date, ...option }));
                        return <button type="button" key={date} disabled={!hasSlots}
                          className={date === booking.date && hasSlots ? 'selected' : ''}
                          aria-pressed={date === booking.date && hasSlots}
                          aria-current={date === today() ? 'date' : undefined}
                          aria-label={`${dateLabel(date)}${past ? ', past' : !allowed ? ', no service' : hasSlots ? ', available' : ', fully booked'}`}
                          onClick={() => update('date', date)}
                          >
                          {Number(date.slice(-2))}
                          <span className="calendar-day-status">{past ? 'Past' : !allowed ? 'Off' : hasSlots ? '' : 'Full'}</span>
                        </button>;
                      })}
                    </div>

                  </section>

                  <div className="time-selection-heading">
                    <h3>{booking.service === 'Whole venue rental' ? 'CHOOSE YOUR RENTAL' : booking.service === 'KPGA group lessons' ? 'YOUR CLASS TIME' : 'CHOOSE YOUR HOURS'}</h3>
                    {booking.duration > 0 && <button type="button" className="text-button" onClick={() => {
                      setBooking(b => ({ ...b, time: '', duration: 0, rental: '', resources: [] }));
                      setError('');
                    }}>Clear selection</button>}
                  </div>
                  {!['Whole venue rental', 'KPGA group lessons'].includes(booking.service) && <p className="small">Select consecutive hours. Add or remove an end hour, or clear to start again.</p>}
                  <div className={`calendar-slots ${booking.service === 'Whole venue rental' ? 'rental-options' : ''}`}>
                    {sessionOptions(booking).map(option => {
                      const candidate = { ...booking, ...option };
                      const free = slotFree(candidate);
                      const hour = Number(option.time.slice(0, 2));
                      const first = Number(booking.time.slice(0, 2));
                      const selected = booking.service === 'Whole venue rental' ? booking.rental === option.rental : booking.duration > 0 && hour >= first && hour < first + booking.duration;
                      const price = quoteBooking(candidate);
                      const label = option.rental ? (option.rental === 'half' ? 'Half day' : 'Whole day') : `${formatTime(hour)}–${formatTime(hour + option.duration)}`;
                      return <button type="button" key={option.rental || option.time}
                        className={selected && free ? 'selected' : ''}
                        disabled={!free} aria-pressed={selected && free}
                        aria-label={`${label}${price ? `, ${money(price.total)}` : ''}${free ? '' : ', unavailable'}`}
                        onPointerDown={event => startDrag(event, 'time', option.time)}
                        onPointerEnter={event => extendDrag(event, 'time', option.time)}
                        onClick={event => { if (!event.detail || !drag.current?.moved) chooseSlot(option); }}>
                        <strong>{label}</strong>
                        {option.rental && <span>{formatTime(hour)}–{formatTime(hour + option.duration)}</span>}
                        <small>{!free ? 'Unavailable' : selected ? 'Selected' : price ? `${money(price.total)}${booking.service.startsWith('KPGA') ? ' / package' : ''}` : 'Available'}</small>
                      </button>;
                    })}
                  </div>
                  {!sessionOptions(booking).length && <p className="notice" role="status">No service on this date. Choose another day.</p>}
                </>
              )}

              {/* STEP 2: BAYS */}
              {step === 2 && (
                <>
                  {noResources && (
                    <p className="error" role="status">
                      No bays available. Choose another time.
                    </p>
                  )}
                  <div className="resource-options">
                    {serviceResources(booking.service).map(r => {
                      const free = available(list, booking, r, editId);
                      const isSelected = booking.resources.includes(r);
                      return (
                        <button
                          type="button"
                          key={r}
                          disabled={booking.service === 'Whole venue rental' || (!free && !isSelected)}
                          className={isSelected ? 'selected' : ''}
                          aria-pressed={isSelected}
                          onPointerDown={event => startDrag(event, 'bay', r)}
                          onPointerEnter={event => { if (free && booking.service !== 'Whole venue rental') extendDrag(event, 'bay', r); }}
                          onClick={event => {
                            if (event.detail && drag.current?.moved) return;
                            update(
                              'resources',
                              isSelected
                                ? booking.resources.filter(x => x !== r)
                                : [...booking.resources, r]
                            );
                          }}
                        >
                          <span className="bay-number">{r.startsWith('Bay') ? r.slice(-1).padStart(2, '0') : 'VIP'}</span>
                          <strong>{bookingLabel(r)}</strong>
                          <small>{booking.service === 'Whole venue rental' ? 'Included in rental' : free ? 'Available for duration' : 'Unavailable'}</small>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* STEP 3: CONTACT DETAILS */}
              {step === 3 && (
                <>
                  <p>Enter your contact details.</p>
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
                          max={booking.service === 'KPGA group lessons' ? 8 : 20}
                          value={booking.customer.attendees}
                          onChange={e => updateCustomer('attendees', e.target.value)}
                          onBlur={e => validateField('attendees', e.target.value)}
                          aria-invalid={!!fieldErrors.attendees}
                        />
                      </div>
                      {fieldErrors.attendees && <span className="inline-error">{fieldErrors.attendees}</span>}
                    </label>
                  </div>
                  {booking.service === 'KPGA group lessons' && <Price booking={booking} />}
                </>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {step === 4 && <Summary booking={booking} />}

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
              <Photo className={services.find(s => s.name === booking.service)?.poster ? 'service-promo-image' : ''}
                src={`/media/facebook/${services.find(s => s.name === booking.service)?.image || 'venue-overview.png'}`}
                alt={services.find(s => s.name === booking.service)?.alt || `${booking.service} at Hole In Hub`} />
              <Summary booking={booking} showPrice={step !== 2} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

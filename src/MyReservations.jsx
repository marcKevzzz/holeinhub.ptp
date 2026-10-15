import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Arrow, Button, ButtonLabel } from './ui';
import { readBookings, storageKey, money, formatTime, bookingLabel } from './booking';

const dateLabel = date =>
  new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${date}T12:00:00+08:00`));

export default function MyReservations() {
  const [list, setList] = useState(readBookings);
  const [query, setQuery] = useState(() => {
    try {
      return localStorage.getItem('hub-customer-email') || '';
    } catch {
      return '';
    }
  });
  const [cancelId, setCancelId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  function handleCancel(id) {
    try {
      const latest = readBookings();
      const nextList = latest.map(b => (b.id === id ? { ...b, status: 'Cancelled' } : b));
      persist(nextList);
      setMessage(`Reservation ${bookingLabel(id)} has been cancelled.`);
      setCancelId(null);
    } catch (err) {
      setMessage(err.message);
    }
  }

  const trimmedQuery = query.trim().toLowerCase();
  const filtered = list.filter(b => {
    if (!trimmedQuery) return true;
    const matchEmail = b.customer?.email?.toLowerCase().includes(trimmedQuery);
    const matchId = b.id?.toLowerCase().includes(trimmedQuery) || bookingLabel(b.id).toLowerCase().includes(trimmedQuery);
    const matchName = `${b.customer?.first || ''} ${b.customer?.last || ''}`.toLowerCase().includes(trimmedQuery);
    return matchEmail || matchId || matchName;
  });

  return (
    <div className="reservation-page my-reservations-page">
      <div className="reservation-title">
        <h1>MANAGE YOUR BOOKINGS</h1>
        <p>Review, edit or reschedule your upcoming rounds at Hole In Hub.</p>
      </div>

      <div className="lookup-bar">
        <div className="field lookup-field">
          <label htmlFor="lookup-input">Search by Email, Reference ID, or Name</label>
          <div className="field-input-wrap">
            <input
              id="lookup-input"
              type="text"
              placeholder="e.g. maria@example.com or HIH-101"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                try {
                  localStorage.setItem('hub-customer-email', e.target.value);
                } catch {}
              }}
            />
          </div>
        </div>
        <Button as={Link} to="/appointment" className="button">
          <ButtonLabel>BOOK A NEW BAY</ButtonLabel>
          <Arrow />
        </Button>
      </div>

      {message && <p role="status" className="notice">{message}</p>}

      <section className="history">
        {filtered.length === 0 ? (
          <div className="empty">
            <img className="empty-mascot" src="/media/brand/mascot-hq.webp" alt="" width="1280" height="1280" />
            <h3>No reservations found.</h3>
            <p>We could not find any active bookings matching your search query.</p>
            <div style={{ marginTop: '24px' }}>
              <Button as={Link} to="/appointment" className="button">
                <ButtonLabel>MAKE A RESERVATION</ButtonLabel>
                <Arrow />
              </Button>
            </div>
          </div>
        ) : (
          filtered.map(b => (
            <article className="history-row" key={b.id}>
              <div>
                <span className={`status-badge status-${(b.status || 'pending').toLowerCase()}`}>
                  {b.status || 'Confirmed'}
                </span>
                <h3>{bookingLabel(b.id)}</h3>
                <p>
                  <strong>{b.service || 'Simulator Session'}</strong><br />
                  {dateLabel(b.date)} · {formatTime(Number(b.time.slice(0, 2)))}–{formatTime(Number(b.time.slice(0, 2)) + Number(b.duration))} ({b.duration} {Number(b.duration) === 1 ? 'hour' : 'hours'})<br />
                  {b.rental && <>{b.rental === 'half' ? 'Half day' : 'Whole day'} rental<br /></>}
                  {b.price && <>Quoted total: {money(b.price.total)}<br /></>}
                  Reserved: {b.resources?.map(bookingLabel).join(', ') || 'Bay 1'}<br />
                  Guest: {b.customer?.first} {b.customer?.last} · {b.customer?.attendees || 1} {b.customer?.attendees === 1 ? 'player' : 'players'}
                </p>
                {b.price && <details className="history-price"><summary>Price breakdown</summary><dl>{b.price.lines.map((line, i) => <div key={i}><dt>{line.label}</dt><dd>{money(line.amount)}</dd></div>)}</dl></details>}
              </div>

              <div className="history-actions">
                {b.status !== 'Cancelled' ? (
                  <>
                    <button
                      className="text-button"
                      onClick={() => navigate('/appointment', { state: { editBooking: b } })}
                    >
                      Reschedule / Edit Bay <Arrow />
                    </button>
                    {cancelId === b.id ? (
                      <div className="cancel-confirm">
                        <p>Cancel this reservation?</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button className="text-button danger" onClick={() => handleCancel(b.id)}>
                            Yes, cancel
                          </button>
                          <button className="text-button" onClick={() => setCancelId(null)}>
                            Keep booking
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="text-button" onClick={() => setCancelId(b.id)}>
                        Cancel booking
                      </button>
                    )}
                  </>
                ) : (
                  <p className="small" style={{ color: 'var(--muted)' }}>This reservation was cancelled.</p>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

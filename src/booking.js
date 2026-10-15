import { services } from './services.js';
import { holiday, holidayYearKnown } from './holidays.js';

export const resources = [
  ...Array.from({ length: 6 }, (_, i) => `Bay ${i + 1}`),
  "Private lounge (demo)",
];
export const statuses = [
  "Pending",
  "Confirmed",
  "Checked-In",
  "Completed",
  "Cancelled",
  "No-Show",
];
export const hours = Array.from(
  { length: 14 },
  (_, i) => `${String(i + 10).padStart(2, "0")}:00`,
);
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function addDays(date, n) {
  return new Date(new Date(`${date}T12:00:00+08:00`).getTime() + n * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function start(b) {
  return new Date(`${b.date}T${b.time}:00+08:00`).getTime();
}
export function overlaps(a, b) {
  return (
    start(a) < start(b) + Number(b.duration) * 3600000 &&
    start(a) + Number(a.duration) * 3600000 > start(b)
  );
}

export const FULLY_BOOKED_SAMPLE_DAY = addDays(today(), 2);

const weekday = date => new Date(`${date}T00:00:00Z`).getUTCDay();
export const openingHour = date => weekday(date) === 1 ? 11 : 10;
export const formatTime = hour => hour === 24 ? '12 AM (midnight)' : `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`;
export const money = amount => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
export const bookingLabel = value => value.replace(/\s*\(demo\)/gi, '').replace(/^DEMO-/i, 'HIH-');

export function serviceDayAllowed(service, date) {
  if (service === 'KPGA coaching package') return [2, 4, 6].includes(weekday(date));
  if (service === 'KPGA group lessons') return weekday(date) === 2;
  return true;
}

export function serviceResources(service) {
  if (service === 'Whole venue rental') return resources;
  if (service === 'VIP bay') return resources.slice(6);
  return resources.slice(0, 6);
}

export function sessionOptions(b) {
  if (!serviceDayAllowed(b.service, b.date)) return [];
  if (b.service === 'Whole venue rental') return [
    { rental: 'half', time: '15:00', duration: 6 },
    { rental: 'whole', time: `${openingHour(b.date)}:00`, duration: 24 - openingHour(b.date) },
  ];
  if (b.service === 'KPGA group lessons') return [{ time: '15:00', duration: 1 }];
  return hours.filter(time => Number(time.slice(0, 2)) >= openingHour(b.date)).map(time => ({ time, duration: 1 }));
}

export function scheduleError(b) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || !Number.isFinite(start(b)) ||
      new Date(`${b.date}T00:00:00Z`).toISOString().slice(0, 10) !== b.date || start(b) <= Date.now())
    return 'Choose a future date and time in Asia/Manila.';
  if (!serviceDayAllowed(b.service, b.date)) return b.service === 'KPGA group lessons'
    ? 'KPGA group lessons are available Tuesday, 3–4 PM only.'
    : 'KPGA pro coaching is available Tuesday, Thursday and Saturday only.';
  const hour = Number(b.time?.slice(0, 2));
  if (!hours.includes(b.time) || hour < openingHour(b.date)) return `The venue opens at ${formatTime(openingHour(b.date))} on this day.`;
  if (!Number.isInteger(Number(b.duration)) || Number(b.duration) < 1) return 'Select at least one hour.';
  if (hour + Number(b.duration) > 24) return 'Your reservation must finish by midnight.';
  if (b.service === 'KPGA group lessons' && (b.time !== '15:00' || Number(b.duration) !== 1)) return 'KPGA group lessons run 3–4 PM only.';
  if (b.service === 'Whole venue rental' && !sessionOptions(b).some(option =>
    option.rental === b.rental && option.time === b.time && option.duration === Number(b.duration)))
    return 'Choose half day (3–9 PM) or whole day (opening to midnight).';
  return '';
}

export function selectHour(b, time) {
  const hour = Number(time.slice(0, 2));
  const first = Number(b.time?.slice(0, 2));
  const count = Number(b.duration) || 0;
  if (!count) return { ...b, time, duration: 1, resources: [] };
  if (hour === first - 1) return { ...b, time, duration: count + 1, resources: [] };
  if (hour === first + count) return { ...b, duration: count + 1, resources: [] };
  if (hour === first) return { ...b, time: count > 1 ? `${String(first + 1).padStart(2, '0')}:00` : '', duration: count - 1, resources: [] };
  if (hour === first + count - 1) return { ...b, duration: count - 1, resources: [] };
  if (hour > first && hour < first + count) throw new Error('Remove an edge hour first, or clear the selection.');
  throw new Error('Select consecutive hours, or clear the selection to start again.');
}

export function quoteBooking(b) {
  const service = b.service || 'Regular service';
  if (!services.some(s => s.name === service) || !b.duration || !b.time) return null;
  const isHoliday = holiday(b.date);
  const day = weekday(b.date);
  const lines = [];
  if (service === 'Whole venue rental') {
    if (!['half', 'whole'].includes(b.rental)) return null;
    const peak = isHoliday || [0, 5, 6].includes(day);
    const amount = b.rental === 'half' ? (peak ? 50000 : 40000) : (peak ? 80000 : 60000);
    lines.push({ label: `${b.rental === 'half' ? 'Half day' : 'Whole day'} · ${isHoliday ? 'holiday' : peak ? 'Fri–Sun' : 'Mon–Thu'}`, amount });
  } else if (service === 'KPGA coaching package') {
    lines.push({ label: '8-session KPGA package · one package', amount: 15000 });
  } else if (service === 'KPGA group lessons') {
    const players = Number(b.customer?.attendees) || 1;
    lines.push({ label: `4-class program · ${players} participant${players === 1 ? '' : 's'} × ${money(2500)}`, amount: 2500 * players });
  } else {
    const bays = service === 'Regular service' ? Math.max(1, b.resources?.length || 0) : 1;
    for (let hour = Number(b.time.slice(0, 2)); hour < Number(b.time.slice(0, 2)) + Number(b.duration); hour++) {
      const rate = service === 'VIP bay' ? 1000 : service === 'Philippine coaching' ? 2000 : isHoliday || [0, 6].includes(day) || hour >= 15 ? 800 : 600;
      lines.push({ label: `${formatTime(hour)}–${formatTime(hour + 1)}${service === 'Regular service' ? ` · ${bays} bay${bays === 1 ? '' : 's'} × ${money(rate)}` : ''}`, amount: rate * bays });
    }
  }
  return { total: lines.reduce((sum, line) => sum + line.amount, 0), lines, holiday: isHoliday,
    holidayYearKnown: holidayYearKnown(b.date), currency: 'PHP' };
}

export function available(list, b, resource, ignore) {
  if (b.date === FULLY_BOOKED_SAMPLE_DAY) {
    return false;
  }
  return !list.some(
    (e) =>
      e.id !== ignore &&
      e.status !== "Cancelled" &&
      (e.resources.includes(resource) ||
        (b.service?.startsWith('KPGA') && e.service?.startsWith('KPGA')) ||
        (b.service === 'Philippine coaching' && e.service === b.service)) &&
      e.date === b.date &&
      overlaps(e, b),
  );
}
export function validate(b) {
  const c = b.customer || {};
  if (
    ![
      "Regular service",
      "Package",
      "Promotional offer",
      "Group booking",
      ...services.map(service => service.name),
    ].includes(b.service || "Regular service")
  )
    return "Choose a service.";
  const invalidSchedule = scheduleError(b);
  if (invalidSchedule) return invalidSchedule;
  if (
    !b.resources?.length ||
    b.resources.some((r) => !resources.includes(r)) ||
    new Set(b.resources).size !== b.resources.length
  )
    return "Select at least one valid resource.";
  if (b.resources.some(r => !serviceResources(b.service).includes(r))) return 'Choose a space suited to your selected service.';
  if (b.service === 'Whole venue rental' && b.resources.length !== resources.length) return 'Whole-shop rentals must reserve all spaces together.';
  if (!c.first?.trim() || !c.last?.trim() || !c.person?.trim())
    return "Enter the customer name and person making the reservation.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email || ""))
    return "Enter a valid email address.";
  if (!/^[+\d ()-]{7,20}$/.test(c.phone || ""))
    return "Enter a valid contact number.";
  if (
    !Number.isInteger(Number(c.attendees)) ||
    Number(c.attendees) < 1 ||
    Number(c.attendees) > 100
  )
    return "Attendees must be a whole number from 1 to 100.";
  if (b.service === 'KPGA group lessons' && Number(c.attendees) > 8) return 'KPGA group lessons allow up to 8 participants.';
  if (b.voucher && b.voucher !== "HUBDEMO")
    return "Enter a valid voucher code, or leave it blank.";
  return "";
}
export function saveBooking(list, b, editId) {
  const error = validate(b);
  if (error) throw new Error(error);
  if (b.resources.some((r) => !available(list, b, r, editId)))
    throw new Error(
      "A selected resource is unavailable. Choose another time or bay; nothing was saved.",
    );
  if (editId && !list.some((e) => e.id === editId))
    throw new Error("The original reservation no longer exists.");
  if (!editId && list.some((e) => e.id === b.id))
    throw new Error("This reservation has already been saved.");
  const saved = { ...b, price: quoteBooking(b) };
  return editId
    ? list.map((e) => (e.id === editId ? { ...saved, id: editId } : e))
    : [...list, saved];
}
export function seed() {
  const date = addDays(today(), 1);
  return [
    {
      id: "DEMO-001",
      date,
      time: `${openingHour(date)}:00`,
      duration: 2,
      resources: ["Bay 1", "Bay 2"],
      service: "Group booking",
      status: "Confirmed",
      demo: true,
    },
    {
      id: "DEMO-002",
      date,
      time: "14:00",
      duration: 3,
      resources: ["Bay 3"],
      service: "Regular service",
      status: "Pending",
      demo: true,
    },
    {
      id: "DEMO-003",
      date,
      time: "18:00",
      duration: 2,
      resources: resources.slice(0, 6),
      service: "Group booking",
      status: "Confirmed",
      demo: true,
    },
    {
      id: "DEMO-004",
      date,
      time: "12:00",
      duration: 1,
      resources: ["Bay 4"],
      service: "Regular service",
      status: "Cancelled",
      demo: true,
    },
  ];
}
export const storageKey = "hole-in-hub-reservations-v1";
export function readBookings() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (
      Array.isArray(saved) &&
      saved.every(
        (b) =>
          b &&
          typeof b.id === "string" &&
          Array.isArray(b.resources) &&
          statuses.includes(b.status),
      )
    )
      return saved;
  } catch {}
  return seed();
}

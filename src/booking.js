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
  { length: 12 },
  (_, i) => `${String(i + 9).padStart(2, "0")}:00`,
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

export function getDurationSlots(duration = 1) {
  const dur = Math.max(1, Math.min(4, Number(duration) || 1));
  const slots = [];
  for (let h = 9; h + dur <= 21; h += dur) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

export function available(list, b, resource, ignore) {
  if (b.date === FULLY_BOOKED_SAMPLE_DAY) {
    return false;
  }
  return !list.some(
    (e) =>
      e.id !== ignore &&
      e.status !== "Cancelled" &&
      e.resources.includes(resource) &&
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
    ].includes(b.service || "Regular service")
  )
    return "Choose a service.";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(b.date) ||
    !hours.includes(b.time) ||
    !Number.isFinite(start(b)) ||
    start(b) <= Date.now()
  )
    return "Choose a future date and time in Asia/Manila.";
  if (
    ![1, 2, 3, 4].includes(Number(b.duration)) ||
    Number(b.time.slice(0, 2)) + Number(b.duration) > 21
  )
    return "Choose a duration of 1–4 hours ending by 21:00 (demo schedule).";
  if (
    !b.resources?.length ||
    b.resources.some((r) => !resources.includes(r)) ||
    new Set(b.resources).size !== b.resources.length
  )
    return "Select at least one valid resource.";
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
    return "Attendees must be a whole number from 1 to 100 (demo limit).";
  if (b.voucher && b.voucher !== "HUBDEMO")
    return "Use HUBDEMO for the demo voucher, or leave it blank.";
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
  return editId
    ? list.map((e) => (e.id === editId ? { ...b, id: editId } : e))
    : [...list, b];
}
export function seed() {
  const date = addDays(today(), 1);
  return [
    {
      id: "DEMO-001",
      date,
      time: "10:00",
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

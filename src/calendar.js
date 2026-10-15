export function shiftMonth(month, offset) {
  const [year, index] = month.split('-').map(Number);
  return new Date(Date.UTC(year, index - 1 + offset, 1)).toISOString().slice(0, 7);
}

export function monthDays(month) {
  const first = new Date(`${month}-01T00:00:00Z`);
  const count = new Date(`${shiftMonth(month, 1)}-01T00:00:00Z`).getTime() - first.getTime();
  const days = Array(first.getUTCDay()).fill(null);
  for (let day = 1; day <= count / 86400000; day++) days.push(`${month}-${String(day).padStart(2, '0')}`);
  while (days.length % 7) days.push(null);
  return days;
}

export function hourRange(first, last) {
  const a = Number(first.slice(0, 2));
  const b = Number(last.slice(0, 2));
  return { time: `${String(Math.min(a, b)).padStart(2, '0')}:00`, duration: Math.abs(a - b) + 1 };
}

export function paintSelection(selected, crossed, remove) {
  return remove ? selected.filter(item => !crossed.includes(item)) : [...new Set([...selected, ...crossed])];
}

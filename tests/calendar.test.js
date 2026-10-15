import test from 'node:test';
import assert from 'node:assert/strict';
import { monthDays, shiftMonth } from '../src/calendar.js';
import { validate, bookingLabel } from '../src/booking.js';

test('calendar aligns weekdays and includes leap day', () => {
  const days = monthDays('2028-02');
  assert.equal(days[0], null);
  assert.equal(days[2], '2028-02-01');
  assert.equal(days.filter(Boolean).length, 29);
  assert.ok(days.includes('2028-02-29'));
  assert.equal(days.length % 7, 0);
});
test('month navigation crosses year boundaries', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(shiftMonth('2027-01', -1), '2026-12');
});
test('new services pass service validation', () => {
  for (const service of ['VIP bay', 'Philippine coaching', 'KPGA coaching package', 'KPGA group lessons', 'Whole venue rental']) {
    assert.notEqual(validate({ service }), 'Choose a service.');
  }
});
test('booking labels hide legacy demo wording without changing stored identifiers', () => {
  assert.equal(bookingLabel('Private lounge (demo)'), 'Private lounge');
  assert.equal(bookingLabel('DEMO-001'), 'HIH-001');
  assert.equal(bookingLabel('Bay 1'), 'Bay 1');
});

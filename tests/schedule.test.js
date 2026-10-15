import test from 'node:test';
import assert from 'node:assert/strict';
import { openingHour, serviceDayAllowed, sessionOptions, scheduleError, quoteBooking, selectHour, resources, saveBooking, available, readBookings } from '../src/booking.js';

const base = { id: 'new', service: 'Regular service', date: '2099-10-12', time: '11:00', duration: 1, resources: ['Bay 1'], status: 'Confirmed', customer: { first: 'A', last: 'B', person: 'A B', email: 'a@b.co', phone: '09123456789', attendees: 1 } };
test('opening hours and midnight closing follow the selected day', () => {
  assert.equal(openingHour('2026-10-19'), 11);
  assert.equal(openingHour('2026-10-20'), 10);
  assert.equal(sessionOptions({ ...base, date: '2026-10-19' })[0].time, '11:00');
  assert.equal(sessionOptions(base).at(-1).time, '23:00');
  assert.match(scheduleError({ ...base, time: '10:00' }), /opens/);
  assert.equal(scheduleError({ ...base, time: '23:00' }), '');
  assert.match(scheduleError({ ...base, time: '23:00', duration: 2 }), /midnight/);
});
test('KPGA schedules reject other weekdays and group lessons fix 3–4 PM', () => {
  for (const [date, allowed] of [['2026-10-19', false], ['2026-10-20', true], ['2026-10-21', false], ['2026-10-22', true], ['2026-10-24', true], ['2026-10-25', false]]) {
    assert.equal(serviceDayAllowed('KPGA coaching package', date), allowed);
  }
  assert.deepEqual(sessionOptions({ ...base, service: 'KPGA group lessons', date: '2026-10-20' }), [{ time: '15:00', duration: 1 }]);
  assert.match(scheduleError({ ...base, service: 'KPGA group lessons', date: '2099-10-13', time: '14:00' }), /3–4 PM/);
});
test('hour selection grows a continuous range, shrinks at an edge and rejects gaps', () => {
  const first = selectHour({ ...base, time: '', duration: 0 }, '14:00');
  const second = selectHour(first, '15:00');
  assert.equal(second.time, '14:00');
  assert.equal(second.duration, 2);
  assert.equal(selectHour(second, '14:00').time, '15:00');
  assert.throws(() => selectHour(second, '17:00'), /consecutive/);
  assert.throws(() => selectHour({ ...first, duration: 3 }, '15:00'), /edge/);
  assert.equal(selectHour(first, '14:00').duration, 0);
});
test('prices sum each hour across 3 PM, multiply bays and apply holidays', () => {
  const b = { ...base, date: '2026-10-20', time: '14:00', duration: 2 };
  assert.equal(quoteBooking(b).total, 1400);
  assert.equal(quoteBooking({ ...b, resources: ['Bay 1', 'Bay 2'] }).total, 2800);
  assert.equal(quoteBooking({ ...b, date: '2026-10-24' }).total, 1600);
  assert.equal(quoteBooking({ ...b, date: '2026-11-30' }).total, 1600);
  assert.equal(quoteBooking({ ...b, date: '2026-11-17' }).total, 1600);
  assert.equal(quoteBooking({ ...b, date: '2027-08-19' }).total, 1600);
  assert.equal(quoteBooking({ ...b, service: 'VIP bay' }).total, 2000);
  assert.equal(quoteBooking({ ...b, service: 'Philippine coaching' }).total, 4000);
  assert.equal(quoteBooking({ ...b, service: 'KPGA coaching package' }).total, 15000);
});
test('rental choices use correct half/full day times and day rates', () => {
  const b = { ...base, service: 'Whole venue rental', date: '2026-10-19', rental: 'whole' };
  assert.deepEqual(sessionOptions(b), [{ rental: 'half', time: '15:00', duration: 6 }, { rental: 'whole', time: '11:00', duration: 13 }]);
  assert.equal(quoteBooking(b).total, 60000);
  assert.equal(quoteBooking({ ...b, rental: 'half' }).total, 40000);
  assert.equal(quoteBooking({ ...b, date: '2026-10-23' }).total, 80000);
  assert.equal(quoteBooking({ ...b, date: '2026-11-17', rental: 'half' }).total, 50000);
});
test('save enforces service schedules, exclusive venue and recalculates price', () => {
  assert.throws(() => saveBooking([], { ...base, service: 'KPGA coaching package' }), /Tuesday/);
  const rental = { ...base, service: 'Whole venue rental', rental: 'half', time: '15:00', duration: 6 };
  assert.throws(() => saveBooking([], rental), /all/);
  const all = { ...rental, resources: [...resources] };
  assert.throws(() => saveBooking([{ ...base, time: '17:00' }], all), /unavailable/);
  const saved = saveBooking([], { ...base, price: { total: 1 } })[0];
  assert.equal(saved.price.total, 600);
  assert.equal(saveBooking([], all)[0].price.total, 40000);
});
test('coaching cannot double-book the same coach in different bays', () => {
  const b = { ...base, service: 'KPGA coaching package', date: '2099-10-13' };
  assert.equal(available([b], b, 'Bay 2'), false);
  assert.equal(available([b], b, 'Bay 2', b.id), true);
});
test('saved price survives reload and is recalculated on reschedule', () => {
  const saved = saveBooking([], base);
  globalThis.localStorage = { getItem: () => JSON.stringify(saved) };
  try {
    assert.equal(readBookings()[0].price.total, 600);
    const updated = saveBooking(readBookings(), { ...saved[0], time: '15:00' }, base.id);
    assert.equal(updated[0].price.total, 800);
    assert.equal(saved[0].price.total, 600);
  } finally { delete globalThis.localStorage; }
});
test('fixed sessions and resource constraints cannot be bypassed when saving', () => {
  const group = { ...base, service: 'KPGA group lessons', date: '2099-10-13', time: '15:00' };
  assert.equal(saveBooking([], group)[0].price.total, 2500);
  assert.throws(() => saveBooking([], { ...group, customer: { ...base.customer, attendees: 9 } }), /8 participants/);
  assert.throws(() => saveBooking([], { ...group, duration: 2 }), /3–4 PM/);
  assert.throws(() => saveBooking([], { ...base, service: 'VIP bay' }), /space/);
  assert.throws(() => saveBooking([], { ...base, date: '2099-02-30' }), /future date/);
});

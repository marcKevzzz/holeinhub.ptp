import test from 'node:test';
import assert from 'node:assert/strict';
import { hourRange, paintSelection } from '../src/dragSelection.js';

test('drag selects all hours between endpoints in either direction', () => {
  assert.deepEqual(hourRange('14:00', '17:00'), { time: '14:00', duration: 4 });
  assert.deepEqual(hourRange('17:00', '14:00'), { time: '14:00', duration: 4 });
  assert.deepEqual(hourRange('23:00', '23:00'), { time: '23:00', duration: 1 });
});
test('bay painting adds once or removes crossed bays without changing other selections', () => {
  const selected = ['Bay 1', 'Bay 3'];
  assert.deepEqual(paintSelection(selected, ['Bay 1', 'Bay 2'], false), ['Bay 1', 'Bay 3', 'Bay 2']);
  assert.deepEqual(paintSelection(selected, ['Bay 1', 'Bay 2'], true), ['Bay 3']);
  assert.deepEqual(selected, ['Bay 1', 'Bay 3']);
});

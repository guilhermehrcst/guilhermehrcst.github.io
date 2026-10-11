import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from '../src/lib/dates.ts';

test('ISO dates read as a Brazilian reader writes them, whatever the time zone', () => {
  assert.equal(formatDate('2026-10-11'), '11 de outubro de 2026');
  assert.equal(formatDate('2026-01-01'), '1 de janeiro de 2026');
});

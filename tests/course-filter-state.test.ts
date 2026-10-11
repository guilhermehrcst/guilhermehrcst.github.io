import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesFilterData } from '../src/lib/course-filter-state.ts';

test('matches any selected goal and any selected format', () => {
  const data = { goals: 'high-school enem vestibular', format: 'course' };
  assert.equal(matchesFilterData(data, ['uerj', 'enem'], ['course', 'playlist']), true);
  assert.equal(matchesFilterData(data, ['uerj'], ['course']), false);
  assert.equal(matchesFilterData(data, ['enem'], ['playlist']), false);
});

test('empty selections fail open', () => {
  assert.equal(matchesFilterData({ goals: 'uerj', format: 'practice' }, [], []), true);
});

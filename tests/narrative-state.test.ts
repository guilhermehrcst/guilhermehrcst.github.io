// Pure narrative state: no DOM, no timers. Run with `npm test` (Node's built-in runner).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NARRATIVE_ORDER,
  activateChapter,
  completeChapter,
  initialState,
  pickActiveChapter,
  visibleNarrativeIds,
} from '../src/lib/narrative-state.ts';

test('the ten chapters, in reading order', () => {
  assert.deepEqual(NARRATIVE_ORDER, [
    'whoami', 'pexiscale', 'lume', 'pexis-machine', 'capabilities',
    'ai-workflow', 'education', 'influences', 'principles', 'contact',
  ]);
});

test('the section under the focus line is active', () => {
  assert.equal(pickActiveChapter([
    { id: 'pexiscale', top: 100, bottom: 700 },
    { id: 'lume', top: 700, bottom: 1400 },
  ], 450), 'pexiscale');
  assert.equal(pickActiveChapter([
    { id: 'pexiscale', top: 100, bottom: 700 },
    { id: 'lume', top: 700, bottom: 1400 },
  ], 700), 'lume');
});

test('with no section under the focus line, the nearest edge wins, ties by reading order', () => {
  assert.equal(pickActiveChapter([
    { id: 'lume', top: 900, bottom: 1400 },
    { id: 'pexiscale', top: -400, bottom: 300 },
  ], 450), 'pexiscale'); // 150 from pexiscale's bottom, 450 from lume's top
  assert.equal(pickActiveChapter([
    { id: 'lume', top: 500, bottom: 900 },
    { id: 'pexiscale', top: 0, bottom: 400 },
  ], 450), 'pexiscale'); // both 50 away: pexiscale comes first
  assert.equal(pickActiveChapter([], 450), null);
});

test('a new chapter replaces the active one at once', () => {
  const a = activateChapter(initialState, 'pexiscale', true);
  assert.equal(a.state.active, 'pexiscale');
  assert.equal(a.shouldAnimate, true);
  assert.equal(activateChapter(a.state, 'lume', true).state.active, 'lume');
});

test('a completed chapter never animates again', () => {
  const r = activateChapter(completeChapter(initialState, 'pexiscale'), 'pexiscale', true);
  assert.equal(r.shouldAnimate, false);
  assert.equal(r.state.active, 'pexiscale');
});

test('without motion, activation completes the chapter immediately', () => {
  const r = activateChapter(initialState, 'lume', false);
  assert.equal(r.shouldAnimate, false);
  assert.equal(r.state.active, 'lume');
  assert.deepEqual(r.state.completed, ['lume']);
});

test('history keeps the last completed chapters plus the active one', () => {
  assert.deepEqual(
    visibleNarrativeIds(
      { active: 'contact', completed: ['whoami', 'pexiscale', 'lume', 'pexis-machine', 'capabilities'] },
      3,
    ),
    ['lume', 'pexis-machine', 'capabilities', 'contact'],
  );
});

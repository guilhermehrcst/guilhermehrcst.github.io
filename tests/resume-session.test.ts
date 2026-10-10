// The résumé session: order, commands, and which steps a scroll position runs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RESUME_STEPS, RESUME_PROMPT, advance, commandMs, CHAR_MS, OUTPUT_GAP_MS } from '../src/lib/resume-session.ts';

test('the session runs whoami → projects → … → contact → exit', () => {
  assert.deepEqual(RESUME_STEPS.map((s) => s.command), [
    'whoami', 'projects --selected', 'capabilities', 'ai-workflow', 'education', 'influences', 'contact', 'exit',
  ]);
  assert.equal(new Set(RESUME_STEPS.map((s) => s.id)).size, RESUME_STEPS.length);
  assert.equal(RESUME_PROMPT, 'guilherme@portfolio:~$');
});

test('reaching the next step types it, and only it', () => {
  assert.deepEqual(advance([true, false, false], 1), { instant: [], animate: 1 });
});

test('jumping ahead shows the skipped steps at once and types only the reached one', () => {
  assert.deepEqual(advance([true, false, false, false, false], 3), { instant: [1, 2], animate: 3 });
  assert.deepEqual(advance([false, false, false], 2), { instant: [0, 1], animate: 2 });
});

test('a step never runs twice; scrolling back changes nothing', () => {
  assert.deepEqual(advance([true, true, true], 1), { instant: [], animate: null });
  assert.deepEqual(advance([true, true, false], 0), { instant: [], animate: null });
});

test('a step still typing is finished at once when the reader moves past it', () => {
  assert.deepEqual(advance([true, true, false, false], 3, 1), { instant: [1, 2], animate: 3 });
  assert.deepEqual(advance([true, true, false], 1, 1), { instant: [], animate: null }, 'still on it: it keeps typing');
});

test('out-of-range positions are ignored', () => {
  assert.deepEqual(advance([false, false], -1), { instant: [], animate: null });
  assert.deepEqual(advance([false, false], 2), { instant: [], animate: null });
  assert.deepEqual(advance([false, false], 0.5), { instant: [], animate: null });
});

test('typing time is proportional to the command, plus a fixed gap', () => {
  assert.equal(commandMs('exit'), 4 * CHAR_MS + OUTPUT_GAP_MS);
  assert.ok(commandMs('projects --selected') < 700, 'the longest command types in well under a second');
});

// Gate B, technical stage 01: RED tests for contracts P1–P4 (addendum after the PR #33 review).
// Deliberately outside the `npm test` glob (*.red.ts), so the existing suite and CI stay green until the
// architecture is approved. Run: node --experimental-strip-types --test tests/gateb/*.red.ts
// When a contract goes GREEN, this file (or its part) becomes tests/*.test.ts.
// The new modules do not exist yet: they are imported loosely, so a missing export is a clear failure.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedResources } from '../../src/lib/learning-resources.ts';

const load = async (path: string): Promise<Record<string, any>> => import(path).catch(() => ({}));
const lr = await load('../../src/lib/learning-resources.ts');
const need = (mod: Record<string, any>, name: string) => {
  assert.equal(typeof mod[name], 'function', `${name} is not implemented`);
  return mod[name] as (...args: any[]) => any;
};

const verified = { on: '2026-10-12', by: 'official-page', freeAccess: true };
const resource = (over: Record<string, unknown>) => ({
  id: 'x', title: 'X', provider: 'P', subject: null, format: 'past-exam', paths: ['vestibulares'],
  language: 'pt', level: 'vestibular', url: 'https://example.gov.br/x', verified, ...over,
});

/* P4: a new resource carries its own verification and conditions; the 37 legacy records are frozen. */

test('P4: the legacy set is exactly the 37 published today, and they need nothing new', () => {
  const legacy = lr.LEGACY_VERIFIED_IDS as readonly string[] | undefined;
  assert.ok(legacy, 'LEGACY_VERIFIED_IDS is not defined');
  assert.deepEqual([...(legacy ?? [])].sort(), publishedResources.map((r) => r.id).sort());
  const problems = need(lr, 'verificationProblems');
  for (const r of publishedResources) assert.deepEqual(problems(r), [], r.id);
});

test('P4: a new resource needs individual evidence: HTTPS source, what was checked, a note', () => {
  const problems = need(lr, 'verificationProblems');
  const ok = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'language', 'registration', 'certificate'], note: 'Aberto em 12/10/2026.' };
  const fresh = (ev: unknown, over: Record<string, unknown> = {}) =>
    resource({ id: 'new-1', registration: 'not-required', certificate: 'none', verified: { ...verified, evidence: ev }, ...over });
  assert.deepEqual(problems(fresh(ok)), []);
  assert.match(problems(fresh(undefined)).join('\n'), /new-1: no individual evidence/);
  assert.match(problems(fresh({ ...ok, url: 'http://example.gov.br/x' })).join('\n'), /https/);
  assert.match(problems(fresh({ ...ok, checked: ['scope'] })).join('\n'), /free access not checked/);
  assert.match(problems(fresh({ ...ok, note: ' ' })).join('\n'), /note/);
});

test('P4: a new resource states its registration and certificate (never left unknown by omission)', () => {
  const problems = need(lr, 'verificationProblems');
  const ev = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'language', 'registration', 'certificate'], note: 'ok' };
  const base = { id: 'new-2', verified: { ...verified, evidence: ev } };
  assert.match(problems(resource({ ...base, certificate: 'none' })).join('\n'), /registration/);
  assert.match(problems(resource({ ...base, registration: 'required' })).join('\n'), /certificate/);
});

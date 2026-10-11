// V0.4 Gate B, P4: individual verification for new resources; the 37 legacy records frozen by id, URL and
// date. Converted from the RED tests of tests/gateb/gate-b.red.ts (adjusted to the approved checks).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedResources } from '../src/lib/learning-resources.ts';

const load = async (path: string): Promise<Record<string, any>> => import(path).catch(() => ({}));
const lr = await load('../src/lib/learning-resources.ts');
const need = (mod: Record<string, any>, name: string) => {
  assert.equal(typeof mod[name], 'function', `${name} is not implemented`);
  return mod[name] as (...args: any[]) => any;
};

const verified = { on: '2026-10-11', by: 'official-page', freeAccess: true };
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
  const ok = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'language', 'format', 'path', 'registration', 'certificate'], note: 'Aberto em 11/10/2026.' };
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
  const ev = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'language', 'format', 'path', 'registration', 'certificate'], note: 'ok' };
  const base = { id: 'new-2', verified: { ...verified, evidence: ev } };
  assert.match(problems(resource({ ...base, certificate: 'none' })).join('\n'), /registration/);
  assert.match(problems(resource({ ...base, registration: 'required' })).join('\n'), /certificate/);
});

test('P4: the legacy exemption covers the baseline data only: a changed URL or date loses it', () => {
  const problems = need(lr, 'verificationProblems');
  const cs50x = publishedResources.find((r) => r.id === 'cs50x')!;
  assert.match(problems({ ...cs50x, url: 'https://cs50.harvard.edu/x/2027/' }).join('\n'), /cs50x: no individual evidence/);
  assert.match(problems({ ...cs50x, verified: { ...cs50x.verified, on: '2026-10-12' } }).join('\n'), /cs50x: no individual evidence/);
});

test('P4: nothing stamps a verification on a new resource: the legacy helper refuses ids outside the baseline', () => {
  const legacyVerified = need(lr, 'legacyVerified');
  assert.equal(legacyVerified('cs50x').on, '2026-10-11');
  assert.throws(() => legacyVerified('new-resource'), /not in the legacy baseline/);
});

test('P4: a verification date is a real date, never in the future', () => {
  const problems = need(lr, 'verificationProblems');
  const ev = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'language', 'format', 'path', 'registration', 'certificate'], note: 'ok' };
  const at = (on: string) => resource({ id: 'new-3', registration: 'required', certificate: 'none', verified: { ...verified, on, evidence: ev } });
  const now = new Date('2026-10-11T12:00:00Z');
  assert.deepEqual(problems(at('2026-10-11'), now), []);
  assert.match(problems(at('2026-10-12'), now).join('\n'), /in the future/);
  assert.match(problems(at('2026-13-40'), now).join('\n'), /not a date/);
});

test('P4: evidence comes from the resource\'s own official host', () => {
  const problems = need(lr, 'verificationProblems');
  const ev = { url: 'https://blog.example.com/x', checked: ['free', 'scope', 'language', 'format', 'path', 'registration', 'certificate'], note: 'ok' };
  assert.match(problems(resource({ id: 'new-4', registration: 'required', certificate: 'none', verified: { ...verified, evidence: ev } })).join('\n'), /host/);
});

test('P4: an unconfirmed detail is stated as unconfirmed and never shown as a fact', async () => {
  const problems = need(lr, 'verificationProblems');
  const ev = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'language', 'format', 'path'], note: 'Cadastro e certificado não informados na página.' };
  assert.deepEqual(problems(resource({ id: 'new-5', registration: 'unconfirmed', certificate: 'unconfirmed', verified: { ...verified, evidence: ev } })), []);
  assert.match(problems(resource({ id: 'new-6', registration: 'not-required', certificate: 'available', verified: { ...verified, evidence: ev } })).join('\n'), /registration not checked[\s\S]*certificate not checked/);
  const { readFileSync } = await import('node:fs');
  const item = readFileSync(new URL('../src/components/ResourceItem.astro', import.meta.url), 'utf8');
  assert.match(item, /unconfirmed/, 'ResourceItem leaves unconfirmed details out of the facts');
});

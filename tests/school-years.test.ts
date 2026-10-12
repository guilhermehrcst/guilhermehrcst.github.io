// V0.4 Gate B, P3: school years 1–9, only on Ensino Fundamental, only with evidence; the stage derived.
// Converted from the RED tests of tests/gateb/gate-b.red.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedResources } from '../src/lib/learning-resources.ts';

const load = async (path: string): Promise<Record<string, any>> => import(path).catch(() => ({}));
const lr = await load('../src/lib/learning-resources.ts');
const need = (mod: Record<string, any>, name: string) => {
  assert.equal(typeof mod[name], 'function', `${name} is not implemented`);
  return mod[name] as (...args: any[]) => any;
};

const verified = { on: '2026-10-12', by: 'official-page', freeAccess: true };
const resource = (over: Record<string, unknown>) => ({
  id: 'x', title: 'X', provider: 'P', subject: null, format: 'past-exam', paths: ['vestibulares'],
  language: 'pt', level: 'vestibular', url: 'https://example.gov.br/x', verified, ...over,
});

/* P3: school year, 1º to 9º, only with evidence. */

test('P3: schoolYears accepts 1..9, distinct, ascending, only on Fundamental, only with individual evidence', () => {
  const problems = need(lr, 'schoolYearProblems');
  const evidence = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'grade'], note: 'Página indica 2º ano.' };
  const fund = (years: unknown, ev: unknown = evidence) =>
    resource({ id: 'f', subject: 'portugues', format: 'lesson', paths: ['ensino-fundamental'], schoolYears: years, verified: { ...verified, evidence: ev } });
  assert.deepEqual(problems(fund([2])), []);
  assert.deepEqual(problems(fund([6, 7, 8, 9])), []);
  assert.match(problems(fund([0])).join('\n'), /school year 0/);
  assert.match(problems(fund([10])).join('\n'), /school year 10/);
  assert.match(problems(fund([2, 2])).join('\n'), /repeats/);
  assert.match(problems(fund([5, 2])).join('\n'), /ascending/);
  assert.match(problems(fund([])).join('\n'), /empty/);
  assert.match(problems(fund([2], { ...evidence, checked: ['free', 'scope'] })).join('\n'), /without evidence of the school year/);
  assert.match(problems(resource({ id: 'm', paths: ['ensino-medio'], subject: 'matematica', schoolYears: [9] })).join('\n'), /only on Ensino Fundamental/);
});

test('P3: a multidisciplinary Fundamental resource needs no subject; no resource is forced to have a year', () => {
  const problems = need(lr, 'schoolYearProblems');
  assert.deepEqual(problems(resource({ id: 'atlas', format: 'reference', paths: ['ensino-fundamental'] })), []);
  for (const r of publishedResources) assert.deepEqual(problems(r), [], r.id);
});

test('P3: the stage is derived from the years, never typed', () => {
  const stages = need(lr, 'stagesOf');
  assert.deepEqual(stages([1, 2]), ['anos-iniciais']);
  assert.deepEqual(stages([6]), ['anos-finais']);
  assert.deepEqual(stages([5, 6]), ['anos-iniciais', 'anos-finais']);
});


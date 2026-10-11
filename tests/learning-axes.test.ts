import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogue, publishedResources } from '../src/lib/learning-resources.ts';
import { objectiveFacts } from '../src/lib/learning-library.ts';
import { HIGHER_EDUCATION_GROUPS } from '../src/lib/higher-education.ts';
import { EXAM_ORDER, EXAM_PARENT, PATH_ORDER, SUBJECTS } from '../src/lib/taxonomy.ts';

// V0.4 M1 (spec §1.3, §5.1): a resource says, separately, which paths it serves (who it is for), which
// exams it prepares for (with evidence), and its subject. Nothing is inherited from a helper: the
// technology catalogue used to land in Ensino Médio because tech() stamped goals: ['ensino-medio'].
// Read through a loose view so these tests state the contract even before the fields exist (RED).
type Axes = { id: string; subject: string | null; paths?: readonly string[]; exams?: readonly string[]; goals?: unknown };
const all = catalogue as unknown as Axes[];
const published = publishedResources as unknown as Axes[];
const pathsOf = (r: Axes) => r.paths ?? [];
const examsOf = (r: Axes) => r.exams ?? [];

test('every resource declares the paths it serves: at least one, each known, none repeated', () => {
  for (const r of all) {
    const paths = pathsOf(r);
    assert.ok(paths.length > 0, `${r.id}: declares no path`);
    for (const p of paths) assert.ok((PATH_ORDER as readonly string[]).includes(p), `${r.id}: unknown path ${p}`);
    assert.equal(new Set(paths).size, paths.length, `${r.id}: repeats a path`);
  }
});

test('the legacy goals field is gone: path and exam are separate axes', () => {
  for (const r of all) assert.ok(!('goals' in r), `${r.id}: still carries goals`);
});

test('an exam is never a path, and an exam resource sits in its parent path', () => {
  for (const r of all) {
    for (const exam of examsOf(r)) {
      assert.ok((EXAM_ORDER as readonly string[]).includes(exam), `${r.id}: unknown exam ${exam}`);
      assert.ok(pathsOf(r).includes(EXAM_PARENT[exam as keyof typeof EXAM_PARENT]), `${r.id}: ${exam} outside its path`);
    }
  }
});

test('a technology resource serves Tecnologia and never Ensino Médio by inheritance', () => {
  const tech = all.filter((r) => r.subject === 'tecnologia');
  assert.equal(tech.length, 20);
  for (const r of tech) {
    assert.ok(pathsOf(r).includes('tecnologia'), `${r.id}: not in Tecnologia`);
    assert.ok(!pathsOf(r).includes('ensino-medio'), `${r.id}: counted in Ensino Médio`);
  }
});

test('Ensino Médio holds school subjects only, so its count is what /ensino-medio/ renders', () => {
  const medio = published.filter((r) => pathsOf(r).includes('ensino-medio'));
  for (const r of medio) {
    assert.ok(r.subject !== null, `${r.id}: no subject`);
    assert.notEqual(SUBJECTS[r.subject as keyof typeof SUBJECTS].area, 'tecnologia', `${r.id}: a technology area in Ensino Médio`);
  }
  assert.equal(objectiveFacts('ensino-medio').resources, medio.length);
  assert.equal(medio.length, 12);
});

test('Ensino Superior is declared on each resource and agrees with the university groups', () => {
  const declared = published.filter((r) => pathsOf(r).includes('ensino-superior')).map((r) => r.id).sort();
  const grouped = HIGHER_EDUCATION_GROUPS.flatMap((g) => g.resourceIds).slice().sort();
  assert.deepEqual(declared, grouped);
});

test('every count is the number of distinct published resources of that path or exam', () => {
  assert.deepEqual(objectiveFacts('ensino-fundamental'), { resources: 0 });
  assert.deepEqual(objectiveFacts('ensino-medio'), { resources: 12 });
  assert.deepEqual(objectiveFacts('vestibulares'), { resources: 20 });
  assert.deepEqual(objectiveFacts('pre-militar'), { resources: 0 });
  assert.deepEqual(objectiveFacts('ensino-superior'), { resources: 6 });
  assert.deepEqual(objectiveFacts('tecnologia'), { resources: 17, tracks: 7 });
  assert.deepEqual(objectiveFacts('enem'), { resources: 13 });
  assert.deepEqual(objectiveFacts('uerj'), { resources: 7 });
});

// Formats (spec §4.3, §5.1): past exams, simulators, single lessons and reference material are resources,
// never "courses". Practice is a kind of format, not one format: a past exam or a simulator is practice.
test('the format axis names what a resource really is, and knows which formats are practice', async () => {
  const lr = await import('../src/lib/learning-resources.ts') as Record<string, unknown>;
  const formats = lr.LEARNING_FORMATS as readonly string[] | undefined;
  const practice = lr.PRACTICE_FORMATS as readonly string[] | undefined;
  assert.deepEqual(formats, ['course', 'track', 'playlist', 'lessons', 'lesson', 'practice', 'past-exam', 'simulator', 'reference']);
  assert.deepEqual(practice, ['practice', 'past-exam', 'simulator']);
  const isPractice = lr.isPractice as ((r: { format: string }) => boolean) | undefined;
  assert.equal(typeof isPractice, 'function');
  for (const format of formats ?? []) assert.equal(isPractice!({ format }), practice!.includes(format), format);
});

test('every format has a label, and no label calls a past exam, a lesson or a reference a course', async () => {
  const { pt } = await import('../src/i18n/pt.ts');
  const { LEARNING_FORMATS } = await import('../src/lib/learning-resources.ts') as { LEARNING_FORMATS?: readonly string[] };
  const labels = pt.resource.formats as Record<string, string>;
  for (const format of LEARNING_FORMATS ?? ['missing']) assert.ok(labels[format]?.trim(), `no label for ${format}`);
  for (const format of ['lesson', 'past-exam', 'simulator', 'reference']) assert.ok(!/curso/i.test(labels[format] ?? 'curso'), format);
});

test('verify-dist keeps an independent, equal list of the practice formats', async () => {
  const { readFileSync } = await import('node:fs');
  const script = readFileSync(new URL('../scripts/verify-dist.mjs', import.meta.url), 'utf8');
  const body = /const PRACTICE_FORMATS = \[([^\]]*)\];/.exec(script)?.[1] ?? '';
  const { PRACTICE_FORMATS } = await import('../src/lib/learning-resources.ts') as { PRACTICE_FORMATS?: readonly string[] };
  assert.deepEqual([...body.matchAll(/'([^']+)'/g)].map((m) => m[1]), PRACTICE_FORMATS ?? ['missing']);
});

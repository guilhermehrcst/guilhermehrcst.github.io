import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENEM_AREAS, examGuides, resolveGuide, sourceShownAsResource, UERJ_SUBJECTS } from '../src/lib/exam-guides.ts';
import { isPractice, publishedResources } from '../src/lib/learning-resources.ts';
import { officialSources } from '../src/lib/official-sources.ts';
import { ACADEMIC_SUBJECTS } from '../src/lib/taxonomy.ts';

// Every resource the former study tracks (src/lib/study-tracks.ts at dd15aa4) pointed to, copied by hand
// before that file was removed: the guides that replace it must lose none of them.
const FORMER_TRACKS = {
  enem: [
    'kultivi-math-enem', 'kultivi-portuguese-enem', 'kultivi-writing-enem',
    'kultivi-physics-enem', 'kultivi-chemistry-enem', 'kultivi-biology-enem',
    'kultivi-history-enem', 'kultivi-geography-enem', 'kultivi-philosophy-enem', 'kultivi-sociology-enem',
    'kultivi-english-enem', 'kultivi-spanish-enem', 'inep-writing-2026',
  ],
  uerj: [
    'uerj-math-practice', 'uerj-portuguese-practice', 'uerj-physics-practice', 'uerj-history-practice',
    'uerj-geography-practice', 'uerj-spanish-practice', 'uerj-writing-practice',
  ],
} as const;

test('each guide has its own closed sections, in order', () => {
  assert.deepEqual(examGuides.enem.map((s) => s.id), ['entenda', 'areas', 'pratique', 'aprofunde']);
  assert.deepEqual(examGuides.uerj.map((s) => s.id), ['entenda', 'prepare', 'materias', 'provas']);
});

for (const exam of ['enem', 'uerj'] as const) {
  const resolved = resolveGuide(exam);
  const ids = resolved.flatMap((s) => s.resources.map((r) => r.id));

  test(`${exam}: no resource of the former study track is lost`, () => {
    for (const id of FORMER_TRACKS[exam]) assert.ok(ids.includes(id), `${exam}: lost ${id}`);
  });

  test(`${exam}: only published resources tagged for the exam, each listed once`, () => {
    for (const section of resolved) {
      for (const r of section.resources) {
        assert.ok(publishedResources.includes(r), r.id);
        assert.ok(r.exams?.includes(exam), `${exam}: ${r.id}`);
      }
    }
    assert.equal(new Set(ids).size, ids.length);
  });

  test(`${exam}: editorial sections cite official sources; no section is empty`, () => {
    for (const section of resolved) {
      if (section.kind === 'editorial') assert.ok(section.sources.length > 0, `${exam}/${section.id}`);
      for (const source of section.sources) assert.ok(source in officialSources, source);
      assert.ok(section.kind !== 'resources' || section.resources.length + section.sources.length > 0, `${exam}/${section.id} is empty`);
    }
  });
}

test('ENEM: practice holds practice only, deepening holds none; the mandatory sections are there', () => {
  const enem = resolveGuide('enem');
  const byId = new Map(enem.map((s) => [s.id, s]));
  assert.ok(byId.get('entenda'));
  // Practice is a kind of format (a past exam is practice), not the one format 'practice' (V0.4 QA P2-RC5).
  assert.ok(byId.get('pratique')!.resources.every((r) => isPractice(r)));
  assert.ok(byId.get('pratique')!.sources.includes('inep-provas-gabaritos'));
  assert.ok(byId.get('aprofunde')!.resources.length > 0);
  assert.ok(byId.get('aprofunde')!.resources.every((r) => r.format !== 'practice'));
});

test('UERJ: past exams are the spine; the mandatory sections are there', () => {
  const uerj = resolveGuide('uerj');
  const byId = new Map(uerj.map((s) => [s.id, s]));
  assert.ok(byId.get('entenda') && byId.get('prepare'));
  assert.deepEqual(byId.get('provas')!.resources.map((r) => r.id).sort(), [...FORMER_TRACKS.uerj].sort());
});

test('ENEM areas follow INEP: four areas and the essay, covering the twelve subjects once', () => {
  assert.deepEqual(ENEM_AREAS.map((a) => a.id), ['linguagens', 'humanas', 'natureza', 'matematica', 'redacao']);
  assert.deepEqual(ENEM_AREAS.find((a) => a.id === 'linguagens')!.subjects, ['portugues', 'ingles', 'espanhol']);
  assert.deepEqual(ENEM_AREAS.find((a) => a.id === 'redacao')!.subjects, ['redacao']);
  const all = ENEM_AREAS.flatMap((a) => a.subjects);
  assert.deepEqual([...all].sort(), [...ACADEMIC_SUBJECTS].sort());
});

test('UERJ subjects are exactly those with UERJ resources', () => {
  assert.deepEqual(UERJ_SUBJECTS, ['matematica', 'portugues', 'redacao', 'fisica', 'historia', 'geografia', 'espanhol']);
});

// Release state (V0.4 QA P2-RC5): L001 publishes the INEP collection on the practice section, so the note
// points to that resource on the page instead of linking out to INEP a second time.
test('L001: the INEP source is shown as a resource, so the note points to it on the page', () => {
  const practice = resolveGuide('enem').find((s) => s.id === 'pratique')!;
  assert.equal(sourceShownAsResource('inep-provas-gabaritos', practice.resources)?.id, 'inep-enem-provas-gabaritos');
});

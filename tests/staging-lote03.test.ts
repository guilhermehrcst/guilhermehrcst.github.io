import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogue, resourceProblems } from '../src/lib/learning-resources.ts';
import { placementOf } from '../src/lib/placement.ts';
import { PATH_ORDER } from '../src/lib/taxonomy.ts';

// V0.4 Gate B, Lote 03 (docs/superpowers/research/2026-10-11-v04-gateb-lote03-sources.md): eight more
// Fundamental lessons opened directly, and three military past-exam collections whose page was opened but
// whose attachments were not. The eight become staged records; the three stay partial, never ready.
const staging = await import('../src/lib/staging.ts') as Record<string, any>;
const staged = staging.STAGED_RESOURCES as typeof catalogue;
const partial = (staging.PARTIAL_VERIFICATIONS ?? []) as { id: string; url: string; format: string; status: string; pending: string }[];
const draft = staging.SELECTION_DRAFT as Record<string, string[]>;

// From the Lote 03 table: URL, school year, subject (null: Ciências da Natureza has no SubjectId), format.
const SME = 'https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/';
const LOTE03 = [
  [`${SME}lingua-portuguesa-nosso-alfabeto/`, 1, 'portugues', 'lesson'],
  [`${SME}ciencias-da-natureza-vegetacao-e-a-preservacao-do-solo/`, 3, null, 'lesson'],
  [`${SME}geografia-municipio-estado-e-pais/`, 4, 'geografia', 'lesson'],
  [`${SME}historia-vestigios-do-passado/`, 5, 'historia', 'lesson'],
  ['https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=28', 6, 'matematica', 'lessons'],
  [`${SME}ciencias-da-natureza-tecnologia-e-vida-humana/`, 7, null, 'lesson'],
  ['https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=1059', 8, 'matematica', 'lessons'],
  [`${SME}matematica-funcao-de-1o-e-de-2o-grau/`, 9, 'matematica', 'lesson'],
] as const;

test('Lote 03: the eight Fundamental lessons are staged once each, with the year, subject and format of the source', () => {
  for (const [url, year, subject, format] of LOTE03) {
    const found = staged.filter((r) => r.url === url);
    assert.equal(found.length, 1, `${url}: staged ${found.length} times`);
    const r = found[0]!;
    assert.deepEqual([...(r.schoolYears ?? [])], [year], r.id);
    assert.equal(r.subject, subject, r.id);
    assert.equal(r.format, format, r.id);
    assert.deepEqual(r.paths, ['ensino-fundamental'], r.id);
  }
});

test('Lote 03: neither the source nor the evidence states registration or certificate: both stay unconfirmed', () => {
  for (const [url] of LOTE03) {
    const r = staged.find((x) => x.url === url)!;
    assert.equal(r.registration, 'unconfirmed', r.id);
    assert.equal(r.certificate, 'unconfirmed', r.id);
    assert.deepEqual(resourceProblems(r, new Date('2026-10-11T23:59:59Z')), [], r.id);
    assert.match(r.verified?.evidence?.note ?? '', /não (foram )?abert|não testad/i, `${r.id}: the note says what was not opened`);
  }
});

test('Lote 03: Ciências da Natureza is never filed under Tecnologia nor given a false subject', () => {
  for (const r of staged.filter((x) => x.paths.includes('ensino-fundamental'))) {
    assert.notEqual(r.subject, 'tecnologia', r.id);
    assert.ok(!r.technology, r.id);
  }
});

test('Fundamental: ten distinct staged lessons, each shown on the Fundamental page once it is active', () => {
  const ids = draft['ensino-fundamental'] ?? [];
  assert.equal(ids.length, 10);
  assert.equal(new Set(ids).size, 10);
  const ACTIVE = Object.fromEntries(PATH_ORDER.map((p) => [p, 'active'])) as Record<(typeof PATH_ORDER)[number], 'active'>;
  for (const id of ids) {
    const r = staged.find((x) => x.id === id)!;
    assert.equal(placementOf(r, ACTIVE)?.page, '/ensino-fundamental/', id);
  }
  const years = ids.flatMap((id) => staged.find((x) => x.id === id)!.schoolYears ?? []).sort((a, b) => a - b);
  assert.deepEqual(years, [1, 2, 3, 4, 5, 5, 6, 7, 8, 9], 'every year from 1º to 9º is covered');
});

test('Lote 03: the three military collections stay partial: recorded, never staged as ready, never in the draft', () => {
  assert.deepEqual(partial.map((p) => p.url).sort(), [
    'https://ingresso.eear.fab.mil.br/SOO/home/provas_anteriores.php?sigla_conc=%25',
    'https://www.marinha.mil.br/sspm/colegionaval/colegio_princ',
    'https://www.marinha.mil.br/sspm/node/95',
  ]);
  const ready = new Set([...staged.map((r) => r.id), ...staged.map((r) => r.url), ...catalogue.map((r) => r.id)]);
  const drafted = new Set(Object.values(draft).flat());
  for (const p of partial) {
    assert.equal(p.status, 'page-confirmed-attachments-pending', p.id);
    assert.equal(p.format, 'past-exam', p.id);
    assert.ok(p.pending.trim(), p.id);
    assert.ok(!ready.has(p.id) && !ready.has(p.url), `${p.id} is staged or published`);
    assert.ok(!drafted.has(p.id), `${p.id} is in the draft`);
  }
});

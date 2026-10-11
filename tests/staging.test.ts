import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { catalogue, LEGACY_VERIFIED, publishedResources, resourceProblems } from '../src/lib/learning-resources.ts';
import { FEATURED_RELEASE, FEATURED_RESOURCE_IDS_BY_PATH } from '../src/lib/featured.ts';
import { placementOf } from '../src/lib/placement.ts';
import { PATH_ORDER, PATH_STATUS } from '../src/lib/taxonomy.ts';

// V0.4 Gate B, Lote 02: the 18 sources opened directly (outside this environment) become typed records
// in staging. They pass every rule a published resource must pass (P1–P4), but they are not in the
// catalogue, no page imports them, and nothing here authorises publication. The other 42 stay pending.
const staging = await import('../src/lib/staging.ts').catch(() => ({})) as Record<string, any>;
const staged = (staging.STAGED_RESOURCES ?? []) as typeof catalogue;
const reverified = (staging.REVERIFIED_LEGACY ?? {}) as Record<string, { on: string; by: string; evidence: { url: string; checked: string[]; note: string } }>;
const draft = (staging.SELECTION_DRAFT ?? {}) as Record<string, string[]>;

const csv = readFileSync(new URL('../docs/superpowers/research/2026-10-11-v04-gateb-lote02-direct.csv', import.meta.url), 'utf8');
const rows = (() => {
  const parse = (text: string): string[][] => {
    const out: string[][] = []; let row: string[] = []; let cell = ''; let q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i]!;
      if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; continue; }
      if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n') { row.push(cell.replace(/\r$/, '')); out.push(row); row = []; cell = ''; } else cell += c;
    }
    if (cell || row.length) { row.push(cell); out.push(row); }
    return out;
  };
  const [head, ...body] = parse(csv.replace(/^﻿/, ''));
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head!.map((h, i) => [h, r[i] ?? ''])) as Record<string, string>);
})();
const direct = rows.filter((r) => r['direct_access_status'] === 'FONTE_ABERTA_E_ESCOPo_CONFIRMADO');

test('the Lote 02 sheet: 60 candidates, 18 opened directly, none authorised for publication', () => {
  assert.equal(rows.length, 60);
  assert.equal(direct.length, 18);
  assert.ok(rows.every((r) => r['publication_authorized'] === 'NAO'));
});

test('staging: every one of the 18 direct sources is a staged record or a re-verified published id, never both', () => {
  assert.equal(staging.STAGING_AUTHORIZES_PUBLICATION, false);
  const covered: string[] = [...staged.map((r) => r.url ?? ''), ...Object.values(reverified).map((v) => v.evidence.url)];
  for (const row of direct) assert.ok(covered.includes(row['direct_resource_url']!), `not staged: ${row['direct_resource_url']}`);
  assert.equal(covered.length, 18, 'nothing beyond the 18 direct sources');
  const pending = rows.filter((r) => r['direct_access_status'] !== 'FONTE_ABERTA_E_ESCOPo_CONFIRMADO').map((r) => r['direct_resource_url']).filter(Boolean);
  for (const r of staged) assert.ok(!pending.includes(r.url ?? ''), `${r.id} comes from a pending row`);
});

test('reuse: the published ids are re-verified, never duplicated', () => {
  assert.deepEqual(Object.keys(reverified).sort(), ['cs50p', 'cs50x', 'kultivi-writing-enem']);
  for (const [id, v] of Object.entries(reverified)) {
    assert.equal(LEGACY_VERIFIED[id], v.evidence.url, `${id}: evidence is its published URL`);
    assert.equal(v.by, 'official-page', id);
  }
  const ids = new Set(catalogue.map((r) => r.id));
  const urls = new Set(catalogue.map((r) => r.url));
  for (const r of staged) {
    assert.ok(!ids.has(r.id), `${r.id} duplicates a catalogue id`);
    assert.ok(!urls.has(r.url), `${r.id} duplicates a catalogue URL (reuse its id instead)`);
  }
  assert.equal(new Set(staged.map((r) => r.id)).size, staged.length);
});

test('every staged record passes every rule of a catalogue record (paths, exams, P3, P4) with its individual evidence', () => {
  assert.equal(staged.length, 15);
  const now = new Date('2026-10-11T23:59:59Z');
  for (const r of staged) {
    assert.deepEqual(resourceProblems(r, now), [], r.id);
    assert.ok(r.url?.startsWith('https://'), r.id);
    assert.equal(r.verified?.on, '2026-10-11', r.id);
    assert.match(r.verified?.evidence?.note ?? '', /ChatGPT/, `${r.id}: the note names who opened the source`);
  }
});

test('no lesson, past exam or reference becomes a course; the formats are the observed ones', () => {
  for (const r of staged) {
    const row = direct.find((d) => d['direct_resource_url'] === r.url)!;
    assert.equal(r.format, row['official_format_observed'], r.id);
    if (row['school_years']) assert.deepEqual([...(r.schoolYears ?? [])], [Number(row['school_years'])], r.id);
    if (row['registration_status']) assert.equal(r.registration, row['registration_status'], r.id);
    if (row['certificate_status']) assert.equal(r.certificate, row['certificate_status'], r.id);
  }
});

test('staged records are not published: not in the catalogue, not imported by any page or component', () => {
  const published = new Set(publishedResources.map((r) => r.id));
  for (const r of staged) assert.ok(!published.has(r.id), r.id);
  const walk = (dir: string): string[] => readdirSync(new URL(`../${dir}`, import.meta.url)).flatMap((n) => statSync(new URL(`../${dir}/${n}`, import.meta.url)).isDirectory() ? walk(`${dir}/${n}`) : [`${dir}/${n}`]);
  for (const file of [...walk('src/pages'), ...walk('src/components'), ...walk('src/layouts'), ...walk('scripts')]) {
    assert.ok(!/staging/.test(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')), `${file} imports staging`);
  }
});

test('nothing is released or activated by this lot', () => {
  for (const path of PATH_ORDER) {
    assert.deepEqual(FEATURED_RESOURCE_IDS_BY_PATH[path], [], path);
    assert.equal(FEATURED_RELEASE[path], 'staging', path);
  }
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.equal(PATH_STATUS['pre-militar'], 'preparing');
});

test('each staged record has a destination once its page is active, or a declared placement step (P1)', () => {
  const ACTIVE = Object.fromEntries(PATH_ORDER.map((p) => [p, 'active'])) as Record<(typeof PATH_ORDER)[number], 'active'>;
  const plans = (staging.PLACEMENT_PLAN ?? {}) as Record<string, string>;
  for (const r of staged) {
    const at = placementOf(r, ACTIVE);
    assert.ok(at !== null || plans[r.id], `${r.id}: no destination and no placement step`);
  }
});

test('the selection draft: at most ten per path, distinct across paths, each declaring its path, staged or published', () => {
  const known = new Map([...publishedResources, ...staged].map((r) => [r.id, r]));
  const seen = new Set<string>();
  for (const path of PATH_ORDER) {
    const ids = draft[path] ?? [];
    assert.ok(ids.length <= 10, path);
    for (const id of ids) {
      assert.ok(known.has(id), `${path}: ${id} is unknown`);
      assert.ok(known.get(id)!.paths.includes(path), `${path}: ${id} does not declare it`);
      assert.ok(!seen.has(id), `${id} is in two paths`);
      seen.add(id);
    }
  }
  assert.equal(seen.size, 18, 'the draft holds the 18 directly verified sources, and only them');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';

import {
  catalogue, LEGACY_VERIFIED_IDS, publishedResources, resourceProblems,
  type LearningResource,
} from '../src/lib/learning-resources.ts';
import { STAGED_RESOURCES, PARTIAL_VERIFICATIONS } from '../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES, GATEB_ADDITIONS_AUTHORIZE_PUBLICATION } from '../src/lib/staging-gateb.ts';
import { FEATURED_RELEASE, FEATURED_RESOURCE_IDS_BY_PATH } from '../src/lib/featured.ts';
import { placementOf } from '../src/lib/placement.ts';
import { PATH_ORDER, PATH_STATUS, type PathId } from '../src/lib/taxonomy.ts';

type AuditItem = {
  id: string; path: PathId; position: number; official_url: string;
  editorial_status: string; publication_authorized: boolean;
  reviewed_on: string; format?: string; registration: string; certificate: string;
};
type Audit = {
  review_version: string; approved_source_scope: number;
  featured_release_authorized: boolean; blocked: number;
  items: AuditItem[];
};
const audit = JSON.parse(readFileSync(
  new URL('../docs/superpowers/research/2026-10-11-v04-gateb-editorial-review.json', import.meta.url),
  'utf8',
)) as Audit;

const legacy = new Map(publishedResources.map((r) => [r.id, r]));
const staged = new Map(STAGED_RESOURCES.map((r) => [r.id, r]));
const additions = new Map(GATEB_NEW_RESOURCES.map((r) => [r.id, r]));
const all = new Map([...legacy, ...staged, ...additions]);
const selected = audit.items;

test('Gate B: exactly 60 independently audited slots, ten consecutive positions per path', () => {
  assert.equal(audit.review_version, '2026-10-12-editorial-05');
  assert.equal(selected.length, 60);
  assert.equal(audit.approved_source_scope, 60);
  assert.equal(audit.blocked, 0);
  assert.equal(new Set(selected.map((r) => r.id)).size, 60);
  assert.equal(new Set(selected.map((r) => r.official_url)).size, 60);
  assert.deepEqual([...new Set(selected.map((r) => r.path))].sort(), [...PATH_ORDER].sort());
  for (const path of PATH_ORDER) {
    const records = selected.filter((r) => r.path === path);
    assert.equal(records.length, 10, path);
    assert.deepEqual(records.map((r) => r.position).sort((a, b) => a - b), [1,2,3,4,5,6,7,8,9,10], path);
  }
  assert.ok(selected.every((r) => r.editorial_status === 'APROVADO_FONTE_E_ESCOPO' && !r.publication_authorized));
});

test('Gate B: reuse 23 published and 23 typed staging records, add exactly 14 without duplicates', () => {
  assert.equal(publishedResources.length, 37, 'legacy published count stays unchanged');
  assert.equal(LEGACY_VERIFIED_IDS.length, 37, 'legacy baseline remains closed');
  assert.equal(STAGED_RESOURCES.length, 23, 'typed staging from Lotes 02/03 is preserved');
  assert.equal(GATEB_NEW_RESOURCES.length, 14);
  assert.equal(legacy.size, 37);
  assert.equal(staged.size, 23);
  assert.equal(additions.size, 14);
  assert.equal(all.size, 74, 'no collision across legacy, staging and Gate B additions');
  const count = { legacy: 0, staged: 0, additions: 0 };
  for (const item of selected) {
    const categories = [legacy.has(item.id), staged.has(item.id), additions.has(item.id)];
    assert.equal(categories.filter(Boolean).length, 1, item.id);
    if (categories[0]) count.legacy++;
    if (categories[1]) count.staged++;
    if (categories[2]) count.additions++;
    assert.equal(all.get(item.id)?.url, item.official_url, `${item.id}: audited URL must match typed URL`);
    assert.ok(all.get(item.id)?.paths.includes(item.path), `${item.id}: must declare its path`);
  }
  assert.deepEqual(count, { legacy: 23, staged: 23, additions: 14 });
  const urls = [...publishedResources, ...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES]
    .map((r) => r.url).filter((url): url is string => url !== null);
  assert.equal(new Set(urls).size, urls.length, 'source URLs must not be duplicated across catalogues');
});

test('Gate B: all fourteen new typed resources obey the existing P4 contract', () => {
  const atReview = new Date('2026-10-12T23:59:59Z');
  for (const resource of GATEB_NEW_RESOURCES) {
    const audited = selected.find((item) => item.id === resource.id);
    assert.ok(audited, resource.id);
    assert.deepEqual(resourceProblems(resource, atReview), [], resource.id);
    assert.equal(resource.verified?.on, audited.reviewed_on, resource.id);
    assert.equal(resource.verified?.by, 'official-page', resource.id);
    assert.equal(resource.verified?.freeAccess, true, resource.id);
    assert.equal(resource.verified?.evidence?.url, resource.url, resource.id);
    assert.equal(resource.format, audited.format, resource.id);
    assert.equal(resource.registration, audited.registration, resource.id);
    assert.equal(resource.certificate, audited.certificate, resource.id);
    assert.equal(resource.schoolYears, undefined, 'no invented school grade');
    assert.ok(resource.verified?.evidence?.note.trim(), resource.id);
    assert.ok(resource.url?.startsWith('https://'), resource.id);
    assert.deepEqual(resource.paths, [audited.path], resource.id);
    assert.ok(!resource.exams?.includes('uerj'), 'Cecierj references are not official UERJ exam questions');
  }
});

test('Gate B: five Cecierj apostilas are references, never courses or official UERJ exams', () => {
  const expected = new Map([
    ['cecierj-pvs-portugues-v1', 'portugues'],
    ['cecierj-pvs-matematica-mod1', 'matematica'],
    ['cecierj-pvs-historia-mod2', 'historia'],
    ['cecierj-pvs-geografia-mod1', 'geografia'],
    ['cecierj-pvs-fisica-v1', 'fisica'],
  ]);
  for (const [id, subject] of expected) {
    const resource = additions.get(id);
    assert.ok(resource, id);
    assert.equal(resource.subject, subject, id);
    assert.equal(resource.format, 'reference', id);
    assert.deepEqual(resource.paths, ['vestibulares'], id);
    assert.equal(resource.registration, 'unconfirmed', id);
    assert.equal(resource.certificate, 'unconfirmed', id);
    assert.equal(resource.exams, undefined, id);
  }
});

test('Gate B: eight institutional exam booklets and AprovaRJ are accurately classified', () => {
  const military = GATEB_NEW_RESOURCES.filter((r) => r.paths.includes('pre-militar'));
  assert.equal(military.length, 9);
  const exams = military.filter((r) => r.format === 'past-exam');
  assert.equal(exams.length, 8);
  for (const exam of exams) {
    assert.equal(exam.subject, null, exam.id);
    assert.equal(exam.level, 'exam-prep', exam.id);
    assert.equal(exam.registration, 'not-required', exam.id);
    assert.equal(exam.certificate, 'unconfirmed', exam.id);
    assert.ok(exam.verified?.evidence?.checked.includes('registration'), exam.id);
    assert.ok(!exam.verified?.evidence?.checked.includes('certificate'), exam.id);
  }
  const aprovarj = additions.get('cecierj-aprovarj');
  assert.ok(aprovarj);
  assert.equal(aprovarj.format, 'course');
  assert.equal(aprovarj.subject, null);
  assert.equal(aprovarj.registration, 'required');
  assert.equal(aprovarj.certificate, 'none');
  assert.ok(aprovarj.verified?.evidence?.checked.includes('registration'));
  assert.ok(aprovarj.verified?.evidence?.checked.includes('certificate'));
  assert.equal(additions.has('pm-espcex-provas'), false, 'the inaccessible EsPCEx PDF is not verified');
});

test('Gate B: placement of new resources resolves when the corresponding paths are active', () => {
  const states = Object.fromEntries(PATH_ORDER.map((p) => [p, 'active'])) as Record<PathId, 'active'>;
  for (const resource of GATEB_NEW_RESOURCES) {
    const location = placementOf(resource, states);
    assert.ok(location, `${resource.id}: no future destination`);
    assert.equal(location?.anchor, `recurso-${resource.id}`);
    if (resource.paths.includes('pre-militar')) assert.equal(location?.page, '/pre-militar/', resource.id);
    else assert.ok(location?.page.startsWith('/materias/'), resource.id);
  }
});

test('Gate B: incomplete or misleading source evidence fails closed', () => {
  const sample = additions.get('pm-esa-provas-2026')!;
  const base = sample.verified!;
  const evidence = base.evidence!;
  const omitRegistration: LearningResource = {
    ...sample,
    verified: { ...base, evidence: { ...evidence, checked: evidence.checked.filter((c) => c !== 'registration') } },
  };
  assert.match(resourceProblems(omitRegistration).join('\n'), /registration not checked/);
  const wrongHost: LearningResource = {
    ...sample, verified: { ...base, evidence: { ...evidence, url: 'https://unverified.example.invalid/fake.pdf' } },
  };
  assert.match(resourceProblems(wrongHost).join('\n'), /evidence is not on the resource's own host/);
  const fakeCertificate: LearningResource = { ...sample, certificate: 'none' };
  assert.match(resourceProblems(fakeCertificate).join('\n'), /certificate not checked/);
  assert.match(resourceProblems(sample, new Date('2026-10-11T23:59:59Z')).join('\n'), /verified in the future/);
});

test('Gate B: publication remains disabled and all earlier partial attempts remain historical', () => {
  assert.equal(GATEB_ADDITIONS_AUTHORIZE_PUBLICATION, false);
  assert.equal(audit.featured_release_authorized, false);
  assert.deepEqual(PARTIAL_VERIFICATIONS.map((p) => p.id).sort(), ['pm-cn-provas', 'pm-eear-provas', 'pm-en-provas']);
  assert.ok(GATEB_NEW_RESOURCES.every((r) => !catalogue.some((p) => p.id === r.id)));
  for (const path of PATH_ORDER) {
    assert.deepEqual(FEATURED_RESOURCE_IDS_BY_PATH[path], [], path);
    assert.equal(FEATURED_RELEASE[path], 'staging', path);
  }
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.equal(PATH_STATUS['pre-militar'], 'preparing');

  const walk = (dir: string): string[] => readdirSync(new URL(`../${dir}`, import.meta.url))
    .flatMap((name) => statSync(new URL(`../${dir}/${name}`, import.meta.url)).isDirectory()
      ? walk(`${dir}/${name}`) : [`${dir}/${name}`]);
  for (const file of [...walk('src/pages'), ...walk('src/components'), ...walk('src/layouts'), ...walk('scripts')]) {
    assert.doesNotMatch(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), /staging-gateb/, `${file} imports private staging`);
  }
});

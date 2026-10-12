// Paths, highlights and destinations over a partial release (master prompt Phases C–D, scenarios 4 and
// 9–13). A separate context from tests/release-candidate/: a few simulated approvals, never the 60.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { activationProblems } from '../../src/lib/path-status.ts';
import { FEATURED_PER_PATH, featuredProblems, featuredReady } from '../../src/lib/featured.ts';
import { placementOf } from '../../src/lib/placement.ts';
import { resourceDisplayFacts } from '../../src/lib/resource-display.ts';
import { routes } from '../../src/lib/routes.ts';
import { PATH_ORDER, PATH_STATUS, type PathId, type PathState } from '../../src/lib/taxonomy.ts';
import { pt } from '../../src/i18n/pt.ts';
import { entryFor, inventoryWith, lotOf, project, releaseOf, SIMULATED_BY } from './fixtures.ts';

type Selection = Record<PathId, readonly string[]>;
const EMPTY: Selection = Object.fromEntries(PATH_ORDER.map((p) => [p, []])) as unknown as Selection;
const STAGING = Object.fromEntries(PATH_ORDER.map((p) => [p, 'staging'])) as Record<PathId, 'staging'>;
const ACTIVE_GATED: Record<PathId, PathState> = { ...PATH_STATUS, 'ensino-fundamental': 'active', 'pre-militar': 'active' };

// One Fundamental lesson and one Pré-Militar exam collection, plus a course each for Superior and Tecnologia.
const PARTIAL = ['ef-obmep-fracoes-6', 'ita-provas-anteriores', 'mit-1801sc', 'google-mlcc'];
const lot = lotOf('L001-parcial', PARTIAL.map((id) => entryFor(id)));
const partial = project({ lots: [lot], release: releaseOf([lot], inventoryWith(PARTIAL)) });

test('the partial projection holds: 37 + 4, no problem', () => {
  assert.deepEqual(partial.problems, []);
  assert.equal(partial.published.length, 41);
});

test('13. Fundamental and Pré-Militar activate with one approved resource on their own page, without ten highlights', () => {
  assert.deepEqual(activationProblems(ACTIVE_GATED, EMPTY, partial.published, STAGING), []);
  for (const [path, id] of [['ensino-fundamental', 'ef-obmep-fracoes-6'], ['pre-militar', 'ita-provas-anteriores']] as const) {
    const r = partial.published.find((x) => x.id === id)!;
    assert.equal(placementOf(r, ACTIVE_GATED, partial.published)?.page, routes.objective(path), id);
    assert.equal(featuredReady(path, EMPTY, partial.published), false, `${path}: no "Destaques" section`);
  }
});

test('9. an active gated path with no approved resource on its own page is refused', () => {
  const tech = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const onlyTech = project({ lots: [tech], release: releaseOf([tech], inventoryWith(['google-mlcc'])) });
  assert.deepEqual(onlyTech.problems, []);
  const found = activationProblems(ACTIVE_GATED, EMPTY, onlyTech.published, STAGING).join('\n');
  assert.match(found, /ensino-fundamental: active without a page that shows its resources/);
  assert.match(found, /pre-militar: active without a page that shows its resources/);
  // The same resource present but held (not approved) changes nothing.
  const held = lotOf('L001-retido', [entryFor('ef-obmep-fracoes-6', { decision: 'held', reason: 'Pendência simulada', decidedBy: SIMULATED_BY })]);
  const heldOnly = project({ lots: [held], release: releaseOf([held], inventoryWith([])) });
  assert.deepEqual(heldOnly.problems, []);
  assert.match(activationProblems({ ...PATH_STATUS, 'ensino-fundamental': 'active' }, EMPTY, heldOnly.published, STAGING).join('\n'), /ensino-fundamental: active without a page/);
});

test('10. incomplete highlights are never published: no filling, no repetition, no section', () => {
  const nine: Selection = { ...EMPTY, tecnologia: partial.published.filter((r) => r.paths.includes('tecnologia')).slice(0, 9).map((r) => r.id) };
  assert.ok(nine.tecnologia.length < FEATURED_PER_PATH);
  assert.equal(featuredReady('tecnologia', nine, partial.published), false);
  assert.match(featuredProblems(nine, 'final', partial.published).join('\n'), /tecnologia: \d of 10/);
  assert.match(activationProblems(PATH_STATUS, nine, partial.published, { ...STAGING, tecnologia: 'released' }).join('\n'), /tecnologia: released without ten valid highlights/);
  const repeated: Selection = { ...EMPTY, tecnologia: Array.from({ length: 10 }, () => 'google-mlcc') };
  assert.match(featuredProblems(repeated, 'staging', partial.published).join('\n'), /google-mlcc is listed twice/);
});

test('11. a highlight that is suspended is refused, and the release holds until the selection is fixed', () => {
  const suspension = lotOf('L002-suspensao', [], { suspensions: [{ id: 'google-mlcc', reason: 'Suspensão simulada', decidedBy: SIMULATED_BY, decidedOn: '2026-10-12' }] });
  const after = project({ lots: [lot, suspension], release: releaseOf([lot, suspension], inventoryWith(PARTIAL.filter((id) => id !== 'google-mlcc'))) });
  assert.deepEqual(after.problems, []);
  const withSuspended: Selection = { ...EMPTY, tecnologia: ['google-mlcc'] };
  assert.match(featuredProblems(withSuspended, 'staging', after.published).join('\n'), /tecnologia: google-mlcc is not a published resource/);
  assert.match(activationProblems(PATH_STATUS, withSuspended, after.published, { ...STAGING, tecnologia: 'released' }).join('\n'), /tecnologia: released without ten valid highlights/);
});

test('12. every approved resource has a destination page and its own anchor', () => {
  for (const id of PARTIAL) {
    const r = partial.published.find((x) => x.id === id)!;
    const at = placementOf(r, ACTIVE_GATED, partial.published);
    if (!at) throw new Error(`${id}: no page`);
    assert.equal(at.anchor, `recurso-${id}`);
  }
  // With the gated paths still in preparation, their resources have no page: they cannot be published
  // without activating the path (the build's placement guard refuses it).
  const ef = partial.published.find((x) => x.id === 'ef-obmep-fracoes-6')!;
  assert.equal(placementOf(ef, PATH_STATUS, partial.published), null);
});

test('4. an unknown certificate or registration is never displayed as a claim', () => {
  const unknown = partial.published.filter((r) => r.certificate === 'unconfirmed' || r.registration === 'unconfirmed');
  assert.deepEqual(unknown.map((r) => r.id), ['ef-obmep-fracoes-6', 'google-mlcc'], 'the partial lot holds records with unknown facts');
  for (const r of unknown) {
    const { access } = resourceDisplayFacts(r, pt.resource);
    if (r.certificate === 'unconfirmed') for (const label of Object.values(pt.resource.certificates)) assert.ok(!access.includes(label), `${r.id}: ${label}`);
    if (r.registration === 'unconfirmed') for (const label of Object.values(pt.resource.registration)) assert.ok(!access.includes(label), `${r.id}: ${label}`);
  }
});

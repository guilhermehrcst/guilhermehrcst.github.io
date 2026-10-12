import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RC_CATALOGUE } from './context.ts';
import { officialSources } from '../../src/lib/official-sources.ts';
import { anchorPlan } from '../../src/lib/search-index.ts';
import { GATEB_DRAFT_SELECTION } from '../../src/lib/gateb-selection-preview.ts';

// P2-RC5 (homologation 2026-10-12): published, the INEP collection (inep-enem-provas-gabaritos) sits in the
// ENEM "Pratique" section next to the source note that cites the same INEP page: the same link twice.
// The resource stays (with its anchor, selected for Vestibular); the note keeps citing INEP and its date,
// but points to the resource on the page instead of repeating the external link.
const guides = await import('../../src/lib/exam-guides.ts') as Record<string, any>;

test('release candidate: the INEP collection is in Pratique, anchored on /enem/, and it is the cited source', () => {
  const practice = guides.resolveGuide('enem', RC_CATALOGUE).find((s: any) => s.id === 'pratique');
  assert.ok(practice.resources.some((r: any) => r.id === 'inep-enem-provas-gabaritos'));
  const shown = guides.sourceShownAsResource?.('inep-provas-gabaritos', practice.resources);
  assert.equal(shown?.id, 'inep-enem-provas-gabaritos');
  assert.equal(shown?.url, officialSources['inep-provas-gabaritos'].url);
  const [anchors] = anchorPlan('/enem/', [practice.resources], RC_CATALOGUE);
  assert.ok(anchors!.has('inep-enem-provas-gabaritos'), 'its anchor is on /enem/');
  assert.ok(GATEB_DRAFT_SELECTION.vestibulares.includes('inep-enem-provas-gabaritos'), 'still selected');
  assert.equal(Object.values(GATEB_DRAFT_SELECTION).flat().length, 60);
});

test('today: the source is not shown as a resource, so the note keeps its external link', () => {
  const practice = guides.resolveGuide('enem').find((s: any) => s.id === 'pratique');
  assert.equal(guides.sourceShownAsResource?.('inep-provas-gabaritos', practice.resources) ?? null, null);
});

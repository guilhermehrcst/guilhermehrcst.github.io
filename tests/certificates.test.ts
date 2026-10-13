import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogue } from '../src/lib/learning-resources.ts';
import { STAGED_RESOURCES } from '../src/lib/staging.ts';
import { pt } from '../src/i18n/pt.ts';

// V0.4 QA (2026-10-12): The Open University gives a free statement of *participation*, not of completion.
// It had been typed 'statement', which the site reads "Declaração de conclusão" (FGV's statements). It is
// now its own value, with its own label; FGV's meaning is unchanged.
test('The Open University: a statement of participation, labelled as such', () => {
  const ou = STAGED_RESOURCES.find((r) => r.id === 'ou-environment-treading-lightly')!;
  assert.equal(ou.certificate as string, 'participation');
  assert.match(ou.verified?.evidence?.note ?? '', /declaração gratuita de participação/);
  assert.equal((pt.resource.certificates as Record<string, string>).participation, 'Declaração de participação');
});

test('FGV statements keep their meaning and label', () => {
  for (const id of ['fgv-datasci', 'fgv-security']) assert.equal(catalogue.find((r) => r.id === id)!.certificate, 'statement', id);
  assert.equal(pt.resource.certificates.statement, 'Declaração de conclusão');
});

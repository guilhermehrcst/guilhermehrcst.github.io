// The terminal's narration is built from the dictionaries: same chapters, same order, both languages,
// and nothing the page does not already say.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNarrative } from '../src/lib/narrative-content.ts';
import { NARRATIVE_ORDER } from '../src/lib/narrative-state.ts';
import { influenceRoster } from '../src/lib/influence-roster.ts';
import { en } from '../src/i18n/en.ts';
import { pt } from '../src/i18n/pt.ts';

for (const [lang, dict] of [['en', en], ['pt', pt]] as const) {
  test(`${lang}: ten chapters, in reading order`, () => {
    const n = buildNarrative(dict);
    assert.equal(n.length, 10);
    assert.deepEqual(n.map((c) => c.id), [...NARRATIVE_ORDER]);
  });

  test(`${lang}: every chapter has a command and at least one line`, () => {
    for (const c of buildNarrative(dict)) {
      assert.ok(c.command.trim().length > 0, `${c.id}: empty command`);
      assert.ok(c.lines.length > 0, `${c.id}: no lines`);
      for (const l of c.lines) assert.ok(l.trim().length > 0, `${c.id}: empty line`);
    }
  });

  test(`${lang}: influences name all eight people`, () => {
    const text = buildNarrative(dict).find((c) => c.id === 'influences')!.lines.join('\n');
    assert.equal(influenceRoster.length, 8);
    for (const p of influenceRoster) assert.ok(text.includes(p.name), `missing ${p.name}`);
  });

  test(`${lang}: Pexis Machine says only what its section says`, () => {
    const pm = dict.pexisMachine;
    const said = [pm.name, pm.kind, pm.question, pm.body, ...pm.facts.flatMap((f) => [f.title, f.body])];
    for (const l of buildNarrative(dict).find((c) => c.id === 'pexis-machine')!.lines) {
      assert.ok(said.includes(l), `not in dict.pexisMachine: ${l}`);
    }
  });
}

test('commands are the same code-like tokens in both languages', () => {
  assert.deepEqual(buildNarrative(en).map((c) => c.command), buildNarrative(pt).map((c) => c.command));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pt } from '../src/i18n/pt.ts';

// V0.4: the copy of Fundamental and Pré-Militar follows PATH_STATUS. Each page has one copy per state; the
// page picks it with isPreparing, so a future activation changes the words (SEO description included)
// in the same commit as the status, and an active page never speaks of preparation or of the future.
const copy = pt as unknown as Record<string, any>;
const GATED = { 'ensino-fundamental': 'fundamental', 'pre-militar': 'preMilitar' } as const;
const strings = (value: unknown): string[] =>
  typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(strings) : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
const PREPARING_WORDS = /prepara[çc][ãa]o|ainda n[ãa]o|vamos|receber[áa]|\bter[áa]\b|vai reunir|vai se organizar|em breve|previst/i;

for (const [page, key] of Object.entries(GATED)) {
  test(`${page}: one copy per state, with the SEO description and the lead`, () => {
    const byState = copy[key]?.byState;
    assert.ok(byState, `${key}.byState is missing`);
    for (const state of ['preparing', 'active']) {
      assert.ok(byState[state]?.description?.trim(), `${page} ${state}: description`);
      assert.ok(byState[state]?.lead?.trim(), `${page} ${state}: lead`);
    }
  });

  test(`${page}: in preparation the copy says so; active, it never speaks of preparation or the future`, () => {
    const byState = copy[key]?.byState ?? {};
    assert.match(`${byState.preparing?.description} ${byState.preparing?.lead}`, /prepara[çc][ãa]o|ainda n[ãa]o/i);
    for (const text of strings(byState.active)) assert.doesNotMatch(text, PREPARING_WORDS, `${page} active: "${text}"`);
    assert.ok(strings(byState.active).length >= 4, `${page} active: copy for every state-dependent text`);
  });

  test(`${page}: the description and the lead live only in the state copy (one source)`, () => {
    const entry = copy.pages[page];
    assert.ok(!('description' in entry) && !('lead' in entry), `${page}: pages still holds a description or lead`);
    const source = readFileSync(new URL(`../src/pages/${page}/index.astro`, import.meta.url), 'utf8');
    assert.match(source, /byState\[preparing \? 'preparing' : 'active'\]/, `${page}: the page does not pick its copy by state`);
  });
}

test('the state-independent copy of both pages never speaks of the future', () => {
  const { byState: _f, ...fundamental } = copy.fundamental;
  const { byState: _m, ...preMilitar } = copy.preMilitar;
  // Section copy shown only in preparation (subjects in preparation, "meanwhile") is moved into byState.
  for (const text of [...strings(fundamental), ...strings(preMilitar)]) assert.doesNotMatch(text, /vamos|receber[áa]|\bter[áa]\b|vai reunir|vai se organizar|previst/i, text);
});

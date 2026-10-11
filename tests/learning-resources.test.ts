import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AREA_ORDER, AREA_SUBJECTS, catalogue, publishedResources } from '../src/lib/learning-resources.ts';

const legacyPublished = new Map([
  ['cs50x', 'https://cs50.harvard.edu/x/'],
  ['cs50p', 'https://cs50.harvard.edu/python/'],
  ['mit-6100l', 'https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/'],
  ['fb-python', 'https://www.ev.org.br/cursos/linguagem-de-programacao-python-basico'],
  ['fb-web', 'https://www.ev.org.br/cursos/crie-um-site-simples-usando-html-css-e-javascript'],
  ['cs50w', 'https://cs50.harvard.edu/web/'],
  ['cs50ai', 'https://cs50.harvard.edu/ai/'],
  ['fluencia', 'https://www.ev.org.br/cursos/fluencia'],
  ['fgv-datasci', 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/introducao-ciencia-de-dados'],
  ['mit-60002', 'https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/'],
  ['cs50sql', 'https://cs50.harvard.edu/sql/'],
  ['mit-6006', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/'],
  ['mit-6042j', 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/'],
  ['mit-1806', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'],
  ['cisco-cyber', 'https://www.netacad.com/courses/introduction-to-cybersecurity'],
  ['fgv-security', 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/seguranca-digital'],
  ['fgv-privacy', 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/protecao-de-dados'],
]);

test('resource ids are unique', () => {
  assert.equal(new Set(catalogue.map((r) => r.id)).size, catalogue.length);
});

test('published resources are HTTPS and explicitly verified free', () => {
  for (const r of publishedResources) {
    assert.match(r.url, /^https:\/\//);
    assert.equal(r.verified.freeAccess, true);
    assert.ok(r.verified.on.length > 0);
    assert.ok(r.verified.by.length > 0);
  }
});

test('every resource subject belongs to its declared area', () => {
  for (const r of catalogue) assert.ok(AREA_SUBJECTS[r.area].includes(r.subject), `${r.id}: invalid ${r.area}/${r.subject}`);
});

test('held-back resources explain why they are not published', () => {
  for (const r of catalogue.filter((r) => r.url === null)) assert.ok(r.review?.trim(), `${r.id}: missing review note`);
});

test('the legacy technology catalogue keeps every previously published id and URL', () => {
  for (const [id, url] of legacyPublished) {
    const r = catalogue.find((item) => item.id === id);
    assert.ok(r, `missing ${id}`);
    assert.equal(r.url, url, `${id}: URL drifted`);
    assert.equal(r.area, 'technology');
    assert.equal(r.subject, 'technology');
  }
});


test('V0.1 seed covers every academic area and school subject', () => {
  for (const area of ['math', 'portuguese', 'writing', 'english', 'spanish'] as const) {
    assert.ok(publishedResources.some((r) => r.area === area), `missing area ${area}`);
  }
  for (const subject of ['physics', 'chemistry', 'biology', 'history', 'geography', 'philosophy', 'sociology'] as const) {
    assert.ok(publishedResources.some((r) => r.subject === subject), `missing subject ${subject}`);
  }
});

test('V0.1 seed includes free practice for ENEM and UERJ', () => {
  for (const goal of ['enem', 'uerj'] as const) {
    assert.ok(publishedResources.some((r) => r.format === 'practice' && r.goals.includes(goal)), `missing practice for ${goal}`);
  }
});

test('every published technology resource has fresh free-access verification', () => {
  for (const r of publishedResources.filter((item) => item.area === 'technology')) {
    assert.equal(r.verified.on, '2026-10-11', `${r.id}: stale verification`);
    assert.equal(r.verified.freeAccess, true, `${r.id}: not free-verified`);
  }
});


test('the eight primary areas have one canonical reading order', () => {
  assert.deepEqual(AREA_ORDER, ['technology', 'math', 'portuguese', 'writing', 'nature', 'humanities', 'english', 'spanish']);
});

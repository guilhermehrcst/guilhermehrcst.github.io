import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { publishedResources, type PublishedLearningResource } from '../src/lib/learning-resources.ts';
import { pt } from '../src/i18n/pt.ts';
import { resourceDisplayFacts } from '../src/lib/resource-display.ts';

const byId = (id: string): PublishedLearningResource => {
  const resource = publishedResources.find((r) => r.id === id);
  if (!resource) throw new Error(`missing legacy test resource ${id}`);
  return resource;
};

test('frontend: a free-account requirement is visible before opening a course', () => {
  const facts = resourceDisplayFacts(byId('kultivi-math-enem'), pt.resource);
  assert.deepEqual(facts.overview.slice(0, 2), ['Curso', 'Em português']);
  assert.ok(facts.access.includes('Conta gratuita necessária'));
  assert.ok(facts.access.includes('Certificado disponível'));
  assert.ok(!facts.overview.includes('Conta gratuita necessária'));
});

test('frontend: access requirements stay separate from format, language and duration', () => {
  const inep = byId('inep-writing-2026');
  const facts = resourceDisplayFacts(inep, pt.resource);
  assert.ok(facts.overview.includes('Prática'));
  assert.ok(facts.overview.includes('Em português'));
  assert.deepEqual(facts.access, ['Sem cadastro']);
});

test('frontend: unconfirmed access and certificate are never shown as facts', () => {
  const source = byId('kultivi-math-enem');
  const unknown: PublishedLearningResource = { ...source, registration: 'unconfirmed', certificate: 'unconfirmed' };
  const result = resourceDisplayFacts(unknown, pt.resource);
  assert.deepEqual(result.access, []);
  const none: PublishedLearningResource = { ...source, registration: 'not-required', certificate: 'none' };
  assert.deepEqual(resourceDisplayFacts(none, pt.resource).access, ['Sem cadastro']);
});

test('frontend: compact rows preserve the provider name without adding extra access claims', () => {
  const item = byId('kultivi-math-enem');
  const regular = resourceDisplayFacts(item, pt.resource);
  const compact = resourceDisplayFacts(item, pt.resource, true);
  assert.equal(regular.overview.includes(item.provider), false);
  assert.equal(compact.overview[0], item.provider);
  assert.deepEqual(regular.access, compact.access);
});

test('frontend: the visible source action stays inside the single official outbound link', () => {
  const template = readFileSync(new URL('../src/components/ResourceItem.astro', import.meta.url), 'utf8');
  const linkIndex = template.indexOf('<a href={r.url} target="_blank" rel="noopener noreferrer">');
  const closeIndex = template.indexOf('</a>', linkIndex);
  const actionIndex = template.indexOf('data-source-action');
  assert.ok(linkIndex >= 0 && closeIndex > linkIndex, 'resource official URL remains a single safe outbound link');
  assert.ok(actionIndex > linkIndex && actionIndex < closeIndex, 'source action must be inside the official link');
  assert.match(template.slice(linkIndex, closeIndex), /aria-hidden="true"[^>]*>\{l\.openSource\}/);
  assert.equal((template.match(/<a\s/g) ?? []).length, 1, 'never duplicate the external anchor');
});

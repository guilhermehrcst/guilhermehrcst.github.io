import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OFFICIAL_HOSTS, officialSources } from '../src/lib/official-sources.ts';

const list = Object.entries(officialSources);

test('the V0.1 official sources are exactly the ones recorded in the source audit', () => {
  assert.deepEqual(list.map(([id]) => id).sort(), ['inep-matrizes', 'inep-provas-gabaritos', 'uerj-faq']);
});

test('official hosts are a closed list', () => {
  assert.deepEqual([...OFFICIAL_HOSTS].sort(), ['sistema.vestibular.uerj.br', 'www.gov.br', 'www.revista.vestibular.uerj.br']);
});

test('every source is HTTPS, on an official host, issued by INEP or UERJ, and verified', () => {
  for (const [id, source] of list) {
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:', id);
    assert.ok(OFFICIAL_HOSTS.has(url.hostname), `${id}: ${url.hostname}`);
    assert.ok(source.issuer === 'inep' || source.issuer === 'uerj', id);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(source.verified.on), id);
    assert.equal(source.verified.by, 'official-page', id);
    assert.ok(source.title.trim().length > 3, id);
  }
});

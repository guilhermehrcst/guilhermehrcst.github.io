import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { canonicalJson, digestOf } from '../../src/lib/release/canonical.ts';

test('canonical JSON: key order never changes the text, array order always does', () => {
  assert.equal(canonicalJson({ b: 1, a: { d: [3, 1], c: 'x' } }), '{"a":{"c":"x","d":[3,1]},"b":1}');
  assert.equal(canonicalJson({ a: 1, b: 2 }), canonicalJson({ b: 2, a: 1 }));
  assert.notEqual(canonicalJson([1, 2]), canonicalJson([2, 1]));
});

test('canonical JSON: an absent field and an undefined field are the same record', () => {
  assert.equal(canonicalJson({ a: 1, b: undefined }), canonicalJson({ a: 1 }));
});

test('canonical JSON: refuses values that have no single serialization', () => {
  for (const bad of [NaN, Infinity, -Infinity, 1n, () => 1, Symbol('s'), new Date(0), new Map(), [undefined]]) {
    assert.throws(() => canonicalJson({ v: bad }), /canonical/, String(typeof bad));
  }
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  assert.throws(() => canonicalJson(cycle), /canonical/);
});

test('digest: sha256 of the canonical text, prefixed, independent of key order', () => {
  const text = canonicalJson({ id: 'x', url: 'https://a.example/' });
  assert.equal(digestOf({ url: 'https://a.example/', id: 'x' }), `sha256:${createHash('sha256').update(text).digest('hex')}`);
  assert.match(digestOf({}), /^sha256:[0-9a-f]{64}$/);
  assert.notEqual(digestOf({ title: 'Á' }), digestOf({ title: 'A' }));
});

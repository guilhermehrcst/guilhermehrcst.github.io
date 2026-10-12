import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RC_CATALOGUE } from './context.ts';
import { higherEducationGroupsFor, resolveGroups } from '../../src/lib/higher-education.ts';
import { UNIVERSITY_PUBLISHERS } from '../university-publishers.ts';

// P1-RC2 / P2-RC4 (homologation 2026-10-12): with the Gate B candidates published, Superior shows seven
// fields. The two V0.3 groups keep their order, ids and at least two courses; each new field holds at
// least one published, verified course; none is empty; every course comes from a university.
const groups = resolveGroups(higherEducationGroupsFor(RC_CATALOGUE), RC_CATALOGUE);

test('release candidate: seven fields in plan order, the V0.3 groups intact and first', () => {
  assert.deepEqual(groups.map((g) => g.id), ['matematica', 'computacao', 'fisica', 'biologia', 'psicologia', 'economia', 'meio-ambiente']);
  assert.deepEqual(groups[0]!.resources.map((r) => r.id), ['mit-1806', 'mit-6042j', 'mit-1801sc']);
  assert.deepEqual(groups[1]!.resources.map((r) => r.id), ['cs50x', 'mit-6100l', 'mit-6006', 'mit-60002']);
  for (const g of groups) assert.ok(g.resources.length >= 1, g.id);
});

test('release candidate: every course is published once, verified, and by a university', () => {
  const all = groups.flatMap((g) => g.resources);
  assert.equal(new Set(all.map((r) => r.id)).size, all.length);
  for (const r of all) {
    assert.ok(r.verified, r.id);
    assert.ok(UNIVERSITY_PUBLISHERS.includes(r.provider), `${r.id}: ${r.provider}`);
  }
});

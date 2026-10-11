import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COURSE_HOSTS } from '../src/lib/learning-resources.ts';
import { OFFICIAL_HOSTS } from '../src/lib/official-sources.ts';

// scripts/verify-dist.mjs keeps its own, hand-written host lists (an independent barrier). They must not
// drift from the data they mirror.
const script = readFileSync(new URL('../scripts/verify-dist.mjs', import.meta.url), 'utf8');
const listed = (name: string): string[] => {
  const body = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`).exec(script)?.[1] ?? '';
  return [...body.matchAll(/'([^']+)'/g)].map((m) => m[1]!).sort();
};

test('verify-dist COURSE_HOSTS equals the hosts of published resources', () => {
  assert.deepEqual(listed('COURSE_HOSTS'), [...COURSE_HOSTS].sort());
});

test('verify-dist OFFICIAL_HOSTS equals the official-source hosts', () => {
  assert.deepEqual(listed('OFFICIAL_HOSTS'), [...OFFICIAL_HOSTS].sort());
});

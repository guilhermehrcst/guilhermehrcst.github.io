// docs/academy/launch/rehearse.sh never deletes or reuses a directory it did not create: an unknown plan
// or a workdir that exists, is the root or is not absolute is refused before anything is written.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const REPO = new URL('../../', import.meta.url).pathname;
const rehearse = (...args: string[]): { ok: boolean; out: string } => {
  try {
    return { ok: true, out: execFileSync('bash', [`${REPO}docs/academy/launch/rehearse.sh`, ...args], { encoding: 'utf8', cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch (error) {
    return { ok: false, out: String((error as { stderr?: string }).stderr ?? error) };
  }
};
const sentinelDir = (): string => {
  const dir = `/tmp/academy-launch-kit-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  execFileSync('mkdir', ['-p', dir], { encoding: 'utf8' });
  writeFileSync(`${dir}/keep.txt`, 'real data');
  return dir;
};

test('rehearse.sh refuses an unknown plan before writing anything', () => {
  const dir = `/tmp/academy-launch-kit-test-none-${Date.now()}`;
  const result = rehearse('plan-z', dir);
  assert.equal(result.ok, false);
  assert.match(result.out, /unknown plan/);
  assert.equal(existsSync(dir), false);
});

test('rehearse.sh never deletes or reuses an existing directory, the root, or a relative path', () => {
  const dir = sentinelDir();
  // Never a shared real directory here: if the guard regressed, the test itself would delete it.
  for (const target of [dir, '/', 'relative/dir', '']) {
    const result = rehearse('plan-b', target);
    assert.equal(result.ok, false, target);
    assert.match(result.out, /workdir/, target);
  }
  assert.equal(readFileSync(`${dir}/keep.txt`, 'utf8'), 'real data', 'the existing directory is untouched');
  execFileSync('rm', ['-rf', dir], { encoding: 'utf8' });
});

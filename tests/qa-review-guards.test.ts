import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = '../docs/superpowers/qa/2026-10-12-v04-evidence/';
const source = (file: string): string => readFileSync(new URL(base + file, import.meta.url), 'utf8');

test('QA review: all amended evidence scripts parse in their respective runtimes', () => {
  const python = source('rc-apply.py');
  const py = spawnSync('python3', ['-c', 'import ast,sys;ast.parse(sys.stdin.read())'], {
    input: python, encoding: 'utf8',
  });
  assert.equal(py.status, 0, py.stderr || 'Python QA parser failed');

  for (const name of ['phaseD.mjs', 'phaseE.mjs', 'partial.mjs']) {
    const cmd = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(base + name, import.meta.url))], {
      encoding: 'utf8',
    });
    assert.equal(cmd.status, 0, `${name}: ${cmd.stderr}`);
  }
});

test('QA review: RC simulation validates all sixty selected IDs before modifying checkout', () => {
  const canonical = JSON.parse(readFileSync(new URL(base + 'rc-selection.json', import.meta.url), 'utf8')) as Record<string, string[]>;
  const temp = mkdtempSync(join(tmpdir(), 'academy-qa-selection-'));
  try {
    const file = join(temp, 'selection.json');
    const incomplete = { ...canonical, 'pre-militar': canonical['pre-militar']!.slice(0, 9) };
    writeFileSync(file, JSON.stringify(incomplete));
    const run = spawnSync('python3', [fileURLToPath(new URL(base + 'rc-apply.py', import.meta.url)), join(temp, 'not-a-checkout'), file], {
      encoding: 'utf8',
    });
    assert.notEqual(run.status, 0, 'incomplete QA selection must fail closed');
    assert.match(run.stderr, /exactly 10 nonempty selected IDs/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('QA review: no unselected staged resource may enter RC catalogue', () => {
  const py = source('rc-apply.py');
  assert.match(py, /len\(selected_ids\) == 60 and len\(set\(selected_ids\)\) == 60/);
  assert.match(py, /RELEASE_CANDIDATE_SELECTED_IDS: ReadonlySet<string>/);
  assert.match(py, /STAGED_RESOURCES\.filter\(\(r\) => RELEASE_CANDIDATE_SELECTED_IDS\.has\(r\.id\)\)/);
  assert.match(py, /GATEB_NEW_RESOURCES\.filter\(\(r\) => RELEASE_CANDIDATE_SELECTED_IDS\.has\(r\.id\)\)/);
  assert.doesNotMatch(py, /\.\.\.STAGED_RESOURCES,\s*\.\.\.GATEB_NEW_RESOURCES/);
});

test('QA review: Home check must actually assert the RC summary rather than unconditional true', () => {
  const d = source('phaseD.mjs');
  assert.match(d, /\.objectives a\[href="\/ensino-superior\/"\] \.what/);
  assert.match(d, /mais\\s\+5\\s\+áreas/);
  assert.doesNotMatch(d, /expectNine\s*\?\s*true\s*:/);
  assert.match(d, /process\.exitCode\s*=\s*1/);
});

test('QA review: visual audit validates the served sitemap with explicit staging/RC mode', () => {
  const e = source('phaseE.mjs');
  assert.match(e, /fetch\(`\$\{BASE\}\/sitemap\.xml`\)/);
  assert.match(e, /MODE === 'staging'/);
  assert.match(e, /sitemapPages/);
  assert.doesNotMatch(e, /\/home\/user\/.*\/dist\/sitemap\.xml/);
  assert.match(e, /process\.exitCode\s*=\s*1/);
});

test('QA review: partial-activation failures set a nonzero process exit status', () => {
  const p = source('partial.mjs');
  assert.match(p, /if \(!valid\) failures\+\+/);
  assert.match(p, /if \(failures\)/);
  assert.match(p, /process\.exitCode\s*=\s*1/);
});

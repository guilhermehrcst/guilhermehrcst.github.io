// The operator tool's write commands (draft, check, apply, rollback), run against a scratch copy of the
// repository: a refused lot changes no file, an applied one moves release.json by exactly the engine's
// projection, and a rollback keeps the ledger. Every lot here is a SIMULAÇÃO in a simulation-mode copy;
// the repository's own release is never touched.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const REPO = new URL('../../', import.meta.url).pathname;
const BY = 'SIMULAÇÃO — teste da ferramenta, não é decisão editorial';

const scratch = (): string => {
  const dir = `/tmp/academy-tool-test-${Date.now()}-${Math.random().toString(36).slice(2)}/`;
  execFileSync('mkdir', ['-p', dir], { encoding: 'utf8' });
  execFileSync('cp', ['-r', `${REPO}src`, `${REPO}tools`, `${REPO}package.json`, dir], { encoding: 'utf8' });
  execFileSync('ln', ['-s', `${REPO}node_modules`, `${dir}node_modules`], { encoding: 'utf8' });
  return dir;
};
const cleanup = (dir: string) => execFileSync('rm', ['-rf', dir], { encoding: 'utf8' });
const run = (dir: string, ...args: string[]): { ok: boolean; out: string } => {
  try {
    return { ok: true, out: execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', 'tools/academy-release.ts', ...args], { encoding: 'utf8', cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch (error) {
    return { ok: false, out: String((error as { stderr?: string }).stderr ?? error) };
  }
};
const releaseOf = (dir: string) => JSON.parse(readFileSync(`${dir}src/data/academy-release/release.json`, 'utf8'));
const snapshot = (dir: string) => [readFileSync(`${dir}src/data/academy-release/release.json`, 'utf8'), readFileSync(`${dir}src/lib/release/lots.ts`, 'utf8'), readdirSync(`${dir}src/data/academy-release/lots/`).join(',')];
const simulationMode = (dir: string) => {
  const release = releaseOf(dir);
  writeFileSync(`${dir}src/data/academy-release/release.json`, `${JSON.stringify({ ...release, mode: 'simulation' }, null, 2)}\n`);
};
/** A drafted lot, filled in as a simulation (the only decisions a test may write). */
const filled = (dir: string, name: string, ids: string[]): string => {
  const draft = JSON.parse(run(dir, 'draft', name, ...ids).out);
  for (const e of draft.entries) Object.assign(e, { decision: 'approved', decidedBy: BY, decidedOn: e.evidence.on, evidence: { ...e.evidence, version: 'teste-ferramenta' } });
  const path = `${dir}${name}.json`;
  writeFileSync(path, JSON.stringify({ ...draft, title: 'Teste', createdOn: '2026-10-12', simulation: true, authorization: { by: BY, on: '2026-10-12' } }, null, 2));
  return path;
};

test('draft prints a manifest the schema refuses until people decide, and apply refuses it without writing', () => {
  const dir = scratch();
  const draft = run(dir, 'draft', 'L001-rascunho', 'odin-foundations');
  assert.ok(draft.ok, draft.out);
  const lot = JSON.parse(draft.out);
  assert.equal(lot.authorization, null);
  assert.equal(lot.simulation, false);
  assert.deepEqual(lot.hosts, [{ host: 'www.theodinproject.com', institution: lot.entries[0].institution }]);
  writeFileSync(`${dir}L001-rascunho.json`, draft.out);
  const before = snapshot(dir);
  const applied = run(dir, 'apply', `${dir}L001-rascunho.json`);
  assert.equal(applied.ok, false);
  assert.match(applied.out, /is still a placeholder/);
  assert.deepEqual(snapshot(dir), before, 'nothing written');
  cleanup(dir);
});

test('a simulated lot is refused in a production release, and every file is restored', () => {
  const dir = scratch();
  const path = filled(dir, 'L001-ensaio', ['odin-foundations']);
  const before = snapshot(dir);
  const applied = run(dir, 'apply', path);
  assert.equal(applied.ok, false);
  assert.match(applied.out, /a simulated lot in a production release/);
  assert.deepEqual(snapshot(dir), before);
  cleanup(dir);
});

test('apply publishes exactly the projection, check names new hosts, rollback keeps the ledger, the same text rolls forward', () => {
  const dir = scratch();
  simulationMode(dir);
  const path = filled(dir, 'L001-ensaio', ['inep-enem-provas-gabaritos', 'odin-foundations']);
  const report = JSON.parse(run(dir, 'check', path).out);
  assert.deepEqual(report.problems, []);
  assert.deepEqual(report.newHosts, ['www.theodinproject.com'], 'www.gov.br is already a published host');
  assert.equal(report.inventoryAfter, 39);
  const applied = run(dir, 'apply', path);
  assert.ok(applied.ok, applied.out);
  const release = releaseOf(dir);
  assert.equal(release.inventory.length, 39);
  assert.ok(release.inventory.includes('odin-foundations') && release.inventory.includes('inep-enem-provas-gabaritos'));
  assert.deepEqual(release.applied, release.ledger);
  assert.match(readFileSync(`${dir}src/lib/release/lots.ts`, 'utf8'), /L001-ensaio\.json/);
  assert.match(run(dir, 'status').out, /"published": 39/);

  assert.equal(run(dir, 'rollback', 'L000-outro').ok, false, 'only the last applied lot');
  const back = run(dir, 'rollback', 'L001-ensaio');
  assert.ok(back.ok, back.out);
  assert.equal(releaseOf(dir).inventory.length, 37);
  assert.deepEqual(releaseOf(dir).applied, []);
  assert.equal(releaseOf(dir).ledger.length, 1, 'the ledger keeps the rolled-back lot');

  const changed = JSON.parse(readFileSync(path, 'utf8'));
  execFileSync('mkdir', ['-p', `${dir}outro/`], { encoding: 'utf8' });
  writeFileSync(`${dir}outro/L001-ensaio.json`, JSON.stringify({ ...changed, title: 'Outro texto' }));
  assert.match(run(dir, 'apply', `${dir}outro/L001-ensaio.json`).out, /registered with another text/);
  const forward = run(dir, 'apply', path);
  assert.ok(forward.ok, forward.out);
  assert.equal(releaseOf(dir).inventory.length, 39);
  cleanup(dir);
});

test('a resource whose path is in preparation is refused: placement fails and nothing is written', () => {
  const dir = scratch();
  simulationMode(dir);
  const path = filled(dir, 'L001-ensaio', ['ef-sme-alfabeto-1']);
  assert.deepEqual(JSON.parse(run(dir, 'check', path).out).unplaced, ['ef-sme-alfabeto-1 (ensino-fundamental)']);
  const before = snapshot(dir);
  const applied = run(dir, 'apply', path);
  assert.equal(applied.ok, false);
  assert.match(applied.out, /placement: ef-sme-alfabeto-1 has no page that shows it/);
  assert.deepEqual(snapshot(dir), before);
  cleanup(dir);
});

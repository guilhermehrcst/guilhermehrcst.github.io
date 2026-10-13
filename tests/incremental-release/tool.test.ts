// The operator tool's write commands (draft, check, apply, rollback), run against a scratch copy of the
// repository: a refused lot changes no file, an applied one moves release.json by exactly the engine's
// projection, and a rollback keeps the ledger. Every lot here is a SIMULAÇÃO in a simulation-mode copy;
// the repository's own release is never touched.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const REPO = new URL('../../', import.meta.url).pathname;
const BY = 'SIMULAÇÃO — teste da ferramenta, não é decisão editorial';

const scratch = (): string => {
  const dir = `/tmp/academy-tool-test-${Date.now()}-${Math.random().toString(36).slice(2)}/`;
  execFileSync('mkdir', ['-p', dir], { encoding: 'utf8' });
  execFileSync('cp', ['-r', `${REPO}src`, `${REPO}tools`, `${REPO}package.json`, dir], { encoding: 'utf8' });
  execFileSync('ln', ['-s', `${REPO}node_modules`, `${dir}node_modules`], { encoding: 'utf8' });

  // Command tests must start from an isolated V0.4 fixture. Real pending or applied
  // editorial lots belong to repository.test.ts; copying them here would turn the
  // synthetic L999 into an invalid predecessor of a genuine pending L001.
  // Change only the brand-new scratch directory, never the working repository.
  const lotsDir = `${dir}src/data/academy-release/lots/`;
  for (const file of readdirSync(lotsDir)) {
    if (file.endsWith('.json')) unlinkSync(`${lotsDir}${file}`);
  }
  const registryPath = `${dir}src/lib/release/lots.ts`;
  const comments = readFileSync(registryPath, 'utf8').split('\n')
    .filter((line) => line.startsWith('//')).join('\n');
  writeFileSync(registryPath, `${comments}\nexport const LOT_MANIFESTS: readonly unknown[] = [];\n`);

  const releasePath = `${dir}src/data/academy-release/release.json`;
  const release = JSON.parse(readFileSync(releasePath, 'utf8'));
  const baseline = JSON.parse(readFileSync(`${dir}src/data/academy-release/baseline.json`, 'utf8'));
  writeFileSync(releasePath, `${JSON.stringify({
    ...release,
    mode: 'production',
    applied: [],
    ledger: [],
    inventory: Object.keys(baseline.records).sort(),
  }, null, 2)}\n`);
  // The historical V0.4 scratch catalogue has no military resource. Restore its
  // corresponding path state as well, or path-status correctly refuses a fake
  // "active but empty" branch during independent release-tool tests.
  const taxonomyFile = `${dir}src/lib/taxonomy.ts`;
  const taxonomy = readFileSync(taxonomyFile, 'utf8');
  const active = "'pre-militar': 'active'";
  assert.ok(taxonomy.includes(active), 'real branch should keep Pré-Militar active');
  writeFileSync(taxonomyFile, taxonomy.replace(active, "'pre-militar': 'preparing'"));
  return dir;
};
const cleanup = (dir: string) => execFileSync('rm', ['-rf', dir], { encoding: 'utf8' });
const run = (dir: string, ...args: string[]): { ok: boolean; out: string } => runWith({}, dir, ...args);
const runWith = (env: Readonly<Record<string, string>>, dir: string, ...args: string[]): { ok: boolean; out: string } => {
  try {
    return { ok: true, out: execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', 'tools/academy-release.ts', ...args], { encoding: 'utf8', cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } }) };
  } catch (error) {
    return { ok: false, out: String((error as { stderr?: string }).stderr ?? error) };
  }
};
/** Candidates the tests may enter, in order of preference: the first two not yet published in the copy. */
const PREFERRED = ['odin-foundations', 'inep-enem-provas-gabaritos', 'ms-learn-cloud-concepts', 'google-mlcc', 'kultivi-enem-completo', 'yale-econ-252', 'mit-7012'];
const pick = (dir: string): string[] => PREFERRED.filter((id) => !releaseOf(dir).inventory.includes(id)).slice(0, 2);
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

/** Register a simulated lot as pending in the disposable copy: this mirrors the real L002 staging state. */
const registerPending = (dir: string, source: string, authorized: boolean): string => {
  const manifest = JSON.parse(readFileSync(source, 'utf8'));
  const path = `${dir}src/data/academy-release/lots/${manifest.lot}.json`;
  writeFileSync(path, `${JSON.stringify({ ...manifest, authorization: authorized ? manifest.authorization : null }, null, 2)}\n`);
  const registry = `${dir}src/lib/release/lots.ts`;
  const comments = readFileSync(registry, 'utf8').split('\n').filter((line) => line.startsWith('//')).join('\n');
  writeFileSync(registry,
    `${comments}\nimport lot0 from '../../data/academy-release/lots/${manifest.lot}.json' with { type: 'json' };\nexport const LOT_MANIFESTS: readonly unknown[] = [lot0];\n`);
  return path;
};

test('a registered pending lot stays inert until authorization and can then be applied without rewriting its manifest', () => {
  const dir = scratch();
  simulationMode(dir);
  const source = filled(dir, 'L999-ensaio', pick(dir).slice(0, 1));
  const registered = registerPending(dir, source, false);
  const pending = snapshot(dir);
  const refused = run(dir, 'apply', registered);
  assert.equal(refused.ok, false);
  assert.match(refused.out, /no authorization/);
  assert.deepEqual(snapshot(dir), pending, 'a pending lot remains unchanged');

  // An operator manually records authorization in the pending copy (SIMULAÇÃO, never a real signature).
  const manifest = JSON.parse(readFileSync(registered, 'utf8'));
  const approved = JSON.parse(readFileSync(source, 'utf8'));
  writeFileSync(registered, `${JSON.stringify({ ...manifest, authorization: approved.authorization }, null, 2)}\n`);
  const exact = readFileSync(registered, 'utf8');
  const registry = readFileSync(`${dir}src/lib/release/lots.ts`, 'utf8');
  const count = releaseOf(dir).inventory.length;
  const report = JSON.parse(run(dir, 'check', registered).out);
  assert.equal(report.registeredAlready, true);
  assert.deepEqual(report.problems, []);

  const applied = run(dir, 'apply', registered);
  assert.ok(applied.ok, applied.out);
  assert.equal(releaseOf(dir).inventory.length, count + 1);
  assert.equal(releaseOf(dir).applied.at(-1).lot, 'L999-ensaio');
  assert.equal(releaseOf(dir).applied.at(-1).digest, run(dir, 'lot-digest', registered).out.trim());
  assert.equal(readFileSync(registered, 'utf8'), exact, 'never rewrite a registered manifest');
  assert.equal(readFileSync(`${dir}src/lib/release/lots.ts`, 'utf8'), registry, 'do not rewrite a registered lot index');

  const again = run(dir, 'apply', registered);
  assert.equal(again.ok, false);
  assert.match(again.out, /never rewritten nor applied again/);
  assert.ok(run(dir, 'rollback', 'L999-ensaio').ok);
  const afterRollback = run(dir, 'apply', registered);
  assert.equal(afterRollback.ok, false);
  assert.match(afterRollback.out, /never rewritten nor applied again/);
  cleanup(dir);
});

test('a registered pending lot refuses external mismatched content and restores on a failed release write', () => {
  const dir = scratch();
  simulationMode(dir);
  const source = filled(dir, 'L999-ensaio', pick(dir).slice(0, 1));
  const registered = registerPending(dir, source, true);
  const alternate = JSON.parse(readFileSync(source, 'utf8'));
  writeFileSync(source, JSON.stringify({ ...alternate, title: 'A different lot with the same ID' }));
  const before = snapshot(dir);
  const registeredBytes = readFileSync(registered, 'utf8');

  const substituted = run(dir, 'apply', source);
  assert.equal(substituted.ok, false);
  assert.match(substituted.out, /differs from the registered manifest/);
  assert.deepEqual(snapshot(dir), before, 'external input must never overwrite the registered lot');
  assert.equal(readFileSync(registered, 'utf8'), registeredBytes);

  const fault = runWith({ ACADEMY_RELEASE_FAULT: 'after-release' }, dir, 'apply', registered);
  assert.equal(fault.ok, false);
  assert.match(fault.out, /nothing was changed/);
  assert.deepEqual(snapshot(dir), before, 'registered-lot release write must roll back');
  assert.equal(readFileSync(registered, 'utf8'), registeredBytes);
  cleanup(dir);
});

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
  const release = releaseOf(dir);
  writeFileSync(`${dir}src/data/academy-release/release.json`, `${JSON.stringify({ ...release, mode: 'production' }, null, 2)}\n`);
  const path = filled(dir, 'L999-ensaio', pick(dir).slice(0, 1));
  const before = snapshot(dir);
  const applied = run(dir, 'apply', path);
  assert.equal(applied.ok, false);
  assert.match(applied.out, /a simulated lot in a production release/);
  assert.deepEqual(snapshot(dir), before);
  cleanup(dir);
});

test('apply publishes exactly the projection, check names new hosts, rollback keeps the ledger, a rolled-back lot is not applied again', () => {
  const dir = scratch();
  simulationMode(dir);
  const before = releaseOf(dir);
  const ids = pick(dir);
  assert.equal(ids.length, 2, 'two unpublished candidates to enter');
  const path = filled(dir, 'L999-ensaio', ids);
  const report = JSON.parse(run(dir, 'check', path).out);
  assert.deepEqual(report.problems, []);
  assert.equal(report.inventoryAfter, before.inventory.length + 2);
  // New hosts are the lot's hosts that no published resource has yet (verify-dist must list them).
  const lotHosts = JSON.parse(readFileSync(path, 'utf8')).hosts.map((h: { host: string }) => h.host);
  for (const host of report.newHosts) assert.ok(lotHosts.includes(host), host);
  const applied = run(dir, 'apply', path);
  assert.ok(applied.ok, applied.out);
  const release = releaseOf(dir);
  assert.equal(release.inventory.length, before.inventory.length + 2);
  for (const id of ids) assert.ok(release.inventory.includes(id), id);
  assert.deepEqual(release.applied, [...before.applied, { lot: 'L999-ensaio', digest: release.ledger.at(-1).digest }]);
  assert.deepEqual(release.ledger.slice(0, -1), before.ledger, 'the ledger only grows');
  assert.match(readFileSync(`${dir}src/lib/release/lots.ts`, 'utf8'), /L999-ensaio\.json/);
  assert.match(run(dir, 'status').out, new RegExp(`"published": ${before.inventory.length + 2}`));

  assert.equal(run(dir, 'rollback', 'L000-outro').ok, false, 'only the last applied lot');
  const back = run(dir, 'rollback', 'L999-ensaio');
  assert.ok(back.ok, back.out);
  assert.deepEqual(releaseOf(dir).inventory, before.inventory);
  assert.deepEqual(releaseOf(dir).applied, before.applied);
  assert.equal(releaseOf(dir).ledger.length, before.ledger.length + 1, 'the ledger keeps the rolled-back lot');

  // A rolled-back lot is not applied again, with the same text or another: its decisions go to a new lot.
  assert.match(run(dir, 'apply', path).out, /never rewritten nor applied again/);
  const changed = JSON.parse(readFileSync(path, 'utf8'));
  execFileSync('mkdir', ['-p', `${dir}outro/`], { encoding: 'utf8' });
  writeFileSync(`${dir}outro/L999-ensaio.json`, JSON.stringify({ ...changed, title: 'Outro texto' }));
  assert.match(run(dir, 'apply', `${dir}outro/L999-ensaio.json`).out, /never rewritten nor applied again/);
  assert.deepEqual(releaseOf(dir).inventory, before.inventory);
  cleanup(dir);
});

test('a resource whose path is in preparation is refused: placement fails and nothing is written', () => {
  const dir = scratch();
  simulationMode(dir);
  // Exercised while Fundamental is in preparation; once it is active, the check must find no gap.
  const preparing = readFileSync(`${dir}src/lib/taxonomy.ts`, 'utf8').includes("'ensino-fundamental': 'preparing'");
  if (!preparing) {
    const path = filled(dir, 'L999-ensaio', ['ef-sme-vegetacao-3']);
    assert.deepEqual(JSON.parse(run(dir, 'check', path).out).unplaced, []);
    cleanup(dir);
    return;
  }
  const path = filled(dir, 'L999-ensaio', ['ef-sme-alfabeto-1']);
  assert.deepEqual(JSON.parse(run(dir, 'check', path).out).unplaced, ['ef-sme-alfabeto-1 (ensino-fundamental)']);
  const before = snapshot(dir);
  const applied = run(dir, 'apply', path);
  assert.equal(applied.ok, false);
  assert.match(applied.out, /placement: ef-sme-alfabeto-1 has no page that shows it/);
  assert.deepEqual(snapshot(dir), before);
  cleanup(dir);
});

test('a write that fails midway restores every file: manifest, lots.ts and release.json (injected faults)', () => {
  const dir = scratch();
  simulationMode(dir);
  const path = filled(dir, 'L999-ensaio', pick(dir).slice(0, 1));
  const before = snapshot(dir);
  // ACADEMY_RELEASE_FAULT makes the tool throw right after the named write (a test hook; unset in use).
  for (const step of ['after-manifest', 'after-lots', 'after-release']) {
    const applied = runWith({ ACADEMY_RELEASE_FAULT: step }, dir, 'apply', path);
    assert.equal(applied.ok, false, step);
    assert.match(applied.out, new RegExp(`injected fault ${step}`), step);
    assert.match(applied.out, /nothing was changed/, step);
    assert.deepEqual(snapshot(dir), before, `${step}: every file restored`);
  }
  // The same holds for rollback once a lot is applied.
  assert.ok(run(dir, 'apply', path).ok);
  const applied = snapshot(dir);
  const back = runWith({ ACADEMY_RELEASE_FAULT: 'after-release' }, dir, 'rollback', 'L999-ensaio');
  assert.equal(back.ok, false);
  assert.deepEqual(snapshot(dir), applied, 'rollback: every file restored');
  cleanup(dir);
});

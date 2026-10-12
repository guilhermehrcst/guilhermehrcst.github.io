// Operator's tool for the Academy incremental release (docs/academy/operacao-publicacao-incremental.md).
// It reads and computes; it never decides. `entry` prints a skeleton whose decision is a placeholder the
// manifest schema refuses until a person replaces it, so nothing this tool prints can publish anything.
//
//   node --experimental-strip-types tools/academy-release.ts status
//   node --experimental-strip-types tools/academy-release.ts digest <id>
//   node --experimental-strip-types tools/academy-release.ts entry <id>
//   node --experimental-strip-types tools/academy-release.ts lot-digest <path/to/L000-name.json>
//   node --experimental-strip-types tools/academy-release.ts draft <L000-name> <id>...   (skeleton on stdout)
//   node --experimental-strip-types tools/academy-release.ts check <path/to/L000-name.json>
//   node --experimental-strip-types tools/academy-release.ts apply <path/to/L000-name.json>
//   node --experimental-strip-types tools/academy-release.ts rollback <L000-name>
//
// `draft` prints a manifest whose every decision and the authorization are placeholders or null: the
// schema refuses it until people fill it in. `check` reports, without writing, what a filled manifest
// would publish and what the build would refuse. `apply` and `rollback` write the three release files
// (the manifest in lots/, its registration in lots.ts, release.json) and then verify them in a fresh
// process that loads the catalogue, the placement and the path states exactly as the build does; if
// anything fails, every file is restored and nothing changes. A rolled-back lot is never applied again.
// Neither decides anything: `apply` refuses
// a manifest whose decisions or authorization are missing, simulated or automated (the engine's rules).
import { execFileSync } from 'node:child_process';
import { copyFileSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
// Records come from the data modules, never through learning-resources.ts: digest and entry keep working
// while a record change keeps the build red (the digest is what its new approval needs).
import { catalogue } from '../src/lib/catalogue-records.ts';
import { STAGED_RESOURCES } from '../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { digestOf } from '../src/lib/release/canonical.ts';
import { lotProblems, projectRelease } from '../src/lib/release/engine.ts';
import { PATH_STATUS } from '../src/lib/taxonomy.ts';

const [command, arg] = process.argv.slice(2);
const records = new Map([...catalogue, ...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES].map((r) => [r.id, r]));
const out = (value: unknown) => process.stdout.write(`${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}\n`);
const die = (message: string): never => {
  process.stderr.write(`academy-release: ${message}\n`);
  return process.exit(1);
};
const recordOf = (id: string | undefined) => (id && records.get(id)) || die(`unknown id ${String(id)}`);

const ROOT = new URL('../', import.meta.url);
const LOTS_DIR = new URL('src/data/academy-release/lots/', ROOT);
const LOTS_TS = new URL('src/lib/release/lots.ts', ROOT);
const RELEASE_JSON = new URL('src/data/academy-release/release.json', ROOT);
const BASELINE_JSON = new URL('src/data/academy-release/baseline.json', ROOT);
const readJson = (url: URL | string): any => JSON.parse(readFileSync(url, 'utf8'));
const writeJson = (url: URL, value: unknown) => writeFileSync(url, `${JSON.stringify(value, null, 2)}\n`);
const lotFiles = (): string[] => readdirSync(LOTS_DIR).filter((f) => f.endsWith('.json')).sort();

/** lots.ts, regenerated from the manifests on disk (one import per file, in lot order). */
const renderLots = (files: readonly string[]): string => {
  const head = readFileSync(LOTS_TS, 'utf8').split('\n').filter((line) => line.startsWith('//')).join('\n');
  const imports = files.map((f, i) => `import lot${i} from '../../data/academy-release/lots/${f}' with { type: 'json' };`).join('\n');
  return `${head}\n${imports}${imports ? '\n' : ''}export const LOT_MANIFESTS: readonly unknown[] = [${files.map((_, i) => `lot${i}`).join(', ')}];\n`;
};

/** The ids a release publishes with these lots, by the engine itself (record rules are left to the fresh
 *  process that verifies the result: only the published set is read here). */
const projectedInventory = (lots: readonly unknown[], release: unknown): string[] =>
  projectRelease({ catalogue, pool: [...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES], baseline: readJson(BASELINE_JSON), lots, release, validate: () => [], now: new Date() })
    .published.map((r) => r.id).sort();

/** Loads the catalogue, the placement and the path states in a new process, as the build does. */
const buildProblems = (): string | null => {
  try {
    execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e',
      "await import('./src/lib/learning-resources.ts'); await import('./src/lib/placement.ts'); await import('./src/lib/path-status.ts');"],
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'], encoding: 'utf8' });
    return null;
  } catch (error) {
    const lines = String((error as { stderr?: string }).stderr ?? error).split('\n');
    const from = lines.findIndex((l) => /^\w*Error\b/.test(l));
    return lines.slice(Math.max(from, 0)).filter((l) => l && !l.startsWith('    at ')).slice(0, 40).join('\n');
  }
};

/** Test hook: ACADEMY_RELEASE_FAULT=<step> throws right after that write, to prove the restore. Unset in use. */
const fault = (step: string): void => {
  if (process.env.ACADEMY_RELEASE_FAULT === step) throw new Error(`injected fault ${step}`);
};

/** Writes the release files and verifies them; if a write throws midway or the result does not hold,
 *  every file is restored: lots.ts and release.json to their saved text, any manifest added removed. */
const transact = (writes: () => void): void => {
  const saved = [LOTS_TS, RELEASE_JSON].map((url) => [url, readFileSync(url, 'utf8')] as const);
  const before = new Set(lotFiles());
  const restore = () => {
    for (const [url, text] of saved) writeFileSync(url, text);
    for (const f of lotFiles()) if (!before.has(f)) unlinkSync(new URL(f, LOTS_DIR));
  };
  let problems: string | null;
  try {
    writes();
    problems = buildProblems();
  } catch (error) {
    restore();
    return die(`a write failed (${error instanceof Error ? error.message : String(error)}); nothing was changed`);
  }
  if (problems === null) return;
  restore();
  die(`the release would not hold; nothing was changed:\n${problems}`);
};

/** What a lot would publish, and what stands in its way, without writing anything. */
const lotReport = async (lot: any) => {
  // Placement reads the published catalogue: loaded only here, so the other commands work on a red build.
  const { placementOf } = await import('../src/lib/placement.ts').catch((error: unknown) =>
    die(`the release does not hold before this lot, as the build will say:\n${error instanceof Error ? error.message : String(error)}`));
  const release = readJson(RELEASE_JSON);
  const registered = lotFiles().map((f) => readJson(new URL(f, LOTS_DIR)));
  const problems = lotProblems(lot, new Date());
  const approved: string[] = (lot.entries ?? []).filter((e: any) => e.decision === 'approved').map((e: any) => e.id);
  const after = approved.map((id) => records.get(id)).filter((r): r is NonNullable<typeof r> => r !== undefined);
  const published = [...records.values()].filter((r) => release.inventory.includes(r.id));
  const context = [...published, ...after];
  const publishedHosts = new Set(published.filter((r) => r.url).map((r) => new URL(r.url!).hostname));
  return {
    lot: lot.lot,
    problems,
    publishes: approved,
    held: (lot.entries ?? []).filter((e: any) => e.decision === 'held').map((e: any) => e.id),
    suspends: (lot.suspensions ?? []).map((s: any) => s.id),
    inventoryAfter: release.inventory.length + approved.filter((id) => !release.inventory.includes(id)).length - (lot.suspensions ?? []).length,
    // New hosts: scripts/verify-dist.mjs (COURSE_HOSTS) must list them in the same change.
    newHosts: [...new Set(after.map((r) => new URL(r.url!).hostname))].filter((h) => !publishedHosts.has(h)).sort(),
    // Resources with no page under today's path states: the lot needs its path activated in the same change.
    unplaced: after.filter((r) => placementOf(r, PATH_STATUS, context) === null).map((r) => `${r.id} (${(r.paths ?? []).join(', ')})`),
    registeredAlready: registered.some((l) => l.lot === lot.lot),
  };
};

switch (command) {
  case 'status': {
    const { RELEASE } = await import('../src/lib/learning-resources.ts').catch((error: unknown) =>
      die(`the release does not hold, as the build will say:\n${error instanceof Error ? error.message : String(error)}`));
    const counts: Record<string, number> = {};
    for (const state of RELEASE.states.values()) counts[state] = (counts[state] ?? 0) + 1;
    out({ published: RELEASE.published.length, states: counts, ifApplied: Object.fromEntries(RELEASE.ifApplied), suspended: Object.fromEntries(RELEASE.suspended), problems: RELEASE.problems });
    break;
  }
  case 'digest':
    out(digestOf(recordOf(arg)));
    break;
  case 'entry': {
    const r = recordOf(arg);
    if (!r.url || !r.verified?.evidence) die(`${r.id} has no URL or individual evidence: it cannot be entered in a lot`);
    out({
      id: r.id,
      url: r.url,
      digest: digestOf(r),
      institution: r.provider,
      format: r.format,
      evidence: { on: r.verified!.on, version: 'PREENCHER: identificador do registro de evidência', method: r.verified!.by, url: r.verified!.evidence!.url, observed: r.verified!.evidence!.note },
      decision: 'PREENCHER: verified | approved | held (decisão humana)',
      decidedBy: 'PREENCHER: nome de quem decide',
      decidedOn: 'PREENCHER: AAAA-MM-DD',
    });
    break;
  }
  case 'lot-digest':
    if (!arg) die('lot-digest needs a manifest path');
    out(digestOf(JSON.parse(readFileSync(arg!, 'utf8'))));
    break;
  case 'draft': {
    const ids = process.argv.slice(4);
    if (!arg || !/^L\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(arg) || ids.length === 0) die('draft needs a lot name (L000-name) and at least one id');
    const entries = ids.map((id) => {
      const r = recordOf(id);
      if (!r.url || !r.verified?.evidence) die(`${r.id} has no URL or individual evidence: it cannot be entered in a lot`);
      return {
        id: r.id, url: r.url!, digest: digestOf(r), institution: r.provider, format: r.format,
        evidence: { on: r.verified!.on, version: 'PREENCHER: identificador do registro de evidência', method: r.verified!.by, url: r.verified!.evidence!.url, observed: r.verified!.evidence!.note },
        decision: 'PREENCHER: approved | held (decisão humana)', decidedBy: 'PREENCHER: nome de quem decide', decidedOn: 'PREENCHER: AAAA-MM-DD',
      };
    });
    const hosts = [...new Map(entries.map((e) => [`${new URL(e.url).hostname} ${e.institution}`, { host: new URL(e.url).hostname, institution: e.institution }])).values()]
      .sort((a, b) => a.host.localeCompare(b.host) || a.institution.localeCompare(b.institution));
    out({ schema: 'pexis-academy-lot/1', lot: arg, title: 'PREENCHER: título do lote', createdOn: 'PREENCHER: AAAA-MM-DD', simulation: false, hosts, entries, suspensions: [], authorization: null });
    break;
  }
  case 'check': {
    if (!arg) die('check needs a manifest path');
    out(await lotReport(readJson(arg!)));
    break;
  }
  case 'apply': {
    if (!arg) die('apply needs a manifest path');
    const lot = readJson(arg!);
    const report = await lotReport(lot);
    if (report.problems.length) die(`the manifest is refused:\n${report.problems.join('\n')}`);
    if (lot.authorization === null) die(`${lot.lot} has no authorization: a person authorizes the exact lot before it is applied`);
    const file = `${lot.lot}.json`;
    if (arg!.split('/').pop() !== file) die(`the file must be named ${file}`);
    const release = readJson(RELEASE_JSON);
    // A registered lot is never rewritten, and a rolled-back one is not applied again: its decisions go to a
    // new lot (docs/academy/operacao-publicacao-incremental.md, section 10).
    if (report.registeredAlready) die(`${lot.lot} is already registered; an applied or rolled-back lot is never rewritten nor applied again — record its decisions in a new lot`);
    transact(() => {
      copyFileSync(arg!, new URL(file, LOTS_DIR));
      fault('after-manifest');
      const files = lotFiles();
      writeFileSync(LOTS_TS, renderLots(files));
      fault('after-lots');
      const manifests = files.map((f) => readJson(new URL(f, LOTS_DIR)));
      const pin = { lot: lot.lot, digest: digestOf(lot) };
      const next = { ...release, applied: [...release.applied, pin], ledger: [...release.ledger, pin] };
      writeJson(RELEASE_JSON, { ...next, inventory: projectedInventory(manifests, { ...next, inventory: [] }) });
      fault('after-release');
    });
    const after = readJson(RELEASE_JSON);
    out({ applied: lot.lot, published: after.inventory.length, newHosts: report.newHosts, next: 'npm test (update the state guards one by one, with the reason), npm run build' });
    break;
  }
  case 'rollback': {
    const release = readJson(RELEASE_JSON);
    const last = release.applied[release.applied.length - 1];
    if (!arg || !last || last.lot !== arg) die(`rollback takes back the last applied lot only (${last?.lot ?? 'none applied'})`);
    transact(() => {
      const manifests = lotFiles().map((f) => readJson(new URL(f, LOTS_DIR)));
      // The manifest stays registered and the ledger keeps its pin: the history is never rewritten.
      const next = { ...release, applied: release.applied.slice(0, -1) };
      writeJson(RELEASE_JSON, { ...next, inventory: projectedInventory(manifests, { ...next, inventory: [] }) });
      fault('after-release');
    });
    out({ rolledBack: arg, published: readJson(RELEASE_JSON).inventory.length });
    break;
  }
  default:
    die('commands: status | digest <id> | entry <id> | lot-digest <file> | draft <lot> <id>... | check <file> | apply <file> | rollback <lot>');
}

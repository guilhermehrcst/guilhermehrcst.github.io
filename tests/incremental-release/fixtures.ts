// Fixtures for the incremental-release suite. Every decision here is SIMULATED: decidedBy and the lot
// authorization say so, the lots are marked `simulation`, and a production release refuses them. Nothing
// in this folder is imported by a page, and nothing here approves a resource.
import baselineJson from '../../src/data/academy-release/baseline.json' with { type: 'json' };
import { catalogue, resourceProblems, type LearningResource } from '../../src/lib/learning-resources.ts';
import { STAGED_RESOURCES } from '../../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES } from '../../src/lib/staging-gateb.ts';
import { digestOf } from '../../src/lib/release/canonical.ts';
import { projectRelease, type LotEntry, type LotManifest, type ReleaseManifest, type ReleaseInput } from '../../src/lib/release/engine.ts';

export const NOW = new Date('2026-10-12T23:59:59Z');
export const DECIDED_ON = '2026-10-12';
export const SIMULATED_BY = 'SIMULAÇÃO — fixture de teste, não é decisão editorial';
export const POOL: readonly LearningResource[] = [...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES];
export const BASELINE = baselineJson;
export const LEGACY_IDS: readonly string[] = Object.keys(baselineJson.records);

const byId = new Map([...catalogue, ...POOL].map((r) => [r.id, r]));
export const record = (id: string): LearningResource => {
  const r = byId.get(id);
  if (!r) throw new Error(`fixture: no record ${id}`);
  return r;
};

/** A simulated approval of a record exactly as it is typed. */
export const entryFor = (id: string, over: Partial<LotEntry> = {}): LotEntry => {
  const r = record(id);
  if (!r.url || !r.verified?.evidence) throw new Error(`fixture: ${id} has no URL or evidence`);
  return {
    id,
    url: r.url,
    digest: digestOf(r),
    institution: r.provider,
    format: r.format,
    evidence: { on: r.verified.on, version: 'fixture-evidence-v1', method: r.verified.by, url: r.verified.evidence.url, observed: r.verified.evidence.note },
    decision: 'approved',
    decidedBy: SIMULATED_BY,
    decidedOn: DECIDED_ON,
    ...over,
  };
};

export const lotOf = (lot: string, entries: readonly LotEntry[], over: Partial<LotManifest> = {}): LotManifest => {
  const hosts = new Map<string, string>();
  for (const e of entries) hosts.set(`${new URL(e.url).hostname} ${e.institution}`, e.institution);
  return {
    schema: 'pexis-academy-lot/1',
    lot,
    title: `Lote simulado ${lot}`,
    createdOn: DECIDED_ON,
    simulation: true,
    hosts: [...hosts].map(([key, institution]) => ({ host: key.split(' ')[0]!, institution })),
    entries,
    suspensions: [],
    authorization: { by: SIMULATED_BY, on: DECIDED_ON },
    ...over,
  };
};

/** A release applying `applied` (in order) and declaring exactly `inventory`. */
export const releaseOf = (applied: readonly LotManifest[], inventory: readonly string[], over: Partial<ReleaseManifest> = {}): ReleaseManifest => ({
  schema: 'pexis-academy-release/1',
  mode: 'simulation',
  applied: applied.map((lot) => ({ lot: lot.lot, digest: digestOf(lot) })),
  ledger: applied.map((lot) => ({ lot: lot.lot, digest: digestOf(lot) })),
  inventory: [...inventory].sort(),
  ...over,
});

/** The inventory a release should declare: the legacy ids plus `added`, minus `removed`. */
export const inventoryWith = (added: readonly string[], removed: readonly string[] = []): string[] =>
  [...LEGACY_IDS, ...added].filter((id) => !removed.includes(id)).sort();

export const project = (over: Partial<ReleaseInput> & Pick<ReleaseInput, 'lots' | 'release'>) => projectRelease({
  catalogue,
  pool: POOL,
  baseline: BASELINE,
  validate: (r) => resourceProblems(r, NOW),
  now: NOW,
  ...over,
});

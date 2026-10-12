// The Academy's incremental publication engine (proposal docs/superpowers/plans/2026-10-12-academy-
// incremental-release-proposal.md, §3–§4). Pure: it reads typed records and JSON manifests, and returns the
// public projection and every problem it found. It never decides anything: approval and authorization are
// data written by a person in a lot manifest; this module only refuses what does not match them.
//
//   published = baseline (the 37 of V0.4, each locked to its digest)
//             + entries approved in applied lots (each locked to its digest, URL and evidence)
//             − suspensions in applied lots
//
// Fail closed: an unknown key, id, host, method or date, a digest that no longer matches its record, a lot
// edited after it was applied, a simulated lot in production or an inventory that moved without being
// declared is a problem, and a non-empty list of problems stops the build (learning-resources.ts).
// No asset imports: this module runs under Node's test runner.
import { DIGEST_PATTERN, digestOf } from './canonical.ts';
import type { LearningResource, PublishedLearningResource } from '../learning-resources.ts';

/* States and transitions ---------------------------------------------------------------------------- */

export const EDITORIAL_STATES = ['candidate', 'verified', 'approved', 'published', 'held', 'suspended'] as const;
export type EditorialState = (typeof EDITORIAL_STATES)[number];

/** The only moves a resource may make. `published` is reached only by applying an authorized lot; leaving
 *  it is a suspension, or a re-approval of changed metadata. A suspended resource returns only through a
 *  fresh verification. Nothing moves by itself: every move is a recorded decision. */
export const EDITORIAL_TRANSITIONS: Readonly<Record<EditorialState, readonly EditorialState[]>> = {
  candidate: ['verified', 'held'],
  verified: ['approved', 'held'],
  approved: ['published', 'held'],
  published: ['suspended', 'approved'],
  held: ['verified'],
  suspended: ['verified'],
};

export const canTransition = (from: EditorialState, to: EditorialState): boolean => EDITORIAL_TRANSITIONS[from].includes(to);

/* Manifests ----------------------------------------------------------------------------------------- */

/** The decisions an entry records. `approved` carries its own verification (the evidence block), so it may
 *  follow `candidate`, `held` or `suspended` directly: the move is then verified → approved. */
export const ENTRY_DECISIONS = ['verified', 'approved', 'held'] as const;
export type EntryDecision = (typeof ENTRY_DECISIONS)[number];

/** How the evidence was gathered. Kept apart from the record's own `verified.by`, which it must equal. */
export const EVIDENCE_METHODS = ['official-page', 'youtube-page'] as const;

export interface LotEntry {
  id: string;
  url: string;
  /** digestOf(record): the whole typed record the student will see. */
  digest: string;
  /** The record's provider, verbatim. */
  institution: string;
  /** The record's format, verbatim. */
  format: string;
  evidence: { on: string; version: string; method: string; url: string; observed: string };
  decision: EntryDecision;
  decidedBy: string;
  decidedOn: string;
  /** Why it is held (required for `held`). */
  reason?: string;
}

export interface LotSuspension { id: string; reason: string; decidedBy: string; decidedOn: string }

export interface LotManifest {
  schema: 'pexis-academy-lot/1';
  lot: string;
  title: string;
  createdOn: string;
  /** A rehearsal: never accepted by a production release. */
  simulation: boolean;
  /** The hosts this lot reviewed as official sources of its institutions. */
  hosts: readonly { host: string; institution: string }[];
  entries: readonly LotEntry[];
  suspensions: readonly LotSuspension[];
  /** The person who authorized publishing this exact lot, or null while it is only a decision record. */
  authorization: { by: string; on: string } | null;
}

export interface ReleaseManifest {
  schema: 'pexis-academy-release/1';
  mode: 'production' | 'simulation';
  /** The lots in the public projection, in order, each pinned to its digest when applied. Append only. */
  applied: readonly { lot: string; digest: string }[];
  /** Every lot ever applied, in order, each with the digest it was applied with. Append only: a lot
   *  rolled back leaves `applied` but stays here, so its decision record can never be edited or dropped. */
  ledger: readonly { lot: string; digest: string }[];
  /** The ids the projection must publish, sorted: an undeclared change of inventory fails the build. */
  inventory: readonly string[];
}

export interface BaselineManifest {
  schema: 'pexis-academy-baseline/1';
  source: string;
  /** id → digest of the record as published in V0.4. */
  records: Readonly<Record<string, string>>;
}

/* Schema checks (closed: unknown keys are refused) -------------------------------------------------- */

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOT_ID = /^L\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** A person's decision is not an automated one: approvals and authorizations naming a tool are refused. */
const AUTOMATED = /\b(claude|codex|chatgpt|gpt|copilot|openai|anthropic|bot|ia|ai|automa\w*)\b/i;
const SIMULATED = /^SIMULAÇÃO\b/;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v === v.trim();
export const isDate = (v: unknown): v is string => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const date = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(v);
};
const dayOf = (on: string): number => new Date(`${on}T00:00:00Z`).getTime();

const closed = (where: string, v: unknown, required: readonly string[], optional: readonly string[] = []): string[] => {
  if (!isObject(v)) return [`${where}: not an object`];
  const problems = required.filter((k) => !(k in v)).map((k) => `${where}: missing ${k}`);
  for (const k of Object.keys(v)) if (!required.includes(k) && !optional.includes(k)) problems.push(`${where}: unknown key ${k}`);
  return problems;
};

/** An https URL on the default port, with no credentials: the only kind a resource may point to. */
export const urlProblems = (where: string, url: unknown): string[] => {
  if (typeof url !== 'string') return [`${where}: url is not text`];
  let parsed: URL;
  try { parsed = new URL(url); } catch { return [`${where}: ${url} is not a URL`]; }
  const problems: string[] = [];
  if (parsed.protocol !== 'https:') problems.push(`${where}: ${url} is not https`);
  if (parsed.username || parsed.password) problems.push(`${where}: ${url} carries credentials`);
  if (parsed.port) problems.push(`${where}: ${url} names a port`);
  if (parsed.href !== url) problems.push(`${where}: ${url} is not in its normal form (${parsed.href})`);
  return problems;
};

const dateProblems = (where: string, on: unknown, now: Date): string[] => {
  if (!isDate(on)) return [`${where}: ${String(on)} is not a date`];
  return dayOf(on) > now.getTime() ? [`${where}: ${on} is in the future`] : [];
};

const decidedByProblems = (where: string, by: unknown, automatedRefused: boolean, simulation: boolean): string[] => {
  if (!isText(by)) return [`${where}: no person named`];
  if (SIMULATED.test(by) !== simulation) return [simulation ? `${where}: a simulated lot must say so in decidedBy` : `${where}: a simulated decision in a real lot`];
  if (automatedRefused && !simulation && AUTOMATED.test(by)) return [`${where}: ${by} is not a person; an approval is never automated`];
  return [];
};

export const lotProblems = (lot: unknown, now: Date): string[] => {
  const problems = closed('lot', lot, ['schema', 'lot', 'title', 'createdOn', 'simulation', 'hosts', 'entries', 'suspensions', 'authorization']);
  if (!isObject(lot) || problems.length) return problems;
  const name = isText(lot.lot) && LOT_ID.test(lot.lot) ? lot.lot : 'lot';
  // A skeleton printed by tools/academy-release.ts marks every field a person must fill.
  const placeholders = (v: unknown, at: string): string[] =>
    typeof v === 'string' ? (/PREENCHER/.test(v) ? [`${name}: ${at} is still a placeholder`] : [])
      : Array.isArray(v) ? v.flatMap((x, i) => placeholders(x, `${at}[${i}]`))
        : isObject(v) ? Object.entries(v).flatMap(([k, x]) => placeholders(x, at ? `${at}.${k}` : k)) : [];
  problems.push(...placeholders(lot, ''));
  if (lot.schema !== 'pexis-academy-lot/1') problems.push(`${name}: unknown schema ${String(lot.schema)}`);
  if (name === 'lot') problems.push(`lot: ${String(lot.lot)} is not a lot id (L000-name)`);
  if (!isText(lot.title)) problems.push(`${name}: no title`);
  problems.push(...dateProblems(`${name} createdOn`, lot.createdOn, now));
  if (typeof lot.simulation !== 'boolean') return [...problems, `${name}: simulation must be true or false`];
  const simulation = lot.simulation;

  if (!Array.isArray(lot.hosts)) problems.push(`${name}: hosts is not a list`);
  else for (const [i, h] of lot.hosts.entries()) {
    const at = `${name} hosts[${i}]`;
    const keys = closed(at, h, ['host', 'institution']);
    if (keys.length) { problems.push(...keys); continue; }
    const host = (h as Record<string, unknown>).host;
    if (typeof host !== 'string' || !/^[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/.test(host)) problems.push(`${at}: ${String(host)} is not a host name`);
    if (!isText((h as Record<string, unknown>).institution)) problems.push(`${at}: no institution`);
  }

  if (!Array.isArray(lot.entries)) problems.push(`${name}: entries is not a list`);
  else for (const [i, e] of lot.entries.entries()) {
    const at = `${name} entries[${i}]`;
    const keys = closed(at, e, ['id', 'url', 'digest', 'institution', 'format', 'evidence', 'decision', 'decidedBy', 'decidedOn'], ['reason']);
    if (keys.length) { problems.push(...keys); continue; }
    const entry = e as Record<string, unknown>;
    const who = typeof entry.id === 'string' && ID.test(entry.id) ? `${name} ${entry.id}` : at;
    if (who === at) problems.push(`${at}: ${String(entry.id)} is not an id`);
    problems.push(...urlProblems(who, entry.url));
    if (typeof entry.digest !== 'string' || !DIGEST_PATTERN.test(entry.digest)) problems.push(`${who}: digest must be sha256:<64 hex>`);
    if (!isText(entry.institution)) problems.push(`${who}: no institution`);
    if (!isText(entry.format)) problems.push(`${who}: no format`);
    if (!(ENTRY_DECISIONS as readonly unknown[]).includes(entry.decision)) problems.push(`${who}: ${String(entry.decision)} is not a decision`);
    problems.push(...decidedByProblems(`${who} decidedBy`, entry.decidedBy, true, simulation));
    problems.push(...dateProblems(`${who} decidedOn`, entry.decidedOn, now));
    if (entry.decision === 'held' && !isText(entry.reason)) problems.push(`${who}: held without a reason`);
    if ('reason' in entry && !isText(entry.reason)) problems.push(`${who}: empty reason`);
    const evidence = closed(`${who} evidence`, entry.evidence, ['on', 'version', 'method', 'url', 'observed']);
    if (evidence.length) { problems.push(...evidence); continue; }
    const ev = entry.evidence as Record<string, unknown>;
    problems.push(...dateProblems(`${who} evidence.on`, ev.on, now));
    if (!isText(ev.version)) problems.push(`${who}: evidence without a version`);
    if (!(EVIDENCE_METHODS as readonly unknown[]).includes(ev.method)) problems.push(`${who}: ${String(ev.method)} is not a direct verification at the source`);
    problems.push(...urlProblems(`${who} evidence`, ev.url));
    if (!isText(ev.observed) || (ev.observed as string).length < 20) problems.push(`${who}: evidence must say what was observed`);
    if (isDate(ev.on) && isDate(entry.decidedOn) && dayOf(entry.decidedOn) < dayOf(ev.on)) problems.push(`${who}: decided before its evidence`);
  }

  if (!Array.isArray(lot.suspensions)) problems.push(`${name}: suspensions is not a list`);
  else for (const [i, s] of lot.suspensions.entries()) {
    const at = `${name} suspensions[${i}]`;
    const keys = closed(at, s, ['id', 'reason', 'decidedBy', 'decidedOn']);
    if (keys.length) { problems.push(...keys); continue; }
    const suspension = s as Record<string, unknown>;
    if (typeof suspension.id !== 'string' || !ID.test(suspension.id)) problems.push(`${at}: ${String(suspension.id)} is not an id`);
    if (!isText(suspension.reason)) problems.push(`${at}: suspended without a reason`);
    problems.push(...decidedByProblems(`${at} decidedBy`, suspension.decidedBy, true, simulation));
    problems.push(...dateProblems(`${at} decidedOn`, suspension.decidedOn, now));
  }

  if (lot.authorization !== null) {
    const keys = closed(`${name} authorization`, lot.authorization, ['by', 'on']);
    if (keys.length) problems.push(...keys);
    else {
      const auth = lot.authorization as Record<string, unknown>;
      problems.push(...decidedByProblems(`${name} authorization`, auth.by, true, simulation));
      problems.push(...dateProblems(`${name} authorization`, auth.on, now));
      const decided = [...(Array.isArray(lot.entries) ? lot.entries : []), ...(Array.isArray(lot.suspensions) ? lot.suspensions : [])]
        .map((d) => (isObject(d) ? d.decidedOn : undefined)).filter(isDate);
      if (isDate(auth.on) && decided.some((on) => dayOf(on) > dayOf(auth.on as string))) problems.push(`${name}: authorized before its own decisions`);
    }
  }
  return problems;
};

export const releaseManifestProblems = (release: unknown): string[] => {
  const problems = closed('release', release, ['schema', 'mode', 'applied', 'ledger', 'inventory']);
  if (!isObject(release) || problems.length) return problems;
  if (release.schema !== 'pexis-academy-release/1') problems.push(`release: unknown schema ${String(release.schema)}`);
  if (release.mode !== 'production' && release.mode !== 'simulation') problems.push(`release: ${String(release.mode)} is not a mode`);
  for (const list of ['applied', 'ledger'] as const) {
    const items = release[list];
    if (!Array.isArray(items)) { problems.push(`release: ${list} is not a list`); continue; }
    for (const [i, a] of items.entries()) {
      const keys = closed(`release ${list}[${i}]`, a, ['lot', 'digest']);
      if (keys.length) { problems.push(...keys); continue; }
      const pin = a as Record<string, unknown>;
      if (typeof pin.lot !== 'string' || !LOT_ID.test(pin.lot)) problems.push(`release ${list}[${i}]: ${String(pin.lot)} is not a lot id`);
      if (typeof pin.digest !== 'string' || !DIGEST_PATTERN.test(pin.digest)) problems.push(`release ${list}[${i}]: digest must be sha256:<64 hex>`);
    }
  }
  if (!Array.isArray(release.inventory) || !release.inventory.every((id) => typeof id === 'string' && ID.test(id))) problems.push('release: inventory must list ids');
  else {
    const inventory = release.inventory as string[];
    if (new Set(inventory).size !== inventory.length) problems.push('release: inventory repeats an id');
    if (inventory.some((id, i) => i > 0 && inventory[i - 1]! >= id)) problems.push('release: inventory must be sorted');
  }
  return problems;
};

export const baselineProblems = (baseline: unknown): string[] => {
  const problems = closed('baseline', baseline, ['schema', 'source', 'records']);
  if (!isObject(baseline) || problems.length) return problems;
  if (baseline.schema !== 'pexis-academy-baseline/1') problems.push(`baseline: unknown schema ${String(baseline.schema)}`);
  if (!isText(baseline.source)) problems.push('baseline: no source');
  if (!isObject(baseline.records)) return [...problems, 'baseline: records is not an object'];
  for (const [id, digest] of Object.entries(baseline.records)) {
    if (!ID.test(id)) problems.push(`baseline: ${id} is not an id`);
    if (typeof digest !== 'string' || !DIGEST_PATTERN.test(digest)) problems.push(`baseline ${id}: digest must be sha256:<64 hex>`);
  }
  return problems;
};

/* Projection ---------------------------------------------------------------------------------------- */

export interface ReleaseInput {
  /** The typed catalogue (src/lib/learning-resources.ts): the baseline's records and those held back. */
  catalogue: readonly LearningResource[];
  /** Typed candidates outside the catalogue: the only other records a lot may resolve an id to. */
  pool: readonly LearningResource[];
  baseline: unknown;
  /** Every lot manifest in the repository, applied or not. */
  lots: readonly unknown[];
  release: unknown;
  /** Every rule a catalogue record obeys (resourceProblems), bound to the build's date. */
  validate: (resource: LearningResource) => string[];
  now: Date;
}

export interface Projection {
  /** Baseline order, then lot order. */
  published: PublishedLearningResource[];
  /** Every known id's public state: what the applied lots decided. */
  states: ReadonlyMap<string, EditorialState>;
  /** The state the recorded, not yet applied lots would move an id to if applied next, in lot order.
   *  Never public: nothing here is published. */
  ifApplied: ReadonlyMap<string, EditorialState>;
  /** Suspended ids, with the applied lot that suspended them. */
  suspended: ReadonlyMap<string, string>;
  /** The host each published resource is allowed through. */
  hosts: ReadonlySet<string>;
  problems: string[];
}

const isPublishable = (r: LearningResource): r is PublishedLearningResource => r.url !== null && r.verified?.freeAccess === true;

export const projectRelease = (input: ReleaseInput): Projection => {
  const problems: string[] = [];
  const states = new Map<string, EditorialState>();
  const suspended = new Map<string, string>();
  const pendingDecisions = new Map<string, EditorialState>();
  const empty = (): Projection => ({ published: [], states, ifApplied: pendingDecisions, suspended, hosts: new Set(), problems });

  problems.push(...baselineProblems(input.baseline), ...releaseManifestProblems(input.release));
  const lotSchema = input.lots.flatMap((lot) => lotProblems(lot, input.now));
  problems.push(...lotSchema);
  if (problems.length) return empty();
  const baseline = input.baseline as BaselineManifest;
  const release = input.release as ReleaseManifest;
  const lots = input.lots as LotManifest[];

  // Lots: unique names; applied ones exist, are pinned to their content, are authorized, and are real in
  // production. A lot edited after it was applied no longer matches its pin.
  const byName = new Map<string, LotManifest>();
  for (const lot of lots) {
    if (byName.has(lot.lot)) problems.push(`${lot.lot}: two manifests with this name`);
    byName.set(lot.lot, lot);
    // A rehearsal never enters the production state, applied or not.
    if (lot.simulation && release.mode === 'production') problems.push(`${lot.lot}: a simulated lot in a production release`);
  }
  const appliedNames = release.applied.map((a) => a.lot);
  if (new Set(appliedNames).size !== appliedNames.length) problems.push('release: a lot is applied twice');
  if (appliedNames.some((name, i) => i > 0 && appliedNames[i - 1]! >= name)) problems.push('release: applied lots must be in lot order');
  const applied: LotManifest[] = [];
  // The ledger: every lot ever applied keeps its manifest, unchanged, whether or not it is applied now.
  const ledgerNames = release.ledger.map((l) => l.lot);
  if (new Set(ledgerNames).size !== ledgerNames.length) problems.push('release: a lot is in the ledger twice');
  if (ledgerNames.some((name, i) => i > 0 && ledgerNames[i - 1]! >= name)) problems.push('release: the ledger must be in lot order');
  for (const { lot: name, digest } of release.ledger) {
    const lot = byName.get(name);
    if (!lot) problems.push(`release: ${name} is in the ledger but has no manifest`);
    else if (digestOf(lot) !== digest) problems.push(`${name}: changed after it was applied (digest ${digestOf(lot)}, pinned ${digest})`);
  }
  for (const { lot: name, digest } of release.applied) {
    const pinned = release.ledger.find((l) => l.lot === name);
    if (!pinned) problems.push(`release: ${name} is applied but not in the ledger`);
    else if (pinned.digest !== digest) problems.push(`release: ${name} is applied with another digest than the ledger's`);
    const lot = byName.get(name);
    if (!lot) { problems.push(`release: ${name} is applied but has no manifest`); continue; }
    if (!pinned && digestOf(lot) !== digest) problems.push(`${name}: changed after it was applied (digest ${digestOf(lot)}, pinned ${digest})`);
    if (lot.authorization === null) problems.push(`${name}: applied without an authorization to publish`);
    applied.push(lot);
  }
  if (problems.length) return empty();
  // Recorded, never applied. A lot in the ledger but no longer applied was rolled back: it stays pinned as a
  // record and takes no further part (to publish its decisions again, record them in a new lot).
  const pending = lots.filter((lot) => !appliedNames.includes(lot.lot) && !ledgerNames.includes(lot.lot)).sort((a, b) => (a.lot < b.lot ? -1 : 1));

  // Records: the baseline is exactly the published part of the catalogue; ids never repeat.
  const records = new Map<string, LearningResource>();
  for (const r of [...input.catalogue, ...input.pool]) {
    if (records.has(r.id)) problems.push(`${r.id}: two records with this id`);
    records.set(r.id, r);
  }
  const catalogueIds = new Set(input.catalogue.map((r) => r.id));
  const baselineIds = Object.keys(baseline.records);
  const publishedInCatalogue = input.catalogue.filter(isPublishable).map((r) => r.id);
  for (const id of publishedInCatalogue) if (!(id in baseline.records)) problems.push(`${id}: published in the catalogue without a baseline digest or an approval`);
  for (const id of baselineIds) if (!publishedInCatalogue.includes(id)) problems.push(`${id}: in the baseline but not a published catalogue record`);
  for (const r of input.catalogue) states.set(r.id, isPublishable(r) && r.id in baseline.records ? 'published' : 'held');
  for (const r of input.pool) states.set(r.id, 'candidate');
  // A V0.4 host is trusted for the institution published on it, never for any provider, and only from a
  // record still identical to what was published: a changed record never vouches for its own new host.
  const hostOf = (id: string) => `${new URL(records.get(id)!.url!).hostname} ${records.get(id)!.provider}`;
  const baselineHosts = new Set(publishedInCatalogue.filter((id) => digestOf(records.get(id)!) === baseline.records[id]).map(hostOf));

  // Decisions, in lot order. Applied lots move ids to published or suspended: that is the public state.
  // Pending lots are then replayed on a copy, as if applied next in lot order: their decisions are checked
  // and the state they would reach is reported (ifApplied), never published.
  const approval = new Map<string, { entry: LotEntry; lot: LotManifest }>();
  /** Approvals in recorded, not yet applied lots: checked like applied ones, never published. */
  const recorded: { entry: LotEntry; lot: LotManifest }[] = [];
  /** Each id's latest entry, applied or recorded: a verification that is still the last word on a record
   *  is bound to it like an approval (a later decision supersedes it, so history never breaks). */
  const latest = new Map<string, { entry: LotEntry; lot: LotManifest }>();
  const replay = (lot: LotManifest, at: Map<string, EditorialState>, takenOut: Map<string, string>, live: boolean): void => {
    const move = (id: string, to: EditorialState): boolean => {
      const from = at.get(id);
      if (from === undefined) { problems.push(`${lot.lot}: ${id} is not a known record`); return false; }
      if (!canTransition(from, to) && !(to === 'approved' && canTransition(from, 'verified'))) {
        problems.push(`${lot.lot}: ${id} cannot go from ${from} to ${to}`);
        return false;
      }
      at.set(id, to);
      return true;
    };
    const seen = new Set<string>();
    for (const entry of lot.entries) {
      if (seen.has(entry.id)) problems.push(`${lot.lot}: ${entry.id} is decided twice`);
      seen.add(entry.id);
      // A resource taken out (held or suspended) returns only on a verification made since.
      const outOn = takenOut.get(entry.id);
      if (outOn !== undefined && entry.decision !== 'held' && entry.evidence.on < outOn) {
        problems.push(`${lot.lot}: ${entry.id} returns on evidence of ${entry.evidence.on}, older than the decision of ${outOn} that took it out`);
      }
      if (entry.decision === 'held') takenOut.set(entry.id, entry.decidedOn);
      // Only an approval clears it: its evidence is then bound to the record (approvalProblems).
      else if (entry.decision === 'approved') takenOut.delete(entry.id);
      latest.set(entry.id, { entry, lot });
      if (move(entry.id, entry.decision) && entry.decision === 'approved') {
        at.set(entry.id, 'published');
        if (live) {
          approval.set(entry.id, { entry, lot });
          suspended.delete(entry.id);
        } else recorded.push({ entry, lot });
      }
    }
    for (const suspension of lot.suspensions) {
      if (seen.has(suspension.id)) problems.push(`${lot.lot}: ${suspension.id} is decided twice`);
      seen.add(suspension.id);
      if (move(suspension.id, 'suspended')) {
        takenOut.set(suspension.id, suspension.decidedOn);
        if (live) suspended.set(suspension.id, lot.lot);
      }
    }
  };
  /** id → the date of the decision (held or suspension) that took it out, until a fresh verification. */
  const takenOut = new Map<string, string>();
  for (const lot of applied) replay(lot, states, takenOut, true);
  const lastApplied = appliedNames[appliedNames.length - 1];
  for (const lot of pending) if (lastApplied !== undefined && lot.lot < lastApplied) problems.push(`${lot.lot}: recorded after ${lastApplied} was applied, it can no longer be applied in order`);
  const pendingStates = new Map(states);
  const pendingTakenOut = new Map(takenOut);
  for (const lot of pending) replay(lot, pendingStates, pendingTakenOut, false);
  for (const [id, state] of pendingStates) if (states.get(id) !== state) pendingDecisions.set(id, state);

  /** Everything that does not match between an approval and the record it names. */
  const approvalProblems = (entry: LotEntry, lot: LotManifest, r: LearningResource): string[] => {
    const found: string[] = [];
    const at = `${lot.lot} ${r.id}`;
    const digest = digestOf(r);
    if (r.url !== entry.url) found.push(`${at}: approved for ${entry.url}, the record points to ${String(r.url)}`);
    if (digest !== entry.digest) found.push(`${at}: the record changed after its approval (digest ${digest}, approved ${entry.digest})`);
    if (r.provider !== entry.institution) found.push(`${at}: approved for ${entry.institution}, the record says ${r.provider}`);
    if (r.format !== entry.format) found.push(`${at}: approved as ${entry.format}, the record says ${r.format}`);
    if (r.verified?.on !== entry.evidence.on) found.push(`${at}: approved evidence of ${entry.evidence.on}, the record's is of ${String(r.verified?.on)}`);
    if (r.verified?.by !== entry.evidence.method) found.push(`${at}: approved method ${entry.evidence.method}, the record's is ${String(r.verified?.by)}`);
    if (r.verified?.evidence?.url !== entry.evidence.url) found.push(`${at}: approved evidence at ${entry.evidence.url}, the record's is at ${String(r.verified?.evidence?.url)}`);
    if (r.verified?.evidence?.note !== entry.evidence.observed) found.push(`${at}: the approved observation is not the record's evidence note`);
    if (catalogueIds.has(r.id) && !(r.id in baseline.records)) found.push(`${at}: a held catalogue record is published only by moving it to the pool`);
    const host = r.url ? new URL(r.url).hostname : '';
    if (!baselineHosts.has(`${host} ${entry.institution}`) && !lot.hosts.some((h) => h.host === host && h.institution === entry.institution)) {
      found.push(`${at}: ${host} is not a host this lot reviewed for ${entry.institution}`);
    }
    found.push(...urlProblems(r.id, r.url), ...input.validate(r));
    if (!isPublishable(r)) found.push(`${r.id}: approved but not publishable (no URL or free access)`);
    return found;
  };
  // A recorded approval must already match its record: an authorized lot never drifts from its candidate.
  for (const { entry, lot } of recorded) problems.push(...approvalProblems(entry, lot, records.get(entry.id)!));
  for (const { entry, lot } of latest.values()) {
    if (entry.decision === 'verified' && records.has(entry.id)) problems.push(...approvalProblems(entry, lot, records.get(entry.id)!));
  }

  // The projection, and each published record checked against the decision that published it.
  const published: PublishedLearningResource[] = [];
  const hosts = new Set<string>();
  const order = [...input.catalogue.map((r) => r.id).filter((id) => id in baseline.records), ...[...approval.keys()].filter((id) => !(id in baseline.records))];
  for (const id of order) {
    if (states.get(id) !== 'published') continue;
    const r = records.get(id)!;
    const decision = approval.get(id);
    if (decision) problems.push(...approvalProblems(decision.entry, decision.lot, r));
    else {
      const digest = digestOf(r);
      if (digest !== baseline.records[id]) problems.push(`${id}: changed since it was published (digest ${digest}); it needs a new approval`);
      problems.push(...input.validate(r));
    }
    if (!isPublishable(r)) continue; // reported by approvalProblems; a baseline record always is
    published.push(r);
    hosts.add(new URL(r.url).hostname);
  }

  const urls = new Map<string, string>();
  for (const r of published) {
    const other = urls.get(r.url);
    if (other) problems.push(`${r.id}: same URL as ${other} (${r.url})`);
    urls.set(r.url, r.id);
  }

  // Inventory: what the projection publishes is exactly what the release declares.
  const projected = new Set(published.map((r) => r.id));
  const declared = new Set(release.inventory);
  for (const id of declared) if (!projected.has(id)) problems.push(`inventory: ${id} is declared but not published${suspended.has(id) ? ` (suspended by ${suspended.get(id)})` : ''}`);
  for (const id of projected) if (!declared.has(id)) problems.push(`inventory: ${id} is published but not declared`);

  return { published, states, ifApplied: pendingDecisions, suspended, hosts, problems };
};

/** The digest of a lot, as release.json pins it when the lot is applied. */
export const lotDigest = (lot: LotManifest): string => digestOf(lot);

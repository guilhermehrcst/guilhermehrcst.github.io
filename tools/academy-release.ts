// Operator's tool for the Academy incremental release (docs/academy/operacao-publicacao-incremental.md).
// It reads and computes; it never decides. `entry` prints a skeleton whose decision is a placeholder the
// manifest schema refuses until a person replaces it, so nothing this tool prints can publish anything.
//
//   node --experimental-strip-types tools/academy-release.ts status
//   node --experimental-strip-types tools/academy-release.ts digest <id>
//   node --experimental-strip-types tools/academy-release.ts entry <id>
//   node --experimental-strip-types tools/academy-release.ts lot-digest <path/to/L000-name.json>
import { readFileSync } from 'node:fs';
// Records come from the data modules, never through learning-resources.ts: digest and entry keep working
// while a record change keeps the build red (the digest is what its new approval needs).
import { catalogue } from '../src/lib/catalogue-records.ts';
import { STAGED_RESOURCES } from '../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { digestOf } from '../src/lib/release/canonical.ts';

const [command, arg] = process.argv.slice(2);
const records = new Map([...catalogue, ...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES].map((r) => [r.id, r]));
const out = (value: unknown) => process.stdout.write(`${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}\n`);
const die = (message: string): never => {
  process.stderr.write(`academy-release: ${message}\n`);
  return process.exit(1);
};
const recordOf = (id: string | undefined) => (id && records.get(id)) || die(`unknown id ${String(id)}`);

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
  default:
    die('commands: status | digest <id> | entry <id> | lot-digest <file>');
}

# SIMULATION ONLY. Prepares a discardable worktree with simulated lots of the Academy incremental release.
# Every decision written here says "SIMULAÇÃO" (the engine refuses it in a production release, and
# verify-dist refuses a simulation-mode release unless ACADEMY_RELEASE_SIMULATION=1). Nothing here is an
# editorial approval, and the IDs chosen are a demonstration, not the first-lot proposal.
#
#   python3 simulate.py <worktree> A          # lot A applied
#   python3 simulate.py <worktree> AB         # lots A and B applied (B suspends one of A's resources)
#   python3 simulate.py <worktree> A-pending-B   # rollback of B: both recorded, only A applied
import json, subprocess, sys

WT, SCENARIO = sys.argv[1], sys.argv[2]
assert SCENARIO in ('A', 'AB', 'A-pending-B'), SCENARIO
BY = 'SIMULAÇÃO — ensaio do motor de publicação, não é decisão editorial'
ON = '2026-10-12'

def tool(*args):
    return subprocess.run(['node', '--experimental-strip-types', '--no-warnings', 'tools/academy-release.ts', *args],
                          cwd=WT, check=True, capture_output=True, text=True).stdout

def entry(id, decision='approved', reason=None):
    e = json.loads(tool('entry', id))
    e['evidence']['version'] = 'simulacao-2026-10-12'
    e.update(decision=decision, decidedBy=BY, decidedOn=ON)
    if reason: e['reason'] = reason
    return e

def lot(name, title, entries, suspensions=()):
    hosts = sorted({(e['url'].split('/')[2], e['institution']) for e in entries if e['decision'] == 'approved'})
    return {'schema': 'pexis-academy-lot/1', 'lot': name, 'title': title, 'createdOn': ON, 'simulation': True,
            'hosts': [{'host': h, 'institution': i} for h, i in hosts], 'entries': entries,
            'suspensions': [{'id': s, 'reason': r, 'decidedBy': BY, 'decidedOn': ON} for s, r in suspensions],
            'authorization': {'by': BY, 'on': ON}}

A = lot('L001-simulacao-a', 'Simulação A: um recurso por caminho novo e ESA retida', [
    entry('google-mlcc'), entry('mit-1801sc'), entry('ef-obmep-fracoes-6'), entry('ita-provas-anteriores'),
    entry('pm-esa-provas-2026', 'held', 'ESA 2026: PDF oficial não abre no navegador (retida, simulação)'),
])
B = lot('L002-simulacao-b', 'Simulação B: acréscimos e uma suspensão', [
    entry('odin-foundations'), entry('ef-sme-alfabeto-1'), entry('pm-afa-provas'),
], suspensions=[('google-mlcc', 'Suspensão simulada para provar a remoção de todas as superfícies')])
lots = [A] if SCENARIO == 'A' else [A, B]
applied = [A] if SCENARIO in ('A', 'A-pending-B') else [A, B]

for l in lots:
    with open(f"{WT}/src/data/academy-release/lots/{l['lot']}.json", 'w', encoding='utf-8') as f:
        json.dump(l, f, ensure_ascii=False, indent=2); f.write('\n')
imports = ''.join(f"import L{i} from '../../data/academy-release/lots/{l['lot']}.json' with {{ type: 'json' }};\n" for i, l in enumerate(lots))
p = f'{WT}/src/lib/release/lots.ts'
s = open(p).read()
assert 'export const LOT_MANIFESTS: readonly unknown[] = [];' in s
s = s.replace('export const LOT_MANIFESTS: readonly unknown[] = [];',
              imports + 'export const LOT_MANIFESTS: readonly unknown[] = [' + ', '.join(f'L{i}' for i in range(len(lots))) + ']; // SIMULATION')
open(p, 'w').write(s)

release_path = f'{WT}/src/data/academy-release/release.json'
release = json.load(open(release_path))
inventory = set(release['inventory'])
for l in applied:
    inventory |= {e['id'] for e in l['entries'] if e['decision'] == 'approved'}
    inventory -= {s['id'] for s in l['suspensions']}
pins = {l['lot']: tool('lot-digest', f"src/data/academy-release/lots/{l['lot']}.json").strip() for l in lots}
# The ledger keeps every lot ever applied: in the rollback scenario, B was applied before being rolled back.
ever = lots if SCENARIO == 'A-pending-B' else applied
release.update(mode='simulation', inventory=sorted(inventory),
               applied=[{'lot': l['lot'], 'digest': pins[l['lot']]} for l in applied],
               ledger=[{'lot': l['lot'], 'digest': pins[l['lot']]} for l in ever])
json.dump(release, open(release_path, 'w'), indent=2); open(release_path, 'a').write('\n')

def edit(path, fn):
    p = f'{WT}/{path}'; s = open(p).read(); t = fn(s)
    assert t != s, f'no change in {path}'; open(p, 'w').write(t)
# Activating the two paths is its own decision, simulated here alongside the lots.
edit('src/lib/taxonomy.ts', lambda s: s.replace("'ensino-fundamental': 'preparing'", "'ensino-fundamental': 'active'").replace("'pre-militar': 'preparing'", "'pre-militar': 'active'"))
hosts = sorted({h['host'] for l in applied for h in l['hosts']} - {'developers.google.com'} if SCENARIO == 'AB' else {h['host'] for l in applied for h in l['hosts']})
def vd(s):
    s = s.replace("  'www.revista.vestibular.uerj.br',\n];", "  'www.revista.vestibular.uerj.br',\n  // SIMULATION: hosts of the applied simulated lots\n" + ''.join(f"  '{h}',\n" for h in hosts if f"'{h}'" not in s) + "];", 1)
    s = s.replace("const PREPARING = ['/ensino-fundamental/', '/pre-militar/'];", "const PREPARING = []; // SIMULATION")
    # A subject page's #objetivos links the paths its subject's resources serve (same mirror update as the
    # full release candidate, rc-apply.py).
    s = s.replace("const OBJECTIVE_PATHS = ['/enem/', '/uerj/', '/ensino-medio/', '/vestibulares/', '/tecnologia/'];", "const OBJECTIVE_PATHS = ['/enem/', '/uerj/', '/ensino-fundamental/', '/ensino-medio/', '/vestibulares/', '/pre-militar/', '/ensino-superior/', '/tecnologia/']; // SIMULATION")
    s = s.replace("const CANONICAL = [\n  '/', '/ensino-medio/',", "const CANONICAL = [\n  '/', '/ensino-fundamental/', '/pre-militar/', '/ensino-medio/',")
    s = s.replace("  const PATH_PAGES = {\n    '/ensino-medio/'", "  const PATH_PAGES = { // SIMULATION\n    '/ensino-fundamental/': ['/ensino-fundamental/'],\n    '/pre-militar/': ['/pre-militar/'],\n    '/ensino-medio/'")
    return s
edit('scripts/verify-dist.mjs', vd)
print(json.dumps({'scenario': SCENARIO, 'applied': [l['lot'] for l in applied], 'recorded': [l['lot'] for l in lots], 'published': len(release['inventory'])}))

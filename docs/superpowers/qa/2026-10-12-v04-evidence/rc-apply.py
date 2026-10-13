# SIMULATION ONLY. This file prepares a discardable release-candidate worktree.
# The editorial selection is NOT a publication authorization; blocked sources,
# including ESA 2026, must be homologated before any actual release.
# Crucially, never promote a staged record that is absent from the selected IDs.
import json, re, sys
RC = sys.argv[1]
with open(sys.argv[2], encoding='utf-8') as selection_file:
    sel = json.load(selection_file)
PATHS = {'ensino-fundamental', 'ensino-medio', 'vestibulares', 'pre-militar', 'ensino-superior', 'tecnologia'}
assert isinstance(sel, dict) and set(sel) == PATHS, 'expected exactly the six paths'
assert all(isinstance(ids, list) and len(ids) == 10 and
           all(isinstance(id, str) and id for id in ids) for ids in sel.values()), \
    'each path needs exactly 10 nonempty selected IDs'
selected_ids = [id for ids in sel.values() for id in ids]
assert len(selected_ids) == 60 and len(set(selected_ids)) == 60, \
    'selection must contain 60 unique IDs'
def edit(path, fn):
    p = f'{RC}/{path}'; s = open(p).read(); t = fn(s)
    assert t != s, f'no change in {path}'; open(p, 'w').write(t)
def lr(s):
    s = s.replace("import { EXAM_ORDER", "import { STAGED_RESOURCES } from './staging.ts';\nimport { GATEB_NEW_RESOURCES } from './staging-gateb.ts';\nimport { EXAM_ORDER", 1)
    marker = 'export const catalogue: LearningResource[] = ['
    assert s.count(marker) == 1, 'catalogue marker unexpectedly missing'
    assert 'RELEASE_CANDIDATE_SELECTED_IDS' not in s, 'already simulated'
    selection = ("// RC SIMULATION ONLY: staging entries not in this exact editorial selection stay unpublished.\n"
                 "const RELEASE_CANDIDATE_SELECTED_IDS: ReadonlySet<string> = new Set("
                 + json.dumps(selected_ids, ensure_ascii=False) + ");\n")
    s = s.replace(marker, selection + marker, 1)
    i = s.index('export const isPublishedResource'); j = s.rindex('];', 0, i)
    promoted = ("  // Only actually selected IDs may enter the simulated catalogue.\n"
                "  ...STAGED_RESOURCES.filter((r) => RELEASE_CANDIDATE_SELECTED_IDS.has(r.id)),\n"
                "  ...GATEB_NEW_RESOURCES.filter((r) => RELEASE_CANDIDATE_SELECTED_IDS.has(r.id)),\n")
    return s[:j] + promoted + s[j:]
edit('src/lib/learning-resources.ts', lr)
def fe(s):
    s = re.sub(r"export const FEATURED_RELEASE: Readonly<Record<PathId, FeaturedRelease>> = \{.*?\};", "export const FEATURED_RELEASE: Readonly<Record<PathId, FeaturedRelease>> = {\n" + "".join(f"  '{k}': 'released',\n" for k in sel) + "};", s, flags=re.S)
    return re.sub(r"export const FEATURED_RESOURCE_IDS_BY_PATH: Readonly<Record<PathId, readonly string\[\]>> = \{.*?\};", "export const FEATURED_RESOURCE_IDS_BY_PATH: Readonly<Record<PathId, readonly string[]>> = " + json.dumps(sel, indent=2) + ";", s, flags=re.S)
edit('src/lib/featured.ts', fe)
edit('src/lib/taxonomy.ts', lambda s: s.replace("'ensino-fundamental': 'preparing'", "'ensino-fundamental': 'active'").replace("'pre-militar': 'preparing'", "'pre-militar': 'active'"))
NEW = ['assets.marinha.mil.br','canal.cecierj.edu.br','developers.google.com','esa.eb.mil.br','extensao.cecierj.edu.br','ingresso.eear.fab.mil.br','learn.microsoft.com','oyc.yale.edu','portaldaobmep.impa.br','sme.goiania.go.gov.br','vestibular.ita.br','www.fab.mil.br','www.fuvest.br','www.ime.eb.mil.br','www.inscricao.marinha.mil.br','www.open.edu','www.theodinproject.com']
def vd(s):
    s = s.replace("  'www.revista.vestibular.uerj.br',\n];", "  'www.revista.vestibular.uerj.br',\n  // RC SIMULATION: the 17 Gate B hosts\n" + "".join(f"  '{h}',\n" for h in NEW) + "];", 1)
    s = s.replace("const PREPARING = ['/ensino-fundamental/', '/pre-militar/'];", "const PREPARING = []; // RC SIMULATION")
    s = s.replace("const CANONICAL = [\n  '/', '/ensino-medio/',", "const CANONICAL = [\n  '/', '/ensino-fundamental/', '/pre-militar/', '/ensino-medio/',")
    s = s.replace("const OBJECTIVE_PATHS = ['/enem/', '/uerj/', '/ensino-medio/', '/vestibulares/', '/tecnologia/'];", "const OBJECTIVE_PATHS = ['/enem/', '/uerj/', '/ensino-fundamental/', '/ensino-medio/', '/vestibulares/', '/pre-militar/', '/ensino-superior/', '/tecnologia/']; // RC SIMULATION")
    s = s.replace("'dados', 'seguranca-e-privacidade'];\n    if (JSON.stringify(tracks", "'dados', 'seguranca-e-privacidade', 'computacao-em-nuvem']; // RC SIMULATION\n    if (JSON.stringify(tracks")
    s = s.replace("  const PATH_PAGES = {\n    '/ensino-medio/'", "  const PATH_PAGES = { // RC SIMULATION\n    '/ensino-fundamental/': ['/ensino-fundamental/'],\n    '/pre-militar/': ['/pre-militar/'],\n    '/ensino-medio/'")
    return s
edit('scripts/verify-dist.mjs', vd)
print('applied')

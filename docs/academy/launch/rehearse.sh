#!/usr/bin/env bash
# SIMULAÇÃO. Rehearses a launch plan on a disposable copy of the repository; nothing here is an editorial
# decision and nothing in the repository changes. It applies the plan's prepared change set (plan-*.patch:
# guards, verify-dist mirrors and, for plan A, the path activation), then a lot of the plan's ids marked
# SIMULAÇÃO through tools/academy-release.ts in a simulation-mode release, and runs the whole gate.
#
#   docs/academy/launch/rehearse.sh plan-b|plan-a [workdir]   (workdir: absolute, must not exist yet)
#
# It passes only when tests, astro check, build and verify-dist pass, except exactly the three tests that
# pin the release's identity (mode, lot name, inventory), which the real lot PR writes with the real
# lot: a rehearsal runs in simulation mode, so it can never meet them.
set -euo pipefail
PLAN=${1:-}
case "$PLAN" in
  plan-a|plan-b) ;;
  *) echo "rehearse: unknown plan '$PLAN' (plan-a or plan-b)" >&2; exit 2 ;;
esac
# The workdir is always one this script creates: an absolute path that does not exist yet (its parent
# must), or a fresh mktemp directory. Nothing is ever deleted or reused.
if [ $# -ge 2 ]; then
  W=$2
  case "$W" in
    /*) ;;
    *) echo "rehearse: workdir must be an absolute path that does not exist yet: '$W'" >&2; exit 2 ;;
  esac
  if [ -e "$W" ] || [ -L "$W" ]; then
    echo "rehearse: workdir $W already exists; it is never deleted or reused" >&2; exit 2
  fi
  [ -d "$(dirname "$W")" ] || { echo "rehearse: workdir parent $(dirname "$W") does not exist" >&2; exit 2; }
  mkdir "$W"
else
  W="$(mktemp -d)/rehearsal"
  mkdir "$W"
fi
# The repository this script belongs to (no git needed: it also runs inside a rehearsal copy).
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(cd "$HERE/../../.." && pwd)
(cd "$ROOT" && git ls-files -z | xargs -0 cp --parents -t "$W")
ln -s "$ROOT/node_modules" "$W/node_modules"
cd "$W"
git apply "$HERE/$PLAN.patch"
IDS=$(python3 -c "import json,sys; print(' '.join(json.load(open('$HERE/plans.json'))['$PLAN']['ids']))")
EXPECTED=$(python3 -c "import json; print(json.load(open('$HERE/plans.json'))['$PLAN']['published'])")
python3 - <<'PY'
import json
p = 'src/data/academy-release/release.json'
d = json.load(open(p)); d['mode'] = 'simulation'
open(p, 'w').write(json.dumps(d, indent=2) + '\n')
PY
TOOL="node --experimental-strip-types --no-warnings tools/academy-release.ts"
# shellcheck disable=SC2086
$TOOL draft L001-ensaio $IDS > draft.json
python3 - <<'PY'
import json
BY = 'SIMULAÇÃO — ensaio de lançamento, não é decisão editorial'
d = json.load(open('draft.json'))
d.update(title='Ensaio de lançamento', createdOn='2026-10-12', simulation=True, authorization={'by': BY, 'on': '2026-10-12'})
for e in d['entries']:
    e['evidence']['version'] = 'ensaio'
    e.update(decision='approved', decidedBy=BY, decidedOn=e['evidence']['on'])
json.dump(d, open('L001-ensaio.json', 'w'), ensure_ascii=False, indent=2)
PY
$TOOL apply L001-ensaio.json
rm -f draft.json L001-ensaio.json
PUBLISHED=$(python3 -c "import json; print(len(json.load(open('src/data/academy-release/release.json'))['inventory']))")
[ "$PUBLISHED" = "$EXPECTED" ] || { echo "rehearse: $PUBLISHED published, expected $EXPECTED"; exit 1; }

# Where each new resource lives and links to, for the browser QA (qa.mjs).
# shellcheck disable=SC2086
node --experimental-strip-types --no-warnings --input-type=module -e "
const { publishedResources } = await import('./src/lib/learning-resources.ts');
const { placementOf } = await import('./src/lib/placement.ts');
const ids = process.argv.slice(1);
const out = Object.fromEntries(ids.map((id) => { const r = publishedResources.find((x) => x.id === id); return [id, { url: r.url, page: placementOf(r).page }]; }));
console.log(JSON.stringify(out, null, 2));" $IDS > plan-placement.json

npm test > test.log 2>&1 || true
FAILED=$(grep '^not ok' test.log | sed -E 's/^not ok [0-9]+ - //' | sort)
ALLOWED=$(printf '%s\n' \
  '14. the repository release applies nothing and the staging records stay where they were' \
  'production today: no lot applied, the 37 of V0.4 exactly, every staged record unpublished' \
  'this PR applies no lot: production mode, nothing applied, the inventory is the 37 of V0.4' | sort)
if [ "$FAILED" != "$ALLOWED" ]; then
  echo "rehearse: unexpected test results"; diff <(echo "$ALLOWED") <(echo "$FAILED") || true; exit 1
fi
npx astro check > check.log 2>&1 || { tail -20 check.log; exit 1; }
npx astro build > build.log 2>&1 || { tail -20 build.log; exit 1; }
ACADEMY_RELEASE_SIMULATION=1 node scripts/verify-dist.mjs
echo "rehearse: $PLAN holds — $PUBLISHED published; $(grep -E '^# pass' test.log); only the 3 release-identity pins differ; dist in $W/dist"

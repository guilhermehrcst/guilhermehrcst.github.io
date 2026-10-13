// Independent Phase C audit. Run: node --experimental-strip-types audit60.mjs <candidate-root> <main-root> <review.json>
import { readFileSync } from 'node:fs';
const [root, mainRoot, reviewPath] = process.argv.slice(2);
const lr = await import(`${root}/src/lib/learning-resources.ts`);
const pv = await import(`${root}/src/lib/gateb-selection-preview.ts`);
const fe = await import(`${root}/src/lib/featured.ts`);
const tx = await import(`${root}/src/lib/taxonomy.ts`);
const lrMain = await import(`${mainRoot}/src/lib/learning-resources.ts`);
const review = JSON.parse(readFileSync(reviewPath, 'utf8'));
const NOW = new Date('2026-10-12T23:59:59Z');
const results = []; const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail: ok ? '' : String(detail) });

const sel = pv.GATEB_DRAFT_SELECTION; const all = pv.gatebSelectedResources();
const ids = all.map((r) => r.id);
check('C1 exactly 60 IDs', ids.length === 60, ids.length);
check('C2 60 distinct IDs', new Set(ids).size === 60);
for (const p of tx.PATH_ORDER) check(`C3 ten in ${p}`, sel[p].length === 10 && new Set(sel[p]).size === 10, sel[p].length);
const urls = all.map((r) => r.url); const dupU = urls.filter((u, i) => urls.indexOf(u) !== i);
check('C4 no duplicated URL among the 60', dupU.length === 0, dupU);
const pubIds = new Set(lr.publishedResources.map((r) => r.id));
const legacyUrls = new Map(lr.publishedResources.map((r) => [r.url, r.id]));
const clash = all.filter((r) => !pubIds.has(r.id) && legacyUrls.has(r.url)).map((r) => `${r.id}=${legacyUrls.get(r.url)}`);
check('C4b no new candidate repeats a legacy URL as an independent offer', clash.length === 0, clash);
const probs = all.flatMap((r) => lr.resourceProblems(r, NOW).map((p) => `${r.id}: ${p}`));
check('C5 resourceProblems() empty for all 60 (now=2026-10-12)', probs.length === 0, probs);
const badDate = all.filter((r) => !['2026-10-11', '2026-10-12'].includes(r.verified?.on)).map((r) => `${r.id}:${r.verified?.on}`);
check('C6 verification dates are 2026-10-11/12', badDate.length === 0, badDate);
check('C7 featuredProblems(final) accepts the 60 as a hypothetical catalogue', fe.featuredProblems(sel, 'final', all).length === 0, fe.featuredProblems(sel, 'final', all));
check('C7b gatebDraftProblems() empty', pv.gatebDraftProblems(NOW).length === 0, pv.gatebDraftProblems(NOW));
const hostMis = all.filter((r) => r.verified?.evidence && new URL(r.verified.evidence.url).host !== new URL(r.url).host).map((r) => r.id);
check('C8 evidence host == resource host (new records)', hostMis.length === 0, hostMis);
for (const p of tx.PATH_ORDER) all.filter((r) => sel[p].includes(r.id)).forEach((r) => { if (!r.paths.includes(p)) check(`C9 ${r.id} declares ${p}`, false); });
const multi = all.filter((r) => r.format === 'past-exam' && r.subject !== null).map((r) => r.id);
check('C10 past exams are multidisciplinary: subject null', multi.length === 0, multi);
const yrs = all.filter((r) => r.schoolYears?.length).map((r) => ({ id: r.id, ok: r.paths.includes('ensino-fundamental') && r.verified?.evidence?.checked.includes('grade') }));
check('C11 schoolYears only on Fundamental with grade evidence', yrs.every((y) => y.ok), yrs.filter((y) => !y.ok).map((y) => y.id));
check('C11b every Fundamental candidate has a proven year', all.filter((r) => r.paths.includes('ensino-fundamental')).every((r) => r.schoolYears?.length === 1));
const reviewIds = Object.fromEntries(tx.PATH_ORDER.map((p) => [p, review.items.filter((i) => i.path === p).sort((a, b) => a.position - b.position).map((i) => i.id)]));
check('C12 selection order == editorial review 05 JSON', JSON.stringify(reviewIds) === JSON.stringify(sel));
const urlMis = review.items.filter((i) => { const r = all.find((x) => x.id === i.id); return r && i.official_url !== r.url; }).map((i) => i.id);
check('C12b record URL == review official_url', urlMis.length === 0, urlMis);
// Editorial-semantic checks
const cec = all.filter((r) => r.id.startsWith('cecierj-pvs-'));
check('C13 Cecierj PVS: reference, never past-exam, no exam claims', cec.length === 5 && cec.every((r) => r.format === 'reference' && !(r.exams ?? []).length), cec.map((r) => `${r.id}:${r.format}:${r.exams}`));
const ap = all.find((r) => r.id === 'cecierj-aprovarj');
check('C14 AprovaRJ is a course, not a past exam', ap?.format === 'course' && ap.registration === 'required');
const esa = all.find((r) => r.id === 'pm-esa-provas-2026');
check('C15 ESA 2026 never presented as EsPCEx', esa && /ESA/.test(esa.title) && !/EsPCEx/i.test(esa.title) && !ids.some((i) => /espcex/.test(i)));
// Legacy preservation
const ser = (rs) => JSON.stringify([...rs].sort((a, b) => a.id.localeCompare(b.id)));
check('C16 37 published records byte-identical to main 5e4b086', lr.publishedResources.length === 37 && ser(lr.publishedResources) === ser(lrMain.publishedResources));
// Nothing promoted / released
check('C17 no candidate promoted: published set unchanged, FEATURED lists empty, all staging', tx.PATH_ORDER.every((p) => fe.FEATURED_RESOURCE_IDS_BY_PATH[p].length === 0 && fe.FEATURED_RELEASE[p] === 'staging'));
check('C18 Fundamental and Pré-Militar still preparing', tx.PATH_STATUS['ensino-fundamental'] === 'preparing' && tx.PATH_STATUS['pre-militar'] === 'preparing');
check('C19 publication flags false', pv.GATEB_SELECTION_AUTHORIZES_PUBLICATION === false);
check('C20 placement: no gaps when projected, nine unreleased destinations', pv.gatebPlacementGaps().length === 0 && pv.gatebUnreleasedDestinations().length === 9, `${pv.gatebPlacementGaps()} | ${pv.gatebUnreleasedDestinations()}`);
// Hosts
const courseHosts = new Set(lr.COURSE_HOSTS ?? []);
const newHosts = [...new Set(all.filter((r) => !pubIds.has(r.id)).map((r) => new URL(r.url).host))].filter((h) => !courseHosts.has(h)).sort();
console.log('NEW_HOSTS', newHosts.length, newHosts.join(' '));
for (const r of results) console.log(r.ok ? 'PASS' : 'FAIL', r.name, r.detail);
console.log(`${results.filter((r) => r.ok).length}/${results.length} pass`);

const root = process.argv[2];
const ps = await import(`${root}/src/lib/path-status.ts`);
const fe = await import(`${root}/src/lib/featured.ts`);
const lr = await import(`${root}/src/lib/learning-resources.ts`);
const tx = await import(`${root}/src/lib/taxonomy.ts`);
const sel = fe.FEATURED_RESOURCE_IDS_BY_PATH; const rel = fe.FEATURED_RELEASE; const all = lr.publishedResources;
const active = Object.fromEntries(tx.PATH_ORDER.map((p) => [p, 'active']));
const cases = [
  ['RC full activation (expected: accepted)', active, sel, all, rel, false],
  ['Pré-Militar active with 9 highlights', active, { ...sel, 'pre-militar': sel['pre-militar'].slice(0, 9) }, all, rel, true],
  ['Pré-Militar active with only ITA published', active, sel, all.filter((r) => !r.paths.includes('pre-militar') || r.id === 'ita-provas-anteriores'), rel, true],
  ['Fundamental active, highlights still in staging', active, sel, all, { ...rel, 'ensino-fundamental': 'staging' }, true],
  ['Fundamental released while preparing', { ...active, 'ensino-fundamental': 'preparing' }, sel, all, rel, true],
  ['Fundamental active with no published resource', active, { ...sel, 'ensino-fundamental': [] }, all.filter((r) => !r.paths.includes('ensino-fundamental')), { ...rel, 'ensino-fundamental': 'staging' }, true],
];
for (const [name, st, s, res, r, expectProblems] of cases) {
  const problems = ps.activationProblems(st, s, res, r);
  console.log((problems.length > 0) === expectProblems ? 'OK ' : 'BAD', name, '|', problems.slice(0, 2).join(' ; ') || 'no problems');
}

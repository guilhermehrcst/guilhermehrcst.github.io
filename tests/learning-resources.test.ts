import { test } from 'node:test';
import assert from 'node:assert/strict';
import { areaOf, catalogue, COURSE_HOSTS, publishedResources } from '../src/lib/learning-resources.ts';
import { ACADEMIC_SUBJECTS, SUBJECTS } from '../src/lib/taxonomy.ts';

// Characterisation snapshot, written before the migration to the Pexis Academy taxonomy (plan T1.2).
// Every record keeps its id, title, provider, URL, format and verification date; only the subject and
// goal ids move to Portuguese (math → matematica, high-school → ensino-medio, vestibular → vestibulares).
// Nothing here may change without re-verifying the resource at its source.
const SNAPSHOT = new Map<string, {
  title: string; provider: string; url: string | null; format: string; subject: string; paths: string[]; exams: string[]; verifiedOn: string | null;
}>([
  ["cs50x", { title: "CS50x: Introduction to Computer Science", provider: "Harvard University", url: "https://cs50.harvard.edu/x/", format: "course", subject: "tecnologia", paths: ["tecnologia","ensino-superior"], exams: [], verifiedOn: "2026-10-11" }],
  ["cs50p", { title: "CS50’s Introduction to Programming with Python", provider: "Harvard University", url: "https://cs50.harvard.edu/python/", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["mit-6100l", { title: "Introduction to Computer Science and Programming Using Python", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/", format: "course", subject: "tecnologia", paths: ["tecnologia","ensino-superior"], exams: [], verifiedOn: "2026-10-11" }],
  ["fb-python", { title: "Linguagem de Programação Python - Básico", provider: "Fundação Bradesco", url: "https://www.ev.org.br/cursos/linguagem-de-programacao-python-basico", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["fb-web", { title: "Crie um site simples usando HTML, CSS e JavaScript", provider: "Fundação Bradesco", url: "https://www.ev.org.br/cursos/crie-um-site-simples-usando-html-css-e-javascript", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["cs50w", { title: "CS50’s Web Programming with Python and JavaScript", provider: "Harvard University", url: "https://cs50.harvard.edu/web/", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["cs50ai", { title: "CS50’s Introduction to Artificial Intelligence with Python", provider: "Harvard University", url: "https://cs50.harvard.edu/ai/", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["fluencia", { title: "FluêncIA em Inteligência Artificial", provider: "Fundação Bradesco + Microsoft", url: "https://www.ev.org.br/cursos/fluencia", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["ms-explore-genai", { title: "Explorar IA Generativa", provider: "Microsoft Learn", url: null, format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: null }],
  ["ibm-genai", { title: "Introdução à IA Generativa", provider: "IBM SkillsBuild", url: null, format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: null }],
  ["fgv-datasci", { title: "Introdução à Ciência de Dados", provider: "FGV", url: "https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/introducao-ciencia-de-dados", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["mit-60002", { title: "Introduction to Computational Thinking and Data Science", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/", format: "course", subject: "tecnologia", paths: ["tecnologia","ensino-superior"], exams: [], verifiedOn: "2026-10-11" }],
  ["cs50sql", { title: "CS50’s Introduction to Databases with SQL", provider: "Harvard University", url: "https://cs50.harvard.edu/sql/", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["mit-6006", { title: "Introduction to Algorithms", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", format: "course", subject: "tecnologia", paths: ["tecnologia","ensino-superior"], exams: [], verifiedOn: "2026-10-11" }],
  ["mit-6042j", { title: "Mathematics for Computer Science", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/", format: "course", subject: "tecnologia", paths: ["tecnologia","ensino-superior"], exams: [], verifiedOn: "2026-10-11" }],
  ["mit-1806", { title: "Linear Algebra", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", format: "course", subject: "tecnologia", paths: ["tecnologia","ensino-superior"], exams: [], verifiedOn: "2026-10-11" }],
  ["cisco-cyber", { title: "Introduction to Cybersecurity", provider: "Cisco Networking Academy", url: "https://www.netacad.com/courses/introduction-to-cybersecurity", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["fgv-security", { title: "Segurança Digital", provider: "FGV", url: "https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/seguranca-digital", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["fgv-privacy", { title: "Proteção de Dados", provider: "FGV", url: "https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/protecao-de-dados", format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: "2026-10-11" }],
  ["ms-azure-ai", { title: "Fundamentos de Inteligência Artificial no Azure", provider: "Microsoft Learn", url: null, format: "course", subject: "tecnologia", paths: ["tecnologia"], exams: [], verifiedOn: null }],
  ["kultivi-math-enem", { title: "Matemática para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/matematica", format: "course", subject: "matematica", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-portuguese-enem", { title: "Português para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/portugues", format: "course", subject: "portugues", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-writing-enem", { title: "Redação para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/redacao-para-enem", format: "course", subject: "redacao", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-physics-enem", { title: "Física para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/fisica", format: "course", subject: "fisica", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-chemistry-enem", { title: "Química para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/quimica", format: "course", subject: "quimica", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-biology-enem", { title: "Biologia para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/biologia", format: "course", subject: "biologia", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-history-enem", { title: "História para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/historia-2", format: "course", subject: "historia", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-geography-enem", { title: "Geografia para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/geografia", format: "course", subject: "geografia", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-philosophy-enem", { title: "Filosofia para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/filosofia", format: "course", subject: "filosofia", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-sociology-enem", { title: "Sociologia para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/sociologia", format: "course", subject: "sociologia", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-english-enem", { title: "Inglês para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/ingles-para-enem", format: "course", subject: "ingles", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["kultivi-spanish-enem", { title: "Espanhol para ENEM", provider: "Kultivi", url: "https://kultivi.com/curso/espanhol-para-enem", format: "course", subject: "espanhol", paths: ["ensino-medio","vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["inep-writing-2026", { title: "A Redação do Enem 2026 — Cartilha do Participante", provider: "INEP", url: "https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante", format: "practice", subject: "redacao", paths: ["vestibulares"], exams: ["enem"], verifiedOn: "2026-10-11" }],
  ["uerj-portuguese-practice", { title: "Questões de Língua Portuguesa e Literatura", provider: "Revista do Vestibular UERJ", url: "https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=1", format: "practice", subject: "portugues", paths: ["vestibulares"], exams: ["uerj"], verifiedOn: "2026-10-11" }],
  ["uerj-writing-practice", { title: "Questões de Língua Portuguesa Instrumental com Redação", provider: "Revista do Vestibular UERJ", url: "https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=11", format: "practice", subject: "redacao", paths: ["vestibulares"], exams: ["uerj"], verifiedOn: "2026-10-11" }],
  ["uerj-math-practice", { title: "Questões de Matemática", provider: "Revista do Vestibular UERJ", url: "https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=9", format: "practice", subject: "matematica", paths: ["vestibulares"], exams: ["uerj"], verifiedOn: "2026-10-11" }],
  ["uerj-history-practice", { title: "Questões de História", provider: "Revista do Vestibular UERJ", url: "https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=5", format: "practice", subject: "historia", paths: ["vestibulares"], exams: ["uerj"], verifiedOn: "2026-10-11" }],
  ["uerj-geography-practice", { title: "Questões de Geografia", provider: "Revista do Vestibular UERJ", url: "https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=6", format: "practice", subject: "geografia", paths: ["vestibulares"], exams: ["uerj"], verifiedOn: "2026-10-11" }],
  ["uerj-spanish-practice", { title: "Questões de Espanhol", provider: "Revista do Vestibular UERJ", url: "https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=2", format: "practice", subject: "espanhol", paths: ["vestibulares"], exams: ["uerj"], verifiedOn: "2026-10-11" }],
  ["uerj-physics-practice", { title: "Questões de Física", provider: "Revista do Vestibular UERJ", url: "https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aano=&anivel=dificil&aseq_area=&aseq_disciplina=8&aseq_etapa=&sb=Buscar", format: "practice", subject: "fisica", paths: ["vestibulares"], exams: ["uerj"], verifiedOn: "2026-10-11" }],
]);

test('the catalogue is exactly the 40 records of the snapshot, field by field', () => {
  assert.deepEqual(catalogue.map((r) => r.id), [...SNAPSHOT.keys()]);
  for (const r of catalogue) {
    const s = SNAPSHOT.get(r.id)!;
    assert.deepEqual(
      { title: r.title, provider: r.provider, url: r.url, format: r.format, subject: r.subject, paths: [...r.paths], exams: [...(r.exams ?? [])], verifiedOn: r.verified?.on ?? null },
      s,
      r.id,
    );
  }
});

test('44 published (37 baseline + 6 L001 + 1 L002 ITA), 3 baseline records held back', () => {
  assert.equal(publishedResources.length, 44);
  const held = catalogue.filter((r) => r.url === null);
  assert.equal(held.length, 3);
  for (const r of held) assert.ok(r.review?.trim(), `${r.id}: missing review note`);
});

test('resource ids are unique', () => {
  assert.equal(new Set(catalogue.map((r) => r.id)).size, catalogue.length);
});

test('published resources are HTTPS and explicitly verified free', () => {
  for (const r of publishedResources) {
    assert.ok(/^https:\/\//.test(r.url), r.id);
    assert.equal(r.verified.freeAccess, true, r.id);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(r.verified.on), r.id);
  }
});

test('the subject is the only source of the area', () => {
  for (const r of catalogue) {
    assert.ok(!('area' in r), `${r.id}: carries its own area`);
    if (r.subject === null) { assert.equal(areaOf(r), null, r.id); continue; }
    assert.ok(r.subject in SUBJECTS, `${r.id}: unknown subject ${r.subject}`);
    assert.equal(areaOf(r), SUBJECTS[r.subject].area, r.id);
  }
});

test('exams are the exam ids, never a path', () => {
  for (const r of catalogue) {
    for (const exam of r.exams ?? []) assert.ok(['enem', 'uerj'].includes(exam), `${r.id}: ${exam}`);
  }
});

test('every school subject has at least one published resource', () => {
  for (const subject of ACADEMIC_SUBJECTS) {
    assert.ok(publishedResources.some((r) => r.subject === subject), `missing ${subject}`);
  }
});

test('free practice exists for ENEM and UERJ', () => {
  for (const goal of ['enem', 'uerj'] as const) {
    assert.ok(publishedResources.some((r) => r.format === 'practice' && r.exams?.includes(goal)), goal);
  }
});

test('COURSE_HOSTS is exactly the set of hosts of published resources', () => {
  assert.deepEqual([...COURSE_HOSTS].sort(), [...new Set(publishedResources.map((r) => new URL(r.url).hostname))].sort());
});

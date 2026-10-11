// Gate B staging (V0.4, Lote 02): records whose official source was opened directly, outside this
// environment, on 2026-10-11 (docs/superpowers/research/2026-10-11-v04-gateb-lote02-direct.csv). Each one
// passes every rule of a catalogue record (resourceProblems: paths, exams, school years, individual evidence,
// direct method) — tests/staging.test.ts holds them to it — but none is in the catalogue: no page imports
// this module, nothing here is published, and nothing here authorises publication. Promotion is a later,
// explicit step: move the record into `catalogue`, place it (PLACEMENT_PLAN), then release a complete
// selection. `level` is not shown anywhere on the site; the evidence does not cover it, and the type has no
// value for Ensino Fundamental (model decision pending). No asset imports: this module runs under Node.
import type { EvidenceCheck, LearningResource, ResourceVerification } from './learning-resources.ts';
import type { PathId } from './taxonomy.ts';

export const STAGING_AUTHORIZES_PUBLICATION = false as const;

const ON = '2026-10-11';
const REVIEWER = 'Aberta diretamente por ChatGPT (fora do ambiente do Claude Code) em 11/10/2026.';
const BASE: readonly EvidenceCheck[] = ['free', 'scope', 'language', 'format', 'path'];

/** A verification from the Lote 02 sheet: the official page itself, what was checked, and what was seen. */
const opened = (url: string, extra: readonly EvidenceCheck[], seen: string): ResourceVerification => ({
  on: ON,
  by: 'official-page',
  freeAccess: true,
  evidence: { url, checked: [...BASE, ...extra], note: `${REVIEWER} ${seen}` },
});

const SME_LETRAS = 'https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-letras-e-palavras/';
const SME_LEITURA = 'https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/lingua-portuguesa-leitura-em-foco/';
const KULTIVI_ENEM = 'https://kultivi.com/curso/enem-completo';
const INEP_PROVAS = 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos';
const FUVEST_2026 = 'https://www.fuvest.br/acervo-vestibular-2026/';
const ITA_PROVAS = 'https://vestibular.ita.br/provas.htm';
const MIT_1801 = 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/';
const MIT_801 = 'https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/';
const MIT_7012 = 'https://ocw.mit.edu/courses/7-012-introduction-to-biology-fall-2004/';
const YALE_PSYC = 'https://oyc.yale.edu/introduction-psychology/psyc-110';
const YALE_ECON = 'https://oyc.yale.edu/economics/econ-252';
const OU_ENV = 'https://www.open.edu/openlearn/nature-environment/environmental-studies/environment-treading-lightly-on-the-earth/content-section-0';
const ODIN = 'https://www.theodinproject.com/paths/foundations/courses/foundations';
const MLCC = 'https://developers.google.com/machine-learning/crash-course/';
const MS_CLOUD = 'https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/';

const NONE_NONE: readonly EvidenceCheck[] = ['registration', 'certificate'];
const MIT_POLICY = 'Política oficial: https://ocw.mit.edu/about/ (gratuito, sem cadastro nem certificado).';
const YALE_POLICY = 'Política oficial: https://oyc.yale.edu/about (gratuito, sem registro, sem diploma, crédito ou certificado).';

/** The 15 new records of Lote 02, in the sheet's order. Formats are the observed ones: a lesson, a past exam
 *  or a reference is never a course. */
export const STAGED_RESOURCES: readonly LearningResource[] = [
  // Ensino Fundamental
  { id: 'sme-goiania-letras-e-palavras', title: 'Língua Portuguesa – Letras e palavras', provider: 'SME Goiânia', subject: 'portugues', format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_LETRAS, schoolYears: [2], registration: 'not-required', certificate: 'none',
    verified: opened(SME_LETRAS, [...NONE_NONE, 'grade'], 'Texto integral, videoaula vinculada e exercícios; a página indica o 2º ano. Aula, não curso.') },
  { id: 'sme-goiania-leitura-em-foco', title: 'Língua Portuguesa: Leitura em Foco', provider: 'SME Goiânia', subject: 'portugues', format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_LEITURA, schoolYears: [5], registration: 'not-required', certificate: 'none',
    verified: opened(SME_LEITURA, [...NONE_NONE, 'grade'], 'Atividade, exercícios, conteúdo e videoaula; a página indica o 5º ano. Aula, não curso completo.') },
  // Vestibular
  { id: 'kultivi-enem-completo', title: 'ENEM Completo', provider: 'Kultivi', subject: null, format: 'course', paths: ['vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: KULTIVI_ENEM, registration: 'required', certificate: 'available',
    verified: opened(KULTIVI_ENEM, NONE_NONE, 'Curso online gratuito, multidisciplinar, 1.058 aulas, acesso vitalício; matrícula e certificado gratuitos.') },
  { id: 'inep-enem-provas-gabaritos', title: 'Provas e Gabaritos do Enem', provider: 'INEP', subject: null, format: 'past-exam', paths: ['vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: INEP_PROVAS, registration: 'not-required', certificate: 'none',
    verified: opened(INEP_PROVAS, NONE_NONE, 'Arquivo oficial de provas e gabaritos de 1998 a 2025, publicado por quem aplica o exame. Não é curso.') },
  { id: 'fuvest-acervo-2026', title: 'Acervo – Vestibular USP 2026', provider: 'Fuvest', subject: null, format: 'past-exam', paths: ['vestibulares'], language: 'pt', level: 'vestibular', url: FUVEST_2026, registration: 'not-required', certificate: 'none',
    verified: opened(FUVEST_2026, NONE_NONE, 'Provas e gabaritos de primeira e segunda fase do vestibular 2026, em PDF. Só a edição de 2026.') },
  // Pré-Militar
  { id: 'ita-provas-anteriores', title: 'Provas de Vestibulares Anteriores - ITA', provider: 'ITA', subject: null, format: 'past-exam', paths: ['pre-militar'], language: 'pt', level: 'vestibular', url: ITA_PROVAS, registration: 'not-required', certificate: 'none',
    verified: opened(ITA_PROVAS, NONE_NONE, 'Coleção oficial de provas e gabaritos por fase e disciplina, com anos até 2026. Não é curso.') },
  // Ensino Superior (no enrolment, credit or diploma)
  { id: 'mit-1801sc', title: 'Single Variable Calculus', provider: 'MIT OpenCourseWare', subject: 'matematica', format: 'course', paths: ['ensino-superior'], language: 'en', level: 'beginner-intermediate', url: MIT_1801, registration: 'not-required', certificate: 'none',
    verified: opened(MIT_1801, NONE_NONE, `Vídeos, listas, exames e notas: derivadas, integrais e séries. ${MIT_POLICY}`) },
  { id: 'mit-801sc', title: 'Classical Mechanics', provider: 'MIT OpenCourseWare', subject: 'fisica', format: 'course', paths: ['ensino-superior'], language: 'en', level: 'beginner-intermediate', url: MIT_801, registration: 'not-required', certificate: 'none',
    verified: opened(MIT_801, NONE_NONE, `Livro-texto, vídeos, 12 semanas e listas de exercícios. ${MIT_POLICY}`) },
  { id: 'mit-7012', title: 'Introduction to Biology', provider: 'MIT OpenCourseWare', subject: 'biologia', format: 'course', paths: ['ensino-superior'], language: 'en', level: 'beginner-intermediate', url: MIT_7012, registration: 'not-required', certificate: 'none',
    verified: opened(MIT_7012, NONE_NONE, `Vídeos, materiais, exercícios e exames; edição Fall 2004. ${MIT_POLICY}`) },
  { id: 'yale-psyc-110', title: 'Introduction to Psychology', provider: 'Open Yale Courses', subject: null, format: 'course', paths: ['ensino-superior'], language: 'en', level: 'beginner', url: YALE_PSYC, registration: 'not-required', certificate: 'none',
    verified: opened(YALE_PSYC, NONE_NONE, `Aulas numeradas de PSYC 110 e materiais; gravado em 2007. ${YALE_POLICY}`) },
  { id: 'yale-econ-252', title: 'Financial Markets (2011)', provider: 'Open Yale Courses', subject: null, format: 'course', paths: ['ensino-superior'], language: 'en', level: 'intermediate', url: YALE_ECON, registration: 'not-required', certificate: 'none',
    verified: opened(YALE_ECON, NONE_NONE, `23 aulas de ECON 252 e avaliações; edição de 2011. Leituras suplementares pagas ficam de fora. ${YALE_POLICY}`) },
  { id: 'ou-environment-treading-lightly', title: 'Environment: treading lightly on the Earth', provider: 'The Open University', subject: null, format: 'course', paths: ['ensino-superior'], language: 'en', level: 'beginner', url: OU_ENV, registration: 'not-required', certificate: 'statement',
    verified: opened(OU_ENV, NONE_NONE, 'Free course de 15 horas, sem cadastro para o conteúdo; conta opcional para atividades, progresso e declaração gratuita de participação.') },
  // Tecnologia (certificate unconfirmed: never shown as a fact)
  { id: 'odin-foundations', title: 'Foundations Course', provider: 'The Odin Project', subject: 'tecnologia', format: 'track', paths: ['tecnologia'], language: 'en', level: 'beginner', url: ODIN, registration: 'not-required', certificate: 'unconfirmed', technology: { section: 'build', topic: 'webdev' },
    verified: opened(ODIN, ['registration'], 'Módulos de HTML, CSS, JavaScript, Git e projetos; currículo declarado gratuito e aberto. Não é certificado.') },
  { id: 'google-mlcc', title: 'Machine Learning Crash Course', provider: 'Google', subject: 'tecnologia', format: 'course', paths: ['tecnologia'], language: 'en', level: 'beginner-intermediate', url: MLCC, registration: 'not-required', certificate: 'unconfirmed', technology: { section: 'data', topic: 'ai' },
    verified: opened(MLCC, ['registration'], 'Módulos, vídeos, visualizações e exercícios públicos (módulo de regressão linear também aberto). Não prometer certificado.') },
  { id: 'ms-learn-cloud-concepts', title: 'Introdução à infraestrutura de nuvem: descrever conceitos de nuvem', provider: 'Microsoft Learn', subject: 'tecnologia', format: 'track', paths: ['tecnologia'], language: 'pt', level: 'beginner', url: MS_CLOUD, registration: 'not-required', certificate: 'unconfirmed', technology: { section: 'security', topic: 'cloud-ai' },
    verified: opened(MS_CLOUD, ['registration'], 'Roteiro oficial em pt-BR com três módulos. FAQ oficial (https://learn.microsoft.com/en-us/training/support/faq): treinamento gratuito, conteúdo sem conta; a certificação AZ-900 é separada.') },
];

/** Published ids the Lote 02 re-opened at their published URL: reused, never duplicated. Their catalogue
 *  records are unchanged (no public change); this evidence backs their place in the selection draft. */
export const REVERIFIED_LEGACY: Readonly<Record<string, ResourceVerification & { evidence: NonNullable<ResourceVerification['evidence']> }>> = {
  'kultivi-writing-enem': opened('https://kultivi.com/curso/redacao-para-enem', NONE_NONE, 'Curso gratuito de 22 aulas, acesso vitalício; matrícula e certificado gratuitos.') as never,
  cs50x: opened('https://cs50.harvard.edu/x/', ['registration'], 'As 11 semanas do OpenCourseWare são gratuitas; aulas sem cadastro, conta edX só para entregar trabalhos. Certificado verificado edX é opção separada.') as never,
  cs50p: opened('https://cs50.harvard.edu/python/', ['registration'], 'As 10 semanas do OpenCourseWare são gratuitas; aulas sem cadastro, conta edX para entregar problemas. Certificado verificado edX é separado.') as never,
};

/** What each staged record still needs before it can be shown, when its active path page would not show it
 *  on its own (P1: no record is published without a page that shows it). */
export const PLACEMENT_PLAN: Readonly<Record<string, string>> = {
  'mit-1801sc': 'Ensino Superior: incluir no grupo Matemática (HIGHER_EDUCATION_GROUPS) e declarar o caminho.',
  'mit-801sc': 'Ensino Superior: criar o grupo Física.',
  'mit-7012': 'Ensino Superior: criar o grupo Biologia.',
  'yale-psyc-110': 'Ensino Superior: criar o grupo Psicologia.',
  'yale-econ-252': 'Ensino Superior: criar o grupo Economia.',
  'ou-environment-treading-lightly': 'Ensino Superior: criar o grupo Meio ambiente.',
  'odin-foundations': 'Tecnologia: incluir na trilha Desenvolvimento Web.',
  'google-mlcc': 'Tecnologia: incluir na trilha Inteligência Artificial.',
  'ms-learn-cloud-concepts': 'Tecnologia: nenhuma trilha publicada cobre nuvem; decidir a trilha (ou criar uma) antes de publicar.',
};

/** The editorial selection as Lote 02 leaves it: only the 18 directly verified sources, each in one path.
 *  Not FEATURED_RESOURCE_IDS_BY_PATH: nothing here is selected, released or shown. */
export const SELECTION_DRAFT: Readonly<Record<PathId, readonly string[]>> = {
  'ensino-fundamental': ['sme-goiania-letras-e-palavras', 'sme-goiania-leitura-em-foco'],
  'ensino-medio': [],
  vestibulares: ['kultivi-enem-completo', 'kultivi-writing-enem', 'inep-enem-provas-gabaritos', 'fuvest-acervo-2026'],
  'pre-militar': ['ita-provas-anteriores'],
  'ensino-superior': ['mit-1801sc', 'mit-801sc', 'mit-7012', 'yale-psyc-110', 'yale-econ-252', 'ou-environment-treading-lightly'],
  tecnologia: ['cs50x', 'cs50p', 'odin-foundations', 'google-mlcc', 'ms-learn-cloud-concepts'],
};

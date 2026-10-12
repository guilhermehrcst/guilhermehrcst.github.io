// Gate B staging (V0.4, Lotes 02 e 03): records whose official source was opened directly, outside this
// environment, on 2026-10-11 (docs/superpowers/research/2026-10-11-v04-gateb-lote02-direct.csv and
// 2026-10-11-v04-gateb-lote03-sources.md). Each one
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

const SME_EF = 'https://sme.goiania.go.gov.br/conexaoescola/ensino_fundamental/';
const SME_ALFABETO = `${SME_EF}lingua-portuguesa-nosso-alfabeto/`;
const SME_VEGETACAO = `${SME_EF}ciencias-da-natureza-vegetacao-e-a-preservacao-do-solo/`;
const SME_MUNICIPIO = `${SME_EF}geografia-municipio-estado-e-pais/`;
const SME_VESTIGIOS = `${SME_EF}historia-vestigios-do-passado/`;
const OBMEP_FRACOES = 'https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=28';
const SME_TECNOLOGIA_VIDA = `${SME_EF}ciencias-da-natureza-tecnologia-e-vida-humana/`;
const OBMEP_POTENCIACAO = 'https://portaldaobmep.impa.br/index.php/modulo/ver?modulo=1059';
const SME_FUNCOES = `${SME_EF}matematica-funcao-de-1o-e-de-2o-grau/`;

const NONE_NONE: readonly EvidenceCheck[] = ['registration', 'certificate'];
/** Lote 03, Fundamental: the page body was read and its year confirmed; neither registration nor certificate
 *  was shown, so both stay 'unconfirmed' (never displayed) and are not claimed as checked. */
const GRADE_ONLY: readonly EvidenceCheck[] = ['grade'];
const SME_UNTESTED = 'Downloads e materiais vinculados não foram abertos nem testados; cadastro e certificado não declarados.';
const OBMEP_UNTESTED = 'Os testes da plataforma exigem login e não foram abertos; cadastro e certificado não declarados.';
const MIT_POLICY = 'Política oficial: https://ocw.mit.edu/about/ (gratuito, sem cadastro nem certificado).';
const YALE_POLICY = 'Política oficial: https://oyc.yale.edu/about (gratuito, sem registro, sem diploma, crédito ou certificado).';

/** The 15 new records of Lote 02, in the sheet's order, then the 8 Fundamental lessons of Lote 03. Formats are the observed ones: a lesson, a past exam
 *  or a reference is never a course. */
export const STAGED_RESOURCES: readonly LearningResource[] = [
  // Ensino Fundamental
  { id: 'sme-goiania-letras-e-palavras', title: 'Língua Portuguesa – Letras e palavras', provider: 'SME Goiânia', subject: 'portugues', format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_LETRAS, schoolYears: [2], registration: 'not-required', certificate: 'none',
    verified: opened(SME_LETRAS, [...NONE_NONE, 'grade'], 'Texto integral, videoaula vinculada e exercícios; a página indica o 2º ano. Aula, não curso.') },
  { id: 'sme-goiania-leitura-em-foco', title: 'Língua Portuguesa: Leitura em Foco', provider: 'SME Goiânia', subject: 'portugues', format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_LEITURA, schoolYears: [5], registration: 'not-required', certificate: 'none',
    verified: opened(SME_LEITURA, [...NONE_NONE, 'grade'], 'Atividade, exercícios, conteúdo e videoaula; a página indica o 5º ano. Aula, não curso completo.') },
  // Ensino Fundamental, Lote 03 (Ciências da Natureza has no SubjectId: subject null, never a false one)
  { id: 'ef-sme-alfabeto-1', title: 'Língua Portuguesa – Nosso Alfabeto', provider: 'SME Goiânia', subject: 'portugues', format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_ALFABETO, schoolYears: [1], registration: 'unconfirmed', certificate: 'unconfirmed',
    verified: opened(SME_ALFABETO, GRADE_ONLY, `A página declara o 1º ano e explica o alfabeto, com links para slides, atividades e texto. ${SME_UNTESTED}`) },
  { id: 'ef-sme-vegetacao-3', title: 'Ciências da Natureza – Vegetação e a Preservação do Solo', provider: 'SME Goiânia', subject: null, format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_VEGETACAO, schoolYears: [3], registration: 'unconfirmed', certificate: 'unconfirmed',
    verified: opened(SME_VEGETACAO, GRADE_ONLY, `A página declara o 3º ano e traz texto, questões e experimento. ${SME_UNTESTED}`) },
  { id: 'ef-sme-municipio-4', title: 'Geografia – Município, Estado e País', provider: 'SME Goiânia', subject: 'geografia', format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_MUNICIPIO, schoolYears: [4], registration: 'unconfirmed', certificate: 'unconfirmed',
    verified: opened(SME_MUNICIPIO, GRADE_ONLY, `A página declara o 4º ano, define município, estado e país e apresenta atividades. ${SME_UNTESTED}`) },
  { id: 'ef-sme-vestigios-5', title: 'História – Vestígios do Passado', provider: 'SME Goiânia', subject: 'historia', format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_VESTIGIOS, schoolYears: [5], registration: 'unconfirmed', certificate: 'unconfirmed',
    verified: opened(SME_VESTIGIOS, GRADE_ONLY, `A página declara o 5º ano e aborda fontes e registros históricos. ${SME_UNTESTED}`) },
  { id: 'ef-obmep-fracoes-6', title: 'Frações, o Primeiro Contato', provider: 'Portal da OBMEP', subject: 'matematica', format: 'lessons', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: OBMEP_FRACOES, schoolYears: [6], registration: 'unconfirmed', certificate: 'unconfirmed',
    verified: opened(OBMEP_FRACOES, GRADE_ONLY, `O catálogo oficial põe o módulo no 6º ano; a página lista vídeos, exercícios, caderno e textos. ${OBMEP_UNTESTED}`) },
  { id: 'ef-sme-tecnologia-vida-7', title: 'Ciências da Natureza – Tecnologia e Vida Humana', provider: 'SME Goiânia', subject: null, format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_TECNOLOGIA_VIDA, schoolYears: [7], registration: 'unconfirmed', certificate: 'unconfirmed',
    verified: opened(SME_TECNOLOGIA_VIDA, GRADE_ONLY, `A página declara o 7º ano e traz texto e perguntas sobre ciência, tecnologia, sociedade e ambiente. Aula de Ciências, não trilha de Tecnologia. ${SME_UNTESTED}`) },
  { id: 'ef-obmep-potenciacao-8', title: 'Potenciação', provider: 'Portal da OBMEP', subject: 'matematica', format: 'lessons', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: OBMEP_POTENCIACAO, schoolYears: [8], registration: 'unconfirmed', certificate: 'unconfirmed',
    verified: opened(OBMEP_POTENCIACAO, GRADE_ONLY, `O índice oficial da OBMEP põe o módulo no 8º ano; a página do módulo abriu e o apresenta. ${OBMEP_UNTESTED}`) },
  { id: 'ef-sme-funcoes-9', title: 'Matemática – Função de 1º e de 2º grau', provider: 'SME Goiânia', subject: 'matematica', format: 'lesson', paths: ['ensino-fundamental'], language: 'pt', level: 'beginner', url: SME_FUNCOES, schoolYears: [9], registration: 'unconfirmed', certificate: 'unconfirmed',
    verified: opened(SME_FUNCOES, GRADE_ONLY, `A página declara o 9º ano e oferece explicação, exemplos, atividades e vídeo. ${SME_UNTESTED}`) },
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
  { id: 'ou-environment-treading-lightly', title: 'Environment: treading lightly on the Earth', provider: 'The Open University', subject: null, format: 'course', paths: ['ensino-superior'], language: 'en', level: 'beginner', url: OU_ENV, registration: 'not-required', certificate: 'participation',
    verified: opened(OU_ENV, NONE_NONE, 'Free course de 15 horas, sem cadastro para o conteúdo; conta opcional para atividades, progresso e declaração gratuita de participação.') },
  // Tecnologia (certificate unconfirmed: never shown as a fact)
  { id: 'odin-foundations', title: 'Foundations Course', provider: 'The Odin Project', subject: 'tecnologia', format: 'track', paths: ['tecnologia'], language: 'en', level: 'beginner', url: ODIN, registration: 'not-required', certificate: 'unconfirmed', technology: { section: 'build', topic: 'webdev' },
    verified: opened(ODIN, ['registration'], 'Módulos de HTML, CSS, JavaScript, Git e projetos; currículo declarado gratuito e aberto. Não é certificado.') },
  { id: 'google-mlcc', title: 'Machine Learning Crash Course', provider: 'Google', subject: 'tecnologia', format: 'course', paths: ['tecnologia'], language: 'en', level: 'beginner-intermediate', url: MLCC, registration: 'not-required', certificate: 'unconfirmed', technology: { section: 'data', topic: 'ai' },
    verified: opened(MLCC, ['registration'], 'Módulos, vídeos, visualizações e exercícios públicos (módulo de regressão linear também aberto). Não prometer certificado.') },
  { id: 'ms-learn-cloud-concepts', title: 'Introdução à infraestrutura de nuvem: descrever conceitos de nuvem', provider: 'Microsoft Learn', subject: 'tecnologia', format: 'track', paths: ['tecnologia'], language: 'pt', level: 'beginner', url: MS_CLOUD, registration: 'not-required', certificate: 'unconfirmed', technology: { section: 'cloud', topic: 'cloud-fundamentals' },
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

/** Lote 03: official past-exam collections whose page was opened but whose attachments were not. A partial
 *  verification, not a homologation: never a staged record, never in the selection draft, until the exam
 *  files themselves are opened. */
export type PartialVerification = {
  readonly id: string;
  readonly title: string;
  readonly provider: string;
  readonly url: string;
  readonly format: 'past-exam';
  readonly paths: readonly PathId[];
  readonly on: string;
  readonly status: 'page-confirmed-attachments-pending';
  readonly seen: string;
  readonly pending: string;
};

export const PARTIAL_VERIFICATIONS: readonly PartialVerification[] = [
  { id: 'pm-cn-provas', title: 'Colégio Naval – Provas e Gabaritos', provider: 'Marinha do Brasil (SSPM)', url: 'https://www.marinha.mil.br/sspm/colegionaval/colegio_princ', format: 'past-exam', paths: ['pre-militar'], on: ON, status: 'page-confirmed-attachments-pending',
    seen: 'A página do SSPM lista provas de 2021 a 2026 e gabaritos.', pending: 'Abrir os anexos das provas e gabaritos.' },
  { id: 'pm-en-provas', title: 'Escola Naval – Provas e Gabaritos', provider: 'Marinha do Brasil (SSPM)', url: 'https://www.marinha.mil.br/sspm/node/95', format: 'past-exam', paths: ['pre-militar'], on: ON, status: 'page-confirmed-attachments-pending',
    seen: 'A página do SSPM lista anexos de provas de 2020 a 2026.', pending: 'Abrir os arquivos anexos.' },
  { id: 'pm-eear-provas', title: 'EEAR – Provas Anteriores', provider: 'Força Aérea Brasileira (EEAR)', url: 'https://ingresso.eear.fab.mil.br/SOO/home/provas_anteriores.php?sigla_conc=%25', format: 'past-exam', paths: ['pre-militar'], on: ON, status: 'page-confirmed-attachments-pending',
    seen: 'O portal oficial de ingresso lista itens de concursos CFS e gabaritos de várias edições.', pending: 'Confirmar os PDFs das provas, e não só os gabaritos.' },
];

/** The editorial selection as Lote 03 leaves it: only the 26 directly verified sources, each in one path.
 *  Not FEATURED_RESOURCE_IDS_BY_PATH: nothing here is selected, released or shown. */
export const SELECTION_DRAFT: Readonly<Record<PathId, readonly string[]>> = {
  'ensino-fundamental': ['ef-sme-alfabeto-1', 'sme-goiania-letras-e-palavras', 'ef-sme-vegetacao-3', 'ef-sme-municipio-4', 'ef-sme-vestigios-5', 'sme-goiania-leitura-em-foco', 'ef-obmep-fracoes-6', 'ef-sme-tecnologia-vida-7', 'ef-obmep-potenciacao-8', 'ef-sme-funcoes-9'],
  'ensino-medio': [],
  vestibulares: ['kultivi-enem-completo', 'kultivi-writing-enem', 'inep-enem-provas-gabaritos', 'fuvest-acervo-2026'],
  'pre-militar': ['ita-provas-anteriores'],
  'ensino-superior': ['mit-1801sc', 'mit-801sc', 'mit-7012', 'yale-psyc-110', 'yale-econ-252', 'ou-environment-treading-lightly'],
  tecnologia: ['cs50x', 'cs50p', 'odin-foundations', 'google-mlcc', 'ms-learn-cloud-concepts'],
};

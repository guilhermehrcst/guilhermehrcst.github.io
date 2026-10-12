// The catalogue of free learning resources: the single source of every resource the site shows.
// A resource is published only with a direct HTTPS URL and a verification that its learning content is
// fully free (docs/superpowers/specs/2026-10-11-courses-learning-library-design.md). The subject is the
// only source of the area (spec §6.1). No asset imports: this module runs under Node's test runner.
// V0.4 (spec §5.1): three separate axes, each declared on the resource and never inherited from a helper:
// the paths it serves (who it is for), the exams it prepares for (only with evidence) and its subject.
import { EXAM_ORDER, EXAM_PARENT, PATH_ORDER, SUBJECTS, type AreaId, type ExamId, type PathId, type SubjectId } from './taxonomy.ts';

export type LearningSubjectId = SubjectId;
/** What a resource really is (spec §4.3): a past exam, a single lesson or an atlas is never a course.
 *  `lessons` is a series of lessons; `lesson` is one. */
export const LEARNING_FORMATS = ['course', 'track', 'playlist', 'lessons', 'lesson', 'practice', 'past-exam', 'simulator', 'reference'] as const;
export type LearningFormatId = (typeof LEARNING_FORMATS)[number];
/** The formats a student practises with. scripts/verify-dist.mjs keeps an equal, hand-written list. */
export const PRACTICE_FORMATS = ['practice', 'past-exam', 'simulator'] as const satisfies readonly LearningFormatId[];
export const isPractice = (resource: { format: LearningFormatId }): boolean =>
  (PRACTICE_FORMATS as readonly LearningFormatId[]).includes(resource.format);
export type LearningLanguageId = 'pt' | 'en' | 'es';
/** Admission preparation is not always an academic grade or university entrance examination. */
export type LearningLevelId = 'high-school' | 'vestibular' | 'exam-prep' | 'beginner' | 'beginner-intermediate' | 'intermediate';
/** 'unconfirmed': the source does not say; stated as such and never shown as a fact (V0.4 Gate B, P4). */
export type LearningRegistrationId = 'required' | 'not-required' | 'unconfirmed';
/** How a resource was verified: only directly at the official source, its page or the author's official
 *  channel. A search index or any indirect method never verifies a resource (V0.4, review of P4). */
export const VERIFICATION_METHODS = ['official-page', 'youtube-page'] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];
/** 'statement': a statement of completion (FGV); 'participation': a statement of participation (The Open
 *  University), never read as completion (V0.4 QA). */
export type LearningCertificateId = 'none' | 'statement' | 'participation' | 'available' | 'unconfirmed';
export type LearningDurationUnit = 'hours' | 'weeks';

export type TechnologyTopicId =
  | 'cs' | 'python' | 'web' | 'webdev' | 'ai' | 'genai' | 'datasci' | 'data-computing'
  | 'databases' | 'algorithms' | 'math-cs' | 'math' | 'cybersecurity' | 'security' | 'privacy' | 'cloud-ai' | 'cloud-fundamentals';
export type TechnologySectionId = 'build' | 'data' | 'systems' | 'security' | 'cloud';

export type CourseImageLayout = 'opening' | 'media-right' | 'tile' | 'half' | 'tall' | 'band';
export type CourseImageId = 'cs50x' | 'cs50p' | 'mit-6100l' | 'cs50ai' | 'fluencia' | 'fgv-datasci';
export interface CourseImageDescriptor {
  id: CourseImageId;
  alt: CourseImageId;
  layout: CourseImageLayout;
  kind: 'photo' | 'graphic';
  ratio?: number;
  position?: string;
  priority?: boolean;
}

/** What a verification checked at the source (V0.4 Gate B, P3/P4): `grade` backs a school year. */
export type EvidenceCheck = 'free' | 'scope' | 'language' | 'format' | 'path' | 'registration' | 'certificate' | 'grade';
export interface VerificationEvidence {
  /** The official page opened for this resource (HTTPS). */
  url: string;
  checked: readonly EvidenceCheck[];
  /** What was seen, in a sentence an editor can audit. */
  note: string;
}

export interface ResourceVerification {
  on: string;
  by: VerificationMethod;
  freeAccess: true;
  evidence?: VerificationEvidence;
}

/** The nine years of Ensino Fundamental (V0.4 Gate B, P3). The stage is derived, never typed. */
export type SchoolYear = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SchoolStage = 'anos-iniciais' | 'anos-finais';
export const stagesOf = (years: readonly number[]): SchoolStage[] => [
  ...(years.some((year) => year <= 5) ? ['anos-iniciais' as const] : []),
  ...(years.some((year) => year >= 6) ? ['anos-finais' as const] : []),
];

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  /** null for a multidisciplinary resource (a complete past exam): it has no subject, never a false one. */
  subject: LearningSubjectId | null;
  format: LearningFormatId;
  /** The paths this resource serves: at least one, declared resource by resource. */
  paths: readonly [PathId, ...PathId[]];
  /** The exams it prepares for, when there is evidence. Each exam's parent path is among `paths`. */
  exams?: readonly [ExamId, ...ExamId[]];
  language: LearningLanguageId;
  level: LearningLevelId;
  url: string | null;
  verified?: ResourceVerification;
  review?: string;
  registration?: LearningRegistrationId;
  duration?: { value: number; unit: LearningDurationUnit };
  certificate?: LearningCertificateId;
  /** The school years (1–9) the source states, only on Ensino Fundamental, only with evidence (`grade`).
   *  Never inferred from a title; a multidisciplinary or reference resource may have none. */
  schoolYears?: readonly [SchoolYear, ...SchoolYear[]];
  technology?: { section: TechnologySectionId; topic: TechnologyTopicId };
  curated?: { plate: string; image?: CourseImageDescriptor };
}

export type PublishedLearningResource = LearningResource & {
  url: string;
  verified: ResourceVerification;
};

/** The date the published catalogue was last verified at its sources. */
export const VERIFIED_ON = '2026-10-11';

/** The 37 resources published before the Gate B (V0.4, P4), each with the URL it was verified at on
 *  VERIFIED_ON. Only these, with exactly these URLs and that date, keep the collective verification of
 *  2026-10-11. Any other resource, or one of these with a new URL or date, needs individual evidence.
 *  Closed list: entering it is not a way to verify a resource. */
export const LEGACY_VERIFIED: Readonly<Record<string, string>> = {
  cs50x: 'https://cs50.harvard.edu/x/',
  cs50p: 'https://cs50.harvard.edu/python/',
  'mit-6100l': 'https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/',
  'fb-python': 'https://www.ev.org.br/cursos/linguagem-de-programacao-python-basico',
  'fb-web': 'https://www.ev.org.br/cursos/crie-um-site-simples-usando-html-css-e-javascript',
  cs50w: 'https://cs50.harvard.edu/web/',
  cs50ai: 'https://cs50.harvard.edu/ai/',
  fluencia: 'https://www.ev.org.br/cursos/fluencia',
  'fgv-datasci': 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/introducao-ciencia-de-dados',
  'mit-60002': 'https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/',
  cs50sql: 'https://cs50.harvard.edu/sql/',
  'mit-6006': 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
  'mit-6042j': 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/',
  'mit-1806': 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
  'cisco-cyber': 'https://www.netacad.com/courses/introduction-to-cybersecurity',
  'fgv-security': 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/seguranca-digital',
  'fgv-privacy': 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/protecao-de-dados',
  'kultivi-math-enem': 'https://kultivi.com/curso/matematica',
  'kultivi-portuguese-enem': 'https://kultivi.com/curso/portugues',
  'kultivi-writing-enem': 'https://kultivi.com/curso/redacao-para-enem',
  'kultivi-physics-enem': 'https://kultivi.com/curso/fisica',
  'kultivi-chemistry-enem': 'https://kultivi.com/curso/quimica',
  'kultivi-biology-enem': 'https://kultivi.com/curso/biologia',
  'kultivi-history-enem': 'https://kultivi.com/curso/historia-2',
  'kultivi-geography-enem': 'https://kultivi.com/curso/geografia',
  'kultivi-philosophy-enem': 'https://kultivi.com/curso/filosofia',
  'kultivi-sociology-enem': 'https://kultivi.com/curso/sociologia',
  'kultivi-english-enem': 'https://kultivi.com/curso/ingles-para-enem',
  'kultivi-spanish-enem': 'https://kultivi.com/curso/espanhol-para-enem',
  'inep-writing-2026': 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante',
  'uerj-portuguese-practice': 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=1',
  'uerj-writing-practice': 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=11',
  'uerj-math-practice': 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=9',
  'uerj-history-practice': 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=5',
  'uerj-geography-practice': 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=6',
  'uerj-spanish-practice': 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=2',
  'uerj-physics-practice': 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aano=&anivel=dificil&aseq_area=&aseq_disciplina=8&aseq_etapa=&sb=Buscar',
};
export const LEGACY_VERIFIED_IDS: readonly string[] = Object.keys(LEGACY_VERIFIED);

/** The collective verification of a baseline resource. Refuses any other id: nothing stamps a date on a
 *  new resource. */
export const legacyVerified = (id: string): ResourceVerification => {
  if (!(id in LEGACY_VERIFIED)) throw new Error(`learning-resources: ${id} is not in the legacy baseline; give it its own verification`);
  return { on: VERIFIED_ON, by: 'official-page', freeAccess: true };
};

const tech = (
  resource: Omit<LearningResource, 'subject' | 'format'> & {
    technology: { section: TechnologySectionId; topic: TechnologyTopicId };
  },
): LearningResource => ({
  ...resource,
  subject: 'tecnologia',
  format: 'course',
  ...(resource.url && !resource.verified ? { verified: legacyVerified(resource.id) } : {}),
});

export const catalogue: LearningResource[] = [
  tech({ id: 'cs50x', paths: ['tecnologia', 'ensino-superior'], title: 'CS50x: Introduction to Computer Science', provider: 'Harvard University', level: 'beginner', language: 'en', url: 'https://cs50.harvard.edu/x/', duration: { value: 11, unit: 'weeks' }, technology: { section: 'build', topic: 'cs' }, curated: { plate: 'CS50x', image: { id: 'cs50x', alt: 'cs50x', layout: 'opening', kind: 'photo', position: '50% 39%', priority: true } } }),
  tech({ id: 'cs50p', paths: ['tecnologia'], title: 'CS50’s Introduction to Programming with Python', provider: 'Harvard University', level: 'beginner', language: 'en', url: 'https://cs50.harvard.edu/python/', duration: { value: 10, unit: 'weeks' }, technology: { section: 'build', topic: 'python' }, curated: { plate: 'CS50P', image: { id: 'cs50p', alt: 'cs50p', layout: 'media-right', kind: 'photo', position: '82% 50%' } } }),
  tech({ id: 'mit-6100l', paths: ['tecnologia', 'ensino-superior'], title: 'Introduction to Computer Science and Programming Using Python', provider: 'MIT OpenCourseWare', level: 'beginner-intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/', certificate: 'none', technology: { section: 'build', topic: 'cs' }, curated: { plate: '6.100L', image: { id: 'mit-6100l', alt: 'mit-6100l', layout: 'tile', kind: 'graphic', ratio: 1.82, position: '50% 56.1%' } } }),
  tech({ id: 'fb-python', paths: ['tecnologia'], title: 'Linguagem de Programação Python - Básico', provider: 'Fundação Bradesco', level: 'beginner', language: 'pt', url: 'https://www.ev.org.br/cursos/linguagem-de-programacao-python-basico', duration: { value: 18, unit: 'hours' }, technology: { section: 'build', topic: 'python' } }),
  tech({ id: 'fb-web', paths: ['tecnologia'], title: 'Crie um site simples usando HTML, CSS e JavaScript', provider: 'Fundação Bradesco', level: 'beginner', language: 'pt', url: 'https://www.ev.org.br/cursos/crie-um-site-simples-usando-html-css-e-javascript', duration: { value: 2, unit: 'hours' }, technology: { section: 'build', topic: 'web' } }),
  tech({ id: 'cs50w', paths: ['tecnologia'], title: 'CS50’s Web Programming with Python and JavaScript', provider: 'Harvard University', level: 'intermediate', language: 'en', url: 'https://cs50.harvard.edu/web/', duration: { value: 9, unit: 'weeks' }, technology: { section: 'build', topic: 'webdev' } }),
  tech({ id: 'cs50ai', paths: ['tecnologia'], title: 'CS50’s Introduction to Artificial Intelligence with Python', provider: 'Harvard University', level: 'intermediate', language: 'en', url: 'https://cs50.harvard.edu/ai/', duration: { value: 7, unit: 'weeks' }, technology: { section: 'data', topic: 'ai' }, curated: { plate: 'CS50 AI', image: { id: 'cs50ai', alt: 'cs50ai', layout: 'half', kind: 'photo', position: '36% 42%' } } }),
  tech({ id: 'fluencia', paths: ['tecnologia'], title: 'FluêncIA em Inteligência Artificial', provider: 'Fundação Bradesco + Microsoft', level: 'beginner', language: 'pt', url: 'https://www.ev.org.br/cursos/fluencia', certificate: 'available', duration: { value: 4, unit: 'hours' }, technology: { section: 'data', topic: 'ai' }, curated: { plate: 'FluêncIA', image: { id: 'fluencia', alt: 'fluencia', layout: 'tall', kind: 'graphic', ratio: 1122 / 1402 } } }),
  tech({ id: 'ms-explore-genai', paths: ['tecnologia'], title: 'Explorar IA Generativa', provider: 'Microsoft Learn', level: 'beginner', language: 'pt', url: null, review: 'No pt-BR Microsoft Learn page with this exact title was confirmed. Re-evaluate the current official module before publishing.', technology: { section: 'data', topic: 'genai' } }),
  tech({ id: 'ibm-genai', paths: ['tecnologia'], title: 'Introdução à IA Generativa', provider: 'IBM SkillsBuild', level: 'beginner', language: 'pt', url: null, review: 'No Portuguese SkillsBuild page with this exact title was confirmed. Re-evaluate the current official course before publishing.', technology: { section: 'data', topic: 'genai' } }),
  tech({ id: 'fgv-datasci', paths: ['tecnologia'], title: 'Introdução à Ciência de Dados', provider: 'FGV', level: 'beginner', language: 'pt', url: 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/introducao-ciencia-de-dados', certificate: 'statement', duration: { value: 60, unit: 'hours' }, technology: { section: 'data', topic: 'datasci' }, curated: { plate: 'FGV', image: { id: 'fgv-datasci', alt: 'fgv-datasci', layout: 'band', kind: 'graphic', ratio: 1.82, position: '50% 54.7%' } } }),
  tech({ id: 'mit-60002', paths: ['tecnologia', 'ensino-superior'], title: 'Introduction to Computational Thinking and Data Science', provider: 'MIT OpenCourseWare', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/', certificate: 'none', technology: { section: 'data', topic: 'data-computing' } }),
  tech({ id: 'cs50sql', paths: ['tecnologia'], title: 'CS50’s Introduction to Databases with SQL', provider: 'Harvard University', level: 'beginner-intermediate', language: 'en', url: 'https://cs50.harvard.edu/sql/', technology: { section: 'systems', topic: 'databases' } }),
  tech({ id: 'mit-6006', paths: ['tecnologia', 'ensino-superior'], title: 'Introduction to Algorithms', provider: 'MIT OpenCourseWare', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', certificate: 'none', technology: { section: 'systems', topic: 'algorithms' } }),
  tech({ id: 'mit-6042j', paths: ['tecnologia', 'ensino-superior'], title: 'Mathematics for Computer Science', provider: 'MIT OpenCourseWare', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/', certificate: 'none', technology: { section: 'systems', topic: 'math-cs' } }),
  tech({ id: 'mit-1806', paths: ['tecnologia', 'ensino-superior'], title: 'Linear Algebra', provider: 'MIT OpenCourseWare', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', certificate: 'none', technology: { section: 'systems', topic: 'math' } }),
  tech({ id: 'cisco-cyber', paths: ['tecnologia'], title: 'Introduction to Cybersecurity', provider: 'Cisco Networking Academy', level: 'beginner', language: 'en', url: 'https://www.netacad.com/courses/introduction-to-cybersecurity', duration: { value: 6, unit: 'hours' }, technology: { section: 'security', topic: 'cybersecurity' } }),
  tech({ id: 'fgv-security', paths: ['tecnologia'], title: 'Segurança Digital', provider: 'FGV', level: 'beginner', language: 'pt', url: 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/seguranca-digital', certificate: 'statement', duration: { value: 5, unit: 'hours' }, technology: { section: 'security', topic: 'security' } }),
  tech({ id: 'fgv-privacy', paths: ['tecnologia'], title: 'Proteção de Dados', provider: 'FGV', level: 'beginner', language: 'pt', url: 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/protecao-de-dados', duration: { value: 5, unit: 'hours' }, technology: { section: 'security', topic: 'privacy' } }),
  tech({ id: 'ms-azure-ai', paths: ['tecnologia'], title: 'Fundamentos de Inteligência Artificial no Azure', provider: 'Microsoft Learn', level: 'beginner', language: 'pt', url: null, review: 'No current pt-BR Microsoft Learn path with this exact title was confirmed. Re-evaluate the intended official path before publishing.', technology: { section: 'security', topic: 'cloud-ai' } }),

  // Ensino Médio / vestibular. Provider pages were re-opened on 2026-10-11 and
  // only resources whose represented learning content is fully free are published.
  { id: 'kultivi-math-enem', title: 'Matemática para ENEM', provider: 'Kultivi', subject: 'matematica', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/matematica', verified: legacyVerified('kultivi-math-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-portuguese-enem', title: 'Português para ENEM', provider: 'Kultivi', subject: 'portugues', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/portugues', verified: legacyVerified('kultivi-portuguese-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-writing-enem', title: 'Redação para ENEM', provider: 'Kultivi', subject: 'redacao', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/redacao-para-enem', verified: legacyVerified('kultivi-writing-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-physics-enem', title: 'Física para ENEM', provider: 'Kultivi', subject: 'fisica', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/fisica', verified: legacyVerified('kultivi-physics-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-chemistry-enem', title: 'Química para ENEM', provider: 'Kultivi', subject: 'quimica', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/quimica', verified: legacyVerified('kultivi-chemistry-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-biology-enem', title: 'Biologia para ENEM', provider: 'Kultivi', subject: 'biologia', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/biologia', verified: legacyVerified('kultivi-biology-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-history-enem', title: 'História para ENEM', provider: 'Kultivi', subject: 'historia', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/historia-2', verified: legacyVerified('kultivi-history-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-geography-enem', title: 'Geografia para ENEM', provider: 'Kultivi', subject: 'geografia', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/geografia', verified: legacyVerified('kultivi-geography-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-philosophy-enem', title: 'Filosofia para ENEM', provider: 'Kultivi', subject: 'filosofia', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/filosofia', verified: legacyVerified('kultivi-philosophy-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-sociology-enem', title: 'Sociologia para ENEM', provider: 'Kultivi', subject: 'sociologia', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/sociologia', verified: legacyVerified('kultivi-sociology-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-english-enem', title: 'Inglês para ENEM', provider: 'Kultivi', subject: 'ingles', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/ingles-para-enem', verified: legacyVerified('kultivi-english-enem'), registration: 'required', certificate: 'available' },
  { id: 'kultivi-spanish-enem', title: 'Espanhol para ENEM', provider: 'Kultivi', subject: 'espanhol', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/espanhol-para-enem', verified: legacyVerified('kultivi-spanish-enem'), registration: 'required', certificate: 'available' },

  // Official practice and guidance. These are first-party exam resources, not third-party prep.
  { id: 'inep-writing-2026', title: 'A Redação do Enem 2026 — Cartilha do Participante', provider: 'INEP', subject: 'redacao', format: 'practice', paths: ['vestibulares'], exams: ['enem'], language: 'pt', level: 'vestibular', url: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante', verified: legacyVerified('inep-writing-2026'), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-portuguese-practice', title: 'Questões de Língua Portuguesa e Literatura', provider: 'Revista do Vestibular UERJ', subject: 'portugues', format: 'practice', paths: ['vestibulares'], exams: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=1', verified: legacyVerified('uerj-portuguese-practice'), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-writing-practice', title: 'Questões de Língua Portuguesa Instrumental com Redação', provider: 'Revista do Vestibular UERJ', subject: 'redacao', format: 'practice', paths: ['vestibulares'], exams: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=11', verified: legacyVerified('uerj-writing-practice'), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-math-practice', title: 'Questões de Matemática', provider: 'Revista do Vestibular UERJ', subject: 'matematica', format: 'practice', paths: ['vestibulares'], exams: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=9', verified: legacyVerified('uerj-math-practice'), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-history-practice', title: 'Questões de História', provider: 'Revista do Vestibular UERJ', subject: 'historia', format: 'practice', paths: ['vestibulares'], exams: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=5', verified: legacyVerified('uerj-history-practice'), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-geography-practice', title: 'Questões de Geografia', provider: 'Revista do Vestibular UERJ', subject: 'geografia', format: 'practice', paths: ['vestibulares'], exams: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=6', verified: legacyVerified('uerj-geography-practice'), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-spanish-practice', title: 'Questões de Espanhol', provider: 'Revista do Vestibular UERJ', subject: 'espanhol', format: 'practice', paths: ['vestibulares'], exams: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=2', verified: legacyVerified('uerj-spanish-practice'), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-physics-practice', title: 'Questões de Física', provider: 'Revista do Vestibular UERJ', subject: 'fisica', format: 'practice', paths: ['vestibulares'], exams: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aano=&anivel=dificil&aseq_area=&aseq_disciplina=8&aseq_etapa=&sb=Buscar', verified: legacyVerified('uerj-physics-practice'), registration: 'not-required', certificate: 'none' },
];

export const isPublishedResource = (resource: LearningResource): resource is PublishedLearningResource =>
  resource.url !== null && resource.verified?.freeAccess === true;

export const publishedResources = catalogue.filter(isPublishedResource);

/** A resource's area, derived from its subject; a multidisciplinary resource has none. */
export const areaOf = (resource: Pick<LearningResource, 'subject'>): AreaId | null =>
  resource.subject === null ? null : SUBJECTS[resource.subject].area;

/** The hosts of published resources: the only places a page may link out to for a resource.
 *  scripts/verify-dist.mjs keeps a hand-written copy; tests/verify-dist-hosts.test.ts keeps them equal. */
export const COURSE_HOSTS: ReadonlySet<string> = new Set(publishedResources.map((resource) => new URL(resource.url).hostname));

const REQUIRED_CHECKS = ['free', 'scope', 'language', 'format', 'path'] as const;
const isDate = (on: string): boolean => {
  const date = new Date(`${on}T00:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(on) && !Number.isNaN(date.getTime()) && date.toISOString().startsWith(on);
};

/** Everything wrong with a resource's verification (V0.4 Gate B, P4), one line each. A baseline resource
 *  (same id, URL and date) needs nothing new. Any other needs individual evidence from its own official
 *  host: what was checked (free access, scope, language, format, path; registration and certificate unless
 *  stated 'unconfirmed'), a note, a real date that is not in the future, and a direct method
 *  (VERIFICATION_METHODS: never a search index). Registration and certificate
 *  are always stated, never left unknown by omission. */
export const verificationProblems = (
  r: Pick<LearningResource, 'id' | 'url'> & { verified?: ResourceVerification | undefined; registration?: LearningRegistrationId | undefined; certificate?: LearningCertificateId | undefined },
  now: Date = new Date(),
): string[] => {
  if (!r.verified) return [];
  if (r.url !== null && LEGACY_VERIFIED[r.id] === r.url && r.verified.on === VERIFIED_ON && r.verified.by === 'official-page' && !r.verified.evidence) return [];
  const problems: string[] = [];
  // The method arrives as data: refuse a missing, unknown or indirect one, whatever the type says.
  const by: unknown = r.verified.by;
  if (by === undefined || by === null || by === '') problems.push(`${r.id}: no verification method`);
  else if (!(VERIFICATION_METHODS as readonly unknown[]).includes(by)) problems.push(`${r.id}: ${String(by)} is not a direct verification at the official source`);
  const ev = r.verified.evidence;
  if (!ev) return [...problems, `${r.id}: no individual evidence`];
  if (!isDate(r.verified.on)) problems.push(`${r.id}: ${r.verified.on} is not a date`);
  else if (new Date(`${r.verified.on}T00:00:00Z`).getTime() > now.getTime()) problems.push(`${r.id}: verified in the future (${r.verified.on})`);
  if (!ev.url.startsWith('https://')) problems.push(`${r.id}: evidence must be https`);
  else if (r.url && new URL(ev.url).hostname !== new URL(r.url).hostname) problems.push(`${r.id}: evidence is not on the resource's own host`);
  if (!ev.checked.includes('free')) problems.push(`${r.id}: free access not checked`);
  for (const check of REQUIRED_CHECKS.slice(1)) if (!ev.checked.includes(check)) problems.push(`${r.id}: ${check} not checked`);
  if (!ev.note.trim()) problems.push(`${r.id}: the evidence needs a note`);
  if (r.registration === undefined) problems.push(`${r.id}: registration not stated (use 'unconfirmed')`);
  else if (r.registration !== 'unconfirmed' && !ev.checked.includes('registration')) problems.push(`${r.id}: registration not checked`);
  if (r.certificate === undefined) problems.push(`${r.id}: certificate not stated (use 'unconfirmed')`);
  else if (r.certificate !== 'unconfirmed' && !ev.checked.includes('certificate')) problems.push(`${r.id}: certificate not checked`);
  return problems;
};

/** Everything wrong with a resource's school years, one line each; empty when it holds or has none. */
export const schoolYearProblems = (r: Pick<LearningResource, 'id' | 'paths'> & { schoolYears?: readonly unknown[] | undefined; verified?: { evidence?: { checked?: readonly string[] } | undefined } | undefined }): string[] => {
  const years = r.schoolYears;
  if (years === undefined) return [];
  const problems: string[] = [];
  if (!years.length) problems.push(`${r.id}: schoolYears is empty`);
  for (const year of years) if (!Number.isInteger(year) || (year as number) < 1 || (year as number) > 9) problems.push(`${r.id}: school year ${String(year)} is not 1–9`);
  if (new Set(years).size !== years.length) problems.push(`${r.id}: schoolYears repeats a year`);
  if (years.some((year, i) => i > 0 && (year as number) < (years[i - 1] as number))) problems.push(`${r.id}: schoolYears must be ascending`);
  if (!r.paths.includes('ensino-fundamental')) problems.push(`${r.id}: school years only on Ensino Fundamental`);
  if (!r.verified?.evidence?.checked?.includes('grade')) problems.push(`${r.id}: school years without evidence of the school year`);
  return problems;
};

/** Everything wrong with one record, one line each: the rules every catalogue record obeys, exported so a
 *  record in staging (src/lib/staging.ts) is held to the very same rules before it may be promoted. */
export const resourceProblems = (resource: LearningResource, now: Date = new Date()): string[] => {
  const problems = [...schoolYearProblems(resource), ...verificationProblems(resource, now)];
  const fail = (message: string) => problems.push(`${resource.id} ${message}`);
  if (resource.subject !== null && !(resource.subject in SUBJECTS)) fail('has an unknown subject');
  if (!resource.paths.length || new Set(resource.paths).size !== resource.paths.length) fail('needs distinct paths');
  if (resource.paths.some((path) => !PATH_ORDER.includes(path))) fail('has an unknown path');
  for (const exam of resource.exams ?? []) {
    if (!EXAM_ORDER.includes(exam)) fail('has an unknown exam');
    else if (!resource.paths.includes(EXAM_PARENT[exam])) fail(`prepares for ${exam} outside its path`);
  }
  // Technology is its own path (spec §1.3): never counted in Ensino Médio, which lists school subjects only.
  if (resource.subject === 'tecnologia' && !resource.paths.includes('tecnologia')) fail('is technology outside Tecnologia');
  if (resource.paths.includes('ensino-medio') && areaOf(resource) === 'tecnologia') fail('puts technology in Ensino Médio');
  if (resource.url && !resource.url.startsWith('https://')) fail('url must be https');
  if (resource.verified && (!resource.url || !resource.verified.freeAccess)) fail('has invalid verification');
  if (!resource.url && !resource.review?.trim()) fail('is held back without a review note');
  return problems;
};

for (const resource of catalogue) {
  const problems = resourceProblems(resource);
  if (problems.length) throw new Error(`learning-resources: ${problems.join('; ')}`);
}
if (new Set(catalogue.map((resource) => resource.id)).size !== catalogue.length) throw new Error('learning-resources: duplicate id');

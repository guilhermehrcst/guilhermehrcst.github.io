export type LearningAreaId =
  | 'technology' | 'math' | 'portuguese' | 'writing'
  | 'nature' | 'humanities' | 'english' | 'spanish';

export type LearningSubjectId =
  | 'technology' | 'math' | 'portuguese' | 'writing'
  | 'physics' | 'chemistry' | 'biology'
  | 'history' | 'geography' | 'philosophy' | 'sociology'
  | 'english' | 'spanish';

export type LearningGoalId = 'high-school' | 'enem' | 'uerj' | 'vestibular';
export type LearningFormatId = 'course' | 'track' | 'playlist' | 'lessons' | 'practice';
export type LearningLanguageId = 'pt' | 'en' | 'es';
export type LearningLevelId = 'high-school' | 'vestibular' | 'beginner' | 'beginner-intermediate' | 'intermediate';
export type LearningRegistrationId = 'required' | 'not-required';
export type VerificationMethod = 'official-page' | 'youtube-page' | 'search-index';
export type LearningCertificateId = 'none' | 'statement' | 'available';
export type LearningDurationUnit = 'hours' | 'weeks';

export type TechnologyTopicId =
  | 'cs' | 'python' | 'web' | 'webdev' | 'ai' | 'genai' | 'datasci' | 'data-computing'
  | 'databases' | 'algorithms' | 'math-cs' | 'math' | 'cybersecurity' | 'security' | 'privacy' | 'cloud-ai';
export type TechnologySectionId = 'build' | 'data' | 'systems' | 'security';

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

export interface ResourceVerification {
  on: string;
  by: VerificationMethod;
  freeAccess: true;
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  area: LearningAreaId;
  subject: LearningSubjectId;
  format: LearningFormatId;
  goals: readonly [LearningGoalId, ...LearningGoalId[]];
  language: LearningLanguageId;
  level: LearningLevelId;
  url: string | null;
  verified?: ResourceVerification;
  review?: string;
  registration?: LearningRegistrationId;
  duration?: { value: number; unit: LearningDurationUnit };
  certificate?: LearningCertificateId;
  technology?: { section: TechnologySectionId; topic: TechnologyTopicId };
  curated?: { plate: string; image?: CourseImageDescriptor };
}

export type PublishedLearningResource = LearningResource & {
  url: string;
  verified: ResourceVerification;
};

export const AREA_ORDER: readonly LearningAreaId[] = ['technology', 'math', 'portuguese', 'writing', 'nature', 'humanities', 'english', 'spanish'];

export const AREA_SUBJECTS: Readonly<Record<LearningAreaId, readonly LearningSubjectId[]>> = {
  technology: ['technology'],
  math: ['math'],
  portuguese: ['portuguese'],
  writing: ['writing'],
  nature: ['physics', 'chemistry', 'biology'],
  humanities: ['history', 'geography', 'philosophy', 'sociology'],
  english: ['english'],
  spanish: ['spanish'],
};

const VERIFIED_ON = '2026-10-11';
const verified = (): ResourceVerification => ({ on: VERIFIED_ON, by: 'official-page', freeAccess: true });

const tech = (
  resource: Omit<LearningResource, 'area' | 'subject' | 'format' | 'goals'> & {
    technology: { section: TechnologySectionId; topic: TechnologyTopicId };
  },
): LearningResource => ({
  ...resource,
  area: 'technology',
  subject: 'technology',
  format: 'course',
  goals: ['high-school'],
  ...(resource.url ? { verified: verified() } : {}),
});

export const catalogue: LearningResource[] = [
  tech({ id: 'cs50x', title: 'CS50x: Introduction to Computer Science', provider: 'Harvard University', level: 'beginner', language: 'en', url: 'https://cs50.harvard.edu/x/', duration: { value: 11, unit: 'weeks' }, technology: { section: 'build', topic: 'cs' }, curated: { plate: 'CS50x', image: { id: 'cs50x', alt: 'cs50x', layout: 'opening', kind: 'photo', position: '50% 39%', priority: true } } }),
  tech({ id: 'cs50p', title: 'CS50’s Introduction to Programming with Python', provider: 'Harvard University', level: 'beginner', language: 'en', url: 'https://cs50.harvard.edu/python/', duration: { value: 10, unit: 'weeks' }, technology: { section: 'build', topic: 'python' }, curated: { plate: 'CS50P', image: { id: 'cs50p', alt: 'cs50p', layout: 'media-right', kind: 'photo', position: '82% 50%' } } }),
  tech({ id: 'mit-6100l', title: 'Introduction to Computer Science and Programming Using Python', provider: 'MIT OpenCourseWare', level: 'beginner-intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/', certificate: 'none', technology: { section: 'build', topic: 'cs' }, curated: { plate: '6.100L', image: { id: 'mit-6100l', alt: 'mit-6100l', layout: 'tile', kind: 'graphic', ratio: 1.82, position: '50% 56.1%' } } }),
  tech({ id: 'fb-python', title: 'Linguagem de Programação Python - Básico', provider: 'Fundação Bradesco', level: 'beginner', language: 'pt', url: 'https://www.ev.org.br/cursos/linguagem-de-programacao-python-basico', duration: { value: 18, unit: 'hours' }, technology: { section: 'build', topic: 'python' } }),
  tech({ id: 'fb-web', title: 'Crie um site simples usando HTML, CSS e JavaScript', provider: 'Fundação Bradesco', level: 'beginner', language: 'pt', url: 'https://www.ev.org.br/cursos/crie-um-site-simples-usando-html-css-e-javascript', duration: { value: 2, unit: 'hours' }, technology: { section: 'build', topic: 'web' } }),
  tech({ id: 'cs50w', title: 'CS50’s Web Programming with Python and JavaScript', provider: 'Harvard University', level: 'intermediate', language: 'en', url: 'https://cs50.harvard.edu/web/', duration: { value: 9, unit: 'weeks' }, technology: { section: 'build', topic: 'webdev' } }),
  tech({ id: 'cs50ai', title: 'CS50’s Introduction to Artificial Intelligence with Python', provider: 'Harvard University', level: 'intermediate', language: 'en', url: 'https://cs50.harvard.edu/ai/', duration: { value: 7, unit: 'weeks' }, technology: { section: 'data', topic: 'ai' }, curated: { plate: 'CS50 AI', image: { id: 'cs50ai', alt: 'cs50ai', layout: 'half', kind: 'photo', position: '36% 42%' } } }),
  tech({ id: 'fluencia', title: 'FluêncIA em Inteligência Artificial', provider: 'Fundação Bradesco + Microsoft', level: 'beginner', language: 'pt', url: 'https://www.ev.org.br/cursos/fluencia', certificate: 'available', duration: { value: 4, unit: 'hours' }, technology: { section: 'data', topic: 'ai' }, curated: { plate: 'FluêncIA', image: { id: 'fluencia', alt: 'fluencia', layout: 'tall', kind: 'graphic', ratio: 1122 / 1402 } } }),
  tech({ id: 'ms-explore-genai', title: 'Explorar IA Generativa', provider: 'Microsoft Learn', level: 'beginner', language: 'pt', url: null, review: 'No pt-BR Microsoft Learn page with this exact title was confirmed. Re-evaluate the current official module before publishing.', technology: { section: 'data', topic: 'genai' } }),
  tech({ id: 'ibm-genai', title: 'Introdução à IA Generativa', provider: 'IBM SkillsBuild', level: 'beginner', language: 'pt', url: null, review: 'No Portuguese SkillsBuild page with this exact title was confirmed. Re-evaluate the current official course before publishing.', technology: { section: 'data', topic: 'genai' } }),
  tech({ id: 'fgv-datasci', title: 'Introdução à Ciência de Dados', provider: 'FGV', level: 'beginner', language: 'pt', url: 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/introducao-ciencia-de-dados', certificate: 'statement', duration: { value: 60, unit: 'hours' }, technology: { section: 'data', topic: 'datasci' }, curated: { plate: 'FGV', image: { id: 'fgv-datasci', alt: 'fgv-datasci', layout: 'band', kind: 'graphic', ratio: 1.82, position: '50% 54.7%' } } }),
  tech({ id: 'mit-60002', title: 'Introduction to Computational Thinking and Data Science', provider: 'MIT OpenCourseWare', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/', certificate: 'none', technology: { section: 'data', topic: 'data-computing' } }),
  tech({ id: 'cs50sql', title: 'CS50’s Introduction to Databases with SQL', provider: 'Harvard University', level: 'beginner-intermediate', language: 'en', url: 'https://cs50.harvard.edu/sql/', technology: { section: 'systems', topic: 'databases' } }),
  tech({ id: 'mit-6006', title: 'Introduction to Algorithms', provider: 'MIT OpenCourseWare', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', certificate: 'none', technology: { section: 'systems', topic: 'algorithms' } }),
  tech({ id: 'mit-6042j', title: 'Mathematics for Computer Science', provider: 'MIT OpenCourseWare', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/', certificate: 'none', technology: { section: 'systems', topic: 'math-cs' } }),
  tech({ id: 'mit-1806', title: 'Linear Algebra', provider: 'MIT OpenCourseWare', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', certificate: 'none', technology: { section: 'systems', topic: 'math' } }),
  tech({ id: 'cisco-cyber', title: 'Introduction to Cybersecurity', provider: 'Cisco Networking Academy', level: 'beginner', language: 'en', url: 'https://www.netacad.com/courses/introduction-to-cybersecurity', duration: { value: 6, unit: 'hours' }, technology: { section: 'security', topic: 'cybersecurity' } }),
  tech({ id: 'fgv-security', title: 'Segurança Digital', provider: 'FGV', level: 'beginner', language: 'pt', url: 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/seguranca-digital', certificate: 'statement', duration: { value: 5, unit: 'hours' }, technology: { section: 'security', topic: 'security' } }),
  tech({ id: 'fgv-privacy', title: 'Proteção de Dados', provider: 'FGV', level: 'beginner', language: 'pt', url: 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/protecao-de-dados', duration: { value: 5, unit: 'hours' }, technology: { section: 'security', topic: 'privacy' } }),
  tech({ id: 'ms-azure-ai', title: 'Fundamentos de Inteligência Artificial no Azure', provider: 'Microsoft Learn', level: 'beginner', language: 'pt', url: null, review: 'No current pt-BR Microsoft Learn path with this exact title was confirmed. Re-evaluate the intended official path before publishing.', technology: { section: 'security', topic: 'cloud-ai' } }),

  // Ensino Médio / vestibular. Provider pages were re-opened on 2026-10-11 and
  // only resources whose represented learning content is fully free are published.
  { id: 'kultivi-math-enem', title: 'Matemática para ENEM', provider: 'Kultivi', area: 'math', subject: 'math', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/matematica', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-portuguese-enem', title: 'Português para ENEM', provider: 'Kultivi', area: 'portuguese', subject: 'portuguese', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/portugues', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-writing-enem', title: 'Redação para ENEM', provider: 'Kultivi', area: 'writing', subject: 'writing', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/redacao-para-enem', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-physics-enem', title: 'Física para ENEM', provider: 'Kultivi', area: 'nature', subject: 'physics', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/fisica', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-chemistry-enem', title: 'Química para ENEM', provider: 'Kultivi', area: 'nature', subject: 'chemistry', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/quimica', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-biology-enem', title: 'Biologia para ENEM', provider: 'Kultivi', area: 'nature', subject: 'biology', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/biologia', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-history-enem', title: 'História para ENEM', provider: 'Kultivi', area: 'humanities', subject: 'history', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/historia-2', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-geography-enem', title: 'Geografia para ENEM', provider: 'Kultivi', area: 'humanities', subject: 'geography', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/geografia', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-philosophy-enem', title: 'Filosofia para ENEM', provider: 'Kultivi', area: 'humanities', subject: 'philosophy', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/filosofia', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-sociology-enem', title: 'Sociologia para ENEM', provider: 'Kultivi', area: 'humanities', subject: 'sociology', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/sociologia', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-english-enem', title: 'Inglês para ENEM', provider: 'Kultivi', area: 'english', subject: 'english', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/ingles-para-enem', verified: verified(), registration: 'required', certificate: 'available' },
  { id: 'kultivi-spanish-enem', title: 'Espanhol para ENEM', provider: 'Kultivi', area: 'spanish', subject: 'spanish', format: 'course', goals: ['high-school', 'enem', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://kultivi.com/curso/espanhol-para-enem', verified: verified(), registration: 'required', certificate: 'available' },

  // Official practice and guidance. These are first-party exam resources, not third-party prep.
  { id: 'inep-writing-2026', title: 'A Redação do Enem 2026 — Cartilha do Participante', provider: 'INEP', area: 'writing', subject: 'writing', format: 'practice', goals: ['enem'], language: 'pt', level: 'vestibular', url: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante', verified: verified(), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-portuguese-practice', title: 'Questões de Língua Portuguesa e Literatura', provider: 'Revista do Vestibular UERJ', area: 'portuguese', subject: 'portuguese', format: 'practice', goals: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=1', verified: verified(), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-writing-practice', title: 'Questões de Língua Portuguesa Instrumental com Redação', provider: 'Revista do Vestibular UERJ', area: 'writing', subject: 'writing', format: 'practice', goals: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=11', verified: verified(), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-math-practice', title: 'Questões de Matemática', provider: 'Revista do Vestibular UERJ', area: 'math', subject: 'math', format: 'practice', goals: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=9', verified: verified(), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-history-practice', title: 'Questões de História', provider: 'Revista do Vestibular UERJ', area: 'humanities', subject: 'history', format: 'practice', goals: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=5', verified: verified(), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-geography-practice', title: 'Questões de Geografia', provider: 'Revista do Vestibular UERJ', area: 'humanities', subject: 'geography', format: 'practice', goals: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=6', verified: verified(), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-spanish-practice', title: 'Questões de Espanhol', provider: 'Revista do Vestibular UERJ', area: 'spanish', subject: 'spanish', format: 'practice', goals: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aseq_disciplina=2', verified: verified(), registration: 'not-required', certificate: 'none' },
  { id: 'uerj-physics-practice', title: 'Questões de Física', provider: 'Revista do Vestibular UERJ', area: 'nature', subject: 'physics', format: 'practice', goals: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://www.revista.vestibular.uerj.br/questao/busca-questao-imprimir.php?aano=&anivel=dificil&aseq_area=&aseq_disciplina=8&aseq_etapa=&sb=Buscar', verified: verified(), registration: 'not-required', certificate: 'none' },
];

export const isPublishedResource = (resource: LearningResource): resource is PublishedLearningResource =>
  resource.url !== null && resource.verified?.freeAccess === true;

export const publishedResources = catalogue.filter(isPublishedResource);

for (const resource of catalogue) {
  if (!AREA_SUBJECTS[resource.area].includes(resource.subject)) throw new Error(`learning-resources: ${resource.id} has invalid area/subject`);
  if (!resource.goals.length) throw new Error(`learning-resources: ${resource.id} has no goals`);
  if (resource.url && !resource.url.startsWith('https://')) throw new Error(`learning-resources: ${resource.id} url must be https`);
  if (resource.verified && (!resource.url || !resource.verified.freeAccess)) throw new Error(`learning-resources: ${resource.id} has invalid verification`);
  if (!resource.url && !resource.review?.trim()) throw new Error(`learning-resources: ${resource.id} is held back without a review note`);
}
if (new Set(catalogue.map((resource) => resource.id)).size !== catalogue.length) throw new Error('learning-resources: duplicate id');

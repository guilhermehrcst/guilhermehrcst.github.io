// The typed catalogue records (V0.4): the 37 published, each with the URL it was verified at, and the
// records held back. Data only, apart from the collective-verification helper: this module never projects
// or validates, so tools/academy-release.ts can read a record (and compute its digest) even while a change
// to it keeps the build red. Every rule lives in learning-resources.ts, which re-exports all of this.
import type { LearningResource, ResourceVerification, TechnologySectionId, TechnologyTopicId } from './learning-resources.ts';

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

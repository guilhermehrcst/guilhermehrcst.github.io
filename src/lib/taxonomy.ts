// The one source of objectives, areas, subjects and topics (spec §6.1). Routes, pages, search and the
// catalogue all derive from here. A subject belongs to exactly one area; the area is never stored
// anywhere else. Labels are domain data (they name things), so they live here and not in the UI copy.
// No asset imports: this module runs under Node's test runner.

/** The six paths a student starts from (V0.3), and the exams that live inside Vestibular. */
export type PathId = 'ensino-fundamental' | 'ensino-medio' | 'vestibulares' | 'pre-militar' | 'ensino-superior' | 'tecnologia';
export type ExamId = 'enem' | 'uerj';
/** Every page that is an objective: a path or an exam. Its route is /{id}/. */
export type ObjectiveId = PathId | ExamId;
export type AreaId = 'matematica' | 'linguagens' | 'natureza' | 'humanas' | 'idiomas' | 'tecnologia';
export type SubjectId =
  | 'matematica' | 'portugues' | 'redacao'
  | 'fisica' | 'quimica' | 'biologia'
  | 'historia' | 'geografia' | 'filosofia' | 'sociologia'
  | 'ingles' | 'espanhol'
  | 'tecnologia';

/** Where a topic comes from. Closed: a new source enters through the source audit (docs/superpowers/research). */
export type TopicSourceId = 'inep-matriz-enem';

export interface Topic {
  id: string;
  label: string;
  source: TopicSourceId;
  /** V0.1: no topic has its own page. */
  published: false;
}

export interface Subject {
  id: SubjectId;
  label: string;
  area: AreaId;
  slug: string;
  /** The learning map. Empty until each item is checked against its source: no invented curriculum. */
  topics: readonly Topic[];
}

/** The approved order of the paths (Home, header menu, footer). */
export const PATH_ORDER: readonly PathId[] = ['ensino-fundamental', 'ensino-medio', 'vestibulares', 'pre-militar', 'ensino-superior', 'tecnologia'];
export const EXAM_ORDER: readonly ExamId[] = ['enem', 'uerj'];
/** Where each exam lives: inside Vestibular, never as a path of its own. */
export const EXAM_PARENT: Readonly<Record<ExamId, PathId>> = { enem: 'vestibulares', uerj: 'vestibulares' };
export type PathState = 'preparing' | 'active';
/** The publication state of each path: the one source (V0.4 Gate B, P2). A path in preparation is noindex,
 *  out of the sitemap, says so, and shows no resource. Fundamental and Pré-Militar become active only with
 *  at least one published resource on their own page, in the same change that publishes it; their
 *  highlights are a separate, later release that needs ten valid ones (src/lib/path-status.ts fails the
 *  build otherwise). Activating a path is a person's decision; scripts/verify-dist.mjs keeps its own,
 *  independent list. */
export const PATH_STATUS: Readonly<Record<PathId, PathState>> = {
  'ensino-fundamental': 'preparing',
  'ensino-medio': 'active',
  vestibulares: 'active',
  'pre-militar': 'active',
  'ensino-superior': 'active',
  tecnologia: 'active',
};
/** Derived from PATH_STATUS, never typed. */
export const PREPARING_PATHS: readonly PathId[] = PATH_ORDER.filter((path) => PATH_STATUS[path] === 'preparing');
export const isPreparing = (path: PathId): boolean => PATH_STATUS[path] === 'preparing';
export const AREA_ORDER: readonly AreaId[] = ['matematica', 'linguagens', 'natureza', 'humanas', 'idiomas', 'tecnologia'];

export const OBJECTIVES: Readonly<Record<ObjectiveId, { label: string }>> = {
  'ensino-fundamental': { label: 'Ensino Fundamental' },
  'ensino-medio': { label: 'Ensino Médio' },
  vestibulares: { label: 'Vestibular' },
  'pre-militar': { label: 'Pré-Militar' },
  'ensino-superior': { label: 'Ensino Superior' },
  tecnologia: { label: 'Tecnologia' },
  enem: { label: 'ENEM' },
  uerj: { label: 'UERJ' },
};

export const AREAS: Readonly<Record<AreaId, { label: string }>> = {
  matematica: { label: 'Matemática' },
  linguagens: { label: 'Linguagens' },
  natureza: { label: 'Ciências da Natureza' },
  humanas: { label: 'Ciências Humanas' },
  idiomas: { label: 'Idiomas' },
  tecnologia: { label: 'Tecnologia' },
};

const subject = (id: SubjectId, label: string, area: AreaId, topics: readonly Topic[] = []): Subject =>
  ({ id, label, area, slug: id, topics });

/** Reading order: by area, then within the area. */
export const SUBJECTS: Readonly<Record<SubjectId, Subject>> = {
  matematica: subject('matematica', 'Matemática', 'matematica'),
  portugues: subject('portugues', 'Português', 'linguagens'),
  redacao: subject('redacao', 'Redação', 'linguagens'),
  fisica: subject('fisica', 'Física', 'natureza'),
  quimica: subject('quimica', 'Química', 'natureza'),
  biologia: subject('biologia', 'Biologia', 'natureza'),
  historia: subject('historia', 'História', 'humanas'),
  geografia: subject('geografia', 'Geografia', 'humanas'),
  filosofia: subject('filosofia', 'Filosofia', 'humanas'),
  sociologia: subject('sociologia', 'Sociologia', 'humanas'),
  ingles: subject('ingles', 'Inglês', 'idiomas'),
  espanhol: subject('espanhol', 'Espanhol', 'idiomas'),
  tecnologia: subject('tecnologia', 'Tecnologia', 'tecnologia'),
};

export const SUBJECT_ORDER = Object.keys(SUBJECTS) as readonly SubjectId[];

/** The twelve school subjects: everything but technology, which has its own page. */
export const ACADEMIC_SUBJECTS: readonly SubjectId[] = SUBJECT_ORDER.filter((id) => id !== 'tecnologia');

export const subjectsOf = (area: AreaId): SubjectId[] => SUBJECT_ORDER.filter((id) => SUBJECTS[id].area === area);

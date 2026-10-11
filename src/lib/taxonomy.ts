// The one source of objectives, areas, subjects and topics (spec §6.1). Routes, pages, search and the
// catalogue all derive from here. A subject belongs to exactly one area; the area is never stored
// anywhere else. Labels are domain data (they name things), so they live here and not in the UI copy.
// No asset imports: this module runs under Node's test runner.

export type ObjectiveId = 'enem' | 'uerj' | 'ensino-medio' | 'vestibulares' | 'tecnologia';
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

export const OBJECTIVE_ORDER: readonly ObjectiveId[] = ['enem', 'uerj', 'ensino-medio', 'vestibulares', 'tecnologia'];
export const AREA_ORDER: readonly AreaId[] = ['matematica', 'linguagens', 'natureza', 'humanas', 'idiomas', 'tecnologia'];

export const OBJECTIVES: Readonly<Record<ObjectiveId, { label: string }>> = {
  enem: { label: 'ENEM' },
  uerj: { label: 'UERJ' },
  'ensino-medio': { label: 'Ensino Médio' },
  vestibulares: { label: 'Vestibulares' },
  tecnologia: { label: 'Tecnologia' },
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

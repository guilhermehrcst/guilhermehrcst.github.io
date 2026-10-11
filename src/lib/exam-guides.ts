// The ENEM and UERJ preparation guides (spec §6.4). They replace the former study tracks, which held
// hand-kept lists of ids and empty "editorial" sections. Here the resource sections are derived from the
// catalogue by goal and format, editorial sections cite official sources, and an empty section is never
// returned. No asset imports: this module runs under Node's test runner.
import { publishedResources, type LearningGoalId, type PublishedLearningResource } from './learning-resources.ts';
import type { OfficialSourceId } from './official-sources.ts';
import { ACADEMIC_SUBJECTS, type SubjectId } from './taxonomy.ts';

export type ExamId = 'enem' | 'uerj';
export type GuideSectionId = 'entenda' | 'areas' | 'pratique' | 'aprofunde' | 'prepare' | 'materias' | 'provas';

type Select = { practice: boolean };

interface SectionDefinition {
  id: GuideSectionId;
  /** editorial: copy backed by official sources; subjects: links to subject pages; resources: from the catalogue. */
  kind: 'editorial' | 'subjects' | 'resources';
  sources?: readonly OfficialSourceId[];
  select?: Select;
}

export interface ResolvedSection {
  id: GuideSectionId;
  kind: SectionDefinition['kind'];
  sources: readonly OfficialSourceId[];
  resources: readonly PublishedLearningResource[];
}

export const examGuides: Readonly<Record<ExamId, readonly SectionDefinition[]>> = {
  enem: [
    { id: 'entenda', kind: 'editorial', sources: ['inep-matrizes'] },
    { id: 'areas', kind: 'subjects' },
    { id: 'pratique', kind: 'resources', sources: ['inep-provas-gabaritos'], select: { practice: true } },
    { id: 'aprofunde', kind: 'resources', select: { practice: false } },
  ],
  uerj: [
    { id: 'entenda', kind: 'editorial', sources: ['uerj-faq'] },
    { id: 'prepare', kind: 'editorial', sources: ['uerj-faq'] },
    { id: 'materias', kind: 'subjects' },
    { id: 'provas', kind: 'resources', select: { practice: true } },
  ],
};

const select = (exam: LearningGoalId, { practice }: Select) =>
  publishedResources.filter((r) => r.goals.includes(exam) && (r.format === 'practice') === practice);

/** The guide's sections with their resources, without any section that would be empty. */
export const resolveGuide = (exam: ExamId): ResolvedSection[] =>
  examGuides[exam]
    .map((section) => ({
      id: section.id,
      kind: section.kind,
      sources: section.sources ?? [],
      resources: section.select ? select(exam, section.select) : [],
    }))
    .filter((section) => section.kind !== 'resources' || section.resources.length + section.sources.length > 0);

/** The ENEM as INEP organises it: four areas of knowledge and the essay (source: the reference matrices).
 *  This is the exam's own grouping; the Home groups subjects by the product's areas (spec Q6). */
export const ENEM_AREAS: readonly { id: 'linguagens' | 'humanas' | 'natureza' | 'matematica' | 'redacao'; label: string; subjects: readonly SubjectId[] }[] = [
  { id: 'linguagens', label: 'Linguagens, Códigos e suas Tecnologias', subjects: ['portugues', 'ingles', 'espanhol'] },
  { id: 'humanas', label: 'Ciências Humanas e suas Tecnologias', subjects: ['historia', 'geografia', 'filosofia', 'sociologia'] },
  { id: 'natureza', label: 'Ciências da Natureza e suas Tecnologias', subjects: ['fisica', 'quimica', 'biologia'] },
  { id: 'matematica', label: 'Matemática e suas Tecnologias', subjects: ['matematica'] },
  { id: 'redacao', label: 'Redação', subjects: ['redacao'] },
];

/** The subjects with UERJ resources, in reading order. Derived, so a new UERJ resource adds its subject. */
export const UERJ_SUBJECTS: readonly SubjectId[] = ACADEMIC_SUBJECTS.filter((id) =>
  publishedResources.some((r) => r.subject === id && r.goals.includes('uerj')));

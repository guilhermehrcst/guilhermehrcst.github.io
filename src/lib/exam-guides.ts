// The ENEM and UERJ preparation guides (spec §6.4). They replace the former study tracks, which held
// hand-kept lists of ids and empty "editorial" sections. Here the resource sections are derived from the
// catalogue by exam and format, editorial sections cite official sources, and an empty section is never
// returned. No asset imports: this module runs under Node's test runner.
import { isPractice, publishedResources, type LearningResource, type PublishedLearningResource } from './learning-resources.ts';
import { officialSources, type OfficialSourceId } from './official-sources.ts';
import { ACADEMIC_SUBJECTS, type ExamId, type SubjectId } from './taxonomy.ts';

export type { ExamId };
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

type GuideCandidate = Pick<LearningResource, 'subject' | 'format'> & { exams?: readonly ExamId[] | undefined };
const inSection = (exam: ExamId, { practice }: Select, r: GuideCandidate): boolean =>
  (r.exams?.includes(exam) ?? false) && isPractice(r) === practice;
const select = (exam: ExamId, selection: Select, resources: readonly PublishedLearningResource[]) => resources.filter((r) => inSection(exam, selection, r));

/** The ENEM area of a subject, as INEP organises it; none for a resource without a subject. "Aprofunde"
 *  lists its resources by these areas, so it shows only those it can place in one. */
export const enemAreaOf = (subject: SubjectId | null) =>
  subject === null ? undefined : ENEM_AREAS.find((area) => area.subjects.includes(subject));

/** Whether an exam's page shows this resource: the very rules its page renders by (V0.4 Gate B, P1). */
export const guideShows = (exam: ExamId, r: GuideCandidate): boolean =>
  examGuides[exam].some((section) =>
    section.select !== undefined && inSection(exam, section.select, r) && (section.id !== 'aprofunde' || enemAreaOf(r.subject) !== undefined));

/** The guide's sections with their resources, without any section that would be empty. */
export const resolveGuide = (exam: ExamId, resources: readonly PublishedLearningResource[] = publishedResources): ResolvedSection[] =>
  examGuides[exam]
    .map((section) => ({
      id: section.id,
      kind: section.kind,
      sources: section.sources ?? [],
      resources: section.select ? select(exam, section.select, resources) : [],
    }))
    .filter((section) => section.kind !== 'resources' || section.resources.length + section.sources.length > 0);

/** The resource of a section that is the very page an official source cites (V0.4 QA P2-RC5): the INEP
 *  collection of past exams once published. The page then shows that link once, as the resource, and the
 *  source note points to it instead of repeating it. */
export const sourceShownAsResource = (
  source: OfficialSourceId,
  resources: readonly PublishedLearningResource[],
): PublishedLearningResource | undefined => resources.find((r) => r.url === officialSources[source].url);

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
  publishedResources.some((r) => r.subject === id && r.exams?.includes('uerj')));

// The catalogue of free learning resources: the single source of every resource the site shows.
// A resource is published only with a direct HTTPS URL and a verification that its learning content is
// fully free (docs/superpowers/specs/2026-10-11-courses-learning-library-design.md). The subject is the
// only source of the area (spec §6.1). No asset imports: this module runs under Node's test runner.
// V0.4 (spec §5.1): three separate axes, each declared on the resource and never inherited from a helper:
// the paths it serves (who it is for), the exams it prepares for (only with evidence) and its subject.
import { EXAM_ORDER, EXAM_PARENT, PATH_ORDER, SUBJECTS, type AreaId, type ExamId, type PathId, type SubjectId } from './taxonomy.ts';
import RELEASE_BASELINE from '../data/academy-release/baseline.json' with { type: 'json' };
import RELEASE_MANIFEST from '../data/academy-release/release.json' with { type: 'json' };
import { projectRelease } from './release/engine.ts';
import { LOT_MANIFESTS } from './release/lots.ts';
// Typed candidates: the only records a lot may resolve an id to. Importing them publishes nothing.
import { STAGED_RESOURCES } from './staging.ts';
import { catalogue, LEGACY_VERIFIED, LEGACY_VERIFIED_IDS, legacyVerified, VERIFIED_ON } from './catalogue-records.ts';

export { catalogue, LEGACY_VERIFIED, LEGACY_VERIFIED_IDS, legacyVerified, VERIFIED_ON };
import { GATEB_NEW_RESOURCES } from './staging-gateb.ts';

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

export const isPublishedResource = (resource: LearningResource): resource is PublishedLearningResource =>
  resource.url !== null && resource.verified?.freeAccess === true;

/** A resource's area, derived from its subject; a multidisciplinary resource has none. */
export const areaOf = (resource: Pick<LearningResource, 'subject'>): AreaId | null =>
  resource.subject === null ? null : SUBJECTS[resource.subject].area;

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

/** The public catalogue (Academy incremental release): the 37 records of V0.4, each locked to the digest it
 *  was published with, plus the records approved in the lots that release.json applies, minus the ones
 *  those lots suspend. Every other record, staged or held, is not published, whatever its data says.
 *  Any mismatch between a record and its decision fails the build (src/lib/release/engine.ts). */
export const RELEASE = projectRelease({
  catalogue,
  pool: [...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES],
  baseline: RELEASE_BASELINE,
  lots: LOT_MANIFESTS,
  release: RELEASE_MANIFEST,
  validate: (resource) => resourceProblems(resource),
  now: new Date(),
});
if (RELEASE.problems.length) throw new Error(`learning-resources: release\n${RELEASE.problems.join('\n')}`);

export const publishedResources: readonly PublishedLearningResource[] = RELEASE.published;

/** The hosts of published resources: the only places a page may link out to for a resource.
 *  scripts/verify-dist.mjs keeps a hand-written copy; tests/verify-dist-hosts.test.ts keeps them equal. */
export const COURSE_HOSTS: ReadonlySet<string> = new Set(publishedResources.map((resource) => new URL(resource.url).hostname));

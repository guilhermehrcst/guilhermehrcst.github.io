// Course presentation pages (/cursos/<id>/, V0.6): an editorial layer over the catalogue, kept apart from
// the records so their release digests never change. A published course earns its own page only with a
// presentation: an objective summary read at its official source, with the date and page it was checked
// on. Modules appear only as the source lists them; a video only for a course hosted on YouTube.
// Without a presentation a course has no page and its card leads straight to the source: no page is
// ever published empty or with invented content. The list starts empty on purpose: each entry is an
// editorial decision, made and verified by a person. No asset imports: this module runs under Node.
import { publishedResources, type PublishedLearningResource } from './learning-resources.ts';
import { libraryOf } from './libraries.ts';

export interface CoursePresentation {
  /** A published course's id. */
  id: string;
  /** What the course teaches, in two to four sentences, as its official page states it. */
  summary: string;
  /** The official page the summary was read on: HTTPS, on the course's own host. */
  source: string;
  /** When it was read (YYYY-MM-DD), never in the future. */
  checkedOn: string;
  /** The modules or lessons, only as the source lists them, in its order. */
  modules?: readonly [string, ...string[]];
  /** A YouTube video (11-character id), only for a course whose source is on YouTube. Rendered as a link
   *  to YouTube, never embedded: no third-party request on page load. */
  video?: { youtubeId: string };
}

export const COURSE_PRESENTATIONS: readonly CoursePresentation[] = [];

const YOUTUBE_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be']);
export const isYouTube = (url: string): boolean => YOUTUBE_HOSTS.has(new URL(url).hostname);

const isDate = (on: string): boolean => {
  const date = new Date(`${on}T00:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(on) && !Number.isNaN(date.getTime()) && date.toISOString().startsWith(on);
};

/** Everything wrong with a list of presentations, one line each. */
export const presentationProblems = (
  list: readonly CoursePresentation[],
  published: readonly PublishedLearningResource[] = publishedResources,
  now: Date = new Date(),
): string[] => {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const p of list) {
    const fail = (message: string) => problems.push(`${p.id}: ${message}`);
    if (seen.has(p.id)) fail('has two presentations');
    seen.add(p.id);
    const r = published.find((resource) => resource.id === p.id);
    if (!r) { fail('is not a published resource'); continue; }
    if (libraryOf(r.format) !== 'cursos') fail(`is a ${r.format}, not a course`);
    const summary = p.summary.trim();
    if (summary.length < 80 || summary.length > 600) fail('the summary must be 80-600 characters');
    let source: URL | null = null;
    try { source = new URL(p.source); } catch { fail('the source is not a URL'); }
    if (source && source.protocol !== 'https:') fail('the source must be https');
    if (source && source.hostname !== new URL(r.url).hostname) fail('the source is not on the course\'s own host');
    if (!isDate(p.checkedOn)) fail(`${p.checkedOn} is not a date`);
    else if (new Date(`${p.checkedOn}T00:00:00Z`).getTime() > now.getTime()) fail('checked in the future');
    if (p.modules && (p.modules.length === 0 || p.modules.some((m) => !m.trim()))) fail('modules must be non-empty titles');
    if (p.modules && new Set(p.modules).size !== p.modules.length) fail('a module is listed twice');
    if (p.video) {
      if (!/^[\w-]{11}$/.test(p.video.youtubeId)) fail('the video id is not a YouTube id');
      if (!isYouTube(r.url)) fail('a video only for a course hosted on YouTube');
    }
  }
  return problems;
};

{
  const problems = presentationProblems(COURSE_PRESENTATIONS);
  if (problems.length) throw new Error(`course-presentations:\n${problems.join('\n')}`);
}

export const presentationOf = (id: string, list: readonly CoursePresentation[] = COURSE_PRESENTATIONS): CoursePresentation | undefined =>
  list.find((p) => p.id === id);

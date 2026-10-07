// The course catalogue for the Courses page. One typed list: the page lays itself out from it, so a
// new course is one entry here (plus nothing else, unless it needs a new category label).
//
// Rules for an entry:
// - `url` points only to the institution's own page for that course. Never an aggregator, blog,
//   intermediate page or affiliate link. Never a URL derived from a domain's structure.
// - `url: null` means the official page could not be confirmed: the entry stays here for review and
//   is NOT rendered (see `published`). Fill `url` and `checked` once confirmed.
// - `certificate` and `duration` are set only when the course's own page states them.
// - Course titles are proper names: they are not translated.
//
// Verification (2026-10-07): the build environment could not open these sites (network egress), so
// each URL was confirmed by a search index restricted to the official domain, which returned that
// exact URL with the course's title. `checked` records this. Re-check by opening each page.
import cs50x from '../assets/courses/cs50x.jpeg';
import cs50Python from '../assets/courses/cs50-python.jpeg';
import mitPython from '../assets/courses/mit-python.jpeg';
import cs50Ai from '../assets/courses/cs50-ai.jpeg';
import fluencia from '../assets/courses/fluencia.jpeg';
import fgvDataScience from '../assets/courses/fgv-data-science.jpeg';
import type {
  CourseCategoryId,
  CourseCertificateId,
  CourseImageId,
  CourseLanguageId,
  CourseLevelId,
  CourseSectionId,
} from '../i18n/types';

/**
 * How a curated cell is composed around its image (src/components/CourseCard.astro draws each one
 * on the 12-column catalogue grid, and re-composes it on tablet and phone):
 *   opening      the whole row: a wide image, then the plate beside the facts
 *   media-right  two thirds of a row: text on the left, a tall image filling the right
 *   tile         a third of a row: the image on top, text under it
 *   half         two thirds of a row: a large image on top, text under it
 *   tall         a third of a row: a portrait image on top, text under it
 *   band         the whole row: the image on the left, text beside it
 */
export type CourseImageLayout = 'opening' | 'media-right' | 'tile' | 'half' | 'tall' | 'band';

export interface CourseImage {
  /** The supplied asset, unmodified (src/assets/courses). Astro makes the AVIF/WebP/JPEG sizes. */
  src: ImageMetadata;
  /** Key of the alt text in the page dictionary (`courses.imageAlts`), so EN and PT both have one. */
  alt: CourseImageId;
  layout: CourseImageLayout;
  /** photo: free to crop, and zooms a hair on hover. graphic: has its own text; never cropped, never zoomed. */
  kind: 'photo' | 'graphic';
  /**
   * Width / height of the image's frame. Only for a graphic, whose frame must not change with the
   * cell: the frame is the artwork's own area, so nothing is cropped except letterbox bars.
   */
  ratio?: number;
  /** CSS object-position: where a photo keeps its focus when the frame crops it. */
  position?: string;
  /** Loaded eagerly: the one image that opens the catalogue. */
  priority?: boolean;
}

export interface Course {
  id: string;
  section: CourseSectionId;
  title: string;
  institution: string;
  category: CourseCategoryId;
  level: CourseLevelId;
  language: CourseLanguageId;
  /** Official course page, or null while it awaits confirmation (not rendered). */
  url: string | null;
  /** How and when `url` was confirmed. Required when `url` is set. */
  checked?: { by: 'search-index' | 'page'; on: string };
  /** Why an entry is held back, for the person reviewing the catalogue. */
  review?: string;
  certificate?: CourseCertificateId;
  duration?: { value: number; unit: 'hours' | 'weeks' };
  /** Curator's pick: rendered larger, with its own typographic plate. */
  curated?: { plate: string; image?: CourseImage };
}

const indexed = { by: 'search-index', on: '2026-10-07' } as const;

export const sectionOrder: CourseSectionId[] = ['build', 'data', 'systems', 'security'];

export const catalogue: Course[] = [
  // aprender-e-construir / learn-and-build
  { id: 'cs50x', section: 'build', title: 'CS50x: Introduction to Computer Science', institution: 'Harvard University', category: 'cs', level: 'beginner', language: 'en', url: 'https://cs50.harvard.edu/x/', checked: indexed, duration: { value: 11, unit: 'weeks' },
    // The opening of the catalogue: the whole hall. The crop keeps the screen, the stage and the first rows.
    curated: { plate: 'CS50x', image: { src: cs50x, alt: 'cs50x', layout: 'opening', kind: 'photo', position: '50% 39%', priority: true } } },
  { id: 'cs50p', section: 'build', title: 'CS50’s Introduction to Programming with Python', institution: 'Harvard University', category: 'python', level: 'beginner', language: 'en', url: 'https://cs50.harvard.edu/python/', checked: indexed, duration: { value: 10, unit: 'weeks' },
    // The instructor and his laptop sit in the right half of the frame, so the crop keeps the right (and stops short of the green screen at its edge).
    curated: { plate: 'CS50P', image: { src: cs50Python, alt: 'cs50p', layout: 'media-right', kind: 'photo', position: '82% 50%' } } },
  { id: 'mit-6100l', section: 'build', title: 'Introduction to Computer Science and Programming Using Python', institution: 'MIT OpenCourseWare', category: 'cs', level: 'beginner-intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/', checked: indexed, certificate: 'none',
    // The supplied frame is a 16:9 screenshot inside black letterbox bars (98px above, 76px below, of
    // 1024). The frame is the screenshot itself (1.82, a hair inside it): the title is never cut.
    curated: { plate: '6.100L', image: { src: mitPython, alt: 'mit-6100l', layout: 'tile', kind: 'graphic', ratio: 1.82, position: '50% 56.1%' } } },
  { id: 'fb-python', section: 'build', title: 'Linguagem de Programação Python - Básico', institution: 'Fundação Bradesco', category: 'python', level: 'beginner', language: 'pt', url: 'https://www.ev.org.br/cursos/linguagem-de-programacao-python-basico', checked: indexed, duration: { value: 18, unit: 'hours' } },
  { id: 'fb-web', section: 'build', title: 'Crie um site simples usando HTML, CSS e JavaScript', institution: 'Fundação Bradesco', category: 'web', level: 'beginner', language: 'pt', url: 'https://www.ev.org.br/cursos/crie-um-site-simples-usando-html-css-e-javascript', checked: indexed, duration: { value: 2, unit: 'hours' } },
  { id: 'cs50w', section: 'build', title: 'CS50’s Web Programming with Python and JavaScript', institution: 'Harvard University', category: 'webdev', level: 'intermediate', language: 'en', url: 'https://cs50.harvard.edu/web/', checked: indexed, duration: { value: 9, unit: 'weeks' } },

  // dados-e-inteligencia / data-and-intelligence
  { id: 'cs50ai', section: 'data', title: 'CS50’s Introduction to Artificial Intelligence with Python', institution: 'Harvard University', category: 'ai', level: 'intermediate', language: 'en', url: 'https://cs50.harvard.edu/ai/', checked: indexed, duration: { value: 7, unit: 'weeks' },
    curated: { plate: 'CS50 AI', image: { src: cs50Ai, alt: 'cs50ai', layout: 'half', kind: 'photo', position: '36% 42%' } } },
  { id: 'fluencia', section: 'data', title: 'FluêncIA em Inteligência Artificial', institution: 'Fundação Bradesco + Microsoft', category: 'ai', level: 'beginner', language: 'pt', url: 'https://www.ev.org.br/cursos/fluencia', checked: indexed, certificate: 'available', duration: { value: 4, unit: 'hours' },
    // A portrait poster (1122 x 1402): shown whole, at its own proportion.
    curated: { plate: 'FluêncIA', image: { src: fluencia, alt: 'fluencia', layout: 'tall', kind: 'graphic', ratio: 1122 / 1402 } } },
  {
    id: 'ms-explore-genai', section: 'data', title: 'Explorar IA Generativa', institution: 'Microsoft Learn', category: 'genai', level: 'beginner', language: 'pt', url: null,
    review: 'No pt-BR Microsoft Learn page with this title was found. Candidates: pt-br/training/modules/intro-generative-ai-explore-basics/ ("Introdução à IA generativa") or en-us/training/modules/explore-generative-ai/ ("AI fluency: Explore generative AI"). Choose one, then confirm.',
  },
  {
    id: 'ibm-genai', section: 'data', title: 'Introdução à IA Generativa', institution: 'IBM SkillsBuild', category: 'genai', level: 'beginner', language: 'pt', url: null,
    review: 'No Portuguese SkillsBuild page with this title was found (only a Spanish "getting-started-with-generative-ai" page, and a pt-br "Introdução à Inteligência Artificial", a different course).',
  },
  { id: 'fgv-datasci', section: 'data', title: 'Introdução à Ciência de Dados', institution: 'FGV', category: 'datasci', level: 'beginner', language: 'pt', url: 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/introducao-ciencia-de-dados', checked: indexed, certificate: 'statement', duration: { value: 60, unit: 'hours' },
    // Same as the MIT frame: a 16:9 piece inside letterbox bars (97px above, 80px below, of 1024).
    curated: { plate: 'FGV', image: { src: fgvDataScience, alt: 'fgv-datasci', layout: 'band', kind: 'graphic', ratio: 1.82, position: '50% 54.7%' } } },
  { id: 'mit-60002', section: 'data', title: 'Introduction to Computational Thinking and Data Science', institution: 'MIT OpenCourseWare', category: 'data-computing', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/', checked: indexed, certificate: 'none' },

  // entender-os-sistemas / understand-the-systems
  { id: 'cs50sql', section: 'systems', title: 'CS50’s Introduction to Databases with SQL', institution: 'Harvard University', category: 'databases', level: 'beginner-intermediate', language: 'en', url: 'https://cs50.harvard.edu/sql/', checked: indexed },
  { id: 'mit-6006', section: 'systems', title: 'Introduction to Algorithms', institution: 'MIT OpenCourseWare', category: 'algorithms', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', checked: indexed, certificate: 'none' },
  { id: 'mit-6042j', section: 'systems', title: 'Mathematics for Computer Science', institution: 'MIT OpenCourseWare', category: 'math-cs', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/', checked: indexed, certificate: 'none' },
  { id: 'mit-1806', section: 'systems', title: 'Linear Algebra', institution: 'MIT OpenCourseWare', category: 'math', level: 'intermediate', language: 'en', url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', checked: indexed, certificate: 'none' },

  // proteger-e-conectar / protect-and-connect
  { id: 'cisco-cyber', section: 'security', title: 'Introduction to Cybersecurity', institution: 'Cisco Networking Academy', category: 'cybersecurity', level: 'beginner', language: 'en', url: 'https://www.netacad.com/courses/introduction-to-cybersecurity', checked: indexed, duration: { value: 6, unit: 'hours' } },
  { id: 'fgv-security', section: 'security', title: 'Segurança Digital', institution: 'FGV', category: 'security', level: 'beginner', language: 'pt', url: 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/seguranca-digital', checked: indexed, certificate: 'statement', duration: { value: 5, unit: 'hours' } },
  { id: 'fgv-privacy', section: 'security', title: 'Proteção de Dados', institution: 'FGV', category: 'privacy', level: 'beginner', language: 'pt', url: 'https://educacao-executiva.fgv.br/cursos/online/curta-media-duracao-online/protecao-de-dados', checked: indexed, duration: { value: 5, unit: 'hours' } },
  {
    id: 'ms-azure-ai', section: 'security', title: 'Fundamentos de Inteligência Artificial no Azure', institution: 'Microsoft Learn', category: 'cloud-ai', level: 'beginner', language: 'pt', url: null,
    review: 'No pt-BR Learn path with this title was found. The current beginner path indexed is pt-br/training/paths/introduction-to-ai-on-azure/ ("Introdução aos aplicativos e agentes de IA no Azure"). Confirm it is the intended course before publishing.',
  },
];

/** Only entries with a confirmed official URL reach the page. */
export const published = catalogue.filter((c): c is Course & { url: string } => c.url !== null);

// Fail the build, not the reader: a published entry must say how its URL was confirmed, use HTTPS,
// and every id must be unique (ids become anchors).
for (const c of catalogue) {
  if (c.url && !c.checked) throw new Error(`courses: ${c.id} has a url but no "checked" record`);
  if (c.url && !c.url.startsWith('https://')) throw new Error(`courses: ${c.id} url must be https`);
  if (!c.url && !c.review) throw new Error(`courses: ${c.id} is held back without a review note`);
}
if (new Set(catalogue.map((c) => c.id)).size !== catalogue.length) throw new Error('courses: duplicate id');

// An image belongs to a curated cell, a graphic declares its frame, and no image is used twice.
const imageIds = new Set<CourseImageId>();
for (const c of catalogue) {
  const img = c.curated?.image;
  if (!img) continue;
  if (img.kind === 'graphic' && !img.ratio) throw new Error(`courses: ${c.id} is a graphic and needs a ratio`);
  if (img.kind === 'photo' && img.ratio) throw new Error(`courses: ${c.id} is a photo: its frame comes from the layout`);
  if (imageIds.has(img.alt)) throw new Error(`courses: image alt key ${img.alt} used twice`);
  imageIds.add(img.alt);
}

// One shape for every language. A missing or extra key in either
// dictionary is a type error, so EN and PT cannot drift apart silently.

export type Lang = 'en' | 'pt';

/** Page identities. Each exists in both languages; see routes.ts. */
export type PageId = 'home' | 'resume' | 'courses';

export interface Fact {
  title: string;
  body: string;
}

export interface Ledger {
  evidenceLabel: string;
  evidence: string;
  openLabel: string;
  open: string;
}

export interface Project {
  label: string;
  name: string;
  question: string;
  body: string;
  link: { href: string; text: string; note: string };
  facts: [Fact, Fact, Fact];
  ledger: Ledger;
}

/** Lume's figure: a drawn schematic, with its state readout, axis label and legend. */
export interface LumeFigure {
  alt: string;
  caption: string;
  states: [string, string, string];
  axis: string;
  legend: [string, string, string];
}

/** Pexiscale's figure: three screenshots of the product, each with its own alt text. */
export interface PexiscaleFigure {
  caption: string;
  shots: { sales: string; catalog: string; home: string };
}

/** The Home's Pexis Machine chapter: an experimental software computer-architecture lab. Only
    approved facts: no link, no metric, no performance claim. */
export interface PexisMachineCopy {
  label: string;
  name: string;
  kind: string;
  question: string;
  body: string;
  facts: [Fact, Fact, Fact];
}

/** One entry of the résumé's selected work. Bullets are fixed-length tuples so EN and PT cannot
    drift: a bullet added in one language is a type error until it exists in the other. */
export interface ResumeProject {
  name: string;
  /** Kind of project, e.g. "Multi-tenant SaaS / Product engineering". */
  kind: string;
  /** Main technologies, as one line. */
  stack: string;
  points: string[];
}

/** People in the résumé's influences section. Closed on purpose: src/lib/influences.ts holds their name, photo and brands. */
export type InfluenceId = 'jensen' | 'elon' | 'mark' | 'steve' | 'larry-sergey' | 'sam' | 'dario' | 'tim';

/** Institutions shown with a logo in the résumé (sections 05 and 06). Closed on purpose, like AiToolName. */
export type InstitutionId = 'unisuam' | 'marques-rodrigues' | 'joao-paulo' | 'harvard' | 'bradesco';

/** A school or course: who, what, and its status in plain words (never a level or a grade). */
export interface ResumeStudy {
  /** Language-independent id of the institution: src/lib/institutions.ts maps it to its logo. */
  institution: InstitutionId;
  school: string;
  program: string;
  status?: string;
}

export interface ResumeSection {
  /** Editorial heading, rendered with the blue slash. */
  title: string;
}

export interface Resume {
  meta: { title: string; description: string };
  heading: string;
  print: string;
  /** The terminal session around the page: its working directory, the two lines under the title,
      and the line after `exit`. Commands themselves are language-independent (src/lib/resume-session.ts). */
  terminal: { path: string; ready: [string, string]; closed: string };
  whoami: { role: string; place: string; summary: string };
  work: ResumeSection & {
    note: string;
    pexiscale: ResumeProject & {
      points: [string, string, string, string];
      figures: [{ value: string; label: string }, { value: string; label: string }];
      link: { href: string; text: string };
    };
    lume: ResumeProject & {
      description: string;
      points: [string, string, string];
      link: { href: string; text: string };
      method: { label: string; items: [MethodItem, MethodItem, MethodItem, MethodItem] };
      experiment: { label: string; movement: { value: string; label: string }; time: { value: string; label: string }; text: string };
    };
    paulex: ResumeProject & {
      points: [string, string, string, string];
      domains: [string, string, string, string, string, string];
      note: string;
      /** One scale indicator, styled like the Pexiscale figures. */
      figure: { value: string; label: string };
    };
  };
  capabilities: ResumeSection & {
    groups: [CapabilityGroup, CapabilityGroup, CapabilityGroup, CapabilityGroup, CapabilityGroup];
  };
  ai: ResumeSection & {
    body: string;
    flowLabel: string;
    flow: [string, string, string, string];
    models: { label: string; items: AiToolName[] };
    agents: { label: string; items: AiToolName[] };
  };
  education: ResumeSection & { items: [ResumeStudy, ResumeStudy, ResumeStudy] };
  coursework: ResumeSection & { items: [ResumeStudy, ResumeStudy] };
  /** Web only: hidden in print. Descriptions are keyed by id, so EN and PT cannot drift apart. */
  influences: ResumeSection & {
    intro: string;
    descriptions: Record<InfluenceId, string>;
    quote: string;
  };
}

/** Product names used in the résumé's AI section. Closed on purpose: src/lib/ai-tools.ts maps each one to its icon. */
export type AiToolName =
  | 'ChatGPT' | 'Claude' | 'Gemini' | 'DeepSeek'
  | 'Claude Code' | 'Codex' | 'Google Antigravity' | 'Hermes Agent';

export interface MethodItem {
  term: string;
  definition: string;
}

export interface CapabilityGroup {
  title: string;
  items: string[];
}

export interface Dict {
  htmlLang: string;
  meta: { title: string; description: string; ogLocale: string };
  skip: string;
  nav: { label: string; home: string; resume: string; courses: string; language: string };
  hero: {
    /** Location, practice, current work. Rendered in this order, each with its own icon. */
    meta: [string, string, string];
    blurb: string;
    cta: string;
    photoAlt: string;
  };
  statement: { label: string; text: string; mark: string; aside: string };
  lume: Project & { figure: LumeFigure };
  pexiscale: Project & { figure: PexiscaleFigure };
  pexisMachine: PexisMachineCopy;
  principles: { label: string; items: [Fact, Fact, Fact] };
  about: { label: string; heading: string; body: string; also: string; cta: string };
  contact: {
    label: string;
    heading: string;
    items: { icon: 'email' | 'linkedin' | 'github' | 'instagram'; label: string; value: string; href: string }[];
  };
  footer: { place: string; updated: string; top: string };
  resume: Resume;
  courses: CoursesPage;
}

/* Courses page ------------------------------------------------------------------------------- */

/** The four sections of the catalogue, in page order. */
export type CourseSectionId = 'build' | 'data' | 'systems' | 'security';
export type CourseCategoryId =
  | 'cs' | 'python' | 'web' | 'webdev' | 'ai' | 'genai' | 'datasci' | 'data-computing'
  | 'databases' | 'algorithms' | 'math-cs' | 'math' | 'cybersecurity' | 'security' | 'privacy' | 'cloud-ai';
export type CourseLevelId = 'beginner' | 'beginner-intermediate' | 'intermediate';
export type CourseLanguageId = 'en' | 'pt';
/** Only what the course's own page states. Unknown is simply absent from the data. */
export type CourseCertificateId = 'none' | 'statement' | 'available';
export type CourseNavId = 'all' | 'programming' | 'ai' | 'data' | 'systems' | 'security';
/** The courses that carry an image (the curator's picks). Each has an alt text in both languages. */
export type CourseImageId = 'cs50x' | 'cs50p' | 'mit-6100l' | 'cs50ai' | 'fluencia' | 'fgv-datasci';

export interface CoursesPage {
  meta: { title: string; description: string };
  /** Small editorial line above the headline, e.g. CURADORIA / EDUCAÇÃO / 2026. */
  eyebrow: [string, string, string];
  /** Rendered with the blue slash. Hyphens are its only break points. */
  heading: string;
  intro: string;
  nav: { label: string; jump: string; items: Record<CourseNavId, string> };
  /** Anchor ids: the catalogue start, and the first data course (the "Data" stop of the nav). */
  anchors: { all: string; data: string };
  /** title doubles as the section's anchor id (it is already a slug: aprender-e-construir). */
  sections: Record<CourseSectionId, { title: string; intro: string }>;
  categories: Record<CourseCategoryId, string>;
  /** Alt text of each course image: what it shows, not what it is called. */
  imageAlts: Record<CourseImageId, string>;
  levels: Record<CourseLevelId, string>;
  languages: Record<CourseLanguageId, string>;
  certificates: Record<CourseCertificateId, string>;
  units: { hours: string; weeks: string };
  labels: {
    category: string;
    level: string;
    language: string;
    certificate: string;
    duration: string;
    courses: string;
    curated: string;
    cta: string;
    /** Screen-reader suffix on every external link. */
    newTab: string;
  };
  closing: { title: string; body: string; prompt: string; cta: string };
}

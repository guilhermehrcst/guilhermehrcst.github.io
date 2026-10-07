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
  figure: {
    alt: string;
    caption: string;
    /** Lume only: state readout, axis label and legend of the schematic. */
    states?: [string, string, string];
    axis?: string;
    legend?: [string, string, string];
  };
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

/** A school or course: who, what, and its status in plain words (never a level or a grade). */
export interface ResumeStudy {
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
    };
  };
  capabilities: ResumeSection & {
    groups: [CapabilityGroup, CapabilityGroup, CapabilityGroup, CapabilityGroup, CapabilityGroup];
  };
  ai: ResumeSection & {
    body: string;
    flowLabel: string;
    flow: [string, string, string, string];
    models: { label: string; items: string[] };
    agents: { label: string; items: string[] };
  };
  education: ResumeSection & { items: [ResumeStudy, ResumeStudy, ResumeStudy] };
  coursework: ResumeSection & { items: [ResumeStudy, ResumeStudy] };
}

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
  lume: Project;
  pexiscale: Project;
  principles: { label: string; items: [Fact, Fact, Fact] };
  about: { label: string; heading: string; body: string; also: string; cta: string };
  contact: {
    label: string;
    heading: string;
    items: { icon: 'email' | 'linkedin' | 'github' | 'instagram'; label: string; value: string; href: string }[];
  };
  footer: { place: string; updated: string; top: string };
  resume: Resume;
  /** Placeholder pages (Courses). */
  shell: {
    courses: { title: string; description: string; heading: string; body: string };
    back: string;
  };
}

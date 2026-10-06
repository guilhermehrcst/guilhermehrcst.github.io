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

export interface Dict {
  htmlLang: string;
  meta: { title: string; description: string; ogLocale: string };
  skip: string;
  nav: { label: string; home: string; resume: string; courses: string; language: string };
  hero: { meta: [string, string, string]; metaLabels: [string, string, string] };
  statement: { label: string; text: string; aside: string };
  lume: Project;
  pexiscale: Project;
  principles: { label: string; items: [Fact, Fact, Fact] };
  about: { label: string; heading: string; body: string; also: string; cta: string };
  contact: { label: string; heading: string; items: { label: string; value: string; href: string }[] };
  footer: { place: string; updated: string; top: string };
  shell: {
    resume: { title: string; description: string; heading: string; body: string };
    courses: { title: string; description: string; heading: string; body: string };
    back: string;
  };
}

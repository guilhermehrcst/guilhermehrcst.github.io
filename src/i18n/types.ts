import type {
  LearningCertificateId,
  LearningFormatId,
  LearningLanguageId,
  LearningRegistrationId,
} from '../lib/learning-resources';
import type { PathId } from '../lib/taxonomy';

// The shape of the interface copy. V0.1 is Portuguese only (spec §6.6): `Lang` has one member, and the
// shape is kept so that a future /en/ adds a dictionary and `astro check` enforces parity again.

export type Lang = 'pt';

export interface PageMeta {
  title: string;
  description: string;
}

export interface PageCopy extends PageMeta {
  eyebrow?: string;
  heading: string;
  lead: string;
}

export type PageKey =
  | 'home' | 'enem' | 'uerj' | 'ensino-medio' | 'vestibulares' | 'tecnologia'
  | 'ensino-fundamental' | 'pre-militar' | 'ensino-superior'
  | 'materias' | 'buscar' | 'sobre' | 'notFound';

export interface Dict {
  htmlLang: 'pt-BR';
  ogLocale: 'pt_BR';
  siteName: 'Pexis Academy';
  skip: string;
  nav: { label: string; home: string };
  footer: {
    tagline: string;
    objectives: string;
    subjects: string;
    academy: string;
    verified: (date: string) => string;
    licenses: string;
    technology: string;
    independence: string;
    nav: { explore: string; search: string; about: string; verification: string };
  };
  pages: Record<PageKey, PageCopy>;
  /** Copy of a path in preparation and of the new paths (V0.3). */
  preparing: { label: string; why: string; meanwhile: string };
  fundamental: {
    stagesTitle: string;
    stagesWhy: string;
    stages: { title: string; body: string }[];
    subjectsTitle: string;
    subjectsWhy: string;
    subjects: string[];
    rule: string;
    medio: string;
  };
  preMilitar: {
    processesTitle: string;
    processesWhy: string;
    branches: { force: string; schools: { acronym: string; name: string }[] }[];
    status: string;
    howTitle: string;
    how: string[];
    scope: string;
    medio: string;
  };
  superior: { note: string; groupsTitle: string };
  home: {
    hero: {
      eyebrow: string;
      lead: string;
      primary: string;
      secondary: string;
      note: string;
      demoCaption: string;
      demoLink: string;
      demo: { subjects: string; objectives: string; areas: string; study: string; practice: string; byObjective: string };
    };
    objectives: { heading: string; lead: string; items: Record<PathId, string>; facts: (resources: number, tracks?: number) => string };
    sources: {
      heading: string;
      lead: string;
      independence: string;
      count: (resources: number, page: string) => string;
      exams: string;
      examLinks: { enem: string; uerj: string };
      pending: string;
    };
    path: {
      heading: string;
      lead: string;
      route: string;
      steps: Record<'objetivo' | 'materia' | 'assunto' | 'conteudo' | 'pratica', string>;
      enemMeta: string;
      pending: string;
      topicNote: string;
      official: string;
      links: { objective: string; subject: string; content: string; practice: string };
    };
    areas: { heading: string; lead: string; subjects: (n: number) => string };
    tracks: {
      heading: string;
      lead: string;
      kinds: { guide: string; track: string };
      titles: { enem: string; uerj: string };
      why: { enem: string; uerj: string };
      steps: (n: number) => string;
      links: { enem: string; uerj: string; track: string };
    };
    curation: { heading: string; statement: string; verified: (date: string) => string; rules: { title: string; body: string }[]; more: string };
    faq: { heading: string; items: { q: string; a: string }[] };
  };
  about: {
    intro: string;
    curation: { heading: string; rules: { title: string; body: string }[] };
    verification: { heading: string; body: string[]; latest: (date: string) => string };
    independence: { heading: string; body: string[] };
  };
  subjectPage: (subject: string, area: string) => PageCopy;
  tecnologia: { chooser: string };
  search: { label: string; placeholder: string; groups: Record<'objetivo' | 'area' | 'materia' | 'trilha' | 'recurso', string>; results: (n: number) => string; empty: string };
  vestibulares: { uerj: { title: string; why: string; link: string }; note: { title: string; body: string } };
  objectiveMap: { more: (subject: string) => string; technology: { title: string; why: string; link: string } };
  guides: {
    count: (n: number) => string;
    uerj: {
      entenda: { title: string; body: string[] };
      prepare: { title: string; body: string[] };
      materias: { title: string; why: string };
      provas: { title: string; why: string };
    };
    enem: {
      entenda: { title: string; body: string[] };
      areas: { title: string; why: string };
      pratique: { title: string; why: string };
      aprofunde: { title: string; why: string };
    };
  };
  source: { label: string; verified: (date: string) => string };
  subject: { map: string; eyebrow: string; content: string; practice: string; objectives: string; objectivesLead: (subject: string) => string };
  notFound: { home: string; subjects: string; search: string };
  resource: {
    formats: Record<LearningFormatId, string>;
    languages: Record<LearningLanguageId, string>;
    registration: Record<LearningRegistrationId, string>;
    certificates: Record<LearningCertificateId, string>;
    units: { hours: string; weeks: string };
    newTab: string;
  };
}

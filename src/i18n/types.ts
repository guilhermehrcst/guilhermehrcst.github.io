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

/** The paths whose page copy follows PATH_STATUS (V0.4): their description and lead live in byState. */
export type GatedPageKey = 'ensino-fundamental' | 'pre-militar';
type StatePageCopy = { description: string; lead: string };

export type PageKey =
  | 'home' | 'enem' | 'uerj' | 'ensino-medio' | 'vestibulares' | 'tecnologia'
  | 'ensino-fundamental' | 'pre-militar' | 'ensino-superior'
  | 'materias' | 'buscar' | 'sobre' | 'notFound' | 'cursos' | 'materiais';

export interface Dict {
  htmlLang: 'pt-BR';
  ogLocale: 'pt_BR';
  siteName: 'Pexis Academy';
  skip: string;
  nav: { label: string; home: string; mobile: string; menu: string; paths: string; choose: string; explorePaths: string; search: string };
  breadcrumb: { label: string; home: string };
  footer: {
    subjects: string;
    verified: (date: string) => string;
    licenses: string;
    independence: string;
    nav: { explore: string; search: string; about: string; verification: string };
    about: string;
    formation: string;
    explore: string;
    marks: string;
  };
  pages: Record<Exclude<PageKey, GatedPageKey>, PageCopy> & Record<GatedPageKey, Omit<PageCopy, 'description' | 'lead'>>;
  /** Copy of a path in preparation and of the new paths (V0.3). */
  preparing: { label: string; why: string; meanwhile: string };
  fundamental: {
    /** The copy that follows PATH_STATUS: the page picks it with isPreparing. Subjects show only in preparation. */
    byState: {
      preparing: StatePageCopy & { stagesTitle: string; stagesWhy: string; subjectsTitle: string; subjectsWhy: string };
      active: StatePageCopy & { stagesTitle: string; stagesWhy: string };
    };
    stages: { title: string; body: string }[];
    subjects: string[];
    rule: string;
    medio: string;
  };
  preMilitar: {
    /** The copy that follows PATH_STATUS: the page picks it with isPreparing. */
    /** Only what changes with the state: the third step of "Como começar" (practice now, or the base
     *  subjects while the page is in preparation). */
    byState: Record<'preparing' | 'active', StatePageCopy & { practice: { title: string; text: string; link: string } }>;
    startTitle: string;
    /** The first steps of "Como começar", the same in both states. */
    start: { title: string; text: string }[];
    materialsTitle: string;
    materialsWhy: string;
    processesTitle: string;
    processesWhy: string;
    /** resourceId: the typed id of a catalogue record from this school. The page shows it as available,
     *  linked to its anchor, only once that record is published and placed on this page (never a URL). */
    branches: { force: string; schools: { acronym: string; name: string; resourceId?: string }[] }[];
    available: string;
    scope: string;
  };
  explore: { paths: string; areas: string };
  /** The video library's bottom navigation (V0.7). */
  bottomNav: { label: string; home: string; courses: string; materials: string; explore: string; search: string };
  /** /cursos/ (V0.6): the course grid and a course's own page. */
  courseLibrary: {
    catalogue: string;
    filterLegend: string;
    all: string;
    empty: string;
    emptyPath: (path: string) => string;
    search: string;
    page: { provider: string; facts: string; summary: string; modules: string; checked: (date: string) => string; open: string; watch: string; related: string; back: string };
  };
  /** /cursos/ and /materiais/ (V0.5): a group heading per format, the count line, and where to go next. */
  library: {
    groups: Record<LearningFormatId, string>;
    count: (n: number) => string;
    note: string;
    other: Record<'cursos' | 'materiais', { label: string; text: string }>;
  };
  superior: {
    note: string;
    groupsTitle: string;
    /** Copy for the fields that have actually published resources, never staging candidates. */
    byAreas: (labels: readonly string[]) => { description: string; note: string; objective: string };
  };
  home: {
    hero: {
      eyebrow: string;
      lead: string;
      primary: string;
      secondary: string;
      note: string;
      demoCaption: string;
      demoLink: string;
      demo: { study: string; practice: string; official: string; officialWhy: string; steps: { path: string; exam: string; area: string; content: string; practice: string } };
    };
    objectives: { heading: string; lead: string; items: Record<PathId, string>; facts: (resources: number, tracks?: number) => string };
    sources: {
      heading: string;
      lead: string;
      independence: string;
      count: (resources: number, page: string) => string;
      /** An institution whose courses span pages: every area, in catalogue order. */
      countAreas: (resources: number, areas: readonly string[]) => string;
      exams: string;
      examLinks: { enem: string; uerj: string };
      pending: string;
    };
    path: {
      heading: string;
      lead: string;
      route: string;
      steps: Record<'objetivo' | 'area' | 'assunto' | 'conteudo' | 'pratica', string>;
      vestMeta: string;
      subjectMeta: (subject: string) => string;
      pending: string;
      topicNote: string;
      links: { objective: string; area: string; subject: string; content: string; practice: string };
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
  /** V0.4: the in-page navigation of a long path page, and the editorial highlights of a path. */
  sectionNav: { areas: string; page: string };
  featured: { title: string; why: string };
  /** V0.4 Gate B: the general section of a path page (resources no subject, exam or field page shows). */
  pathResources: { other: { title: string; why: string }; general: { title: string; why: string }; stages: Record<'anos-iniciais' | 'anos-finais' | 'none', string> };
  search: {
    label: string; placeholder: string; groups: Record<'biblioteca' | 'objetivo' | 'area' | 'materia' | 'trilha' | 'recurso', string>; results: (n: number) => string; empty: string;
    /** V0.4 M4: the filters of the resources. */
    filters: { title: string; note: string; facets: Record<'caminho' | 'materia' | 'instituicao' | 'idioma' | 'formato', string>; clear: string; emptyFiltered: string };
    languages: Record<'pt' | 'en' | 'es', string>;
  };
  vestibulares: {
    exams: { title: string; why: string; items: Record<'enem' | 'uerj', { name: string; what: string; link: string }> };
    note: { title: string; body: string };
  };
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
  subject: { map: string; eyebrow: string; content: string; practice: string; reference: string; objectives: string; objectivesLead: (subject: string) => string };
  notFound: { home: string; subjects: string; search: string };
  resource: {
    openSource: string;
    accessLabel: string;
    formats: Record<LearningFormatId, string>;
    languages: Record<LearningLanguageId, string>;
    /** Only confirmed values have a label: 'unconfirmed' is never shown as a fact (V0.4 Gate B, P4). */
    registration: Record<Exclude<LearningRegistrationId, 'unconfirmed'>, string>;
    certificates: Record<Exclude<LearningCertificateId, 'unconfirmed'>, string>;
    units: { hours: string; weeks: string };
    /** V0.4 Gate B, P3: the school years the source states ("2º ano", "6º ao 9º ano"). */
    schoolYears: (years: readonly number[]) => string;
    newTab: string;
  };
}

import type {
  LearningCertificateId,
  LearningFormatId,
  LearningLanguageId,
  LearningRegistrationId,
} from '../lib/learning-resources';

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
  };
  pages: Record<PageKey, PageCopy>;
  subjectPage: (subject: string, area: string) => PageCopy;
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

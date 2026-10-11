import type { Dict, Lang, RouteId } from './types';
import { en } from './en';
import { pt } from './pt';

export const dicts: Record<Lang, Dict> = { en, pt };

/** Single source of truth for URLs. Every route exists in both languages. */
export const routes: Record<RouteId, Record<Lang, string>> = {
  home: { en: '/', pt: '/pt/' },
  resume: { en: '/resume/', pt: '/pt/curriculo/' },
  courses: { en: '/courses/', pt: '/pt/cursos/' },
  'courses-enem': { en: '/courses/enem/', pt: '/pt/cursos/enem/' },
  'courses-uerj': { en: '/courses/uerj/', pt: '/pt/cursos/uerj/' },
};

export const hreflang: Record<Lang, string> = { en: 'en', pt: 'pt-BR' };

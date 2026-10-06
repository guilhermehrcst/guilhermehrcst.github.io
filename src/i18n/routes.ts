import type { Dict, Lang, PageId } from './types';
import { en } from './en';
import { pt } from './pt';

export const dicts: Record<Lang, Dict> = { en, pt };

/** Single source of truth for URLs. Every page exists in both languages. */
export const routes: Record<PageId, Record<Lang, string>> = {
  home: { en: '/', pt: '/pt/' },
  resume: { en: '/resume/', pt: '/pt/curriculo/' },
  courses: { en: '/courses/', pt: '/pt/cursos/' },
};

export const hreflang: Record<Lang, string> = { en: 'en', pt: 'pt-BR' };

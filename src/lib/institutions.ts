// Logos for the institutions in the résumé (sections 05 and 06), as supplied. The names stay text
// in the dictionaries; this maps each InstitutionId to its artwork. The record is exhaustive:
// a new id without a logo fails `astro check`.
import unisuam from '../assets/institutions/unisuam.png';
import marquesRodrigues from '../assets/institutions/marques-rodrigues.png';
import joaoPaulo from '../assets/institutions/joao-paulo.png';
import harvard from '../assets/institutions/harvard.png';
import bradesco from '../assets/institutions/bradesco.png';
import type { InstitutionId } from '../i18n/types';

export interface InstitutionLogo {
  src: ImageMetadata;
  /**
   * Optical scale inside the shared brand cell (1 = the cell's logo size). Perceived size, not
   * geometry: measured from the artworks' real content (the canvases are all 1254px squares).
   * Wide, low marks are raised and the full circle is lowered so none dominates.
   */
  scale: number;
}

export const institutionLogos: Record<InstitutionId, InstitutionLogo> = {
  unisuam: { src: unisuam, scale: 1.1 }, // wide owl: 0.89 x 0.54 of its canvas
  'marques-rodrigues': { src: marquesRodrigues, scale: 1.1 }, // wide swoosh, light mass
  'joao-paulo': { src: joaoPaulo, scale: 0.86 }, // a full circle fills its canvas: the heaviest shape
  harvard: { src: harvard, scale: 1 }, // upright shield
  bradesco: { src: bradesco, scale: 1.06 }, // thin strokes read lighter than filled marks
};

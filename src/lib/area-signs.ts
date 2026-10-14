// The signs of each area (Home V2): large glyphs drawn behind an area's card and behind a featured course
// that has no photograph, so a ground of the brand is never empty and never an invented picture. Decorative:
// they are always hidden from assistive tech. No asset imports: this module runs under Node's test runner.
import type { AreaId } from './taxonomy.ts';

export const AREA_SIGNS: Readonly<Record<AreaId, readonly string[]>> = {
  matematica: ['π', '√', 'Σ', '∞', 'x²', '÷'],
  linguagens: ['Aa', '“”', '¶', 'ç', 'é', '?!'],
  natureza: ['H₂O', 'λ', 'Δ', 'pH', 'e⁻', 'CO₂'],
  humanas: ['φ', '§', 'séc.', 'Ω', '1822', 'N'],
  idiomas: ['Hello', 'Hola', '¡!', 'ñ', 'the', 'and'],
  tecnologia: ['</>', '{ }', '01', 'fn', '=>', '#'],
};

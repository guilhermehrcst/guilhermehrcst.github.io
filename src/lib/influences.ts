// The people in the résumé's influences section (07): who, which photograph and how it is framed,
// and which brands stand beside them. Names and brands are the same in EN and PT, so they live here;
// the one-line descriptions are in the dictionaries, keyed by InfluenceId.
import jensen from '../assets/influences/photos/jensen-huang.jpg';
import elon from '../assets/influences/photos/elon-musk.jpg';
import mark from '../assets/influences/photos/mark-zuckerberg.jpg';
import steve from '../assets/influences/photos/steve-jobs.jpg';
import larrySergey from '../assets/influences/photos/larry-page-sergey-brin.jpg';
import sam from '../assets/influences/photos/sam-altman.png';
import dario from '../assets/influences/photos/dario-amodei.png';
import tim from '../assets/influences/photos/tim-cook.png';
import nvidia from '../assets/influences/brands/nvidia.png';
import spacex from '../assets/influences/brands/spacex.png';
import meta from '../assets/influences/brands/meta.png';
import apple from '../assets/influences/brands/apple.png';
import google from '../assets/influences/brands/google.png';
// Anthropic's "A\" mark, drawn from the SVG served on anthropic.com (anthropic.svg, next to it),
// rendered once to a transparent PNG so it goes through the same pipeline as the other marks.
import anthropic from '../assets/influences/brands/anthropic.png';
// OpenAI's horizontal signature (the knot and the wordmark), as supplied: 3840 x 2160, transparent, black.
import openai from '../assets/influences/brands/openai.png';
import type { InfluenceId } from '../i18n/types';

/** Every portrait frame has this width / height. The crops below are computed against it. */
export const FRAME_ASPECT = 8 / 9;

/**
 * A crop window onto a photograph, in fractions of the photo: its centre (x, y) and its width (w).
 * The height follows from FRAME_ASPECT. The photographs are wide shots; the window is what turns
 * each one into a head-and-shoulders portrait. Faces and pixels are untouched: nothing is filtered.
 */
export interface Crop { x: number; y: number; w: number }

export type BrandId = 'nvidia' | 'spacex' | 'meta' | 'apple' | 'google' | 'anthropic' | 'openai';

export interface Brand {
  /** Shown as the image's alt text: the brand is only communicated by its logo. */
  name: string;
  src: ImageMetadata;
  /** Real content of the artwork in canvas pixels (the canvases carry large transparent margins). */
  box: { x: number; y: number; w: number; h: number };
  /** Optical height of the visible mark in CSS px: chosen by eye so the marks weigh the same, not by geometry. */
  height: number;
}

export const brands: Record<BrandId, Brand> = {
  nvidia: { name: 'NVIDIA', src: nvidia, box: { x: 131, y: 283, w: 1016, h: 775 }, height: 48 }, // the stacked lockup, as supplied
  spacex: { name: 'SpaceX', src: spacex, box: { x: 29, y: 550, w: 1177, h: 146 }, height: 18 },
  meta: { name: 'Meta', src: meta, box: { x: 58, y: 499, w: 1138, h: 248 }, height: 24 },
  apple: { name: 'Apple', src: apple, box: { x: 246, y: 203, w: 745, h: 901 }, height: 34 },
  google: { name: 'Google', src: google, box: { x: 162, y: 80, w: 1835, h: 591 }, height: 28 },
  anthropic: { name: 'Anthropic', src: anthropic, box: { x: 0, y: 0, w: 1135, h: 800 }, height: 22 },
  openai: { name: 'OpenAI', src: openai, box: { x: 122, y: 584, w: 3596, h: 992 }, height: 26 }, // the knot's height; the wordmark is about half of it
};

export interface Influence {
  id: InfluenceId;
  name: string;
  /** Alt text for the portrait. */
  alt: string;
  photo: ImageMetadata;
  crop: Crop;
  /** The brands beside the name. */
  brands: readonly BrandId[];
}

// In reading order: the number shown beside each person is its place here (01 to 08).
export const influences = [
  { id: 'jensen', name: 'Jensen Huang', alt: 'Jensen Huang', photo: jensen, crop: { x: 0.47, y: 0.312, w: 0.6 }, brands: ['nvidia'] },
  { id: 'elon', name: 'Elon Musk', alt: 'Elon Musk', photo: elon, crop: { x: 0.47, y: 0.302, w: 0.59 }, brands: ['spacex'] },
  { id: 'mark', name: 'Mark Zuckerberg', alt: 'Mark Zuckerberg', photo: mark, crop: { x: 0.51, y: 0.44, w: 0.61 }, brands: ['meta'] },
  { id: 'steve', name: 'Steve Jobs', alt: 'Steve Jobs', photo: steve, crop: { x: 0.5, y: 0.45, w: 0.71 }, brands: ['apple'] },
  { id: 'larry-sergey', name: 'Larry Page & Sergey Brin', alt: 'Larry Page and Sergey Brin', photo: larrySergey, crop: { x: 0.472, y: 0.5, w: 0.617 }, brands: ['google'] },
  { id: 'sam', name: 'Sam Altman', alt: 'Sam Altman', photo: sam, crop: { x: 0.5, y: 0.47, w: 0.8 }, brands: ['openai'] },
  { id: 'dario', name: 'Dario Amodei', alt: 'Dario Amodei', photo: dario, crop: { x: 0.5, y: 0.45, w: 0.72 }, brands: ['anthropic'] },
  { id: 'tim', name: 'Tim Cook', alt: 'Tim Cook', photo: tim, crop: { x: 0.44, y: 0.66, w: 0.46 }, brands: ['apple'] },
] as const satisfies readonly Influence[];

// Every InfluenceId appears here (a missing one is a type error), and only once (a duplicate fails the build).
type Missing = Exclude<InfluenceId, (typeof influences)[number]['id']>;
const everyone: [Missing] extends [never] ? true : Missing = true;
if (!everyone || new Set(influences.map((p) => p.id)).size !== influences.length) throw new Error('influences: duplicate id');

/**
 * CSS for an <img> inside a frame of FRAME_ASPECT so that only the crop window is visible.
 * Throws if the window leaves the photograph, so a bad crop fails the build instead of showing an empty edge.
 */
export function cropStyle(photo: ImageMetadata, c: Crop) {
  const h = (c.w * photo.width) / (FRAME_ASPECT * photo.height); // window height as a fraction of the photo
  const eps = 0.0005;
  if (c.x - c.w / 2 < -eps || c.x + c.w / 2 > 1 + eps || c.y - h / 2 < -eps || c.y + h / 2 > 1 + eps) {
    throw new Error(`influences: crop window leaves the photo (${photo.src}): x ${c.x - c.w / 2}..${c.x + c.w / 2}, y ${c.y - h / 2}..${c.y + h / 2}`);
  }
  const pct = (n: number) => `${+(n * 100).toFixed(3)}%`;
  return { width: pct(1 / c.w), left: pct(-(c.x - c.w / 2) / c.w), top: pct(-(c.y - h / 2) / h) };
}

/** CSS for a brand image inside a wrapper sized to the mark's visible content: shows only that box. */
export function brandStyle(b: Brand) {
  const { x, y, w, h } = b.box;
  const pct = (n: number) => `${+(n * 100).toFixed(3)}%`;
  const cssW = (b.height * w) / h;
  const canvasW = b.src.width;
  return { wrapperW: cssW, imgW: Math.round((cssW * canvasW) / w), width: pct(canvasW / w), left: pct(-x / w), top: pct(-y / h) };
}

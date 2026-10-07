// The institutions' marks for the Courses page, as supplied (src/assets/providers, unmodified).
// One place: `marks` holds each artwork with its measured geometry and its optical size, and
// `providerMarks` says which marks stand for each institution name in the catalogue (lib/courses.ts).
// The catalogue's `institution` string stays the single source of the name: it is the key here, the
// accessible name of the group, and the text shown when an institution has no mark (so a new course
// from a new institution renders, as text, before its logo is added).
import harvard from '../assets/providers/harvard.png';
import mit from '../assets/providers/mit-opencourseware.png';
import fgv from '../assets/providers/fgv.png';
import cisco from '../assets/providers/cisco-networking-academy.png';
import bradesco from '../assets/providers/fundacao-bradesco.png';
import microsoft from '../assets/providers/microsoft.png';

export interface Mark {
  src: ImageMetadata;
  /** The institution's name, as the image's alt text. */
  alt: string;
  /**
   * The visible artwork inside the supplied canvas, in canvas pixels [left, top, right, bottom]:
   * measured (alpha > 8). The canvases carry a lot of empty margin (FGV is 59% empty above and below
   * the mark, the Microsoft file has a 64px margin on the left); the frame of the mark is the artwork itself, so
   * sizes are the artwork's and not the canvas's. Nothing visible is cut.
   */
  bbox: [number, number, number, number];
  /**
   * Height of the artwork on desktop, in px. Optical size, not geometry: set so that, side by side,
   * no mark reads larger than the others (a shield is heavier than a thin wordmark of the same height).
   */
  h: number;
  /** The supplied artwork is white: it is shown on the ink, as small as the mark needs. */
  ground?: 'ink';
}

export const marks = {
  harvard: { src: harvard, alt: 'Harvard University', bbox: [7, 5, 2098, 2040], h: 40 },
  // White artwork on transparency: on the page's white it would vanish, so it sits on the ink.
  mit: { src: mit, alt: 'MIT OpenCourseWare', bbox: [60, 186, 1540, 444], h: 18, ground: 'ink' },
  fgv: { src: fgv, alt: 'FGV', bbox: [15, 142, 728, 270], h: 22 },
  cisco: { src: cisco, alt: 'Cisco Networking Academy', bbox: [0, 9, 867, 203], h: 28 },
  bradesco: { src: bradesco, alt: 'Fundação Bradesco', bbox: [323, 324, 4639, 1287], h: 24 },
  // The horizontal signature (the four squares and the wordmark), as supplied: 2172 x 724, RGBA,
  // transparent around the artwork. The box is the visible area (alpha > 8); the height is that of
  // the squares, which is what sits beside Fundação Bradesco's mark in the partnership.
  microsoft: { src: microsoft, alt: 'Microsoft', bbox: [64, 147, 2110, 579], h: 22 },
} satisfies Record<string, Mark>;

/** The marks that stand for each institution name used in the catalogue, in reading order. */
export const providerMarks: Record<string, Mark[]> = {
  'Harvard University': [marks.harvard],
  'MIT OpenCourseWare': [marks.mit],
  FGV: [marks.fgv],
  'Cisco Networking Academy': [marks.cisco],
  'Fundação Bradesco': [marks.bradesco],
  // A partnership, shown as two institutions side by side and not as a new mark.
  'Fundação Bradesco + Microsoft': [marks.bradesco, marks.microsoft],
};

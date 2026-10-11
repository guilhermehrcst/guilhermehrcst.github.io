import cs50x from '../assets/courses/cs50x.jpeg';
import cs50Python from '../assets/courses/cs50-python.jpeg';
import mitPython from '../assets/courses/mit-python.jpeg';
import cs50Ai from '../assets/courses/cs50-ai.jpeg';
import fluencia from '../assets/courses/fluencia.jpeg';
import fgvDataScience from '../assets/courses/fgv-data-science.jpeg';
import type { CourseImageId } from './learning-resources';

export const resourceImages: Record<CourseImageId, ImageMetadata> = {
  cs50x,
  cs50p: cs50Python,
  'mit-6100l': mitPython,
  cs50ai: cs50Ai,
  fluencia,
  'fgv-datasci': fgvDataScience,
};

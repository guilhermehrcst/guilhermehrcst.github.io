// Presentation-only metadata for a published resource. This does not change verification,
// publication, category, or destination, and never invents an unavailable attribute.
import type { PublishedLearningResource } from './learning-resources.ts';
import type { Dict } from '../i18n/types.ts';

type ResourceLabels = Dict['resource'];
type DisplayResource = Pick<PublishedLearningResource,
  'provider' | 'format' | 'schoolYears' | 'language' | 'duration' | 'registration' | 'certificate'>;

export interface ResourceDisplayFacts {
  /** What the resource is. Always factual; provider is included for compact rows. */
  readonly overview: readonly string[];
  /** What a learner should know before opening its official source. */
  readonly access: readonly string[];
}

export const resourceDisplayFacts = (
  resource: DisplayResource,
  labels: ResourceLabels,
  compact = false,
): ResourceDisplayFacts => {
  const overview = [
    compact ? resource.provider : null,
    labels.formats[resource.format],
    resource.schoolYears ? labels.schoolYears(resource.schoolYears) : null,
    labels.languages[resource.language],
    resource.duration ? `${resource.duration.value} ${labels.units[resource.duration.unit]}` : null,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  const access: string[] = [];
  if (resource.registration && resource.registration !== 'unconfirmed') {
    access.push(labels.registration[resource.registration]);
  }
  if (resource.certificate && resource.certificate !== 'none' && resource.certificate !== 'unconfirmed') {
    access.push(labels.certificates[resource.certificate]);
  }
  return { overview, access };
};

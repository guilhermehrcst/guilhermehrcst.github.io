// Copy for the university paths is derived from the groups which are actually published.
// Do not use a staged group to advertise an area in the Home or the page metadata.
import { HIGHER_EDUCATION_GROUPS, type HigherEducationGroup } from './higher-education.ts';
import { pt as t } from '../i18n/pt.ts';

export interface SuperiorCopy {
  description: string;
  note: string;
  objective: string;
}

export const superiorCopyFor = (
  groups: readonly Pick<HigherEducationGroup, 'id' | 'label'>[] = HIGHER_EDUCATION_GROUPS,
): SuperiorCopy => {
  if (!groups.length) throw new Error('superior: no published fields to describe');
  const names = groups.map((group) => group.label);
  if (new Set(names).size !== names.length) throw new Error('superior: duplicate field labels');

  // Preserve the exact released text while only Mathematics and Computing are available.
  if (groups.length === 2 && groups[0]?.id === 'matematica' && groups[1]?.id === 'computacao') {
    return {
      description: t.pages['ensino-superior'].description,
      note: t.superior.note,
      objective: t.home.objectives.items['ensino-superior'],
    };
  }

  // Once an approved resource publishes in a new field, update all three surfaces
  // from the same active groups rather than leaving stale claims about only two areas.
  return t.superior.byAreas(names);
};

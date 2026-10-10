// Who the influences are, in reading order: ids and names only, with no images, so plain Node can
// load it (the narrative tests, src/lib/narrative-content.ts). src/lib/influences.ts adds the photo,
// crop and brands to each person and takes the order and the names from here.
import type { InfluenceId } from '../i18n/types';

export const influenceRoster = [
  { id: 'jensen', name: 'Jensen Huang' },
  { id: 'elon', name: 'Elon Musk' },
  { id: 'mark', name: 'Mark Zuckerberg' },
  { id: 'steve', name: 'Steve Jobs' },
  { id: 'larry-sergey', name: 'Larry Page & Sergey Brin' },
  { id: 'sam', name: 'Sam Altman' },
  { id: 'dario', name: 'Dario Amodei' },
  { id: 'tim', name: 'Tim Cook' },
] as const satisfies readonly { id: InfluenceId; name: string }[];

// Every InfluenceId appears here (a missing one is a type error), and only once (a duplicate fails the build).
type Missing = Exclude<InfluenceId, (typeof influenceRoster)[number]['id']>;
const everyone: [Missing] extends [never] ? true : Missing = true;
if (!everyone || new Set(influenceRoster.map((p) => p.id)).size !== influenceRoster.length) throw new Error('influences: duplicate id');

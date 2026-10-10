// What the Home's terminal narrates, chapter by chapter. Every line is derived from the dictionary
// the page itself renders (or the influence roster), so the terminal never says anything the page
// does not: it is a narrator, not a second source of content. Pure: plain Node loads it (tests/).
import type { Dict } from '../i18n/types';
import { NARRATIVE_ORDER, type NarrativeChapterId } from './narrative-state.ts';
import { influenceRoster } from './influence-roster.ts';

export interface NarrativeChapter {
  readonly id: NarrativeChapterId;
  /** Typed after the prompt. Code-like and language-independent. */
  readonly command: string;
  /** Printed below the command, one per row. */
  readonly lines: readonly string[];
}

/** Commands are the same in every language: they read as code, not as copy. */
const COMMANDS: Record<NarrativeChapterId, string> = {
  whoami: 'whoami',
  pexiscale: 'open pexiscale',
  lume: 'open lume',
  'pexis-machine': 'open pexis-machine',
  capabilities: 'capabilities',
  'ai-workflow': 'ai-workflow',
  education: 'education',
  influences: 'influences',
  principles: 'principles',
  contact: 'contact',
};

const unique = (xs: readonly string[]) => [...new Set(xs)];

/** The ten chapters, in reading order (NARRATIVE_ORDER). */
export function buildNarrative(dict: Dict): readonly NarrativeChapter[] {
  const r = dict.resume;
  const lines: Record<NarrativeChapterId, readonly string[]> = {
    whoami: ['Guilherme Henrique', r.whoami.role, r.whoami.place],
    pexiscale: [r.work.pexiscale.name, r.work.pexiscale.kind, r.work.pexiscale.stack],
    lume: [r.work.lume.name, r.work.lume.kind, r.work.lume.stack],
    'pexis-machine': [dict.pexisMachine.name, dict.pexisMachine.kind, dict.pexisMachine.body],
    capabilities: r.capabilities.groups.map((g) => g.title),
    'ai-workflow': [r.ai.flow.join(' → ')],
    education: unique([...r.education.items, ...r.coursework.items].map((s) => s.school)),
    influences: influenceRoster.map((p) => p.name),
    principles: dict.principles.items.map((f) => f.title),
    contact: dict.contact.items.map((c) => c.label),
  };
  return NARRATIVE_ORDER.map((id) => ({ id, command: COMMANDS[id], lines: lines[id] }));
}

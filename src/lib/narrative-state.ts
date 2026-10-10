// The Home's narrative terminal, as pure state: which chapter is active, which have been narrated.
// No DOM, no timers, no clock: the controller (src/scripts/narrative-terminal.ts) owns those and
// feeds this module plain values, so every rule here is testable in Node (tests/).

/** The Home's chapters. Closed on purpose: a chapter added here and missing elsewhere is a type error. */
export type NarrativeChapterId =
  | 'whoami'
  | 'pexiscale'
  | 'lume'
  | 'pexis-machine'
  | 'capabilities'
  | 'ai-workflow'
  | 'education'
  | 'influences'
  | 'principles'
  | 'contact';

/** Reading order of the Home. Also the tie-break when two chapters are equally close to the focus. */
export const NARRATIVE_ORDER = [
  'whoami',
  'pexiscale',
  'lume',
  'pexis-machine',
  'capabilities',
  'ai-workflow',
  'education',
  'influences',
  'principles',
  'contact',
] as const satisfies readonly NarrativeChapterId[];

// Every chapter id is in the order (a missing one is a type error).
type Unordered = Exclude<NarrativeChapterId, (typeof NARRATIVE_ORDER)[number]>;
const ordered: [Unordered] extends [never] ? true : Unordered = true;
void ordered;

/** active: the chapter being read. completed: chapters already narrated, in the order they finished. */
export interface NarrativeState {
  readonly active: NarrativeChapterId | null;
  readonly completed: readonly NarrativeChapterId[];
}

export const initialState: NarrativeState = { active: null, completed: [] };

/** Where a chapter's section is on screen, in viewport px (from getBoundingClientRect). */
export interface SectionSample {
  readonly id: NarrativeChapterId;
  readonly top: number;
  readonly bottom: number;
}

const rank = (id: NarrativeChapterId) => NARRATIVE_ORDER.indexOf(id);

/**
 * The chapter being read: the section that contains the focus line (top inclusive, bottom
 * exclusive, so a boundary belongs to the section below it). If none contains it, the section
 * whose nearest edge is closest. Equal candidates resolve by reading order.
 */
export function pickActiveChapter(samples: readonly SectionSample[], focusY: number): NarrativeChapterId | null {
  // Containing the line beats any distance (-1), so a section whose bottom edge sits exactly on the
  // line (distance 0, but not containing) never wins over the one below that does contain it.
  let best: { id: NarrativeChapterId; d: number } | null = null;
  for (const s of samples) {
    const d = focusY >= s.top && focusY < s.bottom ? -1 : Math.min(Math.abs(s.top - focusY), Math.abs(s.bottom - focusY));
    if (!best || d < best.d || (d === best.d && rank(s.id) < rank(best.id))) best = { id: s.id, d };
  }
  return best?.id ?? null;
}

/**
 * Make `next` the active chapter. The previous active chapter is replaced at once, whether or not it
 * finished (a chapter left mid-narration is not completed). A completed chapter is shown, never
 * narrated again. Without motion the chapter is complete the moment it is active.
 */
export function activateChapter(
  state: NarrativeState,
  next: NarrativeChapterId,
  motionEnabled: boolean,
): { state: NarrativeState; shouldAnimate: boolean } {
  if (state.completed.includes(next)) return { state: { ...state, active: next }, shouldAnimate: false };
  if (!motionEnabled) return { state: completeChapter({ ...state, active: next }, next), shouldAnimate: false };
  return { state: { ...state, active: next }, shouldAnimate: true };
}

/** Mark a chapter narrated. Idempotent: completing it twice changes nothing. */
export function completeChapter(state: NarrativeState, id: NarrativeChapterId): NarrativeState {
  if (state.completed.includes(id)) return state;
  return { ...state, completed: [...state.completed, id] };
}

/**
 * What the terminal shows: at most `maxCompleted` of the most recently completed chapters (other than
 * the active one), then the active chapter, last. Never a duplicate; the active chapter is always in.
 */
export function visibleNarrativeIds(state: NarrativeState, maxCompleted: number): readonly NarrativeChapterId[] {
  const past = state.completed.filter((id) => id !== state.active);
  const kept = maxCompleted > 0 ? past.slice(-maxCompleted) : [];
  return state.active ? [...kept, state.active] : kept;
}

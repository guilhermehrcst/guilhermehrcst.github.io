// The résumé as a terminal session: which commands run, in which order, and which of them a scroll
// position executes. Pure: no DOM, no timers. src/scripts/resume-session.ts drives the page with
// it, Resume.astro renders it, and tests/resume-session.test.ts checks it in Node.

/** The prompt every command is shown after. Narrative only: nothing on the page accepts input. */
export const RESUME_PROMPT = 'guilherme@portfolio:~$';

/** The session, in order. Commands read as code, so they are the same in every language. */
export const RESUME_STEPS = [
  { id: 'whoami', command: 'whoami' },
  { id: 'projects', command: 'projects --selected' },
  { id: 'capabilities', command: 'capabilities' },
  { id: 'ai-workflow', command: 'ai-workflow' },
  { id: 'education', command: 'education' },
  { id: 'influences', command: 'influences' },
  { id: 'contact', command: 'contact' },
  { id: 'exit', command: 'exit' },
] as const;

export type ResumeStepId = (typeof RESUME_STEPS)[number]['id'];

/** Typing pace of a command (per character), and the pause before its output starts. */
export const CHAR_MS = 26;
export const OUTPUT_GAP_MS = 140;

/** How long a command takes to type before its output appears. */
export function commandMs(command: string): number {
  return command.length * CHAR_MS + OUTPUT_GAP_MS;
}

/**
 * The reader has reached step `reached` (its command line is on screen, or above it). The session
 * is continuous, so every earlier step that has not run yet is shown at once, already executed
 * (`instant`), and only the reached step is typed (`animate`), unless it already ran. A step never
 * runs twice. Out-of-range indices change nothing.
 */
export function advance(ran: readonly boolean[], reached: number): { instant: number[]; animate: number | null } {
  if (!Number.isInteger(reached) || reached < 0 || reached >= ran.length) return { instant: [], animate: null };
  const instant: number[] = [];
  for (let i = 0; i < reached; i++) if (!ran[i]) instant.push(i);
  return { instant, animate: ran[reached] ? null : reached };
}

// Icons for the AI tools listed in the résumé (section 04). The names live in the i18n
// dictionaries (they are the same in EN and PT); this maps each one to its supplied artwork.
// AiToolName is a closed union and the record is exhaustive: adding a name without an icon,
// or an icon without a name, fails `astro check`.
import chatgpt from '../assets/ai/chatgpt.png';
import claude from '../assets/ai/claude.png';
import gemini from '../assets/ai/gemini.png';
import deepseek from '../assets/ai/deepseek.png';
import claudeCode from '../assets/ai/claude-code.png';
import codex from '../assets/ai/codex.png';
import antigravity from '../assets/ai/google-antigravity.png';
import hermes from '../assets/ai/hermes-agent.png';
import type { AiToolName } from '../i18n/types';

export interface AiIcon {
  src: ImageMetadata;
  /**
   * Optical scale inside the shared icon box (1 = fills the box). Perceived size, not geometry:
   * the artworks differ in density and in how much of their canvas they use.
   */
  scale: number;
}

export const aiIcons: Record<AiToolName, AiIcon> = {
  ChatGPT: { src: chatgpt, scale: 0.96 },
  Claude: { src: claude, scale: 1.04 }, // thin strokes read lighter than the filled marks
  Gemini: { src: gemini, scale: 1.1 }, // a star that uses less of its canvas than the others
  DeepSeek: { src: deepseek, scale: 1.08 }, // a wide, low shape
  'Claude Code': { src: claudeCode, scale: 0.96 }, // a solid block: heavier than its bounding box
  Codex: { src: codex, scale: 1 },
  'Google Antigravity': { src: antigravity, scale: 1.06 }, // short glyph, small in height
  'Hermes Agent': { src: hermes, scale: 0.86 }, // detailed black-and-white illustration: kept a small identifier
};

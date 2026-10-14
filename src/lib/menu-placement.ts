// Where a header menu opens, relative to its button (Global Navigation hotfix). A popover is in the top layer,
// so its own coordinates are the viewport's: the page's script reads the button's box and the stylesheet
// (SiteHeader.astro) turns it into `left`, clamped between the side margins. The only decision made here is
// which edge of the button the panel hangs from: a button in the left half of the page opens its panel from
// its own left edge, one in the right half from its own right edge, so the panel grows toward the middle of
// the page. A pure function: no DOM, so it runs under Node's test runner.

export type MenuAlign = 'start' | 'end';

/** `start`: the panel's left edge follows the button's left edge. `end`: its right edge follows the button's
 *  right edge. Decided by the button's centre against the middle of the viewport. */
export const menuAlign = (box: { left: number; right: number }, viewportWidth: number): MenuAlign =>
  (box.left + box.right) / 2 > viewportWidth / 2 ? 'end' : 'start';

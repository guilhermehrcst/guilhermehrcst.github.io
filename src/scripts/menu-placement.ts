// The header's six menus (SiteHeader.astro): places each popover under its own button. Progressive: the menus
// open, close (Escape, a click outside, following a link) and work from the keyboard and by touch without
// this script, natively; the script only tells the stylesheet where the button is, so the panel opens under
// it. If it never runs, the panel hangs from the right margin under the header (inside the viewport). No
// network, no storage, no dependency; it reads one box and writes three custom properties and one attribute.
import { menuAlign } from '../lib/menu-placement';

if ('showPopover' in HTMLElement.prototype) {
  const panels = [...document.querySelectorAll<HTMLElement>('.site-header .panel[popover]')];
  const buttonOf = (panel: HTMLElement) => document.querySelector<HTMLElement>(`[popovertarget="${panel.id}"]`);

  const place = (panel: HTMLElement): void => {
    const button = buttonOf(panel);
    if (!button) return;
    const box = button.getBoundingClientRect();
    panel.style.setProperty('--anchor-left', `${box.left}px`);
    panel.style.setProperty('--anchor-right', `${box.right}px`);
    panel.style.setProperty('--anchor-bottom', `${box.bottom}px`);
    panel.dataset['align'] = menuAlign(box, document.documentElement.clientWidth);
  };

  for (const panel of panels) {
    // The button's click runs before the popover shows (its activation behaviour comes after the event), and
    // beforetoggle covers any other way of opening it: the panel is placed before it is first painted.
    buttonOf(panel)?.addEventListener('click', () => place(panel));
    panel.addEventListener('beforetoggle', (event) => {
      if ((event as ToggleEvent).newState === 'open') place(panel);
    });
  }

  // The viewport can change while a menu is open (an iPad turned, a window resized): place it again.
  window.addEventListener('resize', () => {
    for (const panel of panels) if (panel.matches(':popover-open')) place(panel);
  });
}

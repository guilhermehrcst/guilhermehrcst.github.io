import { matchesFilterData } from '../lib/course-filter-state';

const roots = document.querySelectorAll<HTMLElement>('[data-course-filters]');

for (const root of roots) {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-learning-resource]')];
  const groups = [...document.querySelectorAll<HTMLElement>('[data-learning-group]')];
  const areas = [...document.querySelectorAll<HTMLDetailsElement>('details[data-learning-area-section]')];
  const empty = document.querySelector<HTMLElement>('[data-filter-empty]');
  const reset = root.querySelector<HTMLButtonElement>('[data-filter-reset]');
  const goalButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter-goal]')];
  const formatButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter-format]')];
  const selectedGoals = new Set<string>();
  const selectedFormats = new Set<string>();

  const apply = () => {
    let visible = 0;
    for (const card of cards) {
      const match = matchesFilterData(
        { goals: card.dataset.goals ?? '', format: card.dataset.format ?? '' },
        [...selectedGoals],
        [...selectedFormats],
      );
      card.hidden = !match;
      if (match) visible += 1;
    }
    for (const group of groups) {
      group.hidden = ![...group.querySelectorAll<HTMLElement>('[data-learning-resource]')].some((card) => !card.hidden);
    }
    const hasActiveFilters = selectedGoals.size > 0 || selectedFormats.size > 0;
    for (const area of areas) {
      const hasVisibleResource = [...area.querySelectorAll<HTMLElement>('[data-learning-resource]')].some((card) => !card.hidden);
      area.hidden = !hasVisibleResource;
      if (hasActiveFilters && hasVisibleResource) area.open = true;
      else if (!hasActiveFilters) area.open = false;
    }
    if (empty) empty.hidden = visible !== 0;
  };

  const wire = (button: HTMLButtonElement, set: Set<string>, value: string) => {
    button.addEventListener('click', () => {
      if (set.has(value)) set.delete(value);
      else set.add(value);
      button.setAttribute('aria-pressed', String(set.has(value)));
      apply();
    });
  };

  for (const button of goalButtons) wire(button, selectedGoals, button.dataset.filterGoal ?? '');
  for (const button of formatButtons) wire(button, selectedFormats, button.dataset.filterFormat ?? '');

  reset?.addEventListener('click', () => {
    selectedGoals.clear();
    selectedFormats.clear();
    for (const button of [...goalButtons, ...formatButtons]) button.setAttribute('aria-pressed', 'false');
    apply();
  });

  root.hidden = false;
}

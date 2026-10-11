export interface FilterData {
  goals: string;
  format: string;
}

export const matchesFilterData = (
  data: FilterData,
  selectedGoals: readonly string[],
  selectedFormats: readonly string[],
): boolean => {
  const goals = data.goals.split(/\s+/).filter(Boolean);
  if (selectedGoals.length > 0 && !selectedGoals.some((goal) => goals.includes(goal))) return false;
  if (selectedFormats.length > 0 && !selectedFormats.includes(data.format)) return false;
  return true;
};

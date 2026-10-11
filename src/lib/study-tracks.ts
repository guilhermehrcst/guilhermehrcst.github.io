export type ExamId = 'enem' | 'uerj';
export type StudyTrackSectionId =
  | 'start' | 'math' | 'languages' | 'writing' | 'nature'
  | 'humanities' | 'foreign-language' | 'recommended' | 'practice';

export interface StudyTrackSectionDefinition {
  id: StudyTrackSectionId;
  resourceIds: readonly string[];
}

export interface StudyTrackDefinition {
  exam: ExamId;
  sections: readonly StudyTrackSectionDefinition[];
}

export const STUDY_TRACK_SECTION_ORDER: readonly StudyTrackSectionId[] = [
  'start', 'math', 'languages', 'writing', 'nature', 'humanities', 'foreign-language', 'recommended', 'practice',
];

export const studyTracks: Record<ExamId, StudyTrackDefinition> = {
  enem: {
    exam: 'enem',
    sections: [
      { id: 'start', resourceIds: [] },
      { id: 'math', resourceIds: ['kultivi-math-enem'] },
      { id: 'languages', resourceIds: ['kultivi-portuguese-enem'] },
      { id: 'writing', resourceIds: ['kultivi-writing-enem'] },
      { id: 'nature', resourceIds: ['kultivi-physics-enem', 'kultivi-chemistry-enem', 'kultivi-biology-enem'] },
      { id: 'humanities', resourceIds: ['kultivi-history-enem', 'kultivi-geography-enem', 'kultivi-philosophy-enem', 'kultivi-sociology-enem'] },
      { id: 'foreign-language', resourceIds: ['kultivi-english-enem', 'kultivi-spanish-enem'] },
      { id: 'recommended', resourceIds: [] },
      { id: 'practice', resourceIds: ['inep-writing-2026'] },
    ],
  },
  uerj: {
    exam: 'uerj',
    sections: [
      { id: 'start', resourceIds: [] },
      { id: 'math', resourceIds: ['uerj-math-practice'] },
      { id: 'languages', resourceIds: ['uerj-portuguese-practice'] },
      { id: 'writing', resourceIds: [] },
      { id: 'nature', resourceIds: ['uerj-physics-practice'] },
      { id: 'humanities', resourceIds: ['uerj-history-practice', 'uerj-geography-practice'] },
      { id: 'foreign-language', resourceIds: ['uerj-spanish-practice'] },
      { id: 'recommended', resourceIds: [] },
      { id: 'practice', resourceIds: ['uerj-writing-practice'] },
    ],
  },
};

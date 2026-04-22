export const DIMENSIONS = [
  {
    key: 'clarity',
    label: 'Clarity',
    blurb: 'Unambiguous product intent.',
    framework: 'PEEM',
  },
  {
    key: 'specificity',
    label: 'Specificity',
    blurb: 'Concrete, measurable features.',
    framework: 'PEEM',
  },
  {
    key: 'completeness',
    label: 'Completeness',
    blurb: 'Users, data, flows, errors covered.',
    framework: 'ISO 25010',
  },
  {
    key: 'feasibility',
    label: 'Feasibility',
    blurb: 'Realistic to ship as described.',
    framework: 'ISO 25010',
  },
  {
    key: 'userContext',
    label: 'User Context',
    blurb: 'Target persona & use-case defined.',
    framework: 'PRD 2026',
  },
  {
    key: 'technicalContext',
    label: 'Tech Context',
    blurb: 'Stack, platform, constraints stated.',
    framework: 'PRD 2026',
  },
  {
    key: 'scopeBoundaries',
    label: 'Scope',
    blurb: 'Explicit in-scope vs out-of-scope.',
    framework: 'PRD 2026',
  },
  {
    key: 'successCriteria',
    label: 'Success Criteria',
    blurb: 'Testable acceptance / KPIs.',
    framework: 'PRD 2026',
  },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]['key'];

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export type Evaluation = {
  scores: Record<DimensionKey | 'overall', number>;
  feedback: Record<DimensionKey | 'overall', string>;
  reasoning: Record<DimensionKey, string>;
  overallScore: number;
  grade: Grade;
  topStrength: string;
  topWeakness: string;
};

export interface GeneratedPromptSection {
  heading: string;
  body: string;
}

export interface GeneratedPrompt {
  title: string;
  summary: string;
  prompt: string;
  sections: GeneratedPromptSection[];
  suggestedTechStack: string[];
  acceptanceCriteria: string[];
}

export type EvalSource = 'gemini' | 'heuristic';

export interface HistoryItem {
  id: string;
  requirements: string;
  targetPlatform?: string;
  grade: Grade;
  overallScore: number;
  hasPrompt: boolean;
  evaluationSource?: EvalSource;
  promptSource?: EvalSource;
  createdAt: string;
}

export interface HistoryRecord {
  id: string;
  requirements: string;
  targetPlatform?: string;
  evaluation: Evaluation;
  evaluationSource?: EvalSource;
  generatedPrompt: GeneratedPrompt | null;
  promptSource?: EvalSource;
  createdAt: string;
}

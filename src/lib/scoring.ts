export type ScoreTier = 'strong' | 'fair' | 'weak';

export function scoreTier(score: number): ScoreTier {
  if (score >= 8) return 'strong';
  if (score >= 5) return 'fair';
  return 'weak';
}

export function tierText(tier: ScoreTier): string {
  switch (tier) {
    case 'strong':
      return 'text-term-ok';
    case 'fair':
      return 'text-term-warn';
    default:
      return 'text-term-err';
  }
}

export function tierGlyph(tier: ScoreTier): string {
  switch (tier) {
    case 'strong':
      return '✓';
    case 'fair':
      return '∆';
    default:
      return '✗';
  }
}

export function gradeColor(grade: string): string {
  if (grade === 'A') return 'text-ember';
  if (grade === 'B') return 'text-ember-hi';
  if (grade === 'C') return 'text-term-warn';
  if (grade === 'D') return 'text-term-warn';
  return 'text-term-err';
}

export function scoreBar(score: number, width = 10): string {
  const filled = Math.round((score / 10) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

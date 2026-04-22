import { useState } from 'react';
import { DIMENSIONS, type DimensionKey, type Evaluation } from '../types';
import { gradeColor, scoreBar, scoreTier, tierGlyph, tierText } from '../lib/scoring';

function LoadingSkeleton() {
  return (
    <section className="term-frame">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5 text-xs">
        <span className="animate-pulse-ring text-ember">●</span>
        <span className="text-fg-dim">[eval]</span>
        <span className="text-fg">evaluating 8 dimensions…</span>
      </header>
      <div className="space-y-3 p-5 text-sm text-fg-dim sm:p-6">
        {[
          '→ parsing requirements',
          '→ g-eval chain-of-thought · clarity',
          '→ g-eval chain-of-thought · specificity',
          '→ g-eval chain-of-thought · completeness',
          '→ g-eval chain-of-thought · feasibility',
          '→ g-eval chain-of-thought · userContext',
          '→ g-eval chain-of-thought · technicalContext',
          '→ g-eval chain-of-thought · scopeBoundaries',
          '→ g-eval chain-of-thought · successCriteria',
          '→ composing overall verdict',
        ].map((line, i) => (
          <div
            key={i}
            className="flex items-start gap-2 opacity-0"
            style={{ animation: `typein 0.25s ease-out ${i * 80}ms forwards` }}
          >
            <span className="text-ember">{i % 3 === 0 ? '⠿' : '·'}</span>
            <span className="break-words">{line}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

interface DimensionRowProps {
  dim: (typeof DIMENSIONS)[number];
  score: number;
  feedback: string;
  reasoning: string;
  index: number;
}

function DimensionRow({ dim, score, feedback, reasoning, index }: DimensionRowProps) {
  const [open, setOpen] = useState(false);
  const tier = scoreTier(score);
  const tone = tierText(tier);
  const glyph = tierGlyph(tier);
  const bar = scoreBar(score);

  return (
    <article className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group w-full px-3 py-3 text-left transition-colors hover:bg-bg-hover sm:px-4"
        aria-expanded={open}
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 text-sm tabular sm:grid-cols-[auto_140px_minmax(0,1fr)_auto] sm:items-center">
          <span className="w-6 text-xs text-fg-mute">{String(index + 1).padStart(2, '0')}</span>
          <span className="min-w-0 break-words text-fg">
            {dim.label.toLowerCase().replace(/\s+/g, '-')}
          </span>
          <span
            className={`score-bar col-start-2 row-start-2 min-w-0 overflow-hidden text-[10px] ${tone} sm:col-auto sm:row-auto sm:text-xs`}
          >
            {bar}
          </span>
          <span className="col-start-3 row-start-1 row-span-2 flex items-center gap-2 justify-self-end text-xs sm:col-auto sm:row-auto sm:row-span-1">
            <span className={tone}>{glyph}</span>
            <span className={`${tone} tabular w-8 text-right`}>
              {score}
              <span className="text-fg-mute">/10</span>
            </span>
            <span
              className={`text-fg-mute transition-all group-hover:text-ember ${
                open ? 'rotate-90' : ''
              }`}
            >
              ▸
            </span>
          </span>
        </div>
        <div className="mt-0.5 ml-9 break-words text-xs text-fg-mute sm:ml-[29px]">
          <span className="text-fg-faint">// {dim.framework}</span>
          <span className="mx-2 text-fg-faint">·</span>
          <span>{dim.blurb}</span>
        </div>
      </button>
      {open && (
        <div className="space-y-3 border-t border-border bg-bg-input/50 px-3 pb-4 pl-3 text-sm sm:px-4 sm:pl-[45px]">
          <div className="pt-3">
            <div className="mb-1 text-xs text-fg-mute">
              <span className="text-ember">→</span> reasoning (g-eval chain-of-thought)
            </div>
            <p className="leading-relaxed text-fg-dim">
              {reasoning || <span className="text-fg-mute">no reasoning returned.</span>}
            </p>
          </div>
          <div>
            <div className="mb-1 text-xs text-fg-mute">
              <span className="text-ember">→</span> fix
            </div>
            <p className="leading-relaxed text-fg">
              {feedback || <span className="text-fg-mute">no feedback returned.</span>}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

interface Props {
  evaluation: Evaluation | null;
  loading: boolean;
}

export default function EvaluationResults({ evaluation, loading }: Props) {
  if (loading) return <LoadingSkeleton />;
  if (!evaluation) return null;

  const { scores, feedback, reasoning, overallScore, grade, topStrength, topWeakness } =
    evaluation;
  const gradeTone = gradeColor(grade);

  return (
    <section className="term-frame">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5 text-xs">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-ember">●</span>
          <span className="text-fg-dim">[eval]</span>
          <span className="text-fg">result</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-fg-mute tabular">
          <span>8 dims</span>
          <span className="text-fg-faint">·</span>
          <span>peem + iso-25010</span>
        </div>
      </header>

      <div className="grid grid-cols-1 border-b border-border md:grid-cols-[minmax(220px,auto)_1fr]">
        <div className="flex min-w-0 flex-col items-center justify-center bg-bg-input/40 px-4 py-5 md:border-r md:border-border md:px-6 md:py-6">
          <div className="mb-1 text-xs text-fg-mute">overall grade</div>
          <div className={`text-[72px] font-light leading-none tabular sm:text-[92px] ${gradeTone}`}>
            {grade}
          </div>
          <div className="mt-2 text-sm text-fg-dim tabular">
            <span className={gradeTone}>{overallScore}</span>
            <span className="text-fg-mute">/10</span>
          </div>
          <div className={`score-bar mt-3 max-w-full overflow-hidden text-xs ${gradeTone}`}>
            {scoreBar(overallScore)}
          </div>
        </div>

        <div className="space-y-4 p-4 text-sm sm:p-5">
          {feedback.overall && (
            <div>
              <div className="mb-1 text-xs text-fg-mute">
                <span className="text-ember">→</span> summary
              </div>
              <p className="leading-relaxed text-fg">{feedback.overall}</p>
            </div>
          )}
          {topStrength && (
            <div>
              <div className="mb-1 text-xs text-fg-mute">
                <span className="text-term-ok">✓</span> strongest dimension
              </div>
              <p className="leading-relaxed text-fg-dim">{topStrength}</p>
            </div>
          )}
          {topWeakness && (
            <div>
              <div className="mb-1 text-xs text-fg-mute">
                <span className="text-term-err">✗</span> biggest gap — fix this first
              </div>
              <p className="leading-relaxed text-fg-dim">{topWeakness}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-border px-4 py-2 text-xs text-fg-mute">
        <span className="text-ember">→</span> dimension scores · click any row to expand reasoning
      </div>

      <div className="reveal">
        {DIMENSIONS.map((dim, i) => (
          <DimensionRow
            key={dim.key}
            dim={dim}
            index={i}
            score={scores?.[dim.key as DimensionKey] ?? 0}
            feedback={feedback?.[dim.key as DimensionKey] ?? ''}
            reasoning={reasoning?.[dim.key as DimensionKey] ?? ''}
          />
        ))}
      </div>
    </section>
  );
}

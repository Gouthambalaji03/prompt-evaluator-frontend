import { useState } from 'react';
import { DIMENSIONS, type DimensionKey, type Evaluation } from '../types';
import { gradeColor, scoreBar, scoreTier, tierGlyph, tierText } from '../lib/scoring';

function LoadingSkeleton() {
  return (
    <section className="term-frame">
      <header className="px-4 py-2.5 border-b border-border text-xs flex items-center gap-3">
        <span className="text-ember animate-pulse-ring">●</span>
        <span className="text-fg-dim">[eval]</span>
        <span className="text-fg">evaluating 8 dimensions…</span>
      </header>
      <div className="p-6 space-y-3 text-sm text-fg-dim">
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
            className="flex items-center gap-2 opacity-0"
            style={{ animation: `typein 0.25s ease-out ${i * 80}ms forwards` }}
          >
            <span className="text-ember">{i % 3 === 0 ? '⠿' : '·'}</span>
            <span>{line}</span>
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
        className="w-full text-left px-4 py-3 hover:bg-bg-hover transition-colors group"
        aria-expanded={open}
      >
        <div className="grid grid-cols-[auto_140px_1fr_auto] items-center gap-3 text-sm tabular">
          <span className="text-fg-mute text-xs w-6">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-fg">
            {dim.label.toLowerCase().replace(/\s+/g, '-')}
          </span>
          <span className={`score-bar text-xs ${tone}`}>{bar}</span>
          <span className="flex items-center gap-2 text-xs">
            <span className={tone}>{glyph}</span>
            <span className={`${tone} tabular w-8 text-right`}>
              {score}
              <span className="text-fg-mute">/10</span>
            </span>
            <span
              className={`text-fg-mute group-hover:text-ember transition-all ${
                open ? 'rotate-90' : ''
              }`}
            >
              ▸
            </span>
          </span>
        </div>
        <div className="text-xs text-fg-mute mt-0.5 ml-[29px]">
          <span className="text-fg-faint">// {dim.framework}</span>
          <span className="mx-2 text-fg-faint">·</span>
          <span>{dim.blurb}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pl-[45px] text-sm space-y-3 border-t border-border bg-bg-input/50">
          <div className="pt-3">
            <div className="text-xs text-fg-mute mb-1">
              <span className="text-ember">→</span> reasoning (g-eval chain-of-thought)
            </div>
            <p className="text-fg-dim leading-relaxed">
              {reasoning || <span className="text-fg-mute">no reasoning returned.</span>}
            </p>
          </div>
          <div>
            <div className="text-xs text-fg-mute mb-1">
              <span className="text-ember">→</span> fix
            </div>
            <p className="text-fg leading-relaxed">
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
      <header className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-ember">●</span>
          <span className="text-fg-dim">[eval]</span>
          <span className="text-fg">result</span>
        </div>
        <div className="flex items-center gap-2 text-fg-mute tabular">
          <span>8 dims</span>
          <span className="text-fg-faint">·</span>
          <span>peem + iso-25010</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] border-b border-border">
        <div className="px-6 py-6 md:border-r border-border flex flex-col items-center justify-center min-w-[220px] bg-bg-input/40">
          <div className="text-xs text-fg-mute mb-1">overall grade</div>
          <div className={`text-[92px] leading-none font-light tabular ${gradeTone}`}>
            {grade}
          </div>
          <div className="mt-2 tabular text-sm text-fg-dim">
            <span className={gradeTone}>{overallScore}</span>
            <span className="text-fg-mute">/10</span>
          </div>
          <div className={`mt-3 score-bar text-xs ${gradeTone}`}>{scoreBar(overallScore)}</div>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {feedback.overall && (
            <div>
              <div className="text-xs text-fg-mute mb-1">
                <span className="text-ember">→</span> summary
              </div>
              <p className="text-fg leading-relaxed">{feedback.overall}</p>
            </div>
          )}
          {topStrength && (
            <div>
              <div className="text-xs text-fg-mute mb-1">
                <span className="text-term-ok">✓</span> strongest dimension
              </div>
              <p className="text-fg-dim leading-relaxed">{topStrength}</p>
            </div>
          )}
          {topWeakness && (
            <div>
              <div className="text-xs text-fg-mute mb-1">
                <span className="text-term-err">✗</span> biggest gap — fix this first
              </div>
              <p className="text-fg-dim leading-relaxed">{topWeakness}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-2 border-b border-border text-xs text-fg-mute">
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

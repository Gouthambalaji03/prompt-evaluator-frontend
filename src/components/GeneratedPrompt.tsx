import { useState } from 'react';
import type { GeneratedPrompt as GeneratedPromptType } from '../types';

function LoadingSkeleton() {
  const lines = [
    '→ loading evaluation context',
    '→ resolving tech stack decisions',
    '→ drafting data models',
    '→ designing api surface',
    '→ writing acceptance criteria',
    '→ composing final markdown',
  ];

  return (
    <section className="term-frame">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5 text-xs">
        <span className="animate-pulse-ring text-ember">●</span>
        <span className="text-fg-dim">[gen]</span>
        <span className="text-fg">compiling build specification…</span>
      </header>
      <div className="space-y-3 p-5 text-sm text-fg-dim sm:p-6">
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex items-start gap-2 opacity-0"
            style={{ animation: `typein 0.25s ease-out ${i * 120}ms forwards` }}
          >
            <span className="text-ember">{i % 2 === 0 ? '⠿' : '·'}</span>
            <span className="break-words">{line}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

interface Props {
  generatedPrompt: GeneratedPromptType | null;
  loading: boolean;
  onGenerate: () => void;
  hasEvaluation: boolean;
}

export default function GeneratedPrompt({
  generatedPrompt,
  loading,
  onGenerate,
  hasEvaluation,
}: Props) {
  const [view, setView] = useState<'sections' | 'prompt'>('sections');
  const [copied, setCopied] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (loading) return <LoadingSkeleton />;

  if (!generatedPrompt) {
    if (!hasEvaluation) return null;
    return (
      <section className="term-frame">
        <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5 text-xs">
          <span className="text-ember">●</span>
          <span className="text-fg-dim">[gen]</span>
          <span className="text-fg">ready</span>
        </header>
        <div className="space-y-4 p-5 text-sm sm:p-6">
          <div className="comment-line text-fg-dim">
            Send requirements + evaluation back through Gemini. Output:
            production-grade build prompt — stack, data models, api surface,
            acceptance criteria.
          </div>
          <div className="text-xs text-fg-mute">
            <span className="text-ember">$</span> gemini generate --from-evaluation
          </div>
          <button
            type="button"
            onClick={onGenerate}
            className="btn-primary w-full justify-center sm:w-auto"
          >
            <span>▸</span>
            generate build prompt
          </button>
        </div>
      </section>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — no-op
    }
  };

  return (
    <section className="term-frame">
      <header className="flex flex-col gap-3 border-b border-border px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-ember">●</span>
          <span className="text-fg-dim">[gen]</span>
          <span className="min-w-0 break-words text-fg">
            {generatedPrompt.title.toLowerCase().replace(/\s+/g, '-')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="flex border border-border">
            {(['sections', 'prompt'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  view === mode ? 'bg-ember text-bg' : 'text-fg-dim hover:text-ember'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="btn-term min-h-[34px] justify-center px-3 py-1 text-xs"
          >
            {copied ? (
              <>
                <span className="text-term-ok">✓</span> copied
              </>
            ) : (
              <>
                <span>⏘</span> copy
              </>
            )}
          </button>
        </div>
      </header>

      <div className="space-y-3 border-b border-border px-4 py-4 sm:px-5 sm:py-5">
        <div>
          <div className="mb-1 text-xs text-fg-mute">
            <span className="text-ember">→</span> title
          </div>
          <h3 className="break-words text-lg text-fg">{generatedPrompt.title}</h3>
        </div>
        <div>
          <div className="mb-1 text-xs text-fg-mute">
            <span className="text-ember">→</span> summary
          </div>
          <p className="text-sm leading-relaxed text-fg-dim">{generatedPrompt.summary}</p>
        </div>
        {(generatedPrompt.suggestedTechStack?.length ?? 0) > 0 && (
          <div>
            <div className="mb-2 text-xs text-fg-mute">
              <span className="text-ember">→</span> tech-stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {generatedPrompt.suggestedTechStack.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 border border-border bg-ember/5 px-2 py-0.5 text-xs text-ember"
                >
                  <span className="text-ember/60">#</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {view === 'sections' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="border-r-0 border-border lg:border-r">
            <div className="border-b border-border px-4 py-2 text-xs text-fg-mute">
              <span className="text-ember">→</span> sections ({generatedPrompt.sections?.length ?? 0})
            </div>
            {(generatedPrompt.sections || []).map((section, i) => {
              const open = openIndex === i;
              return (
                <article key={i} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-hover"
                  >
                    <span className="w-6 shrink-0 text-xs text-fg-mute tabular">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-sm text-fg">
                      {section.heading}
                    </span>
                    <span
                      className={`text-xs text-fg-mute transition-transform ${
                        open ? 'rotate-90 text-ember' : ''
                      }`}
                    >
                      ▸
                    </span>
                  </button>
                  {open && (
                    <div className="border-t border-border bg-bg-input/40 px-4 pb-4 pl-4 sm:pl-[45px]">
                      <pre className="break-words pt-3 text-sm leading-relaxed text-fg-dim whitespace-pre-wrap">
                        {section.body}
                      </pre>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="border-t border-border px-4 py-4 lg:border-t-0">
            <div className="mb-3 text-xs text-fg-mute">
              <span className="text-ember">→</span> acceptance-criteria
            </div>
            <ol className="space-y-2.5 text-sm">
              {(generatedPrompt.acceptanceCriteria || []).map((c, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="pt-0.5 text-xs text-term-ok">[ ]</span>
                  <span className="leading-relaxed text-fg-dim">{c}</span>
                </li>
              ))}
              {(!generatedPrompt.acceptanceCriteria ||
                generatedPrompt.acceptanceCriteria.length === 0) && (
                <li className="text-xs text-fg-mute">no criteria returned.</li>
              )}
            </ol>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="mb-2 text-xs text-fg-mute">
            <span className="text-ember">$</span> cat build-prompt.md
          </div>
          <div className="max-h-[70vh] overflow-auto border border-border bg-bg-input p-4 sm:max-h-[640px]">
            <pre className="break-words text-sm leading-relaxed text-fg whitespace-pre-wrap">
              {generatedPrompt.prompt}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}

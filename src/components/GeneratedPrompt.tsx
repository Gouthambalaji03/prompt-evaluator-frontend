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
      <header className="px-4 py-2.5 border-b border-border text-xs flex items-center gap-3">
        <span className="text-ember animate-pulse-ring">●</span>
        <span className="text-fg-dim">[gen]</span>
        <span className="text-fg">compiling build specification…</span>
      </header>
      <div className="p-6 space-y-3 text-sm text-fg-dim">
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex items-center gap-2 opacity-0"
            style={{ animation: `typein 0.25s ease-out ${i * 120}ms forwards` }}
          >
            <span className="text-ember">{i % 2 === 0 ? '⠿' : '·'}</span>
            <span>{line}</span>
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
        <header className="px-4 py-2.5 border-b border-border text-xs flex items-center gap-3">
          <span className="text-ember">●</span>
          <span className="text-fg-dim">[gen]</span>
          <span className="text-fg">ready</span>
        </header>
        <div className="p-6 text-sm space-y-4">
          <div className="text-fg-dim comment-line">
            Send requirements + evaluation back through Gemini. Output: production-grade build prompt — stack, data models, api surface, acceptance criteria.
          </div>
          <div className="text-fg-mute text-xs">
            <span className="text-ember">$</span> gemini generate --from-evaluation
          </div>
          <button type="button" onClick={onGenerate} className="btn-primary">
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
      <header className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-ember">●</span>
          <span className="text-fg-dim">[gen]</span>
          <span className="text-fg truncate">{generatedPrompt.title.toLowerCase().replace(/\s+/g, '-')}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex border border-border">
            {(['sections', 'prompt'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  view === mode
                    ? 'bg-ember text-bg'
                    : 'text-fg-dim hover:text-ember'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleCopy} className="btn-term text-xs py-1">
            {copied ? (
              <>
                <span className="text-term-ok">✓</span> copied
              </>
            ) : (
              <>
                <span>⎘</span> copy
              </>
            )}
          </button>
        </div>
      </header>

      <div className="px-5 py-5 border-b border-border space-y-3">
        <div>
          <div className="text-xs text-fg-mute mb-1">
            <span className="text-ember">→</span> title
          </div>
          <h3 className="text-fg text-lg">{generatedPrompt.title}</h3>
        </div>
        <div>
          <div className="text-xs text-fg-mute mb-1">
            <span className="text-ember">→</span> summary
          </div>
          <p className="text-fg-dim text-sm leading-relaxed">{generatedPrompt.summary}</p>
        </div>
        {(generatedPrompt.suggestedTechStack?.length ?? 0) > 0 && (
          <div>
            <div className="text-xs text-fg-mute mb-2">
              <span className="text-ember">→</span> tech-stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {generatedPrompt.suggestedTechStack.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border border-border text-xs text-ember bg-ember/5"
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
          <div className="border-r-0 lg:border-r border-border">
            <div className="px-4 py-2 border-b border-border text-xs text-fg-mute">
              <span className="text-ember">→</span> sections ({generatedPrompt.sections?.length ?? 0})
            </div>
            {(generatedPrompt.sections || []).map((section, i) => {
              const open = openIndex === i;
              return (
                <article key={i} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors"
                  >
                    <span className="text-fg-mute text-xs tabular w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-fg text-sm">{section.heading}</span>
                    <span
                      className={`text-fg-mute text-xs transition-transform ${
                        open ? 'rotate-90 text-ember' : ''
                      }`}
                    >
                      ▸
                    </span>
                  </button>
                  {open && (
                    <div className="px-4 pb-4 pl-[45px] border-t border-border bg-bg-input/40">
                      <pre className="text-fg-dim text-sm leading-relaxed whitespace-pre-wrap break-words pt-3">
                        {section.body}
                      </pre>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="px-4 py-4">
            <div className="text-xs text-fg-mute mb-3">
              <span className="text-ember">→</span> acceptance-criteria
            </div>
            <ol className="space-y-2.5 text-sm">
              {(generatedPrompt.acceptanceCriteria || []).map((c, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-term-ok text-xs pt-0.5">[ ]</span>
                  <span className="text-fg-dim leading-relaxed">{c}</span>
                </li>
              ))}
              {(!generatedPrompt.acceptanceCriteria ||
                generatedPrompt.acceptanceCriteria.length === 0) && (
                <li className="text-fg-mute text-xs">no criteria returned.</li>
              )}
            </ol>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="text-xs text-fg-mute mb-2">
            <span className="text-ember">$</span> cat build-prompt.md
          </div>
          <div className="bg-bg-input border border-border p-4 max-h-[640px] overflow-auto">
            <pre className="text-fg text-sm leading-relaxed whitespace-pre-wrap break-words">
              {generatedPrompt.prompt}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}

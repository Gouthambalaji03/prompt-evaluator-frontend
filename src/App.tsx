import { useCallback, useEffect, useMemo, useState } from 'react';
import RequirementsInput from './components/RequirementsInput';
import EvaluationResults from './components/EvaluationResults';
import GeneratedPrompt from './components/GeneratedPrompt';
import SourceBadge from './components/SourceBadge';
import {
  evaluateRequirements,
  generatePrompt,
  fetchHealth,
} from './lib/api';
import type {
  Evaluation,
  EvalSource,
  GeneratedPrompt as GeneratedPromptType,
} from './types';

const BANNER = [
  '  ____                            _     _____            _             _             ',
  ' |  _ \\ _ __ ___  _ __ ___  _ __ | |_  | ____|_   ____ _| |_   _  __ _| |_ ___  _ __ ',
  " | |_) | '__/ _ \\| '_ ` _ \\| '_ \\| __| |  _| \\ \\ / / _` | | | | |/ _` | __/ _ \\| '__|",
  ' |  __/| | | (_) | | | | | | |_) | |_  | |___ \\ V / (_| | | |_| | (_| | || (_) | |   ',
  ' |_|   |_|  \\___/|_| |_| |_| .__/ \\__| |_____| \\_/ \\__,_|_|\\__,_|\\__,_|\\__\\___/|_|   ',
  '                           |_|                                                       ',
];

export default function App() {
  const [requirements, setRequirements] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluationSource, setEvaluationSource] = useState<EvalSource | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPromptType | null>(null);
  const [promptSource, setPromptSource] = useState<EvalSource | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [evaluating, setEvaluating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [model, setModel] = useState('gemini');
  const [backendOnline, setBackendOnline] = useState(true);
  const [mongoOnline, setMongoOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .then((h) => {
        if (cancelled) return;
        setModel(h.model);
        setMongoOnline(Boolean(h.mongo));
        setBackendOnline(true);
      })
      .catch(() => {
        if (!cancelled) {
          setBackendOnline(false);
          setMongoOnline(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clockText = useMemo(
    () =>
      now
        .toISOString()
        .replace('T', ' ')
        .replace(/\..*/, '') + ' UTC',
    [now],
  );

  const handleEvaluate = useCallback(async () => {
    if (requirements.trim().length < 10) return;
    setError('');
    setEvaluating(true);
    setGeneratedPrompt(null);
    setPromptSource(null);
    try {
      const res = await evaluateRequirements({
        requirements: requirements.trim(),
        targetPlatform: targetPlatform || undefined,
      });
      setEvaluation(res.evaluation);
      setEvaluationSource(res.source);
      setActiveId(res.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'evaluation failed';
      setError(msg);
      setEvaluation(null);
      setEvaluationSource(null);
    } finally {
      setEvaluating(false);
    }
  }, [requirements, targetPlatform]);

  const handleGenerate = useCallback(async () => {
    if (!evaluation || requirements.trim().length < 10) return;
    setError('');
    setGenerating(true);
    try {
      const res = await generatePrompt({
        id: activeId,
        requirements: requirements.trim(),
        targetPlatform: targetPlatform || undefined,
        evaluation,
      });
      setGeneratedPrompt(res.generatedPrompt);
      setPromptSource(res.source);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'generation failed';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }, [activeId, evaluation, requirements, targetPlatform]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleEvaluate();
      }
      if (e.key === 'Escape') {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
          active.blur();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleEvaluate]);

  return (
    <div className="relative min-h-screen bg-bg text-fg">
      <div className="scanlines" aria-hidden="true" />
      <div className="crt-glow" aria-hidden="true" />

      <div className="relative z-10 min-h-screen">
        <main className="mx-auto w-full max-w-[1100px] px-3 py-5 pb-28 sm:px-8 sm:py-6 sm:pb-20 lg:px-12 lg:py-8">
          <div className="mb-6 flex flex-col items-start gap-2 border-b border-border pb-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-center gap-3">
              <span className="text-ember">❯</span>
              <span className="text-fg">prompt-evaluator</span>
              <span className="text-fg-mute">~/</span>
            </div>
            <div className="flex w-full items-center justify-between gap-3 text-fg-mute tabular sm:w-auto sm:justify-end">
              <span className="hidden sm:inline">{clockText}</span>
              <span className="text-fg-faint">·</span>
              <span className={mongoOnline ? 'text-term-ok' : 'text-term-warn'}>
                {mongoOnline ? '● mongo' : '○ mongo'}
              </span>
            </div>
          </div>

          <div className="mb-3 overflow-hidden no-select">
            <pre className="ascii-head text-[clamp(4px,1.45vw,12px)] leading-[1.1] text-ember">
              {BANNER.join('\n')}
            </pre>
          </div>
          <div className="ember-rule mb-6" aria-hidden="true" />

          <div className="mb-10 max-w-2xl text-sm text-fg-dim">
            <p className="comment-line">
              A terminal for evaluating product requirements with an 8-dimension rubric
              grounded in PEEM (arXiv 2603.10477) and ISO/IEC 25010 · powered by Gemini.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-mute">
              <span>
                <span className="text-ember">$</span> help
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-fg-dim">⌘↵</span>
                <span>run evaluation</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-fg-dim">esc</span>
                <span>blur input</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-fg-dim">click row</span>
                <span>expand reasoning</span>
              </span>
            </div>
          </div>

          {error && (
            <div className="term-frame mb-6 border-term-err/60">
              <div className="flex items-center gap-3 border-b border-term-err/40 bg-term-err/5 px-4 py-2 text-xs">
                <span className="text-term-err">✗</span>
                <span className="text-term-err">[error]</span>
                <span className="text-fg-dim">uncaught</span>
              </div>
              <div className="p-4 text-sm text-fg">
                <span className="text-term-err">→ </span>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-8">
            <RequirementsInput
              requirements={requirements}
              setRequirements={setRequirements}
              targetPlatform={targetPlatform}
              setTargetPlatform={setTargetPlatform}
              onEvaluate={handleEvaluate}
              loading={evaluating}
            />

            {(evaluating || evaluation) && (
              <div className="space-y-2">
                {evaluation && evaluationSource && (
                  <SourceBadge source={evaluationSource} label="evaluation" />
                )}
                <EvaluationResults evaluation={evaluation} loading={evaluating} />
              </div>
            )}

            {evaluation && (
              <div className="space-y-2">
                {generatedPrompt && promptSource && (
                  <SourceBadge source={promptSource} label="prompt" />
                )}
                <GeneratedPrompt
                  generatedPrompt={generatedPrompt}
                  loading={generating}
                  onGenerate={handleGenerate}
                  hasEvaluation={!!evaluation}
                />
              </div>
            )}
          </div>

          <footer className="mt-16 flex flex-col gap-2 border-t border-border pt-4 text-xs text-fg-mute sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span>
              <span className="text-ember">$</span> exit
              <span className="cursor-thin" />
            </span>
            <span className="tabular">mern · typescript · gemini · peem v1</span>
          </footer>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg-elev/95 backdrop-blur-[2px]">
        <div className="flex flex-col gap-2 px-3 py-2 text-xs tabular sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <span className={backendOnline ? 'text-ember' : 'text-term-err'}>●</span>
            <span className="text-fg-dim">
              {evaluationSource === 'heuristic' ? 'heuristic' : model}
            </span>
            {evaluationSource === 'heuristic' && (
              <span className="hidden text-term-warn sm:inline">· offline fallback</span>
            )}
            <span className="hidden text-fg-faint sm:inline">·</span>
            <span className={`${mongoOnline ? 'text-term-ok' : 'text-fg-mute'} hidden sm:inline`}>
              mongo:{mongoOnline ? 'online' : 'offline'}
            </span>
            <span className="hidden text-fg-faint md:inline">·</span>
            <span className="hidden text-fg-mute md:inline">
              {!backendOnline
                ? 'api offline'
                : evaluating
                ? 'evaluating'
                : generating
                ? 'generating'
                : 'idle'}
            </span>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-fg-mute sm:justify-end">
            <span>
              <kbd className="text-fg-dim">⌘↵</kbd> run
            </span>
            <span className="hidden text-fg-faint sm:inline">·</span>
            <span className="hidden sm:inline">
              <kbd className="text-fg-dim">esc</kbd> blur
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

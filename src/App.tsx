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
  ' | |_) | \'__/ _ \\| \'_ ` _ \\| \'_ \\| __| |  _| \\ \\ / / _` | | | | |/ _` | __/ _ \\| \'__|',
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
        if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) active.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleEvaluate]);

  return (
    <div className="min-h-screen bg-bg text-fg relative">
      <div className="scanlines" aria-hidden="true" />
      <div className="crt-glow" aria-hidden="true" />

      <div className="min-h-screen relative z-10">
        <main className="px-4 sm:px-8 lg:px-12 py-6 lg:py-8 pb-20 max-w-[1100px] w-full mx-auto">
          {/* Top tmux-style status line */}
          <div className="flex items-center justify-between gap-3 border-b border-border pb-2 mb-6 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-ember">❯</span>
              <span className="text-fg">prompt-evaluator</span>
              <span className="text-fg-mute">~/</span>
            </div>
            <div className="flex items-center gap-3 text-fg-mute tabular">
              <span className="hidden sm:inline">{clockText}</span>
              <span className="text-fg-faint">·</span>
              <span className={mongoOnline ? 'text-term-ok' : 'text-term-warn'}>
                {mongoOnline ? '● mongo' : '○ mongo'}
              </span>
            </div>
          </div>

          {/* ASCII banner */}
          <div className="mb-3 no-select overflow-hidden">
            <pre className="ascii-head text-ember text-[10px] sm:text-[11px] lg:text-[12px] leading-[1.1]">
              {BANNER.join('\n')}
            </pre>
          </div>
          <div className="ember-rule mb-6" aria-hidden="true" />

          <div className="mb-10 text-sm text-fg-dim max-w-2xl">
            <p className="comment-line">
              A terminal for evaluating product requirements with an 8-dimension rubric grounded in PEEM (arXiv 2603.10477) and ISO/IEC 25010 · powered by Gemini.
            </p>
            <p className="mt-2 text-xs text-fg-mute">
              <span className="text-ember">$</span> help
              <span className="text-fg-dim ml-4">⌘↵</span>
              <span className="text-fg-mute ml-2">run evaluation</span>
              <span className="text-fg-dim ml-4">esc</span>
              <span className="text-fg-mute ml-2">blur input</span>
              <span className="text-fg-dim ml-4">click row</span>
              <span className="text-fg-mute ml-2">expand reasoning</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 term-frame border-term-err/60">
              <div className="px-4 py-2 border-b border-term-err/40 text-xs flex items-center gap-3 bg-term-err/5">
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

          <footer className="mt-16 pt-4 border-t border-border text-xs text-fg-mute flex flex-wrap items-center justify-between gap-3">
            <span>
              <span className="text-ember">$</span> exit
              <span className="cursor-thin" />
            </span>
            <span className="tabular">mern · typescript · gemini · peem v1</span>
          </footer>
        </main>
      </div>

      {/* Bottom status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg-elev/95 backdrop-blur-[2px]">
        <div className="flex items-center justify-between gap-4 px-4 py-1.5 text-xs tabular">
          <div className="flex items-center gap-3 min-w-0">
            <span className={backendOnline ? 'text-ember' : 'text-term-err'}>●</span>
            <span className="text-fg-dim">
              {evaluationSource === 'heuristic' ? 'heuristic' : model}
            </span>
            {evaluationSource === 'heuristic' && (
              <span className="text-term-warn hidden sm:inline">· offline fallback</span>
            )}
            <span className="text-fg-faint hidden sm:inline">·</span>
            <span className={`${mongoOnline ? 'text-term-ok' : 'text-fg-mute'} hidden sm:inline`}>
              mongo:{mongoOnline ? 'online' : 'offline'}
            </span>
            <span className="text-fg-faint hidden md:inline">·</span>
            <span className="text-fg-mute hidden md:inline">
              {!backendOnline
                ? 'api offline'
                : evaluating
                ? 'evaluating'
                : generating
                ? 'generating'
                : 'idle'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-fg-mute shrink-0">
            <span>
              <kbd className="text-fg-dim">⌘↵</kbd> run
            </span>
            <span className="text-fg-faint hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              <kbd className="text-fg-dim">esc</kbd> blur
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

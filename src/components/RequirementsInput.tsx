const PLATFORMS = [
  { value: '', label: 'any (general)' },
  { value: 'Web (SPA)', label: 'web/spa' },
  { value: 'Web (SSR)', label: 'web/ssr' },
  { value: 'Mobile (iOS + Android)', label: 'mobile/ios+android' },
  { value: 'Desktop (Electron)', label: 'desktop/electron' },
  { value: 'CLI tool', label: 'cli' },
  { value: 'Browser extension', label: 'browser-ext' },
  { value: 'Backend service / API only', label: 'api-only' },
];

const EXAMPLE =
  'A small web app where dog owners log daily walks — distance, duration, mood. Weekly chart view. Public shareable profile page per dog. Users auth via email magic-link. Target platform: web (SPA).';

interface Props {
  requirements: string;
  setRequirements: (v: string) => void;
  targetPlatform: string;
  setTargetPlatform: (v: string) => void;
  onEvaluate: () => void;
  loading: boolean;
}

export default function RequirementsInput({
  requirements,
  setRequirements,
  targetPlatform,
  setTargetPlatform,
  onEvaluate,
  loading,
}: Props) {
  const charCount = requirements.length;
  const wordCount = requirements.trim() ? requirements.trim().split(/\s+/).length : 0;
  const canSubmit = requirements.trim().length >= 10 && !loading;

  return (
    <section className="term-frame-primary">
      <div className="space-y-5 p-4 sm:p-6">
        <div>
          <div className="mb-1.5 break-words text-sm text-fg-dim">
            <span className="text-ember">$</span>{' '}
            <span className="text-fg">prompt-evaluator</span>{' '}
            <span className="text-fg-dim">describe</span>{' '}
            <span className="text-fg-mute">--format=free-text</span>
          </div>
          <div className="comment-line mb-3 text-sm text-fg-dim">
            Describe what you want to build. Be specific — name users, flows, data,
            constraints.
          </div>
        </div>

        <div className="term-frame-hi bg-bg-input px-4 py-3 transition-colors focus-within:border-ember">
          <div className="flex items-start gap-2">
            <span
              className={`shrink-0 select-none pt-[2px] font-medium text-ember ${
                loading ? 'animate-pulse-ring' : ''
              }`}
            >
              ❯
            </span>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              disabled={loading}
              rows={8}
              placeholder={EXAMPLE}
              className="term-textarea"
              aria-label="Product requirements"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3 text-xs sm:items-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-mute tabular">
            <span>{wordCount} words</span>
            <span className="text-fg-faint">·</span>
            <span>{charCount} chars</span>
            {charCount > 0 && charCount < 10 && (
              <>
                <span className="text-fg-faint">·</span>
                <span className="text-term-err">minimum 10 chars</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-fg-dim">
            {charCount === 0 ? (
              <button
                type="button"
                onClick={() => setRequirements(EXAMPLE)}
                className="transition-colors hover:text-ember"
              >
                [load example]
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRequirements('')}
                disabled={loading}
                className="transition-colors hover:text-ember disabled:opacity-50"
              >
                [clear]
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 border-t border-border pt-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="block min-w-0">
            <span className="mb-1.5 block text-xs text-fg-mute">--target-platform</span>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              disabled={loading}
              className="term-select disabled:opacity-50"
            >
              {PLATFORMS.map((m) => (
                <option key={m.value} value={m.value} className="bg-bg">
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onEvaluate}
            disabled={!canSubmit}
            className="btn-primary w-full justify-center sm:w-auto"
            title="Run evaluation  ⌘↵"
          >
            {loading ? (
              <>
                <span className="animate-pulse-ring">⠿</span>
                evaluating…
              </>
            ) : (
              <>
                <span>▸</span>
                run evaluation
                <span className="text-xs opacity-60">⌘↵</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

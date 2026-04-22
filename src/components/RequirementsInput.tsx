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
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="text-sm text-fg-dim mb-1.5">
            <span className="text-ember">$</span>{' '}
            <span className="text-fg">prompt-evaluator</span>{' '}
            <span className="text-fg-dim">describe</span>{' '}
            <span className="text-fg-mute">--format=free-text</span>
          </div>
          <div className="text-fg-dim text-sm mb-3 comment-line">
            Describe what you want to build. Be specific — name users, flows, data, constraints.
          </div>
        </div>

        <div className="term-frame-hi px-4 py-3 bg-bg-input focus-within:border-ember transition-colors">
          <div className="flex gap-2 items-start">
            <span
              className={`text-ember shrink-0 select-none pt-[2px] font-medium ${
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

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-fg-mute tabular">
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
                className="hover:text-ember transition-colors"
              >
                [load example]
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRequirements('')}
                disabled={loading}
                className="hover:text-ember transition-colors disabled:opacity-50"
              >
                [clear]
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end pt-2 border-t border-border">
          <label className="block">
            <span className="block text-xs text-fg-mute mb-1.5">
              --target-platform
            </span>
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
            className="btn-primary"
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
                <span className="opacity-60 text-xs">⌘↵</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import type { HistoryItem } from '../types';
import { gradeColor } from '../lib/scoring';

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(str: string, n: number) {
  if (!str) return '';
  return str.length > n ? `${str.slice(0, n).trimEnd()}…` : str;
}

interface Props {
  history: HistoryItem[];
  activeId: string | null;
  persistent: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function HistorySidebar({
  history,
  activeId,
  persistent,
  onSelect,
  onDelete,
  onRefresh,
}: Props) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="lg:hidden fixed bottom-16 right-4 z-30 btn-term bg-bg-elev"
        aria-expanded={open}
      >
        <span className="text-ember">≡</span>
        {open ? 'close' : `sessions [${history.length}]`}
      </button>

      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-[320px] bg-bg-elev border-l border-border z-20 flex flex-col
          ${open ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 transition-transform duration-200`}
        aria-label="Session history"
      >
        <header className="px-4 py-2.5 border-b border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={persistent ? 'text-term-ok' : 'text-fg-mute'}>●</span>
            <span className="text-fg-dim">sessions</span>
            <span className="text-fg-mute tabular">[{history.length}]</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="text-fg-mute hover:text-ember transition-colors"
            title="Refresh"
          >
            ↻
          </button>
        </header>

        <div className="px-4 py-3 border-b border-border text-xs text-fg-mute">
          {persistent ? (
            <div className="flex items-center gap-2">
              <span className="text-term-ok">●</span>
              <span>mongodb connected · persisted</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-term-warn">∆</span>
              <span>mongodb offline · ephemeral mode</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!persistent ? (
            <div className="p-4 text-xs text-fg-dim leading-relaxed">
              <span className="comment-line">
                Start MongoDB and press refresh to enable persistent session history. Evaluations still work without it — they just aren&rsquo;t saved.
              </span>
            </div>
          ) : history.length === 0 ? (
            <div className="p-4 text-xs text-fg-dim leading-relaxed">
              <span className="comment-line">
                No sessions yet. Run an evaluation to start the log.
              </span>
            </div>
          ) : (
            <ul>
              {history.map((entry, idx) => {
                const isActive = entry.id === activeId;
                return (
                  <li key={entry.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(entry.id);
                        setOpen(false);
                      }}
                      className={`w-full text-left p-4 border-b border-border transition-colors ${
                        isActive ? 'bg-bg-hover' : 'hover:bg-bg-hover/50'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1.5 text-xs">
                        <span className="text-fg-mute tabular">
                          {isActive ? <span className="text-ember">❯</span> : ' '} #{String(history.length - idx).padStart(3, '0')}
                        </span>
                        <span className="text-fg-mute tabular">
                          {formatTime(entry.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 border border-border text-sm tabular font-medium ${gradeColor(
                            entry.grade,
                          )}`}
                        >
                          {entry.grade}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-fg-dim leading-relaxed line-clamp-3">
                            {truncate(entry.requirements, 120)}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-fg-mute">
                            <span className="tabular">{entry.overallScore}/10</span>
                            {entry.hasPrompt && (
                              <>
                                <span className="text-fg-faint">·</span>
                                <span className="text-ember">✓ prompt</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this session?')) onDelete(entry.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-fg-mute hover:text-term-err"
                      title="Delete session"
                    >
                      ✗
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="px-4 py-2 border-t border-border text-xs text-fg-mute">
          <span className="text-ember">$</span> tail -f sessions.log
        </footer>
      </aside>

      {open && (
        <div
          onClick={toggle}
          className="lg:hidden fixed inset-0 bg-black/70 z-10"
          aria-hidden="true"
        />
      )}
    </>
  );
}

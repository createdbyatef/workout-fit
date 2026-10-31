import React from 'react';
import type { WorkoutSession } from '../types/workout';
import { WORKOUT_MODE_LABELS } from '../types/workout';
import { formatMMSS, formatSplitTime, formatTotalDuration, formatSessionDate } from '../utils/formatTime';
import { Trophy, Clock, Zap, RotateCcw, ListOrdered, Share2, Check } from 'lucide-react';

interface SummaryProps {
  session: WorkoutSession;
  onRestart: () => void;
}

export const Summary: React.FC<SummaryProps> = ({ session, onRestart }) => {
  const [copied, setCopied] = React.useState(false);
  const modeLabel = WORKOUT_MODE_LABELS[session.workoutMode || 'amrap'];

  const avgSecondsPerSet = session.totalSets > 0
    ? Math.round(session.actualDurationSeconds / session.totalSets)
    : 0;

  const fastestSplit = session.splits.length > 0
    ? [...session.splits].sort((a, b) => a.splitSeconds - b.splitSeconds)[0]
    : null;

  const handleShare = async () => {
    const shareText = `💪 Workout Done: ${session.workoutName} (${modeLabel})
⏱ Time: ${formatTotalDuration(session.actualDurationSeconds)}
🔥 Total Sets: ${session.totalSets} sets
⚡ Avg per Set: ${formatSplitTime(avgSecondsPerSet)}
#SetCounter #${modeLabel}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Set Counter — ${session.workoutName}`, text: shareText });
      } catch {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="screen-panel summary-panel mx-auto flex flex-col safe-top safe-bottom justify-between">
      <div className="space-y-5">
        {/* Trophy Header */}
        <div className="text-center pt-2">
          <div className="w-16 h-16 rounded-3xl bg-ink-blue/10 border border-ink-blue/20 text-ink-blue flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Trophy className="w-9 h-9 stroke-[2.2]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-ink-blue/10 text-ink-blue mb-1">
            <span>{modeLabel}</span>
            <span>•</span>
            <span>Completed</span>
          </div>
          <h1 className="font-condensed font-black text-3xl sm:text-4xl text-ink-dark uppercase tracking-tight">
            {session.workoutName}
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">{formatSessionDate(session.timestamp)}</p>
        </div>

        {/* Big Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-board-card border border-board-border rounded-2xl p-4 text-center shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block mb-1">Total Sets</span>
            <div className="font-condensed font-black text-5xl text-ink-dark leading-none my-1">{session.totalSets}</div>
            <span className="text-xs font-semibold text-ink-muted">Sets Completed</span>
          </div>

          <div className="bg-board-card border border-board-border rounded-2xl p-4 text-center shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block mb-1">Actual Time</span>
            <div className="font-condensed font-black text-4xl text-ink-blue leading-none my-2">{formatMMSS(session.actualDurationSeconds)}</div>
            <span className="text-xs font-semibold text-ink-muted">of {formatTotalDuration(session.plannedDurationSeconds)}</span>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink-muted font-medium">
              <Clock className="w-4 h-4 text-ink-blue" />
              Average per Set
            </span>
            <span className="font-condensed font-bold text-lg text-ink-dark">
              {session.totalSets > 0 ? formatSplitTime(avgSecondsPerSet) : '—'}
            </span>
          </div>

          {fastestSplit && (
            <div className="flex items-center justify-between text-sm pt-2 border-t border-board-border">
              <span className="flex items-center gap-2 text-ink-muted font-medium">
                <Zap className="w-4 h-4 text-ink-blue" />
                Fastest Set (#{fastestSplit.setNumber})
              </span>
              <span className="font-condensed font-bold text-lg text-success">
                {formatSplitTime(fastestSplit.splitSeconds)}
              </span>
            </div>
          )}
        </div>

        {/* Splits Breakdown */}
        <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-board-border text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span className="flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-ink-blue" />
              All Split Times
            </span>
            <span>{session.splits.length} Sets</span>
          </div>

          <div className="mt-2 max-h-48 overflow-y-auto divide-y divide-board-border/60">
            {session.splits.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-4">No sets were recorded.</p>
            ) : (
              session.splits.map((split) => {
                const isFastest = fastestSplit && split.setNumber === fastestSplit.setNumber;
                return (
                  <div
                    key={split.setNumber}
                    className={`flex items-center justify-between py-2 text-sm px-1 ${isFastest ? 'bg-ink-blue/10 rounded-lg px-2 my-0.5' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-ink-blue/10 text-ink-blue font-condensed font-bold text-sm flex items-center justify-center">
                        #{split.setNumber}
                      </span>
                      <span className="font-semibold text-ink-dark">{formatSplitTime(split.splitSeconds)}</span>
                      {isFastest && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/20 px-1.5 py-0.5 rounded">
                          Fastest
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink-muted">@ {formatMMSS(split.cumulativeSeconds)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-4">
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-3 px-4 bg-board-card border border-board-border hover:bg-board text-ink-main font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue"
        >
          {copied ? (
            <><Check className="w-4 h-4 text-success" /><span className="text-success font-bold">Copied to Clipboard!</span></>
          ) : (
            <><Share2 className="w-4 h-4 text-ink-blue" /><span>Share Result</span></>
          )}
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-4 px-6 bg-ink-blue hover:bg-ink-dark active:scale-[0.98] text-white font-condensed font-black text-2xl uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink-blue/40"
        >
          <RotateCcw className="w-6 h-6" />
          Start Again
        </button>
      </div>
    </div>
  );
};

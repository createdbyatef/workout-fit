import React from 'react';
import type { WorkoutSession } from '../types/workout';
import { WORKOUT_MODE_LABELS } from '../types/workout';
import { formatSessionDate, formatTotalDuration, formatSplitTime } from '../utils/formatTime';
import { History as HistoryIcon, Dumbbell, Calendar, Clock, Trophy, Trash2 } from 'lucide-react';

interface HistoryProps {
  sessions: WorkoutSession[];
  onClearHistory: () => void;
}

export const History: React.FC<HistoryProps> = ({ sessions, onClearHistory }) => {
  const [showConfirmClear, setShowConfirmClear] = React.useState(false);

  return (
    <div className="w-full mt-8 pt-6 border-t border-board-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-ink-blue" />
          <h2 className="font-condensed text-xl font-bold tracking-wide uppercase text-ink-main">
            Workout Sessions
          </h2>
        </div>
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowConfirmClear(true)}
            className="text-xs text-ink-muted hover:text-marker-red transition-colors flex items-center gap-1 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marker-red"
            title="Clear all history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {showConfirmClear && (
        <div className="mb-4 p-3 bg-marker-red/10 border border-marker-red/30 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="text-marker-red font-medium">Delete all {sessions.length} sessions?</span>
          <div className="flex gap-2">
            <button
              onClick={() => { onClearHistory(); setShowConfirmClear(false); }}
              className="px-2.5 py-1 bg-marker-red text-white font-semibold rounded-lg hover:bg-marker-red-hover transition-colors"
            >
              Yes, Clear
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-2.5 py-1 bg-board text-ink-main rounded-lg hover:bg-board-border transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="bg-board-card border border-dashed border-board-border rounded-2xl p-6 text-center text-ink-muted">
          <Dumbbell className="w-8 h-8 mx-auto mb-2 text-ink-muted/50" />
          <p className="text-sm font-medium">No sessions yet.</p>
          <p className="text-xs mt-1 text-ink-muted/80">Complete your first workout to see it here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, idx) => {
            const avgTime = session.totalSets > 0
              ? formatSplitTime(session.actualDurationSeconds / session.totalSets)
              : '0s';

            return (
              <div
                key={session.id || idx}
                className="bg-board-card border border-board-border rounded-xl p-3.5 shadow-sm hover:shadow transition-shadow flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-condensed font-bold text-lg text-ink-dark truncate">{session.workoutName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-ink-blue/10 text-ink-blue">
                      {WORKOUT_MODE_LABELS[session.workoutMode || 'amrap']}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted/70" />
                      {formatSessionDate(session.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-ink-muted/70" />
                      {formatTotalDuration(session.actualDurationSeconds)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-center justify-end gap-1.5">
                    <Trophy className="w-4 h-4 text-ink-blue" />
                    <span className="font-condensed text-2xl font-black text-ink-main">{session.totalSets}</span>
                    <span className="text-xs font-semibold text-ink-muted uppercase">sets</span>
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    Avg: <span className="font-medium text-ink-dark">{avgTime}</span>/set
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


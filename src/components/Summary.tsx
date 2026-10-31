import React from 'react';
import './Workout.css';
import type { WorkoutSession } from '../types/workout';
import { WORKOUT_MODE_LABELS } from '../types/workout';
import { formatMMSS, formatSplitTime, formatTotalDuration, formatSessionDate } from '../utils/formatTime';
import { Trophy, Clock, Zap, ArrowUpRight, ListOrdered, Share2, Check } from 'lucide-react';

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
    <div className="screen-panel summary-panel performance-summary mx-auto safe-top safe-bottom">
      <div className="result-heading">
        <div className="result-trophy"><Trophy size={32} strokeWidth={1.6} /></div>
        <span className="result-eyebrow"><Check size={13} /> SESSION IN THE BOOKS</span>
        <h1>EFFORT IN.<br /><span>RESULTS OUT.</span></h1>
        <p>{session.workoutName} <span aria-hidden="true">/</span> {modeLabel}</p>
        <span className="result-date">{formatSessionDate(session.timestamp)}</span>
      </div>

      <div className="result-stats">
        <div className="result-stat result-stat-primary">
          <span>SETS COMPLETED</span>
          <strong>{String(session.totalSets).padStart(2, '0')}<span>SETS</span></strong>
          <span>Every set counts.</span>
        </div>
        <div className="result-stat">
          <span><Clock size={14} /> SESSION TIME</span>
          <strong className={formatMMSS(session.actualDurationSeconds).length > 5 ? 'long-time' : undefined}>{formatMMSS(session.actualDurationSeconds)}</strong>
          <span>of {formatTotalDuration(session.plannedDurationSeconds)} planned</span>
        </div>
      </div>

      <div className="result-insights">
        <div><span><Clock size={16} /> Average per set</span><strong>{session.totalSets > 0 ? formatSplitTime(avgSecondsPerSet) : '—'}</strong></div>
        <div><span><Zap size={16} /> Fastest set{fastestSplit ? ` · #${fastestSplit.setNumber}` : ''}</span><strong>{fastestSplit ? formatSplitTime(fastestSplit.splitSeconds) : '—'}</strong></div>
      </div>

      <section className="result-splits" aria-labelledby="result-splits-title">
        <div className="result-section-heading"><h2 id="result-splits-title"><ListOrdered size={16} /> YOUR SPLITS</h2><span>{session.splits.length} recorded</span></div>
        <div className="result-split-list">
          {session.splits.length === 0 ? <p className="result-empty">No sets recorded. Your session time is saved.</p> : session.splits.map(split => {
            const isFastest = fastestSplit?.setNumber === split.setNumber;
            return <div key={split.setNumber} className={`result-split ${isFastest ? 'fastest' : ''}`}>
              <span className="result-set-index">{String(split.setNumber).padStart(2, '0')}</span>
              <strong>{formatSplitTime(split.splitSeconds)}</strong>
              {isFastest && <span className="fastest-tag"><Zap size={11} /> Fastest</span>}
              <span className="result-cumulative">{formatMMSS(split.cumulativeSeconds)} elapsed</span>
            </div>;
          })}
        </div>
      </section>

      <div className="result-actions">
        <button type="button" onClick={handleShare} className="result-share">
          {copied ? <><Check size={18} /><span>Copied to Clipboard!</span></> : <><Share2 size={18} /><span>Share Result</span></>}
        </button>
        <button type="button" onClick={onRestart} className="result-restart">Back to Dashboard <ArrowUpRight size={19} /></button>
      </div>
      <p className="result-footer">SHOW UP. PUT IN WORK. REPEAT.</p>
    </div>
  );
};

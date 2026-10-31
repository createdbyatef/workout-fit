import type { ReactNode } from 'react';

interface TimerDialProps {
  value: string;
  label: string;
  progress: number;
  paused: boolean;
  urgent?: boolean;
  badge?: ReactNode;
}

/** The ring always reflects the actual overall session progress. */
export function TimerDial({ value, label, progress, paused, urgent = false, badge }: TimerDialProps) {
  const boundedProgress = Math.max(0, Math.min(100, progress));
  return (
    <div className={`timer-dial ${paused ? 'is-paused' : ''} ${urgent ? 'is-urgent' : ''}`}>
      <svg className="timer-dial-track" viewBox="0 0 280 280" aria-hidden="true">
        <circle className="dial-guide" cx="140" cy="140" r="132" />
        <circle className="dial-rail" cx="140" cy="140" r="122" />
        <circle className="dial-progress" cx="140" cy="140" r="122" pathLength="100"
          strokeDasharray="100" strokeDashoffset={100 - boundedProgress} />
      </svg>
      <div className="timer-dial-content">
        <span className={`timer-state ${paused ? 'paused' : ''}`}>
          <span aria-hidden="true" />{paused ? 'Session paused' : badge || 'Session live'}
        </span>
        <span className={`timer-dial-value ${value.length > 5 ? 'long-time' : ''}`} aria-label={`${label}: ${value}`}>{value}</span>
        <span className="timer-dial-label">{label}</span>
      </div>
      <div className="dial-progress-caption" role="progressbar" aria-label="Session progress"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={boundedProgress}>
        {boundedProgress}% COMPLETE
      </div>
    </div>
  );
}

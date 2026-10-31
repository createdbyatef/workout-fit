import { FinishDialog } from './FinishDialog';
import { TimerDial } from './TimerDial';
import './Workout.css';
import React, { useState, useRef, useEffect } from 'react';
import type { WorkoutSplit, EmomConfig } from '../types/workout';
import type { TimerControls } from '../hooks/useTimer';
import { formatMMSS, formatSplitTime } from '../utils/formatTime';
import { triggerHaptic, playSetBeep } from '../utils/feedback';
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  Eye,
  Volume2,
  VolumeX,
  ListOrdered,
  Repeat,
} from 'lucide-react';

interface EmomRunningProps {
  workoutName: string;
  config: EmomConfig;
  timer: TimerControls;
  splits: WorkoutSplit[];
  onAddSet: () => void;
  onFinishSession: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  wakeLockActive: boolean;
}

export const EmomRunning: React.FC<EmomRunningProps> = ({
  workoutName,
  config,
  timer,
  splits,
  onAddSet,
  onFinishSession,
  soundEnabled,
  onToggleSound,
  wakeLockActive,
}) => {
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const splitListRef = useRef<HTMLDivElement>(null);

  // ── Derive round from elapsed time ───────────────────────────────────────
  const actualTotalRounds = Math.floor((config.totalMinutes * 60) / config.intervalSeconds);
  const currentRound = Math.min(actualTotalRounds, Math.floor(timer.elapsedTime / config.intervalSeconds) + 1);
  const timeInInterval = timer.elapsedTime % config.intervalSeconds;
  const intervalTimeLeft = config.intervalSeconds - timeInInterval;

  const totalSets = splits.length;
  const totalDuration = config.totalMinutes * 60;
  const progressRatio = Math.min(1, Math.max(0, timer.elapsedTime / totalDuration));
  const progressPercent = Math.round(progressRatio * 100);

  // ── Interval start sound (beep on new round) ────────────────────────────
  const prevRoundRef = useRef(currentRound);
  useEffect(() => {
    if (prevRoundRef.current !== currentRound && currentRound > 1) {
      prevRoundRef.current = currentRound;
      if (soundEnabled) playSetBeep();
      triggerHaptic(60);
    }
  }, [currentRound, soundEnabled]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSetDone = () => {
    triggerHaptic(50);
    if (soundEnabled) playSetBeep();
    onAddSet();
    if (splitListRef.current) splitListRef.current.scrollTop = 0;
  };

  const handlePauseResume = () => {
    triggerHaptic(35);
    if (timer.isPaused) timer.resume();
    else timer.pause();
  };

  return (
    <div className="screen-panel timer-panel performance-timer mx-auto flex flex-col safe-top safe-bottom justify-between">
      {/* Top Bar */}
      <div className="space-y-3">
        <div className="workout-topbar flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink-blue flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              EMOM
            </span>
            <h1 className="font-condensed font-black text-2xl text-ink-dark truncate leading-tight">{workoutName}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Interval indicator */}
            <div className="px-2.5 py-1 rounded-lg bg-ink-blue/10 text-ink-blue text-xs font-bold">
              Interval {currentRound} / {actualTotalRounds}
            </div>

            {/* Wake lock indicator */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                wakeLockActive
                  ? 'bg-success/10 text-success'
                  : 'bg-board-card text-ink-muted border border-board-border'
              }`}
              title={wakeLockActive ? 'Screen stays on' : 'Screen may sleep'}
            >
              <Eye className="w-3 h-3" />
            </div>

            {/* Sound toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-ink-blue/10 border-ink-blue/30 text-ink-blue'
                  : 'bg-board-card border-board-border text-ink-muted'
              }`}
              aria-label={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="timer-stage">
          <TimerDial value={formatMMSS(intervalTimeLeft)} label="Left in interval"
            progress={progressPercent} paused={timer.isPaused} urgent={intervalTimeLeft <= 5} />
          <div className="timer-stage-meta"><span>Remaining <strong>{formatMMSS(timer.timeRemaining)}</strong></span><span>Interval <strong>{currentRound} / {actualTotalRounds}</strong></span></div>
        </div>

        {/* Sets Counter */}
        <div className="session-set-count bg-board-card border border-board-border rounded-2xl p-3 flex items-center justify-between px-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">Sets Done</span>
            <span className="text-xs text-ink-muted/80">
              {totalSets === 0
                ? 'No sets yet'
                : `Last set: ${formatSplitTime(splits[splits.length - 1]?.splitSeconds || 0)}`}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span key={totalSets} className="set-number font-condensed font-black text-5xl text-ink-blue leading-none">{totalSets}</span>
            <span className="font-condensed text-xl font-bold uppercase text-ink-muted">SETS</span>
          </div>
        </div>
      </div>

      {/* Split List */}
      <div className="split-feed my-3 flex-1 min-h-[120px] max-h-[170px] flex flex-col bg-board-card border border-board-border rounded-2xl p-3 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-board-border text-xs font-bold uppercase tracking-wider text-ink-muted">
          <span className="flex items-center gap-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-ink-blue" />
            Splits
          </span>
          <span>{totalSets} Recorded</span>
        </div>

        <div ref={splitListRef} className="flex-1 overflow-y-auto divide-y divide-board-border/60 py-1 pr-1">
          {splits.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-ink-muted/80 py-4 text-center">
              Tap &quot;Set Done!&quot; when you finish your reps each interval!
            </div>
          ) : (
            [...splits].reverse().map((split) => (
              <div key={split.setNumber} className="flex items-center justify-between text-sm py-1.5 px-1 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-ink-blue/10 text-ink-blue font-condensed font-bold text-base flex items-center justify-center">
                    #{split.setNumber}
                  </span>
                  <span className="font-semibold text-ink-main">{formatSplitTime(split.splitSeconds)}</span>
                </div>
                <span className="text-xs text-ink-muted font-medium">
                  @ {formatMMSS(split.cumulativeSeconds)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="session-actions space-y-3 pt-1">
        {/* BIG Set Done button */}
        <button
          type="button"
          onClick={handleSetDone}
          disabled={timer.isPaused || !timer.isRunning}
          className="set-action w-full min-h-[120px] sm:min-h-[130px] bg-ink-blue hover:bg-ink-dark active:bg-ink-blue active:scale-[0.98] text-white rounded-2xl shadow-lg border-2 border-white/20 transition-all flex flex-col items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marker-red/50 cursor-pointer select-none touch-manipulation"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            <span className="font-condensed font-black text-4xl sm:text-5xl uppercase tracking-wider drop-shadow-sm">
              Set Done!
            </span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest set-action-hint">
            Tap When You Finish Your Reps
          </span>
        </button>

        {/* Secondary Controls */}
        <div className="grid grid-cols-2 gap-2">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={handlePauseResume}
            className="py-3 px-2 rounded-xl border border-board-border bg-board-card text-ink-main hover:bg-board active:scale-95 shadow-sm font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue"
          >
            {timer.isPaused ? (
              <><Play className="w-4 h-4 text-success fill-current" /><span className="text-success font-extrabold">Resume</span></>
            ) : (
              <><Pause className="w-4 h-4 text-amber-500 fill-current" /><span>Pause</span></>
            )}
          </button>

          {/* Finish */}
          <button
            type="button"
            onClick={() => setShowConfirmFinish(true)}
            className="py-3 px-2 rounded-xl border border-marker-red/30 bg-marker-red/10 text-marker-red hover:bg-marker-red hover:text-white active:scale-95 shadow-sm font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marker-red"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Finish</span>
          </button>
        </div>
      </div>

      {showConfirmFinish && (
        <FinishDialog onCancel={() => setShowConfirmFinish(false)}
          onConfirm={() => { setShowConfirmFinish(false); onFinishSession(); }}>
          Finish this EMOM workout and log your <strong>{totalSets} set{totalSets !== 1 ? 's' : ''}</strong>?
        </FinishDialog>
      )}
    </div>
  );
};

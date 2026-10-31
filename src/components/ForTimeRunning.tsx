import React, { useState, useRef, useEffect } from 'react';
import type { WorkoutSplit, ForTimeConfig } from '../types/workout';
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
  Target,
  Clock,
} from 'lucide-react';

interface ForTimeRunningProps {
  workoutName: string;
  config: ForTimeConfig;
  timer: TimerControls;
  splits: WorkoutSplit[];
  onAddSet: () => void;
  onFinishSession: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  wakeLockActive: boolean;
}

export const ForTimeRunning: React.FC<ForTimeRunningProps> = ({
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
  const finishRef = useRef(onFinishSession);
  useEffect(() => { finishRef.current = onFinishSession; }, [onFinishSession]);

  const totalSets = splits.length;
  const targetReached = totalSets >= config.targetSets;
  const progressRatio = Math.min(1, Math.max(0, totalSets / config.targetSets));
  const progressPercent = Math.round(progressRatio * 100);

  // ── Auto-finish when target reached ──────────────────────────────────────
  useEffect(() => {
    if (splits.length >= config.targetSets && timer.isRunning) {
      const t = setTimeout(() => finishRef.current(), 1500);
      return () => clearTimeout(t);
    }
  }, [splits.length, config.targetSets, timer.isRunning]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSetDone = () => {
    if (targetReached) return;
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
    <div className="screen-panel timer-panel mx-auto flex flex-col safe-top safe-bottom justify-between">
      {/* Top Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink-blue flex items-center gap-1">
              <Clock className="w-3 h-3" />
              For Time
            </span>
            <h1 className="font-condensed font-black text-2xl text-ink-dark truncate leading-tight">{workoutName}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Target indicator */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ink-blue/10 text-ink-blue text-xs font-bold">
              <Target className="w-3 h-3" />
              {config.targetSets} sets
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

        {/* Timer Card */}
        <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm text-center relative overflow-hidden">
          {/* Progress bar (based on sets) */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-board-border/40">
            <div
              className={`h-full transition-all duration-300 ease-linear ${targetReached ? 'bg-success' : 'bg-ink-blue'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {timer.isPaused && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1 animate-pulse">
              <Pause className="w-3.5 h-3.5" />
              Paused
            </div>
          )}

          {/* Target reached celebration */}
          {targetReached && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-success text-white font-bold text-sm uppercase tracking-wider mb-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              Target Reached!
            </div>
          )}

          {/* Elapsed time label */}
          <div className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
            Elapsed Time
          </div>

          {/* Big COUNT-UP timer */}
          <div
            className={`font-condensed font-black tracking-tight select-none ${
              targetReached ? 'text-success' : 'text-ink-dark'
            }`}
            style={{ fontSize: 'clamp(4.5rem, 18vw, 6.5rem)', lineHeight: 0.95 }}
          >
            {formatMMSS(timer.elapsedTime)}
          </div>

          <div className="flex items-center justify-between text-xs text-ink-muted mt-2 px-2 font-medium">
            <span>Sets: {totalSets} / {config.targetSets}</span>
            <span>Progress: {progressPercent}%</span>
          </div>
        </div>

        {/* Sets Counter */}
        <div className="bg-board-card border border-board-border rounded-2xl p-3 flex items-center justify-between px-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">Sets Progress</span>
            <span className="text-xs text-ink-muted/80">
              {totalSets === 0
                ? 'No sets yet'
                : `Last set: ${formatSplitTime(splits[splits.length - 1]?.splitSeconds || 0)}`}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-condensed font-black text-5xl leading-none ${targetReached ? 'text-success' : 'text-ink-blue'}`}>
              {totalSets}
            </span>
            <span className="font-condensed text-xl font-bold uppercase text-ink-muted">/ {config.targetSets}</span>
          </div>
        </div>
      </div>

      {/* Split List */}
      <div className="my-3 flex-1 min-h-[120px] max-h-[170px] flex flex-col bg-board-card border border-board-border rounded-2xl p-3 overflow-hidden shadow-sm">
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
              Race to finish {config.targetSets} sets as fast as possible!
            </div>
          ) : (
            [...splits].reverse().map((split) => (
              <div key={split.setNumber} className="flex items-center justify-between text-sm py-1.5 px-1 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg font-condensed font-bold text-base flex items-center justify-center ${
                    split.setNumber === config.targetSets
                      ? 'bg-success/10 text-success'
                      : 'bg-ink-blue/10 text-ink-blue'
                  }`}>
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
      <div className="space-y-3 pt-1">
        {/* BIG Set Done button */}
        <button
          type="button"
          onClick={handleSetDone}
          disabled={targetReached || timer.isPaused || !timer.isRunning}
          className={`set-action w-full min-h-[120px] sm:min-h-[130px] rounded-2xl shadow-lg border-2 border-white/20 transition-all flex flex-col items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 select-none touch-manipulation ${
            targetReached
              ? 'bg-success/30 text-success cursor-not-allowed'
              : 'bg-ink-blue hover:bg-ink-dark active:bg-ink-blue active:scale-[0.98] text-white cursor-pointer focus-visible:ring-marker-red/50'
          }`}
        >
          {targetReached ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                <span className="font-condensed font-black text-4xl sm:text-5xl uppercase tracking-wider drop-shadow-sm">
                  Done!
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                Target Reached — Finishing...
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                <span className="font-condensed font-black text-4xl sm:text-5xl uppercase tracking-wider drop-shadow-sm">
                  Set Done!
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/90">
                {totalSets + 1} of {config.targetSets} — Tap Every Set
              </span>
            </>
          )}
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

      {/* Confirm Finish Modal */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-board-card border border-board-border rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-marker-red/10 text-marker-red flex items-center justify-center mx-auto">
              <Square className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="font-condensed font-bold text-2xl text-ink-dark uppercase">End Session?</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Finish with <strong>{totalSets} / {config.targetSets} set{totalSets !== 1 ? 's' : ''}</strong> completed
                in <strong>{formatMMSS(timer.elapsedTime)}</strong>?
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setShowConfirmFinish(false); onFinishSession(); }}
                className="w-full py-3 bg-marker-red hover:bg-marker-red-hover text-white font-condensed font-bold text-lg uppercase tracking-wide rounded-xl shadow transition-all"
              >
                Yes, Finish Now
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmFinish(false)}
                className="w-full py-2.5 bg-board border border-board-border text-ink-main font-semibold text-sm rounded-xl hover:bg-board-border/40 transition-all"
              >
                Cancel — Keep Going
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

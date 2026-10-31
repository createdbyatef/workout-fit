import React, { useState } from 'react';
import { trainingTemplates } from '../utils/training';
import type {
  WorkoutMode,
  WorkoutConfig,
  TabataConfig,
  EmomConfig,
  ForTimeConfig,
} from '../types/workout';
import {
  DEFAULT_TABATA,
  DEFAULT_EMOM,
  DEFAULT_FORTIME,
  WORKOUT_MODE_LABELS,
  WORKOUT_MODE_DESCRIPTIONS,
} from '../types/workout';
import {
  ArrowLeft,
  Play,
  Sparkles,
  Timer,
  Repeat,
  Clock,
  Zap,
  Target,
} from 'lucide-react';

interface SetupProps {
  initialMode: WorkoutMode;
  initialConfig?: WorkoutConfig;
  onStart: (config: WorkoutConfig) => void;
  onBack: () => void;
}

const PRESET_WORKOUTS = ['Cindy', 'Spiderman', 'Murph', 'Fran', 'Custom'];
const QUICK_MINUTES = [10, 15, 20, 30];

const MODE_ICONS: Record<WorkoutMode, React.ReactNode> = {
  amrap: <Repeat className="w-5 h-5" />,
  emom: <Clock className="w-5 h-5" />,
  tabata: <Zap className="w-5 h-5" />,
  fortime: <Target className="w-5 h-5" />,
};

export const Setup: React.FC<SetupProps> = ({ initialMode, initialConfig, onStart, onBack }) => {
  const [mode, setMode] = useState<WorkoutMode>(initialMode);
  const [selectedWorkout, setSelectedWorkout] = useState(initialConfig ? 'Custom' : 'Cindy');
  const [customWorkoutName, setCustomWorkoutName] = useState(initialConfig?.workoutName ?? '');
  const [minutes, setMinutes] = useState(initialConfig ? initialConfig.durationSeconds / 60 : 20);
  const [error, setError] = useState('');

  // Tabata config
  const [tabata, setTabata] = useState<TabataConfig>({ ...(initialConfig?.tabataConfig ?? DEFAULT_TABATA) });

  // EMOM config
  const [emom, setEmom] = useState<EmomConfig>({ ...(initialConfig?.emomConfig ?? DEFAULT_EMOM) });

  // For Time config
  const [forTime, setForTime] = useState<ForTimeConfig>({ ...(initialConfig?.forTimeConfig ?? DEFAULT_FORTIME) });


  const isCustom = selectedWorkout === 'Custom';
  const workoutName = isCustom ? customWorkoutName.trim() : selectedWorkout;
  const template = trainingTemplates.find(t => t.config.workoutName === workoutName);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workoutName) {
      setError('Please enter a workout name.');
      return;
    }
    if ((mode === 'tabata' && (!Number.isInteger(tabata.workSeconds) || tabata.workSeconds < 5 || tabata.workSeconds > 120 || !Number.isInteger(tabata.restSeconds) || tabata.restSeconds < 5 || tabata.restSeconds > 120)) || (mode === 'fortime' && (!Number.isInteger(forTime.targetSets) || forTime.targetSets < 1 || forTime.targetSets > 100))) {
      setError('Use whole numbers within the limits shown.');
      return;
    }

    let durationSeconds: number;

    switch (mode) {
      case 'amrap':
        if (isNaN(minutes) || minutes < 1 || minutes > 120) {
          setError('Duration must be between 1 and 120 minutes.');
          return;
        }
        durationSeconds = minutes * 60;
        break;
      case 'emom':
        durationSeconds = emom.totalMinutes * 60;
        break;
      case 'tabata':
        durationSeconds = (tabata.workSeconds + tabata.restSeconds) * tabata.totalRounds;
        break;
      case 'fortime':
        durationSeconds = 7200; // 2hr cap — stops when target reached
        break;
      default:
        durationSeconds = minutes * 60;
    }

    setError('');
    onStart({
      workoutName,
      mode,
      durationSeconds,
      tabataConfig: mode === 'tabata' ? { ...tabata } : undefined,
      emomConfig: mode === 'emom' ? { ...emom } : undefined,
      forTimeConfig: mode === 'fortime' ? { ...forTime } : undefined,
    });
  };

  return (
    <div className="screen-panel setup-panel mx-auto flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="flex items-center gap-3 pb-4 border-b border-board-border">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to dashboard"
          className="p-2 -ml-2 rounded-xl hover:bg-board-border/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue"
        >
          <ArrowLeft className="w-5 h-5 text-ink-main" />
        </button>
        <div>
          <h1 className="font-condensed text-2xl font-extrabold tracking-tight text-ink-dark uppercase">
            Build your session.
          </h1>
          <p className="text-xs text-ink-muted font-medium -mt-0.5">
            YOUR WORKOUT. YOUR PACE. YOUR NEXT LEVEL.
          </p>
        </div>
      </header>

      <form onSubmit={handleStart} className="mt-5 space-y-5 flex-1">
        {template && <section className="session-plan bg-board-card border border-board-border rounded-xl p-5"><h2 className="font-semibold mb-2">Your session plan</h2><p className="text-sm text-ink-muted mb-4">{template.description} Choose a comfortable pace and adjust as needed.</p><ul className="space-y-2 text-sm">{template.exercises.map((exercise, i) => <li key={exercise}>{i + 1}. {exercise}</li>)}</ul></section>}
        {/* Mode Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
            Timer Mode
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['amrap', 'emom', 'tabata', 'fortime'] as WorkoutMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`py-2.5 px-1 rounded-xl border text-xs font-bold uppercase tracking-wide flex flex-col items-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue ${
                  mode === m
                    ? 'bg-ink-blue text-white border-ink-blue shadow-sm'
                    : 'bg-board-card border-board-border text-ink-muted hover:text-ink-main'
                }`}
              >
                {MODE_ICONS[m]}
                {WORKOUT_MODE_LABELS[m]}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink-muted mt-1.5">
            {WORKOUT_MODE_DESCRIPTIONS[mode]}
          </p>
        </div>

        {/* Workout Name */}
        <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm space-y-3">
          <label
            htmlFor="workout-select"
            className="block text-xs font-bold uppercase tracking-wider text-ink-muted"
          >
            Workout Name
          </label>
          <select
            id="workout-select"
            value={selectedWorkout}
            onChange={(e) => {
              setSelectedWorkout(e.target.value);
              setError('');
            }}
            className="w-full bg-board border border-board-border rounded-xl px-4 py-3 text-ink-main font-semibold text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue"
          >
            {PRESET_WORKOUTS.map((w) => (
              <option key={w} value={w}>
                {w === 'Custom' ? 'Custom...' : w}
              </option>
            ))}
          </select>

          {selectedWorkout === 'Cindy' && (
            <p className="text-xs text-ink-muted flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-ink-blue" />
              5 Pull-ups · 10 Push-ups · 15 Air Squats
            </p>
          )}

          {isCustom && (
            <input
              type="text"
              placeholder="e.g. Murph, Barbara, Tabata..."
              aria-label="Workout name"
              value={customWorkoutName}
              onChange={(e) => {
                setCustomWorkoutName(e.target.value);
                setError('');
              }}
              autoFocus={!initialConfig}
              maxLength={40}
              className="w-full bg-board border border-board-border rounded-xl px-4 py-3 text-ink-main font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue"
            />
          )}
        </div>

        {/* Mode-specific Config */}
        <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm space-y-4">
          {/* â”€â”€â”€ AMRAP config â”€â”€â”€ */}
          {mode === 'amrap' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-ink-blue" />
                  Time Limit (Minutes)
                </label>
                <span className="font-condensed font-extrabold text-lg text-ink-blue">
                  {minutes} min
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={minutes || ''}
                  onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                  className="w-24 bg-board border border-board-border rounded-xl px-3 py-2.5 text-center font-condensed font-black text-2xl text-ink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue"
                />
                <div className="flex-1 grid grid-cols-4 gap-1.5">
                  {QUICK_MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinutes(m)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        minutes === m
                          ? 'bg-ink-blue text-white border-ink-blue'
                          : 'bg-board border-board-border text-ink-muted hover:text-ink-main'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€â”€ EMOM config â”€â”€â”€ */}
          {mode === 'emom' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Total Duration
                </label>
                <span className="font-condensed font-bold text-ink-blue">
                  {emom.totalMinutes} min
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                value={emom.totalMinutes}
                onChange={(e) =>
                  setEmom((prev) => ({ ...prev, totalMinutes: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-ink-blue"
              />
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Interval
                </label>
                <span className="font-condensed font-bold text-ink-blue">
                  {emom.intervalSeconds}s
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 60, 90, 120].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEmom((prev) => ({ ...prev, intervalSeconds: s }))}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      emom.intervalSeconds === s
                        ? 'bg-ink-blue text-white border-ink-blue'
                        : 'bg-board border-board-border text-ink-muted'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* â”€â”€â”€ Tabata config â”€â”€â”€ */}
          {mode === 'tabata' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1">
                    Work (sec)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={tabata.workSeconds}
                    onChange={(e) =>
                      setTabata((p) => ({ ...p, workSeconds: parseInt(e.target.value, 10) || 20 }))
                    }
                    className="w-full bg-board border border-board-border rounded-xl px-3 py-2.5 text-center font-condensed font-black text-xl text-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1">
                    Rest (sec)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={tabata.restSeconds}
                    onChange={(e) =>
                      setTabata((p) => ({ ...p, restSeconds: parseInt(e.target.value, 10) || 10 }))
                    }
                    className="w-full bg-board border border-board-border rounded-xl px-3 py-2.5 text-center font-condensed font-black text-xl text-ink-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-1">
                  Rounds
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[4, 6, 8, 10, 12].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTabata((p) => ({ ...p, totalRounds: r }))}
                      className={`py-2 text-sm font-bold rounded-lg border transition-all ${
                        tabata.totalRounds === r
                          ? 'bg-ink-blue text-white border-ink-blue'
                          : 'bg-board border-board-border text-ink-muted'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-ink-muted">
                Total:{' '}
                <strong>
                  {Math.floor(
                    ((tabata.workSeconds + tabata.restSeconds) * tabata.totalRounds) / 60
                  )}
                  m{' '}
                  {((tabata.workSeconds + tabata.restSeconds) * tabata.totalRounds) % 60}s
                </strong>{' '}
                ({tabata.workSeconds}s work + {tabata.restSeconds}s rest × {tabata.totalRounds}{' '}
                rounds)
              </p>
            </div>
          )}

          {/* â”€â”€â”€ For Time config â”€â”€â”€ */}
          {mode === 'fortime' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                Target Sets to Complete
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={forTime.targetSets}
                  onChange={(e) =>
                    setForTime({ targetSets: parseInt(e.target.value, 10) || 5 })
                  }
                  className="w-24 bg-board border border-board-border rounded-xl px-3 py-2.5 text-center font-condensed font-black text-2xl text-ink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue"
                />
                <div className="flex-1 grid grid-cols-4 gap-1.5">
                  {[3, 5, 10, 20].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForTime({ targetSets: t })}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        forTime.targetSets === t
                          ? 'bg-ink-blue text-white border-ink-blue'
                          : 'bg-board border-board-border text-ink-muted'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-ink-muted">
                Timer counts UP. Finish all {forTime.targetSets} sets as fast as possible!
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-marker-red/10 border border-marker-red/30 rounded-xl text-marker-red text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Start Button */}
        <button
          type="submit"
          className="w-full py-4 px-6 bg-ink-blue hover:bg-ink-dark active:scale-[0.98] text-white font-condensed font-black text-2xl uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink-blue/40"
        >
          <Play className="w-6 h-6 fill-current" />
          Start {WORKOUT_MODE_LABELS[mode]}
        </button>
      </form>
    </div>
  );
};


import React, { useState, useEffect, useCallback } from 'react';
import type {
  WorkoutSession,
  WorkoutSplit,
  ScreenState,
  WorkoutMode,
  WorkoutConfig,
} from './types/workout';
import { Dashboard } from './components/Dashboard';
import { Setup } from './components/Setup';
import { Running } from './components/Running';
import { TabataRunning } from './components/TabataRunning';
import { EmomRunning } from './components/EmomRunning';
import { ForTimeRunning } from './components/ForTimeRunning';
import { Summary } from './components/Summary';
import { Analytics } from './components/Analytics';
import { useTimer } from './hooks/useTimer';
import { useWakeLock } from './hooks/useWakeLock';
import { getWorkoutHistory, saveWorkoutSession, clearWorkoutHistory } from './utils/storage';
import { playTimerFinishBeep, triggerHaptic } from './utils/feedback';
import { Dumbbell } from 'lucide-react';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('dashboard');
  const [selectedMode, setSelectedMode] = useState<WorkoutMode>('amrap');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutConfig | undefined>();
  const [activeConfig, setActiveConfig] = useState<WorkoutConfig>({
    workoutName: 'Cindy',
    mode: 'amrap',
    durationSeconds: 1200,
  });
  const [splits, setSplits] = useState<WorkoutSplit[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [currentSummarySession, setCurrentSummarySession] = useState<WorkoutSession | null>(null);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [screen]);

  // Sound toggle (persisted safely in localStorage)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('set_counter_sound');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('set_counter_sound', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save sound pref:', e);
      }
      return next;
    });
  };

  // Screen Wake Lock keeps display awake during active workout
  const { isActive: wakeLockActive } = useWakeLock(screen === 'running');

  // Load history on mount
  useEffect(() => {
    const loaded = getWorkoutHistory();
    setHistory(loaded);
  }, []);

  // Complete session handler: build session, save to history, switch to summary
  const finishSession = useCallback(
    (finalElapsedSeconds: number) => {
      triggerHaptic(100);
      if (soundEnabled) {
        playTimerFinishBeep();
      }

      const completedSession: WorkoutSession = {
        id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        workoutName: activeConfig.workoutName.trim() || 'AMRAP Workout',
        workoutMode: activeConfig.mode,
        plannedDurationSeconds: activeConfig.durationSeconds,
        actualDurationSeconds: Math.round(finalElapsedSeconds),
        totalSets: splits.length,
        splits: [...splits],
        timestamp: Date.now(),
        tabataConfig: activeConfig.tabataConfig,
        emomConfig: activeConfig.emomConfig,
        forTimeConfig: activeConfig.forTimeConfig,
      };

      // Save into storage safely
      saveWorkoutSession(completedSession);

      // Refresh history state
      setHistory(getWorkoutHistory());

      setCurrentSummarySession(completedSession);
      setScreen('summary');
    },
    [activeConfig, splits, soundEnabled]
  );

  // Initialize timer hook
  const timer = useTimer({
    totalDurationSeconds: activeConfig.durationSeconds,
    onComplete: () => {
      // Auto-finish when countdown reaches 0:00 (for AMRAP, Tabata, EMOM)
      finishSession(activeConfig.durationSeconds);
    },
  });

  // Start configured workout from Setup screen
  const handleStartWorkout = (config: WorkoutConfig) => {
    setActiveConfig(config);
    setSplits([]);
    timer.reset(config.durationSeconds);
    timer.start();
    setScreen('running');
  };

  // Record a completed set
  const handleAddSet = () => {
    const currentCumulative = Math.round(timer.elapsedTime);
    const lastCumulative = splits.length > 0 ? splits[splits.length - 1].cumulativeSeconds : 0;
    const splitSec = Math.max(1, currentCumulative - lastCumulative);

    const newSplit: WorkoutSplit = {
      setNumber: splits.length + 1,
      splitSeconds: splitSec,
      cumulativeSeconds: currentCumulative,
    };

    setSplits((prev) => [...prev, newSplit]);
  };

  // Undo last recorded set
  const handleUndoSet = () => {
    setSplits((prev) => prev.slice(0, -1));
  };

  // Finish session manually via Finish button
  const handleManualFinish = () => {
    timer.stop();
    finishSession(timer.elapsedTime);
  };

  // Return to Dashboard from Summary
  const handleRestart = () => {
    timer.stop();
    setSplits([]);
    setCurrentSummarySession(null);
    setScreen('dashboard');
  };

  // Clear history
  const handleClearHistory = () => {
    clearWorkoutHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen whiteboard-grid font-sans text-ink-main flex flex-col justify-start" data-screen={screen}>
      {screen !== 'dashboard' && <header className="workspace-header">
        <div className="workspace-brand"><span><Dumbbell size={22}/></span><span>SET<small>COUNTER</small></span></div>
        {screen === 'analytics' ? <span className="workspace-caption">Your effort. Your progress.</span> : <nav className="workspace-steps" aria-label="Workout progress">
          {(['setup', 'running', 'summary'] as const).map((step, i) => <div key={step} className={`workspace-step ${screen === step ? 'active' : ''}`} aria-current={screen === step ? 'step' : undefined}><span>{i + 1}</span>{['Prepare', 'Train', 'Review'][i]}</div>)}
        </nav>}
      </header>}
      <div className={screen === 'dashboard' ? undefined : 'workout-screen'} role={screen === 'dashboard' ? undefined : 'main'}>
      {screen === 'dashboard' && (
        <Dashboard
          sessions={history}
          onStartWorkout={(mode) => {
            setSelectedTemplate(undefined);
            setSelectedMode(mode);
            setScreen('setup');
          }}
          onSelectTemplate={(config) => {
            setSelectedTemplate(config);
            setSelectedMode(config.mode);
            setScreen('setup');
          }}
          onViewAnalytics={() => setScreen('analytics')}
          onClearHistory={handleClearHistory}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      )}

      {screen === 'setup' && (
        <Setup
          initialMode={selectedMode}
          initialConfig={selectedTemplate}
          onStart={handleStartWorkout}
          onBack={() => setScreen('dashboard')}
        />
      )}

      {screen === 'analytics' && (
        <Analytics
          sessions={history}
          onBack={() => setScreen('dashboard')}
        />
      )}

      {screen === 'running' && activeConfig.mode === 'amrap' && (
        <Running
          workoutName={activeConfig.workoutName}
          totalDurationSeconds={activeConfig.durationSeconds}
          timer={timer}
          splits={splits}
          onAddSet={handleAddSet}
          onUndoSet={handleUndoSet}
          onFinishSession={handleManualFinish}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          wakeLockActive={wakeLockActive}
        />
      )}

      {screen === 'running' && activeConfig.mode === 'tabata' && activeConfig.tabataConfig && (
        <TabataRunning
          workoutName={activeConfig.workoutName}
          config={activeConfig.tabataConfig}
          timer={timer}
          splits={splits}
          onAddSet={handleAddSet}
          onFinishSession={handleManualFinish}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          wakeLockActive={wakeLockActive}
        />
      )}

      {screen === 'running' && activeConfig.mode === 'emom' && activeConfig.emomConfig && (
        <EmomRunning
          workoutName={activeConfig.workoutName}
          config={activeConfig.emomConfig}
          timer={timer}
          splits={splits}
          onAddSet={handleAddSet}
          onFinishSession={handleManualFinish}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          wakeLockActive={wakeLockActive}
        />
      )}

      {screen === 'running' && activeConfig.mode === 'fortime' && activeConfig.forTimeConfig && (
        <ForTimeRunning
          workoutName={activeConfig.workoutName}
          config={activeConfig.forTimeConfig}
          timer={timer}
          splits={splits}
          onAddSet={handleAddSet}
          onFinishSession={handleManualFinish}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          wakeLockActive={wakeLockActive}
        />
      )}

      {screen === 'summary' && currentSummarySession && (
        <Summary
          session={currentSummarySession}
          onRestart={handleRestart}
        />
      )}
      </div>
    </div>
  );
};

export default App;

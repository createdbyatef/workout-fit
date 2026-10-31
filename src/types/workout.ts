/**
 * Core types for the Set Counter gym companion app.
 * Supports AMRAP, EMOM, Tabata, and For Time workout modes.
 */

// ─── Timer Modes ──────────────────────────────────────────────────────────────
export type WorkoutMode = 'amrap' | 'emom' | 'tabata' | 'fortime';

export const WORKOUT_MODE_LABELS: Record<WorkoutMode, string> = {
  amrap: 'AMRAP',
  emom: 'EMOM',
  tabata: 'Tabata',
  fortime: 'For Time',
};

export const WORKOUT_MODE_DESCRIPTIONS: Record<WorkoutMode, string> = {
  amrap: 'As Many Rounds As Possible in a fixed time',
  emom: 'Every Minute On the Minute — work at each interval',
  tabata: 'High-intensity intervals: work / rest cycles',
  fortime: 'Race to finish a target number of sets',
};

// ─── Mode-specific configs ────────────────────────────────────────────────────
export interface TabataConfig {
  workSeconds: number;   // default 20
  restSeconds: number;   // default 10
  totalRounds: number;   // default 8
}

export interface EmomConfig {
  intervalSeconds: number; // default 60 (1 min)
  totalMinutes: number;    // default 10
}

export interface ForTimeConfig {
  targetSets: number; // how many sets to finish
}

export const DEFAULT_TABATA: TabataConfig = {
  workSeconds: 20,
  restSeconds: 10,
  totalRounds: 8,
};

export const DEFAULT_EMOM: EmomConfig = {
  intervalSeconds: 60,
  totalMinutes: 10,
};

export const DEFAULT_FORTIME: ForTimeConfig = {
  targetSets: 5,
};

// ─── Unified workout config passed from Setup → Running ──────────────────────
export interface WorkoutConfig {
  workoutName: string;
  mode: WorkoutMode;
  durationSeconds: number;    // total timer duration (calculated per mode)
  tabataConfig?: TabataConfig;
  emomConfig?: EmomConfig;
  forTimeConfig?: ForTimeConfig;
}

// ─── Split / session data ─────────────────────────────────────────────────────
export interface WorkoutSplit {
  setNumber: number;
  splitSeconds: number;       // time taken for this specific set
  cumulativeSeconds: number;  // total elapsed time when set was completed
  phase?: 'work' | 'rest';   // for Tabata: which phase the set was in
  round?: number;             // for EMOM/Tabata: which round
}

export interface WorkoutSession {
  id: string;
  workoutName: string;
  workoutMode: WorkoutMode;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  totalSets: number;
  splits: WorkoutSplit[];
  timestamp: number;
  // Mode-specific stored config (for history display)
  tabataConfig?: TabataConfig;
  emomConfig?: EmomConfig;
  forTimeConfig?: ForTimeConfig;
}

// ─── App screen state ─────────────────────────────────────────────────────────
export type ScreenState = 'dashboard' | 'setup' | 'running' | 'summary' | 'analytics';

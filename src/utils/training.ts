import type { WorkoutConfig } from '../types/workout';

export interface TrainingTemplate {
  id: string;
  category: 'Bodyweight' | 'Strength' | 'Conditioning';
  level: 'Beginner' | 'Intermediate';
  description: string;
  exercises: string[];
  config: WorkoutConfig;
}

export const trainingTemplates: TrainingTemplate[] = [
  { id: 'foundation', category: 'Bodyweight', level: 'Beginner', description: 'A simple circuit. A stronger foundation.', exercises: ['8 air squats', '6 incline push-ups', '10 alternating lunges'], config: { workoutName: 'Foundation', mode: 'amrap', durationSeconds: 600 } },
  { id: 'engine', category: 'Conditioning', level: 'Intermediate', description: 'Find your rhythm. Keep it moving.', exercises: ['30s high knees', '30s mountain climbers', 'Repeat each interval; rest as needed'], config: { workoutName: 'Engine Builder', mode: 'emom', durationSeconds: 720, emomConfig: { totalMinutes: 12, intervalSeconds: 60 } } },
  { id: 'express', category: 'Bodyweight', level: 'Beginner', description: 'Short on time. Big on intention.', exercises: ['Alternate squats and marching in place', '20 seconds work', '10 seconds rest'], config: { workoutName: 'Everyday Express', mode: 'tabata', durationSeconds: 240, tabataConfig: { workSeconds: 20, restSeconds: 10, totalRounds: 8 } } },
  { id: 'strength', category: 'Strength', level: 'Intermediate', description: 'Controlled reps. Consistent rounds.', exercises: ['8 dumbbell deadlifts', '8 dumbbell rows per side', '8 goblet squats'], config: { workoutName: 'Strength Circuit', mode: 'fortime', durationSeconds: 7200, forTimeConfig: { targetSets: 5 } } },
  { id: 'core', category: 'Bodyweight', level: 'Beginner', description: 'Make a little room for your core.', exercises: ['20s dead bug', '20s bird dog', '20s rest between rounds'], config: { workoutName: 'Core Control', mode: 'tabata', durationSeconds: 360, tabataConfig: { workSeconds: 40, restSeconds: 20, totalRounds: 6 } } },
  { id: 'momentum', category: 'Conditioning', level: 'Intermediate', description: 'Your pace. Your next milestone.', exercises: ['10 step-ups', '8 push-ups', '12 air squats'], config: { workoutName: 'Build Momentum', mode: 'amrap', durationSeconds: 1200 } },
];

export function readPreference<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  try { const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null'); return validate(value) ? value : fallback; }
  catch { return fallback; }
}

export function localDayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

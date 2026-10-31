import type { WorkoutSession } from '../types/workout';

const STORAGE_KEY = 'set_counter_history_v1';
const MAX_HISTORY_ITEMS = 1000;

/**
 * Safely load workout history from localStorage.
 */
export function getWorkoutHistory(): WorkoutSession[] {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      // Migrate old sessions that lack workoutMode
      return parsed.slice(0, MAX_HISTORY_ITEMS).map((s: WorkoutSession) => ({
        ...s,
        workoutMode: s.workoutMode || 'amrap',
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to read workout history:', error);
    return [];
  }
}

/**
 * Safely save a new workout session (prepends, keeps last 1000).
 */
export function saveWorkoutSession(session: WorkoutSession): boolean {
  try {
    const currentHistory = getWorkoutHistory();
    const updatedHistory = [session, ...currentHistory.filter((s) => s.id !== session.id)].slice(
      0,
      MAX_HISTORY_ITEMS
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Failed to save workout session:', error);
    return false;
  }
}

/**
 * Clear all history.
 */
export function clearWorkoutHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear workout history:', error);
    return false;
  }
}


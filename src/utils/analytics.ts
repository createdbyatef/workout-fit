/**
 * Analytics computation utilities.
 * Derives stats, streaks, PRs, and chart data from workout history.
 */
import type { WorkoutSession, WorkoutMode } from '../types/workout';

// ─── Daily Stats ──────────────────────────────────────────────────────────────

function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(ts: number): boolean {
  return dateKey(ts) === dateKey(Date.now());
}

export function getTodaysSessions(sessions: WorkoutSession[]): WorkoutSession[] {
  return sessions.filter((s) => isToday(s.timestamp));
}

export function getTodaysTotalSets(sessions: WorkoutSession[]): number {
  return getTodaysSessions(sessions).reduce((sum, s) => sum + s.totalSets, 0);
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export function getStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;

  const daySet = new Set(sessions.map((s) => dateKey(s.timestamp)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if user has worked out today; if not, start from yesterday
  let checkDate = new Date(today);
  if (!daySet.has(dateKey(checkDate.getTime()))) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  let streak = 0;
  while (daySet.has(dateKey(checkDate.getTime()))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

// ─── Weekly Data (last 7 days) ────────────────────────────────────────────────

export interface DayData {
  label: string;       // "Mon", "Tue", etc.
  dateStr: string;     // "2026-10-31"
  totalSets: number;
  sessionCount: number;
}

export function getWeeklyData(sessions: WorkoutSession[]): DayData[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: DayData[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const key = dateKey(d.getTime());
    const daySessions = sessions.filter((s) => dateKey(s.timestamp) === key);

    result.push({
      label: dayNames[d.getDay()],
      dateStr: key,
      totalSets: daySessions.reduce((sum, s) => sum + s.totalSets, 0),
      sessionCount: daySessions.length,
    });
  }

  return result;
}

// ─── Monthly Heatmap ──────────────────────────────────────────────────────────

export interface HeatmapDay {
  date: string;
  count: number;       // number of sessions
  dayOfMonth: number;
  dayOfWeek: number;   // 0=Sun
}

export function getMonthlyHeatmap(sessions: WorkoutSession[]): HeatmapDay[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build lookup: dateKey → count
  const countMap = new Map<string, number>();
  sessions.forEach((s) => {
    const key = dateKey(s.timestamp);
    countMap.set(key, (countMap.get(key) || 0) + 1);
  });

  const result: HeatmapDay[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const key = dateKey(d.getTime());
    result.push({
      date: key,
      count: countMap.get(key) || 0,
      dayOfMonth: day,
      dayOfWeek: d.getDay(),
    });
  }

  return result;
}

// ─── Personal Records ─────────────────────────────────────────────────────────

export interface PersonalRecord {
  workoutName: string;
  workoutMode: WorkoutMode;
  bestSets: number;
  bestSessionId: string;
  bestDate: number;
  totalAttempts: number;
}

export function getPersonalRecords(sessions: WorkoutSession[]): PersonalRecord[] {
  const prMap = new Map<string, PersonalRecord>();

  sessions.forEach((s) => {
    const key = `${s.workoutName}__${s.workoutMode}`;
    const existing = prMap.get(key);

    if (!existing) {
      prMap.set(key, {
        workoutName: s.workoutName,
        workoutMode: s.workoutMode,
        bestSets: s.totalSets,
        bestSessionId: s.id,
        bestDate: s.timestamp,
        totalAttempts: 1,
      });
    } else {
      existing.totalAttempts++;
      if (s.totalSets > existing.bestSets) {
        existing.bestSets = s.totalSets;
        existing.bestSessionId = s.id;
        existing.bestDate = s.timestamp;
      }
    }
  });

  return Array.from(prMap.values()).sort((a, b) => b.bestSets - a.bestSets);
}

// ─── All-Time Summary Stats ───────────────────────────────────────────────────

export interface TotalStats {
  totalSessions: number;
  totalSets: number;
  totalTimeSeconds: number;
  avgSetsPerSession: number;
  avgTimePerSet: number;
  thisMonthSessions: number;
}

export function getTotalStats(sessions: WorkoutSession[]): TotalStats {
  const totalSessions = sessions.length;
  const totalSets = sessions.reduce((s, sess) => s + sess.totalSets, 0);
  const totalTimeSeconds = sessions.reduce((s, sess) => s + sess.actualDurationSeconds, 0);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthSessions = sessions.filter(
    (s) => dateKey(s.timestamp).startsWith(thisMonth)
  ).length;

  return {
    totalSessions,
    totalSets,
    totalTimeSeconds,
    avgSetsPerSession: totalSessions > 0 ? Math.round(totalSets / totalSessions) : 0,
    avgTimePerSet: totalSets > 0 ? Math.round(totalTimeSeconds / totalSets) : 0,
    thisMonthSessions,
  };
}


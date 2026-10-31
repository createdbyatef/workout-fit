import React from 'react';
import type { WorkoutSession } from '../types/workout';
import { WORKOUT_MODE_LABELS } from '../types/workout';
import {
  getWeeklyData,
  getMonthlyHeatmap,
  getPersonalRecords,
  getTotalStats,
  getStreak,
} from '../utils/analytics';
import { formatTotalDuration, formatSessionDate } from '../utils/formatTime';
import {
  ArrowLeft,
  Trophy,
  Flame,
  TrendingUp,
  Calendar,
  Clock,
  Dumbbell,
  BarChart3,
  Zap,
} from 'lucide-react';

interface AnalyticsProps {
  sessions: WorkoutSession[];
  onBack: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ sessions, onBack }) => {
  const stats = getTotalStats(sessions);
  const streak = getStreak(sessions);
  const weeklyData = getWeeklyData(sessions);
  const heatmap = getMonthlyHeatmap(sessions);
  const personalRecords = getPersonalRecords(sessions);

  const maxWeeklySets = Math.max(...weeklyData.map((d) => d.totalSets), 1);
  const [now] = React.useState(() => new Date());
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const monthYear = `${monthName} ${now.getFullYear()}`;

  // Heatmap padding: empty cells before the 1st of the month
  const firstDayOfWeek = heatmap.length > 0 ? heatmap[0].dayOfWeek : 0;

  const heatmapColor = (count: number): string => {
    if (count >= 3) return 'bg-ink-blue';
    if (count === 2) return 'bg-ink-blue/60';
    if (count === 1) return 'bg-ink-blue/30';
    return 'bg-board-border/30';
  };

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="screen-panel analytics-panel mx-auto safe-top safe-bottom">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-board-card active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft size={22} className="text-ink-main" />
        </button>
        <h1 className="font-condensed text-xl font-bold uppercase tracking-wide text-ink-dark">
          Progress & Analytics
        </h1>
      </div>

      {/* ── Summary Stats Cards ─────────────────────────────────── */}
      {/* Row 1: 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm text-center">
          <Dumbbell size={18} className="text-ink-blue mx-auto mb-1" />
          <p className="font-condensed text-3xl font-bold text-ink-dark">
            {stats.totalSessions}
          </p>
          <p className="text-xs text-ink-muted font-sans uppercase tracking-wide">
            Total Sessions
          </p>
        </div>
        <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm text-center">
          <Flame size={18} className="text-ink-blue mx-auto mb-1" />
          <p className="font-condensed text-3xl font-bold text-ink-dark">
            {streak}
          </p>
          <p className="text-xs text-ink-muted font-sans uppercase tracking-wide">
            {streak === 1 ? 'day' : 'days'} streak
          </p>
        </div>
      </div>

      {/* Row 2: 3 columns, smaller */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-board-card border border-board-border rounded-2xl p-3 shadow-sm text-center">
          <Zap size={14} className="text-ink-blue mx-auto mb-1" />
          <p className="font-condensed text-xl font-bold text-ink-dark">
            {stats.totalSets}
          </p>
          <p className="text-[10px] text-ink-muted font-sans uppercase tracking-wide">
            Total Sets
          </p>
        </div>
        <div className="bg-board-card border border-board-border rounded-2xl p-3 shadow-sm text-center">
          <Clock size={14} className="text-ink-blue mx-auto mb-1" />
          <p className="font-condensed text-xl font-bold text-ink-dark">
            {formatTotalDuration(stats.totalTimeSeconds)}
          </p>
          <p className="text-[10px] text-ink-muted font-sans uppercase tracking-wide">
            Total Time
          </p>
        </div>
        <div className="bg-board-card border border-board-border rounded-2xl p-3 shadow-sm text-center">
          <TrendingUp size={14} className="text-ink-blue mx-auto mb-1" />
          <p className="font-condensed text-xl font-bold text-ink-dark">
            {stats.avgSetsPerSession}
          </p>
          <p className="text-[10px] text-ink-muted font-sans uppercase tracking-wide">
            Avg Sets/Session
          </p>
        </div>
      </div>

      {/* ── Weekly Sets Chart ───────────────────────────────────── */}
      <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-ink-blue" />
          <h2 className="font-condensed text-base font-bold uppercase tracking-wide text-ink-dark">
            This Week
          </h2>
        </div>

        {weeklyData.every((d) => d.totalSets === 0) ? (
          <p className="text-sm text-ink-muted text-center py-4">
            No sessions this week
          </p>
        ) : (
          <div className="weekly-volume-chart">
            {weeklyData.map((day) => {
              const barHeight =
                day.totalSets > 0
                  ? Math.max(8, (day.totalSets / maxWeeklySets) * 80)
                  : 4;
              const isToday = day.dateStr === todayStr;

              return (
                <div
                  key={day.dateStr}
                  className="flex flex-col items-center"
                  style={{ minWidth: 0 }}
                >
                  <div
                    className={`w-6 rounded-t-md transition-all ${
                      isToday ? 'bg-ink-blue' : 'bg-ink-blue/20'
                    }`}
                    style={{ height: barHeight }}
                  />
                  <p
                    className={`font-condensed text-xs mt-1 ${
                      isToday
                        ? 'text-ink-blue font-bold'
                        : 'text-ink-muted'
                    }`}
                  >
                    {day.label}
                  </p>
                  <p
                    className={`font-condensed text-[10px] ${
                      isToday ? 'text-ink-blue' : 'text-ink-muted'
                    }`}
                  >
                    {day.totalSets}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Monthly Activity Heatmap ────────────────────────────── */}
      <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-ink-blue" />
          <h2 className="font-condensed text-base font-bold uppercase tracking-wide text-ink-dark">
            This Month
          </h2>
          <span className="text-xs text-ink-muted ml-auto font-sans">
            {monthYear}
          </span>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayHeaders.map((d) => (
            <p
              key={d}
              className="text-[10px] text-ink-muted text-center font-sans"
            >
              {d}
            </p>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding cells for first day offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`pad-${i}`} className="w-7 h-7" />
          ))}
          {heatmap.map((day) => (
            <div
              key={day.date}
              className={`w-7 h-7 rounded-md ${heatmapColor(day.count)} flex items-center justify-center`}
              title={`${day.date}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
            >
              <span
                className={`text-[9px] font-condensed ${
                  day.count >= 2 ? 'text-[#101214]' : day.count === 1 ? 'text-ink-main' : 'text-ink-muted'
                }`}
              >
                {day.dayOfMonth}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Personal Records ────────────────────────────────────── */}
      <div className="bg-board-card border border-board-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-ink-blue" />
          <h2 className="font-condensed text-base font-bold uppercase tracking-wide text-ink-dark">
            Personal Records
          </h2>
        </div>

        {personalRecords.length === 0 ? (
          <div className="text-center py-6">
            <Dumbbell size={28} className="text-ink-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm text-ink-muted">
              Complete more workouts to unlock your PRs!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {personalRecords.map((pr, idx) => {
              const isTop = idx === 0;
              return (
                <div
                  key={`${pr.workoutName}-${pr.workoutMode}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isTop
                      ? 'border-ink-blue/20 bg-ink-blue/5'
                      : 'border-board-border bg-board/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-condensed text-sm font-bold text-ink-dark truncate">
                        {pr.workoutName}
                      </p>
                      <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-ink-blue/15 text-ink-blue font-sans">
                        {WORKOUT_MODE_LABELS[pr.workoutMode]}
                      </span>
                    </div>
                    <p className="text-[10px] text-ink-muted font-sans">
                      {pr.totalAttempts} attempt{pr.totalAttempts !== 1 ? 's' : ''} ·{' '}
                      {formatSessionDate(pr.bestDate)}
                    </p>
                  </div>
                  <div className="text-center shrink-0">
                    <p
                      className={`font-condensed text-2xl font-bold ${
                        isTop ? 'text-ink-blue' : 'text-ink-blue'
                      }`}
                    >
                      {pr.bestSets}
                    </p>
                    <p className="text-[9px] text-ink-muted uppercase font-sans">
                      sets
                    </p>
                  </div>
                  {isTop && (
                    <Trophy size={16} className="text-ink-blue shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

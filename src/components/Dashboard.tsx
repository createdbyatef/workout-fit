import { useState } from 'react';
import type { WorkoutConfig, WorkoutMode, WorkoutSession } from '../types/workout';
import { WORKOUT_MODE_LABELS } from '../types/workout';
import { Activity, ArrowDownToLine, ArrowRight, BarChart3, Check, ChevronRight, Clock3, Droplets, Dumbbell, Flame, Heart, LayoutDashboard, Library, Plus, Search, Target, Timer, Trophy, Volume2, VolumeX, Zap, ArrowUpRight, MoveUpRight }  from 'lucide-react';
import { History } from './History';
import { getStreak, getWeeklyData } from '../utils/analytics';
import { localDayKey, readPreference, trainingTemplates } from '../utils/training';
import './Dashboard.css';

interface DashboardProps {
  sessions: WorkoutSession[];
  onStartWorkout: (mode: WorkoutMode) => void;
  onSelectTemplate: (config: WorkoutConfig) => void;
  onViewAnalytics: () => void;
  onClearHistory: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}
type Page = 'overview' | 'library' | 'history';
export function Dashboard({ sessions, onStartWorkout, onSelectTemplate, onViewAnalytics, onClearHistory, soundEnabled, onToggleSound }: DashboardProps) {
  const [page, setPage] = useState<Page>('overview');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All workouts');
  const [onlySaved, setOnlySaved] = useState(false);
  const [saved, setSaved] = useState(() => readPreference<string[]>('fit_saved', [], (v): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string')));
  const [goal, setGoal] = useState(() => readPreference<number>('fit_goal', 3, (v): v is number => Number.isInteger(v) && Number(v) >= 1 && Number(v) <= 7));
  const waterKey = `fit_water_${localDayKey()}`;
  const [water, setWater] = useState(() => readPreference<number>(waterKey, 0, (v): v is number => Number.isInteger(v) && Number(v) >= 0 && Number(v) <= 8));
  const [notice, setNotice] = useState('');
  const [today] = useState(() => new Date());
  const persist = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { setNotice('Browser storage is unavailable. Changes will last until you close this page.'); } };
  const week = getWeeklyData(sessions);
  const activeDays = week.filter(d => d.sessionCount > 0).length;
  const weekSessions = week.reduce((sum, d) => sum + d.sessionCount, 0);
  const weekDates = new Set(week.map(d => d.dateStr));
  const weeklyMinutes = Math.round(sessions.filter(s => {
    const d = new Date(s.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return weekDates.has(key);
  }).reduce((sum, s) => sum + s.actualDurationSeconds, 0) / 60);
  const filtered = trainingTemplates.filter(t => (category === 'All workouts' || t.category === category) && (!onlySaved || saved.includes(t.id)) && `${t.config.workoutName} ${t.exercises.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const toggleSaved = (id: string) => { const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]; setSaved(next); persist('fit_saved', next); };
  const exportHistory = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), sessions }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'set-counter-workouts.json'; a.click(); URL.revokeObjectURL(url);
    setNotice('Your workout history has been exported.');
  };
  const navigation = [{ id: 'overview' as const, label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard }, { id: 'library' as const, label: 'Workout library', shortLabel: 'Workouts', icon: Library }, { id: 'history' as const, label: 'Activity history', shortLabel: 'History', icon: Clock3 }];
  return <div className="fitness-shell">
    <aside className="fit-sidebar">
      <a className="fit-brand" href="#" aria-label="Set Counter home" onClick={e => { e.preventDefault(); setPage('overview'); }}><span className="fit-brand-icon"><Dumbbell size={23}/></span>SET<span className="brand-light">COUNTER</span><span className="brand-dot"/></a>
      <div className="sidebar-label">TRAINING CLUB / EST. TODAY</div>
      <nav aria-label="Main navigation">{navigation.map(({ id, label, shortLabel, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'selected' : ''}`} aria-current={page === id ? 'page' : undefined} onClick={() => setPage(id)}><Icon size={19}/><span className="nav-label">{label}</span><span className="nav-short-label">{shortLabel}</span>{page === id && <span className="nav-dot"/>}</button>)}<button className="nav-item" onClick={onViewAnalytics}><BarChart3 size={19}/>Analytics<ChevronRight size={16}/></button></nav>
      <div className="sidebar-callout"><span className="small-icon"><Zap size={18}/></span><h3>PUT IN THE WORK.</h3><p>Show up. Stack your sessions. Build your better.</p><button onClick={() => onStartWorkout('amrap')}>Start a session <ArrowRight size={16}/></button></div>
      <div className="sidebar-footer"><span className="athlete-avatar">Y</span><div><strong>Your athlete space</strong><small>Saved on this device</small></div><span className="online-dot"/></div>
    </aside>
    <main className="fit-main">
      <header className="fit-topbar"><div><span className="breadcrumb">Training hub <ChevronRight size={13}/></span><strong>{page === 'overview' ? 'Overview' : page === 'library' ? 'Workout library' : 'Activity history'}</strong></div><div className="topbar-actions"><span className="today-date">{today.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span><button className="icon-button" onClick={onToggleSound} aria-label={soundEnabled ? 'Mute workout sounds' : 'Enable workout sounds'}>{soundEnabled ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button><span className="athlete-avatar">Y</span></div></header>
      <div className="fit-content">
        <section className="page-heading"><div><div className="eyebrow"><span/> YOUR PACE. YOUR PROGRESS.</div><h1>{page === 'overview' ? 'LET’S GET AFTER IT.' : page === 'library' ? 'PICK YOUR CHALLENGE.' : 'THE WORK YOU PUT IN.'}</h1><p>{page === 'overview' ? 'One session closer to your strongest self.' : page === 'library' ? 'Choose a routine, make it yours, and get moving.' : 'Every session is a step forward. See how far you’ve come.'}</p></div><button className="fit-secondary compact" onClick={() => onStartWorkout('amrap')}><Plus size={18}/>Create workout</button></section>
        {notice && <div className="fit-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}
        {page === 'overview' && <>
          <section className="overview-grid"><div className="training-hero">
            <div className="hero-lines" aria-hidden="true"/>
            <div className="hero-content">
              <span className="hero-tag"><span/> BUILT ONE REP AT A TIME</span>
              <h2>SHOW UP.<br/><em>GO ALL IN.</em></h2>
              <p>No perfect moment. Just you, a timer,<br/>and the next ten minutes.</p>
              <button className="fit-primary" onClick={() => onSelectTemplate(trainingTemplates[0].config)}>Start Workout <ArrowUpRight size={20}/></button>
              <div className="hero-meta"><Clock3 size={14}/>10 min <span>/</span> Bodyweight <span>/</span> Foundation</div>
            </div>
            <div className="hero-track" aria-hidden="true">
              <div className="track-lane lane-one"/><div className="track-lane lane-two"/><div className="track-lane lane-three"/>
              <span className="track-label">THE ONLY WAY IS FORWARD</span>
              <MoveUpRight className="track-arrow" strokeWidth={.8}/>
              <div className="track-session"><span>YOUR NEXT</span><strong>10<span>MIN</span></strong><span>STARTS WITH ONE REP.</span></div>
              <span className="track-corner">SC / 001</span>
            </div>
          </div>
          <div className="goal-card fit-card"><div className="section-top"><span className="eyebrow">WEEKLY GOAL</span><Target size={19}/></div><div className="goal-ring" style={{ background: `conic-gradient(var(--accent) ${Math.min(activeDays / goal, 1) * 360}deg, var(--surface-soft) 0deg)` }}><div><strong>{activeDays}<span> / {goal}</span></strong><small>active days</small></div></div><div className="goal-bottom"><strong>{activeDays >= goal ? 'WEEKLY GOAL. DONE.' : 'BUILD YOUR CONSISTENCY.'}</strong><span>{activeDays >= goal ? 'Take a moment to celebrate your effort.' : `${goal - activeDays} more active ${goal - activeDays === 1 ? 'day' : 'days'} to reach your goal.`}</span></div><label className="goal-select">My weekly target<select aria-label="Weekly active day target" value={goal} onChange={e => { const next = Number(e.target.value); setGoal(next); persist('fit_goal', next); }}>{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} days</option>)}</select></label></div></section>
          <section className="stat-grid" aria-label="Training statistics">{[{ label: 'Workouts this week', value: weekSessions, icon: Dumbbell, note: 'Every session counts' }, { label: 'Training time', value: weeklyMinutes, unit: 'min', icon: Timer, note: 'Invested in yourself this week' }, { label: 'Current streak', value: getStreak(sessions), unit: 'days', icon: Flame, note: 'One day at a time' }, { label: 'Lifetime rounds', value: sessions.reduce((s, x) => s + x.totalSets, 0), icon: Trophy, note: `${sessions.length} sessions in your history` }].map(s => <div className="fit-card stat-card" key={s.label}><div className="stat-label">{s.label}<span className="stat-icon"><s.icon size={17}/></span></div><div className="stat-number">{s.value}<span>{s.unit}</span></div><small>{s.note}</small></div>)}</section>
        </>}
        {page !== 'history' && <section className="library-section"><div className="section-heading"><div><h2>{page === 'overview' ? 'THE NEXT CHALLENGE' : 'Workout library'} <span className="count-badge">{trainingTemplates.length}</span></h2><p>Less scrolling, more training. Pick a session that fits your day.</p></div>{page === 'overview' && <button className="text-button" onClick={() => setPage('library')}>Explore library <ArrowRight size={16}/></button>}</div><div className="library-toolbar"><div className="category-tabs">{['All workouts', 'Bodyweight', 'Strength', 'Conditioning'].map(c => <button key={c} className={category === c ? 'active' : ''} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div><div className="library-search"><Search size={16}/><input aria-label="Search workouts" placeholder="Search workouts…" value={query} onChange={e => setQuery(e.target.value)}/><button className={onlySaved ? 'saved-filter active' : 'saved-filter'} aria-label="Show favourites only" aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}><Heart size={17} fill={onlySaved ? 'currentColor' : 'none'}/></button></div></div>
        <div className="workout-grid">{filtered.slice(0, page === 'overview' ? 3 : undefined).map((t) => <article className="workout-card fit-card" key={t.id}><div className={`workout-art art-${t.category.toLowerCase()}`}><span className="workout-category">{t.category}</span><span className="art-number" aria-hidden="true">{String(trainingTemplates.indexOf(t) + 1).padStart(2, '0')}</span><div className="workout-art-icon" aria-hidden="true">{t.category === 'Strength' ? <Dumbbell size={60} strokeWidth={1.3}/> : t.category === 'Conditioning' ? <Zap size={60} strokeWidth={1.3}/> : <Activity size={60} strokeWidth={1.3}/>}</div><button className="save-workout" onClick={() => toggleSaved(t.id)} aria-label={`${saved.includes(t.id) ? 'Unsave' : 'Save'} ${t.config.workoutName}`} aria-pressed={saved.includes(t.id)}><Heart size={18} fill={saved.includes(t.id) ? 'currentColor' : 'none'}/></button></div><div className="workout-body"><div className="workout-tags"><span>{WORKOUT_MODE_LABELS[t.config.mode]}</span><span>{t.level}</span></div><h3>{t.config.workoutName}</h3><p>{t.description}</p><div className="workout-footer"><span><Clock3 size={14}/>{t.config.mode === 'fortime' ? `${t.config.forTimeConfig?.targetSets} rounds` : `${t.config.durationSeconds / 60} min`}</span><button onClick={() => onSelectTemplate(t.config)} aria-label={`Configure ${t.config.workoutName}`}>Let’s do it <ArrowRight size={16}/></button></div></div></article>)}</div>{filtered.length === 0 && <div className="empty-library"><Search size={26}/><h3>No workouts found</h3><p>Try a different search or category, or save a workout first.</p><button className="text-button" onClick={() => { setQuery(''); setCategory('All workouts'); setOnlySaved(false); }}>Reset filters</button></div>}</section>}
        {page === 'overview' && <section className="bottom-grid"><div className="fit-card activity-card"><div className="section-heading"><div><h2>FIND YOUR RHYTHM</h2><p>Showing up is the part that matters.</p></div><span className="subtle-badge">Last 7 days</span></div><div className="week-days">{week.map((d, i) => <div key={d.dateStr} className={i === 6 ? 'is-today' : ''}><div className={`day-circle ${d.sessionCount ? 'completed' : ''}`}>{d.sessionCount ? <Check size={21}/> : <span/>}</div><span>{d.label}</span><small>{d.sessionCount ? `${d.sessionCount} session${d.sessionCount > 1 ? 's' : ''}` : i === 6 ? 'Today' : '—'}</small></div>)}</div></div><div className="fit-card water-card"><div className="section-top"><span className="water-icon"><Droplets size={21}/></span><span className="subtle-badge">DAILY CHECK-IN</span></div><h2>REFUEL. REPEAT.</h2><p>Keep track of your water, one glass at a time.</p><div className="water-controls"><strong>{water}<span> / 8 glasses</span></strong><div><button aria-label="Remove one glass" disabled={water === 0} onClick={() => { setWater(water - 1); persist(waterKey, water - 1); }}>−</button><button aria-label="Add one glass" disabled={water === 8} onClick={() => { setWater(water + 1); persist(waterKey, water + 1); }}><Plus size={17}/></button></div></div><div className="water-segments" aria-label={`${water} of 8 glasses logged`}>{Array.from({ length: 8 }, (_, i) => <span key={i} className={i < water ? 'filled' : ''}/>)}</div><small>Personal tracking target · 250 ml per glass</small></div></section>}
        {page === 'history' && <section className="fit-card history-panel"><div className="section-heading"><div><h2>Activity history</h2><p>Your sessions, stored on this device.</p></div><button className="fit-secondary" onClick={exportHistory} disabled={!sessions.length}><ArrowDownToLine size={16}/>Export JSON</button></div><History sessions={sessions} onClearHistory={onClearHistory}/></section>}
        <section className="quick-modes"><div><Timer size={19}/><strong>Just need a timer?</strong><span>Your workout. Your rules.</span></div><div>{(['amrap', 'emom', 'tabata', 'fortime'] as WorkoutMode[]).map(mode => <button key={mode} onClick={() => onStartWorkout(mode)}>{WORKOUT_MODE_LABELS[mode]}<ChevronRight size={14}/></button>)}</div></section>
        <footer className="fit-footer"><span>SETCOUNTER <span> / </span> SHOW UP. GO ALL IN.</span><span><span className="online-dot"/> Your progress stays on this device</span></footer>
      </div>
    </main>
  </div>;
}



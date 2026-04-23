import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Pause, Info, History, Play, Eye, GripHorizontal } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { WEEKLY_PLAN, Exercise } from '@/data/weeklyPlan';

// ─── Persistence helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = 'workout_weights_v1';
const TIMER_KEY   = 'workout_timer_v1';

type SavedWeight  = { weightKg: string; reps: string; date: string };
type SavedWeights = Record<string, SavedWeight>;

function loadSavedWeights(): SavedWeights {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); }
  catch { return {}; }
}
function saveWeight(exerciseId: string, setNumber: number, weightKg: string, reps: string) {
  const key = `${exerciseId}_set${setNumber}`;
  const all = loadSavedWeights();
  all[key] = { weightKg, reps, date: new Date().toISOString().split('T')[0] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
function getLastWeight(exerciseId: string, setNumber: number): SavedWeight | null {
  return loadSavedWeights()[`${exerciseId}_set${setNumber}`] ?? null;
}

// ─── Timer persistence ────────────────────────────────────────────────────────
function saveTimerState(endTime: number | null) {
  if (endTime === null) localStorage.removeItem(TIMER_KEY);
  else localStorage.setItem(TIMER_KEY, String(endTime));
}
function loadTimerEndTime(): number | null {
  const v = localStorage.getItem(TIMER_KEY);
  return v ? Number(v) : null;
}

// ─── Superset detection ───────────────────────────────────────────────────────
function getSupersetLabel(name: string): { group: string; order: number } | null {
  const m = name.match(/\(([A-Z])(\d)\)/);
  return m ? { group: m[1], order: parseInt(m[2]) } : null;
}
function cleanName(name: string) {
  return name.replace(/\s*\([A-Z]\d\)\s*/g, '').trim();
}

// ─── Local set state ──────────────────────────────────────────────────────────
type SetState = { id: string; setNumber: number; targetReps: number; actualReps: string; weightKg: string; completed: boolean };

function buildSets(targetSets: number, targetReps: number, prefix: string): SetState[] {
  return Array.from({ length: targetSets }, (_, i) => ({
    id: `${prefix}_s${i + 1}`, setNumber: i + 1, targetReps,
    actualReps: '', weightKg: '', completed: false,
  }));
}

// ─── Draggable Rest Timer ─────────────────────────────────────────────────────
function RestTimerOverlay({ seconds, total, onStop }: { seconds: number; total: number; onStop: () => void }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const startPos = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    startPos.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    dragging.current = true;
    startPos.current = { mx: t.clientX, my: t.clientY, ox: pos.x, oy: pos.y };
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  }
  function onMouseMove(e: MouseEvent) {
    if (!dragging.current) return;
    setPos({ x: startPos.current.ox + e.clientX - startPos.current.mx, y: startPos.current.oy + e.clientY - startPos.current.my });
  }
  function onTouchMove(e: TouchEvent) {
    if (!dragging.current) return;
    const t = e.touches[0];
    setPos({ x: startPos.current.ox + t.clientX - startPos.current.mx, y: startPos.current.oy + t.clientY - startPos.current.my });
  }
  function onMouseUp() { dragging.current = false; window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); }
  function onTouchEnd() { dragging.current = false; window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd); }

  const pct = total > 0 ? (total - seconds) / total : 0;
  const circumference = 2 * Math.PI * 28;

  return (
    <div
      style={{ transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)` }}
      className="fixed bottom-28 left-1/2 z-50 bg-background border border-border rounded-2xl shadow-xl p-4 flex items-center gap-4 min-w-[240px] cursor-grab active:cursor-grabbing select-none"
    >
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground/40 cursor-grab"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <GripHorizontal size={14} />
      </div>
      <svg width="64" height="64" className="flex-shrink-0 -rotate-90">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)}
          strokeLinecap="round" className="text-[#1A3A32] dark:text-emerald-400 transition-all duration-1000" />
        <text x="32" y="36" textAnchor="middle" className="fill-foreground text-sm font-bold" style={{ fontSize: 14, fontWeight: 700 }} transform="rotate(90, 32, 32)">
          {seconds}s
        </text>
      </svg>
      <div className="flex flex-col min-w-0">
        <p className="text-xs text-muted-foreground">Descanso</p>
        <p className="text-sm font-semibold text-foreground">Próxima serie</p>
      </div>
      <button onClick={onStop} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        <Pause size={14} className="text-muted-foreground" />
      </button>
    </div>
  );
}

// ─── Single Set Row ───────────────────────────────────────────────────────────
function SetRow({ row, exerciseId, onUpdate, onToggle }: {
  row: SetState; exerciseId: string;
  onUpdate: (id: string, field: 'actualReps' | 'weightKg', value: string) => void;
  onToggle: (id: string) => void;
}) {
  const last = getLastWeight(exerciseId, row.setNumber);
  return (
    <div className={cn('flex flex-col gap-2 py-3 px-3 rounded-xl transition-all duration-200',
      row.completed ? 'bg-[#1A3A32]/8 dark:bg-emerald-400/8' : 'bg-muted/50')}>
      <div className="flex items-center gap-2">
        <span className={cn('text-xs font-bold w-6 text-center flex-shrink-0',
          row.completed ? 'text-[#1A3A32] dark:text-emerald-400' : 'text-muted-foreground')}>
          {row.setNumber}
        </span>
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground mb-0.5">REPS</span>
            <input type="number" value={row.actualReps}
              onChange={e => onUpdate(row.id, 'actualReps', e.target.value)}
              placeholder={String(row.targetReps)}
              className="w-full h-10 text-center text-sm font-semibold bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground mb-0.5">KG</span>
            <input type="number" value={row.weightKg}
              onChange={e => onUpdate(row.id, 'weightKg', e.target.value)}
              placeholder={last ? last.weightKg : '—'} step="0.5"
              className="w-full h-10 text-center text-sm font-semibold bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30" />
          </div>
        </div>
        <button onClick={() => onToggle(row.id)}
          className={cn('w-10 h-10 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
            row.completed ? 'bg-[#1A3A32] dark:bg-emerald-500 border-[#1A3A32] dark:border-emerald-500' : 'border-border hover:border-[#1A3A32]/50')}>
          {row.completed && <Check size={16} className="text-white" strokeWidth={3} />}
        </button>
      </div>
      {last && (
        <div className="flex items-center gap-1.5 ml-8">
          <History size={10} className="text-muted-foreground flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground">
            Última vez: <span className="font-semibold text-foreground/70">{last.weightKg} kg × {last.reps} reps</span>
            <span className="ml-1 opacity-50">({last.date})</span>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Superset Row (two exercises side by side per round) ─────────────────────
function SupersetSetRow({ setNum, ex1, ex2, row1, row2, onUpdate1, onUpdate2, onToggle1, onToggle2 }: {
  setNum: number;
  ex1: Exercise; ex2: Exercise;
  row1: SetState; row2: SetState;
  onUpdate1: (id: string, field: 'actualReps' | 'weightKg', value: string) => void;
  onUpdate2: (id: string, field: 'actualReps' | 'weightKg', value: string) => void;
  onToggle1: (id: string) => void;
  onToggle2: (id: string) => void;
}) {
  const last1 = getLastWeight(ex1.id, setNum);
  const last2 = getLastWeight(ex2.id, setNum);
  const bothDone = row1.completed && row2.completed;

  return (
    <div className={cn('rounded-2xl border-2 overflow-hidden transition-all duration-200',
      bothDone ? 'border-[#1A3A32]/40 dark:border-emerald-400/40' : 'border-border')}>
      {/* Round header */}
      <div className={cn('flex items-center justify-between px-3 py-2 border-b border-border/50',
        bothDone ? 'bg-[#1A3A32]/8 dark:bg-emerald-400/8' : 'bg-muted/60')}>
        <span className={cn('text-xs font-bold', bothDone ? 'text-[#1A3A32] dark:text-emerald-400' : 'text-muted-foreground')}>
          Ronda {setNum}
        </span>
        {bothDone && <Check size={12} className="text-[#1A3A32] dark:text-emerald-400" strokeWidth={3} />}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 divide-x divide-border/50">
        {/* Exercise 1 */}
        <div className="flex flex-col gap-2 p-3">
          <p className="text-[10px] font-bold text-[#1A3A32] dark:text-emerald-400 leading-tight">
            {cleanName(ex1.name)}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-muted-foreground mb-0.5">REPS</span>
              <input type="number" inputMode="numeric" value={row1.actualReps}
                onChange={e => onUpdate1(row1.id, 'actualReps', e.target.value)}
                placeholder={String(row1.targetReps)}
                className={cn('w-full h-9 text-center text-sm font-semibold bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30',
                  row1.completed ? 'border-[#1A3A32]/30 dark:border-emerald-400/30' : 'border-border')} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-muted-foreground mb-0.5">KG</span>
              <input type="number" inputMode="decimal" value={row1.weightKg}
                onChange={e => onUpdate1(row1.id, 'weightKg', e.target.value)}
                placeholder={last1 ? last1.weightKg : '—'} step="0.5"
                className={cn('w-full h-9 text-center text-sm font-semibold bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30',
                  row1.completed ? 'border-[#1A3A32]/30 dark:border-emerald-400/30' : 'border-border')} />
            </div>
          </div>
          {last1 && (
            <p className="text-[9px] text-muted-foreground text-center">
              Ant: <span className="font-semibold">{last1.weightKg}kg×{last1.reps}</span>
            </p>
          )}
          <button onClick={() => onToggle1(row1.id)}
            className={cn('w-full h-8 rounded-lg border-2 flex items-center justify-center gap-1 text-[11px] font-semibold transition-all',
              row1.completed
                ? 'bg-[#1A3A32] dark:bg-emerald-500 border-[#1A3A32] dark:border-emerald-500 text-white'
                : 'border-border text-muted-foreground')}>
            {row1.completed ? <><Check size={11} strokeWidth={3} /> OK</> : 'Listo'}
          </button>
        </div>

        {/* Exercise 2 */}
        <div className="flex flex-col gap-2 p-3">
          <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 leading-tight">
            {cleanName(ex2.name)}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-muted-foreground mb-0.5">REPS</span>
              <input type="number" inputMode="numeric" value={row2.actualReps}
                onChange={e => onUpdate2(row2.id, 'actualReps', e.target.value)}
                placeholder={String(row2.targetReps)}
                className={cn('w-full h-9 text-center text-sm font-semibold bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/30',
                  row2.completed ? 'border-purple-400/30' : 'border-border')} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-muted-foreground mb-0.5">KG</span>
              <input type="number" inputMode="decimal" value={row2.weightKg}
                onChange={e => onUpdate2(row2.id, 'weightKg', e.target.value)}
                placeholder={last2 ? last2.weightKg : '—'} step="0.5"
                className={cn('w-full h-9 text-center text-sm font-semibold bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/30',
                  row2.completed ? 'border-purple-400/30' : 'border-border')} />
            </div>
          </div>
          {last2 && (
            <p className="text-[9px] text-muted-foreground text-center">
              Ant: <span className="font-semibold">{last2.weightKg}kg×{last2.reps}</span>
            </p>
          )}
          <button onClick={() => onToggle2(row2.id)}
            className={cn('w-full h-8 rounded-lg border-2 flex items-center justify-center gap-1 text-[11px] font-semibold transition-all',
              row2.completed
                ? 'bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500 text-white'
                : 'border-border text-muted-foreground')}>
            {row2.completed ? <><Check size={11} strokeWidth={3} /> OK</> : 'Listo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Day Selector ─────────────────────────────────────────────────────────────
const DAY_SELECTED_STYLES: Record<string, string> = {
  monday:    'border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  tuesday:   'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  wednesday: 'border-purple-400 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
  thursday:  'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  friday:    'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
  saturday:  'border-teal-400 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
};

function DaySelector({ selectedDay, onSelect }: { selectedDay: string; onSelect: (key: string) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {WEEKLY_PLAN.map(day => (
        <button key={day.dayKey} onClick={() => onSelect(day.dayKey)}
          className={cn('flex flex-col items-center gap-0.5 min-w-[52px] py-2 px-1 rounded-xl border-2 transition-all duration-200',
            selectedDay === day.dayKey ? DAY_SELECTED_STYLES[day.dayKey] : 'border-border bg-card text-muted-foreground hover:border-border/70')}>
          <span className="text-[10px] font-bold">{day.dayShort}</span>
          <span className="text-[9px] leading-tight text-center opacity-80">{day.muscleGroup.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Preview card ─────────────────────────────────────────────────────────────
function ExercisePreviewCard({ exercise, index, isActive, onClick }: {
  exercise: Exercise; index: number; isActive: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={cn('w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98]',
        isActive ? 'bg-[#1A3A32]/8 dark:bg-emerald-400/8 border-[#1A3A32]/30 dark:border-emerald-400/30' : 'bg-card border-border')}>
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold',
        isActive ? 'bg-[#1A3A32] dark:bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{exercise.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{exercise.muscleGroup} · {exercise.targetSets}×{exercise.targetReps} reps</p>
      </div>
      {isActive && <div className="w-2 h-2 rounded-full bg-[#1A3A32] dark:bg-emerald-400 flex-shrink-0" />}
    </button>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function WorkoutLoggerScreen() {
  const { setActiveScreen, activeWorkoutDayKey, activeWorkoutMode,
    restTimer, restTimerActive, restTimerTotal, startRestTimer, tickRestTimer, stopRestTimer } = useAppStore();

  const [selectedDayKey, setSelectedDayKey] = useState(activeWorkoutDayKey || (() => {
    const d = new Date().getDay();
    const keys = ['monday','tuesday','wednesday','thursday','friday','saturday'];
    return d >= 1 && d <= 6 ? keys[d - 1] : 'monday';
  })());

  const [mode, setMode] = useState<'preview' | 'active'>(activeWorkoutMode || 'preview');
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);

  // Local sets state — keyed by exercise id
  const [setsMap, setSetsMap] = useState<Record<string, SetState[]>>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dayPlan  = WEEKLY_PLAN.find(d => d.dayKey === selectedDayKey)!;
  const exercise = dayPlan.exercises[activeExerciseIdx];
  const nextExercise = activeExerciseIdx < dayPlan.exercises.length - 1
    ? dayPlan.exercises[activeExerciseIdx + 1]
    : null;

  // Detect if current exercise is part of a superset
  const superLabel = getSupersetLabel(exercise.name);
  const isSuperset = !!superLabel;

  // Find paired exercise for superset
  const pairedExercise: Exercise | null = (() => {
    if (!superLabel) return null;
    const pairedOrder = superLabel.order === 1 ? 2 : 1;
    return dayPlan.exercises.find(e => {
      const sl = getSupersetLabel(e.name);
      return sl?.group === superLabel.group && sl?.order === pairedOrder;
    }) ?? null;
  })();

  // Always show the "first" exercise of the pair (order=1) so UI is consistent
  const ex1 = (superLabel && superLabel.order === 1) ? exercise : (pairedExercise ?? exercise);
  const ex2 = (superLabel && superLabel.order === 1) ? (pairedExercise ?? exercise) : exercise;

  // When navigating to a superset exercise that is order=2, jump to order=1 instead
  useEffect(() => {
    if (mode === 'active' && superLabel && superLabel.order === 2 && pairedExercise) {
      const pairIdx = dayPlan.exercises.findIndex(e => e.id === pairedExercise.id);
      if (pairIdx !== -1 && pairIdx !== activeExerciseIdx) {
        setActiveExerciseIdx(pairIdx);
      }
    }
  }, [activeExerciseIdx]);

  // Init sets for current exercise(s)
  useEffect(() => {
    if (mode !== 'active') return;
    setSetsMap(prev => {
      const next = { ...prev };
      if (!next[exercise.id]) {
        next[exercise.id] = buildSets(exercise.targetSets, exercise.targetReps, exercise.id);
      }
      if (pairedExercise && !next[pairedExercise.id]) {
        next[pairedExercise.id] = buildSets(pairedExercise.targetSets, pairedExercise.targetReps, pairedExercise.id);
      }
      return next;
    });
  }, [activeExerciseIdx, mode, selectedDayKey]);

  // Reset all when day changes
  useEffect(() => {
    setActiveExerciseIdx(0);
    setMode('preview');
    setSetsMap({});
  }, [selectedDayKey]);

  // Timer
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') {
        const endTime = loadTimerEndTime();
        if (endTime) {
          const remaining = Math.round((endTime - Date.now()) / 1000);
          if (remaining > 0) startRestTimer(remaining);
          else { saveTimerState(null); stopRestTimer(); }
        }
      }
    }
    document.addEventListener('visibilitychange', onVisible);
    onVisible();
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  useEffect(() => {
    if (restTimerActive) {
      timerRef.current = setInterval(() => tickRestTimer(), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      saveTimerState(null);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [restTimerActive, tickRestTimer]);

  // Current sets
  const sets1 = setsMap[ex1.id] ?? [];
  const sets2 = pairedExercise ? (setsMap[ex2.id] ?? []) : [];
  const allSets = isSuperset ? [...sets1, ...sets2] : sets1;
  const completedSets = allSets.filter(s => s.completed).length;

  function updateSet(exId: string, id: string, field: 'actualReps' | 'weightKg', value: string) {
    setSetsMap(prev => ({
      ...prev,
      [exId]: (prev[exId] ?? []).map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  }

  function toggleSet(exId: string, id: string, restSecs: number) {
    setSetsMap(prev => {
      const rows = prev[exId] ?? [];
      const row = rows.find(s => s.id === id);
      if (!row) return prev;
      if (row.weightKg || row.actualReps) {
        saveWeight(exId, row.setNumber, row.weightKg, row.actualReps || String(row.targetReps));
      }
      const endTime = Date.now() + restSecs * 1000;
      saveTimerState(endTime);
      startRestTimer(restSecs);
      return { ...prev, [exId]: rows.map(s => s.id === id ? { ...s, completed: !s.completed } : s) };
    });
  }

  function handleStopTimer() { saveTimerState(null); stopRestTimer(); }

  function startRoutine(idx = 0) {
    setActiveExerciseIdx(idx);
    setMode('active');
    setSetsMap({});
  }

  function goToExercise(idx: number) {
    const target = dayPlan.exercises[idx];
    const tLabel = getSupersetLabel(target.name);
    // If navigating to order=2 of a superset, find order=1 instead
    if (tLabel && tLabel.order === 2) {
      const pairIdx = dayPlan.exercises.findIndex(e => {
        const sl = getSupersetLabel(e.name);
        return sl?.group === tLabel.group && sl?.order === 1;
      });
      if (pairIdx !== -1) { setActiveExerciseIdx(pairIdx); return; }
    }
    setActiveExerciseIdx(idx);
  }

  // For navigation: next exercise skips the paired one
  function goNext() {
    let next = activeExerciseIdx + 1;
    if (pairedExercise) {
      const pairIdx = dayPlan.exercises.findIndex(e => e.id === pairedExercise.id);
      if (pairIdx === next) next++;
    }
    if (next < dayPlan.exercises.length) goToExercise(next);
  }
  function goPrev() {
    let prev = activeExerciseIdx - 1;
    // If prev is order=2, skip it
    if (prev >= 0) {
      const prevEx = dayPlan.exercises[prev];
      const pl = getSupersetLabel(prevEx.name);
      if (pl && pl.order === 2) prev--;
    }
    if (prev >= 0) goToExercise(prev);
  }

  const isLastExercise = (() => {
    let next = activeExerciseIdx + 1;
    if (pairedExercise) {
      const pairIdx = dayPlan.exercises.findIndex(e => e.id === pairedExercise.id);
      if (pairIdx === next) next++;
    }
    return next >= dayPlan.exercises.length;
  })();

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => setActiveScreen('agenda')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-semibold', dayPlan.color)}>{dayPlan.muscleGroup}</p>
          <h1 className="text-sm font-bold text-foreground truncate">{dayPlan.dayName} — Entrenamiento</h1>
        </div>
        {mode === 'active' && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Ejercicio</p>
            <p className="text-xs font-bold text-[#1A3A32] dark:text-emerald-400">{activeExerciseIdx + 1}/{dayPlan.exercises.length}</p>
          </div>
        )}
        {mode === 'preview' && (
          <DaySelector selectedDay={selectedDayKey} onSelect={k => setSelectedDayKey(k)} />
        )}
      </div>

      <div className="overflow-y-auto pb-28">
        {/* ── PREVIEW MODE ── */}
        {mode === 'preview' && (
          <div className="px-4 py-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {dayPlan.exercises.map((ex, i) => (
                <ExercisePreviewCard key={ex.id} exercise={ex} index={i}
                  isActive={i === activeExerciseIdx} onClick={() => setActiveExerciseIdx(i)} />
              ))}
            </div>

            {/* Active exercise detail */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="aspect-video w-full bg-muted overflow-hidden rounded-2xl">
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.onerror = null;
                    t.src = `https://img.youtube.com/vi/${exercise.youtubeId}/hqdefault.jpg`;
                  }}
                />
              </div>
              <div>
                <p className={cn('text-xs font-medium', dayPlan.color)}>{exercise.muscleGroup}</p>
                <h2 className="text-xl font-bold text-foreground mt-0.5">{exercise.name}</h2>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Series', value: `${exercise.targetSets}` },
                  { label: 'Reps', value: `${exercise.targetReps}` },
                  { label: 'Descanso', value: `${exercise.restSeconds}s` },
                  { label: 'Tempo', value: exercise.tempo },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted rounded-xl px-2 py-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#1A3A32]/5 dark:bg-emerald-400/5 border border-[#1A3A32]/15 dark:border-emerald-400/15 rounded-xl p-3 flex gap-2">
                <Info size={14} className="text-[#1A3A32] dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">{exercise.description}</p>
              </div>
            </div>
            <button onClick={() => startRoutine(0)}
              className="w-full h-14 bg-[#1A3A32] dark:bg-emerald-500 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <Play size={18} className="fill-current" /> Empezar rutina
            </button>
          </div>
        )}

        {/* ── ACTIVE MODE ── */}
        {mode === 'active' && (
          <>
            {/* Image — show ex1 image, or split for superset */}
            <div className="aspect-video w-full bg-muted overflow-hidden">
              {isSuperset && pairedExercise ? (
                <div className="w-full h-full grid grid-cols-2">
                  <img src={ex1.imageUrl} alt={ex1.name} className="w-full h-full object-cover"
                    onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = `https://img.youtube.com/vi/${ex1.youtubeId}/hqdefault.jpg`; }} />
                  <img src={ex2.imageUrl} alt={ex2.name} className="w-full h-full object-cover border-l border-border/30"
                    onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = `https://img.youtube.com/vi/${ex2.youtubeId}/hqdefault.jpg`; }} />
                </div>
              ) : (
                <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover"
                  onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = `https://img.youtube.com/vi/${exercise.youtubeId}/hqdefault.jpg`; }} />
              )}
            </div>

            <div className="px-4 py-4 flex flex-col gap-4">
              {/* Title + dots */}
              <div className="flex items-start justify-between">
                <div>
                  <p className={cn('text-xs font-medium', dayPlan.color)}>
                    {isSuperset && pairedExercise ? `SUPERSERIE ${superLabel?.group}` : exercise.muscleGroup}
                  </p>
                  {isSuperset && pairedExercise ? (
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <h2 className="text-base font-bold text-[#1A3A32] dark:text-emerald-400">{cleanName(ex1.name)}</h2>
                      <span className="text-xs text-muted-foreground">+</span>
                      <h2 className="text-base font-bold text-purple-600 dark:text-purple-400">{cleanName(ex2.name)}</h2>
                    </div>
                  ) : (
                    <h2 className="text-xl font-bold text-foreground mt-0.5">{exercise.name}</h2>
                  )}
                </div>
                <div className="flex gap-1.5 mt-1">
                  {dayPlan.exercises.map((_, i) => (
                    <button key={i} onClick={() => goToExercise(i)}
                      className={cn('h-2 rounded-full transition-all duration-200',
                        i === activeExerciseIdx ? 'w-5 bg-[#1A3A32] dark:bg-emerald-400' : 'w-2 bg-border hover:bg-muted-foreground')} />
                  ))}
                </div>
              </div>

              {/* Stats chips */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Series', value: `${exercise.targetSets}` },
                  { label: 'Reps obj.', value: `${exercise.targetReps}` },
                  { label: 'Descanso', value: `${exercise.restSeconds}s` },
                  { label: 'Tempo', value: exercise.tempo },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted rounded-xl px-2 py-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#1A3A32]/5 dark:bg-emerald-400/5 border border-[#1A3A32]/15 dark:border-emerald-400/15 rounded-xl p-3 flex gap-2">
                <Info size={14} className="text-[#1A3A32] dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">{exercise.description}</p>
              </div>

              <button onClick={() => setMode('preview')}
                className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground py-1">
                <Eye size={14} /> Ver todos los ejercicios
              </button>

              {/* Sets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {isSuperset ? `Superserie ${superLabel?.group}` : 'Series'} ({completedSets}/{allSets.length})
                  </h3>
                  <span className="text-xs text-muted-foreground">Reps · Peso</span>
                </div>

                <div className="flex flex-col gap-2">
                  {isSuperset && pairedExercise ? (
                    // Superset: render one SupersetSetRow per round
                    sets1.map((row1, i) => {
                      const row2 = sets2[i];
                      if (!row2) return null;
                      return (
                        <SupersetSetRow
                          key={row1.id}
                          setNum={i + 1}
                          ex1={ex1} ex2={ex2}
                          row1={row1} row2={row2}
                          onUpdate1={(id, field, val) => updateSet(ex1.id, id, field, val)}
                          onUpdate2={(id, field, val) => updateSet(ex2.id, id, field, val)}
                          onToggle1={(id) => toggleSet(ex1.id, id, exercise.restSeconds)}
                          onToggle2={(id) => toggleSet(ex2.id, id, exercise.restSeconds)}
                        />
                      );
                    })
                  ) : (
                    sets1.map(row => (
                      <SetRow key={row.id} row={row} exerciseId={exercise.id}
                        onUpdate={(id, field, val) => updateSet(exercise.id, id, field, val)}
                        onToggle={(id) => toggleSet(exercise.id, id, exercise.restSeconds)} />
                    ))
                  )}
                </div>
              </div>

              {/* Next exercise */}
              {nextExercise && (
                <div className="bg-muted/60 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full bg-[#1A3A32]/30 dark:bg-emerald-400/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Siguiente</p>
                    <p className="text-sm font-semibold text-foreground truncate">{nextExercise.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {nextExercise.targetSets}×{nextExercise.targetReps}
                  </span>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-2">
                {activeExerciseIdx > 0 && (
                  <button onClick={goPrev}
                    className="flex-1 h-12 bg-muted rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                    <ChevronUp size={16} /> Anterior
                  </button>
                )}
                {!isLastExercise ? (
                  <button onClick={goNext}
                    className="flex-1 h-12 bg-[#1A3A32] dark:bg-emerald-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    Siguiente <ChevronDown size={16} />
                  </button>
                ) : (
                  <button onClick={() => setActiveScreen('agenda')}
                    className="flex-1 h-12 bg-[#1A3A32] dark:bg-emerald-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    <Check size={16} /> Finalizar sesión
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {restTimerActive && <RestTimerOverlay seconds={restTimer} total={restTimerTotal} onStop={handleStopTimer} />}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Pause, Info, History, Play, Eye, GripHorizontal, Timer, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { WEEKLY_PLAN, Exercise } from '@/data/weeklyPlan';
import { ExerciseImage } from '@/components/ExerciseImage';

const WEIGHTS_KEY    = 'workout_weights_v1';
const REST_TIMER_KEY = 'workout_timer_v1';
const SESSION_KEY    = 'workout_session_v1';

type SavedWeight  = { weightKg: string; reps: string; date: string };
type SavedWeights = Record<string, SavedWeight>;
type SetState     = { id: string; setNumber: number; targetReps: number; actualReps: string; weightKg: string; completed: boolean };
type SessionData  = { dayKey: string; exerciseIdx: number; setsMap: Record<string, SetState[]>; startedAt: number };

function loadWeights(): SavedWeights {
  try { return JSON.parse(localStorage.getItem(WEIGHTS_KEY) ?? '{}'); } catch { return {}; }
}
function saveWeight(exerciseId: string, setNumber: number, weightKg: string, reps: string) {
  const all = loadWeights();
  all[`${exerciseId}_set${setNumber}`] = { weightKg, reps, date: new Date().toISOString().split('T')[0] };
  localStorage.setItem(WEIGHTS_KEY, JSON.stringify(all));
}
function getLastWeight(exerciseId: string, setNumber: number): SavedWeight | null {
  return loadWeights()[`${exerciseId}_set${setNumber}`] ?? null;
}
function saveRestEnd(v: number | null) {
  if (v === null) localStorage.removeItem(REST_TIMER_KEY);
  else localStorage.setItem(REST_TIMER_KEY, String(v));
}
function loadRestEnd(): number | null {
  const v = localStorage.getItem(REST_TIMER_KEY); return v ? Number(v) : null;
}
function saveSession(d: SessionData | null) {
  if (d === null) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(d));
}
function loadSession(): SessionData | null {
  try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function vibrate(p: number[]) {
  try { if ('vibrate' in navigator) navigator.vibrate(p); } catch {}
}
function buildSets(targetSets: number, targetReps: number, prefix: string): SetState[] {
  return Array.from({ length: targetSets }, (_, i) => ({
    id: `${prefix}_s${i + 1}`, setNumber: i + 1, targetReps, actualReps: '', weightKg: '', completed: false,
  }));
}
function getSupersetLabel(name: string): { group: string; order: number } | null {
  const m = name.match(/\(([A-Z])(\d)\)/); return m ? { group: m[1], order: parseInt(m[2]) } : null;
}
function cleanName(name: string) { return name.replace(/\s*\([A-Z]\d\)\s*/g, '').trim(); }
function fmtTime(s: number) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

// ─── Workout Duration Banner ──────────────────────────────────────────────────
function WorkoutBanner({ startedAt, onFinish }: { startedAt: number; onFinish: () => void }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startedAt) / 1000));
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-[#1A3A32] dark:bg-emerald-900">
      <div className="flex items-center gap-2">
        <Timer size={14} className="text-emerald-300" />
        <span className="text-xs font-semibold text-emerald-100">Entrenamiento en curso</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-white tabular-nums">{fmtTime(elapsed)}</span>
        <button onClick={onFinish} className="flex items-center gap-1 text-[11px] font-semibold text-emerald-200 bg-emerald-800/60 px-2 py-1 rounded-lg">
          <X size={11} /> Finalizar
        </button>
      </div>
    </div>
  );
}

// ─── Rest Timer Overlay ───────────────────────────────────────────────────────
function RestTimerOverlay({ seconds, total, onStop }: { seconds: number; total: number; onStop: () => void }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const sp = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  function onMD(e: React.MouseEvent) { dragging.current = true; sp.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y }; window.addEventListener('mousemove', onMM); window.addEventListener('mouseup', onMU); }
  function onTS(e: React.TouchEvent) { const t = e.touches[0]; dragging.current = true; sp.current = { mx: t.clientX, my: t.clientY, ox: pos.x, oy: pos.y }; window.addEventListener('touchmove', onTM); window.addEventListener('touchend', onTU); }
  function onMM(e: MouseEvent) { if (!dragging.current) return; setPos({ x: sp.current.ox + e.clientX - sp.current.mx, y: sp.current.oy + e.clientY - sp.current.my }); }
  function onTM(e: TouchEvent) { if (!dragging.current) return; const t = e.touches[0]; setPos({ x: sp.current.ox + t.clientX - sp.current.mx, y: sp.current.oy + t.clientY - sp.current.my }); }
  function onMU() { dragging.current = false; window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU); }
  function onTU() { dragging.current = false; window.removeEventListener('touchmove', onTM); window.removeEventListener('touchend', onTU); }
  const pct = total > 0 ? (total - seconds) / total : 0;
  const circ = 2 * Math.PI * 28;
  return (
    <div style={{ transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)` }}
      className="fixed bottom-28 left-1/2 z-50 bg-background border border-border rounded-2xl shadow-xl p-4 flex items-center gap-4 min-w-[240px] cursor-grab active:cursor-grabbing select-none">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground/40" onMouseDown={onMD} onTouchStart={onTS}><GripHorizontal size={14} /></div>
      <svg width="64" height="64" className="flex-shrink-0 -rotate-90">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" className="text-[#1A3A32] dark:text-emerald-400 transition-all duration-1000" />
        <text x="32" y="36" textAnchor="middle" fill="currentColor" style={{ fontSize: 14, fontWeight: 700 }} transform="rotate(90,32,32)">{seconds}s</text>
      </svg>
      <div className="flex flex-col min-w-0">
        <p className="text-xs text-muted-foreground">Descanso</p>
        <p className="text-sm font-semibold text-foreground">Próxima serie</p>
      </div>
      <button onClick={onStop} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Pause size={14} className="text-muted-foreground" /></button>
    </div>
  );
}

// ─── SetRow ───────────────────────────────────────────────────────────────────
function SetRow({ row, exerciseId, onUpdate, onToggle }: {
  row: SetState; exerciseId: string;
  onUpdate: (id: string, field: 'actualReps' | 'weightKg', value: string) => void;
  onToggle: (id: string) => void;
}) {
  const last = getLastWeight(exerciseId, row.setNumber);
  // Local state so typing doesn't lose focus due to parent re-render
  const [reps, setReps] = useState(row.actualReps);
  const [kg, setKg]     = useState(row.weightKg);

  return (
    <div className={cn('rounded-xl overflow-hidden transition-all duration-200 border',
      row.completed ? 'border-[#1A3A32]/30 dark:border-emerald-400/30 bg-[#1A3A32]/5 dark:bg-emerald-400/5' : 'border-border bg-muted/30')}>
      <div className="grid grid-cols-4 text-center border-b border-border/40 bg-muted/50">
        <div className="py-1 border-r border-border/40"><span className="text-[9px] font-bold text-muted-foreground">SERIE</span></div>
        <div className="py-1 border-r border-border/40"><span className="text-[9px] font-bold text-muted-foreground">SEM. ANT.</span></div>
        <div className="py-1 border-r border-border/40"><span className="text-[9px] font-bold text-muted-foreground">REPS</span></div>
        <div className="py-1"><span className="text-[9px] font-bold text-muted-foreground">KG</span></div>
      </div>
      <div className="grid grid-cols-4 items-center">
        <button onClick={() => { onUpdate(row.id, 'actualReps', reps); onUpdate(row.id, 'weightKg', kg); onToggle(row.id); }}
          className={cn('flex flex-col items-center justify-center h-14 border-r border-border/40 gap-0.5 transition-all',
            row.completed ? 'bg-[#1A3A32] dark:bg-emerald-500' : 'hover:bg-muted/60')}>
          <span className={cn('text-sm font-bold', row.completed ? 'text-white' : 'text-foreground')}>{row.setNumber}</span>
          {row.completed && <Check size={11} className="text-white" strokeWidth={3} />}
        </button>
        <div className="flex flex-col items-center justify-center h-14 border-r border-border/40 px-1">
          {last ? (
            <>
              <span className="text-xs font-bold text-[#1A3A32] dark:text-emerald-400">{last.weightKg}<span className="text-[9px] font-normal">kg</span></span>
              <span className="text-[10px] text-muted-foreground">{last.reps}r</span>
            </>
          ) : <span className="text-xs text-muted-foreground/40">—</span>}
        </div>
        <div className="flex items-center justify-center h-14 border-r border-border/40 px-1.5">
          <input
            type="text" inputMode="numeric"
            value={reps}
            onChange={e => setReps(e.target.value)}
            onBlur={() => onUpdate(row.id, 'actualReps', reps)}
            placeholder={String(row.targetReps)}
            disabled={row.completed}
            className="w-full h-9 text-center text-sm font-semibold bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30 disabled:opacity-40"
          />
        </div>
        <div className="flex items-center justify-center h-14 px-1.5">
          <input
            type="text" inputMode="decimal"
            value={kg}
            onChange={e => setKg(e.target.value)}
            onBlur={() => onUpdate(row.id, 'weightKg', kg)}
            placeholder={last ? last.weightKg : '0'}
            disabled={row.completed}
            className="w-full h-9 text-center text-sm font-semibold bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30 disabled:opacity-40"
          />
        </div>
      </div>
    </div>
  );
}
function SupersetSetRow({ setNum, ex1, ex2, row1, row2, onUpdate1, onUpdate2, onCompleteRound }: {
  setNum: number;
  ex1: Exercise; ex2: Exercise;
  row1: SetState; row2: SetState;
  onUpdate1: (id: string, field: 'actualReps' | 'weightKg', value: string) => void;
  onUpdate2: (id: string, field: 'actualReps' | 'weightKg', value: string) => void;
  onCompleteRound: () => void;
}) {
  const last1 = getLastWeight(ex1.id, setNum);
  const last2 = getLastWeight(ex2.id, setNum);
  const roundDone = row1.completed && row2.completed;

  // Local state so typing doesn't lose focus due to parent re-render
  const [reps1, setReps1] = useState(row1.actualReps);
  const [kg1, setKg1]     = useState(row1.weightKg);
  const [reps2, setReps2] = useState(row2.actualReps);
  const [kg2, setKg2]     = useState(row2.weightKg);

  function handleComplete() {
    // Flush local state to parent before completing
    onUpdate1(row1.id, 'actualReps', reps1);
    onUpdate1(row1.id, 'weightKg', kg1);
    onUpdate2(row2.id, 'actualReps', reps2);
    onUpdate2(row2.id, 'weightKg', kg2);
    // Small delay so state updates propagate before completing
    setTimeout(onCompleteRound, 50);
  }

  return (
    <div className={cn(
      'rounded-2xl overflow-hidden border-2 transition-all duration-200',
      roundDone ? 'border-[#1A3A32]/40 dark:border-emerald-400/40 opacity-70' : 'border-border bg-card'
    )}>
      {/* Round header */}
      <div className={cn(
        'flex items-center justify-between px-4 py-2 border-b border-border/50',
        roundDone ? 'bg-[#1A3A32]/8 dark:bg-emerald-400/8' : 'bg-muted/40'
      )}>
        <span className={cn('text-xs font-bold', roundDone ? 'text-[#1A3A32] dark:text-emerald-400' : 'text-muted-foreground')}>
          Ronda {setNum}
        </span>
        {roundDone && (
          <div className="flex items-center gap-1 text-[#1A3A32] dark:text-emerald-400">
            <Check size={12} strokeWidth={3} />
            <span className="text-[10px] font-semibold">Completada</span>
          </div>
        )}
      </div>

      {/* Two exercises side by side */}
      <div className="grid grid-cols-2 divide-x divide-border/50">
        {/* Exercise 1 */}
        <div className="p-3 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-[#1A3A32] dark:text-emerald-400 leading-tight truncate">
            {cleanName(ex1.name)}
          </p>
          {last1 ? (
            <div className="flex items-center gap-1 bg-[#1A3A32]/5 dark:bg-emerald-400/5 rounded-lg px-2 py-1">
              <History size={9} className="text-[#1A3A32] dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[10px] text-[#1A3A32] dark:text-emerald-400 font-semibold">{last1.weightKg}kg × {last1.reps}r</span>
            </div>
          ) : <div className="h-6" />}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-muted-foreground">REPS</span>
              <input
                type="text" inputMode="numeric"
                value={reps1}
                onChange={e => setReps1(e.target.value)}
                onBlur={() => onUpdate1(row1.id, 'actualReps', reps1)}
                placeholder={String(row1.targetReps)}
                disabled={roundDone}
                className="w-full h-10 text-center text-sm font-semibold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-muted-foreground">KG</span>
              <input
                type="text" inputMode="decimal"
                value={kg1}
                onChange={e => setKg1(e.target.value)}
                onBlur={() => onUpdate1(row1.id, 'weightKg', kg1)}
                placeholder={last1 ? last1.weightKg : '0'}
                disabled={roundDone}
                className="w-full h-10 text-center text-sm font-semibold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Exercise 2 */}
        <div className="p-3 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 leading-tight truncate">
            {cleanName(ex2.name)}
          </p>
          {last2 ? (
            <div className="flex items-center gap-1 bg-purple-500/5 rounded-lg px-2 py-1">
              <History size={9} className="text-purple-500 flex-shrink-0" />
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">{last2.weightKg}kg × {last2.reps}r</span>
            </div>
          ) : <div className="h-6" />}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-muted-foreground">REPS</span>
              <input
                type="text" inputMode="numeric"
                value={reps2}
                onChange={e => setReps2(e.target.value)}
                onBlur={() => onUpdate2(row2.id, 'actualReps', reps2)}
                placeholder={String(row2.targetReps)}
                disabled={roundDone}
                className="w-full h-10 text-center text-sm font-semibold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-muted-foreground">KG</span>
              <input
                type="text" inputMode="decimal"
                value={kg2}
                onChange={e => setKg2(e.target.value)}
                onBlur={() => onUpdate2(row2.id, 'weightKg', kg2)}
                placeholder={last2 ? last2.weightKg : '0'}
                disabled={roundDone}
                className="w-full h-10 text-center text-sm font-semibold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Complete round button */}
      {!roundDone && (
        <div className="px-3 pb-3 pt-1">
          <button
            onClick={handleComplete}
            className="w-full h-11 bg-[#1A3A32] dark:bg-emerald-500 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Check size={16} strokeWidth={3} />
            Ronda {setNum} completada — iniciar descanso
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Day Selector ─────────────────────────────────────────────────────────────
const DAY_STYLES: Record<string, string> = {
  monday: 'border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  tuesday: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  wednesday: 'border-purple-400 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
  thursday: 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  friday: 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
  saturday: 'border-teal-400 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
};
function DaySelector({ selectedDay, onSelect }: { selectedDay: string; onSelect: (k: string) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {WEEKLY_PLAN.map(day => (
        <button key={day.dayKey} onClick={() => onSelect(day.dayKey)}
          className={cn('flex flex-col items-center gap-0.5 min-w-[52px] py-2 px-1 rounded-xl border-2 transition-all',
            selectedDay === day.dayKey ? DAY_STYLES[day.dayKey] : 'border-border bg-card text-muted-foreground')}>
          <span className="text-[10px] font-bold">{day.dayShort}</span>
          <span className="text-[9px] leading-tight text-center opacity-80">{day.muscleGroup.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Preview card ─────────────────────────────────────────────────────────────
function ExercisePreviewCard({ exercise, index, isActive, onClick }: { exercise: Exercise; index: number; isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn('w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]',
        isActive ? 'bg-[#1A3A32]/8 dark:bg-emerald-400/8 border-[#1A3A32]/30 dark:border-emerald-400/30' : 'bg-card border-border')}>
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold',
        isActive ? 'bg-[#1A3A32] dark:bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>{index + 1}</div>
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

  const saved = loadSession();

  const [selectedDayKey, setSelectedDayKey] = useState(saved?.dayKey ?? activeWorkoutDayKey ?? (() => {
    const d = new Date().getDay(); const k = ['monday','tuesday','wednesday','thursday','friday','saturday'];
    return d >= 1 && d <= 6 ? k[d - 1] : 'monday';
  })());
  const [mode, setMode]                       = useState<'preview' | 'active'>(saved ? 'active' : (activeWorkoutMode || 'preview'));
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(saved?.exerciseIdx ?? 0);
  const [setsMap, setSetsMap]                 = useState<Record<string, SetState[]>>(saved?.setsMap ?? {});
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number | null>(saved?.startedAt ?? null);

  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRestTimer = useRef(restTimer);

  const dayPlan  = WEEKLY_PLAN.find(d => d.dayKey === selectedDayKey)!;
  const exercise = dayPlan.exercises[activeExerciseIdx];

  const superLabel    = getSupersetLabel(exercise.name);
  const isSuperset    = !!superLabel;
  const pairedExercise: Exercise | null = (() => {
    if (!superLabel) return null;
    const po = superLabel.order === 1 ? 2 : 1;
    return dayPlan.exercises.find(e => { const sl = getSupersetLabel(e.name); return sl?.group === superLabel.group && sl?.order === po; }) ?? null;
  })();
  const ex1 = (superLabel && superLabel.order === 1) ? exercise : (pairedExercise ?? exercise);
  const ex2 = (superLabel && superLabel.order === 1) ? (pairedExercise ?? exercise) : exercise;

  // Persist session
  useEffect(() => {
    if (mode === 'active' && workoutStartedAt)
      saveSession({ dayKey: selectedDayKey, exerciseIdx: activeExerciseIdx, setsMap, startedAt: workoutStartedAt });
  }, [mode, selectedDayKey, activeExerciseIdx, setsMap, workoutStartedAt]);

  // Redirect order=2 superset to order=1
  useEffect(() => {
    if (mode === 'active' && superLabel?.order === 2 && pairedExercise) {
      const pi = dayPlan.exercises.findIndex(e => e.id === pairedExercise.id);
      if (pi !== -1 && pi !== activeExerciseIdx) setActiveExerciseIdx(pi);
    }
  }, [activeExerciseIdx]);

  // Init sets
  useEffect(() => {
    if (mode !== 'active') return;
    setSetsMap(prev => {
      const next = { ...prev };
      if (!next[exercise.id]) next[exercise.id] = buildSets(exercise.targetSets, exercise.targetReps, exercise.id);
      if (pairedExercise && !next[pairedExercise.id])
        next[pairedExercise.id] = buildSets(pairedExercise.targetSets, pairedExercise.targetReps, pairedExercise.id);
      return next;
    });
  }, [activeExerciseIdx, mode, selectedDayKey]);

  // Reset on manual day change (not from saved session)
  useEffect(() => {
    if (saved) return;
    setActiveExerciseIdx(0); setMode('preview'); setSetsMap({}); setWorkoutStartedAt(null);
  }, [selectedDayKey]);

  // Restore rest timer on visibility
  useEffect(() => {
    function onVis() {
      if (document.visibilityState !== 'visible') return;
      const end = loadRestEnd();
      if (!end) return;
      const rem = Math.round((end - Date.now()) / 1000);
      if (rem > 0) startRestTimer(rem); else { saveRestEnd(null); stopRestTimer(); }
    }
    document.addEventListener('visibilitychange', onVis);
    onVis();
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Rest timer tick
  useEffect(() => {
    if (restTimerActive) { restTimerRef.current = setInterval(() => tickRestTimer(), 1000); }
    else { if (restTimerRef.current) clearInterval(restTimerRef.current); saveRestEnd(null); }
    return () => { if (restTimerRef.current) clearInterval(restTimerRef.current); };
  }, [restTimerActive, tickRestTimer]);

  // Vibrate on rest timer end
  useEffect(() => {
    if (prevRestTimer.current > 0 && restTimer === 0 && !restTimerActive) vibrate([200, 100, 200, 100, 400]);
    prevRestTimer.current = restTimer;
  }, [restTimer, restTimerActive]);

  const sets1 = setsMap[ex1.id] ?? [];
  const sets2 = pairedExercise ? (setsMap[ex2.id] ?? []) : [];
  const allSets = isSuperset ? [...sets1, ...sets2] : sets1;
  const completedSets = allSets.filter(s => s.completed).length;

  const nextExercise = (() => {
    let next = activeExerciseIdx + 1;
    if (pairedExercise) { const pi = dayPlan.exercises.findIndex(e => e.id === pairedExercise.id); if (pi === next) next++; }
    return next < dayPlan.exercises.length ? dayPlan.exercises[next] : null;
  })();

  function startRestNow(secs: number) { const end = Date.now() + secs * 1000; saveRestEnd(end); startRestTimer(secs); }
  function handleStopTimer() { saveRestEnd(null); stopRestTimer(); }

  function updateSet(exId: string, id: string, field: 'actualReps' | 'weightKg', value: string) {
    setSetsMap(prev => ({ ...prev, [exId]: (prev[exId] ?? []).map(s => s.id === id ? { ...s, [field]: value } : s) }));
  }

  function toggleSet(exId: string, id: string) {
    setSetsMap(prev => {
      const rows = prev[exId] ?? [];
      const row = rows.find(s => s.id === id);
      if (!row || row.completed) return prev;
      if (row.weightKg || row.actualReps) saveWeight(exId, row.setNumber, row.weightKg, row.actualReps || String(row.targetReps));
      startRestNow(exercise.restSeconds || 120);
      return { ...prev, [exId]: rows.map(s => s.id === id ? { ...s, completed: true } : s) };
    });
  }

  function completeRound(roundIdx: number) {
    setSetsMap(prev => {
      const next = { ...prev };
      [ex1.id, ...(pairedExercise ? [ex2.id] : [])].forEach(id => {
        if (!next[id]) return;
        const row = next[id][roundIdx];
        if (row) {
          if (row.weightKg || row.actualReps) saveWeight(id, row.setNumber, row.weightKg, row.actualReps || String(row.targetReps));
          next[id] = next[id].map((s, i) => i === roundIdx ? { ...s, completed: true } : s);
        }
      });
      return next;
    });
    startRestNow(exercise.restSeconds || 120);
  }

  function startRoutine() {
    const t = Date.now();
    setWorkoutStartedAt(t); setActiveExerciseIdx(0); setMode('active'); setSetsMap({});
    saveSession({ dayKey: selectedDayKey, exerciseIdx: 0, setsMap: {}, startedAt: t });
  }

  function finishWorkout() {
    saveSession(null); saveRestEnd(null); stopRestTimer();
    setMode('preview'); setSetsMap({}); setWorkoutStartedAt(null); setActiveExerciseIdx(0);
    setActiveScreen('agenda');
  }

  function goToExercise(idx: number) {
    const tl = getSupersetLabel(dayPlan.exercises[idx].name);
    if (tl && tl.order === 2) {
      const pi = dayPlan.exercises.findIndex(e => { const sl = getSupersetLabel(e.name); return sl?.group === tl.group && sl?.order === 1; });
      if (pi !== -1) { setActiveExerciseIdx(pi); return; }
    }
    setActiveExerciseIdx(idx);
  }
  function goNext() {
    let next = activeExerciseIdx + 1;
    if (pairedExercise) { const pi = dayPlan.exercises.findIndex(e => e.id === pairedExercise.id); if (pi === next) next++; }
    if (next < dayPlan.exercises.length) goToExercise(next);
  }
  function goPrev() {
    let prev = activeExerciseIdx - 1;
    if (prev >= 0) { const pl = getSupersetLabel(dayPlan.exercises[prev].name); if (pl?.order === 2) prev--; }
    if (prev >= 0) goToExercise(prev);
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Workout duration banner */}
      {mode === 'active' && workoutStartedAt && <WorkoutBanner startedAt={workoutStartedAt} onFinish={finishWorkout} />}

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
        {mode === 'preview' && <DaySelector selectedDay={selectedDayKey} onSelect={k => setSelectedDayKey(k)} />}
      </div>

      <div className="overflow-y-auto pb-28">
        {/* PREVIEW */}
        {mode === 'preview' && (
          <div className="px-4 py-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {dayPlan.exercises.map((ex, i) => (
                <ExercisePreviewCard key={ex.id} exercise={ex} index={i} isActive={i === activeExerciseIdx} onClick={() => setActiveExerciseIdx(i)} />
              ))}
            </div>
            <div className="flex flex-col gap-3 mt-2">
               <div className="aspect-video w-full bg-white overflow-hidden rounded-2xl">
                 <ExerciseImage exerciseId={exercise.id} youtubeId={exercise.youtubeId} alt={exercise.name} className="w-full h-full" />

               </div>
              <div>
                <p className={cn('text-xs font-medium', dayPlan.color)}>{exercise.muscleGroup}</p>
                <h2 className="text-xl font-bold text-foreground mt-0.5">{exercise.name}</h2>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[['Series', exercise.targetSets], ['Reps', exercise.targetReps], ['Descanso', `${exercise.restSeconds}s`], ['Tempo', exercise.tempo]]
                  .map(([l, v]) => (
                    <div key={String(l)} className="bg-muted rounded-xl px-2 py-2.5 text-center">
                      <p className="text-[11px] text-muted-foreground">{l}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{v}</p>
                    </div>
                  ))}
              </div>
              <div className="bg-[#1A3A32]/5 border border-[#1A3A32]/15 rounded-xl p-3 flex gap-2">
                <Info size={14} className="text-[#1A3A32] dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">{exercise.description}</p>
              </div>
            </div>
            <button onClick={startRoutine}
              className="w-full h-14 bg-[#1A3A32] dark:bg-emerald-500 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <Play size={18} className="fill-current" /> Empezar rutina
            </button>
          </div>
        )}

        {/* ACTIVE */}
        {mode === 'active' && (
          <>
            <div className="aspect-video w-full bg-muted overflow-hidden">
              {isSuperset && pairedExercise ? (
                 <div className="w-full h-full grid grid-cols-2">
                   <ExerciseImage exerciseId={ex1.id} youtubeId={ex1.youtubeId} alt={ex1.name} className="w-full h-full" />
                   <ExerciseImage exerciseId={ex2.id} youtubeId={ex2.youtubeId} alt={ex2.name} className="w-full h-full border-l border-border/30" />
                 </div>
               ) : (
                 <ExerciseImage exerciseId={exercise.id} youtubeId={exercise.youtubeId} alt={exercise.name} className="w-full h-full" />
               )}
             </div>


            </div>

            <div className="px-4 py-4 flex flex-col gap-4">
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
                <div className="flex gap-1.5 mt-1 flex-wrap justify-end max-w-[100px]">
                  {dayPlan.exercises.map((_, i) => (
                    <button key={i} onClick={() => goToExercise(i)}
                      className={cn('h-2 rounded-full transition-all', i === activeExerciseIdx ? 'w-5 bg-[#1A3A32] dark:bg-emerald-400' : 'w-2 bg-border')} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[['Series', exercise.targetSets], ['Reps obj.', exercise.targetReps], ['Descanso', `${exercise.restSeconds}s`], ['Tempo', exercise.tempo]]
                  .map(([l, v]) => (
                    <div key={String(l)} className="bg-muted rounded-xl px-2 py-2.5 text-center">
                      <p className="text-[11px] text-muted-foreground">{l}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{v}</p>
                    </div>
                  ))}
              </div>

              <div className="bg-[#1A3A32]/5 border border-[#1A3A32]/15 rounded-xl p-3 flex gap-2">
                <Info size={14} className="text-[#1A3A32] dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">{exercise.description}</p>
              </div>

              <button onClick={() => setMode('preview')}
                className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground py-1">
                <Eye size={14} /> Ver todos los ejercicios
              </button>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {isSuperset ? `Superserie ${superLabel?.group}` : 'Series'} ({completedSets}/{allSets.length})
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  {isSuperset && pairedExercise ? (
                    sets1.map((row1, i) => {
                      const row2 = sets2[i];
                      if (!row2) return null;
                      return (
                        <SupersetSetRow key={row1.id} setNum={i + 1} ex1={ex1} ex2={ex2} row1={row1} row2={row2}
                          onUpdate1={(id, f, v) => updateSet(ex1.id, id, f, v)}
                          onUpdate2={(id, f, v) => updateSet(ex2.id, id, f, v)}
                          onCompleteRound={() => completeRound(i)} />
                      );
                    })
                  ) : (
                    sets1.map(row => (
                      <SetRow key={row.id} row={row} exerciseId={exercise.id}
                        onUpdate={(id, f, v) => updateSet(exercise.id, id, f, v)}
                        onToggle={id => toggleSet(exercise.id, id)} />
                    ))
                  )}
                </div>
              </div>

              {nextExercise && (
                <div className="bg-muted/60 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full bg-[#1A3A32]/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Siguiente</p>
                    <p className="text-sm font-semibold text-foreground truncate">{nextExercise.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{nextExercise.targetSets}×{nextExercise.targetReps}</span>
                </div>
              )}

              <div className="flex gap-2">
                {activeExerciseIdx > 0 && (
                  <button onClick={goPrev} className="flex-1 h-12 bg-muted rounded-xl text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2">
                    <ChevronUp size={16} /> Anterior
                  </button>
                )}
                {nextExercise ? (
                  <button onClick={goNext} className="flex-1 h-12 bg-[#1A3A32] dark:bg-emerald-500 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2">
                    Siguiente <ChevronDown size={16} />
                  </button>
                ) : (
                  <button onClick={finishWorkout} className="flex-1 h-12 bg-[#1A3A32] dark:bg-emerald-500 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2">
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

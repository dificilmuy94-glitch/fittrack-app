import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Pause, Info, History, Play, Eye } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { WEEKLY_PLAN, Exercise } from '@/data/weeklyPlan';

// ─── Persistence helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = 'workout_weights_v1';
type SavedWeight = { weightKg: string; reps: string; date: string };
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

// ─── Rest Timer ───────────────────────────────────────────────────────────────
function RestTimerOverlay({ seconds, total, onStop }: { seconds: number; total: number; onStop: () => void }) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-background border border-border rounded-2xl shadow-xl p-4 flex items-center gap-4 min-w-[240px]">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle cx="32" cy="32" r="28" fill="none" stroke="#1A3A32" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${(2 * Math.PI * 28) * (1 - (total - seconds) / total)}`}
            className="transition-all duration-1000 dark:stroke-emerald-400" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">{seconds}s</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">Descanso</p>
        <p className="text-sm font-semibold text-foreground">Próxima serie</p>
      </div>
      <button onClick={onStop} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        <Pause size={14} className="text-muted-foreground" />
      </button>
    </div>
  );
}

// ─── Set Row ──────────────────────────────────────────────────────────────────
type SetRowProps = {
  row: { id: string; setNumber: number; targetReps: number; actualReps: string; weightKg: string; completed: boolean };
  exerciseId: string;
  onUpdate: (id: string, field: 'actualReps' | 'weightKg', value: string) => void;
  onToggle: (id: string) => void;
};

function SetRow({ row, exerciseId, onUpdate, onToggle }: SetRowProps) {
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

// ─── Preview: exercise list card ──────────────────────────────────────────────
function ExercisePreviewCard({ exercise, index, isActive, onClick }: {
  exercise: Exercise; index: number; isActive: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98]',
        isActive ? 'bg-[#1A3A32]/8 dark:bg-emerald-400/8 border-[#1A3A32]/30 dark:border-emerald-400/30' : 'bg-card border-border'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold',
        isActive ? 'bg-[#1A3A32] dark:bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
      )}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{exercise.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{exercise.muscleGroup} · {exercise.targetSets}×{exercise.targetReps} reps</p>
      </div>
      {isActive && (
        <div className="w-2 h-2 rounded-full bg-[#1A3A32] dark:bg-emerald-400 flex-shrink-0" />
      )}
    </button>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function WorkoutLoggerScreen() {
  const { setActiveScreen, activeWorkoutSets, activeWorkoutDayKey, activeWorkoutMode, initWorkoutSets, updateSetField, toggleSetComplete,
    restTimer, restTimerActive, restTimerTotal, startRestTimer, tickRestTimer, stopRestTimer } = useAppStore();

  const [selectedDayKey, setSelectedDayKey] = useState(activeWorkoutDayKey || (() => {
    const d = new Date().getDay();
    const keys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return d >= 1 && d <= 6 ? keys[d - 1] : 'monday';
  })());

  // 'preview' = visualizar, 'active' = entrenar
  const [mode, setMode] = useState<'preview' | 'active'>(activeWorkoutMode || 'preview');
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dayPlan = WEEKLY_PLAN.find(d => d.dayKey === selectedDayKey)!;
  const exercise = dayPlan.exercises[activeExerciseIdx];

  useEffect(() => { setActiveExerciseIdx(0); setMode('preview'); }, [selectedDayKey]);
  useEffect(() => {
    if (mode === 'active') initWorkoutSets(exercise.targetSets, exercise.targetReps);
  }, [activeExerciseIdx, selectedDayKey, mode]);

  useEffect(() => {
    if (restTimerActive) { timerRef.current = setInterval(() => tickRestTimer(), 1000); }
    else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [restTimerActive, tickRestTimer]);

  const completedSets = activeWorkoutSets.filter(s => s.completed).length;

  const handleToggleSet = (id: string) => {
    const row = activeWorkoutSets.find(s => s.id === id);
    if (row) {
      toggleSetComplete(id);
      if (row.weightKg || row.actualReps) {
        saveWeight(exercise.id, row.setNumber, row.weightKg, row.actualReps || String(exercise.targetReps));
      }
      startRestTimer(exercise.restSeconds);
    }
  };

  function startRoutine(idx = 0) {
    setActiveExerciseIdx(idx);
    setMode('active');
    initWorkoutSets(dayPlan.exercises[idx].targetSets, dayPlan.exercises[idx].targetReps);
  }

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
          <button
            onClick={() => startRoutine(0)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A3A32] dark:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
          >
            <Play size={11} className="fill-current" />
            Empezar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Day selector */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Día de entrenamiento</p>
          <DaySelector selectedDay={selectedDayKey} onSelect={setSelectedDayKey} />
        </div>

        {/* Muscle group badge */}
        <div className={cn('mx-4 mb-3 rounded-xl px-3 py-2 flex items-center gap-2', dayPlan.colorBg)}>
          <span className={cn('text-xs font-bold', dayPlan.color)}>{dayPlan.dayName.toUpperCase()}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className={cn('text-xs font-semibold', dayPlan.color)}>{dayPlan.muscleGroup}</span>
          <span className="text-xs text-muted-foreground ml-auto">{dayPlan.exercises.length} ejercicios</span>
        </div>

        {/* ── PREVIEW MODE ── */}
        {mode === 'preview' && (
          <div className="px-4 flex flex-col gap-4">
            {/* Exercise list */}
            <div className="flex flex-col gap-2">
              {dayPlan.exercises.map((ex, i) => (
                <ExercisePreviewCard
                  key={ex.id}
                  exercise={ex}
                  index={i}
                  isActive={false}
                  onClick={() => setActiveExerciseIdx(i)}
                />
              ))}
            </div>

            {/* Selected exercise detail */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Video */}
              <div className="relative bg-black aspect-video">
                <iframe width="100%" height="100%"
                  src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                  title={exercise.name} frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen className="w-full h-full" />
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <p className={cn('text-xs font-medium', dayPlan.color)}>{exercise.muscleGroup}</p>
                  <h2 className="text-lg font-bold text-foreground mt-0.5">{exercise.name}</h2>
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
            </div>

            {/* Start button */}
            <button
              onClick={() => startRoutine(0)}
              className="w-full h-14 bg-[#1A3A32] dark:bg-emerald-500 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Play size={18} className="fill-current" />
              Empezar rutina
            </button>
          </div>
        )}

        {/* ── ACTIVE MODE ── */}
        {mode === 'active' && (
          <>
            {/* Video */}
            <div className="relative bg-black aspect-video">
              <iframe width="100%" height="100%"
                src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                title={exercise.name} frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen className="w-full h-full" />
            </div>

            <div className="px-4 py-4 flex flex-col gap-4">
              {/* Exercise info */}
              <div>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className={cn('text-xs font-medium', dayPlan.color)}>{exercise.muscleGroup}</p>
                    <h2 className="text-xl font-bold text-foreground">{exercise.name}</h2>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {dayPlan.exercises.map((_, i) => (
                      <button key={i} onClick={() => { setActiveExerciseIdx(i); initWorkoutSets(dayPlan.exercises[i].targetSets, dayPlan.exercises[i].targetReps); }}
                        className={cn('h-2 rounded-full transition-all duration-200',
                          i === activeExerciseIdx ? 'w-5 bg-[#1A3A32] dark:bg-emerald-400' : 'w-2 bg-border hover:bg-muted-foreground')} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
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
              </div>

              {/* Description */}
              <div className="bg-[#1A3A32]/5 dark:bg-emerald-400/5 border border-[#1A3A32]/15 dark:border-emerald-400/15 rounded-xl p-3 flex gap-2">
                <Info size={14} className="text-[#1A3A32] dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">{exercise.description}</p>
              </div>

              {/* View preview button */}
              <button
                onClick={() => setMode('preview')}
                className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground py-2"
              >
                <Eye size={14} />
                Ver todos los ejercicios
              </button>

              {/* Sets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">Series ({completedSets}/{activeWorkoutSets.length})</h3>
                  <span className="text-xs text-muted-foreground">N° · Reps · Peso</span>
                </div>
                <div className="flex flex-col gap-2">
                  {activeWorkoutSets.map(row => (
                    <SetRow key={row.id} row={row} exerciseId={exercise.id} onUpdate={updateSetField} onToggle={handleToggleSet} />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                {activeExerciseIdx > 0 && (
                  <button onClick={() => { setActiveExerciseIdx(activeExerciseIdx - 1); initWorkoutSets(dayPlan.exercises[activeExerciseIdx - 1].targetSets, dayPlan.exercises[activeExerciseIdx - 1].targetReps); }}
                    className="flex-1 h-12 bg-muted rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                    <ChevronUp size={16} /> Anterior
                  </button>
                )}
                {activeExerciseIdx < dayPlan.exercises.length - 1 ? (
                  <button onClick={() => { setActiveExerciseIdx(activeExerciseIdx + 1); initWorkoutSets(dayPlan.exercises[activeExerciseIdx + 1].targetSets, dayPlan.exercises[activeExerciseIdx + 1].targetReps); }}
                    className="flex-1 h-12 bg-[#1A3A32] dark:bg-emerald-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    Siguiente ejercicio <ChevronDown size={16} />
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

      {restTimerActive && <RestTimerOverlay seconds={restTimer} total={restTimerTotal} onStop={stopRestTimer} />}
    </div>
  );
}

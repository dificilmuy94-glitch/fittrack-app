import { useEffect, useState } from 'react';
import { Dumbbell, Footprints, Apple, Check, ChevronRight, ArrowLeft, Info, Timer, Plus, X, Eye, Play, History } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { NUTRITION_PLAN, Meal, MealOption } from '@/data/nutritionPlan';
import { WEEKLY_PLAN } from '@/data/weeklyPlan';

const TASK_ICONS: Record<string, React.ElementType> = {
  workout:   Dumbbell,
  steps:     Footprints,
  nutrition: Apple,
  cardio:    Timer,
};

const TASK_COLORS: Record<string, string> = {
  workout:   'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  steps:     'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  nutrition: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  cardio:    'bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400',
};

function getDayLabel(date: Date) {
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase();
}

function getWeekDates(anchorDate: string) {
  const anchor = new Date(anchorDate + 'T12:00:00');
  const dow = anchor.getDay();
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((dow === 0 ? 7 : dow) - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function dateToISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayKeyForDate(dateStr: string): string | null {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay();
  if (dow === 0) return null;
  const keys = ['monday','tuesday','wednesday','thursday','friday','saturday'];
  return keys[dow - 1] ?? null;
}

// ─── Last week weights helper ─────────────────────────────────────────────────
type SavedWeight = { weightKg: string; reps: string; date: string };

function getLastWeekWeights(dayKey: string): { name: string; sets: { set: number; kg: string; reps: string }[] }[] {
  try {
    const raw = localStorage.getItem('workout_weights_v1');
    if (!raw) return [];
    const all: Record<string, SavedWeight> = JSON.parse(raw);
    const plan = WEEKLY_PLAN.find(d => d.dayKey === dayKey);
    if (!plan) return [];

    return plan.exercises.map(ex => {
      const sets = Array.from({ length: ex.targetSets }, (_, i) => {
        const key = `${ex.id}_set${i + 1}`;
        const saved = all[key];
        return saved ? { set: i + 1, kg: saved.weightKg, reps: saved.reps } : null;
      }).filter(Boolean) as { set: number; kg: string; reps: string }[];
      return { name: ex.name, sets };
    }).filter(ex => ex.sets.length > 0);
  } catch {
    return [];
  }
}

// ─── Last weights mini popup ──────────────────────────────────────────────────
function LastWeightsPopup({ dayKey, onClose }: { dayKey: string; onClose: () => void }) {
  const data = getLastWeekWeights(dayKey);
  const plan = WEEKLY_PLAN.find(d => d.dayKey === dayKey);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-3xl max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Última sesión registrada
            </p>
            <h2 className="text-base font-bold text-foreground mt-0.5">
              {plan?.dayName} — {plan?.muscleGroup}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {data.length === 0 ? (
            <div className="text-center py-8">
              <History size={28} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sin datos registrados aún</p>
              <p className="text-xs text-muted-foreground mt-1">Completa un entrenamiento para ver el historial</p>
            </div>
          ) : (
            data.map((ex, i) => (
              <div key={i} className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs font-semibold text-foreground mb-2 truncate">{ex.name}</p>
                <div className="flex flex-wrap gap-2">
                  {ex.sets.map(s => (
                    <div key={s.set} className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-center min-w-[56px]">
                      <p className="text-[9px] text-muted-foreground uppercase">Serie {s.set}</p>
                      <p className="text-sm font-bold text-foreground leading-tight">{s.kg} kg</p>
                      <p className="text-[10px] text-muted-foreground">× {s.reps}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}

// ─── Nutrition Modal ──────────────────────────────────────────────────────────

function OptionCard({ option }: { option: MealOption }) {
  return (
    <div className="flex-shrink-0 w-52 bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-3 py-2 bg-muted/60 border-b border-border">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{option.label}</p>
      </div>
      <div className="px-3 py-3 flex flex-col gap-2">
        {option.ingredients.map((ing, i) => (
          <div key={i} className="flex items-start gap-2">
            {ing.amount || ing.unit ? (
              <span className="text-xs font-bold text-foreground min-w-[44px] text-right flex-shrink-0 leading-tight">
                {ing.amount}{ing.unit ? ` ${ing.unit}` : ''}
              </span>
            ) : (
              <span className="min-w-[44px] flex-shrink-0" />
            )}
            <span className="text-xs text-foreground leading-tight">{ing.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MealSection({ meal }: { meal: Meal }) {
  const [expanded, setExpanded] = useState(false);
  const descLines = (meal.description ?? '').split('\n').filter(Boolean);
  const preview = descLines.slice(0, 2);
  const extra = descLines.slice(2);

  return (
    <div className="px-4 py-4 border-b border-border last:border-b-0">
      <h2 className="text-xl font-bold text-foreground mb-2">{meal.name}</h2>
      {descLines.length > 0 && (
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 flex gap-2 mb-3">
          <Info size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {expanded ? descLines.join('\n') : preview.join('\n')}{!expanded && extra.length > 0 ? '...' : ''}
            </p>
            {extra.length > 0 && (
              <button onClick={() => setExpanded(!expanded)} className="text-xs font-medium text-emerald-600 dark:text-emerald-400 underline mt-1">
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {meal.options.map((opt, i) => <OptionCard key={i} option={opt} />)}
      </div>
    </div>
  );
}

function NutritionModal({ onClose }: { onClose: () => void }) {
  const { clientName, observations, meals } = NUTRITION_PLAN;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Nutrición diaria</p>
          <h1 className="text-sm font-bold text-foreground truncate">{clientName}</h1>
        </div>
      </div>
      {observations && (
        <div className="px-4 py-3 bg-emerald-500/5 border-b border-emerald-500/15">
          <p className="text-xs text-muted-foreground leading-relaxed">{observations}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {meals.map(meal => <MealSection key={meal.id} meal={meal} />)}
        <div className="h-8" />
      </div>
    </div>
  );
}

// ─── Cardio Modal ─────────────────────────────────────────────────────────────

function CardioModal({ onClose, onAdd }: { onClose: () => void; onAdd: (type: string, duration: string) => void }) {
  const [type, setType] = useState('Correr');
  const [duration, setDuration] = useState('');
  const cardioTypes = ['Correr', 'Caminar', 'Bicicleta', 'Natación', 'Elíptica', 'Saltar cuerda', 'HIIT', 'Otro'];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="w-full bg-background rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Añadir Cardio</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tipo</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {cardioTypes.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                type === t ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}>
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Duración (minutos)</p>
        <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30"
          className="w-full h-11 px-4 bg-muted rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-400/30 mb-5" />
        <button onClick={() => { if (duration) { onAdd(type, duration); onClose(); } }} disabled={!duration}
          className="w-full h-12 bg-red-500 rounded-2xl text-white font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-transform">
          Añadir cardio
        </button>
      </div>
    </div>
  );
}

// ─── AgendaScreen ─────────────────────────────────────────────────────────────

export function AgendaScreen() {
  const {
    selectedDate, setSelectedDate, dailyTasks, fetchDailyTasks,
    toggleDailyTask, addCardioTask, removeTask, setActiveScreen, setWorkoutDay,
  } = useAppStore();

  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showCardioModal, setShowCardioModal]       = useState(false);
  const [showWeightsPopup, setShowWeightsPopup]     = useState(false);

  useEffect(() => { fetchDailyTasks(selectedDate); }, [fetchDailyTasks, selectedDate]);

  const weekDates    = getWeekDates(selectedDate);
  const today        = dateToISO(new Date());
  const completedCount = dailyTasks.filter(t => t.completed).length;
  const totalCount   = dailyTasks.length;
  const hasCardio    = dailyTasks.some(t => t.task_type === 'cardio');
  const dayKey       = getDayKeyForDate(selectedDate);
  const dayPlan      = dayKey ? WEEKLY_PLAN.find(d => d.dayKey === dayKey) : null;

  function navigateToWorkout(mode: 'active' | 'preview') {
    if (dayKey) setWorkoutDay(dayKey);
    setActiveScreen(mode === 'active' ? 'workout-logger' : 'workout-preview');
  }

  return (
    <>
      {showNutritionModal && <NutritionModal onClose={() => setShowNutritionModal(false)} />}
      {showCardioModal && <CardioModal onClose={() => setShowCardioModal(false)} onAdd={(t, d) => addCardioTask(selectedDate, t, d)} />}
      {showWeightsPopup && dayKey && <LastWeightsPopup dayKey={dayKey} onClose={() => setShowWeightsPopup(false)} />}

      <div className="flex flex-col gap-5 pb-6">
        {/* Header */}
        <div className="px-5 pt-6">
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Week strip */}
        <div className="px-5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {weekDates.map(date => {
              const iso = dateToISO(date);
              const isSelected = iso === selectedDate;
              const isToday = iso === today;
              return (
                <button key={iso} onClick={() => setSelectedDate(iso)}
                  className={cn('flex flex-col items-center gap-1.5 min-w-[48px] py-2.5 px-1 rounded-2xl transition-all duration-200',
                    isSelected ? 'bg-[#1A3A32] dark:bg-emerald-500 text-white' : 'bg-card border border-border text-foreground hover:border-[#1A3A32]/30')}>
                  <span className={cn('text-[10px] font-semibold uppercase tracking-wider', isSelected ? 'text-white/70' : 'text-muted-foreground')}>
                    {getDayLabel(date)}
                  </span>
                  <span className="text-base font-bold">{date.getDate()}</span>
                  {isToday && <div className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/70' : 'bg-[#1A3A32] dark:bg-emerald-400')} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="px-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">{completedCount}/{totalCount} tareas completadas</span>
              <span className="text-xs font-semibold text-[#1A3A32] dark:text-emerald-400">
                {Math.round((completedCount / totalCount) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[#1A3A32] dark:bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Tareas del día</h2>
            {!hasCardio && (
              <button onClick={() => setShowCardioModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-500 px-2.5 py-1.5 bg-red-500/10 rounded-lg">
                <Plus size={12} /> Añadir cardio
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {dailyTasks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No hay tareas para este día</div>
            ) : (
              dailyTasks.map(task => {
                const Icon = TASK_ICONS[task.task_type] || Dumbbell;
                const colorClass = TASK_COLORS[task.task_type] || TASK_COLORS.workout;
                const isNutrition = task.task_type === 'nutrition';
                const isCardio    = task.task_type === 'cardio';
                const isWorkout   = task.task_type === 'workout';

                return (
                  <div key={task.id}
                    onClick={isNutrition ? () => setShowNutritionModal(true) : undefined}
                    className={cn(
                      'bg-card border rounded-2xl transition-all duration-200',
                      task.completed ? 'border-[#1A3A32]/30 dark:border-emerald-500/30' : 'border-border',
                      isNutrition && 'cursor-pointer active:scale-[0.98]'
                    )}
                  >
                    {/* Main row */}
                    <div className="flex items-center gap-4 p-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
                        <Icon size={18} />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className={cn('text-sm font-semibold', task.completed ? 'line-through text-muted-foreground' : 'text-foreground')}>
                          {task.title}
                        </p>
                        {task.subtitle && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.subtitle}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isNutrition && (
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground">
                            <ChevronRight size={16} />
                          </div>
                        )}
                        {isCardio && (
                          <button onClick={e => { e.stopPropagation(); removeTask(task.id); }}
                            className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-400 mr-1">
                            <X size={13} />
                          </button>
                        )}
                        {!isNutrition && !isWorkout && (
                          <button onClick={e => { e.stopPropagation(); toggleDailyTask(task.id); }}
                            className={cn('w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200',
                              task.completed
                                ? 'bg-[#1A3A32] dark:bg-emerald-500 border-[#1A3A32] dark:border-emerald-500'
                                : 'border-border hover:border-[#1A3A32]/50')}>
                            {task.completed && <Check size={13} className="text-white" strokeWidth={3} />}
                          </button>
                        )}
                        {isWorkout && (
                          <button onClick={e => { e.stopPropagation(); toggleDailyTask(task.id); }}
                            className={cn('w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200',
                              task.completed
                                ? 'bg-[#1A3A32] dark:bg-emerald-500 border-[#1A3A32] dark:border-emerald-500'
                                : 'border-border hover:border-[#1A3A32]/50')}>
                            {task.completed && <Check size={13} className="text-white" strokeWidth={3} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Workout action buttons row */}
                    {isWorkout && dayPlan && (
                      <div className="px-4 pb-3 flex items-center gap-2">
                        {/* Last weights button */}
                        <button
                          onClick={e => { e.stopPropagation(); setShowWeightsPopup(true); }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground px-2.5 py-1.5 bg-muted rounded-lg"
                        >
                          <History size={12} />
                          Pesos anteriores
                        </button>

                        <div className="flex-1" />

                        {/* Ver button */}
                        <button
                          onClick={e => { e.stopPropagation(); if (dayKey) setWorkoutDay(dayKey, 'preview'); setActiveScreen('workout-logger'); }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg"
                        >
                          <Eye size={12} />
                          Ver
                        </button>

                        {/* Iniciar button */}
                        <button
                          onClick={e => { e.stopPropagation(); if (dayKey) setWorkoutDay(dayKey, 'active'); setActiveScreen('workout-logger'); }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-white px-2.5 py-1.5 bg-[#1A3A32] dark:bg-emerald-500 rounded-lg"
                        >
                          <Play size={11} className="fill-current" />
                          Iniciar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly overview */}
        <div className="px-5">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Esta semana</h3>
            <div className="flex justify-between">
              {weekDates.map(date => {
                const iso = dateToISO(date);
                const isSelected = iso === selectedDate;
                return (
                  <button key={iso} onClick={() => setSelectedDate(iso)} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{getDayLabel(date)}</span>
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium',
                      isSelected ? 'bg-[#1A3A32] dark:bg-emerald-500 text-white'
                        : iso < today ? 'bg-[#1A3A32]/15 dark:bg-emerald-400/20 text-[#1A3A32] dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground')}>
                      {date.getDate()}
                    </div>
                    <div className={cn('w-1 h-1 rounded-full', iso < today ? 'bg-[#1A3A32] dark:bg-emerald-400' : 'bg-transparent')} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

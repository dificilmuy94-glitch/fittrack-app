import { useState } from 'react';
import { ArrowLeft, Search, Play, ChevronRight, Dumbbell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { WEEKLY_PLAN } from '@/data/weeklyPlan';

const MUSCLE_GROUPS = ['Todos', 'Espalda', 'Pierna', 'Hombros', 'Bíceps / Tríceps', 'Pecho'];

export function ExerciseListScreen() {
  const { setActiveScreen } = useAppStore();
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('Todos');

  // Flatten all exercises from weekly plan
  const allExercises = WEEKLY_PLAN.flatMap(day =>
    day.exercises.map(ex => ({ ...ex, dayName: day.dayName, dayColor: day.color, dayColorBg: day.colorBg }))
  );

  const filtered = allExercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase());
    const matchGroup = activeGroup === 'Todos' || ex.muscleGroup.toLowerCase().includes(activeGroup.toLowerCase());
    return matchSearch && matchGroup;
  });

  return (
    <div className="flex flex-col min-h-0">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setActiveScreen('home')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Ejercicios</h1>
            <p className="text-xs text-muted-foreground">{allExercises.length} ejercicios en la librería</p>
          </div>
        </div>

        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ejercicios..."
            className="w-full h-10 pl-9 pr-4 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30" />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {MUSCLE_GROUPS.map(group => (
            <button key={group} onClick={() => setActiveGroup(group)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200',
                activeGroup === group ? 'bg-[#1A3A32] dark:bg-emerald-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground')}>
              {group}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Dumbbell size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">Sin resultados</p>
            <p className="text-xs text-muted-foreground mt-1">Intenta con otros términos</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((exercise, idx) => (
              <div key={idx} className="flex items-stretch bg-card border border-border rounded-2xl overflow-hidden hover:border-[#1A3A32]/30 transition-colors">
                <div className={cn('w-2 flex-shrink-0', exercise.dayColorBg)} />
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <p className={cn('text-[10px] font-semibold uppercase tracking-wider', exercise.dayColor)}>
                      {exercise.muscleGroup}
                    </p>
                    <h3 className="text-sm font-bold text-foreground mt-0.5 leading-tight">{exercise.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{exercise.dayName}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {exercise.targetSets}×{exercise.targetReps} · {exercise.restSeconds}s
                    </span>
                    <button onClick={() => setActiveScreen('workout-logger')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#1A3A32] dark:text-emerald-400 px-2.5 py-1.5 bg-[#1A3A32]/8 dark:bg-emerald-400/10 rounded-lg">
                      <Play size={10} className="fill-current" />
                      Ver
                    </button>
                  </div>
                </div>
                <div className="flex items-center px-3">
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

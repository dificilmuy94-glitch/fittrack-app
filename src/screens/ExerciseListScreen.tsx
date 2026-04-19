import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Play, ChevronRight, Dumbbell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const MUSCLE_GROUPS = ['Todos', 'Quads', 'Hamstrings', 'Pectorals', 'Back / Lats', 'Shoulders', 'Upper Back'];

export function ExerciseListScreen() {
  const { setActiveScreen, exercises, fetchExercises } = useAppStore();
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('Todos');

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const filtered = exercises.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscle_group.toLowerCase().includes(search.toLowerCase());
    const matchGroup = activeGroup === 'Todos' || ex.muscle_group === activeGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div className="flex flex-col min-h-0">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setActiveScreen('home')}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Ejercicios</h1>
            <p className="text-xs text-muted-foreground">{exercises.length} ejercicios en la librería</p>
          </div>
        </div>

        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicios..."
            className="w-full h-10 pl-9 pr-4 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200',
                activeGroup === group
                  ? 'bg-[#1A3A32] dark:bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
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
            {filtered.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-stretch bg-card border border-border rounded-2xl overflow-hidden hover:border-[#1A3A32]/30 transition-colors"
              >
                <div className="w-24 flex-shrink-0 relative overflow-hidden bg-muted">
                  {exercise.image_url ? (
                    <img
                      src={exercise.image_url}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dumbbell size={24} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
                </div>

                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-[10px] font-semibold text-[#1A3A32] dark:text-emerald-400 uppercase tracking-wider">
                      {exercise.muscle_group}
                    </p>
                    <h3 className="text-sm font-bold text-foreground mt-0.5 leading-tight">
                      {exercise.muscle_group} - {exercise.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {exercise.sets_scheme || '4x8-10'}
                    </span>
                    <button
                      onClick={() => setActiveScreen('workout-logger')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#1A3A32] dark:text-emerald-400 px-2.5 py-1.5 bg-[#1A3A32]/8 dark:bg-emerald-400/10 rounded-lg"
                    >
                      <Play size={10} className="fill-current" />
                      Añadir
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

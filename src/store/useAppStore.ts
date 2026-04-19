import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { WEEKLY_PLAN } from '@/data/weeklyPlan';

export type Screen = 'home' | 'agenda' | 'evolution' | 'files' | 'workout-logger' | 'exercise-list';

export type Profile = {
  id: string;
  email: string;
  name: string;
  has_workout: boolean;
  has_nutrition: boolean;
};

export type BodyMetric = {
  id: string;
  user_id?: string;
  date: string;
  weight_kg: number;
  notes: string;
  created_at: string;
};

export type DailyTask = {
  id: string;
  user_id?: string;
  date: string;
  task_type: string;
  title: string;
  subtitle: string;
  completed: boolean;
  created_at: string;
};

export type WeightGoal = {
  id: string;
  initial_weight: number;
  target_weight: number;
  created_at: string;
};

export type ActiveSetRow = {
  id: string;
  setNumber: number;
  targetReps: number;
  actualReps: string;
  weightKg: string;
  completed: boolean;
};

function getWorkoutTitleForDate(dateStr: string): { title: string; subtitle: string } | null {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  if (day === 0) return null;
  const plan = WEEKLY_PLAN[day - 1];
  if (!plan) return null;
  return {
    title: `${plan.dayName.toUpperCase()} — ${plan.muscleGroup.toUpperCase()}`,
    subtitle: plan.exercises.map(e => e.name).slice(0, 3).join(' · ') + (plan.exercises.length > 3 ? '...' : ''),
  };
}

async function getUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

type AppState = {
  activeScreen: Screen;
  darkMode: boolean;
  profile: Profile | null;
  bodyMetrics: BodyMetric[];
  dailyTasks: DailyTask[];
  weightGoal: WeightGoal | null;
  selectedDate: string;
  activeWorkoutSets: ActiveSetRow[];
  activeWorkoutDayKey: string;
  activeWorkoutMode: 'preview' | 'active';
  restTimer: number;
  restTimerActive: boolean;
  restTimerTotal: number;
  isLoading: boolean;

  setActiveScreen: (screen: Screen) => void;
  setDarkMode: (val: boolean) => void;
  setSelectedDate: (date: string) => void;
  setWorkoutDay: (dayKey: string, mode?: 'preview' | 'active') => void;
  fetchProfile: () => Promise<void>;
  fetchBodyMetrics: () => Promise<void>;
  fetchDailyTasks: (date: string) => Promise<void>;
  fetchWeightGoal: () => Promise<void>;
  addBodyMetric: (weight: number, date: string, notes?: string) => Promise<void>;
  toggleDailyTask: (id: string) => Promise<void>;
  addCardioTask: (date: string, type: string, duration: string) => void;
  removeTask: (id: string) => void;
  initWorkoutSets: (targetSets: number, targetReps: number) => void;
  updateSetField: (id: string, field: 'actualReps' | 'weightKg', value: string) => void;
  toggleSetComplete: (id: string) => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
};

const todayDayKey = (() => {
  const d = new Date().getDay();
  const keys = ['monday','tuesday','wednesday','thursday','friday','saturday'];
  return d >= 1 && d <= 6 ? keys[d - 1] : 'monday';
})();

const getInitialDarkMode = () => {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  catch { return false; }
};

export const useAppStore = create<AppState>((set, get) => ({
  activeScreen: 'home',
  darkMode: getInitialDarkMode(),
  profile: null,
  bodyMetrics: [],
  dailyTasks: [],
  weightGoal: null,
  selectedDate: new Date().toISOString().split('T')[0],
  activeWorkoutSets: [],
  activeWorkoutDayKey: todayDayKey,
  activeWorkoutMode: 'preview',
  restTimer: 0,
  restTimerActive: false,
  restTimerTotal: 90,
  isLoading: false,

  setActiveScreen: (screen) => set({ activeScreen: screen }),

  setDarkMode: (val) => {
    set({ darkMode: val });
    try {
      if (val) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch {}
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchDailyTasks(date);
  },

  setWorkoutDay: (dayKey, mode = 'preview') => set({ activeWorkoutDayKey: dayKey, activeWorkoutMode: mode }),

  fetchProfile: async () => {
    const userId = await getUserId();
    if (!userId) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) set({ profile: data });
  },

  fetchBodyMetrics: async () => {
    const userId = await getUserId();
    if (!userId) return;
    const { data } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    if (data) set({ bodyMetrics: data });
  },

  fetchDailyTasks: async (date: string) => {
    const userId = await getUserId();
    if (!userId) return;
    const profile = get().profile;

    const { data } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      set({ dailyTasks: data });
    } else {
      const now = new Date().toISOString();
      const newTasks = [];

      // Solo añade workout si el usuario tiene has_workout = true
      if (profile?.has_workout !== false) {
        const workoutInfo = getWorkoutTitleForDate(date);
        if (workoutInfo) {
          newTasks.push({
            user_id: userId, date, task_type: 'workout',
            title: workoutInfo.title, subtitle: workoutInfo.subtitle,
            completed: false, created_at: now,
          });
        }
      }

      // Siempre añade pasos
      newTasks.push({
        user_id: userId, date, task_type: 'steps',
        title: 'Meta de pasos', subtitle: '10.000 pasos',
        completed: false, created_at: now,
      });

      // Solo añade nutrición si has_nutrition = true
      if (profile?.has_nutrition !== false) {
        newTasks.push({
          user_id: userId, date, task_type: 'nutrition',
          title: 'Nutrición diaria', subtitle: '2.400 kcal · 180g proteína',
          completed: false, created_at: now,
        });
      }

      if (newTasks.length > 0) {
        const { data: inserted } = await supabase.from('daily_tasks').insert(newTasks).select();
        if (inserted) set({ dailyTasks: inserted });
      } else {
        set({ dailyTasks: [] });
      }
    }
  },

  fetchWeightGoal: async () => { set({ weightGoal: null }); },

  addBodyMetric: async (weight, date, notes = '') => {
    const userId = await getUserId();
    if (!userId) return;
    const { data } = await supabase
      .from('body_metrics')
      .insert({ user_id: userId, weight_kg: weight, date, notes })
      .select().single();
    if (data) {
      set(state => ({
        bodyMetrics: [...state.bodyMetrics, data].sort((a, b) => a.date.localeCompare(b.date)),
      }));
    }
  },

  toggleDailyTask: async (id) => {
    const task = get().dailyTasks.find(t => t.id === id);
    if (!task) return;
    const newVal = !task.completed;
    await supabase.from('daily_tasks').update({ completed: newVal }).eq('id', id);
    set(state => ({ dailyTasks: state.dailyTasks.map(t => t.id === id ? { ...t, completed: newVal } : t) }));
  },

  addCardioTask: async (date, type, duration) => {
    const userId = await getUserId();
    if (!userId) return;
    const now = new Date().toISOString();
    const { data } = await supabase.from('daily_tasks').insert({
      user_id: userId, date, task_type: 'cardio',
      title: `Cardio — ${type}`, subtitle: `${duration} min`,
      completed: false, created_at: now,
    }).select().single();
    if (data) set(state => ({ dailyTasks: [...state.dailyTasks, data] }));
  },

  removeTask: async (id) => {
    await supabase.from('daily_tasks').delete().eq('id', id);
    set(state => ({ dailyTasks: state.dailyTasks.filter(t => t.id !== id) }));
  },

  initWorkoutSets: (targetSets, targetReps) => {
    const sets: ActiveSetRow[] = Array.from({ length: targetSets }, (_, i) => ({
      id: `set-${i + 1}`, setNumber: i + 1, targetReps,
      actualReps: '', weightKg: '', completed: false,
    }));
    set({ activeWorkoutSets: sets });
  },

  updateSetField: (id, field, value) => {
    set(state => ({ activeWorkoutSets: state.activeWorkoutSets.map(s => s.id === id ? { ...s, [field]: value } : s) }));
  },

  toggleSetComplete: (id) => {
    set(state => ({ activeWorkoutSets: state.activeWorkoutSets.map(s => s.id === id ? { ...s, completed: !s.completed } : s) }));
    const store = get();
    if (!store.restTimerActive) store.startRestTimer(store.restTimerTotal);
  },

  startRestTimer: (seconds) => set({ restTimer: seconds, restTimerTotal: seconds, restTimerActive: true }),
  tickRestTimer: () => {
    const { restTimer } = get();
    if (restTimer <= 1) set({ restTimer: 0, restTimerActive: false });
    else set({ restTimer: restTimer - 1 });
  },
  stopRestTimer: () => set({ restTimer: 0, restTimerActive: false }),
}));

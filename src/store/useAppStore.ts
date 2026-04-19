import { create } from 'zustand';
import { WEEKLY_PLAN } from '@/data/weeklyPlan';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Screen = 'home' | 'agenda' | 'evolution' | 'files' | 'workout-logger' | 'exercise-list';

export type BodyMetric = {
  id: string;
  date: string;
  weight_kg: number;
  notes: string;
  created_at: string;
};

export type DailyTask = {
  id: string;
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

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWorkoutTitleForDate(dateStr: string): { title: string; subtitle: string; dayKey: string } | null {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  if (day === 0) return null;
  const plan = WEEKLY_PLAN[day - 1];
  if (!plan) return null;
  return {
    title: `${plan.dayName.toUpperCase()} — ${plan.muscleGroup.toUpperCase()}`,
    subtitle: plan.exercises.map(e => e.name).slice(0, 3).join(' · ') + (plan.exercises.length > 3 ? '...' : ''),
    dayKey: plan.dayKey,
  };
}

function buildDefaultTasks(date: string): DailyTask[] {
  const workoutInfo = getWorkoutTitleForDate(date);
  const now = new Date().toISOString();
  const tasks: DailyTask[] = [];
  if (workoutInfo) {
    tasks.push({ id: `${date}-workout`, date, task_type: 'workout', title: workoutInfo.title, subtitle: workoutInfo.subtitle, completed: false, created_at: now });
  }
  tasks.push({ id: `${date}-steps`, date, task_type: 'steps', title: 'Meta de pasos', subtitle: '10.000 pasos', completed: false, created_at: now });
  tasks.push({ id: `${date}-nutrition`, date, task_type: 'nutrition', title: 'Nutrición diaria', subtitle: '2.400 kcal · 180g proteína', completed: false, created_at: now });
  return tasks;
}

// ─── Store ────────────────────────────────────────────────────────────────────

type AppState = {
  activeScreen: Screen;
  darkMode: boolean;
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

const getInitialDarkMode = () => {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  catch { return false; }
};

// compute today's dayKey for initial workout state
const todayDayKey = (() => {
  const d = new Date().getDay();
  const keys = ['monday','tuesday','wednesday','thursday','friday','saturday'];
  return d >= 1 && d <= 6 ? keys[d - 1] : 'monday';
})();

export const useAppStore = create<AppState>((set, get) => ({
  activeScreen: 'home',
  darkMode: getInitialDarkMode(),
  bodyMetrics: loadJSON<BodyMetric[]>('fittrack_metrics', []),
  dailyTasks: [],
  weightGoal: loadJSON<WeightGoal | null>('fittrack_goal', null),
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

  // Sets which day to open in WorkoutLogger
  setWorkoutDay: (dayKey: string, mode: 'preview' | 'active' = 'preview') => set({ activeWorkoutDayKey: dayKey, activeWorkoutMode: mode }),

  fetchBodyMetrics: async () => {
    set({ bodyMetrics: loadJSON<BodyMetric[]>('fittrack_metrics', []) });
  },

  fetchDailyTasks: async (date: string) => {
    const allTasks = loadJSON<DailyTask[]>('fittrack_tasks', []);
    const dayTasks = allTasks.filter(t => t.date === date);
    if (dayTasks.length > 0) {
      set({ dailyTasks: dayTasks });
    } else {
      const newTasks = buildDefaultTasks(date);
      saveJSON('fittrack_tasks', [...allTasks, ...newTasks]);
      set({ dailyTasks: newTasks });
    }
  },

  fetchWeightGoal: async () => {
    set({ weightGoal: loadJSON<WeightGoal | null>('fittrack_goal', null) });
  },

  addBodyMetric: async (weight, date, notes = '') => {
    const newMetric: BodyMetric = { id: `metric-${Date.now()}`, date, weight_kg: weight, notes, created_at: new Date().toISOString() };
    const metrics = loadJSON<BodyMetric[]>('fittrack_metrics', []);
    const updated = [...metrics, newMetric].sort((a, b) => a.date.localeCompare(b.date));
    saveJSON('fittrack_metrics', updated);
    set({ bodyMetrics: updated });
  },

  toggleDailyTask: async (id) => {
    const allTasks = loadJSON<DailyTask[]>('fittrack_tasks', []);
    const updated = allTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveJSON('fittrack_tasks', updated);
    set(state => ({ dailyTasks: state.dailyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
  },

  addCardioTask: (date, type, duration) => {
    const now = new Date().toISOString();
    const newTask: DailyTask = {
      id: `${date}-cardio-${Date.now()}`,
      date,
      task_type: 'cardio',
      title: `Cardio — ${type}`,
      subtitle: `${duration} min`,
      completed: false,
      created_at: now,
    };
    const allTasks = loadJSON<DailyTask[]>('fittrack_tasks', []);
    saveJSON('fittrack_tasks', [...allTasks, newTask]);
    set(state => ({ dailyTasks: [...state.dailyTasks, newTask] }));
  },

  removeTask: (id) => {
    const allTasks = loadJSON<DailyTask[]>('fittrack_tasks', []);
    saveJSON('fittrack_tasks', allTasks.filter(t => t.id !== id));
    set(state => ({ dailyTasks: state.dailyTasks.filter(t => t.id !== id) }));
  },

  initWorkoutSets: (targetSets, targetReps) => {
    const sets: ActiveSetRow[] = Array.from({ length: targetSets }, (_, i) => ({
      id: `set-${i + 1}`, setNumber: i + 1, targetReps, actualReps: '', weightKg: '', completed: false,
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

// Supabase is no longer used - types are now in useAppStore
// This file is kept to avoid breaking any remaining imports

export type BodyMetric = {
  id: string;
  date: string;
  weight_kg: number;
  notes: string;
  created_at: string;
};

export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  description: string;
  youtube_url: string;
  sets_scheme: string;
  image_url: string;
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

// Dummy supabase client so old imports don't break
export const supabase = {
  from: () => ({
    select: () => ({ data: null, error: null }),
    insert: () => ({ select: () => ({ data: null, error: null }) }),
    update: () => ({ eq: () => ({ data: null, error: null }) }),
    eq: () => ({ order: () => ({ data: null, error: null }) }),
    order: () => ({ data: null, error: null }),
    limit: () => ({ maybeSingle: () => ({ data: null, error: null }) }),
    maybeSingle: () => ({ data: null, error: null }),
    single: () => ({ data: null, error: null }),
  }),
} as any;

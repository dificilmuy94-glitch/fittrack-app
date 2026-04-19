import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdqaylfntqxchehdwnvs.supabase.co';
const supabaseKey = 'sb_publishable_d87kp4-AhOiqTECB8ye8sw_Ia7jWD8I';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Profile = {
  id: string;
  email: string;
  name: string;
  nutrition_plan: string;
  created_at: string;
};

export type BodyMetric = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  notes: string;
  created_at: string;
};

export type DailyTask = {
  id: string;
  user_id: string;
  date: string;
  task_type: string;
  title: string;
  subtitle: string;
  completed: boolean;
  created_at: string;
};

export type WorkoutWeight = {
  id: string;
  user_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: string;
  reps: string;
  date: string;
  created_at: string;
};

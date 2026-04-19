/*
  # Fitness App - Core Tables

  ## Overview
  Creates the foundational tables for the fitness tracking application.

  ## New Tables
  1. `body_metrics` - Tracks user body weight over time
     - id, date, weight_kg, notes, created_at

  2. `exercises` - Exercise library
     - id, name, muscle_group, description, youtube_url, sets_scheme, created_at

  3. `workouts` - Workout sessions
     - id, name, date, completed, created_at

  4. `workout_exercises` - Exercises within a workout
     - id, workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, tempo, created_at

  5. `workout_sets` - Individual sets logged during a workout
     - id, workout_exercise_id, set_number, target_reps, actual_reps, weight_kg, completed, created_at

  6. `daily_tasks` - Daily agenda tasks (workout, steps, nutrition)
     - id, date, task_type, title, subtitle, completed, created_at

  7. `weight_goals` - User weight goals
     - id, initial_weight, target_weight, created_at

  ## Security
  - RLS enabled on all tables
  - Public read/write policies for demo (no auth required for this demo)

  ## Notes
  - All tables use UUID primary keys
  - Uses IF NOT EXISTS for safe re-runs
*/

-- body_metrics
CREATE TABLE IF NOT EXISTS body_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg decimal(5,2) NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on body_metrics"
  ON body_metrics FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on body_metrics"
  ON body_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update on body_metrics"
  ON body_metrics FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on body_metrics"
  ON body_metrics FOR DELETE
  USING (true);

-- exercises
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  muscle_group text DEFAULT '',
  description text DEFAULT '',
  youtube_url text DEFAULT '',
  sets_scheme text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on exercises"
  ON exercises FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on exercises"
  ON exercises FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update on exercises"
  ON exercises FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on exercises"
  ON exercises FOR DELETE
  USING (true);

-- workouts
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on workouts"
  ON workouts FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on workouts"
  ON workouts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update on workouts"
  ON workouts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on workouts"
  ON workouts FOR DELETE
  USING (true);

-- workout_exercises
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE SET NULL,
  order_index integer DEFAULT 0,
  target_sets integer DEFAULT 4,
  target_reps integer DEFAULT 10,
  rest_seconds integer DEFAULT 90,
  tempo text DEFAULT '3-1-1-0',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on workout_exercises"
  ON workout_exercises FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on workout_exercises"
  ON workout_exercises FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update on workout_exercises"
  ON workout_exercises FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on workout_exercises"
  ON workout_exercises FOR DELETE
  USING (true);

-- workout_sets
CREATE TABLE IF NOT EXISTS workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  target_reps integer DEFAULT 10,
  actual_reps integer,
  weight_kg decimal(5,2),
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on workout_sets"
  ON workout_sets FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on workout_sets"
  ON workout_sets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update on workout_sets"
  ON workout_sets FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on workout_sets"
  ON workout_sets FOR DELETE
  USING (true);

-- daily_tasks
CREATE TABLE IF NOT EXISTS daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT CURRENT_DATE,
  task_type text NOT NULL DEFAULT 'workout',
  title text NOT NULL,
  subtitle text DEFAULT '',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on daily_tasks"
  ON daily_tasks FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on daily_tasks"
  ON daily_tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update on daily_tasks"
  ON daily_tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on daily_tasks"
  ON daily_tasks FOR DELETE
  USING (true);

-- weight_goals
CREATE TABLE IF NOT EXISTS weight_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initial_weight decimal(5,2) NOT NULL,
  target_weight decimal(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weight_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on weight_goals"
  ON weight_goals FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on weight_goals"
  ON weight_goals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update on weight_goals"
  ON weight_goals FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on weight_goals"
  ON weight_goals FOR DELETE
  USING (true);

-- Seed initial data
INSERT INTO body_metrics (date, weight_kg, notes) VALUES
  ('2025-01-06', 89.5, ''),
  ('2025-01-13', 88.8, ''),
  ('2025-01-20', 88.2, ''),
  ('2025-01-27', 87.9, ''),
  ('2025-02-03', 87.1, ''),
  ('2025-02-10', 86.5, ''),
  ('2025-02-17', 85.8, ''),
  ('2025-02-24', 85.2, ''),
  ('2025-03-03', 84.7, ''),
  ('2025-03-10', 84.1, ''),
  ('2025-03-17', 83.6, ''),
  ('2025-03-24', 83.0, ''),
  ('2025-03-31', 82.5, ''),
  ('2025-04-07', 82.1, ''),
  ('2025-04-14', 81.8, '')
ON CONFLICT DO NOTHING;

INSERT INTO weight_goals (initial_weight, target_weight) VALUES
  (89.5, 78.0)
ON CONFLICT DO NOTHING;

INSERT INTO exercises (name, muscle_group, description, youtube_url, sets_scheme, image_url) VALUES
  ('Back Squat', 'Quads', 'Mantén la espalda recta y baja hasta paralelo. Empuja los talones contra el suelo al subir.', 'dU_W8g5sD0E', '4x8-10 @ 70% 1RM', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
  ('Romanian Deadlift', 'Hamstrings', 'Bisagra de cadera con piernas casi rectas. Siente el estiramiento en isquios.', 'JCXUYuzwNEc', '4x10-12 @ 65% 1RM', 'https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg'),
  ('Bench Press', 'Pectorals', 'Agarre ligeramente más ancho que los hombros. Baja controlado al pecho.', 'rT7DgCr-3pg', '4x6-8 @ 75% 1RM', 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg'),
  ('Pull-Up', 'Back / Lats', 'Agarre prono, ancho de hombros. Sube hasta que el mentón supere la barra.', 'eGo4IYlbE5g', '4x6-8 BW', 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg'),
  ('Overhead Press', 'Shoulders', 'De pie, agarre a la anchura de hombros. Empuja la barra directamente hacia arriba.', '_RlRab_Cxhg', '4x8-10 @ 60% 1RM', 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg'),
  ('Barbell Row', 'Upper Back', 'Torso a 45°, tira la barra hacia el ombligo. Codos pegados al cuerpo.', '9efgcAjQe7E', '4x8-10 @ 65% 1RM', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg')
ON CONFLICT DO NOTHING;

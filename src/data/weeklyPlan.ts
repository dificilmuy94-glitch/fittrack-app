export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  youtubeId: string;
  imageUrl: string;
  primaryMuscles: number[];
  secondaryMuscles: number[];
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  tempo: string;
  description: string;
};

export type DayPlan = {
  dayKey: string;
  dayName: string;
  dayShort: string;
  muscleGroup: string;
  color: string;
  colorBg: string;
  exercises: Exercise[];
};

// Wger muscle IDs
const M = {
  chest: 3, biceps: 2, triceps: 4, quads: 5, abs: 6,
  calves: 7, glutes: 8, hamstrings: 9, obliques: 10,
  lats: 11, traps: 12, front_delts: 1, rear_delts: 13,
};

export const WEEKLY_PLAN: DayPlan[] = [
  // ─── LUNES — ESPALDA ─────────────────────────────────────────────────────────
  {
    dayKey: 'monday', dayName: 'Lunes', dayShort: 'L',
    muscleGroup: 'Espalda',
    color: 'text-emerald-600 dark:text-emerald-400',
    colorBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    exercises: [
      { id: 'mon-1', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Row/0.jpg', name: 'Back - Seated Cable Row', muscleGroup: 'Dorsal / Romboides',
        youtubeId: 'GZbfZ033f74', primaryMuscles: [M.lats], secondaryMuscles: [M.biceps, M.traps],
        targetSets: 4, targetReps: 10, restSeconds: 120, tempo: '2-1-1-0',
        description: '4 series × 12-10-8-8 · 120" descanso · Tempo 2110. Retrae las escápulas antes de tirar.' },
      { id: 'mon-2', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pulldown/0.jpg', name: 'Back - Lean Away Lat Pull Down', muscleGroup: 'Dorsal',
        youtubeId: 'CAwf7n6Luuc', primaryMuscles: [M.lats], secondaryMuscles: [M.biceps],
        targetSets: 4, targetReps: 10, restSeconds: 120, tempo: '2-1-1-1',
        description: '4 series × 12-10-8-6 · 120" descanso · Tempo 2111. Inclínate hacia atrás. Lleva la barra al pecho.' },
      { id: 'mon-3', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg', name: 'Back - Single Arm Dumbbell Row', muscleGroup: 'Dorsal / Bíceps',
        youtubeId: 'roCP6wCXPqo', primaryMuscles: [M.lats], secondaryMuscles: [M.biceps, M.traps],
        targetSets: 4, targetReps: 10, restSeconds: 120, tempo: '2-1-1-0',
        description: '4 series × 10-10-8-8 · 120" descanso · Tempo 2110. Apoya rodilla y mano en el banco.' },
      { id: 'mon-4', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Delt_Fly/0.jpg', name: 'Delts - Cable Rear Delt Flys', muscleGroup: 'Deltoides Posterior',
        youtubeId: 'EA7u4Q_8HQ0', primaryMuscles: [M.rear_delts], secondaryMuscles: [M.traps],
        targetSets: 4, targetReps: 12, restSeconds: 120, tempo: '2-1-1-1',
        description: '4 series × 12 · 120" descanso · Tempo 2111. Abre los brazos hacia atrás.' },
      { id: 'mon-5', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Row/0.jpg', name: 'Machine Row', muscleGroup: 'Espalda Media',
        youtubeId: 'G8l_8chR5BE', primaryMuscles: [M.lats, M.traps], secondaryMuscles: [M.biceps],
        targetSets: 3, targetReps: 12, restSeconds: 120, tempo: '2-1-1-1',
        description: '3 series × 12-10-8-6 · 120" descanso · Tempo 2111.' },
    ],
  },

  // ─── MARTES — PIERNA ─────────────────────────────────────────────────────────
  {
    dayKey: 'tuesday', dayName: 'Martes', dayShort: 'M',
    muscleGroup: 'Pierna',
    color: 'text-blue-600 dark:text-blue-400',
    colorBg: 'bg-blue-50 dark:bg-blue-950/30',
    exercises: [
      { id: 'tue-1', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg', name: 'Quads - Leg Press (A1)', muscleGroup: 'Cuádriceps',
        youtubeId: 'IZxyjW7MPJQ', primaryMuscles: [M.quads], secondaryMuscles: [M.glutes],
        targetSets: 4, targetReps: 10, restSeconds: 0, tempo: 'Sin tempo',
        description: 'SUPERSERIE A · 4 rondas × 10 reps a una pierna · Sin descanso antes de A2.' },
      { id: 'tue-2', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bulgarian_Split_Squat/0.jpg', name: 'Sentadilla Búlgara (A2)', muscleGroup: 'Cuádriceps / Glúteo',
        youtubeId: 'Z_k5KRNwlBE', primaryMuscles: [M.quads, M.glutes], secondaryMuscles: [M.hamstrings],
        targetSets: 4, targetReps: 8, restSeconds: 120, tempo: 'Sin tempo',
        description: 'SUPERSERIE A · 4 rondas × 8 reps cada pierna · 120" descanso.' },
      { id: 'tue-3', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg', name: 'Hamstring - Romanian Deadlift (B1)', muscleGroup: 'Isquiotibiales / Glúteo',
        youtubeId: 'JCXUYuzwNrM', primaryMuscles: [M.hamstrings, M.glutes], secondaryMuscles: [],
        targetSets: 4, targetReps: 10, restSeconds: 0, tempo: '2-1-1-1',
        description: 'SUPERSERIE B · 4 rondas × 10-8-6-4 · Sin descanso antes de B2 · Tempo 2111.' },
      { id: 'tue-4', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Walking_Lunge/0.jpg', name: 'Quads - Bar Walking Lunge (B2)', muscleGroup: 'Cuádriceps / Glúteo',
        youtubeId: 'L8fvypPrzzs', primaryMuscles: [M.quads], secondaryMuscles: [M.glutes, M.hamstrings],
        targetSets: 4, targetReps: 15, restSeconds: 120, tempo: 'Sin tempo',
        description: 'SUPERSERIE B · 4 rondas × 15 reps (20 pasos) · 120" descanso.' },
      { id: 'tue-5', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg', name: 'Hack Squat Machine', muscleGroup: 'Cuádriceps',
        youtubeId: 'Ey0ucnbFzDk', primaryMuscles: [M.quads], secondaryMuscles: [M.glutes],
        targetSets: 4, targetReps: 12, restSeconds: 120, tempo: '2-1-1-0',
        description: '4 series × 12 · 120" descanso · Tempo 2110.' },
      { id: 'tue-6', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg', name: 'Quads - Single Leg Extension', muscleGroup: 'Cuádriceps',
        youtubeId: 'YyvSfVjQeL0', primaryMuscles: [M.quads], secondaryMuscles: [],
        targetSets: 4, targetReps: 12, restSeconds: 120, tempo: '2-1-1-0',
        description: '4 series × 12-12-10-10 · 120" descanso · Tempo 2110.' },
      { id: 'tue-7', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg', name: 'Hamstrings - Seated Leg Curl', muscleGroup: 'Isquiotibiales',
        youtubeId: '1Tq3QdYUuHs', primaryMuscles: [M.hamstrings], secondaryMuscles: [M.calves],
        targetSets: 4, targetReps: 10, restSeconds: 120, tempo: '2-1-1-0',
        description: '4 series × 10 · 120" descanso · Tempo 2110.' },
    ],
  },

  // ─── MIÉRCOLES — HOMBROS ─────────────────────────────────────────────────────
  {
    dayKey: 'wednesday', dayName: 'Miércoles', dayShort: 'X',
    muscleGroup: 'Hombros',
    color: 'text-purple-600 dark:text-purple-400',
    colorBg: 'bg-purple-50 dark:bg-purple-950/30',
    exercises: [
      { id: 'wed-1', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg', name: 'Delts - Barbell Shoulder Press', muscleGroup: 'Deltoides',
        youtubeId: 'CnBmiBqp-AI', primaryMuscles: [M.front_delts], secondaryMuscles: [M.triceps, M.traps],
        targetSets: 6, targetReps: 8, restSeconds: 120, tempo: '3-1-1-1',
        description: '6 series × 8 · 120" descanso · Tempo 3111. 5+1 sets: último set -20% y realiza AMRAP.' },
      { id: 'wed-2', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Row/0.jpg', name: 'Back - Seated Cable Rows (Pronación)', muscleGroup: 'Dorsal / Romboides',
        youtubeId: 'GZbfZ033f74', primaryMuscles: [M.lats], secondaryMuscles: [M.biceps, M.rear_delts],
        targetSets: 4, targetReps: 12, restSeconds: 120, tempo: '2-1-1-0',
        description: '4 series × 12 · 120" descanso · Tempo 2110. Agarre pronado con el codo fuera.' },
      { id: 'wed-3', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg', name: 'Delts - Shoulder Press Smith Machine', muscleGroup: 'Deltoides',
        youtubeId: 'CnBmiBqp-AI', primaryMuscles: [M.front_delts], secondaryMuscles: [M.triceps],
        targetSets: 3, targetReps: 13, restSeconds: 120, tempo: '2-1-1-0',
        description: '3 series × 12-15 · 120" descanso · Tempo 2110. En SMITH MACHINE.' },
      { id: 'wed-4', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Delt_Fly/0.jpg', name: 'Reverse Cable Fly for Delts', muscleGroup: 'Deltoides Posterior',
        youtubeId: 'QL_xSZFGEoc', primaryMuscles: [M.rear_delts], secondaryMuscles: [M.traps],
        targetSets: 4, targetReps: 12, restSeconds: 120, tempo: '2-1-1-0',
        description: '4 series × 12 · 120" descanso · Tempo 2110.' },
      { id: 'wed-5', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise/0.jpg', name: 'Delts - Barbell Front Raise (G1)', muscleGroup: 'Deltoides Anterior',
        youtubeId: 'sOgS9HnGO8M', primaryMuscles: [M.front_delts], secondaryMuscles: [],
        targetSets: 3, targetReps: 10, restSeconds: 0, tempo: 'Sin tempo',
        description: 'SHOULDER FINISHER · 3 rondas × 10 · Sin descanso entre G1-G2-G3.' },
      { id: 'wed-6', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Lateral_Raise/0.jpg', name: 'Delts - DB Y Raise (G2)', muscleGroup: 'Deltoides / Trapecio',
        youtubeId: 'sOgS9HnGO8M', primaryMuscles: [M.traps, M.rear_delts], secondaryMuscles: [],
        targetSets: 3, targetReps: 10, restSeconds: 0, tempo: 'Sin tempo',
        description: 'SHOULDER FINISHER · 3 rondas × 10 · Sin descanso antes de G3.' },
      { id: 'wed-7', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Lateral_Raise/0.jpg', name: 'Delts - Seated DB Lateral Raise (G3)', muscleGroup: 'Deltoides Lateral',
        youtubeId: 'kDqklk1ZESo', primaryMuscles: [M.front_delts, M.rear_delts], secondaryMuscles: [],
        targetSets: 3, targetReps: 10, restSeconds: 60, tempo: 'Sin tempo',
        description: 'SHOULDER FINISHER · 3 rondas × 10 · 60" descanso tras G1+G2+G3.' },
    ],
  },

  // ─── JUEVES — PIERNA (GLÚTEO / ISQUIOS) ──────────────────────────────────────
  {
    dayKey: 'thursday', dayName: 'Jueves', dayShort: 'J',
    muscleGroup: 'Pierna — Glúteo / Isquios',
    color: 'text-amber-600 dark:text-amber-400',
    colorBg: 'bg-amber-50 dark:bg-amber-950/30',
    exercises: [
      { id: 'thu-1', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg', name: 'Quads - Leg Press', muscleGroup: 'Cuádriceps',
        youtubeId: 'IZxyjW7MPJQ', primaryMuscles: [M.quads], secondaryMuscles: [M.glutes],
        targetSets: 4, targetReps: 13, restSeconds: 120, tempo: '3-1-2-0',
        description: '4 series × 15-15-12-12 · 120" descanso · Tempo 3120. Ve incrementando peso.' },
      { id: 'thu-2', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg', name: 'Hamstring - Romanian Deadlift (Banded)', muscleGroup: 'Isquiotibiales / Glúteo',
        youtubeId: 'JCXUYuzwNrM', primaryMuscles: [M.hamstrings, M.glutes], secondaryMuscles: [],
        targetSets: 4, targetReps: 9, restSeconds: 120, tempo: '2-0-1-1',
        description: '4 series × 10-12-8-6 · 120" descanso · Tempo 2011. Con gomas en la barra.' },
      { id: 'thu-3', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg', name: 'Hip Thrust en Banco', muscleGroup: 'Glúteo',
        youtubeId: 'SEdqd9EOcaU', primaryMuscles: [M.glutes], secondaryMuscles: [M.hamstrings],
        targetSets: 3, targetReps: 9, restSeconds: 90, tempo: '2-1-1-1',
        description: '3 series × 8-10 · 90" descanso · Tempo 2111.' },
      { id: 'thu-4', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curl/0.jpg', name: 'Hamstring - Single-Leg Hamstring Curl', muscleGroup: 'Isquiotibiales',
        youtubeId: 'ELOCsoDSmrg', primaryMuscles: [M.hamstrings], secondaryMuscles: [M.calves],
        targetSets: 4, targetReps: 10, restSeconds: 120, tempo: '2-1-1-0',
        description: '4 series × 12-10-8-6 · 120" descanso · Tempo 2110.' },
      { id: 'thu-5', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg', name: 'Buenos días con barra (Good Morning)', muscleGroup: 'Isquiotibiales / Lumbar',
        youtubeId: 'YA-h3n9L4YU', primaryMuscles: [M.hamstrings], secondaryMuscles: [M.glutes],
        targetSets: 3, targetReps: 10, restSeconds: 120, tempo: '2-1-1-0',
        description: '3 series × 10 · 120" descanso · Tempo 2110.' },
      { id: 'thu-6', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hip_Adductor/0.jpg', name: 'Abductor en Máquina', muscleGroup: 'Abductores / Glúteo',
        youtubeId: 'x-XKSy1RNHA', primaryMuscles: [M.glutes], secondaryMuscles: [],
        targetSets: 3, targetReps: 12, restSeconds: 120, tempo: '2-1-1-2',
        description: '3 series × 12 · 120" descanso · Tempo 2112.' },
    ],
  },

  // ─── VIERNES — BÍCEPS / TRÍCEPS ──────────────────────────────────────────────
  {
    dayKey: 'friday', dayName: 'Viernes', dayShort: 'V',
    muscleGroup: 'Bíceps / Tríceps',
    color: 'text-rose-600 dark:text-rose-400',
    colorBg: 'bg-rose-50 dark:bg-rose-950/30',
    exercises: [
      { id: 'fri-1', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg', name: 'Triceps - Close Grip Bench Press (A1)', muscleGroup: 'Tríceps',
        youtubeId: 'nEF0bv2FW7s', primaryMuscles: [M.triceps], secondaryMuscles: [M.chest, M.front_delts],
        targetSets: 4, targetReps: 13, restSeconds: 0, tempo: '3-1-1-1',
        description: 'SUPERSERIE A · 4 rondas × 12-15 · Tempo 3111. Drop set con pushups en barra.' },
      { id: 'fri-2', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg', name: 'Curl Barra Z (A2)', muscleGroup: 'Bíceps',
        youtubeId: 'kwG2ipFRgfo', primaryMuscles: [M.biceps], secondaryMuscles: [],
        targetSets: 4, targetReps: 9, restSeconds: 120, tempo: '2-1-1-0',
        description: 'SUPERSERIE A · 4 rondas × 8-10 · 120" descanso · Tempo 2110. Drop set 10 reps.' },
      { id: 'fri-3', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Triceps_Extension/0.jpg', name: 'Overhead Rope Triceps Extension (B1)', muscleGroup: 'Tríceps',
        youtubeId: 'vB5OHsJ3EME', primaryMuscles: [M.triceps], secondaryMuscles: [],
        targetSets: 4, targetReps: 9, restSeconds: 0, tempo: '2-1-1-0',
        description: 'SUPERSERIE B · 4 rondas × 8-10 · Sin descanso · Tempo 2110. + 10 pushups elevadas.' },
      { id: 'fri-4', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg', name: 'Biceps - Db Spider Curl (B2)', muscleGroup: 'Bíceps',
        youtubeId: 'wQFN_JUjkAA', primaryMuscles: [M.biceps], secondaryMuscles: [],
        targetSets: 4, targetReps: 13, restSeconds: 120, tempo: '2-1-1-0',
        description: 'SUPERSERIE B · 4 rondas × 12-15 · 120" descanso · Tempo 2110.' },
      { id: 'fri-5', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg', name: 'Standing Rope Triceps Extension (C1)', muscleGroup: 'Tríceps',
        youtubeId: 'kiuVA0gs3EI', primaryMuscles: [M.triceps], secondaryMuscles: [],
        targetSets: 4, targetReps: 11, restSeconds: 0, tempo: '2-1-1-0',
        description: 'SUPERSERIE C · 4 rondas × 10-12 · Sin descanso · Tempo 2110.' },
      { id: 'fri-6', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/0.jpg', name: 'Biceps - Incline Dumbbell Curl (C2)', muscleGroup: 'Bíceps',
        youtubeId: 'soxrZlIl35U', primaryMuscles: [M.biceps], secondaryMuscles: [],
        targetSets: 4, targetReps: 9, restSeconds: 120, tempo: '2-1-1-0',
        description: 'SUPERSERIE C · 4 rondas × 8-10 · 120" descanso · Tempo 2110.' },
      { id: 'fri-7', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pulldown/0.jpg', name: 'Neutral Grip Lat Pull Down', muscleGroup: 'Dorsal / Bíceps',
        youtubeId: 'j3OsZd5SWGE', primaryMuscles: [M.lats], secondaryMuscles: [M.biceps],
        targetSets: 3, targetReps: 20, restSeconds: 120, tempo: '2-1-1-1',
        description: '3 series × 20 · 120" descanso · Tempo 2111. Agarre supino. Pausas hasta 20 reps.' },
      { id: 'fri-8', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up/0.jpg', name: 'Triceps Push Up', muscleGroup: 'Tríceps',
        youtubeId: 'tTej3MQfNzo', primaryMuscles: [M.triceps], secondaryMuscles: [M.chest],
        targetSets: 3, targetReps: 15, restSeconds: 120, tempo: '2-0-2-0',
        description: '3 series × fallo · 120" descanso · Tempo 2020.' },
    ],
  },

  // ─── SÁBADO — PECHO ──────────────────────────────────────────────────────────
  {
    dayKey: 'saturday', dayName: 'Sábado', dayShort: 'S',
    muscleGroup: 'Pecho',
    color: 'text-teal-600 dark:text-teal-400',
    colorBg: 'bg-teal-50 dark:bg-teal-950/30',
    exercises: [
      { id: 'sat-1', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Fly/0.jpg', name: 'Chest - High Cable Flys', muscleGroup: 'Pectoral',
        youtubeId: '85HEDmGzBgc', primaryMuscles: [M.chest], secondaryMuscles: [M.front_delts],
        targetSets: 3, targetReps: 15, restSeconds: 120, tempo: '2-1-2-1',
        description: '3 series × 15 · 120" descanso · Tempo 2121.' },
      { id: 'sat-2', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg', name: 'Chest - Dumbbell Bench Press', muscleGroup: 'Pectoral',
        youtubeId: 'VmB1G1K7v94', primaryMuscles: [M.chest], secondaryMuscles: [M.triceps, M.front_delts],
        targetSets: 4, targetReps: 10, restSeconds: 120, tempo: '3-1-1-1',
        description: '4 series × 6-12-12-12 · 120" descanso · Tempo 3111. 1 serie pesada de 6, luego baja peso.' },
      { id: 'sat-3', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Bench_Press/0.jpg', name: 'Press Declinado Mancuernas (C1)', muscleGroup: 'Pectoral Inferior',
        youtubeId: '4WKwE-HhXkk', primaryMuscles: [M.chest], secondaryMuscles: [M.triceps],
        targetSets: 3, targetReps: 13, restSeconds: 0, tempo: '3-1-1-1',
        description: 'SUPERSERIE C · 3 rondas × 15-12-10 · Sin descanso · Tempo 3111. Sube peso cada serie.' },
      { id: 'sat-4', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Crunch/0.jpg', name: 'Decline Crunch (C2)', muscleGroup: 'Abdomen',
        youtubeId: 'WFWH_IZgz-A', primaryMuscles: [M.abs], secondaryMuscles: [M.obliques],
        targetSets: 3, targetReps: 20, restSeconds: 120, tempo: '2-0-x-1',
        description: 'SUPERSERIE C · 3 rondas × 20 · 120" descanso · Tempo 20x1.' },
      { id: 'sat-5', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pec_Deck_Fly/0.jpg', name: 'Chest - Peck Deck Flyes (D1)', muscleGroup: 'Pectoral',
        youtubeId: 'Z57CtFmRMxA', primaryMuscles: [M.chest], secondaryMuscles: [M.front_delts],
        targetSets: 3, targetReps: 12, restSeconds: 0, tempo: '2-1-2-1',
        description: 'SUPERSERIE D · 3 rondas × 12 · Sin descanso · Tempo 2121.' },
      { id: 'sat-6', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up/0.jpg', name: 'Delts - Push Up (D2)', muscleGroup: 'Pectoral / Tríceps',
        youtubeId: 'tTej3MQfNzo', primaryMuscles: [M.chest, M.triceps], secondaryMuscles: [M.front_delts],
        targetSets: 3, targetReps: 13, restSeconds: 120, tempo: '3-0-x-1',
        description: 'SUPERSERIE D · 3 rondas × 12-15 · 120" descanso · Tempo 30x1.' },
      { id: 'sat-7', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg', name: 'Standing Rope Triceps Extension (E1)', muscleGroup: 'Tríceps',
        youtubeId: 'kiuVA0gs3EI', primaryMuscles: [M.triceps], secondaryMuscles: [],
        targetSets: 3, targetReps: 13, restSeconds: 0, tempo: '2-0-2-1',
        description: 'SUPERSERIE E · 3 rondas × 12-15 · Sin descanso · Tempo 2021.' },
      { id: 'sat-8', imageUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Triceps_Extension/0.jpg', name: 'Overhead Rope Triceps Extension (E2)', muscleGroup: 'Tríceps',
        youtubeId: 'vB5OHsJ3EME', primaryMuscles: [M.triceps], secondaryMuscles: [],
        targetSets: 3, targetReps: 12, restSeconds: 120, tempo: '2-1-2-1',
        description: 'SUPERSERIE E · 3 rondas × 12 · 120" descanso · Tempo 2121. También sentado.' },
    ],
  },
];

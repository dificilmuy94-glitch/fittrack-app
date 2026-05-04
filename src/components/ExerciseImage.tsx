import { useState, useEffect } from 'react';

// wger exercise IDs mapped to each exercise in weeklyPlan
// IDs confirmed from https://wger.de/api/v2/exerciseimage/
const WGER_IMAGE_MAP: Record<string, string> = {
  // LUNES - ESPALDA
  'mon-1': 'https://wger.de/media/exercise-images/211/Seated-Cable-Row-1.png',
  'mon-2': 'https://wger.de/media/exercise-images/141/Lat-pulldown-1.png',
  'mon-3': 'https://wger.de/media/exercise-images/105/One-Arm-Dumbbell-Row-1.png',
  'mon-4': 'https://wger.de/media/exercise-images/359/Rear-delt-fly-cable-1.png',
  'mon-5': 'https://wger.de/media/exercise-images/211/Seated-Cable-Row-1.png',
  // MARTES - PIERNA
  'tue-1': 'https://wger.de/media/exercise-images/254/Leg-press-1.png',
  'tue-2': 'https://wger.de/media/exercise-images/310/Bulgarian-Split-Squat-1.png',
  'tue-3': 'https://wger.de/media/exercise-images/241/Romanian-Deadlift-1.png',
  'tue-4': 'https://wger.de/media/exercise-images/246/Barbell-Walking-Lunge-1.png',
  'tue-5': 'https://wger.de/media/exercise-images/256/Hack-squat-1.png',
  'tue-6': 'https://wger.de/media/exercise-images/113/Leg-extension-1.png',
  'tue-7': 'https://wger.de/media/exercise-images/114/Seated-Leg-Curl-1.png',
  // MIÉRCOLES - HOMBROS
  'wed-1': 'https://wger.de/media/exercise-images/74/Overhead-press-1.png',
  'wed-2': 'https://wger.de/media/exercise-images/211/Seated-Cable-Row-1.png',
  'wed-3': 'https://wger.de/media/exercise-images/74/Overhead-press-1.png',
  'wed-4': 'https://wger.de/media/exercise-images/359/Rear-delt-fly-cable-1.png',
  'wed-5': 'https://wger.de/media/exercise-images/340/Front-raise-1.png',
  'wed-6': 'https://wger.de/media/exercise-images/75/Lateral-raise-1.png',
  'wed-7': 'https://wger.de/media/exercise-images/75/Lateral-raise-1.png',
  // JUEVES - PIERNA GLÚTEO
  'thu-1': 'https://wger.de/media/exercise-images/254/Leg-press-1.png',
  'thu-2': 'https://wger.de/media/exercise-images/241/Romanian-Deadlift-1.png',
  'thu-3': 'https://wger.de/media/exercise-images/218/Barbell-Hip-Thrust-1.png',
  'thu-4': 'https://wger.de/media/exercise-images/114/Seated-Leg-Curl-1.png',
  'thu-5': 'https://wger.de/media/exercise-images/215/Good-morning-1.png',
  'thu-6': 'https://wger.de/media/exercise-images/287/Hip-abduction-machine-1.png',
  // VIERNES - BÍCEPS/TRÍCEPS
  'fri-1': 'https://wger.de/media/exercise-images/164/Close-grip-bench-press-1.png',
  'fri-2': 'https://wger.de/media/exercise-images/91/EZ-bar-curl-1.png',
  'fri-3': 'https://wger.de/media/exercise-images/339/Overhead-triceps-extension-1.png',
  'fri-4': 'https://wger.de/media/exercise-images/91/EZ-bar-curl-1.png',
  'fri-5': 'https://wger.de/media/exercise-images/232/Triceps-pushdown-1.png',
  'fri-6': 'https://wger.de/media/exercise-images/284/Incline-dumbbell-curl-1.png',
  'fri-7': 'https://wger.de/media/exercise-images/141/Lat-pulldown-1.png',
  'fri-8': 'https://wger.de/media/exercise-images/192/Push-up-1.png',
  // SÁBADO - PECHO
  'sat-1': 'https://wger.de/media/exercise-images/84/Cable-fly-1.png',
  'sat-2': 'https://wger.de/media/exercise-images/76/Dumbbell-bench-press-1.png',
  'sat-3': 'https://wger.de/media/exercise-images/161/Decline-dumbbell-bench-press-1.png',
  'sat-4': 'https://wger.de/media/exercise-images/93/Decline-crunch-1.png',
  'sat-5': 'https://wger.de/media/exercise-images/207/Pec-deck-1.png',
  'sat-6': 'https://wger.de/media/exercise-images/192/Push-up-1.png',
  'sat-7': 'https://wger.de/media/exercise-images/232/Triceps-pushdown-1.png',
  'sat-8': 'https://wger.de/media/exercise-images/339/Overhead-triceps-extension-1.png',
};

type ExerciseImageProps = {
  exerciseId: string;
  youtubeId: string;
  alt: string;
  className?: string;
};

export function ExerciseImage({ exerciseId, youtubeId, alt, className = '' }: ExerciseImageProps) {
  const [src, setSrc] = useState(WGER_IMAGE_MAP[exerciseId] ?? '');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const url = WGER_IMAGE_MAP[exerciseId];
    if (url) { setSrc(url); setFailed(false); }
  }, [exerciseId]);

  function handleError() {
    if (!failed) {
      setFailed(true);
      // Fallback 1: try second wger image (some exercises have -2)
      const current = WGER_IMAGE_MAP[exerciseId] ?? '';
      if (current.includes('-1.png')) {
        setSrc(current.replace('-1.png', '-2.png'));
      } else {
        // Fallback 2: YouTube thumbnail
        setSrc(`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);
      }
    } else {
      setSrc(`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);
    }
  }

  if (!src) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-xs text-muted-foreground">Sin imagen</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      className={`object-contain bg-white ${className}`}
    />
  );
}

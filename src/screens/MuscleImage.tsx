import { cn } from '@/lib/utils';

// Wger muscle IDs mapped to muscle names
// Front muscles SVG: https://wger.de/static/images/muscles/muscular_system_front.svg
// Back muscles SVG: https://wger.de/static/images/muscles/muscular_system_back.svg
// Individual muscle highlight: https://wger.de/static/images/muscles/main/muscle-X.svg

type MuscleImageProps = {
  primaryMuscles: number[];   // Wger muscle IDs (highlighted in red)
  secondaryMuscles?: number[]; // Wger muscle IDs (highlighted in orange)
  className?: string;
};

// Maps exercise muscle groups to wger muscle IDs
export const MUSCLE_IDS = {
  chest:          3,
  biceps:         2,
  triceps:        4,
  quads:          5,
  abs:            6,
  calves:         7,
  glutes:         8,
  hamstrings:     9,
  obliques:       10,
  lats:           11,
  traps:          12,
  front_delts:    1,
  rear_delts:     13,
};

export function MuscleImage({ primaryMuscles, secondaryMuscles = [], className }: MuscleImageProps) {
  const baseUrl = 'https://wger.de/static/images/muscles';

  return (
    <div className={cn('relative bg-muted flex items-center justify-center overflow-hidden', className)}>
      {/* Body outline - front */}
      <div className="relative w-full h-full flex items-center justify-center gap-2 py-4">
        <div className="relative h-48 w-24 flex-shrink-0">
          {/* Base body front */}
          <img
            src={`${baseUrl}/muscular_system_front.svg`}
            alt="front"
            className="absolute inset-0 w-full h-full object-contain"
          />
          {/* Primary muscles highlighted */}
          {primaryMuscles.map(id => (
            <img
              key={`front-p-${id}`}
              src={`${baseUrl}/main/muscle-${id}.svg`}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(100%) saturate(7000%) hue-rotate(0deg) brightness(90%)' }}
            />
          ))}
          {/* Secondary muscles */}
          {secondaryMuscles.map(id => (
            <img
              key={`front-s-${id}`}
              src={`${baseUrl}/secondary/muscle-${id}.svg`}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              style={{ filter: 'brightness(0) saturate(100%) invert(55%) sepia(80%) saturate(3000%) hue-rotate(0deg)' }}
            />
          ))}
        </div>

        <div className="relative h-48 w-24 flex-shrink-0">
          {/* Base body back */}
          <img
            src={`${baseUrl}/muscular_system_back.svg`}
            alt="back"
            className="absolute inset-0 w-full h-full object-contain"
          />
          {/* Primary muscles highlighted back */}
          {primaryMuscles.map(id => (
            <img
              key={`back-p-${id}`}
              src={`${baseUrl}/main/muscle-${id}.svg`}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(100%) saturate(7000%) hue-rotate(0deg) brightness(90%)' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

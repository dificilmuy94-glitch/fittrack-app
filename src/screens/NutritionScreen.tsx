import { useState } from 'react';
import { Droplets } from 'lucide-react';
import { NUTRITION_PLAN, Meal, MealOption } from '../data/nutritionPlan';

function IngredientCard({ option }: { option: MealOption }) {
  return (
    <div className="min-w-[160px] max-w-[200px] flex-shrink-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{option.label}</p>
      <ul className="space-y-1">
        {option.ingredients.map((ing, i) => (
          <li key={i} className="text-sm text-gray-800 dark:text-gray-200">
            {(ing.amount || ing.unit) && (
              <span className="font-semibold">
                {ing.amount}
                {ing.unit && ` ${ing.unit}`}{' '}
              </span>
            )}
            {ing.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MealSection({ meal }: { meal: Meal }) {
  const [expanded, setExpanded] = useState(false);
  const hasDescription = meal.description && meal.description.trim().length > 0;
  const descLines = meal.description?.split('\n') ?? [];
  const previewLines = descLines.slice(0, 2);
  const extraLines = descLines.slice(2);

  return (
    <div className="mb-6">
      <h2 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">{meal.name}</h2>

      {hasDescription && (
        <div className="mb-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {previewLines.join('\n')}
            {!expanded && extraLines.length > 0 && '...'}
          </p>
          {expanded && extraLines.length > 0 && (
            <p className="text-sm text-gray-700 dark:text-gray-300">{extraLines.join('\n')}</p>
          )}
          {(extraLines.length > 0) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-sm font-medium text-gray-500 underline dark:text-gray-400"
            >
              {expanded ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {meal.options.map((opt, i) => (
          <IngredientCard key={i} option={opt} />
        ))}
      </div>
    </div>
  );
}

function WaterTracker() {
  const [glasses, setGlasses] = useState(0);
  const total = 10;

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Agua</h2>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setGlasses(i < glasses ? i : i + 1)}
            className={`flex items-center justify-center rounded-lg p-3 transition-colors ${
              i < glasses
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
            }`}
          >
            <Droplets className="h-6 w-6" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NutritionScreen() {
  const { clientName, observations, meals, professional } = NUTRITION_PLAN;
  const [showObs, setShowObs] = useState(false);
  const obsLines = observations?.split('\n') ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-700 to-green-500 px-6 pb-8 pt-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]" />
        <h1 className="relative text-3xl font-bold tracking-wide text-white">{clientName}</h1>
        {observations && (
          <div className="relative mt-2">
            <p className="text-sm text-green-100">
              {obsLines[0]}
              {!showObs && obsLines.length > 1 && '...'}
            </p>
            {showObs && obsLines.slice(1).map((l, i) => (
              <p key={i} className="text-sm text-green-100">{l}</p>
            ))}
            {obsLines.length > 1 && (
              <button
                onClick={() => setShowObs(!showObs)}
                className="mt-1 text-sm font-medium text-green-200 underline"
              >
                {showObs ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {meals.map((meal) => (
          <MealSection key={meal.id} meal={meal} />
        ))}

        <WaterTracker />

        <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Estos planes han sido redactados por el profesional {professional}
        </p>

        <button className="mb-6 w-full rounded-full border border-gray-900 py-3 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-gray-900">
          Enviar a mi email
        </button>
      </div>
    </div>
  );
}

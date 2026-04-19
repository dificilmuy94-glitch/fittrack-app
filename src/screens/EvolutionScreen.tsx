import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Plus, TrendingDown, Target, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const CHART_GREEN = '#1A3A32';

function RadialProgress({ percentage, size = 100 }: { percentage: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        className="text-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={CHART_GREEN}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-1000 dark:stroke-emerald-400"
      />
    </svg>
  );
}

function AddWeightModal({ onClose, onAdd }: { onClose: () => void; onAdd: (w: number, d: string) => void }) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-background rounded-t-2xl p-6 border-t border-x border-border pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
        <h3 className="text-lg font-bold mb-4">Registrar peso</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Peso (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="82.5"
              step="0.1"
              className="w-full h-11 px-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/40"
            />
          </div>
          <button
            onClick={() => {
              if (weight && date) {
                onAdd(parseFloat(weight), date);
                onClose();
              }
            }}
            className="h-11 bg-[#1A3A32] dark:bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export function EvolutionScreen() {
  const { bodyMetrics, weightGoal, fetchBodyMetrics, fetchWeightGoal, addBodyMetric } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchBodyMetrics();
    fetchWeightGoal();
  }, [fetchBodyMetrics, fetchWeightGoal]);

  const chartData = bodyMetrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    peso: m.weight_kg,
  }));

  const latestWeight = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1].weight_kg : null;
  const initialWeight = weightGoal?.initial_weight ?? (bodyMetrics[0]?.weight_kg ?? null);
  const targetWeight = weightGoal?.target_weight ?? null;

  const totalToLose = initialWeight && targetWeight ? initialWeight - targetWeight : null;
  const lost = initialWeight && latestWeight ? initialWeight - latestWeight : null;
  const progressPct = totalToLose && lost ? Math.min(Math.round((lost / totalToLose) * 100), 100) : 0;

  return (
    <div className="flex flex-col gap-5 pb-2">
      <div className="px-5 pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evolución</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Seguimiento de métricas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 rounded-xl bg-[#1A3A32] dark:bg-emerald-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="px-5">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl w-fit">
          <div className="w-2 h-2 rounded-full bg-[#1A3A32] dark:bg-emerald-400" />
          <span className="text-sm font-medium text-foreground">Peso corporal</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </div>
      </div>

      <div className="px-5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <span className="text-3xl font-bold text-foreground">{latestWeight ?? '—'}</span>
              <span className="text-lg text-muted-foreground ml-1">kg</span>
            </div>
            {lost !== null && (
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <TrendingDown size={14} />
                <span className="text-sm font-semibold">-{lost.toFixed(1)} kg total</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">Última medición registrada</p>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_GREEN} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={CHART_GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="peso"
                stroke={CHART_GREEN}
                strokeWidth={2.5}
                fill="url(#colorPeso)"
                dot={false}
                activeDot={{ r: 5, fill: CHART_GREEN, stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {weightGoal && initialWeight && targetWeight && latestWeight && (
        <div className="px-5">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#1A3A32]/10 dark:bg-emerald-400/10 flex items-center justify-center">
                <Target size={16} className="text-[#1A3A32] dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold">Objetivo de peso</h3>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center">
                <RadialProgress percentage={progressPct} size={96} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{progressPct}%</span>
                  <span className="text-[9px] text-muted-foreground">cumplido</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Peso inicial</p>
                    <p className="text-base font-bold text-foreground">{initialWeight} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">Peso actual</p>
                    <p className="text-base font-bold text-[#1A3A32] dark:text-emerald-400">{latestWeight} kg</p>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Objetivo</p>
                    <p className="text-base font-bold text-foreground">{targetWeight} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">Restante</p>
                    <p className="text-base font-bold text-foreground">
                      {Math.max(0, latestWeight - targetWeight).toFixed(1)} kg
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                <span>{initialWeight} kg</span>
                <span>{targetWeight} kg</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1A3A32] dark:bg-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Historial reciente</h2>
        <div className="flex flex-col gap-2">
          {[...bodyMetrics].reverse().slice(0, 8).map((m, i) => {
            const prev = [...bodyMetrics].reverse()[i + 1];
            const diff = prev ? (m.weight_kg - prev.weight_kg) : null;
            return (
              <div key={m.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1A3A32]/40 dark:bg-emerald-400/40" />
                  <span className="text-sm text-foreground">
                    {new Date(m.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {diff !== null && (
                    <span className={cn(
                      'text-xs font-medium',
                      diff < 0 ? 'text-emerald-600 dark:text-emerald-400' : diff > 0 ? 'text-red-500' : 'text-muted-foreground'
                    )}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                    </span>
                  )}
                  <span className="text-sm font-bold text-foreground">{m.weight_kg} kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <AddWeightModal
          onClose={() => setShowAddModal(false)}
          onAdd={(w, d) => addBodyMetric(w, d)}
        />
      )}
    </div>
  );
}

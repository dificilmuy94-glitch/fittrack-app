import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Plus, TrendingDown, Target, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const CHART_GREEN = '#1A3A32';

// ─── Types ────────────────────────────────────────────────────────────────────

type Measurement = {
  id: string;
  user_id: string;
  date: string;
  cuello?: number;
  biceps?: number;
  pecho?: number;
  espalda?: number;
  cintura?: number;
  gluteo?: number;
  cuadriceps?: number;
  gemelo?: number;
  created_at: string;
};

const MEASURE_FIELDS: { key: keyof Omit<Measurement, 'id' | 'user_id' | 'date' | 'created_at'>; label: string }[] = [
  { key: 'cuello',     label: 'Cuello' },
  { key: 'biceps',     label: 'Bíceps' },
  { key: 'pecho',      label: 'Pecho' },
  { key: 'espalda',    label: 'Espalda' },
  { key: 'cintura',    label: 'Cintura' },
  { key: 'gluteo',     label: 'Glúteo' },
  { key: 'cuadriceps', label: 'Cuádriceps' },
  { key: 'gemelo',     label: 'Gemelo' },
];

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

async function fetchMeasurements(): Promise<Measurement[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  return data ?? [];
}

async function addMeasurement(record: Partial<Measurement>): Promise<Measurement | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase
    .from('measurements')
    .insert({ ...record, user_id: userId })
    .select()
    .single();
  return data;
}

// ─── Radial progress ─────────────────────────────────────────────────────────

function RadialProgress({ percentage, size = 100 }: { percentage: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={CHART_GREEN} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={circumference}
        strokeDashoffset={circumference - (percentage / 100) * circumference}
        className="transition-all duration-1000 dark:stroke-emerald-400" />
    </svg>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, unit = 'kg' }: { active?: boolean; payload?: { value: number }[]; label?: string; unit?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground">{payload[0].value} {unit}</p>
      </div>
    );
  }
  return null;
}

// ─── Add Weight Modal ─────────────────────────────────────────────────────────

function AddWeightModal({ onClose, onAdd }: { onClose: () => void; onAdd: (w: number, d: string) => void }) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-t-2xl p-6 border-t border-x border-border" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
        <h3 className="text-lg font-bold mb-4">Registrar peso</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Peso (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="82.5" step="0.1"
              className="w-full h-11 px-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/40" />
          </div>
          <button onClick={() => { if (weight && date) { onAdd(parseFloat(weight), date); onClose(); } }}
            className="h-11 bg-[#1A3A32] dark:bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Measurements Modal ───────────────────────────────────────────────────

function AddMeasurementsModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Partial<Measurement>) => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [values, setValues] = useState<Record<string, string>>({});

  function handleSave() {
    const record: Partial<Measurement> = { date };
    MEASURE_FIELDS.forEach(({ key }) => {
      if (values[key]) record[key] = parseFloat(values[key]) as never;
    });
    onAdd(record);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-t-2xl border-t border-x border-border flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-3 flex-shrink-0">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Registrar medidas</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 pb-6 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/40" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MEASURE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label} (cm)</label>
                <input type="number" value={values[key] ?? ''} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                  placeholder="—" step="0.1"
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/40" />
              </div>
            ))}
          </div>

          <button onClick={handleSave}
            className="h-11 bg-[#1A3A32] dark:bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity mt-2">
            Guardar medidas
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Measure Chart Card ───────────────────────────────────────────────────────

function MeasureChartCard({ measurements, field, label }: {
  measurements: Measurement[];
  field: keyof Omit<Measurement, 'id' | 'user_id' | 'date' | 'created_at'>;
  label: string;
}) {
  const data = measurements
    .filter(m => m[field] != null)
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      valor: m[field] as number,
    }));

  if (data.length === 0) return null;

  const latest = data[data.length - 1]?.valor;
  const first  = data[0]?.valor;
  const diff   = latest && first ? (latest - first) : null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-baseline justify-between mb-1">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-foreground">{latest}</span>
            <span className="text-sm text-muted-foreground">cm</span>
          </div>
        </div>
        {diff !== null && (
          <span className={cn('text-xs font-semibold', diff < 0 ? 'text-emerald-600 dark:text-emerald-400' : diff > 0 ? 'text-red-500' : 'text-muted-foreground')}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)} cm
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${field}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_GREEN} stopOpacity={0.2} />
              <stop offset="95%" stopColor={CHART_GREEN} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip unit="cm" />} />
          <Area type="monotone" dataKey="valor" stroke={CHART_GREEN} strokeWidth={2} fill={`url(#grad-${field})`}
            dot={false} activeDot={{ r: 4, fill: CHART_GREEN, stroke: 'white', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Tab = 'peso' | 'medidas';

export function EvolutionScreen() {
  const { bodyMetrics, weightGoal, fetchBodyMetrics, fetchWeightGoal, addBodyMetric } = useAppStore();
  const [tab, setTab]                       = useState<Tab>('peso');
  const [measurements, setMeasurements]     = useState<Measurement[]>([]);
  const [showWeightModal, setShowWeightModal]       = useState(false);
  const [showMeasureModal, setShowMeasureModal]     = useState(false);

  useEffect(() => {
    fetchBodyMetrics();
    fetchWeightGoal();
    fetchMeasurements().then(setMeasurements);
  }, [fetchBodyMetrics, fetchWeightGoal]);

  async function handleAddMeasurement(record: Partial<Measurement>) {
    const saved = await addMeasurement(record);
    if (saved) setMeasurements(prev => [...prev, saved].sort((a, b) => a.date.localeCompare(b.date)));
  }

  const chartData = bodyMetrics.map(m => ({
    date: new Date(m.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    peso: m.weight_kg,
  }));

  const latestWeight  = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1].weight_kg : null;
  const initialWeight = weightGoal?.initial_weight ?? (bodyMetrics[0]?.weight_kg ?? null);
  const targetWeight  = weightGoal?.target_weight ?? null;
  const totalToLose   = initialWeight && targetWeight ? initialWeight - targetWeight : null;
  const lost          = initialWeight && latestWeight ? initialWeight - latestWeight : null;
  const progressPct   = totalToLose && lost ? Math.min(Math.round((lost / totalToLose) * 100), 100) : 0;

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header */}
      <div className="px-5 pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evolución</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Seguimiento de métricas</p>
        </div>
        <button
          onClick={() => tab === 'peso' ? setShowWeightModal(true) : setShowMeasureModal(true)}
          className="w-10 h-10 rounded-xl bg-[#1A3A32] dark:bg-emerald-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
          <Plus size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5">
        <div className="flex gap-2 bg-muted p-1 rounded-xl">
          <button onClick={() => setTab('peso')}
            className={cn('flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'peso' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>
            Peso corporal
          </button>
          <button onClick={() => setTab('medidas')}
            className={cn('flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === 'medidas' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>
            Medidas
          </button>
        </div>
      </div>

      {/* ── PESO TAB ── */}
      {tab === 'peso' && (
        <>
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

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_GREEN} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={CHART_GREEN} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="peso" stroke={CHART_GREEN} strokeWidth={2.5} fill="url(#colorPeso)"
                      dot={false} activeDot={{ r: 5, fill: CHART_GREEN, stroke: 'white', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                  Añade tu primer peso con el botón +
                </div>
              )}
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
                        <p className="text-base font-bold text-foreground">{Math.max(0, latestWeight - targetWeight).toFixed(1)} kg</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                    <span>{initialWeight} kg</span><span>{targetWeight} kg</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#1A3A32] dark:bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
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
                const diff = prev ? m.weight_kg - prev.weight_kg : null;
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
                        <span className={cn('text-xs font-medium',
                          diff < 0 ? 'text-emerald-600 dark:text-emerald-400' : diff > 0 ? 'text-red-500' : 'text-muted-foreground')}>
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
        </>
      )}

      {/* ── MEDIDAS TAB ── */}
      {tab === 'medidas' && (
        <div className="px-5 flex flex-col gap-4">
          {measurements.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <Plus size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">Sin medidas aún</p>
              <p className="text-xs text-muted-foreground text-center">Pulsa el botón + para añadir tus primeras medidas</p>
            </div>
          ) : (
            MEASURE_FIELDS.map(({ key, label }) => (
              <MeasureChartCard key={key} measurements={measurements} field={key} label={label} />
            ))
          )}
        </div>
      )}

      {showWeightModal && (
        <AddWeightModal onClose={() => setShowWeightModal(false)} onAdd={(w, d) => addBodyMetric(w, d)} />
      )}
      {showMeasureModal && (
        <AddMeasurementsModal onClose={() => setShowMeasureModal(false)} onAdd={handleAddMeasurement} />
      )}
    </div>
  );
}

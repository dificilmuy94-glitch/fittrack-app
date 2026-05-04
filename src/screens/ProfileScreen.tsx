import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Edit2, Trash2, X, Check, LogOut, User, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type CustomExercise = {
  id: string;
  name: string;
  muscle_group: string;
  type: string;
  notes: string;
};

type CustomFood = {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_g: number;
};

const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquiotibiales', 'Glúteo', 'Abdomen', 'Pantorrillas', 'Otro'];

// ─── Exercise Form Modal ──────────────────────────────────────────────────────
function ExerciseModal({ exercise, onClose, onSave }: {
  exercise?: CustomExercise | null;
  onClose: () => void;
  onSave: (data: Omit<CustomExercise, 'id'>) => void;
}) {
  const [name, setName] = useState(exercise?.name ?? '');
  const [muscleGroup, setMuscleGroup] = useState(exercise?.muscle_group ?? MUSCLE_GROUPS[0]);
  const [type, setType] = useState(exercise?.type ?? 'strength');
  const [notes, setNotes] = useState(exercise?.notes ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-t-2xl border-t border-x border-border" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mt-3 mb-1" />
        <div className="px-5 pb-8 pt-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{exercise ? 'Editar ejercicio' : 'Añadir ejercicio'}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nombre *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Ej: Press banca" autoFocus
                className="w-full h-11 px-3 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Grupo muscular</label>
              <select value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)}
                className="w-full h-11 px-3 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30">
                {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                {['strength', 'cardio'].map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={cn('h-10 rounded-xl text-sm font-semibold border-2 transition-all',
                      type === t ? 'bg-[#1A3A32] dark:bg-emerald-500 border-[#1A3A32] dark:border-emerald-500 text-white' : 'border-border text-muted-foreground')}>
                    {t === 'strength' ? '💪 Fuerza' : '🏃 Cardio'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notas</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Instrucciones, consejos..." rows={2}
                className="w-full px-3 py-2 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30 resize-none" />
            </div>
          </div>

          <button
            disabled={!name.trim()}
            onClick={() => { if (name.trim()) { onSave({ name: name.trim(), muscle_group: muscleGroup, type, notes }); onClose(); } }}
            className="w-full h-12 bg-[#1A3A32] dark:bg-emerald-500 rounded-2xl text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
            <Check size={16} strokeWidth={3} /> {exercise ? 'Guardar cambios' : 'Añadir ejercicio'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Food Form Modal ──────────────────────────────────────────────────────────
function FoodModal({ food, onClose, onSave }: {
  food?: CustomFood | null;
  onClose: () => void;
  onSave: (data: Omit<CustomFood, 'id'>) => void;
}) {
  const [name, setName]         = useState(food?.name ?? '');
  const [calories, setCalories] = useState(String(food?.calories ?? ''));
  const [protein, setProtein]   = useState(String(food?.protein_g ?? ''));
  const [carbs, setCarbs]       = useState(String(food?.carbs_g ?? ''));
  const [fat, setFat]           = useState(String(food?.fat_g ?? ''));
  const [serving, setServing]   = useState(String(food?.serving_g ?? '100'));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-t-2xl border-t border-x border-border" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mt-3 mb-1" />
        <div className="px-5 pb-8 pt-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{food ? 'Editar comida' : 'Añadir comida'}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nombre *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Ej: Pechuga a la plancha" autoFocus
                className="w-full h-11 px-3 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ración (g)</label>
              <input value={serving} onChange={e => setServing(e.target.value)}
                type="number" placeholder="100"
                className="w-full h-11 px-3 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Calorías (kcal)', val: calories, set: setCalories, color: 'text-orange-500' },
                { label: 'Proteína (g)', val: protein, set: setProtein, color: 'text-blue-500' },
                { label: 'Carbohidratos (g)', val: carbs, set: setCarbs, color: 'text-amber-500' },
                { label: 'Grasas (g)', val: fat, set: setFat, color: 'text-red-500' },
              ].map(({ label, val, set, color }) => (
                <div key={label}>
                  <label className={cn('text-xs font-semibold mb-1 block', color)}>{label}</label>
                  <input value={val} onChange={e => set(e.target.value)} type="number" placeholder="0"
                    className="w-full h-11 px-3 bg-muted rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30" />
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={!name.trim()}
            onClick={() => {
              if (name.trim()) {
                onSave({ name: name.trim(), calories: Number(calories) || 0, protein_g: Number(protein) || 0, carbs_g: Number(carbs) || 0, fat_g: Number(fat) || 0, serving_g: Number(serving) || 100 });
                onClose();
              }
            }}
            className="w-full h-12 bg-[#1A3A32] dark:bg-emerald-500 rounded-2xl text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
            <Check size={16} strokeWidth={3} /> {food ? 'Guardar cambios' : 'Añadir comida'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ProfileScreen ───────────────────────────────────────────────────────
export function ProfileScreen() {
  const { profile, setActiveScreen } = useAppStore();

  const [section, setSection] = useState<'main' | 'exercises' | 'foods'>('main');
  const [exercises, setExercises] = useState<CustomExercise[]>([]);
  const [foods, setFoods]         = useState<CustomFood[]>([]);
  const [searchEx, setSearchEx]   = useState('');
  const [searchFo, setSearchFo]   = useState('');
  const [exModal, setExModal]     = useState<{ open: boolean; item?: CustomExercise | null }>({ open: false });
  const [foModal, setFoModal]     = useState<{ open: boolean; item?: CustomFood | null }>({ open: false });

  useEffect(() => { if (section === 'exercises') loadExercises(); }, [section]);
  useEffect(() => { if (section === 'foods') loadFoods(); }, [section]);

  async function loadExercises() {
    const { data } = await supabase.from('custom_exercises').select('*').order('created_at', { ascending: false });
    if (data) setExercises(data);
  }

  async function loadFoods() {
    const { data } = await supabase.from('custom_foods').select('*').order('created_at', { ascending: false });
    if (data) setFoods(data);
  }

  async function saveExercise(data: Omit<CustomExercise, 'id'>, id?: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (id) {
      await supabase.from('custom_exercises').update(data).eq('id', id);
    } else {
      await supabase.from('custom_exercises').insert({ ...data, user_id: session.user.id });
    }
    loadExercises();
  }

  async function deleteExercise(id: string) {
    await supabase.from('custom_exercises').delete().eq('id', id);
    setExercises(prev => prev.filter(e => e.id !== id));
  }

  async function saveFood(data: Omit<CustomFood, 'id'>, id?: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (id) {
      await supabase.from('custom_foods').update(data).eq('id', id);
    } else {
      await supabase.from('custom_foods').insert({ ...data, user_id: session.user.id });
    }
    loadFoods();
  }

  async function deleteFood(id: string) {
    await supabase.from('custom_foods').delete().eq('id', id);
    setFoods(prev => prev.filter(f => f.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  // ── MAIN ──
  if (section === 'main') {
    return (
      <div className="flex flex-col min-h-0">
        <div className="px-4 pt-6 pb-4 flex flex-col gap-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1A3A32]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <User size={28} className="text-[#1A3A32] dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{profile?.name ?? 'Usuario'}</h1>
              <p className="text-sm text-muted-foreground">{profile?.email ?? ''}</p>
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-2">
            <button onClick={() => setSection('exercises')}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border active:scale-[0.98] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Dumbbell size={20} className="text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Mis ejercicios</p>
                <p className="text-xs text-muted-foreground">{exercises.length > 0 ? `${exercises.length} ejercicios` : 'Gestiona tu biblioteca'}</p>
              </div>
              <ArrowLeft size={16} className="text-muted-foreground rotate-180" />
            </button>

            <button onClick={() => setSection('foods')}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border active:scale-[0.98] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <UtensilsCrossed size={20} className="text-emerald-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Mis comidas</p>
                <p className="text-xs text-muted-foreground">{foods.length > 0 ? `${foods.length} comidas` : 'Gestiona tus alimentos'}</p>
              </div>
              <ArrowLeft size={16} className="text-muted-foreground rotate-180" />
            </button>
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 active:scale-[0.98] transition-transform">
            <LogOut size={18} />
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </div>
      </div>
    );
  }

  // ── EXERCISES ──
  if (section === 'exercises') {
    const filtered = exercises.filter(e => e.name.toLowerCase().includes(searchEx.toLowerCase()));
    return (
      <div className="flex flex-col min-h-0">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSection('main')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <h1 className="flex-1 text-sm font-bold">Mis ejercicios</h1>
          <button onClick={() => setExModal({ open: true, item: null })}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1A3A32] dark:text-emerald-400 px-3 py-1.5 bg-[#1A3A32]/10 dark:bg-emerald-400/10 rounded-xl">
            <Plus size={14} /> Añadir
          </button>
        </div>
        <div className="px-4 py-3 flex flex-col gap-3 pb-28">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchEx} onChange={e => setSearchEx(e.target.value)}
              placeholder="Buscar ejercicio..." className="w-full h-10 pl-9 pr-3 bg-muted rounded-xl border border-border text-sm focus:outline-none" />
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Dumbbell size={32} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No hay ejercicios todavía</p>
              <button onClick={() => setExModal({ open: true, item: null })}
                className="text-xs font-semibold text-[#1A3A32] dark:text-emerald-400">Añadir el primero</button>
            </div>
          ) : filtered.map(ex => (
            <div key={ex.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{ex.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ex.muscle_group} · {ex.type === 'strength' ? 'Fuerza' : 'Cardio'}</p>
                {ex.notes && <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{ex.notes}</p>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setExModal({ open: true, item: ex })}
                  className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                  <Edit2 size={13} className="text-muted-foreground" />
                </button>
                <button onClick={() => deleteExercise(ex.id)}
                  className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Trash2 size={13} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {exModal.open && (
          <ExerciseModal
            exercise={exModal.item}
            onClose={() => setExModal({ open: false })}
            onSave={data => saveExercise(data, exModal.item?.id)}
          />
        )}
      </div>
    );
  }

  // ── FOODS ──
  const filtered = foods.filter(f => f.name.toLowerCase().includes(searchFo.toLowerCase()));
  return (
    <div className="flex flex-col min-h-0">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => setSection('main')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex-1 text-sm font-bold">Mis comidas</h1>
        <button onClick={() => setFoModal({ open: true, item: null })}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 bg-emerald-500/10 rounded-xl">
          <Plus size={14} /> Añadir
        </button>
      </div>
      <div className="px-4 py-3 flex flex-col gap-3 pb-28">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchFo} onChange={e => setSearchFo(e.target.value)}
            placeholder="Buscar comida..." className="w-full h-10 pl-9 pr-3 bg-muted rounded-xl border border-border text-sm focus:outline-none" />
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <UtensilsCrossed size={32} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No hay comidas todavía</p>
            <button onClick={() => setFoModal({ open: true, item: null })}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Añadir la primera</button>
          </div>
        ) : filtered.map(fo => (
          <div key={fo.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{fo.name}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="text-[10px] font-semibold text-orange-500">{fo.calories} kcal</span>
                <span className="text-[10px] text-blue-500">P: {fo.protein_g}g</span>
                <span className="text-[10px] text-amber-500">C: {fo.carbs_g}g</span>
                <span className="text-[10px] text-red-500">G: {fo.fat_g}g</span>
                <span className="text-[10px] text-muted-foreground">por {fo.serving_g}g</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setFoModal({ open: true, item: fo })}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                <Edit2 size={13} className="text-muted-foreground" />
              </button>
              <button onClick={() => deleteFood(fo.id)}
                className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Trash2 size={13} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {foModal.open && (
        <FoodModal
          food={foModal.item}
          onClose={() => setFoModal({ open: false })}
          onSave={data => saveFood(data, foModal.item?.id)}
        />
      )}
    </div>
  );
}

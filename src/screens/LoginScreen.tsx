import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError('Rellena todos los campos'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError('Email o contraseña incorrectos');
    } else {
      onLogin();
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#1A3A32] flex items-center justify-center mb-4 shadow-lg">
          <Dumbbell size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">FitTrack</h1>
        <p className="text-sm text-muted-foreground mt-1">Tu entrenamiento personalizado</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Email */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full h-12 px-4 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full h-12 px-4 pr-12 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A3A32]/30"
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={cn(
            'w-full h-12 rounded-2xl text-white font-semibold text-sm transition-all active:scale-[0.98]',
            loading ? 'bg-[#1A3A32]/50' : 'bg-[#1A3A32] dark:bg-emerald-500'
          )}
        >
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </div>
    </div>
  );
}

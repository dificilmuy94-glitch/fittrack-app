import { Chrome as Home, CalendarDays, TrendingUp, FolderOpen, LogOut } from 'lucide-react';
import { useAppStore, Screen } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const navItems: { id: Screen; label: string; icon: React.ElementType }[] = [
  { id: 'home',      label: 'Home',      icon: Home },
  { id: 'agenda',    label: 'Agenda',    icon: CalendarDays },
  { id: 'evolution', label: 'Evolución', icon: TrendingUp },
  { id: 'files',     label: 'Archivos',  icon: FolderOpen },
];

export function BottomNav() {
  const { activeScreen, setActiveScreen } = useAppStore();

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md safe-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeScreen === id;
          return (
            <button key={id} onClick={() => setActiveScreen(id)}
              className={cn('flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px]',
                isActive ? 'text-[#1A3A32] dark:text-emerald-400' : 'text-muted-foreground hover:text-foreground')}>
              <div className={cn('p-1.5 rounded-lg transition-all duration-200', isActive ? 'bg-[#1A3A32]/10 dark:bg-emerald-400/10' : '')}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className={cn(isActive ? 'scale-110' : '')} />
              </div>
              <span className={cn('text-[10px] font-medium tracking-tight', isActive ? 'opacity-100' : 'opacity-60')}>
                {label}
              </span>
            </button>
          );
        })}

        {/* Logout */}
        <button onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-red-500 transition-all duration-200 min-w-[52px]">
          <div className="p-1.5 rounded-lg">
            <LogOut size={20} strokeWidth={1.8} />
          </div>
          <span className="text-[10px] font-medium tracking-tight opacity-60">Salir</span>
        </button>
      </div>
    </nav>
  );
}

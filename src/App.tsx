import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { BottomNav } from '@/components/BottomNav';
import { LoginScreen } from '@/screens/LoginScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { AgendaScreen } from '@/screens/AgendaScreen';
import { EvolutionScreen } from '@/screens/EvolutionScreen';
import { FilesScreen } from '@/screens/FilesScreen';
import { WorkoutLoggerScreen } from '@/screens/WorkoutLoggerScreen';
import { ExerciseListScreen } from '@/screens/ExerciseListScreen';

const SCREENS_WITH_NAV = ['home', 'agenda', 'evolution', 'files'];

export default function App() {
  const { activeScreen, darkMode, setDarkMode } = useAppStore();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mq.addEventListener('change', handler);
    setDarkMode(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, [setDarkMode]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1A3A32] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onLogin={() => {}} />;
  }

  const showNav = SCREENS_WITH_NAV.includes(activeScreen);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':           return <HomeScreen />;
      case 'agenda':         return <AgendaScreen />;
      case 'evolution':      return <EvolutionScreen />;
      case 'files':          return <FilesScreen />;
      case 'workout-logger': return <WorkoutLoggerScreen />;
      case 'exercise-list':  return <ExerciseListScreen />;
      default:               return <HomeScreen />;
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background max-w-lg mx-auto relative">
      <main className={`flex-1 overflow-y-auto ${showNav ? 'pb-20' : ''}`}>
        {renderScreen()}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}

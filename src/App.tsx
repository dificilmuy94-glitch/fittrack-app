import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BottomNav } from '@/components/BottomNav';
import { HomeScreen } from '@/screens/HomeScreen';
import { AgendaScreen } from '@/screens/AgendaScreen';
import { EvolutionScreen } from '@/screens/EvolutionScreen';
import { FilesScreen } from '@/screens/FilesScreen';
import { WorkoutLoggerScreen } from '@/screens/WorkoutLoggerScreen';
import { ExerciseListScreen } from '@/screens/ExerciseListScreen';

const SCREENS_WITH_NAV = ['home', 'agenda', 'evolution', 'files'];

export default function App() {
  const { activeScreen, darkMode, setDarkMode } = useAppStore();

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

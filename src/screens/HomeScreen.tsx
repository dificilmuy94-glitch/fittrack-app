import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const DOT_COLORS: Record<string, string> = {
  workout:   'bg-blue-500',
  steps:     'bg-amber-400',
  nutrition: 'bg-emerald-500',
  cardio:    'bg-red-500',
};

function getDotsForDate(date: Date): string[] {
  const day = date.getDay();
  const dots: string[] = [];
  if (day !== 0) dots.push('workout');
  dots.push('steps');
  dots.push('nutrition');
  // Check localStorage for cardio tasks on this date
  try {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    const tasks = JSON.parse(localStorage.getItem('fittrack_tasks') || '[]');
    if (tasks.some((t: { date: string; task_type: string }) => t.date === iso && t.task_type === 'cardio')) {
      dots.push('cardio');
    }
  } catch {}
  return dots;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export function HomeScreen() {
  const { setActiveScreen, setSelectedDate } = useAppStore();
  const today = new Date();

  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDayClick(date: Date) {
    // Build ISO string in local time (avoid UTC offset shifting the date)
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    setSelectedDate(iso);
    setActiveScreen('agenda');
  }

  const firstDay  = new Date(viewYear, viewMonth, 1);
  const lastDay   = new Date(viewYear, viewMonth + 1, 0);
  const startDow  = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const totalCells = Math.ceil((startDow - 1 + lastDay.getDate()) / 7) * 7;

  const cells: Date[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - (startDow - 1) + 1;
    cells.push(new Date(viewYear, viewMonth, dayNum));
  }

  const todayStr = today.toDateString();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-green-200/60 to-transparent dark:from-green-900/30 px-5 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">Q</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-white/80 dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <MessageSquare size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/80 dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <Bell size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar card */}
      <div className="px-4 -mt-2 flex-1">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['M','T','W','R','F','S','U'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((date, i) => {
              const isCurrentMonth = date.getMonth() === viewMonth;
              const isToday = date.toDateString() === todayStr;
              const dots = isCurrentMonth ? getDotsForDate(date) : [];

              return (
                <button
                  key={i}
                  onClick={() => isCurrentMonth && handleDayClick(date)}
                  disabled={!isCurrentMonth}
                  className="flex flex-col items-center gap-0.5 py-1 active:scale-95 transition-transform"
                >
                  <span className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isToday
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold'
                      : isCurrentMonth
                      ? 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-gray-300 dark:text-gray-700'
                  )}>
                    {date.getDate()}
                  </span>
                  {dots.length > 0 && (
                    <div className="flex items-center gap-[3px]">
                      {dots.slice(0, 4).map((type, di) => (
                        <div key={di} className={cn('w-1.5 h-1.5 rounded-full', DOT_COLORS[type])} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAB */}
        <div className="flex justify-end mt-6 mb-6">
          <button
            onClick={() => {
              const y = today.getFullYear();
              const m = String(today.getMonth() + 1).padStart(2, '0');
              const d = String(today.getDate()).padStart(2, '0');
              setSelectedDate(`${y}-${m}-${d}`);
              setActiveScreen('agenda');
            }}
            className="w-14 h-14 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-white dark:text-gray-900 text-2xl font-light leading-none">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}

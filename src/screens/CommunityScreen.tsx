import { Heart, MessageCircle, Award, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const posts = [
  {
    id: '1',
    user: 'Carlos M.',
    avatar: 'CM',
    time: 'hace 2h',
    workout: 'TRIPLE A - MES 2',
    stats: { duration: '58 min', volume: '12.4 T', prs: 2 },
    likes: 14,
    comments: 3,
    liked: false,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  },
  {
    id: '2',
    user: 'Ana R.',
    avatar: 'AR',
    time: 'hace 5h',
    workout: 'UPPER B - MES 2',
    stats: { duration: '52 min', volume: '8.8 T', prs: 1 },
    likes: 22,
    comments: 7,
    liked: true,
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  },
  {
    id: '3',
    user: 'Marco S.',
    avatar: 'MS',
    time: 'ayer',
    workout: 'LOWER A - MES 2',
    stats: { duration: '65 min', volume: '15.2 T', prs: 3 },
    likes: 31,
    comments: 11,
    liked: false,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
];

const leaderboard = [
  { rank: 1, name: 'Marco S.', sessions: 18, avatar: 'MS', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  { rank: 2, name: 'Ana R.', sessions: 16, avatar: 'AR', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' },
  { rank: 3, name: 'Tú', sessions: 14, avatar: 'Tú', color: 'bg-[#1A3A32]/10 text-[#1A3A32] dark:bg-emerald-400/10 dark:text-emerald-400' },
  { rank: 4, name: 'Carlos M.', sessions: 12, avatar: 'CM', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
];

export function CommunityScreen() {
  return (
    <div className="flex flex-col gap-5 pb-2">
      <div className="px-5 pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comunidad</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tu grupo de entrenamiento</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A3A32]/10 dark:bg-emerald-400/10 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1A3A32] dark:bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-[#1A3A32] dark:text-emerald-400">4 activos</span>
        </div>
      </div>

      <div className="px-5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold">Top del mes</h3>
          </div>
          <div className="flex flex-col gap-2">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-3">
                <span className={cn(
                  'text-xs font-bold w-5',
                  entry.rank === 1 ? 'text-amber-500' : entry.rank === 2 ? 'text-slate-400' : entry.rank === 3 ? 'text-[#1A3A32] dark:text-emerald-400' : 'text-muted-foreground'
                )}>
                  {entry.rank}
                </span>
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold', entry.color)}>
                  {entry.avatar.length <= 2 ? entry.avatar : entry.avatar.slice(0, 2)}
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">{entry.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-foreground">{entry.sessions}</span>
                  <span className="text-[10px] text-muted-foreground">sesiones</span>
                </div>
                <div
                  className="h-1.5 rounded-full bg-[#1A3A32]/20 dark:bg-emerald-400/20 overflow-hidden"
                  style={{ width: 60 }}
                >
                  <div
                    className="h-full bg-[#1A3A32] dark:bg-emerald-400 rounded-full"
                    style={{ width: `${(entry.sessions / 18) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5">
        <h2 className="text-sm font-semibold mb-3">Actividad reciente</h2>
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold', post.color)}>
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{post.user}</p>
                  <p className="text-xs text-muted-foreground">{post.time}</p>
                </div>
                <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Share2 size={13} className="text-muted-foreground" />
                </button>
              </div>

              <div className="bg-muted rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-[#1A3A32] dark:text-emerald-400 mb-2">{post.workout}</p>
                <div className="flex gap-4">
                  {[
                    { label: 'Duración', value: post.stats.duration },
                    { label: 'Volumen', value: post.stats.volume },
                    { label: 'PRs', value: String(post.stats.prs) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="text-sm font-bold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className={cn(
                  'flex items-center gap-1.5 text-xs font-medium transition-colors',
                  post.liked ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'
                )}>
                  <Heart size={14} className={post.liked ? 'fill-current' : ''} />
                  {post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle size={14} />
                  {post.comments}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

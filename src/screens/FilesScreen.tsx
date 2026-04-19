import { FileText, Video, Image, Download, ChevronRight, FolderOpen, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const FOLDERS = [
  { name: 'Mes 1 - Base', files: 8, icon: FolderOpen, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
  { name: 'Mes 2 - Fuerza', files: 12, icon: FolderOpen, color: 'bg-[#1A3A32]/10 text-[#1A3A32] dark:bg-emerald-400/10 dark:text-emerald-400' },
  { name: 'Nutrición', files: 5, icon: FolderOpen, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' },
  { name: 'Evaluaciones', files: 3, icon: FolderOpen, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400', locked: true },
];

const FILES = [
  { name: 'Plan de Entrenamiento MES 2.pdf', type: 'pdf', size: '2.4 MB', date: '15 abr', icon: FileText, color: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' },
  { name: 'Técnica Back Squat.mp4', type: 'video', size: '48 MB', date: '10 abr', icon: Video, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
  { name: 'Guía de Nutrición.pdf', type: 'pdf', size: '1.8 MB', date: '1 abr', icon: FileText, color: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' },
  { name: 'Progresión de cargas.xlsx', type: 'sheet', size: '0.5 MB', date: '28 mar', icon: FileText, color: 'bg-[#1A3A32]/10 text-[#1A3A32] dark:bg-emerald-400/10 dark:text-emerald-400' },
  { name: 'Foto inicio programa.jpg', type: 'image', size: '3.1 MB', date: '1 ene', icon: Image, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' },
];

export function FilesScreen() {
  return (
    <div className="flex flex-col gap-5 pb-2">
      <div className="px-5 pt-6">
        <h1 className="text-2xl font-bold">Archivos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Material de entrenamiento</p>
      </div>

      <div className="px-5">
        <div className="grid grid-cols-2 gap-3">
          {FOLDERS.map((folder) => {
            const Icon = folder.icon;
            return (
              <button
                key={folder.name}
                className={cn(
                  'flex flex-col gap-3 bg-card border border-border rounded-2xl p-4 text-left hover:border-[#1A3A32]/30 transition-colors',
                  folder.locked ? 'opacity-70' : ''
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', folder.color)}>
                    <Icon size={18} />
                  </div>
                  {folder.locked && (
                    <Lock size={12} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{folder.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{folder.files} archivos</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recientes</h2>
          <button className="text-xs text-[#1A3A32] dark:text-emerald-400 font-medium">Ver todos</button>
        </div>
        <div className="flex flex-col gap-2">
          {FILES.map((file) => {
            const Icon = file.icon;
            return (
              <div
                key={file.name}
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-[#1A3A32]/20 transition-colors cursor-pointer"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', file.color)}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size} · {file.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-[#1A3A32]/10 transition-colors">
                    <Download size={13} className="text-muted-foreground" />
                  </button>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Almacenamiento</h3>
            <span className="text-xs text-muted-foreground">55.8 MB / 1 GB</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A3A32] dark:bg-emerald-400 rounded-full"
              style={{ width: '5.58%' }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3">
            {[
              { label: 'Videos', value: '48 MB', color: 'bg-blue-400' },
              { label: 'PDFs', value: '4.2 MB', color: 'bg-red-400' },
              { label: 'Imágenes', value: '3.1 MB', color: 'bg-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={cn('w-2 h-2 rounded-full', color)} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
                <span className="text-[10px] font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

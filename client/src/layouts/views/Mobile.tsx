import React from 'react';
import {
  Search,
  FolderDown,
  BookOpen,
  FileArchive,
  Monitor,
  Smartphone
} from 'lucide-react';
import { useViewMode } from '../../context/ViewModeContext';
import { useDownload } from '../../context/DownloadContext';

interface MobileProps {
  currentRoute: 'home' | 'progress' | 'read' | 'cbz';
  onRouteChange: (route: 'home' | 'progress' | 'read' | 'cbz') => void;
  children: React.ReactNode;
}

export default function Mobile({ currentRoute, onRouteChange, children }: MobileProps) {
  const { viewMode, setViewMode } = useViewMode();
  const { jobs } = useDownload();

  const activeJobCount = jobs.filter(
    (j: any) =>
      j.status === 'downloading' ||
      j.status === 'fetching_chapters' ||
      j.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      {/* Mobile Top Header */}
      <header className="border-b border-zinc-900 bg-black/95 backdrop-blur sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold">
            <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <div>
            <h1 className="text-xs font-semibold text-zinc-100 tracking-tight">Home Manga DB</h1>
            <p className="text-[9px] text-zinc-500 font-mono">4 req/s limit</p>
          </div>
        </div>

        {/* View Switcher button on top right */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-900 text-xs">
          <button
            onClick={() => setViewMode('web')}
            title="Desktop / Web View"
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'web' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Monitor className="w-3 h-3" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            title="Mobile View"
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'mobile' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Smartphone className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Main Content Area with bottom padding for tab bar */}
      <main className="flex-1 p-3.5 w-full flex flex-col pb-24">
        {children}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onRouteChange('home')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-[10px] font-medium transition cursor-pointer ${
            currentRoute === 'home'
              ? 'text-white font-semibold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition ${currentRoute === 'home' ? 'bg-zinc-900 border border-zinc-800 text-white' : ''}`}>
            <Search className="w-4 h-4" />
          </div>
          <span>Discover</span>
        </button>

        <button
          onClick={() => onRouteChange('progress')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-[10px] font-medium transition cursor-pointer relative ${
            currentRoute === 'progress'
              ? 'text-white font-semibold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition relative ${currentRoute === 'progress' ? 'bg-zinc-900 border border-zinc-800 text-white' : ''}`}>
            <FolderDown className="w-4 h-4" />
            {activeJobCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-zinc-200 text-black text-[8px] font-bold flex items-center justify-center">
                {activeJobCount}
              </span>
            )}
          </div>
          <span>Tasks</span>
        </button>

        <button
          onClick={() => onRouteChange('read')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition cursor-pointer ${
            currentRoute === 'read'
              ? 'text-white font-semibold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition ${currentRoute === 'read' ? 'bg-zinc-900 border border-zinc-800 text-white' : ''}`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <span>Reader</span>
        </button>

        <button
          onClick={() => onRouteChange('cbz')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition cursor-pointer ${
            currentRoute === 'cbz'
              ? 'text-white font-semibold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition ${currentRoute === 'cbz' ? 'bg-zinc-900 border border-zinc-800 text-white' : ''}`}>
            <FileArchive className="w-4 h-4" />
          </div>
          <span>CBZ</span>
        </button>
      </nav>
    </div>
  );
}

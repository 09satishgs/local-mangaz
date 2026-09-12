import React from 'react';
import {
  Search,
  FolderDown,
  BookOpen,
  FileArchive,
  Monitor,
  Smartphone,
  Maximize,
  Minimize
} from 'lucide-react';
import { useViewMode } from '../../context/ViewModeContext';
import { useDownload } from '../../context/DownloadContext';
import { useFullscreen } from '../../hooks/useHashRouter';


interface WebProps {
  currentRoute: 'home' | 'progress' | 'read' | 'cbz';
  onRouteChange: (route: 'home' | 'progress' | 'read' | 'cbz') => void;
}

export default function Web({ currentRoute, onRouteChange }: WebProps) {
  const { viewMode, setViewMode } = useViewMode();
  const { jobs } = useDownload();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const activeJobCount = jobs.filter(
    (j: any) =>
      j.status === 'downloading' ||
      j.status === 'fetching_chapters' ||
      j.status === 'pending'
  ).length;


  return (
    <header className="border-b border-zinc-900 bg-black sticky top-0 z-30 px-6 md:px-8 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold">
          <BookOpen className="w-4 h-4 text-zinc-300" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">Home Manga DB</h1>
          <p className="text-[10px] text-zinc-500 font-mono">4 req/s rate limited</p>
        </div>
      </div>

      {/* Main 3 Route Tabs */}
      <nav className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
        <button
          onClick={() => onRouteChange('home')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            currentRoute === 'home'
              ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onRouteChange('progress')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer relative ${
            currentRoute === 'progress'
              ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderDown className="w-3.5 h-3.5" />
          <span>Progress</span>
          {activeJobCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-zinc-200 text-black text-[9px] font-bold flex items-center justify-center">
              {activeJobCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onRouteChange('read')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            currentRoute === 'read'
              ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Read</span>
        </button>

        <button
          onClick={() => onRouteChange('cbz')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            currentRoute === 'cbz'
              ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileArchive className="w-3.5 h-3.5" />
          <span>CBZ</span>
        </button>
      </nav>

      {/* Right Controls: View Mode Switcher & Fullscreen Button */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-900 text-xs">
          <button
            onClick={() => setViewMode('web')}
            title="Desktop / Web View"
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'web' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            title="Mobile View"
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'mobile' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}


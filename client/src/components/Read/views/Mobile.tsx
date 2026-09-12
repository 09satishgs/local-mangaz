import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  ArrowUp,
  RefreshCw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  SkipForward,
  SkipBack,
  Rows3,
  Columns2
} from 'lucide-react';

export default function Mobile({ read }: { read: any }) {
  const {
    currentPath,
    parentPath,
    folders,
    images,
    prevSiblingFolder,
    nextSiblingFolder,
    loading,
    error,
    openFolder,
    goUp,
    fetchDirectory,
    readerOpen,
    openReader,
    closeReader,
    currentPageIndex,
    setCurrentPageIndex,
    nextPage,
    prevPage,
    goToNextChapter,
    goToPrevChapter,
    API_BASE
  } = read;

  // Mobile reader display mode: 'swipe' (single page swiping) or 'continuous' (vertical infinite scroll)
  const [displayMode, setDisplayMode] = useState<'swipe' | 'continuous'>('swipe');

  // Touch handling for swipe gesture
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      if (currentPageIndex < images.length - 1) {
        nextPage();
      } else if (nextSiblingFolder) {
        goToNextChapter();
      }
    } else if (isRightSwipe) {
      if (currentPageIndex > 0) {
        prevPage();
      } else if (prevSiblingFolder) {
        goToPrevChapter();
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full pb-20">
      {/* Top Explorer Nav */}
      <div className="flex items-center justify-between gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button
            onClick={goUp}
            disabled={!parentPath || loading}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fetchDirectory(currentPath)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="font-mono text-[11px] text-zinc-400 truncate flex-1">
            {currentPath}
          </span>
        </div>

        {images.length > 0 && (
          <button
            onClick={() => openReader(0)}
            className="bg-zinc-100 text-black px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-zinc-950 border border-red-900/40 text-red-400 p-3 rounded-lg text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          <span className="text-xs">Loading files...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Folders */}
          {folders.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Folders ({folders.length})
              </span>
              {folders.map((f: any) => (
                <div
                  key={f.path}
                  onClick={() => openFolder(f.path)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 cursor-pointer"
                >
                  <Folder className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="truncate text-[11px] font-medium">{f.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Images Grid */}
          {images.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Pages ({images.length})
              </span>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img: any, idx: number) => (
                  <div
                    key={img.path}
                    onClick={() => openReader(idx)}
                    className="aspect-[2/3] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-900 relative cursor-pointer"
                  >
                    <img
                      src={`${API_BASE}/image?path=${encodeURIComponent(img.path)}`}
                      alt={img.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-[9px] text-zinc-300 text-center font-mono">
                      p. {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Reader Fullscreen Modal */}
      {readerOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Top Control Bar */}
          <div className="h-11 border-b border-zinc-900 bg-black/95 px-3 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-zinc-200 font-semibold text-xs">
                {displayMode === 'swipe' ? `${currentPageIndex + 1} / ${images.length}` : `${images.length} pages`}
              </span>

              {/* Mode Toggle: Swipe vs Continuous */}
              <div className="flex items-center bg-zinc-900 p-0.5 rounded border border-zinc-800">
                <button
                  onClick={() => setDisplayMode('swipe')}
                  className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                    displayMode === 'swipe' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500'
                  }`}
                  title="Swipe page by page"
                >
                  <Columns2 className="w-3 h-3" />
                  Swipe
                </button>
                <button
                  onClick={() => setDisplayMode('continuous')}
                  className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                    displayMode === 'continuous' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500'
                  }`}
                  title="Continuous vertical scroll (webtoon style)"
                >
                  <Rows3 className="w-3 h-3" />
                  Continuous
                </button>
              </div>
            </div>

            <button
              onClick={closeReader}
              className="p-1.5 rounded bg-zinc-900 text-zinc-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Reader Content Area */}
          {displayMode === 'swipe' ? (
            /* SWIPE MODE (Gesture support + buttons) */
            <div
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              className="flex-1 relative flex items-center justify-center p-2 bg-black overflow-hidden select-none"
            >
              <img
                src={`${API_BASE}/image?path=${encodeURIComponent(images[currentPageIndex]?.path)}`}
                alt={`Page ${currentPageIndex + 1}`}
                className="max-h-[calc(100vh-110px)] max-w-full object-contain"
              />

              {/* Chapter jump overlays at ends */}
              {currentPageIndex === 0 && prevSiblingFolder && (
                <button
                  onClick={goToPrevChapter}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-zinc-900/90 border border-zinc-800 text-zinc-200 px-2 py-3 rounded-lg text-[10px] flex flex-col items-center gap-1 shadow-lg"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  Prev Ch
                </button>
              )}

              {currentPageIndex === images.length - 1 && nextSiblingFolder && (
                <button
                  onClick={goToNextChapter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-900/90 border border-zinc-800 text-zinc-200 px-2 py-3 rounded-lg text-[10px] flex flex-col items-center gap-1 shadow-lg"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Next Ch
                </button>
              )}
            </div>
          ) : (
            /* CONTINUOUS VERTICAL SCROLL MODE (Webtoon style) */
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 flex flex-col items-center gap-2 bg-black">
              {/* Previous chapter jumper */}
              {prevSiblingFolder && (
                <button
                  onClick={goToPrevChapter}
                  className="w-full py-3 my-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <SkipBack className="w-4 h-4" />
                  Previous Chapter: {prevSiblingFolder.name}
                </button>
              )}

              {images.map((img: any, idx: number) => (
                <div key={img.path} className="w-full max-w-xl flex flex-col items-center">
                  <img
                    src={`${API_BASE}/image?path=${encodeURIComponent(img.path)}`}
                    alt={`Page ${idx + 1}`}
                    className="w-full object-contain shadow-lg"
                    loading="lazy"
                  />
                  <span className="text-[10px] font-mono text-zinc-600 py-1">- Page {idx + 1} -</span>
                </div>
              ))}

              {/* Next chapter jumper */}
              {nextSiblingFolder && (
                <button
                  onClick={goToNextChapter}
                  className="w-full py-3 my-4 rounded-xl bg-zinc-100 text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Next Chapter: {nextSiblingFolder.name}
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Bottom navigation bar (Active in Swipe mode) */}
          {displayMode === 'swipe' && (
            <div className="h-12 border-t border-zinc-900 bg-zinc-950 px-3 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  if (currentPageIndex > 0) prevPage();
                  else if (prevSiblingFolder) goToPrevChapter();
                }}
                disabled={currentPageIndex === 0 && !prevSiblingFolder}
                className="flex items-center gap-1 text-zinc-300 disabled:opacity-30 px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
                {currentPageIndex === 0 && prevSiblingFolder ? 'Prev Ch' : 'Prev'}
              </button>

              <select
                value={currentPageIndex}
                onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                className="bg-zinc-900 text-zinc-200 text-xs px-2.5 py-1 rounded border border-zinc-800"
              >
                {images.map((_: any, i: number) => (
                  <option key={i} value={i}>
                    Page {i + 1}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (currentPageIndex < images.length - 1) nextPage();
                  else if (nextSiblingFolder) goToNextChapter();
                }}
                disabled={currentPageIndex === images.length - 1 && !nextSiblingFolder}
                className="flex items-center gap-1 text-zinc-300 disabled:opacity-30 px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                {currentPageIndex === images.length - 1 && nextSiblingFolder ? 'Next Ch' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

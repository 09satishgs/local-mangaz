import React, { useState, useRef } from 'react';
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
  Columns2,
  FileArchive,
  HardDrive
} from 'lucide-react';

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function Mobile({ cbz }: { cbz: any }) {
  const {
    currentPath,
    parentPath,
    folders,
    cbzFiles,
    loading,
    error,
    openFolder,
    goUp,
    fetchDirectory,
    activeCbz,
    readerOpen,
    openCbzReader,
    closeReader,
    currentPageIndex,
    setCurrentPageIndex,
    nextPage,
    prevPage,
    goToNextCbz,
    goToPrevCbz,
    loadingCbz
  } = cbz;

  // Mobile reader display mode: 'swipe' (single page swiping) or 'continuous' (vertical scroll)
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
    if (!touchStartX.current || !touchEndX.current || !activeCbz) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      if (currentPageIndex < activeCbz.pages.length - 1) {
        nextPage();
      } else if (activeCbz.nextCbz) {
        goToNextCbz();
      }
    } else if (isRightSwipe) {
      if (currentPageIndex > 0) {
        prevPage();
      } else if (activeCbz.prevCbz) {
        goToPrevCbz();
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full pb-20">
      {/* Top Explorer Bar */}
      <div className="flex items-center justify-between gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button
            onClick={goUp}
            disabled={!parentPath || loading}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 transition"
            title="Go to parent directory"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fetchDirectory(currentPath)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 transition"
            title="Refresh current folder"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <HardDrive className="w-3 h-3 text-zinc-500 shrink-0" />
            <span className="font-mono text-[11px] text-zinc-400 truncate">
              {currentPath}
            </span>
          </div>
        </div>

        <span className="text-[10px] text-zinc-500 font-mono px-2 py-1 rounded bg-zinc-900 border border-zinc-800 shrink-0">
          {cbzFiles.length} CBZ
        </span>
      </div>

      {error && (
        <div className="bg-zinc-950 border border-red-900/40 text-red-400 p-3 rounded-lg text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          <span className="text-xs">Scanning for .cbz and .zip archives...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Folders */}
          {folders.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Folders ({folders.length})
              </span>
              <div className="grid grid-cols-2 gap-2">
                {folders.map((f: any) => (
                  <div
                    key={f.path}
                    onClick={() => openFolder(f.path)}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-xs text-zinc-200 cursor-pointer active:bg-zinc-900 transition"
                  >
                    <Folder className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span className="truncate text-[11px] font-medium">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CBZ Archives List */}
          {cbzFiles.length > 0 ? (
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Comic Archives ({cbzFiles.length})
              </span>
              <div className="flex flex-col gap-2">
                {cbzFiles.map((item: any) => (
                  <div
                    key={item.path}
                    onClick={() => openCbzReader(item.path, 0)}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-900 active:border-zinc-700 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <FileArchive className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-zinc-200 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {formatBytes(item.sizeBytes)}
                        </p>
                      </div>
                    </div>

                    <button className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-200 text-xs font-semibold flex items-center gap-1 shrink-0 border border-zinc-800">
                      <BookOpen className="w-3 h-3" />
                      Read
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            folders.length === 0 && (
              <div className="p-12 text-center text-zinc-600 bg-zinc-950 rounded-xl border border-zinc-900 text-xs flex flex-col items-center gap-2">
                <FileArchive className="w-7 h-7 text-zinc-700" />
                <p>No .cbz or .zip comic files found in this folder.</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {loadingCbz && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-200" />
          <p className="text-xs text-zinc-400 font-mono">
            Unpacking CBZ archive pages...
          </p>
        </div>
      )}

      {/* Mobile CBZ Reader Fullscreen Modal */}
      {readerOpen && activeCbz && activeCbz.pages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col select-none">
          {/* Top Control Bar */}
          <div className="h-12 border-b border-zinc-900 bg-black px-3 flex items-center justify-between text-xs text-zinc-400 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-zinc-200 font-semibold text-xs shrink-0">
                {displayMode === 'swipe'
                  ? `${currentPageIndex + 1} / ${activeCbz.pages.length}`
                  : `${activeCbz.pages.length}p`}
              </span>
              <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[120px]">
                {activeCbz.name}
              </span>

              {/* Mode Toggle: Swipe vs Continuous */}
              <div className="flex items-center bg-zinc-900 p-0.5 rounded border border-zinc-800 shrink-0">
                <button
                  onClick={() => setDisplayMode('swipe')}
                  className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                    displayMode === 'swipe'
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-500'
                  }`}
                  title="Swipe page by page"
                >
                  <Columns2 className="w-3 h-3" />
                  Swipe
                </button>
                <button
                  onClick={() => setDisplayMode('continuous')}
                  className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                    displayMode === 'continuous'
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-500'
                  }`}
                  title="Continuous vertical scroll"
                >
                  <Rows3 className="w-3 h-3" />
                  Scroll
                </button>
              </div>
            </div>

            <button
              onClick={closeReader}
              className="p-1.5 rounded bg-zinc-900 text-zinc-300 hover:text-white shrink-0 ml-2"
              title="Close reader"
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
                src={activeCbz.pages[currentPageIndex]?.url}
                alt={`Page ${currentPageIndex + 1}`}
                className="max-h-[calc(100vh-115px)] max-w-full object-contain"
              />

              {/* Chapter jump overlays at ends */}
              {currentPageIndex === 0 && activeCbz.prevCbz && (
                <button
                  onClick={goToPrevCbz}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-zinc-900/90 border border-zinc-800 text-zinc-200 px-2 py-3 rounded-lg text-[10px] flex flex-col items-center gap-1 shadow-lg"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  Prev CBZ
                </button>
              )}

              {currentPageIndex === activeCbz.pages.length - 1 && activeCbz.nextCbz && (
                <button
                  onClick={goToNextCbz}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-900/90 border border-zinc-800 text-zinc-200 px-2 py-3 rounded-lg text-[10px] flex flex-col items-center gap-1 shadow-lg"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Next CBZ
                </button>
              )}
            </div>
          ) : (
            /* CONTINUOUS VERTICAL SCROLL MODE (Webtoon style) */
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 flex flex-col items-center gap-2 bg-black">
              {/* Previous CBZ jumper */}
              {activeCbz.prevCbz && (
                <button
                  onClick={goToPrevCbz}
                  className="w-full py-3 my-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <SkipBack className="w-4 h-4" />
                  Previous Archive: {activeCbz.prevCbz.name}
                </button>
              )}

              {activeCbz.pages.map((page: any, idx: number) => (
                <div key={page.entryName} className="w-full max-w-xl flex flex-col items-center">
                  <img
                    src={page.url}
                    alt={`Page ${idx + 1}`}
                    className="w-full object-contain shadow-lg"
                    loading="lazy"
                  />
                  <span className="text-[10px] font-mono text-zinc-600 py-1">
                    - Page {idx + 1} -
                  </span>
                </div>
              ))}

              {/* Next CBZ jumper */}
              {activeCbz.nextCbz && (
                <button
                  onClick={goToNextCbz}
                  className="w-full py-3 my-4 rounded-xl bg-zinc-100 text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  Next Archive: {activeCbz.nextCbz.name}
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Bottom navigation bar (Active in Swipe mode) */}
          {displayMode === 'swipe' && (
            <div className="h-12 border-t border-zinc-900 bg-zinc-950 px-3 flex items-center justify-between text-xs shrink-0">
              <button
                onClick={() => {
                  if (currentPageIndex > 0) prevPage();
                  else if (activeCbz.prevCbz) goToPrevCbz();
                }}
                disabled={currentPageIndex === 0 && !activeCbz.prevCbz}
                className="flex items-center gap-1 text-zinc-300 disabled:opacity-30 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                {currentPageIndex === 0 && activeCbz.prevCbz ? 'Prev CBZ' : 'Prev'}
              </button>

              <select
                value={currentPageIndex}
                onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                className="bg-zinc-900 text-zinc-200 text-xs px-2 py-1 rounded border border-zinc-800"
              >
                {activeCbz.pages.map((_: any, i: number) => (
                  <option key={i} value={i}>
                    Page {i + 1}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (currentPageIndex < activeCbz.pages.length - 1) nextPage();
                  else if (activeCbz.nextCbz) goToNextCbz();
                }}
                disabled={
                  currentPageIndex === activeCbz.pages.length - 1 &&
                  !activeCbz.nextCbz
                }
                className="flex items-center gap-1 text-zinc-300 disabled:opacity-30 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs"
              >
                {currentPageIndex === activeCbz.pages.length - 1 && activeCbz.nextCbz
                  ? 'Next CBZ'
                  : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

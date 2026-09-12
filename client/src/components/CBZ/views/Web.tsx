import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  ArrowUp,
  RefreshCw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  HardDrive,
  Loader2,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  FileArchive
} from 'lucide-react';

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function Web({ cbz }: { cbz: any }) {
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

  const [fullscreenMode, setFullscreenMode] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setFullscreenMode((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!readerOpen || !activeCbz) return;

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (currentPageIndex < activeCbz.pages.length - 1) {
          nextPage();
        } else if (activeCbz.nextCbz) {
          goToNextCbz();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (currentPageIndex > 0) {
          prevPage();
        } else if (activeCbz.prevCbz) {
          goToPrevCbz();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (fullscreenMode) {
          setFullscreenMode(false);
        } else {
          closeReader();
        }
      }
    },
    [
      readerOpen,
      activeCbz,
      currentPageIndex,
      nextPage,
      prevPage,
      goToNextCbz,
      goToPrevCbz,
      closeReader,
      fullscreenMode,
      toggleFullscreen
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const prevImage =
    activeCbz && currentPageIndex > 0
      ? activeCbz.pages[currentPageIndex - 1]
      : null;
  const currentImage =
    activeCbz && activeCbz.pages[currentPageIndex]
      ? activeCbz.pages[currentPageIndex]
      : null;
  const nextImage =
    activeCbz && currentPageIndex < activeCbz.pages.length - 1
      ? activeCbz.pages[currentPageIndex + 1]
      : null;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Explorer Bar */}
      <div className="flex items-center justify-between gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={goUp}
            disabled={!parentPath || loading}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
            title="Go to parent directory"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => fetchDirectory(currentPath)}
            disabled={loading}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
            title="Refresh current folder"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800 flex-1 min-w-0 text-xs font-mono text-zinc-300 truncate">
            <HardDrive className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{currentPath || 'Loading path...'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            {cbzFiles.length} CBZ file(s)
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-zinc-950 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-2 bg-zinc-950 rounded-xl border border-zinc-900">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          <span className="text-xs">Scanning for .cbz and .zip archives...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Subdirectories */}
          {folders.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Folder className="w-3.5 h-3.5" />
                Directories ({folders.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {folders.map((f: any) => (
                  <div
                    key={f.path}
                    onClick={() => openFolder(f.path)}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800 transition cursor-pointer group select-none shadow-sm"
                  >
                    <Folder className="w-5 h-5 text-zinc-400 group-hover:text-white shrink-0 transition" />
                    <span className="font-medium text-xs text-zinc-200 truncate group-hover:text-white">
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CBZ Archives Grid */}
          {cbzFiles.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <FileArchive className="w-3.5 h-3.5 text-zinc-300" />
                  Manga Comic Archives ({cbzFiles.length})
                </h3>
                <span className="text-xs text-zinc-500">
                  Click any .cbz / .zip file to read
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {cbzFiles.map((cbzItem: any) => (
                  <div
                    key={cbzItem.path}
                    onClick={() => openCbzReader(cbzItem.path, 0)}
                    className="flex items-center justify-between gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-900 hover:bg-zinc-900/90 hover:border-zinc-700 transition cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 shrink-0">
                        <FileArchive className="w-5 h-5 text-zinc-400 group-hover:text-white transition" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-xs text-zinc-100 truncate group-hover:text-white">
                          {cbzItem.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {formatBytes(cbzItem.sizeBytes)}
                        </p>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-lg bg-zinc-900 group-hover:bg-zinc-100 group-hover:text-black text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                      Read
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            folders.length === 0 && (
              <div className="p-16 text-center text-zinc-600 bg-zinc-950 rounded-xl border border-zinc-900 text-xs flex flex-col items-center gap-2">
                <FileArchive className="w-8 h-8 text-zinc-800" />
                <p>No .cbz or .zip comic files found in this folder.</p>
                <p className="text-[11px] text-zinc-700">
                  Place your .cbz files in your manga download directory to read them here.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* Loading Overlay when extracting CBZ */}
      {loadingCbz && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-200" />
          <p className="text-xs text-zinc-400 font-mono">
            Unpacking CBZ archive pages...
          </p>
        </div>
      )}

      {/* 3-Page Desktop CBZ Reader Modal */}
      {readerOpen && activeCbz && activeCbz.pages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col select-none overflow-hidden h-screen w-screen">
          {/* Reader Topbar */}
          {!fullscreenMode && (
            <div className="h-11 border-b border-zinc-900 bg-black px-6 flex items-center justify-between text-xs text-zinc-400 shrink-0 z-20">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-zinc-200">
                  Page {currentPageIndex + 1} of {activeCbz.pages.length}
                </span>
                <span className="font-mono text-[11px] text-zinc-400 truncate max-w-sm">
                  {activeCbz.name}
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] border border-zinc-800 font-mono">
                  Keys: ← / → or A / D | F: Fullscreen
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Prev Archive Button */}
                {activeCbz.prevCbz && (
                  <button
                    onClick={goToPrevCbz}
                    className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded border border-zinc-800 text-xs transition cursor-pointer"
                    title={`Go to ${activeCbz.prevCbz.name}`}
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Prev CBZ</span>
                  </button>
                )}

                {/* Page Select Dropdown */}
                <select
                  value={currentPageIndex}
                  onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                  className="bg-zinc-900 text-zinc-200 text-xs px-2.5 py-1 rounded border border-zinc-800 focus:outline-none cursor-pointer"
                >
                  {activeCbz.pages.map((_: any, i: number) => (
                    <option key={i} value={i}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>

                {/* Next Archive Button */}
                {activeCbz.nextCbz && (
                  <button
                    onClick={goToNextCbz}
                    className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded border border-zinc-800 text-xs transition cursor-pointer"
                    title={`Go to ${activeCbz.nextCbz.name}`}
                  >
                    <span className="hidden lg:inline">Next CBZ</span>
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Fullscreen Toggle Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1"
                  title="Toggle Fullscreen (F)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Close Button */}
                <button
                  onClick={closeReader}
                  className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                  title="Close reader (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Floating Controls in Fullscreen Mode */}
          {fullscreenMode && (
            <div className="absolute top-3 right-4 z-30 flex items-center gap-2 bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-zinc-800/80 shadow-2xl opacity-30 hover:opacity-100 transition-opacity">
              <span className="text-[11px] font-mono text-zinc-400">
                {currentPageIndex + 1}/{activeCbz.pages.length}
              </span>
              <button
                onClick={toggleFullscreen}
                className="p-1 text-zinc-300 hover:text-white rounded transition cursor-pointer"
                title="Exit Fullscreen (F or Esc)"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={closeReader}
                className="p-1 text-zinc-300 hover:text-white rounded transition cursor-pointer"
                title="Close Reader (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 3-Page Display Area */}
          <div
            className={`flex-1 relative flex items-center justify-center p-0 overflow-hidden bg-black gap-2 md:gap-6 w-full ${
              fullscreenMode ? 'h-screen' : 'h-[calc(100vh-76px)]'
            }`}
          >
            {/* Left Nav Arrow */}
            <button
              onClick={() => {
                if (currentPageIndex > 0) prevPage();
                else if (activeCbz.prevCbz) goToPrevCbz();
              }}
              disabled={currentPageIndex === 0 && !activeCbz.prevCbz}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/80 hover:bg-zinc-900 text-zinc-200 disabled:opacity-10 transition cursor-pointer z-20 border border-zinc-800/80 shadow-2xl opacity-40 hover:opacity-100"
              title={
                currentPageIndex === 0 && activeCbz.prevCbz
                  ? `Go to previous CBZ (${activeCbz.prevCbz.name})`
                  : 'Previous page'
              }
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* PREVIOUS PAGE (Scaled Down Side Panel) */}
            <div
              className={`hidden md:flex flex-col items-center justify-center w-1/5 opacity-35 hover:opacity-75 transition-opacity cursor-pointer transform scale-95 select-none ${
                fullscreenMode ? 'h-[92vh]' : 'h-[86vh]'
              }`}
              onClick={prevPage}
            >
              {prevImage ? (
                <img
                  src={prevImage.url}
                  alt="Previous page"
                  className="max-h-full max-w-full object-contain rounded shadow-lg filter brightness-75"
                />
              ) : activeCbz.prevCbz ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevCbz();
                  }}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-950 text-center gap-2 hover:border-zinc-600 transition shadow-lg"
                >
                  <SkipBack className="w-8 h-8 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-300">
                    Previous CBZ
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[140px]">
                    {activeCbz.prevCbz.name}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-zinc-700 font-medium">
                  Start of Archive
                </div>
              )}
            </div>

            {/* CENTRAL MAIN PAGE (Full Screen Height) */}
            <div
              className={`flex-1 flex flex-col items-center justify-center max-w-[62vw] z-10 select-none ${
                fullscreenMode ? 'h-screen py-1' : 'h-[calc(100vh-84px)] py-1'
              }`}
            >
              {currentImage && (
                <img
                  src={currentImage.url}
                  alt={`Page ${currentPageIndex + 1}`}
                  className="h-full w-auto max-w-full object-contain shadow-2xl rounded"
                />
              )}
            </div>

            {/* NEXT PAGE (Scaled Down Side Panel) */}
            <div
              className={`hidden md:flex flex-col items-center justify-center w-1/5 opacity-35 hover:opacity-75 transition-opacity cursor-pointer transform scale-95 select-none ${
                fullscreenMode ? 'h-[92vh]' : 'h-[86vh]'
              }`}
              onClick={nextPage}
            >
              {nextImage ? (
                <img
                  src={nextImage.url}
                  alt="Next page"
                  className="max-h-full max-w-full object-contain rounded shadow-lg filter brightness-75"
                />
              ) : activeCbz.nextCbz ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextCbz();
                  }}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-950 text-center gap-2 hover:border-zinc-600 transition shadow-lg"
                >
                  <SkipForward className="w-8 h-8 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-300">
                    Next CBZ
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[140px]">
                    {activeCbz.nextCbz.name}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-zinc-700 font-medium">
                  End of Archive
                </div>
              )}
            </div>

            {/* Right Nav Arrow */}
            <button
              onClick={() => {
                if (currentPageIndex < activeCbz.pages.length - 1) nextPage();
                else if (activeCbz.nextCbz) goToNextCbz();
              }}
              disabled={
                currentPageIndex === activeCbz.pages.length - 1 &&
                !activeCbz.nextCbz
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/80 hover:bg-zinc-900 text-zinc-200 disabled:opacity-10 transition cursor-pointer z-20 border border-zinc-800/80 shadow-2xl opacity-40 hover:opacity-100"
              title={
                currentPageIndex === activeCbz.pages.length - 1 &&
                activeCbz.nextCbz
                  ? `Go to next CBZ (${activeCbz.nextCbz.name})`
                  : 'Next page'
              }
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Footer Controls */}
          {!fullscreenMode && (
            <div className="h-8 border-t border-zinc-900 bg-black px-6 flex items-center justify-between text-[11px] text-zinc-500 shrink-0 z-20">
              <div>
                {activeCbz.prevCbz && (
                  <button
                    onClick={goToPrevCbz}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    <SkipBack className="w-3 h-3" />
                    Previous: {activeCbz.prevCbz.name}
                  </button>
                )}
              </div>
              <div className="text-[10px] text-zinc-600 font-mono">
                Press <span className="text-zinc-400">F</span> for Fullscreen
              </div>
              <div>
                {activeCbz.nextCbz && (
                  <button
                    onClick={goToNextCbz}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    Next: {activeCbz.nextCbz.name}
                    <SkipForward className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

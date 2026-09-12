import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  Image as ImageIcon,
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
  Minimize2
} from 'lucide-react';

export default function Web({ read }: { read: any }) {
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

  // Fullscreen toggle state (hides header/footer controls for pure immersive viewing)
  const [fullscreenMode, setFullscreenMode] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setFullscreenMode((prev) => !prev);
  }, []);

  // Keyboard navigation handler for reader
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!readerOpen) return;

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (currentPageIndex < images.length - 1) {
          nextPage();
        } else if (nextSiblingFolder) {
          goToNextChapter();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (currentPageIndex > 0) {
          prevPage();
        } else if (prevSiblingFolder) {
          goToPrevChapter();
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
    [readerOpen, currentPageIndex, images.length, nextPage, prevPage, nextSiblingFolder, prevSiblingFolder, goToNextChapter, goToPrevChapter, closeReader, fullscreenMode, toggleFullscreen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const prevImage = currentPageIndex > 0 ? images[currentPageIndex - 1] : null;
  const currentImage = images[currentPageIndex] || null;
  const nextImage = currentPageIndex < images.length - 1 ? images[currentPageIndex + 1] : null;

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

        {images.length > 0 && (
          <button
            onClick={() => openReader(0)}
            className="bg-zinc-100 hover:bg-white text-black font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Open 3-Page Reader ({images.length} pages)
          </button>
        )}
      </div>

      {error && (
        <div className="bg-zinc-950 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-2 bg-zinc-950 rounded-xl border border-zinc-900">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          <span className="text-xs">Exploring files on SSD...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Folders (Manga Titles or Chapters) */}
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

          {/* Chapter Image Files */}
          {images.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Manga Pages ({images.length})
                </h3>
                <span className="text-xs text-zinc-500">Click any page to open 3-Page Reader</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {images.map((img: any, idx: number) => (
                  <div
                    key={img.path}
                    onClick={() => openReader(idx)}
                    className="group relative aspect-[2/3] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-900 hover:border-zinc-600 transition cursor-pointer shadow-sm flex flex-col"
                  >
                    <img
                      src={`${API_BASE}/image?path=${encodeURIComponent(img.path)}`}
                      alt={img.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/80 px-2 py-1 text-[10px] text-zinc-300 font-mono truncate text-center opacity-0 group-hover:opacity-100 transition">
                      p. {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            folders.length === 0 && (
              <div className="p-16 text-center text-zinc-600 bg-zinc-950 rounded-xl border border-zinc-900 text-xs">
                This folder is empty. Navigate into a downloaded manga chapter to read its pages.
              </div>
            )
          )}
        </div>
      )}

      {/* Full-Height 3-Page Reader Modal with Fullscreen toggle */}
      {readerOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col select-none overflow-hidden h-screen w-screen">
          {/* Reader Topbar (Hidden in Fullscreen mode) */}
          {!fullscreenMode && (
            <div className="h-11 border-b border-zinc-900 bg-black px-6 flex items-center justify-between text-xs text-zinc-400 shrink-0 z-20">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-zinc-200">
                  Page {currentPageIndex + 1} of {images.length}
                </span>
                <span className="font-mono text-[11px] text-zinc-500 truncate max-w-sm">
                  {images[currentPageIndex]?.name}
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px] border border-zinc-800 font-mono">
                  Keys: ← / → or A / D | F: Fullscreen
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Prev Chapter Button */}
                {prevSiblingFolder && (
                  <button
                    onClick={goToPrevChapter}
                    className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded border border-zinc-800 text-xs transition cursor-pointer"
                    title={`Go to ${prevSiblingFolder.name}`}
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Prev Chapter</span>
                  </button>
                )}

                {/* Page Select Dropdown */}
                <select
                  value={currentPageIndex}
                  onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                  className="bg-zinc-900 text-zinc-200 text-xs px-2.5 py-1 rounded border border-zinc-800 focus:outline-none cursor-pointer"
                >
                  {images.map((_: any, i: number) => (
                    <option key={i} value={i}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>

                {/* Next Chapter Button */}
                {nextSiblingFolder && (
                  <button
                    onClick={goToNextChapter}
                    className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded border border-zinc-800 text-xs transition cursor-pointer"
                    title={`Go to ${nextSiblingFolder.name}`}
                  >
                    <span className="hidden lg:inline">Next Chapter</span>
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

          {/* Floating Controls Overlay when in Fullscreen Mode */}
          {fullscreenMode && (
            <div className="absolute top-3 right-4 z-30 flex items-center gap-2 bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-zinc-800/80 shadow-2xl opacity-30 hover:opacity-100 transition-opacity">
              <span className="text-[11px] font-mono text-zinc-400">
                {currentPageIndex + 1}/{images.length}
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

          {/* 3-Page Display Area - Occupies Full Height of Screen */}
          <div
            className={`flex-1 relative flex items-center justify-center p-0 overflow-hidden bg-black gap-2 md:gap-6 w-full ${
              fullscreenMode ? 'h-screen' : 'h-[calc(100vh-76px)]'
            }`}
          >
            {/* Left Nav Arrow Button */}
            <button
              onClick={() => {
                if (currentPageIndex > 0) prevPage();
                else if (prevSiblingFolder) goToPrevChapter();
              }}
              disabled={currentPageIndex === 0 && !prevSiblingFolder}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/80 hover:bg-zinc-900 text-zinc-200 disabled:opacity-10 transition cursor-pointer z-20 border border-zinc-800/80 shadow-2xl opacity-40 hover:opacity-100"
              title={currentPageIndex === 0 && prevSiblingFolder ? `Go to previous chapter (${prevSiblingFolder.name})` : 'Previous page'}
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
                  src={`${API_BASE}/image?path=${encodeURIComponent(prevImage.path)}`}
                  alt="Previous page"
                  className="max-h-full max-w-full object-contain rounded shadow-lg filter brightness-75"
                />
              ) : prevSiblingFolder ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevChapter();
                  }}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-950 text-center gap-2 hover:border-zinc-600 transition shadow-lg"
                >
                  <SkipBack className="w-8 h-8 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-300">Previous Chapter</span>
                  <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[140px]">
                    {prevSiblingFolder.name}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-zinc-700 font-medium">Start of Chapter</div>
              )}
            </div>

            {/* CENTRAL MAIN PAGE (Large, Occupies Full Available Screen Height) */}
            <div
              className={`flex-1 flex flex-col items-center justify-center max-w-[62vw] z-10 select-none ${
                fullscreenMode ? 'h-screen py-1' : 'h-[calc(100vh-84px)] py-1'
              }`}
            >
              {currentImage && (
                <img
                  src={`${API_BASE}/image?path=${encodeURIComponent(currentImage.path)}`}
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
                  src={`${API_BASE}/image?path=${encodeURIComponent(nextImage.path)}`}
                  alt="Next page"
                  className="max-h-full max-w-full object-contain rounded shadow-lg filter brightness-75"
                />
              ) : nextSiblingFolder ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextChapter();
                  }}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-950 text-center gap-2 hover:border-zinc-600 transition shadow-lg"
                >
                  <SkipForward className="w-8 h-8 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-300">Next Chapter</span>
                  <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[140px]">
                    {nextSiblingFolder.name}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-zinc-700 font-medium">End of Chapter</div>
              )}
            </div>

            {/* Right Nav Arrow Button */}
            <button
              onClick={() => {
                if (currentPageIndex < images.length - 1) nextPage();
                else if (nextSiblingFolder) goToNextChapter();
              }}
              disabled={currentPageIndex === images.length - 1 && !nextSiblingFolder}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/80 hover:bg-zinc-900 text-zinc-200 disabled:opacity-10 transition cursor-pointer z-20 border border-zinc-800/80 shadow-2xl opacity-40 hover:opacity-100"
              title={currentPageIndex === images.length - 1 && nextSiblingFolder ? `Go to next chapter (${nextSiblingFolder.name})` : 'Next page'}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Footer Controls: Chapter Jumper Buttons (Hidden in Fullscreen mode) */}
          {!fullscreenMode && (
            <div className="h-8 border-t border-zinc-900 bg-black px-6 flex items-center justify-between text-[11px] text-zinc-500 shrink-0 z-20">
              <div>
                {prevSiblingFolder && (
                  <button
                    onClick={goToPrevChapter}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    <SkipBack className="w-3 h-3" />
                    Previous: {prevSiblingFolder.name}
                  </button>
                )}
              </div>
              <div className="text-[10px] text-zinc-600 font-mono">
                Press <span className="text-zinc-400">F</span> for Fullscreen
              </div>
              <div>
                {nextSiblingFolder && (
                  <button
                    onClick={goToNextChapter}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    Next: {nextSiblingFolder.name}
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

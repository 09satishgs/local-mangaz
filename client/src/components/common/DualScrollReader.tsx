import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SkipBack, SkipForward } from 'lucide-react';

export interface MangaPageItem {
  id?: string;
  path?: string;
  name?: string;
  url: string;
}

interface DualScrollReaderProps {
  pages: MangaPageItem[];
  fullscreenMode: boolean;
  currentPageIndex: number;
  onPageChange?: (index: number) => void;
  prevChapter?: { name: string } | null;
  nextChapter?: { name: string } | null;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export default function DualScrollReader({
  pages,
  fullscreenMode,
  currentPageIndex,
  onPageChange,
  prevChapter,
  nextChapter,
  onPrevChapter,
  onNextChapter
}: DualScrollReaderProps) {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightWindowRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.5);
  const [leftScrollCutoff, setLeftScrollCutoff] = useState<number>(0);
  const [leftWidthPx, setLeftWidthPx] = useState<number>(0);

  // Synchronize scale and cutoff position in real time
  const updateSync = useCallback(() => {
    const leftEl = leftScrollRef.current;
    const rightEl = rightWindowRef.current;
    if (!leftEl || !rightEl) return;

    const leftWidth = leftEl.clientWidth;
    const rightWidth = rightEl.clientWidth;

    if (leftWidth > 0) {
      setLeftWidthPx(leftWidth);
      setScale(rightWidth / leftWidth);
    }

    // Cutoff point at the bottom of the left viewport
    const vHeight = leftEl.clientHeight;
    const scrollTop = leftEl.scrollTop;
    setLeftScrollCutoff(scrollTop + vHeight);
  }, []);

  useEffect(() => {
    updateSync();
    window.addEventListener('resize', updateSync);
    return () => window.removeEventListener('resize', updateSync);
  }, [updateSync]);

  // Track which page is currently in view on the left side
  useEffect(() => {
    const el = leftScrollRef.current;
    if (!el || !onPageChange) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idxStr = entry.target.getAttribute('data-index');
            if (idxStr !== null) {
              const idx = parseInt(idxStr, 10);
              if (!isNaN(idx) && idx !== currentPageIndex) {
                onPageChange(idx);
              }
            }
          }
        });
      },
      {
        root: el,
        threshold: 0.2
      }
    );

    const pageElements = el.querySelectorAll('[data-index]');
    pageElements.forEach((p) => observer.observe(p));

    return () => observer.disconnect();
  }, [pages.length, onPageChange, currentPageIndex]);

  return (
    <div
      className={`w-full flex select-none overflow-hidden bg-black ${
        fullscreenMode ? 'h-screen' : 'h-[calc(100vh-76px)]'
      }`}
    >
      {/* LEFT COLUMN: 66% Width (Flush edge-to-edge, zero padding) */}
      <div className="w-[66%] h-full relative border-r border-zinc-800 bg-black flex flex-col">
        {/* Scrollable Container */}
        <div
          ref={leftScrollRef}
          onScroll={updateSync}
          className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center bg-black scroll-smooth"
        >
          {/* Inner Content Wrapper */}
          <div ref={leftContentRef} className="w-full flex flex-col items-center">
            {/* Previous Chapter Button at Top */}
            {prevChapter && onPrevChapter && (
              <button
                onClick={onPrevChapter}
                className="w-full py-3 my-2 bg-zinc-950 border-b border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
              >
                <SkipBack className="w-4 h-4" />
                Previous Chapter: {prevChapter.name}
              </button>
            )}

            {/* Sequential Manga Pages - Fully flush 100% width */}
            {pages.map((p, idx) => (
              <div
                key={p.path || p.url || idx}
                data-index={idx}
                className="w-full flex flex-col items-center bg-black shrink-0 relative"
              >
                <img
                  src={p.url}
                  alt={p.name || `Page ${idx + 1}`}
                  onLoad={updateSync}
                  className="w-full h-auto block select-none"
                  loading={idx < 4 ? 'eager' : 'lazy'}
                />
              </div>
            ))}

            {/* Next Chapter Button at Bottom */}
            {nextChapter && onNextChapter && (
              <button
                onClick={onNextChapter}
                className="w-full py-4 my-6 bg-zinc-100 hover:bg-white text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-2xl transition cursor-pointer shrink-0"
              >
                Next Chapter: {nextChapter.name}
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: 33% Width (Continuing Stream starting exactly from Left's bottom cutoff) */}
      <div
        ref={rightWindowRef}
        className="w-[33%] h-full relative overflow-hidden bg-black flex flex-col select-none"
      >
        {/* Top continuation indicator tag */}
        <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-black/80 backdrop-blur border border-zinc-800 text-[10px] font-mono text-zinc-400 pointer-events-none">
          Continuation
        </div>

        {/* Scaled & Translated Container */}
        <div className="w-full h-full relative overflow-hidden">
          <div
            className="absolute top-0 left-0 flex flex-col items-center will-change-transform pointer-events-none"
            style={{
              width: leftWidthPx > 0 ? `${leftWidthPx}px` : '200%',
              transformOrigin: 'top left',
              transform: `scale(${scale}) translateY(-${leftScrollCutoff}px)`
            }}
          >
            {pages.map((p, idx) => (
              <div
                key={`mirror-${p.path || p.url || idx}`}
                className="w-full flex flex-col items-center bg-black shrink-0"
              >
                <img
                  src={p.url}
                  alt=""
                  className="w-full h-auto block filter brightness-95"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

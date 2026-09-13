import React, { useRef, useState, useEffect } from 'react';

interface DualColumnPageProps {
  src: string;
  alt?: string;
  pageNumber: number;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function DualColumnPage({
  src,
  alt,
  pageNumber,
  scrollContainerRef
}: DualColumnPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTarget =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const vHeight = window.innerHeight;
      const topInView = vHeight - rect.top;
      const totalDistance = vHeight + rect.height;
      const rawProg = totalDistance > 0 ? topInView / totalDistance : 0;
      const clamped = Math.max(0, Math.min(1, rawProg));
      setProgress(clamped);
    };

    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => scrollTarget.removeEventListener('scroll', onScroll);
  }, [scrollContainerRef]);

  return (
    <div
      ref={containerRef}
      data-page-index={pageNumber - 1}
      className="w-full max-w-7xl mx-auto h-[88vh] min-h-[500px] my-4 flex gap-4 select-none bg-black/60 p-2.5 rounded-2xl border border-zinc-900 shadow-2xl relative shrink-0"
    >
      {/* Page Badge */}
      <div className="absolute top-4 left-5 z-20 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-zinc-800 text-[11px] font-mono text-zinc-300 font-semibold shadow-lg">
        Page {pageNumber}
      </div>

      {/* LEFT COLUMN: Main / Upper Section (66% Width) */}
      <div className="w-[66%] h-full relative overflow-hidden rounded-xl bg-zinc-950/90 border border-zinc-900 shadow-inner flex justify-center">
        <div className="absolute top-3 right-3 z-10 text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900/80 backdrop-blur px-2 py-0.5 rounded border border-zinc-800">
          Upper Section (66%)
        </div>
        <img
          src={src}
          alt={alt || `Page ${pageNumber} (Upper)`}
          className="w-full h-auto object-cover absolute top-0 left-0 will-change-transform shadow-2xl"
          style={{
            transform: `translateY(-${progress * 40}%)`
          }}
          loading="lazy"
        />
      </div>

      {/* RIGHT COLUMN: Continuation / Lower Section (33% Width) */}
      <div className="w-[33%] h-full relative overflow-hidden rounded-xl bg-zinc-950/90 border border-zinc-900 shadow-inner flex justify-center">
        <div className="absolute top-3 right-3 z-10 text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900/80 backdrop-blur px-2 py-0.5 rounded border border-zinc-800">
          Continuation (33%)
        </div>
        <img
          src={src}
          alt={alt || `Page ${pageNumber} (Lower)`}
          className="w-full h-auto object-cover absolute top-0 left-0 will-change-transform shadow-2xl filter brightness-95"
          style={{
            transform: `translateY(calc(-48% - ${progress * 40}%))`
          }}
          loading="lazy"
        />
      </div>
    </div>
  );
}

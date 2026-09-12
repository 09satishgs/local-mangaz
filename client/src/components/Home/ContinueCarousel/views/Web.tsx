import React, { useRef } from 'react';
import {
  BookOpen,
  FileArchive,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Clock
} from 'lucide-react';
import { ProgressItem } from '../hooks';

interface WebProps {
  progressList: ProgressItem[];
  deleteSlide: (id: string, e?: React.MouseEvent) => void;
  resumeSlide: (item: ProgressItem) => void;
}

export default function Web({ progressList, deleteSlide, resumeSlide }: WebProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!progressList || progressList.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="flex flex-col gap-3 w-full">
      {/* Carousel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Continue Reading
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
            {progressList.length}
          </span>
        </div>

        {/* Carousel Arrow Controls */}
        {progressList.length > 2 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto scroll-smooth pb-2 pt-0.5 no-scrollbar select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {progressList.map((item) => {
          const percent = Math.min(
            100,
            Math.max(0, Math.round(((item.currentPage + 1) / item.totalPages) * 100))
          );

          return (
            <div
              key={item.id}
              onClick={() => resumeSlide(item)}
              className="w-80 shrink-0 p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/70 transition cursor-pointer relative group flex gap-3 shadow-sm"
            >
              {/* Delete / Dismiss Button */}
              <button
                type="button"
                onClick={(e) => deleteSlide(item.id, e)}
                title="Remove from Continue Reading"
                className="absolute top-2.5 right-2.5 p-1 rounded-md text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition z-10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Cover / Thumbnail */}
              <div className="w-16 h-24 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  item.readerType === 'cbz' ? (
                    <FileArchive className="w-6 h-6 text-zinc-600" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-zinc-600" />
                  )
                )}
                <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/80 text-[8px] font-mono text-zinc-300 uppercase">
                  {item.readerType === 'cbz' ? 'CBZ' : 'READ'}
                </div>
              </div>

              {/* Information & Progress Bar */}
              <div className="flex-1 min-w-0 flex flex-col justify-between pr-4">
                <div>
                  <h3 className="font-semibold text-xs text-zinc-100 truncate group-hover:text-white">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {item.chapter}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    Page {item.currentPage + 1} of {item.totalPages} ({percent}%)
                  </p>
                </div>

                {/* Progress bar and Resume button */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                    <div
                      className="h-full bg-zinc-200 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 group-hover:text-white">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

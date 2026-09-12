import React from 'react';
import {
  BookOpen,
  FileArchive,
  X,
  Play,
  Clock
} from 'lucide-react';
import { ProgressItem } from '../hooks';

interface MobileProps {
  progressList: ProgressItem[];
  deleteSlide: (id: string, e?: React.MouseEvent) => void;
  resumeSlide: (item: ProgressItem) => void;
}

export default function Mobile({ progressList, deleteSlide, resumeSlide }: MobileProps) {
  if (!progressList || progressList.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2.5 w-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <h2 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
            Continue Reading
          </h2>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
            {progressList.length}
          </span>
        </div>
      </div>

      {/* Swipeable snap container */}
      <div
        className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 pt-0.5 select-none"
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
              className="w-[260px] shrink-0 snap-start p-3 rounded-xl bg-zinc-950 border border-zinc-900 active:border-zinc-700 active:bg-zinc-900/60 transition cursor-pointer relative flex gap-2.5 shadow-sm"
            >
              {/* Delete Button */}
              <button
                type="button"
                onClick={(e) => deleteSlide(item.id, e)}
                title="Remove"
                className="absolute top-2 right-2 p-1 rounded text-zinc-500 active:text-red-400 z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Cover Thumbnail */}
              <div className="w-14 h-20 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : item.readerType === 'cbz' ? (
                  <FileArchive className="w-5 h-5 text-zinc-600" />
                ) : (
                  <BookOpen className="w-5 h-5 text-zinc-600" />
                )}
                <div className="absolute top-0.5 left-0.5 px-1 rounded bg-black/80 text-[7px] font-mono text-zinc-300 uppercase">
                  {item.readerType === 'cbz' ? 'CBZ' : 'READ'}
                </div>
              </div>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0 flex flex-col justify-between pr-4">
                <div>
                  <h3 className="font-medium text-xs text-zinc-100 truncate">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {item.chapter}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                    p. {item.currentPage + 1}/{item.totalPages} ({percent}%)
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 mt-1.5">
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                    <div
                      className="h-full bg-zinc-200 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-300">
                    <Play className="w-2.5 h-2.5 fill-current" />
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

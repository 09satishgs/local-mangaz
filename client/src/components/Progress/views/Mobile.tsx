import React from 'react';
import { FolderDown, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function Mobile({ progress }: { progress: any }) {
  const { activeJobs, completedJobs, otherJobs, cancelJob } = progress;

  return (
    <div className="flex flex-col gap-4 w-full pb-20">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
          <FolderDown className="w-4 h-4 text-zinc-400" />
          Active Downloads
        </h2>
        <span className="text-[11px] text-zinc-500 font-mono">4 req/s</span>
      </div>

      {activeJobs.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-center text-zinc-600 text-xs">
          No downloads running right now.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeJobs.map((job: any) => (
            <div key={job.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-zinc-200 truncate">{job.mangaTitle}</h4>
                  <p className="text-[10px] text-zinc-500 truncate">{job.progress?.currentMessage}</p>
                </div>
                <button
                  onClick={() => cancelJob(job.id)}
                  className="text-[10px] text-red-400 border border-red-950 px-2 py-1 rounded bg-red-950/20"
                >
                  Cancel
                </button>
              </div>

              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-zinc-100 h-1.5 rounded-full"
                  style={{ width: `${job.progress?.percent || 0}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {job.status}
                </span>
                <span>{job.progress?.percent || 0}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedJobs.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completed</h3>
          {completedJobs.map((job: any) => (
            <div key={job.id} className="bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate text-zinc-300 text-[11px]">{job.mangaTitle}</span>
              </div>
              <span className="text-[10px] text-zinc-500 shrink-0">
                {job.progress?.completedChapters || 0} chs
              </span>
            </div>
          ))}
        </div>
      )}

      {otherJobs.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cancelled / Other</h3>
          {otherJobs.map((job: any) => (
            <div key={job.id} className="bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 flex items-center justify-between text-xs opacity-60">
              <div className="flex items-center gap-2 truncate">
                <XCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <span className="truncate text-zinc-400 text-[11px]">{job.mangaTitle}</span>
              </div>
              <span className="text-[9px] uppercase text-zinc-500">{job.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

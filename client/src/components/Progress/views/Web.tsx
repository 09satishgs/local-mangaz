import React from 'react';
import { FolderDown, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function Web({ progress }: { progress: any }) {
  const { activeJobs, completedJobs, otherJobs, cancelJob } = progress;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <FolderDown className="w-5 h-5 text-zinc-300" />
            Downloads & Tasks
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Active download jobs throttled strictly to 4 requests/sec.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Clock className="w-4 h-4 text-zinc-500" />
          <span>Queue System Active</span>
        </div>
      </div>

      {/* Active Downloads Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Active Downloads ({activeJobs.length})
        </h3>

        {activeJobs.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 text-center text-zinc-600 text-xs">
            No active downloads at the moment. Search and pick chapters in the Home tab to start downloading.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeJobs.map((job: any) => (
              <div
                key={job.id}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {job.status}
                      </span>
                      <h4 className="font-semibold text-sm text-zinc-100">{job.mangaTitle}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                      {job.downloadDir}\{job.mangaTitle}
                    </p>
                  </div>

                  <button
                    onClick={() => cancelJob(job.id)}
                    className="text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden my-3">
                  <div
                    className="bg-zinc-100 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress?.percent || 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    {job.progress?.currentMessage || 'Processing...'}
                  </span>
                  <span className="font-mono font-medium text-zinc-300 text-xs">
                    Chapters: {job.progress?.completedChapters || 0} / {job.progress?.totalChapters || 0} ({job.progress?.percent || 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Downloads */}
      {completedJobs.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Completed ({completedJobs.length})
          </h3>
          <div className="flex flex-col gap-2">
            {completedJobs.map((job: any) => (
              <div
                key={job.id}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <h5 className="font-medium text-zinc-200">{job.mangaTitle}</h5>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {job.downloadDir}\{job.mangaTitle}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-400">
                  {job.progress?.completedChapters || 0} chapters saved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelled/Errored Downloads */}
      {otherJobs.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Past or Cancelled ({otherJobs.length})
          </h3>
          <div className="flex flex-col gap-2">
            {otherJobs.map((job: any) => (
              <div
                key={job.id}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex items-center justify-between text-xs opacity-70"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                  <div>
                    <h5 className="font-medium text-zinc-300">{job.mangaTitle}</h5>
                    <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{job.progress?.currentMessage || job.status}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-850">
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

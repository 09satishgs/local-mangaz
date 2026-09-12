import { useDownload } from '../../context/DownloadContext';

export function useProgress() {
  const { jobs, cancelJob, downloadDir } = useDownload();

  const activeJobs = jobs.filter(
    (j: any) => j.status === 'downloading' || j.status === 'fetching_chapters' || j.status === 'pending'
  );

  const completedJobs = jobs.filter((j: any) => j.status === 'completed');
  const otherJobs = jobs.filter((j: any) => j.status === 'cancelled' || j.status === 'error');

  return {
    jobs,
    activeJobs,
    completedJobs,
    otherJobs,
    cancelJob,
    downloadDir
  };
}

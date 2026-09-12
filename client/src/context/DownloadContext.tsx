import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

export const DownloadContext = createContext<any>(null);

export const DownloadProvider = ({ children }: { children: React.ReactNode }) => {
  const [downloadDir, setDownloadDir] = useState('');
  const [defaultDir, setDefaultDir] = useState('');
  const [readDir, setReadDir] = useState('');
  const [cbzDir, setCbzDir] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data.defaultDownloadDir) {
          setDefaultDir(data.defaultDownloadDir);
          setDownloadDir((prev) => prev || data.defaultDownloadDir);
        }
        if (data.readDir) {
          setReadDir(data.readDir);
        }
        if (data.cbzDir) {
          setCbzDir(data.cbzDir);
        }
      })
      .catch((err) => console.error('Config fetch failed:', err));
  }, []);

  // Poll all jobs regularly
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE}/jobs`);
        const data = await res.json();
        if (data.jobs) {
          setJobs(data.jobs);
          const active = data.jobs.find(
            (j: any) =>
              j.status === 'downloading' ||
              j.status === 'fetching_chapters' ||
              j.status === 'pending'
          );
          setActiveJobId(active ? active.id : null);
        }
      } catch {
        // silent polling error
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 1000);
    return () => clearInterval(interval);
  }, []);

  const startDownload = async ({
    mangaId,
    mangaTitle,
    language = 'en',
    selectedChapters
  }: {
    mangaId: string;
    mangaTitle: string;
    language?: string;
    selectedChapters?: string[];
  }) => {
    const targetDir = downloadDir.trim() || defaultDir;
    const res = await fetch(`${API_BASE}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mangaId,
        mangaTitle,
        downloadDir: targetDir,
        language,
        selectedChapters
      })
    });
    const data = await res.json();
    if (res.ok && data.job) {
      setActiveJobId(data.job.id);
      return { success: true, job: data.job };
    } else {
      throw new Error(data.error || 'Failed to start download');
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await fetch(`${API_BASE}/jobs/${jobId}/cancel`, { method: 'POST' });
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const value = {
    downloadDir,
    setDownloadDir,
    defaultDir,
    readDir,
    cbzDir,
    jobs,
    activeJobId,
    startDownload,
    cancelJob,
    API_BASE
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
};

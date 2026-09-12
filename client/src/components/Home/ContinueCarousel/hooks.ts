import { useState, useEffect, useCallback } from 'react';
import { useDownload } from '../../../context/DownloadContext';
import { useResume } from '../../../context/ResumeContext';

export interface ProgressItem {
  id: string;
  title: string;
  chapter: string;
  path: string;
  readerType: 'read' | 'cbz';
  currentPage: number;
  totalPages: number;
  thumbnailUrl: string | null;
  updatedAt: number;
}

export function useContinueProgress(onNavigate?: (route: any) => void) {
  const { API_BASE } = useDownload();
  const { triggerResume } = useResume();

  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/progress/continue`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.progress)) {
        // Map thumbnail URL to include API_BASE if it's relative
        const formatted = data.progress.map((item: any) => {
          let thumb = item.thumbnailUrl;
          if (thumb && !thumb.startsWith('http')) {
            thumb = `${API_BASE}${thumb.replace(/^\/api/, '')}`;
          }
          return {
            ...item,
            thumbnailUrl: thumb,
          };
        });
        setProgressList(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch continue progress:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const deleteSlide = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Optimistic removal
    setProgressList((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`${API_BASE}/progress/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete progress:', err);
      // Refresh on error
      fetchProgress();
    }
  };

  const resumeSlide = (item: ProgressItem) => {
    triggerResume({
      path: item.path,
      readerType: item.readerType,
      currentPage: item.currentPage,
    });
    if (onNavigate) {
      onNavigate(item.readerType);
    } else {
      window.location.hash = `#/${item.readerType}`;
    }
  };

  return {
    progressList,
    loading,
    deleteSlide,
    resumeSlide,
    fetchProgress,
  };
}

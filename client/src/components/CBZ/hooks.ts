import { useState, useEffect, useCallback } from 'react';
import { useDownload } from '../../context/DownloadContext';

export interface CbzFile {
  name: string;
  path: string;
  sizeBytes: number;
}

export interface CbzPage {
  entryName: string;
  name: string;
  url: string;
}

export function useCbz() {
  const { downloadDir, API_BASE } = useDownload();

  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [folders, setFolders] = useState<{ name: string; path: string }[]>([]);
  const [cbzFiles, setCbzFiles] = useState<CbzFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active CBZ Reader state
  const [activeCbz, setActiveCbz] = useState<{
    path: string;
    name: string;
    totalPages: number;
    pages: CbzPage[];
    prevCbz: { name: string; path: string } | null;
    nextCbz: { name: string; path: string } | null;
  } | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loadingCbz, setLoadingCbz] = useState(false);
  const [cbzError, setCbzError] = useState('');

  const fetchDirectory = useCallback(
    async (targetPath?: string) => {
      setLoading(true);
      setError('');
      try {
        const url = targetPath
          ? `${API_BASE}/cbz/explore?path=${encodeURIComponent(targetPath)}`
          : `${API_BASE}/cbz/explore`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setCurrentPath(data.currentPath);
          setParentPath(data.parentPath);
          setFolders(data.folders || []);
          setCbzFiles(data.cbzFiles || []);
        } else {
          setError(data.error || 'Failed to explore directory for CBZ files');
        }
      } catch (err: any) {
        setError('Could not connect to explore endpoint: ' + err.message);
      } finally {
        setLoading(false);
      }
    },
    [API_BASE]
  );

  useEffect(() => {
    fetchDirectory(downloadDir);
  }, [fetchDirectory, downloadDir]);

  const openFolder = (folderPath: string) => {
    fetchDirectory(folderPath);
  };

  const goUp = () => {
    if (parentPath) {
      fetchDirectory(parentPath);
    }
  };

  const openCbzReader = async (cbzFilePath: string, initialIndex: number = 0) => {
    setLoadingCbz(true);
    setCbzError('');
    try {
      const res = await fetch(
        `${API_BASE}/cbz/pages?path=${encodeURIComponent(cbzFilePath)}`
      );
      const data = await res.json();
      if (res.ok && data.pages && data.pages.length > 0) {
        const mappedPages = (data.pages || []).map((p: any) => ({
          ...p,
          url: p.url.startsWith('http')
            ? p.url
            : `${API_BASE}${p.url.replace(/^\/api/, '')}`
        }));
        setActiveCbz({
          path: data.cbzPath,
          name: data.cbzName,
          totalPages: data.totalPages,
          pages: mappedPages,
          prevCbz: data.prevCbz,
          nextCbz: data.nextCbz,
        });
        const validIndex = Math.min(
          Math.max(0, initialIndex),
          mappedPages.length - 1
        );
        setCurrentPageIndex(validIndex);
        setReaderOpen(true);
      } else {
        alert(data.error || 'No readable image pages found inside this CBZ file');
      }
    } catch (err: any) {
      setCbzError('Failed to open CBZ archive: ' + err.message);
    } finally {
      setLoadingCbz(false);
    }
  };

  const closeReader = () => {
    setReaderOpen(false);
  };

  const nextPage = () => {
    if (activeCbz && currentPageIndex < activeCbz.pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const goToNextCbz = () => {
    if (activeCbz?.nextCbz) {
      openCbzReader(activeCbz.nextCbz.path, 0);
    }
  };

  const goToPrevCbz = () => {
    if (activeCbz?.prevCbz) {
      openCbzReader(activeCbz.prevCbz.path, 99999);
    }
  };

  return {
    currentPath,
    parentPath,
    folders,
    cbzFiles,
    loading,
    error,
    openFolder,
    goUp,
    fetchDirectory,
    // Reader features
    activeCbz,
    readerOpen,
    openCbzReader,
    closeReader,
    currentPageIndex,
    setCurrentPageIndex,
    nextPage,
    prevPage,
    goToNextCbz,
    goToPrevCbz,
    loadingCbz,
    cbzError,
    API_BASE,
  };
}

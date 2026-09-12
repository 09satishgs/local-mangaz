import { useState, useEffect, useCallback } from 'react';
import { useDownload } from '../../context/DownloadContext';
import { useResume } from '../../context/ResumeContext';

export function useRead() {
  const { downloadDir, readDir, API_BASE } = useDownload();
  const { resumeItem, clearResume } = useResume();

  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [prevSiblingFolder, setPrevSiblingFolder] = useState<any | null>(null);
  const [nextSiblingFolder, setNextSiblingFolder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reader state
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Rename folder state
  const [renamingFolder, setRenamingFolder] = useState<{ path: string; name: string } | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState('');

  const fetchDirectory = useCallback(async (targetPath?: string, openReaderAfter?: boolean, targetPage?: number) => {
    setLoading(true);
    setError('');
    try {
      const url = targetPath
        ? `${API_BASE}/explore?path=${encodeURIComponent(targetPath)}`
        : `${API_BASE}/explore`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setCurrentPath(data.currentPath);
        setParentPath(data.parentPath);
        setFolders(data.folders || []);
        setImages(data.images || []);
        setPrevSiblingFolder(data.prevSiblingFolder || null);
        setNextSiblingFolder(data.nextSiblingFolder || null);

        if (openReaderAfter && data.images && data.images.length > 0) {
          const idx = targetPage !== undefined ? Math.min(Math.max(0, targetPage), data.images.length - 1) : 0;
          setCurrentPageIndex(idx);
          setReaderOpen(true);
        } else if (!openReaderAfter) {
          setCurrentPageIndex(0);
        }
      } else {
        setError(data.error || 'Failed to explore directory');
      }
    } catch (err: any) {
      setError('Could not connect to explore endpoint: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // Initial load
  useEffect(() => {
    fetchDirectory(readDir || downloadDir || undefined);
  }, [fetchDirectory, readDir, downloadDir]);

  // Handle resume request from Continue Carousel
  useEffect(() => {
    if (resumeItem && resumeItem.readerType === 'read') {
      fetchDirectory(resumeItem.path, true, resumeItem.currentPage);
      clearResume();
    }
  }, [resumeItem, fetchDirectory, clearResume]);

  // Automatically track and save reading progress when reading
  useEffect(() => {
    if (!readerOpen || images.length === 0 || !currentPath) return;

    const timer = setTimeout(() => {
      const parts = currentPath.replace(/\\/g, '/').split('/').filter(Boolean);
      const chapter = parts.length > 0 ? parts[parts.length - 1] : 'Chapter';
      const title = parts.length > 1 ? parts[parts.length - 2] : chapter;
      const thumb = images[0]?.path
        ? `${API_BASE}/image?path=${encodeURIComponent(images[0].path)}`
        : null;

      fetch(`${API_BASE}/progress/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentPath,
          title,
          chapter,
          readerType: 'read',
          currentPage: currentPageIndex,
          totalPages: images.length,
          thumbnailUrl: thumb,
        }),
      }).catch((err) => console.error('Failed to save read progress:', err));
    }, 400);

    return () => clearTimeout(timer);
  }, [readerOpen, currentPageIndex, images, currentPath, API_BASE]);

  const openFolder = (folderPath: string) => {
    fetchDirectory(folderPath);
  };

  const goUp = () => {
    if (parentPath) {
      fetchDirectory(parentPath);
    }
  };

  const openReader = (initialIndex: number = 0) => {
    if (images.length > 0) {
      setCurrentPageIndex(initialIndex);
      setReaderOpen(true);
    }
  };

  const closeReader = () => {
    setReaderOpen(false);
  };

  const nextPage = () => {
    if (currentPageIndex < images.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const goToNextChapter = () => {
    if (nextSiblingFolder) {
      fetchDirectory(nextSiblingFolder.path, true, 0);
    }
  };

  const goToPrevChapter = () => {
    if (prevSiblingFolder) {
      fetchDirectory(prevSiblingFolder.path, true, 99999);
    }
  };

  // Folder renaming helpers
  const startRenameFolder = (folder: { path: string; name: string }) => {
    setRenamingFolder(folder);
    setRenameInput(folder.name);
    setRenameError('');
  };

  const cancelRenameFolder = () => {
    setRenamingFolder(null);
    setRenameInput('');
    setRenameError('');
  };

  const submitRenameFolder = async () => {
    if (!renamingFolder || !renameInput.trim()) return;
    if (renameInput.trim() === renamingFolder.name) {
      cancelRenameFolder();
      return;
    }

    setRenameLoading(true);
    setRenameError('');
    try {
      const res = await fetch(`${API_BASE}/folder/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderPath: renamingFolder.path,
          newName: renameInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        cancelRenameFolder();
        // Refresh directory listing
        fetchDirectory(currentPath);
      } else {
        setRenameError(data.error || 'Failed to rename folder');
      }
    } catch (err: any) {
      setRenameError('Network error renaming folder: ' + err.message);
    } finally {
      setRenameLoading(false);
    }
  };

  return {
    currentPath,
    parentPath,
    folders,
    images,
    prevSiblingFolder,
    nextSiblingFolder,
    loading,
    error,
    openFolder,
    goUp,
    fetchDirectory,
    readerOpen,
    openReader,
    closeReader,
    currentPageIndex,
    setCurrentPageIndex,
    nextPage,
    prevPage,
    goToNextChapter,
    goToPrevChapter,
    // Rename features
    renamingFolder,
    renameInput,
    setRenameInput,
    renameLoading,
    renameError,
    startRenameFolder,
    cancelRenameFolder,
    submitRenameFolder,
    API_BASE
  };
}

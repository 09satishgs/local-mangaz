import { useState, useEffect, useCallback } from 'react';
import { useDownload } from '../../context/DownloadContext';

export function useRead() {
  const { downloadDir, API_BASE } = useDownload();

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

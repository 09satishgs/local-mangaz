import { useState } from 'react';
import { useDownload } from '../../context/DownloadContext';
import { useBookmarks } from '../../context/BookmarkContext';

export function useHome() {
  const { downloadDir, setDownloadDir, startDownload, defaultDir, API_BASE } = useDownload();
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'bookmarks'

  const [selectedManga, setSelectedManga] = useState(null);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState(new Set());
  const [chapterLang, setChapterLang] = useState('en');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError('');
    setHasSearched(true);
    setActiveTab('search');
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.results || []);
      } else {
        setSearchError(data.error || 'Failed to search manga');
      }
    } catch (err) {
      setSearchError('Could not connect to backend server. Make sure it is running.');
    } finally {
      setSearching(false);
    }
  };

  const fetchChaptersForManga = async (manga, lang) => {
    setLoadingChapters(true);
    setChapters([]);
    setSelectedChapterIds(new Set());
    try {
      const res = await fetch(`${API_BASE}/manga/${manga.id}/chapters?lang=${lang}`);
      const data = await res.json();
      if (res.ok) {
        const fetched = data.chapters || [];
        setChapters(fetched);
        setSelectedChapterIds(new Set(fetched.map(c => c.id)));
      }
    } catch (err) {
      console.error('Failed to load chapters:', err);
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleSelectManga = (manga) => {
    setSelectedManga(manga);
    setDownloadSuccessMessage('');
    fetchChaptersForManga(manga, chapterLang);
  };

  const handleLanguageChange = (newLang) => {
    setChapterLang(newLang);
    if (selectedManga) {
      fetchChaptersForManga(selectedManga, newLang);
    }
  };

  const toggleSelectChapter = (id) => {
    const next = new Set(selectedChapterIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedChapterIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedChapterIds.size === chapters.length) {
      setSelectedChapterIds(new Set());
    } else {
      setSelectedChapterIds(new Set(chapters.map(c => c.id)));
    }
  };

  const initiateDownload = async () => {
    if (!selectedManga) return;
    if (selectedChapterIds.size === 0) {
      alert('Please select at least one chapter to download.');
      return;
    }
    try {
      await startDownload({
        mangaId: selectedManga.id,
        mangaTitle: selectedManga.title,
        language: chapterLang,
        selectedChapters: Array.from(selectedChapterIds)
      });
      setDownloadSuccessMessage(`Download queued for "${selectedManga.title}". Check the Progress tab.`);
    } catch (err) {
      alert('Error initiating download: ' + err.message);
    }
  };

  return {
    query,
    setQuery,
    searching,
    searchResults,
    hasSearched,
    searchError,
    handleSearch,
    activeTab,
    setActiveTab,
    bookmarks,
    selectedManga,
    setSelectedManga,
    handleSelectManga,
    loadingChapters,
    chapters,
    selectedChapterIds,
    toggleSelectChapter,
    toggleSelectAll,
    chapterLang,
    handleLanguageChange,
    downloadDir,
    setDownloadDir,
    defaultDir,
    initiateDownload,
    downloadSuccessMessage,
    isBookmarked,
    toggleBookmark
  };
}
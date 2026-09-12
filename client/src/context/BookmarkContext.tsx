import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config';

export const BookmarkContext = createContext<any>(null);

export const BookmarkProvider = ({ children }: { children: React.ReactNode }) => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch bookmarks from database on mount
  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookmarks`);
      const data = await res.json();
      if (res.ok && data.bookmarks) {
        setBookmarks(data.bookmarks);
      }
    } catch (err) {
      console.error('Failed to fetch bookmarks from database:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  const toggleBookmark = async (manga: any) => {
    // Optimistic UI update
    const alreadyBookmarked = isBookmarked(manga.id);
    if (alreadyBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.id !== manga.id));
    } else {
      setBookmarks((prev) => [
        {
          id: manga.id,
          title: manga.title,
          coverUrl: manga.coverUrl,
          author: manga.author,
          status: manga.status,
          year: manga.year,
          description: manga.description,
          savedAt: Date.now()
        },
        ...prev
      ]);
    }

    try {
      const res = await fetch(`${API_BASE}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manga)
      });
      const data = await res.json();
      if (res.ok && data.bookmarks) {
        setBookmarks(data.bookmarks);
      }
    } catch (err) {
      console.error('Failed to sync bookmark with database:', err);
      // Revert / re-sync on failure
      fetchBookmarks();
    }
  };

  const removeBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch(`${API_BASE}/bookmarks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.bookmarks) {
        setBookmarks(data.bookmarks);
      }
    } catch (err) {
      console.error('Failed to remove bookmark from database:', err);
      fetchBookmarks();
    }
  };

  const value = {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    fetchBookmarks,
    loading
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

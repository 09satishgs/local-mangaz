import React, { useState } from 'react';
import {
  Search,
  Download,
  Layers,
  AlertCircle,
  Loader2,
  BookOpen,
  Bookmark,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const AVAILABLE_LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'all', label: 'ALL' },
  { code: 'ja', label: 'JA' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'pt-br', label: 'PT' }
];

export default function Mobile({ home }: { home: any }) {
  const {
    query,
    setQuery,
    searching,
    searchResults,
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
    initiateDownload,
    downloadSuccessMessage,
    isBookmarked,
    toggleBookmark
  } = home;

  const [showPathSettings, setShowPathSettings] = useState(false);
  const listToDisplay = activeTab === 'bookmarks' ? bookmarks : searchResults;

  return (
    <div className="flex flex-col gap-4 w-full pb-20">
      {/* Top Search Header */}
      <div className="flex flex-col gap-2.5 bg-zinc-950 p-3.5 rounded-xl border border-zinc-900">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search manga..."
              className="w-full bg-zinc-900 text-zinc-100 placeholder-zinc-500 pl-9 pr-3 py-2 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="bg-zinc-100 text-black px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Go'}
          </button>
        </form>

        {/* Toggle Folder path */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
          <span className="font-mono truncate max-w-[220px]">{downloadDir}</span>
          <button
            onClick={() => setShowPathSettings(!showPathSettings)}
            className="text-zinc-300 underline font-medium cursor-pointer"
          >
            {showPathSettings ? 'Hide path' : 'Edit path'}
          </button>
        </div>

        {showPathSettings && (
          <div className="pt-2 border-t border-zinc-900">
            <input
              type="text"
              value={downloadDir}
              onChange={(e) => setDownloadDir(e.target.value)}
              placeholder="Target SSD folder path..."
              className="w-full bg-zinc-900 text-zinc-200 px-3 py-1.5 rounded-md border border-zinc-800 text-xs font-mono focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Alerts */}
      {downloadSuccessMessage && (
        <div className="bg-zinc-950 border border-zinc-800 text-zinc-200 p-3 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {searchError && (
        <div className="bg-zinc-950 border border-red-900/50 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-900">
        <button
          onClick={() => {
            setActiveTab('search');
            setSelectedManga(null);
          }}
          className={`py-2 text-xs font-medium rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'search' ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-500'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Search ({searchResults.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('bookmarks');
            setSelectedManga(null);
          }}
          className={`py-2 text-xs font-medium rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'bookmarks' ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-500'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          Bookmarks ({bookmarks.length})
        </button>
      </div>

      {/* View Selected Manga Chapters or Manga List */}
      {selectedManga ? (
        <div className="flex flex-col gap-3 bg-zinc-950 border border-zinc-900 rounded-xl p-4">
          {/* Back button */}
          <button
            onClick={() => setSelectedManga(null)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to list
          </button>

          <div className="flex gap-3 pb-3 border-b border-zinc-900">
            <div className="w-16 h-24 bg-zinc-900 rounded overflow-hidden shrink-0">
              {selectedManga.coverUrl ? (
                <img
                  src={selectedManga.coverUrl}
                  alt={selectedManga.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <BookOpen className="w-5 h-5 text-zinc-700 m-auto mt-8" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-zinc-100 text-xs line-clamp-2">{selectedManga.title}</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Author: {selectedManga.author}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => toggleBookmark(selectedManga)}
                  className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(selectedManga.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
                <select
                  value={chapterLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-zinc-900 text-zinc-300 text-[11px] px-2 py-1 rounded border border-zinc-800 focus:outline-none"
                >
                  {AVAILABLE_LANGS.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={initiateDownload}
              disabled={selectedChapterIds.size === 0}
              className="flex-1 bg-zinc-100 text-black font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download ({selectedChapterIds.size})
            </button>
            <button
              onClick={toggleSelectAll}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg cursor-pointer"
            >
              {selectedChapterIds.size === chapters.length ? 'Deselect' : 'All'}
            </button>
          </div>

          {/* Chapter list */}
          {loadingChapters ? (
            <div className="p-8 text-center text-zinc-500 flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              <span className="text-xs">Loading chapters...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
              {chapters.map((ch: any) => {
                const isChecked = selectedChapterIds.has(ch.id);
                return (
                  <div
                    key={ch.id}
                    onClick={() => toggleSelectChapter(ch.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                      isChecked ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 accent-zinc-200"
                    />
                    <span className="truncate text-[11px]">
                      Ch. {ch.chapter} {ch.title ? `- ${ch.title}` : ''}
                    </span>
                  </div>
                );
              })}{' '}
            </div>
          )}
        </div>
      ) : (
        /* Manga Card List */
        <div className="flex flex-col gap-2">
          {searching && (
            <div className="p-8 text-center text-zinc-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
              <span className="text-xs">Searching...</span>
            </div>
          )}

          {!searching && listToDisplay.map((manga: any) => {
            const bookmarked = isBookmarked(manga.id);
            return (
              <div
                key={manga.id}
                onClick={() => handleSelectManga(manga)}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 cursor-pointer"
              >
                <div className="w-12 h-16 bg-zinc-900 rounded overflow-hidden shrink-0 border border-zinc-900">
                  {manga.coverUrl ? (
                    <img
                      src={manga.coverUrl}
                      alt={manga.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <BookOpen className="w-4 h-4 text-zinc-700 m-auto mt-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-zinc-200 text-xs truncate">{manga.title}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{manga.author}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(manga);
                  }}
                  className="p-2 text-zinc-500 hover:text-amber-400 cursor-pointer"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

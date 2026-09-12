import React from 'react';
import {
  Search,
  Download,
  Layers,
  AlertCircle,
  Loader2,
  HardDrive,
  BookOpen,
  Globe,
  CheckSquare,
  Square,
  Bookmark,
  CheckCircle2
} from 'lucide-react';

const AVAILABLE_LANGS = [
  { code: 'en', label: 'English (en)' },
  { code: 'all', label: 'All Languages' },
  { code: 'ja', label: 'Japanese (ja)' },
  { code: 'es', label: 'Spanish (es)' },
  { code: 'es-la', label: 'Spanish - LatAm (es-la)' },
  { code: 'fr', label: 'French (fr)' },
  { code: 'pt-br', label: 'Portuguese - BR (pt-br)' },
  { code: 'id', label: 'Indonesian (id)' },
  { code: 'ru', label: 'Russian (ru)' },
  { code: 'vi', label: 'Vietnamese (vi)' }
];

export default function Web({ home }: { home: any }) {
  const {
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

  const listToDisplay = activeTab === 'bookmarks' ? bookmarks : searchResults;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Search Header & SSD path */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-900">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search manga by title (e.g. Oregairu, Solo Leveling, Chainsaw Man)..."
              className="w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-lg border border-zinc-800 text-sm focus:outline-none focus:border-zinc-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="bg-zinc-100 text-black hover:bg-white disabled:opacity-40 font-semibold px-6 py-2.5 rounded-lg text-sm transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </form>

        {/* SSD target directory input */}
        <div className="flex items-center gap-2.5 bg-zinc-900 px-3.5 py-2 rounded-lg border border-zinc-800 shrink-0 text-xs">
          <HardDrive className="w-4 h-4 text-zinc-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">SSD Download Folder</span>
            <input
              type="text"
              value={downloadDir}
              onChange={(e) => setDownloadDir(e.target.value)}
              placeholder="e.g. D:\Manga"
              className="bg-transparent border-none text-zinc-200 focus:outline-none w-64 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Download Queued Success Alert */}
      {downloadSuccessMessage && (
        <div className="bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Search error */}
      {searchError && (
        <div className="bg-zinc-950 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: List (Search Results or Bookmarks) */}
        <div className="col-span-5 flex flex-col gap-3">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-zinc-900 text-white border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Search Results ({searchResults.length})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-zinc-900 text-white border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              Bookmarks ({bookmarks.length})
            </button>
          </div>

          {searching && (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3 bg-zinc-950 rounded-xl border border-zinc-900">
              <Loader2 className="w-7 h-7 animate-spin text-zinc-400" />
              <span className="text-xs">Searching MangaDex...</span>
            </div>
          )}

          {!searching && activeTab === 'search' && hasSearched && searchResults.length === 0 && (
            <div className="p-10 text-center text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-900 text-xs">
              No manga found matching "{query}".
            </div>
          )}

          {!searching && activeTab === 'bookmarks' && bookmarks.length === 0 && (
            <div className="p-10 text-center text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-900 text-xs">
              No bookmarks saved yet. Click the bookmark icon on any manga card to bookmark it for later.
            </div>
          )}

          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {listToDisplay.map((manga: any) => {
              const isSelected = selectedManga?.id === manga.id;
              const bookmarked = isBookmarked(manga.id);
              return (
                <div
                  key={manga.id}
                  onClick={() => handleSelectManga(manga)}
                  className={`flex gap-3.5 p-3 rounded-xl border transition cursor-pointer text-left relative group ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-600 shadow-md'
                      : 'bg-zinc-950 border-zinc-900 hover:bg-zinc-900/60 hover:border-zinc-800'
                  }`}
                >
                  {/* Cover */}
                  <div className="w-14 h-20 bg-zinc-900 rounded-md overflow-hidden shrink-0 flex items-center justify-center border border-zinc-900">
                    {manga.coverUrl ? (
                      <img
                        src={manga.coverUrl}
                        alt={manga.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <BookOpen className="w-5 h-5 text-zinc-700" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center pr-6">
                    <h3 className="font-medium text-zinc-100 text-xs line-clamp-2 leading-snug">
                      {manga.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-1 truncate">
                      Author: {manga.author}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {manga.status && (
                        <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {manga.status}
                        </span>
                      )}
                      {manga.year && <span className="text-[10px] text-zinc-500">{manga.year}</span>}
                    </div>
                  </div>

                  {/* Bookmark Toggle button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(manga);
                    }}
                    title={bookmarked ? 'Remove Bookmark' : 'Bookmark Manga'}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-zinc-800/80 transition cursor-pointer"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chapters and Action */}
        <div className="col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-zinc-300" />
              Chapter Selection & Download
            </h2>

            {selectedManga && (
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md text-xs">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-500 text-[11px]">Lang:</span>
                <select
                  value={chapterLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-zinc-300 text-xs focus:outline-none cursor-pointer"
                >
                  {AVAILABLE_LANGS.map((l) => (
                    <option key={l.code} value={l.code} className="bg-zinc-900 text-zinc-200">
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedManga ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col gap-4">
              {/* Manga Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-zinc-900">
                <div className="w-20 h-28 bg-zinc-900 rounded-md overflow-hidden shrink-0 border border-zinc-900">
                  {selectedManga.coverUrl ? (
                    <img
                      src={selectedManga.coverUrl}
                      alt={selectedManga.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <BookOpen className="w-6 h-6 text-zinc-700 m-auto mt-10" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-zinc-100 leading-snug">
                      {selectedManga.title}
                    </h3>
                    <button
                      onClick={() => toggleBookmark(selectedManga)}
                      className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-zinc-700 transition shrink-0 cursor-pointer"
                      title="Toggle Bookmark"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked(selectedManga.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {selectedManga.description || 'No description available.'}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={initiateDownload}
                      disabled={selectedChapterIds.size === 0}
                      className="bg-zinc-100 hover:bg-white text-black font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 disabled:opacity-40 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Selected ({selectedChapterIds.size}) Chapters
                    </button>
                    <button
                      onClick={toggleSelectAll}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg text-xs transition border border-zinc-800 cursor-pointer flex items-center gap-1.5"
                    >
                      {selectedChapterIds.size === chapters.length ? (
                        <>
                          <Square className="w-3.5 h-3.5" /> Deselect All
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-3.5 h-3.5" /> Select All
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chapter info */}
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Available Chapters ({chapters.length})</span>
                <span className="font-mono text-[11px] text-zinc-500">Nested format: /{selectedManga.title}/Chapter X/</span>
              </div>

              {loadingChapters ? (
                <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                  <span className="text-xs">Loading chapter feed from MangaDex...</span>
                </div>
              ) : chapters.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 rounded-lg text-xs border border-zinc-900">
                  No chapters found for language ({chapterLang}). Try selecting "All Languages" above.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[calc(100vh-420px)] pr-1">
                  {chapters.map((ch: any) => {
                    const isChecked = selectedChapterIds.has(ch.id);
                    return (
                      <div
                        key={ch.id}
                        onClick={() => toggleSelectChapter(ch.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                            : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:bg-zinc-900/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-zinc-700 text-zinc-200 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-zinc-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-200 truncate text-[11px]">
                            Chapter {ch.chapter} {ch.title ? `- ${ch.title}` : ''}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            Pages: {ch.pages || 'N/A'} {ch.volume ? `| Vol. ${ch.volume}` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-16 flex flex-col items-center justify-center text-center text-zinc-600">
              <BookOpen className="w-10 h-10 text-zinc-800 mb-2.5" />
              <p className="text-xs font-medium text-zinc-400">No manga selected</p>
              <p className="text-[11px] text-zinc-600 max-w-xs mt-1">
                Pick a manga from the left to view available chapters and download them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

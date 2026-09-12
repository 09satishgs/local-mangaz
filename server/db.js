const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");

const DB_DIR = path.resolve(__dirname, "../data");
fs.ensureDirSync(DB_DIR);
const DB_PATH = path.join(DB_DIR, "manga.db");
const BOOKMARKS_JSON = path.join(DB_DIR, "bookmarks.json");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS reading_progress (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    chapter TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    reader_type TEXT NOT NULL,
    current_page INTEGER NOT NULL,
    total_pages INTEGER NOT NULL,
    thumbnail_url TEXT,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    cover_url TEXT,
    author TEXT,
    status TEXT,
    year TEXT,
    description TEXT,
    saved_at INTEGER NOT NULL
  );
`);

// Migration: Check if legacy bookmarks.json has entries and bookmarks table is empty
try {
  const countRow = db.prepare("SELECT COUNT(*) as count FROM bookmarks").get();
  if (countRow.count === 0 && fs.existsSync(BOOKMARKS_JSON)) {
    const jsonBookmarks = fs.readJsonSync(BOOKMARKS_JSON);
    if (Array.isArray(jsonBookmarks) && jsonBookmarks.length > 0) {
      const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO bookmarks (id, title, cover_url, author, status, year, description, saved_at)
        VALUES (@id, @title, @cover_url, @author, @status, @year, @description, @saved_at)
      `);
      const insertMany = db.transaction((items) => {
        for (const b of items) {
          insertStmt.run({
            id: String(b.id),
            title: b.title || "Untitled",
            cover_url: b.coverUrl || null,
            author: b.author || "Unknown",
            status: b.status || "",
            year: b.year ? String(b.year) : "",
            description: b.description || "",
            saved_at: b.savedAt || Date.now(),
          });
        }
      });
      insertMany(jsonBookmarks);
      console.log(`[DB] Migrated ${jsonBookmarks.length} bookmarks from JSON to SQLite.`);
    }
  }
} catch (migErr) {
  console.error("[DB] Bookmarks migration error:", migErr.message);
}

// ----------------------------------------------------
// Bookmarks Helper Functions
// ----------------------------------------------------
function getBookmarks() {
  const rows = db
    .prepare("SELECT id, title, cover_url, author, status, year, description, saved_at FROM bookmarks ORDER BY saved_at DESC")
    .all();

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    coverUrl: r.cover_url,
    author: r.author,
    status: r.status,
    year: r.year,
    description: r.description,
    savedAt: r.saved_at,
  }));
}

function toggleBookmark(manga) {
  if (!manga || !manga.id || !manga.title) {
    throw new Error("Valid manga with id and title is required");
  }

  const existing = db.prepare("SELECT id FROM bookmarks WHERE id = ?").get(String(manga.id));

  if (existing) {
    db.prepare("DELETE FROM bookmarks WHERE id = ?").run(String(manga.id));
    return { bookmarked: false, bookmarks: getBookmarks() };
  } else {
    db.prepare(`
      INSERT INTO bookmarks (id, title, cover_url, author, status, year, description, saved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      String(manga.id),
      manga.title,
      manga.coverUrl || null,
      manga.author || "Unknown",
      manga.status || "",
      manga.year ? String(manga.year) : "",
      manga.description || "",
      Date.now()
    );
    return { bookmarked: true, bookmarks: getBookmarks() };
  }
}

function deleteBookmark(id) {
  db.prepare("DELETE FROM bookmarks WHERE id = ?").run(String(id));
  return getBookmarks();
}

// ----------------------------------------------------
// Reading Progress Helper Functions
// ----------------------------------------------------
function getProgressList() {
  const rows = db
    .prepare(`
      SELECT id, title, chapter, path, reader_type, current_page, total_pages, thumbnail_url, updated_at
      FROM reading_progress
      ORDER BY updated_at DESC
    `)
    .all();

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    chapter: r.chapter,
    path: r.path,
    readerType: r.reader_type,
    currentPage: r.current_page,
    totalPages: r.total_pages,
    thumbnailUrl: r.thumbnail_url,
    updatedAt: r.updated_at,
  }));
}

function upsertProgress(data) {
  const {
    path: itemPath,
    title,
    chapter,
    readerType = "read",
    currentPage = 0,
    totalPages = 1,
    thumbnailUrl = null,
  } = data;

  if (!itemPath || !title) {
    throw new Error("path and title are required for reading progress");
  }

  const id = crypto.createHash("md5").update(itemPath).digest("hex");
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO reading_progress (
      id, title, chapter, path, reader_type, current_page, total_pages, thumbnail_url, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(path) DO UPDATE SET
      title = excluded.title,
      chapter = excluded.chapter,
      current_page = excluded.current_page,
      total_pages = excluded.total_pages,
      thumbnail_url = excluded.thumbnail_url,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    id,
    title,
    chapter || "Chapter",
    itemPath,
    readerType,
    Number(currentPage),
    Number(totalPages),
    thumbnailUrl,
    now
  );

  return {
    id,
    title,
    chapter: chapter || "Chapter",
    path: itemPath,
    readerType,
    currentPage: Number(currentPage),
    totalPages: Number(totalPages),
    thumbnailUrl,
    updatedAt: now,
  };
}

function deleteProgress(idOrPath) {
  db.prepare("DELETE FROM reading_progress WHERE id = ? OR path = ?").run(
    String(idOrPath),
    String(idOrPath)
  );
  return getProgressList();
}

module.exports = {
  db,
  getBookmarks,
  toggleBookmark,
  deleteBookmark,
  getProgressList,
  upsertProgress,
  deleteProgress,
};

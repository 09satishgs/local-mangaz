const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const fs = require("fs-extra");
const { searchManga, getMangaChapters } = require("./mangadex");
const { downloadManager } = require("./downloadManager");

const AdmZip = require("adm-zip");
const app = express();
const PORT = process.env.PORT;

if (!PORT) {
  console.error("Error: PORT environment variable is not defined in .env file.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// JSON File Database for Bookmarks
const DB_DIR = path.resolve(__dirname, "../data");
const BOOKMARKS_FILE = path.join(DB_DIR, "bookmarks.json");

// Ensure DB directory and file exist
fs.ensureDirSync(DB_DIR);
if (!fs.existsSync(BOOKMARKS_FILE)) {
  fs.writeJsonSync(BOOKMARKS_FILE, []);
}

async function getBookmarksFromDb() {
  try {
    return await fs.readJson(BOOKMARKS_FILE);
  } catch (err) {
    console.error("Error reading bookmarks DB:", err.message);
    return [];
  }
}

async function saveBookmarksToDb(bookmarks) {
  try {
    await fs.writeJson(BOOKMARKS_FILE, bookmarks, { spaces: 2 });
  } catch (err) {
    console.error("Error writing bookmarks DB:", err.message);
  }
}

// ----------------------------------------------------
// Bookmarks Database API Endpoints
// ----------------------------------------------------
app.get("/api/bookmarks", async (req, res) => {
  try {
    const bookmarks = await getBookmarksFromDb();
    res.json({ bookmarks });
  } catch (err) {
    res.status(500).json({ error: "Failed to read bookmarks" });
  }
});

app.post("/api/bookmarks", async (req, res) => {
  try {
    const manga = req.body;
    if (!manga || !manga.id || !manga.title) {
      return res
        .status(400)
        .json({ error: "Valid manga object with id and title is required" });
    }

    const bookmarks = await getBookmarksFromDb();
    const existingIndex = bookmarks.findIndex((b) => b.id === manga.id);

    if (existingIndex >= 0) {
      // Toggle off / remove
      bookmarks.splice(existingIndex, 1);
      await saveBookmarksToDb(bookmarks);
      return res.json({ bookmarked: false, bookmarks });
    } else {
      // Add
      const newBookmark = {
        id: manga.id,
        title: manga.title,
        coverUrl: manga.coverUrl || null,
        author: manga.author || "Unknown",
        status: manga.status || "",
        year: manga.year || "",
        description: manga.description || "",
        savedAt: Date.now(),
      };
      bookmarks.unshift(newBookmark);
      await saveBookmarksToDb(bookmarks);
      return res.json({ bookmarked: true, bookmarks });
    }
  } catch (err) {
    console.error("Bookmark error:", err);
    res.status(500).json({ error: "Failed to update bookmark" });
  }
});

app.delete("/api/bookmarks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let bookmarks = await getBookmarksFromDb();
    bookmarks = bookmarks.filter((b) => b.id !== id);
    await saveBookmarksToDb(bookmarks);
    res.json({ success: true, bookmarks });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete bookmark" });
  }
});

// ----------------------------------------------------
// MangaDex Search & Chapters
// ----------------------------------------------------
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }
    const results = await searchManga(query);
    res.json({ results });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: err.message || "Failed to search manga" });
  }
});

app.get("/api/manga/:id/chapters", async (req, res) => {
  try {
    const mangaId = req.params.id;
    const lang = req.query.lang || "en";
    const chapters = await getMangaChapters(mangaId, lang);
    res.json({ chapters });
  } catch (err) {
    console.error("Chapters error:", err.message);
    res.status(500).json({ error: err.message || "Failed to fetch chapters" });
  }
});

// ----------------------------------------------------
// Downloads API
// ----------------------------------------------------
app.post("/api/download", async (req, res) => {
  try {
    const { mangaId, mangaTitle, downloadDir, language, selectedChapters } =
      req.body;
    if (!mangaId || !mangaTitle) {
      return res
        .status(400)
        .json({ error: "mangaId and mangaTitle are required" });
    }

    const job = downloadManager.createJob(
      mangaId,
      mangaTitle,
      downloadDir,
      language || "en",
      selectedChapters,
    );

    res.json({ success: true, job });
  } catch (err) {
    console.error("Download start error:", err.message);
    res
      .status(500)
      .json({ error: err.message || "Failed to initiate download" });
  }
});

app.get("/api/jobs/:id", (req, res) => {
  const job = downloadManager.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.json({ job });
});

app.get("/api/jobs", (req, res) => {
  res.json({ jobs: downloadManager.getAllJobs() });
});

app.post("/api/jobs/:id/cancel", (req, res) => {
  const success = downloadManager.cancelJob(req.params.id);
  res.json({ success });
});

app.get("/api/config", (req, res) => {
  const defaultDir = path.resolve(__dirname, "../downloads");
  res.json({
    defaultDownloadDir: defaultDir,
  });
});

// ----------------------------------------------------
// Explorer & Reader API
// ----------------------------------------------------
app.get("/api/explore", async (req, res) => {
  try {
    const requestedPath =
      req.query.path || path.resolve(__dirname, "../downloads");
    const safePath = path.resolve(requestedPath);

    if (!(await fs.pathExists(safePath))) {
      return res.status(404).json({ error: "Directory does not exist" });
    }

    const stat = await fs.stat(safePath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: "Path is not a directory" });
    }

    const entries = await fs.readdir(safePath, { withFileTypes: true });
    const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

    const folders = [];
    const images = [];

    // Natural sorting (e.g. Chapter 1, Chapter 2, Chapter 10)
    const naturalSort = (a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        folders.push({
          name: entry.name,
          path: path.join(safePath, entry.name),
        });
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (imageExtensions.has(ext)) {
          images.push({
            name: entry.name,
            path: path.join(safePath, entry.name),
            url: `/api/image?path=${encodeURIComponent(path.join(safePath, entry.name))}`,
          });
        }
      }
    }

    folders.sort((a, b) => naturalSort(a.name, b.name));
    images.sort((a, b) => naturalSort(a.name, b.name));

    // Parent directory
    const parentPath = path.dirname(safePath);

    // Sibling directories for chapter navigation (if inside a chapter folder)
    let prevSiblingFolder = null;
    let nextSiblingFolder = null;

    if (parentPath && parentPath !== safePath) {
      try {
        const parentEntries = await fs.readdir(parentPath, {
          withFileTypes: true,
        });
        const siblingFolders = parentEntries
          .filter((e) => e.isDirectory())
          .map((e) => ({
            name: e.name,
            path: path.join(parentPath, e.name),
          }))
          .sort((a, b) => naturalSort(a.name, b.name));

        const currentIndex = siblingFolders.findIndex(
          (f) => f.path.toLowerCase() === safePath.toLowerCase(),
        );
        if (currentIndex > 0) {
          prevSiblingFolder = siblingFolders[currentIndex - 1];
        }
        if (currentIndex >= 0 && currentIndex < siblingFolders.length - 1) {
          nextSiblingFolder = siblingFolders[currentIndex + 1];
        }
      } catch (siblingErr) {
        console.error("Error finding siblings:", siblingErr.message);
      }
    }

    res.json({
      currentPath: safePath,
      parentPath: parentPath !== safePath ? parentPath : null,
      folders,
      images,
      prevSiblingFolder,
      nextSiblingFolder,
    });
  } catch (err) {
    console.error("Explore error:", err.message);
    res
      .status(500)
      .json({ error: err.message || "Failed to explore directory" });
  }
});

// Rename folder endpoint
app.post("/api/folder/rename", async (req, res) => {
  try {
    const { folderPath, newName } = req.body;
    if (!folderPath || !newName || !newName.trim()) {
      return res
        .status(400)
        .json({ error: "folderPath and newName are required" });
    }

    const resolvedPath = path.resolve(folderPath);
    if (!(await fs.pathExists(resolvedPath))) {
      return res.status(404).json({ error: "Source folder does not exist" });
    }

    const stat = await fs.stat(resolvedPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: "Path is not a directory" });
    }

    // Sanitize folder name for safety
    const cleanName = newName.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
    if (!cleanName) {
      return res.status(400).json({ error: "Invalid new folder name" });
    }

    const parentDir = path.dirname(resolvedPath);
    const destinationPath = path.join(parentDir, cleanName);

    if (
      destinationPath.toLowerCase() !== resolvedPath.toLowerCase() &&
      (await fs.pathExists(destinationPath))
    ) {
      return res
        .status(409)
        .json({ error: "A folder with this name already exists" });
    }

    await fs.move(resolvedPath, destinationPath);

    res.json({
      success: true,
      oldPath: resolvedPath,
      newPath: destinationPath,
      newName: cleanName,
    });
  } catch (err) {
    console.error("Rename folder error:", err.message);
    res.status(500).json({ error: err.message || "Failed to rename folder" });
  }
});

app.get("/api/image", async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).send("Image path is required");
    }
    const resolvedPath = path.resolve(filePath);
    if (!(await fs.pathExists(resolvedPath))) {
      return res.status(404).send("Image not found");
    }
    res.sendFile(resolvedPath);
  } catch (err) {
    console.error("Image serve error:", err.message);
    res.status(500).send("Failed to serve image");
  }
});

// ----------------------------------------------------
// CBZ API Endpoints
// ----------------------------------------------------

// Explore directory for folders and .cbz / .zip files
app.get("/api/cbz/explore", async (req, res) => {
  try {
    const requestedPath =
      req.query.path || path.resolve(__dirname, "../downloads");
    const safePath = path.resolve(requestedPath);

    if (!(await fs.pathExists(safePath))) {
      return res.status(404).json({ error: "Directory does not exist" });
    }

    const stat = await fs.stat(safePath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: "Path is not a directory" });
    }

    const entries = await fs.readdir(safePath, { withFileTypes: true });
    const naturalSort = (a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

    const folders = [];
    const cbzFiles = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        folders.push({
          name: entry.name,
          path: path.join(safePath, entry.name),
        });
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === ".cbz" || ext === ".zip") {
          const filePath = path.join(safePath, entry.name);
          const fileStat = await fs.stat(filePath);
          cbzFiles.push({
            name: entry.name,
            path: filePath,
            sizeBytes: fileStat.size,
          });
        }
      }
    }

    folders.sort((a, b) => naturalSort(a.name, b.name));
    cbzFiles.sort((a, b) => naturalSort(a.name, b.name));

    const parentPath = path.dirname(safePath);

    res.json({
      currentPath: safePath,
      parentPath: parentPath !== safePath ? parentPath : null,
      folders,
      cbzFiles,
    });
  } catch (err) {
    console.error("CBZ explore error:", err.message);
    res
      .status(500)
      .json({ error: err.message || "Failed to explore CBZ directory" });
  }
});

// Inspect a .cbz file and list image pages inside it
app.get("/api/cbz/pages", async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: "CBZ file path is required" });
    }

    const resolvedPath = path.resolve(filePath);
    if (!(await fs.pathExists(resolvedPath))) {
      return res.status(404).json({ error: "CBZ file not found" });
    }

    const zip = new AdmZip(resolvedPath);
    const zipEntries = zip.getEntries();
    const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
    const naturalSort = (a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

    const pages = [];

    for (const entry of zipEntries) {
      if (!entry.isDirectory && !entry.entryName.startsWith("__MACOSX")) {
        const ext = path.extname(entry.entryName).toLowerCase();
        if (imageExtensions.has(ext)) {
          pages.push({
            entryName: entry.entryName,
            name: path.basename(entry.entryName),
            url: `/api/cbz/image?path=${encodeURIComponent(resolvedPath)}&entry=${encodeURIComponent(entry.entryName)}`,
          });
        }
      }
    }

    pages.sort((a, b) => naturalSort(a.name, b.name));

    // Find sibling CBZ files in the same directory for chapter navigation
    const parentDir = path.dirname(resolvedPath);
    let prevCbz = null;
    let nextCbz = null;

    try {
      const dirEntries = await fs.readdir(parentDir, { withFileTypes: true });
      const siblingCbzs = dirEntries
        .filter(
          (e) =>
            e.isFile() &&
            (e.name.toLowerCase().endsWith(".cbz") ||
              e.name.toLowerCase().endsWith(".zip")),
        )
        .map((e) => ({
          name: e.name,
          path: path.join(parentDir, e.name),
        }))
        .sort((a, b) => naturalSort(a.name, b.name));

      const currentIndex = siblingCbzs.findIndex(
        (c) => c.path.toLowerCase() === resolvedPath.toLowerCase(),
      );

      if (currentIndex > 0) {
        prevCbz = siblingCbzs[currentIndex - 1];
      }
      if (currentIndex >= 0 && currentIndex < siblingCbzs.length - 1) {
        nextCbz = siblingCbzs[currentIndex + 1];
      }
    } catch (siblingErr) {
      console.error("Error finding CBZ siblings:", siblingErr.message);
    }

    res.json({
      cbzPath: resolvedPath,
      cbzName: path.basename(resolvedPath),
      totalPages: pages.length,
      pages,
      prevCbz,
      nextCbz,
    });
  } catch (err) {
    console.error("CBZ pages error:", err.message);
    res
      .status(500)
      .json({ error: err.message || "Failed to inspect CBZ file" });
  }
});

// Stream a single image file out of a .cbz archive
app.get("/api/cbz/image", async (req, res) => {
  try {
    const filePath = req.query.path;
    const entryName = req.query.entry;

    if (!filePath || !entryName) {
      return res
        .status(400)
        .send("Both path and entry parameters are required");
    }

    const resolvedPath = path.resolve(filePath);
    if (!(await fs.pathExists(resolvedPath))) {
      return res.status(404).send("CBZ file not found");
    }

    const zip = new AdmZip(resolvedPath);
    const entry = zip.getEntry(entryName);

    if (!entry) {
      return res.status(404).send("Page entry not found in archive");
    }

    const buffer = entry.getData();
    const ext = path.extname(entryName).toLowerCase();
    const mimeMap = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
    };

    res.setHeader("Content-Type", mimeMap[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (err) {
    console.error("CBZ image stream error:", err.message);
    res.status(500).send("Failed to stream CBZ image");
  }
});

// Serve client production build if client/dist exists
const CLIENT_DIST = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get("/*splat", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Manga Download API server running on http://localhost:${PORT}`);
});

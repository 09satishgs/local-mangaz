const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const {
  rateLimiter,
  sanitizeFolderName,
  getMangaChapters,
  getChapterImages
} = require('./mangadex');

class DownloadManager {
  constructor() {
    this.jobs = new Map(); // jobId -> job details
    this.isProcessing = false;
    this.activeJobId = null;
  }

  createJob(mangaId, mangaTitle, downloadDir, language = 'en', selectedChapters = null) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const job = {
      id: jobId,
      mangaId,
      mangaTitle,
      downloadDir: downloadDir || path.resolve(__dirname, '../downloads'),
      language,
      selectedChapters,
      status: 'pending', // 'pending', 'fetching_chapters', 'downloading', 'completed', 'cancelled', 'error'
      progress: {
        totalChapters: 0,
        completedChapters: 0,
        currentChapter: '',
        totalPages: 0,
        downloadedPages: 0,
        percent: 0,
        currentMessage: 'Job queued'
      },
      error: null,
      cancelled: false
    };

    this.jobs.set(jobId, job);
    this.processNext();
    return job;
  }

  cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.cancelled = true;
      job.status = 'cancelled';
      job.progress.currentMessage = 'Download cancelled by user';
      return true;
    }
    return false;
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getAllJobs() {
    return Array.from(this.jobs.values()).map(j => ({
      id: j.id,
      mangaTitle: j.mangaTitle,
      status: j.status,
      progress: j.progress,
      downloadDir: j.downloadDir,
      error: j.error
    }));
  }

  async processNext() {
    if (this.isProcessing) return;

    // Find first pending job
    const pendingJob = Array.from(this.jobs.values()).find(j => j.status === 'pending');
    if (!pendingJob) return;

    this.isProcessing = true;
    this.activeJobId = pendingJob.id;
    await this.runJob(pendingJob);
    this.isProcessing = false;
    this.activeJobId = null;

    // Trigger next if any
    this.processNext();
  }

  async downloadPageWithRetry(pageUrl, destPath, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await rateLimiter.throttle(); // Ensure 4 req/sec limit on image downloads
        const response = await axios({
          url: pageUrl,
          method: 'GET',
          responseType: 'stream',
          headers: {
            'User-Agent': 'HomeMangaDB/1.0 (https://github.com/home-manga-db)'
          },
          timeout: 30000
        });

        await fs.ensureDir(path.dirname(destPath));
        const writer = fs.createWriteStream(destPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        return;
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }

  async runJob(job) {
    try {
      job.status = 'fetching_chapters';
      job.progress.currentMessage = `Fetching chapter list for "${job.mangaTitle}"...`;

      const allChapters = await getMangaChapters(job.mangaId, job.language);
      if (job.cancelled) return;

      let chaptersToDownload = allChapters;
      if (job.selectedChapters && job.selectedChapters.length > 0) {
        const set = new Set(job.selectedChapters);
        chaptersToDownload = allChapters.filter(ch => set.has(ch.id));
      }

      if (chaptersToDownload.length === 0) {
        job.status = 'completed';
        job.progress.currentMessage = 'No chapters found to download';
        return;
      }

      job.status = 'downloading';
      job.progress.totalChapters = chaptersToDownload.length;
      job.progress.completedChapters = 0;

      // Nested structure: <downloadDir>/<manga_name>/Chapter <number> - <title>/
      const safeMangaFolder = sanitizeFolderName(job.mangaTitle);
      const mangaPath = path.join(job.downloadDir, safeMangaFolder);
      await fs.ensureDir(mangaPath);

      for (let i = 0; i < chaptersToDownload.length; i++) {
        if (job.cancelled) {
          job.status = 'cancelled';
          job.progress.currentMessage = 'Download cancelled';
          return;
        }

        const ch = chaptersToDownload[i];
        let chFolderTitle = `Chapter ${ch.chapter}`;
        if (ch.title) {
          chFolderTitle += ` - ${ch.title}`;
        }
        const safeChapterFolder = sanitizeFolderName(chFolderTitle);
        const chapterPath = path.join(mangaPath, safeChapterFolder);
        await fs.ensureDir(chapterPath);

        job.progress.currentChapter = `Ch. ${ch.chapter} (${i + 1}/${chaptersToDownload.length})`;
        job.progress.currentMessage = `Downloading ${job.progress.currentChapter}...`;

        // Fetch image urls for chapter
        let chapterDetails;
        try {
          chapterDetails = await getChapterImages(ch.id);
        } catch (fetchErr) {
          console.error(`Failed to get images for chapter ${ch.chapter}:`, fetchErr.message);
          continue;
        }

        if (job.cancelled) return;

        const pages = chapterDetails.pageUrls;
        job.progress.totalPages += pages.length;

        for (let pIdx = 0; pIdx < pages.length; pIdx++) {
          if (job.cancelled) return;

          const page = pages[pIdx];
          const ext = path.extname(page.fileName) || '.jpg';
          const pageNumStr = String(pIdx + 1).padStart(3, '0');
          const pageDest = path.join(chapterPath, `page_${pageNumStr}${ext}`);

          // Skip already downloaded pages
          if (!(await fs.pathExists(pageDest))) {
            await this.downloadPageWithRetry(page.url, pageDest);
          }

          job.progress.downloadedPages++;
          if (job.progress.totalPages > 0) {
            job.progress.percent = Math.floor(
              (job.progress.completedChapters / job.progress.totalChapters) * 100
            );
          }
        }

        job.progress.completedChapters++;
        job.progress.percent = Math.floor(
          (job.progress.completedChapters / job.progress.totalChapters) * 100
        );
      }

      job.status = 'completed';
      job.progress.percent = 100;
      job.progress.currentMessage = `All chapters successfully downloaded to: ${mangaPath}`;
    } catch (err) {
      console.error('Job error:', err);
      job.status = 'error';
      job.error = err.message;
      job.progress.currentMessage = `Failed: ${err.message}`;
    }
  }
}

const downloadManager = new DownloadManager();

module.exports = {
  downloadManager
};

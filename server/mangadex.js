const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

// MangaDex allows ~5 req/sec. User requested a hard cooldown of 4 req/sec (1 less than max allowed).
// 1000ms / 4 = 250ms interval between calls.
class RateLimiter {
  constructor(requestsPerSecond = 4) {
    this.interval = Math.ceil(1000 / requestsPerSecond); // 250ms
    this.lastRequestTime = 0;
  }

  async throttle() {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.interval) {
      const waitTime = this.interval - timeSinceLast;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }
}

const rateLimiter = new RateLimiter(4);

const client = axios.create({
  baseURL: 'https://api.mangadex.org',
  headers: {
    'User-Agent': 'HomeMangaDB/1.0 (https://github.com/home-manga-db)',
    'Accept': 'application/json'
  },
  timeout: 15000
});

async function apiRequest(url, options = {}) {
  await rateLimiter.throttle();
  return client(url, options);
}

// Sanitize directory names for Windows filesystem safety
function sanitizeFolderName(name) {
  if (!name) return 'Unknown';
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
}

async function searchManga(query, limit = 20) {
  const res = await apiRequest('/manga', {
    params: {
      title: query,
      limit,
      includes: ['cover_art', 'author'],
      'order[relevance]': 'desc'
    }
  });

  const mangaList = res.data.data.map((item) => {
    const titleObj = item.attributes.title;
    const title = titleObj.en || titleObj.ja || titleObj['ja-ro'] || Object.values(titleObj)[0] || 'Unknown Title';
    
    // Find cover art file
    const coverRel = item.relationships.find((r) => r.type === 'cover_art');
    const coverFileName = coverRel?.attributes?.fileName;
    const coverUrl = coverFileName
      ? `https://uploads.mangadex.org/covers/${item.id}/${coverFileName}.256.jpg`
      : null;

    const authorRel = item.relationships.find((r) => r.type === 'author');
    const authorName = authorRel?.attributes?.name || 'Unknown';

    return {
      id: item.id,
      title,
      description: item.attributes.description?.en || Object.values(item.attributes.description || {})[0] || '',
      status: item.attributes.status,
      year: item.attributes.year,
      author: authorName,
      coverUrl
    };
  });

  return mangaList;
}

async function getMangaChapters(mangaId, language = 'en') {
  let chapters = [];
  let offset = 0;
  const limit = 100;
  let total = 100;

  while (offset < total) {
    const params = {
      limit,
      offset,
      'order[chapter]': 'asc'
    };

    if (language && language !== 'all') {
      params['translatedLanguage[]'] = language;
    }

    const res = await apiRequest(`/manga/${mangaId}/feed`, { params });

    total = res.data.total;
    const items = res.data.data;
    if (!items || items.length === 0) break;

    for (const item of items) {
      const chNumber = item.attributes.chapter !== null ? item.attributes.chapter : 'oneshot';
      const chTitle = item.attributes.title || '';
      const volume = item.attributes.volume || '';

      chapters.push({
        id: item.id,
        chapter: chNumber,
        title: chTitle,
        volume: volume,
        pages: item.attributes.pages,
        publishAt: item.attributes.publishAt
      });
    }

    offset += limit;
  }

  // Deduplicate by chapter number if multiple scanlation groups uploaded the same chapter
  const uniqueMap = new Map();
  for (const ch of chapters) {
    if (!uniqueMap.has(ch.chapter)) {
      uniqueMap.set(ch.chapter, ch);
    }
  }

  return Array.from(uniqueMap.values());
}

async function getChapterImages(chapterId) {
  const res = await apiRequest(`/at-home/server/${chapterId}`);
  const baseUrl = res.data.baseUrl;
  const chapterHash = res.data.chapter.hash;
  const fileNames = res.data.chapter.data; // High quality files

  const pageUrls = fileNames.map((fileName) => ({
    fileName,
    url: `${baseUrl}/data/${chapterHash}/${fileName}`
  }));

  return { baseUrl, chapterHash, pageUrls };
}

module.exports = {
  rateLimiter,
  apiRequest,
  sanitizeFolderName,
  searchManga,
  getMangaChapters,
  getChapterImages
};

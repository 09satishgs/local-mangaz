# Potential Sources for Manga — API Research

> **NOTE:** This document catalogs all identified free APIs and tools for searching and downloading manga.
> Last updated: September 2026.

---

## Quick Comparison Matrix

| Source | Type | Auth Required | Provides Chapters/Images | Rate Limit | Best For |
|:---|:---|:---|:---|:---|:---|
| **MangaDex** | REST | No (read) | ✅ Yes | 5 req/s | Reading chapters & images |
| **Jikan** | REST | No | ❌ Metadata only | 3 req/s, 60 req/min | Search & discovery |
| **AniList** | GraphQL | No | ❌ Metadata only | Liberal | Flexible metadata queries |
| **Kitsu** | JSON:API | No (read) | ❌ Metadata only | Liberal | Library cataloging |
| **MyAnimeList** | REST | Yes (Client ID) | ❌ Metadata only | ~3 req/s | Official MAL data |
| **Manga Hook** | REST | No | ✅ Yes | Self-hosted | Simple reader apps |
| **Nyora SDK** | Python SDK | No | ✅ Yes | N/A (local) | Multi-source aggregation |
| **manga-scrapers** | FastAPI | No | ✅ Yes | Self-hosted | Multi-site scraping |
| **Suwayomi-Server** | REST/OPDS | No | ✅ Yes | Self-hosted | Tachiyomi-compatible backend |
| **Comick.io** | Unofficial | No | ✅ Yes (fragile) | Unknown | ⚠️ Unstable, no official API |

---

## Tier 1 — Official / Well-Maintained APIs (Recommended)

These are the most reliable, well-documented, and actively maintained sources.

---

### 1. MangaDex API ⭐ (Best for Content)

The **gold standard** for community-driven manga content. Provides full access to manga metadata, chapter lists, and page images.

| Detail | Value |
|:---|:---|
| **Base URL** | `https://api.mangadex.org` |
| **Docs** | [api.mangadex.org/docs](https://api.mangadex.org/docs/) / [Swagger](https://api.mangadex.org/swagger.html) |
| **Type** | REST (JSON) |
| **Auth** | Not required for public reads |
| **Rate Limit** | ~5 requests/second per IP |
| **Content** | Manga, Manhwa, Manhua, Webtoons |

#### Key Endpoints

```
GET  /manga                          # Search manga by title, tags, authors
GET  /manga/{id}                     # Get manga details
GET  /manga/{id}/feed                # Get chapter list for a manga
GET  /at-home/server/{chapterId}     # Get image server URL for a chapter
```

#### Image Retrieval Flow

```
1. Search manga       →  GET /manga?title=Naruto
2. Get chapters       →  GET /manga/{id}/feed?translatedLanguage[]=en
3. Get image server   →  GET /at-home/server/{chapterId}
4. Build image URL    →  {baseUrl}/data/{chapterHash}/{filename}
```

#### Useful Query Parameters (Search)

- `title` — Search by title
- `includedTags[]` — Filter by genre/tag UUIDs
- `authors[]` — Filter by author UUID
- `limit`, `offset` — Pagination
- `translatedLanguage[]` — Filter chapters by language (e.g., `en`)

#### Restrictions

> **IMPORTANT:**
> - **No monetization** — Cannot run ads or paid services on apps using this API.
> - **Must credit** MangaDex and scanlation groups.
> - **Must honor** content removal requests from groups.
> - **Must send** a unique, non-spoofed `User-Agent` header.
> - **No CORS** for third-party domains — web apps must proxy requests through their own server.

#### Verdict

✅ **Best choice for building a manga reader/downloader.** Massive library, active community, well-documented.

---

### 2. Jikan API (MyAnimeList Wrapper)

An unofficial but extremely popular REST wrapper around MyAnimeList data. Excellent for search and discovery (metadata only — no chapter images).

| Detail | Value |
|:---|:---|
| **Base URL** | `https://api.jikan.moe/v4` |
| **Docs** | [jikan.moe](https://jikan.moe) |
| **Type** | REST (JSON) |
| **Auth** | Not required |
| **Rate Limit** | 3 req/s, 60 req/min |
| **Data Cache** | 24 hours |

#### Key Endpoints

```
GET  /v4/manga                  # Search manga
GET  /v4/manga/{id}             # Get manga by MAL ID
GET  /v4/manga/{id}/characters  # Get characters
GET  /v4/manga/{id}/reviews     # Get reviews
GET  /v4/top/manga              # Top manga rankings
GET  /v4/genres/manga           # List all genres
```

#### Search Parameters

- `q` — Search query string
- `type` — `manga`, `novel`, `lightnovel`, `oneshot`, `doujin`, `manhwa`, `manhua`
- `status` — `publishing`, `complete`, `hiatus`, `discontinued`
- `order_by` — `title`, `start_date`, `score`, `chapters`
- `sort` — `asc` or `desc`
- `page`, `limit` — Pagination

#### Example

```
GET https://api.jikan.moe/v4/manga?q=one+piece&type=manga&status=publishing
```

#### Verdict

✅ **Best REST API for metadata and search.** No auth, easy to use, rich filtering. Does NOT provide chapter content.

---

### 3. AniList API (GraphQL)

A powerful GraphQL API covering both anime and manga. Excellent for developers who want precise, flexible queries.

| Detail | Value |
|:---|:---|
| **Endpoint** | `https://graphql.anilist.co` |
| **Docs** | [AniList API Docs](https://anilist.gitbook.io/anilist-apiv2-docs/) |
| **Type** | GraphQL (POST) |
| **Auth** | Not required for public queries |
| **Rate Limit** | ~90 req/min (generous) |

#### Example Query

```graphql
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      hasNextPage
    }
    media(search: $search, type: MANGA) {
      id
      title { romaji english native }
      description
      chapters
      volumes
      status
      genres
      coverImage { large }
      averageScore
    }
  }
}
```

**Variables:**
```json
{
  "search": "Attack on Titan",
  "page": 1,
  "perPage": 10
}
```

#### Verdict

✅ **Best for flexible metadata queries.** No over-fetching, great for building custom catalog UIs. Does NOT provide chapter content.

---

### 4. Kitsu API

A JSON:API-compliant database for anime and manga information including ratings, descriptions, and cover art.

| Detail | Value |
|:---|:---|
| **Base URL** | `https://kitsu.io/api/edge` |
| **Docs** | [Apiary](https://kitsu.docs.apiary.io/) / [GitHub Docs](https://hummingbird-me.github.io/api-docs) |
| **Type** | REST (JSON:API spec) |
| **Auth** | Not required for public reads |
| **Rate Limit** | Liberal |

#### Key Endpoints

```
GET  /manga                          # List/search manga
GET  /manga?filter[text]=naruto      # Search by keyword
GET  /manga/{id}                     # Get manga details
GET  /manga/{id}/relationships/genres # Get genres
```

> **NOTE:** R18 content requires authentication with an account that has mature content enabled.

#### Verdict

✅ **Good alternative for metadata.** JSON:API structure is well-standardized. Does NOT provide chapter content.

---

### 5. MyAnimeList Official API

The official MAL API. Requires registration but provides authoritative data.

| Detail | Value |
|:---|:---|
| **Base URL** | `https://api.myanimelist.net/v2` |
| **Docs** | [MAL API Config](https://myanimelist.net/apiconfig/references/api/v2) |
| **Type** | REST (JSON) |
| **Auth** | **Required** — `X-MAL-CLIENT-ID` header or OAuth 2.0 Bearer token |
| **Rate Limit** | ~3 req/s |

#### Key Endpoints

```
GET  /manga?q=naruto                 # Search manga
GET  /manga/{id}                     # Get manga details
GET  /manga/ranking                  # Get manga rankings
```

#### How to Get Credentials

1. Log in to [MyAnimeList](https://myanimelist.net)
2. Go to **Profile Settings → API**
3. Register a new application to get your Client ID

#### Verdict

⚠️ **Official but requires auth setup.** Best if you specifically need MAL data. Jikan is easier for the same data without auth.

---

## Tier 2 — Content APIs & Open-Source Tools

These provide actual chapter images and reading capabilities, either via hosted APIs or self-hosted solutions.

---

### 6. Manga Hook API

A free, open-source Node.js/Express API for fetching manga data including search, details, and chapter images.

| Detail | Value |
|:---|:---|
| **GitHub** | [kiraaziz/mangahook-api](https://github.com/kiraaziz/mangahook-api) |
| **Type** | REST (self-hosted) |
| **Auth** | Not required |
| **Stack** | Node.js / Express |

#### Key Endpoints

```
GET  /api/mangaList                  # List all manga
GET  /api/manga/{slug}              # Get manga details
GET  /api/manga/{slug}/{chapter}    # Get chapter images
GET  /api/search?q=keyword          # Search manga
```

#### Setup

```bash
git clone https://github.com/kiraaziz/mangahook-api
cd server
npm install
npm run start    # Runs on port 3000
```

#### Verdict

✅ **Good for quick prototyping** of reader apps. Simple to deploy. May break if upstream sources change.

---

### 7. Nyora Python SDK

A comprehensive Python SDK providing a unified interface to **360+ manga sources** with built-in health checking.

| Detail | Value |
|:---|:---|
| **GitHub** | [Nyora-Manga/nyora-python](https://github.com/Nyora-Manga/nyora-python) |
| **Install** | `pip install nyora` |
| **Type** | Python library (local) |
| **Sources** | 360+ manga, manhwa, manhua sources |

#### Features

- Search, browse, and read chapters from hundreds of sources
- Download content as `.cbz` files
- Health-checked sources (auto-skips broken ones)
- Cloud sync support
- AI-powered page translation (paid feature)

#### Usage Pattern

```python
# Typical flow:
# 1. Search → get manga list
# 2. Details → get chapter list
# 3. Pages → get image URLs for a chapter
```

#### Verdict

✅ **Most powerful aggregator.** Huge source coverage, active development. Runs locally — no API server needed. Best for building downloaders and library managers.

---

### 8. manga-scrapers (FastAPI)

A multi-source manga scraper built with FastAPI, providing a clean REST API over popular manga sites.

| Detail | Value |
|:---|:---|
| **GitHub** | [real-zephex/manga-scrapers](https://github.com/real-zephex/manga-scrapers) |
| **Type** | REST (self-hosted, FastAPI) |
| **Sources** | Manganato, Mangareader, Mangapill, Asurascans, Flamecomics |
| **Docs** | Auto-generated Swagger at `/docs` |

#### Features

- Search across multiple sources
- Get manga info, chapter lists, page images
- Categorized listings (latest, popular, etc.)
- Built-in interactive API docs

#### Verdict

✅ **Good for self-hosting a multi-source API.** May break if target sites change structure.

---

### 9. Suwayomi-Server (Tachiyomi/Mihon Compatible)

A standalone server that runs Mihon/Tachiyomi-compatible extensions, turning them into a usable backend service accessible via REST API.

| Detail | Value |
|:---|:---|
| **GitHub** | [Suwayomi/Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server) |
| **Type** | REST / GraphQL / OPDS (self-hosted) |
| **Auth** | Optional |
| **Sources** | All Mihon/Tachiyomi-compatible extensions (hundreds of sources) |

#### Features

- Runs Tachiyomi extensions on desktop/server (no Android needed)
- Provides REST & GraphQL APIs for programmatic access
- OPDS support for e-reader integration
- Browse, search, read, and download from any supported source
- Web UI included

#### Verdict

✅ **Most versatile self-hosted solution.** Access to the entire Tachiyomi extension ecosystem. Excellent for building a personal manga server.

---

## Tier 3 — Unofficial / Fragile Sources

> **WARNING:** These sources do not have official APIs. They may break without notice, may block your IP, and should be used as a last resort.

---

### 10. Comick.io (Unofficial)

No official public API. Community developers reverse-engineer internal endpoints.

- **Common Issues:** 403 Forbidden errors, IP blocks
- **Workaround:** Custom `User-Agent` and `Referer` headers
- **Stability:** ⚠️ Fragile — can break at any time

---

### 11. Other Scraping Targets

These sites have no official APIs but are commonly scraped by community tools:

| Site | Notes |
|:---|:---|
| Manganato | Popular target, frequently changes structure |
| Mangapill | Often targeted by scrapers |
| Asurascans | Fan translations, anti-bot measures |
| MangaFire | No developer API, internal requests only |
| MangaKakalot | Similar to Manganato |

> **CAUTION:** Scraping these sites may violate their Terms of Service. Always check `robots.txt` and implement respectful rate limiting.

---

## Recommended Strategy for a Manga Database App

### Recommended Combination

| Purpose | Primary | Fallback |
|:---|:---|:---|
| **Manga Search & Metadata** | AniList (GraphQL) or Jikan (REST) | Kitsu |
| **Chapter Content & Images** | MangaDex API | Suwayomi-Server or Nyora SDK |
| **Bulk Downloading** | Nyora SDK (`pip install nyora`) | manga-scrapers (FastAPI) |
| **Personal Server** | Suwayomi-Server | Manga Hook |

### Priority Order for Implementation

1. **MangaDex** — Start here. Largest free library with official API support.
2. **AniList or Jikan** — Add for richer metadata, search, and discovery.
3. **Nyora SDK** — Add as a fallback for titles not available on MangaDex.
4. **Suwayomi-Server** — Deploy if you need a persistent personal server with broad source coverage.

---

## Useful Links & Resources

| Resource | URL |
|:---|:---|
| MangaDex API Docs | https://api.mangadex.org/docs/ |
| MangaDex Swagger | https://api.mangadex.org/swagger.html |
| Jikan API Docs | https://jikan.moe |
| AniList API Docs | https://anilist.gitbook.io/anilist-apiv2-docs/ |
| Kitsu API Docs | https://kitsu.docs.apiary.io/ |
| MAL API Docs | https://myanimelist.net/apiconfig/references/api/v2 |
| Manga Hook GitHub | https://github.com/kiraaziz/mangahook-api |
| Nyora Python SDK | https://github.com/Nyora-Manga/nyora-python |
| manga-scrapers | https://github.com/real-zephex/manga-scrapers |
| Suwayomi-Server | https://github.com/Suwayomi/Suwayomi-Server |
| Mihon Extensions | https://github.com/keiyoushi/extensions |

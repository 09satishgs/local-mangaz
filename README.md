# Home Manga DB & Downloader

A full-stack Node.js + React desktop/web application for searching, bookmarking, downloading, and reading manga directly from your SSD.

---

## Features

1. **Pure Thick Black Theme**:
   - Removed all gradients, glows, and bright accent colors.
   - Clean, minimalist aesthetic (`#000000` pitch black background, `#09090b` zinc panels, subtle `#27272a` borders).

2. **Bookmark Feature**:
   - Track your favorite manga without downloading immediately.
   - Saved persistently to the database (`data/bookmarks.json`).
   - Switch between **Search Results** and **Bookmarks** tabs anytime.

3. **3 Dedicated Routes**:
   - **Home** (`#/home`): Search MangaDex, view details, bookmark favorites, select chapters, and queue downloads with the 4 req/sec safe limit.
   - **Progress** (`#/progress`): Real-time progress bar for currently downloading manga, chapter counts, page stats, and cancel controls.
   - **Read** (`#/read`): Local file explorer that browses your SSD download folder, displays chapter pages, and opens a full-screen offline image reader with 3-page desktop display or continuous vertical / swipe mobile reading.

4. **Hash Router (URL Persistence)**:
   - Uses `#/${route}` (`#/home`, `#/progress`, `#/read`) so page reloads or bookmarking URLs in your browser preserve the active route automatically.

5. **Mobile & Web Component Separation Architecture**:
   Layout and feature routes are cleanly separated into dedicated Web and Mobile views:
   ```text
   client/src/
   ├── layouts/
   │   ├── Layout.tsx      # Main layout controller
   │   ├── index.ts        # Barrel export
   │   └── views/
   │       ├── Web.tsx     # Desktop header bar with tab navigation
   │       └── Mobile.tsx  # Mobile top bar + fixed bottom app navigation
   ├── components/
   │   ├── Home/
   │   │   ├── Home.tsx    # Controller
   │   │   ├── hooks.ts    # Reusable state
   │   │   ├── index.ts
   │   │   └── views/
   │   │       ├── Web.tsx
   │   │       └── Mobile.tsx
   │   ├── Progress/
   │   │   ├── Progress.tsx
   │   │   ├── hooks.ts
   │   │   ├── index.ts
   │   │   └── views/
   │   │       ├── Web.tsx
   │   │       └── Mobile.tsx
   │   └── Read/
   │       ├── Read.tsx
   │       ├── hooks.ts
   │       ├── index.ts
   │       └── views/
   │           ├── Web.tsx    # 3-page desktop reader (keyboard nav, F for fullscreen)
   │           └── Mobile.tsx # Touch swiping + continuous vertical scroll mode
   ```
   _(You can test either layout on desktop using the Monitor / Smartphone toggle in the top navbar)._

---

## Configuration (`.env`)

You can customize paths and port in `.env`:
```env
PORT=1001

# Restrict folder browsing for image-based Read route to a specific directory
# Only files and subfolders inside this path will be accessible
READ_DIR=C:\ABC\XYZ

# Restrict folder browsing for CBZ comic archive route to a specific directory
# Only .cbz/.zip archives and subfolders inside this path will be accessible
CBZ_DIR=C:\ABC\XYZ\Comics
```
- If `READ_DIR` or `CBZ_DIR` are left blank or omitted, they default to the local `downloads` directory.
- Root boundaries prevent the user from navigating outside or above the designated folder (going up stops at the root directory, and requests outside return `403 Forbidden`).

---

## How to Run

### Development Mode (Concurrent Backend + Vite HMR)
```bash
npm run dev
```
- **Backend API**: [http://localhost:<PORT>](http://localhost:<PORT>)
- **Frontend App**: [http://localhost:5173/#/home](http://localhost:5173/#/home)

### Production Build & Start
```bash
# 1. Build the production React frontend
npm run build

# 2. Run the production server (serves API & pre-built static client)
npm start
```
- Access the production app at: [http://localhost:<PORT>/#/home](http://localhost:<PORT>/#/home)


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

## How to Run

From the root project folder (`root\home-manga-db`):

```bash
npm run dev
```

- **Express Backend**: [http://localhost:3001](http://localhost:3001)
- **React Frontend**: [http://localhost:5173/#/home](http://localhost:5173/#/home)

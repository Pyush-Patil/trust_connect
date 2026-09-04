# trust_connect — Plain JavaScript/JSX export

This folder is a **type-stripped, plain JS/JSX** copy of the trust_connect app
(the same app that lives in `src/` at the project root, which is written in
TypeScript/TSX). Use this folder if your own project is plain JavaScript and
you can't/don't want to use TypeScript.

It is **not** wired into this Vite project's build — it's just here for you to
copy into your own React project. Nothing here is imported by `src/App.tsx`,
so it has zero effect on this project's build.

## What's inside

```
jsx-export/
  index.html
  vite.config.js
  src/
    main.jsx
    App.jsx
    index.css
    utils/cn.js
    lib/types.js
    lib/api.js
    lib/mock.js
    context/AppContext.jsx
    components/ui.jsx
    components/cards.jsx
    components/Layout.jsx
    components/ApiDrawer.jsx
    components/AiHelp.jsx
    pages/Home.jsx
    pages/Professionals.jsx
    pages/ProfessionalDetail.jsx
    pages/Auth.jsx
    pages/Dashboard.jsx
    pages/Admin.jsx
```

All files use **relative imports** (`../lib/api`, `./ui`, etc.) instead of the
`@/...` alias, so they'll work in any Vite React project without extra config.
An optional `@` alias is still set up in `vite.config.js` in case you prefer it.

## 1. Copy the files

Copy everything under `jsx-export/src/` into your project's `src/` folder
(merge folders if you already have `components/`, `pages/`, etc.). Copy
`index.html`'s `<head>` contents (fonts, title, favicon) into your own
`index.html`, and make sure it points at `/src/main.jsx`.

## 2. Install dependencies

```bash
npm install react react-dom react-router-dom clsx tailwind-merge
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite
```

If you're on Create React App or another non-Vite tool, you'll need
Tailwind's CLI/PostCSS setup instead of `@tailwindcss/vite` — see
https://tailwindcss.com/docs/installation for the alternative.

## 3. Tailwind CSS v4

`src/index.css` already contains:

```css
@import "tailwindcss";

@theme { ... }
```

This is plain CSS (Tailwind v4's CSS-first config), so it works unchanged.
Just make sure `index.css` is imported once, from `main.jsx` (already done).

## 4. Vite config

Use the provided `vite.config.js` (or merge its `plugins`/`resolve.alias`
into your existing config):

```js
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

## 5. Run it

```bash
npm run dev
```

The app boots straight into a **fully working demo mode** — no backend
required. It uses a mock API (`src/lib/mock.js`) backed by `localStorage` that
mirrors your FastAPI Swagger routes exactly (`/auth/login`, `/search`,
`/bookings`, `/admin/*`, `/reviews`, `/notification`, `/ai/troubleshoot`,
`/db-test`, etc).

Demo logins (password `demo123` for all):
- `anya@demo.in` — customer
- `ravi@demo.in` — professional
- `admin@trustconnect.in` — admin

## 6. Connect your real backend

Open the app, click the connection pill in the header (or "API connection" in
the footer/user menu), and paste your FastAPI base URL
(e.g. `http://localhost:8000`). From then on every screen calls your real
endpoints; if a request fails or the server is unreachable, the UI
automatically falls back to the bundled demo data so nothing breaks.

You can also hardcode the base URL by calling `setBase("http://localhost:8000")`
from `src/lib/api.js` once at startup, or by editing the `LS_BASE` default.

## Notes on the conversion from TypeScript

- All `interface`/`type` declarations were removed (their shapes are
  documented as comments in `src/lib/types.js`).
- All type annotations, generics (`useState<T>`), and `as Type` casts were
  stripped — the runtime logic is otherwise **identical** to the TSX version.
- `.tsx` → `.jsx`, `.ts` → `.js`.
- Imports changed from the `@/` alias to relative paths for drop-in
  compatibility with any Vite React setup.

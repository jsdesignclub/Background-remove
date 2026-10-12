# Background Remover

A simple React (Vite) web app that removes image backgrounds entirely in the browser and lets you download a clean transparent PNG.

## Features

- Drag & drop or browse to upload an image
- Background removal runs 100% client-side via `@imgly/background-removal` (no API key, no server uploads)
- Before/after preview with transparency checkerboard
- Download the result as a PNG

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run preview
```
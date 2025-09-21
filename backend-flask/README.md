# Backend (Flask + yt-dlp)

A lightweight Flask API that wraps `yt-dlp` and `ffmpeg` for extracting info and downloading video/audio.

## Endpoints

- `GET /health` — health/status
- `POST /extract` — body: `{ "url": "https://..." }` → returns metadata (title, formats, etc.)
- `GET /download?url=...&kind=video|audio&quality=1080&vext=mp4&aext=mp3&filename=OptionalCustomName`

Notes:
- `kind=video` merges best video up to requested `quality` with best audio (container via `vext`, e.g., `mp4` or `mkv`).
- `kind=audio` extracts best audio and converts to `aext` (e.g., `mp3`, `m4a`, `opus`).
- Temporary files are cleaned after the response finishes sending.

## Prereqs

- Python 3.10+
- `ffmpeg` available on PATH
- (Optional) A virtualenv

## Setup

```bash
cd backend-flask
cp .env.example .env
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run (Dev)

```bash
# From backend-flask/
python app.py
# API at http://localhost:5000
```

## Run (Prod-ish)

```bash
# From backend-flask/
gunicorn app:app --bind 0.0.0.0:5000 --workers 2 --timeout 180
```

## CORS

CORS is open by default for flexibility during development. For production, limit origins using a proxy or configure allowed origins.
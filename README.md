# YT-download

A simple two-part app:
- `backend-flask/`: Flask API wrapping `yt-dlp` + `ffmpeg`
- `web/`: Static frontend that calls the API

## Quick start

Backend:
```bash
cd backend-flask
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
# -> http://localhost:5000
```

Frontend:
- Serve `web/` with any static server (or open `web/index.html` directly).
- Set the API base in the UI to your Flask endpoint (default `http://localhost:5000`).

## Notes
- Ensure `ffmpeg` is installed and in PATH.
- CORS is open for dev; restrict in production via reverse proxy or by adjusting the backend.

import os
import mimetypes
from typing import Optional

from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS
from dotenv import load_dotenv

from yt_service import (
    extract_info_for_url,
    download_video_or_audio,
)

load_dotenv()

APP_VERSION = "1.0.0"

app = Flask(__name__)
# If you always use the Node proxy, CORS isn't necessary; left enabled for local dev flexibility.
CORS(app, resources={r"/*": {"origins": "*"}})

@app.get("/health")
def health():
    return jsonify({"status": "ok", "version": APP_VERSION})

@app.post("/extract")
def extract():
    payload = request.get_json(silent=True) or {}
    url = payload.get("url")
    if not url or not isinstance(url, str):
        abort(400, description="Missing or invalid 'url'")
    try:
        info = extract_info_for_url(url)
        return jsonify(info)
    except Exception as e:
        abort(500, description=f"Extraction failed: {e}")

@app.get("/download")
def download():
    url = request.args.get("url", type=str)
    if not url:
        abort(400, description="Missing 'url'")

    kind = request.args.get("kind", default="video", type=str)
    if kind not in ("video", "audio"):
        abort(400, description="Invalid 'kind' (video|audio)")

    quality = request.args.get("quality", default=1080, type=int)
    vext = request.args.get("vext", default="mp4", type=str).lower()
    aext = request.args.get("aext", default="mp3", type=str).lower()
    filename: Optional[str] = request.args.get("filename", type=str)

    try:
        path, final_name = download_video_or_audio(
            url=url,
            kind=kind,
            quality=quality,
            vext=vext,
            aext=aext,
            custom_filename=filename,
        )
        mime, _ = mimetypes.guess_type(final_name)
        media_type = mime or ("video/mp4" if kind == "video" else "audio/mpeg")

        # Use call_on_close to clean up temp file/dir after the response is sent
        response = send_file(
            path,
            mimetype=media_type,
            as_attachment=True,
            download_name=final_name,
            conditional=True,
            max_age=0,
            etag=None,
            last_modified=None,
        )

        def _cleanup():
            try:
                if os.path.exists(path):
                    os.remove(path)
                parent = os.path.dirname(path)
                if parent and os.path.isdir(parent) and not os.listdir(parent):
                    os.rmdir(parent)
            except Exception:
                pass

        # Register cleanup hook
        response.call_on_close(_cleanup)
        return response
    except Exception as e:
        abort(500, description=f"Download failed: {e}")

if __name__ == "__main__":
    # Dev server. For production, run via gunicorn (see systemd unit).
    app.run(host="0.0.0.0", port=5000, debug=False)

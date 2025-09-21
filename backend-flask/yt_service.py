import os
import re
import tempfile
import time
from pathlib import Path
from typing import Dict, Tuple, Optional, Any, List

import yt_dlp

def _sanitize_filename(name: str, max_len: int = 200) -> str:
    # Replace disallowed characters with underscores and trim
    name = re.sub(r"[^\w\-. ]+", "_", name).strip()
    # Collapse multiple underscores/spaces
    name = re.sub(r"[ _]+", " ", name)
    # Limit length
    if len(name) > max_len:
        name = name[:max_len].rstrip(" ._-")
    return name or "download"

def extract_info_for_url(url: str) -> Dict[str, Any]:
    """
    Use yt-dlp to extract metadata without downloading.
    Returns a JSON-serializable dictionary focusing on useful fields.
    """
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "skip_download": True,
        "extract_flat": False,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    # Transform formats into a compact subset that is easy for a UI to consume
    formats: List[Dict[str, Any]] = []
    for f in info.get("formats", []):
        formats.append(
            {
                "format_id": f.get("format_id"),
                "ext": f.get("ext"),
                "vcodec": f.get("vcodec"),
                "acodec": f.get("acodec"),
                "abr": f.get("abr"),
                "tbr": f.get("tbr"),
                "fps": f.get("fps"),
                "height": f.get("height"),
                "width": f.get("width"),
                "filesize": f.get("filesize") or f.get("filesize_approx"),
                "format_note": f.get("format_note"),
                "container": f.get("container"),
            }
        )

    result = {
        "id": info.get("id"),
        "title": info.get("title"),
        "uploader": info.get("uploader"),
        "channel": info.get("channel"),
        "channel_url": info.get("channel_url"),
        "duration": info.get("duration"),
        "webpage_url": info.get("webpage_url"),
        "thumbnails": info.get("thumbnails", []),
        "view_count": info.get("view_count"),
        "like_count": info.get("like_count"),
        "formats": formats,
        "extractor_key": info.get("extractor_key"),
        "live_status": info.get("live_status"),
        "is_live": info.get("is_live"),
    }
    return result

def _find_latest_file(directory: Path) -> Optional[Path]:
    candidates = list(directory.glob("*"))
    if not candidates:
        return None
    # Sort by modification time, newest first
    candidates.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return candidates[0]

def download_video_or_audio(
    url: str,
    kind: str = "video",
    quality: int = 1080,
    vext: str = "mp4",
    aext: str = "mp3",
    custom_filename: Optional[str] = None,
) -> Tuple[str, str]:
    """
    Download the specified URL as video or audio and return a tuple:
      (absolute_file_path, final_download_filename)
    """
    tmp_root = Path(tempfile.mkdtemp(prefix="yt_dl_"))
    outtmpl = str(tmp_root / "%(title).200B.%(ext)s")

    # Common options
    ydl_opts: Dict[str, Any] = {
        "outtmpl": outtmpl,
        "restrictfilenames": True,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "postprocessors": [],
        "merge_output_format": None,
    }

    if kind == "video":
        # Choose best video up to requested height + best audio, then merge to desired container
        ydl_opts["format"] = f"bestvideo[height<={quality}][ext={vext}]+bestaudio/best"
        ydl_opts["merge_output_format"] = vext
        # Let yt-dlp/ffmpeg do the mux
        # Add metadata as well
        ydl_opts["postprocessors"].append({"key": "FFmpegMetadata"})
    else:
        # Audio-only: extract best audio and convert to the requested codec
        ydl_opts["format"] = "bestaudio/best"
        ydl_opts["postprocessors"].extend(
            [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": aext,
                    "preferredquality": "0",  # best
                },
                {"key": "FFmpegMetadata"},
            ]
        )

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    # Try to determine output path
    # 1) Some versions expose 'requested_downloads' with 'filepath'
    output_path: Optional[Path] = None
    requested = info.get("requested_downloads")
    if requested and isinstance(requested, list):
        for item in requested:
            fp = item.get("filepath")
            if fp and Path(fp).exists():
                output_path = Path(fp)
                break

    # 2) Fallback to scanning temp dir for newest file
    if output_path is None or not output_path.exists():
        time.sleep(0.2)  # tiny delay in case of fs sync
        latest = _find_latest_file(tmp_root)
        if latest:
            output_path = latest

    if output_path is None or not output_path.exists():
        raise RuntimeError("Download finished but no output file was found.")

    # Final filename exposed to the client
    ext = output_path.suffix.lstrip(".")
    if custom_filename:
        safe = _sanitize_filename(custom_filename)
        final_name = f"{safe}.{ext}"
        final_path = output_path.with_name(final_name)
        try:
            output_path.rename(final_path)
            output_path = final_path
        except Exception:
            # If rename fails, keep original file and filename
            final_name = output_path.name
    else:
        final_name = output_path.name

    return (str(output_path.resolve()), final_name)

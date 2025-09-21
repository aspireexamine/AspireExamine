from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
from urllib.parse import urlparse, parse_qs, quote
from urllib.request import Request, urlopen
import json
try:
    import yt_dlp  # type: ignore
    YTDLP_AVAILABLE = True
except Exception:
    YTDLP_AVAILABLE = False
try:
    from pytube import YouTube
    PYTUBE_AVAILABLE = True
except Exception:
    PYTUBE_AVAILABLE = False

app = FastAPI()

# CORS for local dev and deployed clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",  # relax as needed or restrict in production
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


class Body(BaseModel):
    url: str


def extract_id(input_str: str) -> Optional[str]:
    try:
        u = urlparse(input_str)
        host = (u.hostname or "").lower()
        if "youtube" in host or "youtube-nocookie" in host:
            vid = parse_qs(u.query).get("v", [None])[0]
            return vid
        if host == "youtu.be":
            return (u.path or "/").lstrip("/").split("/")[0]
    except Exception:
        pass
    # raw ID fallback
    import re
    m = re.search(r"[A-Za-z0-9_-]{11}", input_str)
    return m.group(0) if m else None


def join_segments(transcript: List[dict]) -> str:
    return " ".join([s.get("text", "") for s in transcript]).replace("\n", " ").strip()


def _timedtext_fallback(video_id: str, preferred: List[str]) -> Optional[str]:
    headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "referer": "https://www.youtube.com/",
    }
    def clean_text(raw: str) -> str:
        import re
        # remove VTT header lines
        raw = re.sub(r"^\uFEFF?WEBVTT.*(?:\r?\n.*)*?\r?\n", "", raw, flags=re.IGNORECASE)
        # remove inline time tags like <00:00:07.040>
        raw = re.sub(r"<\d{2}:\d{2}:\d{2}\.\d{3}>", "", raw)
        # remove simple styling tags
        raw = raw.replace("<c>", "").replace("</c>", "")
        # remove any leftover html-like tags
        raw = re.sub(r"</?\w+[^>]*>", "", raw)
        # remove stray header tokens that sometimes leak into lines
        raw = re.sub(r"\bKind:\s*\w+", "", raw, flags=re.IGNORECASE)
        raw = re.sub(r"\bLanguage:\s*[A-Za-z-]+", "", raw, flags=re.IGNORECASE)
        # collapse spaces
        return re.sub(r"\s+", " ", raw).strip()

    def parse_vtt(vtt: str) -> str:
        import re
        lines = []
        for line in vtt.splitlines():
            line = line.strip()
            if not line or line.isdigit() or "-->" in line or line.upper().startswith("WEBVTT") or line.lower().startswith("kind:") or line.lower().startswith("language:"):
                continue
            line = clean_text(line)
            if line:
                lines.append(line)
        return " ".join(lines).strip()

    for lang in preferred:
        for kind in ["", "asr"]:
            for fmt in ["json3", "vtt"]:
                url = f"https://www.youtube.com/api/timedtext?v={quote(video_id)}&lang={quote(lang)}"
                if kind:
                    url += f"&kind={kind}"
                url += f"&fmt={fmt}"
                try:
                    req = Request(url, headers=headers)
                    with urlopen(req, timeout=10) as resp:
                        raw = resp.read().decode("utf-8", errors="ignore").strip()
                        if not raw:
                            continue
                        if fmt == "vtt":
                            text = parse_vtt(raw)
                            if text:
                                return text
                        else:
                            try:
                                data = json.loads(raw)
                                events = data.get("events") or []
                                parts = []
                                for ev in events:
                                    for s in (ev.get("segs") or []):
                                        t = s.get("utf8")
                                        if isinstance(t, str):
                                            parts.append(t)
                                text = "".join(parts).replace("\n", " ")
                                text = clean_text(text)
                                if text:
                                    return text
                            except Exception:
                                continue
                except Exception:
                    continue
    return None


def _ytdlp_fallback(video_id: str, preferred: List[str]) -> Optional[str]:
    if not YTDLP_AVAILABLE:
        return None
    # Use yt-dlp to find caption URLs, then fetch VTT/JSON and parse
    ydl_opts = {
        'skip_download': True,
        'quiet': True,
        'nocheckcertificate': True,
        'noplaylist': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f'https://www.youtube.com/watch?v={video_id}', download=False)
        # Prefer manual subtitles, then automatic
        for key in ['subtitles', 'automatic_captions']:
            tracks = info.get(key) or {}
            # build ordered languages per preference then all
            langs = [l for l in preferred if l in tracks]
            for l in tracks.keys():
                if l not in langs:
                    langs.append(l)
            for lang in langs:
                formats = tracks.get(lang) or []
                # prefer vtt then json3
                sorted_formats = sorted(formats, key=lambda f: (f.get('ext') != 'vtt', f.get('ext') != 'json3'))
                for fmt in sorted_formats:
                    url = fmt.get('url')
                    ext = fmt.get('ext')
                    if not url:
                        continue
                    try:
                        req = Request(url, headers={
                            'user-agent': 'Mozilla/5.0',
                            'accept-language': 'en-US,en;q=0.9',
                            'accept': '*/*'
                        })
                        with urlopen(req, timeout=10) as resp:
                            raw = resp.read().decode('utf-8', errors='ignore')
                        if not raw:
                            continue
                        if ext == 'vtt':
                            text = raw
                            # reuse simple VTT parser from timedtext
                            lines = []
                            for line in text.splitlines():
                                line = line.strip()
                                if not line or line.isdigit() or '-->' in line or line.upper().startswith('WEBVTT'):
                                    continue
                                line = clean_text(line)
                                if line:
                                    lines.append(line)
                            joined = ' '.join(lines).replace('  ', ' ').strip()
                            if joined:
                                return joined
                        else:
                            try:
                                data = json.loads(raw)
                                events = data.get('events') or []
                                parts = []
                                for ev in events:
                                    for s in (ev.get('segs') or []):
                                        t = s.get('utf8')
                                        if isinstance(t, str):
                                            parts.append(t)
                                joined = ''.join(parts).replace('\n', ' ').replace('  ', ' ').strip()
                                if joined:
                                    return joined
                            except Exception:
                                continue
                    except Exception:
                        continue
    except Exception:
        return None
    return None


@app.post("/youtube-transcript")
def youtube_transcript(body: Body):
    video_id = extract_id(body.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL/ID")

    preferred = ["en", "en-US", "en-GB", "hi", "hi-IN"]

    try:
        if hasattr(YouTubeTranscriptApi, "list_transcripts"):
            transcripts = YouTubeTranscriptApi.list_transcripts(video_id)

            # 1) Try manually created in preferred languages
            for code in preferred:
                try:
                    t = transcripts.find_manually_created_transcript([code])
                    return {"text": join_segments(t.fetch()), "source": "manual", "videoId": video_id}
                except Exception:
                    pass

            # 2) Try auto-generated in preferred languages
            for code in preferred:
                try:
                    t = transcripts.find_generated_transcript([code])
                    return {"text": join_segments(t.fetch()), "source": "auto", "videoId": video_id}
                except Exception:
                    pass

            # 3) Translate first available to English
            try:
                any_codes = [t.language_code for t in transcripts]
                any_t = transcripts.find_transcript(any_codes)
                tr_en = any_t.translate("en")
                return {"text": join_segments(tr_en.fetch()), "source": "translated", "videoId": video_id}
            except Exception:
                pass
        else:
            # Older library support: direct get_transcript with language preferences
            for code in preferred:
                try:
                    tr = YouTubeTranscriptApi.get_transcript(video_id, languages=[code])
                    return {"text": join_segments(tr), "source": "api", "videoId": video_id}
                except Exception:
                    pass
            try:
                tr = YouTubeTranscriptApi.get_transcript(video_id)
                return {"text": join_segments(tr), "source": "api", "videoId": video_id}
            except Exception:
                pass

        # Library didn't return a transcript; try yt-dlp then timedtext
        text = _ytdlp_fallback(video_id, preferred)
        if text:
            return {"text": text, "source": "ytdlp", "videoId": video_id}
        text = _timedtext_fallback(video_id, preferred)
        if text:
            return {"text": text, "source": "timedtext", "videoId": video_id}
        raise HTTPException(status_code=404, detail="No captions available")

    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable) as e:
        # Try yt-dlp then timedtext even if exceptions
        text = _ytdlp_fallback(video_id, preferred)
        if text:
            return {"text": text, "source": "ytdlp", "videoId": video_id}
        text = _timedtext_fallback(video_id, preferred)
        if text:
            return {"text": text, "source": "timedtext", "videoId": video_id}
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/youtube-audio-url")
def youtube_audio_url(body: Body):
    video_id = extract_id(body.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL/ID")
    if not PYTUBE_AVAILABLE:
        raise HTTPException(status_code=501, detail="pytube not installed on server")
    try:
        yt = YouTube(f"https://www.youtube.com/watch?v={video_id}")
        stream = yt.streams.filter(only_audio=True).order_by("abr").desc().first()
        if not stream:
            raise HTTPException(status_code=404, detail="No audio stream found")
        return {"videoId": video_id, "audioUrl": stream.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



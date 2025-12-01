# YouTube Transcript API Service

This is a FastAPI service that provides YouTube transcript and audio URL extraction functionality.

## Features

- Extract YouTube video transcripts using multiple fallback methods
- Get YouTube audio stream URLs
- Support for multiple languages
- Robust error handling with fallback mechanisms

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the service:
```bash
python main.py
```

The service will start on `http://localhost:8000`

## API Endpoints

### POST /youtube-transcript
Extract transcript from a YouTube video.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "text": "transcript text...",
  "source": "manual|auto|translated|api|ytdlp|timedtext",
  "videoId": "VIDEO_ID"
}
```

### POST /youtube-audio-url
Get audio stream URL from a YouTube video.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "videoId": "VIDEO_ID",
  "audioUrl": "https://audio-stream-url"
}
```

## Dependencies

- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `youtube-transcript-api` - YouTube transcript extraction
- `pytube` - YouTube video/audio extraction
- `yt-dlp` - Alternative YouTube extraction (more reliable)

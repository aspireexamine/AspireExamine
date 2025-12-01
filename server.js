import express from 'express';
import cors from 'cors';

// This is a simple Express server that will run alongside Vite in development
// It proxies requests to the Python FastAPI service for YouTube audio extraction

const app = express();
const port = 3001; // Using a different port from Vite
const PYTHON_API_URL = 'http://localhost:8000'; // Python FastAPI service URL

app.use(express.json());
app.use(cors()); // Enable CORS for requests from your Vite dev server

// Simple URL validation function
function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
  return youtubeRegex.test(url);
}

app.post('/api/get-audio-url', async (req, res) => {
  const { youtubeUrl } = req.body;

  if (!youtubeUrl || !isValidYouTubeUrl(youtubeUrl)) {
    return res.status(400).json({ error: 'Invalid or missing YouTube URL' });
  }

  try {
    // Proxy the request to the Python FastAPI service
    const response = await fetch(`${PYTHON_API_URL}/youtube-audio-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: youtubeUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const statusCode = response.status === 503 ? 503 : 500;
      return res.status(statusCode).json({ 
        error: errorData.detail || 'Failed to retrieve audio stream URL.',
        service: 'python-api'
      });
    }

    const data = await response.json();
    res.json({ audioUrl: data.audioUrl });
  } catch (error) {
    console.error('Error fetching YouTube info:', error);
    res.status(500).json({ error: 'Failed to retrieve audio stream URL. Make sure the Python service is running.' });
  }
});

app.listen(port, () => {
  console.log(`YouTube proxy server listening on http://localhost:${port}`);
});
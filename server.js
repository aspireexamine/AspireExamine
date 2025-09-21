import express from 'express';
import ytdl from 'ytdl-core';
import cors from 'cors';

// This is a simple Express server that will run alongside Vite in development
// It's sole purpose is to extract the audio stream URL from a YouTube link

const app = express();
const port = 3001; // Using a different port from Vite

app.use(express.json());
app.use(cors()); // Enable CORS for requests from your Vite dev server

app.post('/api/get-audio-url', async (req, res) => {
  const { youtubeUrl } = req.body;

  if (!youtubeUrl || !ytdl.validateURL(youtubeUrl)) {
    return res.status(400).json({ error: 'Invalid or missing YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(youtubeUrl);
    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    if (!audioFormat) {
      return res.status(404).json({ error: 'No suitable audio format found for this video.' });
    }

    res.json({ audioUrl: audioFormat.url });
  } catch (error) {
    console.error('Error fetching YouTube info:', error);
    res.status(500).json({ error: 'Failed to retrieve audio stream URL.' });
  }
});

app.listen(port, () => {
  console.log(`YouTube proxy server listening on http://localhost:${port}`);
});
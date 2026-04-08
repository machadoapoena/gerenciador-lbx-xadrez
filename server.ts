import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy for Chess-Results
  app.get('/api/proxy-chess-results', async (req, res) => {
    const { id, art } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    // art=0 is starting list, art=1 is final ranking
    const artValue = art || '0';
    const url = `https://chess-results.com/tnr${id}.aspx?lan=1&zeilen=0&art=${artValue}&prt=4&excel=2010`;
    
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.send(response.data);
    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch data from Chess-Results' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

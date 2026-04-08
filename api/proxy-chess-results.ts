import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    return res.send(response.data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch data from Chess-Results' });
  }
}

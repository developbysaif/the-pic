import https from 'node:https';

async function searchImages() {
  const query = 'male model standing full body white background studio chinos';
  
  https.get(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  }, res => {
    let html = '';
    res.on('data', c => html += c);
    res.on('end', () => {
      const vqdMatch = html.match(/vqd=([a-zA-Z0-9_-]+)/);
      if (!vqdMatch) {
        console.log('No vqd found');
        return;
      }
      const vqd = vqdMatch[1];
      console.log('VQD:', vqd);
      
      const imgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`;
      https.get(imgUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      }, res2 => {
        let jsonStr = '';
        res2.on('data', c => jsonStr += c);
        res2.on('end', () => {
          try {
            const data = JSON.parse(jsonStr);
            const results = data.results?.slice(0, 15).map(r => ({
              title: r.title,
              image: r.image,
              width: r.width,
              height: r.height
            }));
            console.log('Results:', JSON.stringify(results, null, 2));
          } catch (e) {
            console.log('JSON parse error:', e.message);
          }
        });
      });
    });
  });
}

searchImages().catch(console.error);

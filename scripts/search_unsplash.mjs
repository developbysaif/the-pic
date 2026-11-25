import https from 'node:https';

async function search() {
  const query = encodeURIComponent('site:unsplash.com/photos/ "male model" standing');
  https.get(`https://html.duckduckgo.com/html/?q=${query}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    let html = '';
    res.on('data', c => html += c);
    res.on('end', () => {
      // Find all photo slugs like /photos/handsome-man-... or /photos/1234abcd
      const matches = html.match(/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)/g);
      console.log('Found:', matches ? Array.from(new Set(matches)).slice(0, 15) : 'none');
    });
  });
}

search();

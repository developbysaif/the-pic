import https from 'node:https';

https.get('https://remanence.co/products/buzo-cuello-alto-shadow-negro', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const m = data.match(/https?:\/\/[^"'\s]+\.(?:jpg|png|webp)/gi);
    if (m) {
      const filtered = Array.from(new Set(m.filter(x => x.includes('cdn/shop'))));
      console.log('Images found:', filtered.slice(0, 10));
    }
  });
});

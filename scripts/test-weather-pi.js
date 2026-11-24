const https = require('https');
const url = 'https://api.open-meteo.com/v1/forecast?latitude=55.6795&longitude=37.7448&current=temperature_2m';

fetch(url, { signal: AbortSignal.timeout(15000) })
  .then((r) => r.json())
  .then((d) => console.log('fetch ok', d.current))
  .catch((e) => console.error('fetch fail', e.message));

https.get(url, { timeout: 15000 }, (res) => {
  let b = '';
  res.on('data', (c) => (b += c));
  res.on('end', () => {
    try {
      console.log('https ok', JSON.parse(b).current);
    } catch (e) {
      console.error('https parse', e.message);
    }
  });
}).on('error', (e) => console.error('https fail', e.message));
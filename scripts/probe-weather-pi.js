const tests = [
  ['open-meteo', 'https://api.open-meteo.com/v1/forecast?latitude=55.6795&longitude=37.7448&current=temperature_2m,relative_humidity_2m'],
  ['metno', 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=55.6795&lon=37.7448'],
  ['7timer', 'https://www.7timer.info/bin/api.pl?lon=37.74&lat=55.68&product=civil&output=json']
];
(async () => {
  for (const [id, url] of tests) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Polivayka/1.0 github.com/Duneholy' },
        signal: AbortSignal.timeout(12000)
      });
      const t = await r.text();
      console.log(id, r.status, t.slice(0, 80).replace(/\s+/g, ' '));
    } catch (e) {
      console.log(id, 'ERR', e.message);
    }
  }
})();

const tests = [
  {
    id: 'open-meteo',
    url: 'https://api.open-meteo.com/v1/forecast?latitude=55.6795&longitude=37.7448&current=temperature_2m,relative_humidity_2m',
    pick: (j) => j.current && [j.current.temperature_2m, j.current.relative_humidity_2m]
  },
  {
    id: 'metno',
    url: 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=55.6795&lon=37.7448',
    headers: { 'User-Agent': 'Polivayka/1.0 github.com/Duneholy' },
    pick: (j) => {
      const d = j.properties.timeseries[0].data.instant.details;
      return [d.air_temperature, d.relative_humidity];
    }
  },
  {
    id: '7timer',
    url: 'https://www.7timer.info/bin/api.pl?lon=37.74&lat=55.68&product=civil&output=json',
    pick: (j) => {
      const d = j.dataseries[0];
      return [d.temp2m, d.rh2m];
    }
  },
  {
    id: 'wttr',
    url: 'https://wttr.in/55.6795,37.7448?format=j1',
    headers: { 'User-Agent': 'curl/8.0' },
    pick: (j) => {
      const c = j.current_condition[0];
      return [c.temp_C, c.humidity];
    }
  },
  {
    id: 'openweather-nokey',
    url: 'https://api.openweathermap.org/data/2.5/weather?lat=55.68&lon=37.74&units=metric',
    pick: (j) => j.main && [j.main.temp, j.main.humidity]
  }
];

(async () => {
  for (const t of tests) {
    const started = Date.now();
    try {
      const r = await fetch(t.url, { headers: t.headers || {}, signal: AbortSignal.timeout(10000) });
      const text = await r.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = null; }
      const got = parsed ? t.pick(parsed) : null;
      console.log(t.id, r.status, got ? `temp=${got[0]} hum=${got[1]}` : text.slice(0, 120).replace(/\s+/g, ' '), `${Date.now() - started}ms`);
    } catch (e) {
      console.log(t.id, 'ERR', e.message, `${Date.now() - started}ms`);
    }
  }
})();

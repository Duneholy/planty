// Источники, которые с этого компьютера вернули и температуру, и влажность.
// 7Timer отвечает, но без CORS, а с Raspberry Pi исходящий HTTPS обрывается —
// в список его нет, чтобы выбор в настройках не вёл на пустую карточку.
const PROVIDERS = [
  { id: 'open-meteo', name: 'Open-Meteo', place: 'Швейцария' },
  { id: 'met-no', name: 'MET Norway', place: 'Норвегия' },
  { id: 'wttr', name: 'wttr.in', place: 'Великобритания' }
];

function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

async function fetchJson(url, headers) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.reason || data.error || `HTTP ${r.status}`);
      return data;
    } catch (e) {
      lastErr = e;
      if (attempt < 2) await new Promise((res) => setTimeout(res, 400 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function fetchOpenMeteo(lat, lon) {
  const data = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`
  );
  if (!data.current) throw new Error('Open-Meteo: нет current');
  return { temp: round1(data.current.temperature_2m), hum: Math.round(data.current.relative_humidity_2m) };
}

async function fetchMetNo(lat, lon) {
  const data = await fetchJson(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
    { 'User-Agent': 'Planty/1.0 github.com/Duneholy/planty' }
  );
  const details = data.properties.timeseries[0].data.instant.details;
  return { temp: round1(details.air_temperature), hum: Math.round(details.relative_humidity) };
}

async function fetchWttr(lat, lon) {
  const data = await fetchJson(`https://wttr.in/${lat},${lon}?format=j1`, { 'User-Agent': 'Planty/1.0 github.com/Duneholy/planty' });
  const current = data.current_condition && data.current_condition[0];
  if (!current) throw new Error('wttr.in: нет current_condition');
  return { temp: round1(current.temp_C), hum: Math.round(Number(current.humidity)) };
}

async function fetchWeather(provider, lat, lon) {
  if (provider === 'met-no') return fetchMetNo(lat, lon);
  if (provider === 'wttr') return fetchWttr(lat, lon);
  return fetchOpenMeteo(lat, lon);
}

module.exports = { PROVIDERS, fetchWeather };

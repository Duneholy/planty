#!/usr/bin/env node
/* Собирает public/i18n-care-data.js — только английский */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const https = require('https');

const root = path.join(__dirname, '..');
const out = path.join(root, 'public', 'i18n-care-data.js');
const cacheFile = path.join(root, 'lib', 'plant-care-en-cache.json');
const { PLANT_CARE } = require(path.join(root, 'lib', 'plant-care'));

function rowFromCare(c) {
  return [
    c.lightShort,
    c.lightFull,
    c.humidityFull,
    c.temperatureFull,
    c.extra,
    ...(c.careTips || [])
  ];
}

function loadPartialEn() {
  const file = path.join(root, 'lib', 'plant-care-i18n-packs.partial.json');
  if (!fs.existsSync(file)) return {};
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const out = {};
  Object.keys(data).forEach((id) => {
    if (data[id] && data[id].en) out[id] = data[id].en;
  });
  return out;
}

function loadScratchEn() {
  const packs = loadPartialEn();
  const dir = path.join(root, 'public');
  const files = ['_care_body.js', '_care_c.js', '_care_d.js', '_care_e.js'].filter((f) =>
    fs.existsSync(path.join(dir, f))
  );
  const sandbox = {
    putCare(id, data) {
      if (data.en) packs[id] = data.en;
    }
  };
  const ctx = vm.createContext(sandbox);
  files.forEach((f) => {
    vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
  });
  return packs;
}

function loadCache() {
  if (!fs.existsSync(cacheFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  } catch (_) {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf8');
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Planty/1.0' } }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(String(res.statusCode)));
        }
        resolve(raw);
      });
    }).on('error', reject);
  });
}

async function googleTranslate(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const raw = await httpsGet(url);
  const data = JSON.parse(raw);
  const parts = (data[0] || []).map((p) => p[0]).join('');
  if (!parts) throw new Error('empty');
  return parts;
}

async function myMemory(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|en`;
  const raw = await httpsGet(url);
  const data = JSON.parse(raw);
  if (String(data.responseStatus) === '429') throw new Error('429');
  const outText = data && data.responseData && data.responseData.translatedText;
  if (!outText) throw new Error('empty');
  return outText;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translatePiece(text) {
  const translators = [googleTranslate, myMemory];
  for (const fn of translators) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const out = await fn(text);
        await sleep(400);
        return out;
      } catch (e) {
        const wait = e.message === '429' ? 90000 : 1500 * (attempt + 1);
        if (attempt === 3) break;
        await sleep(wait);
      }
    }
  }
  throw new Error('translate failed');
}

async function translateEn(ruRow) {
  const out = [];
  for (const piece of ruRow) {
    out.push(await translatePiece(piece));
  }
  return out;
}

function writeCareData(cache) {
  const lines = ['/* Сгенерировано scripts/build-i18n-care.js — только en */', ''];
  Object.keys(PLANT_CARE).forEach((id) => {
    const en = cache[id];
    if (!en) return;
    lines.push(`putCare(${JSON.stringify(id)}, {`);
    lines.push(`  en: [${en.map((c) => JSON.stringify(c)).join(', ')}]`);
    lines.push('});');
    lines.push('');
  });
  fs.writeFileSync(out, lines.join('\n'), 'utf8');
}

async function main() {
  const scratch = loadScratchEn();
  const cache = { ...loadCache(), ...scratch };
  const ids = Object.keys(PLANT_CARE);

  const autoTranslate = process.env.PLANTY_TRANSLATE === '1';

  for (const id of ids) {
    if (cache[id]) {
      process.stdout.write(`have ${id}\n`);
      continue;
    }
    if (!autoTranslate) {
      process.stdout.write(`missing ${id} (set PLANTY_TRANSLATE=1 to auto-translate)\n`);
      continue;
    }
    process.stdout.write(`translate ${id}\n`);
    cache[id] = await translateEn(rowFromCare(PLANT_CARE[id]));
    saveCache(cache);
    writeCareData(cache);
  }

  writeCareData(cache);
  const missing = ids.filter((id) => !cache[id]);
  console.log('Wrote', out, ids.length - missing.length, 'of', ids.length, 'plants');
  if (missing.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
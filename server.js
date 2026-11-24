const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AsyncLocalStorage } = require('async_hooks');
const { PLANT_ART_IDS, PLANT_ACCENTS, PLANT_META, LIGHT_OPTIONS, EMOJI_PICKER, PET_SPECIES } = require('./catalogs');
const accounts = require('./lib/accounts');
const { PROVIDERS: WEATHER_PROVIDERS, fetchWeather } = require('./lib/weather');
const { OPENROUTER_MODELS, GIGACHAT_MODELS, GIGACHAT_SCOPES, completeChat, listModels } = require('./lib/ai');
const { PLANT_CARE } = require('./lib/plant-care');

// Подхватываем .env из папки проекта (переменные из окружения имеют приоритет)
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const PORT = process.env.PORT || 3000;
const als = new AsyncLocalStorage();
let sessions = accounts.loadSessions();

const TIMEZONES = [
  'Europe/Kaliningrad', 'Europe/Moscow', 'Europe/Samara', 'Asia/Yekaterinburg',
  'Asia/Omsk', 'Asia/Novosibirsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk',
  'Asia/Yakutsk', 'Asia/Vladivostok', 'Asia/Magadan', 'Asia/Kamchatka',
  'UTC', 'Europe/London', 'Europe/Berlin', 'Asia/Tbilisi', 'Asia/Almaty',
  'Asia/Tokyo', 'Asia/Shanghai', 'America/New_York', 'America/Los_Angeles'
];

function userDb() {
  return als.getStore().db;
}

function saveData() {
  accounts.writeUser(als.getStore().userId);
}

function timezoneChoices() {
  const host = accounts.serverTimeZone();
  return TIMEZONES.includes(host) ? TIMEZONES : [host, ...TIMEZONES];
}

function isTimeZone(tz) {
  if (typeof tz !== 'string' || tz.length > 64) return false;
  try {
    Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
    return true;
  } catch (_) {
    return false;
  }
}

function llmReady(settings) {
  const ai = (settings && settings.ai) || {};
  if (ai.provider === 'gigachat') return Boolean(ai.gigachatKey);
  return Boolean(ai.openrouterKey);
}

function publicSettings(s) {
  const src = s || {};
  const ai = src.ai || {};
  return {
    lat: src.lat ?? null,
    lon: src.lon ?? null,
    timezone: src.timezone || accounts.serverTimeZone(),
    weatherProvider: src.weatherProvider || 'open-meteo',
    language: ['en', 'ru', 'es', 'de', 'vi', 'zh', 'fr', 'it', 'hi', 'ja'].includes(src.language) ? src.language : null,
    ai: {
      provider: ai.provider === 'gigachat' ? 'gigachat' : 'openrouter',
      openrouterModel: ai.openrouterModel || OPENROUTER_MODELS[0].id,
      gigachatModel: ai.gigachatModel || 'GigaChat-2-Pro',
      gigachatScope: ai.gigachatScope || 'GIGACHAT_API_PERS',
      hasOpenrouterKey: Boolean(ai.openrouterKey),
      hasGigachatKey: Boolean(ai.gigachatKey)
    }
  };
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 3600}`);
}

function issueSession(res, user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions[token] = { userId: user.id, exp: Date.now() + 30 * 24 * 3600 * 1000 };
  accounts.saveSessions(sessions);
  setSessionCookie(res, token);
}

// ---------- Хранилище (отдельный JSON на пользователя) ----------

const seedPlants = [
  {
    id: 'zamioculcas',
    name: 'Замиокулькас',
    latin: 'Zamioculcas zamiifolia',
    accent: '#3BA55D',
    acquiredAt: '2024-03-10',
    wateringIntervalDays: 14,
    tempMin: 18, tempMax: 26, humMin: 30, humMax: 60,
    lightShort: 'Полутень и тень',
    lightFull: 'Лучше всего — яркий рассеянный свет, но спокойно растёт в полутени и даже в глубине комнаты. Прямое солнце допустимо только утреннее: полуденные лучи оставляют ожоги на глянцевых листьях.',
    humidityFull: 'К влажности воздуха нетребователен — обычные квартирные 30–60 % полностью устраивают. Опрыскивание не нужно, достаточно изредка протирать листья от пыли.',
    temperatureFull: 'Комфорт — 18–26 °C. Зимой не допускайте похолодания ниже 15 °C, держите подальше от морозных стёкол и сквозняков.',
    careTips: [
      'Поливайте только после полной просушки грунта — клубни запасают воду, перелив ведёт к гнили',
      'Горшок с дренажными отверстиями и рыхлый грунт для суккулентов',
      'Подкормка раз в месяц весной и летом половинной дозой',
      'Пересадка раз в 2–3 года, когда клубни заполнят горшок',
      'Сок ядовит — пересаживайте в перчатках, держите подальше от животных'
    ],
    intervalMode: 'smart',
    manualInterval: null,
    extra: 'Клубни запасают воду: перелив опаснее засухи. Между поливами грунт должен просохнуть полностью.',
    waterings: [],
    notes: []
  },
  {
    id: 'dracaena',
    name: 'Драцена',
    latin: 'Dracaena marginata',
    accent: '#F5A503',
    acquiredAt: '2023-11-02',
    wateringIntervalDays: 8,
    tempMin: 18, tempMax: 25, humMin: 40, humMax: 60,
    lightShort: 'Рассеянный свет',
    lightFull: 'Яркий рассеянный свет у восточного или западного окна. Пёстрым формам света нужно больше, зелёным хватает лёгкой полутени. Прямое полуденное солнце сушит и обесцвечивает листья.',
    humidityFull: 'Оптимально 40–60 %. Сухой воздух от батарей — главная причина сухих кончиков: полезно опрыскивать листья пару раз в неделю и изредка устраивать тёплый душ.',
    temperatureFull: 'Круглый год 18–25 °C. Не переносит холодных сквозняков и падения ниже 15 °C — листья опускаются и сохнут.',
    careTips: [
      'Поливайте отстоянной водой комнатной температуры — хлор и фтор сушат кончики листьев',
      'Между поливами верхние 2–3 см грунта должны просохнуть',
      'Протирайте листья влажной тканью от пыли',
      'Подкормка каждые 2 недели с весны до осени',
      'Оголившийся ствол можно обрезать — драцена даст боковые побеги'
    ],
    intervalMode: 'smart',
    manualInterval: null,
    extra: 'Кончики листьев сохнут от сухого воздуха и хлорированной воды — поливайте отстоянной.',
    waterings: [],
    notes: []
  },
  {
    id: 'ficus',
    name: 'Фикус Бенджамина',
    latin: 'Ficus benjamina',
    accent: '#FF5C39',
    acquiredAt: '2024-06-20',
    wateringIntervalDays: 6,
    tempMin: 20, tempMax: 25, humMin: 50, humMax: 70,
    lightShort: 'Много яркого света',
    lightFull: 'Самое светлое место в доме без прямого полуденного солнца — идеально у восточного окна. При нехватке света листья мельчают и осыпаются, пёстрые сорта теряют рисунок.',
    humidityFull: 'Любит 50–70 %: регулярное опрыскивание мягкой водой, раз в месяц — тёплый душ. Сухой воздух зимой — частая причина листопада.',
    temperatureFull: 'Ровные 20–25 °C без перепадов. Боится сквозняков, холодного подоконника и потока воздуха от кондиционера.',
    careTips: [
      'Выберите постоянное место — от перестановок и поворотов сбрасывает листья',
      'Поливайте умеренно после просыхания верхних 2–3 см грунта',
      'Формирующая обрезка весной делает крону гуще',
      'Подкормка каждые 2 недели в период роста',
      'Млечный сок раздражает кожу — обрезайте в перчатках'
    ],
    intervalMode: 'smart',
    manualInterval: null,
    extra: 'Не любит перестановок и сквозняков — от стресса сбрасывает листья. Найдите ему постоянное место.',
    waterings: [],
    notes: []
  },
  {
    id: 'calathea',
    name: 'Калатея Розеопикта',
    latin: 'Calathea roseopicta',
    accent: '#A96FD6',
    acquiredAt: '2025-01-15',
    wateringIntervalDays: 4,
    tempMin: 20, tempMax: 24, humMin: 60, humMax: 85,
    lightShort: 'Полутень',
    lightFull: 'Полутень или мягкий рассеянный свет северного либо восточного окна. Прямое солнце выжигает розовый узор, а глубокая тень делает окраску блёклой.',
    humidityFull: 'Тропиканка: нужно 60–85 %. Лучше всего увлажнитель воздуха или поддон с мокрым керамзитом. Опрыскивайте воздух вокруг растения, а не сами бархатистые листья.',
    temperatureFull: 'Стабильные 20–24 °C круглый год. Холодный подоконник и сквозняк заставляют листья скручиваться.',
    careTips: [
      'Полив только мягкой тёплой водой (фильтрованной или отстоянной) — от жёсткой сохнут края листьев',
      'Грунт держите равномерно чуть влажным, но без болота',
      'На ночь поднимает листья — это здоровое движение, не пугайтесь',
      'Подкормка раз в 2 недели половинной дозой весной и летом',
      'Пересадка ежегодно в рыхлый слабокислый грунт'
    ],
    intervalMode: 'smart',
    manualInterval: null,
    extra: 'Капризная: поливать только мягкой тёплой водой. На ночь поднимает листья — это норма.',
    waterings: [],
    notes: []
  },
  {
    id: 'anthurium',
    name: 'Антуриум Люксурианс',
    latin: 'Anthurium luxurians',
    accent: '#3E8EDE',
    acquiredAt: '2025-04-05',
    wateringIntervalDays: 6,
    tempMin: 22, tempMax: 27, humMin: 60, humMax: 85,
    lightShort: 'Яркий рассеянный',
    lightFull: 'Яркий рассеянный свет без прямых лучей — под солнцем фактурные «стёганые» листья тускнеют и получают ожоги. Зимой полезна досветка фитолампой.',
    humidityFull: 'Требует 70 % и выше, как в тропическом лесу — увлажнитель воздуха почти обязателен. Регулярно опрыскивайте воздух рядом и протирайте листья.',
    temperatureFull: 'Тепло круглый год: 22–27 °C, зимой не ниже 18 °C. Резкое похолодание и сквозняки останавливают рост.',
    careTips: [
      'Грунт очень рыхлый и воздушный (кора, перлит, торф) — корням нужен воздух',
      'Поливайте после просыхания верхнего слоя, без застоя воды в поддоне',
      'Раз в месяц устраивайте тёплый душ — имитацию тропического ливня',
      'Подкормка раз в 2–3 недели удобрением для ароидных',
      'Пересаживайте бережно: корни хрупкие и ломкие'
    ],
    intervalMode: 'smart',
    manualInterval: null,
    extra: 'Ценится за фактурные «стёганые» листья. Рыхлый воздушный грунт, корням нужен воздух.',
    waterings: [],
    notes: []
  },
  {
    id: 'caladium',
    name: 'Каладиум Скарлет Флейм',
    latin: 'Caladium «Scarlet Flame»',
    accent: '#F0567E',
    acquiredAt: '2025-05-12',
    wateringIntervalDays: 3,
    tempMin: 21, tempMax: 27, humMin: 60, humMax: 85,
    lightShort: 'Яркий рассеянный',
    lightFull: 'Яркий рассеянный свет делает алую окраску максимально сочной. Прямое солнце прожигает тонкие листья, а глубокая тень «зеленит» их.',
    humidityFull: 'Тонкие листья быстро сохнут — держите 60–85 %: увлажнитель или поддон с влажным керамзитом. Опрыскивайте воздух рядом: капли на листьях оставляют пятна.',
    temperatureFull: 'В период роста 21–27 °C, ниже 18 °C рост останавливается. Клубень зимует в тепле (не ниже 16 °C) в почти сухом грунте.',
    careTips: [
      'В сезон роста поливайте часто, но без застоя воды',
      'Осенью листья отмирают — это период покоя, а не гибель: сведите полив к минимуму',
      'Клубень храните зимой в сухом тёплом месте, весной высадите заново',
      'Подкормка раз в 2 недели в период активного роста',
      'Сок ядовит — работайте с клубнем в перчатках'
    ],
    intervalMode: 'smart',
    manualInterval: null,
    extra: 'Осенью уходит на покой: листья отмирают, клубень хранят почти сухим до весны — это не болезнь.',
    waterings: [],
    notes: []
  },
  {
    id: 'narcissus',
    name: 'Нарциссы',
    latin: 'Narcissus',
    accent: '#F2C230',
    acquiredAt: '2026-07-15',
    wateringIntervalDays: 4,
    tempMin: 10, tempMax: 20, humMin: 40, humMax: 70,
    lightShort: 'Яркий свет, прохлада',
    lightFull: 'Яркий рассеянный свет на прохладном подоконнике — восточное или северное окно. Во время цветения лёгкое притенение от прямого солнца продлевает жизнь цветков.',
    humidityFull: 'К влажности воздуха нетребовательны — обычные 40–70 % подходят. Опрыскивать не нужно, особенно цветки: от капель на лепестках появляются пятна.',
    temperatureFull: 'Чем прохладнее, тем дольше цветение: идеальны 10–18 °C. В жарко натопленной комнате цветки увядают за считанные дни. Не ставьте рядом с батареей.',
    careTips: [
      'Поливайте по краю горшка, не попадая на луковицу — от воды в розетке она загнивает',
      'Грунт держите равномерно влажным в период роста и цветения',
      'Отцветший цветонос срежьте, а листья дайте отмереть естественно — они питают луковицу',
      'После отмирания листвы наступает период покоя: луковицы хранят в сухом прохладном месте',
      'Луковицы и листья ядовиты — держите подальше от детей и животных'
    ],
    intervalMode: 'smart',
    manualInterval: null,
    extra: 'Луковичные с выраженным периодом покоя: после цветения листья отмирают — это норма, а не болезнь. Прохлада продлевает цветение.',
    waterings: [],
    notes: []
  }
];

// ---------- Питомцы ----------

const seedPets = [
  {
    id: 'frodo',
    kind: 'hamster',
    name: 'Фродо',
    species: 'Сирийский хомяк',
    latin: 'Mesocricetus auratus',
    accent: '#C98A4B',
    birthDate: '2026-04-15',
    tasks: [
      { id: 'water',   name: 'Поменять воду',  emoji: '💧', intervalDays: 1, history: [] },
      { id: 'food',    name: 'Насыпать корм',  emoji: '🌾', intervalDays: 1, history: [] },
      { id: 'protein', name: 'Дать белок',     emoji: '🥚', intervalDays: 3, history: [] },
      { id: 'veggies', name: 'Овощи и фрукты', emoji: '🥕', intervalDays: 2, history: [] },
      { id: 'nuts',    name: 'Орехи',          emoji: '🥜', intervalDays: 7, history: [] }
    ]
  }
];

// Дополняем старый data.json полями, появившимися в новых версиях.
// noAutoSeed — пустая база нового аккаунта: чужие растения и Фродо туда не попадают.
function migrate(data) {
  data.plants = Array.isArray(data.plants) ? data.plants : [];
  data.settings = data.settings || { lat: null, lon: null };
  if (!data.settings.timezone) data.settings.timezone = accounts.serverTimeZone();
  if (!data.settings.weatherProvider) data.settings.weatherProvider = 'open-meteo';
  data.settings.ai = data.settings.ai || {};
  if (data.settings.ai.provider !== 'openrouter' && data.settings.ai.provider !== 'gigachat') {
    data.settings.ai.provider = 'openrouter';
  }
  if (!data.settings.ai.openrouterModel) data.settings.ai.openrouterModel = OPENROUTER_MODELS[0].id;
  if (!data.settings.ai.gigachatModel) data.settings.ai.gigachatModel = 'GigaChat-2-Pro';
  if (!data.settings.ai.gigachatScope) data.settings.ai.gigachatScope = 'GIGACHAT_API_PERS';
  data.deletedPlantIds = Array.isArray(data.deletedPlantIds)
    ? data.deletedPlantIds.filter((id) => typeof id === 'string')
    : [];
  if (!Array.isArray(data.pets)) data.pets = [];
  if (!data.noAutoSeed) {
    for (const s of seedPlants) {
      if (!data.deletedPlantIds.includes(s.id) && !data.plants.some((p) => p.id === s.id)) data.plants.push(JSON.parse(JSON.stringify(s)));
    }
    for (const s of seedPets) {
      if (!data.pets.some((p) => p.id === s.id)) data.pets.push(JSON.parse(JSON.stringify(s)));
    }
  }
  for (const pet of data.pets) {
    if (pet.chats === undefined) pet.chats = [];
  }
  for (const p of data.plants) {
    const seed = seedPlants.find((s) => s.id === p.id);
    for (const k of ['tempMin', 'tempMax', 'humMin', 'humMax', 'lightShort', 'lightFull', 'humidityFull', 'temperatureFull', 'careTips']) {
      if (p[k] === undefined) p[k] = seed ? seed[k] : null;
    }
    if (p.health === undefined) p.health = 5;
    if (p.envTemp === undefined) p.envTemp = null;
    if (p.envHumidity === undefined) p.envHumidity = null;
    if (p.intervalMode === undefined) p.intervalMode = 'smart';
    if (p.manualInterval === undefined) p.manualInterval = null;
    if (p.chats === undefined) p.chats = [];
    if (p.artId === undefined) p.artId = p.id;
    if (!p.isCustom && seedPlants.some((s) => s.id === p.id)) p.isCustom = false;
    if (p.isCustom === undefined && !seedPlants.some((s) => s.id === p.id)) p.isCustom = true;
    if (fillCatalogCare(p)) data._care = true;
  }
  for (const pet of data.pets) {
    if (pet.kind === undefined) pet.kind = 'hamster';
  }
  if (renumberPlantNames(data.plants)) data._renamed = true;
  return data;
}

function careIsEmpty(plant) {
  const tip = plant.careTips && plant.careTips[0];
  return !plant.lightFull || !tip || String(tip).startsWith('Параметры ухода');
}

function fillCatalogCare(plant) {
  const care = PLANT_CARE[plant.artId];
  if (!care || !careIsEmpty(plant)) return false;
  plant.tempMin = care.tempMin;
  plant.tempMax = care.tempMax;
  plant.humMin = care.humMin;
  plant.humMax = care.humMax;
  plant.lightShort = care.lightShort;
  plant.lightFull = care.lightFull;
  plant.humidityFull = care.humidityFull;
  plant.temperatureFull = care.temperatureFull;
  plant.careTips = care.careTips.slice();
  plant.extra = care.extra;
  plant.wateringIntervalDays = care.wateringIntervalDays;
  if (plant.intervalMode !== 'manual' || !plant.manualInterval) {
    plant.intervalMode = 'smart';
    plant.manualInterval = null;
  }
  return true;
}

function basePlantName(name) {
  return String(name || '').replace(/\s\[\d+\]$/, '').trim();
}

function renumberPlantNames(plants) {
  const groups = new Map();
  for (const plant of plants) {
    const base = basePlantName(plant.name);
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(plant);
  }
  let changed = false;
  for (const [base, group] of groups) {
    if (group.length < 2) {
      if (group[0] && group[0].name !== base) {
        group[0].name = base;
        changed = true;
      }
      continue;
    }
    group.forEach((plant, index) => {
      const next = `${base} [${index + 1}]`;
      if (plant.name !== next) {
        plant.name = next;
        changed = true;
      }
    });
  }
  return changed;
}

function findPlant(id) {
  return userDb().plants.find((p) => p.id === id);
}

const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

// Сегодня в часовом поясе из настроек аккаунта
function localTodayIso() {
  const tz = (userDb().settings && userDb().settings.timezone) || accounts.serverTimeZone();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const g = (t) => parts.find((p) => p.type === t).value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}

// строки YYYY-MM-DD корректно сравниваются лексикографически
const isFutureDate = (s) => s > localTodayIso();

// ---------- Погода (кэш 30 минут, снимок в базе пользователя) ----------

const weatherByUser = new Map();
const WEATHER_TTL_MS = 30 * 60 * 1000;

function weatherSlot() {
  const userId = als.getStore().userId;
  if (!weatherByUser.has(userId)) {
    const snap = userDb().settings && userDb().settings.weatherSnapshot;
    weatherByUser.set(userId, {
      cache: snap && snap.key && snap.data ? { at: snap.at || 0, key: snap.key, data: snap.data } : { at: 0, key: '', data: null },
      refreshing: null
    });
  }
  return weatherByUser.get(userId);
}

function applyWeather(key, data) {
  const slot = weatherSlot();
  slot.cache = { at: Date.now(), key, data };
  userDb().settings.weatherSnapshot = { key, data, at: slot.cache.at };
  saveData();
}

function refreshWeather(userId, lat, lon, provider, key) {
  const slot = weatherByUser.get(userId);
  return fetchWeather(provider, lat, lon)
    .then((data) => {
      slot.cache = { at: Date.now(), key, data };
      const record = accounts.loadUserRecord(userId, migrate);
      record.settings.weatherSnapshot = { key, data, at: slot.cache.at };
      accounts.writeUser(userId);
    })
    .catch((e) => {
      console.error('Погода недоступна:', e.message);
    });
}

// На Pi исходящий HTTPS часто обрывается — тогда браузер сам спрашивает источник и присылает POST /api/weather.
function weatherCacheKey(provider, lat, lon) {
  return `${provider || 'open-meteo'}|${lat},${lon}`;
}

// Снимок из браузера раньше писался как «широта,долгота», серверный запрос — как «провайдер|широта,долгота».
function weatherMatches(key, lat, lon) {
  const place = `${lat},${lon}`;
  return key === place || (typeof key === 'string' && key.endsWith('|' + place));
}

function getWeather() {
  const settings = userDb().settings || {};
  const { lat, lon } = settings;
  if (lat == null || lon == null) return null;
  const provider = settings.weatherProvider || 'open-meteo';
  const key = weatherCacheKey(provider, lat, lon);
  const slot = weatherSlot();
  const fromCache = slot.cache.data && weatherMatches(slot.cache.key, lat, lon) ? slot.cache : null;
  const snap = settings.weatherSnapshot;
  const fromSnap = snap && snap.data && weatherMatches(snap.key, lat, lon)
    ? { at: snap.at || 0, key: snap.key, data: snap.data }
    : null;
  const source = fromCache || fromSnap;
  const isFresh = source && Date.now() - source.at < WEATHER_TTL_MS;
  if (!isFresh && !slot.refreshing) {
    const userId = als.getStore().userId;
    slot.refreshing = refreshWeather(userId, lat, lon, provider, key).finally(() => { slot.refreshing = null; });
  }
  return source ? source.data : null;
}

// ---------- Формулы: статусы условий и рекомендуемый интервал полива ----------

function seasonInfo(lat) {
  const tz = (userDb().settings && userDb().settings.timezone) || accounts.serverTimeZone();
  let m = Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'numeric' }).format(new Date())) - 1;
  if (lat != null && lat < 0) m = (m + 6) % 12; // южное полушарие
  if (m >= 2 && m <= 4) return { name: 'весна', factor: 1.0 };
  if (m >= 5 && m <= 7) return { name: 'лето', factor: 1.0 };
  if (m >= 8 && m <= 10) return { name: 'осень', factor: 1.25 };
  return { name: 'зима', factor: 1.5 };
}

// Чем жарче — тем чаще полив (коэффициент меньше единицы укорачивает интервал)
function tempFactor(t) {
  if (t == null) return 1.0;
  if (t >= 28) return 0.75;
  if (t >= 24) return 0.9;
  if (t >= 18) return 1.0;
  if (t >= 12) return 1.3;
  return 1.6;
}

// Чем суше воздух — тем быстрее сохнет грунт
function humFactor(h) {
  if (h == null) return 1.0;
  if (h >= 70) return 1.15;
  if (h >= 40) return 1.0;
  return 0.85;
}

function rangeStatus(value, min, max, margin) {
  if (value == null || min == null || max == null) return null;
  if (value >= min && value <= max) return 'good';
  if (value >= min - margin && value <= max + margin) return 'warn';
  return 'bad';
}

function computePlant(p, weather) {
  const lat = userDb().settings ? userDb().settings.lat : null;
  const effTemp = p.envTemp != null ? p.envTemp : (weather ? weather.temp : null);
  const effHum = p.envHumidity != null ? p.envHumidity : (weather ? weather.hum : null);
  const tempSource = p.envTemp != null ? 'manual' : (weather ? 'weather' : null);
  const humSource = p.envHumidity != null ? 'manual' : (weather ? 'weather' : null);
  const season = seasonInfo(lat);
  const tf = tempFactor(effTemp);
  const hf = humFactor(effHum);
  const recommendedInterval = Math.min(40, Math.max(2, Math.round(p.wateringIntervalDays * season.factor * tf * hf)));
  // Действующий интервал: ручной, если владелец его задал, иначе — умный
  const activeInterval = p.intervalMode === 'manual' && p.manualInterval ? p.manualInterval : recommendedInterval;
  return {
    effTemp, effHum, tempSource, humSource,
    tempStatus: rangeStatus(effTemp, p.tempMin, p.tempMax, 3),
    humStatus: rangeStatus(effHum, p.humMin, p.humMax, 10),
    season: season.name,
    factors: { season: season.factor, temp: tf, hum: hf },
    recommendedInterval,
    activeInterval
  };
}

// ---------- Питомцы: возраст и рекомендации по сезону/возрасту ----------

function ageMonths(birthDate) {
  const from = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
  if (now.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

function hamsterStage(months) {
  if (months < 2) return { id: 'baby', name: 'малыш' };
  if (months < 6) return { id: 'young', name: 'молодой хомяк' };
  if (months < 18) return { id: 'adult', name: 'взрослый хомяк' };
  return { id: 'senior', name: 'пожилой хомяк' };
}

const HAMSTER_SEASON_TIPS = {
  'весна': [
    '🌤 Световой день растёт, хомяк активнее — проверьте колесо и добавьте игрушек и туннелей',
    '🚪 На время проветривания уносите клетку в другую комнату: весенние сквозняки — частая причина простуд',
    '🥬 Свежую зелень и сезонные овощи вводите постепенно, маленькими порциями'
  ],
  'лето': [
    '🌡 Жара опасна: при 26 °C и выше есть риск теплового удара — уберите клетку от солнца, держите комнату прохладной',
    '🧊 Положите в клетку керамическую плитку или охлаждённый камень — хомяк ляжет на него, чтобы остыть',
    '💧 В жару вода быстро портится — меняйте её чаще и следите, чтобы поилка не пустела',
    '🥕 Сочные овощи и фрукты убирайте из клетки через 3–4 часа: летом они закисают быстрее'
  ],
  'осень': [
    '🍂 Осенью хомяки усиленно делают запасы — чаще проверяйте кладовые и убирайте испортившиеся продукты',
    '🏠 Дайте больше бумажного наполнителя и салфеток: хомяк готовит тёплое гнездо к «зиме»',
    '🌡 С началом отопительного сезона не ставьте клетку вплотную к батарее и следите за сухостью воздуха'
  ],
  'зима': [
    '🌡 Не допускайте похолодания ниже 18 °C: при 15 °C и ниже хомяк может впасть в опасное для жизни оцепенение',
    '🚪 Уберите клетку от холодных окон и сквозняков, но и не вплотную к батарее',
    '🏠 Побольше материала для гнезда — салфетки без запаха, бумажный наполнитель',
    '🌾 Зимой аппетит чуть выше — порцию корма можно немного увеличить, но следите за запасами в кладовых'
  ]
};

const HAMSTER_AGE_TIPS = {
  baby: [
    '🍼 Малышу нужен белок для роста — давайте его чаще, каждые 2–3 дня: варёное яйцо, нежирный творог, гаммарус',
    '🤲 Приручайте постепенно: сначала дайте привыкнуть к голосу и запаху руки, потом угощайте с ладони',
    '😴 Не будите днём и не берите на руки против воли — стресс в этом возрасте особенно вреден'
  ],
  young: [
    '🏃 Самый активный возраст: обязательно колесо со сплошной поверхностью диаметром от 28 см',
    '🕳 Насыпьте подстилку слоем 15–20 см — молодые хомяки обожают рыть норы',
    '🥚 Белок 2–3 раза в неделю поддержит рост мышц',
    '🦷 Зубы растут всю жизнь — в клетке всегда должен быть минеральный камень или веточки плодовых деревьев'
  ],
  adult: [
    '⚖️ Следите за весом: взрослый сирийский хомяк весит примерно 120–180 г, резкие изменения — повод насторожиться',
    '🥜 Орехи и семечки — лакомство, а не основа рациона: из-за жирности не чаще пары раз в неделю',
    '🧭 Поддерживайте распорядок: уборка, кормление и игры примерно в одно время — хомяки любят предсказуемость'
  ],
  senior: [
    '👴 После полутора лет хомяк — пенсионер: больше спит и меньше бегает, это нормально',
    '🥣 Если стал хуже грызть, твёрдый корм можно слегка размачивать водой',
    '🪜 Уберите высокие этажи и лесенки — падения с возрастом опаснее',
    '⚖️ Раз в неделю проверяйте вес и шерсть: быстрое похудение или проплешины — повод показаться ветеринару'
  ]
};

const petSpeciesByKind = Object.fromEntries(PET_SPECIES.map((s) => [s.kind, s]));

function computePet(pet) {
  const lat = userDb().settings ? userDb().settings.lat : null;
  const season = seasonInfo(lat);
  const months = ageMonths(pet.birthDate);
  const spec = petSpeciesByKind[pet.kind] || petSpeciesByKind.hamster;
  let stage;
  let tips;
  if (pet.kind === 'hamster') {
    stage = hamsterStage(months);
    tips = [...(HAMSTER_SEASON_TIPS[season.name] || []), ...(HAMSTER_AGE_TIPS[stage.id] || [])];
  } else {
    stage = { id: pet.kind, name: spec.species };
    tips = [
      ...((spec.seasonTips && spec.seasonTips[season.name]) || []),
      `🐾 Возраст: ${petAgeTextRu(months)} — подстраивайте порции и активность.`
    ];
  }
  return {
    ageMonths: months,
    stage: stage.id,
    stageName: stage.name,
    season: season.name,
    tips
  };
}

function findPet(id) {
  return userDb().pets.find((p) => p.id === id);
}

// ---------- API ----------

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const NICK_RE = /^[a-zA-Z0-9_\-\u0400-\u04FF]{3,32}$/;

app.use('/api', (req, res, next) => {
  if (req.path === '/auth/register' || req.path === '/auth/login') return next();
  const token = readCookie(req, 'sid');
  const session = token && sessions[token];
  const user = session && session.exp > Date.now()
    ? accounts.loadUsers().find((u) => u.id === session.userId)
    : null;
  if (!user) {
    if (req.path === '/auth/logout') return next();
    return res.status(401).json({ error: 'Нужно войти' });
  }
  try {
    const data = accounts.loadUserRecord(user.id, migrate);
    als.run({ userId: user.id, db: data, nick: user.nick }, () => next());
  } catch (_) {
    res.status(500).json({ error: 'Не удалось открыть данные аккаунта' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const nick = typeof req.body.nick === 'string' ? req.body.nick.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!NICK_RE.test(nick)) return res.status(400).json({ error: 'Ник: 3–32 символа, буквы, цифры, _ и -' });
  if (password.length < 6 || password.length > 128) return res.status(400).json({ error: 'Пароль: от 6 до 128 символов' });
  const users = accounts.loadUsers();
  if (users.some((u) => u.nick.toLowerCase() === nick.toLowerCase())) {
    return res.status(409).json({ error: 'Такой ник уже занят' });
  }
  const id = crypto.randomUUID();
  const { salt, hash } = accounts.hashPassword(password);
  const user = { id, nick, salt, hash, createdAt: new Date().toISOString() };
  users.push(user);
  accounts.saveUsers(users);
  accounts.createUserFiles(id, migrate({
    noAutoSeed: true,
    plants: [],
    pets: [],
    deletedPlantIds: [],
    settings: { lat: null, lon: null, language: ['en', 'ru', 'es', 'de', 'vi', 'zh', 'fr', 'it', 'hi', 'ja'].includes(req.body.language) ? req.body.language : 'ru' }
  }));
  issueSession(res, user);
  res.json({ user: { id: user.id, nick: user.nick } });
});

app.post('/api/auth/login', (req, res) => {
  const nick = typeof req.body.nick === 'string' ? req.body.nick.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = accounts.loadUsers().find((u) => u.nick.toLowerCase() === nick.toLowerCase());
  if (!user || !accounts.verifyPassword(password, user.salt, user.hash)) {
    return res.status(401).json({ error: 'Неверный ник или пароль' });
  }
  issueSession(res, user);
  res.json({ user: { id: user.id, nick: user.nick } });
});

app.post('/api/auth/logout', (req, res) => {
  const token = readCookie(req, 'sid');
  if (token && sessions[token]) {
    delete sessions[token];
    accounts.saveSessions(sessions);
  }
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const store = als.getStore();
  res.json({ user: { id: store.userId, nick: store.nick } });
});

app.get('/api/plants', async (req, res) => {
  if (userDb()._renamed || userDb()._care) {
    delete userDb()._renamed;
    delete userDb()._care;
    saveData();
  }
  const weather = await getWeather();
  res.json({
    plants: userDb().plants.map((p) => ({ ...p, computed: computePlant(p, weather) })),
    pets: userDb().pets.map((p) => ({ ...p, computed: computePet(p) })),
    settings: publicSettings(userDb().settings),
    weather,
    llmEnabled: llmReady(userDb().settings),
    catalog: {
      plantArtIds: PLANT_ART_IDS,
      plantMeta: Object.fromEntries(Object.entries(PLANT_META).map(([id, [name, latin]]) => [id, { name, latin }])),
      lights: LIGHT_OPTIONS,
      accents: PLANT_ACCENTS,
      petSpecies: PET_SPECIES.map(({ kind, species, latin, accent }) => ({ kind, species, latin, accent })),
      emojis: EMOJI_PICKER,
      timezones: timezoneChoices(),
      serverTimezone: accounts.serverTimeZone(),
      weatherProviders: WEATHER_PROVIDERS,
      aiModels: { openrouter: OPENROUTER_MODELS, gigachat: GIGACHAT_MODELS },
      gigachatScopes: GIGACHAT_SCOPES
    }
  });
});

app.post('/api/plants', (req, res) => {
  const { name, artId, accent, lightId, tempMin, tempMax, wateringIntervalDays, acquiredAt } = req.body;
  if (!PLANT_ART_IDS.includes(artId) || !PLANT_META[artId]) {
    return res.status(400).json({ error: 'Выберите растение из каталога' });
  }
  if (!isIsoDate(acquiredAt)) return res.status(400).json({ error: 'Нужна дата «в доме с»' });
  if (isFutureDate(acquiredAt)) return res.status(400).json({ error: 'Дата появления не может быть в будущем' });
  const [catalogName, catalogLatin] = PLANT_META[artId];
  const color = PLANT_ACCENTS.includes(accent) ? accent : PLANT_ACCENTS[Math.floor(Math.random() * PLANT_ACCENTS.length)];
  let plant;
  if (artId === 'other') {
    const light = LIGHT_OPTIONS.find((item) => item.id === lightId);
    if (!light) return res.status(400).json({ error: 'Выберите свет из списка' });
    const cleanName = typeof name === 'string' ? name.trim().slice(0, 80) : '';
    if (!cleanName) return res.status(400).json({ error: 'Укажите название растения' });
    const tMin = Number(tempMin);
    const tMax = Number(tempMax);
    if (!Number.isFinite(tMin) || !Number.isFinite(tMax)) return res.status(400).json({ error: 'Укажите температуру' });
    if (tMin > tMax) return res.status(400).json({ error: 'Минимальная температура не может быть выше максимальной' });
    const interval = Math.round(Number(wateringIntervalDays));
    if (!(interval >= 1 && interval <= 60)) return res.status(400).json({ error: 'Интервал полива — от 1 до 60 дней' });
    plant = {
      id: crypto.randomUUID(),
      artId,
      name: cleanName,
      latin: '—',
      accent: color,
      acquiredAt,
      wateringIntervalDays: interval,
      tempMin: tMin,
      tempMax: tMax,
      humMin: 40,
      humMax: 70,
      lightShort: light.short,
      lightFull: light.full,
      humidityFull: 'Влажность 40–70 %.',
      temperatureFull: `Температура ${tMin}–${tMax} °C.`,
      careTips: ['Параметры ухода заданы вами — при необходимости уточняйте в чате с ботаником.'],
      intervalMode: 'manual',
      manualInterval: interval,
      extra: 'Растение добавлено вручную; полив по заданному интервалу.',
      isCustom: true
    };
  } else {
    const care = PLANT_CARE[artId];
    if (!care) return res.status(400).json({ error: 'Для этого растения нет карточки ухода' });
    plant = {
      id: crypto.randomUUID(),
      artId,
      name: catalogName,
      latin: catalogLatin,
      accent: color,
      acquiredAt,
      wateringIntervalDays: care.wateringIntervalDays,
      tempMin: care.tempMin,
      tempMax: care.tempMax,
      humMin: care.humMin,
      humMax: care.humMax,
      lightShort: care.lightShort,
      lightFull: care.lightFull,
      humidityFull: care.humidityFull,
      temperatureFull: care.temperatureFull,
      careTips: care.careTips.slice(),
      intervalMode: 'smart',
      manualInterval: null,
      extra: care.extra,
      isCustom: false
    };
  }
  Object.assign(plant, { waterings: [], notes: [], chats: [], health: 5, envTemp: null, envHumidity: null });
  userDb().plants.push(plant);
  renumberPlantNames(userDb().plants);
  saveData();
  res.status(201).json(plant);
});

app.delete('/api/plants/:id', (req, res) => {
  const plant = findPlant(req.params.id);
  if (!plant) return res.status(404).json({ error: 'Растение не найдено' });
  if (seedPlants.some((s) => s.id === plant.id)) {
    if (!userDb().deletedPlantIds.includes(plant.id)) userDb().deletedPlantIds.push(plant.id);
  }
  userDb().plants = userDb().plants.filter((p) => p.id !== plant.id);
  renumberPlantNames(userDb().plants);
  saveData();
  res.json({ ok: true });
});

// ---------- API питомцев ----------

app.post('/api/pets', (req, res) => {
  const spec = petSpeciesByKind[req.body.kind];
  if (!spec) return res.status(400).json({ error: 'Выберите вид питомца из списка' });
  const cleanName = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 60) : '';
  if (!cleanName) return res.status(400).json({ error: 'Укажите кличку питомца' });
  const { birthDate } = req.body;
  if (!isIsoDate(birthDate)) return res.status(400).json({ error: 'Нужна дата рождения ГГГГ-ММ-ДД' });
  if (isFutureDate(birthDate)) return res.status(400).json({ error: 'Дата рождения не может быть в будущем' });
  const waterDays = Math.round(Number(req.body.waterIntervalDays) || 1);
  const foodDays = Math.round(Number(req.body.foodIntervalDays) || 1);
  if (!(waterDays >= 1 && waterDays <= 60) || !(foodDays >= 1 && foodDays <= 60)) {
    return res.status(400).json({ error: 'Интервалы воды и корма — целые числа 1–60' });
  }
  const customIn = Array.isArray(req.body.customTasks) ? req.body.customTasks : [];
  if (customIn.length > 6) return res.status(400).json({ error: 'Не больше 6 дополнительных дел' });
  const tasks = [
    { id: 'water', name: 'Поменять воду', emoji: '💧', intervalDays: waterDays, history: [] },
    { id: 'food', name: 'Насыпать корм', emoji: '🌾', intervalDays: foodDays, history: [] }
  ];
  for (const t of customIn) {
    const name = typeof t.name === 'string' ? t.name.trim().slice(0, 60) : '';
    const emoji = typeof t.emoji === 'string' ? t.emoji.trim() : '';
    const intervalDays = Math.round(Number(t.intervalDays));
    if (!name) return res.status(400).json({ error: 'У каждого дела должно быть название' });
    if (!EMOJI_PICKER.includes(emoji)) {
      return res.status(400).json({ error: 'Выберите эмодзи из сетки' });
    }
    if (!(intervalDays >= 1 && intervalDays <= 60)) return res.status(400).json({ error: 'Интервал дела — от 1 до 60 дней' });
    tasks.push({
      id: crypto.randomUUID(),
      name,
      emoji,
      intervalDays,
      history: []
    });
  }
  const pet = {
    id: crypto.randomUUID(),
    kind: spec.kind,
    name: cleanName,
    species: spec.species,
    latin: spec.latin,
    accent: spec.accent,
    birthDate,
    tasks,
    chats: []
  };
  userDb().pets.push(pet);
  saveData();
  res.status(201).json(pet);
});

app.delete('/api/pets/:id', (req, res) => {
  const pet = findPet(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
  userDb().pets = userDb().pets.filter((p) => p.id !== req.params.id);
  saveData();
  res.json({ ok: true });
});

app.post('/api/pets/:id/tasks', (req, res) => {
  const pet = findPet(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
  const customCount = pet.tasks.filter((t) => t.id !== 'water' && t.id !== 'food').length;
  if (customCount >= 6) return res.status(400).json({ error: 'Не больше 6 дополнительных дел' });
  const name = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 60) : '';
  const emoji = typeof req.body.emoji === 'string' ? req.body.emoji.trim() : '';
  const intervalDays = Math.round(Number(req.body.intervalDays));
  if (!name) return res.status(400).json({ error: 'Укажите название дела' });
  if (!EMOJI_PICKER.includes(emoji)) {
    return res.status(400).json({ error: 'Выберите эмодзи из сетки' });
  }
  if (!(intervalDays >= 1 && intervalDays <= 60)) return res.status(400).json({ error: 'Интервал — от 1 до 60 дней' });
  pet.tasks.push({
    id: crypto.randomUUID(),
    name,
    emoji,
    intervalDays,
    history: []
  });
  saveData();
  res.json(pet);
});

app.delete('/api/pets/:id/tasks/:taskId', (req, res) => {
  const pet = findPet(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
  if (req.params.taskId === 'water' || req.params.taskId === 'food') {
    return res.status(400).json({ error: 'Воду и корм удалить нельзя — только настроить интервал' });
  }
  const before = pet.tasks.length;
  pet.tasks = pet.tasks.filter((t) => t.id !== req.params.taskId);
  if (pet.tasks.length === before) return res.status(404).json({ error: 'Задача не найдена' });
  saveData();
  res.json(pet);
});

app.patch('/api/pets/:id', (req, res) => {
  const pet = findPet(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
  const { birthDate } = req.body;
  if (birthDate !== undefined) {
    if (!isIsoDate(birthDate)) return res.status(400).json({ error: 'Нужна дата в формате ГГГГ-ММ-ДД' });
    if (isFutureDate(birthDate)) return res.status(400).json({ error: 'Дата рождения не может быть в будущем' });
    pet.birthDate = birthDate;
  }
  saveData();
  res.json(pet);
});

app.patch('/api/pets/:id/tasks/:taskId', (req, res) => {
  const pet = findPet(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
  const task = pet.tasks.find((t) => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });
  const { intervalDays } = req.body;
  if (!(Number.isInteger(intervalDays) && intervalDays >= 1 && intervalDays <= 60)) {
    return res.status(400).json({ error: 'Интервал — целое число от 1 до 60 дней' });
  }
  task.intervalDays = intervalDays;
  saveData();
  res.json(pet);
});

app.post('/api/pets/:id/tasks/:taskId/done', (req, res) => {
  const pet = findPet(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
  const task = pet.tasks.find((t) => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });
  const { date } = req.body;
  if (!isIsoDate(date)) return res.status(400).json({ error: 'Нужна дата в формате ГГГГ-ММ-ДД' });
  if (isFutureDate(date)) return res.status(400).json({ error: 'Нельзя отметить дело будущим числом' });
  if (!task.history.includes(date)) {
    task.history.push(date);
    task.history.sort();
    saveData();
  }
  res.json(pet);
});

app.delete('/api/pets/:id/chats/:chatId', (req, res) => {
  const pet = findPet(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
  pet.chats = pet.chats.filter((c) => c.id !== req.params.chatId);
  saveData();
  res.json(pet);
});

app.delete('/api/pets/:id/tasks/:taskId/done/:date', (req, res) => {
  const pet = findPet(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
  const task = pet.tasks.find((t) => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });
  task.history = task.history.filter((d) => d !== req.params.date);
  saveData();
  res.json(pet);
});

app.post('/api/settings', (req, res) => {
  const s = userDb().settings;
  const body = req.body || {};
  let dropWeather = false;
  if (body.lat !== undefined || body.lon !== undefined) {
    const { lat, lon } = body;
    const okLat = typeof lat === 'number' && lat >= -90 && lat <= 90;
    const okLon = typeof lon === 'number' && lon >= -180 && lon <= 180;
    if (!okLat || !okLon) return res.status(400).json({ error: 'Нужны координаты: широта −90…90, долгота −180…180' });
    s.lat = Math.round(lat * 10000) / 10000;
    s.lon = Math.round(lon * 10000) / 10000;
    dropWeather = true;
  }
  if (body.timezone !== undefined) {
    if (!isTimeZone(body.timezone)) return res.status(400).json({ error: 'Неизвестный часовой пояс' });
    s.timezone = body.timezone;
  }
  if (body.language !== undefined) {
    const allowed = ['en', 'ru', 'es', 'de', 'vi', 'zh', 'fr', 'it', 'hi', 'ja'];
    if (!allowed.includes(body.language)) return res.status(400).json({ error: 'Неизвестный язык' });
    s.language = body.language;
  }
  if (body.weatherProvider !== undefined) {
    if (!WEATHER_PROVIDERS.some((p) => p.id === body.weatherProvider)) {
      return res.status(400).json({ error: 'Неизвестный источник погоды' });
    }
    if (s.weatherProvider !== body.weatherProvider) dropWeather = true;
    s.weatherProvider = body.weatherProvider;
  }
  if (body.ai && typeof body.ai === 'object') {
    const ai = s.ai;
    if (body.ai.provider === 'openrouter' || body.ai.provider === 'gigachat') ai.provider = body.ai.provider;
    if (typeof body.ai.openrouterModel === 'string' && body.ai.openrouterModel.trim()) {
      ai.openrouterModel = body.ai.openrouterModel.trim().slice(0, 120);
    }
    if (typeof body.ai.gigachatModel === 'string' && body.ai.gigachatModel.trim()) {
      ai.gigachatModel = body.ai.gigachatModel.trim().slice(0, 80);
    }
    if (GIGACHAT_SCOPES.some((scope) => scope.id === body.ai.gigachatScope)) ai.gigachatScope = body.ai.gigachatScope;
    if (typeof body.ai.openrouterKey === 'string' && body.ai.openrouterKey.trim()) ai.openrouterKey = body.ai.openrouterKey.trim();
    if (typeof body.ai.gigachatKey === 'string' && body.ai.gigachatKey.trim()) ai.gigachatKey = body.ai.gigachatKey.trim();
  }
  if (dropWeather) {
    const slot = weatherSlot();
    slot.cache = { at: 0, key: '', data: null };
    delete s.weatherSnapshot;
  }
  saveData();
  res.json({ settings: publicSettings(s), llmEnabled: llmReady(s) });
});

// Погода с устройства пользователя (браузер), если Raspberry Pi не достучался до Open-Meteo по HTTPS
app.post('/api/weather', (req, res) => {
  const { lat, lon } = userDb().settings || {};
  if (lat == null || lon == null) return res.status(400).json({ error: 'Сначала задайте координаты дома' });
  const { temp, hum } = req.body;
  const okTemp = typeof temp === 'number' && temp >= -60 && temp <= 60;
  const okHum = typeof hum === 'number' && hum >= 0 && hum <= 100;
  if (!okTemp || !okHum) return res.status(400).json({ error: 'Нужны temp и hum — числа в разумных пределах' });
  const provider = (userDb().settings || {}).weatherProvider || 'open-meteo';
  const key = weatherCacheKey(provider, lat, lon);
  const data = { temp: Math.round(temp * 10) / 10, hum: Math.round(hum) };
  applyWeather(key, data);
  res.json({ weather: data });
});

app.post('/api/plants/:id/waterings', (req, res) => {
  const plant = findPlant(req.params.id);
  if (!plant) return res.status(404).json({ error: 'Растение не найдено' });
  const { date } = req.body;
  if (!isIsoDate(date)) return res.status(400).json({ error: 'Нужна дата в формате ГГГГ-ММ-ДД' });
  if (isFutureDate(date)) return res.status(400).json({ error: 'Нельзя отметить полив будущим числом' });
  if (!plant.waterings.includes(date)) {
    plant.waterings.push(date);
    plant.waterings.sort();
    saveData();
  }
  res.json(plant);
});

app.delete('/api/plants/:id/waterings/:date', (req, res) => {
  const plant = findPlant(req.params.id);
  if (!plant) return res.status(404).json({ error: 'Растение не найдено' });
  plant.waterings = plant.waterings.filter((d) => d !== req.params.date);
  saveData();
  res.json(plant);
});

app.patch('/api/plants/:id', (req, res) => {
  const plant = findPlant(req.params.id);
  if (!plant) return res.status(404).json({ error: 'Растение не найдено' });
  const { acquiredAt, envTemp, envHumidity, health } = req.body;
  if (acquiredAt !== undefined) {
    if (!isIsoDate(acquiredAt)) return res.status(400).json({ error: 'Нужна дата в формате ГГГГ-ММ-ДД' });
    if (isFutureDate(acquiredAt)) return res.status(400).json({ error: 'Дата появления не может быть в будущем' });
    plant.acquiredAt = acquiredAt;
  }
  if (envTemp !== undefined) {
    if (envTemp !== null && !(typeof envTemp === 'number' && envTemp >= -30 && envTemp <= 50)) {
      return res.status(400).json({ error: 'Температура должна быть числом от −30 до 50' });
    }
    plant.envTemp = envTemp;
  }
  if (envHumidity !== undefined) {
    if (envHumidity !== null && !(typeof envHumidity === 'number' && envHumidity >= 0 && envHumidity <= 100)) {
      return res.status(400).json({ error: 'Влажность должна быть числом от 0 до 100' });
    }
    plant.envHumidity = envHumidity;
  }
  if (health !== undefined) {
    if (!(Number.isInteger(health) && health >= 0 && health <= 5)) {
      return res.status(400).json({ error: 'Здоровье — целое число от 0 до 5' });
    }
    plant.health = health;
  }
  const { intervalMode, manualInterval } = req.body;
  if (intervalMode !== undefined) {
    if (intervalMode !== 'smart' && intervalMode !== 'manual') {
      return res.status(400).json({ error: 'Режим интервала: smart или manual' });
    }
    plant.intervalMode = intervalMode;
  }
  if (manualInterval !== undefined) {
    if (manualInterval !== null && !(Number.isInteger(manualInterval) && manualInterval >= 1 && manualInterval <= 60)) {
      return res.status(400).json({ error: 'Интервал — целое число от 1 до 60 дней' });
    }
    plant.manualInterval = manualInterval;
  }
  saveData();
  res.json(plant);
});

app.post('/api/plants/:id/notes', (req, res) => {
  const plant = findPlant(req.params.id);
  if (!plant) return res.status(404).json({ error: 'Растение не найдено' });
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Заметка пустая' });
  const now = new Date().toISOString();
  plant.notes.unshift({ id: crypto.randomUUID(), text, createdAt: now, updatedAt: now });
  saveData();
  res.json(plant);
});

app.patch('/api/plants/:id/notes/:noteId', (req, res) => {
  const plant = findPlant(req.params.id);
  if (!plant) return res.status(404).json({ error: 'Растение не найдено' });
  const note = plant.notes.find((n) => n.id === req.params.noteId);
  if (!note) return res.status(404).json({ error: 'Заметка не найдена' });
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Заметка пустая' });
  note.text = text;
  note.updatedAt = new Date().toISOString();
  saveData();
  res.json(plant);
});

app.delete('/api/plants/:id/notes/:noteId', (req, res) => {
  const plant = findPlant(req.params.id);
  if (!plant) return res.status(404).json({ error: 'Растение не найдено' });
  plant.notes = plant.notes.filter((n) => n.id !== req.params.noteId);
  saveData();
  res.json(plant);
});

app.delete('/api/plants/:id/chats/:chatId', (req, res) => {
  const plant = findPlant(req.params.id);
  if (!plant) return res.status(404).json({ error: 'Растение не найдено' });
  plant.chats = plant.chats.filter((c) => c.id !== req.params.chatId);
  saveData();
  res.json(plant);
});

// ---------- Чат с ботаником ----------

function plantAgeText(acquiredAt) {
  const from = new Date(acquiredAt);
  const now = new Date();
  let months = (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
  if (now.getDate() < from.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (months <= 0) return 'меньше месяца в доме';
  return [years > 0 ? `${years} г.` : '', rest > 0 ? `${rest} мес.` : ''].filter(Boolean).join(' ');
}

function replyLanguageName() {
  const id = (userDb().settings && userDb().settings.language) || 'ru';
  const names = {
    en: 'английском', ru: 'русском', es: 'испанском', de: 'немецком', vi: 'вьетнамском',
    zh: 'китайском', fr: 'французском', it: 'итальянском', hi: 'хинди', ja: 'японском'
  };
  return names[id] || 'русском';
}

function buildSystemPrompt(plant, weather, comp) {
  const recent = plant.waterings.slice(-10).join(', ') || 'ещё не отмечались';
  const notes = plant.notes.length
    ? plant.notes.map((n) => `- ${n.text}`).join('\n')
    : 'нет';
  const statusWord = (s) => (s === 'good' ? 'подходит' : s === 'warn' ? 'не совсем подходит' : s === 'bad' ? 'сильно не подходит' : 'нет данных');
  const src = (s) => (s === 'manual' ? 'введено владельцем вручную' : s === 'weather' ? 'взято из уличной погоды, в помещении может отличаться' : '');
  return `Ты — дружелюбный ботаник-консультант в домашнем приложении по уходу за растениями.
Отвечай на языке пользователя (${replyLanguageName()}), коротко и по делу, тёплым тоном, без лишней воды. Можно уместные эмодзи, но умеренно.

Карточка растения, о котором идёт разговор:
- Название: ${plant.name} (${plant.latin})
- В доме с: ${plant.acquiredAt} (возраст: ${plantAgeText(plant.acquiredAt)})
- Самочувствие по оценке владельца: ${plant.health} из 5 ❤️
- Свет: ${plant.lightFull}
- Влажность (норма ${plant.humMin}–${plant.humMax} %): ${plant.humidityFull}
- Температура (норма ${plant.tempMin}–${plant.tempMax} °C): ${plant.temperatureFull}
- Особенности: ${plant.extra}
- Рекомендации по уходу:
${(plant.careTips || []).map((t) => `  - ${t}`).join('\n')}

Текущие условия:
- Погода на улице: ${weather ? `${weather.temp} °C, влажность ${weather.hum} %` : 'нет данных (координаты не заданы)'}
- Температура у растения: ${comp.effTemp != null ? `${comp.effTemp} °C (${src(comp.tempSource)}) — ${statusWord(comp.tempStatus)}` : 'нет данных'}
- Влажность у растения: ${comp.effHum != null ? `${comp.effHum} % (${src(comp.humSource)}) — ${statusWord(comp.humStatus)}` : 'нет данных'}
- Сезон: ${comp.season}

Полив:
- Базовый интервал: раз в ${plant.wateringIntervalDays} дн.
- Умный интервал с учётом сезона, температуры и влажности (посчитан приложением): раз в ${comp.recommendedInterval} дн.
- Режим: ${plant.intervalMode === 'manual' ? `ручной — владелец сам задал раз в ${plant.manualInterval} дн.` : 'умный (по формуле приложения)'}
- Действующий интервал, по которому строится расписание: раз в ${comp.activeInterval} дн.
- Последние отмеченные поливы: ${recent}

Заметки владельца:
${notes}

Сегодня ${localTodayIso()}. Опирайся на эти данные, когда советуешь по поливу и уходу.`;
}

function petAgeTextRu(months) {
  if (months <= 0) return 'меньше месяца';
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y > 0 ? `${y} г.` : '', m > 0 ? `${m} мес.` : ''].filter(Boolean).join(' ');
}

function buildPetSystemPrompt(pet, comp) {
  const today = localTodayIso();
  const schedule = pet.tasks.map((t) => {
    const recent = t.history.slice(-5).join(', ') || 'ещё не отмечалось';
    const next = t.history.length
      ? new Date(new Date(t.history[t.history.length - 1]).getTime() + t.intervalDays * 86400000).toISOString().slice(0, 10)
      : 'уже пора (отметок нет)';
    return `- ${t.name}: раз в ${t.intervalDays} дн.; последние отметки: ${recent}; следующий раз по графику: ${next}`;
  }).join('\n');
  return `Ты — дружелюбный консультант по содержанию домашних грызунов в семейном приложении по уходу за питомцами.
Отвечай на языке пользователя (${replyLanguageName()}), коротко и по делу, тёплым тоном, без лишней воды. Можно уместные эмодзи, но умеренно.
Если в вопросе описаны тревожные симптомы (вялость, отказ от еды, мокрый хвост, опухоли, раны), мягко, но настойчиво советуй очный визит к ветеринару-ратологу.

Карточка питомца, о котором идёт разговор:
- Имя: ${pet.name}
- Вид: ${pet.species} (${pet.latin})
- Дата рождения: ${pet.birthDate} (возраст: ${petAgeTextRu(comp.ageMonths)} — ${comp.stageName})
- Сезон сейчас: ${comp.season}

График ухода и кормления (интервалы задал владелец, отметки — реальные выполнения):
${schedule}

Рекомендации приложения по текущему сезону и возрасту (учитывай их в ответах):
${comp.tips.map((t) => `- ${t}`).join('\n')}

Сегодня ${today}. Опирайся на возраст, вид и график кормления, когда отвечаешь: например, советуя лакомства, сверяйся с интервалами «Орехи» и «Овощи и фрукты», а при вопросах о рационе учитывай стадию жизни.`;
}

app.post('/api/ai/models', async (req, res) => {
  const provider = req.body.provider === 'gigachat' ? 'gigachat' : 'openrouter';
  const ai = userDb().settings.ai || {};
  const typed = typeof req.body.key === 'string' ? req.body.key.trim() : '';
  const key = typed || (provider === 'gigachat' ? ai.gigachatKey : ai.openrouterKey);
  if (!key) return res.status(400).json({ error: 'Сначала введите API-ключ' });
  const scope = GIGACHAT_SCOPES.some((item) => item.id === req.body.scope)
    ? req.body.scope
    : (ai.gigachatScope || 'GIGACHAT_API_PERS');
  try {
    const models = await listModels(provider, key, scope);
    res.json({ models });
  } catch (e) {
    res.status(502).json({ error: 'Не удалось загрузить модели: ' + e.message });
  }
});

function appendChatTurn(subject, chat, message, reply) {
  const now = new Date().toISOString();
  let target = chat;
  if (!target) {
    target = { id: crypto.randomUUID(), title: message.slice(0, 48), createdAt: now, updatedAt: now, messages: [] };
    if (!Array.isArray(subject.chats)) subject.chats = [];
    subject.chats.unshift(target);
  }
  target.messages.push({ role: 'user', content: message }, { role: 'assistant', content: reply });
  target.updatedAt = now;
  return target;
}

app.get('/api/ai/openrouter-key', (req, res) => {
  const key = (userDb().settings.ai || {}).openrouterKey;
  if (!key) return res.status(400).json({ error: 'Сначала введите API-ключ' });
  res.json({ key });
});

app.post('/api/chat', async (req, res) => {
  const ai = userDb().settings.ai || {};
  if (!llmReady(userDb().settings)) {
    return res.status(503).json({ error: 'Чат выключен: в настройках укажите ключ OpenRouter или Сбера.' });
  }
  const plant = req.body.plantId ? findPlant(req.body.plantId) : null;
  const pet = !plant && req.body.petId ? findPet(req.body.petId) : null;
  const subject = plant || pet;
  if (!subject) return res.status(404).json({ error: 'Растение или питомец не найдены' });

  const message = typeof req.body.message === 'string' ? req.body.message.trim().slice(0, 4000) : '';
  if (!message) return res.status(400).json({ error: 'Нет сообщения пользователя' });

  const chatId = req.body.chatId || null;
  const chat = chatId ? subject.chats.find((c) => c.id === chatId) : null;
  if (chatId && !chat) return res.status(404).json({ error: 'Чат не найден' });

  const history = (chat ? chat.messages : [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  const clean = [...history, { role: 'user', content: message }];

  let systemPrompt;
  if (plant) {
    const weather = await getWeather();
    systemPrompt = buildSystemPrompt(plant, weather, computePlant(plant, weather));
  } else {
    systemPrompt = buildPetSystemPrompt(pet, computePet(pet));
  }
  const messages = [{ role: 'system', content: systemPrompt }, ...clean];

  // С Raspberry Pi исходящий TLS до OpenRouter обрывается. Браузер пользователя до него достучался —
  // он и забирает ответ, а сервер только собирает промпт и сохраняет реплики.
  if (ai.provider !== 'gigachat') {
    return res.json({
      relay: 'openrouter',
      model: ai.openrouterModel || OPENROUTER_MODELS[0].id,
      key: ai.openrouterKey,
      messages
    });
  }

  try {
    const reply = await completeChat(ai, messages);
    const target = appendChatTurn(subject, chat, message, reply);
    saveData();
    res.json({ reply, chatId: target.id });
  } catch (e) {
    res.status(502).json({ error: 'Не удалось получить ответ: ' + e.message });
  }
});

app.post('/api/chat/commit', (req, res) => {
  const plant = req.body.plantId ? findPlant(req.body.plantId) : null;
  const pet = !plant && req.body.petId ? findPet(req.body.petId) : null;
  const subject = plant || pet;
  if (!subject) return res.status(404).json({ error: 'Растение или питомец не найдены' });
  const message = typeof req.body.message === 'string' ? req.body.message.trim().slice(0, 4000) : '';
  const reply = typeof req.body.reply === 'string' ? req.body.reply.trim().slice(0, 8000) : '';
  if (!message || !reply) return res.status(400).json({ error: 'Нет сообщения или ответа' });
  const chatId = req.body.chatId || null;
  const chat = chatId ? subject.chats.find((c) => c.id === chatId) : null;
  if (chatId && !chat) return res.status(404).json({ error: 'Чат не найден' });
  const target = appendChatTurn(subject, chat, message, reply);
  saveData();
  res.json({ reply, chatId: target.id });
});

function openBrowser(url) {
  const { spawn } = require('child_process');
  const options = { detached: true, stdio: 'ignore', windowsHide: true };
  let child;
  if (process.platform === 'win32') {
    child = spawn('rundll32', ['url.dll,FileProtocolHandler', url], options);
  } else if (process.platform === 'darwin') {
    child = spawn('open', [url], options);
  } else {
    child = spawn('xdg-open', [url], options);
  }
  child.on('error', () => {});
  child.unref();
}

const server = app.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`🌿 Planty (Поливайка): ${url}`);
  console.log(`Часовой пояс сервера: ${accounts.serverTimeZone()}`);
  if (process.env.OPEN_BROWSER === '1') openBrowser(url);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const url = `http://localhost:${PORT}`;
    console.log(`Planty уже запущена: ${url}`);
    if (process.env.OPEN_BROWSER === '1') openBrowser(url);
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});

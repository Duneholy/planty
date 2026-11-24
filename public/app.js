/* ————— Поливайка: логика ————— */

const state = {
  plants: [],
  pets: [],
  llmEnabled: false,
  weather: null,
  settings: { lat: null, lon: null },
  editCoords: false,
  calCursor: startOfMonth(new Date()),
  selectedDay: null,   // 'YYYY-MM-DD'
  openPlantId: null,
  openPetId: null,
  activeChat: {},      // plantId -> id сохранённого чата (null = новый)
  chatBusy: false,
  catalog: { plantArtIds: [], petSpecies: [], emojis: [] },
  formKind: null
};

function plantArt(p) {
  if (typeof plantArtHtml === 'function') return plantArtHtml(p);
  return PLANT_ART[p.artId || p.id] || '';
}
function petArt(pet) {
  if (typeof petArtHtml === 'function') return petArtHtml(pet);
  return PET_ART[pet.id] || '';
}

const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const $ = (sel, root = document) => root.querySelector(sel);

const MONTHS = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const WEEKDAYS = ['пн','вт','ср','чт','пт','сб','вс'];

/* ————— утилиты дат ————— */

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayIso() {
  const tz = state.settings && state.settings.timezone;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz || undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const g = (t) => parts.find((p) => p.type === t).value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}
function fromIso(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function fmtShort(iso) {
  return new Intl.DateTimeFormat(localeTag(), { day: 'numeric', month: 'long' }).format(fromIso(iso));
}
function fmtLong(iso) {
  return new Intl.DateTimeFormat(localeTag(), { day: 'numeric', month: 'long', year: 'numeric' }).format(fromIso(iso));
}
function monthTitle(date) {
  const name = new Intl.DateTimeFormat(localeTag(), { month: 'long' }).format(date);
  return `${name} ${date.getFullYear()}`;
}
function weekdayLabels() {
  const monday = new Date(2026, 0, 5);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return new Intl.DateTimeFormat(localeTag(), { weekday: 'short' }).format(d);
  });
}

function dateSlotHtml(id, value, attrs = '') {
    const face = value ? fmtShort(value) : t('pickDate');
  return `<span class="date-slot"><span class="date-face">${face}</span><input type="date" id="${id}" value="${escHtml(value || '')}" ${attrs}></span>`;
}
function bindDateFaces(root = document) {
  root.querySelectorAll('.date-slot input[type="date"]').forEach((input) => {
    if (input.dataset.faceBound) return;
    input.dataset.faceBound = '1';
    const face = input.parentElement.querySelector('.date-face');
    const sync = () => { if (face) face.textContent = input.value ? fmtShort(input.value) : t('pickDate'); };
    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
  });
}
function fmtFull(iso) { return fmtLong(iso); }
function daysBetween(aIso, bIso) { return Math.round((fromIso(bIso) - fromIso(aIso)) / 86400000); }
function addDays(iso, n) { const d = fromIso(iso); d.setDate(d.getDate() + n); return toIso(d); }

function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
}

function ageBits(months) {
  const y = Math.floor(months / 12), m = months % 12;
  const parts = [];
  if (y) parts.push(qty(y, 'year'));
  if (m) parts.push(qty(m, 'month'));
  return parts.join(' ');
}
function ageText(acquiredAt) {
  const from = fromIso(acquiredAt), now = new Date();
  let months = (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
  if (now.getDate() < from.getDate()) months -= 1;
  if (months <= 0) return t('age.underHome');
  return t('age.inHome', { time: ageBits(months) });
}

/* ————— статус полива ————— */

function lastWatering(plant) {
  return plant.waterings.length ? plant.waterings[plant.waterings.length - 1] : null;
}
// Действующий интервал: ручной (если задан) или умный, рассчитанный сервером
function effInterval(plant) {
  return (plant.computed && plant.computed.activeInterval) || plant.wateringIntervalDays;
}
function nextDue(plant) {
  const last = lastWatering(plant);
  return last ? addDays(last, effInterval(plant)) : null;
}
function waterInfo(plant) {
  const last = lastWatering(plant);
  if (!last) return { state: 'due', text: t('water.never'), daysLeft: 0, pct: 0 };
  const due = nextDue(plant);
  const daysLeft = daysBetween(todayIso(), due);
  const pct = Math.max(0, Math.min(100, Math.round((daysLeft / effInterval(plant)) * 100)));
  if (daysLeft <= 0) return { state: 'due', text: t('water.due'), daysLeft, pct: 0, last, due };
  if (daysLeft === 1) return { state: 'soon', text: t('water.tomorrow'), daysLeft, pct, last, due };
  return { state: 'ok', text: t('water.in', { time: qty(daysLeft, 'day') }), daysLeft, pct, last, due };
}

/* ————— задачи питомца ————— */

function taskInfo(task) {
  const last = task.history.length ? task.history[task.history.length - 1] : null;
  if (!last) return { state: 'due', text: t('task.never'), daysLeft: 0, last: null, due: null };
  const due = addDays(last, task.intervalDays);
  const daysLeft = daysBetween(todayIso(), due);
  if (daysLeft <= 0) return { state: 'due', text: t('task.due'), daysLeft, last, due };
  if (daysLeft === 1) return { state: 'soon', text: t('task.tomorrow'), daysLeft, last, due };
  return { state: 'ok', text: t('task.in', { time: qty(daysLeft, 'day') }), daysLeft, last, due };
}

function petAgeText(birthDate, ageMonths) {
  if (ageMonths <= 0) return t('age.under');
  return ageBits(ageMonths);
}

/* ————— API ————— */

async function api(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !String(url).includes('/api/auth/')) showLoggedOut();
  if (!res.ok) throw new Error(translateError(data.error) || t('serverErr'));
  return data;
}

async function readOpenRouterModels(key) {
  let res;
  try {
    res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
  } catch (_) {
    throw new Error(t('modelsOffline'));
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data.error && data.error.message) || `OpenRouter HTTP ${res.status}`;
    throw new Error(t('modelsFail', { detail: msg }));
  }
  return ((data.data) || [])
    .map((model) => ({ id: model.id, name: model.name || model.id }))
    .filter((model) => model.id);
}

async function completeOpenRouter(key, model, messages) {
  let res;
  try {
    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, temperature: 0.4, max_tokens: 1024, messages })
    });
  } catch (_) {
    throw new Error(t('replyOffline'));
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data.error && data.error.message) || `OpenRouter HTTP ${res.status}`;
    throw new Error(t('replyFail', { detail: msg }));
  }
  const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!reply || !String(reply).trim()) throw new Error(t('replyEmpty'));
  return String(reply).trim();
}

async function readProviderWeather(provider, lat, lon) {
  if (provider === 'met-no') {
    const r = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`);
    if (!r.ok) throw new Error('MET Norway');
    const j = await r.json();
    const d = j.properties.timeseries[0].data.instant.details;
    return { temp: Math.round(d.air_temperature * 10) / 10, hum: Math.round(d.relative_humidity) };
  }
  if (provider === 'wttr') {
    const r = await fetch(`https://wttr.in/${lat},${lon}?format=j1`);
    if (!r.ok) throw new Error('wttr.in');
    const j = await r.json();
    const c = j.current_condition[0];
    return { temp: Math.round(Number(c.temp_C) * 10) / 10, hum: Math.round(Number(c.humidity)) };
  }
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`);
  if (!r.ok) throw new Error('Open-Meteo');
  const j = await r.json();
  if (!j.current) throw new Error('Open-Meteo');
  return { temp: Math.round(j.current.temperature_2m * 10) / 10, hum: Math.round(j.current.relative_humidity_2m) };
}

function weatherProviderName(id) {
  const list = (state.catalog && state.catalog.weatherProviders) || [];
  const found = list.find((p) => p.id === id);
  const placeKey = 'place.' + (id || 'open-meteo');
  const place = t(placeKey);
  const placeText = place === placeKey ? (found ? found.place : '') : place;
  const name = found ? found.name : 'Open-Meteo';
  return placeText ? `${name} · ${placeText}` : name;
}

async function fetchWeatherFromBrowser() {
  const s = state.settings;
  if (s.lat == null || s.lon == null) return false;
  try {
    const reading = await readProviderWeather(s.weatherProvider || 'open-meteo', s.lat, s.lon);
    await api('/api/weather', { method: 'POST', body: reading });
    state.weather = reading;
    return true;
  } catch (_) {
    return false;
  }
}

async function loadPlants() {
  const data = await api('/api/plants');
  state.plants = data.plants;
  state.pets = data.pets || [];
  state.llmEnabled = data.llmEnabled;
  state.weather = data.weather;
  state.settings = data.settings || { lat: null, lon: null };
  state.catalog = data.catalog || state.catalog;
  if (data.catalog && data.catalog.plantArtIds && typeof PLANT_GALLERY_IDS === 'undefined') {
    window.PLANT_GALLERY_IDS = data.catalog.plantArtIds;
  }
  if (!state.weather && state.settings.lat != null) {
    const ok = await fetchWeatherFromBrowser();
    if (ok) {
      const fresh = await api('/api/plants');
      state.plants = fresh.plants;
      state.weather = fresh.weather || state.weather;
    }
  }
}

// После любой мутации перезагружаем данные: расчёты (статусы, интервал) живут на сервере
async function mutate(url, opts) {
  await api(url, opts);
  await loadPlants();
  renderAll();
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

/* ————— календарь ————— */

function renderCalendar() {
  const cur = state.calCursor;
  $('#calTitle').textContent = monthTitle(cur);
  $('#calWeekdays').innerHTML = weekdayLabels().map((w) => `<div>${w}</div>`).join('');

  // события: реальные поливы и ближайший планируемый полив каждого растения
  const watered = {}; // iso -> [plant]
  const planned = {}; // iso -> [plant]
  for (const p of state.plants) {
    for (const d of p.waterings) (watered[d] ||= []).push(p);
    const due = nextDue(p);
    if (due) {
      const key = daysBetween(todayIso(), due) < 0 ? todayIso() : due; // просроченные — на сегодня
      (planned[key] ||= []).push(p);
    }
  }

  // дела питомцев: отметки задач и ближайшие запланированные (одна точка на питомца в день)
  const petDone = {};    // iso -> [{ pet, tasks: [task] }]
  const petPlanned = {}; // iso -> [{ pet, tasks: [{ t, overdue }] }]
  for (const pet of state.pets) {
    const doneByDay = {};
    const plannedByDay = {};
    for (const t of pet.tasks) {
      for (const d of t.history) (doneByDay[d] ||= []).push(t);
      const info = taskInfo(t);
      const due = info.due || todayIso();
      const key = daysBetween(todayIso(), due) < 0 ? todayIso() : due; // просроченные — на сегодня
      (plannedByDay[key] ||= []).push({ t, overdue: !info.last || info.daysLeft < 0 });
    }
    for (const [d, tasks] of Object.entries(doneByDay)) (petDone[d] ||= []).push({ pet, tasks });
    for (const [d, tasks] of Object.entries(plannedByDay)) (petPlanned[d] ||= []).push({ pet, tasks });
  }

  const first = new Date(cur.getFullYear(), cur.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // понедельник — первый
  const start = new Date(first);
  start.setDate(1 - offset);

  const cells = [];
  const today = todayIso();
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toIso(d);
    const other = d.getMonth() !== cur.getMonth();
    const dots = [
      ...(watered[iso] || []).map((p) => `<i style="--dot:${p.accent}"></i>`),
      ...(petDone[iso] || []).map(({ pet }) => `<i style="--dot:${pet.accent}"></i>`),
      ...(planned[iso] || []).map((p) => `<i class="is-plan" style="--dot:${p.accent}"></i>`),
      ...(petPlanned[iso] || []).map(({ pet }) => `<i class="is-plan" style="--dot:${pet.accent}"></i>`)
    ].slice(0, 4).join('');
    const cls = ['cal-day', other && 'is-other', iso === today && 'is-today', iso === state.selectedDay && 'is-selected']
      .filter(Boolean).join(' ');
    cells.push(`<button class="${cls}" data-day="${iso}"><span>${d.getDate()}</span><span class="cal-dots">${dots}</span></button>`);
  }
  $('#calGrid').innerHTML = cells.join('');

  $('#calLegend').innerHTML =
    state.plants.map((p) => `<span class="key"><i style="background:${p.accent}"></i>${escHtml(displayPlantName(p))}</span>`).join('') +
    state.pets.map((p) => `<span class="key"><i style="background:${p.accent}"></i>${escHtml(p.name)}</span>`).join('') +
    `<span class="hint">${t('legend')}</span>`;

  $('#calGrid').querySelectorAll('.cal-day').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedDay = state.selectedDay === btn.dataset.day ? null : btn.dataset.day;
      renderCalendar();
    });
  });

  const details = $('#calDayDetails');
  if (!state.selectedDay) {
    details.hidden = true;
  } else {
    const iso = state.selectedDay;
    const w = watered[iso] || [];
    const pl = planned[iso] || [];
    const taskList = (tasks) => tasks.map((task) => `${task.emoji} ${taskLabel(task)}`).join(', ');
    const items = [
      ...w.map((p) => `<li><i style="background:${p.accent}"></i>${t('day.watered', { name: escHtml(displayPlantName(p)) })}</li>`),
      ...(petDone[iso] || []).map(({ pet, tasks }) => `<li><i style="background:${pet.accent}"></i>${t('day.petDone', { name: escHtml(pet.name), tasks: escHtml(taskList(tasks)) })}</li>`),
      ...pl.map((p) => `<li><i style="background:${p.accent}"></i>${daysBetween(todayIso(), nextDue(p)) < 0 ? t('day.waterLate', { name: escHtml(displayPlantName(p)) }) : t('day.waterPlan', { name: escHtml(displayPlantName(p)) })}</li>`),
      ...(petPlanned[iso] || []).map(({ pet, tasks }) =>
        `<li><i style="background:${pet.accent}"></i>${tasks.some((x) => x.overdue) ? t('day.petLate', { name: escHtml(pet.name), tasks: escHtml(taskList(tasks.map((x) => x.t))) }) : t('day.petPlan', { name: escHtml(pet.name), tasks: escHtml(taskList(tasks.map((x) => x.t))) })}</li>`)
    ];
    details.innerHTML = `<b>${fmtFull(iso)}</b>` +
      (items.length ? `<ul>${items.join('')}</ul>` : `<div>${t('day.empty')}</div>`);
    details.hidden = false;
  }
}

/* ————— условия: статусы и сердечки ————— */

const ST_CLASS = { good: 'st-good', warn: 'st-warn', bad: 'st-bad' };

function condLabel(value, status, unit) {
  if (value == null || !status) return '';
  return `<b class="now ${ST_CLASS[status]}">${t('cond.now', { value, unit })}</b>`;
}

function heartsHtml(health, interactive) {
  let out = '';
  for (let i = 1; i <= 5; i++) {
    const full = i <= health;
    out += interactive
      ? `<button type="button" class="heart ${full ? 'is-on' : ''}" data-heart="${i}" aria-label="${t('heart.rate', { n: i })}">${full ? '❤️' : '🤍'}</button>`
      : `<span>${full ? '❤️' : '🤍'}</span>`;
  }
  return `<span class="hearts ${interactive ? 'is-edit' : ''}" role="img" aria-label="${t('heart.feel', { n: health })}">${out}</span>`;
}

/* ————— погода ————— */

function renderWeather() {
  const el = $('#weatherCard');
  const s = state.settings;
  const hasCoords = s.lat != null && s.lon != null;

  if (!hasCoords || state.editCoords) {
    el.innerHTML = `
      <h2 class="today-title">${t('weather.title')}</h2>
      ${hasCoords ? '' : `<p class="weather-hint">${t('weather.need')}</p>`}
      <form class="coords-form" id="coordsForm">
        <label class="coord-field">
          <span class="coord-label">${t('lat')}</span>
          <input type="number" step="0.0001" min="-90" max="90" id="latInput" placeholder="55.6795" value="${s.lat ?? ''}" required inputmode="decimal">
          <span class="coord-help">${t('latHelp')}</span>
        </label>
        <label class="coord-field">
          <span class="coord-label">${t('lon')}</span>
          <input type="number" step="0.0001" min="-180" max="180" id="lonInput" placeholder="37.7448" value="${s.lon ?? ''}" required inputmode="decimal">
          <span class="coord-help">${t('lonHelp')}</span>
        </label>
        <div class="coord-actions">
          <button class="btn btn-green" type="submit">${t('save')}</button>
          ${hasCoords ? `<button class="btn btn-ghost" type="button" id="coordsCancel">${t('cancel')}</button>` : ''}
        </div>
      </form>`;
    $('#coordsForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('/api/settings', { method: 'POST', body: { lat: Number($('#latInput').value), lon: Number($('#lonInput').value) } });
        state.editCoords = false;
        await loadPlants();
        renderAll();
        toast(t('coordsSaved'));
      } catch (err) { toast(err.message); }
    });
    const cancel = $('#coordsCancel');
    if (cancel) cancel.addEventListener('click', () => { state.editCoords = false; renderWeather(); });
    return;
  }

  const w = state.weather;
  el.innerHTML = `
    <h2 class="today-title">${t('weather.out')} <button class="w-edit" id="coordsEdit" title="${t('editCoords')}">✎</button></h2>
    ${w
      ? `<div class="weather-now"><span class="w-temp">${w.temp}°</span><span class="w-hum">💧 ${w.hum}%</span></div>
         <div class="weather-hint">${s.lat}, ${s.lon} · ${escHtml(weatherProviderName(s.weatherProvider))} · ${t('weather.every')}</div>`
      : `<div class="weather-hint">${t('weather.miss', { name: escHtml(weatherProviderName(s.weatherProvider)), lat: s.lat, lon: s.lon })}</div>`}
  `;
  $('#coordsEdit').addEventListener('click', () => { state.editCoords = true; renderWeather(); });
}

/* ————— панель «полить сегодня» ————— */

function renderToday() {
  const items = state.plants.map((p) => ({ p, info: waterInfo(p) }));
  const due = items.filter((x) => x.info.state === 'due');
  const soon = items.filter((x) => x.info.state === 'soon');

  let html = due.length
    ? due.map(({ p, info }) => {
        const overdueDays = info.last ? -info.daysLeft : null;
        const sub = !info.last
          ? t('water.first')
          : overdueDays > 0
            ? t('water.overdue', { time: qty(overdueDays, 'day') })
            : t('water.scheduled');
        return `
        <div class="today-item">
          <i style="background:${p.accent}"></i>
          <span class="t-name">${escHtml(displayPlantName(p))}<span class="t-sub">${sub}</span></span>
          <button class="btn btn-water" data-today-water="${p.id}">💧 ${t('done')}</button>
        </div>`;
      }).join('')
    : '';

  // задачи питомцев
  const petDue = [], petSoon = [];
  for (const pet of state.pets) {
    for (const task of pet.tasks) {
      const info = taskInfo(task);
      if (info.state === 'due') petDue.push({ pet, task, info });
      if (info.state === 'soon') petSoon.push({ pet, task });
    }
  }

  html += petDue.map(({ pet, task, info }) => {
    const overdueDays = info.last ? -info.daysLeft : null;
    const sub = !info.last ? t('task.never') : overdueDays > 0 ? t('water.overdue', { time: qty(overdueDays, 'day') }) : t('water.scheduled');
    return `
      <div class="today-item">
        <i style="background:${pet.accent}"></i>
        <span class="t-name">${escHtml(pet.name)}: ${escHtml(taskLabel(task))}<span class="t-sub">${sub}</span></span>
        <button class="btn btn-water" data-today-task="${pet.id}:${task.id}">${task.emoji} ${t('done')}</button>
      </div>`;
  }).join('');

  if (!due.length && !petDue.length) {
    html = `<div class="today-empty">${t('today.empty')}</div>`;
  }

  const tomorrow = [
    ...soon.map((x) => displayPlantName(x.p)),
    ...petSoon.map(({ pet, task }) => `${pet.name}: ${taskLabel(task)}`)
  ];
  if (tomorrow.length) {
    html += `<div class="today-tomorrow">${t('today.tomorrow', { list: tomorrow.join(', ') })}</div>`;
  }

  $('#todayList').innerHTML = html;
  $('#todayList').querySelectorAll('[data-today-water]').forEach((btn) => {
    btn.addEventListener('click', () => addWatering(btn.dataset.todayWater, todayIso()));
  });
  $('#todayList').querySelectorAll('[data-today-task]').forEach((btn) => {
    const [petId, taskId] = btn.dataset.todayTask.split(':');
    btn.addEventListener('click', () => markTask(petId, taskId));
  });
}

/* ————— карточки растений ————— */

function renderGrid() {
  $('#plantGrid').innerHTML = state.plants.map((p) => {
    const info = waterInfo(p);
    const c = p.computed || {};
    const badgeCls = info.state === 'due' ? 'is-due' : info.state === 'soon' ? 'is-soon' : 'is-ok';
    const view = viewPlant(p);
    const badgeText = info.state === 'due' ? t('water.badge') : info.state === 'soon' ? t('water.tomorrow') : t('card.ok');
    return `
    <button class="plant-card" data-plant="${p.id}" style="--accent:${p.accent}" aria-label="${t('openCard', { name: view.name })}">
      <div class="plant-art">
        <span class="badge ${badgeCls}">${badgeText}</span>
        ${plantArt(p)}
      </div>
      <div class="plant-body">
        <div>
          <div class="plant-name">${escHtml(view.name)}</div>
          <div class="plant-latin">${escHtml(p.latin)}</div>
          ${heartsHtml(p.health, false)}
        </div>
        <div class="chips">
          <div class="chip"><span class="ico">☀️</span><span>${escHtml(view.lightShort)}</span></div>
          <div class="chip ${c.humStatus ? ST_CLASS[c.humStatus] : ''}"><span class="ico">💦</span><span>${p.humMin}–${p.humMax} % ${condLabel(c.effHum, c.humStatus, '%')}</span></div>
          <div class="chip ${c.tempStatus ? ST_CLASS[c.tempStatus] : ''}"><span class="ico">🌡️</span><span>${p.tempMin}–${p.tempMax} °C ${condLabel(c.effTemp, c.tempStatus, '°')}</span></div>
        </div>
        <div class="water-meter ${info.state === 'due' ? 'is-due' : ''}">
          <div class="row"><span>💧 ${t('every', { time: qty(effInterval(p), 'day') })}</span><span>${info.text}</span></div>
          <div class="track"><div class="fill" style="width:${info.pct}%"></div></div>
        </div>
      </div>
    </button>`;
  }).join('');

  $('#plantGrid').querySelectorAll('.plant-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.plant));
  });
}

/* ————— карточки питомцев ————— */

function renderPets() {
  $('#petGrid').innerHTML = state.pets.map((pet) => {
    const c = pet.computed || {};
    const infos = pet.tasks.map((t) => ({ t, info: taskInfo(t) }));
    const dueCount = infos.filter((x) => x.info.state === 'due').length;
    const soonCount = infos.filter((x) => x.info.state === 'soon').length;
    const badgeCls = dueCount ? 'is-due' : soonCount ? 'is-soon' : 'is-ok';
    const badgeText = dueCount
      ? t('task.badge', { n: dueCount, word: qtyWord(dueCount, 'taskword') })
      : soonCount ? t('task.soon') : t('task.allDone');
    return `
    <button class="plant-card" data-pet="${pet.id}" style="--accent:${pet.accent}" aria-label="${t('openCard', { name: pet.name })}">
      <div class="plant-art">
        <span class="badge ${badgeCls}">${badgeText}</span>
        ${petArt(pet)}
      </div>
      <div class="plant-body">
        <div>
          <div class="plant-name">${pet.name}</div>
          <div class="plant-latin">${escHtml(speciesLabel(pet.kind, pet.species))} · ${petAgeText(pet.birthDate, c.ageMonths || 0)}</div>
        </div>
        <div class="pet-tasks">
          ${infos.map(({ t: task, info }) => `
            <div class="pet-task ${info.state === 'due' ? 'is-due' : info.state === 'soon' ? 'is-soon' : ''}">
              <span>${task.emoji} ${escHtml(taskLabel(task))}</span><b>${info.text}</b>
            </div>`).join('')}
        </div>
      </div>
    </button>`;
  }).join('');

  $('#petGrid').querySelectorAll('.plant-card').forEach((card) => {
    card.addEventListener('click', () => openPetModal(card.dataset.pet));
  });
}

/* ————— модалка ————— */

function openModal(plantId) {
  state.openPlantId = plantId;
  renderModal();
  $('#modalBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  state.openPlantId = null;
  state.openPetId = null;
  $('#modalBackdrop').hidden = true;
  document.body.style.overflow = '';
}

/* ————— модалка питомца ————— */

function openPetModal(petId) {
  state.openPetId = petId;
  renderPetModal();
  $('#modalBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
}

function renderPetModal() {
  const pet = state.pets.find((x) => x.id === state.openPetId);
  if (!pet) return;
  const c = pet.computed || {};
  const chats = pet.chats || [];
  const activeChat = chats.find((x) => x.id === state.activeChat[pet.id]) || null;
  const msgs = activeChat ? activeChat.messages : [];

  $('#modalContent').innerHTML = `
  <div class="m-hero" style="--accent:${pet.accent}">
    ${petArt(pet)}
    <div class="m-titles">
      <h2 id="modalTitle">${pet.name}</h2>
      <div class="plant-latin">${escHtml(speciesLabel(pet.kind, pet.species))} · ${escHtml(pet.latin)}</div>
      <button type="button" class="btn btn-ghost btn-danger m-delete" id="deletePetBtn">${t('deletePet')}</button>
      <div class="m-age" id="petAgeBox">
        <span>${t('age.label', { age: petAgeText(pet.birthDate, c.ageMonths || 0) })}</span>
        <button id="petAgeEdit" title="${t('age.editBirth')}">✎</button>
      </div>
    </div>
  </div>

  <div class="m-section">
    <h3>${t('pet.recs')}</h3>
    <div class="rec-meta">${t('pet.meta', { season: seasonLabel(c.season), stage: escHtml(stageLabel(pet, c)), age: petAgeText(pet.birthDate, c.ageMonths || 0) })}</div>
    <ul class="tips pet-tips">${petTipList(pet).map((tip) => `<li>${escHtml(tip)}</li>`).join('')}</ul>
  </div>

  <div class="m-section">
    <h3>${t('pet.care')}</h3>
    ${pet.tasks.map((task) => {
      const info = taskInfo(task);
      return `
      <div class="task-block ${info.state === 'due' ? 'is-due' : ''}">
        <div class="task-head">
          <span class="task-name">${task.emoji} ${escHtml(taskLabel(task))}</span>
          <button class="btn btn-water" data-task-done="${task.id}">${t('markDone')}</button>
        </div>
        <div class="task-status ${info.state === 'due' ? 'is-due' : ''}">
          ${info.last
            ? t('pet.last', { date: fmtShort(info.last), next: info.state === 'due' ? `<b>${t('dueBang')}</b>` : t('pet.next', { date: fmtShort(info.due) }) })
            : t('pet.never')}
        </div>
        <div class="water-date task-date">
          <input type="date" data-task-date="${task.id}" max="${todayIso()}">
          <button class="btn btn-ghost" type="button" data-task-add="${task.id}">${t('markDate')}</button>
        </div>
        <form class="manual-int task-int" data-task-int="${task.id}">
          ${t('everyDays')} <input type="number" min="1" max="60" value="${task.intervalDays}"> ${t('daysShort')}
          <button class="btn btn-ghost" type="submit">${t('save')}</button>
          ${task.id !== 'water' && task.id !== 'food' ? `<button type="button" class="btn btn-ghost btn-danger" data-task-rm="${task.id}">${t('deleteTask')}</button>` : ''}
        </form>
        ${task.history.length
          ? `<div class="history">${[...task.history].reverse().slice(0, 2).map((d) =>
              `<span class="h-chip">${fmtShort(d)}<button data-task-del="${task.id}|${d}" title="${t('removeMark')}" aria-label="${t('removeMark')} ${fmtShort(d)}">✕</button></span>`).join('')}</div>`
          : ''}
      </div>`;
    }).join('')}
    ${pet.tasks.filter((t) => t.id !== 'water' && t.id !== 'food').length < 6 ? `
    <div class="task-add-block" id="petTaskAddBlock">
      <h4>${t('pet.newTask')}</h4>
      <form class="task-add-form" id="petTaskAddForm">
        <div class="task-add-row">
          ${emojiButtonHtml('petTaskEmoji', '⭐')}
          <input type="text" id="petTaskName" placeholder="${t('taskNamePh')}" maxlength="60" required>
          <label class="custom-days">${t('everyDays')} <input type="number" id="petTaskDays" min="1" max="60" value="3"> ${t('daysShort')}</label>
        </div>
        <button class="btn btn-green" type="submit">${t('add')}</button>
      </form>
    </div>` : ''}
  </div>

  ${chatSectionHtml(chats, activeChat, msgs, {
    title: t('askPet'),
    empty: t('petEmpty'),
    placeholder: t('petPh')
  })}`;

  fillChatMessages(msgs);
  wirePetModal(pet);
}

function wirePetModal(pet) {
  $('#deletePetBtn').addEventListener('click', () => deletePet(pet.id));

  const taskAdd = $('#petTaskAddForm');
  if (taskAdd) {
    wireEmojiButtons(taskAdd);
    taskAdd.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await mutate(`/api/pets/${pet.id}/tasks`, {
          method: 'POST',
          body: {
            name: $('#petTaskName').value.trim(),
            emoji: $('#petTaskEmoji').value,
            intervalDays: Number($('#petTaskDays').value)
          }
        });
        toast(t('taskAdded'));
      } catch (err) { toast(err.message); }
    });
  }

  $('#modalContent').querySelectorAll('[data-task-rm]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm(t('deleteTaskQ'))) return;
      try {
        await mutate(`/api/pets/${pet.id}/tasks/${btn.dataset.taskRm}`, { method: 'DELETE' });
      } catch (err) { toast(err.message); }
    });
  });

  $('#petAgeEdit').addEventListener('click', () => {
    $('#petAgeBox').innerHTML = `
      <span>${t('age.born')}</span>
      ${dateSlotHtml('petAgeInput', pet.birthDate, `max="${todayIso()}"`)}
      <button id="petAgeSave">✓</button>`;
    bindDateFaces($('#petAgeBox'));
    $('#petAgeSave').addEventListener('click', async () => {
      try {
        await mutate(`/api/pets/${pet.id}`, { method: 'PATCH', body: { birthDate: $('#petAgeInput').value } });
      } catch (e) { toast(e.message); }
    });
  });

  $('#modalContent').querySelectorAll('[data-task-done]').forEach((btn) => {
    btn.addEventListener('click', () => markTask(pet.id, btn.dataset.taskDone));
  });

  // отметка задним числом
  $('#modalContent').querySelectorAll('[data-task-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = $(`[data-task-date="${btn.dataset.taskAdd}"]`, $('#modalContent'));
      if (input.value) markTask(pet.id, btn.dataset.taskAdd, input.value);
      else toast(t('pickDate'));
    });
  });

  $('#modalContent').querySelectorAll('[data-task-int]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = Number($('input', form).value);
      try {
        await mutate(`/api/pets/${pet.id}/tasks/${form.dataset.taskInt}`, { method: 'PATCH', body: { intervalDays: v } });
        toast(t('intervalToast', { time: qty(v, 'day') }));
      } catch (err) { toast(err.message); }
    });
  });

  $('#modalContent').querySelectorAll('[data-task-del]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const [taskId, date] = btn.dataset.taskDel.split('|');
      try {
        await mutate(`/api/pets/${pet.id}/tasks/${taskId}/done/${date}`, { method: 'DELETE' });
      } catch (e) { toast(e.message); }
    });
  });

  // чат о питомце
  wireChat(pet.id, {
    bodyKey: 'petId',
    deleteBase: `/api/pets/${pet.id}/chats`,
    rerender: renderPetModal,
    typing: t('typing')
  });
}

async function markTask(petId, taskId, date = todayIso()) {
  if (date > todayIso()) { toast(t('futureMark')); return; }
  const pet = state.pets.find((x) => x.id === petId);
  const task = pet && pet.tasks.find((t) => t.id === taskId);
  try {
    await mutate(`/api/pets/${petId}/tasks/${taskId}/done`, { method: 'POST', body: { date } });
    toast(task ? t('markedTask', { emoji: task.emoji, name: taskLabel(task), date: fmtShort(date) }) : t('marked'));
  } catch (e) { toast(e.message); }
}

function renderModal() {
  const raw = state.plants.find((x) => x.id === state.openPlantId);
  if (!raw) return;
  const p = viewPlant(raw);
  const info = waterInfo(p);
  const c = p.computed || {};
  const chats = p.chats || [];
  const activeChat = chats.find((x) => x.id === state.activeChat[p.id]) || null;
  const msgs = activeChat ? activeChat.messages : [];
  const history = [...p.waterings].reverse().slice(0, 2);
  const statusLine = (label, value, status, unit, min, max) => {
    if (value == null) return `<div class="cond-row"><span>${label}</span><b class="now">${t('cond.none')}</b></div>`;
    const word = status === 'good' ? t('cond.good') : status === 'warn' ? t('cond.warn') : t('cond.bad');
    return `<div class="cond-row"><span>${label} <small>(${t('cond.norm', { min, max, unit })})</small></span><b class="now ${ST_CLASS[status]}">${value}${unit} — ${word}</b></div>`;
  };

  $('#modalContent').innerHTML = `
  <div class="m-hero" style="--accent:${p.accent}">
    ${plantArt(p)}
    <div class="m-titles">
      <h2 id="modalTitle">${p.name}</h2>
      <div class="plant-latin">${p.latin}</div>
      <button type="button" class="btn btn-ghost btn-danger m-delete" id="deletePlantBtn">${t('deletePlant')}</button>
      <div class="m-age" id="ageBox">
        <span>🎂 ${ageText(p.acquiredAt)}</span>
        <button id="ageEdit" title="${t('age.editHome')}">✎</button>
      </div>
      <div class="m-health">${heartsHtml(p.health, true)}</div>
    </div>
  </div>

  <div class="m-section">
    <h3>${t('care')}</h3>
    <div class="care-block">
      <h4>${t('light')}</h4>
      <p>${p.lightFull}</p>
    </div>
    <div class="care-block">
      <h4>${t('humidity')} <small>${t('cond.norm', { min: p.humMin, max: p.humMax, unit: ' %' })}</small></h4>
      <p>${p.humidityFull}</p>
    </div>
    <div class="care-block">
      <h4>${t('temperature')} <small>${t('cond.norm', { min: p.tempMin, max: p.tempMax, unit: ' °C' })}</small></h4>
      <p>${p.temperatureFull}</p>
    </div>
    <div class="care-block">
      <h4>${t('tips')}</h4>
      <ul class="tips">${(p.careTips || []).map((tip) => `<li>${escHtml(tip)}</li>`).join('')}</ul>
    </div>
  </div>

  <div class="m-section">
    <h3>${t('nowCond')}</h3>
    <div class="cond-list">
      <div class="cond-row"><span>${t('street')}</span><b class="now">${state.weather ? `${state.weather.temp}°, ${state.weather.hum}%` : t('cond.none')}</b></div>
      ${statusLine(t('temperature'), c.effTemp, c.tempStatus, '°', p.tempMin, p.tempMax)}
      ${statusLine(t('humidity'), c.effHum, c.humStatus, '%', p.humMin, p.humMax)}
    </div>
    <form class="env-form" id="envForm">
      <label>${t('roomC')} <input type="number" step="0.5" min="-30" max="50" id="envTemp" value="${p.envTemp ?? ''}" placeholder="${c.tempSource === 'weather' ? t('likeStreet') : '—'}"></label>
      <label>${t('atPlant')} <input type="number" step="1" min="0" max="100" id="envHum" value="${p.envHumidity ?? ''}" placeholder="${c.humSource === 'weather' ? t('likeStreet') : '—'}"></label>
      <button class="btn btn-ghost" type="submit">${t('save')}</button>
    </form>
    <div class="cond-hint">${t('cond.hint')}</div>
    <div class="interval-box">
      <div class="interval-head">
        <span>${t('interval')}</span>
        <span class="mode-switch" role="group" aria-label="${t('intervalMode')}">
          <button type="button" class="mode-btn ${p.intervalMode !== 'manual' ? 'is-on' : ''}" data-mode="smart">${t('smart')}</button>
          <button type="button" class="mode-btn ${p.intervalMode === 'manual' ? 'is-on' : ''}" data-mode="manual">${t('manual')}</button>
        </span>
      </div>
      ${p.intervalMode === 'manual'
        ? `<form class="manual-int" id="manualForm">
             ${t('everyDays')} <input type="number" id="manualInput" min="1" max="60" value="${p.manualInterval || c.recommendedInterval || p.wateringIntervalDays}"> ${t('daysShort')}
             <button class="btn btn-ghost" type="submit">${t('save')}</button>
             <small>${t('smartSuggest', { time: qty(c.recommendedInterval, 'day') })}</small>
           </form>`
        : `<div class="interval-smart">
             <b>${t('every', { time: qty(c.recommendedInterval || p.wateringIntervalDays, 'day') })}</b>
             <small>${t('baseFormula', { n: p.wateringIntervalDays, season: seasonLabel(c.season), factors: c.factors ? `×${c.factors.season} ${t('factorRest', { temp: c.factors.temp, hum: c.factors.hum })}` : '' })}</small>
           </div>`}
    </div>
  </div>

  <div class="m-section">
    <h3>${t('watering')}</h3>
    <div class="water-status ${info.state === 'due' ? 'is-due' : ''}">
      ${info.last
        ? t('lastNext', { last: fmtShort(info.last), next: info.state === 'due' ? `<b>${t('dueBang')}</b>` : fmtShort(info.due) })
        : t('water.never')}
    </div>
    <div class="water-actions">
      <button class="btn btn-water" id="waterToday">${t('waterToday')}</button>
      <div class="water-date">
        <input type="date" id="waterDate" max="${todayIso()}">
        <button class="btn btn-ghost" id="waterAdd">${t('markDate')}</button>
      </div>
    </div>
    <div class="history">
      ${history.length
        ? history.map((d) => `<span class="h-chip">${fmtShort(d)}<button data-del-water="${d}" title="${t('removeMark')}" aria-label="${t('removeWater', { date: fmtShort(d) })}">✕</button></span>`).join('')
        : `<span class="history-empty">${t('historyEmpty')}</span>`}
    </div>
  </div>

  <div class="m-section">
    <h3>${t('notes')}</h3>
    <form class="note-form" id="noteForm">
      <textarea id="noteText" rows="2" placeholder="${t('notePh')}"></textarea>
      <button class="btn btn-green" type="submit">＋</button>
    </form>
    <div class="note-list">
      ${p.notes.length
        ? p.notes.map((n) => `
          <div class="note" data-note="${n.id}">
            <div class="note-text"></div>
            <div class="note-meta">
              <span>${fmtShort(n.createdAt.slice(0, 10))}${n.updatedAt !== n.createdAt ? ` · ${t('edited')}` : ''}</span>
              <span class="spacer"></span>
              <button data-edit-note="${n.id}">${t('edit')}</button>
              <button class="del" data-del-note="${n.id}">${t('delete')}</button>
            </div>
          </div>`).join('')
        : `<div class="history-empty">${t('notesEmpty')}</div>`}
    </div>
  </div>

  ${chatSectionHtml(chats, activeChat, msgs, {
    title: t('askBotanist'),
    empty: t('botanistEmpty'),
    placeholder: t('botanistPh')
  })}`;

  // текст заметок и сообщений вставляем как textContent — без риска HTML-инъекции
  const notesEls = $('#modalContent').querySelectorAll('.note');
  notesEls.forEach((el) => {
    const n = p.notes.find((x) => x.id === el.dataset.note);
    if (n) $('.note-text', el).textContent = n.text;
  });
  fillChatMessages(msgs);

  wireModal(p);
}

/* ————— чат с LLM: общие блоки для растений и питомцев ————— */

function chatSectionHtml(chats, activeChat, msgs, opts) {
  return `
  <div class="m-section">
    <h3>${opts.title}</h3>
    <div class="chat-top">
      <select id="chatSelect" aria-label="${t('chatPick')}">
        <option value="">${t('newChat')}</option>
        ${chats.map((x) => `<option value="${x.id}" ${activeChat && x.id === activeChat.id ? 'selected' : ''}>${escHtml(x.title)} · ${fmtShort(x.updatedAt.slice(0, 10))}</option>`).join('')}
      </select>
      ${activeChat ? `<button class="btn btn-ghost" id="chatDelete" type="button">${t('delete')}</button>` : ''}
    </div>
    <div class="chat-box" id="chatBox">
      ${msgs.length
        ? msgs.map((m) => `<div class="msg ${m.role}"></div>`).join('')
        : `<div class="chat-empty">${opts.empty}</div>`}
    </div>
    <form class="chat-form" id="chatForm">
      <textarea id="chatInput" rows="1" placeholder="${opts.placeholder}" ${state.llmEnabled ? '' : 'disabled'}></textarea>
      <button class="btn btn-green" type="submit" ${state.llmEnabled ? '' : 'disabled'}>➤</button>
    </form>
    ${state.llmEnabled ? '' : `<div class="chat-note">${t('chatOff')}</div>`}
  </div>`;
}

// сообщения вставляем как textContent — без риска HTML-инъекции
function fillChatMessages(msgs) {
  $('#chatBox').querySelectorAll('.msg').forEach((el, i) => { el.textContent = msgs[i].content; });
  $('#chatBox').scrollTop = $('#chatBox').scrollHeight;
}

// opts: { bodyKey: 'plantId' | 'petId', deleteBase, rerender, typing }
function wireChat(ownerId, opts) {
  $('#chatSelect').addEventListener('change', () => {
    state.activeChat[ownerId] = $('#chatSelect').value || null;
    opts.rerender();
  });
  const chatDelete = $('#chatDelete');
  if (chatDelete) {
    chatDelete.addEventListener('click', async () => {
      try {
        const id = state.activeChat[ownerId];
        state.activeChat[ownerId] = null;
        await mutate(`${opts.deleteBase}/${id}`, { method: 'DELETE' });
      } catch (e) { toast(e.message); }
    });
  }

  // поле ввода растёт вместе с текстом
  const chatInput = $('#chatInput');
  const autogrow = () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + 'px';
  };
  chatInput.addEventListener('input', autogrow);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $('#chatForm').requestSubmit();
    }
  });

  $('#chatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.chatBusy || !state.llmEnabled) return;
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    autogrow();

    appendMsg('user', text);
    const typing = appendMsg('assistant typing', opts.typing);
    state.chatBusy = true;
    try {
      let data = await api('/api/chat', {
        method: 'POST',
        body: { [opts.bodyKey]: ownerId, chatId: state.activeChat[ownerId] || null, message: text }
      });
      if (data.relay === 'openrouter') {
        const reply = await completeOpenRouter(data.key, data.model, data.messages);
        data = await api('/api/chat/commit', {
          method: 'POST',
          body: { [opts.bodyKey]: ownerId, chatId: state.activeChat[ownerId] || null, message: text, reply }
        });
      }
      state.activeChat[ownerId] = data.chatId;
      await loadPlants();
      renderAll(); // модалка перерисуется с сохранённой историей
    } catch (err) {
      typing.textContent = '⚠️ ' + err.message;
      typing.classList.remove('typing');
      $('#chatBox').scrollTop = $('#chatBox').scrollHeight;
    } finally {
      state.chatBusy = false;
    }
  });
}

function wireModal(p) {
  $('#deletePlantBtn').addEventListener('click', () => deletePlant(p.id));

  // возраст
  $('#ageEdit').addEventListener('click', () => {
    $('#ageBox').innerHTML = `
      <span>${t('inHome')}</span>
      ${dateSlotHtml('ageInput', p.acquiredAt, `max="${todayIso()}"`)}
      <button id="ageSave">✓</button>`;
    bindDateFaces($('#ageBox'));
    $('#ageSave').addEventListener('click', async () => {
      try {
        await mutate(`/api/plants/${p.id}`, { method: 'PATCH', body: { acquiredAt: $('#ageInput').value } });
      } catch (e) { toast(e.message); }
    });
  });

  // сердечки здоровья: клик по текущей оценке снижает её на 1 (так можно дойти до 0)
  $('#modalContent').querySelectorAll('[data-heart]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const n = Number(btn.dataset.heart);
      const health = n === p.health ? n - 1 : n;
      try {
        await mutate(`/api/plants/${p.id}`, { method: 'PATCH', body: { health } });
      } catch (e) { toast(e.message); }
    });
  });

  // режим интервала полива
  $('#modalContent').querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const mode = btn.dataset.mode;
      if ((p.intervalMode === 'manual') === (mode === 'manual')) return;
      const body = { intervalMode: mode };
      // при первом переключении на ручной режим стартуем с умного значения
      if (mode === 'manual' && !p.manualInterval) {
        body.manualInterval = (p.computed && p.computed.recommendedInterval) || p.wateringIntervalDays;
      }
      try {
        await mutate(`/api/plants/${p.id}`, { method: 'PATCH', body });
      } catch (e) { toast(e.message); }
    });
  });
  const manualForm = $('#manualForm');
  if (manualForm) {
    manualForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = Number($('#manualInput').value);
      try {
        await mutate(`/api/plants/${p.id}`, { method: 'PATCH', body: { manualInterval: v } });
        toast(t('waterToast', { time: qty(v, 'day') }));
      } catch (err) { toast(err.message); }
    });
  }

  // условия у растения
  $('#envForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const num = (v) => (v.trim() === '' ? null : Number(v));
    try {
      await mutate(`/api/plants/${p.id}`, {
        method: 'PATCH',
        body: { envTemp: num($('#envTemp').value), envHumidity: num($('#envHum').value) }
      });
      toast(t('condSaved'));
    } catch (err) { toast(err.message); }
  });

  // полив
  $('#waterToday').addEventListener('click', () => addWatering(p.id, todayIso()));
  $('#waterAdd').addEventListener('click', () => {
    const v = $('#waterDate').value;
    if (v) addWatering(p.id, v); else toast(t('pickDate'));
  });
  $('#modalContent').querySelectorAll('[data-del-water]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await mutate(`/api/plants/${p.id}/waterings/${btn.dataset.delWater}`, { method: 'DELETE' });
      } catch (e) { toast(e.message); }
    });
  });

  // заметки
  $('#noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = $('#noteText').value.trim();
    if (!text) return;
    try {
      await mutate(`/api/plants/${p.id}/notes`, { method: 'POST', body: { text } });
    } catch (err) { toast(err.message); }
  });
  $('#modalContent').querySelectorAll('[data-del-note]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await mutate(`/api/plants/${p.id}/notes/${btn.dataset.delNote}`, { method: 'DELETE' });
      } catch (e) { toast(e.message); }
    });
  });
  $('#modalContent').querySelectorAll('[data-edit-note]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const noteEl = btn.closest('.note');
      const note = p.notes.find((n) => n.id === btn.dataset.editNote);
      noteEl.innerHTML = `
        <textarea></textarea>
        <div class="edit-actions">
          <button class="btn btn-green save">${t('save')}</button>
          <button class="btn btn-ghost cancel">${t('cancel')}</button>
        </div>`;
      const ta = $('textarea', noteEl);
      ta.value = note.text;
      ta.focus();
      $('.save', noteEl).addEventListener('click', async () => {
        try {
          await mutate(`/api/plants/${p.id}/notes/${note.id}`, { method: 'PATCH', body: { text: ta.value } });
        } catch (e) { toast(e.message); }
      });
      $('.cancel', noteEl).addEventListener('click', renderModal);
    });
  });

  // чат с ботаником
  wireChat(p.id, {
    bodyKey: 'plantId',
    deleteBase: `/api/plants/${p.id}/chats`,
    rerender: renderModal,
    typing: t('botanistTyping')
  });
}

function appendMsg(cls, text) {
  const box = $('#chatBox');
  const empty = $('.chat-empty', box);
  if (empty) empty.remove();
  const el = document.createElement('div');
  el.className = 'msg ' + cls;
  el.textContent = text;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
  return el;
}

async function addWatering(plantId, date) {
  if (date > todayIso()) { toast(t('futureMark')); return; }
  try {
    await mutate(`/api/plants/${plantId}/waterings`, { method: 'POST', body: { date } });
    toast(t('waterMarked', { date: fmtShort(date) }));
  } catch (e) { toast(e.message); }
}

/* ————— добавление и удаление ————— */

function artIds() {
  return window.PLANT_GALLERY_IDS || state.catalog.plantArtIds || [];
}

function emojiButtonHtml(inputId, selected) {
  const val = selected || '⭐';
  return `<button type="button" class="emoji-launch" data-emoji-for="${inputId}" aria-label="${t('pickEmoji')}">${val}</button><input type="hidden" id="${inputId}" value="${escHtml(val)}">`;
}

function openEmojiSheet(inputId) {
  const emojis = state.catalog.emojis || [];
  const current = document.getElementById(inputId)?.value;
  let backdrop = document.getElementById('emojiBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'emojiBackdrop';
    backdrop.className = 'emoji-sheet-backdrop';
    document.body.appendChild(backdrop);
  }
  backdrop.hidden = false;
  backdrop.innerHTML = `
    <div class="emoji-sheet" role="dialog" aria-modal="true" aria-label="${t('emojiSheet')}">
      <div class="emoji-sheet-head">
        <b>${t('emoji')}</b>
        <button type="button" class="emoji-sheet-close" aria-label="${t('close')}">✕</button>
      </div>
      <div class="emoji-sheet-grid">${emojis.map((e) =>
        `<button type="button" class="emoji-cell ${e === current ? 'is-on' : ''}">${e}</button>`).join('')}</div>
    </div>`;
  const close = () => { backdrop.hidden = true; };
  $('.emoji-sheet-close', backdrop).addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelectorAll('.emoji-cell').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(inputId);
      const launch = document.querySelector(`[data-emoji-for="${inputId}"]`);
      if (input) input.value = btn.textContent;
      if (launch) launch.textContent = btn.textContent;
      close();
    });
  });
}

function wireEmojiButtons(root) {
  root.querySelectorAll('.emoji-launch').forEach((btn) => {
    btn.addEventListener('click', () => openEmojiSheet(btn.dataset.emojiFor));
  });
}

function closeForm() {
  state.formKind = null;
  closeAcquiredPicker();
  $('#formBackdrop').hidden = true;
  document.body.style.overflow = (state.openPlantId || state.openPetId) ? 'hidden' : '';
}

function openForm(kind) {
  state.formKind = kind;
  state._acquiredAt = todayIso();
  state._acqCursor = startOfMonth(fromIso(state._acquiredAt));
  state._plantArt = artIds()[0] || 'monstera';
  const accents = (state.catalog.accents && state.catalog.accents.length)
    ? state.catalog.accents
    : ['#3BA55D', '#F5A503', '#FF5C39', '#A96FD6', '#3E8EDE', '#F0567E', '#F2C230', '#9BC53D'];
  state._plantAccent = accents[Math.floor(Math.random() * accents.length)];
  state._petKind = (state.catalog.petSpecies[0] && state.catalog.petSpecies[0].kind) || 'hamster';
  state._petCustom = [];
  $('#formBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
  renderForm();
}

function renderForm() {
  if (state.formKind === 'plant') renderAddPlantForm();
  else if (state.formKind === 'pet') renderAddPetForm();
}

function plantMeta(id) {
  return (state.catalog.plantMeta && state.catalog.plantMeta[id]) || null;
}

function plantLabel(id) {
  const translated = typeof I18N_NAMES !== 'undefined' && I18N_NAMES[lang] && I18N_NAMES[lang][id];
  if (lang !== 'ru' && translated) return translated;
  const meta = plantMeta(id);
  if (meta && meta.name) return meta.name;
  return translated || (window.PLANT_LABELS && window.PLANT_LABELS[id]) || id;
}
function displayPlantName(p) {
  const meta = plantMeta(p.artId);
  const ru = meta && meta.name;
  if (!ru || lang === 'ru') return p.name;
  const numbered = String(p.name).match(/^(.*) \[(\d+)\]$/);
  const base = numbered ? numbered[1] : p.name;
  if (base !== ru) return p.name;
  const label = plantLabel(p.artId);
  return numbered ? `${label} [${numbered[2]}]` : label;
}
function speciesLabel(kind, fallback) {
  const translated = typeof I18N_PETS !== 'undefined' && I18N_PETS[lang] && I18N_PETS[lang][kind];
  if (lang !== 'ru' && translated) return translated;
  return fallback || translated || kind;
}
function lightPack(id) {
  const pack = typeof I18N_LIGHTS !== 'undefined' && I18N_LIGHTS[lang] && I18N_LIGHTS[lang][id];
  return pack || null;
}
function lightChoice(item) {
  const pack = lang !== 'ru' ? lightPack(item.id) : null;
  return pack ? { short: pack[0], full: pack[1] } : { short: item.short, full: item.full };
}
const RU_LIGHT = {
  'Много яркого света': 'bright',
  'Яркий рассеянный': 'diffused',
  'Полутень': 'partial',
  'Тень': 'shade',
  'Прямое солнце': 'sun'
};
const RU_TASK = { protein: 'Дать белок', veggies: 'Овощи и фрукты', nuts: 'Орехи' };
function taskLabel(task) {
  if (task.id === 'water' || task.id === 'food') return t('task.' + task.id);
  if (RU_TASK[task.id] && task.name === RU_TASK[task.id]) return t('task.' + task.id);
  return task.name;
}
function seasonLabel(name) {
  const id = { 'весна': 'spring', 'лето': 'summer', 'осень': 'autumn', 'зима': 'winter' }[name];
  return id ? t('season.' + id) : (name || '—');
}
function stageLabel(pet, computed) {
  if (pet.kind === 'hamster' && computed && computed.stage) return t('stage.' + computed.stage);
  return speciesLabel(pet.kind, pet.species);
}
function petTipList(pet) {
  const c = pet.computed || {};
  const season = { 'весна': 'spring', 'лето': 'summer', 'осень': 'autumn', 'зима': 'winter' }[c.season];
  const pack = typeof I18N_TIPS !== 'undefined' && I18N_TIPS[lang];
  if (!pack || !season || lang === 'ru') return c.tips || [];
  if (pet.kind === 'hamster' && pack.hamsterSeason && pack.hamsterAge) {
    return [...(pack.hamsterSeason[season] || []), ...(pack.hamsterAge[c.stage] || [])];
  }
  const species = pack.species && pack.species[pet.kind] && pack.species[pet.kind][season];
  const line = t('pet.ageLine', { age: petAgeText(pet.birthDate, c.ageMonths || 0) });
  return species ? [...species, line] : (c.tips || []);
}
function viewPlant(p) {
  const named = { ...p, name: displayPlantName(p) };
  if (lang === 'ru') return named;
  const care = typeof CARE !== 'undefined' && ((CARE[lang] && CARE[lang][p.artId]) || (CARE.en && CARE.en[p.artId]));
  const custom = p.careTips && String(p.careTips[0] || '').startsWith('Параметры ухода');
  if (p.artId !== 'other' && care && !custom) return { ...named, ...care };
  if (p.artId === 'other' || custom) {
    const lightId = RU_LIGHT[p.lightShort];
    const light = lightId && lightPack(lightId);
    return {
      ...named,
      lightShort: light ? light[0] : p.lightShort,
      lightFull: light ? light[1] : p.lightFull,
      humidityFull: t('care.customHum', { min: p.humMin, max: p.humMax }),
      temperatureFull: t('care.customTemp', { min: p.tempMin, max: p.tempMax }),
      careTips: [t('care.custom')]
    };
  }
  return named;
}

function plantLatin(id) {
  const meta = plantMeta(id);
  if (meta && meta.latin) return meta.latin;
  return '';
}

function renderAcquiredCalendar() {
  const cur = state._acqCursor || startOfMonth(new Date());
  const today = todayIso();
  const selected = state._acquiredAt || today;
  $('#dateTitleMonth').textContent = monthTitle(cur);
  $('#dateWeekdays').innerHTML = weekdayLabels().map((d) => `<div>${d}</div>`).join('');
  const first = new Date(cur.getFullYear(), cur.getMonth(), 1);
  const startPad = (first.getDay() + 6) % 7;
  const days = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  let html = '';
  for (let i = 0; i < startPad; i++) html += '<button type="button" class="cal-day is-other" disabled>·</button>';
  for (let day = 1; day <= days; day++) {
    const iso = toIso(new Date(cur.getFullYear(), cur.getMonth(), day));
    const future = iso > today;
    const cls = ['cal-day', iso === today && 'is-today', iso === selected && 'is-selected'].filter(Boolean).join(' ');
    html += `<button type="button" class="${cls}" data-acq="${iso}" ${future ? 'disabled' : ''}>${day}</button>`;
  }
  $('#dateGrid').innerHTML = html;
  $('#dateGrid').querySelectorAll('[data-acq]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state._acquiredAt = btn.dataset.acq;
      const label = $('#acquiredBtn');
      if (label) label.textContent = t('inHomeBtn', { date: fmtLong(state._acquiredAt) });
      closeAcquiredPicker();
    });
  });
  const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  $('#dateNext').disabled = toIso(next) > today;
}

function openAcquiredPicker() {
  if (!state._acqCursor) state._acqCursor = startOfMonth(fromIso(state._acquiredAt || todayIso()));
  $('#dateBackdrop').hidden = false;
  renderAcquiredCalendar();
}

function closeAcquiredPicker() {
  const layer = $('#dateBackdrop');
  if (layer) layer.hidden = true;
}

function renderAddPlantForm() {
  const ids = artIds();
  const sel = state._plantArt || ids[0];
  const lights = state.catalog.lights || [];
  const accent = state._plantAccent || '#3BA55D';
  const other = sel === 'other';
  $('#formContent').innerHTML = `
    <form id="addPlantForm">
      <div class="m-hero" id="plantFormHero" style="--accent:${accent}">
        <div class="form-preview" id="plantPreview">${PLANT_ART[sel] || ''}</div>
        <div class="m-titles">
          <h2 id="modalTitle">${t('newPlant')}</h2>
          <div class="plant-latin" id="plantPreviewName">${plantLabel(sel)}</div>
          <div class="plant-latin" id="plantPreviewLatin">${plantLatin(sel)}</div>
        </div>
      </div>
      <div class="m-section">
        <h3>${t('plant')}</h3>
        <div class="art-grid" id="artGrid">${ids.map((id) =>
          `<button type="button" class="art-pick ${id === sel ? 'is-on' : ''}" data-art="${id}">
            <span class="art-thumb">${PLANT_ART[id] || ''}</span>
            <span class="art-name">${plantLabel(id)}</span>
          </button>`).join('')}</div>
      </div>
      <div class="m-section">
        <h3>${t('inHome')}</h3>
        <button type="button" class="btn btn-ghost acquired-btn" id="acquiredBtn">${t('inHomeBtn', { date: fmtLong(state._acquiredAt || todayIso()) })}</button>
      </div>
      <div id="otherFields" ${other ? '' : 'hidden'}>
        <div class="m-section">
          <h3>${t('name')}</h3>
          <input class="field-input" type="text" id="newPlantName" maxlength="80" placeholder="${t('namePh')}">
        </div>
        <div class="m-section">
          <h3>${t('lightTitle')}</h3>
          <select class="field-input" id="newPlantLight">${lights.map((item) =>
            `<option value="${item.id}">${escHtml(lightChoice(item).short)}</option>`).join('')}</select>
          <p class="form-note" id="lightHint">${lights[0] ? escHtml(lightChoice(lights[0]).full) : ''}</p>
        </div>
        <div class="m-section">
          <h3>${t('tempTitle')}</h3>
          <div class="field-row">
            <label>${t('minC')}<input class="field-input" type="number" id="newTempMin" value="18" step="1"></label>
            <label>${t('maxC')}<input class="field-input" type="number" id="newTempMax" value="26" step="1"></label>
          </div>
        </div>
        <div class="m-section">
          <h3>${t('wateringTitle')}</h3>
          <label class="inline-field">${t('everyDays')} <input class="field-input field-num" type="number" id="newWaterDays" min="1" max="60" value="7"> ${t('daysShort')}</label>
        </div>
      </div>
      <div class="m-section">
        <button class="btn btn-green form-submit" type="submit">${t('savePlant')}</button>
      </div>
    </form>`;
  const syncPreview = () => {
    const id = state._plantArt;
    const isOther = id === 'other';
    $('#otherFields').hidden = !isOther;
    const typed = $('#newPlantName') ? $('#newPlantName').value.trim() : '';
    $('#plantPreviewName').textContent = isOther ? (typed || plantLabel('other')) : plantLabel(id);
    $('#plantPreviewLatin').textContent = isOther ? t('otherLatin') : plantLatin(id);
    $('#plantPreview').innerHTML = PLANT_ART[id] || '';
  };
  $('#artGrid').querySelectorAll('.art-pick').forEach((btn) => {
    btn.addEventListener('click', () => {
      state._plantArt = btn.dataset.art;
      $('#artGrid').querySelectorAll('.art-pick').forEach((b) => b.classList.toggle('is-on', b === btn));
      syncPreview();
    });
  });
  $('#newPlantName').addEventListener('input', syncPreview);
  $('#newPlantLight').addEventListener('change', () => {
    const item = lights.find((entry) => entry.id === $('#newPlantLight').value);
    $('#lightHint').textContent = item ? lightChoice(item).full : '';
  });
  $('#acquiredBtn').addEventListener('click', openAcquiredPicker);
  $('#addPlantForm').addEventListener('submit', submitAddPlant);
}

async function submitAddPlant(e) {
  e.preventDefault();
  const artId = state._plantArt;
  const other = artId === 'other';
  const body = {
    artId,
    accent: state._plantAccent,
    acquiredAt: state._acquiredAt || todayIso()
  };
  if (other) {
    body.name = $('#newPlantName').value.trim();
    body.lightId = $('#newPlantLight').value;
    body.tempMin = Number($('#newTempMin').value);
    body.tempMax = Number($('#newTempMax').value);
    body.wateringIntervalDays = Number($('#newWaterDays').value);
  }
  try {
    await mutate('/api/plants', { method: 'POST', body });
    closeForm();
    toast(t('plantAdded'));
  } catch (err) { toast(err.message); }
}

function snapshotPetDraft() {
  if (!$('#newPetName')) return;
  state._petDraft = {
    name: $('#newPetName').value,
    birth: $('#newPetBirth').value,
    water: $('#newWaterInt').value,
    food: $('#newFoodInt').value
  };
  const rows = $('#customTaskList') ? $('#customTaskList').querySelectorAll('.custom-task-row') : [];
  state._petCustom = [...rows].map((row, i) => ({
    name: $('[data-field="name"]', row).value,
    emoji: document.getElementById(`customEmoji${i}`)?.value || '⭐',
    intervalDays: Number($('[data-field="days"]', row).value) || 3
  }));
}

function renderAddPetForm() {
  const species = state.catalog.petSpecies || [];
  const custom = state._petCustom || [];
  const draft = state._petDraft || {};
  const spec = species.find((s) => s.kind === state._petKind) || species[0];
  $('#formContent').innerHTML = `
    <form id="addPetForm">
      <div class="m-hero" style="--accent:${spec ? spec.accent : '#C98A4B'}">
        <div class="form-preview" id="petPreview">${petArt({ id: '', kind: state._petKind })}</div>
        <div class="m-titles">
          <h2>${t('newPet')}</h2>
          <div class="plant-latin" id="petPreviewName">${spec ? escHtml(speciesLabel(spec.kind, spec.species)) : ''}</div>
        </div>
      </div>
      <div class="m-section">
        <h3>${t('nickname')}</h3>
        <input class="field-input" type="text" id="newPetName" required maxlength="60" value="${escHtml(draft.name || '')}" placeholder="${t('nickPh')}">
      </div>
      <div class="m-section">
        <h3>${t('species')}</h3>
        <div class="species-grid" id="speciesGrid">${species.map((s) =>
          `<button type="button" class="species-pick ${s.kind === state._petKind ? 'is-on' : ''}" data-kind="${s.kind}">
            <span class="species-art">${petArt({ id: '', kind: s.kind })}</span>
            <span>${escHtml(speciesLabel(s.kind, s.species))}</span>
          </button>`).join('')}</div>
      </div>
      <div class="m-section">
        <h3>${t('birth')}</h3>
        ${dateSlotHtml('newPetBirth', draft.birth || todayIso(), `max="${todayIso()}" required aria-label="${t('birth')}"`)}
      </div>
      <div class="m-section">
        <h3>${t('waterFood')}</h3>
        <div class="field-row">
          <label>${t('waterEvery')}<input class="field-input" type="number" id="newWaterInt" min="1" max="60" value="${draft.water || 1}"></label>
          <label>${t('foodEvery')}<input class="field-input" type="number" id="newFoodInt" min="1" max="60" value="${draft.food || 1}"></label>
        </div>
      </div>
      <div class="m-section">
        <h3>${t('extraTasks')}</h3>
        <p class="form-note">${t('extraNote')}</p>
        ${custom.length < 6 ? `<button type="button" class="btn btn-ghost" id="addCustomTask">${t('addTask')}</button>` : ''}
        <div id="customTaskList"></div>
        <button class="btn btn-green form-submit" type="submit">${t('savePet')}</button>
      </div>
    </form>`;
  const list = $('#customTaskList');
  custom.forEach((row, i) => {
    const el = document.createElement('div');
    el.className = 'custom-task-row';
    el.dataset.idx = String(i);
    el.innerHTML = `
      ${emojiButtonHtml(`customEmoji${i}`, row.emoji)}
      <input type="text" value="${escHtml(row.name)}" data-field="name" placeholder="${t('taskNamePh')}">
      <label class="custom-days">${t('everyDays')} <input type="number" data-field="days" min="1" max="60" value="${row.intervalDays}"> ${t('daysShort')}</label>
      <button type="button" class="btn btn-ghost" data-rm-custom="${i}" aria-label="${t('removeTask')}">✕</button>`;
    list.appendChild(el);
  });
  $('#formContent').querySelectorAll('.species-pick').forEach((btn) => {
    btn.addEventListener('click', () => {
      state._petKind = btn.dataset.kind;
      const spec = (state.catalog.petSpecies || []).find((s) => s.kind === state._petKind);
      $('#formContent').querySelectorAll('.species-pick').forEach((b) => b.classList.toggle('is-on', b === btn));
      $('#petPreview').innerHTML = petArt({ id: '', kind: state._petKind });
      if (spec) {
        $('#petPreviewName').textContent = speciesLabel(spec.kind, spec.species);
        $('.m-hero', $('#formContent')).style.setProperty('--accent', spec.accent);
      }
    });
  });
  const addCustom = $('#addCustomTask');
  if (addCustom) {
    addCustom.addEventListener('click', () => {
      snapshotPetDraft();
      state._petCustom.push({ name: '', emoji: '⭐', intervalDays: 3 });
      renderAddPetForm();
    });
  }
  list.querySelectorAll('[data-rm-custom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      snapshotPetDraft();
      state._petCustom.splice(Number(btn.dataset.rmCustom), 1);
      renderAddPetForm();
    });
  });
  bindDateFaces($('#addPetForm'));
  wireEmojiButtons($('#addPetForm'));
  $('#addPetForm').addEventListener('submit', submitAddPet);
}

function collectCustomTasks() {
  const rows = $('#customTaskList') ? $('#customTaskList').querySelectorAll('.custom-task-row') : [];
  const out = [];
  rows.forEach((row, i) => {
    const name = $('[data-field="name"]', row).value.trim();
    const emojiEl = document.getElementById(`customEmoji${i}`);
    const emoji = emojiEl ? emojiEl.value : '⭐';
    const intervalDays = Number($('[data-field="days"]', row).value);
    if (name) out.push({ name, emoji, intervalDays });
  });
  return out;
}

async function submitAddPet(e) {
  e.preventDefault();
  const body = {
    kind: state._petKind,
    name: $('#newPetName').value.trim(),
    birthDate: $('#newPetBirth').value,
    waterIntervalDays: Number($('#newWaterInt').value),
    foodIntervalDays: Number($('#newFoodInt').value),
    customTasks: collectCustomTasks()
  };
  try {
    await mutate('/api/pets', { method: 'POST', body });
    state._petCustom = [];
    closeForm();
    toast(t('petAdded'));
  } catch (err) { toast(err.message); }
}

function askConfirm(title, text) {
  return new Promise((resolve) => {
    const backdrop = $('#confirmBackdrop');
    $('#confirmTitle').textContent = title;
    $('#confirmText').textContent = text;
    backdrop.hidden = false;
    const okBtn = $('#confirmOk');
    const cancelBtn = $('#confirmCancel');
    const finish = (ok) => {
      backdrop.hidden = true;
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      backdrop.removeEventListener('click', onBackdrop);
      resolve(ok);
    };
    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    const onBackdrop = (event) => { if (event.target === backdrop) finish(false); };
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    backdrop.addEventListener('click', onBackdrop);
  });
}

async function deletePlant(id) {
  const plant = state.plants.find((item) => item.id === id);
  const ok = await askConfirm(
    t('deletePlantQ'),
    plant ? t('deletePlantBody', { name: displayPlantName(plant) }) : t('deletePlantFallback')
  );
  if (!ok) return;
  try {
    state.openPlantId = null;
    closeModal();
    await mutate(`/api/plants/${id}`, { method: 'DELETE' });
    toast(t('plantDeleted'));
  } catch (err) { toast(err.message); }
}

async function deletePet(id) {
  const pet = state.pets.find((item) => item.id === id);
  const ok = await askConfirm(
    t('deletePetQ'),
    pet ? t('deletePetBody', { name: pet.name }) : t('deletePetFallback')
  );
  if (!ok) return;
  try {
    state.openPetId = null;
    closeModal();
    await mutate(`/api/pets/${id}`, { method: 'DELETE' });
    toast(t('petDeleted'));
  } catch (err) { toast(err.message); }
}

/* ————— общий рендер и запуск ————— */

function renderAll() {
  applyChrome();
  renderCalendar();
  renderWeather();
  renderToday();
  renderGrid();
  renderPets();
  if (state.openPlantId) renderModal();
  if (state.openPetId) renderPetModal();
}

$('#calPrev').addEventListener('click', () => {
  state.calCursor = new Date(state.calCursor.getFullYear(), state.calCursor.getMonth() - 1, 1);
  renderCalendar();
});
$('#calNext').addEventListener('click', () => {
  state.calCursor = new Date(state.calCursor.getFullYear(), state.calCursor.getMonth() + 1, 1);
  renderCalendar();
});
$('#modalClose').addEventListener('click', closeModal);
$('#formClose').addEventListener('click', closeForm);
$('#dateClose').addEventListener('click', closeAcquiredPicker);
$('#datePrev').addEventListener('click', () => {
  state._acqCursor = new Date(state._acqCursor.getFullYear(), state._acqCursor.getMonth() - 1, 1);
  renderAcquiredCalendar();
});
$('#dateNext').addEventListener('click', () => {
  const next = new Date(state._acqCursor.getFullYear(), state._acqCursor.getMonth() + 1, 1);
  if (toIso(next) > todayIso()) return;
  state._acqCursor = next;
  renderAcquiredCalendar();
});
$('#dateBackdrop').addEventListener('click', (e) => {
  if (e.target === $('#dateBackdrop')) closeAcquiredPicker();
});
$('#addPlantBtn').addEventListener('click', () => openForm('plant'));
$('#addPetBtn').addEventListener('click', () => openForm('pet'));
$('#formBackdrop').addEventListener('pointerdown', (e) => {
  if (e.target === e.currentTarget) closeForm();
});

// Закрываем модалку только если нажатие началось И закончилось на подложке:
// выделение текста с уходом курсора за модалку не должно её закрывать
let pressStartedOnBackdrop = false;
$('#modalBackdrop').addEventListener('pointerdown', (e) => {
  pressStartedOnBackdrop = e.target === e.currentTarget;
});
$('#modalBackdrop').addEventListener('pointerup', (e) => {
  if (pressStartedOnBackdrop && e.target === e.currentTarget) closeModal();
  pressStartedOnBackdrop = false;
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('#dateBackdrop') && !$('#dateBackdrop').hidden) {
    closeAcquiredPicker();
    return;
  }
  if (state.swipeOpen && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    e.preventDefault();
    commitSwipe(e.key === 'ArrowRight' ? 'right' : 'left');
    return;
  }
  if (e.key !== 'Escape') return;
  if (state.swipeOpen) { closeSwipe(); return; }
  if (!$('#confirmBackdrop').hidden) { $('#confirmCancel').click(); return; }
  if (state.formKind) closeForm();
  else if (state.openPlantId || state.openPetId) closeModal();
});

/* ————— pull-to-refresh: свайп вниз наверху страницы обновляет приложение ————— */

(function initPullToRefresh() {
  const el = document.createElement('div');
  el.className = 'ptr';
  el.innerHTML = '<span class="ptr-icon">↓</span>';
  document.body.appendChild(el);
  const icon = el.querySelector('.ptr-icon');

  const THRESHOLD = 80; // насколько нужно потянуть, чтобы сработало
  let startY = null, pull = 0, active = false, refreshing = false;

  const reset = () => {
    el.classList.remove('is-visible', 'is-ready');
    el.style.transform = '';
    active = false;
    pull = 0;
  };

  // тянуть можно только с самого верха страницы, когда нет модалки и пин-экрана
  const canStart = () =>
    !refreshing &&
    document.scrollingElement.scrollTop <= 0 &&
    $('#modalBackdrop').hidden &&
    $('#swipeLayer').hidden;

  document.addEventListener('touchstart', (e) => {
    startY = canStart() ? e.touches[0].clientY : null;
    active = false;
    pull = 0;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (startY == null || refreshing) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0 || document.scrollingElement.scrollTop > 0) {
      if (active) reset();
      return;
    }
    active = true;
    pull = Math.min(dy * 0.45, 130); // «сопротивление», как у нативного жеста
    el.classList.add('is-visible');
    el.classList.toggle('is-ready', pull >= THRESHOLD);
    el.style.transform = `translateY(${pull}px)`;
  }, { passive: true });

  const end = () => {
    if (startY == null) return;
    startY = null;
    if (!active) return;
    if (pull >= THRESHOLD) {
      refreshing = true;
      icon.textContent = '↻';
      el.classList.add('is-refreshing');
      el.style.transform = `translateY(${THRESHOLD}px)`;
      location.reload();
    } else {
      reset();
    }
  };
  document.addEventListener('touchend', end);
  document.addEventListener('touchcancel', end);
})();

/* ————— колода свайпов: одно дело — одна карточка ————— */

let swipeQueue = [];
let swipeBusy = false;
let swipeToken = 0;

function dueSubtitle(info, emptyText) {
  if (!info.last) return emptyText;
  const overdueDays = -info.daysLeft;
  if (overdueDays > 0) return t('water.overdue', { time: qty(overdueDays, 'day') });
  return t('water.scheduled');
}

function collectDueCards() {
  const cards = [];
  for (const p of state.plants) {
    const info = waterInfo(p);
    if (info.state !== 'due') continue;
    cards.push({
      kind: 'plant',
      id: p.id,
      name: displayPlantName(p),
      who: t('swipe.plant'),
      action: t('swipe.water'),
      emoji: '💧',
      accent: p.accent,
      art: plantArt(p),
      sub: dueSubtitle(info, t('water.first'))
    });
  }
  for (const pet of state.pets) {
    for (const task of pet.tasks || []) {
      const info = taskInfo(task);
      if (info.state !== 'due') continue;
      cards.push({
        kind: 'pet',
        id: pet.id,
        taskId: task.id,
        name: pet.name,
        who: t('swipe.pet'),
        action: taskLabel(task),
        emoji: task.emoji || '⭐',
        accent: pet.accent,
        art: petArt(pet),
        sub: dueSubtitle(info, t('task.never'))
      });
    }
  }
  return cards;
}

function swipeCardHtml(card, depth) {
  return `
    <article class="swipe-card${depth === 0 ? ' is-top' : ''}" data-depth="${depth}" style="--accent:${card.accent || '#2E9E52'}">
      <div class="swipe-art">${card.art || ''}</div>
      <div class="swipe-body">
        <div class="swipe-who">${escHtml(card.who)}</div>
        <h2>${escHtml(card.name)}</h2>
        <p class="swipe-action">${card.emoji} ${escHtml(card.action)}</p>
        <p class="swipe-sub">${escHtml(card.sub)}</p>
        ${depth === 0 ? `<p class="swipe-hint">${t('swipe.hint')}</p>` : ''}
      </div>
      <div class="swipe-stamp swipe-stamp-yes">${t('done')}</div>
      <div class="swipe-stamp swipe-stamp-no">${t('skip')}</div>
    </article>`;
}

function renderSwipeStack() {
  const stack = $('#swipeStack');
  const actions = $('#swipeActions');
  if (!swipeQueue.length) {
    $('#swipeCount').textContent = '';
    actions.hidden = true;
    stack.innerHTML = `<div class="swipe-empty"><b>${t('swipe.emptyTitle')}</b><span>${t('swipe.emptySub')}</span></div>`;
    return;
  }
  actions.hidden = false;
  $('#swipeCount').textContent = `${swipeQueue.length} ${qtyWord(swipeQueue.length, 'taskword')}`;
  const shown = swipeQueue.slice(0, 3);
  stack.innerHTML = shown.map((card, i) => swipeCardHtml(card, i)).reverse().join('');
  wireTopSwipeCard();
}

function wireTopSwipeCard() {
  const card = $('#swipeStack .is-top');
  if (!card) return;
  const yes = card.querySelector('.swipe-stamp-yes');
  const no = card.querySelector('.swipe-stamp-no');
  let startX = 0;
  let dx = 0;
  let dragging = false;
  let pid = null;

  card.addEventListener('pointerdown', (e) => {
    if (swipeBusy || (e.button != null && e.button !== 0)) return;
    dragging = true;
    pid = e.pointerId;
    startX = e.clientX;
    dx = 0;
    card.setPointerCapture(pid);
    card.classList.add('is-dragging');
  });
  card.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== pid) return;
    dx = e.clientX - startX;
    const rot = Math.max(-16, Math.min(16, dx / 18));
    card.style.transform = `translate(${dx}px, 0) rotate(${rot}deg)`;
    const t = Math.min(1, Math.abs(dx) / 120);
    yes.style.opacity = dx > 0 ? String(t) : '0';
    no.style.opacity = dx < 0 ? String(t) : '0';
  });
  const end = (e) => {
    if (!dragging || e.pointerId !== pid) return;
    dragging = false;
    card.classList.remove('is-dragging');
    if (dx > 110) commitSwipe('right');
    else if (dx < -110) commitSwipe('left');
    else {
      card.style.transform = '';
      yes.style.opacity = '0';
      no.style.opacity = '0';
    }
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}

function openSwipe() {
  state.swipeOpen = true;
  swipeBusy = false;
  swipeToken += 1;
  swipeQueue = collectDueCards();
  $('#swipeLayer').hidden = false;
  document.body.style.overflow = 'hidden';
  renderSwipeStack();
}

function closeSwipe() {
  state.swipeOpen = false;
  swipeBusy = false;
  swipeToken += 1;
  swipeQueue = [];
  const layer = $('#swipeLayer');
  if (layer) layer.hidden = true;
  if (!state.openPlantId && !state.openPetId && !state.formKind) document.body.style.overflow = '';
}

async function commitSwipe(dir) {
  if (!state.swipeOpen || swipeBusy || !swipeQueue.length) return;
  swipeBusy = true;
  const token = ++swipeToken;
  const card = swipeQueue[0];
  const el = $('#swipeStack .is-top');
  if (el) {
    el.classList.remove('is-dragging');
    el.style.transition = 'transform .26s ease';
    el.style.transform = dir === 'right'
      ? 'translate(140%, 24px) rotate(18deg)'
      : 'translate(-140%, 24px) rotate(-18deg)';
    const stamp = el.querySelector(dir === 'right' ? '.swipe-stamp-yes' : '.swipe-stamp-no');
    if (stamp) stamp.style.opacity = '1';
    await new Promise((r) => setTimeout(r, 240));
  }
  if (!state.swipeOpen || token !== swipeToken) { swipeBusy = false; return; }
  if (dir === 'right') {
    try {
      const url = card.kind === 'plant'
        ? `/api/plants/${card.id}/waterings`
        : `/api/pets/${card.id}/tasks/${card.taskId}/done`;
      await mutate(url, { method: 'POST', body: { date: todayIso() } });
    } catch (err) {
      toast(err.message);
      swipeBusy = false;
      if (state.swipeOpen) renderSwipeStack();
      return;
    }
  }
  if (!state.swipeOpen || token !== swipeToken) { swipeBusy = false; return; }
  swipeQueue.shift();
  swipeBusy = false;
  renderSwipeStack();
}

/* ————— вход, регистрация, настройки ————— */

let authMode = 'login';

function showLoggedOut() {
  state.user = null;
  closeSwipe();
  const actions = $('#topbarActions');
  if (actions) actions.hidden = true;
  const screen = $('#lockScreen');
  if (screen) screen.hidden = false;
}

function setAuthMode(mode) {
  authMode = mode;
  const reg = mode === 'register';
  $('#authTitle').textContent = reg ? t('register') : t('login');
  $('#authSubmit').textContent = reg ? t('createBtn') : t('loginBtn');
  $('#authMode').textContent = reg ? t('hasAccount') : t('noAccount');
  $('#authPass').autocomplete = reg ? 'new-password' : 'current-password';
  $('#authError').hidden = true;
}

function applyChrome() {
  document.title = t('app.title');
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
  const logo = document.getElementById('logo');
  if (logo) logo.innerHTML = lang === 'ru' ? 'Поли<span>вай</span>ка' : 'Pl<span>ant</span>y';
  const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appleTitle) appleTitle.setAttribute('content', lang === 'ru' ? 'Поливайка' : 'Planty');
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const setAria = (id, text) => { const el = document.getElementById(id); if (el) el.setAttribute('aria-label', text); };
  setText('tagline', t('tagline'));
  setText('swipeBtn', t('swipe'));
  setText('settingsBtn', t('settings'));
  setText('todayTitle', t('today.title'));
  setText('plantsTitle', t('myPlants'));
  setText('addPlantBtn', t('addPlant'));
  setText('petsTitle', t('myPets'));
  setText('addPetBtn', t('addPet'));
  setText('footerBrand', t('footer'));
  setText('confirmCancel', t('keep'));
  setText('confirmOk', t('delete'));
  setText('dateTitle', t('inHome'));
  setText('authLangCaption', t('language'));
  setText('authNickLabel', t('nick'));
  setText('authPassLabel', t('password'));
  setText('swipeNo', t('skip'));
  setText('swipeYes', t('done'));
  setAria('calPrev', t('cal.prev'));
  setAria('calNext', t('cal.next'));
  setAria('datePrev', t('cal.prev'));
  setAria('dateNext', t('cal.next'));
  setAria('modalClose', t('close'));
  setAria('formClose', t('close'));
  setAria('dateClose', t('close'));
  setAria('settingsClose', t('close'));
  setAria('swipeClose', t('swipe.close'));
  setAria('calSection', t('myPlants'));
  setAria('todaySection', t('today.title'));
  setAria('plantsSection', t('myPlants'));
  setAria('petsSection', t('myPets'));
  setAria('weatherCard', t('weather.title'));
  const auth = $('#authLang');
  if (auth) auth.innerHTML = langOptionsHtml(lang);
  if ($('#authTitle')) setAuthMode(authMode);
}

async function chooseLanguage(next, saveAccount) {
  if (!LANG_IDS.includes(next)) return;
  setLang(next);
  applyChrome();
  if (!state.user) return;
  renderAll();
  if (state.formKind) renderForm();
  const swipe = $('#swipeLayer');
  if (swipe && !swipe.hidden) {
    const keep = new Set(swipeQueue.map((card) => `${card.kind}:${card.id}:${card.taskId || ''}`));
    swipeQueue = collectDueCards().filter((card) => keep.has(`${card.kind}:${card.id}:${card.taskId || ''}`));
    renderSwipeStack();
  }
  if (!saveAccount) return;
  try {
    await api('/api/settings', { method: 'POST', body: { language: next } });
    if (state.settings) state.settings.language = next;
  } catch (err) { toast(err.message); }
}

function showAuthError(message) {
  const el = $('#authError');
  el.hidden = false;
  el.textContent = message;
}

async function enterApp(user) {
  state.user = user;
  $('#lockScreen').hidden = true;
  $('#topbarActions').hidden = false;
  $('#whoName').textContent = user.nick;
  await loadPlants();
  const accountLang = state.settings && state.settings.language;
  if (accountLang && LANG_IDS.includes(accountLang)) setLang(accountLang);
  else {
    try {
      await api('/api/settings', { method: 'POST', body: { language: lang } });
      if (state.settings) state.settings.language = lang;
    } catch (_) {}
  }
  applyChrome();
  renderAll();
  if (window.matchMedia('(max-width: 720px)').matches) openSwipe();
}

function closeSettings() {
  $('#settingsBackdrop').hidden = true;
  document.body.style.overflow = (state.openPlantId || state.openPetId) ? 'hidden' : '';
}

function placeName(id, fallback) {
  const text = t('place.' + id);
  return text === 'place.' + id ? (fallback || '') : text;
}

function scopeName(scope) {
  if (scope.id === 'GIGACHAT_API_B2B') return t('scope.B2B');
  if (scope.id === 'GIGACHAT_API_CORP') return t('scope.CORP');
  return t('scope.PERS');
}

function savedModelId(ai, provider) {
  return provider === 'gigachat' ? (ai.gigachatModel || '') : (ai.openrouterModel || '');
}

function openSettings() {
  const s = state.settings || {};
  const ai = s.ai || {};
  const cat = state.catalog || {};
  const tz = s.timezone || cat.serverTimezone || '';
  const zones = cat.timezones || [];
  const provider = ai.provider === 'gigachat' ? 'gigachat' : 'openrouter';
  const saved = savedModelId(ai, provider);
  $('#settingsContent').innerHTML = `
    <form id="settingsForm">
      <div class="m-hero" style="--accent:var(--green)">
        <div class="m-titles">
          <h2 id="settingsTitle">${t('settings')}</h2>
          <div class="plant-latin">${escHtml(state.user ? state.user.nick : '')}</div>
        </div>
      </div>
      <div class="m-section">
        <h3>${t('language')}</h3>
        <select class="field-input" id="settingsLang">${langOptionsHtml(lang)}</select>
      </div>
      <div class="m-section">
        <h3>${t('tz')}</h3>
        <select class="field-input" id="tzSelect">
          ${zones.map((z) => `<option value="${escHtml(z)}" ${z === tz ? 'selected' : ''}>${escHtml(z)}${z === cat.serverTimezone ? ` · ${t('onServer')}` : ''}</option>`).join('')}
        </select>
        <p class="form-note">${t('tzNote')}</p>
      </div>
      <div class="m-section">
        <h3>${t('weatherProv')}</h3>
        <select class="field-input" id="weatherProvider">
          ${(cat.weatherProviders || []).map((p) => `<option value="${p.id}" ${p.id === (s.weatherProvider || 'open-meteo') ? 'selected' : ''}>${escHtml(p.name)} · ${escHtml(placeName(p.id, p.place))}</option>`).join('')}
        </select>
      </div>
      <div class="m-section">
        <h3>${t('llm')}</h3>
        <select class="field-input" id="aiProvider">
          <option value="openrouter" ${provider === 'openrouter' ? 'selected' : ''}>OpenRouter</option>
          <option value="gigachat" ${provider === 'gigachat' ? 'selected' : ''}>${t('sber')}</option>
        </select>
        <label class="stack-label" id="gigaScopeWrap">${t('sberAccess')}
          <select class="field-input" id="gigaScope">
            ${(cat.gigachatScopes || []).map((scope) => `<option value="${scope.id}" ${scope.id === (ai.gigachatScope || 'GIGACHAT_API_PERS') ? 'selected' : ''}>${escHtml(scopeName(scope))}</option>`).join('')}
          </select>
        </label>
        <p class="form-note" id="savedModelNote" hidden>${t('savedAs', { id: escHtml(saved) })}</p>
      </div>
      <div class="m-section">
        <h3>${t('apiKey')}</h3>
        <input class="field-input" id="aiKey" type="password" autocomplete="off">
        <button class="btn btn-ghost btn-load" type="button" id="loadModelsBtn">${t('loadModels')}</button>
      </div>
      <div class="m-section" id="modelSection" hidden>
        <h3>${t('model')}</h3>
        <select class="field-input" id="aiModel"></select>
      </div>
      <div class="m-section" id="customModelWrap" hidden>
        <h3>${t('customModel')}</h3>
        <input class="field-input" id="aiModelCustom" placeholder="${t('modelPh')}" autocomplete="off">
      </div>
      <div class="m-section">
        <button class="btn btn-green form-submit" type="submit">${t('save')}</button>
      </div>
      <div class="m-section">
        <button class="btn btn-ghost btn-danger btn-block" type="button" id="settingsLogout">${t('logout')}</button>
      </div>
    </form>`;

  const syncProvider = () => {
    const next = $('#aiProvider').value;
    $('#gigaScopeWrap').hidden = next !== 'gigachat';
    const hasKey = next === 'gigachat' ? ai.hasGigachatKey : ai.hasOpenrouterKey;
    $('#aiKey').placeholder = hasKey
      ? t('keySavedPh')
      : (next === 'gigachat' ? t('sberKeyPh') : 'sk-or-v1-...');
    $('#modelSection').hidden = true;
    $('#customModelWrap').hidden = true;
    $('#aiModel').innerHTML = '';
    const current = savedModelId(ai, next);
    const hasSavedKey = next === 'gigachat' ? ai.hasGigachatKey : ai.hasOpenrouterKey;
    const note = $('#savedModelNote');
    note.hidden = !current || !hasSavedKey;
    note.textContent = current ? t('savedAs', { id: current }) : '';
  };
  const syncCustom = () => {
    const manual = !$('#modelSection').hidden && $('#aiModel').value === '__manual__';
    $('#customModelWrap').hidden = !manual;
    if (manual && !$('#aiModelCustom').value) {
      const current = savedModelId(ai, $('#aiProvider').value);
      const listed = [...$('#aiModel').options].some((opt) => opt.value === current);
      if (current && !listed) $('#aiModelCustom').value = current;
    }
  };
  syncProvider();
  $('#settingsLang').addEventListener('change', async () => {
    await chooseLanguage($('#settingsLang').value, true);
    if (!$('#settingsBackdrop').hidden) openSettings();
  });
  $('#aiProvider').addEventListener('change', syncProvider);
  $('#aiModel').addEventListener('change', syncCustom);
  $('#loadModelsBtn').addEventListener('click', async () => {
    const next = $('#aiProvider').value;
    const key = $('#aiKey').value.trim();
    const hasKey = next === 'gigachat' ? ai.hasGigachatKey : ai.hasOpenrouterKey;
    if (!key && !hasKey) { toast(t('needKey')); return; }
    $('#loadModelsBtn').disabled = true;
    try {
      let models;
      if (next === 'openrouter') {
        let orKey = key;
        if (!orKey) orKey = (await api('/api/ai/openrouter-key')).key;
        models = await readOpenRouterModels(orKey);
      } else {
        const data = await api('/api/ai/models', {
          method: 'POST',
          body: { provider: next, key, scope: $('#gigaScope').value }
        });
        models = data.models || [];
      }
      if (!models.length) { toast(t('noModels')); return; }
      const current = savedModelId(ai, next);
      const known = models.some((model) => model.id === current);
      $('#aiModel').innerHTML = [
        `<option value="__manual__">${t('manualModel')}</option>`,
        ...models.map((model) => `<option value="${escHtml(model.id)}">${escHtml(model.name)}</option>`)
      ].join('');
      $('#aiModel').value = known ? current : (current ? '__manual__' : models[0].id);
      $('#modelSection').hidden = false;
      syncCustom();
    } catch (err) {
      toast(err.message);
    } finally {
      $('#loadModelsBtn').disabled = false;
    }
  });
  $('#settingsBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const next = $('#aiProvider').value;
    const payload = {
      timezone: $('#tzSelect').value,
      weatherProvider: $('#weatherProvider').value,
      ai: { provider: next, gigachatScope: $('#gigaScope').value }
    };
    let model = '';
    if (!$('#modelSection').hidden) {
      if ($('#aiModel').value === '__manual__') {
        model = $('#aiModelCustom').value.trim();
        if (!model) { toast(t('needModelId')); return; }
      } else model = $('#aiModel').value;
    }
    if (model) {
      if (next === 'gigachat') payload.ai.gigachatModel = model;
      else payload.ai.openrouterModel = model;
    }
    const key = $('#aiKey').value.trim();
    if (key) {
      if (next === 'gigachat') payload.ai.gigachatKey = key;
      else payload.ai.openrouterKey = key;
    }
    try {
      await api('/api/settings', { method: 'POST', body: payload });
      closeSettings();
      await loadPlants();
      renderAll();
      toast(t('settingsSaved'));
    } catch (err) { toast(err.message); }
  });
  $('#settingsLogout').addEventListener('click', async () => {
    try { await api('/api/auth/logout', { method: 'POST', body: {} }); } catch (_) {}
    closeSettings();
    showLoggedOut();
  });
}

$('#authLang').addEventListener('change', () => chooseLanguage($('#authLang').value, false));
$('#authMode').addEventListener('click', () => setAuthMode(authMode === 'login' ? 'register' : 'login'));
$('#authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nick = $('#authNick').value.trim();
  const password = $('#authPass').value;
  try {
    const path = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = authMode === 'register' ? { nick, password, language: lang } : { nick, password };
    const data = await api(path, { method: 'POST', body });
    $('#authPass').value = '';
    await enterApp(data.user);
  } catch (err) {
    showAuthError(err.message);
  }
});
$('#settingsBtn').addEventListener('click', openSettings);
$('#swipeBtn').addEventListener('click', openSwipe);
$('#swipeClose').addEventListener('click', closeSwipe);
$('#swipeYes').addEventListener('click', () => commitSwipe('right'));
$('#swipeNo').addEventListener('click', () => commitSwipe('left'));
$('#settingsClose').addEventListener('click', closeSettings);
$('#settingsBackdrop').addEventListener('click', (e) => { if (e.target === $('#settingsBackdrop')) closeSettings(); });

applyChrome();

function startApp() {
  api('/api/auth/me')
    .then((me) => enterApp(me.user))
    .catch((e) => {
      showLoggedOut();
      if (e.message && e.message !== t('err.needLogin')) showAuthError(e.message);
    });
}

startApp();

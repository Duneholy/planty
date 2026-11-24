const https = require('https');
const crypto = require('crypto');

const OPENROUTER_MODELS = [
  { id: 'qwen/qwen3.7-plus', name: 'Qwen3.7 Plus' },
  { id: 'qwen/qwen3-235b-a22b-instruct-2507', name: 'Qwen3 235B' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o mini' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' }
];

const OPENAI_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o mini' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini' },
  { id: 'gpt-4.1', name: 'GPT-4.1' }
];

const GIGACHAT_MODELS = [
  { id: 'GigaChat-2-Max', name: 'GigaChat 2 Max' },
  { id: 'GigaChat-2-Pro', name: 'GigaChat 2 Pro' },
  { id: 'GigaChat-2', name: 'GigaChat 2' },
  { id: 'GigaChat-Max', name: 'GigaChat Max' },
  { id: 'GigaChat-Pro', name: 'GigaChat Pro' },
  { id: 'GigaChat', name: 'GigaChat' }
];

const GIGACHAT_SCOPES = [
  { id: 'GIGACHAT_API_PERS', name: 'Физлицо (GIGACHAT_API_PERS)' },
  { id: 'GIGACHAT_API_B2B', name: 'Бизнес (GIGACHAT_API_B2B)' },
  { id: 'GIGACHAT_API_CORP', name: 'Корпоративный (GIGACHAT_API_CORP)' }
];

const tokenCache = new Map();

function requestJson({ hostname, port, path, method, headers, body, rejectUnauthorized }) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, port, path, method, headers,
      rejectUnauthorized: rejectUnauthorized !== false
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch (_) { data = { message: text.slice(0, 300) }; }
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.setTimeout(25000, () => req.destroy(new Error('таймаут')));
    if (body) req.write(body);
    req.end();
  });
}

function errorText(data) {
  if (!data) return '';
  if (data.error && typeof data.error.message === 'string') return data.error.message.trim().slice(0, 300);
  if (typeof data.message === 'string') return data.message.trim().slice(0, 300);
  return '';
}

function replyText(data) {
  const msg = data && data.choices && data.choices[0] && data.choices[0].message;
  return msg && typeof msg.content === 'string' ? msg.content.trim() : '';
}

function basicKey(raw) {
  const value = String(raw || '').trim();
  return value.toLowerCase().startsWith('basic ') ? value.slice(6).trim() : value;
}

function chatPayload(model, messages, opts = {}) {
  const reasoning = /^(o\d|gpt-5)/.test(model);
  const payload = { model, messages };
  if (reasoning) payload.max_completion_tokens = opts.maxTokens || 1024;
  else {
    payload.temperature = opts.temperature ?? 0.4;
    payload.max_tokens = opts.maxTokens || 1024;
  }
  return payload;
}

async function openrouterChat(ai, messages, opts = {}) {
  const model = ai.openrouterModel || OPENROUTER_MODELS[0].id;
  const result = await requestJson({
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ai.openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/Duneholy',
      'X-Title': 'Planty'
    },
    body: JSON.stringify(chatPayload(model, messages, opts))
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(errorText(result.data) || `OpenRouter HTTP ${result.status}`);
  }
  const reply = replyText(result.data);
  if (!reply) throw new Error('Пустой ответ OpenRouter');
  return reply;
}

async function gigachatToken(key, scope) {
  const cacheKey = crypto.createHash('sha256').update(`${scope}\n${key}`).digest('hex');
  const hit = tokenCache.get(cacheKey);
  if (hit && hit.exp > Date.now() + 60000) return hit.token;
  const body = `scope=${encodeURIComponent(scope || 'GIGACHAT_API_PERS')}`;
  const result = await requestJson({
    hostname: 'ngw.devices.sberbank.ru',
    port: 9443,
    path: '/api/v2/oauth',
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      Authorization: `Basic ${basicKey(key)}`,
      RqUID: crypto.randomUUID(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  });
  if (!result.data || !result.data.access_token) {
    throw new Error(errorText(result.data) || 'Сбер не выдал токен. Проверьте ключ и scope.');
  }
  const ttl = (Number(result.data.expires_in) || 1800) * 1000;
  tokenCache.set(cacheKey, { token: result.data.access_token, exp: Date.now() + ttl });
  return result.data.access_token;
}

async function gigachatChat(ai, messages, opts = {}) {
  const token = await gigachatToken(ai.gigachatKey, ai.gigachatScope);
  const model = ai.gigachatModel || 'GigaChat-2-Pro';
  const body = JSON.stringify(chatPayload(model, messages, opts));
  const result = await requestJson({
    hostname: 'gigachat.devices.sberbank.ru',
    path: '/api/v1/chat/completions',
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(errorText(result.data) || `GigaChat HTTP ${result.status}`);
  }
  const reply = replyText(result.data);
  if (!reply) throw new Error('Пустой ответ GigaChat');
  return reply;
}

async function openaiChat(ai, messages, opts = {}) {
  const model = ai.openaiModel || OPENAI_MODELS[0].id;
  const body = JSON.stringify(chatPayload(model, messages, opts));
  const result = await requestJson({
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ai.openaiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(errorText(result.data) || `OpenAI HTTP ${result.status}`);
  }
  const reply = replyText(result.data);
  if (!reply) throw new Error('Пустой ответ OpenAI');
  return reply;
}

async function completeChat(ai, messages, opts) {
  if (ai && ai.provider === 'gigachat') return gigachatChat(ai, messages, opts);
  if (ai && ai.provider === 'openai') return openaiChat(ai, messages, opts);
  return openrouterChat(ai, messages, opts);
}

async function listOpenRouterModels(key) {
  const result = await requestJson({
    hostname: 'openrouter.ai',
    path: '/api/v1/models',
    method: 'GET',
    headers: { Authorization: `Bearer ${key}` }
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(errorText(result.data) || `OpenRouter HTTP ${result.status}`);
  }
  return ((result.data && result.data.data) || [])
    .map((model) => ({ id: model.id, name: model.name || model.id }))
    .filter((model) => model.id);
}

async function listGigaChatModels(key, scope) {
  const token = await gigachatToken(key, scope);
  const result = await requestJson({
    hostname: 'gigachat.devices.sberbank.ru',
    path: '/api/v1/models',
    method: 'GET',
    rejectUnauthorized: false,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(errorText(result.data) || `GigaChat HTTP ${result.status}`);
  }
  return ((result.data && result.data.data) || [])
    .map((model) => ({ id: model.id, name: model.id }))
    .filter((model) => model.id);
}

async function listOpenAIModels(key) {
  const result = await requestJson({
    hostname: 'api.openai.com',
    path: '/v1/models',
    method: 'GET',
    headers: { Authorization: `Bearer ${key}` }
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(errorText(result.data) || `OpenAI HTTP ${result.status}`);
  }
  const models = ((result.data && result.data.data) || [])
    .map((model) => model.id)
    .filter((id) => /^(gpt-|o\d|chatgpt)/.test(id))
    .filter((id) => !/audio|realtime|transcribe|tts|embed|image|moderation|whisper|davinci|babbage|search/.test(id))
    .sort()
    .slice(0, 80)
    .map((id) => ({ id, name: id }));
  return models.length ? models : OPENAI_MODELS.slice();
}

async function listModels(provider, key, scope) {
  if (provider === 'gigachat') return listGigaChatModels(key, scope);
  if (provider === 'openai') return listOpenAIModels(key);
  return listOpenRouterModels(key);
}

module.exports = {
  OPENROUTER_MODELS,
  OPENAI_MODELS,
  GIGACHAT_MODELS,
  GIGACHAT_SCOPES,
  completeChat,
  listModels
};

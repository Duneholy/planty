const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

const live = new Map();

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function loadUsers() {
  return readJson(USERS_FILE, { users: [] }).users || [];
}

function saveUsers(users) {
  writeJson(USERS_FILE, { users });
}

function loadSessions() {
  const raw = readJson(SESSIONS_FILE, { sessions: {} });
  const now = Date.now();
  const sessions = {};
  for (const [token, session] of Object.entries(raw.sessions || {})) {
    if (session && session.exp > now && session.userId) sessions[token] = session;
  }
  return sessions;
}

function saveSessions(sessions) {
  writeJson(SESSIONS_FILE, { sessions });
}

function userDataFile(id) {
  return path.join(DATA_DIR, 'users', id, 'data.json');
}

function hashPassword(password, salt = crypto.randomBytes(16)) {
  const hash = crypto.scryptSync(password, salt, 32);
  return { salt: salt.toString('hex'), hash: hash.toString('hex') };
}

function verifyPassword(password, saltHex, hashHex) {
  const calc = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 32);
  const expected = Buffer.from(hashHex, 'hex');
  if (calc.length !== expected.length) return false;
  return crypto.timingSafeEqual(calc, expected);
}

function loadUserRecord(id, migrate) {
  if (live.has(id)) return live.get(id);
  const data = migrate(JSON.parse(fs.readFileSync(userDataFile(id), 'utf8')));
  live.set(id, data);
  return data;
}

function writeUser(id) {
  const file = userDataFile(id);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(live.get(id), null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function createUserFiles(id, data) {
  live.set(id, data);
  writeUser(id);
}

function serverTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (_) {
    return 'UTC';
  }
}

module.exports = {
  loadUsers, saveUsers, loadSessions, saveSessions,
  hashPassword, verifyPassword, loadUserRecord, writeUser, createUserFiles,
  serverTimeZone
};

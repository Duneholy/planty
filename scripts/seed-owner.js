// Одноразовый перенос data/data.json в аккаунт. Пароль только из окружения, в репозиторий не пишется.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { hashPassword, loadUsers, saveUsers } = require('../lib/accounts');

const nick = 'mikhno';
const password = process.env.POLIVAYKA_SEED_PASSWORD || '';
const dataDir = path.join(__dirname, '..', 'data');
const legacy = path.join(dataDir, 'data.json');

if (!password) {
  console.error('Задайте POLIVAYKA_SEED_PASSWORD');
  process.exit(1);
}

const users = loadUsers();
if (users.some((u) => u.nick.toLowerCase() === nick)) {
  console.log('Пользователь mikhno уже есть, данные не трогаю');
  process.exit(0);
}
if (!fs.existsSync(legacy)) {
  console.error('Нет data/data.json — нечего переносить');
  process.exit(1);
}

const id = crypto.randomUUID();
const { salt, hash } = hashPassword(password);
const dir = path.join(dataDir, 'users', id);
fs.mkdirSync(dir, { recursive: true });
fs.copyFileSync(legacy, path.join(dir, 'data.json'));
users.push({ id, nick, salt, hash, createdAt: new Date().toISOString() });
saveUsers(users);
console.log('Аккаунт mikhno создан, текущая база скопирована');

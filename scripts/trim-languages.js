#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

const i18nPath = path.join(root, 'public', 'i18n.js');
const i18nSrc = fs.readFileSync(i18nPath, 'utf8');
const rowsMatch = i18nSrc.match(/const UI_ROWS = (\[[\s\S]*?\n\]);/);
const tailMatch = i18nSrc.match(/(\nconst ERR_RU = \{[\s\S]*)$/);
if (!rowsMatch || !tailMatch) throw new Error('Could not parse i18n.js');

const UI_ROWS = vm.runInNewContext(rowsMatch[1], {});
const trimmed = UI_ROWS.map((row) => [row[0], row[1], row[2]]);

function formatRows(rows) {
  const lines = ['const UI_ROWS = ['];
  rows.forEach((row) => {
    lines.push(`  [${row.map((c) => JSON.stringify(c)).join(', ')}],`);
  });
  lines.push('];');
  return lines.join('\n');
}

const head = `/* Языки интерфейса. Подключается до app.js. */
const LANGS = [
  { id: 'en', name: 'English' },
  { id: 'ru', name: 'Русский' }
];
const LANG_IDS = LANGS.map((l) => l.id);
const LOCALE_TAG = { en: 'en-US', ru: 'ru-RU' };

`;

let tail = tailMatch[1];
tail = tail.replace(
  "document.documentElement.lang = next;",
  'document.documentElement.lang = next;'
);

const uiBlock = `
const UI = {};
LANG_IDS.forEach((id) => { UI[id] = {}; });
UI_ROWS.forEach((row) => {
  LANG_IDS.forEach((id, i) => { UI[id][row[0]] = row[i + 1]; });
});
`;
const tailStart = tailMatch[1].indexOf('\nconst ERR_RU');
fs.writeFileSync(i18nPath, `${head}${formatRows(trimmed)}\n${uiBlock}${tailMatch[1].slice(tailStart)}`, 'utf8');

const contentPath = path.join(root, 'public', 'i18n-content.js');
const contentSrc = fs.readFileSync(contentPath, 'utf8');
const g = {};
vm.runInNewContext(contentSrc.replace(/\bconst\b/g, 'var'), g);
const outContent = `/* Названия, свет, виды и советы — только английский (русский в каталоге). */
const I18N_NAMES = { en: ${JSON.stringify(g.I18N_NAMES.en, null, 2)} };
const I18N_LIGHTS = { en: ${JSON.stringify(g.I18N_LIGHTS.en, null, 2)} };
const I18N_PETS = { en: ${JSON.stringify(g.I18N_PETS.en, null, 2)} };
const I18N_TIPS = { en: ${JSON.stringify(g.I18N_TIPS.en, null, 2)} };
`;
fs.writeFileSync(contentPath, outContent, 'utf8');

console.log('OK', 'UI_ROWS', trimmed.length);
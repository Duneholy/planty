const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('public/i18n.js', 'utf8') + '\n;globalThis.__UI = UI; globalThis.__LANGS = LANG_IDS;';
const ctx = { localStorage: { getItem: () => null, setItem() {} }, document: { documentElement: {} }, Intl };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const ids = ctx.__LANGS;
const ui = ctx.__UI;
const keys = Object.keys(ui.en);
let bad = 0;
for (const id of ids) {
  for (const k of keys) {
    if (ui[id][k] == null || ui[id][k] === '') {
      bad++;
      console.log('missing', id, k);
    }
  }
}
console.log('langs', ids.length, 'keys', keys.length, 'bad', bad);

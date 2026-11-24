#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const partial = path.join(root, 'lib', 'plant-care-i18n-packs.partial.json');
const out = path.join(root, 'lib', 'plant-care-en-cache.json');
const packs = {};

if (fs.existsSync(partial)) {
  const data = JSON.parse(fs.readFileSync(partial, 'utf8'));
  Object.keys(data).forEach((id) => {
    if (data[id] && data[id].en) packs[id] = data[id].en;
  });
}

const dir = path.join(root, 'public');
['_care_body.js', '_care_c.js', '_care_d.js', '_care_e.js'].filter((f) => fs.existsSync(path.join(dir, f))).forEach((f) => {
  const sandbox = {
    putCare(id, data) {
      if (data.en) packs[id] = data.en;
    }
  };
  vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), vm.createContext(sandbox), { filename: f });
});

fs.writeFileSync(out, JSON.stringify(packs, null, 2), 'utf8');
console.log(Object.keys(packs).length, 'plants ->', out);
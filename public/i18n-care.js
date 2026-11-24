/* Карточки ухода для всех языков, кроме русского. Русский текст остаётся в записи растения. */
const CARE = { en: {}, es: {}, de: {}, vi: {}, zh: {}, fr: {}, it: {}, hi: {}, ja: {} };

function putCare(id, packs) {
  Object.keys(packs).forEach((code) => {
    const row = packs[code];
    CARE[code][id] = {
      lightShort: row[0],
      lightFull: row[1],
      humidityFull: row[2],
      temperatureFull: row[3],
      extra: row[4],
      careTips: row.slice(5)
    };
  });
}

/* Карточки ухода: английский overlay. На русском текст остаётся в записи растения. */
const CARE = { en: {} };

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

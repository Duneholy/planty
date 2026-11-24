#!/bin/bash
set -e
VOLUME="$(cd "$(dirname "$0")" && pwd)"
APP_SRC="$VOLUME/Planty.app"
if [ ! -d "$APP_SRC" ]; then
  echo "  Рядом с этим файлом должен лежать Planty.app."
  echo "  Откройте образ Planty.dmg и запустите установку снова."
  read -r -p "  Enter"
  exit 1
fi

echo ""
echo "  Копирую Planty в папку «Программы»…"
rm -rf "/Applications/Planty.app"
ditto "$APP_SRC" "/Applications/Planty.app"
xattr -cr "/Applications/Planty.app"

echo "  Готово. Открываю Planty…"
open -a "/Applications/Planty.app"
echo ""
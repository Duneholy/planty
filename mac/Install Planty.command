#!/bin/bash
set -e
VOLUME="$(cd "$(dirname "$0")" && pwd)"
APP_SRC="$VOLUME/Planty.app"
DEST="/Applications/Planty.app"

if [ ! -d "$APP_SRC" ]; then
  echo "  Planty.app should sit next to this installer inside the disk image."
  echo "  Рядом с этим файлом должен лежать Planty.app. Откройте образ и запустите установку снова."
  read -r -p "  Enter"
  exit 1
fi

echo ""
echo "  Installing Planty into Applications…"
echo "  Копирую Planty в «Программы»…"
rm -rf "$DEST"
ditto "$APP_SRC" "$DEST"
xattr -cr "$DEST"

echo "  Opening Planty…"
echo "  Открываю Planty…"
open "$DEST"
echo ""

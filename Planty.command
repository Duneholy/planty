#!/bin/bash
cd "$(dirname "$0")" || exit 1
export OPEN_BROWSER=1
export PORT="${PORT:-3000}"

need_node=0
if ! command -v node >/dev/null 2>&1; then
  need_node=1
else
  major="$(node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || echo 0)"
  if [ "${major:-0}" -lt 18 ]; then
    need_node=1
  fi
fi

if [ "$need_node" -eq 1 ]; then
  if [ ! -x "runtime/node/bin/node" ]; then
    ver="v26.13.1"
    case "$(uname -m)" in
      arm64) platform="darwin-arm64" ;;
      *) platform="darwin-x64" ;;
    esac
    echo ""
    echo "  Первый запуск: скачиваю Node.js $ver."
    echo "  Это один раз, дальше Planty будет открываться сразу."
    echo ""
    mkdir -p runtime
    curl -fL "https://nodejs.org/dist/$ver/node-$ver-$platform.tar.gz" -o runtime/node.tar.gz || {
      echo "  Не получилось скачать Node.js. Проверьте интернет и запустите Planty ещё раз."
      read -r -p "  Нажмите Enter, чтобы закрыть окно."
      exit 1
    }
    tar -xzf runtime/node.tar.gz -C runtime
    rm -rf runtime/node
    mv "runtime/node-$ver-$platform" runtime/node
    rm -f runtime/node.tar.gz
  fi
  export PATH="$(pwd)/runtime/node/bin:$PATH"
fi

if [ ! -d node_modules/express ]; then
  echo ""
  echo "  Устанавливаю Planty. Один раз, дальше будет быстрее."
  echo ""
  npm install --omit=dev || {
    echo "  Не получилось установить Planty. Проверьте интернет и запустите файл ещё раз."
    read -r -p "  Нажмите Enter, чтобы закрыть окно."
    exit 1
  }
fi

node server.js
code=$?
if [ "$code" -ne 0 ]; then
  echo ""
  echo "  Planty остановилась. Можно закрыть это окно."
  read -r -p "  Нажмите Enter, чтобы закрыть окно."
fi
exit "$code"

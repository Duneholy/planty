@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Planty
set "OPEN_BROWSER=1"
if not defined PORT set "PORT=3000"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\prepare-runtime.ps1"
if errorlevel 1 (
  echo.
  echo  Не получилось подготовить Planty. Проверьте интернет и запустите файл ещё раз.
  echo.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 set "PATH=%~dp0runtime\node;%PATH%"

if not exist "%~dp0node_modules\express\" (
  echo.
  echo  Устанавливаю Planty. Один раз, дальше будет быстрее.
  echo.
  call npm install --omit=dev
  if errorlevel 1 (
    echo.
    echo  Не получилось установить Planty. Проверьте интернет и запустите файл ещё раз.
    echo.
    pause
    exit /b 1
  )
)

node "%~dp0server.js"
set "CODE=%ERRORLEVEL%"
if not "%CODE%"=="0" (
  echo.
  echo  Planty остановилась. Можно закрыть это окно.
  echo.
  pause
)
exit /b %CODE%

const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const net = require('net');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let serverProcess = null;
let mainWindow = null;
let serverPort = 0;

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function waitForServer(port) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      const req = http.get({ hostname: '127.0.0.1', port, path: '/', timeout: 1000 }, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (!serverProcess) {
          reject(new Error('Сервер остановился до открытия окна'));
          return;
        }
        if (Date.now() - started > 30000) reject(new Error('Planty не успела открыться'));
        else setTimeout(tick, 200);
      });
    };
    tick();
  });
}

function stopServer() {
  if (!serverProcess) return;
  const child = serverProcess;
  serverProcess = null;
  child.kill();
}

function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' }
  ]));
}

async function openApp() {
  serverPort = await freePort();
  const root = path.join(__dirname, '..');
  serverProcess = spawn(process.execPath, [path.join(root, 'server.js')], {
    cwd: root,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: String(serverPort),
      HOST: '127.0.0.1',
      OPEN_BROWSER: '0',
      PLANT_DATA_DIR: path.join(app.getPath('userData'), 'data')
    },
    stdio: 'ignore'
  });
  serverProcess.once('exit', () => {
    serverProcess = null;
  });

  await waitForServer(serverPort);

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 840,
    minWidth: 900,
    minHeight: 640,
    title: 'Planty',
    backgroundColor: '#FFF6E9',
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const home = `http://127.0.0.1:${serverPort}/`;
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(home)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  await mainWindow.loadURL(home);
}

if (gotLock) {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    buildMenu();
    return openApp();
  }).catch((error) => {
    dialog.showErrorBox('Planty', error && error.message ? error.message : 'Не удалось открыть Planty');
    stopServer();
    app.quit();
  });

  app.on('before-quit', stopServer);
  app.on('window-all-closed', () => {
    stopServer();
    app.quit();
  });
}

const { app, BrowserWindow, session, shell, protocol, net } = require('electron');
const { join } = require('path');

let mainWindow;

app.commandLine.appendSwitch('enable-logging');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function isAppAsset(url) {
  return url.startsWith('app://');
}

const EMBED_TYPES = new Set([
  'mainFrame',
  'subFrame',
  'script',
  'xhr',
  'fetch',
  'other',
  'stylesheet',
  'image',
  'font',
]);

function installSecurityHooks() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const { url, responseHeaders, resourceType } = details;
    let headers = { ...responseHeaders };

    const isWS =
      resourceType === 'webSocket' ||
      resourceType === 'websocket' ||
      url.startsWith('ws:') ||
      url.startsWith('wss:');

    if (!isAppAsset(url) || isWS || !EMBED_TYPES.has(resourceType)) {
      callback({ responseHeaders: headers });
      return;
    }

    if (url.endsWith('.wasm')) headers['Content-Type'] = ['application/wasm'];
    else if (url.endsWith('.bin')) headers['Content-Type'] = ['application/octet-stream'];

    headers['Cross-Origin-Opener-Policy'] = ['same-origin'];
    headers['Cross-Origin-Embedder-Policy'] = ['credentialless'];

    callback({ responseHeaders: headers });
  });

  session.defaultSession.webRequest.onCompleted((d) => {
    if (d.resourceType === 'webSocket' && d.url.startsWith('wss://relay.walletconnect.com')) {
      console.log('[WS completed]', { statusCode: d.statusCode, url: d.url });
    }
  });
  session.defaultSession.webRequest.onErrorOccurred((d) => {
    if (d.resourceType === 'webSocket' && d.url.startsWith('wss://relay.walletconnect.com')) {
      console.log('[WS errorOccurred]', { error: d.error, url: d.url });
    }
  });
}

async function registerAppProtocolHandler() {
  protocol.handle('app', async (request) => {
    const url = new URL(request.url);
    let rel = decodeURIComponent(url.pathname);
    if (rel.startsWith('/')) rel = rel.slice(1);

    if (rel.startsWith('assets/')) {
      const assetPath = join(__dirname, 'assets', rel.replace(/^assets\//, ''));
      return net.fetch('file://' + assetPath);
    }

    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const buildPath = join(__dirname, '../build', rel);
    return net.fetch('file://' + buildPath);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: false,
      experimentalFeatures: true,
    },
  });

  mainWindow.webContents.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/140.0.0.0 Safari/537.36'
  );

  mainWindow.loadURL(app.isPackaged ? 'app://local/index.html' : 'http://localhost:3000');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });

  mainWindow.on('closed', () => (mainWindow = null));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(async () => {
  await registerAppProtocolHandler();
  installSecurityHooks();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('web-contents-created', (_event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

app.on('certificate-error', (event, _webContents, _url, _error, _certificate, callback) => {
  event.preventDefault();
  callback(true);
});

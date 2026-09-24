// Electron main process — creates the app window and wires up a couple of
// desktop-native conveniences (open-external-link, native confirm dialogs)
// that the renderer talks to via the preload bridge.
const { app, BrowserWindow, shell, ipcMain, dialog, Menu } = require('electron');
const path = require('node:path');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#0D0A1A', // matches the GathaLok Gold theme's bg, avoids a white flash
    title: 'GathaLok',
    icon: path.join(__dirname, '../build/icon.png'), // window/taskbar icon
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  Menu.setApplicationMenu(null);

  // Launch maximized so the sidebar + content fill the screen on first run,
  // instead of the default small window size.
  mainWindow.once('ready-to-show', () => mainWindow.maximize());

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Any link the app wants opened in a real browser (references, privacy
  // policy, etc.) should never navigate the app window itself.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

ipcMain.handle('open-external', (_event, url) => {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    shell.openExternal(url);
  }
});

ipcMain.handle('confirm-dialog', async (_event, { title, message, confirmLabel, cancelLabel, destructive }) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: destructive ? 'warning' : 'question',
    buttons: [cancelLabel || 'Cancel', confirmLabel || 'OK'],
    defaultId: 1,
    cancelId: 0,
    title: title || 'Confirm',
    message: title || 'Confirm',
    detail: message || '',
  });
  return result.response === 1;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Preload bridge — exposes a tiny, explicit API to the renderer instead of
// giving it raw Node/Electron access (contextIsolation stays on).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gathalokDesktop', {
  isElectron: true,
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  confirm: (opts) => ipcRenderer.invoke('confirm-dialog', opts),
});

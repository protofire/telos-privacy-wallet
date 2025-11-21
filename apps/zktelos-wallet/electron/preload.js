const {contextBridge, ipcRenderer} = require('electron');

// Expose a safe, limited API to the Renderer's window object
contextBridge.exposeInMainWorld('nativeProver', {
  // This function will be callable from your web app (Renderer)
  nativeProveTx: (data) => ipcRenderer.invoke('prove-tx', data),
});

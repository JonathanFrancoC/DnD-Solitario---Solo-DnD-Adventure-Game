const { contextBridge, ipcRenderer } = require('electron')

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Configuración
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  
  // Archivos
  saveFile: (filePath, data, type) => ipcRenderer.invoke('save-file', { filePath, data, type }),
  loadFile: (filePath) => ipcRenderer.invoke('load-file', filePath),
  exportExcel: (gameData) => ipcRenderer.invoke('export-excel', gameData),
  
  // Eventos del menú
  onNewGame: (callback) => ipcRenderer.on('new-game', callback),
  onLoadGame: (callback) => ipcRenderer.on('load-game', callback),
  onSaveGame: (callback) => ipcRenderer.on('save-game', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onGenerateLogbook: (callback) => ipcRenderer.on('generate-logbook', callback),
  onOpenDiceCalculator: (callback) => ipcRenderer.on('open-dice-calculator', callback),
  onOpenRulesReference: (callback) => ipcRenderer.on('open-rules-reference', callback),
  
  // Utilidades
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})

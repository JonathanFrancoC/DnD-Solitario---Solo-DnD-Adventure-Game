const { contextBridge, ipcRenderer } = require('electron')

// Exponer APIs seguras para el sistema de archivos
contextBridge.exposeInMainWorld('fsapi', {
  // Gestión de carpetas base
  ensureBaseDirs: () => ipcRenderer.invoke('fs:ensureBaseDirs'),
  
  // Gestión de personajes
  saveCharacter: (character) => ipcRenderer.invoke('fs:saveCharacter', { character }),
  listCharacters: () => ipcRenderer.invoke('fs:listCharacters'),
  loadCharacter: (file) => ipcRenderer.invoke('fs:loadCharacter', { file }),
  deleteCharacter: (file) => ipcRenderer.invoke('fs:deleteCharacter', { file }),

  // Gestión de carpetas
  ensureDir: (relPath) => ipcRenderer.invoke('ensure-dir', relPath),
  createCampaign: (campaignId, campaignName) => ipcRenderer.invoke('create-campaign', { campaignId, campaignName }),

  // Guardado de archivos JSON
  saveJSON: (relPath, filename, data) => ipcRenderer.invoke('save-json', { relPath, filename, data }),
  saveCharacter: (campaignId, characterData) => ipcRenderer.invoke('save-character', { campaignId, characterData }),
  saveCompanions: (campaignId, companions) => ipcRenderer.invoke('save-companions', { campaignId, companions }),
  saveVillains: (campaignId, villains) => ipcRenderer.invoke('save-villains', { campaignId, villains }),
  saveWorldState: (campaignId, worldState) => ipcRenderer.invoke('save-world-state', { campaignId, worldState }),
  saveGameState: (campaignId, gameState) => ipcRenderer.invoke('save-game-state', { campaignId, gameState }),
  saveDailyLog: (campaignId, entry) => ipcRenderer.invoke('save-daily-log', { campaignId, entry }),
  saveSessionLog: (campaignId, entry) => ipcRenderer.invoke('save-session-log', { campaignId, entry }),

  // Carga de archivos JSON
  loadJSON: (relPath, filename) => ipcRenderer.invoke('load-json', { relPath, filename }),
  loadCharacter: (campaignId) => ipcRenderer.invoke('load-character', { campaignId }),
  loadCompanions: (campaignId) => ipcRenderer.invoke('load-companions', { campaignId }),
  loadVillains: (campaignId) => ipcRenderer.invoke('load-villains', { campaignId }),
  loadWorldState: (campaignId) => ipcRenderer.invoke('load-world-state', { campaignId }),
  loadGameState: (campaignId) => ipcRenderer.invoke('load-game-state', { campaignId }),
  loadDailyLogs: (campaignId) => ipcRenderer.invoke('load-daily-logs', { campaignId }),
  loadSessionLogs: (campaignId) => ipcRenderer.invoke('load-session-logs', { campaignId }),

  // Listado de campañas
  listCampaigns: () => ipcRenderer.invoke('list-campaigns'),

  // Utilidades
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getDocumentsPath: () => ipcRenderer.invoke('get-documents-path')
})

// Exponer APIs existentes para configuración
contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  getDeveloperMode: () => ipcRenderer.invoke('get-developer-mode'),
  saveDeveloperMode: (developerMode) => ipcRenderer.invoke('save-developer-mode', developerMode),
  askOpenAI: (data) => ipcRenderer.invoke('ask-openai', data),
  
  // Eventos
  onNewGame: (callback) => ipcRenderer.on('new-game', callback),
  onLoadGame: (callback) => ipcRenderer.on('load-game', callback),
  onSaveGame: (callback) => ipcRenderer.on('save-game', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onGenerateLogbook: (callback) => ipcRenderer.on('generate-logbook', callback),
  onOpenDiceCalculator: (callback) => ipcRenderer.on('open-dice-calculator', callback),
  onOpenRulesReference: (callback) => ipcRenderer.on('open-rules-reference', callback),
  
  // Remover listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})

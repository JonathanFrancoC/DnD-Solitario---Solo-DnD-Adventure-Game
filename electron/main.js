const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const Store = require('electron-store')

// Configuración de almacenamiento
const store = new Store({
  name: 'dnd-solitario-config',
  defaults: {
    apiKey: '',
    settings: {
      tone: 'medium',
      exploration: 'mixed',
      flanking: true,
      tacticalRepositioning: false,
      logisticsComplexity: 'detailed'
    }
  }
})

let mainWindow

function createWindow() {
  console.log('Creando ventana...')
  
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/dice.png'),
    titleBarStyle: 'default',
    show: true // Cambiar a true para mostrar inmediatamente
  })

  console.log('Ventana creada, cargando URL...')

  // Cargar la aplicación desde archivos estáticos
  console.log('Cargando aplicación desde archivos estáticos...')
  const indexPath = path.join(__dirname, '../index.html')
  console.log('Ruta del archivo:', indexPath)
  mainWindow.loadFile(indexPath)
  
  // Abrir DevTools para desarrollo
  mainWindow.webContents.openDevTools()

  // Manejar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Error al cargar:', errorCode, errorDescription)
    mainWindow.loadURL('data:text/html,<h1>Error al cargar la aplicación</h1><p>Error: ' + errorDescription + '</p>')
  })

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Crear menú personalizado
  createMenu()
}

function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nueva Partida',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-game')
          }
        },
        {
          label: 'Cargar Partida',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Archivos JSON', extensions: ['json'] },
                { name: 'Archivos Excel', extensions: ['xlsx'] }
              ]
            })
            if (!result.canceled) {
              mainWindow.webContents.send('load-game', result.filePaths[0])
            }
          }
        },
        {
          label: 'Guardar Partida',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [
                { name: 'Archivos JSON', extensions: ['json'] },
                { name: 'Archivos Excel', extensions: ['xlsx'] }
              ]
            })
            if (!result.canceled) {
              mainWindow.webContents.send('save-game', result.filePath)
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Configuración',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings')
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Generar Bitácora Excel',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow.webContents.send('generate-logbook')
          }
        },
        {
          label: 'Calculadora de Dados',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('open-dice-calculator')
          }
        },
        {
          label: 'Referencia de Reglas',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('open-rules-reference')
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Documentación',
          click: () => {
            shell.openExternal('https://github.com/tu-usuario/dnd-solitario')
          }
        },
        {
          label: 'Acerca de D&D Solitario',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de D&D Solitario',
              message: 'D&D Solitario - IA DM',
              detail: 'Versión 1.0.0\n\nUn sistema de Dungeons & Dragons en solitario donde la Inteligencia Artificial actúa como Dungeon Master.\n\nDesarrollado con React, Electron y OpenAI.'
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// Eventos de la aplicación
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers
ipcMain.handle('get-config', () => {
  return store.get('settings')
})

ipcMain.handle('save-config', (event, config) => {
  store.set('settings', config)
  return true
})

ipcMain.handle('get-api-key', () => {
  return store.get('apiKey')
})

ipcMain.handle('save-api-key', (event, apiKey) => {
  store.set('apiKey', apiKey)
  return true
})

ipcMain.handle('save-file', async (event, { filePath, data, type }) => {
  try {
    if (type === 'excel') {
      // Lógica para guardar Excel
      return { success: true }
    } else {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      return { success: true }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('load-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return { success: true, data: JSON.parse(data) }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('export-excel', async (event, gameData) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'Archivos Excel', extensions: ['xlsx'] }]
    })
    
    if (!result.canceled) {
      // Aquí implementaremos la lógica de exportación a Excel
      return { success: true, filePath: result.filePath }
    }
    return { success: false, error: 'Operación cancelada' }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

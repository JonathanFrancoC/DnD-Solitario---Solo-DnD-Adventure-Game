const { app, BrowserWindow } = require('electron');
const path = require('path');

// Importación dinámica para electron-is-dev
let isDev;
(async () => {
  const electronIsDev = await import('electron-is-dev');
  isDev = electronIsDev.default;
})();

function createWindow() {
  // Crear la ventana del navegador
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'favicon.ico'),
    title: 'D&D Solitario - Creador de Personajes'
  });

  // Cargar la aplicación
  if (isDev) {
    // En desarrollo, cargar desde el servidor de desarrollo
    mainWindow.loadURL('http://localhost:5174');
    // Abrir las herramientas de desarrollador
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar desde el build
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  }

  // Manejar cuando la ventana se cierra
  mainWindow.on('closed', function () {
    app.quit();
  });
}

// Este método se llamará cuando Electron haya terminado de inicializar
app.whenReady().then(async () => {
  // Esperar a que isDev esté disponible
  if (!isDev) {
    const electronIsDev = await import('electron-is-dev');
    isDev = electronIsDev.default;
  }
  createWindow();
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', async function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Esperar a que isDev esté disponible
    if (!isDev) {
      const electronIsDev = await import('electron-is-dev');
      isDev = electronIsDev.default;
    }
    createWindow();
  }
});

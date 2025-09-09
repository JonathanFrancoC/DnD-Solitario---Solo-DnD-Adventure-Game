const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const Store = require('electron-store')
const { spawn } = require('child_process')

// Configuración de almacenamiento
const store = new Store({
  name: 'dnd-solitario-config',
  defaults: {
    aiProvider: 'openai',
    apiKey: '',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2',
    developerMode: false,
    settings: {
      tone: 'medium',
      exploration: 'mixed',
      flanking: true,
      tacticalRepositioning: false,
      logisticsComplexity: 'detailed'
    }
  }
})

function resolveBaseRoot() {
  // 1) Preferimos el Escritorio\DnD solitario
  const desktopRoot = path.join(app.getPath('home'), 'Desktop', 'DnD solitario');
  try { 
    fs.mkdirSync(desktopRoot, { recursive: true }); 
    return desktopRoot; 
  } catch {}
  
  // 2) Fallback: Documentos\DnD solitario
  const docsRoot = path.join(app.getPath('documents'), 'DnD solitario');
  fs.mkdirSync(docsRoot, { recursive: true });
  return docsRoot;
}

const BASE_ROOT = resolveBaseRoot();
const CHAR_DIR = path.join(BASE_ROOT, 'characters');

async function ensureCharDir() {
  await fs.promises.mkdir(CHAR_DIR, { recursive: true });
  return CHAR_DIR;
}

function slug(str) {
  return String(str || 'Personaje')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\-_\s]/gi, '')
    .trim().replace(/\s+/g, '_');
}

// IPC handlers para personajes
ipcMain.handle('fs:ensureBaseDirs', async () => {
  await ensureCharDir();
  return { success: true, base: BASE_ROOT, characters: CHAR_DIR };
});

ipcMain.handle('fs:saveCharacter', async (_evt, { character }) => {
  await ensureCharDir();
  const name = slug(character?.name);
  const file = path.join(CHAR_DIR, `${name}.json`);
  await fs.promises.writeFile(file, JSON.stringify(character, null, 2), 'utf8');
  console.log('🎯 PERSONAJE GUARDADO EN ARCHIVO:');
  console.log('   📁 Ruta:', file);
  console.log('   👤 Nombre:', character?.name || 'Sin nombre');
  console.log('   🎭 Clase:', character?.class || 'Sin clase');
  console.log('   📊 Nivel:', character?.level || 1);
  return { success: true, path: file };
});

ipcMain.handle('fs:listCharacters', async () => {
  await ensureCharDir();
  const files = await fs.promises.readdir(CHAR_DIR);
  return {
    success: true,
    data: files.filter(f => f.toLowerCase().endsWith('.json'))
               .map(f => ({ file: f, path: path.join(CHAR_DIR, f) }))
  };
});

ipcMain.handle('fs:loadCharacter', async (_evt, { file }) => {
  const full = path.isAbsolute(file) ? file : path.join(CHAR_DIR, file);
  const txt = await fs.promises.readFile(full, 'utf8');
  return { success: true, data: JSON.parse(txt) };
});

ipcMain.handle('fs:deleteCharacter', async (_evt, { file }) => {
  const full = path.isAbsolute(file) ? file : path.join(CHAR_DIR, file);
  await fs.promises.unlink(full);
  return { success: true };
});

// Mantener handlers existentes para campañas
ipcMain.handle('ensure-dir', async (event, relPath) => {
  try {
    const fullPath = path.join(BASE_ROOT, relPath);
    await fs.promises.mkdir(fullPath, { recursive: true });
    return { success: true, path: fullPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-campaign', async (event, { campaignId, campaignName }) => {
  try {
    const campaignPath = path.join(BASE_ROOT, 'saves', campaignId);
    
    // Crear estructura de carpetas
    const folders = [
      'character',
      'companions', 
      'enemies',
      'data',
      'bitacora'
    ];
    
    for (const folder of folders) {
      await fs.promises.mkdir(path.join(campaignPath, folder), { recursive: true });
    }
    
    const manifest = {
      campaign: { 
        id: campaignId, 
        name: campaignName, 
        created_at: new Date().toISOString(), 
        last_saved_at: new Date().toISOString() 
      }
    };
    
    await fs.promises.writeFile(path.join(campaignPath, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    
    // Crear archivos iniciales en las carpetas correspondientes
    const initialFiles = {
      'data/world_state.json': { world: {} },
      'data/game_state.json': { game_state: {} },
      'bitacora/daily_logs.json': { logs: [] },
      'bitacora/session_logs.json': { sessions: [] }
    };
    
    for (const [filename, data] of Object.entries(initialFiles)) {
      await fs.promises.writeFile(path.join(campaignPath, filename), JSON.stringify(data, null, 2), 'utf8');
    }
    
    console.log('🎮 NUEVA CAMPAÑA CREADA CON ESTRUCTURA DE CARPETAS:');
    console.log('   📁 Carpeta principal:', campaignPath);
    console.log('   🆔 ID:', campaignId);
    console.log('   📛 Nombre:', campaignName);
    console.log('   📂 Estructura creada:');
    console.log('      - character/ (para personaje principal)');
    console.log('      - companions/ (para compañeros)');
    console.log('      - enemies/ (para enemigos)');
    console.log('      - data/ (datos de la partida)');
    console.log('      - bitacora/ (logs de sesión)');
    
    return { success: true, path: campaignPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-json', async (event, { relPath, filename, data }) => {
  try {
    const fullPath = path.join(BASE_ROOT, relPath, filename);
    await fs.promises.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true, path: fullPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-character', async (event, { campaignId, characterData }) => {
  try {
    // Crear nombre de archivo seguro basado en el nombre del personaje
    const characterName = characterData.name || 'unknown';
    const safeFileName = characterName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeFileName}.json`;
    
    const filePath = path.join(BASE_ROOT, 'saves', campaignId, 'character', fileName);
    const data = { 
      main_character: characterData, 
      saved_at: new Date().toISOString(),
      character_id: characterData.id || Date.now().toString()
    };
    
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('👤 PERSONAJE PRINCIPAL GUARDADO:');
    console.log('   📁 Carpeta: character/');
    console.log('   📄 Archivo:', fileName);
    console.log('   👤 Nombre:', characterData.name);
    console.log('   🎭 Clase:', characterData.class);
    console.log('   📊 Nivel:', characterData.level);
    
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-companions', async (event, { campaignId, companions }) => {
  try {
    // Guardar cada compañero en un archivo individual
    const companionsPath = path.join(BASE_ROOT, 'saves', campaignId, 'companions');
    
    for (const companion of companions) {
      const companionName = companion.name || 'unknown';
      const safeFileName = companionName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${safeFileName}.json`;
      
      const filePath = path.join(companionsPath, fileName);
      const data = { 
        companion: companion, 
        saved_at: new Date().toISOString(),
        companion_id: companion.id || Date.now().toString()
      };
      
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
    
    console.log('👥 COMPAÑEROS GUARDADOS:');
    console.log('   📁 Carpeta: companions/');
    console.log('   📊 Total:', companions.length);
    companions.forEach(comp => {
      console.log(`      - ${comp.name} (${comp.class})`);
    });
    
    return { success: true, path: companionsPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-villains', async (event, { campaignId, villains }) => {
  try {
    // Guardar cada villano en un archivo individual
    const enemiesPath = path.join(BASE_ROOT, 'saves', campaignId, 'enemies');
    
    for (const villain of villains) {
      const villainName = villain.name || 'unknown';
      const safeFileName = villainName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${safeFileName}.json`;
      
      const filePath = path.join(enemiesPath, fileName);
      const data = { 
        villain: villain, 
        saved_at: new Date().toISOString(),
        villain_id: villain.id || Date.now().toString()
      };
      
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
    
    console.log('👹 ENEMIGOS GUARDADOS:');
    console.log('   📁 Carpeta: enemies/');
    console.log('   📊 Total:', villains.length);
    villains.forEach(villain => {
      console.log(`      - ${villain.name} (${villain.class || 'NPC'})`);
    });
    
    return { success: true, path: enemiesPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-world-state', async (event, { campaignId, worldState }) => {
  try {
    const filePath = path.join(BASE_ROOT, 'saves', campaignId, 'data', 'world_state.json');
    const data = { world: worldState, saved_at: new Date().toISOString() };
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('🌍 ESTADO DEL MUNDO GUARDADO:');
    console.log('   📁 Carpeta: data/');
    console.log('   📄 Archivo: world_state.json');
    console.log('   📍 Ubicación actual:', worldState?.currentLocation || 'No especificada');
    
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-game-state', async (event, { campaignId, gameState }) => {
  try {
    const filePath = path.join(BASE_ROOT, 'saves', campaignId, 'data', 'game_state.json');
    const data = { game_state: gameState, saved_at: new Date().toISOString() };
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('🎮 ESTADO DEL JUEGO GUARDADO:');
    console.log('   📁 Carpeta: data/');
    console.log('   📄 Archivo: game_state.json');
    console.log('   💬 Mensajes:', gameState?.messages?.length || 0);
    console.log('   ⚔️ En combate:', gameState?.combat?.isActive || false);
    
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-daily-log', async (event, { campaignId, entry }) => {
  try {
    const filePath = path.join(BASE_ROOT, 'saves', campaignId, 'bitacora', 'daily_logs.json');
    let logs = { logs: [] };
    
    try {
      const existing = await fs.promises.readFile(filePath, 'utf8');
      logs = JSON.parse(existing);
    } catch {}
    
    logs.logs.push({ id: Date.now().toString(), timestamp: new Date().toISOString(), ...entry });
    await fs.promises.writeFile(filePath, JSON.stringify(logs, null, 2), 'utf8');
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-session-log', async (event, { campaignId, entry }) => {
  try {
    const filePath = path.join(BASE_ROOT, 'saves', campaignId, 'bitacora', 'session_logs.json');
    let sessions = { sessions: [] };
    
    try {
      const existing = await fs.promises.readFile(filePath, 'utf8');
      sessions = JSON.parse(existing);
    } catch {}
    
    sessions.sessions.push({ id: Date.now().toString(), timestamp: new Date().toISOString(), ...entry });
    await fs.promises.writeFile(filePath, JSON.stringify(sessions, null, 2), 'utf8');
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-json', async (event, { relPath, filename }) => {
  try {
    const fullPath = path.join(BASE_ROOT, relPath, filename);
    const content = await fs.promises.readFile(fullPath, 'utf8');
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-character', async (event, { campaignId }) => {
  try {
    const characterPath = path.join(BASE_ROOT, 'saves', campaignId, 'character');
    
    // Buscar el primer archivo JSON en la carpeta character
    const files = await fs.promises.readdir(characterPath);
    const characterFile = files.find(file => file.endsWith('.json'));
    
    if (!characterFile) {
      return { success: false, error: 'No se encontró archivo de personaje' };
    }
    
    const filePath = path.join(characterPath, characterFile);
    const content = await fs.promises.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    console.log('👤 PERSONAJE PRINCIPAL CARGADO:');
    console.log('   📁 Carpeta: character/');
    console.log('   📄 Archivo:', characterFile);
    console.log('   👤 Nombre:', data.main_character?.name);
    
    return { success: true, data: data.main_character };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-companions', async (event, { campaignId }) => {
  try {
    const companionsPath = path.join(BASE_ROOT, 'saves', campaignId, 'companions');
    
    // Leer todos los archivos JSON en la carpeta companions
    const files = await fs.promises.readdir(companionsPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const companions = [];
    for (const file of jsonFiles) {
      const filePath = path.join(companionsPath, file);
      const content = await fs.promises.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      if (data.companion) {
        companions.push(data.companion);
      }
    }
    
    console.log('👥 COMPAÑEROS CARGADOS:');
    console.log('   📁 Carpeta: companions/');
    console.log('   📊 Total:', companions.length);
    companions.forEach(comp => {
      console.log(`      - ${comp.name} (${comp.class})`);
    });
    
    return { success: true, data: companions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-villains', async (event, { campaignId }) => {
  try {
    const enemiesPath = path.join(BASE_ROOT, 'saves', campaignId, 'enemies');
    
    // Leer todos los archivos JSON en la carpeta enemies
    const files = await fs.promises.readdir(enemiesPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const villains = [];
    for (const file of jsonFiles) {
      const filePath = path.join(enemiesPath, file);
      const content = await fs.promises.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      if (data.villain) {
        villains.push(data.villain);
      }
    }
    
    console.log('👹 ENEMIGOS CARGADOS:');
    console.log('   📁 Carpeta: enemies/');
    console.log('   📊 Total:', villains.length);
    villains.forEach(villain => {
      console.log(`      - ${villain.name} (${villain.class || 'NPC'})`);
    });
    
    return { success: true, data: villains };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-world-state', async (event, { campaignId }) => {
  try {
    const filePath = path.join(BASE_ROOT, 'saves', campaignId, 'data', 'world_state.json');
    const content = await fs.promises.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    console.log('🌍 ESTADO DEL MUNDO CARGADO:');
    console.log('   📁 Carpeta: data/');
    console.log('   📄 Archivo: world_state.json');
    console.log('   📍 Ubicación:', data.world?.currentLocation || 'No especificada');
    
    return { success: true, data: data.world || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-game-state', async (event, { campaignId }) => {
  try {
    const filePath = path.join(BASE_ROOT, 'saves', campaignId, 'data', 'game_state.json');
    const content = await fs.promises.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    console.log('🎮 ESTADO DEL JUEGO CARGADO:');
    console.log('   📁 Carpeta: data/');
    console.log('   📄 Archivo: game_state.json');
    console.log('   💬 Mensajes:', data.game_state?.messages?.length || 0);
    console.log('   ⚔️ En combate:', data.game_state?.combat?.isActive || false);
    
    return { success: true, data: data.game_state || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-daily-logs', async (event, { campaignId }) => {
  try {
    const filePath = path.join(BASE_ROOT, 'saves', campaignId, 'bitacora', 'daily_logs.json');
    const content = await fs.promises.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    return { success: true, data: data.logs || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-session-logs', async (event, { campaignId }) => {
  try {
    const filePath = path.join(BASE_ROOT, 'saves', campaignId, 'bitacora', 'session_logs.json');
    const content = await fs.promises.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    return { success: true, data: data.sessions || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-campaigns', async () => {
  try {
    const savesPath = path.join(BASE_ROOT, 'saves');
    const items = await fs.promises.readdir(savesPath, { withFileTypes: true });
    const list = [];
    
    for (const dirent of items) {
      if (!dirent.isDirectory()) continue;
      const id = dirent.name;
      let name = id, created_at = new Date().toISOString(), last_saved_at = created_at;
      
      try {
        const manPath = path.join(savesPath, id, 'manifest.json');
        const manContent = await fs.promises.readFile(manPath, 'utf8');
        const man = JSON.parse(manContent);
        name = man?.campaign?.name ?? name;
        created_at = man?.campaign?.created_at ?? created_at;
        last_saved_at = man?.campaign?.last_saved_at ?? last_saved_at;
      } catch {}
      
      list.push({ id, name, created_at, last_saved_at });
    }
    
    return { success: true, data: list };
  } catch (error) {
    return { success: true, data: [] };
  }
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('get-documents-path', () => {
  return app.getPath('documents');
});

// Handlers existentes para configuración
ipcMain.handle('get-config', () => {
  return store.get('settings')
})

ipcMain.handle('save-config', (event, config) => {
  store.set('settings', config)
  return true
})

ipcMain.handle('get-ai-config', () => {
  return {
    provider: store.get('aiProvider', 'openai'),
    apiKey: store.get('apiKey', ''),
    ollamaUrl: store.get('ollamaUrl', 'http://localhost:11434'),
    ollamaModel: store.get('ollamaModel', 'llama3.2')
  };
});

ipcMain.handle('save-ai-config', (event, config) => {
  store.set('aiProvider', config.provider);
  store.set('apiKey', config.apiKey);
  store.set('ollamaUrl', config.ollamaUrl);
  store.set('ollamaModel', config.ollamaModel);
  return { success: true };
});

// Handlers para modo desarrollador
ipcMain.handle('get-developer-mode', () => {
  return store.get('developerMode', false)
})

ipcMain.handle('save-developer-mode', (event, developerMode) => {
  store.set('developerMode', developerMode)
  console.log('🔧 Modo desarrollador:', developerMode ? 'ACTIVADO' : 'DESACTIVADO')
  return true
})

// Función para seleccionar directorio de modelos
ipcMain.handle('select-model-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Seleccionar directorio para modelos de Ollama',
    defaultPath: path.join(app.getPath('home'), '.ollama', 'models')
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// Función para descargar modelo de Ollama
ipcMain.handle('download-ollama-model', async (event, { model, customPath = null }) => {
  return new Promise((resolve, reject) => {
    try {
      // Configurar el directorio de modelos si se especifica uno personalizado
      const env = { ...process.env }
      if (customPath) {
        env.OLLAMA_MODELS = customPath
      }
      
      // Ejecutar ollama pull
      const ollamaProcess = spawn('ollama', ['pull', model], {
        env: env,
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      let output = ''
      let errorOutput = ''
      
      ollamaProcess.stdout.on('data', (data) => {
        output += data.toString()
        // Enviar progreso al renderer
        mainWindow.webContents.send('ollama-download-progress', {
          type: 'progress',
          data: data.toString()
        })
      })
      
      ollamaProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
        // Enviar errores al renderer
        mainWindow.webContents.send('ollama-download-progress', {
          type: 'error',
          data: data.toString()
        })
      })
      
      ollamaProcess.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            message: `Modelo ${model} descargado exitosamente`,
            output: output
          })
        } else {
          reject(new Error(`Error descargando modelo: ${errorOutput}`))
        }
      })
      
      ollamaProcess.on('error', (error) => {
        reject(new Error(`Error ejecutando ollama pull: ${error.message}`))
      })
      
    } catch (error) {
      reject(error)
    }
  })
})

// Función para verificar si Ollama está instalado
ipcMain.handle('check-ollama-installed', async () => {
  return new Promise((resolve) => {
    const ollamaProcess = spawn('ollama', ['--version'], {
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    ollamaProcess.on('close', (code) => {
      resolve(code === 0)
    })
    
    ollamaProcess.on('error', () => {
      resolve(false)
    })
  })
})

// Función para obtener modelos disponibles en Ollama
ipcMain.handle('get-ollama-models', async () => {
  return new Promise((resolve, reject) => {
    const ollamaProcess = spawn('ollama', ['list'], {
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    let output = ''
    let errorOutput = ''
    
    ollamaProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    ollamaProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    ollamaProcess.on('close', (code) => {
      if (code === 0) {
        // Parsear la salida de ollama list
        const lines = output.split('\n').filter(line => line.trim())
        const models = []
        
        for (let i = 1; i < lines.length; i++) { // Saltar la primera línea (header)
          const parts = lines[i].split(/\s+/)
          if (parts.length >= 2) {
            models.push({
              name: parts[0],
              size: parts[1],
              modified: parts.slice(2).join(' '),
              location: 'ollama-default'
            })
          }
        }
        
        resolve(models)
      } else {
        reject(new Error(`Error obteniendo modelos: ${errorOutput}`))
      }
    })
    
    ollamaProcess.on('error', (error) => {
      reject(new Error(`Error ejecutando ollama list: ${error.message}`))
    })
  })
})

// Función para buscar modelos de Ollama en diferentes ubicaciones
ipcMain.handle('search-ollama-models', async () => {
  const foundModels = []
  const searchPaths = [
    // Ubicaciones por defecto de Ollama
    path.join(app.getPath('home'), '.ollama', 'models'),
    path.join(app.getPath('userData'), '.ollama', 'models'),
    
    // Ubicaciones comunes en Windows
    path.join('C:', 'Users', process.env.USERNAME, '.ollama', 'models'),
    path.join('C:', 'ProgramData', 'Ollama', 'models'),
    
    // Ubicaciones comunes en macOS
    path.join(app.getPath('home'), 'Library', 'Application Support', 'ollama', 'models'),
    
    // Ubicaciones comunes en Linux
    path.join(app.getPath('home'), '.local', 'share', 'ollama', 'models'),
    path.join('/usr', 'local', 'share', 'ollama', 'models'),
    path.join('/var', 'lib', 'ollama', 'models')
  ]

  // Buscar en cada ubicación
  for (const searchPath of searchPaths) {
    try {
      if (fs.existsSync(searchPath)) {
        const items = await fs.promises.readdir(searchPath, { withFileTypes: true })
        
        for (const item of items) {
          if (item.isDirectory()) {
            // Filtrar directorios que no son modelos válidos
            const invalidDirs = ['blobs', 'manifests', 'tmp', 'cache', '.git', 'node_modules']
            if (invalidDirs.includes(item.name.toLowerCase())) {
              continue
            }
            
            const modelPath = path.join(searchPath, item.name)
            const modelInfo = await getModelInfo(modelPath, item.name)
            if (modelInfo) {
              foundModels.push({
                ...modelInfo,
                location: searchPath,
                fullPath: modelPath
              })
            }
          }
        }
      }
    } catch (error) {
      console.log(`No se pudo acceder a ${searchPath}:`, error.message)
    }
  }

  return foundModels
})

// Función auxiliar para obtener información de un modelo
async function getModelInfo(modelPath, modelName) {
  try {
    const stats = await fs.promises.stat(modelPath)
    
    // Verificar que sea un directorio válido de modelo de Ollama
    // Los modelos de Ollama suelen tener archivos como "adapter_model.bin", "config.json", etc.
    const items = await fs.promises.readdir(modelPath)
    const hasModelFiles = items.some(item => 
      item.endsWith('.bin') || 
      item.endsWith('.safetensors') || 
      item.endsWith('.json') ||
      item.endsWith('.gguf') ||
      item.endsWith('.model')
    )
    
    // Si no tiene archivos de modelo, probablemente no es un modelo válido
    if (!hasModelFiles) {
      return null
    }
    
    const size = await getDirectorySize(modelPath)
    
    return {
      name: modelName,
      size: formatBytes(size),
      modified: stats.mtime.toISOString(),
      path: modelPath,
      isDirectory: true
    }
  } catch (error) {
    return null
  }
}

// Función para calcular el tamaño de un directorio
async function getDirectorySize(dirPath) {
  let totalSize = 0
  
  try {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true })
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name)
      
      if (item.isDirectory()) {
        totalSize += await getDirectorySize(itemPath)
      } else {
        const stats = await fs.promises.stat(itemPath)
        totalSize += stats.size
      }
    }
  } catch (error) {
    console.log(`Error calculando tamaño de ${dirPath}:`, error.message)
  }
  
  return totalSize
}

// Función para formatear bytes a formato legible
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Función para usar un modelo existente
ipcMain.handle('use-existing-model', async (event, { modelPath, modelName }) => {
  try {
    // Validar que el modelo sea válido
    const modelInfo = await getModelInfo(modelPath, modelName)
    if (!modelInfo) {
      return {
        success: false,
        error: `El directorio ${modelName} no parece ser un modelo válido de Ollama`
      }
    }
    
    // Configurar la variable de entorno para usar este directorio
    const modelDir = path.dirname(modelPath)
    
    // Guardar la configuración
    store.set('ollamaModelsPath', modelDir)
    
    return {
      success: true,
      message: `Modelo ${modelName} configurado desde ${modelDir}`,
      path: modelDir
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
})

// Handler para llamadas a OpenAI
ipcMain.handle('ask-openai', async (event, { message, gameState, campaignId, gameOptions }) => {
  try {
    const apiKey = store.get('apiKey')
    if (!apiKey) {
      return {
        error: true,
        message: '❌ Error: No se ha configurado la API key de OpenAI.\n\nPara usar la IA del juego, necesitas:\n1. Ir a las opciones del juego (⚙️)\n2. Configurar tu API key de OpenAI\n3. Obtener una key gratuita en https://platform.openai.com/api-keys\n\nSin la API key, la IA no puede funcionar.'
      }
    }

    // Importar OpenAI dinámicamente
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey })

    // Obtener modo desarrollador
    const developerMode = store.get('developerMode', false)

    // Construir el prompt del sistema
    let systemPrompt = `Eres un Dungeon Master (DM) experto en D&D 5e. Tu objetivo es crear una experiencia de juego inmersiva y narrativa para un jugador solitario.

REGLAS IMPORTANTES:
- Siempre responde en español
- Mantén un tono narrativo y descriptivo
- Haz tiradas de dados cuando sea necesario (d20, d6, etc.)
- Sé consistente con las reglas de D&D 5e
- Adapta la dificultad al nivel del personaje
- Proporciona opciones claras al jugador
- Mantén la coherencia del mundo y la historia

ESTADO DEL JUEGO:
${JSON.stringify(gameState, null, 2)}

OPCIONES DE JUEGO:
${JSON.stringify(gameOptions, null, 2)}`

    // Agregar prompt especial para modo desarrollador
    if (developerMode) {
      systemPrompt += `\n\n🔧 MODO DESARROLLADOR ACTIVADO 🔧
      
ESTÁS EN MODO DE PRUEBAS - EL PROGRAMADOR TE VA A HABLAR

INSTRUCCIONES ESPECIALES PARA MODO DESARROLLADOR:
- El usuario que te está hablando es el programador desarrollando el juego
- Puede hacer preguntas directas sobre mecánicas, bugs, o funcionalidades
- Responde de manera técnica pero clara sobre el funcionamiento del sistema
- Si detectas problemas en las mecánicas, explícalos detalladamente
- Proporciona sugerencias de mejora cuando sea apropiado
- Mantén el tono profesional pero accesible`
    }

    // Hacer la llamada a OpenAI
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 2000,
      temperature: 0.8
    })

    return {
      error: false,
      message: response.choices[0].message.content
    }

  } catch (error) {
    console.error('Error en llamada a OpenAI:', error)
    return {
      error: true,
      message: `❌ Error al comunicarse con OpenAI: ${error.message}\n\nVerifica tu conexión a internet y que tu API key sea válida.`
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
    show: true
  })

  console.log('Ventana creada, cargando URL...')

  // Cargar la aplicación desde archivos estáticos
  console.log('Cargando aplicación desde archivos estáticos...')
  const indexPath = path.join(__dirname, '../dist/index.html')
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

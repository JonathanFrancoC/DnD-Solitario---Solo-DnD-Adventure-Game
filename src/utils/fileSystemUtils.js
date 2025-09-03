// Utilidades para manejo del sistema de archivos
// Detecta automáticamente si estamos en Electron o navegador
// y crea la carpeta de personajes si no existe

// Detectar si estamos en Electron
const isElectron = () => {
  console.log('Verificando si estamos en Electron...');
  
  // Verificar si window.require existe (más confiable en Electron)
  const hasRequire = typeof window !== 'undefined' && typeof window.require === 'function';
  console.log('window.require disponible:', hasRequire);
  
  // Verificar si process.versions.electron existe
  const hasElectronVersion = typeof process !== 'undefined' && process.versions && process.versions.electron;
  console.log('process.versions.electron:', hasElectronVersion);
  
  // Verificar si window.process.type existe
  const hasProcessType = typeof window !== 'undefined' && window.process && window.process.type;
  console.log('window.process.type:', hasProcessType);
  
  const isElectronEnv = hasRequire || hasElectronVersion || hasProcessType;
  console.log('isElectron result:', isElectronEnv);
  
  return isElectronEnv;
};

// Obtener la ruta de la carpeta de personajes
const getCharactersFolderPath = () => {
  console.log('getCharactersFolderPath llamado');
  
  if (isElectron()) {
    // En Electron, usar la carpeta del proyecto
    const path = window.require('path');
    // Usar la carpeta characters en el directorio del proyecto
    const charactersPath = path.join(process.cwd(), 'characters');
    console.log('Ruta de personajes (Electron):', charactersPath);
    return charactersPath;
  } else {
    // En navegador, usar localStorage (fallback)
    console.log('No estamos en Electron, retornando null');
    return null;
  }
};

// Crear la carpeta de personajes si no existe
const ensureCharactersFolder = async () => {
  if (!isElectron()) {
    return false; // No podemos crear carpetas en el navegador
  }

  try {
    const fs = window.require('fs');
    const path = window.require('path');
    const charactersPath = getCharactersFolderPath();
    
    if (!fs.existsSync(charactersPath)) {
      fs.mkdirSync(charactersPath, { recursive: true });
      console.log('Carpeta de personajes creada:', charactersPath);
    }
    return true;
  } catch (error) {
    console.error('Error al crear carpeta de personajes:', error);
    return false;
  }
};

// Guardar personaje en archivo
const saveCharacterToFile = async (characterData, characterName) => {
  console.log('saveCharacterToFile llamado con:', { characterName, isElectron: isElectron() });
  
  if (!isElectron()) {
    console.log('No estamos en Electron, fallback a localStorage');
    return false; // Fallback a localStorage
  }

  try {
    const fs = window.require('fs');
    const path = window.require('path');
    const charactersPath = getCharactersFolderPath();
    
    console.log('Ruta de la carpeta de personajes:', charactersPath);
    
    // Asegurar que la carpeta existe
    await ensureCharactersFolder();
    
    // Crear nombre de archivo seguro
    const safeFileName = characterName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(charactersPath, `${safeFileName}.json`);
    
    console.log('Archivo a guardar:', filePath);
    
    // Guardar el personaje
    const characterToSave = {
      id: Date.now().toString(),
      name: characterName,
      data: characterData,
      savedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(characterToSave, null, 2));
    console.log('Personaje guardado exitosamente en archivo:', filePath);
    return true;
  } catch (error) {
    console.error('Error al guardar personaje en archivo:', error);
    return false;
  }
};

// Cargar personajes desde archivos
const loadCharactersFromFiles = async () => {
  if (!isElectron()) {
    return []; // Fallback a localStorage
  }

  try {
    const fs = window.require('fs');
    const path = window.require('path');
    const charactersPath = getCharactersFolderPath();
    
    // Asegurar que la carpeta existe
    await ensureCharactersFolder();
    
    if (!fs.existsSync(charactersPath)) {
      return [];
    }
    
    const files = fs.readdirSync(charactersPath);
    const characters = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(charactersPath, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const character = JSON.parse(fileContent);
          characters.push(character);
        } catch (error) {
          console.error(`Error al cargar archivo ${file}:`, error);
        }
      }
    }
    
    return characters;
  } catch (error) {
    console.error('Error al cargar personajes desde archivos:', error);
    return [];
  }
};

// Actualizar personaje en archivo
const updateCharacterInFile = async (characterId, characterData) => {
  if (!isElectron()) {
    return false; // Fallback a localStorage
  }

  try {
    const fs = window.require('fs');
    const path = window.require('path');
    const charactersPath = getCharactersFolderPath();
    
    const files = fs.readdirSync(charactersPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(charactersPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const character = JSON.parse(fileContent);
        
        if (character.id === characterId) {
          character.data = characterData;
          character.lastModified = new Date().toISOString();
          fs.writeFileSync(filePath, JSON.stringify(character, null, 2));
          console.log('Personaje actualizado en archivo:', filePath);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error al actualizar personaje en archivo:', error);
    return false;
  }
};

// Eliminar personaje de archivo
const deleteCharacterFromFile = async (characterId) => {
  if (!isElectron()) {
    return false; // Fallback a localStorage
  }

  try {
    const fs = window.require('fs');
    const path = window.require('path');
    const charactersPath = getCharactersFolderPath();
    
    const files = fs.readdirSync(charactersPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(charactersPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const character = JSON.parse(fileContent);
        
        if (character.id === characterId) {
          fs.unlinkSync(filePath);
          console.log('Personaje eliminado de archivo:', filePath);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error al eliminar personaje de archivo:', error);
    return false;
  }
};

 // Función principal para inicializar el sistema de archivos
 const initializeFileSystem = async () => {
   if (isElectron()) {
     console.log('Sistema de archivos disponible - usando carpeta de personajes');
     await ensureCharactersFolder();
     return true;
   } else {
     console.log('Sistema de archivos no disponible - usando almacenamiento local');
     return false;
   }
 };

export {
  isElectron,
  getCharactersFolderPath,
  ensureCharactersFolder,
  saveCharacterToFile,
  loadCharactersFromFiles,
  updateCharacterInFile,
  deleteCharacterFromFile,
  initializeFileSystem
};

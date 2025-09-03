// secureFileSystem.js - Sistema de archivos seguro usando IPC en Electron

/**
 * Detecta si estamos en Electron
 */
export const isElectron = typeof window !== 'undefined' && !!window.fsapi;

/**
 * Asegura que existen las carpetas base
 */
export async function ensureBaseDirs() {
  if (!isElectron) throw new Error('No Electron (fsapi no disponible)');
  return window.fsapi.ensureBaseDirs();
}

/**
 * Guarda un personaje
 */
export async function saveCharacter(character) {
  if (!isElectron) throw new Error('No Electron (fsapi no disponible)');
  return window.fsapi.saveCharacter(character);
}

/**
 * Lista todos los personajes disponibles
 */
export async function listCharacters() {
  if (!isElectron) throw new Error('No Electron (fsapi no disponible)');
  return window.fsapi.listCharacters();
}

/**
 * Carga un personaje
 */
export async function loadCharacter(file) {
  if (!isElectron) throw new Error('No Electron (fsapi no disponible)');
  return window.fsapi.loadCharacter(file);
}

/**
 * Elimina un personaje
 */
export async function deleteCharacter(file) {
  if (!isElectron) throw new Error('No Electron (fsapi no disponible)');
  return window.fsapi.deleteCharacter(file);
}

/**
 * Obtiene la ruta de la aplicación
 */
export async function getAppPath() {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.getAppPath();
  return result;
}

/**
 * Obtiene la ruta de documentos
 */
export async function getDocumentsPath() {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.getDocumentsPath();
  return result;
}

/**
 * Asegura que existe una carpeta
 */
export async function ensureDir(relPath) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.ensureDir(relPath);
  if (!result.success) {
    throw new Error(`Error creando carpeta: ${result.error}`);
  }
  return result.path;
}

/**
 * Crea una nueva campaña
 */
export async function createCampaign(campaignId, campaignName) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.createCampaign(campaignId, campaignName);
  if (!result.success) {
    throw new Error(`Error creando campaña: ${result.error}`);
  }
  console.log('🎮 CAMPAÑA CREADA EXITOSAMENTE:');
  console.log('   📁 Ruta:', result.path);
  console.log('   🆔 ID:', campaignId);
  console.log('   📛 Nombre:', campaignName);
  return result.path;
}

/**
 * Guarda un archivo JSON genérico
 */
export async function saveJSON(relPath, filename, data) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.saveJSON(relPath, filename, data);
  if (!result.success) {
    throw new Error(`Error guardando archivo: ${result.error}`);
  }
  console.log('💾 ARCHIVO GUARDADO:', result.path);
  return result.path;
}

/**
 * Guarda el personaje principal de campaña
 */
export async function saveCharacterCampaign(campaignId, characterData) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.saveCharacter(campaignId, characterData);
  if (!result.success) {
    throw new Error(`Error guardando personaje: ${result.error}`);
  }
  console.log('🎯 PERSONAJE PRINCIPAL GUARDADO:');
  console.log('   📁 Ruta:', result.path);
  console.log('   👤 Nombre:', characterData.name || 'Sin nombre');
  console.log('   🎭 Clase:', characterData.class || 'Sin clase');
  console.log('   📊 Nivel:', characterData.level || 1);
  return result.path;
}

/**
 * Guarda compañeros
 */
export async function saveCompanions(campaignId, companions) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.saveCompanions(campaignId, companions);
  if (!result.success) {
    throw new Error(`Error guardando compañeros: ${result.error}`);
  }
  console.log('🤝 COMPAÑEROS GUARDADOS:');
  console.log('   📁 Ruta:', result.path);
  console.log('   👥 Cantidad:', companions.length);
  return result.path;
}

/**
 * Guarda villanos
 */
export async function saveVillains(campaignId, villains) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.saveVillains(campaignId, villains);
  if (!result.success) {
    throw new Error(`Error guardando villanos: ${result.error}`);
  }
  console.log('👹 VILLANOS GUARDADOS:');
  console.log('   📁 Ruta:', result.path);
  console.log('   👹 Cantidad:', villains.length);
  return result.path;
}

/**
 * Guarda el estado del mundo
 */
export async function saveWorldState(campaignId, worldState) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.saveWorldState(campaignId, worldState);
  if (!result.success) {
    throw new Error(`Error guardando estado del mundo: ${result.error}`);
  }
  return result.path;
}

/**
 * Guarda el estado del juego
 */
export async function saveGameState(campaignId, gameState) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.saveGameState(campaignId, gameState);
  if (!result.success) {
    throw new Error(`Error guardando estado del juego: ${result.error}`);
  }
  return result.path;
}

/**
 * Guarda entrada en la bitácora diaria
 */
export async function saveDailyLog(campaignId, entry) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.saveDailyLog(campaignId, entry);
  if (!result.success) {
    throw new Error(`Error guardando bitácora diaria: ${result.error}`);
  }
  console.log('📝 BITÁCORA DIARIA GUARDADA:', result.path);
  return result.path;
}

/**
 * Guarda entrada en la bitácora de sesión
 */
export async function saveSessionLog(campaignId, entry) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.saveSessionLog(campaignId, entry);
  if (!result.success) {
    throw new Error(`Error guardando sesión: ${result.error}`);
  }
  console.log('🎮 SESIÓN GUARDADA:', result.path);
  return result.path;
}

/**
 * Carga un archivo JSON genérico
 */
export async function loadJSON(relPath, filename) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.loadJSON(relPath, filename);
  if (!result.success) {
    throw new Error(`Error cargando archivo: ${result.error}`);
  }
  return result.data;
}

/**
 * Carga el personaje principal de campaña
 */
export async function loadCharacterCampaign(campaignId) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.loadCharacter(campaignId);
  if (!result.success) {
    throw new Error(`Error cargando personaje: ${result.error}`);
  }
  return result.data;
}

/**
 * Carga compañeros
 */
export async function loadCompanions(campaignId) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.loadCompanions(campaignId);
  if (!result.success) {
    throw new Error(`Error cargando compañeros: ${result.error}`);
  }
  return result.data;
}

/**
 * Carga villanos
 */
export async function loadVillains(campaignId) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.loadVillains(campaignId);
  if (!result.success) {
    throw new Error(`Error cargando villanos: ${result.error}`);
  }
  return result.data;
}

/**
 * Carga el estado del mundo
 */
export async function loadWorldState(campaignId) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.loadWorldState(campaignId);
  if (!result.success) {
    throw new Error(`Error cargando estado del mundo: ${result.error}`);
  }
  return result.data;
}

/**
 * Carga el estado del juego
 */
export async function loadGameState(campaignId) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.loadGameState(campaignId);
  if (!result.success) {
    throw new Error(`Error cargando estado del juego: ${result.error}`);
  }
  return result.data;
}

/**
 * Carga la bitácora diaria
 */
export async function loadDailyLogs(campaignId) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.loadDailyLogs(campaignId);
  if (!result.success) {
    throw new Error(`Error cargando bitácora diaria: ${result.error}`);
  }
  return result.data;
}

/**
 * Carga las sesiones
 */
export async function loadSessionLogs(campaignId) {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.loadSessionLogs(campaignId);
  if (!result.success) {
    throw new Error(`Error cargando sesiones: ${result.error}`);
  }
  return result.data;
}

/**
 * Lista todas las campañas disponibles
 */
export async function listCampaigns() {
  if (!isElectron) throw new Error('No estamos en Electron');
  const result = await window.fsapi.listCampaigns();
  if (!result.success) {
    throw new Error(`Error listando campañas: ${result.error}`);
  }
  return result.data;
}

/**
 * Guarda todo el estado de la partida
 */
export async function saveFullGameState(campaignId, gameState, character, companions = [], villains = []) {
  if (!isElectron) throw new Error('No estamos en Electron');
  
  console.log('💾 GUARDANDO ESTADO COMPLETO DE LA PARTIDA...');
  console.log('   🎮 Campaña:', campaignId);
  console.log('   👤 Personaje principal:', character?.name || 'Sin nombre');
  console.log('   👥 Compañeros:', companions.length);
  console.log('   👹 Villanos:', villains.length);
  
  try {
         // Guardar personaje principal
     if (character) {
       await saveCharacterCampaign(campaignId, character);
     }
    
    // Guardar compañeros
    await saveCompanions(campaignId, companions);
    
    // Guardar villanos
    await saveVillains(campaignId, villains);
    
    // Guardar estado del mundo
    if (gameState.world) {
      await saveWorldState(campaignId, gameState.world);
    }
    
    // Guardar estado general del juego
    await saveGameState(campaignId, gameState);
    
    console.log('✅ ESTADO COMPLETO DE LA PARTIDA GUARDADO EXITOSAMENTE');
    console.log('   📁 Carpeta de la campaña:', `saves/${campaignId}/`);
    console.log('   📊 Total de archivos guardados: 5');
    
    return true;
  } catch (error) {
    console.error('❌ Error guardando estado completo:', error);
    throw error;
  }
}

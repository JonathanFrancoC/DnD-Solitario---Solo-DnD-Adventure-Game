// gameSaveService.js (NUEVO) – Servicio de guardado SOLO para Electron
import {
  isElectron,
  ensureBaseDirs,
  saveCharacter as fsSaveCharacter,
  listCharacters as fsListCharacters,
  loadCharacter as fsLoadCharacter,
  deleteCharacter as fsDeleteCharacter,
  createCampaign as fsCreateCampaign,
  saveCompanions as fsSaveCompanions,
  saveVillains as fsSaveVillains,
  saveWorldState as fsSaveWorldState,
  saveGameState as fsSaveGameState,
  saveDailyLog as fsSaveDailyLog,
  saveSessionLog as fsSaveSessionLog,
  saveCharacterCampaign as fsSaveCharacterCampaign,
  loadCharacterCampaign as fsLoadCharacterCampaign,
  loadCompanions as fsLoadCompanions,
  loadVillains as fsLoadVillains,
  loadWorldState as fsLoadWorldState,
  loadGameState as fsLoadGameState,
  listCampaigns as fsListCampaigns,
} from './secureFileSystem.js';

// Estructura de carpetas (Electron): Desktop/DnD solitario/characters
// NO hay fallback a localStorage - solo funciona en Electron

class GameSaveService {
  constructor() {
    this.currentCampaignId = null;
    this.isElectron = isElectron;
  }

  async initialize() {
    if (!this.isElectron) {
      throw new Error('Este guardado requiere la aplicación de escritorio (Electron). Por favor, ejecuta la versión de escritorio para guardar personajes en archivos.');
    }
    await ensureBaseDirs();
    return true;
  }

  setCurrentCampaign(campaignId) {
    this.currentCampaignId = campaignId;
  }

  // --- Gestión de personajes individuales ---------------------------------

  async saveMainCharacter(character) {
    if (!this.isElectron) {
      throw new Error('Guardado por archivos solo disponible en escritorio.');
    }
    await fsSaveCharacter(character);
    return true;
  }

  async listCharacters() {
    if (!this.isElectron) {
      throw new Error('Listado de personajes solo disponible en escritorio.');
    }
    return fsListCharacters();
  }

  async loadCharacter(file) {
    if (!this.isElectron) {
      throw new Error('Carga de personajes solo disponible en escritorio.');
    }
    return fsLoadCharacter(file);
  }

  async deleteCharacter(file) {
    if (!this.isElectron) {
      throw new Error('Eliminación de personajes solo disponible en escritorio.');
    }
    return fsDeleteCharacter(file);
  }

  // --- Campañas -------------------------------------------------------------

  async createCampaign(campaignId, campaignName) {
    if (!this.isElectron) {
      throw new Error('Creación de campañas solo disponible en escritorio.');
    }
    await fsCreateCampaign(campaignId, campaignName);
    this.setCurrentCampaign(campaignId);
    return true;
  }

  async listCampaigns() {
    if (!this.isElectron) {
      throw new Error('Listado de campañas solo disponible en escritorio.');
    }
    return fsListCampaigns();
  }

  // --- Guardados principales -----------------------------------------------

  async saveCompanions(companions) {
    if (!this.currentCampaignId) return false;
    if (!this.isElectron) {
      throw new Error('Guardado de compañeros solo disponible en escritorio.');
    }
    await fsSaveCompanions(this.currentCampaignId, companions);
    return true;
  }

  async saveVillains(villains) {
    if (!this.currentCampaignId) return false;
    if (!this.isElectron) {
      throw new Error('Guardado de villanos solo disponible en escritorio.');
    }
    await fsSaveVillains(this.currentCampaignId, villains);
    return true;
  }

  async saveWorldState(world) {
    if (!this.currentCampaignId) return false;
    if (!this.isElectron) {
      throw new Error('Guardado de estado del mundo solo disponible en escritorio.');
    }
    await fsSaveWorldState(this.currentCampaignId, world);
    return true;
  }

  async saveGameState(gameState) {
    if (!this.currentCampaignId) {
      throw new Error('No hay campaña activa para guardar el estado del juego.');
    }
    if (!this.isElectron) {
      throw new Error('Guardado de estado del juego solo disponible en escritorio.');
    }
    await fsSaveGameState(this.currentCampaignId, gameState);
    return true;
  }

  // --- Bitácoras ------------------------------------------------------------

  async saveDailyLogEntry(entry) {
    if (!this.currentCampaignId) return false;
    if (!this.isElectron) {
      throw new Error('Guardado de bitácora diaria solo disponible en escritorio.');
    }
    await fsSaveDailyLog(this.currentCampaignId, entry);
    return true;
  }

  async saveSessionLogEntry(entry) {
    if (!this.currentCampaignId) return false;
    if (!this.isElectron) {
      throw new Error('Guardado de sesiones solo disponible en escritorio.');
    }
    await fsSaveSessionLog(this.currentCampaignId, entry);
    return true;
  }

  // --- Cargas ---------------------------------------------------------------

  async loadMainCharacter(campaignId = null) {
    const id = campaignId || this.currentCampaignId;
    if (!id) return null;
    if (!this.isElectron) {
      throw new Error('Carga de personaje principal solo disponible en escritorio.');
    }
    return fsLoadCharacterCampaign(id);
  }

  async loadCompanions(campaignId = null) {
    const id = campaignId || this.currentCampaignId;
    if (!id) return [];
    if (!this.isElectron) {
      throw new Error('Carga de compañeros solo disponible en escritorio.');
    }
    return fsLoadCompanions(id);
  }

  async loadVillains(campaignId = null) {
    const id = campaignId || this.currentCampaignId;
    if (!id) return [];
    if (!this.isElectron) {
      throw new Error('Carga de villanos solo disponible en escritorio.');
    }
    return fsLoadVillains(id);
  }

  async loadWorldState(campaignId = null) {
    const id = campaignId || this.currentCampaignId;
    if (!id) return {};
    if (!this.isElectron) {
      throw new Error('Carga de estado del mundo solo disponible en escritorio.');
    }
    return fsLoadWorldState(id);
  }

  async loadGameState(campaignId = null) {
    const id = campaignId || this.currentCampaignId;
    if (!id) {
      throw new Error('No hay campaña activa para cargar el estado del juego.');
    }
    if (!this.isElectron) {
      throw new Error('Carga de estado del juego solo disponible en escritorio.');
    }
    return fsLoadGameState(id);
  }

  // --- Guardado completo ----------------------------------------------------

  async saveFullGameState(gameState, character, companions = [], villains = []) {
    if (!this.currentCampaignId) return false;
    if (!this.isElectron) {
      throw new Error('Guardado completo solo disponible en escritorio.');
    }

    await fsSaveCharacterCampaign(this.currentCampaignId, character);
    await this.saveCompanions(companions);
    await this.saveVillains(villains);
    await this.saveWorldState(gameState.world || {});
    await this.saveGameState(gameState);
    return true;
  }

  // --- Métodos de compatibilidad para personajes individuales --------------

  async saveCompanion(companion, campaignId = null) {
    const targetCampaignId = campaignId || this.currentCampaignId;
    if (!targetCampaignId) return false;

    if (!this.isElectron) {
      throw new Error('Guardado de compañeros solo disponible en escritorio.');
    }

    // Cargar compañeros existentes
    const existingCompanions = await this.loadCompanions(targetCampaignId);
    
    // Buscar si ya existe el compañero
    const existingIndex = existingCompanions.findIndex(c => c.id === companion.id);
    
    if (existingIndex >= 0) {
      // Actualizar compañero existente
      existingCompanions[existingIndex] = companion;
    } else {
      // Agregar nuevo compañero
      existingCompanions.push(companion);
    }
    
    await this.saveCompanions(existingCompanions);
    return true;
  }

  async saveVillain(villain, campaignId = null) {
    const targetCampaignId = campaignId || this.currentCampaignId;
    if (!targetCampaignId) return false;

    if (!this.isElectron) {
      throw new Error('Guardado de villanos solo disponible en escritorio.');
    }

    // Cargar villanos existentes
    const existingVillains = await this.loadVillains(targetCampaignId);
    
    // Buscar si ya existe el villano
    const existingIndex = existingVillains.findIndex(v => v.id === villain.id);
    
    if (existingIndex >= 0) {
      // Actualizar villano existente
      existingVillains[existingIndex] = villain;
    } else {
      // Agregar nuevo villano
      existingVillains.push(villain);
    }
    
    await this.saveVillains(existingVillains);
    return true;
  }

  // --- Métodos de utilidad --------------------------------------------------

  async updateCharacterStatus(characterId, status) {
    if (!this.isElectron) {
      throw new Error('Actualización de estado de personaje solo disponible en escritorio.');
    }
    
    // Buscar el personaje en la campaña actual y actualizar su status
    const character = await this.loadMainCharacter();
    if (character && character.id === characterId) {
      character.status = status;
      await fsSaveCharacterCampaign(this.currentCampaignId, character);
      return true;
    }
    return false;
  }
}

const gameSaveService = new GameSaveService();
export default gameSaveService;

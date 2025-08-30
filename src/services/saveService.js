// saveService.js - Servicio de guardado para campañas de D&D (Electron/Node.js)
const fs = require('fs').promises;
const path = require('path');

// Constantes
const SCHEMA_VERSION = "1.0.0";
const RULESET = "DND5E-es";

// Utilidades
const now = () => new Date().toISOString();
const roleFolder = (role) => ({main:'main',companion:'companions',enemy:'enemies',npc:'npcs'})[role];

// Inicialización
let saveRoot = './saves';

/**
 * Inicializa la ruta raíz de guardado
 */
async function initSaveRoot(rootPath) {
  saveRoot = rootPath;
  await fs.mkdir(saveRoot, { recursive: true });
}

/**
 * Crea una nueva campaña con estructura de carpetas y manifest
 */
async function createCampaign(campaignId, meta) {
  const base = path.join(saveRoot, campaignId);
  
  // Crear estructura de carpetas
  await fs.mkdir(path.join(base, 'characters', 'main'), { recursive: true });
  await fs.mkdir(path.join(base, 'characters', 'companions'), { recursive: true });
  await fs.mkdir(path.join(base, 'characters', 'enemies'), { recursive: true });
  await fs.mkdir(path.join(base, 'characters', 'npcs'), { recursive: true });
  await fs.mkdir(path.join(base, 'encounters'), { recursive: true });
  await fs.mkdir(path.join(base, 'inventory'), { recursive: true });
  await fs.mkdir(path.join(base, 'logs'), { recursive: true });
  await fs.mkdir(path.join(base, 'templates'), { recursive: true });
  
  // Crear manifest inicial
  const manifest = {
    schema_version: SCHEMA_VERSION,
    campaign: { 
      id: campaignId, 
      name: meta.name, 
      created_at: now(), 
      last_saved_at: now(), 
      ruleset: meta.ruleset ?? RULESET 
    },
    indices: { characters: [], encounters: [] },
    counters: { last_character_num: 0, last_encounter_num: 0 }
  };
  
  await fs.writeFile(path.join(base, 'manifest.json'), JSON.stringify(manifest, null, 2));
  
  // Crear template de personaje
  const characterTemplate = {
    schema_version: SCHEMA_VERSION,
    entity: "character",
    id: "template",
    role: "main",
    is_ephemeral: false,
    identity: {
      name: "Nombre",
      race: "humano",
      class: "guerrero",
      subclass: null,
      level: 1,
      alignment: "Neutral",
      background: "soldado",
      tags: []
    },
    stats: {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10
    },
    derived: {
      hit_die: "d10",
      max_hp: 10,
      ac: 10,
      speed: 30,
      proficiency_bonus: 2
    },
    skills: [],
    saving_throws: [],
    equipment: {
      armor: null,
      shield: null,
      weapons: [],
      items: []
    },
    spells: {
      cantrips: [],
      known: []
    },
    mechanics: {},
    state: {
      status: "alive",
      conditions: [],
      exhaustion: 0,
      location: ""
    },
    relationships: {
      party_id: null,
      allies: [],
      enemies: []
    },
    notes: "",
    ai_summary: "",
    provenance: {
      created_at: now(),
      updated_at: now(),
      revision: 1
    }
  };
  
  await fs.writeFile(path.join(base, 'templates', 'character.template.json'), JSON.stringify(characterTemplate, null, 2));
  
  return manifest;
}

/**
 * Lee el manifest de una campaña
 */
async function getManifest(campaignId) {
  const manifestPath = path.join(saveRoot, campaignId, 'manifest.json');
  const data = await fs.readFile(manifestPath, 'utf8');
  return JSON.parse(data);
}

/**
 * Escribe el manifest actualizado
 */
async function writeManifest(campaignId, manifest) {
  manifest.campaign.last_saved_at = now();
  const manifestPath = path.join(saveRoot, campaignId, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Crea o actualiza un personaje
 */
async function upsertCharacter(campaignId, character) {
  const base = path.join(saveRoot, campaignId);
  const manifest = await getManifest(campaignId);

  // Generar ID si no existe
  if (!character.id) {
    manifest.counters.last_character_num++;
    character.id = `${character.role}-${manifest.counters.last_character_num.toString().padStart(4,'0')}`;
  }

  // Actualizar timestamps y revisión
  if (!character.provenance) {
    character.provenance = { 
      created_at: now(), 
      updated_at: now(), 
      revision: 1 
    };
  } else {
    character.provenance.revision += 1;
    character.provenance.updated_at = now();
  }

  // Asegurar campos requeridos
  character.schema_version = SCHEMA_VERSION;
  character.entity = "character";

  // Guardar archivo
  const folder = path.join(base, 'characters', roleFolder(character.role));
  await fs.mkdir(folder, { recursive: true });
  const filePath = path.join(folder, `${character.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(character, null, 2));

  // Actualizar índice
  const indexItem = { 
    id: character.id, 
    role: character.role, 
    path: path.relative(base, filePath), 
    name: character.identity?.name, 
    level: character.identity?.level 
  };
  
  const existingIndex = manifest.indices.characters.findIndex(c => c.id === character.id);
  if (existingIndex >= 0) {
    manifest.indices.characters[existingIndex] = indexItem;
  } else {
    manifest.indices.characters.push(indexItem);
  }

  await writeManifest(campaignId, manifest);

  // Log del cambio
  const logEntry = { 
    ts: now(), 
    actor: 'system', 
    kind: 'upsertCharacter', 
    id: character.id,
    patch: { role: character.role, name: character.identity?.name }
  };
  await fs.appendFile(path.join(base, 'logs', 'changes.log.jsonl'), JSON.stringify(logEntry) + '\n');

  return character;
}

/**
 * Obtiene un personaje por ID
 */
async function getCharacter(campaignId, characterId) {
  const manifest = await getManifest(campaignId);
  const characterIndex = manifest.indices.characters.find(c => c.id === characterId);
  
  if (!characterIndex) {
    throw new Error(`Personaje no encontrado: ${characterId}`);
  }
  
  const characterPath = path.join(saveRoot, campaignId, characterIndex.path);
  const data = await fs.readFile(characterPath, 'utf8');
  return JSON.parse(data);
}

/**
 * Crea un nuevo encuentro
 */
async function createEncounter(campaignId, encounter) {
  const base = path.join(saveRoot, campaignId);
  const manifest = await getManifest(campaignId);

  // Generar ID si no existe
  if (!encounter.id) {
    manifest.counters.last_encounter_num++;
    encounter.id = `enc-${manifest.counters.last_encounter_num.toString().padStart(4,'0')}`;
  }

  // Asegurar campos requeridos
  encounter.schema_version = SCHEMA_VERSION;
  encounter.entity = "encounter";
  encounter.started_at = encounter.started_at || now();

  // Guardar archivo
  const encountersPath = path.join(base, 'encounters', `${encounter.id}.json`);
  await fs.writeFile(encountersPath, JSON.stringify(encounter, null, 2));

  // Actualizar índice
  const indexItem = {
    id: encounter.id,
    path: path.relative(base, encountersPath),
    title: encounter.title
  };
  
  const existingIndex = manifest.indices.encounters.findIndex(e => e.id === encounter.id);
  if (existingIndex >= 0) {
    manifest.indices.encounters[existingIndex] = indexItem;
  } else {
    manifest.indices.encounters.push(indexItem);
  }

  await writeManifest(campaignId, manifest);

  // Log del cambio
  const logEntry = { 
    ts: now(), 
    actor: 'system', 
    kind: 'createEncounter', 
    id: encounter.id,
    patch: { title: encounter.title }
  };
  await fs.appendFile(path.join(base, 'logs', 'changes.log.jsonl'), JSON.stringify(logEntry) + '\n');

  return encounter;
}

/**
 * Guarda el estado del mundo
 */
async function saveWorldState(campaignId, worldState) {
  const base = path.join(saveRoot, campaignId);
  const worldPath = path.join(base, 'world.json');
  
  const worldData = {
    schema_version: SCHEMA_VERSION,
    entity: "world",
    ...worldState,
    saved_at: now()
  };
  
  await fs.writeFile(worldPath, JSON.stringify(worldData, null, 2));
  
  // Log del cambio
  const logEntry = { 
    ts: now(), 
    actor: 'system', 
    kind: 'saveWorldState',
    patch: { location: worldState.current_location }
  };
  await fs.appendFile(path.join(base, 'logs', 'changes.log.jsonl'), JSON.stringify(logEntry) + '\n');
}

/**
 * Lista todas las campañas disponibles
 */
async function listCampaigns() {
  try {
    const campaigns = await fs.readdir(saveRoot);
    const campaignList = [];
    
    for (const campaignId of campaigns) {
      try {
        const manifest = await getManifest(campaignId);
        campaignList.push({
          id: campaignId,
          name: manifest.campaign.name,
          created_at: manifest.campaign.created_at,
          last_saved_at: manifest.campaign.last_saved_at,
          character_count: manifest.indices.characters.length
        });
      } catch (error) {
        console.warn(`Error leyendo campaña ${campaignId}:`, error.message);
      }
    }
    
    return campaignList;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Elimina una campaña completa
 */
async function deleteCampaign(campaignId) {
  const base = path.join(saveRoot, campaignId);
  await fs.rm(base, { recursive: true, force: true });
}

/**
 * Obtiene el estado del mundo
 */
async function getWorldState(campaignId) {
  try {
    const worldPath = path.join(saveRoot, campaignId, 'world.json');
    const data = await fs.readFile(worldPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Obtiene todos los personajes de un tipo específico
 */
async function getCharactersByRole(campaignId, role) {
  const manifest = await getManifest(campaignId);
  const characters = manifest.indices.characters.filter(c => c.role === role);
  
  return Promise.all(
    characters.map(c => getCharacter(campaignId, c.id))
  );
}

/**
 * Busca personajes por nombre
 */
async function searchCharacters(campaignId, searchTerm) {
  const manifest = await getManifest(campaignId);
  const matchingCharacters = manifest.indices.characters.filter(c => 
    c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return Promise.all(
    matchingCharacters.map(c => getCharacter(campaignId, c.id))
  );
}

module.exports = {
  initSaveRoot,
  createCampaign,
  getManifest,
  writeManifest,
  upsertCharacter,
  getCharacter,
  createEncounter,
  saveWorldState,
  listCampaigns,
  deleteCampaign,
  getWorldState,
  getCharactersByRole,
  searchCharacters
};

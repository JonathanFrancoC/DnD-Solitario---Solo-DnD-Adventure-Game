// characterAdapter.js - Adaptador entre formato actual y esquema de guardado
import { getClassData, getRaceData, getBackgroundData } from '../data/gameData.js';
import { getClassSkills, getClassSavingThrows } from '../data/gameData.js';
import { getSpellcastingSummary } from '../data/spellsData.js';

/**
 * Convierte un personaje del formato actual al esquema de guardado
 */
export function adaptCharacterToSaveFormat(characterData, role = 'main') {
  const classData = getClassData(characterData.class);
  const raceData = getRaceData(characterData.race);
  const backgroundData = getBackgroundData(characterData.background);
  const spellInfo = getSpellcastingSummary(characterData.class, characterData.level);
  
  // Calcular estadísticas derivadas
  const conMod = Math.floor((characterData.constitution - 10) / 2);
  const maxHP = characterData.maxHitPoints || (characterData.level * (classData?.hitDie || 6) + conMod);
  
  // Obtener habilidades y salvaciones
  const classSkills = getClassSkills(characterData.class) || [];
  const classSavingThrows = getClassSavingThrows(characterData.class) || [];
  
  // Preparar hechizos
  const spells = {
    cantrips: characterData.cantrips || [],
    known: characterData.spells || []
  };
  
  // Preparar mecánicas de clase
  const mechanics = {};
  if (characterData.class === 'bardo' && characterData.level >= 1) {
    mechanics.bardic_inspiration = {
      uses: characterData.bardicInspirationUses || 3,
      max: 3,
      recovery: "long_rest"
    };
  }
  
  // Crear resumen para IA
  const aiSummary = generateAISummary(characterData, classData, raceData);
  
  return {
    schema_version: "1.0.0",
    entity: "character",
    id: characterData.id || null, // Se asignará automáticamente si es null
    role: role,
    is_ephemeral: false,
    identity: {
      name: characterData.name || "Sin nombre",
      race: characterData.race || "humano",
      class: characterData.class || "guerrero",
      subclass: characterData.subclass || null,
      level: characterData.level || 1,
      alignment: characterData.alignment || "Neutral",
      background: characterData.background || "soldado",
      tags: characterData.tags || []
    },
    stats: {
      strength: characterData.strength || 10,
      dexterity: characterData.dexterity || 10,
      constitution: characterData.constitution || 10,
      intelligence: characterData.intelligence || 10,
      wisdom: characterData.wisdom || 10,
      charisma: characterData.charisma || 10
    },
    derived: {
      hit_die: classData?.hitDie || "d8",
      max_hp: maxHP,
      ac: characterData.armorClass || 10,
      speed: raceData?.speed || 30,
      proficiency_bonus: Math.floor((characterData.level - 1) / 4) + 2
    },
    skills: characterData.skills || [],
    saving_throws: classSavingThrows,
    equipment: {
      armor: characterData.armor || null,
      shield: characterData.shield || null,
      weapons: characterData.weapons || [],
      items: characterData.items || []
    },
    spells: spells,
    mechanics: mechanics,
    state: {
      status: "alive",
      conditions: characterData.conditions || [],
      exhaustion: characterData.exhaustion || 0,
      location: characterData.location || ""
    },
    relationships: {
      party_id: characterData.partyId || null,
      allies: characterData.allies || [],
      enemies: characterData.enemies || []
    },
    notes: characterData.notes || "",
    ai_summary: aiSummary,
    provenance: {
      created_at: characterData.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      revision: characterData.revision || 1
    }
  };
}

/**
 * Convierte un personaje del esquema de guardado al formato actual
 */
export function adaptCharacterFromSaveFormat(savedCharacter) {
  return {
    id: savedCharacter.id,
    name: savedCharacter.identity.name,
    race: savedCharacter.identity.race,
    class: savedCharacter.identity.class,
    subclass: savedCharacter.identity.subclass,
    level: savedCharacter.identity.level,
    alignment: savedCharacter.identity.alignment,
    background: savedCharacter.identity.background,
    tags: savedCharacter.identity.tags,
    
    // Estadísticas
    strength: savedCharacter.stats.strength,
    dexterity: savedCharacter.stats.dexterity,
    constitution: savedCharacter.stats.constitution,
    intelligence: savedCharacter.stats.intelligence,
    wisdom: savedCharacter.stats.wisdom,
    charisma: savedCharacter.stats.charisma,
    
    // Valores derivados
    maxHitPoints: savedCharacter.derived.max_hp,
    armorClass: savedCharacter.derived.ac,
    
    // Habilidades y salvaciones
    skills: savedCharacter.skills,
    savingThrows: savedCharacter.saving_throws,
    
    // Equipo
    armor: savedCharacter.equipment.armor,
    shield: savedCharacter.equipment.shield,
    weapons: savedCharacter.equipment.weapons,
    items: savedCharacter.equipment.items,
    
    // Hechizos
    cantrips: savedCharacter.spells.cantrips,
    spells: savedCharacter.spells.known,
    
    // Mecánicas de clase
    bardicInspirationUses: savedCharacter.mechanics.bardic_inspiration?.uses,
    
    // Estado
    conditions: savedCharacter.state.conditions,
    exhaustion: savedCharacter.state.exhaustion,
    location: savedCharacter.state.location,
    
    // Relaciones
    partyId: savedCharacter.relationships.party_id,
    allies: savedCharacter.relationships.allies,
    enemies: savedCharacter.relationships.enemies,
    
    // Metadatos
    notes: savedCharacter.notes,
    createdAt: savedCharacter.provenance.created_at,
    revision: savedCharacter.provenance.revision,
    
    // Rol en la campaña
    role: savedCharacter.role
  };
}

/**
 * Genera un resumen para la IA basado en el personaje
 */
function generateAISummary(characterData, classData, raceData) {
  const parts = [];
  
  // Información básica
  parts.push(`${characterData.name || 'Un personaje'} es un ${raceData?.name || characterData.race} ${classData?.name || characterData.class} de nivel ${characterData.level || 1}`);
  
  // Estadísticas principales
  const stats = [];
  if (characterData.strength >= 14) stats.push('fuerte');
  if (characterData.dexterity >= 14) stats.push('ágil');
  if (characterData.constitution >= 14) stats.push('resistente');
  if (characterData.intelligence >= 14) stats.push('inteligente');
  if (characterData.wisdom >= 14) stats.push('sabio');
  if (characterData.charisma >= 14) stats.push('carismático');
  
  if (stats.length > 0) {
    parts.push(`Es ${stats.join(', ')}`);
  }
  
  // Clase específica
  if (characterData.class === 'bardo') {
    parts.push('Se especializa en magia de apoyo y control');
  } else if (characterData.class === 'guerrero') {
    parts.push('Es un combatiente experto en armas y armaduras');
  } else if (characterData.class === 'mago') {
    parts.push('Domina la magia arcana y el conocimiento');
  } else if (characterData.class === 'clerigo') {
    parts.push('Sirve a una deidad y canaliza magia divina');
  }
  
  // Habilidades destacadas
  if (characterData.skills && characterData.skills.length > 0) {
    parts.push(`Sus habilidades incluyen: ${characterData.skills.join(', ')}`);
  }
  
  // Hechizos si es lanzador
  if (characterData.cantrips && characterData.cantrips.length > 0) {
    parts.push(`Conoce los trucos: ${characterData.cantrips.join(', ')}`);
  }
  
  if (characterData.spells && characterData.spells.length > 0) {
    parts.push(`Y los conjuros: ${characterData.spells.join(', ')}`);
  }
  
  return parts.join('. ') + '.';
}

/**
 * Valida que un personaje tenga todos los campos requeridos
 */
export function validateCharacter(characterData) {
  const required = ['name', 'race', 'class', 'level'];
  const missing = required.filter(field => !characterData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
  }
  
  // Validar estadísticas
  const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  for (const stat of stats) {
    if (characterData[stat] < 1 || characterData[stat] > 20) {
      throw new Error(`Estadística ${stat} debe estar entre 1 y 20`);
    }
  }
  
  return true;
}

/**
 * Genera un ID único para un personaje
 */
export function generateCharacterId(characterData, role) {
  const nameSlug = characterData.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return `${role}-${nameSlug}`;
}

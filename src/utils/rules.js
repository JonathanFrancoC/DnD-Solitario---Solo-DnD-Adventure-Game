// utils/rules.js - Utilidades para cálculos de D&D 5e

// Calcular modificador de habilidad
export const mod = (score) => Math.floor((score - 10) / 2);

// Calcular iniciativa
export function computeInitiative(characterData) {
  return mod(characterData.dexterity || 10);
}

// Calcular Clase de Armadura
export function computeArmorClass(characterData) {
  const dex = mod(characterData.dexterity || 10);
  
  // Defensas sin armadura por clase
  if (!characterData.equipment?.armor || characterData.equipment.armor === '' || characterData.equipment.armor === 'Sin armadura') {
    if (characterData.class === 'barbaro') {
      const con = mod(characterData.constitution || 10);
      const shieldBonus = characterData.equipment?.shield && characterData.equipment.shield !== 'Sin escudo' ? 2 : 0;
      return 10 + dex + con + shieldBonus;
    }
    if (characterData.class === 'monje') {
      const wis = mod(characterData.wisdom || 10);
      return 10 + dex + wis; // monje no usa escudo por regla
    }
    // Otros casos sin armadura
    return 10 + dex;
  }
  
  // Armaduras con topes de DES
  let baseAC = 10;
  let maxDexBonus = dex;
  
  switch (characterData.equipment.armor?.toLowerCase()) {
    case 'armadura de cuero':
      baseAC = 11;
      break;
    case 'armadura de cuero tachonada':
      baseAC = 12;
      break;
    case 'armadura de escamas':
      baseAC = 14;
      maxDexBonus = Math.min(dex, 2);
      break;
    case 'cota de malla':
      baseAC = 16;
      maxDexBonus = Math.min(dex, 2);
      break;
    case 'armadura de bandas':
      baseAC = 17;
      maxDexBonus = 0;
      break;
    case 'armadura de placas':
      baseAC = 18;
      maxDexBonus = 0;
      break;
    default:
      baseAC = 10;
  }
  
  // Bonus de escudo
  const shieldBonus = characterData.equipment?.shield && characterData.equipment.shield !== 'Sin escudo' ? 2 : 0;
  
  return baseAC + maxDexBonus + shieldBonus;
}

// Base de datos de armas
const WEAPONS = {
  'espada larga': { abil: 'strength', die: '1d8', versatile: '1d10', damageType: 'perforante', finesse: false, ranged: false },
  'espada corta': { abil: 'dexterity', die: '1d6', damageType: 'perforante', finesse: true, ranged: false },
  'hacha de guerra': { abil: 'strength', die: '1d8', versatile: '1d10', damageType: 'cortante', finesse: false, ranged: false },
  'maza': { abil: 'strength', die: '1d6', damageType: 'contundente', finesse: false, ranged: false },
  'bastón': { abil: 'strength', die: '1d6', damageType: 'contundente', finesse: false, ranged: false },
  'daga': { abil: 'dexterity', die: '1d4', damageType: 'perforante', finesse: true, ranged: false },
  'arco corto': { abil: 'dexterity', die: '1d6', damageType: 'perforante', finesse: false, ranged: true },
  'arco largo': { abil: 'dexterity', die: '1d8', damageType: 'perforante', finesse: false, ranged: true },
  'ballesta ligera': { abil: 'dexterity', die: '1d8', damageType: 'perforante', finesse: false, ranged: true },
  'jabalina': { abil: 'strength', die: '1d6', damageType: 'perforante', finesse: false, thrown: true }
};

// Extraer dados de daño de descripción
const extractDice = (text) => {
  if (!text) return '';
  const match = String(text).match(/\d+d\d+(?:\s*\+\s*\d+)?/i);
  return match ? match[0] : '';
};

// Habilidad de lanzamiento por clase
const CASTER_STAT = {
  bardo: 'charisma',
  brujo: 'charisma',
  hechicero: 'charisma',
  clerigo: 'wisdom',
  druida: 'wisdom',
  explorador: 'wisdom',
  mago: 'intelligence',
  paladin: 'charisma'
};

// Verificar si una clase es lanzadora
export function isCaster(className) {
  return Object.keys(CASTER_STAT).includes(className?.toLowerCase());
}

// Construir ataques desde el equipo
export function buildAttacks(characterData) {
  const prof = characterData.proficiencyBonus || 2;
  const attacks = [];
  
  // Procesar armas del equipo
  const weapons = characterData.equipment?.weapons || [];
  
  weapons.forEach(weaponName => {
    if (!weaponName || weaponName === '') return;
    
    // Limpiar el nombre del arma (remover info entre paréntesis)
    const cleanName = weaponName.split(' (')[0].toLowerCase();
    const weaponData = WEAPONS[cleanName];
    
    if (!weaponData) return;
    
    // Determinar atributo a usar
    const abil = (weaponData.finesse && mod(characterData.dexterity || 10) > mod(characterData.strength || 10)) 
      ? 'dexterity' 
      : weaponData.abil;
    
    const bonus = mod(characterData[abil] || 10) + prof;
    const damage = weaponData.versatile 
      ? `${weaponData.die} / ${weaponData.versatile}` 
      : weaponData.die;
    
    attacks.push({
      name: weaponName,
      bonus: (bonus >= 0 ? `+${bonus}` : String(bonus)),
      damage: `${damage} + ${mod(characterData[abil] || 10)} ${weaponData.damageType}`,
      source: 'weapon'
    });
  });
  
  return attacks;
}

// Calcular lanzamiento de conjuros
export function buildSpellcasting(characterData) {
  const className = characterData.class?.toLowerCase();
  if (!isCaster(className)) return null;
  
  const ability = CASTER_STAT[className];
  const abilityMod = mod(characterData[ability] || 10);
  const profBonus = characterData.proficiencyBonus || 2;
  
  const saveDC = 8 + profBonus + abilityMod;
  const attackBonus = profBonus + abilityMod;
  
  // Espacios de conjuro por nivel (simplificado para nivel 1)
  const slots = {
    1: { total: className === 'paladin' || className === 'explorador' ? 0 : 2, used: 0 },
    2: { total: 0, used: 0 },
    3: { total: 0, used: 0 },
    4: { total: 0, used: 0 },
    5: { total: 0, used: 0 },
    6: { total: 0, used: 0 },
    7: { total: 0, used: 0 },
    8: { total: 0, used: 0 },
    9: { total: 0, used: 0 }
  };
  
  return {
    class: characterData.class,
    ability,
    abilityName: getAbilityName(ability),
    saveDC,
    attackBonus,
    known: characterData.spellcasting?.known || {
      "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": []
    },
    slots,
    maxKnownByLevel: getMaxKnownByLevel(className, characterData.level || 1)
  };
}

// Obtener nombre de habilidad en español
function getAbilityName(ability) {
  const names = {
    strength: 'Fuerza',
    dexterity: 'Destreza', 
    constitution: 'Constitución',
    intelligence: 'Inteligencia',
    wisdom: 'Sabiduría',
    charisma: 'Carisma'
  };
  return names[ability] || ability;
}

// Obtener límites de conjuros conocidos por nivel
function getMaxKnownByLevel(className, level) {
  // Simplificado para nivel 1
  const limits = {
    bardo: { "0": 2, "1": 4 },
    hechicero: { "0": 4, "1": 2 },
    brujo: { "0": 2, "1": 2 },
    mago: { "0": 3, "1": 6 }, // preparados
    clerigo: { "0": 3, "1": 2 }, // preparados
    druida: { "0": 2, "1": 2 }  // preparados
  };
  
  return limits[className] || { "0": 0, "1": 0 };
}

// Construir todos los datos derivados
export function buildDerived(characterData) {
  return {
    initiative: computeInitiative(characterData),
    armorClass: computeArmorClass(characterData),
    attacks: buildAttacks(characterData),
    spellcastingComputed: buildSpellcasting(characterData)
  };
}

// Migrar datos antiguos al nuevo formato
export function migrateCharacterData(oldData) {
  const migrated = { ...oldData };
  
  // Migrar equipo al nuevo formato si es necesario
  if (!migrated.equipment) {
    migrated.equipment = {
      armor: oldData.armor || '',
      shield: oldData.shield || '',
      weapons: [oldData.weapon1, oldData.weapon2].filter(w => w && w !== ''),
      other: oldData.otherEquipment || '',
      packs: [],
      coins: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
    };
  }
  
  // Migrar página 2 si no existe
  if (!migrated.page2) {
    migrated.page2 = {
      age: '', height: '', weight: '',
      eyes: '', skin: '', hair: '',
      appearance: '',
      alliesAndOrgs: [],
      backstory: '',
      additionalTraits: '',
      treasure: ''
    };
  }
  
  // Migrar lanzamiento de conjuros si no existe
  if (!migrated.spellcasting && isCaster(migrated.class)) {
    migrated.spellcasting = {
      class: migrated.class,
      ability: CASTER_STAT[migrated.class?.toLowerCase()] || 'intelligence',
      saveDC: 0,
      attackBonus: 0,
      known: {
        "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": []
      },
      slots: {},
      maxKnownByLevel: {},
      retrainPerLevel: 1
    };
  }
  
  return migrated;
}

// ===== UTILIDADES DE MAGIA =====
// Datos y funciones para el sistema de conjuros de D&D 5e

// Tablas de slots de conjuro por nivel (PHB p.84)
export const FULL_CASTER_SLOTS = {
  1:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6:  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8:  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9:  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
};

export const HALF_CASTER_SLOTS = {
  1:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  4:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  6:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  8:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  9:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  10: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  11: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  12: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  13: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  14: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  15: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  16: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  17: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  18: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  19: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  20: [4, 3, 3, 3, 2, 0, 0, 0, 0]
};

export const WARLOCK_PACT_SLOTS = {
  1:  [1, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [0, 2, 0, 0, 0, 0, 0, 0, 0],
  4:  [0, 2, 0, 0, 0, 0, 0, 0, 0],
  5:  [0, 0, 2, 0, 0, 0, 0, 0, 0],
  6:  [0, 0, 2, 0, 0, 0, 0, 0, 0],
  7:  [0, 0, 0, 2, 0, 0, 0, 0, 0],
  8:  [0, 0, 0, 2, 0, 0, 0, 0, 0],
  9:  [0, 0, 0, 0, 2, 0, 0, 0, 0],
  10: [0, 0, 0, 0, 2, 0, 0, 0, 0],
  11: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  12: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  13: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  14: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  15: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  16: [0, 0, 0, 0, 3, 0, 0, 0, 0],
  17: [0, 0, 0, 0, 4, 0, 0, 0, 0],
  18: [0, 0, 0, 0, 4, 0, 0, 0, 0],
  19: [0, 0, 0, 0, 4, 0, 0, 0, 0],
  20: [0, 0, 0, 0, 4, 0, 0, 0, 0]
};

export const WARLOCK_ARCANUM = {
  11: 1, // 6th level
  13: 1, // 7th level  
  15: 1, // 8th level
  17: 1, // 9th level
};

// Trucos conocidos por clase y nivel
export const CANTRIPS_KNOWN = {
  bardo: { 1: 2, 4: 3, 10: 4 },
  clerigo: { 1: 3, 4: 4, 10: 5 },
  druida: { 1: 2, 4: 3, 10: 4 },
  hechicero: { 1: 4, 4: 5, 10: 6 },
  mago: { 1: 3, 4: 4, 10: 5 },
  brujo: { 1: 2, 20: 4 }
};

// Reglas de preparación de conjuros
export const PREPARED_RULES = {
  clerigo: true,
  druida: true,
  paladin: true,
  mago: true
};

// Conjuros conocidos por clase
export const SORCERER_SPELLS_KNOWN = {
  1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
  11: 12, 12: 13, 13: 14, 14: 15, 15: 16, 16: 17, 17: 18, 18: 19, 19: 20, 20: 21
};

export const WARLOCK_SPELLS_KNOWN = {
  1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
  11: 12, 12: 13, 13: 14, 14: 15, 15: 16, 16: 17, 17: 18, 18: 19, 19: 20, 20: 21
};

export const BARD_SPELLS_KNOWN = {
  1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14,
  11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22
};

export const RANGER_SPELLS_KNOWN = {
  2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6, 11: 7,
  12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11
};

export const PALADIN_SPELLS_KNOWN = {
  2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6, 11: 7,
  12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11
};

export const SPELLS_KNOWN_BY_CLASS = {
  hechicero: SORCERER_SPELLS_KNOWN,
  brujo: WARLOCK_SPELLS_KNOWN,
  bardo: BARD_SPELLS_KNOWN,
  ranger: RANGER_SPELLS_KNOWN,
  paladin: PALADIN_SPELLS_KNOWN
};

// Tipo de lanzador por clase
export const CASTER_TYPE = {
  bardo: 'full',
  clerigo: 'full',
  druida: 'full',
  hechicero: 'full',
  mago: 'full',
  paladin: 'half',
  ranger: 'half',
  brujo: 'pact'
};

// Obtener slots de conjuro para una clase y nivel
export function getSpellSlots(className, level) {
  const casterType = CASTER_TYPE[className];
  
  switch (casterType) {
    case 'full':
      return FULL_CASTER_SLOTS[level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
    case 'half':
      return HALF_CASTER_SLOTS[level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
    case 'pact':
      return WARLOCK_PACT_SLOTS[level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
    default:
      return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
}

// Obtener el nivel máximo de conjuro disponible
export function getHighestSpellLevel(className, level) {
  const slots = getSpellSlots(className, level);
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i] > 0) return i + 1;
  }
  return 0;
}

// Obtener trucos conocidos
export function getCantripsKnown(className, level) {
  const cantripData = CANTRIPS_KNOWN[className];
  if (!cantripData) return 0;
  
  let known = 0;
  for (const [lvl, count] of Object.entries(cantripData)) {
    if (level >= parseInt(lvl)) {
      known = count;
    }
  }
  return known;
}

// Obtener conjuros conocidos
export function getSpellsKnown(className, level) {
  const spellsKnownData = SPELLS_KNOWN_BY_CLASS[className];
  if (!spellsKnownData) return 0;
  
  return spellsKnownData[level] || 0;
}

// Obtener número de conjuros preparados (solo para prepared casters)
export function getPreparedSpellsCount(className, level, abilityMod) {
  if (!PREPARED_RULES[className]) return 0;
  
  return level + abilityMod;
}

// Resumen completo de lanzamiento de conjuros
export function getSpellcastingSummary(className, level, abilityMod = 0) {
  const slots = getSpellSlots(className, level);
  const highestLevel = getHighestSpellLevel(className, level);
  const cantrips = getCantripsKnown(className, level);
  const spellsKnown = getSpellsKnown(className, level);
  const prepared = getPreparedSpellsCount(className, level, abilityMod);
  
  return {
    slots,
    highestLevel,
    cantrips,
    spellsKnown,
    prepared,
    isPreparedCaster: PREPARED_RULES[className] || false,
    casterType: CASTER_TYPE[className]
  };
}

// === PROGRESIÓN DE CONJUROS SEGÚN D&D 5e ===
// Sistema para normalizar la disponibilidad de conjuros por clase y nivel

// === 1) Progresión 1–20 por NIVEL DE CONJURO ===
// LANZADORES COMPLETOS (bardo, mago, clérigo, druida, etc.)
const FULL_CASTER_MIN_LVL_FOR_SPELLLVL = {
  0: 1,  // cantrips
  1: 1,
  2: 3,
  3: 5,
  4: 7,
  5: 9,
  6: 11,
  7: 13,
  8: 15,
  9: 17,
};

// Brujo: Pact Magic (slots hasta 5º) + Arcanos Místicos (6º–9º 1/día)
const WARLOCK_MIN_LVL_FOR_SPELLLVL = {
  0: 1,
  1: 1,
  2: 3,
  3: 5,
  4: 7,
  5: 9,
  6: 11, // Arcanum
  7: 13, // Arcanum
  8: 15, // Arcanum
  9: 17, // Arcanum
};

// Lanzadores de 1/3 (guerrero arcano, pícaro arcano)
const THIRD_CASTER_MIN_LVL_FOR_SPELLLVL = {
  0: 1,
  1: 3,
  2: 7,
  3: 13,
  4: 19,
};

// Lanzadores de 1/2 (paladín, ranger)
const HALF_CASTER_MIN_LVL_FOR_SPELLLVL = {
  0: 1,
  1: 2,
  2: 5,
  3: 9,
  4: 13,
  5: 17,
};

function minLevelToLearnSpell(classKey, spellLevel) {
  if (spellLevel === 0) return 1;
  const key = String(classKey).toLowerCase();
  
  if (key === 'brujo') return WARLOCK_MIN_LVL_FOR_SPELLLVL[spellLevel] ?? null;
  if (['paladin', 'ranger'].includes(key)) return HALF_CASTER_MIN_LVL_FOR_SPELLLVL[spellLevel] ?? null;
  if (['guerrero', 'picaro'].includes(key)) return THIRD_CASTER_MIN_LVL_FOR_SPELLLVL[spellLevel] ?? null;
  
  // Lanzadores completos por defecto
  return FULL_CASTER_MIN_LVL_FOR_SPELLLVL[spellLevel] ?? null;
}

// === 2) Detección del NIVEL del conjuro dentro del objeto "spells" ===
function getSpellLevelFromSpells(spells, spellKey) {
  if (!spells || !spellKey) return null;
  if (spells.cantrips && spellKey in spells.cantrips) return 0;
  for (let lvl = 1; lvl <= 9; lvl++) {
    const bucket = `level${lvl}`;
    if (spells[bucket] && spellKey in spells[bucket]) return lvl;
  }
  return null; // no encontrado
}

// === 3) Reconstrucción/normalización de classAvailability ===
export function normalizeClassAvailability(spells, classAvailability) {
  const out = {};
  const warnings = [];

  const allBuckets = ['cantrips', ...Array.from({length:9}, (_,i)=>`level${i+1}`)];

  for (const [cls, clsData] of Object.entries(classAvailability || {})) {
    // Estructura limpia por clase
    out[cls] = { cantrips: {}, level1: {}, level2: {}, level3: {}, level4: {}, level5: {}, level6: {}, level7: {}, level8: {}, level9: {} };

    // Reunir TODOS los spellKeys que esa clase dice tener (sin importar en qué bucket los puso)
    const spellKeysForClass = new Set();
    for (const b of allBuckets) {
      const bucketObj = (clsData && clsData[b]) || {};
      for (const k of Object.keys(bucketObj)) spellKeysForClass.add(k);
    }

    // Reubicar cada spellKey en su bucket correcto y con el nivel de desbloqueo correcto
    for (const spellKey of spellKeysForClass) {
      const realLevel = getSpellLevelFromSpells(spells, spellKey);

      if (realLevel == null) {
        warnings.push(`[${cls}] "${spellKey}" no existe en spells.`);
        continue;
      }

      // Nivel mínimo de PJ para ese NIVEL de conjuro en esta clase
      const minLvl = minLevelToLearnSpell(cls, realLevel);
      if (minLvl == null) {
        warnings.push(`[${cls}] "${spellKey}" (nivel ${realLevel}) no tiene regla de progresión conocida (¿clase custom?).`);
        continue;
      }

      if (realLevel === 0) {
        // Truco: siempre con valor 1
        out[cls].cantrips[spellKey] = 1;

        // Si venía mal ubicado (p.ej. un truco colocado en level1), avisamos
        for (let L = 1; L <= 9; L++) {
          const b = `level${L}`;
          if (clsData?.[b] && spellKey in clsData[b]) {
            warnings.push(`[${cls}] "${spellKey}" es un truco pero estaba en ${b}; movido a "cantrips".`);
          }
        }
      } else {
        const bucket = `level${realLevel}`;
        out[cls][bucket][spellKey] = minLvl;

        // Si venía en bucket distinto al real, avisar
        if (!clsData?.[bucket] || !(spellKey in (clsData[bucket]||{}))) {
          // buscar dónde estaba
          const wrongIn = allBuckets.find(b => b !== bucket && (clsData?.[b] && (spellKey in clsData[b])));
          if (wrongIn) {
            warnings.push(`[${cls}] "${spellKey}" es de nivel ${realLevel} pero estaba en ${wrongIn}; movido a ${bucket}.`);
          }
        }
      }
    }
  }

  return { fixed: out, warnings };
}

// === 4) Conteo de trucos por nivel (PHB) ===
export const CANTRIPS_KNOWN_BY_CLASS = {
  bardo:   { 1:2, 4:3, 10:4 },
  brujo:   { 1:2, 4:3, 10:4 },
  mago:    { 1:3, 4:4, 10:5 },
  clerigo: { 1:3, 4:4, 10:5 },
  druida:  { 1:2, 4:3, 10:4 },
  hechicero: { 1:4, 4:5, 10:6 },
  paladin: { 1:0, 2:0, 3:0 }, // Los paladines no tienen trucos por defecto
  ranger:  { 1:0, 2:0, 3:0 }, // Los rangers no tienen trucos por defecto
  guerrero: { 1:0, 2:0, 3:0 }, // Los guerreros no tienen trucos por defecto
  picaro:  { 1:0, 2:0, 3:0 }, // Los pícaros no tienen trucos por defecto
  barbaro: { 1:0, 2:0, 3:0 }, // Los bárbaros no tienen trucos por defecto
  monje:   { 1:0, 2:0, 3:0 }, // Los monjes no tienen trucos por defecto
};

// Función de ayuda para consultar trucos conocidos
export function cantripsKnownAt(classKey, level) {
  const map = CANTRIPS_KNOWN_BY_CLASS[classKey] || {};
  let known = 0;
  // aplica los hitos <= nivel
  for (const [lvlStr, val] of Object.entries(map)) {
    const lv = Number(lvlStr);
    if (level >= lv) known = val;
  }
  return known;
}

// === 5) Función para obtener conjuros disponibles por nivel ===
export function getAvailableSpellsForLevel(classKey, level, normalizedAvailability) {
  const classData = normalizedAvailability[classKey];
  if (!classData) return { cantrips: [], spells: [] };

  const available = {
    cantrips: [],
    spells: []
  };

  // Trucos disponibles
  if (classData.cantrips) {
    available.cantrips = Object.keys(classData.cantrips);
  }

  // Conjuros disponibles para este nivel
  for (let spellLevel = 1; spellLevel <= 9; spellLevel++) {
    const bucket = `level${spellLevel}`;
    if (classData[bucket]) {
      Object.entries(classData[bucket]).forEach(([spellKey, unlockLevel]) => {
        if (level >= unlockLevel) {
          available.spells.push({
            key: spellKey,
            level: spellLevel,
            unlockLevel: unlockLevel
          });
        }
      });
    }
  }

  return available;
}

// === 6) Función para validar y corregir el JSON de conjuros ===
export function validateAndFixSpellData(spellsData) {
  console.log('🔍 Validando datos de conjuros...');
  
  const { fixed, warnings } = normalizeClassAvailability(spellsData.spells, spellsData.classAvailability);
  
  if (warnings.length > 0) {
    console.warn('⚠️ Advertencias encontradas:');
    warnings.forEach(warning => console.warn(warning));
  } else {
    console.log('✅ No se encontraron problemas en los datos de conjuros');
  }
  
  return {
    spells: spellsData.spells,
    classAvailability: fixed,
    warnings: warnings
  };
}

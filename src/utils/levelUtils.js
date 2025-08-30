// Función para obtener el tipo de paso basado en el paso actual y el nivel
export const getStepType = (step, level) => {
  if (step === 0) return 'pre-menu';
  if (step === 1) return 'basic-info';
  if (step === 2) return 'stats';
  if (step === 3) return 'skills';
  if (step === 4) return 'level-up';
  return 'save';
};

// Función para obtener el número total de pasos
export const getTotalSteps = (level) => {
  if (level === 1) return 5; // pre-menu, basic-info, stats, skills, save
  return 6; // pre-menu, basic-info, stats, skills, level-up, save
};

// Función para obtener el nivel objetivo para el paso de subida de nivel
export const getTargetLevel = (step) => {
  // Esta función se usa para determinar qué nivel estamos subiendo
  // Por ahora, asumimos que siempre subimos al siguiente nivel
  return step + 1;
};

// Función para obtener la progresión de nivel de una clase
export const getLevelProgression = (className, fromLevel, toLevel) => {
  const progression = [];
  
  for (let level = fromLevel; level <= toLevel; level++) {
    const levelInfo = {
      level: level,
      features: getLevelFeatures(className, level),
      cantrips: getLevelCantrips(className, level),
      spells: getLevelSpells(className, level),
      spellSlots: getLevelSpellSlots(className, level)
    };
    progression.push(levelInfo);
  }
  
  return progression;
};

import { levelProgressionData } from '../data/gameData.js';

// Función para obtener características de nivel
export const getLevelFeatures = (className, level) => {
  return levelProgressionData[className]?.[level]?.features || [];
};

// Función para obtener trucos por nivel
export const getLevelCantrips = (className, level) => {
  const cantripProgression = {
    bardo: { 1: 2, 4: 3 },
    clerigo: { 1: 3, 4: 4 },
    druida: { 1: 2, 4: 3 },
    hechicero: { 1: 4, 4: 5 },
    mago: { 1: 3, 4: 4 },
    paladin: { 2: 2 },
    ranger: { 2: 2 },
    brujo: { 1: 2, 4: 3 }
  };
  
  const cantrips = cantripProgression[className];
  if (!cantrips) return [];
  
  // Simular trucos ganados en este nivel
  const newCantrips = [];
  if (cantrips[level]) {
    newCantrips.push(`Ganar ${cantrips[level]} truco(s) nuevo(s)`);
  }
  
  return newCantrips;
};

// Función para obtener hechizos por nivel
export const getLevelSpells = (className, level) => {
  const spellProgression = {
    bardo: { 1: 4, 2: 2, 3: 2, 4: 1, 5: 1 },
    clerigo: { 1: 3, 2: 1, 3: 1, 4: 1, 5: 1 },
    druida: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1 },
    hechicero: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1 },
    mago: { 1: 6, 2: 2, 3: 2, 4: 1, 5: 1 },
    paladin: { 2: 2, 3: 1, 4: 1, 5: 1 },
    ranger: { 2: 2, 3: 1, 4: 1, 5: 1 },
    brujo: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1 }
  };
  
  const spells = spellProgression[className];
  if (!spells || !spells[level]) return [];
  
  return [`Ganar ${spells[level]} hechizo(s) nuevo(s)`];
};

// Función para obtener espacios de conjuro por nivel
export const getLevelSpellSlots = (className, level) => {
  const slotProgression = {
    bardo: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 }
    },
    clerigo: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 }
    },
    druida: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 }
    },
    hechicero: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 }
    },
    mago: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 }
    },
    paladin: {
      2: { 1: 2 },
      3: { 1: 3 },
      4: { 1: 3, 2: 1 },
      5: { 1: 4, 2: 2 }
    },
    ranger: {
      2: { 1: 2 },
      3: { 1: 3 },
      4: { 1: 3, 2: 1 },
      5: { 1: 4, 2: 2 }
    },
    brujo: {
      1: { 1: 1 },
      2: { 1: 2 },
      3: { 1: 0, 2: 2 },
      4: { 1: 0, 2: 2 },
      5: { 1: 0, 2: 0, 3: 2 }
    }
  };
  
  return slotProgression[className]?.[level] || {};
};

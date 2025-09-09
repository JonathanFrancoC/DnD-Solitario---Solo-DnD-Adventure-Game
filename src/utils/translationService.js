// Servicio de traducción para hechizos y mecánicas del juego / Translation service for spells and game mechanics
import spellsEs from '../locales/spells_es.json';
import spellsEn from '../locales/spells_en.json';

// Función para obtener hechizos traducidos / Function to get translated spells
export const getTranslatedSpells = (language = 'es') => {
  return language === 'en' ? spellsEn : spellsEs;
};

// Función para obtener un hechizo específico traducido / Function to get a specific translated spell
export const getTranslatedSpell = (spellKey, level, language = 'es') => {
  const spells = getTranslatedSpells(language);
  
  if (spells.spells[level] && spells.spells[level][spellKey]) {
    return spells.spells[level][spellKey];
  }
  
  // Fallback al español si no se encuentra / Fallback to Spanish if not found
  if (language !== 'es') {
    const spanishSpells = getTranslatedSpells('es');
    return spanishSpells.spells[level] && spanishSpells.spells[level][spellKey] 
      ? spanishSpells.spells[level][spellKey] 
      : null;
  }
  
  return null;
};

// Función para obtener todas las claves de hechizos disponibles / Function to get all available spell keys
export const getAvailableSpellKeys = (level, language = 'es') => {
  const spells = getTranslatedSpells(language);
  return spells.spells[level] ? Object.keys(spells.spells[level]) : [];
};

// Función para buscar hechizos por nombre / Function to search spells by name
export const searchSpellsByName = (searchTerm, language = 'es') => {
  const spells = getTranslatedSpells(language);
  const results = [];
  
  Object.entries(spells.spells).forEach(([level, levelSpells]) => {
    Object.entries(levelSpells).forEach(([key, spell]) => {
      if (spell.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          key,
          level,
          spell
        });
      }
    });
  });
  
  return results;
};

// Función para obtener hechizos por escuela / Function to get spells by school
export const getSpellsBySchool = (school, language = 'es') => {
  const spells = getTranslatedSpells(language);
  const results = [];
  
  Object.entries(spells.spells).forEach(([level, levelSpells]) => {
    Object.entries(levelSpells).forEach(([key, spell]) => {
      if (spell.school === school) {
        results.push({
          key,
          level,
          spell
        });
      }
    });
  });
  
  return results;
};

// Función para obtener hechizos por nivel / Function to get spells by level
export const getSpellsByLevel = (level, language = 'es') => {
  const spells = getTranslatedSpells(language);
  const results = [];
  
  if (spells.spells[level]) {
    Object.entries(spells.spells[level]).forEach(([key, spell]) => {
      results.push({
        key,
        level,
        spell
      });
    });
  }
  
  return results;
};

// Función para obtener información de daño traducida / Function to get translated damage information
export const getTranslatedDamageInfo = (spell, language = 'es') => {
  if (!spell.damage) return null;
  
  const damageTypeTranslations = {
    es: {
      'fire': 'fuego',
      'cold': 'frío',
      'lightning': 'rayo',
      'thunder': 'trueno',
      'acid': 'ácido',
      'poison': 'veneno',
      'necrotic': 'necrótico',
      'radiant': 'radiante',
      'psychic': 'psíquico',
      'force': 'fuerza',
      'bludgeoning': 'contundente',
      'piercing': 'perforante',
      'slashing': 'cortante',
      'healing': 'curación'
    },
    en: {
      'fuego': 'fire',
      'frío': 'cold',
      'rayo': 'lightning',
      'trueno': 'thunder',
      'ácido': 'acid',
      'veneno': 'poison',
      'necrótico': 'necrotic',
      'radiante': 'radiant',
      'psíquico': 'psychic',
      'fuerza': 'force',
      'contundente': 'bludgeoning',
      'perforante': 'piercing',
      'cortante': 'slashing',
      'curación': 'healing'
    }
  };
  
  const translatedDamageType = damageTypeTranslations[language]?.[spell.damageType] || spell.damageType;
  
  return {
    damage: spell.damage,
    damageType: translatedDamageType
  };
};

// Función para obtener información de rango traducida / Function to get translated range information
export const getTranslatedRangeInfo = (spell, language = 'es') => {
  const rangeTranslations = {
    es: {
      'Touch': 'Toque',
      'Self': 'Personal',
      'Sight': 'Vista',
      'Unlimited': 'Ilimitado'
    },
    en: {
      'Toque': 'Touch',
      'Personal': 'Self',
      'Vista': 'Sight',
      'Ilimitado': 'Unlimited'
    }
  };
  
  return rangeTranslations[language]?.[spell.range] || spell.range;
};

// Función para obtener información de duración traducida / Function to get translated duration information
export const getTranslatedDurationInfo = (spell, language = 'es') => {
  const durationTranslations = {
    es: {
      'Instantaneous': 'Instantáneo',
      'Concentration': 'Concentración'
    },
    en: {
      'Instantáneo': 'Instantaneous',
      'Concentración': 'Concentration'
    }
  };
  
  return durationTranslations[language]?.[spell.duration] || spell.duration;
};

// Función para obtener información de tiempo de lanzamiento traducida / Function to get translated casting time information
export const getTranslatedCastingTimeInfo = (spell, language = 'es') => {
  const castingTimeTranslations = {
    es: {
      '1 action': '1 acción',
      '1 bonus action': '1 acción adicional',
      '1 reaction': '1 reacción'
    },
    en: {
      '1 acción': '1 action',
      '1 acción adicional': '1 bonus action',
      '1 reacción': '1 reaction'
    }
  };
  
  return castingTimeTranslations[language]?.[spell.castingTime] || spell.castingTime;
};

export default {
  getTranslatedSpells,
  getTranslatedSpell,
  getAvailableSpellKeys,
  searchSpellsByName,
  getSpellsBySchool,
  getSpellsByLevel,
  getTranslatedDamageInfo,
  getTranslatedRangeInfo,
  getTranslatedDurationInfo,
  getTranslatedCastingTimeInfo
};

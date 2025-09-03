import featsData from '../data/feats.json';

/**
 * Obtiene todas las dotes disponibles
 */
export function getAllFeats() {
  return featsData.feats;
}

/**
 * Obtiene las categorías de dotes
 */
export function getFeatCategories() {
  return featsData.categories;
}

/**
 * Filtra dotes por categoría
 */
export function getFeatsByCategory(category) {
  return Object.entries(featsData.feats)
    .filter(([_, feat]) => feat.category === category)
    .reduce((acc, [key, feat]) => {
      acc[key] = feat;
      return acc;
    }, {});
}

/**
 * Verifica si un personaje cumple con los prerrequisitos de una dote
 */
export function checkFeatPrerequisites(feat, characterData) {
  if (!feat.prerequisites || feat.prerequisites.length === 0) {
    return { valid: true, issues: [] };
  }

  const issues = [];
  
  for (const prereq of feat.prerequisites) {
    if (prereq.includes('o superior')) {
      // Prerrequisito de característica (ej: "Fuerza 13 o superior")
      const match = prereq.match(/(\w+)\s+(\d+)\s+o\s+superior/);
      if (match) {
        const ability = match[1].toLowerCase();
        const requiredValue = parseInt(match[2]);
        const actualValue = characterData[ability] || 10;
        
        if (actualValue < requiredValue) {
          issues.push(`${match[1]} debe ser ${requiredValue} o superior (actual: ${actualValue})`);
        }
      }
    } else if (prereq.includes('Capacidad de lanzar')) {
      // Prerrequisito de lanzador de conjuros
      if (!characterData.spellcasterClass) {
        issues.push('Debes ser capaz de lanzar al menos un hechizo');
      }
    } else if (prereq.includes('Proficiencia con')) {
      // Prerrequisito de proficiencia
      const armorType = prereq.match(/Proficiencia con (.+)/)[1];
      // Aquí podrías verificar las proficiencias del personaje
      // Por ahora asumimos que no las tiene
      issues.push(`Debes tener proficiencia con ${armorType}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Obtiene dotes disponibles para un personaje (que cumple prerrequisitos)
 */
export function getAvailableFeats(characterData) {
  const allFeats = getAllFeats();
  const available = {};

  for (const [key, feat] of Object.entries(allFeats)) {
    const prereqCheck = checkFeatPrerequisites(feat, characterData);
    if (prereqCheck.valid) {
      available[key] = {
        ...feat,
        id: key
      };
    }
  }

  return available;
}

/**
 * Aplica los beneficios de una dote a un personaje
 */
export function applyFeatBenefits(feat, characterData) {
  const updated = { ...characterData };

  for (const benefit of feat.benefits) {
    if (benefit.includes('Aumenta tu')) {
      // Beneficio de mejora de característica
      const match = benefit.match(/Aumenta tu (\w+)(?:\s+o\s+(\w+))?\s+en\s+1/);
      if (match) {
        const primaryAbility = match[1].toLowerCase();
        const secondaryAbility = match[2]?.toLowerCase();
        
        // Por ahora solo aplicamos la primera característica
        // En una implementación completa, el usuario elegiría cuál mejorar
        const currentValue = updated[primaryAbility] || 10;
        if (currentValue < 20) {
          updated[primaryAbility] = currentValue + 1;
        }
      }
    } else if (benefit.includes('Tu velocidad aumenta')) {
      // Beneficio de velocidad
      const match = benefit.match(/aumenta en (\d+) pies/);
      if (match) {
        const speedIncrease = parseInt(match[1]);
        updated.speed = (updated.speed || 30) + speedIncrease;
      }
    } else if (benefit.includes('Tu máximo de puntos de vida aumenta')) {
      // Beneficio de puntos de vida (Duro)
      const level = updated.level || 1;
      const hpIncrease = level * 2;
      updated.maxHP = (updated.maxHP || 10) + hpIncrease;
      updated.currentHP = (updated.currentHP || 10) + hpIncrease;
    } else if (benefit.includes('+5 a tu iniciativa')) {
      // Beneficio de iniciativa (Alerta)
      updated.initiativeBonus = (updated.initiativeBonus || 0) + 5;
    } else if (benefit.includes('Ganas +1 a tu CA')) {
      // Beneficio de CA (Dos Armas)
      updated.armorClassBonus = (updated.armorClassBonus || 0) + 1;
    } else if (benefit.includes('No puedes ser sorprendido')) {
      // Beneficio de no sorpresa (Alerta)
      updated.cannotBeSurprised = true;
    } else if (benefit.includes('Otros no ganan ventaja')) {
      // Beneficio de no ventaja por estar oculto (Alerta)
      updated.noAdvantageFromHidden = true;
    }
    // Aquí se pueden agregar más tipos de beneficios
  }

  return updated;
}

/**
 * Obtiene dotes organizadas por categoría para un personaje
 */
export function getFeatsByCategoryForCharacter(characterData) {
  const availableFeats = getAvailableFeats(characterData);
  const categories = getFeatCategories();
  const organized = {};

  // Obtener dotes ya seleccionadas por el personaje
  const selectedFeats = characterData.feats || [];

  for (const [categoryKey, categoryName] of Object.entries(categories)) {
    organized[categoryKey] = {
      name: categoryName,
      feats: {}
    };
  }

  for (const [key, feat] of Object.entries(availableFeats)) {
    // Excluir dotes ya seleccionadas
    if (!selectedFeats.includes(key) && organized[feat.category]) {
      organized[feat.category].feats[key] = feat;
    }
  }

  // Remover categorías vacías
  for (const categoryKey of Object.keys(organized)) {
    if (Object.keys(organized[categoryKey].feats).length === 0) {
      delete organized[categoryKey];
    }
  }

  return organized;
}

/**
 * Verifica si un personaje puede tomar una dote
 * Guerreros: niveles 4, 6, 8, 12, 14, 16, 19
 * Otras clases: niveles 4, 8, 12, 16, 19
 */
export function canTakeFeat(characterData) {
  const level = characterData.level || 1;
  const className = characterData.class?.toLowerCase();
  
  // Guerreros tienen dotes adicionales en niveles 6 y 14
  if (className === 'guerrero') {
    const fighterFeatLevels = [4, 6, 8, 12, 14, 16, 19];
    return fighterFeatLevels.includes(level);
  } else {
    const standardFeatLevels = [4, 8, 12, 16, 19];
    return standardFeatLevels.includes(level);
  }
}

/**
 * Obtiene el siguiente nivel en el que se puede tomar una dote
 * Considera las dotes adicionales de los guerreros
 */
export function getNextFeatLevel(characterData) {
  const level = characterData.level || 1;
  const className = characterData.class?.toLowerCase();
  
  // Guerreros tienen dotes adicionales en niveles 6 y 14
  if (className === 'guerrero') {
    const fighterFeatLevels = [4, 6, 8, 12, 14, 16, 19];
    const nextFeatLevel = fighterFeatLevels.find(featLevel => featLevel > level);
    return nextFeatLevel || null;
  } else {
    const standardFeatLevels = [4, 8, 12, 16, 19];
    const nextFeatLevel = standardFeatLevels.find(featLevel => featLevel > level);
    return nextFeatLevel || null;
  }
}

/**
 * Calcula todos los beneficios activos de las dotes del personaje
 */
export function calculateActiveFeatBenefits(characterData) {
  if (!characterData.feats || characterData.feats.length === 0) {
    return {
      abilityScoreBonuses: {},
      initiativeBonus: 0,
      armorClassBonus: 0,
      speedBonus: 0,
      maxHPBonus: 0,
      specialTraits: []
    };
  }

  const allFeats = getAllFeats();
  const benefits = {
    abilityScoreBonuses: {},
    initiativeBonus: 0,
    armorClassBonus: 0,
    speedBonus: 0,
    maxHPBonus: 0,
    specialTraits: []
  };

  characterData.feats.forEach(featId => {
    const feat = allFeats[featId];
    if (!feat) return;

    for (const benefit of feat.benefits) {
      if (benefit.includes('Aumenta tu')) {
        // Beneficio de mejora de característica
        const match = benefit.match(/Aumenta tu (\w+)(?:\s+o\s+(\w+))?\s+en\s+1/);
        if (match) {
          const primaryAbility = match[1].toLowerCase();
          if (!benefits.abilityScoreBonuses[primaryAbility]) {
            benefits.abilityScoreBonuses[primaryAbility] = 0;
          }
          benefits.abilityScoreBonuses[primaryAbility] += 1;
        }
      } else if (benefit.includes('+5 a tu iniciativa')) {
        benefits.initiativeBonus += 5;
      } else if (benefit.includes('Ganas +1 a tu CA')) {
        benefits.armorClassBonus += 1;
      } else if (benefit.includes('Tu velocidad aumenta')) {
        const match = benefit.match(/aumenta en (\d+) pies/);
        if (match) {
          benefits.speedBonus += parseInt(match[1]);
        }
      } else if (benefit.includes('Tu máximo de puntos de vida aumenta')) {
        const level = characterData.level || 1;
        benefits.maxHPBonus += level * 2;
      } else if (benefit.includes('No puedes ser sorprendido') || 
                 benefit.includes('Otros no ganan ventaja') ||
                 benefit.includes('Puedes escalar sin gastar movimiento extra') ||
                 benefit.includes('Puedes hacer un salto largo') ||
                 benefit.includes('Tienes ventaja en tiradas de') ||
                 benefit.includes('Puedes imitar el habla') ||
                 benefit.includes('Cuando usas tu acción para Correr') ||
                 benefit.includes('No tienes desventaja en ataques') ||
                 benefit.includes('Puedes cargar una ballesta') ||
                 benefit.includes('Cuando eres atacado') ||
                 benefit.includes('Puedes usar dos armas') ||
                 benefit.includes('Puedes empuñar o desenvainar') ||
                 benefit.includes('Tienes ventaja en tiradas de Percepción') ||
                 benefit.includes('Resistencia al daño de trampas') ||
                 benefit.includes('Puedes buscar trampas') ||
                 benefit.includes('Cuando tiras un dado de golpe')) {
        benefits.specialTraits.push(benefit);
      }
    }
  });

  return benefits;
}

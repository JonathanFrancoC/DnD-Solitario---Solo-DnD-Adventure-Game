// Sistema de dados para D&D
export const DICE_TYPES = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100
};

// Función para lanzar un dado específico
export const rollDie = (dieType) => {
  const maxValue = DICE_TYPES[dieType] || 6;
  return Math.floor(Math.random() * maxValue) + 1;
};

// Función para lanzar múltiples dados del mismo tipo
export const rollMultipleDice = (dieType, quantity = 1) => {
  const results = [];
  for (let i = 0; i < quantity; i++) {
    results.push(rollDie(dieType));
  }
  return results;
};

// Función para lanzar dados con modificador
export const rollDieWithModifier = (dieType, modifier = 0) => {
  const roll = rollDie(dieType);
  return {
    roll: roll,
    modifier: modifier,
    total: roll + modifier,
    dieType: dieType
  };
};

// Función para lanzar múltiples dados con modificador
export const rollMultipleDiceWithModifier = (dieType, quantity = 1, modifier = 0) => {
  const rolls = rollMultipleDice(dieType, quantity);
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  
  return {
    rolls: rolls,
    modifier: modifier,
    total: total,
    dieType: dieType,
    quantity: quantity
  };
};

// Función para lanzar dados con ventaja (2d20, tomar el mayor)
export const rollWithAdvantage = () => {
  const roll1 = rollDie('d20');
  const roll2 = rollDie('d20');
  return {
    rolls: [roll1, roll2],
    result: Math.max(roll1, roll2),
    advantage: true
  };
};

// Función para lanzar dados con desventaja (2d20, tomar el menor)
export const rollWithDisadvantage = () => {
  const roll1 = rollDie('d20');
  const roll2 = rollDie('d20');
  return {
    rolls: [roll1, roll2],
    result: Math.min(roll1, roll2),
    disadvantage: true
  };
};

// Función para lanzar dados de daño con crítico (doble los dados)
export const rollDamageWithCrit = (dieType, quantity = 1, modifier = 0, isCrit = false) => {
  const actualQuantity = isCrit ? quantity * 2 : quantity;
  const rolls = rollMultipleDice(dieType, actualQuantity);
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  
  return {
    rolls: rolls,
    modifier: modifier,
    total: total,
    dieType: dieType,
    quantity: actualQuantity,
    isCrit: isCrit,
    originalQuantity: quantity
  };
};

// Función para lanzar dados de iniciativa
export const rollInitiative = (dexterityModifier = 0) => {
  return rollDieWithModifier('d20', dexterityModifier);
};

// Función para lanzar dados de salvación
export const rollSavingThrow = (dieType = 'd20', modifier = 0) => {
  return rollDieWithModifier(dieType, modifier);
};

// Función para lanzar dados de ataque
export const rollAttack = (dieType = 'd20', attackModifier = 0, isAdvantage = false, isDisadvantage = false) => {
  if (isAdvantage) {
    return rollWithAdvantage();
  } else if (isDisadvantage) {
    return rollWithDisadvantage();
  } else {
    return rollDieWithModifier(dieType, attackModifier);
  }
};

// Función para lanzar dados de habilidad
export const rollAbilityCheck = (dieType = 'd20', abilityModifier = 0, proficiencyBonus = 0, isProficient = false) => {
  const totalModifier = abilityModifier + (isProficient ? proficiencyBonus : 0);
  return rollDieWithModifier(dieType, totalModifier);
};

// Función para lanzar dados de HP al subir de nivel
export const rollHPGain = (hitDie, constitutionModifier = 0) => {
  return rollDieWithModifier(hitDie, constitutionModifier);
};

// Función para lanzar dados de oro aleatorio
export const rollRandomGold = (dieType, multiplier = 1) => {
  const roll = rollDie(dieType);
  return roll * multiplier;
};

// Función para lanzar dados de tesoro
export const rollTreasure = (table) => {
  // Esta función se puede expandir para manejar tablas de tesoro específicas
  return rollDie('d100');
};

// Función para lanzar dados de encuentro aleatorio
export const rollRandomEncounter = (dieType = 'd20') => {
  return rollDie(dieType);
};

// Función para lanzar dados de clima
export const rollWeather = (dieType = 'd20') => {
  return rollDie(dieType);
};

// Función para lanzar dados de dirección aleatoria
export const rollDirection = () => {
  const directions = ['Norte', 'Sur', 'Este', 'Oeste', 'Noreste', 'Noroeste', 'Sureste', 'Suroeste'];
  const roll = rollDie('d8') - 1;
  return directions[roll];
};

// Función para lanzar dados de tiempo
export const rollTime = (dieType = 'd20') => {
  return rollDie(dieType);
};

// Función para formatear el resultado de un lanzamiento
export const formatRollResult = (result) => {
  if (typeof result === 'number') {
    return result.toString();
  }
  
  if (result.rolls) {
    const rollsStr = result.rolls.join(' + ');
    const modifierStr = result.modifier >= 0 ? ` + ${result.modifier}` : ` - ${Math.abs(result.modifier)}`;
    return `${rollsStr}${modifierStr} = ${result.total}`;
  }
  
  if (result.roll) {
    const modifierStr = result.modifier >= 0 ? ` + ${result.modifier}` : ` - ${Math.abs(result.modifier)}`;
    return `${result.roll}${modifierStr} = ${result.total}`;
  }
  
  return result.toString();
};

// Función para obtener el nombre del dado
export const getDieName = (dieType) => {
  return dieType.toUpperCase();
};

// Función para obtener el color del dado (para UI)
export const getDieColor = (dieType) => {
  const colors = {
    d4: '#FF6B6B',    // Rojo
    d6: '#4ECDC4',    // Turquesa
    d8: '#45B7D1',    // Azul
    d10: '#96CEB4',   // Verde
    d12: '#FFEAA7',   // Amarillo
    d20: '#DDA0DD',   // Púrpura
    d100: '#FF8C42'   // Naranja
  };
  return colors[dieType] || '#666666';
};

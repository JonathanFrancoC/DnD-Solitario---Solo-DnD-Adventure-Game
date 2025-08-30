// Función para calcular el modificador de una característica
export const getAbilityModifier = (score) => {
  return Math.floor((score - 10) / 2);
};

// Función para calcular el modificador de proficiencia basado en nivel
export const getProficiencyBonus = (level) => {
  return Math.floor((level - 1) / 4) + 2;
};

// Función para calcular la clase de armadura (CA)
export const calculateArmorClass = (characterData) => {
  const dexModifier = getAbilityModifier(characterData.dexterity || 10);
  
  // Por defecto, CA = 10 + modificador de Destreza
  let baseAC = 10 + dexModifier;
  
  // Si tiene armadura de cuero, CA = 11 + modificador de Destreza (máximo +2)
  if (characterData.equipment && characterData.equipment.includes('Armadura de cuero')) {
    baseAC = 11 + Math.min(dexModifier, 2);
  }
  
  // Si tiene escudo, +2 a la CA
  if (characterData.equipment && characterData.equipment.includes('Escudo')) {
    baseAC += 2;
  }
  
  return baseAC;
};

// Función para calcular puntos de vida iniciales
export const calculateInitialHP = (characterData) => {
  const constitutionModifier = getAbilityModifier(characterData.constitution || 10);
  const hitDie = characterData.hitDie || 'd8';
  const dieSize = parseInt(hitDie.replace('d', ''));
  
  // Nivel 1: máximo del dado + modificador de Constitución
  return dieSize + constitutionModifier;
};

// Función para calcular puntos de vida al subir de nivel
export const calculateLevelUpHP = (characterData, currentHP) => {
  const constitutionModifier = getAbilityModifier(characterData.constitution || 10);
  const hitDie = characterData.hitDie || 'd8';
  const dieSize = parseInt(hitDie.replace('d', ''));
  const averageRoll = Math.floor(dieSize / 2) + 1;
  
  return currentHP + averageRoll + constitutionModifier;
};

// Función para verificar si se pueden seleccionar habilidades
export const canSelectSkills = (characterData) => {
  return characterData.class && characterData.background;
};



// Función para verificar si todos los campos requeridos están completos
export const canProceed = (step, characterData) => {
  switch (step) {
    case 0:
      return true; // Siempre se puede avanzar desde el pre-menú
    case 1:
      return characterData.name && 
             characterData.name.trim() !== '' && 
             characterData.class && 
             characterData.background;
    case 2:
      return characterData.strength && 
             characterData.dexterity && 
             characterData.constitution && 
             characterData.intelligence && 
             characterData.wisdom && 
             characterData.charisma;
    case 3:
      return characterData.skills && characterData.skills.length > 0;
    case 4:
      return true; // El paso de subida de nivel siempre permite avanzar
    default:
      return true;
  }
};

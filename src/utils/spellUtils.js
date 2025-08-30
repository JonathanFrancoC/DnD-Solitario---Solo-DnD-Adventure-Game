import spellDatabase from '../data/spells.json';

// Función para verificar si una clase es lanzadora de hechizos
export const isSpellcaster = (className) => {
  const spellcastingClasses = [
    'bardo', 'clerigo', 'druida', 'hechicero', 'mago', 
    'paladin', 'ranger', 'brujo'
  ];
  return spellcastingClasses.includes(className);
};

// Función para obtener hechizos disponibles al subir de nivel
export const getAvailableSpellsForLevelUp = (className, targetLevel) => {
  if (!isSpellcaster(className)) return [];
  
  // Filtrar hechizos por clase y nivel máximo
  const availableSpells = spellDatabase.filter(spell => {
    // Verificar que el hechizo esté disponible para la clase
    if (!spell.classes || !spell.classes.includes(className)) {
      return false;
    }
    
    // Verificar que el nivel del hechizo sea apropiado para el nivel del personaje
    if (spell.level > targetLevel) {
      return false;
    }
    
    return true;
  });
  
  // Ordenar por nivel y nombre
  return availableSpells.sort((a, b) => {
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    return a.name.localeCompare(b.name);
  });
};

// Función para obtener hechizos iniciales de una clase
export const getStartingSpells = (className) => {
  const startingSpells = {
    bardo: ['Prestidigitación', 'Mensaje', 'Curación menor', 'Disfrazarse'],
    clerigo: ['Luz', 'Prestidigitación', 'Curación menor', 'Bendecir'],
    druida: ['Luz', 'Prestidigitación', 'Curación menor', 'Bendecir'],
    hechicero: ['Prestidigitación', 'Luz', 'Rayo de escarcha', 'Escudo'],
    mago: ['Prestidigitación', 'Luz', 'Rayo de escarcha', 'Escudo'],
    paladin: ['Luz', 'Prestidigitación', 'Curación menor', 'Bendecir'],
    ranger: ['Luz', 'Prestidigitación', 'Curación menor', 'Bendecir'],
    brujo: ['Prestidigitación', 'Luz', 'Rayo de escarcha', 'Escudo']
  };
  
  return startingSpells[className] || [];
};

// Función para obtener trucos iniciales de una clase
export const getStartingCantrips = (className) => {
  const startingCantrips = {
    bardo: ['Prestidigitación', 'Mensaje'],
    clerigo: ['Luz', 'Prestidigitación'],
    druida: ['Luz', 'Prestidigitación'],
    hechicero: ['Prestidigitación', 'Luz'],
    mago: ['Prestidigitación', 'Luz'],
    paladin: ['Luz', 'Prestidigitación'],
    ranger: ['Luz', 'Prestidigitación'],
    brujo: ['Prestidigitación', 'Luz']
  };
  
  return startingCantrips[className] || [];
};

// Función para manejar la selección/deselección de hechizos al subir de nivel
export const handleLevelUpSpellToggle = (spell, levelUpSpells, setLevelUpSpells) => {
  const isSelected = levelUpSpells.find(s => s.key === spell.key);
  
  if (isSelected) {
    // Deseleccionar el hechizo
    setLevelUpSpells(prev => prev.filter(s => s.key !== spell.key));
  } else {
    // Seleccionar el hechizo
    setLevelUpSpells(prev => [...prev, spell]);
  }
};

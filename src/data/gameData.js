// DATOS UNIFICADOS DEL JUEGO D&D 5E

// ===== DATOS DE RAZAS =====
export const raceData = {
  humano: {
    name: 'Humano',
    abilityScoreIncrease: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    traits: ['Versatilidad', 'Idioma adicional']
  },
  elfo: {
    name: 'Elfo',
    abilityScoreIncrease: { dexterity: 2 },
    traits: ['Vista en la oscuridad', 'Inmunidad al encantamiento', 'Trance']
  },
  enano: {
    name: 'Enano',
    abilityScoreIncrease: { constitution: 2 },
    traits: ['Vista en la oscuridad', 'Resistencia al veneno', 'Proficiencia con herramientas']
  },
  mediano: {
    name: 'Mediano',
    abilityScoreIncrease: { dexterity: 2 },
    traits: ['Suerte', 'Valiente', 'Agilidad natural']
  },
  dragonborn: {
    name: 'Dragonborn',
    abilityScoreIncrease: { strength: 2, charisma: 1 },
    traits: ['Aliento de dragón', 'Resistencia al daño']
  },
  gnomo: {
    name: 'Gnomo',
    abilityScoreIncrease: { intelligence: 2 },
    traits: ['Vista en la oscuridad', 'Astucia gnómica']
  },
  semielfo: {
    name: 'Semielfo',
    abilityScoreIncrease: { charisma: 2, strength: 1, constitution: 1 },
    traits: ['Vista en la oscuridad', 'Herencia feérica']
  },
  semiorco: {
    name: 'Semiorco',
    abilityScoreIncrease: { strength: 2, constitution: 1 },
    traits: ['Vista en la oscuridad', 'Intimidación', 'Resistencia implacable']
  },
  tiefling: {
    name: 'Tiefling',
    abilityScoreIncrease: { charisma: 2, intelligence: 1 },
    traits: ['Vista en la oscuridad', 'Resistencia al fuego', 'Herencia infernal']
  }
};

// ===== DATOS DE CLASES =====
export const classData = {
  bardo: {
    name: 'Bardo',
    hitDie: 'd8',
    recommendedStats: { strength: 8, dexterity: 14, constitution: 14, intelligence: 8, wisdom: 12, charisma: 16 },
    startingEquipment: [
      'Lira', 'Pergaminos', 'Mochila de erudito', 'Ropa de viajero', 'Poción de curación',
      'Dagas (2)', 'Arco corto', 'Flechas (20)', 'Armadura de cuero'
    ],
    startingSpells: ['Prestidigitación', 'Mensaje', 'Curación menor', 'Disfrazarse'],
    skills: ['Acrobacias', 'Atletismo', 'Engaño', 'Historia', 'Intimidación', 'Investigación', 'Medicina', 'Naturaleza', 'Percepción', 'Persuasión', 'Religión', 'Sigilo', 'T. con Animales']
  },
  barbaro: {
    name: 'Bárbaro',
    hitDie: 'd12',
    recommendedStats: { strength: 16, dexterity: 14, constitution: 14, intelligence: 8, wisdom: 12, charisma: 8 },
    startingEquipment: [
      'Hacha de guerra', 'Arco largo', 'Flechas (20)', 'Mochila de explorador', 'Ropa de viajero',
      'Poción de curación', 'Jabalinas (4)', 'Cuerda de cáñamo (15m)'
    ],
    skills: ['Atletismo', 'Intimidación', 'Naturaleza', 'Percepción', 'Sigilo', 'Supervivencia', 'T. con Animales']
  },
  guerrero: {
    name: 'Guerrero',
    hitDie: 'd10',
    recommendedStats: { strength: 16, dexterity: 14, constitution: 14, intelligence: 8, wisdom: 12, charisma: 8 },
    startingEquipment: [
      'Espada larga', 'Escudo', 'Arco corto', 'Flechas (20)', 'Armadura de cuero',
      'Mochila de explorador', 'Ropa de viajero', 'Poción de curación'
    ],
    skills: ['Acrobacias', 'Atletismo', 'Historia', 'Intimidación', 'Investigación', 'Naturaleza', 'Percepción', 'Supervivencia']
  },
  clerigo: {
    name: 'Clérigo',
    hitDie: 'd8',
    recommendedStats: { strength: 14, dexterity: 8, constitution: 14, intelligence: 8, wisdom: 16, charisma: 12 },
    startingEquipment: [
      'Maza', 'Escudo', 'Símbolo sagrado', 'Armadura de cuero', 'Mochila de sacerdote',
      'Ropa de viajero', 'Poción de curación', 'Varas de incienso'
    ],
    startingSpells: ['Luz', 'Prestidigitación', 'Curación menor', 'Bendecir'],
    skills: ['Historia', 'Intimidación', 'Medicina', 'Persuasión', 'Religión']
  },
  druida: {
    name: 'Druida',
    hitDie: 'd8',
    recommendedStats: { strength: 8, dexterity: 14, constitution: 14, intelligence: 12, wisdom: 16, charisma: 8 },
    startingEquipment: [
      'Bastón', 'Escudo', 'Símbolo druídico', 'Armadura de cuero', 'Mochila de explorador',
      'Ropa de viajero', 'Poción de curación', 'Componentes para conjuros'
    ],
    startingSpells: ['Luz', 'Prestidigitación', 'Curación menor', 'Bendecir'],
    skills: ['C. Arcano', 'Medicina', 'Naturaleza', 'Percepción', 'Religión', 'Sigilo', 'Supervivencia', 'T. con Animales']
  },
  hechicero: {
    name: 'Hechicero',
    hitDie: 'd6',
    recommendedStats: { strength: 8, dexterity: 14, constitution: 14, intelligence: 8, wisdom: 12, charisma: 16 },
    startingEquipment: [
      'Vara arcana', 'Componentes para conjuros', 'Mochila de erudito', 'Ropa de viajero',
      'Poción de curación', 'Daga', 'Pergaminos'
    ],
    startingSpells: ['Prestidigitación', 'Luz', 'Rayo de escarcha', 'Escudo'],
    skills: ['C. Arcano', 'Engaño', 'Intimidación', 'Investigación', 'Religión', 'Persuasión']
  },
  mago: {
    name: 'Mago',
    hitDie: 'd6',
    recommendedStats: { strength: 8, dexterity: 14, constitution: 14, intelligence: 16, wisdom: 12, charisma: 8 },
    startingEquipment: [
      'Vara arcana', 'Componentes para conjuros', 'Mochila de erudito', 'Ropa de viajero',
      'Poción de curación', 'Daga', 'Pergaminos', 'Libro de conjuros'
    ],
    startingSpells: ['Prestidigitación', 'Luz', 'Rayo de escarcha', 'Escudo'],
    skills: ['C. Arcano', 'Historia', 'Investigación', 'Medicina', 'Religión']
  },
  monje: {
    name: 'Monje',
    hitDie: 'd8',
    recommendedStats: { strength: 12, dexterity: 16, constitution: 14, intelligence: 8, wisdom: 14, charisma: 8 },
    startingEquipment: [
      'Bastón', 'Dagas (10)', 'Mochila de explorador', 'Ropa de viajero',
      'Poción de curación', 'Raciones de viaje (5 días)'
    ],
    skills: ['Acrobacias', 'Atletismo', 'Historia', 'Percepción', 'Religión', 'Sigilo', 'Supervivencia']
  },
  paladin: {
    name: 'Paladín',
    hitDie: 'd10',
    recommendedStats: { strength: 16, dexterity: 8, constitution: 14, intelligence: 8, wisdom: 12, charisma: 14 },
    startingEquipment: [
      'Espada larga', 'Escudo', 'Símbolo sagrado', 'Armadura de cuero', 'Mochila de explorador',
      'Ropa de viajero', 'Poción de curación', 'Jabalinas (5)'
    ],
    startingSpells: ['Luz', 'Prestidigitación', 'Curación menor', 'Bendecir'],
    skills: ['Atletismo', 'Intimidación', 'Medicina', 'Persuasión', 'Religión']
  },
  picaro: {
    name: 'Pícaro',
    hitDie: 'd8',
    recommendedStats: { strength: 8, dexterity: 16, constitution: 14, intelligence: 14, wisdom: 12, charisma: 8 },
    startingEquipment: [
      'Espada corta', 'Arco corto', 'Flechas (20)', 'Armadura de cuero', 'Mochila de explorador',
      'Ropa de viajero', 'Poción de curación', 'Herramientas de ladrón', 'Cuerda de seda (15m)'
    ],
    skills: ['Acrobacias', 'Atletismo', 'Engaño', 'Intimidación', 'Investigación', 'Percepción', 'Persuasión', 'Sigilo']
  },
  ranger: {
    name: 'Ranger',
    hitDie: 'd10',
    recommendedStats: { strength: 8, dexterity: 16, constitution: 14, intelligence: 12, wisdom: 14, charisma: 8 },
    startingEquipment: [
      'Espada larga', 'Arco largo', 'Flechas (20)', 'Armadura de cuero', 'Mochila de explorador',
      'Ropa de viajero', 'Poción de curación', 'Jabalinas (4)', 'Raciones de viaje (5 días)'
    ],
    startingSpells: ['Luz', 'Prestidigitación', 'Curación menor', 'Bendecir'],
    skills: ['Atletismo', 'Investigación', 'Naturaleza', 'Percepción', 'Sigilo', 'Supervivencia', 'T. con Animales']
  },
  brujo: {
    name: 'Brujo',
    hitDie: 'd8',
    recommendedStats: { strength: 8, dexterity: 14, constitution: 14, intelligence: 8, wisdom: 12, charisma: 16 },
    startingEquipment: [
      'Vara arcana', 'Componentes para conjuros', 'Mochila de erudito', 'Ropa de viajero',
      'Poción de curación', 'Daga', 'Pergaminos'
    ],
    startingSpells: ['Prestidigitación', 'Luz', 'Rayo de escarcha', 'Escudo'],
    skills: ['C. Arcano', 'Engaño', 'Historia', 'Intimidación', 'Investigación', 'Naturaleza', 'Religión']
  }
};

// ===== DATOS DE TRASFONDOS =====
export const backgroundData = {
  acolito: {
    name: 'Acolito',
    skills: ['Perspicacia', 'Religión'],
    equipment: ['Símbolo sagrado', 'Vestiduras', 'Incienso', 'Raciones de viaje (5 días)', 'Dinero (15 po)']
  },
  criminal: {
    name: 'Criminal',
    skills: ['Engaño', 'Sigilo'],
    equipment: ['Herramientas de ladrón', 'Ropa oscura', 'Dinero (15 po)']
  },
  heroe: {
    name: 'Héroe',
    skills: ['Atletismo', 'Intimidación'],
    equipment: ['Arma favorita', 'Trofeo', 'Ropa de viajero', 'Dinero (10 po)']
  },
  sabio: {
    name: 'Sabio',
    skills: ['Historia', 'Investigación'],
    equipment: ['Libro de conocimiento', 'Tinta y pluma', 'Ropa de erudito', 'Dinero (10 po)']
  },
  soldado: {
    name: 'Soldado',
    skills: ['Atletismo', 'Intimidación'],
    equipment: ['Insignia de rango', 'Trofeo de guerra', 'Ropa de viajero', 'Dinero (10 po)']
  },
  artesano: {
    name: 'Artesano',
    skills: ['Investigación', 'Persuasión'],
    equipment: ['Herramientas de artesano', 'Ropa de trabajo', 'Dinero (15 po)']
  },
  charlatan: {
    name: 'Charlatán',
    skills: ['Engaño', 'Sigilo'],
    equipment: ['Disfraces', 'Herramientas de falsificador', 'Dinero (15 po)']
  },
  ermitaño: {
    name: 'Ermitaño',
    skills: ['Medicina', 'Religión'],
    equipment: ['Pergaminos', 'Ropa de ermitaño', 'Dinero (5 po)']
  },
  noble: {
    name: 'Noble',
    skills: ['Historia', 'Persuasión'],
    equipment: ['Ropa fina', 'Anillo de sello', 'Dinero (25 po)']
  },
  salvaje: {
    name: 'Salvaje',
    skills: ['Atletismo', 'Supervivencia'],
    equipment: ['Arma tribal', 'Trofeo de caza', 'Ropa de viajero', 'Dinero (10 po)']
  },
  asesino: {
    name: 'Asesino',
    skills: ['Sigilo', 'Engaño'],
    equipment: ['Dagas (2)', 'Ropa oscura', 'Herramientas de ladrón', 'Veneno básico', 'Dinero (20 po)']
  },
  mercenario: {
    name: 'Mercenario',
    skills: ['Atletismo', 'Intimidación'],
    equipment: ['Arma de guerra', 'Armadura de cuero', 'Dinero (30 po)', 'Contrato de trabajo']
  },
  cultista: {
    name: 'Cultista',
    skills: ['Religión', 'Engaño'],
    equipment: ['Símbolo del culto', 'Vestiduras oscuras', 'Incienso', 'Dinero (15 po)']
  },
  guardia: {
    name: 'Guardia',
    skills: ['Percepción', 'Atletismo'],
    equipment: ['Alabarda', 'Armadura de cuero', 'Insignia de guardia', 'Dinero (10 po)']
  },
  curandero: {
    name: 'Curandero',
    skills: ['Medicina', 'Perspicacia'],
    equipment: ['Kit de medicina', 'Hierbas medicinales', 'Dinero (20 po)', 'Libro de remedios']
  },
  explorador: {
    name: 'Explorador',
    skills: ['Naturaleza', 'Supervivencia'],
    equipment: ['Brújula', 'Mapas', 'Ropa de viajero', 'Raciones de viaje (10 días)', 'Dinero (15 po)']
  },
  comerciante: {
    name: 'Comerciante',
    skills: ['Persuasión', 'Investigación'],
    equipment: ['Balanza de comerciante', 'Libro de cuentas', 'Ropa fina', 'Dinero (25 po)', 'Mercancías diversas']
  },
  diplomatico: {
    name: 'Diplomático',
    skills: ['Persuasión', 'Historia'],
    equipment: ['Documentos oficiales', 'Sello personal', 'Ropa elegante', 'Dinero (20 po)', 'Cartas de presentación']
  },
  investigador: {
    name: 'Investigador',
    skills: ['Investigación', 'Percepción'],
    equipment: ['Lupa', 'Pergaminos', 'Tinta y pluma', 'Ropa de erudito', 'Dinero (15 po)', 'Kit de investigación']
  },
  cazador: {
    name: 'Cazador',
    skills: ['Supervivencia', 'Percepción'],
    equipment: ['Arco de caza', 'Flechas (20)', 'Trampas', 'Ropa de cazador', 'Dinero (10 po)', 'Trofeos de caza']
  },
  herrero: {
    name: 'Herrero',
    skills: ['Atletismo', 'Investigación'],
    equipment: ['Herramientas de herrero', 'Martillo', 'Yunque portátil', 'Ropa de trabajo', 'Dinero (20 po)', 'Metal en bruto']
  },
  artista: {
    name: 'Artista',
    skills: ['Acrobacias', 'Persuasión'],
    equipment: ['Instrumento musical', 'Disfraces', 'Ropa de actuación', 'Dinero (15 po)', 'Kit de maquillaje']
  },
  forastero: {
    name: 'Forastero',
    skills: ['Supervivencia', 'Percepción'],
    equipment: ['Ropa de viajero', 'Mochila', 'Raciones de viaje (5 días)', 'Dinero (10 po)', 'Mapa de carreteras']
  },
  erudito: {
    name: 'Erudito',
    skills: ['Historia', 'C. Arcano'],
    equipment: ['Libros de estudio', 'Tinta y pluma', 'Pergaminos', 'Ropa de erudito', 'Dinero (15 po)']
  },
  marinero: {
    name: 'Marinero',
    skills: ['Atletismo', 'Percepción'],
    equipment: ['Brújula', 'Cuerda de seda (15m)', 'Ropa de marinero', 'Dinero (10 po)', 'Kit de navegación']
  },
  huerfano: {
    name: 'Huérfano',
    skills: ['Sigilo', 'Engaño'],
    equipment: ['Herramientas de ladrón', 'Ropa común', 'Dinero (5 po)', 'Recuerdo de familia']
  },
  minero: {
    name: 'Minero',
    skills: ['Atletismo', 'Supervivencia'],
    equipment: ['Pico de minero', 'Lámpara de aceite', 'Ropa de trabajo', 'Dinero (10 po)', 'Minerales en bruto']
  },
  pescador: {
    name: 'Pescador',
    skills: ['Supervivencia', 'Naturaleza'],
    equipment: ['Red de pesca', 'Caña de pescar', 'Ropa de pescador', 'Dinero (8 po)', 'Cebo']
  },
  cocinero: {
    name: 'Cocinero',
    skills: ['Medicina', 'Persuasión'],
    equipment: ['Utensilios de cocina', 'Especias', 'Ropa de cocinero', 'Dinero (12 po)', 'Libro de recetas']
  }
};

// ===== DATOS DE HABILIDADES =====
export const skillData = {
  acrobacias: { name: 'Acrobacias', ability: 'dexterity' },
  atletismo: { name: 'Atletismo', ability: 'strength' },
  arcanos: { name: 'C. Arcano', ability: 'intelligence' },
  engaño: { name: 'Engaño', ability: 'charisma' },
  historia: { name: 'Historia', ability: 'intelligence' },
  intimidación: { name: 'Intimidación', ability: 'charisma' },
  investigacion: { name: 'Investigación', ability: 'intelligence' },
  medicina: { name: 'Medicina', ability: 'wisdom' },
  naturaleza: { name: 'Naturaleza', ability: 'intelligence' },
  percepcion: { name: 'Percepción', ability: 'wisdom' },
  persuasion: { name: 'Persuasión', ability: 'charisma' },
  religion: { name: 'Religión', ability: 'intelligence' },
  sigilo: { name: 'Sigilo', ability: 'dexterity' },
  supervivencia: { name: 'Supervivencia', ability: 'wisdom' },
  tratoConAnimales: { name: 'T. con Animales', ability: 'wisdom' }
};

// ===== FUNCIONES HELPER =====

// Obtener modificadores raciales
export function getRaceModifiers(raceKey, raceData) {
  if (!raceKey || !raceData[raceKey]) return {};
  return raceData[raceKey].abilityScoreIncrease || {};
}

// Obtener estadísticas recomendadas para una clase
export function getRecommendedStats(className) {
  return classData[className]?.recommendedStats || null;
}

// Obtener habilidades de clase
export function getClassSkills(className) {
  return classData[className]?.skills || [];
}

// Obtener habilidades de trasfondo
export function getBackgroundSkills(background) {
  return backgroundSkills[background] || [];
}

// Obtener equipo inicial de clase
export function getClassStartingEquipment(className) {
  return classData[className]?.startingEquipment || [];
}

// Obtener conjuros iniciales de clase
export function getClassStartingSpells(className) {
  return classData[className]?.startingSpells || [];
}

// ===== DATOS DE HABILIDADES Y SALVACIONES =====

// 🔹 Todas las skills (para reutilizar en bardo y validaciones)
export const ALL_SKILLS = [
  'Acrobacias','Interpretación','C. Arcano','Atletismo','Engaño','Historia','Intimidación',
  'Investigación','Juego de Manos','Medicina','Naturaleza','Percepción','Perspicacia',
  'Persuasión','Religión','Sigilo','Supervivencia','T. con Animales'
];

// 🔹 Salvaciones por clase (claves en minúsculas como usas en tu app)
export const savingThrowsByClass = {
  barbaro:   ['strength','constitution'],
  bardo:     ['dexterity','charisma'],
  clerigo:   ['wisdom','charisma'],
  druida:    ['intelligence','wisdom'],
  guerrero:  ['strength','constitution'],
  monje:     ['strength','dexterity'],
  paladin:   ['wisdom','charisma'],
  ranger:    ['strength','dexterity'],
  picaro:    ['dexterity','intelligence'],
  hechicero: ['constitution','charisma'],
  brujo:     ['wisdom','charisma'],
  mago:      ['intelligence','wisdom'],
};

// 🔹 Opciones de skills por clase (PHB). 'choose' = cuántas elegir.
export const classSkillOptions = {
  barbaro: { choose: 2, from: [
    'Atletismo','Intimidación','Naturaleza','Percepción','Sigilo','Supervivencia','T. con Animales'
  ]},
  bardo: { choose: 3, from: ALL_SKILLS }, // bardo: 3 de cualquier skill
  clerigo: { choose: 2, from: [
    'Historia','Perspicacia','Medicina','Persuasión','Religión'
  ]},
  druida: { choose: 2, from: [
    'C. Arcano','T. con Animales','Perspicacia','Medicina','Naturaleza','Percepción','Religión','Supervivencia'
  ]},
  guerrero: { choose: 2, from: [
    'Acrobacias','T. con Animales','Atletismo','Historia','Perspicacia','Intimidación','Percepción','Supervivencia'
  ]},
  monje: { choose: 2, from: [
    'Acrobacias','Atletismo','Historia','Perspicacia','Religión','Sigilo'
  ]},
  paladin: { choose: 2, from: [
    'Atletismo','Perspicacia','Intimidación','Medicina','Persuasión','Religión'
  ]},
  ranger: { choose: 3, from: [
    'T. con Animales','Atletismo','Perspicacia','Investigación','Naturaleza','Percepción','Sigilo','Supervivencia'
  ]},
  picaro: { choose: 4, from: [
    'Acrobacias','Atletismo','Engaño','Perspicacia','Intimidación','Investigación',
    'Percepción','Interpretación','Persuasión','Juego de Manos','Sigilo'
  ]},
  hechicero: { choose: 2, from: [
    'C. Arcano','Engaño','Perspicacia','Intimidación','Persuasión','Religión'
  ]},
  brujo: { choose: 2, from: [
    'C. Arcano','Engaño','Historia','Intimidación','Investigación','Naturaleza','Religión'
  ]},
  mago: { choose: 2, from: [
    'C. Arcano','Historia','Perspicacia','Investigación','Medicina','Religión'
  ]},
};

// 🔹 Habilidades por trasfondo (PHB)
export const backgroundSkills = {
  acolito:   ['Perspicacia','Religión'],
  criminal:  ['Engaño','Sigilo'],
  heroe:     ['T. con Animales','Supervivencia'],    // Héroe del pueblo
  sabio:     ['C. Arcano','Historia'],
  soldado:   ['Atletismo','Intimidación'],
  artesano:  ['Perspicacia','Persuasión'],              // Artesano del gremio
  charlatan: ['Engaño','Juego de Manos'],
  ermitaño:  ['Medicina','Religión'],
  noble:     ['Historia','Persuasión'],
  salvaje:   ['Atletismo','Supervivencia'],            // Forastero/Salvaje
  marinero:  ['Atletismo','Percepción'],
  artista:   ['Acrobacias','Interpretación'],               // Entertainer/Artista
  gamberro:  ['Juego de Manos','Sigilo'],              // Urchin/Gamberro
};

// 🔹 Reglas de duplicados (idea de implementación)
export function mergeSkillProficiencies({classPicks, backgroundKey, racialSkills = []}) {
  const fromBackground = backgroundSkills[backgroundKey] ?? [];
  const merged = new Set();

  // añade, evitando duplicados
  [...classPicks, ...fromBackground, ...racialSkills].forEach(s => merged.add(s));

  // si hubo duplicados con el trasfondo, permite elegir skills libres para "rellenar"
  // (puedes abrir un selector con ALL_SKILLS - merged)
  return Array.from(merged);
}

 // ===== DATOS DE PROGRESIÓN DE NIVEL =====
// Nivel 1–20, rasgos base por clase (sin subclases). Español neutro.
// Campos:
// - features: string[]
// - cantripsKnown?: number  (TOTAL de trucos conocidos a ese nivel; solo si la clase tiene)
// Nota: las clases "prepared casters" (clérigo/druida/paladín/mago) preparan conjuros a diario; no se fija "spellsKnown" aquí.

export const levelProgressionData = {
  bardo: {
    1:  { features: ['Lanzamiento de conjuros', 'Inspiración bárdica (d6)'], cantripsKnown: 2 },
    2:  { features: ['Canto de descanso (d6)', 'Jack of All Trades', 'Exaltación (Expertise)'] },
    3:  { features: ['Colegio de bardos (subclase)'] },
    4:  { features: ['Mejora de característica (ASI)'], cantripsKnown: 3 },
    5:  { features: ['Inspiración bárdica (d8)', 'Fuente de inspiración'] },
    6:  { features: ['Contracanto (Countercharm)', 'Rasgo del colegio'] },
    7:  { features: [] },
    8:  { features: ['Mejora de característica (ASI)'] },
    9:  { features: ['Canto de descanso (d8)'] },
    10: { features: ['Inspiración bárdica (d10)', 'Secretos mágicos (2)', 'Exaltación (2 talentos adicionales)'], cantripsKnown: 4 },
    11: { features: [] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: ['Canto de descanso (d10)'] },
    14: { features: ['Secretos mágicos (2)', 'Rasgo del colegio'] },
    15: { features: ['Inspiración bárdica (d12)'] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: ['Canto de descanso (d12)'] },
    18: { features: ['Secretos mágicos (2)'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Inspiración superior'] }
  },

  barbaro: {
    1:  { features: ['Furia', 'Defensa sin armadura'] },
    2:  { features: ['Ataque temerario', 'Sentido del peligro'] },
    3:  { features: ['Senda primitiva (subclase)'] },
    4:  { features: ['Mejora de característica (ASI)'] },
    5:  { features: ['Ataque extra', 'Movimiento rápido'] },
    6:  { features: ['Rasgo de la senda'] },
    7:  { features: ['Instinto feroz'] },
    8:  { features: ['Mejora de característica (ASI)'] },
    9:  { features: ['Golpe brutal (1 dado extra)'] },
    10: { features: ['Rasgo de la senda'] },
    11: { features: ['Furia incansable'] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: ['Golpe brutal (2 dados extra)'] },
    14: { features: ['Rasgo de la senda'] },
    15: { features: ['Furia persistente'] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: ['Golpe brutal (3 dados extra)'] },
    18: { features: ['Poder indomable'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Campeón primigenio'] }
  },

  guerrero: {
    1:  { features: ['Estilo de combate', 'Segundo aliento'] },
    2:  { features: ['Oleada de acción (1 uso)'] },
    3:  { features: ['Arquetipo marcial (subclase)'] },
    4:  { features: ['Mejora de característica (ASI)'] },
    5:  { features: ['Ataque extra'] },
    6:  { features: ['Mejora de característica (ASI)'] },
    7:  { features: ['Rasgo del arquetipo'] },
    8:  { features: ['Mejora de característica (ASI)'] },
    9:  { features: ['Indomable (1 uso)'] },
    10: { features: ['Rasgo del arquetipo'] },
    11: { features: ['Ataque extra (2)'] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: ['Indomable (2 usos)'] },
    14: { features: ['Mejora de característica (ASI)'] },
    15: { features: ['Rasgo del arquetipo'] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: ['Oleada de acción (2 usos)', 'Indomable (3 usos)'] },
    18: { features: ['Mejora de característica (ASI)'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Ataque extra (3)'] }
  },

  clerigo: {
    1:  { features: ['Lanzamiento de conjuros (preparados)', 'Dominio divino (subclase)'], cantripsKnown: 3 },
    2:  { features: ['Canalizar divinidad (1/descanso)'] },
    3:  { features: ['Rasgo del dominio'] },
    4:  { features: ['Mejora de característica (ASI)'], cantripsKnown: 4 },
    5:  { features: ['Destruir no muertos (CR 1/2)', 'Rasgo del dominio'] },
    6:  { features: ['Canalizar divinidad (2/descanso)'] },
    7:  { features: [] },
    8:  { features: ['Mejora de característica (ASI)', 'Destruir no muertos (CR 1)'] },
    9:  { features: [] },
    10: { features: ['Intervención divina'], cantripsKnown: 5 },
    11: { features: ['Destruir no muertos (CR 2)'] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: [] },
    14: { features: ['Destruir no muertos (CR 3)'] },
    15: { features: [] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: ['Destruir no muertos (CR 4)', 'Intervención divina mejorada'] },
    18: { features: ['Canalizar divinidad (3/descanso)'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: [] }
  },

  druida: {
    1:  { features: ['Lanzamiento de conjuros (preparados)', 'Druídico'], cantripsKnown: 2 },
    2:  { features: ['Forma salvaje', 'Círculo druídico (subclase)'] },
    3:  { features: [] },
    4:  { features: ['Mejora de característica (ASI)', 'Mejora de forma salvaje'], cantripsKnown: 3 },
    5:  { features: [] },
    6:  { features: ['Rasgo del círculo'] },
    7:  { features: [] },
    8:  { features: ['Mejora de característica (ASI)', 'Mejora de forma salvaje'] },
    9:  { features: [] },
    10: { features: ['Rasgo del círculo'], cantripsKnown: 4 },
    11: { features: [] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: [] },
    14: { features: ['Rasgo del círculo'] },
    15: { features: [] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: [] },
    18: { features: ['Cuerpo intemporal', 'Conjuros de bestia'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Arquidruida'] }
  },

  hechicero: {
    1:  { features: ['Lanzamiento de conjuros (conocidos)', 'Origen mágico (subclase)'], cantripsKnown: 4 },
    2:  { features: ['Fuente de magia (Puntos de hechicería)'] },
    3:  { features: ['Metamagia (elige 2)'] },
    4:  { features: ['Mejora de característica (ASI)'], cantripsKnown: 5 },
    5:  { features: [] },
    6:  { features: ['Rasgo del origen'] },
    7:  { features: [] },
    8:  { features: ['Mejora de característica (ASI)'] },
    9:  { features: [] },
    10: { features: ['Metamagia (elige 1 adicional)'], cantripsKnown: 6 },
    11: { features: [] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: [] },
    14: { features: ['Rasgo del origen'] },
    15: { features: [] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: ['Metamagia (elige 1 adicional)'] },
    18: { features: ['Rasgo del origen'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Restauración hechicera'] }
  },

  mago: {
    1:  { features: ['Lanzamiento de conjuros (libro de conjuros)', 'Recuperación arcana'], cantripsKnown: 3 },
    2:  { features: ['Tradición arcana (subclase)'] },
    3:  { features: [] },
    4:  { features: ['Mejora de característica (ASI)'], cantripsKnown: 4 },
    5:  { features: [] },
    6:  { features: ['Rasgo de la tradición'] },
    7:  { features: [] },
    8:  { features: ['Mejora de característica (ASI)'] },
    9:  { features: [] },
    10: { features: ['Rasgo de la tradición'], cantripsKnown: 5 },
    11: { features: [] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: [] },
    14: { features: ['Rasgo de la tradición'] },
    15: { features: [] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: ['Maestría de conjuros (Spell Mastery)'] },
    18: { features: [] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Conjuros característicos (Signature Spells)'] }
  },

  monje: {
    1:  { features: ['Defensa sin armadura', 'Artes marciales'] },
    2:  { features: ['Ki', 'Movimiento sin armadura'] },
    3:  { features: ['Tradición monástica (subclase)', 'Desviar proyectiles'] },
    4:  { features: ['Mejora de característica (ASI)', 'Caída lenta'] },
    5:  { features: ['Ataque extra', 'Golpe aturdidor'] },
    6:  { features: ['Golpes potenciados por ki', 'Rasgo de la tradición'] },
    7:  { features: ['Evasión', 'Quietud mental'] },
    8:  { features: ['Mejora de característica (ASI)'] },
    9:  { features: ['Mejora del movimiento sin armadura'] },
    10: { features: ['Pureza corporal'] },
    11: { features: ['Rasgo de la tradición'] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: ['Lengua del sol y la luna'] },
    14: { features: ['Alma de diamante'] },
    15: { features: ['Cuerpo intemporal'] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: ['Rasgo de la tradición'] },
    18: { features: ['Cuerpo vacío'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Yo perfecto'] }
  },

  paladin: {
    1:  { features: ['Sentido divino', 'Manos curativas (Lay on Hands)'] },
    2:  { features: ['Estilo de combate', 'Lanzamiento de conjuros (preparados)', 'Golpe divino'] },
    3:  { features: ['Juramento sagrado (subclase)', 'Canalizar divinidad', 'Salud divina'] },
    4:  { features: ['Mejora de característica (ASI)'] },
    5:  { features: ['Ataque extra'] },
    6:  { features: ['Aura de protección'] },
    7:  { features: ['Rasgo del juramento'] },
    8:  { features: ['Mejora de característica (ASI)'] },
    9:  { features: [] },
    10: { features: ['Aura de valor (coraje)'] },
    11: { features: ['Golpe divino mejorado'] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: [] },
    14: { features: ['Toque purificador'] },
    15: { features: ['Rasgo del juramento'] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: [] },
    18: { features: ['Aumenta el alcance de auras (9 m / 30 ft)'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Rasgo máximo del juramento (capstone)'] }
  },

  picaro: {
    1:  { features: ['Ataque furtivo (1d6)', 'Pericias (Expertise)', 'Jerga ladina'] },
    2:  { features: ['Acción astuta'] },
    3:  { features: ['Arquetipo pícaro (subclase)'] },
    4:  { features: ['Mejora de característica (ASI)'] },
    5:  { features: ['Esquiva asombrosa'] },
    6:  { features: ['Pericias (más habilidades)'] },
    7:  { features: ['Evasión'] },
    8:  { features: ['Mejora de característica (ASI)'] },
    9:  { features: ['Rasgo del arquetipo'] },
    10: { features: ['Mejora de característica (ASI)'] },
    11: { features: ['Talento confiable'] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: ['Rasgo del arquetipo'] },
    14: { features: ['Ceguera parcial (Blindsense) 3 m/10 ft'] },
    15: { features: ['Mente escurridiza'] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: ['Rasgo del arquetipo'] },
    18: { features: ['Elusivo'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Golpe de suerte'] }
  },

  ranger: {
    1:  { features: ['Enemigo predilecto', 'Explorador nato (Exploración natural)'] },
    2:  { features: ['Estilo de combate', 'Lanzamiento de conjuros (conocidos)'] },
    3:  { features: ['Conclave/Arquetipo explorador (subclase)', 'Conciencia primitiva'] },
    4:  { features: ['Mejora de característica (ASI)'] },
    5:  { features: ['Ataque extra'] },
    6:  { features: ['Mejora de enemigo/entorno o rasgo de clase'] },
    7:  { features: ['Rasgo del arquetipo'] },
    8:  { features: ['Mejora de característica (ASI)', 'Zancada por la naturaleza (Land\'s Stride)'] },
    9:  { features: [] },
    10: { features: ['Ocultación perfecta (Hide in Plain Sight)'] },
    11: { features: ['Rasgo del arquetipo'] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: [] },
    14: { features: ['Desvanecerse (Vanish)'] },
    15: { features: ['Rasgo del arquetipo'] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: [] },
    18: { features: ['Sentidos ferales (Feral Senses)'] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Asesino de enemigos (Foe Slayer)'] }
  },

  brujo: {
    1:  { features: ['Patrón sobrenatural (subclase)', 'Pacto mágico (Pact Magic)'], cantripsKnown: 2 },
    2:  { features: ['Invocaciones místicas'] },
    3:  { features: ['Don del pacto (Pact Boon)'] },
    4:  { features: ['Mejora de característica (ASI)'] },
    5:  { features: [] },
    6:  { features: ['Rasgo del patrón'] },
    7:  { features: [] },
    8:  { features: ['Mejora de característica (ASI)'] },
    9:  { features: [] },
    10: { features: ['Rasgo del patrón'] },
    11: { features: ['Arcanum místico (conjuro de 6º)'] },
    12: { features: ['Mejora de característica (ASI)'] },
    13: { features: ['Arcanum místico (conjuro de 7º)'] },
    14: { features: ['Rasgo del patrón'] },
    15: { features: ['Arcanum místico (conjuro de 8º)'] },
    16: { features: ['Mejora de característica (ASI)'] },
    17: { features: ['Arcanum místico (conjuro de 9º)'] },
    18: { features: [] },
    19: { features: ['Mejora de característica (ASI)'] },
    20: { features: ['Maestro de lo arcano (Eldritch Master)'], cantripsKnown: 4 }
  }
};

// ===== DATOS DE CONJUROS =====

/* =========================================================
 * 1) TABLAS DE ESPACIOS DE CONJURO
 * ========================================================= */

// FULL CASTERS (Bardo, Clérigo, Druida, Hechicero, Mago)
// Índice por nivel 1..20. Cada fila: [L1,L2,L3,L4,L5,L6,L7,L8,L9]
export const FULL_CASTER_SLOTS = {
  1:  [2,0,0,0,0,0,0,0,0],
  2:  [3,0,0,0,0,0,0,0,0],
  3:  [4,2,0,0,0,0,0,0,0],
  4:  [4,3,0,0,0,0,0,0,0],
  5:  [4,3,2,0,0,0,0,0,0],
  6:  [4,3,3,0,0,0,0,0,0],
  7:  [4,3,3,1,0,0,0,0,0],
  8:  [4,3,3,2,0,0,0,0,0],
  9:  [4,3,3,3,1,0,0,0,0],
  10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0],
  12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0],
  14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0],
  16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1],
  18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1],
  20: [4,3,3,3,3,2,2,1,1],
};

// HALF CASTERS (Paladín, Ranger) — hasta 5º nivel de conjuro
// Índice por nivel 1..20. Cada fila: [L1,L2,L3,L4,L5]
export const HALF_CASTER_SLOTS = {
  1:  [0,0,0,0,0],            // sin magia a nivel 1
  2:  [2,0,0,0,0],
  3:  [3,0,0,0,0],
  4:  [3,0,0,0,0],
  5:  [4,2,0,0,0],
  6:  [4,2,0,0,0],
  7:  [4,3,0,0,0],
  8:  [4,3,0,0,0],
  9:  [4,3,2,0,0],
  10: [4,3,2,0,0],
  11: [4,3,3,0,0],
  12: [4,3,3,0,0],
  13: [4,3,3,1,0],
  14: [4,3,3,1,0],
  15: [4,3,3,2,0],
  16: [4,3,3,2,0],
  17: [4,3,3,3,1],
  18: [4,3,3,3,1],
  19: [4,3,3,3,2],
  20: [4,3,3,3,2],
};

// WARLOCK — Pacto Mágico (descansos cortos). Slots y nivel del slot.
export const WARLOCK_PACT_SLOTS = {
  // level: { slots: n, slotLevel: x }
  1:  { slots: 1, slotLevel: 1 },
  2:  { slots: 2, slotLevel: 1 },
  3:  { slots: 2, slotLevel: 2 },
  4:  { slots: 2, slotLevel: 2 },
  5:  { slots: 2, slotLevel: 3 },
  6:  { slots: 2, slotLevel: 3 },
  7:  { slots: 2, slotLevel: 4 },
  8:  { slots: 2, slotLevel: 4 },
  9:  { slots: 2, slotLevel: 5 },
  10: { slots: 2, slotLevel: 5 },
  11: { slots: 3, slotLevel: 5 },
  12: { slots: 3, slotLevel: 5 },
  13: { slots: 3, slotLevel: 5 },
  14: { slots: 3, slotLevel: 5 },
  15: { slots: 3, slotLevel: 5 },
  16: { slots: 3, slotLevel: 5 },
  17: { slots: 4, slotLevel: 5 },
  18: { slots: 4, slotLevel: 5 },
  19: { slots: 4, slotLevel: 5 },
  20: { slots: 4, slotLevel: 5 },
};

// Arcanos Místicos del Brujo (1/long rest): nivel 11→6º, 13→7º, 15→8º, 17→9º
export const WARLOCK_ARCANUM = {
  11: [6], 13: [7], 15: [8], 17: [9],
};

/* =========================================================
 * 2) CANTRIPS CONOCIDOS POR CLASE
 * (fórmulas compactas típicas PHB 2014)
 * ========================================================= */
export const CANTRIPS_KNOWN = {
  bardo:     (lvl) => 2 + (lvl >= 4 ? 1 : 0) + (lvl >= 10 ? 1 : 0), // 2/3/4
  clerigo:   (lvl) => 3 + (lvl >= 4 ? 1 : 0) + (lvl >= 10 ? 1 : 0), // 3/4/5
  druida:    (lvl) => 2 + (lvl >= 4 ? 1 : 0) + (lvl >= 10 ? 1 : 0), // 2/3/4
  hechicero: (lvl) => 4 + (lvl >= 4 ? 1 : 0) + (lvl >= 10 ? 1 : 0), // 4/5/6
  mago:      (lvl) => 3 + (lvl >= 4 ? 1 : 0) + (lvl >= 10 ? 1 : 0), // 3/4/5
  brujo:     (lvl) => 2 + (lvl >= 4 ? 1 : 0) + (lvl >= 10 ? 1 : 0), // 2/3/4
  paladin:   () => 0,
  ranger:    () => 0,
  barbaro:   () => 0,
  guerrero:  () => 0,
  monje:     () => 0,
  picaro:    () => 0,
};

/* =========================================================
 * 3) HECHIZOS CONOCIDOS VS. PREPARADOS
 * ========================================================= */

// a) Clases que PREPARAN (no "conocidos"):
//    preparados = mod_característica + (nivel de clase)
//    (Paladín usa Math.floor(nivel/2))
export const PREPARED_RULES = {
  clerigo:   (lvl, modSab) => Math.max(1, modSab + lvl),
  druida:    (lvl, modSab) => Math.max(1, modSab + lvl),
  mago:      (lvl, modInt) => Math.max(1, modInt + lvl),
  paladin:   (lvl, modCar) => Math.max(1, modCar + Math.floor(lvl/2)),
};

// b) Clases de "HECHIZOS CONOCIDOS" (tablitas por nivel):
// — Hechicero (PHB): 2→…→máx 15
export const SORCERER_SPELLS_KNOWN = {
  1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:8, 8:9, 9:10, 10:11,
  11:12, 12:12, 13:13, 14:13, 15:14, 16:14, 17:15, 18:15, 19:15, 20:15,
};

// — Brujo (PHB): 2→…→máx 15 (ojo: Pacto Mágico + Arcanum)
export const WARLOCK_SPELLS_KNOWN = {
  1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:8, 8:9, 9:10, 10:10,
  11:11, 12:11, 13:12, 14:12, 15:13, 16:13, 17:14, 18:14, 19:15, 20:15,
};

// — Bardo (PHB): tabla exacta del PHB
export const BARD_SPELLS_KNOWN = {
  1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:14,
  11:15, 12:15, 13:16, 14:18, 15:19, 16:19, 17:20, 18:22, 19:22, 20:22
};

// — Ranger (PHB): tabla exacta del PHB
export const RANGER_SPELLS_KNOWN = {
  1:0, 2:2, 3:3, 4:3, 5:4, 6:4, 7:5, 8:5, 9:5, 10:6,
  11:6, 12:6, 13:7, 14:7, 15:7, 16:8, 17:8, 18:8, 19:9, 20:9
};

// Map cómodo para consulta genérica:
export const SPELLS_KNOWN_BY_CLASS = {
  hechicero: SORCERER_SPELLS_KNOWN,
  brujo:     WARLOCK_SPELLS_KNOWN,
  bardo:     BARD_SPELLS_KNOWN,
  ranger:    RANGER_SPELLS_KNOWN,
};

/* =========================================================
 * 4) HELPERS
 * ========================================================= */

// Qué tipo de lanzador es cada clase (afecta a slots y nivel máximo)
export const CASTER_TYPE = {
  bardo: 'full',
  clerigo: 'full',
  druida: 'full',
  hechicero: 'full',
  mago: 'full',
  paladin: 'half',
  ranger: 'half',
  brujo: 'pact',
  barbaro: 'none',
  guerrero: 'none',
  monje: 'none',
  picaro: 'none',
};

// Devuelve array de espacios por nivel de conjuro (o info de Pacto)
export function getSpellSlots(className, level) {
  const type = CASTER_TYPE[className];
  if (type === 'full')  return FULL_CASTER_SLOTS[level] || FULL_CASTER_SLOTS[1];
  if (type === 'half')  return HALF_CASTER_SLOTS[level] || HALF_CASTER_SLOTS[1];
  if (type === 'pact')  return WARLOCK_PACT_SLOTS[level] || WARLOCK_PACT_SLOTS[1]; // {slots,slotLevel}
  return null; // no lanzador
}

// Nivel máximo de conjuro disponible para lanzar (según slots)
export function getHighestSpellLevel(className, level) {
  const type = CASTER_TYPE[className];
  if (type === 'pact') return WARLOCK_PACT_SLOTS[level]?.slotLevel ?? 0;
  const row = getSpellSlots(className, level) || [];
  // posición del último índice con valor > 0
  let hi = 0;
  row.forEach((n, i) => { if (n > 0) hi = i + 1; });
  return hi;
}

// Cantrips conocidos en este nivel
export function getCantripsKnown(className, level) {
  const f = CANTRIPS_KNOWN[className];
  return f ? f(level) : 0;
}

// Hechizos conocidos (para clases de "conocidos"), o null si no aplica
export function getSpellsKnown(className, level) {
  const table = SPELLS_KNOWN_BY_CLASS[className];
  if (!table) return null;
  return table?.[level] ?? null;
}

// Hechizos preparados (si la clase prepara), o null si no aplica
// Debes pasar el modificador de la característica correspondiente.
export function getPreparedSpellsCount(className, level, abilityMod) {
  const rule = PREPARED_RULES[className];
  return rule ? rule(level, abilityMod) : null;
}

// Resumen útil para tu UI
export function getSpellcastingSummary(className, level, abilityMod = 0) {
  const type = CASTER_TYPE[className] || 'none';
  const cantrips = getCantripsKnown(className, level);
  const highest = getHighestSpellLevel(className, level);
  const slots = getSpellSlots(className, level);

  const known = getSpellsKnown(className, level);
  const prepared = getPreparedSpellsCount(className, level, abilityMod);

  const summary = {
    className,
    level,
    casterType: type,
    cantripsKnown: cantrips,
    highestSpellLevel: highest,
    slots, // array de números o {slots,slotLevel} para brujo
    spellsKnown: known,           // solo para bardo/hechicero/brujo/ranger
    preparedSpells: prepared,     // solo para clerigo/druida/paladin/mago
    warlockArcanum: WARLOCK_ARCANUM[level] || [], // p. ej. [6] a nivel 11
  };
  return summary;
}

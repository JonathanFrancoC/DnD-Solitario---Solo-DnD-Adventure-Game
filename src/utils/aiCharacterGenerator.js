// aiCharacterGenerator.js - Servicio para generación de personajes por IA
import { backgroundPersonalities } from './backgroundPersonalities.js';
import { classData, raceData, backgroundData } from '../data/gameData.js';
import { generateRandomName } from './randomNames.js';
import gameSaveService from './gameSaveService.js';

// Mapeo de alineamientos a personalidades
const alignmentPersonalities = {
  'Legal Bueno': {
    traits: ['Respetuoso de la ley', 'Compasivo', 'Responsable', 'Justo', 'Protector'],
    ideals: ['Justicia', 'Orden', 'Bien común', 'Protección', 'Responsabilidad'],
    bonds: ['La comunidad', 'La ley', 'Los inocentes', 'La justicia', 'El orden'],
    flaws: ['Rigidez', 'Inflexibilidad', 'Sobrecarga de responsabilidades', 'Perfeccionismo']
  },
  'Neutral Bueno': {
    traits: ['Amable', 'Generoso', 'Altruista', 'Empático', 'Servicial'],
    ideals: ['Bondad', 'Ayuda mutua', 'Compasión', 'Libertad', 'Igualdad'],
    bonds: ['Los necesitados', 'La familia', 'Los amigos', 'La naturaleza', 'La paz'],
    flaws: ['Ingenuidad', 'Confianza excesiva', 'Auto-sacrificio', 'Indecisión']
  },
  'Caótico Bueno': {
    traits: ['Libre', 'Espontáneo', 'Rebelde', 'Valiente', 'Independiente'],
    ideals: ['Libertad', 'Individualidad', 'Bondad', 'Cambio', 'Justicia personal'],
    bonds: ['La libertad', 'Los oprimidos', 'La aventura', 'Los marginados', 'La justicia'],
    flaws: ['Impulsividad', 'Rebeldía innecesaria', 'Desconfianza de la autoridad', 'Inconsistencia']
  },
  'Legal Neutral': {
    traits: ['Organizado', 'Metódico', 'Eficiente', 'Disciplinado', 'Objetivo'],
    ideals: ['Orden', 'Eficiencia', 'Tradición', 'Lógica', 'Estructura'],
    bonds: ['La organización', 'Las tradiciones', 'La eficiencia', 'El sistema', 'La disciplina'],
    flaws: ['Frialdad', 'Rigidez', 'Falta de empatía', 'Burocratismo']
  },
  'Neutral': {
    traits: ['Equilibrado', 'Adaptable', 'Pragmático', 'Observador', 'Flexible'],
    ideals: ['Equilibrio', 'Pragmatismo', 'Adaptación', 'Neutralidad', 'Armonía'],
    bonds: ['El equilibrio', 'La naturaleza', 'La sabiduría', 'La paz', 'La adaptación'],
    flaws: ['Indecisión', 'Pasividad', 'Falta de compromiso', 'Indiferencia']
  },
  'Caótico Neutral': {
    traits: ['Impredecible', 'Espontáneo', 'Libre', 'Adaptable', 'Independiente'],
    ideals: ['Libertad', 'Cambio', 'Individualidad', 'Espontaneidad', 'Adaptación'],
    bonds: ['La libertad', 'La aventura', 'El cambio', 'La individualidad', 'La espontaneidad'],
    flaws: ['Imprevisibilidad', 'Inconsistencia', 'Falta de planificación', 'Egoísmo']
  },
  'Legal Malvado': {
    traits: ['Manipulador', 'Calculador', 'Autoritario', 'Eficiente', 'Despiadado'],
    ideals: ['Poder', 'Orden', 'Control', 'Eficiencia', 'Dominación'],
    bonds: ['El poder', 'La autoridad', 'El control', 'La eficiencia', 'La dominación'],
    flaws: ['Crueldad', 'Autoritarismo', 'Falta de empatía', 'Manipulación']
  },
  'Neutral Malvado': {
    traits: ['Egoísta', 'Pragmático', 'Despiadado', 'Calculador', 'Indiferente'],
    ideals: ['Poder', 'Supervivencia', 'Eficiencia', 'Control', 'Dominación'],
    bonds: ['El poder', 'La supervivencia', 'El control', 'La eficiencia', 'La dominación'],
    flaws: ['Egoísmo', 'Crueldad', 'Falta de empatía', 'Indiferencia']
  },
  'Caótico Malvado': {
    traits: ['Violento', 'Impredecible', 'Destructivo', 'Rebelde', 'Sádico'],
    ideals: ['Destrucción', 'Caos', 'Libertad', 'Poder', 'Violencia'],
    bonds: ['La destrucción', 'El caos', 'La violencia', 'El poder', 'La rebelión'],
    flaws: ['Violencia', 'Imprevisibilidad', 'Destructividad', 'Sadismo']
  }
};

// Fondos adicionales para villanos y compañeros
const additionalBackgrounds = {
  'asesino': {
    name: 'Asesino',
    skills: ['Sigilo', 'Engaño'],
    equipment: ['Dagas (2)', 'Ropa oscura', 'Herramientas de ladrón', 'Veneno básico', 'Dinero (20 po)'],
    personalityTraits: [
      'Siempre tengo un plan de escape.',
      'Mantengo la compostura bajo presión.',
      'Confío más en contactos que en autoridades.',
      'Prefiero las sombras a los focos.',
      'Evalúo una habitación buscando vías y amenazas.',
      'Hablo poco y observo mucho.',
      'Pongo precio a casi todo.',
      'Me gusta el humor ácido en momentos tensos.'
    ],
    ideals: [
      'Honor. No traiciono a quien comparte mi oficio.',
      'Libertad. Romper cadenas es un deber.',
      'Compasión. Los débiles necesitan alguien duro a su lado.',
      'Justicia. Ojo por ojo con los abusadores.',
      'Cambio. Una ciudad se renueva desde sus bajos fondos.',
      'Aspiración. Lideraré mi propio gremio.'
    ],
    bonds: [
      'Mi banda es mi familia.',
      'Guardo una lista de favores por cobrar.',
      'Debo proteger a quien me salvó de la horca.',
      'Un barrio me considera su guardián en la sombra.',
      'Jamás abandono a un compañero en el trabajo.',
      'Conservo una insignia de un caso sin resolver.'
    ],
    flaws: [
      'Lo brillante me distrae demasiado.',
      'Golpeo primero, pregunto después.',
      'Improviso y "olvido" los planes.',
      'Tengo un problema profundo con la autoridad.',
      'Confío demasiado en mi reputación.',
      'Subestimo los riesgos cuando huelo ganancias.'
    ]
  },
  'mercenario': {
    name: 'Mercenario',
    skills: ['Atletismo', 'Intimidación'],
    equipment: ['Arma de guerra', 'Armadura de cuero', 'Dinero (30 po)', 'Contrato de trabajo'],
    personalityTraits: [
      'Mantengo el equipo impecable.',
      'Mido el terreno instintivamente.',
      'Sigo órdenes… pero no soy ciego.',
      'Conozco el valor del silencio táctico.',
      'Animo a los demás en momentos duros.',
      'Me levanto antes del alba por costumbre.',
      'No dejo preguntas sin respuesta en el informe.',
      'Respeto rangos aunque no comparta decisiones.'
    ],
    ideals: [
      'Mayor Bien. Lucho por algo más grande que yo.',
      'Responsabilidad. Cumplir órdenes salva vidas.',
      'Independencia. La obediencia también piensa.',
      'Fuerza. La preparación vence a la suerte.',
      'Lealtad. Mi unidad es mi familia.',
      'Honor. Mi palabra pesa como acero.'
    ],
    bonds: [
      'Mi escuadrón me necesita.',
      'Guardo un estandarte de campaña.',
      'Debo a un camarada la vida.',
      'Vigilo a la familia de un caído.',
      'Defiendo una frontera que pocos miran.',
      'Una promesa hecha en el frente me guía.'
    ],
    flaws: [
      'Me cuesta dejar la disciplina… incluso en fiesta.',
      'Soy impaciente con la incompetencia.',
      'Subestimo a civiles en combate.',
      'Guardo rencores de guerra.',
      'Me vuelvo temerario para proteger a otros.',
      'Obedezco incluso cuando debería cuestionar.'
    ]
  },
  'cultista': {
    name: 'Cultista',
    skills: ['Religión', 'Engaño'],
    equipment: ['Símbolo del culto', 'Vestiduras oscuras', 'Incienso', 'Dinero (15 po)'],
    personalityTraits: [
      'Hablo con solemnidad y midiendo cada palabra.',
      'Soy paciente incluso cuando otros pierden la calma.',
      'Procuro ver la chispa de bondad en cualquiera.',
      'Respeto profundamente la jerarquía religiosa.',
      'Busco señales y presagios en lo cotidiano.',
      'Siempre tengo una parábola lista para ilustrar algo.',
      'Tolero otras creencias, pero defiendo la mía con firmeza.',
      'Me esfuerzo por ser un ejemplo de mi fe.'
    ],
    ideals: [
      'Tradición. Las costumbres sagradas nos sostienen.',
      'Caridad. Ayudar a los necesitados es una obligación.',
      'Cambio. El mundo mejora con pequeños actos constantes.',
      'Poder. Aspiro a guiar a mi congregación algún día.',
      'Fe. Confío en la guía divina por encima de todo.',
      'Aspiración. Debo ser digno del favor de mi deidad.'
    ],
    bonds: [
      'Mi templo es mi hogar y mi deber.',
      'Protejo a mis compañeros de orden a cualquier costo.',
      'Debo la vida a un milagro; vivo para retribuirlo.',
      'Guardo un texto sagrado que no debe perderse.',
      'Prometí llevar consuelo a quien sufre.',
      'Un anciano sacerdote me formó; honro su legado.'
    ],
    flaws: [
      'Me cuesta aceptar otras doctrinas.',
      'Confío demasiado en los de mi fe.',
      'Soy inflexible cuando creo tener razón moral.',
      'Desconfío de los extraños por instinto.',
      'Me aferro a planes "por voluntad divina" aunque sean imprudentes.',
      'Me culpo en exceso por mis errores.'
    ]
  },
  'guardia': {
    name: 'Guardia',
    skills: ['Percepción', 'Atletismo'],
    equipment: ['Alabarda', 'Armadura de cuero', 'Insignia de guardia', 'Dinero (10 po)'],
    personalityTraits: [
      'Mantengo el equipo impecable.',
      'Mido el terreno instintivamente.',
      'Sigo órdenes… pero no soy ciego.',
      'Conozco el valor del silencio táctico.',
      'Animo a los demás en momentos duros.',
      'Me levanto antes del alba por costumbre.',
      'No dejo preguntas sin respuesta en el informe.',
      'Respeto rangos aunque no comparta decisiones.'
    ],
    ideals: [
      'Mayor Bien. Lucho por algo más grande que yo.',
      'Responsabilidad. Cumplir órdenes salva vidas.',
      'Independencia. La obediencia también piensa.',
      'Fuerza. La preparación vence a la suerte.',
      'Lealtad. Mi unidad es mi familia.',
      'Honor. Mi palabra pesa como acero.'
    ],
    bonds: [
      'Mi escuadrón me necesita.',
      'Guardo un estandarte de campaña.',
      'Debo a un camarada la vida.',
      'Vigilo a la familia de un caído.',
      'Defiendo una frontera que pocos miran.',
      'Una promesa hecha en el frente me guía.'
    ],
    flaws: [
      'Me cuesta dejar la disciplina… incluso en fiesta.',
      'Soy impaciente con la incompetencia.',
      'Subestimo a civiles en combate.',
      'Guardo rencores de guerra.',
      'Me vuelvo temerario para proteger a otros.',
      'Obedezco incluso cuando debería cuestionar.'
    ]
  },
  'curandero': {
    name: 'Curandero',
    skills: ['Medicina', 'Perspicacia'],
    equipment: ['Kit de medicina', 'Hierbas medicinales', 'Dinero (20 po)', 'Libro de remedios'],
    personalityTraits: [
      'Soy paciente incluso cuando otros pierden la calma.',
      'Procuro ver la chispa de bondad en cualquiera.',
      'Busco señales y presagios en lo cotidiano.',
      'Siempre tengo una parábola lista para ilustrar algo.',
      'Tolero otras creencias, pero defiendo la mía con firmeza.',
      'Me esfuerzo por ser un ejemplo de mi fe.',
      'Valoro el trabajo bien hecho por encima del aplauso.',
      'Me gusta enseñar mi oficio a aprendices.'
    ],
    ideals: [
      'Caridad. Ayudar a los necesitados es una obligación.',
      'Cambio. El mundo mejora con pequeños actos constantes.',
      'Trabajo. La excelencia se forja día a día.',
      'Comunidad. El gremio eleva la ciudad.',
      'Compartir. El conocimiento crece al repartirse.',
      'Autosuficiencia. Aprender para depender menos.'
    ],
    bonds: [
      'Debo la vida a un milagro; vivo para retribuirlo.',
      'Prometí llevar consuelo a quien sufre.',
      'Un cliente fiel me salvó de la ruina.',
      'Un aprendiz depende de mi guía.',
      'Un encargo prestigioso puede consagrarme.',
      'Prometí educar a mentes jóvenes.'
    ],
    flaws: [
      'Me cuesta aceptar otras doctrinas.',
      'Confío demasiado en los de mi fe.',
      'Soy inflexible cuando creo tener razón moral.',
      'Desconfío de los extraños por instinto.',
      'Me aferro a planes "por voluntad divina" aunque sean imprudentes.',
      'Me culpo en exceso por mis errores.'
    ]
  }
};

class AICharacterGenerator {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
  }

  /**
   * Genera un personaje aleatorio con personalidad basada en alineamiento
   */
  generateRandomCharacter(role = 'companion', alignment = null) {
    // Arrays de opciones disponibles
    const races = Object.keys(raceData);
    const classes = Object.keys(classData);
    const allBackgrounds = { ...backgroundData, ...additionalBackgrounds };
    const backgrounds = Object.keys(allBackgrounds);
    
    const alignments = [
      'Legal Bueno', 'Neutral Bueno', 'Caótico Bueno',
      'Legal Neutral', 'Neutral', 'Caótico Neutral',
      'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado'
    ];
    
    // Seleccionar aleatoriamente
    const randomRace = races[Math.floor(Math.random() * races.length)];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const randomAlignment = alignment || alignments[Math.floor(Math.random() * alignments.length)];
    const isMale = Math.random() > 0.5;
    
    // Generar nombre basado en raza y género
    const firstName = generateRandomName(randomRace, isMale ? 'masculino' : 'femenino');
    const lastNames = ['Blackwood', 'Stormwind', 'Ironheart', 'Shadowbane', 'Brightblade', 'Darkmoon', 'Fireforge', 'Goldleaf', 'Holloway', 'Lightbringer', 'Moonwhisper', 'Nightshade', 'Oakheart', 'Proudspire', 'Quickwind', 'Ravenclaw', 'Silverhand', 'Thunderborn', 'Voidwalker', 'Whitefang'];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Obtener estadísticas recomendadas de la clase
    const recommendedStats = classData[randomClass]?.recommendedStats || {
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
    };
    
    // Obtener datos de la raza para aplicar modificadores
    const raceModifiers = raceData[randomRace]?.abilityScoreIncrease || {};
    
    // Aplicar modificadores raciales a las estadísticas recomendadas
    const finalStats = {
      strength: recommendedStats.strength + (raceModifiers.strength || 0),
      dexterity: recommendedStats.dexterity + (raceModifiers.dexterity || 0),
      constitution: recommendedStats.constitution + (raceModifiers.constitution || 0),
      intelligence: recommendedStats.intelligence + (raceModifiers.intelligence || 0),
      wisdom: recommendedStats.wisdom + (raceModifiers.wisdom || 0),
      charisma: recommendedStats.charisma + (raceModifiers.charisma || 0)
    };
    
    // Calcular HP inicial basado en la clase
    const hitDie = classData[randomClass]?.hitDie || 'd8';
    const constitutionModifier = Math.floor((finalStats.constitution - 10) / 2);
    const initialHP = Math.max(1, parseInt(hitDie.replace('d', '')) + constitutionModifier);
    
    // Obtener habilidades del trasfondo
    const backgroundSkills = allBackgrounds[randomBackground]?.skills || [];
    
    // Obtener salvaciones de la clase
    const classSavingThrows = classData[randomClass]?.savingThrows || [];
    
    // Obtener opciones de habilidades de la clase
    const classSkillData = classData[randomClass]?.skillOptions || { choose: 2, from: [] };
    
    // Seleccionar habilidades de clase aleatoriamente
    const availableClassSkills = [...classSkillData.from];
    const selectedClassSkills = [];
    for (let i = 0; i < classSkillData.choose && availableClassSkills.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableClassSkills.length);
      selectedClassSkills.push(availableClassSkills[randomIndex]);
      availableClassSkills.splice(randomIndex, 1);
    }
    
    // Generar personalidad basada en alineamiento y trasfondo
    const personality = this.generateAlignmentBasedPersonality(randomAlignment, randomBackground);
    
    // Crear el personaje
    const character = {
      // Información básica
      name: `${firstName} ${lastName}`,
      class: randomClass,
      level: 1,
      edition: '5e-2014',
      background: randomBackground,
      playerName: role === 'villain' ? 'IA_Villano' : 'IA_Companion',
      race: randomRace,
      alignment: randomAlignment,
      experience: 0,
      role: role, // 'companion' o 'villain'
      
      // Características
      strength: finalStats.strength,
      dexterity: finalStats.dexterity,
      constitution: finalStats.constitution,
      intelligence: finalStats.intelligence,
      wisdom: finalStats.wisdom,
      charisma: finalStats.charisma,
      
      // Combate
      armorClass: 10 + Math.floor((finalStats.dexterity - 10) / 2),
      initiative: Math.floor((finalStats.dexterity - 10) / 2),
      speed: 30,
      maxHitPoints: initialHP,
      currentHitPoints: initialHP,
      tempHP: 0,
      hitDice: `1${hitDie}`,
      hitDiceTotal: 1,
      
      // Proficiencias
      proficiencyBonus: 2,
      inspiration: false,
      
      // Salvaciones
      savingThrows: {
        strength: { proficient: false, modifier: Math.floor((finalStats.strength - 10) / 2) },
        dexterity: { proficient: false, modifier: Math.floor((finalStats.dexterity - 10) / 2) },
        constitution: { proficient: false, modifier: Math.floor((finalStats.constitution - 10) / 2) },
        intelligence: { proficient: false, modifier: Math.floor((finalStats.intelligence - 10) / 2) },
        wisdom: { proficient: false, modifier: Math.floor((finalStats.wisdom - 10) / 2) },
        charisma: { proficient: false, modifier: Math.floor((finalStats.charisma - 10) / 2) }
      },
      
      // Habilidades
      skills: {
        acrobatics: { proficient: false, modifier: Math.floor((finalStats.dexterity - 10) / 2) },
        animalHandling: { proficient: false, modifier: Math.floor((finalStats.wisdom - 10) / 2) },
        arcana: { proficient: false, modifier: Math.floor((finalStats.intelligence - 10) / 2) },
        athletics: { proficient: false, modifier: Math.floor((finalStats.strength - 10) / 2) },
        deception: { proficient: false, modifier: Math.floor((finalStats.charisma - 10) / 2) },
        history: { proficient: false, modifier: Math.floor((finalStats.intelligence - 10) / 2) },
        insight: { proficient: false, modifier: Math.floor((finalStats.wisdom - 10) / 2) },
        intimidation: { proficient: false, modifier: Math.floor((finalStats.charisma - 10) / 2) },
        investigation: { proficient: false, modifier: Math.floor((finalStats.intelligence - 10) / 2) },
        medicine: { proficient: false, modifier: Math.floor((finalStats.wisdom - 10) / 2) },
        nature: { proficient: false, modifier: Math.floor((finalStats.intelligence - 10) / 2) },
        perception: { proficient: false, modifier: Math.floor((finalStats.wisdom - 10) / 2) },
        performance: { proficient: false, modifier: Math.floor((finalStats.charisma - 10) / 2) },
        persuasion: { proficient: false, modifier: Math.floor((finalStats.charisma - 10) / 2) },
        religion: { proficient: false, modifier: Math.floor((finalStats.intelligence - 10) / 2) },
        sleightOfHand: { proficient: false, modifier: Math.floor((finalStats.dexterity - 10) / 2) },
        stealth: { proficient: false, modifier: Math.floor((finalStats.dexterity - 10) / 2) },
        survival: { proficient: false, modifier: Math.floor((finalStats.wisdom - 10) / 2) }
      },
      
      // Personalidad
      personalityTrait: personality.trait,
      ideal: personality.ideal,
      bond: personality.bond,
      flaw: personality.flaw,
      
      // Otros campos
      features: '',
      equipment: allBackgrounds[randomBackground]?.equipment || [],
      armor: '',
      shield: '',
      weapon1: '',
      weapon2: '',
      otherEquipment: '',
      creationMode: 'ai_generated',
      personalityMode: 'alignment_based',
      
      // Ataques
      attacks: [
        { name: '', bonus: '', damage: '' },
        { name: '', bonus: '', damage: '' },
        { name: '', bonus: '', damage: '' }
      ],
      
      // Conjuros
      cantrips: [],
      spells: [],
      mechanics: {},
      deathSaves: { successes: 0, failures: 0 },
      
      // Campos para la Hoja 2 (Historia)
      age: Math.floor(Math.random() * 80) + 20,
      eyes: ['Azules', 'Verdes', 'Marrones', 'Grises', 'Negros'][Math.floor(Math.random() * 5)],
      height: Math.floor(Math.random() * 30) + 150 + ' cm',
      skin: ['Clara', 'Morena', 'Oscura', 'Pálida', 'Bronceada'][Math.floor(Math.random() * 5)],
      weight: Math.floor(Math.random() * 40) + 50 + ' kg',
      hair: ['Negro', 'Marrón', 'Rubio', 'Pelirrojo', 'Gris'][Math.floor(Math.random() * 5)],
      allies: '',
      allies2: '',
      backstory: this.generateBackstory(role, randomAlignment, randomBackground, firstName, lastName),
      extraTraits: '',
      treasure: 'Monedas de cobre, una piedra brillante',
      appearance: this.generateAppearance(randomRace, randomClass, randomBackground),
      
      // Campos para la Hoja 3 (Conjuros)
      spellSlots: { 1: { total: 2, used: 0 } },
      
      // Metadatos de generación
      generatedAt: new Date().toISOString(),
      generatedBy: 'ai_character_generator',
      aiNotes: this.generateAINotes(role, randomAlignment, randomBackground)
    };
    
    // Marcar las salvaciones de la clase como proficientes
    classSavingThrows.forEach(savingThrow => {
      if (character.savingThrows[savingThrow]) {
        character.savingThrows[savingThrow].proficient = true;
        character.savingThrows[savingThrow].modifier = Math.floor((finalStats[savingThrow] - 10) / 2) + 2;
      }
    });
    
    // Marcar las habilidades de clase como proficientes
    selectedClassSkills.forEach(skill => {
      const skillKey = this.getSkillKey(skill);
      if (skillKey && character.skills[skillKey]) {
        character.skills[skillKey].proficient = true;
        character.skills[skillKey].modifier = Math.floor((finalStats[this.getAbilityForSkill(skillKey)] - 10) / 2) + 2;
      }
    });
    
    // Marcar las habilidades del trasfondo como proficientes
    backgroundSkills.forEach(skill => {
      const skillKey = this.getSkillKey(skill);
      if (skillKey && character.skills[skillKey]) {
        character.skills[skillKey].proficient = true;
        character.skills[skillKey].modifier = Math.floor((finalStats[this.getAbilityForSkill(skillKey)] - 10) / 2) + 2;
      }
    });
    
    return character;
  }

  /**
   * Genera personalidad basada en alineamiento y trasfondo
   */
  generateAlignmentBasedPersonality(alignment, background) {
    const alignmentPersonality = alignmentPersonalities[alignment] || alignmentPersonalities['Neutral'];
    const backgroundPersonality = backgroundPersonalities[background] || additionalBackgrounds[background];
    
    // Combinar rasgos de alineamiento y trasfondo
    const allTraits = [...(alignmentPersonality.traits || []), ...(backgroundPersonality?.personalityTraits || [])];
    const allIdeals = [...(alignmentPersonality.ideals || []), ...(backgroundPersonality?.ideals || [])];
    const allBonds = [...(alignmentPersonality.bonds || []), ...(backgroundPersonality?.bonds || [])];
    const allFlaws = [...(alignmentPersonality.flaws || []), ...(backgroundPersonality?.flaws || [])];
    
    return {
      trait: allTraits[Math.floor(Math.random() * allTraits.length)] || 'Misterioso',
      ideal: allIdeals[Math.floor(Math.random() * allIdeals.length)] || 'Equilibrio',
      bond: allBonds[Math.floor(Math.random() * allBonds.length)] || 'La aventura',
      flaw: allFlaws[Math.floor(Math.random() * allFlaws.length)] || 'Impulsivo'
    };
  }

  /**
   * Genera una historia de fondo para el personaje
   */
  generateBackstory(role, alignment, background, firstName, lastName) {
    const alignmentType = alignment.split(' ')[1]; // 'Bueno', 'Neutral', 'Malvado'
    const lawType = alignment.split(' ')[0]; // 'Legal', 'Neutral', 'Caótico'
    
    let backstory = '';
    
    if (role === 'villain') {
      if (alignmentType === 'Malvado') {
        backstory = `${firstName} ${lastName} nació en circunstancias difíciles y desde temprana edad mostró una inclinación hacia el poder y la dominación. Su trasfondo como ${background} le proporcionó las herramientas necesarias para alcanzar sus objetivos oscuros. Ahora busca expandir su influencia y eliminar cualquier obstáculo en su camino hacia el poder.`;
      } else if (alignmentType === 'Bueno') {
        backstory = `${firstName} ${lastName} es un personaje complejo que cree firmemente en sus ideales de ${alignmentType.toLowerCase()}. Sin embargo, sus métodos para lograr el "bien mayor" han llevado a conflictos con otros. Su trasfondo como ${background} le ha dado una perspectiva única sobre cómo lograr sus objetivos, aunque algunos consideran sus métodos cuestionables.`;
      } else {
        backstory = `${firstName} ${lastName} es un personaje pragmático que actúa según sus propios intereses. Su trasfondo como ${background} le ha enseñado a sobrevivir en un mundo cruel, y ahora busca asegurar su posición a costa de otros si es necesario.`;
      }
    } else { // companion
      if (alignmentType === 'Bueno') {
        backstory = `${firstName} ${lastName} es un aventurero honorable que busca hacer el bien en el mundo. Su trasfondo como ${background} le ha proporcionado las habilidades necesarias para ayudar a otros y luchar por la justicia. Está dispuesto a arriesgar su vida por causas nobles.`;
      } else if (alignmentType === 'Malvado') {
        backstory = `${firstName} ${lastName} es un personaje con un pasado oscuro que busca redención o al menos una oportunidad de cambiar. Su trasfondo como ${background} le ha dado una perspectiva única sobre el mundo, y aunque sus métodos pueden ser cuestionables, sus objetivos actuales pueden alinearse con los del grupo.`;
      } else {
        backstory = `${firstName} ${lastName} es un aventurero pragmático que busca su propio camino en el mundo. Su trasfondo como ${background} le ha enseñado a ser adaptable y a trabajar con otros cuando es beneficioso. No es ni completamente bueno ni malvado, sino que actúa según las circunstancias.`;
      }
    }
    
    return backstory;
  }

  /**
   * Genera una descripción de apariencia
   */
  generateAppearance(race, classType, background) {
    const raceDescriptions = {
      humano: 'De estatura media y complexión variada',
      elfo: 'Alto y esbelto, con rasgos finos y elegantes',
      enano: 'Bajo y robusto, con una constitución fuerte',
      mediano: 'Pequeño y ágil, con rasgos amigables',
      dragonborn: 'Imponente, con rasgos draconianos distintivos',
      gnomo: 'Pequeño y vivaz, con ojos brillantes',
      semielfo: 'Elegante y versátil, combinando rasgos humanos y élficos',
      semiorco: 'Fuerte y musculoso, con rasgos orcos distintivos',
      tiefling: 'Misterioso, con rasgos infernales sutiles'
    };
    
    const classDescriptions = {
      bardo: 'con un aire artístico y carismático',
      barbaro: 'con una presencia intimidante y salvaje',
      guerrero: 'con una postura militar y disciplinada',
      clerigo: 'con un aura de autoridad espiritual',
      druida: 'con una conexión visible con la naturaleza',
      mago: 'con un aire intelectual y misterioso',
      monje: 'con una gracia y disciplina evidentes',
      paladin: 'con una presencia noble y honorable',
      ranger: 'con un aspecto de explorador experimentado',
      picaro: 'con movimientos ágiles y sigilosos',
      hechicero: 'con un aura mágica sutil',
      brujo: 'con una presencia misteriosa y poderosa'
    };
    
    const backgroundDescriptions = {
      acolito: 'Sus vestiduras y símbolos religiosos son prominentes',
      criminal: 'Sus movimientos son cautelosos y calculados',
      heroe: 'Su postura transmite confianza y determinación',
      sabio: 'Sus ojos reflejan sabiduría y curiosidad',
      soldado: 'Su porte militar es evidente en cada movimiento',
      artesano: 'Sus manos muestran el trabajo de su oficio',
      charlatan: 'Su sonrisa es encantadora pero calculada',
      ermitaño: 'Su mirada es profunda y contemplativa',
      noble: 'Su porte aristocrático es inconfundible',
      salvaje: 'Su conexión con la naturaleza es palpable',
      asesino: 'Sus movimientos son fluidos y letales',
      mercenario: 'Su postura es profesional y alerta',
      cultista: 'Su aura es misteriosa y enigmática',
      guardia: 'Su presencia es protectora y vigilante',
      curandero: 'Sus manos son suaves y hábiles'
    };
    
    return `${raceDescriptions[race] || 'De apariencia distintiva'} ${classDescriptions[classType] || ''}, ${backgroundDescriptions[background] || 'con un aspecto único'}.`;
  }

  /**
   * Genera notas para la IA sobre el personaje
   */
  generateAINotes(role, alignment, background) {
    const alignmentType = alignment.split(' ')[1];
    const lawType = alignment.split(' ')[0];
    
    let notes = `Personaje ${role === 'villain' ? 'antagonista' : 'aliado'} generado por IA.\n`;
    notes += `Alineamiento: ${alignment}\n`;
    notes += `Trasfondo: ${background}\n\n`;
    
    if (role === 'villain') {
      notes += `COMPORTAMIENTO COMO VILLANO:\n`;
      if (alignmentType === 'Malvado') {
        notes += `- Actúa de manera egoísta y cruel\n`;
        notes += `- Busca poder y dominación\n`;
        notes += `- No tiene escrúpulos para lograr sus objetivos\n`;
      } else if (alignmentType === 'Bueno') {
        notes += `- Cree que sus acciones son justas\n`;
        notes += `- Puede ser manipulado o convencido\n`;
        notes += `- Sus métodos pueden ser cuestionables pero sus objetivos nobles\n`;
      } else {
        notes += `- Actúa según sus propios intereses\n`;
        notes += `- Puede ser negociado si es beneficioso\n`;
        notes += `- No es inherentemente malvado pero tampoco bueno\n`;
      }
    } else {
      notes += `COMPORTAMIENTO COMO COMPAÑERO:\n`;
      if (alignmentType === 'Bueno') {
        notes += `- Leal y confiable\n`;
        notes += `- Actúa por el bien común\n`;
        notes += `- Puede ser idealista pero bienintencionado\n`;
      } else if (alignmentType === 'Malvado') {
        notes += `- Puede tener un pasado oscuro\n`;
        notes += `- Busca redención o cambio\n`;
        notes += `- Puede ser leal al grupo pero con métodos cuestionables\n`;
      } else {
        notes += `- Pragmático y adaptable\n`;
        notes += `- Actúa según las circunstancias\n`;
        notes += `- Puede ser confiable pero no idealista\n`;
      }
    }
    
    notes += `\nESTRATEGIA DE COMBATE:\n`;
    notes += `- Adaptar tácticas según su clase y trasfondo\n`;
    notes += `- Considerar su alineamiento en decisiones tácticas\n`;
    notes += `- Mantener coherencia con su personalidad\n`;
    
    return notes;
  }

  /**
   * Función helper para convertir nombres de habilidades a claves
   */
  getSkillKey(skillName) {
    const skillMap = {
      'Acrobacias': 'acrobatics',
      'Atletismo': 'athletics',
      'C. Arcano': 'arcana',
      'Engaño': 'deception',
      'Historia': 'history',
      'Perspicacia': 'insight',
      'Intimidación': 'intimidation',
      'Investigación': 'investigation',
      'Medicina': 'medicine',
      'Naturaleza': 'nature',
      'Percepción': 'perception',
      'Interpretación': 'performance',
      'Persuasión': 'persuasion',
      'Religión': 'religion',
      'Juego de Manos': 'sleightOfHand',
      'Sigilo': 'stealth',
      'Supervivencia': 'survival',
      'T. con Animales': 'animalHandling'
    };
    return skillMap[skillName];
  }

  /**
   * Función helper para obtener la habilidad base de una skill
   */
  getAbilityForSkill(skillKey) {
    const skillAbilityMap = {
      'acrobatics': 'dexterity',
      'animalHandling': 'wisdom',
      'arcana': 'intelligence',
      'athletics': 'strength',
      'deception': 'charisma',
      'history': 'intelligence',
      'insight': 'wisdom',
      'intimidation': 'charisma',
      'investigation': 'intelligence',
      'medicine': 'wisdom',
      'nature': 'intelligence',
      'perception': 'wisdom',
      'performance': 'charisma',
      'persuasion': 'charisma',
      'religion': 'intelligence',
      'sleightOfHand': 'dexterity',
      'stealth': 'dexterity',
      'survival': 'wisdom'
    };
    return skillAbilityMap[skillKey] || 'strength';
  }

  /**
   * Guarda un personaje generado por IA en la carpeta correspondiente
   */
  async saveAICharacter(character, campaignId) {
    try {
      if (!this.isElectron) {
        console.log('No estamos en Electron, guardando en localStorage');
        return this.saveAICharacterLocalStorage(character, campaignId);
      }

      if (!campaignId) {
        throw new Error('Se requiere un ID de campaña para guardar el personaje');
      }

      // Determinar la carpeta de destino según el rol
      const folderName = character.role === 'villain' ? 'villains' : 'companions';
      
      // Generar un ID único para el personaje
      const characterId = `${character.role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      character.id = characterId;
      
      // Guardar usando el gameSaveService
      if (character.role === 'villain') {
        await gameSaveService.saveVillain(character, campaignId);
      } else {
        await gameSaveService.saveCompanion(character, campaignId);
      }
      
      console.log('🎭 PERSONAJE DE IA GENERADO Y GUARDADO:');
      console.log('   👤 Nombre:', character.name);
      console.log('   🎭 Clase:', character.class);
      console.log('   🏃 Raza:', character.race);
      console.log('   ⚖️ Alineamiento:', character.alignment);
      console.log('   📚 Trasfondo:', character.background);
      console.log('   🎯 Rol:', character.role);
      console.log('   🆔 ID:', character.id);
      console.log('   📁 Campaña:', campaignId);
      console.log('   📂 Archivo:', `${character.role === 'villain' ? 'villains.json' : 'companions.json'}`);
      return character;
      
    } catch (error) {
      console.error('Error guardando personaje de IA:', error);
      throw error;
    }
  }

  /**
   * Guarda un personaje en localStorage (fallback para web)
   */
  saveAICharacterLocalStorage(character, campaignId) {
    try {
      const storageKey = `ai_character_${character.role}_${campaignId}_${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(character));
      console.log(`Personaje ${character.role} guardado en localStorage:`, character.name);
      return character;
    } catch (error) {
      console.error('Error guardando personaje en localStorage:', error);
      throw error;
    }
  }

  /**
   * Genera múltiples personajes de una vez
   */
  async generateMultipleCharacters(count, role, campaignId, alignment = null) {
    const characters = [];
    
    for (let i = 0; i < count; i++) {
      const character = this.generateRandomCharacter(role, alignment);
      await this.saveAICharacter(character, campaignId);
      characters.push(character);
    }
    
    return characters;
  }
}

// Exportar una instancia singleton
const aiCharacterGenerator = new AICharacterGenerator();
export default aiCharacterGenerator;

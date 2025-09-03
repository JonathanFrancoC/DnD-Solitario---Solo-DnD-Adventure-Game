import React from 'react';
import classesData from '../../../data/classes.json';
import { getAllSubclassActions, getAllSubclassFeaturesAt } from '../../../utils/classSchemaUtils.js';
import { getAllFeats, calculateActiveFeatBenefits } from '../../../utils/featUtils.js';
import { commonClassActions } from '../../../utils/classActionsUtils.js';
import { 
  barbarianMechanics, 
  druidMechanics, 
  monkMechanics, 
  sorcererMechanics, 
  warlockMechanics, 
  fighterMechanics, 
  paladinMechanics, 
  rogueMechanics, 
  bardMechanics, 
  clericMechanics, 
  wizardMechanics, 
  rangerMechanics 
} from '../../../data/classMechanics.js';

export default function CorePage({ data, onChange, locked = false, onSaveCharacter, onDeleteCharacter }) {
  const ro = { background:'#f0f0f0', cursor:'not-allowed' }; // campos de solo lectura
  
  // Calcular beneficios de dotes una sola vez para optimizar
  const featBenefits = calculateActiveFeatBenefits(data);
  
  // Función para calcular modificador de característica
  const getModifier = (score) => {
    const modifier = Math.floor((Number(score || 0) - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  // Función para calcular iniciativa con beneficios de dotes
  const getInitiativeTotal = () => {
    const dexMod = Math.floor((Number(data.dexterity || 10) - 10) / 2);
    const totalInitiative = dexMod + featBenefits.initiativeBonus;
    return totalInitiative;
  };

  // Función para calcular CA con beneficios de dotes
  const getArmorClassTotal = () => {
    const baseAC = data.armorClass || 10;
    return baseAC + featBenefits.armorClassBonus;
  };

  // Función para calcular velocidad con beneficios de dotes
  const getSpeedTotal = () => {
    const baseSpeed = data.speed || 30;
    return baseSpeed + featBenefits.speedBonus;
  };

  // Función para calcular PG máximos con beneficios de dotes
  const getMaxHPTotal = () => {
    const baseMaxHP = data.maxHP || 10;
    return baseMaxHP + featBenefits.maxHPBonus;
  };

  // Función para calcular total de habilidad
  const getSkillTotal = (skillKey, abilityKey) => {
    const skill = data.skills?.[skillKey];
    const abilityMod = Math.floor((Number(data[abilityKey] || 0) - 10) / 2);
    const isProficient = skill?.proficient || false;
    return isProficient ? abilityMod + Number(data.proficiencyBonus || 2) : abilityMod;
  };

  // Función para calcular total de salvación
  const getSavingThrowTotal = (abilityName) => {
    const savingThrow = data.savingThrows?.[abilityName];
    const abilityMod = Math.floor((Number(data[abilityName] || 0) - 10) / 2);
    const isProficient = savingThrow?.proficient || false;
    return isProficient ? abilityMod + Number(data.proficiencyBonus || 2) : abilityMod;
  };

  // Función para formatear el total (con + o -)
  const formatTotal = (total) => {
    return total >= 0 ? `+${total}` : `${total}`;
  };

  // PB por nivel (2014)
  const proficiencyBonus = (lvl = 1) => 2 + Math.floor((Math.max(1, lvl) - 1) / 4);
  // mod de característica
  const abilMod = (score = 10) => Math.floor((Number(score) - 10) / 2);

  /**
   * Devuelve el "recurso primario" de la clase (nombre, máximo, nota)
   * Soporta todas las clases principales de D&D 5e
   */
  const getPrimaryClassResource = (data) => {
    const cls = String(data.class || '').toLowerCase();
    const lvl = Number(data.level || 1);

    // BÁRBARO - Furia
    if (cls === 'barbaro') {
      const max = barbarianMechanics?.rage?.uses?.[lvl] ?? 2;
      return { key: 'rage', label: 'Furia', max, note: 'Se recupera con descanso largo' };
    }

    // DRUIDA - Forma Salvaje
    if (cls === 'druida') {
      const max = druidMechanics?.wildShape?.uses?.[lvl] ?? 2;
      return { key: 'wildShape', label: 'Forma Salvaje', max, note: '2 usos; descanso corto o largo' };
    }

    // MONJE - Ki (sencillo: igual al nivel)
    if (cls === 'monje') {
      return { key: 'ki', label: 'Ki', max: lvl, note: 'Igual a tu nivel de monje' };
    }

    // HECHICERO - Puntos de Hechicería
    if (cls === 'hechicero') {
      return { key: 'sorceryPoints', label: 'Puntos de Hechicería', max: lvl, note: 'Igual a tu nivel de hechicero' };
    }

    // BRUJO - Slots de Pacto (siempre del nivel más alto)
    if (cls === 'brujo') {
      const maxSlots = lvl >= 17 ? 4 : lvl >= 11 ? 3 : lvl >= 5 ? 2 : 1;
      return { key: 'pactMagic', label: 'Slots de Pacto', max: maxSlots, note: 'Se recuperan con descanso corto' };
    }

    // GUERRERO - Segundo Aliento
    if (cls === 'guerrero') {
      return { key: 'secondWind', label: 'Segundo Aliento', max: 1, note: '1d10 + nivel PG; descanso corto/largo' };
    }

    // PALADÍN - Canalizar Divinidad
    if (cls === 'paladin') {
      const max = clericMechanics?.channelDivinity?.uses?.[lvl] ?? 1;
      return { key: 'channelDivinity', label: 'Canalizar Divinidad', max, note: 'Descanso corto o largo' };
    }

    // PÍCARO - No tiene recurso principal, pero podemos mostrar Ataque Furtivo
    if (cls === 'picaro') {
      const sneakDie = rogueMechanics?.sneakAttack?.damage?.[lvl] ?? '1d6';
      return { key: 'sneakAttack', label: 'Ataque Furtivo', max: 1, note: `${sneakDie} daño extra por turno` };
    }

    // BÁRD - Inspiración Bárdica (usando datos de classMechanics)
    if (cls === 'bardo') {
      const max = bardMechanics?.bardicInspiration?.uses?.[lvl] ?? 2;
      const die = bardMechanics?.bardicInspiration?.die?.[lvl] ?? 'd6';
      return { key: 'bardicInspiration', label: 'Inspiración Bárdica', max, note: `${die}; descanso largo` };
    }

    // CLÉRIGO - Canalizar Divinidad
    if (cls === 'clerigo') {
      const max = clericMechanics?.channelDivinity?.uses?.[lvl] ?? 1;
      return { key: 'channelDivinity', label: 'Canalizar Divinidad', max, note: 'Descanso corto o largo' };
    }

    // MAGO - Recuperación Arcana (una vez por día)
    if (cls === 'mago') {
      return { key: 'arcaneRecovery', label: 'Recuperación Arcana', max: 1, note: 'Una vez por día; descanso corto' };
    }

    // RANGER - No tiene recurso principal claro, pero podemos mostrar Enemigo Predilecto
    if (cls === 'ranger') {
      return { key: 'favoredEnemy', label: 'Enemigo Predilecto', max: 1, note: 'Ventaja vs. tipo específico' };
    }

    return null;
  };

  // Función para generar rasgos y atributos automáticamente
  const generateFeaturesAndTraits = (characterData) => {
    const features = [];
    
    // Rasgos de clase
    if (characterData.class) {
      features.push(`=== RASGOS DE CLASE (${characterData.class}) ===`);
      
      // Dado de golpe
      const hitDie = characterData.hitDice || '1d6';
      features.push(`• Dado de Golpe: ${hitDie}`);
      
      // Lanzamiento de conjuros (si aplica)
      if (characterData.spellcasterClass) {
        features.push(`• Lanzamiento de Conjuros (${characterData.spellcasterClass})`);
        features.push(`  - Característica: ${getSpellcastingAbility(characterData.spellcasterClass)}`);
        features.push(`  - CD de Salvación: ${characterData.spellSaveDC || '8 + prof + mod'}`);
        features.push(`  - Bonificador de Ataque: ${characterData.spellAttackBonus || 'prof + mod'}`);
      }
      
      // Salvaciones de clase
      const classSavingThrows = getClassSavingThrows(characterData.class);
      if (classSavingThrows.length > 0) {
        features.push(`• Salvaciones de Clase: ${classSavingThrows.join(', ')}`);
      }
      
      // Habilidades de clase
      const classSkills = getClassSkills(characterData.class);
      if (classSkills.length > 0) {
        features.push(`• Habilidades de Clase: ${classSkills.join(', ')}`);
      }
    }
    
    // Rasgos de raza
    if (characterData.race) {
      features.push(`\n=== RASGOS DE RAZA (${characterData.race}) ===`);
      
      const raceTraits = getRaceTraits(characterData.race);
      raceTraits.forEach(trait => {
        features.push(`• ${trait}`);
      });
      
      // Bonificaciones de característica
      const raceBonuses = getRaceAbilityBonuses(characterData.race);
      if (raceBonuses.length > 0) {
        features.push(`• Bonificaciones: ${raceBonuses.join(', ')}`);
      }
    }
    
    // Rasgos de trasfondo
    if (characterData.background) {
      features.push(`\n=== RASGOS DE TRASFONDO (${characterData.background}) ===`);
      
      const backgroundSkills = getBackgroundSkills(characterData.background);
      if (backgroundSkills.length > 0) {
        features.push(`• Habilidades: ${backgroundSkills.join(', ')}`);
      }
      
      const backgroundTraits = getBackgroundTraits(characterData.background);
      backgroundTraits.forEach(trait => {
        features.push(`• ${trait}`);
      });
    }
    
    // Rasgos de nivel (si hay datos de progresión)
    if (characterData.level && characterData.level > 1) {
      features.push(`\n=== RASGOS DE NIVEL ===`);
      features.push(`• Nivel actual: ${characterData.level}`);
      
      // Aquí se podrían agregar rasgos específicos de nivel
      // basándose en levelProgressionData
    }
    
    // Acciones de subclase (si tiene una)
    if (characterData.subclass && characterData.class) {
      const className = characterData.class.toLowerCase();
      const subclassActions = getAllSubclassActions(classesData.classes, className, characterData.subclass);
      
      if (subclassActions.length > 0) {
        features.push(`\n=== ACCIONES DE SUBCLASE (${characterData.subclass}) ===`);
        
        // Agrupar acciones por categoría
        const actionsByCategory = {};
        subclassActions.forEach(action => {
          if (!actionsByCategory[action.category]) {
            actionsByCategory[action.category] = [];
          }
          actionsByCategory[action.category].push(action);
        });
        
        Object.entries(actionsByCategory).forEach(([category, actions]) => {
          features.push(`\n${category}:`);
          actions.forEach(action => {
            let actionText = `• ${action.name}`;
            if (action.cost) {
              actionText += ` (${action.cost})`;
            }
            if (action.description) {
              actionText += `: ${action.description}`;
            }
            features.push(actionText);
          });
        });
      }
    }
    
    // Características de subclase (si tiene una)
    if (characterData.subclass && characterData.class && characterData.level) {
      const className = characterData.class.toLowerCase();
      const subclassFeatures = getAllSubclassFeaturesAt(classesData.classes, className, characterData.subclass, characterData.level);
      
      if (subclassFeatures.length > 0) {
        features.push(`\n=== CARACTERÍSTICAS DE SUBCLASE (${characterData.subclass}) ===`);
        
        // Agrupar características por nivel
        const featuresByLevel = {};
        subclassFeatures.forEach(feature => {
          if (!featuresByLevel[feature.level]) {
            featuresByLevel[feature.level] = [];
          }
          featuresByLevel[feature.level].push(feature);
        });
        
        Object.entries(featuresByLevel).forEach(([level, levelFeatures]) => {
          features.push(`\nNivel ${level}:`);
          levelFeatures.forEach(feature => {
            let featureText = `• ${feature.name}`;
            if (feature.description) {
              featureText += `: ${feature.description}`;
            }
            features.push(featureText);
          });
        });
      }
    }
    
    // Dotes seleccionadas
    if (characterData.feats && characterData.feats.length > 0) {
      features.push(`\n=== DOTES ===`);
      const allFeats = getAllFeats();
      const featBenefits = calculateActiveFeatBenefits(characterData);
      
      characterData.feats.forEach(featId => {
        const feat = allFeats[featId];
        if (feat) {
          features.push(`• ${feat.name}`);
          if (feat.description) {
            features.push(`  ${feat.description}`);
          }
          if (feat.benefits && feat.benefits.length > 0) {
            features.push(`  Beneficios:`);
            feat.benefits.forEach(benefit => {
              features.push(`    - ${benefit}`);
            });
          }
        }
      });

      // Mostrar beneficios activos aplicados
      if (featBenefits.initiativeBonus > 0 || 
          featBenefits.armorClassBonus > 0 || 
          featBenefits.speedBonus > 0 || 
          featBenefits.maxHPBonus > 0 ||
          Object.keys(featBenefits.abilityScoreBonuses).length > 0 ||
          featBenefits.specialTraits.length > 0) {
        
        features.push(`\n=== BENEFICIOS ACTIVOS DE DOTES ===`);
        
        if (featBenefits.initiativeBonus > 0) {
          features.push(`• Iniciativa: +${featBenefits.initiativeBonus}`);
        }
        if (featBenefits.armorClassBonus > 0) {
          features.push(`• Clase de Armadura: +${featBenefits.armorClassBonus}`);
        }
        if (featBenefits.speedBonus > 0) {
          features.push(`• Velocidad: +${featBenefits.speedBonus} pies`);
        }
        if (featBenefits.maxHPBonus > 0) {
          features.push(`• Puntos de Golpe Máximos: +${featBenefits.maxHPBonus}`);
        }
        
        Object.entries(featBenefits.abilityScoreBonuses).forEach(([ability, bonus]) => {
          const abilityNames = {
            'strength': 'Fuerza',
            'dexterity': 'Destreza', 
            'constitution': 'Constitución',
            'intelligence': 'Inteligencia',
            'wisdom': 'Sabiduría',
            'charisma': 'Carisma'
          };
          features.push(`• ${abilityNames[ability]}: +${bonus}`);
        });
        
        if (featBenefits.specialTraits.length > 0) {
          features.push(`\nRasgos Especiales:`);
          featBenefits.specialTraits.forEach(trait => {
            features.push(`• ${trait}`);
          });
        }
      }
    }
    
    return features.join('\n');
  };

  // Funciones helper para obtener datos
  const getSpellcastingAbility = (className) => {
    const abilities = {
      'mago': 'Inteligencia',
      'hechicero': 'Carisma',
      'brujo': 'Carisma',
      'bardo': 'Carisma',
      'clerigo': 'Sabiduría',
      'druida': 'Sabiduría',
      'paladin': 'Carisma',
      'ranger': 'Sabiduría'
    };
    return abilities[className?.toLowerCase()] || 'Inteligencia';
  };

  const getClassSavingThrows = (className) => {
    const savingThrows = {
      'barbaro': ['Fuerza', 'Constitución'],
      'bardo': ['Destreza', 'Carisma'],
      'clerigo': ['Sabiduría', 'Carisma'],
      'druida': ['Inteligencia', 'Sabiduría'],
      'guerrero': ['Fuerza', 'Constitución'],
      'hechicero': ['Constitución', 'Carisma'],
      'brujo': ['Sabiduría', 'Carisma'],
      'mago': ['Inteligencia', 'Sabiduría'],
      'monje': ['Fuerza', 'Destreza'],
      'paladin': ['Sabiduría', 'Carisma'],
      'picaro': ['Destreza', 'Inteligencia'],
      'ranger': ['Fuerza', 'Destreza']
    };
    return savingThrows[className?.toLowerCase()] || [];
  };

  const getClassSkills = (className) => {
    const skills = {
      'barbaro': ['Atletismo', 'Intimidación', 'Naturaleza', 'Percepción', 'Supervivencia', 'Trato con Animales'],
      'bardo': ['Todas las habilidades'],
      'clerigo': ['Historia', 'Perspicacia', 'Medicina', 'Persuasión', 'Religión'],
      'druida': ['Comprensión Arcana', 'Trato con Animales', 'Perspicacia', 'Medicina', 'Naturaleza', 'Percepción', 'Religión', 'Supervivencia'],
      'guerrero': ['Acrobacias', 'Trato con Animales', 'Atletismo', 'Historia', 'Perspicacia', 'Intimidación', 'Percepción', 'Supervivencia'],
      'hechicero': ['Comprensión Arcana', 'Engaño', 'Perspicacia', 'Intimidación', 'Persuasión', 'Religión'],
      'brujo': ['Comprensión Arcana', 'Engaño', 'Historia', 'Intimidación', 'Investigación', 'Naturaleza', 'Religión'],
      'mago': ['Comprensión Arcana', 'Historia', 'Perspicacia', 'Investigación', 'Medicina', 'Religión'],
      'monje': ['Acrobacias', 'Atletismo', 'Historia', 'Perspicacia', 'Religión', 'Sigilo'],
      'paladin': ['Atletismo', 'Perspicacia', 'Intimidación', 'Medicina', 'Persuasión', 'Religión'],
      'picaro': ['Acrobacias', 'Atletismo', 'Engaño', 'Perspicacia', 'Intimidación', 'Investigación', 'Percepción', 'Interpretación', 'Persuasión', 'Juego de Manos', 'Sigilo'],
      'ranger': ['Trato con Animales', 'Atletismo', 'Perspicacia', 'Investigación', 'Naturaleza', 'Percepción', 'Sigilo', 'Supervivencia']
    };
    return skills[className?.toLowerCase()] || [];
  };

  const getRaceTraits = (raceName) => {
    const traits = {
      'humano': ['Versatilidad', 'Idioma adicional'],
      'elfo': ['Vista en la oscuridad', 'Inmunidad al encantamiento', 'Trance'],
      'enano': ['Vista en la oscuridad', 'Resistencia al veneno', 'Proficiencia con herramientas'],
      'mediano': ['Suerte', 'Valiente', 'Agilidad natural'],
      'dragonborn': ['Aliento de dragón', 'Resistencia al daño'],
      'gnomo': ['Vista en la oscuridad', 'Astucia gnómica'],
      'semielfo': ['Vista en la oscuridad', 'Herencia feérica'],
      'semiorco': ['Vista en la oscuridad', 'Intimidación', 'Resistencia implacable'],
      'tiefling': ['Vista en la oscuridad', 'Resistencia al fuego', 'Herencia infernal']
    };
    return traits[raceName?.toLowerCase()] || [];
  };

  const getRaceAbilityBonuses = (raceName) => {
    const bonuses = {
      'humano': ['+1 a todas las características'],
      'elfo': ['+2 Destreza'],
      'enano': ['+2 Constitución'],
      'mediano': ['+2 Destreza', '+1 Constitución'],
      'dragonborn': ['+2 Fuerza', '+1 Carisma'],
      'gnomo': ['+2 Inteligencia'],
      'semielfo': ['+2 Carisma', '+1 Fuerza', '+1 Constitución'],
      'semiorco': ['+2 Fuerza', '+1 Constitución'],
      'tiefling': ['+2 Carisma', '+1 Inteligencia']
    };
    return bonuses[raceName?.toLowerCase()] || [];
  };

  const getBackgroundSkills = (backgroundName) => {
    const skills = {
      'acolito': ['Perspicacia', 'Religión'],
      'criminal': ['Engaño', 'Sigilo'],
      'heroe': ['Trato con Animales', 'Supervivencia'],
      'sabio': ['Comprensión Arcana', 'Historia'],
      'soldado': ['Atletismo', 'Intimidación'],
      'artesano': ['Perspicacia', 'Persuasión'],
      'charlatan': ['Engaño', 'Juego de Manos'],
      'ermitaño': ['Medicina', 'Religión'],
      'noble': ['Historia', 'Persuasión'],
      'salvaje': ['Atletismo', 'Supervivencia'],
      'marinero': ['Atletismo', 'Percepción'],
      'artista': ['Acrobacias', 'Interpretación'],
      'gamberro': ['Juego de Manos', 'Sigilo']
    };
    return skills[backgroundName?.toLowerCase()] || [];
  };

  const getBackgroundTraits = (backgroundName) => {
    const traits = {
      'acolito': ['Idioma adicional', 'Contacto del templo'],
      'criminal': ['Contacto criminal', 'Herramientas de ladrón'],
      'heroe': ['Idioma adicional', 'Contacto del pueblo'],
      'sabio': ['Idioma adicional', 'Investigador'],
      'soldado': ['Idioma adicional', 'Rango militar'],
      'artesano': ['Idioma adicional', 'Contacto del gremio'],
      'charlatan': ['Idioma adicional', 'Falso identidad'],
      'ermitaño': ['Idioma adicional', 'Descubrimiento'],
      'noble': ['Idioma adicional', 'Posición de privilegio'],
      'salvaje': ['Idioma adicional', 'Origen salvaje'],
      'marinero': ['Idioma adicional', 'Navegador'],
      'artista': ['Idioma adicional', 'Contacto popular'],
      'gamberro': ['Idioma adicional', 'Contacto urbano']
    };
    return traits[backgroundName?.toLowerCase()] || [];
  };

  // Función para obtener acciones de clase
  const getClassActionsForCharacter = (characterData) => {
    if (!characterData.class) return [];
    
    const className = characterData.class.toLowerCase();
    const level = characterData.level || 1;
    const actions = [];
    
    console.log('🔍 DEBUG - getClassActionsForCharacter:', { className, level });
    
    // Obtener acciones comunes de la clase
    const classActions = commonClassActions[className];
    console.log('🔍 DEBUG - classActions disponibles:', classActions);
    
    if (classActions) {
      Object.entries(classActions).forEach(([key, action]) => {
        console.log('🔍 DEBUG - Verificando acción:', key, action);
        if (action.availableAt <= level) {
          actions.push({
            ...action,
            id: key,
            currentUses: characterData.classActions?.[key]?.currentUses || 0,
            maxUses: action.uses === 'Nivel por descanso corto' ? level : 
                    action.uses === 'Nivel × 5 puntos de golpe por descanso largo' ? level * 5 :
                    action.uses === '1 por descanso corto' ? 1 :
                    action.uses === '2 por descanso corto' ? 2 :
                    action.uses === '1 por descanso largo' ? 1 :
                    action.uses === '2 por descanso largo' ? 2 :
                    action.uses === '1 por turno' ? 1 : 0
          });
        }
      });
    }
    
    console.log('🔍 DEBUG - Acciones finales:', actions);
    return actions;
  };

  // Función para generar ataques y conjuros automáticamente
  const generateAttacksAndSpells = (characterData) => {
    const attacks = [];
    
    // Calcular modificadores de ataque
    const strMod = Math.floor((Number(characterData.strength || 10) - 10) / 2);
    const dexMod = Math.floor((Number(characterData.dexterity || 10) - 10) / 2);
    const profBonus = Number(characterData.proficiencyBonus || 2);
    
    // Armas básicas según clase
    if (characterData.class) {
      const className = characterData.class.toLowerCase();
      
      // Armas de clase
      if (['guerrero', 'paladin', 'ranger', 'barbaro'].includes(className)) {
        // Armas marciales
        attacks.push({
          name: 'Espada Larga',
          bonus: `+${profBonus + strMod}`,
          damage: '1d8 + ' + strMod
        });
        attacks.push({
          name: 'Arco Largo',
          bonus: `+${profBonus + dexMod}`,
          damage: '1d8 + ' + dexMod
        });
      } else if (['picaro', 'monje'].includes(className)) {
        // Armas ligeras
        attacks.push({
          name: 'Daga',
          bonus: `+${profBonus + dexMod}`,
          damage: '1d4 + ' + dexMod
        });
        attacks.push({
          name: 'Espada Corta',
          bonus: `+${profBonus + dexMod}`,
          damage: '1d6 + ' + dexMod
        });
      } else if (['mago', 'hechicero', 'brujo', 'bardo'].includes(className)) {
        // Armas simples
        attacks.push({
          name: 'Bastón',
          bonus: `+${profBonus + strMod}`,
          damage: '1d6 + ' + strMod
        });
        attacks.push({
          name: 'Daga',
          bonus: `+${profBonus + dexMod}`,
          damage: '1d4 + ' + dexMod
        });
      } else if (['clerigo', 'druida'].includes(className)) {
        // Armas simples
        attacks.push({
          name: 'Maza',
          bonus: `+${profBonus + strMod}`,
          damage: '1d6 + ' + strMod
        });
        attacks.push({
          name: 'Bastón',
          bonus: `+${profBonus + strMod}`,
          damage: '1d6 + ' + strMod
        });
      }
    }
    
    // Conjuros básicos según clase
    if (characterData.spellcasterClass) {
      const spellClass = characterData.spellcasterClass.toLowerCase();
      
      if (['mago', 'hechicero'].includes(spellClass)) {
        attacks.push({
          name: 'Rayo de Escarcha',
          bonus: `+${profBonus + Math.floor((Number(characterData.intelligence || 10) - 10) / 2)}`,
          damage: '1d10 frío'
        });
        attacks.push({
          name: 'Rociada de Color',
          bonus: `+${profBonus + Math.floor((Number(characterData.intelligence || 10) - 10) / 2)}`,
          damage: 'Cegar (no daño)'
        });
      } else if (['clerigo', 'druida'].includes(spellClass)) {
        attacks.push({
          name: 'Rayo Sagrado',
          bonus: `+${profBonus + Math.floor((Number(characterData.wisdom || 10) - 10) / 2)}`,
          damage: '1d8 radiante'
        });
        attacks.push({
          name: 'Llamarada Sagrada',
          bonus: `+${profBonus + Math.floor((Number(characterData.wisdom || 10) - 10) / 2)}`,
          damage: '1d8 fuego'
        });
      } else if (['bardo', 'brujo'].includes(spellClass)) {
        attacks.push({
          name: 'Rayo de Escarcha',
          bonus: `+${profBonus + Math.floor((Number(characterData.charisma || 10) - 10) / 2)}`,
          damage: '1d10 frío'
        });
        attacks.push({
          name: 'Rayo de Fuego',
          bonus: `+${profBonus + Math.floor((Number(characterData.charisma || 10) - 10) / 2)}`,
          damage: '1d10 fuego'
        });
      }
    }
    
    // Rellenar con espacios vacíos si no hay suficientes ataques
    while (attacks.length < 3) {
      attacks.push({
        name: '',
        bonus: '',
        damage: ''
      });
    }
    
    return attacks.slice(0, 3); // Solo mostrar 3 ataques
  };

  return (
    <div className={locked ? 'locked' : ''} style={{ padding: '16px', position:'relative' }}>

      {/* Cinta visual de "Vista previa (bloqueado)" */}
      {locked && (
        <div style={{ 
          position: 'absolute', 
          top: '-16px', 
          right: '8px', 
          padding: '6px 10px', 
          border: '2px solid #222', 
          borderRadius: '8px', 
          background: '#fff', 
          fontWeight: '700',
          fontSize: '12px',
          color: '#333',
          zIndex: 1000,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          🔒 Vista previa (bloqueado)
        </div>
      )}
      <fieldset disabled={locked} style={{ border:0, padding:0, margin:0 }}>
        {/* CABECERA */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '40% 60%', 
          gap: '16px', 
          marginBottom: '20px',
          padding: '16px',
          border: '2px solid #000',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
         {/* NOMBRE DEL PERSONAJE*/}
         <div>
           <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
             Nombre del Personaje
           </label>
                      <input 
              value={data.name || ''}
              onChange={e => onChange('name', e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '2px solid #000', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#fff' }}
            />
         </div>
         
         {/* 60% DERECHA - 2 renglones con 3 recuadros cada uno */}
         <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '8px' }}>
           {/* PRIMER RENGLÓN - 3 recuadros */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
             <div>
               <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                 Clase
               </label>
                              <input 
                  value={data.class || ''}
                  onChange={e => onChange('class', e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                  Nivel
                </label>
                <input 
                  value={data.level || 1}
                  onChange={e => onChange('level', parseInt(e.target.value) || 1)}
                  type="number"
                  min="1"
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                  Trasfondo
                </label>
                <input 
                  value={data.background || ''}
                  onChange={e => onChange('background', e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                />
              </div>
            </div>
            
            {/* SEGUNDO RENGLÓN - 3 recuadros */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                  Jugador
                </label>
                <input 
                  value={data.playerName || ''}
                  onChange={e => onChange('playerName', e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                  Raza
                </label>
                <input 
                  value={data.race || ''}
                  onChange={e => onChange('race', e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                  Alineamiento
                </label>
                <input 
                  value={data.alignment || ''}
                  onChange={e => onChange('alignment', e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                />
             </div>
           </div>
         </div>
       </div>

       {/* LAYOUT PRINCIPAL - 3 COLUMNAS */}
       <div style={{ 
         display: 'grid', 
         gridTemplateColumns: '1fr 1fr 1fr', 
         gap: '20px', 
         marginBottom: '20px'
       }}>
         
         {/* COLUMNA IZQUIERDA - Atributos a la izquierda, resto a la derecha */}
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
           
                                                                                       {/* ATRIBUTOS - Columna vertical a la izquierda */}
              <div style={{ 
                padding: '12px',
                border: '2px solid #000',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Características</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(ability => (
                  <div key={ability} style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
                      {ability === 'strength' ? 'FUERZA' : 
                       ability === 'dexterity' ? 'DESTREZA' :
                       ability === 'constitution' ? 'CONSTITUCIÓN' :
                       ability === 'intelligence' ? 'INTELIGENCIA' :
                       ability === 'wisdom' ? 'SABIDURÍA' : 'CARISMA'}
                    </label>
                      <div style={{ 
                       width: '60px', 
                       height: '60px', 
                       borderRadius: '50%',
                       border: '2px solid #333',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       margin: '0 auto 6px auto',
                       backgroundColor: '#fff',
                       position: 'relative'
                     }}>
                      <input 
                        value={data[ability] || 10}
                        onChange={e => onChange(ability, parseInt(e.target.value) || 10)}
                        type="number"
                        style={{ 
                          width: '100%',
                          height: '100%',
                          textAlign: 'center', 
                          fontSize: '16px',
                          fontWeight: 'bold',
                          border: 'none',
                          background: 'transparent',
                          outline: 'none'
                        }}
                      />
                                             {featBenefits.abilityScoreBonuses[ability] > 0 && (
                         <div style={{ 
                           position: 'absolute', 
                           top: '-8px', 
                           right: '-8px', 
                           background: '#9C27B0', 
                           color: 'white', 
                           borderRadius: '50%', 
                           width: '16px', 
                           height: '16px', 
                           fontSize: '10px', 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'center',
                           fontWeight: 'bold'
                         }}>
                           +{featBenefits.abilityScoreBonuses[ability]}
                         </div>
                       )}
                    </div>
                    <div style={{ 
                      backgroundColor: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '2px solid #000',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      minWidth: '40px'
                    }}>
                      {getModifier(data[ability])}
                    </div>
                  </div>
                ))}
              </div>
            </div>

           {/* COLUMNA DERECHA - Inspiración, Bono, Salvaciones, Habilidades */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             
                                                                                                       {/* INSPIRACIÓN Y BONO DE COMPETENCIA */}
                <div style={{ 
                  padding: '12px',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                   <div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <input 
                         type="checkbox"
                         checked={data.inspiration || false}
                         onChange={e => onChange('inspiration', e.target.checked)}
                         style={{ transform: 'scale(1.2)' }}
                       />
                       <label style={{ fontWeight: 'bold', fontSize: '12px' }}>
                         Inspiración
                       </label>
                     </div>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
                       Bonificador de Competencia
                     </label>
                                         <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold',
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        padding: '6px',
                        borderRadius: '4px',
                        border: '2px solid #000'
                      }}>
                       +{data.proficiencyBonus || 2}
                     </div>
                   </div>
                 </div>
               </div>

                                                                                                                                                    {/* SALVACIONES */}
              <div style={{ 
                padding: '12px',
                border: '2px solid #000',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
               <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '12px' }}>Tiradas de Salvación</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
                 {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(ability => (
                   <div key={ability} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <div 
                       className="clickable"
                       style={{ 
                         width: '12px', 
                         height: '12px', 
                         borderRadius: '50%',
                         border: '2px solid #333',
                         backgroundColor: data.savingThrows?.[ability]?.proficient ? '#333' : '#fff',
                         cursor: locked ? 'default' : 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center'
                       }}
                       onClick={locked ? undefined : () => onChange(`savingThrows.${ability}.proficient`, !data.savingThrows?.[ability]?.proficient)}
                     >
                       {data.savingThrows?.[ability]?.proficient && (
                         <div style={{ 
                           width: '4px', 
                           height: '4px', 
                           borderRadius: '50%',
                           backgroundColor: '#fff'
                         }} />
                       )}
                     </div>
                                          <div style={{ 
                        width: '40px',
                        height: '12px',
                        borderBottom: '1px solid #333',
                        marginRight: '6px',
                        position: 'relative'
                      }}>
                                                <div style={{ 
                           position: 'absolute',
                           top: '-8px',
                           left: '50%',
                           transform: 'translateX(-50%)',
                           fontSize: '10px',
                           fontWeight: 'bold',
                           color: '#000'
                         }}>
                           {formatTotal(getSavingThrowTotal(ability))}
                         </div>
                      </div>
                     <span style={{ fontWeight: 'bold', fontSize: '9px', minWidth: '40px' }}>
                       {ability === 'strength' ? 'Fuerza' : 
                        ability === 'dexterity' ? 'Destreza' :
                        ability === 'constitution' ? 'Constitución' :
                        ability === 'intelligence' ? 'Inteligencia' :
                        ability === 'wisdom' ? 'Sabiduría' : 'Carisma'}
                     </span>
                   </div>
                 ))}
               </div>
             </div>

                                                                                                                                                                                                                                                                                                        {/* HABILIDADES */}
               <div style={{ 
                 padding: '16px',
                 border: '2px solid #000',
                 borderRadius: '8px',
                 backgroundColor: '#f9f9f9'
               }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Habilidades</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                  {[
                    { key: 'acrobatics', name: 'Acrobacias', ability: 'dexterity', abbr: 'Des' },
                    { key: 'athletics', name: 'Atletismo', ability: 'strength', abbr: 'Fue' },
                    { key: 'arcana', name: 'Arcano', ability: 'intelligence', abbr: 'Int' },
                    { key: 'deception', name: 'Engaño', ability: 'charisma', abbr: 'Car' },
                    { key: 'history', name: 'Historia', ability: 'intelligence', abbr: 'Int' },
                    { key: 'insight', name: 'Perspicacia', ability: 'wisdom', abbr: 'Sab' },
                    { key: 'intimidation', name: 'Intimidación', ability: 'charisma', abbr: 'Car' },
                    { key: 'investigation', name: 'Investigación', ability: 'intelligence', abbr: 'Int' },
                    { key: 'medicine', name: 'Medicina', ability: 'wisdom', abbr: 'Sab' },
                    { key: 'nature', name: 'Naturaleza', ability: 'intelligence', abbr: 'Int' },
                    { key: 'perception', name: 'Percepción', ability: 'wisdom', abbr: 'Sab' },
                    { key: 'performance', name: 'Interpretación', ability: 'charisma', abbr: 'Car' },
                    { key: 'persuasion', name: 'Persuasión', ability: 'charisma', abbr: 'Car' },
                    { key: 'religion', name: 'Religión', ability: 'intelligence', abbr: 'Int' },
                    { key: 'sleightOfHand', name: 'Juego de Manos', ability: 'dexterity', abbr: 'Des' },
                    { key: 'stealth', name: 'Sigilo', ability: 'dexterity', abbr: 'Des' },
                    { key: 'survival', name: 'Supervivencia', ability: 'wisdom', abbr: 'Sab' },
                    { key: 'animalHandling', name: 'Trato con Animales', ability: 'wisdom', abbr: 'Sab' }
                  ].map(skill => (
                    <div key={skill.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div 
                        className="clickable"
                        style={{ 
                          width: '14px', 
                          height: '14px', 
                          borderRadius: '50%',
                          border: '2px solid #333',
                          backgroundColor: data.skills?.[skill.key]?.proficient ? '#333' : '#fff',
                          cursor: locked ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={locked ? undefined : () => onChange(`skills.${skill.key}.proficient`, !data.skills?.[skill.key]?.proficient)}
                      >
                        {data.skills?.[skill.key]?.proficient && (
                          <div style={{ 
                            width: '4px', 
                            height: '4px', 
                            borderRadius: '50%',
                            backgroundColor: '#fff'
                          }} />
                        )}
                      </div>
                                            <div style={{ 
                         width: '50px',
                         height: '16px',
                         borderBottom: '1px solid #333',
                         marginRight: '8px',
                         position: 'relative'
                       }}>
                                                  <div style={{ 
                            position: 'absolute',
                            top: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#000'
                          }}>
                            {formatTotal(getSkillTotal(skill.key, skill.ability))}
                          </div>
                       </div>
                      <span style={{ fontWeight: 'bold', fontSize: '11px', minWidth: '60px' }}>
                        {skill.name} ({skill.abbr})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

                        {/* SABIDURÍA PASIVA */}
             <div style={{ 
               padding: '16px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9',
               textAlign: 'center'
             }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
                Sabiduría (Percepción) Pasiva
              </label>
                            <div style={{ 
                 fontSize: '24px', 
                 fontWeight: 'bold',
                 backgroundColor: '#fff',
                 padding: '8px',
                 borderRadius: '4px',
                 border: '2px solid #000'
                              }}>
                 {10 + Math.floor((Number(data.wisdom || 0) - 10) / 2) + (data.skills?.perception?.proficient ? Number(data.proficiencyBonus || 2) : 0)}
               </div>
            </div>

                        {/* OTRAS COMPETENCIAS E IDIOMAS */}
             <div style={{ 
               padding: '16px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9'
             }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Otras Competencias e Idiomas</h3>
                             <textarea
                  value={data.otherProficiencies || ''}
                  onChange={e => onChange('otherProficiencies', e.target.value)}
                  rows="8"
                  placeholder="Competencias, idiomas, herramientas..."
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '2px solid #000', 
                    fontSize: '12px',
                    resize: 'none',
                    backgroundColor: '#fff'
                  }}
                ></textarea>
            </div>
           </div>
         </div>

                  {/* COLUMNA CENTRAL - Combate y Puntos de Golpe */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
                        {/* COMBATE - 3 recuadros horizontales */}
             <div style={{ 
               padding: '16px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9'
             }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Combate</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '11px' }}>Clase de Armadura</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      value={data.armorClass || 10}
                      onChange={e => onChange('armorClass', parseInt(e.target.value) || 10)}
                      type="number"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', backgroundColor: '#fff' }}
                    />
                                         {featBenefits.armorClassBonus > 0 && (
                       <div style={{ 
                         position: 'absolute', 
                         top: '-8px', 
                         right: '-8px', 
                         background: '#4CAF50', 
                         color: 'white', 
                         borderRadius: '50%', 
                         width: '16px', 
                         height: '16px', 
                         fontSize: '10px', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         fontWeight: 'bold'
                       }}>
                         +{featBenefits.armorClassBonus}
                       </div>
                     )}
                  </div>
                  <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                    Total: {getArmorClassTotal()}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '11px' }}>Iniciativa</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      value={data.initiative || 0}
                      onChange={e => onChange('initiative', parseInt(e.target.value) || 0)}
                      type="number"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', backgroundColor: '#fff' }}
                    />
                                         {featBenefits.initiativeBonus > 0 && (
                       <div style={{ 
                         position: 'absolute', 
                         top: '-8px', 
                         right: '-8px', 
                         background: '#2196F3', 
                         color: 'white', 
                         borderRadius: '50%', 
                         width: '16px', 
                         height: '16px', 
                         fontSize: '10px', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         fontWeight: 'bold'
                       }}>
                         +{featBenefits.initiativeBonus}
                       </div>
                     )}
                  </div>
                  <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                    Total: {formatTotal(getInitiativeTotal())}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '11px' }}>Velocidad</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      value={data.speed || 30}
                      onChange={e => onChange('speed', parseInt(e.target.value) || 30)}
                      type="number"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', backgroundColor: '#fff' }}
                    />
                                         {featBenefits.speedBonus > 0 && (
                       <div style={{ 
                         position: 'absolute', 
                         top: '-8px', 
                         right: '-8px', 
                         background: '#FF9800', 
                         color: 'white', 
                         borderRadius: '50%', 
                         width: '16px', 
                         height: '16px', 
                         fontSize: '10px', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         fontWeight: 'bold'
                       }}>
                         +{featBenefits.speedBonus}
                       </div>
                     )}
                  </div>
                  <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                    Total: {getSpeedTotal()} pies
                  </div>
                </div>
              </div>
            </div>

                                                {/* PUNTOS DE GOLPE - Dividido en 2 secciones */}
              <div style={{ 
                padding: '16px',
                border: '2px solid #000',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Puntos de Golpe</h3>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  {/* SECCIÓN IZQUIERDA - PG Máximos y Actuales */}
                  <div style={{ 
                    border: '2px solid #000', 
                    borderRadius: '4px', 
                    padding: '8px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {/* PG Máximos */}
                    <div style={{ 
                      border: '1px solid #000', 
                      borderRadius: '4px', 
                      padding: '6px',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '10px' }}>
                        Puntos de Golpe Máximos
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          value={data.maxHP || 10}
                          onChange={e => onChange('maxHP', parseInt(e.target.value) || 10)}
                          type="number"
                          style={{ 
                            width: '100%', 
                            padding: '6px', 
                            borderRadius: '4px', 
                            border: '2px solid #000', 
                            fontSize: '14px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            backgroundColor: '#fff'
                          }}
                        />
                                                 {featBenefits.maxHPBonus > 0 && (
                           <div style={{ 
                             position: 'absolute', 
                             top: '-8px', 
                             right: '-8px', 
                             background: '#F44336', 
                             color: 'white', 
                             borderRadius: '50%', 
                             width: '16px', 
                             height: '16px', 
                             fontSize: '10px', 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'center',
                             fontWeight: 'bold'
                           }}>
                             +{featBenefits.maxHPBonus}
                           </div>
                         )}
                      </div>
                      <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                        Total: {getMaxHPTotal()}
                      </div>
                    </div>
                    
                    {/* PG Actuales */}
                    <div style={{ 
                      border: '1px solid #000', 
                      borderRadius: '4px', 
                      padding: '6px',
                      backgroundColor: '#f9f9f9',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '10px' }}>
                        Puntos de Golpe Actuales
                      </label>
                      <input 
                        id="currentHPField"
                        value={data.currentHP || 10}
                        onChange={e => onChange('currentHP', parseInt(e.target.value) || 10)}
                        type="number"
                        style={{ 
                          flex: 1,
                          padding: '8px', 
                          borderRadius: '4px', 
                          border: '2px solid #000', 
                          fontSize: '20px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          backgroundColor: '#fff'
                        }}
                      />
                    </div>
                  </div>

                  {/* SECCIÓN DERECHA - PG Temporales y Dado de Golpe */}
                  <div style={{ 
                    border: '2px solid #000', 
                    borderRadius: '4px', 
                    padding: '8px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {/* PG Temporales */}
                    <div style={{ 
                      border: '1px solid #000', 
                      borderRadius: '4px', 
                      padding: '6px',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '10px' }}>
                        Puntos de Golpe Temporales
                      </label>
                      <input 
                        value={data.tempHP || 0}
                        onChange={e => onChange('tempHP', parseInt(e.target.value) || 0)}
                        type="number"
                        style={{ 
                          width: '100%', 
                          padding: '6px', 
                          borderRadius: '4px', 
                          border: '2px solid #000', 
                          fontSize: '14px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          backgroundColor: '#fff'
                        }}
                      />
                    </div>
                    
                    {/* Dado de Golpe */}
                    <div style={{ 
                      border: '1px solid #000', 
                      borderRadius: '4px', 
                      padding: '6px',
                      backgroundColor: '#f9f9f9',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '10px' }}>
                        Dado de Golpe
                      </label>
                      <input 
                        value={data.hitDice || '1d10'}
                        onChange={e => onChange('hitDice', e.target.value)}
                        style={{ 
                          flex: 1,
                          padding: '8px', 
                          borderRadius: '4px', 
                          border: '2px solid #000', 
                          fontSize: '16px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          backgroundColor: '#fff'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

                      {/* SALVACIONES DE MUERTE */}
            <div style={{ 
              padding: '16px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
             <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Tiradas de Salvación de Muerte</h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               <div>
                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>Éxitos</label>
                 <div style={{ display: 'flex', gap: '6px' }}>
                   {[1, 2, 3].map(i => (
                     <input 
                       key={i}
                       type="checkbox"
                       checked={data.deathSaves?.successes >= i}
                       onChange={() => {
                         const current = data.deathSaves?.successes || 0;
                         onChange('deathSaves.successes', current >= i ? i - 1 : i);
                       }}
                       style={{ transform: 'scale(1.2)' }}
                     />
                   ))}
                 </div>
               </div>
               <div>
                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>Fallos</label>
                 <div style={{ display: 'flex', gap: '6px' }}>
                   {[1, 2, 3].map(i => (
                     <input 
                       key={i}
                       type="checkbox"
                       checked={data.deathSaves?.failures >= i}
                       onChange={() => {
                         const current = data.deathSaves?.failures || 0;
                         onChange('deathSaves.failures', current >= i ? i - 1 : i);
                       }}
                       style={{ transform: 'scale(1.2)' }}
                     />
                   ))}
                 </div>
               </div>
             </div>
           </div>

                                           {/* ATAQUES Y CONJUROS */}
             <div style={{ 
               padding: '16px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9'
             }}>
                             <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Ataques y Conjuros</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                 <span style={{ fontWeight: 'bold', fontSize: '11px' }}>Nombre</span>
                 <span style={{ fontWeight: 'bold', fontSize: '11px' }}>Bonif. Ataque</span>
                 <span style={{ fontWeight: 'bold', fontSize: '11px' }}>Daño/Tipo</span>
               </div>
               {generateAttacksAndSpells(data).map((attack, i) => (
                 <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '4px' }}>
                   <input 
                     value={attack.name}
                     onChange={e => onChange(`attacks.${i}.name`, e.target.value)}
                     style={{ 
                       width: '100%', 
                       padding: '4px', 
                       borderRadius: '4px', 
                       border: '2px solid #000', 
                       fontSize: '11px',
                       backgroundColor: '#fff'
                     }}
                   />
                   <input 
                     value={attack.bonus}
                     onChange={e => onChange(`attacks.${i}.bonus`, e.target.value)}
                     style={{ 
                       width: '100%', 
                       padding: '4px', 
                       borderRadius: '4px', 
                       border: '2px solid #000', 
                       fontSize: '11px',
                       backgroundColor: '#fff'
                     }}
                   />
                   <input 
                     value={attack.damage}
                     onChange={e => onChange(`attacks.${i}.damage`, e.target.value)}
                     style={{ 
                       width: '100%', 
                       padding: '4px', 
                       borderRadius: '4px', 
                       border: '2px solid #000', 
                       fontSize: '11px',
                       backgroundColor: '#fff'
                     }}
                   />
                 </div>
               ))}
                            <textarea
                 value={data.attackNotes || ''}
                 onChange={e => onChange('attackNotes', e.target.value)}
                 rows="6"
                 placeholder="Notas de ataques y conjuros..."
                 style={{ 
                   width: '100%', 
                   padding: '8px', 
                   borderRadius: '4px', 
                   border: '2px solid #000', 
                   fontSize: '12px',
                   resize: 'none',
                   marginTop: '8px',
                   backgroundColor: '#fff'
                 }}
               ></textarea>
                         </div>

             {/* ACCIONES DE CLASE */}
             {getClassActionsForCharacter(data).length > 0 && (
               <div style={{ 
                 padding: '16px',
                 border: '2px solid #000',
                 borderRadius: '8px',
                 backgroundColor: '#f9f9f9'
               }}>
                 <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Acciones de Clase</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {getClassActionsForCharacter(data).map((action) => (
                     <div key={action.id} style={{ 
                       border: '1px solid #000', 
                       borderRadius: '4px', 
                       padding: '12px',
                       backgroundColor: '#fff'
                     }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                         <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>{action.name}</h4>
                         {action.maxUses > 0 && (
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <span style={{ fontSize: '11px', color: '#666' }}>Usos:</span>
                             <input 
                               type="number"
                               min="0"
                               max={action.maxUses}
                               value={action.currentUses}
                               onChange={e => onChange(`classActions.${action.id}.currentUses`, parseInt(e.target.value) || 0)}
                               style={{ 
                                 width: '40px', 
                                 padding: '2px 4px', 
                                 borderRadius: '2px', 
                                 border: '1px solid #000', 
                                 fontSize: '11px',
                                 textAlign: 'center',
                                 backgroundColor: '#fff'
                               }}
                             />
                             <span style={{ fontSize: '11px', color: '#666' }}>/ {action.maxUses}</span>
                           </div>
                         )}
                       </div>
                       <p style={{ margin: 0, fontSize: '11px', color: '#333', lineHeight: '1.3' }}>
                         {action.description}
                       </p>
                       <div style={{ marginTop: '6px', fontSize: '10px', color: '#666' }}>
                         Disponible desde nivel {action.availableAt} • {action.uses}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
 
                         {/* EQUIPO */}
              <div style={{ 
                padding: '16px',
                border: '2px solid #000',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Equipo</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {['PC', 'PP', 'PE', 'PO', 'PPT'].map(currency => (
                  <div key={currency} style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>{currency}</label>
                    <input 
                      value={data.currency?.[currency.toLowerCase()] || 0}
                      onChange={e => onChange(`currency.${currency.toLowerCase()}`, parseInt(e.target.value) || 0)}
                      type="number"
                      style={{ 
                        width: '100%', 
                        padding: '4px', 
                        borderRadius: '4px', 
                        border: '2px solid #000', 
                        fontSize: '11px',
                        backgroundColor: '#fff'
                      }}
                    />
                  </div>
                ))}
              </div>
                            <textarea
                 value={data.equipment || ''}
                 onChange={e => onChange('equipment', e.target.value)}
                 rows="15"
                 placeholder="Lista de equipo..."
                 style={{ 
                   width: '100%', 
                   padding: '8px', 
                   borderRadius: '4px', 
                   border: '2px solid #000', 
                   fontSize: '12px',
                   resize: 'none',
                   backgroundColor: '#fff'
                 }}
               ></textarea>
            </div>
         </div>

                  {/* COLUMNA DERECHA - Personalidad, Rasgos y Atributos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* === Recurso primario de la clase (arriba de la columna derecha) === */}
            {(() => {
              const res = getPrimaryClassResource(data);
              if (!res) return null;

              // Si en el futuro guardas "restantes" en data.mechanics.resources[res.key],
              // aquí puedes leerlo:
              const remaining =
                data?.mechanics?.resources?.[res.key]?.remaining ?? null;

              return (
                <div style={{
                  border: '2px solid #333',
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 12,
                  background: '#fff'
                }}>
                  <div style={{fontWeight: '700', marginBottom: 6}}>
                    Recurso de Clase
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:4}}>
                    <div><b>{res.label}</b></div>
                    <div>Usos máximos: <b>{res.max}</b></div>
                    {remaining != null && (
                      <div>Usos restantes: <b>{remaining}</b></div>
                    )}
                    <div style={{fontSize:12, color:'#666'}}>{res.note}</div>
                  </div>
                </div>
              );
            })()}
            
                        {/* RASGOS DE PERSONALIDAD */}
             <div style={{ 
               padding: '16px',
               border: '2px solid #000',
               borderRadius: '8px',
               backgroundColor: '#f9f9f9'
             }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Rasgos de Personalidad</h3>
                             <textarea 
                  value={data.personalityTrait || ''}
                  onChange={e => onChange('personalityTrait', e.target.value)}
                  placeholder="Rasgos de personalidad..."
                  rows="3"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', resize: 'none', backgroundColor: '#fff' }}
                />
              </div>

              {/* IDEALES */}
              <div style={{ 
                padding: '16px',
                border: '2px solid #000',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Ideales</h3>
                <textarea 
                  value={data.ideal || ''}
                  onChange={e => onChange('ideal', e.target.value)}
                  placeholder="Ideales..."
                  rows="3"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', resize: 'none', backgroundColor: '#fff' }}
                />
              </div>

              {/* VÍNCULOS */}
              <div style={{ 
                padding: '16px',
                border: '2px solid #000',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Vínculos</h3>
                <textarea 
                  value={data.bond || ''}
                  onChange={e => onChange('bond', e.target.value)}
                  placeholder="Vínculos..."
                  rows="3"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', resize: 'none', backgroundColor: '#fff' }}
                />
              </div>

              {/* DEFECTOS */}
              <div style={{ 
                padding: '16px',
                border: '2px solid #000',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Defectos</h3>
                <textarea 
                  value={data.flaw || ''}
                  onChange={e => onChange('flaw', e.target.value)}
                  placeholder="Defectos..."
                  rows="3"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #000', fontSize: '12px', resize: 'none', backgroundColor: '#fff' }}
                />
              </div>

              {/* RASGOS Y ATRIBUTOS (Clase, Raza, Subclases) */}
              <div style={{ 
                padding: '16px',
                border: '2px solid #000',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px' }}>Rasgos y Atributos</h3>
                             <textarea
                  value={generateFeaturesAndTraits(data)}
                  onChange={e => onChange('featuresAndTraits', e.target.value)}
                  rows="10"
                  placeholder="Rasgos de clase, raza, subclase, etc."
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '2px solid #000', 
                    fontSize: '12px',
                    resize: 'none',
                    backgroundColor: '#fff'
                  }}
                ></textarea>
            </div>
          </div>
       </div>
      </fieldset>
    </div>
  );
}

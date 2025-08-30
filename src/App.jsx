import React, { useState, useEffect } from 'react'
import CharacterCreation from './components/CharacterCreation'
import CampaignManager from './components/CampaignManager'
import { getCharacterTraits, getCharacterDescription } from './data/characterTraits'
import { raceData, classData, backgroundData, savingThrowsByClass, classSkillOptions } from './data/gameData'
import { classEquipment } from './data/classEquipment'
import { backgroundPersonalities } from './utils/backgroundPersonalities'

function App() {
  console.log('COMPONENTE APP RENDERIZANDO - INICIO')
  const [showMenu, setShowMenu] = useState(true)
  const [hasSavedGame, setHasSavedGame] = useState(false)
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false)
  const [currentCampaignId, setCurrentCampaignId] = useState(null)
  const [showCampaignManager, setShowCampaignManager] = useState(false)
  const [showCharacterList, setShowCharacterList] = useState(false)
  const [savedCharacters, setSavedCharacters] = useState([])
  const [showNewGameMenu, setShowNewGameMenu] = useState(false)
  const [submenuSource, setSubmenuSource] = useState('') // 'newGame' o 'createCharacter'
  
  // Estado para la hoja de personaje
  // Bandera para hacer los campos de cabecera de solo lectura
  const READ_ONLY_HEADER = true;
  const ro = READ_ONLY_HEADER ? { background: '#f0f0f0', cursor: 'not-allowed' } : {};

  const [characterData, setCharacterData] = useState({
    // Información básica
    name: '',
    class: '',
    level: 1,
    edition: '5e-2014',
    background: '',
    playerName: '',
    race: '',
    alignment: '',
    experience: 0,
    
    // Características
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    
    // Combate
    armorClass: 10,
    initiative: 0,
    speed: 30,
    maxHP: 10,
    currentHP: 10,
    tempHP: 0,
    hitDice: '1d10',
    hitDiceTotal: 1,
    
    // Proficiencias
    proficiencyBonus: 2,
    inspiration: false,
    
    // Salvaciones - Estructura completa por defecto
    savingThrows: {
      strength: { proficient: false, modifier: 0 },
      dexterity: { proficient: false, modifier: 0 },
      constitution: { proficient: false, modifier: 0 },
      intelligence: { proficient: false, modifier: 0 },
      wisdom: { proficient: false, modifier: 0 },
      charisma: { proficient: false, modifier: 0 }
    },
    
    // Habilidades - Estructura completa por defecto
    skills: {
      acrobatics: { proficient: false, modifier: 0 },
      athletics: { proficient: false, modifier: 0 },
      arcana: { proficient: false, modifier: 0 },
      deception: { proficient: false, modifier: 0 },
      history: { proficient: false, modifier: 0 },
      insight: { proficient: false, modifier: 0 },
      intimidation: { proficient: false, modifier: 0 },
      investigation: { proficient: false, modifier: 0 },
      medicine: { proficient: false, modifier: 0 },
      nature: { proficient: false, modifier: 0 },
      perception: { proficient: false, modifier: 0 },
      performance: { proficient: false, modifier: 0 },
      persuasion: { proficient: false, modifier: 0 },
      religion: { proficient: false, modifier: 0 },
      sleightOfHand: { proficient: false, modifier: 0 },
      stealth: { proficient: false, modifier: 0 },
      survival: { proficient: false, modifier: 0 },
      animalHandling: { proficient: false, modifier: 0 }
    },
    
         // Otros
     passivePerception: 10,
     otherProficiencies: '',
     personalityTrait: '',
     ideal: '',
     bond: '',
     flaw: '',
     features: '',
     equipment: '',
     
     // Equipo organizado
     armor: '',
     shield: '',
     weapon1: '',
     weapon2: '',
     otherEquipment: '',
     
     // Modo de creación
     creationMode: 'classic', // 'classic' o 'custom'
     
     // Modo de personalidad
     personalityMode: 'manual', // 'manual', 'random', 'custom'
     
    // Ataques
    attacks: [
      { name: '', bonus: '', damage: '' },
      { name: '', bonus: '', damage: '' },
      { name: '', bonus: '', damage: '' }
    ],
    
    // Salvaciones de muerte
    deathSaves: { successes: 0, failures: 0 }
  })

  // --- Helpers de normalización ---
  const normalize = (s='') =>
    s.toString().toLowerCase()
     .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // sin acentos

  // Mapa EN->ES y tolerante si ya llega en ES
  const BG_MAP_EN_TO_ES = {
    acolyte: 'acolito', charlatan: 'charlatan', criminal: 'criminal',
    entertainer: 'artista', folk_hero: 'heroe del pueblo', guild_artisan: 'artesano',
    hermit: 'ermitaño', noble: 'noble', outlander: 'forastero',
    sage: 'sabio', sailor: 'marinero', soldier: 'soldado', urchin: 'huerfano'
  };

  const toBackgroundValue = (key) => {
    if (!key) return '';
    const k = normalize(key);
    // si ya viene en español, regrésalo tal cual
    const alreadySpanish = Object.values(BG_MAP_EN_TO_ES).find(v => normalize(v) === k);
    if (alreadySpanish) return alreadySpanish;
    // si viene en inglés, mapea
    return BG_MAP_EN_TO_ES[k] || '';
  };

  // Valores canónicos que usan tus <select>
  const WEAPON_VALUES = [
    'espada larga','espada corta','hacha de guerra','maza','bastón','daga',
    'arco corto','arco largo','ballesta ligera','jabalina'
  ];
  const ARMOR_VALUES = [
    'armadura de cuero','armadura de cuero tachonada','armadura de escamas',
    'cota de malla','armadura de bandas','armadura de placas'
  ];
  const SHIELD_VALUES = ['escudo','escudo de madera'];

  const toWeaponValue = (txt) => {
    const t = normalize(txt);
    if (t.includes('espada larga')) return 'espada larga';
    if (t.includes('espada corta') || t.includes('cimitarra') || t.includes('estoque')) return 'espada corta';
    if (t.includes('hacha')) return 'hacha de guerra';
    if (t.includes('maza')) return 'maza';
    if (t.includes('baston')) return 'bastón';
    if (t.includes('daga')) return 'daga';
    if (t.includes('arco largo')) return 'arco largo';
    if (t.includes('arco corto')) return 'arco corto';
    if (t.includes('ballesta')) return 'ballesta ligera';
    if (t.includes('jabalina')) return 'jabalina';
    return '';
  };

  const toArmorValue = (txt) => {
    const t = normalize(txt);
    if (t.includes('cuero tachon')) return 'armadura de cuero tachonada';
    if (t.includes('cuero')) return 'armadura de cuero';
    if (t.includes('escama')) return 'armadura de escamas';
    if (t.includes('cota de malla') || t.includes('malla')) return 'cota de malla';
    if (t.includes('bandas')) return 'armadura de bandas';
    if (t.includes('placas')) return 'armadura de placas';
    return '';
  };

  const toShieldValue = (txt) => {
    const t = normalize(txt);
    if (t.includes('escudo de madera')) return 'escudo de madera';
    if (t.includes('escudo')) return 'escudo';
    return '';
  };

  // Función para generar un personaje aleatorio
  const generateRandomCharacter = () => {
    // Arrays de opciones disponibles
    const races = Object.keys(raceData)
    const classes = Object.keys(classData)
    const backgrounds = Object.keys(backgroundData)
    const alignments = [
      'Legal Bueno', 'Neutral Bueno', 'Caótico Bueno',
      'Legal Neutral', 'Neutral', 'Caótico Neutral',
      'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado'
    ]
    
    // Generar nombres aleatorios
    const maleNames = ['Aiden', 'Bran', 'Cael', 'Dain', 'Ewan', 'Finn', 'Gareth', 'Hale', 'Ivan', 'Jace', 'Kael', 'Liam', 'Marek', 'Nolan', 'Owen', 'Pax', 'Quinn', 'Rex', 'Seth', 'Tyr', 'Ulf', 'Vale', 'Wade', 'Xander', 'York', 'Zane']
    const femaleNames = ['Aria', 'Briar', 'Cora', 'Dara', 'Eira', 'Faye', 'Gwen', 'Hana', 'Iris', 'Jade', 'Kira', 'Luna', 'Maya', 'Nova', 'Opal', 'Pia', 'Quinn', 'Raven', 'Sage', 'Tara', 'Uma', 'Vera', 'Willow', 'Xara', 'Yara', 'Zara']
    const lastNames = ['Blackwood', 'Stormwind', 'Ironheart', 'Shadowbane', 'Brightblade', 'Darkmoon', 'Fireforge', 'Goldleaf', 'Holloway', 'Lightbringer', 'Moonwhisper', 'Nightshade', 'Oakheart', 'Proudspire', 'Quickwind', 'Ravenclaw', 'Silverhand', 'Thunderborn', 'Voidwalker', 'Whitefang']
    
    // Seleccionar aleatoriamente
    const randomRace = races[Math.floor(Math.random() * races.length)]
    const randomClass = classes[Math.floor(Math.random() * classes.length)]
    const rawBg = backgrounds[Math.floor(Math.random() * backgrounds.length)]
    const randomBackground = toBackgroundValue(rawBg) || 'criminal' // fallback razonable
    const randomAlignment = alignments[Math.floor(Math.random() * alignments.length)]
    const isMale = Math.random() > 0.5
    const firstName = isMale ? 
      maleNames[Math.floor(Math.random() * maleNames.length)] :
      femaleNames[Math.floor(Math.random() * femaleNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const playerName = `Jugador_${Math.floor(Math.random() * 1000)}`
    
    // Obtener estadísticas recomendadas de la clase (no aleatorias)
    const recommendedStats = classData[randomClass].recommendedStats
    
    // Obtener datos de la raza para aplicar modificadores
    const raceModifiers = raceData[randomRace].abilityScoreIncrease || {}
    
    // Aplicar modificadores raciales a las estadísticas recomendadas
    const finalStats = {
      strength: recommendedStats.strength + (raceModifiers.strength || 0),
      dexterity: recommendedStats.dexterity + (raceModifiers.dexterity || 0),
      constitution: recommendedStats.constitution + (raceModifiers.constitution || 0),
      intelligence: recommendedStats.intelligence + (raceModifiers.intelligence || 0),
      wisdom: recommendedStats.wisdom + (raceModifiers.wisdom || 0),
      charisma: recommendedStats.charisma + (raceModifiers.charisma || 0)
    }
    
    // Calcular HP inicial basado en la clase
    const hitDie = classData[randomClass].hitDie
    const constitutionModifier = Math.floor((finalStats.constitution - 10) / 2)
    const initialHP = parseInt(hitDie.replace('d', '')) + constitutionModifier
    
    // Obtener habilidades del trasfondo
    const backgroundSkills = backgroundData[randomBackground].skills || []
    
    // Obtener salvaciones de la clase
    const classSavingThrows = savingThrowsByClass[randomClass] || []
    
    // Obtener opciones de habilidades de la clase
    const classSkillData = classSkillOptions[randomClass] || { choose: 2, from: [] }
    
    // Seleccionar habilidades de clase aleatoriamente
    const availableClassSkills = [...classSkillData.from]
    const selectedClassSkills = []
    for (let i = 0; i < classSkillData.choose && availableClassSkills.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableClassSkills.length)
      selectedClassSkills.push(availableClassSkills[randomIndex])
      availableClassSkills.splice(randomIndex, 1)
    }
    
    // Personalidad desde tu tabla (intenta ES primero, luego EN)
    const persPack = backgroundPersonalities?.[randomBackground]
                  || backgroundPersonalities?.[rawBg]
                  || { personalityTraits:['Prudente'], ideals:['Libertad'], bonds:['Un viejo amigo'], flaws:['Impulsivo'] };
    const personalityTrait = persPack.personalityTraits?.[Math.floor(Math.random()*persPack.personalityTraits.length)] || '';
    const ideal            = persPack.ideals?.[Math.floor(Math.random()*persPack.ideals.length)] || '';
    const bond             = persPack.bonds?.[Math.floor(Math.random()*persPack.bonds.length)] || '';
    const flaw             = persPack.flaws?.[Math.floor(Math.random()*persPack.flaws.length)] || '';
    
    // Obtener equipo estándar de la clase
    const classEquip = classEquipment[randomClass]
    let standardEquipment = []
    let weapon1 = ''
    let weapon2 = ''
    let armor = ''
    let shield = ''
    let otherEquipment = ''
    
    if (classEquip && classEquip.startingEquipment) {
      // Agregar equipo fijo (corregido el typo)
      if (classEquip.startingEquipment.fixed) {
        standardEquipment.push(...classEquip.startingEquipment.fixed)
      }
      
      // Selección de choices
      if (classEquip.startingEquipment.choices) {
        classEquip.startingEquipment.choices.forEach(choice => {
          if (choice.options?.length) {
            const selectedOption = choice.options[0]; // o aleatorio si prefieres
            standardEquipment.push(selectedOption);
            // Clasificar + normalizar a los value del <select>
            const w1 = toWeaponValue(selectedOption);
            const w2 = toWeaponValue(selectedOption);
            const ar = toArmorValue(selectedOption);
            const sh = toShieldValue(selectedOption);
            if (w1 && !weapon1) weapon1 = w1;
            else if (w2 && !weapon2 && w2 !== weapon1) weapon2 = w2;
            else if (ar && !armor) armor = ar;
            else if (sh && !shield) shield = sh;
            else otherEquipment += (otherEquipment ? ', ' : '') + selectedOption;
          }
        })
      }
    }
    
    // Crear el personaje aleatorio
    const randomCharacter = {
      // Información básica
      name: `${firstName} ${lastName}`,
      class: randomClass,
      level: 1,
      edition: '5e-2014',
      background: randomBackground,
      playerName: playerName,
      race: randomRace,
      alignment: randomAlignment,
      experience: 0,
      
      // Características (estadísticas recomendadas + modificadores raciales)
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
      maxHP: initialHP,
      currentHP: initialHP,
      tempHP: 0,
      hitDice: `1${hitDie}`,
      hitDiceTotal: 1,
      
      // Proficiencias
      proficiencyBonus: 2,
      inspiration: false,
      
      // Salvaciones - Estructura completa por defecto
      savingThrows: {
        strength: { proficient: false, modifier: Math.floor((finalStats.strength - 10) / 2) },
        dexterity: { proficient: false, modifier: Math.floor((finalStats.dexterity - 10) / 2) },
        constitution: { proficient: false, modifier: Math.floor((finalStats.constitution - 10) / 2) },
        intelligence: { proficient: false, modifier: Math.floor((finalStats.intelligence - 10) / 2) },
        wisdom: { proficient: false, modifier: Math.floor((finalStats.wisdom - 10) / 2) },
        charisma: { proficient: false, modifier: Math.floor((finalStats.charisma - 10) / 2) }
      },
      
      // Habilidades - Estructura completa por defecto
      skills: {
        acrobatics: { proficient: false, modifier: Math.floor((finalStats.dexterity - 10) / 2) },
        athletics: { proficient: false, modifier: Math.floor((finalStats.strength - 10) / 2) },
        arcana: { proficient: false, modifier: Math.floor((finalStats.intelligence - 10) / 2) },
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
        survival: { proficient: false, modifier: Math.floor((finalStats.wisdom - 10) / 2) },
        animalHandling: { proficient: false, modifier: Math.floor((finalStats.wisdom - 10) / 2) }
      },
      
      // Otros
      passivePerception: 10 + Math.floor((finalStats.wisdom - 10) / 2),
      otherProficiencies: '',
      personalityTrait: personalityTrait,
      ideal: ideal,
      bond: bond,
      flaw: flaw,
      features: '',
      equipment: standardEquipment, // Mantener como array para WeaponDamageCalculator
      
      // Equipo organizado
      armor: armor,
      shield: shield,
      weapon1: weapon1,
      weapon2: weapon2,
      otherEquipment: otherEquipment,
      
      // Modo de creación
      creationMode: 'classic',
      personalityMode: 'manual',
      
      // Ataques
      attacks: [
        { name: '', bonus: '', damage: '' },
        { name: '', bonus: '', damage: '' },
        { name: '', bonus: '', damage: '' }
      ],
      
      // Conjuros (inicializar como arrays vacíos para evitar errores)
      cantrips: [],
      spells: [],
      
      // Mecánicas de clase (inicializar como objeto vacío)
      mechanics: {},
      
      // Salvaciones de muerte
      deathSaves: { successes: 0, failures: 0 }
    }
    
    // Marcar las salvaciones de la clase como proficientes
    classSavingThrows.forEach(savingThrow => {
      if (randomCharacter.savingThrows[savingThrow]) {
        randomCharacter.savingThrows[savingThrow].proficient = true
        randomCharacter.savingThrows[savingThrow].modifier = Math.floor((finalStats[savingThrow] - 10) / 2) + 2 // +2 por proficiencia
      }
    })
    
    // Marcar las habilidades de clase como proficientes
    selectedClassSkills.forEach(skill => {
      const skillKey = getSkillKey(skill)
      if (skillKey && randomCharacter.skills[skillKey]) {
        randomCharacter.skills[skillKey].proficient = true
        randomCharacter.skills[skillKey].modifier = Math.floor((finalStats[getAbilityForSkill(skillKey)] - 10) / 2) + 2 // +2 por proficiencia
      }
    })
    
    // Marcar las habilidades del trasfondo como proficientes
    backgroundSkills.forEach(skill => {
      const skillKey = getSkillKey(skill)
      if (skillKey && randomCharacter.skills[skillKey]) {
        randomCharacter.skills[skillKey].proficient = true
        randomCharacter.skills[skillKey].modifier = Math.floor((finalStats[getAbilityForSkill(skillKey)] - 10) / 2) + 2 // +2 por proficiencia
      }
    })
    
    return randomCharacter
  }
  
  // Función helper para convertir nombres de habilidades a claves
  const getSkillKey = (skillName) => {
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
    }
    return skillMap[skillName]
  }
  
  // Función helper para obtener la habilidad principal de una skill
  const getAbilityForSkill = (skillKey) => {
    const abilityMap = {
      'acrobatics': 'dexterity',
      'athletics': 'strength',
      'arcana': 'intelligence',
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
      'survival': 'wisdom',
      'animalHandling': 'wisdom'
    }
    return abilityMap[skillKey] || 'strength'
  }

  const handleNewGame = () => {
    console.log('Nueva partida iniciada - Mostrando submenú de selección')
    setShowMenu(false)
    setSubmenuSource('newGame')
    setShowNewGameMenu(true)
  }

  const handleCreateCharacter = () => {
    console.log('Iniciando creación de personaje - Mostrando submenú de selección')
    setShowMenu(false)
    setSubmenuSource('createCharacter')
    setShowNewGameMenu(true)
  }

  const handleViewCharacters = () => {
    console.log('Ver lista de personajes')
    setShowMenu(false)
    setShowCharacterList(true)
  }

  const handleContinueGame = () => {
    console.log('Continuar partida')
    alert('Función de continuar partida en desarrollo')
  }

  const handleOpenSettings = () => {
    console.log('Abrir opciones')
    alert('Función de opciones en desarrollo')
  }

  const handleBackToMenu = () => {
    setShowMenu(true)
    setShowCharacterList(false)
    setShowNewGameMenu(false)
    setSubmenuSource('') // Resetear la fuente del submenú
    setIsCreatingCharacter(false) // Asegurar que no esté en modo creación
    setShowCampaignManager(false) // Asegurar que no esté en gestor de campañas
  }

  // Función para asegurar que los datos del personaje tengan la estructura correcta
  const ensureCharacterDataStructure = (data) => {
    const defaultSavingThrows = {
      strength: { proficient: false, modifier: 0 },
      dexterity: { proficient: false, modifier: 0 },
      constitution: { proficient: false, modifier: 0 },
      intelligence: { proficient: false, modifier: 0 },
      wisdom: { proficient: false, modifier: 0 },
      charisma: { proficient: false, modifier: 0 }
    }
    
    const defaultSkills = {
      acrobatics: { proficient: false, modifier: 0 },
      athletics: { proficient: false, modifier: 0 },
      arcana: { proficient: false, modifier: 0 },
      deception: { proficient: false, modifier: 0 },
      history: { proficient: false, modifier: 0 },
      insight: { proficient: false, modifier: 0 },
      intimidation: { proficient: false, modifier: 0 },
      investigation: { proficient: false, modifier: 0 },
      medicine: { proficient: false, modifier: 0 },
      nature: { proficient: false, modifier: 0 },
      perception: { proficient: false, modifier: 0 },
      performance: { proficient: false, modifier: 0 },
      persuasion: { proficient: false, modifier: 0 },
      religion: { proficient: false, modifier: 0 },
      sleightOfHand: { proficient: false, modifier: 0 },
      stealth: { proficient: false, modifier: 0 },
      survival: { proficient: false, modifier: 0 },
      animalHandling: { proficient: false, modifier: 0 }
    }
    
    return {
      ...data,
      savingThrows: {
        ...defaultSavingThrows,
        ...(data.savingThrows || {})
      },
      skills: {
        ...defaultSkills,
        ...(data.skills || {})
      }
    }
  }

  const handleCharacterDataChange = (field, value) => {
    setCharacterData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSavingThrowChange = (ability, field, value) => {
    setCharacterData(prev => ({
      ...prev,
      savingThrows: {
        ...prev.savingThrows,
        [ability]: {
          ...prev.savingThrows[ability],
          [field]: value
        }
      }
    }))
  }

  const handleSkillChange = (skill, field, value) => {
    setCharacterData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skill]: {
          ...prev.skills[skill],
          [field]: value
        }
      }
    }))
  }

  // Calcular modificadores de características
  const getAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2)
  }

     // Calcular modificador total de habilidad
   const getSkillModifier = (skillName) => {
     const skill = characterData.skills[skillName]
     const abilityMod = getAbilityModifier(characterData[skillName === 'animalHandling' ? 'wisdom' : skillName])
     const proficiencyBonus = skill.proficient ? characterData.proficiencyBonus : 0
     return abilityMod + proficiencyBonus
   }

   // Función para calcular AC basado en armadura, escudo y destreza
   const calculateArmorClass = () => {
     const dexModifier = getAbilityModifier(characterData.dexterity)
     let baseAC = 10 // AC base sin armadura
     
     // Aplicar modificaciones según la armadura
     switch (characterData.armor) {
       case 'armadura de cuero':
         baseAC = 11 + dexModifier
         break
       case 'armadura de cuero tachonada':
         baseAC = 12 + dexModifier
         break
       case 'armadura de escamas':
         baseAC = 14 + Math.min(dexModifier, 2) // Máximo +2 de destreza
         break
       case 'cota de malla':
         baseAC = 16 + Math.min(dexModifier, 2) // Máximo +2 de destreza
         break
       case 'armadura de bandas':
         baseAC = 17 // Sin modificador de destreza
         break
       case 'armadura de placas':
         baseAC = 18 // Sin modificador de destreza
         break
       default:
         baseAC = 10 + dexModifier // Sin armadura
     }
     
     // Aplicar bonificación de escudo
     if (characterData.shield === 'escudo' || characterData.shield === 'escudo de madera') {
       baseAC += 2
     }
     
     return baseAC
   }






 










   // Función para calcular iniciativa
   const calculateInitiative = () => {
     const dexMod = getAbilityModifier(characterData.dexterity)
     const extra = characterData.initiativeBonus || 0   // por si luego añades dotes/estados
     return dexMod + extra
   }

   // useEffect para actualizar AC automáticamente
   useEffect(() => {
     const newAC = calculateArmorClass()
     if (newAC !== characterData.armorClass) {
       setCharacterData(prev => ({
         ...prev,
         armorClass: newAC
       }))
     }
   }, [characterData.armor, characterData.shield, characterData.dexterity])

   // useEffect para actualizar iniciativa automáticamente
   useEffect(() => {
     const ini = calculateInitiative()
     if (ini !== characterData.initiative) {
       setCharacterData(prev => ({ ...prev, initiative: ini }))
     }
   }, [characterData.dexterity, characterData.initiativeBonus])



  console.log('App renderizando, showMenu:', showMenu, 'isCreatingCharacter:', isCreatingCharacter)

  // Mostrar gestor de campañas
  if (showCampaignManager) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #2D1810 0%, #8B4513 20%, #2D1810 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <CampaignManager 
          onCampaignSelect={(campaignId, manifest) => {
            setCurrentCampaignId(campaignId);
            setShowCampaignManager(false);
            console.log('Campaña seleccionada:', campaignId);
          }}
          onNewCampaign={(campaignId) => {
            setCurrentCampaignId(campaignId);
            setShowCampaignManager(false);
            console.log('Nueva campaña creada:', campaignId);
          }}
        />
        <button
          onClick={handleBackToMenu}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Volver al Menú
        </button>
      </div>
    );
  }

  // Mostrar submenú de nueva partida
  if (showNewGameMenu) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #2D1810 0%, #8B4513 20%, #2D1810 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 9999,
          fontSize: '12px'
        }}>
          Estado: Submenú Creación de Personaje
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#DAA520',
          marginBottom: '16px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          ⚔️ CREACIÓN DE PERSONAJE
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#F5F5DC',
          maxWidth: '400px',
          margin: '0 auto 48px auto',
          textAlign: 'center'
        }}>
          ¿Cómo quieres crear tu personaje?
        </p>

                  {/* Opciones del submenú */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
          {/* Crear Personaje Guiado */}
          <button
            onClick={() => {
              setShowNewGameMenu(false)
              setSubmenuSource('')
              setIsCreatingCharacter(true)
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '24px 32px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🎯 Crear Personaje Guiado
          </button>

          {/* Crear Personaje Personalizado */}
          <button
            onClick={() => {
              setShowNewGameMenu(false)
              setSubmenuSource('')
              setIsCreatingCharacter(true)
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '24px 32px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ⚙️ Crear Personaje Personalizado
          </button>

          {/* Crear Personaje al Azar */}
          <button
            onClick={() => {
              console.log('Generando personaje aleatorio')
              const randomCharacter = generateRandomCharacter()
              setCharacterData(randomCharacter)
              setShowNewGameMenu(false)
              setSubmenuSource('')
              setIsCreatingCharacter(false) // No mostrar el proceso de creación
              // El personaje ya está creado, mostrar directamente la hoja de personaje
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '24px 32px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🎲 Crear Personaje al Azar
          </button>

          {/* Usar Personaje Existente - Solo mostrar cuando viene de "NUEVA PARTIDA" */}
          {submenuSource === 'newGame' && (
            <button
              onClick={() => {
                setShowNewGameMenu(false)
                setSubmenuSource('')
                setShowCharacterList(true)
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                fontWeight: 'bold',
                padding: '24px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #20c997 0%, #17a2b8 100%)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              👥 Usar Personaje Existente
            </button>
          )}
        </div>

        {/* Botón volver */}
        <button
          onClick={handleBackToMenu}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Volver al Menú
        </button>
      </div>
    );
  }

  // Mostrar lista de personajes
  if (showCharacterList) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #2D1810 0%, #8B4513 20%, #2D1810 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#8B4513',
            color: 'white',
            padding: '20px',
            borderRadius: '8px 8px 0 0',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>
              👥 LISTA DE PERSONAJES
            </h1>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Gestiona tus personajes creados
            </p>
          </div>

          {/* Contenido */}
          <div style={{
            backgroundColor: 'white',
            color: '#333',
            padding: '20px',
            borderRadius: '0 0 8px 8px',
            minHeight: '400px'
          }}>
            {savedCharacters.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚔️</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                  No hay personajes creados
                </h3>
                <p style={{ margin: '0 0 30px 0', color: '#666' }}>
                  Crea tu primer personaje para comenzar tu aventura
                </p>
                                 <button
                   onClick={() => {
                     setShowCharacterList(false)
                     setIsCreatingCharacter(true)
                   }}
                   style={{
                     padding: '12px 24px',
                     backgroundColor: '#28a745',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     fontSize: '16px',
                     fontWeight: 'bold'
                   }}
                 >
                   ⚔️ Crear Primer Personaje
                 </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {savedCharacters.map((character, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                          {character.name || 'Sin nombre'}
                        </h4>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Nivel {character.level || 1} {character.class || 'Sin clase'} - {character.race || 'Sin raza'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                                                                         <button
                          onClick={() => {
                            // Asegurar que el personaje tenga toda la estructura necesaria usando nuestra función
                            const completeCharacter = ensureCharacterDataStructure({
                               // Información básica
                               name: character.name || '',
                               class: character.class || '',
                               level: character.level || 1,
                               edition: character.edition || '5e-2014',
                               background: character.background || '',
                               playerName: character.playerName || '',
                               race: character.race || '',
                               alignment: character.alignment || '',
                               experience: character.experience || 0,
                               
                               // Características
                               strength: character.strength || 10,
                               dexterity: character.dexterity || 10,
                               constitution: character.constitution || 10,
                               intelligence: character.intelligence || 10,
                               wisdom: character.wisdom || 10,
                               charisma: character.charisma || 10,
                               
                               // Combate
                               armorClass: character.armorClass || 10,
                               initiative: character.initiative || 0,
                               speed: character.speed || 30,
                               maxHP: character.maxHP || 10,
                               currentHP: character.currentHP || 10,
                               tempHP: character.tempHP || 0,
                               hitDice: character.hitDice || '1d10',
                               hitDiceTotal: character.hitDiceTotal || 1,
                               
                               // Proficiencias
                               proficiencyBonus: character.proficiencyBonus || 2,
                               inspiration: character.inspiration || false,
                               
                               // Salvaciones
                               savingThrows: character.savingThrows || {
                                 strength: { proficient: false, modifier: 0 },
                                 dexterity: { proficient: false, modifier: 0 },
                                 constitution: { proficient: false, modifier: 0 },
                                 intelligence: { proficient: false, modifier: 0 },
                                 wisdom: { proficient: false, modifier: 0 },
                                 charisma: { proficient: false, modifier: 0 }
                               },
                               
                               // Habilidades
                               skills: character.skills || {
                                 acrobatics: { proficient: false, modifier: 0 },
                                 athletics: { proficient: false, modifier: 0 },
                                 arcana: { proficient: false, modifier: 0 },
                                 deception: { proficient: false, modifier: 0 },
                                 history: { proficient: false, modifier: 0 },
                                 insight: { proficient: false, modifier: 0 },
                                 intimidation: { proficient: false, modifier: 0 },
                                 investigation: { proficient: false, modifier: 0 },
                                 medicine: { proficient: false, modifier: 0 },
                                 nature: { proficient: false, modifier: 0 },
                                 perception: { proficient: false, modifier: 0 },
                                 performance: { proficient: false, modifier: 0 },
                                 persuasion: { proficient: false, modifier: 0 },
                                 religion: { proficient: false, modifier: 0 },
                                 sleightOfHand: { proficient: false, modifier: 0 },
                                 stealth: { proficient: false, modifier: 0 },
                                 survival: { proficient: false, modifier: 0 },
                                 animalHandling: { proficient: false, modifier: 0 }
                               },
                               
                               // Otros
                               passivePerception: character.passivePerception || 10,
                               otherProficiencies: character.otherProficiencies || '',
                               personalityTrait: character.personalityTrait || '',
                               ideal: character.ideal || '',
                               bond: character.bond || '',
                               flaw: character.flaw || '',
                               features: character.features || '',
                               equipment: character.equipment || '',
                               
                               // Equipo organizado
                               armor: character.armor || '',
                               shield: character.shield || '',
                               weapon1: character.weapon1 || '',
                               weapon2: character.weapon2 || '',
                               otherEquipment: character.otherEquipment || '',
                               
                               // Modo de creación
                               creationMode: character.creationMode || 'classic',
                               
                               // Modo de personalidad
                               personalityMode: character.personalityMode || 'manual',
                               
                               // Ataques
                               attacks: character.attacks || [
                                 { name: '', bonus: '', damage: '' },
                                 { name: '', bonus: '', damage: '' },
                                 { name: '', bonus: '', damage: '' }
                               ],
                               
                                                            // Salvaciones de muerte
                             deathSaves: character.deathSaves || { successes: 0, failures: 0 }
                           });
                           
                           setCharacterData(completeCharacter);
                             setShowCharacterList(false);
                           }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => {
                            const newCharacters = savedCharacters.filter((_, i) => i !== index);
                            setSavedCharacters(newCharacters);
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botón volver */}
        <button
          onClick={handleBackToMenu}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Volver al Menú
        </button>
      </div>
    );
  }

  if (showMenu) {
    console.log('Renderizando menú principal...')
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #2D1810 0%, #8B4513 20%, #2D1810 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 9999,
          fontSize: '12px'
        }}>
          Estado: Menú Principal
        </div>
        
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#DAA520',
          marginBottom: '16px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          D&D Solitario - TEST
        </h1>
        
        <p style={{
          fontSize: '20px',
          color: '#F5F5DC',
          maxWidth: '400px',
          margin: '0 auto 48px auto',
          textAlign: 'center'
        }}>
          Embárcate en una aventura épica donde la Inteligencia Artificial 
          actúa como tu Dungeon Master personal
        </p>

        {/* Menú de opciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
           {/* Nueva Partida - PRINCIPAL */}
          <button
            onClick={() => {
              console.log('BOTÓN CLICKEADO - Nueva Partida')
              handleNewGame()
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #DC143C 0%, #B22222 100%)',
               color: 'white',
               fontWeight: 'bold',
               padding: '28px 32px',
               borderRadius: '12px',
               border: 'none',
               cursor: 'pointer',
               fontSize: '20px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '16px',
               boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
               transition: 'all 0.3s ease'
             }}
             onMouseOver={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #B22222 0%, #8B0000 100%)';
               e.target.style.transform = 'scale(1.05)';
             }}
             onMouseOut={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #DC143C 0%, #B22222 100%)';
               e.target.style.transform = 'scale(1)';
             }}
           >
             🎮 NUEVA PARTIDA
           </button>

           {/* Ver Personajes */}
           <button
             onClick={handleViewCharacters}
             style={{
               width: '100%',
               background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '24px 32px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #20c997 0%, #17a2b8 100%)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
              e.target.style.transform = 'scale(1)';
            }}
          >
             👥 Ver Personajes
           </button>

           {/* Crear Personaje */}
           <button
             onClick={handleCreateCharacter}
             style={{
               width: '100%',
               background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
               color: 'white',
               fontWeight: 'bold',
               padding: '24px 32px',
               borderRadius: '12px',
               border: 'none',
               cursor: 'pointer',
               fontSize: '18px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '16px',
               boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
               transition: 'all 0.3s ease'
             }}
             onMouseOver={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%)';
               e.target.style.transform = 'scale(1.05)';
             }}
             onMouseOut={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
               e.target.style.transform = 'scale(1)';
             }}
           >
             ⚔️ Crear Personaje
           </button>

           {/* Gestión de Campañas */}
           <button
             onClick={() => setShowCampaignManager(true)}
             style={{
               width: '100%',
               background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
               color: 'white',
               fontWeight: 'bold',
               padding: '24px 32px',
               borderRadius: '12px',
               border: 'none',
               cursor: 'pointer',
               fontSize: '18px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '16px',
               boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
               transition: 'all 0.3s ease'
             }}
             onMouseOver={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #357ABD 0%, #2E6DA4 100%)';
               e.target.style.transform = 'scale(1.05)';
             }}
             onMouseOut={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)';
               e.target.style.transform = 'scale(1)';
             }}
           >
             🎲 Gestión de Campañas
          </button>

          {/* Continuar Partida */}
          <button
            onClick={handleContinueGame}
            disabled={!hasSavedGame}
            style={{
              width: '100%',
              background: hasSavedGame 
                ? 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)'
                : 'linear-gradient(135deg, #666 0%, #444 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '24px 32px',
              borderRadius: '12px',
              border: 'none',
              cursor: hasSavedGame ? 'pointer' : 'not-allowed',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              opacity: hasSavedGame ? 1 : 0.5
            }}
            onMouseOver={(e) => {
              if (hasSavedGame) {
                e.target.style.background = 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)';
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              if (hasSavedGame) {
                e.target.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            📖 {hasSavedGame ? 'Continuar Partida' : 'No hay partida guardada'}
          </button>

          {/* Opciones */}
          <button
            onClick={handleOpenSettings}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #666 0%, #444 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '24px 32px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #555 0%, #333 100%)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #666 0%, #444 100%)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ⚙️ Opciones
          </button>
        </div>

        {/* Información adicional */}
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', color: 'rgba(245,245,220,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚔️ <span style={{ fontSize: '14px' }}>Combate Épico</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛡️ <span style={{ fontSize: '14px' }}>Aventuras Únicas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🗺️ <span style={{ fontSize: '14px' }}>Mundos Dinámicos</span>
            </div>
          </div>
        </div>

        {/* Versión */}
        <div style={{ marginTop: '32px', color: 'rgba(245,245,220,0.4)', fontSize: '12px' }}>
          Versión 1.0.0 - Desarrollado con React, Electron y OpenAI
        </div>
      </div>
    )
  }

  // Función para manejar cuando se completa la creación del personaje
  const handleCharacterCreated = (finalCharacter) => {
    console.log('handleCharacterCreated llamado con:', finalCharacter)
    console.log('savingThrows recibidos:', finalCharacter.savingThrows)
    console.log('skills recibidos:', finalCharacter.skills)
    console.log('skills detallado:', JSON.stringify(finalCharacter.skills, null, 2))
    
    // Asegurar que el personaje tenga toda la estructura necesaria
    const completeCharacter = {
      // Información básica
      name: finalCharacter.name || '',
      class: finalCharacter.class || '',
      level: finalCharacter.level || 1,
      edition: finalCharacter.edition || '5e-2014',
      background: finalCharacter.background || '',
      playerName: finalCharacter.playerName || '',
      race: finalCharacter.race || '',
      alignment: finalCharacter.alignment || '',
      experience: finalCharacter.experience || 0,
      
      // Características
      strength: finalCharacter.strength || 10,
      dexterity: finalCharacter.dexterity || 10,
      constitution: finalCharacter.constitution || 10,
      intelligence: finalCharacter.intelligence || 10,
      wisdom: finalCharacter.wisdom || 10,
      charisma: finalCharacter.charisma || 10,
      
      // Combate
      armorClass: finalCharacter.armorClass || 10,
      initiative: (typeof finalCharacter.initiative === 'number' 
        ? finalCharacter.initiative 
        : Math.floor((finalCharacter.dexterity - 10) / 2)),
      speed: finalCharacter.speed || 30,
      maxHP: finalCharacter.maxHP || 10,
      currentHP: finalCharacter.currentHP || 10,
      tempHP: finalCharacter.tempHP || 0,
      hitDice: finalCharacter.hitDice || '1d10',
      hitDiceTotal: finalCharacter.hitDiceTotal || 1,
      
      // Proficiencias
      proficiencyBonus: finalCharacter.proficiencyBonus || 2,
      inspiration: finalCharacter.inspiration || false,
      
      // Salvaciones - Asegurar estructura completa
      savingThrows: finalCharacter.savingThrows || {
        strength: { proficient: false, modifier: 0 },
        dexterity: { proficient: false, modifier: 0 },
        constitution: { proficient: false, modifier: 0 },
        intelligence: { proficient: false, modifier: 0 },
        wisdom: { proficient: false, modifier: 0 },
        charisma: { proficient: false, modifier: 0 }
      },
      
      // Habilidades - Usar la estructura correcta si existe, sino crear una por defecto
      skills: (() => {
        if (finalCharacter.skills && typeof finalCharacter.skills === 'object' && !Array.isArray(finalCharacter.skills)) {
          // Si ya tiene la estructura correcta, usarla
          return finalCharacter.skills
        }
        // Si no tiene la estructura correcta, crear una por defecto
        return {
          acrobatics: { proficient: false, modifier: 0 },
          athletics: { proficient: false, modifier: 0 },
          arcana: { proficient: false, modifier: 0 },
          deception: { proficient: false, modifier: 0 },
          history: { proficient: false, modifier: 0 },
          insight: { proficient: false, modifier: 0 },
          intimidation: { proficient: false, modifier: 0 },
          investigation: { proficient: false, modifier: 0 },
          medicine: { proficient: false, modifier: 0 },
          nature: { proficient: false, modifier: 0 },
          perception: { proficient: false, modifier: 0 },
          performance: { proficient: false, modifier: 0 },
          persuasion: { proficient: false, modifier: 0 },
          religion: { proficient: false, modifier: 0 },
          sleightOfHand: { proficient: false, modifier: 0 },
          stealth: { proficient: false, modifier: 0 },
          survival: { proficient: false, modifier: 0 },
          animalHandling: { proficient: false, modifier: 0 }
        }
      })(),
      
      // Otros
      passivePerception: finalCharacter.passivePerception || 10,
      otherProficiencies: finalCharacter.otherProficiencies || '',
      personalityTrait: finalCharacter.personalityTrait || '',
      ideal: finalCharacter.ideal || '',
      bond: finalCharacter.bond || '',
      flaw: finalCharacter.flaw || '',
      features: finalCharacter.features || '',
      equipment: finalCharacter.equipment || '',
      
      // Equipo organizado
      armor: finalCharacter.armor || '',
      shield: finalCharacter.shield || '',
      weapon1: finalCharacter.weapon1 || '',
      weapon2: finalCharacter.weapon2 || '',
      otherEquipment: finalCharacter.otherEquipment || '',
      
      // Modo de creación
      creationMode: finalCharacter.creationMode || 'classic',
      
      // Modo de personalidad
      personalityMode: finalCharacter.personalityMode || 'manual',
      
      // Ataques
      attacks: Array.isArray(finalCharacter.attacks) && finalCharacter.attacks.length 
        ? finalCharacter.attacks 
        : [
          { name: '', bonus: '', damage: '' },
          { name: '', bonus: '', damage: '' },
          { name: '', bonus: '', damage: '' }
        ],
      
      // Salvaciones de muerte
      deathSaves: finalCharacter.deathSaves || { successes: 0, failures: 0 }
    };
    
    console.log('completeCharacter final:', completeCharacter)
    console.log('savingThrows final:', completeCharacter.savingThrows)
    console.log('skills final:', completeCharacter.skills)
    
    // Asegurar que los datos tengan la estructura correcta antes de guardarlos
    const finalCharacterWithStructure = ensureCharacterDataStructure(completeCharacter)
    
    setCharacterData(finalCharacterWithStructure)
    setIsCreatingCharacter(false) // Pasar al visualizador automáticamente
    
    // Guardar el personaje en la lista de personajes
    setSavedCharacters(prev => [...prev, finalCharacterWithStructure])
    
    console.log('Personaje creado exitosamente, pasando al visualizador...')
  }

  // Si estamos creando un personaje con el componente paso a paso
  if (isCreatingCharacter) {
    console.log('Intentando renderizar CharacterCreation...')
    try {
      return (
        <CharacterCreation 
          onBackToMenu={handleBackToMenu}
          onCharacterCreated={handleCharacterCreated}
          characterData={characterData}
          setCharacterData={setCharacterData}
          handleCharacterDataChange={handleCharacterDataChange}
          currentCampaignId={currentCampaignId}
        />
      )
    } catch (error) {
      console.error('Error al renderizar CharacterCreation:', error)
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Error al cargar la creación de personaje</h2>
          <p>Error: {error.message}</p>
          <button onClick={handleBackToMenu}>Volver al menú</button>
        </div>
      )
    }
  }

  // Si no estamos en el menú y no estamos creando con el componente paso a paso,
  // mostrar la hoja de personaje completa (diseño antiguo)
  if (!showMenu && !isCreatingCharacter && !showCampaignManager && !showCharacterList && !showNewGameMenu) {
    console.log('Mostrando hoja de personaje completa (diseño antiguo)')
    console.log('characterData en viewer:', characterData)
    console.log('savingThrows en viewer:', characterData.savingThrows)
    console.log('skills en viewer:', characterData.skills)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5dc',
      color: '#333',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      overflowY: 'auto',
      maxHeight: '100vh'
    }}>
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        Estado: Ficha de Personaje
      </div>
      
             {/* Botón Volver al Menú */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999
      }}>
        <button
           onClick={handleBackToMenu}
          style={{
             background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onMouseOver={(e) => {
             e.target.style.background = 'linear-gradient(135deg, #495057 0%, #343a40 100%)';
          }}
          onMouseOut={(e) => {
             e.target.style.background = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
          }}
        >
           ← Volver al Menú
        </button>
      </div>
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #333',
        paddingBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          margin: '0 0 20px 0'
        }}>
          DUNGEONS & DRAGONS®
        </h1>
        
                 {/* Información básica */}
         <div style={{
           display: 'grid',
           gridTemplateColumns: '2fr 1fr',
           gap: '20px',
           alignItems: 'start'
         }}>
           <div>
             <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
               NOMBRE DEL PERSONAJE
             </label>
             <input
               type="text"
               value={characterData.name}
               onChange={!READ_ONLY_HEADER ? (e) => handleCharacterDataChange('name', e.target.value) : undefined}
               readOnly={READ_ONLY_HEADER}
               disabled={READ_ONLY_HEADER}
               style={{
                 width: '100%',
                 padding: '8px',
                 border: '1px solid #333',
                 fontSize: '16px',
                 ...ro
               }}
             />
           </div>

                       {/* OPCIONES DESACTIVADAS TEMPORALMENTE
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  VERSIÓN D&D
                </label>
                                <select
                   value={characterData.edition}
                   onChange={(e) => handleCharacterDataChange('edition', e.target.value)}
                   style={{
                     width: '100%',
                     padding: '6px',
                     border: '1px solid #333',
                     background: 'white',
                     fontSize: '12px'
                   }}
                 >
                   <option value="5e-2014">5e 2014 (Raza afecta stats)</option>
                   <option value="5e-2024">5e 2024 (Trasfondo afecta stats)</option>
                 </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  MODO
                </label>
                <select
                  value={characterData.creationMode}
                  onChange={(e) => handleCharacterDataChange('creationMode', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #333',
                    background: 'white',
                    fontSize: '12px'
                  }}
                >
                  <option value="classic">Clásico (Equipo automático)</option>
                  <option value="custom">Personalizado (Equipo libre)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px', color: '#666' }}>
                  PERSONAJE CREADO
                </label>
                <div style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #ccc',
                  background: '#f0f0f0',
                  color: '#666',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  ✅ Listo para jugar
                </div>
              </div>
            </div>
            */}
            
            {/* Solo mostrar el estado del personaje */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '15px'
            }}>
              <div style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                background: '#f0f0f0',
                color: '#666',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                ✅ Listo para jugar
              </div>
            </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
                         <div>
               <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                 CLASE
               </label>
               <select
                 value={characterData.class}
                 onChange={!READ_ONLY_HEADER ? (e) => handleCharacterDataChange('class', e.target.value) : undefined}
                 disabled={READ_ONLY_HEADER}
                 style={{
                   width: '100%',
                   padding: '6px',
                   border: '1px solid #333',
                   fontSize: '12px',
                   ...ro
                 }}
               >
                 <option value="">Seleccionar clase...</option>
                 <option value="bardo">Bardo</option>
                 <option value="barbaro">Bárbaro</option>
                 <option value="guerrero">Guerrero</option>
                 <option value="clerigo">Clérigo</option>
                 <option value="druida">Druida</option>
                 <option value="explorador">Explorador</option>
                 <option value="hechicero">Hechicero</option>
                 <option value="mago">Mago</option>
                 <option value="monje">Monje</option>
                 <option value="paladin">Paladín</option>
                 <option value="picaro">Pícaro</option>
                 <option value="brujo">Brujo</option>
               </select>
             </div>
             
             <div>
               <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                 NIVEL
               </label>
               <select
                 value={characterData.level}
                 onChange={!READ_ONLY_HEADER ? (e) => handleCharacterDataChange('level', parseInt(e.target.value) || 1) : undefined}
                 disabled={READ_ONLY_HEADER}
                 style={{
                   width: '100%',
                   padding: '6px',
                   border: '1px solid #333',
                   fontSize: '12px',
                   ...ro
                 }}
               >
                 <option value={1}>Nivel 1</option>
                 <option value={3}>Nivel 3</option>
                 <option value={5}>Nivel 5</option>
               </select>
             </div>
            
                         <div>
               <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                 TRASFONDO
               </label>
                               <select
                  value={characterData.background}
                  onChange={!READ_ONLY_HEADER ? (e) => handleCharacterDataChange('background', e.target.value) : undefined}
                  disabled={READ_ONLY_HEADER}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #333',
                    fontSize: '12px',
                    ...ro
                  }}
                >
                  <option value="">Seleccionar</option>
                  <option value="acolito">Acolito</option>
                  <option value="artesano">Artesano</option>
                  <option value="artista">Artista</option>
                  <option value="charlatan">Charlatán</option>
                  <option value="criminal">Criminal</option>
                  <option value="erudito">Erudito</option>
                  <option value="forastero">Forastero</option>
                  <option value="guardián">Guardián</option>
                  <option value="héroe">Héroe</option>
                  <option value="marinero">Marinero</option>
                  <option value="noble">Noble</option>
                  <option value="sabio">Sabio</option>
                  <option value="soldado">Soldado</option>
                </select>
             </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                NOMBRE DEL JUGADOR
              </label>
              <input
                type="text"
                value={characterData.playerName}
                onChange={!READ_ONLY_HEADER ? (e) => handleCharacterDataChange('playerName', e.target.value) : undefined}
                readOnly={READ_ONLY_HEADER}
                disabled={READ_ONLY_HEADER}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #333',
                  fontSize: '12px',
                  ...ro
                }}
              />
            </div>
            
                         <div>
               <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                 RAZA
               </label>
                               <select
                  value={characterData.race}
                  onChange={!READ_ONLY_HEADER ? (e) => handleCharacterDataChange('race', e.target.value) : undefined}
                  disabled={READ_ONLY_HEADER}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #333',
                    fontSize: '12px',
                    ...ro
                  }}
                >
                  <option value="">Seleccionar</option>
                  <option value="humano">Humano</option>
                  <option value="elfo">Elfo</option>
                  <option value="enano">Enano</option>
                  <option value="mediano">Mediano</option>
                  <option value="dragonborn">Dragonborn</option>
                  <option value="gnomo">Gnomo</option>
                  <option value="semielfo">Semielfo</option>
                  <option value="semiorco">Semiorco</option>
                  <option value="tiefling">Tiefling</option>
                </select>
             </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                ALINEAMIENTO
              </label>
              <select
                value={characterData.alignment || ''}
                disabled={true}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid #333',
                  background: '#f0f0f0',
                  fontSize: '12px',
                  cursor: 'not-allowed'
                }}
              >
                <option value="">Seleccionar</option>
                <option value="Legal Bueno">Legal Bueno</option>
                <option value="Neutral Bueno">Neutral Bueno</option>
                <option value="Caótico Bueno">Caótico Bueno</option>
                <option value="Legal Neutral">Legal Neutral</option>
                <option value="Neutral">Neutral</option>
                <option value="Caótico Neutral">Caótico Neutral</option>
                <option value="Legal Malvado">Legal Malvado</option>
                <option value="Neutral Malvado">Neutral Malvado</option>
                <option value="Caótico Malvado">Caótico Malvado</option>
              </select>
            </div>
            
                         {/* PUNTOS DE EXPERIENCIA - OCULTO PARA EL JUGADOR, DISPONIBLE PARA EL DM */}
             <div style={{ display: 'none' }}>
               <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                 PUNTOS DE EXPERIENCIA
               </label>
               <input
                 type="number"
                 value={characterData.experience}
                 onChange={(e) => handleCharacterDataChange('experience', parseInt(e.target.value) || 0)}
                 style={{
                   width: '100%',
                   padding: '6px',
                   border: '1px solid #333',
                   background: 'white',
                   fontSize: '12px'
                 }}
               />
             </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '20px',
        minHeight: '600px'
      }}>
        {/* Left Column - Abilities, Saving Throws, Skills */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Left Sub-column - Ability Scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
            {/* Ability Scores */}
            <div style={{
              border: '2px solid #333',
              padding: '15px',
              background: 'white'
            }}>
              <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', fontWeight: 'bold' }}>
                CARACTERÍSTICAS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'strength', label: 'FUERZA', abbr: 'FUE' },
                  { name: 'dexterity', label: 'DESTREZA', abbr: 'DES' },
                  { name: 'constitution', label: 'CONSTITUCIÓN', abbr: 'CON' },
                  { name: 'intelligence', label: 'INTELIGENCIA', abbr: 'INT' },
                  { name: 'wisdom', label: 'SABIDURÍA', abbr: 'SAB' },
                  { name: 'charisma', label: 'CARISMA', abbr: 'CAR' }
                ].map(ability => (
                  <div key={ability.name} style={{
                    position: 'relative',
                    border: '2px solid #333',
                    borderRadius: '8px 8px 12px 12px',
                    padding: '12px',
                    background: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    marginBottom: '8px'
                  }}>
                    {/* Decorative top border */}
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      right: '-2px',
                      height: '4px',
                      background: 'linear-gradient(90deg, #333 0%, #666 50%, #333 100%)',
                      borderRadius: '6px 6px 0 0'
                    }} />
                    
                    {/* Ability name */}
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      textAlign: 'center',
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      {ability.label}
                    </div>
                    
                    {/* Main ability score input */}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      border: '2px solid #333',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto',
                      background: 'white',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <input
                        type="number"
                        value={characterData[ability.name]}
                         disabled={true}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          textAlign: 'center',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          background: 'transparent',
                           color: '#333',
                           cursor: 'not-allowed'
                        }}
                      />
                    </div>
                    
                    {/* Modifier display */}
                    <div style={{
                      width: '35px',
                      height: '25px',
                      border: '2px solid #333',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      background: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: getAbilityModifier(characterData[ability.name]) >= 0 ? '#006600' : '#cc0000',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {getAbilityModifier(characterData[ability.name]) >= 0 ? '+' : ''}{getAbilityModifier(characterData[ability.name])}
                    </div>
                    
                    {/* Decorative bottom flourish */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '40px',
                      height: '8px',
                      background: 'linear-gradient(90deg, transparent 0%, #333 20%, #333 80%, transparent 100%)',
                      borderRadius: '0 0 4px 4px'
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sub-column - Inspiration, Saving Throws, Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
            {/* Inspiration & Proficiency Bonus */}
            <div style={{
              border: '2px solid #333',
              padding: '15px',
              background: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <input
                    type="checkbox"
                    checked={characterData.inspiration}
                     disabled={true}
                     style={{ 
                       width: '20px', 
                       height: '20px', 
                       cursor: 'not-allowed',
                       accentColor: characterData.inspiration ? '#4CAF50' : '#ccc',
                       WebkitAppearance: 'none',
                       appearance: 'none',
                       border: '2px solid #ccc',
                       borderRadius: '3px',
                       backgroundColor: characterData.inspiration ? '#4CAF50' : 'white',
                       position: 'relative'
                     }}
                  />
                  {characterData.inspiration && (
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      left: '6px',
                      width: '6px',
                      height: '10px',
                      border: '2px solid white',
                      borderTop: 'none',
                      borderLeft: 'none',
                      transform: 'rotate(45deg)',
                      pointerEvents: 'none'
                    }} />
                  )}
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>INSPIRACIÓN</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>BONIFICADOR POR COMPETENCIA</span>
                <input
                  type="number"
                  value={characterData.proficiencyBonus}
                   disabled={true}
                  style={{
                    width: '50px',
                    padding: '5px',
                    border: '1px solid #333',
                    textAlign: 'center',
                    fontSize: '16px',
                     fontWeight: 'bold',
                     background: '#f0f0f0',
                     cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>

            {/* Saving Throws */}
            <div style={{
              border: '2px solid #333',
              padding: '15px',
              background: 'white'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '14px' }}>
                TIRADAS DE SALVACIÓN
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'strength', label: 'Fuerza' },
                  { name: 'dexterity', label: 'Destreza' },
                  { name: 'constitution', label: 'Constitución' },
                  { name: 'intelligence', label: 'Inteligencia' },
                  { name: 'wisdom', label: 'Sabiduría' },
                  { name: 'charisma', label: 'Carisma' }
                 ].map(ability => {
                   // Verificar que la estructura existe
                   const savingThrow = characterData.savingThrows?.[ability.name] || { proficient: false, modifier: 0 };
                   return (
                  <div key={ability.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <input
                        type="checkbox"
                            checked={savingThrow.proficient}
                            disabled={true}
                            style={{ 
                              width: '16px', 
                              height: '16px', 
                              cursor: 'not-allowed',
                              accentColor: savingThrow.proficient ? '#4CAF50' : '#ccc',
                              WebkitAppearance: 'none',
                              appearance: 'none',
                              border: '2px solid #ccc',
                              borderRadius: '2px',
                              backgroundColor: savingThrow.proficient ? '#4CAF50' : 'white',
                              position: 'relative'
                            }}
                      />
                      {savingThrow.proficient && (
                        <div style={{
                          position: 'absolute',
                          top: '1px',
                          left: '5px',
                          width: '4px',
                          height: '8px',
                          border: '2px solid white',
                          borderTop: 'none',
                          borderLeft: 'none',
                          transform: 'rotate(45deg)',
                          pointerEvents: 'none'
                        }} />
                      )}
                    </div>
                    <span style={{ fontSize: '12px', minWidth: '80px' }}>{ability.label}</span>
                    <input
                      type="number"
                          value={savingThrow.modifier}
                          disabled={true}
                      style={{
                        width: '40px',
                        padding: '3px',
                        border: '1px solid #333',
                        textAlign: 'center',
                            fontSize: '12px',
                            background: '#f0f0f0',
                            cursor: 'not-allowed'
                      }}
                    />
                  </div>
                   );
                 })}
              </div>
            </div>

            {/* Skills */}
            <div style={{
              border: '2px solid #333',
              padding: '15px',
              background: 'white'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '14px' }}>
                HABILIDADES
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { name: 'acrobatics', label: 'Acrobacias', ability: 'dexterity' },
                  { name: 'athletics', label: 'Atletismo', ability: 'strength' },
                  { name: 'arcana', label: 'C. Arcano', ability: 'intelligence' },
                  { name: 'deception', label: 'Engaño', ability: 'charisma' },
                  { name: 'history', label: 'Historia', ability: 'intelligence' },
                  { name: 'insight', label: 'Perspicacia', ability: 'wisdom' },
                  { name: 'intimidation', label: 'Intimidación', ability: 'charisma' },
                  { name: 'investigation', label: 'Investigación', ability: 'intelligence' },
                  { name: 'medicine', label: 'Medicina', ability: 'wisdom' },
                  { name: 'nature', label: 'Naturaleza', ability: 'intelligence' },
                  { name: 'perception', label: 'Percepción', ability: 'wisdom' },
                  { name: 'performance', label: 'Interpretación', ability: 'charisma' },
                  { name: 'persuasion', label: 'Persuasión', ability: 'charisma' },
                  { name: 'religion', label: 'Religión', ability: 'intelligence' },
                  { name: 'sleightOfHand', label: 'Juego de Manos', ability: 'dexterity' },
                  { name: 'stealth', label: 'Sigilo', ability: 'dexterity' },
                  { name: 'survival', label: 'Supervivencia', ability: 'wisdom' },
                  { name: 'animalHandling', label: 'T. con Animales', ability: 'wisdom' }
                 ].map(skill => {
                   // Verificar que la estructura existe
                   const skillData = characterData.skills?.[skill.name] || { proficient: false, modifier: 0 };
                   console.log(`Skill ${skill.name}:`, skillData);
                   return (
                  <div key={skill.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <input
                        type="checkbox"
                           checked={skillData.proficient}
                           disabled={true}
                           style={{ 
                             width: '14px', 
                             height: '14px', 
                             cursor: 'not-allowed',
                             accentColor: skillData.proficient ? '#4CAF50' : '#ccc',
                             WebkitAppearance: 'none',
                             appearance: 'none',
                             border: '2px solid #ccc',
                             borderRadius: '2px',
                             backgroundColor: skillData.proficient ? '#4CAF50' : 'white',
                             position: 'relative'
                           }}
                      />
                      {skillData.proficient && (
                        <div style={{
                          position: 'absolute',
                          top: '1px',
                          left: '4px',
                          width: '3px',
                          height: '6px',
                          border: '2px solid white',
                          borderTop: 'none',
                          borderLeft: 'none',
                          transform: 'rotate(45deg)',
                          pointerEvents: 'none'
                        }} />
                      )}
                    </div>
                    <span style={{ fontSize: '11px', minWidth: '100px' }}>
                      {skill.label} ({skill.ability === 'dexterity' ? 'Des' : 
                                     skill.ability === 'strength' ? 'Fue' :
                                     skill.ability === 'constitution' ? 'Con' :
                                     skill.ability === 'intelligence' ? 'Int' :
                                     skill.ability === 'wisdom' ? 'Sab' : 'Car'})
                    </span>
                    <input
                      type="number"
                         value={skillData.modifier}
                         disabled={true}
                      style={{
                        width: '35px',
                        padding: '2px',
                        border: '1px solid #333',
                        textAlign: 'center',
                           fontSize: '11px',
                           background: '#f0f0f0',
                           cursor: 'not-allowed'
                      }}
                    />
                  </div>
                   );
                 })}
              </div>
            </div>

            {/* Passive Perception */}
            <div style={{
              border: '2px solid #333',
              padding: '15px',
              background: 'white'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px' }}>
                SABIDURÍA (PERCEPCIÓN) PASIVA
              </h3>
              <input
                type="number"
                value={characterData.passivePerception}
                 disabled={true}
                style={{
                  width: '60px',
                  padding: '8px',
                  border: '2px solid #333',
                  textAlign: 'center',
                  fontSize: '16px',
                   fontWeight: 'bold',
                   background: '#f0f0f0',
                   cursor: 'not-allowed'
                }}
              />
            </div>

            {/* Other Proficiencies */}
            <div style={{
              border: '2px solid #333',
              padding: '15px',
              background: 'white'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px' }}>
                OTRAS COMPETENCIAS E IDIOMAS
              </h3>
              <textarea
                value={characterData.otherProficiencies}
                 disabled={true}
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '8px',
                  border: '1px solid #333',
                  resize: 'none',
                  fontSize: '12px',
                   lineHeight: '1.4',
                   background: '#f0f0f0',
                   cursor: 'not-allowed'
                }}
                placeholder="Lista tus otras competencias e idiomas..."
              />
            </div>
          </div>
        </div>

        {/* Middle Column - Combat & Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Combat Stats */}
          <div style={{
            border: '2px solid #333',
            padding: '15px',
            background: 'white'
          }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', fontWeight: 'bold' }}>
              ESTADÍSTICAS DE COMBATE
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                             <div style={{ textAlign: 'center' }}>
                 <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                   CLASE DE ARMADURA
                 </label>
                 <div style={{
                   width: '60px',
                   padding: '8px',
                   border: '2px solid #333',
                   textAlign: 'center',
                   fontSize: '18px',
                   fontWeight: 'bold',
                   background: '#f0f0f0',
                   color: '#333',
                   margin: '0 auto'
                 }}>
                   {calculateArmorClass()}
                 </div>
                 <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                   {characterData.armor ? `Armadura: ${characterData.armor}` : 'Sin armadura'}
                   {(characterData.shield === 'escudo' || characterData.shield === 'escudo de madera') && ' + Escudo'}
                 </div>
               </div>
              
              <div style={{ textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  INICIATIVA
                </label>
                <div style={{
                  width: '60px',
                  padding: '8px',
                  border: '2px solid #333',
                  textAlign: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  background: '#f0f0f0',
                  margin: '0 auto'
                }}>
                  {characterData.initiative}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  VELOCIDAD
                </label>
                <input
                  type="number"
                  value={characterData.speed}
                  onChange={(e) => handleCharacterDataChange('speed', parseInt(e.target.value) || 0)}
                  style={{
                    width: '60px',
                    padding: '8px',
                    border: '2px solid #333',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hit Points */}
          <div style={{
            border: '2px solid #333',
            padding: '15px',
            background: 'white'
          }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', fontWeight: 'bold' }}>
              PUNTOS DE GOLPE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  Puntos de golpe máximos
                </label>
                <input
                  type="number"
                  value={characterData.maxHP}
                  onChange={(e) => handleCharacterDataChange('maxHP', parseInt(e.target.value) || 0)}
                  disabled={true}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #333',
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  PUNTOS DE GOLPE ACTUALES
                </label>
                <input
                  type="number"
                  value={characterData.currentHP}
                  onChange={(e) => handleCharacterDataChange('currentHP', parseInt(e.target.value) || 0)}
                  disabled={true}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #333',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  PUNTOS DE GOLPE TEMPORALES
                </label>
                <input
                  type="number"
                  value={characterData.tempHP}
                  onChange={(e) => handleCharacterDataChange('tempHP', parseInt(e.target.value) || 0)}
                  disabled={true}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #333',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hit Dice */}
          <div style={{
            border: '2px solid #333',
            padding: '15px',
            background: 'white'
          }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', fontWeight: 'bold' }}>
              DADOS DE GOLPE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  Total
                </label>
                <input
                  type="text"
                  value={characterData.hitDice}
                  onChange={(e) => handleCharacterDataChange('hitDice', e.target.value)}
                  disabled={true}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #333',
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Death Saves */}
          <div style={{
            border: '2px solid #333',
            padding: '15px',
            background: 'white'
          }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', fontWeight: 'bold' }}>
              SALVACIONES CONTRA MUERTE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '12px', minWidth: '60px' }}>ÉXITOS</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[1, 2, 3].map(num => (
                    <div
                      key={`success-${num}`}
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #333',
                        borderRadius: '50%',
                        backgroundColor: characterData.deathSaves.successes >= num ? '#000' : 'white',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const newSuccesses = characterData.deathSaves.successes === num ? num - 1 : num
                        setCharacterData(prev => ({
                          ...prev,
                          deathSaves: { ...prev.deathSaves, successes: newSuccesses }
                        }))
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '12px', minWidth: '60px' }}>FALLOS</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[1, 2, 3].map(num => (
                    <div
                      key={`failure-${num}`}
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #333',
                        borderRadius: '50%',
                        backgroundColor: characterData.deathSaves.failures >= num ? '#000' : 'white',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const newFailures = characterData.deathSaves.failures === num ? num - 1 : num
                        setCharacterData(prev => ({
                          ...prev,
                          deathSaves: { ...prev.deathSaves, failures: newFailures }
                        }))
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Attacks & Spellcasting */}
          <div style={{
            border: '2px solid #333',
            padding: '15px',
            background: 'white'
          }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', fontWeight: 'bold' }}>
              ATAQUES Y LANZAMIENTO DE CONJUROS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Attack Table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>NOMBRE</div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>BONIFICADOR</div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>DAÑO/TIPO</div>
              </div>
              {characterData.attacks.map((attack, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                  <input
                    type="text"
                    value={attack.name}
                    readOnly
                    disabled
                    style={{
                      padding: '4px',
                      border: '1px solid #333',
                      fontSize: '11px',
                      background: '#f0f0f0',
                      cursor: 'not-allowed'
                    }}
                  />
                  <input
                    type="text"
                    value={attack.bonus}
                    readOnly
                    disabled
                    style={{
                      padding: '4px',
                      border: '1px solid #333',
                      fontSize: '11px',
                      background: '#f0f0f0',
                      cursor: 'not-allowed'
                    }}
                  />
                  <input
                    type="text"
                    value={attack.damage}
                    readOnly
                    disabled
                    style={{
                      padding: '4px',
                      border: '1px solid #333',
                      fontSize: '11px',
                      background: '#f0f0f0',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
              ))}
              {/* Additional attacks text area */}
              <textarea
                placeholder="Ataques adicionales, conjuros, etc..."
                style={{
                  width: '100%',
                  height: '60px',
                  padding: '8px',
                  border: '1px solid #333',
                  resize: 'none',
                  fontSize: '11px',
                  lineHeight: '1.4'
                }}
              />
            </div>
          </div>

                     {/* Equipment - Organized Sections */}
           <div style={{
             border: '2px solid #333',
             padding: '15px',
             background: 'white'
           }}>
             <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', fontWeight: 'bold' }}>
               EQUIPO Y ARMAMENTO
             </h3>
             
                           {/* Armor Section */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px', color: '#333' }}>
                  ARMADURA {characterData.creationMode === 'classic' && <span style={{ color: '#666', fontSize: '11px' }}>(Automática)</span>}
                </h4>
                <select
                  value={characterData.armor || ''}
                  disabled={true}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #333',
                    background: '#f0f0f0',
                    fontSize: '12px',
                    marginBottom: '5px',
                    cursor: 'not-allowed'
                  }}
                >
                  <option value="">Sin armadura</option>
                  <option value="armadura de cuero">Armadura de cuero (AC 11 + Des)</option>
                  <option value="armadura de cuero tachonada">Armadura de cuero tachonada (AC 12 + Des)</option>
                  <option value="armadura de escamas">Armadura de escamas (AC 14 + Des máx +2)</option>
                  <option value="cota de malla">Cota de malla (AC 16 + Des máx +2)</option>
                  <option value="armadura de bandas">Armadura de bandas (AC 17)</option>
                  <option value="armadura de placas">Armadura de placas (AC 18)</option>
                </select>
              </div>

                           {/* Shield Section */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px', color: '#333' }}>
                  ESCUDO {characterData.creationMode === 'classic' && <span style={{ color: '#666', fontSize: '11px' }}>(Automático)</span>}
                </h4>
                <select
                  value={characterData.shield || ''}
                  disabled={true}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #333',
                    background: '#f0f0f0',
                    fontSize: '12px',
                    marginBottom: '5px',
                    cursor: 'not-allowed'
                  }}
                >
                  <option value="">Sin escudo</option>
                  <option value="escudo">Escudo (+2 AC)</option>
                  <option value="escudo de madera">Escudo de madera (+2 AC)</option>
                </select>
              </div>

                           {/* Weapons Section */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px', color: '#333' }}>
                  ARMAS PRINCIPALES {characterData.creationMode === 'classic' && <span style={{ color: '#666', fontSize: '11px' }}>(Automáticas)</span>}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <select
                    value={characterData.weapon1 || ''}
                    disabled={true}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #333',
                      background: '#f0f0f0',
                      fontSize: '12px',
                      cursor: 'not-allowed'
                    }}
                  >
                    <option value="">Arma 1</option>
                    <option value="espada larga">Espada larga (1d8/1d10)</option>
                    <option value="espada corta">Espada corta (1d6)</option>
                    <option value="hacha de guerra">Hacha de guerra (1d8/1d10)</option>
                    <option value="maza">Maza (1d6)</option>
                    <option value="bastón">Bastón (1d6)</option>
                    <option value="daga">Daga (1d4)</option>
                    <option value="arco corto">Arco corto (1d6)</option>
                    <option value="arco largo">Arco largo (1d8)</option>
                    <option value="ballesta ligera">Ballesta ligera (1d8)</option>
                    <option value="jabalina">Jabalina (1d6)</option>
                  </select>
                  
                  <select
                    value={characterData.weapon2 || ''}
                    disabled={true}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #333',
                      background: '#f0f0f0',
                      fontSize: '12px',
                      cursor: 'not-allowed'
                    }}
                  >
                    <option value="">Arma 2</option>
                    <option value="espada larga">Espada larga (1d8/1d10)</option>
                    <option value="espada corta">Espada corta (1d6)</option>
                    <option value="hacha de guerra">Hacha de guerra (1d8/1d10)</option>
                    <option value="maza">Maza (1d6)</option>
                    <option value="bastón">Bastón (1d6)</option>
                    <option value="daga">Daga (1d4)</option>
                    <option value="arco corto">Arco corto (1d6)</option>
                    <option value="arco largo">Arco largo (1d8)</option>
                    <option value="ballesta ligera">Ballesta ligera (1d8)</option>
                    <option value="jabalina">Jabalina (1d6)</option>
                  </select>
                </div>
              </div>

                           {/* Other Equipment */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px', color: '#333' }}>
                  OTRO EQUIPO {characterData.creationMode === 'classic' && <span style={{ color: '#666', fontSize: '11px' }}>(Automático)</span>}
                </h4>
                <textarea
                  value={characterData.otherEquipment || ''}
                  readOnly
                  disabled
                  style={{
                    width: '100%',
                    height: '60px',
                    padding: '6px',
                    border: '1px solid #333',
                    resize: 'none',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    background: '#f0f0f0',
                    cursor: 'not-allowed'
                  }}
                  placeholder="Equipo automático según la clase seleccionada"
                />
              </div>

             {/* Equipment Summary */}
             <div style={{ 
               border: '1px solid #ccc', 
               padding: '8px', 
               background: '#f9f9f9',
               fontSize: '11px',
               color: '#666'
             }}>
               <strong>Equipo actual:</strong><br/>
               {characterData.armor && `Armadura: ${characterData.armor}`}<br/>
               {characterData.shield && `Escudo: ${characterData.shield}`}<br/>
               {characterData.weapon1 && `Arma 1: ${characterData.weapon1}`}<br/>
               {characterData.weapon2 && `Arma 2: ${characterData.weapon2}`}<br/>
               {characterData.otherEquipment && `Otros: ${characterData.otherEquipment}`}
             </div>
           </div>
        </div>

                 {/* Right Column - Personality & Features */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           {/* Mecánicas de Clase */}
           <div style={{
             border: '2px solid #333',
             padding: '15px',
             background: 'white'
           }}>
             <h3 style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
               ⚔️ MECÁNICAS DE CLASE
             </h3>
             
             {/* Contenido dinámico según la clase */}
             {characterData.class === 'bardo' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #4CAF50',
                   borderRadius: '8px',
                   background: '#E8F5E8',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2E7D32', marginBottom: '5px' }}>
                     🎵 Inspiración Bárdica
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Usos por descanso largo: <strong>3</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Otorga 1d6 de bonificación a tiradas de ataque, salvación o habilidad
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'barbaro' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #F44336',
                   borderRadius: '8px',
                   background: '#FFEBEE',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#C62828', marginBottom: '5px' }}>
                     🔥 Furia
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Usos por descanso largo: <strong>2</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     +2 daño con armas cuerpo a cuerpo, resistencia a daño contundente, perforante y cortante
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'druida' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #8BC34A',
                   borderRadius: '8px',
                   background: '#F1F8E9',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#558B2F', marginBottom: '5px' }}>
                     🐺 Forma Salvaje
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Usos por descanso largo: <strong>2</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Transformación en bestia CR 1/4 o menor, mantienes mentalidad y HP
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'picaro' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #9C27B0',
                   borderRadius: '8px',
                   background: '#F3E5F5',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#6A1B9A', marginBottom: '5px' }}>
                     🗡️ Ataque Furtivo
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Daño adicional: <strong>1d6</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Activa cuando tienes ventaja o un aliado está a 5 pies del objetivo
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'monje' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #FF9800',
                   borderRadius: '8px',
                   background: '#FFF3E0',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#E65100', marginBottom: '5px' }}>
                     👊 Ki
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Puntos de Ki: <strong>4</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Recuperas todos los puntos de Ki al completar un descanso corto o largo
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'paladin' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #2196F3',
                   borderRadius: '8px',
                   background: '#E3F2FD',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1565C0', marginBottom: '5px' }}>
                     ⚡ Curación Divina
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Puntos de curación: <strong>5 × nivel de paladín</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Recuperas todos los puntos al completar un descanso largo
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'brujo' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #673AB7',
                   borderRadius: '8px',
                   background: '#EDE7F6',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#4527A0', marginBottom: '5px' }}>
                     🔮 Puntos de Brujo
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Puntos disponibles: <strong>1</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Recuperas todos los puntos al completar un descanso corto o largo
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'guerrero' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #795548',
                   borderRadius: '8px',
                   background: '#EFEBE9',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#4E342E', marginBottom: '5px' }}>
                     ⚔️ Segundo Viento
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Usos por descanso corto: <strong>1</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Recupera 1d10 + nivel de guerrero puntos de golpe
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'clerigo' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #FFC107',
                   borderRadius: '8px',
                   background: '#FFF8E1',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#F57F17', marginBottom: '5px' }}>
                     ✨ Canalizar Divinidad
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Usos por descanso corto: <strong>1</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Recuperas todos los usos al completar un descanso corto o largo
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'hechicero' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #E91E63',
                   borderRadius: '8px',
                   background: '#FCE4EC',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#AD1457', marginBottom: '5px' }}>
                     🌟 Puntos de Hechicería
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Puntos disponibles: <strong>4</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Recuperas todos los puntos al completar un descanso largo
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'mago' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #00BCD4',
                   borderRadius: '8px',
                   background: '#E0F7FA',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#00695C', marginBottom: '5px' }}>
                     📚 Recuperación Arcana
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Nivel máximo: <strong>1</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     Recupera ranuras de conjuro de nivel 1 al completar un descanso corto
                   </div>
                 </div>
               </div>
             )}
             
             {characterData.class === 'explorador' && (
               <div style={{ textAlign: 'center' }}>
                 <div style={{
                   display: 'inline-block',
                   padding: '10px 20px',
                   border: '2px solid #4CAF50',
                   borderRadius: '8px',
                   background: '#E8F5E8',
                   marginBottom: '10px'
                 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2E7D32', marginBottom: '5px' }}>
                     🏹 Estilo de Combate
                   </div>
                   <div style={{ fontSize: '14px', color: '#666' }}>
                     Estilo: <strong>Arquero</strong>
                   </div>
                   <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                     +2 a tiradas de ataque con armas a distancia
                   </div>
                 </div>
               </div>
             )}
             
             {!characterData.class && (
               <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                 Selecciona una clase para ver sus mecánicas especiales
               </div>
             )}
           </div>

           {/* Personalidad del Personaje */}
           <div style={{
             border: '2px solid #333',
             padding: '15px',
             background: 'white'
           }}>
             <h3 style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '14px' }}>
               PERSONALIDAD DEL PERSONAJE
             </h3>
            
            {/* Mostrar personalidad actual */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '13px', color: '#4CAF50' }}>
                  RASGO DE PERSONALIDAD:
                </h4>
                <div
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    border: '1px solid #ddd',
                    background: '#f9f9f9',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px'
                  }}
                >
                  {characterData.personalityTrait || '—'}
                </div>
          </div>

              <div>
                <h4 style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '13px', color: '#4CAF50' }}>
                  IDEAL:
                </h4>
            <textarea
                  value={characterData.ideal}
                  readOnly
                  disabled
              style={{
                width: '100%',
                    padding: '5px',
                fontSize: '12px',
                    border: '1px solid #ddd',
                    background: '#f0f0f0',
                    resize: 'none',
                    height: '40px',
                    cursor: 'not-allowed'
              }}
                  placeholder="¿Cuál es el ideal que guía a tu personaje?"
            />
          </div>

              <div>
                <h4 style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '13px', color: '#4CAF50' }}>
                  VÍNCULO:
                </h4>
            <textarea
                  value={characterData.bond}
                  readOnly
                  disabled
              style={{
                width: '100%',
                    padding: '5px',
                fontSize: '12px',
                    border: '1px solid #ddd',
                    background: '#f0f0f0',
                    resize: 'none',
                height: '40px',
                cursor: 'not-allowed'
              }}
              placeholder="¿Qué vínculos tiene tu personaje con personas, lugares o eventos?"
            />
          </div>

              <div>
                <h4 style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '13px', color: '#4CAF50' }}>
                  DEFECTO:
                </h4>
             <textarea
                  value={characterData.flaw}
                  readOnly
                  disabled
               style={{
                 width: '100%',
                    padding: '5px',
                 fontSize: '12px',
                    border: '1px solid #ddd',
                    background: '#f0f0f0',
                    resize: 'none',
                    height: '40px',
                    cursor: 'not-allowed'
               }}
                  placeholder="¿Cuál es el defecto o debilidad de tu personaje?"
             />
              </div>
            </div>
           </div>

           {/* Features & Traits */}
           <div style={{
             border: '2px solid #333',
             padding: '15px',
             background: 'white'
           }}>
             <h3 style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '14px' }}>
               RASGOS Y ATRIBUTOS
             </h3>
             <div style={{
               width: '100%',
               height: '200px',
               padding: '8px',
               border: '1px solid #333',
               fontSize: '11px',
               lineHeight: '1.3',
               overflowY: 'auto',
               background: '#f9f9f9',
               whiteSpace: 'pre-line'
             }}>
               {characterData.race && characterData.background && characterData.class ? 
                 getCharacterTraits(characterData.race, characterData.background, characterData.class) :
                 "Lista aquí los rasgos raciales, características de clase, dotes, y otros atributos especiales de tu personaje..."
               }
             </div>
           </div>
         </div>
       </div>

      {/* Footer */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        borderTop: '2px solid #333',
        textAlign: 'center',
        fontSize: '12px',
        color: '#666'
      }}>
        <p style={{ margin: '0' }}>
          TM y ©2014 Wizards of the Coast LLC. Tienes permiso para fotocopiar este documento para uso personal.
        </p>
      </div>
    </div>
  )
  }
}

export default App

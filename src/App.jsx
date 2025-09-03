import React, { useState, useEffect } from 'react'
import CharacterCreation from './components/CharacterCreation'
import CampaignManager from './components/CampaignManager'
import CharacterSheet from './components/sheet/CharacterSheet'
import CharacterManager from './components/CharacterManager'
import GameOptions from './components/GameOptions'
import GameArea from './components/GameArea'
import CharacterStatsViewer from './components/CharacterStatsViewer'
import { getCharacterTraits, getCharacterDescription } from './data/characterTraits'
import { raceData, classData, backgroundData, savingThrowsByClass, classSkillOptions } from './data/gameData'
import { classEquipment } from './data/classEquipment'
import { backgroundPersonalities } from './utils/backgroundPersonalities'
import { initializeFileSystem } from './utils/fileSystemUtils'
import { getSpellSlots, CASTER_TYPE } from './data/spellcastingData'
import gameSaveService from './utils/gameSaveService'

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
  const [creationMode, setCreationMode] = useState('guided') // 'guided', 'custom', 'random'
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameState, setGameState] = useState(null)
  const [showCharacterSheet, setShowCharacterSheet] = useState(false)
  const [showCharacterStats, setShowCharacterStats] = useState(false)
  
     // Estado para la hoja de personaje
   const [sheetLocked, setSheetLocked] = useState(true); // true = NO editable (modo preview) - Solo se desbloquea durante subida de nivel
  
  // Estado para el sistema de archivos
  const [fileSystemInitialized, setFileSystemInitialized] = useState(false)
  
  // Estado para las opciones del juego
  const [showGameOptions, setShowGameOptions] = useState(false)
  const [gameOptions, setGameOptions] = useState({
    contentRating: 'PG-13',
    violenceLevel: 'moderate',
    worldStyle: 'medieval',
    difficulty: 'normal',
    combatStyle: 'tactical',
    magicLevel: 'standard',
    explorationStyle: 'detailed',
    roleplayStyle: 'balanced',
    aiStyle: 'balanced'
  })
  
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
    
    // Dotes y características
    feats: [], // Campo para almacenar las dotes del personaje
    
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
    deathSaves: { successes: 0, failures: 0 },
    
    // Campos para la Hoja 2 (Historia)
    age: '',
    eyes: '',
    height: '',
    skin: '',
    weight: '',
    hair: '',
    allies: '',
    allies2: '',
    backstory: '',
    extraTraits: '',
    treasure: '',
    appearance: '',
    
          // Campos para la Hoja 3 (Conjuros)
      cantrips: [],
      spells: []
   })

  // --- Helpers de normalización ---
  const normalize = (s='') =>
    s.toString().toLowerCase()
     .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // sin acentos

  // --- Helpers de lanzamiento de conjuros ---
  const ABILITY_BY_CLASS = {
    bardo: 'charisma', hechicero: 'charisma', brujo: 'charisma',
    mago: 'intelligence', clerigo: 'wisdom', druida: 'wisdom',
    paladin: 'charisma', ranger: 'wisdom'
  };

  const toMod = (score = 10) => Math.floor((Number(score) - 10) / 2);

  function computeSpellcastingBlock(ch) {
    const cls = (ch.class || '').toLowerCase();
    const level = ch.level || 1;
    const pb = ch.proficiencyBonus ?? 2;

    const ability = ABILITY_BY_CLASS[cls] || null;
    const abilityMod = ability ? toMod(ch[ability]) : 0;

    // slots por nivel (array de 9 posiciones)
    const slotsArray = getSpellSlots(cls, level);
    const spellSlots = {};
    slotsArray.forEach((count, idx) => {
      if (count > 0) {
        const lvl = idx + 1;
        const usedPrev = ch.spellSlots?.[lvl]?.used || 0;
        spellSlots[lvl] = { total: count, used: Math.min(usedPrev, count) };
      }
    });

    // nivel de conjurador para mostrar
    const casterType = CASTER_TYPE[cls];
    const casterLevel =
      casterType === 'half' ? Math.floor(level / 2) : level; // pact/full = level

    return {
      spellcasting: {
        class: cls,
        ability,
        abilityMod,
        attackBonus: ability ? pb + abilityMod : null,
        saveDC: ability ? 8 + pb + abilityMod : null,
        casterType,
        casterLevel
      },
      spellSlots
    };
  }

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

  const handleLoadCharacter = (characterData) => {
    console.log('Cargando personaje:', characterData)
    const normalizedData = ensureCharacterDataStructure(characterData)
    setCharacterData(normalizedData)
    setShowCharacterList(false)
    setSheetLocked(false) // Desbloquear la hoja para edición
  }

  // Función para guardar el personaje actual
  const handleSaveCharacter = async () => {
    if (!characterData.name || characterData.name.trim() === '') {
      alert('Por favor ingresa un nombre para el personaje antes de guardarlo');
      return;
    }
    
    console.log('Intentando guardar personaje:', characterData.name);
    console.log('fileSystemInitialized:', fileSystemInitialized);
    
    try {
      // Crear una copia del personaje con el estado de vida/muerte
      const characterWithStatus = {
        ...characterData,
        status: {
          alive: true,
          lastUpdated: new Date().toISOString()
        }
      };
      
      // Intentar usar el sistema de archivos si está disponible
      if (fileSystemInitialized) {
        console.log('Sistema de archivos inicializado, intentando guardar en archivo...');
        const { saveCharacterToFile } = await import('./utils/fileSystemUtils');
        const success = await saveCharacterToFile(characterWithStatus, characterData.name.trim());
        console.log('Resultado del guardado en archivo:', success);
        if (success) {
          alert(`Personaje "${characterData.name}" guardado exitosamente en archivo`);
          return;
        } else {
          console.log('Fallback a localStorage porque el guardado en archivo falló');
        }
      } else {
        console.log('Sistema de archivos no inicializado, usando localStorage');
      }
      
      // Fallback a localStorage
      const characterToSave = {
        id: Date.now().toString(),
        name: characterData.name.trim(),
        data: characterWithStatus,
        savedAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      const existingCharacters = JSON.parse(localStorage.getItem('savedCharacters') || '[]');
      const updatedCharacters = [...existingCharacters, characterToSave];
      localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
      
      alert(`Personaje "${characterData.name}" guardado exitosamente en localStorage`);
    } catch (error) {
      console.error('Error al guardar personaje:', error);
      alert('Error al guardar el personaje');
    }
  }

  // Función para borrar el personaje actual
  const handleDeleteCharacter = () => {
    if (confirm('¿Estás seguro de que quieres eliminar este personaje? Esta acción no se puede deshacer.')) {
      // Limpiar los datos del personaje
      setCharacterData({
        name: '',
        class: '',
        level: 1,
        edition: '5e-2014',
        background: '',
        playerName: '',
        race: '',
        alignment: '',
        experience: 0,
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        armorClass: 10,
        initiative: 0,
        speed: 30,
        maxHP: 10,
        currentHP: 10,
        tempHP: 0,
        hitDice: '1d10',
        hitDiceTotal: 1,
        proficiencyBonus: 2,
        inspiration: false,
        savingThrows: {
          strength: { proficient: false, modifier: 0 },
          dexterity: { proficient: false, modifier: 0 },
          constitution: { proficient: false, modifier: 0 },
          intelligence: { proficient: false, modifier: 0 },
          wisdom: { proficient: false, modifier: 0 },
          charisma: { proficient: false, modifier: 0 }
        },
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
        passivePerception: 10,
        otherProficiencies: '',
        personalityTrait: '',
        ideal: '',
        bond: '',
        flaw: '',
        features: '',
        equipment: '',
        armor: '',
        shield: '',
        weapon1: '',
        weapon2: '',
        otherEquipment: '',
        creationMode: 'classic',
        personalityMode: 'manual',
        attacks: [
          { name: '', bonus: '', damage: '' },
          { name: '', bonus: '', damage: '' },
          { name: '', bonus: '', damage: '' }
        ],
        deathSaves: { successes: 0, failures: 0 },
        age: '',
        eyes: '',
        height: '',
        skin: '',
        weight: '',
        hair: '',
        allies: '',
        allies2: '',
        backstory: '',
        extraTraits: '',
        treasure: '',
        appearance: '',
        cantrips: [],
        spells: [],
        feats: [] // Limpiar las dotes al eliminar el personaje
      });
      
      // Volver al menú principal
      setShowMenu(true);
      setShowCharacterList(false);
      setShowNewGameMenu(false);
      setSubmenuSource('');
      setIsCreatingCharacter(false);
      setShowCampaignManager(false);
      
      alert('Personaje eliminado exitosamente');
    }
  }

  const handleContinueGame = () => {
    console.log('Continuar partida')
    alert('Función de continuar partida en desarrollo')
  }

    const handleStartGame = async (character) => {
    console.log('Iniciando juego con personaje:', character)
  
    // Crear una copia del personaje para la campaña
    let characterCopy = JSON.parse(JSON.stringify(character))
    
    // Agregar estado de vida/muerte al personaje
    characterCopy.status = {
      alive: true,
      lastUpdated: new Date().toISOString()
    }
    
    // Inicializar mecánicas de clase si no existen
    if (!characterCopy.mechanics) {
      characterCopy.mechanics = {}
    }
  
    // Inicializar inspiración bárdica si es un bardo
    if (characterCopy.class === 'bardo' && !characterCopy.mechanics.bardicInspiration) {
      const maxUses = characterCopy.level >= 5 ? 3 : 2
      characterCopy.mechanics.bardicInspiration = {
        isActive: false,
        currentUses: 0,
        maxUses: maxUses
      }
    }
  
    // Crear el estado inicial del juego
    const initialGameState = {
      character: characterCopy,
      world: {
        currentLocation: 'Taberna del Dragón Durmiente',
        discoveredLocations: ['Taberna del Dragón Durmiente'],
        quests: [],
        npcs: {
          'Tabernero': {
            name: 'Gareth',
            description: 'Un hombre robusto y amigable que regenta la taberna',
            disposition: 'friendly',
            known: true
          }
        },
        events: [],
        weather: 'Soleado',
        timeOfDay: 'Mediodía'
      },
      combat: {
        isActive: false,
        currentEnemies: [],
        turn: 0,
        initiative: [],
        effects: []
      },
      messages: [],
      lastUpdate: new Date().toISOString()
    }
  
    // Si hay una campaña activa, guardar el estado inicial con la copia del personaje
    if (currentCampaignId) {
      gameSaveService.setCurrentCampaign(currentCampaignId);
      await gameSaveService.saveFullGameState(initialGameState, characterCopy);
    }
  
    setGameState(initialGameState)
    setIsPlaying(true)
    setShowMenu(false)
    setShowCharacterList(false)
    setShowNewGameMenu(false)
    setSubmenuSource('')
    setIsCreatingCharacter(false)
  }

  const handleBackToMenu = () => {
    setShowMenu(true)
    setIsPlaying(false)
    setGameState(null)
    setShowCharacterList(false)
    setShowNewGameMenu(false)
    setSubmenuSource('')
    setIsCreatingCharacter(false)
    setShowCampaignManager(false)
  }

  const handleUpdateGameState = (newGameState) => {
    setGameState(newGameState)
  }

  const handleCampaignSelect = async (campaignId, campaignData) => {
    console.log('Campaña seleccionada:', campaignId, campaignData);
    
    // Establecer la campaña actual
    setCurrentCampaignId(campaignId);
    gameSaveService.setCurrentCampaign(campaignId);
    
    // Si hay datos de campaña, cargarlos
    if (campaignData && campaignData.game_state && campaignData.game_state.game_state) {
      setGameState(campaignData.game_state.game_state);
      setIsPlaying(true);
      setShowMenu(false);
      setShowCampaignManager(false);
    } else {
      // Si no hay datos, ir al menú de nuevo juego
      setShowNewGameMenu(true);
      setShowCampaignManager(false);
    }
  }

  const handleNewCampaign = (campaignId) => {
    console.log('Nueva campaña creada:', campaignId);
    setCurrentCampaignId(campaignId);
    gameSaveService.setCurrentCampaign(campaignId);
    setShowNewGameMenu(true);
    setShowCampaignManager(false);
  }

  const handleShowCharacterSheet = () => {
    setShowCharacterSheet(true)
    setIsPlaying(false)
  }

  const handleBackToGame = () => {
    setShowCharacterSheet(false)
    setIsPlaying(true)
  }

  const handleOpenSettings = () => {
    console.log('Abrir opciones')
    setShowGameOptions(true)
  }

  const handleSaveGameOptions = (newOptions) => {
    console.log('Guardando opciones del juego:', newOptions)
    setGameOptions(newOptions)
    // Aquí podrías guardar las opciones en localStorage o en un archivo
    localStorage.setItem('gameOptions', JSON.stringify(newOptions))
  }

  const handleCloseGameOptions = () => {
    setShowGameOptions(false)
  }

  // Función para generar un personaje aleatorio
  const generateRandomCharacter = () => {
    const races = ['humano', 'elfo', 'enano', 'mediano', 'draconido', 'gnomo', 'semielfo', 'semiorco', 'tiefling']
    const classes = ['guerrero', 'mago', 'clerigo', 'bardo', 'barbaro', 'druida', 'monje', 'paladin', 'ranger', 'picaro', 'hechicero', 'brujo']
    const backgrounds = ['acolito', 'criminal', 'artista', 'heroe del pueblo', 'artesano', 'ermitaño', 'noble', 'forastero', 'sabio', 'marinero', 'soldado', 'huerfano']
    const alignments = ['Legal Bueno', 'Neutral Bueno', 'Caótico Bueno', 'Legal Neutral', 'Neutral', 'Caótico Neutral', 'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado']
    
    const randomRace = races[Math.floor(Math.random() * races.length)]
    const randomClass = classes[Math.floor(Math.random() * classes.length)]
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)]
    const randomAlignment = alignments[Math.floor(Math.random() * alignments.length)]
    
    // Generar características aleatorias (4d6, descartar el menor)
    const rollAbilityScore = () => {
      const rolls = []
      for (let i = 0; i < 4; i++) {
        rolls.push(Math.floor(Math.random() * 6) + 1)
      }
      rolls.sort((a, b) => b - a)
      return rolls[0] + rolls[1] + rolls[2]
    }
    
    const strength = rollAbilityScore()
    const dexterity = rollAbilityScore()
    const constitution = rollAbilityScore()
    const intelligence = rollAbilityScore()
    const wisdom = rollAbilityScore()
    const charisma = rollAbilityScore()
    
    // Calcular HP inicial basado en la clase
    const getHitDieForClass = (className) => {
      const hitDice = {
        'barbaro': 'd12',
        'guerrero': 'd10',
        'paladin': 'd10',
        'ranger': 'd10',
        'monje': 'd8',
        'bardo': 'd8',
        'clerigo': 'd8',
        'druida': 'd8',
        'picaro': 'd8',
        'mago': 'd6',
        'hechicero': 'd6',
        'brujo': 'd8'
      }
      return hitDice[className] || 'd8'
    }
    
    const hitDie = getHitDieForClass(randomClass)
    const conMod = Math.floor((constitution - 10) / 2)
    const maxHP = Math.max(1, Math.floor(Math.random() * parseInt(hitDie.replace('d', ''))) + 1 + conMod)
    
    return {
      name: `Personaje ${Math.floor(Math.random() * 1000)}`,
      class: randomClass,
      level: 1,
      edition: '5e-2014',
      background: randomBackground,
      playerName: '',
      race: randomRace,
      alignment: randomAlignment,
      experience: 0,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      armorClass: 10 + Math.floor((dexterity - 10) / 2),
      initiative: Math.floor((dexterity - 10) / 2),
      speed: 30,
      maxHP,
      currentHP: maxHP,
      tempHP: 0,
      hitDice: `1${hitDie}`,
      hitDiceTotal: 1,
      proficiencyBonus: 2,
      inspiration: false,
      savingThrows: {
        strength: { proficient: false, modifier: 0 },
        dexterity: { proficient: false, modifier: 0 },
        constitution: { proficient: false, modifier: 0 },
        intelligence: { proficient: false, modifier: 0 },
        wisdom: { proficient: false, modifier: 0 },
        charisma: { proficient: false, modifier: 0 }
      },
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
      passivePerception: 10,
      otherProficiencies: '',
      personalityTrait: '',
      ideal: '',
      bond: '',
      flaw: '',
      features: '',
      equipment: '',
      armor: '',
      shield: '',
      weapon1: '',
      weapon2: '',
      otherEquipment: '',
      creationMode: 'classic',
      personalityMode: 'manual',
      attacks: [
        { name: '', bonus: '', damage: '' },
        { name: '', bonus: '', damage: '' },
        { name: '', bonus: '', damage: '' }
      ],
      deathSaves: { successes: 0, failures: 0 },
      age: '',
      eyes: '',
      height: '',
      skin: '',
      weight: '',
      hair: '',
      allies: '',
      allies2: '',
      backstory: '',
      extraTraits: '',
      treasure: '',
      appearance: '',
      cantrips: [],
      spells: [],
      feats: [] // Personajes nuevos no tienen dotes
    }
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
    
    const result = {
      ...data,
      savingThrows: {
        ...defaultSavingThrows,
        ...(data.savingThrows || {})
      },
      skills: {
        ...defaultSkills,
        ...(data.skills || {})
      }
    };

    // >>> NUEVO: recalcular bloque de conjuros según clase/nivel
    const sc = computeSpellcastingBlock(result);
    result.spellSlots = sc.spellSlots;
    result.spellcasting = { ...(result.spellcasting || {}), ...sc.spellcasting };

    return result;
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

     // useEffect para inicializar el sistema de archivos al arrancar la aplicación
  useEffect(() => {
    const initFileSystem = async () => {
      try {
        const fileSystemAvailable = await initializeFileSystem();
        setFileSystemInitialized(true);
        console.log('Sistema de archivos inicializado:', fileSystemAvailable ? 'Disponible' : 'Usando almacenamiento local');
      } catch (error) {
        console.error('Error al inicializar sistema de archivos:', error);
        setFileSystemInitialized(true); // Continuar aunque falle
      }
    };
    
    initFileSystem();
  }, []);

  // useEffect para cargar las opciones del juego guardadas
  useEffect(() => {
    const savedOptions = localStorage.getItem('gameOptions');
    if (savedOptions) {
      try {
        const parsedOptions = JSON.parse(savedOptions);
        setGameOptions(parsedOptions);
        console.log('Opciones del juego cargadas desde localStorage');
      } catch (error) {
        console.error('Error al cargar opciones del juego:', error);
      }
    }
  }, []);

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
          onCampaignSelect={handleCampaignSelect}
          onNewCampaign={handleNewCampaign}
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
              setCreationMode('guided')
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
              setCreationMode('custom')
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

  // Mostrar gestor de personajes
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
              👥 GESTOR DE PERSONAJES
            </h1>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Guarda, carga y gestiona tus personajes
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
                        <CharacterManager
              characterData={characterData}
              onLoadCharacter={handleLoadCharacter}
              onStartGame={handleStartGame}
            />
          </div>

          {/* Botón de volver */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleBackToMenu}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ← Volver al Menú Principal
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Si estamos creando un personaje con el componente paso a paso
  if (isCreatingCharacter) {
    console.log('Intentando renderizar CharacterCreation...')
    try {
      return (
        <CharacterCreation 
          onBackToMenu={handleBackToMenu}
          onCharacterCreated={(finalCharacter) => {
            console.log('Personaje creado:', finalCharacter)
            // Asegurar que el personaje tenga toda la estructura necesaria
            const completeCharacter = ensureCharacterDataStructure(finalCharacter)
            setCharacterData(completeCharacter)
            setIsCreatingCharacter(false)
            // Guardar el personaje en la lista de personajes
            setSavedCharacters(prev => [...prev, completeCharacter])
          }}
          characterData={characterData}
          setCharacterData={setCharacterData}
          handleCharacterDataChange={handleCharacterDataChange}
          currentCampaignId={currentCampaignId}
          creationMode={creationMode}
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

  // Si estamos jugando, mostrar el área de juego
  if (isPlaying && gameState) {
    return (
      <GameArea
        gameState={gameState}
        updateGameState={handleUpdateGameState}
        onBackToMenu={handleBackToMenu}
        onShowCharacterSheet={handleShowCharacterSheet}
        onViewCharacterStats={() => setShowCharacterStats(true)}
        campaignId={currentCampaignId}
        gameOptions={gameOptions}
      />
    )
  }

  // Si estamos mostrando la hoja de personaje desde el juego
  if (showCharacterSheet && gameState) {
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
        {/* Controles de la hoja de personaje */}
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          display: 'flex',
          gap: '10px'
        }}>
          {/* Botón Volver al Juego */}
          <button
            onClick={handleBackToGame}
            style={{
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #0056b3 0%, #004085 100%)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🎮 Volver al Juego
          </button>

          {/* Botón Guardar */}
          <button
            onClick={handleSaveCharacter}
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
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
            💾 Guardar
          </button>

          {/* Botón Borrar */}
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de que quieres eliminar este personaje? Esta acción no se puede deshacer.')) {
                handleDeleteCharacter();
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🗑️ Borrar
          </button>

          {/* Botón Volver al Menú */}
          <button
            onClick={handleBackToMenu}
            style={{
              background: 'linear-gradient(135deg, #6c757d 0%, #343a40 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #343a40 0%, #212529 100%)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #6c757d 0%, #343a40 100%)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🏠 Volver al Menú
          </button>
        </div>

        <CharacterSheet
          characterData={gameState.character}
          setCharacterData={(data) => {
            const updatedGameState = { ...gameState, character: data }
            setGameState(updatedGameState)
          }}
          locked={sheetLocked}
          setLocked={setSheetLocked}
        />
      </div>
    )
  }

  // Si no estamos en el menú y no estamos creando con el componente paso a paso,
  // mostrar la hoja de personaje con el nuevo sistema de pestañas
  if (!showMenu && !isCreatingCharacter && !showCampaignManager && !showCharacterList && !showNewGameMenu && !isPlaying) {
    console.log('Mostrando hoja de personaje con nuevo sistema de pestañas')
    console.log('characterData en viewer:', characterData)

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
                           {/* Controles de la hoja de personaje */}
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 9999,
            display: 'flex',
            gap: '10px'
          }}>
            
            {/* Botón Guardar */}
            <button
              onClick={handleSaveCharacter}
              style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
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
              💾 Guardar
            </button>

            {/* Botón Borrar */}
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar este personaje? Esta acción no se puede deshacer.')) {
                  handleDeleteCharacter();
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              🗑️ Borrar
            </button>
            
            {/* Botón Volver al Menú */}
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

        {/* Título */}
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
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#666',
            margin: '0'
          }}>
            Hoja de Personaje
          </h2>
        </div>
        
        {/* Nuevo CharacterSheet con pestañas */}
        <CharacterSheet
          characterData={characterData}
          onChange={handleCharacterDataChange}
          locked={sheetLocked}
          onSaveCharacter={handleSaveCharacter}
          onDeleteCharacter={handleDeleteCharacter}
        />
      </div>
    )
  }

    // Mostrar menú principal
  return (
    <>
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #2D1810 0%, #8B4513 20%, #2D1810 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#DAA520',
          marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
          ⚔️ D&D 5E SOLITARIO - BETA
          </h1>
          
          <p style={{
          fontSize: '24px',
            color: '#F5F5DC',
          maxWidth: '600px',
          marginBottom: '40px',
            textAlign: 'center'
          }}>
          Crea tu personaje para el juego de rol de Dungeons & Dragons 5ta Edición.
          </p>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
             <button
             onClick={handleNewGame}
               style={{
               width: '300px',
               background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                  color: 'white',
                  fontWeight: 'bold',
               padding: '24px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
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
             🎲 Nueva Partida
              </button>
              <button
                onClick={handleCreateCharacter}
                style={{
               width: '300px',
               background: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '24px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
               fontSize: '20px',
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
             ⚙️ Crear Personaje
              </button>
              <button
             onClick={handleViewCharacters}
                style={{
               width: '300px',
               background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '24px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
               fontSize: '20px',
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
             <button
               onClick={handleContinueGame}
               style={{
               width: '300px',
               background: 'linear-gradient(135deg, #6c757d 0%, #343a40 100%)',
                 color: 'white',
                 fontWeight: 'bold',
                 padding: '24px 32px',
                 borderRadius: '12px',
                 border: 'none',
               cursor: 'pointer',
               fontSize: '20px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '16px',
                 boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
               transition: 'all 0.3s ease'
               }}
               onMouseOver={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #343a40 0%, #212529 100%)';
                   e.target.style.transform = 'scale(1.05)';
               }}
               onMouseOut={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #6c757d 0%, #343a40 100%)';
                   e.target.style.transform = 'scale(1)';
               }}
             >
             🔗 Continuar Partida
             </button>
             <button
               onClick={() => setShowCharacterStats(true)}
               disabled={!hasSavedGame}
               style={{
               width: '300px',
               background: hasSavedGame ? 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)' : 'linear-gradient(135deg, #6c757d 0%, #343a40 100%)',
                 color: 'white',
                 fontWeight: 'bold',
                 padding: '24px 32px',
                 borderRadius: '12px',
                 border: 'none',
                 cursor: hasSavedGame ? 'pointer' : 'not-allowed',
               fontSize: '20px',
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
                   e.target.style.background = 'linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%)';
                   e.target.style.transform = 'scale(1.05)';
                 }
               }}
               onMouseOut={(e) => {
                 if (hasSavedGame) {
                   e.target.style.background = 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)';
                   e.target.style.transform = 'scale(1)';
                 }
               }}
             >
               👥 Ver Estadísticas de Personajes
             </button>
             <button
               onClick={handleOpenSettings}
               style={{
               width: '300px',
               background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                 color: 'white',
                 fontWeight: 'bold',
                 padding: '24px 32px',
                 borderRadius: '12px',
                 border: 'none',
                 cursor: 'pointer',
               fontSize: '20px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '16px',
                 boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                 transition: 'all 0.3s ease'
               }}
               onMouseOver={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)';
                 e.target.style.transform = 'scale(1.05)';
               }}
               onMouseOut={(e) => {
               e.target.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                 e.target.style.transform = 'scale(1)';
               }}
             >
               ⚙️ Opciones
             </button>
           </div>
         </div>

         {/* Modal de Opciones del Juego */}
         {showGameOptions && (
           <GameOptions
             onClose={handleCloseGameOptions}
             onSave={handleSaveGameOptions}
             currentOptions={gameOptions}
           />
         )}

         {/* Modal de Estadísticas de Personajes */}
         {showCharacterStats && (
           <CharacterStatsViewer
             onClose={() => setShowCharacterStats(false)}
             campaignId={currentCampaignId}
             mainCharacter={gameState?.character}
           />
         )}
    </>
  );
}

export default App;

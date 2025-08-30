// Utilidades para inicializar una nueva partida de D&D

export const initializeGame = async () => {
  const character = {
    name: 'Aventurero',
    class: 'Guerrero',
    level: 1,
    race: 'Humano',
    maxHP: 12,
    currentHP: 12,
    armorClass: 15,
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 10,
    wisdom: 12,
    charisma: 8,
    experience: 0,
    experienceToNext: 300,
    inventory: [
      { name: 'Espada corta', type: 'weapon', damage: '1d6' },
      { name: 'Escudo', type: 'armor', bonus: 2 },
      { name: 'Poción de curación', type: 'consumable', uses: 1 }
    ],
    gold: 10,
    spells: [],
    abilities: []
  }

  const world = {
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
  }

  const defaultGameState = {
    id: generateGameId(),
    createdAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    version: '1.0.0',
    
    // Estado del personaje
    character: character,
    
    // Estado del mundo
    world: world,
    
    // Estado del combate
    combat: {
      isActive: false,
      currentEnemies: [],
      turn: 0,
      initiative: [],
      effects: []
    },
    
    // Historial de mensajes
    messages: [
      {
        id: 1,
        type: 'dm',
        content: `¡Bienvenido a tu aventura en solitario! 

Eres ${character.name}, un ${character.race} ${character.class} de nivel ${character.level}. 

Te encuentras en la ${world.currentLocation}, un lugar bullicioso donde los aventureros se reúnen para compartir historias y buscar trabajo.

¿Qué te gustaría hacer? Puedes:
- Explorar la taberna y hablar con otros clientes
- Preguntar al tabernero sobre trabajo disponible
- Salir a explorar el pueblo
- Revisar tu inventario y estadísticas

¡La aventura está en tus manos!`,
        timestamp: new Date().toISOString()
      }
    ],
    
    // Configuración del juego
    settings: {
      difficulty: 'normal',
      autoSave: true,
      showDiceRolls: true,
      language: 'es'
    },
    
    // Estadísticas del juego
    stats: {
      totalPlayTime: 0,
      messagesSent: 0,
      combatsWon: 0,
      itemsFound: 0,
      locationsDiscovered: 1
    }
  }
  
  return defaultGameState
}

const generateGameId = () => {
  return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export const createCharacter = (characterData) => {
  return {
    name: characterData.name || 'Aventurero',
    class: characterData.class || 'Guerrero',
    level: 1,
    race: characterData.race || 'Humano',
    maxHP: calculateMaxHP(characterData.class, characterData.constitution),
    currentHP: calculateMaxHP(characterData.class, characterData.constitution),
    armorClass: calculateArmorClass(characterData.dexterity),
    strength: characterData.strength || 10,
    dexterity: characterData.dexterity || 10,
    constitution: characterData.constitution || 10,
    intelligence: characterData.intelligence || 10,
    wisdom: characterData.wisdom || 10,
    charisma: characterData.charisma || 10,
    experience: 0,
    experienceToNext: 300,
    inventory: getStartingInventory(characterData.class),
    gold: 10,
    spells: getStartingSpells(characterData.class),
    abilities: getStartingAbilities(characterData.class)
  }
}

const calculateMaxHP = (characterClass, constitution) => {
  const baseHP = {
    'Guerrero': 10,
    'Mago': 6,
    'Clérigo': 8,
    'Pícaro': 8,
    'Ranger': 10,
    'Paladín': 10
  }
  
  const conModifier = Math.floor((constitution - 10) / 2)
  return baseHP[characterClass] + conModifier
}

const calculateArmorClass = (dexterity) => {
  const dexModifier = Math.floor((dexterity - 10) / 2)
  return 10 + dexModifier
}

const getStartingInventory = (characterClass) => {
  const inventories = {
    'Guerrero': [
      { name: 'Espada larga', type: 'weapon', damage: '1d8' },
      { name: 'Escudo', type: 'armor', bonus: 2 },
      { name: 'Armadura de cuero', type: 'armor', bonus: 1 }
    ],
    'Mago': [
      { name: 'Vara mágica', type: 'weapon', damage: '1d4' },
      { name: 'Componentes mágicos', type: 'material', quantity: 10 },
      { name: 'Libro de hechizos', type: 'tool' }
    ],
    'Clérigo': [
      { name: 'Maza', type: 'weapon', damage: '1d6' },
      { name: 'Símbolo sagrado', type: 'tool' },
      { name: 'Armadura de cuero', type: 'armor', bonus: 1 }
    ],
    'Pícaro': [
      { name: 'Dagas', type: 'weapon', damage: '1d4' },
      { name: 'Herramientas de ladrón', type: 'tool' },
      { name: 'Armadura de cuero', type: 'armor', bonus: 1 }
    ]
  }
  
  return inventories[characterClass] || inventories['Guerrero']
}

const getStartingSpells = (characterClass) => {
  const spells = {
    'Mago': [
      { name: 'Bola de fuego', level: 3, school: 'Evocación' },
      { name: 'Escudo', level: 1, school: 'Abjuración' },
      { name: 'Detección de magia', level: 1, school: 'Adivinación' }
    ],
    'Clérigo': [
      { name: 'Curar heridas', level: 1, school: 'Evocación' },
      { name: 'Bendecir', level: 1, school: 'Encantamiento' },
      { name: 'Detectar mal', level: 1, school: 'Adivinación' }
    ]
  }
  
  return spells[characterClass] || []
}

const getStartingAbilities = (characterClass) => {
  const abilities = {
    'Guerrero': ['Segunda oportunidad', 'Estilo de combate'],
    'Pícaro': ['Sigilo experto', 'Ataque furtivo'],
    'Ranger': ['Favorecer enemigo', 'Explorador natural']
  }
  
  return abilities[characterClass] || []
}

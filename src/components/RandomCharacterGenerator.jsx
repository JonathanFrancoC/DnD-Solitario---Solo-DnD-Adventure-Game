import React from 'react'
import { 
  classData, 
  raceData, 
  backgroundData, 
  savingThrowsByClass,
  classSkillOptions
} from '../data/gameData.js'
import { backgroundPersonalities } from '../utils/backgroundPersonalities'

const RandomCharacterGenerator = ({ onCharacterGenerated }) => {
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
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)]
    const randomAlignment = alignments[Math.floor(Math.random() * alignments.length)]
    const isMale = Math.random() > 0.5
    const firstName = isMale ? 
      maleNames[Math.floor(Math.random() * maleNames.length)] :
      femaleNames[Math.floor(Math.random() * femaleNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const playerName = `Jugador_${Math.floor(Math.random() * 1000)}`
    
    // Obtener estadísticas recomendadas de la clase (no aleatorias)
    const recommendedStats = classData[randomClass]?.recommendedStats || {
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
    }
    
    // Obtener datos de la raza para aplicar modificadores
    const raceModifiers = raceData[randomRace]?.abilityScoreIncrease || {}
    
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
    const hitDie = classData[randomClass]?.hitDie || 'd8'
    const constitutionModifier = Math.floor((finalStats.constitution - 10) / 2)
    const initialHP = Math.max(1, parseInt(hitDie.replace('d', '')) + constitutionModifier)
    
    // Obtener habilidades del trasfondo
    const backgroundSkills = backgroundData[randomBackground]?.skills || []
    
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
    
    // Personalidad desde tu tabla
    const persPack = backgroundPersonalities?.[randomBackground] || {
      personalityTraits: ['Prudente'], 
      ideals: ['Libertad'], 
      bonds: ['Un viejo amigo'], 
      flaws: ['Impulsivo']
    }
    const personalityTrait = persPack.personalityTraits?.[Math.floor(Math.random() * persPack.personalityTraits.length)] || ''
    const ideal = persPack.ideals?.[Math.floor(Math.random() * persPack.ideals.length)] || ''
    const bond = persPack.bonds?.[Math.floor(Math.random() * persPack.bonds.length)] || ''
    const flaw = persPack.flaws?.[Math.floor(Math.random() * persPack.flaws.length)] || ''
    
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
    
    // Función helper para obtener la habilidad base de una skill
    const getAbilityForSkill = (skillKey) => {
      const skillAbilityMap = {
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
      return skillAbilityMap[skillKey] || 'strength'
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
      maxHitPoints: initialHP,
      currentHitPoints: initialHP,
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
      equipment: [],
      
      // Equipo organizado
      armor: '',
      shield: '',
      weapon1: '',
      weapon2: '',
      otherEquipment: '',
      
      // Modo de creación
      creationMode: 'random',
      personalityMode: 'random',
      
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
      deathSaves: { successes: 0, failures: 0 },
      
      // Campos para la Hoja 2 (Historia)
      age: Math.floor(Math.random() * 100) + 20, // Edad entre 20-120
      eyes: ['Azules', 'Verdes', 'Marrones', 'Grises', 'Negros'][Math.floor(Math.random() * 5)],
      height: Math.floor(Math.random() * 30) + 150 + ' cm', // Altura entre 150-180 cm
      skin: ['Clara', 'Morena', 'Oscura', 'Pálida', 'Bronceada'][Math.floor(Math.random() * 5)],
      weight: Math.floor(Math.random() * 40) + 50 + ' kg', // Peso entre 50-90 kg
      hair: ['Negro', 'Marrón', 'Rubio', 'Pelirrojo', 'Gris'][Math.floor(Math.random() * 5)],
      allies: '',
      allies2: '',
      backstory: 'Un personaje misterioso con un pasado desconocido...',
      extraTraits: '',
      treasure: 'Monedas de cobre, una piedra brillante',
      appearance: 'Un personaje de aspecto distintivo...',
      
      // Campos para la Hoja 3 (Conjuros)
      spellSlots: { 1: { total: 2, used: 0 } }
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

  const handleGenerateRandom = () => {
    const randomCharacter = generateRandomCharacter()
    onCharacterGenerated(randomCharacter)
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '2px solid #8B4513',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h3 style={{ color: '#8B4513', marginBottom: '15px' }}>
        🎲 Generador de Personajes Aleatorios
      </h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Genera un personaje completamente aleatorio con estadísticas recomendadas para su clase
      </p>
      <button
        onClick={handleGenerateRandom}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: '#DAA520',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)'
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)'
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'
        }}
      >
        🎲 Generar Personaje Aleatorio
      </button>
    </div>
  )
}

export default RandomCharacterGenerator

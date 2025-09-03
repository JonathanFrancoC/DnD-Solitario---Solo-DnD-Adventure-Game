import React, { useState } from 'react'
import { backgroundPersonalities } from '../utils/backgroundPersonalities'
import { 
  classData, 
  raceData, 
  backgroundData, 
  getRecommendedStats, 
  getRaceModifiers, 
  getClassSkills, 
  getBackgroundSkills,
  savingThrowsByClass,
  classSkillOptions,
  backgroundSkills,
  ALL_SKILLS,
  getClassStartingEquipment,
  getPreparedSpellsCount
} from '../data/gameData.js'
import { classEquipment } from '../data/classEquipment.js'
import { pointBuyCostFromBase, calculateEffectiveStats, calculateTotalCost, applyClassRecommendations } from '../utils/recommendedStats.js'
import { generateRandomName } from '../utils/randomNames'
import '../styles/CharacterCreation.css'
import { 
  getAbilityModifier, 
  calculateArmorClass, 
  calculateInitialHP, 
  calculateLevelUpHP,
  canProceed
} from '../utils/characterUtils'
import { 
  isSpellcaster, 
  getAvailableSpellsForLevelUp, 
  getStartingSpells, 
  getStartingCantrips,
  getSpellcastingAbility
} from '../utils/spellUtils'

// tabla de progresión por clase y nivel
import { levelProgressionData } from '../data/levelProgressionData.js'

// utilidades de magia que te pasé antes
import { getSpellcastingSummary } from '../data/spellcastingData.js'

// datos de conjuros
import { 
  spellsData, 
  classAvailability, 
  getSpellsForClassAndLevel, 
  cantripsKnownAt,
  normalizeAvailability,
  normalizeClassKey,
  spellsKnownAt,
  getAvailableSpellsForLevel
} from '../data/spellsData.js'

// panel de mecánicas de clase
import ClassMechanicsPanel from './ClassMechanicsPanel.jsx'
import ClassMechanicsManager from './ClassMechanicsManager.jsx'
import WeaponDamageCalculator from './WeaponDamageCalculator.jsx'
import LevelUpManager from './LevelUpManager.jsx'

// utilidades de mecánicas
import { getAvailableMechanics } from '../data/classMechanics.js'

// === HELPERS PARA CONJUROS ===
// Devuelve los datos de un conjuro por su clave, buscando en cantrips y niveles 1..9.
// Si no existe en spellsData, devuelve un placeholder con el nombre=clave.
const getSpellData = (key, spellsData) => {
  if (spellsData?.cantrips?.[key]) return { level: 0, ...spellsData.cantrips[key] };
  for (let i = 1; i <= 9; i++) {
    const lvl = spellsData?.[`level${i}`];
    if (lvl?.[key]) return { level: i, ...lvl[key] };
  }
  return { level: null, name: key, description: '(Falta en spells.json)' };
};

// Une, sin duplicar
const uniq = (arr) => Array.from(new Set(arr));

// Para aplicaciones de escritorio, el sistema de guardado se maneja directamente
// desde el componente principal que tiene acceso al sistema de archivos

// Helper functions for spell data access
const findSpellDataByKey = (key) => {
  return Object.entries(spellsData)
    .filter(([lvl]) => lvl !== 'cantrips')      // e.g., 'level1','level2',...
    .map(([, pool]) => pool || {})
    .reduce((found, pool) => found || pool[key], null);
};

const findSpellDataByName = (name) => {
  for (const [lvl, pool] of Object.entries(spellsData)) {
    if (lvl === 'cantrips' || !pool) continue;
    for (const obj of Object.values(pool)) {
      if (obj?.name === name) return obj;
    }
  }
  return null;
};

// Helper functions for finishCharacter
const mod = (score) => Math.floor((score - 10) / 2);

// Weapon database for attack calculations
const WEAPON_DB = {
  'espada larga': { abil: 'strength', die: '1d8', versatile: '1d10' },
  'espada corta': { abil: 'dexterity', die: '1d6', finesse: true },
  'hacha de guerra': { abil: 'strength', die: '1d8', versatile: '1d10' },
  'maza': { abil: 'strength', die: '1d6' },
  'bastón': { abil: 'strength', die: '1d6' },
  'daga': { abil: 'dexterity', die: '1d4', finesse: true },
  'arco corto': { abil: 'dexterity', die: '1d6', ranged: true },
  'arco largo': { abil: 'dexterity', die: '1d8', ranged: true },
  'ballesta ligera': { abil: 'dexterity', die: '1d8', ranged: true },
  'jabalina': { abil: 'strength', die: '1d6', thrown: true },
};

// Extract dice notation from spell description
const extractDice = (text) => {
  if (!text) return '';
  const m = String(text).match(/\d+d\d+(?:\s*\+\s*\d+)?/i);
  return m ? m[0] : '';
};

// Caster stat by class
const CASTER_STAT = {
  bardo: 'charisma',
  brujo: 'charisma',
  hechicero: 'charisma',
  clerigo: 'wisdom',
  druida: 'wisdom',
  explorador: 'wisdom',
  mago: 'intelligence',
  paladin: 'charisma',
};

// Build attacks from weapons and spells
const buildAttacks = ({ weapon1, weapon2, cls, stats, proficiencyBonus, selectedCantrips, selectedSpells }) => {
  const out = [];
  
  const pushWeapon = (label) => {
    if (!label) return;
    // Extract weapon name from label (e.g., "Espada Larga (1d8/1d10)" -> "espada larga")
    const name = label.split(' (')[0].toLowerCase();
    const data = WEAPON_DB[name];
    if (!data) return;
    
    const abil = (data.finesse && mod(stats.dexterity) > mod(stats.strength)) ? 'dexterity' : data.abil;
    const bonus = mod(stats[abil]) + (proficiencyBonus ?? 0);
    const damage = data.versatile ? `${data.die} / ${data.versatile}` : data.die;
    
    out.push({
      name: label,
      bonus: (bonus >= 0 ? `+${bonus}` : String(bonus)),
      damage,
    });
  };
  
  pushWeapon(weapon1);
  pushWeapon(weapon2);
  
  // Add spell attacks
  const spellKeys = [
    ...selectedCantrips.map(c => c.key || c),
    ...selectedSpells.map(s => s.key || s),
  ];
  
  const stat = CASTER_STAT[cls] || 'intelligence';
  const spellAtkBonus = mod(stats[stat]) + (proficiencyBonus ?? 0);
  
  for (const key of spellKeys) {
    const data = findSpellDataByKey(key) || findSpellDataByName(key) || null;
    
    // Include only if it seems to do damage
    const dice = extractDice(data?.description || data?.damage || data?.effect);
    if (!dice) continue;
    
    out.push({
      name: data?.name || key,
      bonus: (spellAtkBonus >= 0 ? `+${spellAtkBonus}` : String(spellAtkBonus)),
      damage: dice,
    });
  }
  
  return out;
};


const CharacterCreation = ({ 
  onBackToMenu, 
  onCharacterCreated, 
  characterData, 
  setCharacterData, 
  handleCharacterDataChange,
  currentCampaignId = null,
  creationMode = 'guided'
}) => {
  const [step, setStep] = useState(0)
  const [personalityMethod, setPersonalityMethod] = useState('custom') // 'custom', 'random', 'select'
  const [availablePoints, setAvailablePoints] = useState(25)
  const [baseStats, setBaseStats] = useState({
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8
  })
  const [selectedSkills, setSelectedSkills] = useState([])
  const [selectedCantrips, setSelectedCantrips] = useState(characterData.cantrips || [])
  const [selectedSpells, setSelectedSpells] = useState(characterData.spells || [])
  
  // Estado para modo de reemplazo de conjuros
  const [replaceMode, setReplaceMode] = useState(false)
  const [toReplace, setToReplace] = useState(null)
  
  // Estado para modal de descripción de hechizos
  const [showSpellModal, setShowSpellModal] = useState(false)
  const [selectedSpellInfo, setSelectedSpellInfo] = useState(null)
  
  // Estado para modal de información de habilidades y mecánicas
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedInfo, setSelectedInfo] = useState(null)
  const [mechanics, setMechanics] = useState({})
  const [currentDamage, setCurrentDamage] = useState('')
  const [currentDamageType, setCurrentDamageType] = useState('')
  
  // Memorizar availability normalizado
  const normalizedAvailability = React.useMemo(
    () => normalizeAvailability(classAvailability),
    []
  )

  // Función para mostrar información del hechizo
  const showSpellInfo = (spellKey, isCantrip = false) => {
    const spellData = isCantrip 
      ? spellsData.cantrips?.[spellKey]
      : spellsData.level1?.[spellKey]
    
    if (spellData) {
      setSelectedSpellInfo({
        ...spellData,
        key: spellKey,
        isCantrip
      })
      setShowSpellModal(true)
    }
  }

  // Función para mostrar información de habilidades y mecánicas
  const showInfo = (type, data) => {
    setSelectedInfo({ type, data })
    setShowInfoModal(true)
  }

  // Función para manejar cambios en las mecánicas de clase
  const handleMechanicsChange = (newMechanics) => {
    setMechanics(newMechanics)
    handleCharacterDataChange('mechanics', newMechanics)
  }

  // Función para manejar cambios en el daño
  const handleDamageChange = (damage, damageType, updatedMechanics = null) => {
    setCurrentDamage(damage)
    setCurrentDamageType(damageType)
    if (updatedMechanics) {
      setMechanics(updatedMechanics)
      handleCharacterDataChange('mechanics', updatedMechanics)
    }
  }
  const [hpRolled, setHpRolled] = useState(false)
  const [levelUpSpells, setLevelUpSpells] = useState([])

  // Asegurar que skills sea siempre un array
  React.useEffect(() => {
    if (!Array.isArray(characterData.skills)) {
      handleCharacterDataChange('skills', [])
    }
  }, []) // Al montar

  // Asegurar que skills sea siempre un array también cuando cambie la clase
  React.useEffect(() => {
    if (characterData.class && !Array.isArray(characterData.skills)) {
      handleCharacterDataChange('skills', [])
    }
  }, [characterData.class])

  // Reiniciar habilidades cuando cambie la clase (para evitar sobrepasar límites)
  React.useEffect(() => {
    if (characterData.class) {
      // Obtener las habilidades del trasfondo actual
      const backgroundSkillList = getBackgroundSkills(characterData.background) || []
      
      // Reiniciar habilidades solo con las del trasfondo
      // Esto asegura que las habilidades del trasfondo siempre estén incluidas
      handleCharacterDataChange('skills', [...backgroundSkillList])
    }
  }, [characterData.class, characterData.background])

  // Reiniciar hechizos cuando cambie la clase
  React.useEffect(() => {
    if (characterData.class) {
      setSelectedCantrips([])
      setSelectedSpells([])
      setSpellSelections({})
      setHpRolledForLevel({})
      setNewCantrips([])
      setNewSpells([])
      setLevelUpSpells([])
      setLevelUpHistory([])
      handleCharacterDataChange('cantrips', [])
      handleCharacterDataChange('spells', [])
    }
  }, [characterData.class])

  // Agregar automáticamente las habilidades del trasfondo cuando se selecciona un trasfondo
  React.useEffect(() => {
    if (characterData.background) {
      const backgroundSkillList = getBackgroundSkills(characterData.background) || []
      const currentSkills = Array.isArray(characterData.skills) ? characterData.skills : []
      
      // Asegurar que todas las habilidades del trasfondo estén incluidas
      const newSkills = [...currentSkills]
      backgroundSkillList.forEach(skill => {
        if (!newSkills.includes(skill)) {
          newSkills.push(skill)
        }
      })
      
      // Solo actualizar si hay cambios
      if (newSkills.length !== currentSkills.length) {
        handleCharacterDataChange('skills', newSkills)
      }
    }
  }, [characterData.background])

  // Aplicar estadísticas recomendadas cuando se selecciona una clase en modo guiado
  React.useEffect(() => {
    if (creationMode === 'guided' && characterData.class && characterData.race) {
      applyRecommendedStats(characterData.class)
    }
  }, [characterData.class, characterData.race, creationMode])

  // Inicializar baseStats cuando se selecciona una raza (solo en modo personalizado)
  React.useEffect(() => {
    if (creationMode !== 'guided' && characterData.race && Object.values(baseStats).every(stat => stat === 8)) {
      const raceModifiers = getRaceModifiers(characterData.race, raceData) || {}
      const newBaseStats = {
        strength: 8 + (raceModifiers.strength || 0),
        dexterity: 8 + (raceModifiers.dexterity || 0),
        constitution: 8 + (raceModifiers.constitution || 0),
        intelligence: 8 + (raceModifiers.intelligence || 0),
        wisdom: 8 + (raceModifiers.wisdom || 0),
        charisma: 8 + (raceModifiers.charisma || 0)
      }
      setBaseStats(newBaseStats)
      
      // Actualizar characterData con las estadísticas iniciales
      Object.entries(newBaseStats).forEach(([stat, value]) => {
        handleCharacterDataChange(stat, value)
      })
    }
  }, [characterData.race, creationMode]) // Solo ejecutar cuando cambie la raza o el modo

  // Calcular HP automáticamente cuando se cargan las estadísticas
  React.useEffect(() => {
    if (characterData.constitution && characterData.class) {
      const level = characterData.level || 1
      const constitutionModifier = getAbilityModifier(characterData.constitution)
      const hitDie = classData[characterData.class]?.hitDie || 'd8'
      const dieSize = parseInt(hitDie.replace('d', ''))
      
      // Nivel 1: SIEMPRE máximo del dado + modificador de Constitución
      // Ejemplo: d8 + Constitución (-1) = 8 + (-1) = 7 HP
      // Para nivel 1: siempre máximo del dado + modificador de Constitución
      const level1HP = dieSize + constitutionModifier
      
      // Asegurar que los HP nunca sean menores a 1
      const finalHP = Math.max(1, level1HP)
      
      setCharacterData(prev => ({
        ...prev,
        maxHitPoints: finalHP,
        currentHitPoints: finalHP
      }))
    }
  }, [characterData.constitution, characterData.class, characterData.level]) // Solo cuando cambien las estadísticas relevantes

  // Hacer cumplir mínimos raciales cuando cambie la raza
  React.useEffect(() => {
    if (!characterData.race) return
    enforceRaceMinimums()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterData.race])

  // Aplicar estadísticas recomendadas automáticamente en modo guiado
  React.useEffect(() => {
    if (creationMode === 'guided' && characterData.class && characterData.race) {
      applyRecommendedStats(characterData.class)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creationMode, characterData.class, characterData.race])

  // Función para manejar la selección/deselección de hechizos al subir de nivel
  const handleLevelUpSpellToggle = (spell) => {
    const isSelected = levelUpSpells.find(s => s.key === spell.key)
    
    if (isSelected) {
      setLevelUpSpells(prev => prev.filter(s => s.key !== spell.key))
    } else {
      setLevelUpSpells(prev => [...prev, spell])
    }
  }

  // Función para obtener el tipo de paso
  const getStepType = (step, level) => {
    if (step === 0) return 'basic-info' // Cambiado de 'pre-menu' a 'basic-info'
    if (step === 1) return 'basic-info'
    if (step === 2) return 'stats'
    if (step === 3) return 'skills'
    if (step === 4) return 'mechanics'
    if (step === 5) return 'physical-details'
    if (step === 6) return 'story'
    // Si el nivel objetivo es mayor a 1, usar LevelUpManager en lugar de la interfaz integrada
    if (step === 7 && initialTargetLevel > 1) return 'level-up-manager'
    if (step === 7) return 'level-up'
    return 'save'
  }

  // Función para obtener el número total de pasos
  const getTotalSteps = (level) => {
    if (level === 1) return 7 // Agregamos el paso de detalles físicos
    return 8 // Agregamos el paso de detalles físicos y el paso de historia
  }

  // Función para obtener el nivel objetivo
  const getTargetLevel = (step) => {
    return step + 1
  }



  // Función para obtener el mensaje de error de validación
  const getValidationError = (step, characterData) => {
    switch (step) {
      case 0:
        if (!characterData.name || characterData.name.trim() === '') return 'Debes ingresar un nombre para tu personaje'
        if (!characterData.class) return 'Debes seleccionar una clase'
        if (!characterData.background) return 'Debes seleccionar un trasfondo'
        if (!characterData.race) return 'Debes seleccionar una raza'
        if (!characterData.gender) return 'Debes seleccionar un género'
        if (!characterData.alignment) return 'Debes seleccionar un alineamiento'
        return null
      case 1:
        return getValidationError(0, characterData) // Misma validación que el paso 0
      case 2:
        if (Object.values(baseStats).some(stat => stat < 8)) return 'Todas las estadísticas deben ser al menos 8'
        if (availablePoints >= 25) return 'Debes gastar todos los puntos de compra disponibles'
        return null
      case 3:
        const maxSkillChoices = getMaxSkillChoices(characterData.class)
        const currentSkills = characterData.skills && Array.isArray(characterData.skills) ? characterData.skills : []
        const backgroundSkillList = getBackgroundSkills(characterData.background) || []
        const nonBackgroundSkills = currentSkills.filter(skill => !backgroundSkillList.includes(skill))
        const selectedClassSkillsCount = nonBackgroundSkills.length
        
        if (selectedClassSkillsCount < maxSkillChoices) {
          return `Debes seleccionar exactamente ${maxSkillChoices} habilidades de clase (actualmente tienes ${selectedClassSkillsCount})`
        }
        if (selectedClassSkillsCount > maxSkillChoices) {
          return `Has seleccionado demasiadas habilidades de clase. Debes tener exactamente ${maxSkillChoices} (actualmente tienes ${selectedClassSkillsCount})`
        }
        
        if (!characterData.personalityTrait || characterData.personalityTrait.trim() === '') return 'Debes completar el rasgo de personalidad'
        if (!characterData.ideal || characterData.ideal.trim() === '') return 'Debes completar el ideal'
        if (!characterData.bond || characterData.bond.trim() === '') return 'Debes completar el vínculo'
        if (!characterData.flaw || characterData.flaw.trim() === '') return 'Debes completar el defecto'
        return null
      default:
        return null
    }
  }  
  // Función para verificar si se puede avanzar
  const canAdvanceStep = (step, characterData) => {
    switch (step) {
      case 0:
        return characterData.name && 
               characterData.name.trim() !== '' && 
               characterData.class && 
               characterData.background &&
               characterData.race &&
               characterData.gender &&
               characterData.alignment
      case 1:
        return characterData.name && 
               characterData.name.trim() !== '' && 
               characterData.class && 
               characterData.background &&
               characterData.race &&
               characterData.gender &&
               characterData.alignment
      case 2:
        // Verificar que todas las estadísticas estén configuradas y que se hayan gastado puntos
        return Object.values(baseStats).every(stat => stat >= 8) && availablePoints < 25
      case 3:
        // Verificar que se hayan seleccionado exactamente el número de habilidades de clase permitidas
        const maxSkillChoices = getMaxSkillChoices(characterData.class)
        const currentSkills = characterData.skills && Array.isArray(characterData.skills) ? characterData.skills : []
        const backgroundSkillList = getBackgroundSkills(characterData.background) || []
        
        // Contar solo las habilidades que NO son del trasfondo (habilidades de clase)
        const nonBackgroundSkills = currentSkills.filter(skill => !backgroundSkillList.includes(skill))
        const selectedClassSkillsCount = nonBackgroundSkills.length
        
        // Verificar que se haya completado la personalidad del personaje
        const hasPersonality = characterData.personalityTrait && 
                              characterData.personalityTrait.trim() !== '' &&
                              characterData.ideal && 
                              characterData.ideal.trim() !== '' &&
                              characterData.bond && 
                              characterData.bond.trim() !== '' &&
                              characterData.flaw && 
                              characterData.flaw.trim() !== ''
        
        // Debe tener exactamente el número de habilidades de clase requeridas
        return selectedClassSkillsCount === maxSkillChoices && hasPersonality
      case 4:
        return true
      case 5:
        return true // Paso opcional de detalles físicos
      case 6:
        return true
      default:
        return true
    }
  }

  // Función para obtener las estadísticas base (sin modificadores de raza)
  const getBaseStat = (statName) => {
    const raceModifiers = getRaceModifiers(characterData.race, raceData) || {};
    const currentStat = baseStats[statName] ?? 8;         // valor "efectivo" mostrado
    const raceModifier = raceModifiers[statName] ?? 0;    // bono racial (o 0)
    return currentStat - raceModifier;                    // valor base real sin raza
  };

  // Constantes para las habilidades
  const ABILITIES = ["strength","dexterity","constitution","intelligence","wisdom","charisma"];





  // Función para obtener el valor mínimo de una estadística (valor base de la raza)
  const getMinStatValue = (statName) => {
    const raceModifiers = getRaceModifiers(characterData.race, raceData)
    const raceModifier = raceModifiers[statName] || 0
    return 8 + raceModifier
  }



  /**
   * Coste total gastado para alcanzar un stat EFECTIVO dado,
   * teniendo en cuenta el modificador racial.
   */
  const totalPointBuyCost = (currentStat, raceModifier = 0) => {
    const baseValue = currentStat - raceModifier;
    return pointBuyCostFromBase(baseValue);
  }

  /**
   * Coste marginal de subir +1 el stat EFECTIVO actual
   * (útil para interfaces que muestran cuánto cuesta el siguiente punto).
   */
  const nextPointCost = (currentStat, raceModifier = 0) => {
    const base = currentStat - raceModifier;
    const costNow = pointBuyCostFromBase(base);
    const costNext = pointBuyCostFromBase(base + 1);
    return costNext - costNow; // 1 si base<=14, 2 si base>=15
  }

  // Función para calcular el costo de puntos de una estadística (solo puntos del usuario)
  const getStatCost = (statName) => {
    const currentStat = baseStats[statName] || 8
    const raceModifier = (getRaceModifiers(characterData.race, raceData)[statName]) || 0
    return totalPointBuyCost(currentStat, raceModifier)
  }

  // Función para calcular el costo total de estadísticas (solo puntos del usuario)
  const getTotalStatCost = () => {
    return Object.keys(baseStats).reduce((total, statName) => total + getStatCost(statName), 0)
  }

  // Función para hacer cumplir los mínimos raciales
  const enforceRaceMinimums = () => {
    const raceMods = getRaceModifiers(characterData.race, raceData)
    let changed = false
    const fixed = { ...baseStats }

    for (const k of ABILITIES) {
      const min = 8 + (raceMods[k] ?? 0)
      if ((fixed[k] ?? 8) < min) {
        fixed[k] = min
        changed = true
      }
    }

    if (changed) {
      setBaseStats(fixed)
      // Recalcula PB disponibles coherentemente
      const baseValues = {}
      Object.entries(fixed).forEach(([s, effectiveValue]) => {
        baseValues[s] = effectiveValue - (raceMods[s] ?? 0)
      })
      const totalCost = calculateTotalCost(baseValues)
      setAvailablePoints(25 - totalCost)
      ABILITIES.forEach(k => handleCharacterDataChange(k, fixed[k]))
    }
  }

  // Función para aplicar bonus de raza automáticamente
  const applyRaceBonuses = (race) => {
    if (!race || !raceData[race]) return
    const raceBonuses = getRaceModifiers(race, raceData)

    const resetStats = { strength: 8, dexterity: 8, constitution: 8,
                         intelligence: 8, wisdom: 8, charisma: 8 }

    Object.keys(raceBonuses).forEach(stat => {
      resetStats[stat] += raceBonuses[stat]
    })

    setBaseStats(resetStats)
    setAvailablePoints(25)
    Object.keys(resetStats).forEach(stat => handleCharacterDataChange(stat, resetStats[stat]))
  }

  // Función para manejar cambios en estadísticas
  const handleStatChange = (stat, value) => {
    const raceMods = getRaceModifiers(characterData.race, raceData)
    const minVal = 8 + (raceMods[stat] ?? 0)
    const clamped = Math.max(minVal, Math.min(18 + (raceMods[stat] ?? 0), value))

    const newStats = { ...baseStats, [stat]: clamped }

    // Calcular coste total desde valores base
    const baseValues = {}
    Object.entries(newStats).forEach(([s, effectiveValue]) => {
      baseValues[s] = effectiveValue - (raceMods[s] ?? 0)
    })
    
    const totalCost = calculateTotalCost(baseValues)

    if (totalCost <= 25 || clamped < baseStats[stat]) {
      setBaseStats(newStats)
      setAvailablePoints(25 - totalCost)
      handleCharacterDataChange(stat, clamped)
    }
  }

  // Función para generar personalidad aleatoria
  const generateRandomPersonality = () => {
    if (!characterData.background) return
    
    const background = backgroundPersonalities[characterData.background]
    if (!background) return
    
    const randomTrait = background.personalityTraits[Math.floor(Math.random() * background.personalityTraits.length)]
    const randomIdeal = background.ideals[Math.floor(Math.random() * background.ideals.length)]
    const randomBond = background.bonds[Math.floor(Math.random() * background.bonds.length)]
    const randomFlaw = background.flaws[Math.floor(Math.random() * background.flaws.length)]
    
    handleCharacterDataChange('personalityTrait', randomTrait)
    handleCharacterDataChange('ideal', randomIdeal)
    handleCharacterDataChange('bond', randomBond)
    handleCharacterDataChange('flaw', randomFlaw)
  }

  // Función para limpiar personalidad
  const clearPersonality = () => {
    handleCharacterDataChange('personalityTrait', '')
    handleCharacterDataChange('ideal', '')
    handleCharacterDataChange('bond', '')
    handleCharacterDataChange('flaw', '')
  }

  const getPersonalityOptions = (type) => {
    const options = {
      personalityTrait: [
        'Siempre estoy de mal humor',
        'Soy tímido/a y hablo muy poco',
        'Me encanta contar historias',
        'Soy muy directo/a y honesto/a',
        'Soy muy curioso/a sobre todo',
        'Soy muy supersticioso/a',
        'Soy muy optimista',
        'Soy muy pesimista',
        'Soy muy valiente',
        'Soy muy cobarde',
        'Soy muy generoso/a',
        'Soy muy tacaño/a',
        'Soy muy leal a mis amigos',
        'Soy muy desconfiado/a',
        'Soy muy religioso/a',
        'Soy muy ateo/a'
      ],
      ideal: [
        'Honestidad (Legal)',
        'Libertad (Caótico)',
        'Bondad (Bueno)',
        'Poder (Malvado)',
        'Justicia (Legal)',
        'Cambio (Caótico)',
        'Protección (Bueno)',
        'Destrucción (Malvado)',
        'Conocimiento (Neutral)',
        'Equilibrio (Neutral)',
        'Tradición (Legal)',
        'Innovación (Caótico)'
      ],
      bond: [
        'Mi familia es lo más importante',
        'Mi patria es lo más importante',
        'Mi religión es lo más importante',
        'Mi maestro es lo más importante',
        'Mi amigo es lo más importante',
        'Mi amor es lo más importante',
        'Mi arma es lo más importante',
        'Mi libro es lo más importante',
        'Mi mascota es lo más importante',
        'Mi hogar es lo más importante'
      ],
      flaw: [
        'Soy muy orgulloso/a',
        'Soy muy envidioso/a',
        'Soy muy perezoso/a',
        'Soy muy glotón/a',
        'Soy muy mentiroso/a',
        'Soy muy cobarde',
        'Soy muy cruel',
        'Soy muy supersticioso/a',
        'Soy muy desconfiado/a',
        'Soy muy impulsivo/a',
        'Soy muy tacaño/a',
        'Soy muy vanidoso/a'
      ]
    }
    return options[type] || []
  }

  // Funciones para recomendaciones de equipo basadas en clase
  const getRecommendedArmor = (className) => {
    if (!className || !classEquipment[className]) return 'Sin armadura'
    
    const equipment = classEquipment[className]
    const startingEquipment = equipment.startingEquipment || {}
    
    // Buscar en equipment fijo
    if (startingEquipment.fixed) {
      const armorItem = startingEquipment.fixed.find(item => {
        if (typeof item !== 'string') return false
        const itemLower = item.toLowerCase()
        return itemLower.includes('armadura') || 
               itemLower.includes('cuero') ||
               itemLower.includes('malla') ||
               itemLower.includes('placas')
      })
      if (armorItem) return armorItem
    }
    
    // Buscar en choices (tomar la primera opción de armadura)
    if (startingEquipment.choices) {
      for (const choice of startingEquipment.choices) {
        if (choice.options) {
          const armorOption = choice.options.find(option => {
            if (typeof option !== 'string') return false
            const optionLower = option.toLowerCase()
            return optionLower.includes('armadura') || 
                   optionLower.includes('cuero') ||
                   optionLower.includes('malla') ||
                   optionLower.includes('placas')
          })
          if (armorOption) return armorOption
        }
      }
    }
    
    return 'Sin armadura'
  }

  const getRecommendedShield = (className) => {
    if (!className || !classEquipment[className]) return 'Sin escudo'
    
    const equipment = classEquipment[className]
    const startingEquipment = equipment.startingEquipment || {}
    
    // Buscar en equipment fijo
    if (startingEquipment.fixed) {
      const shieldItem = startingEquipment.fixed.find(item => {
        if (typeof item !== 'string') return false
        return item.toLowerCase().includes('escudo')
      })
      if (shieldItem) return shieldItem
    }
    
    // Buscar en choices
    if (startingEquipment.choices) {
      for (const choice of startingEquipment.choices) {
        if (choice.options) {
          const shieldOption = choice.options.find(option => {
            if (typeof option !== 'string') return false
            return option.toLowerCase().includes('escudo')
          })
          if (shieldOption) return shieldOption
        }
      }
    }
    
    return 'Sin escudo'
  }

  const getRecommendedWeapon = (className, type) => {
    if (!className || !classEquipment[className]) return type === 'primary' ? 'Daga (1d4)' : 'Sin arma secundaria'
    
    const equipment = classEquipment[className]
    const startingEquipment = equipment.startingEquipment || {}
    const weapons = []
    
    // Buscar en equipment fijo
    if (startingEquipment.fixed) {
      const fixedWeapons = startingEquipment.fixed.filter(item => {
        if (typeof item !== 'string') return false
        const itemLower = item.toLowerCase()
        return itemLower.includes('espada') ||
               itemLower.includes('hacha') ||
               itemLower.includes('maza') ||
               itemLower.includes('bastón') ||
               itemLower.includes('arco') ||
               itemLower.includes('daga') ||
               itemLower.includes('jabalina') ||
               itemLower.includes('vara')
      })
      weapons.push(...fixedWeapons)
    }
    
    // Buscar en choices
    if (startingEquipment.choices) {
      for (const choice of startingEquipment.choices) {
        if (choice.options) {
          const choiceWeapons = choice.options.filter(option => {
            if (typeof option !== 'string') return false
            const optionLower = option.toLowerCase()
            return optionLower.includes('espada') ||
                   optionLower.includes('hacha') ||
                   optionLower.includes('maza') ||
                   optionLower.includes('bastón') ||
                   optionLower.includes('arco') ||
                   optionLower.includes('daga') ||
                   optionLower.includes('jabalina') ||
                   optionLower.includes('vara')
          })
          weapons.push(...choiceWeapons)
        }
      }
    }
    
    if (type === 'primary' && weapons.length > 0) {
      return weapons[0]
    } else if (type === 'secondary' && weapons.length > 1) {
      return weapons[1]
    } else if (type === 'secondary') {
      return 'Daga (1d4)'
    }
    
    return type === 'primary' ? 'Daga (1d4)' : 'Sin arma secundaria'
  }

  const getAdditionalEquipment = (className) => {
    if (!className || !classEquipment[className]) return 'Sin equipo adicional'
    
    const equipment = classEquipment[className]
    const startingEquipment = equipment.startingEquipment || {}
    const additionalItems = []
    
    // Agregar equipment fijo (excluyendo armas y armaduras ya mostradas)
    if (startingEquipment.fixed) {
      const nonWeaponArmorItems = startingEquipment.fixed.filter(item => {
        if (typeof item !== 'string') return false
        const itemLower = item.toLowerCase()
        return !itemLower.includes('espada') &&
               !itemLower.includes('hacha') &&
               !itemLower.includes('maza') &&
               !itemLower.includes('bastón') &&
               !itemLower.includes('arco') &&
               !itemLower.includes('daga') &&
               !itemLower.includes('jabalina') &&
               !itemLower.includes('vara') &&
               !itemLower.includes('armadura') &&
               !itemLower.includes('cuero') &&
               !itemLower.includes('malla') &&
               !itemLower.includes('placas') &&
               !itemLower.includes('escudo')
      })
      additionalItems.push(...nonWeaponArmorItems)
    }
    
    // Agregar algunos items de choices (paquetes, etc.)
    if (startingEquipment.choices) {
      for (const choice of startingEquipment.choices) {
        if (choice.options) {
          const packageItems = choice.options.filter(option => {
            if (typeof option !== 'string') return false
            const optionLower = option.toLowerCase()
            return optionLower.includes('paquete') ||
                   optionLower.includes('bolsa') ||
                   optionLower.includes('mochila')
          })
          if (packageItems.length > 0) {
            additionalItems.push(packageItems[0]) // Tomar el primer paquete
            break
          }
        }
      }
    }
    
    return additionalItems.length > 0 ? additionalItems.join(', ') : 'Sin equipo adicional'
  }

  const getClassSavingThrows = (className) => {
    if (!className) return []
    
    const savingThrows = savingThrowsByClass[className] || []
    
    return savingThrows.map(stat => {
      switch (stat) {
        case 'strength': return 'Fuerza'
        case 'dexterity': return 'Destreza'
        case 'constitution': return 'Constitución'
        case 'intelligence': return 'Inteligencia'
        case 'wisdom': return 'Sabiduría'
        case 'charisma': return 'Carisma'
        default: return stat
      }
    })
  }

  const getAllSkills = () => {
    return [
      'Acrobacias','Atletismo','C. Arcano','Engaño','Historia','Perspicacia','Intimidación','Investigación',
      'Medicina','Naturaleza','Percepción','Interpretación','Persuasión','Religión','Juego de Manos',
      'Sigilo','Supervivencia','T. con Animales'
    ]
  }

  const getAvailableSkills = (className, background) => {
    if (!className) return []
    
    const classOptions = classSkillOptions[className]
    if (!classOptions) return []
    
    // Obtener habilidades del trasfondo
    const backgroundSkillList = backgroundSkills[background] || []
    
    // En modo guiado, mostrar habilidades de clase + habilidades del trasfondo
    if (creationMode === 'guided') {
      const allAvailable = [...new Set([...classOptions.from, ...backgroundSkillList])]
      return allAvailable
    }
    
    // En modo personalizado, mostrar todas las habilidades disponibles
    const allAvailable = [...new Set([...classOptions.from, ...backgroundSkillList])]
    
    return allAvailable
  }

  // Obtener el número máximo de habilidades que se pueden seleccionar
  const getMaxSkillChoices = (className) => {
    if (!className) return 0
    const classOptions = classSkillOptions[className]
    return classOptions?.choose || 0
  }

  // Verificar si se puede seleccionar más habilidades
  const canSelectMoreSkills = () => {
    const maxChoices = getMaxSkillChoices(characterData.class)
    const currentSkills = Array.isArray(characterData.skills) ? characterData.skills : []
    const backgroundSkillList = getBackgroundSkills(characterData.background) || []
    
    // Contar solo las habilidades que NO son del trasfondo
    const nonBackgroundSkills = currentSkills.filter(skill => !backgroundSkillList.includes(skill))
    
    return nonBackgroundSkills.length < maxChoices
  }

  // Verificar si una habilidad específica está seleccionada
  const isSkillSelected = (skill) => {
    const currentSkills = Array.isArray(characterData.skills) ? characterData.skills : []
    return currentSkills.includes(skill)
  }

  // Verificar si una habilidad es del trasfondo (no se puede deseleccionar)
  const isBackgroundSkill = (skill) => {
    if (!characterData.background) return false
    const backgroundSkillList = getBackgroundSkills(characterData.background) || []
    return backgroundSkillList.includes(skill)
  }

  // Obtener información de progresión de nivel
  const getLevelProgressionInfo = (className, level) => {
    return levelProgressionData[className]?.[level] || { features: [], cantripsKnown: 0 }
  }

  // Devuelve una lista [{level, features, cantrips, spells}] entre dos niveles (excluye from)
  const getLevelProgression = (className, fromLevel, toLevel) => {
    const table = levelProgressionData?.[className] ?? {}
    const out = []
    for (let L = Math.max(1, fromLevel + 1); L <= toLevel; L++) {
      const row = table[L] || {}
      out.push({
        level: L,
        features: row.features || [],
        cantrips: row.cantrips ?? row.cantripsKnown ?? 0,
        spells: row.spells ?? 0,
      })
    }
    return out
  }

  // Obtener nuevas mecánicas desbloqueadas en un nivel específico
  const getNewMechanicsAtLevel = (className, level) => {
    const allMechanics = getAvailableMechanics(className, level)
    const previousMechanics = getAvailableMechanics(className, level - 1)
    
    const newMechanics = {}
    Object.entries(allMechanics).forEach(([key, mechanic]) => {
      if (!previousMechanics[key]) {
        newMechanics[key] = mechanic
      }
    })
    
    return newMechanics
  }

  // Obtener trucos disponibles para la clase
  const getAvailableCantrips = (className) => {
    const classSpells = classAvailability?.[className]?.cantrips || {}
    return Object.entries(classSpells).map(([spellKey, minLevel]) => ({
      key: spellKey,
      name: spellsData.cantrips[spellKey]?.name || spellKey,
      description: spellsData.cantrips[spellKey]?.description || '',
      minLevel: minLevel
    }))
  }

  // Obtener conjuros disponibles para la clase y nivel
  const getAvailableSpells = (className, level) => {
    const classSpells = classAvailability?.[className] || {}
    const availableSpells = []
    
    Object.entries(classSpells).forEach(([spellLevel, spells]) => {
      if (spellLevel !== 'cantrips' && parseInt(spellLevel.replace('level', '')) <= level) {
        Object.entries(spells).forEach(([spellKey, minLevel]) => {
          if (minLevel <= level) {
            const spellData = spellsData[spellLevel]?.[spellKey]
            if (spellData) {
              availableSpells.push({
                key: spellKey,
                name: spellData.name,
                description: spellData.description,
                level: parseInt(spellLevel.replace('level', '')),
                minLevel: minLevel
              })
            }
          }
        })
      }
    })
    
    return availableSpells
  }

  // característica de conjuro por clase (5e PHB)
  const SPELL_ABILITY = {
    bardo: 'charisma',
    clerigo: 'wisdom',
    druida: 'wisdom',
    hechicero: 'charisma',
    mago: 'intelligence',
    paladin: 'charisma',
    ranger: 'wisdom',
    brujo: 'charisma',
  }

  // Obtener resumen de conjuros
  const getSpellcastingInfo = (className, level) => {
    const abilityKey = SPELL_ABILITY[className]
    const score = abilityKey ? (characterData[abilityKey] ?? 10) : 10
    const abilityMod = getAbilityModifier(score)
    return getSpellcastingSummary(className, level, abilityMod)
  }

  // Verificar si el nivel tiene ASI (Ability Score Improvement)
  const hasASI = (className, level) => {
    const features = getLevelProgressionInfo(className, level).features
    return features.some(feature => feature.includes('Mejora de característica'))
  }

  // Obtener opciones de mejora disponibles
  const getAvailableImprovements = (className, level) => {
    const improvements = []
    
    if (hasASI(className, level)) {
      improvements.push('Mejora de característica (ASI)')
    }
    
    // Agregar otras opciones según la clase y nivel
    const features = getLevelProgressionInfo(className, level).features
    features.forEach(feature => {
      if (feature.includes('subclase')) {
        improvements.push('Seleccionar subclase')
      }
      if (feature.includes('Metamagia')) {
        improvements.push('Seleccionar metamagia')
      }
      if (feature.includes('Invocaciones')) {
        improvements.push('Seleccionar invocaciones')
      }
    })
    
    return improvements
  }

  // Manejar la selección de habilidades
  const handleSkillToggle = (skill) => {
    const currentSkills = Array.isArray(characterData.skills) ? characterData.skills : []
    const maxChoices = getMaxSkillChoices(characterData.class)
    const backgroundSkillList = getBackgroundSkills(characterData.background) || []
    
    console.log('🔍 DEBUG - handleSkillToggle llamado con skill:', skill)
    console.log('🔍 DEBUG - currentSkills antes:', currentSkills)
    console.log('🔍 DEBUG - maxChoices:', maxChoices)
    console.log('🔍 DEBUG - backgroundSkillList:', backgroundSkillList)
    console.log('🔍 DEBUG - characterData.skills tipo:', typeof characterData.skills)
    console.log('🔍 DEBUG - characterData.skills es array:', Array.isArray(characterData.skills))
    
    // No permitir deseleccionar habilidades del trasfondo
    if (isBackgroundSkill(skill)) {
      console.log('🔍 DEBUG - No se puede deseleccionar habilidad del trasfondo:', skill)
      return
    }
    
    if (currentSkills.includes(skill)) {
      // Deseleccionar habilidad (solo si no es del trasfondo)
      const newSkills = currentSkills.filter(s => s !== skill)
      console.log('🔍 DEBUG - Deseleccionando skill, newSkills:', newSkills)
      handleCharacterDataChange('skills', newSkills)
    } else {
      // Contar solo las habilidades que NO son del trasfondo
      const nonBackgroundSkills = currentSkills.filter(s => !backgroundSkillList.includes(s))
      console.log('🔍 DEBUG - nonBackgroundSkills:', nonBackgroundSkills)
      console.log('🔍 DEBUG - nonBackgroundSkills.length:', nonBackgroundSkills.length)
      
      // Seleccionar habilidad solo si no se ha alcanzado el límite de habilidades de clase
      if (nonBackgroundSkills.length < maxChoices) {
        const newSkills = [...currentSkills, skill]
        console.log('🔍 DEBUG - Seleccionando skill, newSkills:', newSkills)
        handleCharacterDataChange('skills', newSkills)
        // DEBUG: Verificar que se guardó correctamente Coño de la madre
        setTimeout(() => {
          console.log('🔍 DEBUG - characterData.skills después de guardar:', characterData.skills)
          console.log('🔍 DEBUG - characterData.skills tipo después de guardar:', typeof characterData.skills)
          console.log('🔍 DEBUG - characterData.skills es array después de guardar:', Array.isArray(characterData.skills))
        }, 100)
      } else {
        console.log('🔍 DEBUG - Límite alcanzado, no se puede seleccionar más')
      }
    }
  }



    const applyRecommendedStats = (className) => {
    if (!className) return

    // Obtener modificadores raciales
    const raceMods = getRaceModifiers(characterData.race, raceData)
    
    // Aplicar recomendaciones usando la función unificada
    const result = applyClassRecommendations(className, classData, raceMods)
    if (!result) return
    
    // Actualizar estado
    setBaseStats(result.effective)
    setAvailablePoints(25 - result.totalCost)
    
    // Actualizar characterData
    Object.entries(result.effective).forEach(([stat, value]) => {
      handleCharacterDataChange(stat, value)
    })
  }

  const getAvailableArmorOptions = (className) => {
    const classInfo = classData[className]
    if (!classInfo) return []
    
    const armorProficiencies = Array.isArray(classInfo.proficiencies?.armor) ? classInfo.proficiencies.armor : []
    const options = []
    
    if (armorProficiencies.includes('light')) {
      options.push(
        { value: 'armadura de cuero', label: 'Armadura de cuero (AC 11 + Dex)' },
        { value: 'armadura de cuero tachonada', label: 'Armadura de cuero tachonada (AC 12 + Dex)' }
      )
    }
    
    if (armorProficiencies.includes('medium')) {
      options.push(
        { value: 'armadura de escamas', label: 'Armadura de escamas (AC 14 + Dex máx. 2)' },
        { value: 'cota de malla', label: 'Cota de malla (AC 16 + Dex máx. 2)' }
      )
    }
    
    if (armorProficiencies.includes('heavy')) {
      options.push(
        { value: 'armadura de bandas', label: 'Armadura de bandas (AC 17)' },
        { value: 'armadura de placas', label: 'Armadura de placas (AC 18)' }
      )
    }
    
    // Agregar la armadura recomendada del equipo inicial si no está ya incluida
    const recommendedArmor = getRecommendedArmor(className)
    if (recommendedArmor !== 'Sin armadura' && !options.find(opt => opt.value === recommendedArmor.toLowerCase())) {
      options.unshift({ value: recommendedArmor.toLowerCase(), label: recommendedArmor })
    }
    
    return options
  }

  const getAvailableWeaponOptions = (className) => {
    const classInfo = classData[className]
    if (!classInfo) return []
    
    const weaponProficiencies = Array.isArray(classInfo.proficiencies?.weapons) ? classInfo.proficiencies.weapons : []
    const options = []
    
    // Armas simples (todas las clases)
    options.push(
      { value: 'espada corta', label: 'Espada corta (1d6)' },
      { value: 'maza', label: 'Maza (1d6)' },
      { value: 'bastón', label: 'Bastón (1d6)' },
      { value: 'arco corto', label: 'Arco corto (1d6)' }
    )
    
    // Armas marciales (si la clase las tiene)
    if (weaponProficiencies.includes('martial')) {
      options.push(
        { value: 'espada larga', label: 'Espada larga (1d8)' },
        { value: 'hacha de guerra', label: 'Hacha de guerra (1d8)' },
        { value: 'arco largo', label: 'Arco largo (1d8)' }
      )
    }
    
    return options
  }

  // Renderizar pre-menú - ELIMINADO porque ya existe el menú principal en App.jsx

  // Renderizar paso 1 - Información básica
  const renderStep1 = () => {

    return (
      <div className="character-creation">
        <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
          <h2>PASO: INFORMACIÓN BÁSICA</h2>
        </div>
        
        <div className="step-container">
          <div className="step-header">
            🎭 INFORMACIÓN DEL PERSONAJE
          </div>
          <div className="step-content">
            <div className="form-grid">
              {/* Columna 1 - Nombre y Clase */}
              <div className="form-section">
                <div className="section-header">
                  👤 NOMBRE Y CLASE
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Nombre del Personaje:
          </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
              value={characterData.name || ''}
              onChange={(e) => handleCharacterDataChange('name', e.target.value)}
                      className="form-input"
                      placeholder="Ingresa el nombre de tu personaje"
                      style={{ flex: 1 }}
            />
            <button
                      type="button"
                      onClick={() => {
                        const randomName = generateRandomName(characterData.race, characterData.gender)
                        handleCharacterDataChange('name', randomName)
                      }}
                      className="random-name-button"
                      disabled={!characterData.race || !characterData.gender}
                      title="Generar nombre aleatorio según raza y género"
                    >
                      🎲
            </button>
        </div>
        </div>

                <div className="form-group">
                  <label className="form-label">
                    Clase:
          </label>
          <select
            value={characterData.class || ''}
                    onChange={(e) => handleCharacterDataChange('class', e.target.value)}
                    className="form-select"
          >
            <option value="">Selecciona una clase</option>
                    <option value="bardo">Bardo</option>
                    <option value="barbaro">Bárbaro</option>
                    <option value="guerrero">Guerrero</option>
                    <option value="clerigo">Clérigo</option>
                    <option value="druida">Druida</option>
                    <option value="hechicero">Hechicero</option>
                    <option value="mago">Mago</option>
                    <option value="monje">Monje</option>
                    <option value="paladin">Paladín</option>
                    <option value="picaro">Pícaro</option>
                    <option value="ranger">Ranger</option>
                    <option value="brujo">Brujo</option>
          </select>
            </div>

                <div className="form-group">
                  <label className="form-label">
                    Género:
              </label>
          <select
             value={characterData.gender || ''}
             onChange={(e) => handleCharacterDataChange('gender', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Selecciona género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="no-binario">No binario</option>
                    <option value="otro">Otro</option>
          </select>
         </div>

                <div className="form-group">
                  <label className="form-label">
                    Raza:
           </label>
           <select
             value={characterData.race || ''}
                    onChange={(e) => {
                      const selectedRace = e.target.value
                      handleCharacterDataChange('race', selectedRace)
                      applyRaceBonuses(selectedRace)
                    }}
                    className="form-select"
           >
             <option value="">Selecciona una raza</option>
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

                <div className="form-group">
                  <label className="form-label">
                    Nivel Inicial:
                  </label>
                                     <select
                     value={initialTargetLevel}
                     onChange={(e) => {
                       const level = parseInt(e.target.value);
                       setInitialTargetLevel(level);
                       // Siempre mantener el personaje en nivel 1 durante la creación
                       handleCharacterDataChange('level', 1);
                     }}
                     className="form-select"
                   >
                     <option value={1}>Nivel 1 (Inicio)</option>
                     <option value={3}>Nivel 3 (Experiencia)</option>
                     <option value={5}>Nivel 5 (Heroico)</option>
                   </select>
                  </div>
                </div>

              {/* Columna 2 - Trasfondo */}
              <div className="form-section">
                <div className="section-header">
                  📚 TRASFONDO
    </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Trasfondo:
          </label>
          <select
            value={characterData.background || ''}
            onChange={(e) => handleCharacterDataChange('background', e.target.value)}
                    className="form-select"
          >
            <option value="">Selecciona un trasfondo</option>
            <option value="acolito">Acolito</option>
            <option value="criminal">Criminal</option>
                    <option value="heroe">Héroe</option>
                    <option value="sabio">Sabio</option>
            <option value="soldado">Soldado</option>
                    <option value="artesano">Artesano</option>
                    <option value="charlatan">Charlatán</option>
                    <option value="ermitaño">Ermitaño</option>
                    <option value="noble">Noble</option>
                    <option value="salvaje">Salvaje</option>
          </select>
        </div>

                {characterData.background && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <p><strong>Habilidades:</strong> {(getBackgroundSkills(characterData.background) || []).join(', ')}</p>
                    <p><strong>Equipo:</strong> {(backgroundData[characterData.background]?.equipment || []).join(', ')}</p>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Nombre del Jugador:
          </label>
          <input
            type="text"
            value={characterData.playerName || ''}
            onChange={(e) => handleCharacterDataChange('playerName', e.target.value)}
                    className="form-input"
                    placeholder="Tu nombre como jugador"
          />
        </div>

                <div className="form-group">
                  <label className="form-label">
                    Alineamiento:
                  </label>
                  <select
                    value={characterData.alignment || ''}
                    onChange={(e) => handleCharacterDataChange('alignment', e.target.value)}
                    className="form-select"
                  >

                    <option value="">Selecciona alineamiento</option>
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
        </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

    // Renderizar paso 2 - Estadísticas
  const renderStep2 = () => {
    const level = characterData.level || 1
    
          return (
      <div className="character-creation">
        <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
          <h2>PASO: ESTADÍSTICAS</h2>
              </div>
        
        <div className="step-container">
          <div className="step-header">
                            ⚔️ SISTEMA DE PUNTOS (25 puntos)
          </div>
          <div className="step-content">
            {/* Sección de Recomendaciones de Estadísticas - ARRIBA */}
            {characterData.class && (
              <div style={{ marginBottom: '20px' }}>
                <div className="section-header">
                  📊 ESTADÍSTICAS RECOMENDADAS
                </div>
                
                <div style={{ fontSize: '12px', marginBottom: '15px' }}>
                  <p><strong>Estadísticas óptimas para {classData[characterData.class]?.name}:</strong></p>
                </div>

                <div style={{ 
                  backgroundColor: '#e8f4f8', 
                  border: '2px solid #4CAF50', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {getRecommendedStats(characterData.class) ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {Object.entries(getRecommendedStats(characterData.class)).map(([stat, value]) => (
                        <div key={stat} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '4px 8px',
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          <span style={{ fontWeight: 'bold', color: '#2c5530' }}>
                            {stat === 'strength' ? 'Fuerza' :
                             stat === 'dexterity' ? 'Destreza' :
                             stat === 'constitution' ? 'Constitución' :
                             stat === 'intelligence' ? 'Inteligencia' :
                             stat === 'wisdom' ? 'Sabiduría' :
                             stat === 'charisma' ? 'Carisma' : stat}:
                          </span>
                          <span style={{ 
                            fontWeight: 'bold',
                            fontSize: '14px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            minWidth: '20px',
                            textAlign: 'center'
                          }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#666', fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
                      No hay estadísticas recomendadas para esta clase
                    </div>
                  )}
                </div>

                {creationMode !== 'guided' && (
                  <button
                    onClick={() => applyRecommendedStats(characterData.class)}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      width: '100%',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 5px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>🎯</span>
                    Aplicar Estadísticas Recomendadas
                  </button>
                )}

                {creationMode === 'guided' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', 
                    color: 'white', 
                    padding: '12px', 
                    borderRadius: '8px',
                    fontSize: '12px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 'bold'
                  }}>
                    <span style={{ fontSize: '16px' }}>✅</span>
                    Estadísticas aplicadas automáticamente
                    </div>
                    
                    <button
                      onClick={() => applyRecommendedStats(characterData.class)}
                      style={{
                        padding: '8px 12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        width: '100%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 3px 8px rgba(0,0,0,0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>🔄</span>
                      Restaurar Recomendadas
                    </button>
                  </div>
                )}

                {/* Desglose detallado de costes */}
                {characterData.class && characterData.race && (
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>
                      Desglose de costes (25 PB):
                    </div>
                    <div style={{ fontSize: '10px' }}>
                      {(() => {
                        const raceMods = getRaceModifiers(characterData.race, raceData)
                        return Object.entries(baseStats).map(([stat, effectiveValue]) => {
                          const raceMod = raceMods[stat] || 0
                          const baseValue = effectiveValue - raceMod
                          const cost = pointBuyCostFromBase(baseValue)
                          return (
                            <div key={stat} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              marginBottom: '2px',
                              padding: '2px 4px',
                              backgroundColor: cost > 0 ? '#f0f0f0' : 'transparent',
                              borderRadius: '2px'
                            }}>
                              <span>
                                {stat === 'strength' ? 'Fuerza' :
                                 stat === 'dexterity' ? 'Destreza' :
                                 stat === 'constitution' ? 'Constitución' :
                                 stat === 'intelligence' ? 'Inteligencia' :
                                 stat === 'wisdom' ? 'Sabiduría' :
                                 stat === 'charisma' ? 'Carisma' : stat}:
                              </span>
                              <span>
                                {baseValue} + {raceMod} = {effectiveValue} ({cost} PB)
                              </span>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="form-grid">
              {/* Columna 1 - Sistema de Puntos */}
              <div className="form-section">
                <div className="section-header">
                  📊 PUNTOS DISPONIBLES: {availablePoints}
        </div>

                                 <div style={{ marginBottom: '15px', fontSize: '12px' }}>
                   <p><strong>Costo por estadística:</strong></p>
                   <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                     <li>8-15: 1 punto por nivel</li>
                     <li>16+: 2 puntos por nivel</li>
                     <li><em>Los modificadores de raza no cuentan para el costo</em></li>
                   </ul>
          </div>
          
                                 {creationMode === 'guided' && (
                                   <div style={{ 
                                     background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', 
                                     border: '1px solid #FF9800', 
                                     color: '#E65100', 
                                     padding: '8px', 
                                     borderRadius: '6px',
                                     fontSize: '11px',
                                     textAlign: 'center',
                                     marginBottom: '10px',
                                     fontWeight: 'bold'
                                   }}>
                                     <span style={{ fontSize: '14px', marginRight: '5px' }}>ℹ️</span>
                                     Modo Guiado: Las estadísticas se ajustan automáticamente
                                   </div>
                                 )}
          
                                 <div className="stats-container">
                   {Object.entries(baseStats).map(([stat, value]) => {
                     const baseStat = getBaseStat(stat)
                     const raceModifiers = getRaceModifiers(characterData.race, raceData) || {};
                     const raceModifier = raceModifiers[stat] || 0;
                     
                return (
                       <div key={stat} className="stat-item">
                         <div className="stat-name">
                           {stat === 'strength' ? 'Fuerza' :
                            stat === 'dexterity' ? 'Destreza' :
                            stat === 'constitution' ? 'Constitución' :
                            stat === 'intelligence' ? 'Inteligencia' :
                            stat === 'wisdom' ? 'Sabiduría' :
                            stat === 'charisma' ? 'Carisma' : stat}
                        </div>
                         <div className="stat-value">
                           {value}
                           {raceModifier > 0 && (
                             <span style={{ fontSize: '10px', color: '#4CAF50', marginLeft: '5px' }}>
                               (+{raceModifier})
                        </span>
                )}
              </div>
                         <div className="stat-modifier">
                           {getAbilityModifier(value) >= 0 ? '+' : ''}{getAbilityModifier(value)}
          </div>
                         <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>
                           Base: {baseStat} | Costo: {getStatCost(stat)} pts
        </div>
                         <div className="stat-controls">
                <button
                             className="stat-button"
                             onClick={() => handleStatChange(stat, Math.max(getMinStatValue(stat), value - 1))}
                             disabled={value <= getMinStatValue(stat) || creationMode === 'guided'}
                           >
                             -
                </button>
                           <span style={{ fontSize: '12px', color: '#666' }}>
                             ({getStatCost(stat)})
                           </span>
              <button
                             className="stat-button"
                             onClick={() => handleStatChange(stat, Math.min(18, value + 1))}
                             disabled={value >= 18 || availablePoints === 0 || creationMode === 'guided'}
                           >
                             +
              </button>
                  </div>
                </div>
                     )
                   })}
            </div>
          </div>

              {/* Columna 2 - Puntos de Vida y Recomendaciones */}
              <div className="form-section">
                <div className="section-header">
                  🎲 PUNTOS DE VIDA
                </div>
                
                                <div className="hp-auto">
                  <h4>Puntos de Vida del Personaje</h4>
                  <div style={{ fontSize: '12px', marginBottom: '15px' }}>
                    <p><strong>Nivel 1:</strong> SIEMPRE máximo del dado + Constitución</p>
                    {level > 1 && (
                      <p><strong>Niveles 2-{level}:</strong> Promedio del dado + Constitución por nivel</p>
                    )}
                    {characterData.maxHitPoints && (
                      <div style={{ 
                        backgroundColor: '#f0f8f0', 
                        border: '2px solid #4CAF50', 
                        borderRadius: '8px', 
                        padding: '15px', 
                        marginTop: '15px',
                        textAlign: 'center'
                      }}>
                        <p style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '16px', margin: '0' }}>
                          ✅ Puntos de Vida: {characterData.maxHitPoints}
                        </p>
                        <p style={{ color: '#666', fontSize: '12px', margin: '5px 0 0 0' }}>
                          Cálculo: {classData[characterData.class]?.hitDie || 'd8'} máximo ({parseInt((classData[characterData.class]?.hitDie || 'd8').replace('d', ''))}) + Constitución ({getAbilityModifier(characterData.constitution || 10)}) = {characterData.maxHitPoints} HP
                        </p>
                        {getAbilityModifier(characterData.constitution || 10) >= 0 && (
                          <p style={{ color: '#4CAF50', fontSize: '11px', margin: '3px 0 0 0', fontStyle: 'italic' }}>
                            ¡Bonus de Constitución aplicado!
                          </p>
                        )}
                        {getAbilityModifier(characterData.constitution || 10) < 0 && (
                          <p style={{ color: '#d32f2f', fontSize: '11px', margin: '3px 0 0 0', fontStyle: 'italic' }}>
                            Penalización de Constitución aplicada
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                
              </div>

              {/* Columna 3 - Equipo Inicial */}
              <div className="form-section">
                <div className="section-header">
                  🛡️ EQUIPO INICIAL
                </div>
                
                <div className="equipment-section">
                  <h4>Equipo de {classData[characterData.class]?.name || 'Clase'}</h4>
                  <div style={{ fontSize: '12px', marginBottom: '15px' }}>
                    <p><strong>Modo: {creationMode === 'guided' ? 'Guiado (selección automática)' : 'Personalizado (selección libre)'}</strong></p>
                  </div>
                  
                  {characterData.class && classData[characterData.class]?.startingEquipment && (
                    <div style={{ 
                      backgroundColor: '#f8f8f8', 
                      border: '2px solid #8B4513', 
                      borderRadius: '8px', 
                      padding: '15px', 
                      marginTop: '15px'
                    }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#8B4513' }}>Armadura:</strong>
                        {creationMode === 'guided' ? (
                          <div style={{ 
                            marginLeft: '10px', 
                            padding: '8px', 
                            backgroundColor: '#e8f4f8', 
                            borderRadius: '4px',
                            border: '1px solid #4CAF50'
                          }}>
                            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                              {getRecommendedArmor(characterData.class)}
                            </span>
                            <span style={{ fontSize: '11px', color: '#666', marginLeft: '10px' }}>
                              (Recomendada para {classData[characterData.class]?.name})
                            </span>
                          </div>
                        ) : (
                          <select
                            value={characterData.armor || ''}
                            onChange={(e) => handleCharacterDataChange('armor', e.target.value)}
                            style={{
                              marginLeft: '10px',
                              padding: '5px',
                              borderRadius: '4px',
                              border: '1px solid #ccc'
                            }}
                          >
                            <option value="">Seleccionar armadura</option>
                            {getAvailableArmorOptions(characterData.class).map(armor => (
                              <option key={armor.value} value={armor.value}>
                                {armor.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#8B4513' }}>Escudo:</strong>
                        {creationMode === 'guided' ? (
                          <div style={{ 
                            marginLeft: '10px', 
                            padding: '8px', 
                            backgroundColor: '#e8f4f8', 
                            borderRadius: '4px',
                            border: '1px solid #4CAF50'
                          }}>
                            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                              {getRecommendedShield(characterData.class)}
                            </span>
                          </div>
                        ) : (
                          <select
                            value={characterData.shield || ''}
                            onChange={(e) => handleCharacterDataChange('shield', e.target.value)}
                            style={{
                              marginLeft: '10px',
                              padding: '5px',
                              borderRadius: '4px',
                              border: '1px solid #ccc'
                            }}
                          >
                            <option value="">Sin escudo</option>
                            <option value="escudo">Escudo (+2 AC)</option>
                            <option value="escudo de madera">Escudo de madera (+2 AC)</option>
                          </select>
                        )}
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#8B4513' }}>Arma Principal:</strong>
                        {creationMode === 'guided' ? (
                          <div style={{ 
                            marginLeft: '10px', 
                            padding: '8px', 
                            backgroundColor: '#e8f4f8', 
                            borderRadius: '4px',
                            border: '1px solid #4CAF50'
                          }}>
                            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                              {getRecommendedWeapon(characterData.class, 'primary')}
                            </span>
                          </div>
                        ) : (
                          <select
                            value={characterData.weapon1 || ''}
                            onChange={(e) => handleCharacterDataChange('weapon1', e.target.value)}
                            style={{
                              marginLeft: '10px',
                              padding: '5px',
                              borderRadius: '4px',
                              border: '1px solid #ccc'
                            }}
                          >
                            <option value="">Seleccionar arma</option>
                            {getAvailableWeaponOptions(characterData.class).map(weapon => (
                              <option key={weapon.value} value={weapon.value}>
                                {weapon.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#8B4513' }}>Arma Secundaria:</strong>
                        {creationMode === 'guided' ? (
                          <div style={{ 
                            marginLeft: '10px', 
                            padding: '8px', 
                            backgroundColor: '#e8f4f8', 
                            borderRadius: '4px',
                            border: '1px solid #4CAF50'
                          }}>
                            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                              {getRecommendedWeapon(characterData.class, 'secondary')}
                            </span>
                          </div>
                        ) : (
                          <select
                            value={characterData.weapon2 || ''}
                            onChange={(e) => handleCharacterDataChange('weapon2', e.target.value)}
                            style={{
                              marginLeft: '10px',
                              padding: '5px',
                              borderRadius: '4px',
                              border: '1px solid #ccc'
                            }}
                          >
                            <option value="">Sin arma secundaria</option>
                            <option value="espada corta">Espada corta (1d6)</option>
                            <option value="daga">Daga (1d4)</option>
                            <option value="hacha de mano">Hacha de mano (1d6)</option>
                            <option value="maza">Maza (1d6)</option>
                          </select>
                        )}
                      </div>

                      <div style={{ 
                        backgroundColor: '#e8f4f8', 
                        border: '1px solid #4CAF50', 
                        borderRadius: '4px', 
                        padding: '10px', 
                        marginTop: '10px'
                      }}>
                        <p style={{ margin: '0', fontSize: '12px', color: '#4CAF50' }}>
                          <strong>Equipo adicional:</strong> {getAdditionalEquipment(characterData.class)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar paso 3 - Habilidades y Personalidad
  const renderStep3 = () => {
          return (
      <div className="character-creation">
        <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
          <h2>PASO: HABILIDADES Y PERSONALIDAD</h2>
              </div>
        
        <div className="step-container">
          <div className="step-header">
            🎭 HABILIDADES Y PERSONALIDAD
                   </div>
          <div className="step-content">
            <div className="form-grid">
              {/* Columna 1 - Habilidades */}
              <div className="form-section">
                <div className="section-header">
                  ⚔️ SELECCIÓN DE HABILIDADES
          </div>
          
                <div style={{ fontSize: '12px', marginBottom: '15px' }}>
                  <p>Selecciona las habilidades en las que tu personaje es proficiente:</p>
                  <p style={{ color: '#666', fontSize: '11px' }}>
                    <strong>Modo:</strong> {creationMode === 'guided' ? 'Guiado (habilidades de clase + trasfondo)' : 'Personalizado (todas las habilidades disponibles)'}
                  </p>
                  <p style={{ color: '#8B4513', fontSize: '11px', fontWeight: 'bold' }}>
                    <strong>Límite:</strong> {getMaxSkillChoices(characterData.class)} habilidades de clase
                    {Array.isArray(characterData.skills) && (
                      (() => {
                        const backgroundSkillList = getBackgroundSkills(characterData.background) || []
                        const nonBackgroundSkills = characterData.skills.filter(skill => !backgroundSkillList.includes(skill))
                        const isAtLimit = nonBackgroundSkills.length >= getMaxSkillChoices(characterData.class)
                        const isExact = nonBackgroundSkills.length === getMaxSkillChoices(characterData.class)
                        
                        let statusColor = '#4CAF50' // Verde por defecto
                        let statusText = ''
                        
                        if (isExact) {
                          statusColor = '#4CAF50' // Verde - número exacto
                          statusText = ' ✓ Completado'
                        } else if (isAtLimit) {
                          statusColor = '#d32f2f' // Rojo - demasiadas
                          statusText = ' ✗ Demasiadas'
                        } else {
                          statusColor = '#FF9800' // Naranja - faltan
                          statusText = ' ⚠ Faltan'
                        }
                        
                        return (
                          <span style={{ color: statusColor }}>
                            {' '}({nonBackgroundSkills.length}/{getMaxSkillChoices(characterData.class)} seleccionadas){statusText}
                          </span>
                        )
                      })()
                    )}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {(getAvailableSkills(characterData.class, characterData.background) || []).map(skill => {
                    const isFromBackground = isBackgroundSkill(skill)
                    const isSelected = isSkillSelected(skill)
                    const isDisabled = (!canSelectMoreSkills() && !isSelected) || isFromBackground
                    
                    return (
                      <label key={skill} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '12px',
                        opacity: isDisabled ? 0.7 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        color: isFromBackground ? '#8B4513' : '#333',
                        fontWeight: isFromBackground ? 'bold' : 'normal'
                      }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSkillToggle(skill)}
                          disabled={isDisabled}
                          style={{ 
                            marginRight: '8px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                          }}
                        />
                        {skill}
                        {isFromBackground && (
                          <span style={{ 
                            marginLeft: '4px', 
                            fontSize: '10px', 
                            color: '#8B4513',
                            fontStyle: 'italic'
                          }}>
                            (Trasfondo)
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
    </div>

              {/* Columna 2 - Tiradas de Salvación y Personalidad */}
              <div className="form-section">
                <div className="section-header">
                  🛡️ TIRADAS DE SALVACIÓN
                </div>
                
                <div style={{ fontSize: '12px', marginBottom: '15px' }}>
                  <p>Tu clase te da proficiencia en estas tiradas de salvación:</p>
                </div>

                <div style={{ 
                  backgroundColor: '#e8f4f8', 
                  border: '1px solid #4CAF50', 
                  borderRadius: '4px', 
                  padding: '10px', 
                  marginBottom: '20px'
                }}>
                  {(getClassSavingThrows(characterData.class) || []).map(savingThrow => (
                    <div key={savingThrow} style={{ 
                      color: '#4CAF50', 
                      fontWeight: 'bold', 
                      fontSize: '12px',
                      marginBottom: '5px'
                    }}>
                      ✓ {savingThrow}
                    </div>
                  ))}
                  {(!getClassSavingThrows(characterData.class) || getClassSavingThrows(characterData.class).length === 0) && (
                    <div style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>
                      No hay tiradas de salvación específicas para esta clase
                    </div>
                  )}
                </div>

                <div className="section-header">
                  🎭 PERSONALIDAD DEL PERSONAJE
                </div>
                
                          <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {creationMode !== 'guided' && (
                      <button
                        onClick={() => setPersonalityMethod('custom')}
                        style={{
                          padding: '5px 10px',
                          border: '1px solid #333',
                          background: personalityMethod === 'custom' ? '#DAA520' : '#f0f0f0',
                          color: personalityMethod === 'custom' ? 'white' : '#333',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Personalizar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setPersonalityMethod('random')
                        generateRandomPersonality()
                      }}
                      style={{
                        padding: '5px 10px',
                        border: '1px solid #333',
                        background: personalityMethod === 'random' ? '#DAA520' : '#f0f0f0',
                        color: personalityMethod === 'random' ? 'white' : '#333',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Al Azar
                    </button>
                    <button
                      onClick={() => setPersonalityMethod('select')}
                      style={{
                        padding: '5px 10px',
                        border: '1px solid #333',
                        background: personalityMethod === 'select' ? '#DAA520' : '#f0f0f0',
                        color: personalityMethod === 'select' ? 'white' : '#333',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Seleccionar
                    </button>
                    {creationMode !== 'guided' && (
                    <button
                      onClick={clearPersonality}
                      style={{
                        padding: '5px 10px',
                        border: '1px solid #333',
                        background: '#666',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Limpiar
                    </button>
                    )}
                  </div>
                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                      Rasgo de Personalidad:
                    </label>
                    {personalityMethod === 'select' ? (
                      <select
                        value={characterData.personalityTrait || ''}
                        onChange={(e) => handleCharacterDataChange('personalityTrait', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #333',
                          fontSize: '12px',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="">Selecciona un rasgo de personalidad</option>
                        {getPersonalityOptions('personalityTrait').map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        value={characterData.personalityTrait || ''}
                        onChange={(e) => handleCharacterDataChange('personalityTrait', e.target.value)}
                        disabled={personalityMethod === 'random'}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #333',
                          fontSize: '12px',
                          minHeight: '60px',
                          resize: 'vertical',
                          color: personalityMethod === 'random' ? '#666' : '#000'
                        }}
                        placeholder="Describe un rasgo de personalidad..."
                      />
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                      Ideal:
                    </label>
                    {personalityMethod === 'select' ? (
                      <select
                        value={characterData.ideal || ''}
                        onChange={(e) => handleCharacterDataChange('ideal', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #333',
                          fontSize: '12px',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="">Selecciona un ideal</option>
                        {getPersonalityOptions('ideal').map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        value={characterData.ideal || ''}
                        onChange={(e) => handleCharacterDataChange('ideal', e.target.value)}
                        disabled={personalityMethod === 'random'}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #333',
                          fontSize: '12px',
                          minHeight: '60px',
                          resize: 'vertical',
                          color: personalityMethod === 'random' ? '#666' : '#000'
                        }}
                        placeholder="Describe el ideal del personaje..."
                      />
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                      Vínculo:
                    </label>
                    {personalityMethod === 'select' ? (
                      <select
                        value={characterData.bond || ''}
                        onChange={(e) => handleCharacterDataChange('bond', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #333',
                          fontSize: '12px',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="">Selecciona un vínculo</option>
                        {getPersonalityOptions('bond').map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        value={characterData.bond || ''}
                        onChange={(e) => handleCharacterDataChange('bond', e.target.value)}
                        disabled={personalityMethod === 'random'}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #333',
                          fontSize: '12px',
                          minHeight: '60px',
                          resize: 'vertical',
                          color: personalityMethod === 'random' ? '#666' : '#000'
                        }}
                        placeholder="Describe el vínculo del personaje..."
                      />
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                      Defecto:
                    </label>
                    {personalityMethod === 'select' ? (
                      <select
                        value={characterData.flaw || ''}
                        onChange={(e) => handleCharacterDataChange('flaw', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #333',
                          fontSize: '12px',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="">Selecciona un defecto</option>
                        {getPersonalityOptions('flaw').map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        value={characterData.flaw || ''}
                        onChange={(e) => handleCharacterDataChange('flaw', e.target.value)}
                        disabled={personalityMethod === 'random'}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #333',
                          fontSize: '12px',
                          minHeight: '60px',
                          resize: 'vertical',
                          color: personalityMethod === 'random' ? '#666' : '#000'
                        }}
                        placeholder="Describe el defecto del personaje..."
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
  }



  // Renderizar paso 4 - Resumen del personaje
  const renderStep4 = () => {
    return (
      <div className="character-creation">
                <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
          <h2>PASO RESUMEN DEL PERSONAJE</h2>
        </div>
        
        <div className="step-container">
          <div className="step-header">
            💾 RESUMEN DEL PERSONAJE
          </div>
          <div className="step-content">
            <div className="summary-section">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">Nombre:</div>
                  <div className="summary-value">{characterData.name}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Clase:</div>
                  <div className="summary-value">{classData[characterData.class]?.name}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Nivel:</div>
                  <div className="summary-value">1</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Raza:</div>
                  <div className="summary-value">{raceData[characterData.race]?.name}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Género:</div>
                  <div className="summary-value">{characterData.gender}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Trasfondo:</div>
                  <div className="summary-value">{backgroundData[characterData.background]?.name}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Nombre del Jugador:</div>
                  <div className="summary-value">{characterData.playerName || 'No especificado'}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Alineamiento:</div>
                  <div className="summary-value">{characterData.alignment || 'No seleccionado'}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Puntos de Vida:</div>
                  <div className="summary-value">{characterData.maxHitPoints}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Clase de Armadura:</div>
                  <div className="summary-value">{calculateArmorClass(characterData)}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Habilidades:</div>
                  <div className="summary-value">{characterData.skills?.join(', ') || 'Ninguna'}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Rasgo de Personalidad:</div>
                  <div className="summary-value">{characterData.personalityTrait || 'No especificado'}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Ideal:</div>
                  <div className="summary-value">{characterData.ideal || 'No especificado'}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Vínculo:</div>
                  <div className="summary-value">{characterData.bond || 'No especificado'}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Defecto:</div>
                  <div className="summary-value">{characterData.flaw || 'No especificado'}</div>
                </div>
              </div>

              {/* Sección de Conjuros */}
              {(() => {
                const spellInfo = getSpellcastingSummary(characterData.class, 1, 0)
                const knownCantrips = characterData.cantrips || []
                const knownSpells = characterData.spells || []
                const maxCantripsKnown = cantripsKnownAt(characterData.class, 1)
                
                if (spellInfo && spellInfo.casterType !== 'none') {
                  return (
                    <div style={{
                      marginTop: '20px',
                      padding: '15px',
                      backgroundColor: '#e8f5e8',
                      border: '2px solid #4caf50',
                      borderRadius: '8px'
                    }}>
                      <h3 style={{
                        margin: '0 0 15px 0',
                        fontSize: '16px',
                        color: '#2e7d32',
                        textAlign: 'center'
                      }}>
                        📚 Conjuros Conocidos
                      </h3>
                      
                      <div style={{ display: 'flex', gap: '20px' }}>
                        {/* Trucos */}
                        <div style={{ flex: '1' }}>
                                                     <h4 style={{
                             margin: '0 0 10px 0',
                             fontSize: '14px',
                             color: '#2e7d32',
                             textAlign: 'center'
                           }}>
                             🎭 Trucos ({knownCantrips.length}/{maxCantripsKnown})
                           </h4>
                          {knownCantrips.length > 0 ? (
                            <div style={{
                              backgroundColor: 'white',
                              border: '1px solid #c8e6c9',
                              borderRadius: '6px',
                              padding: '10px',
                              maxHeight: '150px',
                              overflowY: 'auto'
                            }}>
                              {knownCantrips.map((cantripKey, index) => {
                                const cantripData = spellsData.cantrips?.[cantripKey]
                                return (
                                  <div 
                                    key={index} 
                                    onClick={() => showSpellInfo(cantripKey, true)}
                                    style={{
                                      padding: '6px 10px',
                                      marginBottom: '5px',
                                      backgroundColor: '#f1f8e9',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      borderLeft: '3px solid #4caf50',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = '#e8f5e8'
                                      e.target.style.transform = 'translateX(2px)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = '#f1f8e9'
                                      e.target.style.transform = 'translateX(0)'
                                    }}
                                  >
                                    <strong>{cantripData?.name || cantripKey}</strong>
                                    <span style={{ fontSize: '10px', color: '#4caf50' }}>ℹ️</span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p style={{
                              fontSize: '12px',
                              color: '#666',
                              fontStyle: 'italic',
                              textAlign: 'center'
                            }}>
                              No hay trucos conocidos
                            </p>
                          )}
                        </div>

                        {/* Conjuros */}
                        <div style={{ flex: '1' }}>
                          <h4 style={{
                            margin: '0 0 10px 0',
                            fontSize: '14px',
                            color: '#2e7d32',
                            textAlign: 'center'
                          }}>
                            📖 Conjuros ({knownSpells.length}/{spellInfo.spellsKnown})
                          </h4>
                          {knownSpells.length > 0 ? (
                            <div style={{
                              backgroundColor: 'white',
                              border: '1px solid #c8e6c9',
                              borderRadius: '6px',
                              padding: '10px',
                              maxHeight: '150px',
                              overflowY: 'auto'
                            }}>
                              {knownSpells.map((spellKey, index) => {
                                // Buscar el conjuro en todos los niveles
                                const spellData = findSpellDataByKey(spellKey)
                                return (
                                  <div 
                                    key={index} 
                                    onClick={() => showSpellInfo(spellKey, false)}
                                    style={{
                                      padding: '6px 10px',
                                      marginBottom: '5px',
                                      backgroundColor: '#f1f8e9',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      borderLeft: '3px solid #4caf50',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = '#e8f5e8'
                                      e.target.style.transform = 'translateX(2px)'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = '#f1f8e9'
                                      e.target.style.transform = 'translateX(0)'
                                    }}
                                  >
                                    <strong>{spellData?.name || spellKey}</strong>
                                    <span style={{ fontSize: '10px', color: '#4caf50' }}>ℹ️</span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p style={{
                              fontSize: '12px',
                              color: '#666',
                              fontStyle: 'italic',
                              textAlign: 'center'
                            }}>
                              No hay conjuros conocidos
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              {/* Sección de Mecánicas de Clase Interactivas */}
              <ClassMechanicsManager 
                characterData={characterData}
                onMechanicsChange={handleMechanicsChange}
              />

              {/* Calculadora de Daño */}
              <WeaponDamageCalculator 
                characterData={characterData}
                mechanics={mechanics}
                onDamageChange={handleDamageChange}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Estado para el sistema de subida de nivel progresiva
  const [currentLevelUpStep, setCurrentLevelUpStep] = useState(1)
  const [levelUpHistory, setLevelUpHistory] = useState([])
  const [hpRolledForLevel, setHpRolledForLevel] = useState({})
  const [newCantrips, setNewCantrips] = useState([])
  const [newSpells, setNewSpells] = useState([])
  const [selectedSpellForDetails, setSelectedSpellForDetails] = useState(null)
  const [spellSelections, setSpellSelections] = useState({}) // Para persistir selecciones por nivel
  const [showLevelUpManager, setShowLevelUpManager] = useState(false)
  const [finalCharacterData, setFinalCharacterData] = useState(null)
  const [initialTargetLevel, setInitialTargetLevel] = useState(1)

  // Derivados para la subida progresiva (a nivel de componente)
  const startLevel = 1
  const targetLevel = characterData.level || 1
  const fromLevelDerived = startLevel + currentLevelUpStep - 1
  const toLevelDerived = fromLevelDerived + 1

  // Sincroniza selecciones guardadas cuando cambie el "paso" de nivel
  React.useEffect(() => {
    const saved = spellSelections[toLevelDerived] || { cantrips: [], spells: [] }
    if (newCantrips.length === 0 && saved.cantrips && saved.cantrips.length > 0) {
      setNewCantrips(saved.cantrips)
    }
    if (newSpells.length === 0 && saved.spells && saved.spells.length > 0) {
      setNewSpells(saved.spells)
    }
  }, [toLevelDerived, spellSelections, newCantrips.length, newSpells.length])

  // Manejar la finalización del personaje
  const handleFinishCharacter = async () => {
    // DEBUG: Verificar el estado actual del personaje
    console.log('🔍 DEBUG - characterData completo:', characterData)
    console.log('🔍 DEBUG - alignment:', characterData.alignment)
    console.log('🔍 DEBUG - skills antes de procesar:', characterData.skills)
    console.log('🔍 DEBUG - skills tipo:', typeof characterData.skills)
    console.log('🔍 DEBUG - skills es array:', Array.isArray(characterData.skills))
    console.log('🔍 DEBUG - skills longitud:', characterData.skills ? characterData.skills.length : 'undefined')
    
    // Obtener las tiradas de salvación de la clase
    const classSavingThrows = savingThrowsByClass[characterData.class] || []
    
    // Obtener el equipo inicial de la clase
    const startingEquipment = getClassStartingEquipment(characterData.class) || []
    
    // Crear el objeto de tiradas de salvación con las proficiencias correctas
    const savingThrows = {
      strength: { 
        proficient: classSavingThrows.includes('strength'), 
        modifier: getAbilityModifier(characterData.strength || 10) + (classSavingThrows.includes('strength') ? (characterData.proficiencyBonus || 2) : 0)
      },
      dexterity: { 
        proficient: classSavingThrows.includes('dexterity'), 
        modifier: getAbilityModifier(characterData.dexterity || 10) + (classSavingThrows.includes('dexterity') ? (characterData.proficiencyBonus || 2) : 0)
      },
      constitution: { 
        proficient: classSavingThrows.includes('constitution'), 
        modifier: getAbilityModifier(characterData.constitution || 10) + (classSavingThrows.includes('constitution') ? (characterData.proficiencyBonus || 2) : 0)
      },
      intelligence: { 
        proficient: classSavingThrows.includes('intelligence'), 
        modifier: getAbilityModifier(characterData.intelligence || 10) + (classSavingThrows.includes('intelligence') ? (characterData.proficiencyBonus || 2) : 0)
      },
      wisdom: { 
        proficient: classSavingThrows.includes('wisdom'), 
        modifier: getAbilityModifier(characterData.wisdom || 10) + (classSavingThrows.includes('wisdom') ? (characterData.proficiencyBonus || 2) : 0)
      },
      charisma: { 
        proficient: classSavingThrows.includes('charisma'), 
        modifier: getAbilityModifier(characterData.charisma || 10) + (classSavingThrows.includes('charisma') ? (characterData.proficiencyBonus || 2) : 0)
      }
    }
    
    // Crear el objeto de habilidades con las proficiencias seleccionadas
    const currentSkills = Array.isArray(characterData.skills) ? characterData.skills : []
    console.log('🔍 DEBUG - currentSkills:', currentSkills)
    console.log('🔍 DEBUG - characterData.background:', characterData.background)
    console.log('🔍 DEBUG - backgroundSkills:', getBackgroundSkills(characterData.background))
    
    // Asegurar que las habilidades del trasfondo estén incluidas
    const backgroundSkillList = getBackgroundSkills(characterData.background) || []
    const allProficientSkills = [...currentSkills]
    backgroundSkillList.forEach(skill => {
      if (!allProficientSkills.includes(skill)) {
        allProficientSkills.push(skill)
      }
    })
    
    console.log('🔍 DEBUG - allProficientSkills final:', allProficientSkills)
    
    // por que carajos no se guardan las habilidades?
    console.log('🔍 DEBUG - Verificando cada habilidad:')
    console.log('🔍 DEBUG - Acrobacias en allProficientSkills:', allProficientSkills.includes('Acrobacias'))
    console.log('🔍 DEBUG - Atletismo en allProficientSkills:', allProficientSkills.includes('Atletismo'))
    console.log('🔍 DEBUG - C. Arcano en allProficientSkills:', allProficientSkills.includes('C. Arcano'))
    console.log('🔍 DEBUG - Engaño en allProficientSkills:', allProficientSkills.includes('Engaño'))
    console.log('🔍 DEBUG - Historia en allProficientSkills:', allProficientSkills.includes('Historia'))
    console.log('🔍 DEBUG - Perspicacia en allProficientSkills:', allProficientSkills.includes('Perspicacia'))
    console.log('🔍 DEBUG - Intimidación en allProficientSkills:', allProficientSkills.includes('Intimidación'))
    console.log('🔍 DEBUG - Investigación en allProficientSkills:', allProficientSkills.includes('Investigación'))
    console.log('🔍 DEBUG - Medicina en allProficientSkills:', allProficientSkills.includes('Medicina'))
    console.log('🔍 DEBUG - Naturaleza en allProficientSkills:', allProficientSkills.includes('Naturaleza'))
    console.log('🔍 DEBUG - Percepción en allProficientSkills:', allProficientSkills.includes('Percepción'))
    console.log('🔍 DEBUG - Interpretación en allProficientSkills:', allProficientSkills.includes('Interpretación'))
    console.log('🔍 DEBUG - Persuasión en allProficientSkills:', allProficientSkills.includes('Persuasión'))
    console.log('🔍 DEBUG - Religión en allProficientSkills:', allProficientSkills.includes('Religión'))
    console.log('🔍 DEBUG - Juego de Manos en allProficientSkills:', allProficientSkills.includes('Juego de Manos'))
    console.log('🔍 DEBUG - Sigilo en allProficientSkills:', allProficientSkills.includes('Sigilo'))
    console.log('🔍 DEBUG - Supervivencia en allProficientSkills:', allProficientSkills.includes('Supervivencia'))
    console.log('🔍 DEBUG - T. con Animales en allProficientSkills:', allProficientSkills.includes('T. con Animales'))
    
    // DEBUG: Verificar cada skill individual en el objeto final
    console.log('🔍 DEBUG - Verificando skills objeto final:')
    const finalSkillsCheck = {
      acrobatics: allProficientSkills.includes('Acrobacias'),
      athletics: allProficientSkills.includes('Atletismo'),
      arcana: allProficientSkills.includes('C. Arcano'),
      deception: allProficientSkills.includes('Engaño'),
      history: allProficientSkills.includes('Historia'),
      insight: allProficientSkills.includes('Perspicacia'),
      intimidation: allProficientSkills.includes('Intimidación'),
      investigation: allProficientSkills.includes('Investigación'),
      medicine: allProficientSkills.includes('Medicina'),
      nature: allProficientSkills.includes('Naturaleza'),
      perception: allProficientSkills.includes('Percepción'),
      performance: allProficientSkills.includes('Interpretación'),
      persuasion: allProficientSkills.includes('Persuasión'),
      religion: allProficientSkills.includes('Religión'),
      sleightOfHand: allProficientSkills.includes('Juego de Manos'),
      stealth: allProficientSkills.includes('Sigilo'),
      survival: allProficientSkills.includes('Supervivencia'),
      animalHandling: allProficientSkills.includes('T. con Animales')
    }
    console.log('🔍 DEBUG - finalSkillsCheck:', finalSkillsCheck)
    
    const skills = {
      acrobatics: { proficient: allProficientSkills.includes('Acrobacias'), modifier: getAbilityModifier(characterData.dexterity || 10) + (allProficientSkills.includes('Acrobacias') ? (characterData.proficiencyBonus || 2) : 0) },
      athletics: { proficient: allProficientSkills.includes('Atletismo'), modifier: getAbilityModifier(characterData.strength || 10) + (allProficientSkills.includes('Atletismo') ? (characterData.proficiencyBonus || 2) : 0) },
      arcana: { proficient: allProficientSkills.includes('C. Arcano'), modifier: getAbilityModifier(characterData.intelligence || 10) + (allProficientSkills.includes('C. Arcano') ? (characterData.proficiencyBonus || 2) : 0) },
      deception: { proficient: allProficientSkills.includes('Engaño'), modifier: getAbilityModifier(characterData.charisma || 10) + (allProficientSkills.includes('Engaño') ? (characterData.proficiencyBonus || 2) : 0) },
      history: { proficient: allProficientSkills.includes('Historia'), modifier: getAbilityModifier(characterData.intelligence || 10) + (allProficientSkills.includes('Historia') ? (characterData.proficiencyBonus || 2) : 0) },
      insight: { proficient: allProficientSkills.includes('Perspicacia'), modifier: getAbilityModifier(characterData.wisdom || 10) + (allProficientSkills.includes('Perspicacia') ? (characterData.proficiencyBonus || 2) : 0) },
      intimidation: { proficient: allProficientSkills.includes('Intimidación'), modifier: getAbilityModifier(characterData.charisma || 10) + (allProficientSkills.includes('Intimidación') ? (characterData.proficiencyBonus || 2) : 0) },
      investigation: { proficient: allProficientSkills.includes('Investigación'), modifier: getAbilityModifier(characterData.intelligence || 10) + (allProficientSkills.includes('Investigación') ? (characterData.proficiencyBonus || 2) : 0) },
      medicine: { proficient: allProficientSkills.includes('Medicina'), modifier: getAbilityModifier(characterData.wisdom || 10) + (allProficientSkills.includes('Medicina') ? (characterData.proficiencyBonus || 2) : 0) },
      nature: { proficient: allProficientSkills.includes('Naturaleza'), modifier: getAbilityModifier(characterData.intelligence || 10) + (allProficientSkills.includes('Naturaleza') ? (characterData.proficiencyBonus || 2) : 0) },
      perception: { proficient: allProficientSkills.includes('Percepción'), modifier: getAbilityModifier(characterData.wisdom || 10) + (allProficientSkills.includes('Percepción') ? (characterData.proficiencyBonus || 2) : 0) },
      performance: { proficient: allProficientSkills.includes('Interpretación'), modifier: getAbilityModifier(characterData.charisma || 10) + (allProficientSkills.includes('Interpretación') ? (characterData.proficiencyBonus || 2) : 0) },
      persuasion: { proficient: allProficientSkills.includes('Persuasión'), modifier: getAbilityModifier(characterData.charisma || 10) + (allProficientSkills.includes('Persuasión') ? (characterData.proficiencyBonus || 2) : 0) },
      religion: { proficient: allProficientSkills.includes('Religión'), modifier: getAbilityModifier(characterData.intelligence || 10) + (allProficientSkills.includes('Religión') ? (characterData.proficiencyBonus || 2) : 0) },
      sleightOfHand: { proficient: allProficientSkills.includes('Juego de Manos'), modifier: getAbilityModifier(characterData.dexterity || 10) + (allProficientSkills.includes('Juego de Manos') ? (characterData.proficiencyBonus || 2) : 0) },
      stealth: { proficient: allProficientSkills.includes('Sigilo'), modifier: getAbilityModifier(characterData.dexterity || 10) + (allProficientSkills.includes('Sigilo') ? (characterData.proficiencyBonus || 2) : 0) },
      survival: { proficient: allProficientSkills.includes('Supervivencia'), modifier: getAbilityModifier(characterData.wisdom || 10) + (allProficientSkills.includes('Supervivencia') ? (characterData.proficiencyBonus || 2) : 0) },
      animalHandling: { proficient: allProficientSkills.includes('T. con Animales'), modifier: getAbilityModifier(characterData.wisdom || 10) + (allProficientSkills.includes('T. con Animales') ? (characterData.proficiencyBonus || 2) : 0) }
    }
    
    // Stats object for calculations
    const stats = {
      strength: characterData.strength,
      dexterity: characterData.dexterity,
      constitution: characterData.constitution,
      intelligence: characterData.intelligence,
      wisdom: characterData.wisdom,
      charisma: characterData.charisma,
    };
    
    // Auto equipment if no manual selection
    const autoArmor = getRecommendedArmor(characterData.class);
    const autoShield = getRecommendedShield(characterData.class);
    const autoW1 = getRecommendedWeapon(characterData.class, 'primary');
    const autoW2 = getRecommendedWeapon(characterData.class, 'secondary');
    const autoOther = getAdditionalEquipment(characterData.class);
    
    const armor = characterData.armor || autoArmor;
    const shield = characterData.shield || autoShield;
    const weapon1 = characterData.weapon1 || autoW1;
    const weapon2 = characterData.weapon2 || autoW2;
    
    // Dynamic attacks
    const attacks = buildAttacks({
      weapon1,
      weapon2,
      cls: characterData.class,
      stats,
      proficiencyBonus: characterData.proficiencyBonus ?? 2,
      selectedCantrips,
      selectedSpells
    });
    
    // Procesar hechizos seleccionados
    const processedCantrips = selectedCantrips.map(c => c.key || c);
    const processedSpells = selectedSpells.map(s => s.key || s);

    // Calcular información de conjuros
    const spellcastingAbility = getSpellcastingAbility(characterData.class);
    const spellcastingModifier = mod(characterData[spellcastingAbility] || 10);
    const spellSaveDC = 8 + characterData.proficiencyBonus + spellcastingModifier;
    const spellAttackBonus = characterData.proficiencyBonus + spellcastingModifier;
    
    // Consolidate all character data
    const finalCharacterData = {
      ...characterData,
      level: characterData.level || 1,
      savingThrows,
      skills,
      initiative: characterData.initiative ?? mod(characterData.dexterity),
      armor,
      shield,
      weapon1,
      weapon2,
      otherEquipment: characterData.otherEquipment || autoOther,
      equipment: characterData.equipment || autoOther,
      passivePerception: 10 + (skills.perception?.modifier ?? mod(characterData.wisdom)),
      attacks,
      creationMode,
      startingEquipment: startingEquipment.join(', '),
      // Hechizos
      cantrips: processedCantrips,
      spells: processedSpells,
      // Información de conjuros
      spellcasterClass: characterData.class,
      spellcasterLevel: characterData.level || 1,
      spellcastingModifier: spellcastingModifier,
      spellSaveDC: spellSaveDC,
      spellAttackBonus: spellAttackBonus
    }
    
    console.log('🔍 DEBUG - finalCharacterData:', finalCharacterData)
    console.log('🔍 DEBUG - finalCharacterData.alignment:', finalCharacterData.alignment)
    console.log('🔍 DEBUG - finalCharacterData.skills:', finalCharacterData.skills)
    
    // Si el nivel objetivo es mayor a 1, el LevelUpManager se activará automáticamente en el paso 4
    // No necesitamos hacer nada aquí
    
    // Guardar el personaje si hay una campaña activa
    if (currentCampaignId) {
      try {
        // Para aplicaciones de escritorio, esto se maneja desde el componente principal
        console.log('Guardando personaje en campaña:', currentCampaignId, finalCharacterData);
      } catch (error) {
        console.error('Error guardando personaje:', error);
        // Continuar aunque falle el guardado
      }
    }
    
    onCharacterCreated(finalCharacterData)
  }

  // Manejar la finalización del proceso de subir de nivel
  const handleLevelUpComplete = (updatedCharacter) => {
    setShowLevelUpManager(false)
    
    // Guardar el personaje si hay una campaña activa
    if (currentCampaignId) {
      try {
        console.log('Guardando personaje en campaña:', currentCampaignId, updatedCharacter);
      } catch (error) {
        console.error('Error guardando personaje:', error);
      }
    }
    
    onCharacterCreated(updatedCharacter)
  }

  // Cancelar el proceso de subir de nivel
  const handleLevelUpCancel = () => {
    setShowLevelUpManager(false)
    setFinalCharacterData(null)
  }

  // Renderizar paso 5 - Subida de nivel progresiva
  const renderStep5 = () => {
    // Si el nivel objetivo es 1, no hay subida de nivel
    if (initialTargetLevel === 1) {
      return (
        <div className="character-creation">
                  <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
          <h2>PASO: PERSONAJE COMPLETADO</h2>
        </div>
          
          <div className="step-container">
            <div className="step-header">
              ✅ PERSONAJE LISTO
            </div>
            <div className="step-content">
              <p>Tu personaje de nivel 1 está completo. ¡Puedes comenzar tu aventura!</p>
              <button 
                onClick={handleFinishCharacter}
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
              >
                Finalizar Creación
              </button>
            </div>
          </div>
        </div>
      )
    }
    
    // Usar los derivados calculados arriba
    const fromLevel = fromLevelDerived
    const toLevel = toLevelDerived
    
    // Obtener información del nivel que estamos subiendo
    const levelInfo = getLevelProgressionInfo(characterData.class, toLevel)
    const spellInfo = getSpellcastingInfo(characterData.class, toLevel)
    const improvements = getAvailableImprovements(characterData.class, toLevel)
    
    // Cargar selecciones guardadas para este nivel
    const savedSelections = spellSelections[toLevel] || { cantrips: [], spells: [] }
    
    // Calcular HP para este nivel
    const hitDie = classData[characterData.class]?.hitDie || 'd8'
    const conMod = getAbilityModifier(characterData.constitution || 10)
    const currentHP = characterData.maxHitPoints || 0
    const baseHPGain = parseInt(hitDie.replace('d', ''))
    
    // Verificar si ya se lanzó el dado para este nivel
    const hasRolledHP = hpRolledForLevel[toLevel] || false
    const rolledHP = hpRolledForLevel[`${toLevel}_value`] || 0
    const actualHPGain = hasRolledHP ? rolledHP : 0
    const newHP = currentHP + actualHPGain
    
    return (
      <div className="character-creation">
        <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
                          <h2>PASO: SUBIDA DE NIVEL PROGRESIVA</h2>
        </div>
        
        <div className="step-container">
          <div className="step-header">
            ⬆️ PROGRESIÓN DE NIVEL {fromLevel} → {toLevel}
          </div>
          
          {/* Barra de progreso */}
          <div style={{ 
            backgroundColor: '#e9ecef', 
            borderRadius: '10px', 
            padding: '10px', 
            marginBottom: '20px' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '12px', color: '#495057' }}>
                Progreso: {currentLevelUpStep} de {targetLevel - startLevel}
              </span>
              <span style={{ fontSize: '12px', color: '#495057' }}>
                {Math.round((currentLevelUpStep / (targetLevel - startLevel)) * 100)}% completado
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#dee2e6', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                 width: `${(currentLevelUpStep / (targetLevel - startLevel)) * 100}%`, 
                height: '100%', 
                backgroundColor: '#28a745',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
          
          <div className="step-content">
            <div className="form-grid">
              {/* Layout de 2 columnas arriba */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', gridColumn: '1 / -1' }}>
                {/* Columna izquierda - Características del nuevo nivel */}
                <div className="form-section" style={{ flex: '1' }}>
                <div className="section-header">
                  <span className="section-icon">📈</span>
                  <h3>CARACTERÍSTICAS DE NIVEL {toLevel}</h3>
                </div>
                
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '2px solid #6c757d', 
                  borderRadius: '8px', 
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Clase:</strong> {classData[characterData.class]?.name || characterData.class}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Subiendo de:</strong> Nivel {fromLevel} → Nivel {toLevel}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Dado de Golpe:</strong> {classData[characterData.class]?.hitDie || 'd8'}
                  </div>
                  
                  {spellInfo && spellInfo.casterType !== 'none' && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Cantrips Conocidos:</strong> {spellInfo.cantripsKnown}
                    </div>
                  )}
                  
                  {spellInfo && spellInfo.highestSpellLevel > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Nivel Máximo de Conjuro:</strong> {spellInfo.highestSpellLevel}º
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#495057', marginBottom: '8px' }}>Nuevas Características:</h4>
                  {levelInfo.features.length > 0 ? (
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0,
                      margin: 0
                    }}>
                      {levelInfo.features.map((feature, index) => (
                        <li key={index} style={{
                          backgroundColor: '#e9ecef',
                          padding: '8px 12px',
                          marginBottom: '5px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          borderLeft: '3px solid #007bff'
                        }}>
                          ✨ {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#6c757d', fontSize: '12px', fontStyle: 'italic' }}>
                      No hay características nuevas en este nivel
                    </p>
                  )}
                </div>

                {/* Nuevas Mecánicas de Clase */}
                {(() => {
                  const newMechanics = getNewMechanicsAtLevel(characterData.class, toLevel)
                  if (Object.keys(newMechanics).length > 0) {
                    return (
                      <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ color: '#495057', marginBottom: '8px' }}>Nuevas Mecánicas de Clase:</h4>
                        <div style={{
                          backgroundColor: '#e3f2fd',
                          border: '1px solid #2196f3',
                          borderRadius: '6px',
                          padding: '10px'
                        }}>
                          {Object.entries(newMechanics).map(([key, mechanic]) => (
                            <div key={key} style={{
                              marginBottom: '8px',
                              padding: '8px',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              border: '1px solid #bbdefb'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '5px'
                              }}>
                                <strong style={{ fontSize: '12px', color: '#1976d2' }}>
                                  {mechanic.name}
                                </strong>
                                {mechanic.uses && mechanic.uses[toLevel] && (
                                  <span style={{
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                  }}>
                                    {mechanic.uses[toLevel]} usos
                                  </span>
                                )}
                              </div>
                              <p style={{
                                fontSize: '11px',
                                color: '#424242',
                                margin: '0 0 5px 0',
                                lineHeight: '1.3'
                              }}>
                                {mechanic.description}
                              </p>
                              
                              {/* Mostrar beneficios específicos */}
                              {mechanic.benefits && (
                                <div style={{ marginTop: '5px' }}>
                                  <strong style={{ fontSize: '10px', color: '#1976d2' }}>Beneficios:</strong>
                                  <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: '3px 0 0 0',
                                    fontSize: '10px'
                                  }}>
                                    {mechanic.benefits.slice(0, 2).map((benefit, index) => (
                                      <li key={index} style={{ color: '#424242', marginBottom: '1px' }}>
                                        • {benefit}
                                      </li>
                                    ))}
                                    {mechanic.benefits.length > 2 && (
                                      <li style={{ color: '#666', fontStyle: 'italic' }}>
                                        ... y {mechanic.benefits.length - 2} más
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}

                              {/* Mostrar restricciones */}
                              {mechanic.restrictions && (
                                <div style={{ marginTop: '5px' }}>
                                  <strong style={{ fontSize: '10px', color: '#f44336' }}>Restricciones:</strong>
                                  <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: '3px 0 0 0',
                                    fontSize: '10px'
                                  }}>
                                    {mechanic.restrictions.slice(0, 1).map((restriction, index) => (
                                      <li key={index} style={{ color: '#d32f2f', marginBottom: '1px' }}>
                                        ⚠️ {restriction}
                                      </li>
                                    ))}
                                    {mechanic.restrictions.length > 1 && (
                                      <li style={{ color: '#666', fontStyle: 'italic' }}>
                                        ... y {mechanic.restrictions.length - 1} más
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
                
                <div>
                  <h4 style={{ color: '#495057', marginBottom: '8px' }}>Puntos de Vida:</h4>
                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    borderRadius: '4px', 
                    padding: '10px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>HP Actuales:</strong> {currentHP}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Fórmula:</strong> {hitDie} + {conMod >= 0 ? '+' : ''}{conMod} (modificador de Constitución)
                    </div>
                    {hasRolledHP ? (
                      <>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Resultado del dado:</strong> {rolledHP - conMod} + {conMod >= 0 ? '+' : ''}{conMod} = {rolledHP}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>HP Totales:</strong> {newHP}
                        </div>
                      </>
                    ) : (
                      <div style={{ marginBottom: '8px' }}>
                        <strong>HP Totales (estimado):</strong> {currentHP} + {baseHPGain + conMod} = {currentHP + baseHPGain + conMod}
                      </div>
                    )}
                  </div>
                  
                  {!hasRolledHP && (
                    <button
                      onClick={() => {
                        const diceRoll = Math.floor(Math.random() * baseHPGain) + 1
                        const totalHPGain = diceRoll + conMod
                        handleCharacterDataChange('maxHitPoints', currentHP + totalHPGain)
                        setHpRolledForLevel(prev => ({ 
                          ...prev, 
                          [toLevel]: true,
                          [`${toLevel}_value`]: totalHPGain
                        }))
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      🎲 Lanzar dado de HP
                    </button>
                  )}
                  
                  {hasRolledHP && (
                    <div style={{ 
                      backgroundColor: '#d4edda', 
                      border: '1px solid #c3e6cb', 
                      borderRadius: '4px', 
                      padding: '8px',
                      fontSize: '12px',
                      color: '#155724'
                    }}>
                      ✅ HP calculados para este nivel
                    </div>
                  )}
                </div>
              </div>
              
              {/* Columna derecha - Mejoras disponibles */}
                <div className="form-section" style={{ flex: '1' }}>
                <div className="section-header">
                  <span className="section-icon">🎯</span>
                  <h3>MEJORAS DISPONIBLES</h3>
                </div>
                
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '2px solid #28a745', 
                  borderRadius: '8px', 
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <p style={{ marginBottom: '15px', fontSize: '13px', color: '#495057' }}>
                    En este nivel puedes:
                  </p>
                  
                  {improvements.length > 0 ? (
                    <div style={{ marginBottom: '15px' }}>
                      {improvements.map((improvement, index) => (
                        <button
                          key={index}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            marginBottom: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <span>⚡</span>
                          {improvement}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6c757d', fontSize: '12px', fontStyle: 'italic', textAlign: 'center' }}>
                      No hay mejoras disponibles en este nivel
                    </p>
                  )}
                  
                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    borderRadius: '4px', 
                    padding: '10px',
                    fontSize: '11px',
                    color: '#856404'
                  }}>
                    <strong>💡 Consejo:</strong> Las mejoras de característica (ASI) te permiten aumentar dos estadísticas en +1 cada una, o una estadística en +2, o tomar una dote.
                  </div>
                  </div>
                </div>
              </div>
              
              {/* Selección de conjuros (solo para lanzadores) - Rectángulo enorme abajo */}
              {spellInfo && spellInfo.casterType !== 'none' && (
                <div className="form-section" style={{ gridColumn: '1 / -1' }}>
                  <div className="section-header">
                    <span className="section-icon">🔮</span>
                    <h3>SELECCIÓN DE CONJUROS</h3>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    border: '2px solid #6f42c1', 
                    borderRadius: '8px', 
                    padding: '30px',
                    minHeight: '500px'
                  }}>
                    <div style={{ display: 'flex', gap: '30px', height: '100%' }}>
                      {/* Columna izquierda - Lista de conjuros */}
                      <div style={{ flex: '3', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Botones de modo */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                          <button 
                            className={`btn ${!replaceMode ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => setReplaceMode(false)}
                            style={{
                              padding: '8px 16px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: !replaceMode ? '#28a745' : '#6c757d',
                              color: 'white'
                            }}
                          >
                            ➕ Añadir nuevos
                          </button>
                          <button 
                            className={`btn ${replaceMode ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => setReplaceMode(true)}
                            title="Sustituir 1 conjuro conocido por otro (si tus reglas de clase lo permiten)"
                            style={{
                              padding: '8px 16px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: replaceMode ? '#28a745' : '#6c757d',
                              color: 'white'
                            }}
                          >
                            ♻️ Reemplazar 1
                          </button>
                        </div>

                        {/* Selector de conjuro a reemplazar */}
                        {replaceMode && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '15px',
                            marginBottom: '15px'
                          }}>
                            <div style={{
                              backgroundColor: '#f8f9fa',
                              padding: '10px',
                              borderBottom: '1px solid #ddd',
                              fontWeight: 'bold',
                              marginBottom: '10px'
                            }}>
                              Elige el conjuro a reemplazar
                            </div>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                              gap: 10
                            }}>
                              {selectedSpells.map(s => {
                                const key = s.key || s
                                const name = (findSpellDataByKey(key) || findSpellDataByName(key))?.name || key
                                return (
                                  <label key={key} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: toReplace === key ? '#e3f2fd' : 'white'
                                  }}>
                                    <input 
                                      type="radio" 
                                      name="toReplace"
                                      checked={toReplace === key}
                                      onChange={() => setToReplace(key)}
                                      style={{ marginRight: '8px' }}
                                    />
                                    <span>{name}</span>
                                  </label>
                                )
                              })}
                              {selectedSpells.length === 0 && (
                                <em style={{ gridColumn: '1 / -1', color: '#6c757d' }}>
                                  No tienes conjuros conocidos todavía.
                                </em>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Trucos */}
                        {spellInfo.cantrips > 0 && (
                          <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: '#495057', marginBottom: '10px' }}>
                              🎭 Nuevos Trucos (Cantrips) - Selecciona {spellInfo.cantrips}
                              {savedSelections.cantrips && savedSelections.cantrips.length > 0 && (
                                <span style={{ 
                                  fontSize: '11px', 
                                  color: '#28a745', 
                                  marginLeft: '10px',
                                  fontStyle: 'italic'
                                }}>
                                  (Ya seleccionados: {savedSelections.cantrips?.length || 0})
                                </span>
                              )}
                            </h4>
                            
                            <div style={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #dee2e6', 
                              borderRadius: '8px', 
                              padding: '16px',
                              maxHeight: '280px',
                              overflowY: 'auto',
                              flex: '1'
                            }}>
                              {getAvailableCantrips(characterData.class)
                                .filter(cantrip => cantrip.minLevel <= toLevel)
                                .map(cantrip => (
                                  <div key={cantrip.key} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    backgroundColor: newCantrips.includes(cantrip.key) ? '#e3f2fd' : 
                                                   selectedSpellForDetails?.key === cantrip.key ? '#fff3cd' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontSize: '14px'
                                  }}
                                  onClick={() => setSelectedSpellForDetails({
                                    key: cantrip.key,
                                    name: cantrip.name,
                                    description: cantrip.description,
                                    type: 'cantrip',
                                    level: 0
                                  })}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={newCantrips.includes(cantrip.key)}
                                      style={{
                                        transform: 'scale(1.3)',
                                        marginRight: '12px'
                                      }}
                                      onChange={(e) => {
                                        e.stopPropagation()
                                        if (e.target.checked) {
                                          if (newCantrips.length < spellInfo.cantrips) {
                                            const updatedCantrips = [...newCantrips, cantrip.key]
                                            setNewCantrips(updatedCantrips)
                                            // Guardar selección
                                            setSpellSelections(prev => ({
                                              ...prev,
                                              [toLevel]: {
                                                ...prev[toLevel],
                                                cantrips: updatedCantrips
                                              }
                                            }))
                                          }
                                        } else {
                                          const updatedCantrips = newCantrips.filter(c => c !== cantrip.key)
                                          setNewCantrips(updatedCantrips)
                                          // Guardar selección
                                          setSpellSelections(prev => ({
                                            ...prev,
                                            [toLevel]: {
                                              ...prev[toLevel],
                                              cantrips: updatedCantrips
                                            }
                                          }))
                                        }
                                      }}
                                      disabled={!newCantrips.includes(cantrip.key) && newCantrips.length >= spellInfo.cantrips}
                                    />
                                    <div style={{ flex: '1' }}>
                                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                                        {cantrip.name}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
                                        {cantrip.description.substring(0, 100)}...
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            
                            <div style={{ 
                              marginTop: '10px', 
                              fontSize: '13px', 
                              fontWeight: 'bold',
                              color: newCantrips.length === spellInfo.cantrips ? '#28a745' : '#dc3545'
                            }}>
                              {newCantrips.length} de {spellInfo.cantrips} trucos seleccionados
                            </div>
                          </div>
                        )}
                        
                        {/* Conjuros */}
                        {spellInfo.spellsKnown > 0 && (
                          <div>
                            <h4 style={{ color: '#495057', marginBottom: '10px' }}>
                              📚 Nuevos Conjuros - Selecciona {spellInfo.spellsKnown}
                              {savedSelections.spells && savedSelections.spells.length > 0 && (
                                <span style={{ 
                                  fontSize: '11px', 
                                  color: '#28a745', 
                                  marginLeft: '10px',
                                  fontStyle: 'italic'
                                }}>
                                  (Ya seleccionados: {savedSelections.spells?.length || 0})
                                </span>
                              )}
                            </h4>
                            
                            <div style={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #dee2e6', 
                              borderRadius: '8px', 
                              padding: '16px',
                              maxHeight: '280px',
                              overflowY: 'auto',
                              flex: '1'
                            }}>
                              {getAvailableSpells(characterData.class, toLevel)
                                .map(spell => (
                                  <div key={spell.key} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    backgroundColor: newSpells.includes(spell.key) ? '#e3f2fd' : 
                                                   selectedSpellForDetails?.key === spell.key ? '#fff3cd' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontSize: '14px'
                                  }}
                                  onClick={() => setSelectedSpellForDetails({
                                    key: spell.key,
                                    name: spell.name,
                                    description: spell.description,
                                    type: 'spell',
                                    level: spell.level
                                  })}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={newSpells.includes(spell.key)}
                                      style={{
                                        transform: 'scale(1.3)',
                                        marginRight: '12px'
                                      }}
                                      onChange={(e) => {
                                        e.stopPropagation()
                                        if (e.target.checked) {
                                          if (replaceMode) {
                                            // Modo reemplazo
                                            if (!toReplace) return // pide seleccionar a reemplazar
                                            const filtered = selectedSpells.filter(k => (k.key || k) !== toReplace)
                                            const updatedSpells = filtered.includes(spell.key) ? filtered : [...filtered, spell.key]
                                            setSelectedSpells(updatedSpells)
                                            setToReplace(null)
                                            setReplaceMode(false)
                                          } else {
                                            // Modo añadir (respetando límites de 'spellsKnown' de spellInfo)
                                            if (newSpells.length < spellInfo.spellsKnown) {
                                              const updatedSpells = [...newSpells, spell.key]
                                              setNewSpells(updatedSpells)
                                              // Guardar selección
                                              setSpellSelections(prev => ({
                                                ...prev,
                                                [toLevel]: {
                                                  ...prev[toLevel],
                                                  spells: updatedSpells
                                                }
                                              }))
                                            }
                                          }
                                        } else {
                                          if (!replaceMode) {
                                            const updatedSpells = newSpells.filter(s => s !== spell.key)
                                            setNewSpells(updatedSpells)
                                            // Guardar selección
                                            setSpellSelections(prev => ({
                                              ...prev,
                                              [toLevel]: {
                                                ...prev[toLevel],
                                                spells: updatedSpells
                                              }
                                            }))
                                          }
                                        }
                                      }}
                                      disabled={replaceMode ? !toReplace : (!newSpells.includes(spell.key) && newSpells.length >= spellInfo.spellsKnown)}
                                    />
                                    <div style={{ flex: '1' }}>
                                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                                        {spell.name} (Nivel {spell.level})
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
                                        {spell.description.substring(0, 100)}...
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            
                            <div style={{ 
                              marginTop: '10px', 
                              fontSize: '13px', 
                              fontWeight: 'bold',
                              color: replaceMode ? '#6c757d' : (newSpells.length === spellInfo.spellsKnown ? '#28a745' : '#dc3545')
                            }}>
                              {replaceMode 
                                ? (toReplace 
                                  ? `Modo reemplazo: selecciona un nuevo conjuro para reemplazar "${(findSpellDataByKey(toReplace) || findSpellDataByName(toReplace))?.name || toReplace}"`
                                  : 'Modo reemplazo: selecciona un conjuro a reemplazar'
                                )
                                : `${newSpells.length} de ${spellInfo.spellsKnown} conjuros seleccionados`
                              }
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Columna derecha - Descripción detallada */}
                      <div style={{ flex: '1.5', minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ color: '#495057', marginBottom: '10px' }}>
                          📖 Descripción del Conjuro
                        </h4>
                        
                        {selectedSpellForDetails ? (
                          <div style={{
                            backgroundColor: 'white',
                            border: '2px solid #6f42c1',
                            borderRadius: '8px',
                            padding: '20px',
                            minHeight: '400px',
                            flex: '1'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '15px',
                              paddingBottom: '10px',
                              borderBottom: '1px solid #e9ecef'
                            }}>
                              <h5 style={{
                                margin: 0,
                                fontSize: '16px',
                                color: '#6f42c1',
                                fontWeight: 'bold'
                              }}>
                                {selectedSpellForDetails.name}
                              </h5>
                              <span style={{
                                backgroundColor: selectedSpellForDetails.type === 'cantrip' ? '#28a745' : '#007bff',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}>
                                {selectedSpellForDetails.type === 'cantrip' ? 'Truco' : `Nivel ${selectedSpellForDetails.level}`}
                              </span>
                            </div>
                            
                            <div style={{
                              fontSize: '14px',
                              lineHeight: '1.6',
                              color: '#495057',
                              textAlign: 'justify',
                              marginBottom: '15px'
                            }}>
                              {selectedSpellForDetails.description}
                            </div>
                            
                            <div style={{
                              marginTop: '15px',
                              padding: '10px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#6c757d'
                            }}>
                              <strong>💡 Consejo:</strong> Haz clic en cualquier conjuro de la lista para ver su descripción completa aquí.
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            backgroundColor: 'white',
                            border: '2px dashed #dee2e6',
                            borderRadius: '8px',
                            padding: '20px',
                            minHeight: '400px',
                            flex: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}>
                            <div>
                              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📖</div>
                              <p style={{
                                margin: 0,
                                fontSize: '14px',
                                color: '#6c757d'
                              }}>
                                Selecciona un truco o conjuro de la lista para ver su descripción completa
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Información para prepared casters */}
                    {spellInfo.isPreparedCaster && (
                      <div style={{ 
                        marginTop: '15px',
                        backgroundColor: '#d1ecf1', 
                        border: '1px solid #bee5eb', 
                        borderRadius: '4px', 
                        padding: '10px',
                        fontSize: '11px',
                        color: '#0c5460'
                      }}>
                        <strong>📖 Preparador de Conjuros:</strong> Puedes preparar hasta {spellInfo.prepared} conjuros de tu lista de clase.
                      </div>
                    )}
                  </div>
                </div>
              )}
              

            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                {/* Botón para avanzar al siguiente nivel */}
                {currentLevelUpStep < (targetLevel - startLevel) && (
                  <button
                    onClick={() => {
                      // Guardar el progreso actual
                      const levelUpData = {
                        fromLevel,
                        toLevel,
                        features: levelInfo.features,
                        improvements: improvements,
                        hpGained: hasRolledHP ? (characterData.maxHitPoints - currentHP) : 0,
                        cantrips: newCantrips,
                        spells: newSpells
                      }
                      setLevelUpHistory(prev => [...prev, levelUpData])
                      
                      // Avanzar al siguiente nivel
                      setCurrentLevelUpStep(currentLevelUpStep + 1)
                      setNewCantrips([])
                      setNewSpells([])
                    }}
                    disabled={!hasRolledHP || (spellInfo.cantrips > 0 && newCantrips.length !== spellInfo.cantrips) || (spellInfo.spellsKnown > 0 && newSpells.length !== spellInfo.spellsKnown)}
                    style={{
                      fontSize: '1.1em',
                      padding: '15px 30px',
                      background: hasRolledHP ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: hasRolledHP ? 'pointer' : 'not-allowed',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      if (hasRolledHP) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>⬆️</span>
                    SIGUIENTE NIVEL
                  </button>
                )}
                
                {/* Botón para finalizar y guardar */}
                {currentLevelUpStep >= (targetLevel - startLevel) && (
                  <button
                    onClick={async () => {
                      // Actualizar el nivel final del personaje
                      handleCharacterDataChange('level', targetLevel)
                      
                      // Usar handleFinishCharacter para procesar correctamente las habilidades
                      handleFinishCharacter()
                    }}
                    style={{
                      fontSize: '1.2em',
                      padding: '20px 40px',
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>💾</span>
                    FINALIZAR Y GUARDAR
                  </button>
                )}
              </div>
              
              {/* Información adicional */}
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '6px',
                fontSize: '12px',
                color: '#495057'
              }}>
                <strong>💡 Nota:</strong> {currentLevelUpStep < (targetLevel - startLevel) 
                  ? `Debes lanzar el dado de HP${spellInfo.cantrips > 0 ? ' y seleccionar todos los trucos' : ''}${spellInfo.spellsKnown > 0 ? ' y conjuros' : ''} antes de continuar.`
                  : `¡Felicidades! Has completado la subida de nivel hasta nivel ${targetLevel}.`
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar LevelUpManager
  const renderLevelUpManager = () => {
    // Crear datos del personaje para el LevelUpManager
    const characterDataForLevelUp = {
      ...characterData,
      level: 1, // Siempre empezamos desde nivel 1
      cantrips: selectedCantrips,
      spells: selectedSpells,
      maxHP: characterData.maxHP || 10,
      currentHP: characterData.currentHP || 10
    }

    return (
      <div className="character-creation">
        <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
          <h2>SUBIDA DE NIVEL PROGRESIVA</h2>
        </div>
        
        <LevelUpManager
          characterData={characterDataForLevelUp}
          targetLevel={initialTargetLevel}
          onLevelUpComplete={handleLevelUpComplete}
          onCancel={handleLevelUpCancel}
          isCreationMode={true}
        />
      </div>
    )
  }

  // Renderizar paso 6 - Detalles físicos opcionales
  const renderStep6 = () => {
    return (
      <div className="character-creation">
        <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
          <h2>PASO: DETALLES FÍSICOS (OPCIONAL)</h2>
        </div>
        
        <div className="step-container">
          <div className="step-header">
            👤 DETALLES FÍSICOS DEL PERSONAJE
          </div>
          <div className="step-content">
            <p style={{ margin: '10px 0 20px 0', fontSize: '14px', opacity: 0.9 }}>
              Completa los detalles físicos de tu personaje. Este paso es completamente opcional.
            </p>

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
              {/* NOMBRE DEL PERSONAJE (solo lectura) */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                  Nombre del Personaje
                </label>
                <input 
                  value={characterData.name || ''}
                  readOnly
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '4px', 
                    border: '2px solid #000', 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    backgroundColor: '#f0f0f0',
                    color: '#666'
                  }}
                />
              </div>
              
              {/* 60% DERECHA - 2 renglones con 3 recuadros cada uno */}
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '8px' }}>
                {/* PRIMER RENGLÓN - 3 recuadros */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                      Edad
                    </label>
                    <input 
                      value={characterData.age || ''}
                      onChange={e => handleCharacterDataChange('age', e.target.value)}
                      placeholder="Ej: 25"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                      Altura
                    </label>
                    <input 
                      value={characterData.height || ''}
                      onChange={e => handleCharacterDataChange('height', e.target.value)}
                      placeholder="Ej: 1.75m"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                      Peso
                    </label>
                    <input 
                      value={characterData.weight || ''}
                      onChange={e => handleCharacterDataChange('weight', e.target.value)}
                      placeholder="Ej: 70kg"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                    />
                  </div>
                </div>
                
                {/* SEGUNDO RENGLÓN - 3 recuadros */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                      Ojos
                    </label>
                    <input 
                      value={characterData.eyes || ''}
                      onChange={e => handleCharacterDataChange('eyes', e.target.value)}
                      placeholder="Ej: Verdes"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                      Piel
                    </label>
                    <input 
                      value={characterData.skin || ''}
                      onChange={e => handleCharacterDataChange('skin', e.target.value)}
                      placeholder="Ej: Clara"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
                      Cabello
                    </label>
                    <input 
                      value={characterData.hair || ''}
                      onChange={e => handleCharacterDataChange('hair', e.target.value)}
                      placeholder="Ej: Castaño"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '2px solid #000', fontSize: '14px', backgroundColor: '#fff' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#856404'
            }}>
              <strong>💡 Nota:</strong> Estos detalles son completamente opcionales. Puedes dejarlos vacíos y completarlos más tarde en la hoja de personaje.
            </div>

            {/* Sección de detalles adicionales */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 2.5fr', 
              gap: '20px',
              marginTop: '30px',
              minHeight: '600px'
            }}>
              {/* Contenido de detalles adicionales */}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar paso 7 - Mecánicas de clase
  const renderStep7 = () => {
    return (
      <div className="character-creation">
        <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
          <h2>PASO: MECÁNICAS DE CLASE</h2>
        </div>
        
        <div className="step-container">
          <div className="step-header">
            ⚔️ MECÁNICAS DE CLASE
          </div>
          <div className="step-content">
                                      <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Gestiona las habilidades especiales de tu {characterData.class}
            </p>

          {/* Panel de mecánicas */}
          <ClassMechanicsPanel 
            characterData={characterData}
            onMechanicsUpdate={(mechanics) => {
              // Aquí podrías guardar las mecánicas activas si es necesario
              console.log('Mecánicas actualizadas:', mechanics)
            }}
          />

          {/* Selector de conjuros para nivel 1 */}
          {(() => {
            // 1) ¿La clase lanza conjuros en este nivel?
            const classKey = normalizeClassKey(characterData.class)
            const charLevel = Number(characterData.level) || 1
            
            // Determinar si es una clase que prepara conjuros o los conoce
            const isPreparedCaster = ['mago', 'clerigo', 'druida', 'paladin'].includes(classKey)
            
            let spellsKnown = 0
            if (isPreparedCaster) {
              // Para clases que preparan conjuros, calcular basado en modificador + nivel
              let abilityMod = 0
              if (classKey === 'mago') {
                abilityMod = getAbilityModifier(characterData.intelligence || 10)
              } else if (classKey === 'clerigo' || classKey === 'druida') {
                abilityMod = getAbilityModifier(characterData.wisdom || 10)
              } else if (classKey === 'paladin') {
                abilityMod = getAbilityModifier(characterData.charisma || 10)
              }
              spellsKnown = getPreparedSpellsCount(classKey, charLevel, abilityMod) || 0
            } else {
              // Para clases que conocen conjuros
              spellsKnown = spellsKnownAt(classKey, charLevel)
            }
            
            const spellInfoLv1 = {
              cantripsKnown: cantripsKnownAt(classKey, charLevel),
              spellsKnown: spellsKnown
            }
            const isCasterLv1 = spellInfoLv1.cantripsKnown > 0 || spellInfoLv1.spellsKnown > 0

            // 2) Claves permitidas por clase y nivel actual
            console.log('Debug - classKey:', classKey)
            console.log('Debug - charLevel:', charLevel)
            console.log('Debug - characterData.class:', characterData.class)
            console.log('Debug - classAvailability keys:', Object.keys(classAvailability))
            console.log('Debug - classAvailability:', classAvailability)
            
            // Qué puede aprender esta clase (según tu tabla de permisos)
            const availability = normalizedAvailability?.[classKey] || {};
            console.log('Debug - availability:', availability)

            // Trucos permitidos por la clase (todas las claves marcadas en availability.cantrips)
            const allowedCantripKeys = Object.keys(availability.cantrips || {});
            console.log('Debug - allowedCantripKeys:', allowedCantripKeys)

            // Conjuros permitidos por la clase hasta el NIVEL del PJ (1..charLevel)
            const allowedSpellKeys = uniq(
              Array.from({ length: charLevel }, (_, i) => i + 1)
                .flatMap(lvl => Object.keys(availability[`level${lvl}`] || {}))
            );
            console.log('Debug - allowedSpellKeys:', allowedSpellKeys)
            console.log('Debug - allowedSpellKeys length:', allowedSpellKeys.length)
            console.log('Debug - availability.level1 keys:', Object.keys(availability.level1 || {}))
            console.log('Debug - availability.level1 length:', Object.keys(availability.level1 || {}).length)
            
            // 3) Opciones visibles (resuelven detalles contra spellsData)
            // Tarjetas de trucos a mostrar (solo los permitidos por la clase)
            const cantripOptions = allowedCantripKeys
              .map(k => ({ key: k, ...getSpellData(k, spellsData) }))
              .sort((a, b) => a.name.localeCompare(b.name));

            // Tarjetas de conjuros a mostrar (hasta el nivel del PJ)
            console.log('Debug - Antes del mapeo, allowedSpellKeys:', allowedSpellKeys);
            console.log('Debug - spellsData.level1 keys disponibles:', Object.keys(spellsData.level1 || {}));
            
            const spellOptions = allowedSpellKeys
              .map(k => {
                const spellData = getSpellData(k, spellsData);
                console.log(`Debug - Mapeando ${k}:`, spellData);
                return { key: k, ...spellData };
              })
              .sort((a, b) => a.name.localeCompare(b.name));
            
            console.log('Debug - cantripOptions:', cantripOptions)
            console.log('Debug - spellOptions:', spellOptions)
            console.log('Debug - cantripOptions length:', cantripOptions.length)
            console.log('Debug - spellOptions length:', spellOptions.length)

            // 3) Handlers (capan al máximo permitido)
            const maxCantrips = spellInfoLv1.cantripsKnown
            const maxSpells = spellInfoLv1.spellsKnown

            const toggleStartingCantrip = (key) => {
              setSelectedCantrips(prev => {
                const prevArray = Array.isArray(prev) ? prev : []
                const has = prevArray.some(x => (x.key || x) === key)
                if (has) {
                  const newCantrips = prevArray.filter(x => (x.key || x) !== key)
                  // Actualizar characterData
                  handleCharacterDataChange('cantrips', newCantrips)
                  return newCantrips
                }
                if (prevArray.length >= maxCantrips) return prevArray // no exceder
                const newCantrips = [...prevArray, key]
                // Actualizar characterData
                handleCharacterDataChange('cantrips', newCantrips)
                return newCantrips
              })
            }

            const toggleStartingSpell = (key) => {
              setSelectedSpells(prev => {
                const prevArray = Array.isArray(prev) ? prev : []
                const has = prevArray.some(x => (x.key || x) === key)
                if (has) {
                  const newSpells = prevArray.filter(x => (x.key || x) !== key)
                  // Actualizar characterData
                  handleCharacterDataChange('spells', newSpells)
                  return newSpells
                }
                if (prevArray.length >= maxSpells) return prevArray // no exceder
                const newSpells = [...prevArray, key]
                // Actualizar characterData
                handleCharacterDataChange('spells', newSpells)
                return newSpells
              })
            }
            


            

            // 4) UI solo si la clase es lanzadora (mostrar siempre, no solo en nivel 1)
            if (isCasterLv1) {
              return (
                <div style={{ marginTop: 20 }}>
                  <div style={{
                    backgroundColor: '#6c5ce7',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '6px',
                    marginBottom: '15px'
                  }}>
                                      <h3 style={{ margin: 0, fontSize: '18px' }}>
                      🪄 CONJUROS CONOCIDOS
                  </h3>
                </div>

                  {/* Trucos */}
                  <div style={{
                    backgroundColor: 'white',
                    border: '2px solid #000',
                    borderRadius: '6px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderBottom: '2px solid #000',
                      fontWeight: 'bold'
                    }}>
                      Trucos ({selectedCantrips.length}/{maxCantrips})
                    </div>
                    <div style={{
                      padding: '15px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 8,
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {cantripOptions.map(c => {
                        const key = c.key
                        const checked = selectedCantrips.some(x => (x.key || x) === key)
                        return (
                          <label key={key} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            border: `2px solid ${checked ? '#4CAF50' : '#000'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: checked ? '#E8F5E8' : 'white',
                            transition: 'all 0.2s ease',
                            boxShadow: checked ? '0 2px 4px rgba(76, 175, 80, 0.2)' : 'none'
                          }}>
                            <input 
                              type="checkbox" 
                              checked={checked}
                              onChange={() => toggleStartingCantrip(key)}
                              style={{ marginRight: '8px' }}
                            />
                            <span 
                              style={{ 
                                flex: 1,
                                color: checked ? '#2E7D32' : '#333'
                              }}
                            >
                              {c.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                showSpellInfo(key, true)
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f0f0f0',
                                color: '#666',
                                fontSize: '12px',
                                marginLeft: '8px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#e0e0e0'
                                e.target.style.color = '#333'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#f0f0f0'
                                e.target.style.color = '#666'
                              }}
                            >
                              ℹ️
                            </button>
                          </label>
                        )
                      })}
                      {cantripOptions.length === 0 && (
                        <em style={{ gridColumn: '1 / -1', color: '#6c757d' }}>
                          No hay trucos disponibles para esta clase.
                        </em>
                      )}
                    </div>
                  </div>

                  {/* Conjuros de nivel 1 */}
                  <div style={{
                    backgroundColor: 'white',
                    border: '2px solid #000',
                    borderRadius: '6px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderBottom: '2px solid #000',
                      fontWeight: 'bold'
                    }}>
                      Conjuros de nivel 1 ({selectedSpells.length}/{maxSpells})
                    </div>
                    <div style={{
                      padding: '15px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 8,
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {spellOptions.map(s => {
                        const key = s.key
                        const checked = selectedSpells.some(x => (x.key || x) === key)
                        return (
                          <label key={key} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            border: `2px solid ${checked ? '#2196F3' : '#000'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: checked ? '#E3F2FD' : 'white',
                            transition: 'all 0.2s ease',
                            boxShadow: checked ? '0 2px 4px rgba(33, 150, 243, 0.2)' : 'none'
                          }}>
                            <input 
                              type="checkbox" 
                              checked={checked}
                              onChange={() => toggleStartingSpell(key)}
                              style={{ marginRight: '8px' }}
                            />
                            <span 
                              style={{ 
                                flex: 1,
                                color: checked ? '#1565C0' : '#333'
                              }}
                            >
                              {s.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                showSpellInfo(key, false)
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f0f0f0',
                                color: '#666',
                                fontSize: '12px',
                                marginLeft: '8px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#e0e0e0'
                                e.target.style.color = '#333'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#f0f0f0'
                                e.target.style.color = '#666'
                              }}
                            >
                              ℹ️
                            </button>
                          </label>
                        )
                      })}
                      {spellOptions.length === 0 && (
                        <em style={{ gridColumn: '1 / -1', color: '#6c757d' }}>
                          No hay conjuros de nivel 1 para esta clase.
                        </em>
                      )}
                    </div>
                  </div>

                  {/* Aviso de límite */}
                  <div style={{
                    padding: '10px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#856404'
                  }}>
                    <strong>💡 Nota:</strong> Selecciona hasta {maxCantrips} trucos y {maxSpells} conjuros de nivel 1. 
                    Puedes cambiarlos más tarde al subir de nivel si tu clase lo permite.
                  </div>
                </div>
              )
            }
            return null
          })()}

          {/* Información adicional */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '6px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1976d2' }}>
              🎯 Mecánicas de Clase en D&D 5e
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#1976d2', lineHeight: '1.5' }}>
              Cada clase tiene habilidades especiales que puedes usar durante el juego. 
              Activa las mecánicas cuando las uses y recupera los usos cuando hagas un descanso. 
              Estas mecánicas te ayudarán a recordar las reglas específicas de tu clase.
            </p>
          </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar paso 8 - Historia del personaje (opcional)
  const renderStep8 = () => {
    return (
      <div className="character-creation">
        <div className="creation-header">
          <h1>DUNGEONS & DRAGONS®</h1>
          <h2>PASO: HISTORIA DEL PERSONAJE (OPCIONAL)</h2>
        </div>
        
        <div className="step-container">
          <div className="step-header">
            📖 HISTORIA DEL PERSONAJE
          </div>
          <div className="step-content">
            <p style={{ margin: '10px 0 20px 0', fontSize: '14px', opacity: 0.9 }}>
              Completa la historia de tu personaje. Este paso es completamente opcional.
            </p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 2.5fr', 
              gap: '20px',
              marginTop: '30px',
              minHeight: '600px'
            }}>
              
              {/* COLUMNA IZQUIERDA - Pequeña, 2 recuadros */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* APARIENCIA DEL PERSONAJE */}
                <div style={{ 
                  padding: '20px',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  flex: 1
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>Apariencia del Personaje</h3>
                  
                  {/* Área de imagen */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                    marginBottom: '15px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {characterData.characterImage ? (
                      <>
                        <img 
                          src={characterData.characterImage} 
                          alt="Personaje"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                        <button
                          onClick={() => handleCharacterDataChange('characterImage', '')}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'rgba(255, 0, 0, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Eliminar imagen"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '48px', color: '#ccc', marginBottom: '10px' }}>👤</div>
                        <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '10px' }}>
                          Selecciona una imagen para tu personaje
                        </div>
                        <label style={{
                          background: '#007bff',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          border: 'none'
                        }}>
                          Seleccionar Imagen
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  handleCharacterDataChange('characterImage', event.target.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </>
                    )}
                  </div>
                  
                  <textarea 
                    value={characterData.appearance || ''}
                    onChange={e => handleCharacterDataChange('appearance', e.target.value)}
                    placeholder="Descripción detallada de la apariencia física del personaje..."
                    rows="15"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      border: 'none', 
                      fontSize: '14px', 
                      resize: 'none', 
                      backgroundColor: 'transparent',
                      minHeight: '200px',
                      lineHeight: '1.5'
                    }}
                  />
                </div>

                {/* HISTORIA DEL PERSONAJE */}
                <div style={{ 
                  padding: '20px',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  flex: 1
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>Historia del Personaje</h3>
                  <textarea 
                    value={characterData.personalHistory || ''}
                    onChange={e => handleCharacterDataChange('personalHistory', e.target.value)}
                    placeholder="Historia personal del personaje..."
                    rows="25"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      border: 'none', 
                      fontSize: '14px', 
                      resize: 'none', 
                      backgroundColor: 'transparent',
                      minHeight: '400px',
                      lineHeight: '1.5'
                    }}
                  />
                </div>
              </div>

              {/* COLUMNA DERECHA - Grande, 3 recuadros */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* ALIADOS Y ORGANIZACIONES */}
                <div style={{ 
                  padding: '20px',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  position: 'relative',
                  flex: 1
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>Aliados y Organizaciones</h3>
                  
                  {/* Cuadro NOMBRE/SIMBOLO arriba a la derecha */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '100px',
                    height: '100px',
                    border: '2px solid #000',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    <div style={{ marginBottom: '8px' }}>NOMBRE</div>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      border: '1px solid #ccc',
                      backgroundColor: '#f9f9f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: '#666',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {characterData.symbolImage ? (
                        <>
                          <img 
                            src={characterData.symbolImage} 
                            alt="Símbolo"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                          <button
                            onClick={() => handleCharacterDataChange('symbolImage', '')}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(255, 0, 0, 0.8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '10px'
                            }}
                            title="Eliminar símbolo"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '24px', color: '#ccc' }}>⚔️</div>
                          <label style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            background: '#007bff',
                            color: 'white',
                            padding: '2px 4px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '8px',
                            border: 'none'
                          }}>
                            +
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    handleCharacterDataChange('symbolImage', event.target.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <textarea 
                    value={characterData.allies || ''}
                    onChange={e => handleCharacterDataChange('allies', e.target.value)}
                    placeholder="Aliados, organizaciones, contactos importantes..."
                    rows="15"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      border: 'none', 
                      fontSize: '14px', 
                      resize: 'none', 
                      backgroundColor: 'transparent',
                      minHeight: '200px',
                      lineHeight: '1.5'
                    }}
                  />
                </div>

                {/* RASGOS Y ATRIBUTOS ADICIONALES */}
                <div style={{ 
                  padding: '20px',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  flex: 1
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>Rasgos y Atributos Adicionales</h3>
                  <textarea 
                    value={characterData.specialFeatures || ''}
                    onChange={e => handleCharacterDataChange('specialFeatures', e.target.value)}
                    placeholder="Rasgos adicionales, características especiales..."
                    rows="12"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      border: 'none', 
                      fontSize: '14px', 
                      resize: 'none', 
                      backgroundColor: 'transparent',
                      minHeight: '200px',
                      lineHeight: '1.5'
                    }}
                  />
                </div>

                {/* TESORO */}
                <div style={{ 
                  padding: '20px',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  flex: 1
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', textAlign: 'center' }}>Tesoro</h3>
                  <textarea 
                    value={characterData.treasure || ''}
                    onChange={e => handleCharacterDataChange('treasure', e.target.value)}
                    placeholder="Objetos valiosos, tesoros especiales..."
                    rows="12"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      border: 'none', 
                      fontSize: '14px', 
                      resize: 'none', 
                      backgroundColor: 'transparent',
                      minHeight: '200px',
                      lineHeight: '1.5'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#856404'
            }}>
              <strong>💡 Nota:</strong> Estos detalles son completamente opcionales. Puedes dejarlos vacíos y completarlos más tarde en la hoja de personaje.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar el contenido principal
  const renderContent = () => {
    const level = characterData.level || 1
    const stepType = getStepType(step, level)
              
              switch (stepType) {
      case 'basic-info':
        return renderStep1()
      case 'stats':
        return renderStep2()
      case 'skills':
        return renderStep3()
      case 'mechanics':
        return renderStep7()
      case 'physical-details':
        return renderStep6()
      case 'level-up':
        return renderStep4() 
      case 'level-up-manager':
        return renderLevelUpManager()
      case 'save':
        return renderStep5() 
      case 'story':
        return renderStep8()
      default:
        return renderStep1()
    }
  }

  // Renderizar botones de navegación
  const renderNavigation = () => {
    const level = characterData.level || 1
    const totalSteps = getTotalSteps(level)
    
    return (
      <div className="navigation-bar">
        {/* Botón Volver al Menú */}
            <button
          onClick={onBackToMenu}
          className="nav-button secondary"
        >
          ← Volver al Menú
            </button>
            
        {/* Botones de navegación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Mensaje de error de validación */}
              {!canAdvanceStep(step, characterData) && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#ffebee',
                  border: '1px solid #f44336',
                  borderRadius: '6px',
                  color: '#d32f2f',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {getValidationError(step, characterData)}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={step === 0}
                  className="nav-button"
                >
                  Anterior
                </button>
                
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canAdvanceStep(step, characterData)}
                  className="nav-button"
                >
                  Siguiente
                </button>
              </div>
            </div>

        {/* Indicador de progreso */}
        <div className="progress-indicator">
          Paso {step + 1} de {totalSteps}
          </div>
        </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Contenido principal */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderContent()}
      </div>
      
      {/* Navegación */}
      {renderNavigation()}
      
      {/* Modal de descripción de hechizos */}
      {showSpellModal && selectedSpellInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* Botón de cerrar */}
            <button
              onClick={() => setShowSpellModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0'
              }}
            >
              ×
            </button>
            
            {/* Header del hechizo */}
            <div style={{
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <h2 style={{
                margin: '0 0 8px 0',
                color: selectedSpellInfo.isCantrip ? '#4CAF50' : '#2196F3',
                fontSize: '24px'
              }}>
                {selectedSpellInfo.name}
              </h2>
              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '14px',
                color: '#666',
                flexWrap: 'wrap'
              }}>
                <span><strong>Nivel:</strong> {selectedSpellInfo.isCantrip ? 'Truco' : selectedSpellInfo.level}</span>
                <span><strong>Escuela:</strong> {selectedSpellInfo.school}</span>
                <span><strong>Tiempo:</strong> {selectedSpellInfo.castingTime}</span>
                <span><strong>Alcance:</strong> {selectedSpellInfo.range}</span>
                <span><strong>Duración:</strong> {selectedSpellInfo.duration}</span>
                {selectedSpellInfo.damage && (
                  <span><strong>Daño:</strong> {selectedSpellInfo.damage} ({selectedSpellInfo.damageType})</span>
                )}
              </div>
            </div>
            
            {/* Descripción */}
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333'
            }}>
              {selectedSpellInfo.description}
            </div>
            
            {/* Botón de cerrar abajo */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setShowSpellModal(false)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: selectedSpellInfo.isCantrip ? '#4CAF50' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de información de habilidades y mecánicas */}
      {showInfoModal && selectedInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* Botón de cerrar */}
            <button
              onClick={() => setShowInfoModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0'
              }}
            >
              ×
            </button>
            
            {/* Header */}
            <div style={{
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <h2 style={{
                margin: '0 0 8px 0',
                color: '#ff9800',
                fontSize: '24px'
              }}>
                {selectedInfo.type === 'mechanic' ? selectedInfo.data.mechanic.name : 'Información'}
              </h2>
              {selectedInfo.type === 'mechanic' && (
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#666',
                  flexWrap: 'wrap'
                }}>
                  <span><strong>Tipo:</strong> Mecánica de Clase</span>
                  {selectedInfo.data.mechanic.uses && (
                    <span><strong>Usos:</strong> {typeof selectedInfo.data.mechanic.uses === 'object' 
                      ? `${selectedInfo.data.mechanic.uses[0]}-${selectedInfo.data.mechanic.uses[1]}`
                      : selectedInfo.data.mechanic.uses
                    }</span>
                  )}
                  {selectedInfo.data.mechanic.recovery && (
                    <span><strong>Recuperación:</strong> {selectedInfo.data.mechanic.recovery}</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Descripción */}
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333'
            }}>
              {selectedInfo.type === 'mechanic' ? selectedInfo.data.mechanic.description : 'Información no disponible'}
            </div>
            
            {/* Botón de cerrar abajo */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Manager ahora se renderiza dentro de renderLevelUpManager */}
    </div>
  )
}

export default CharacterCreation

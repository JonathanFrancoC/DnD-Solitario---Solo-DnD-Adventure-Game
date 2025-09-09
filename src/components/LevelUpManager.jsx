import React, { useState, useEffect } from 'react'
import { getSpellcastingAbility } from '../utils/spellUtils'
import { getBackgroundSkills, getPreparedSpellsCount } from '../data/gameData'
import { classAvailability, normalizeAvailability } from '../data/spellsData'
import { cantripsKnownAt, spellsKnownAt } from '../data/spellsData'
import { getSpellcastingSummary, getHighestSpellLevel } from '../data/spellcastingData.js'
import spellsJson from '../data/spells.json'
import { getAvailableMechanics } from '../data/classMechanics.js'
import classesData from '../data/classes.json'
import { getSubclassLevel, getSubclassFeaturesAt, getAllSubclassFeaturesAt, getAllSubclassActions } from '../utils/classSchemaUtils.js'
import { canTakeFeat, getFeatsByCategoryForCharacter, applyFeatBenefits, getAllFeats } from '../utils/featUtils.js'

// === HELPERS PARA CONJUROS ===
// Devuelve los datos de un conjuro por su clave, buscando en cantrips y niveles 1..9.
// Si no existe en spellsData, devuelve null para filtrarlo.
const getSpellData = (key, spellsData) => {
  if (spellsData?.cantrips?.[key]) return { level: 0, ...spellsData.cantrips[key] };
  for (let i = 1; i <= 9; i++) {
    const lvl = spellsData?.[`level${i}`];
    if (lvl?.[key]) return { level: i, ...lvl[key] };
  }
  return null; // Retornar null en lugar de un placeholder
};

// Une, sin duplicar
const uniq = (arr) => Array.from(new Set(arr));

// Helper para extraer el tamaño del dado de forma robusta
const getDieSize = (hitDie) => {
  const s = String(hitDie);
  const m = s.match(/d(\d+)$/i) || s.match(/(\d+)$/); // toma lo que va al final
  return m ? Number(m[1]) : 0; // ej: "1d8" -> 8, "d10" -> 10, "12" -> 12
};

// Helper para obtener mecánicas nuevas en un nivel específico
const getNewMechanicsAtLevel = (className, level) => {
  const all = getAvailableMechanics(className, level);
  const prev = getAvailableMechanics(className, level - 1);
  const out = {};
  Object.entries(all).forEach(([k, mech]) => {
    if (!prev[k]) out[k] = mech;
  });
  return out;
};

export default function LevelUpManager({ 
  characterData, 
  targetLevel, 
  onLevelUpComplete, 
  onCancel,
  isCreationMode = false 
}) {
  console.log('🔍 DEBUG - LevelUpManager renderizado')
  console.log('🔍 DEBUG - characterData:', characterData)
  console.log('🔍 DEBUG - targetLevel:', targetLevel)
  console.log('🔍 DEBUG - isCreationMode:', isCreationMode)
     const [currentLevel, setCurrentLevel] = useState(1) // Empezamos desde nivel 1
   const [levelingUpTo, setLevelingUpTo] = useState(targetLevel) // El nivel objetivo
  const [currentCharacterData, setCurrentCharacterData] = useState(characterData)
  const [levelUpData, setLevelUpData] = useState({
    newHP: 0,
    newCantrips: [],
    newSpells: [],
    abilityScoreImprovements: [],
    newFeatures: []
  })
  const [step, setStep] = useState(0)
       const [selectedCantrips, setSelectedCantrips] = useState(characterData.cantrips || [])
  const [selectedSpells, setSelectedSpells] = useState(characterData.spells || [])
  const [selectedSpellForDetails, setSelectedSpellForDetails] = useState(null)
  const [rolledHP, setRolledHP] = useState(null)
  const [hasRolled, setHasRolled] = useState(false)
  const [pendingSubclass, setPendingSubclass] = useState(characterData.subclass || null)
  const [spellLevelFilter, setSpellLevelFilter] = useState('all') // Filtro por nivel de conjuro
  const [selectedFeat, setSelectedFeat] = useState(null)
  const [featCategoryFilter, setFeatCategoryFilter] = useState('all')
  const [confirmedFeat, setConfirmedFeat] = useState(null) // Dote confirmada para este nivel
  const [choseFeatOverAbility, setChoseFeatOverAbility] = useState(null) // null = no elegido, true = dote, false = mejora

   // Calcular el máximo nivel de conjuro disponible para un nivel de personaje
   const getMaxSpellLevelFor = (className, charLevel) => {
     if (!className) return 0;
     const abilityKey = getSpellcastingAbility(className) || 'intelligence';
     const abilMod = Math.floor((Number(currentCharacterData[abilityKey] || 10) - 10) / 2);
     const summary = getSpellcastingSummary(className, charLevel, abilMod) || {};
     const slots = summary.slots || {}; // ej: { level1: 4, level2: 2, ... }
     const levels = Object.entries(slots)
       .filter(([, n]) => Number(n) > 0)
       .map(([k]) => parseInt(k.replace('level',''), 10));
     return levels.length ? Math.max(...levels) : 0;
   };

  // Calcular información de conjuros para el nivel actual
  const getSpellInfoForLevel = (level) => {
    const className = currentCharacterData.class?.toLowerCase()
    const spellcastingAbility = getSpellcastingAbility(className)
    
    // Obtener modificador de la característica de conjuros
    const abilityModifier = Math.floor((Number(currentCharacterData[spellcastingAbility.toLowerCase()] || 10) - 10) / 2)
    
    // Determinar si es lanzador preparado o conocido
    const isPreparedCaster = ['mago', 'clerigo', 'druida', 'paladin'].includes(className)
    
    if (isPreparedCaster) {
      const preparedSpells = getPreparedSpellsCount(className, level, abilityModifier)
      return {
        cantripsKnown: cantripsKnownAt(className, level),
        spellsKnown: preparedSpells,
        isPreparedCaster: true,
        spellcastingAbility
      }
    } else {
      return {
        cantripsKnown: cantripsKnownAt(className, level),
        spellsKnown: spellsKnownAt(className, level),
        isPreparedCaster: false,
        spellcastingAbility
      }
    }
  }

     // Obtener opciones de conjuros disponibles
   const getSpellOptions = (charLevel, isCantrip = false) => {
     if (!currentCharacterData.class) return [];
     
     const spellsData = spellsJson.spells;
     const className = currentCharacterData.class.toLowerCase();
     const normalizedAvailability = normalizeAvailability(classAvailability);
     
     if (isCantrip) {
       // Filtrar trucos por clase
       const availability = normalizedAvailability?.[className] || {};
       const allowedCantripKeys = Object.keys(availability.cantrips || {});
       
               return allowedCantripKeys
          .map(k => {
            const spellData = getSpellData(k, spellsData);
            return spellData ? { key: k, ...spellData } : null;
          })
          .filter(Boolean) // Filtrar valores null
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
     }
     
     // Filtrar conjuros por clase y nivel usando las reglas correctas de D&D 5e
     const availability = normalizedAvailability?.[className] || {};
     
     // Obtener el nivel máximo de hechizos que puede lanzar según las reglas de D&D 5e
     const maxSpellLevel = getHighestSpellLevel(className, charLevel);
     
     const allowedSpellKeys = uniq(
       Array.from({ length: maxSpellLevel }, (_, i) => i + 1)
         .flatMap(lvl => Object.keys(availability[`level${lvl}`] || {}))
     );
     
           return allowedSpellKeys
        .map(k => {
          const spellData = getSpellData(k, spellsData);
          return spellData ? { key: k, ...spellData } : null;
        })
        .filter(Boolean) // Filtrar valores null
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
   };

  // Obtener el dado de vida correcto según la clase
  const getHitDieForClass = (className) => {
    const hitDiceMap = {
      'barbaro': '1d12',
      'guerrero': '1d10',
      'paladin': '1d10',
      'explorador': '1d10',
      'monje': '1d8',
      'bardo': '1d8',
      'clerigo': '1d8',
      'druida': '1d8',
      'brujo': '1d8',
      'picaro': '1d8',
      'mago': '1d6',
      'hechicero': '1d6'
    }
    return hitDiceMap[className?.toLowerCase()] || '1d6'
  }

  // Calcular HP para el nuevo nivel (promedio)
  const calculateNewHP = () => {
    const hitDie = getHitDieForClass(currentCharacterData.class)
    const dieSize = getDieSize(hitDie)
    const constitutionModifier = Math.floor((Number(currentCharacterData.constitution || 10) - 10) / 2)
    
    // Para niveles superiores a 1, usar el promedio (redondeado hacia arriba)
    const averageRoll = Math.ceil((dieSize + 1) / 2)
    return averageRoll + constitutionModifier
  }

  // Función para tirar el dado de vida
  const rollHitDie = () => {
    const hitDie = getHitDieForClass(currentCharacterData.class)
    const dieSize = getDieSize(hitDie)
    const constitutionModifier = Math.floor((Number(currentCharacterData.constitution || 10) - 10) / 2)
    
    // Tirar el dado (1 a dieSize)
    const roll = Math.floor(Math.random() * dieSize) + 1
    const totalHP = roll + constitutionModifier
    
    setRolledHP({ roll, constitutionModifier, totalHP })
    setHasRolled(true)
  }

  // Obtener características de clase para un nivel específico
  const getClassFeaturesForLevel = (level) => {
    const className = currentCharacterData.class?.toLowerCase()
    if (!className) return []

    const features = []
    
    // Características específicas por clase y nivel
    switch (className) {
      case 'mago':
        if (level === 2) features.push({ name: 'Recuperación Arcana', description: 'Puedes recuperar slots de conjuro gastando tiempo de descanso corto.' })
        if (level === 3) features.push({ name: 'Tradición Arcana', description: 'Elige una escuela de magia para especializarte.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'guerrero':
        if (level === 2) features.push({ name: 'Estilo de Combate', description: 'Elige un estilo de combate que mejore tus habilidades de lucha.' })
        if (level === 3) features.push({ name: 'Arquetipo Marcial', description: 'Elige un arquetipo que defina tu estilo de combate.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'clerigo':
        if (level === 2) features.push({ name: 'Dominio Divino', description: 'Elige un dominio que refleje tu deidad y tus poderes.' })
        if (level === 3) features.push({ name: 'Canalizar Divinidad', description: 'Puedes canalizar energía divina para efectos especiales.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'picaro':
        if (level === 2) features.push({ name: 'Astucia', description: 'Puedes usar tu Destreza en lugar de Fuerza para ataques con armas finesse.' })
        if (level === 3) features.push({ name: 'Arquetipo', description: 'Elige un arquetipo que defina tu especialización.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'barbaro':
        if (level === 2) features.push({ name: 'Instinto Salvaje', description: 'Puedes usar tu instinto para detectar peligros.' })
        if (level === 3) features.push({ name: 'Sendero Primitivo', description: 'Elige un sendero que refleje tu naturaleza salvaje.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'bardo':
        if (level === 2) features.push({ name: 'Inspiración de Combate', description: 'Puedes inspirar a tus aliados en combate.' })
        if (level === 3) features.push({ name: 'Colegio Bárdico', description: 'Elige un colegio que defina tu estilo artístico.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'druida':
        if (level === 2) features.push({ name: 'Forma Salvaje', description: 'Puedes transformarte en animales.' })
        if (level === 3) features.push({ name: 'Círculo Druídico', description: 'Elige un círculo que refleje tu conexión con la naturaleza.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'monje':
        if (level === 2) features.push({ name: 'Ki', description: 'Puedes usar puntos de ki para efectos especiales.' })
        if (level === 3) features.push({ name: 'Tradición Monástica', description: 'Elige una tradición que defina tu camino.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'paladin':
        if (level === 2) features.push({ name: 'Estilo de Combate', description: 'Elige un estilo de combate que mejore tus habilidades de lucha.' })
        if (level === 3) features.push({ name: 'Juramento Sagrado', description: 'Haz un juramento que defina tu código de conducta.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'explorador':
        if (level === 2) features.push({ name: 'Estilo de Combate', description: 'Elige un estilo de combate que mejore tus habilidades de lucha.' })
        if (level === 3) features.push({ name: 'Arquetipo', description: 'Elige un arquetipo que defina tu especialización.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'brujo':
        if (level === 2) features.push({ name: 'Invocaciones', description: 'Aprende invocaciones que otorgan poderes especiales.' })
        if (level === 3) features.push({ name: 'Patrón', description: 'Tu patrón te otorga poderes adicionales.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      case 'hechicero':
        if (level === 2) features.push({ name: 'Origen Mágico', description: 'Tu origen mágico te otorga poderes especiales.' })
        if (level === 3) features.push({ name: 'Metamagia', description: 'Puedes modificar tus conjuros de formas especiales.' })
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
        break
      default:
        if (level === 4) features.push({ name: 'Mejora de Característica', description: 'Aumenta una característica en 2 puntos o dos características en 1 punto cada una.' })
    }

    return features
  }

  // Verificar si el nivel tiene mejora de característica
  const hasAbilityScoreImprovement = (level) => {
    const className = currentCharacterData.class?.toLowerCase();
    
    // Guerreros tienen dotes adicionales en niveles 6 y 14
    if (className === 'guerrero') {
      const fighterFeatLevels = [4, 6, 8, 12, 14, 16, 19];
      return fighterFeatLevels.includes(level);
    } else {
      const standardFeatLevels = [4, 8, 12, 16, 19];
      return standardFeatLevels.includes(level);
    }
  }

  // Obtener características que se pueden mejorar
  const getImprovableAbilities = () => {
    return [
      { key: 'strength', name: 'Fuerza', value: currentCharacterData.strength || 10 },
      { key: 'dexterity', name: 'Destreza', value: currentCharacterData.dexterity || 10 },
      { key: 'constitution', name: 'Constitución', value: currentCharacterData.constitution || 10 },
      { key: 'intelligence', name: 'Inteligencia', value: currentCharacterData.intelligence || 10 },
      { key: 'wisdom', name: 'Sabiduría', value: currentCharacterData.wisdom || 10 },
      { key: 'charisma', name: 'Carisma', value: currentCharacterData.charisma || 10 }
    ]
  }

  // Filtrar conjuros por nivel seleccionado
  const getFilteredSpells = (spells, filter) => {
    if (filter === 'all') return spells;
    const level = parseInt(filter);
    return spells.filter(spell => spell.level === level);
  }

  // Obtener niveles únicos de conjuros disponibles
  const getAvailableSpellLevels = (spells) => {
    const levels = [...new Set(spells.map(spell => spell.level))].sort((a, b) => a - b);
    return levels;
  }

               // Renderizar paso de HP
  const renderHPStep = () => {
    const nextLevel = currentLevel + 1;
    const newHP = calculateNewHP()
    
    const hitDie = getHitDieForClass(currentCharacterData.class)
    const hitDieSize = getDieSize(hitDie)
    const conMod = Math.floor((Number(currentCharacterData.constitution || 10) - 10) / 2)
    const averageRoll = Math.ceil((hitDieSize + 1) / 2)
    
    // Calcular HP finales basados en el dado tirado o el promedio
    const finalHPGain = hasRolled ? rolledHP.totalHP : newHP
    const finalTotalHP = (currentCharacterData.maxHP || 0) + finalHPGain
    
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: '#6c5ce7', marginBottom: '20px' }}>
          🩸 Puntos de Golpe - Nivel {nextLevel}
        </h3>

        {/* Resumen del personaje */}
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          border: '2px solid #2196f3', 
          borderRadius: '8px', 
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#1976d2', marginBottom: '15px' }}>📋 Resumen del Personaje</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>Nombre:</strong> {currentCharacterData.name || 'Sin nombre'}
            </div>
            <div>
              <strong>Clase:</strong> {currentCharacterData.class || 'Sin clase'}
            </div>
            <div>
              <strong>Nivel actual:</strong> {currentLevel}
            </div>
            <div>
              <strong>Nivel objetivo:</strong> {targetLevel}
            </div>
            <div>
              <strong>Constitución:</strong> {currentCharacterData.constitution || 10} (Mod: {conMod >= 0 ? '+' : ''}{conMod})
            </div>
            <div>
              <strong>Dado de vida:</strong> d{hitDieSize}
            </div>
          </div>
        </div>
      
        {/* Información detallada de HP */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '2px solid #000', 
          borderRadius: '8px', 
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#d32f2f', marginBottom: '15px' }}>🩸 Cálculo de Puntos de Golpe</h4>
          
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
             <div style={{ 
               backgroundColor: '#f5f5f5', 
               padding: '15px', 
               borderRadius: '6px',
               border: '1px solid #ddd'
             }}>
               <strong>HP actuales:</strong> {currentCharacterData.maxHP || 0}
             </div>
             <div style={{ 
               backgroundColor: '#f5f5f5', 
               padding: '15px', 
               borderRadius: '6px',
               border: '1px solid #ddd'
             }}>
               <strong>HP a ganar:</strong> {finalHPGain}
             </div>
             <div style={{ 
               backgroundColor: '#f5f5f5', 
               padding: '15px', 
               borderRadius: '6px',
               border: '1px solid #ddd'
             }}>
               <strong>HP totales:</strong> {finalTotalHP}
             </div>
           </div>

                     <div style={{ 
             backgroundColor: '#fff3e0', 
             padding: '15px', 
             borderRadius: '6px',
             border: '1px solid #ffb74d'
           }}>
             <h5 style={{ margin: '0 0 10px 0', color: '#e65100' }}>📊 Fórmula de cálculo:</h5>
             <p style={{ margin: '5px 0' }}><strong>Dado de vida:</strong> d{hitDieSize} (promedio: {averageRoll})</p>
             <p style={{ margin: '5px 0' }}><strong>Modificador de Constitución:</strong> {conMod >= 0 ? '+' : ''}{conMod}</p>
             <p style={{ margin: '5px 0' }}><strong>Cálculo:</strong> {averageRoll} + {conMod >= 0 ? '+' : ''}{conMod} = {newHP} HP</p>
           </div>

           {/* Sección de probabilidades y dado */}
           <div style={{ 
             backgroundColor: '#e8f5e8', 
             padding: '20px', 
             borderRadius: '8px',
             border: '2px solid #4caf50',
             marginBottom: '20px'
           }}>
             <h5 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>🎲 Probabilidades de HP</h5>
             
             <div style={{ marginBottom: '15px' }}>
               <p style={{ margin: '5px 0', fontSize: '14px' }}>
                 <strong>Rango posible:</strong> {1 + conMod} a {hitDieSize + conMod} HP
               </p>
               <p style={{ margin: '5px 0', fontSize: '14px' }}>
                 <strong>Probabilidades:</strong> Cada número del 1 al {hitDieSize} tiene la misma probabilidad
               </p>
             </div>

             {!hasRolled ? (
               <div style={{ textAlign: 'center' }}>
                 <button 
                   onClick={rollHitDie}
                   style={{
                     backgroundColor: '#4caf50',
                     color: 'white',
                     padding: '15px 30px',
                     border: 'none',
                     borderRadius: '8px',
                     cursor: 'pointer',
                     fontSize: '16px',
                     fontWeight: 'bold'
                   }}
                 >
                   🎲 Tirar d{hitDieSize} para HP
                 </button>
                 <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                   O continúa con el promedio ({averageRoll} + {conMod >= 0 ? '+' : ''}{conMod} = {newHP} HP)
                 </p>
               </div>
             ) : (
               <div style={{ 
                 backgroundColor: 'white', 
                 padding: '15px', 
                 borderRadius: '6px',
                 border: '2px solid #4caf50',
                 textAlign: 'center'
               }}>
                 <h6 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>🎯 Resultado del dado:</h6>
                 <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50', marginBottom: '10px' }}>
                   {rolledHP.roll} + {rolledHP.constitutionModifier >= 0 ? '+' : ''}{rolledHP.constitutionModifier} = {rolledHP.totalHP} HP
                 </div>
                 <p style={{ margin: '5px 0', fontSize: '14px' }}>
                   <strong>Nueva vida máxima:</strong> {finalTotalHP}
                 </p>
                 <button 
                   onClick={() => {
                     setHasRolled(false)
                     setRolledHP(null)
                   }}
                   style={{
                     backgroundColor: '#ff9800',
                     color: 'white',
                     padding: '8px 16px',
                     border: 'none',
                     borderRadius: '4px',
                     cursor: 'pointer',
                     fontSize: '12px',
                     marginTop: '10px'
                   }}
                 >
                   🔄 Tirar de nuevo
                 </button>
               </div>
             )}
           </div>
        </div>

                 {/* Mejoras de clase para este nivel */}
         <div style={{ 
           backgroundColor: '#f3e5f5', 
           border: '2px solid #9c27b0', 
           borderRadius: '8px', 
           padding: '20px',
           marginBottom: '20px'
         }}>
           <h4 style={{ color: '#7b1fa2', marginBottom: '15px' }}>⚔️ Mejoras de Clase - Nivel {nextLevel}</h4>
           <div style={{ 
             backgroundColor: 'white', 
             padding: '15px', 
             borderRadius: '6px',
             border: '1px solid #e1bee7'
           }}>
             {/* Mecánicas nuevas del nivel */}
             {(() => {
               const newMechs = getNewMechanicsAtLevel(className, nextLevel);
               return Object.entries(newMechs).map(([key, mech]) => (
                 <div key={key} style={{ 
                   padding: '10px', 
                   marginBottom: '10px', 
                   backgroundColor: '#f0f8ff',
                   borderRadius: '4px',
                   border: '1px solid #87ceeb'
                 }}>
                   <strong>🎯 {mech.name}</strong>
                   <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                     {mech.description}
                   </p>
                   {mech.benefits && (
                     <ul style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                       {mech.benefits.map((benefit, idx) => (
                         <li key={idx}>{benefit}</li>
                       ))}
                     </ul>
                   )}
                 </div>
               ));
             })()}
             
             {/* Características específicas del nivel */}
             {getClassFeaturesForLevel(nextLevel).map((feature, index) => (
               <div key={index} style={{ 
                 padding: '10px', 
                 marginBottom: '10px', 
                 backgroundColor: '#fafafa',
                 borderRadius: '4px',
                 border: '1px solid #e0e0e0'
               }}>
                 <strong>🎯 {feature.name}</strong>
                 <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                   {feature.description}
                 </p>
               </div>
             ))}
           </div>
         </div>
      
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => setStep(step + 1)}
            style={{
              backgroundColor: '#6c5ce7',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  // Renderizar paso de elección entre dote y mejora de característica
  const renderFeatOrAbilityChoiceStep = () => {
    const nextLevel = currentLevel + 1;
    
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: '#6c5ce7', marginBottom: '20px' }}>
          🎯 Elección de Nivel {nextLevel}
        </h3>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '2px solid #000', 
          borderRadius: '8px', 
          padding: '20px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center' }}>
            En este nivel puedes elegir entre:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Opción: Mejora de Característica */}
            <div 
              onClick={() => setChoseFeatOverAbility(false)}
              style={{
                border: `3px solid ${choseFeatOverAbility === false ? '#28a745' : '#ddd'}`,
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                backgroundColor: choseFeatOverAbility === false ? '#d4edda' : '#fff',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <h4 style={{ color: '#28a745', marginBottom: '10px' }}>📈 Mejora de Característica</h4>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Aumenta una característica en 2 puntos o dos características en 1 punto cada una.
              </p>
            </div>
            
            {/* Opción: Dote */}
            <div 
              onClick={() => setChoseFeatOverAbility(true)}
              style={{
                border: `3px solid ${choseFeatOverAbility === true ? '#6c5ce7' : '#ddd'}`,
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                backgroundColor: choseFeatOverAbility === true ? '#f0f0ff' : '#fff',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <h4 style={{ color: '#6c5ce7', marginBottom: '10px' }}>⭐ Dote</h4>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Elige una dote especial que otorga poderes únicos y beneficios.
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => setStep(step - 1)}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Anterior
          </button>
          <button 
            onClick={() => setStep(step + 1)}
            disabled={choseFeatOverAbility === null}
            style={{
              backgroundColor: choseFeatOverAbility === null ? '#ccc' : '#6c5ce7',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: choseFeatOverAbility === null ? 'not-allowed' : 'pointer'
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

                         // Renderizar paso de dotes
  const renderFeatStep = () => {
    const availableFeats = getFeatsByCategoryForCharacter(currentCharacterData);
    const categories = Object.keys(availableFeats);
    const nextLevel = currentLevel + 1;

    // Si ya hay una dote confirmada para este nivel, mostrarla
    if (confirmedFeat) {
      const allFeats = getAllFeats();
      const confirmedFeatData = allFeats[confirmedFeat];
      
      return (
        <div style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: '#6c5ce7' }}>
            🎯 Dote Confirmada (Nivel {nextLevel})
          </h3>
          
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            border: '2px solid #28a745', 
            borderRadius: '8px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#28a745' }}>
              ✅ {confirmedFeatData.name}
            </h4>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
              {confirmedFeatData.description}
            </p>
            <div style={{ fontSize: '11px' }}>
              <strong>Beneficios:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {confirmedFeatData.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            {confirmedFeatData.prerequisites && confirmedFeatData.prerequisites.length > 0 && (
              <div style={{ fontSize: '11px', marginTop: '8px' }}>
                <strong>Prerrequisitos:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {confirmedFeatData.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button 
              onClick={() => {
                setConfirmedFeat(null);
                setSelectedFeat(null);
              }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cambiar Dote
            </button>
            
            <button 
              onClick={() => setStep(step + 1)}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '20px', color: '#6c5ce7' }}>
          🎯 Seleccionar Dote (Nivel {nextLevel})
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            En lugar de mejorar características, puedes elegir una dote especial:
          </p>
          
          {/* Filtro de categorías */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrar por:</label>
            <select 
              value={featCategoryFilter} 
              onChange={(e) => setFeatCategoryFilter(e.target.value)}
              style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {availableFeats[category].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '15px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {categories.map(category => {
            if (featCategoryFilter !== 'all' && featCategoryFilter !== category) return null;
            
            return Object.entries(availableFeats[category].feats).map(([featKey, feat]) => (
              <div 
                key={featKey}
                onClick={() => setSelectedFeat(selectedFeat === featKey ? null : featKey)}
                style={{
                  border: `2px solid ${selectedFeat === featKey ? '#6c5ce7' : '#ddd'}`,
                  borderRadius: '8px',
                  padding: '15px',
                  cursor: 'pointer',
                  backgroundColor: selectedFeat === featKey ? '#f0f0ff' : '#fff',
                  transition: 'all 0.2s ease'
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', color: '#6c5ce7' }}>
                  {feat.name}
                </h4>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
                  {feat.description}
                </p>
                <div style={{ fontSize: '11px' }}>
                  <strong>Beneficios:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {feat.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                {feat.prerequisites && feat.prerequisites.length > 0 && (
                  <div style={{ fontSize: '11px', marginTop: '8px' }}>
                    <strong>Prerrequisitos:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {feat.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ));
          })}
        </div>

        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => setStep(step - 1)}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Anterior
          </button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                setSelectedFeat(null);
                setStep(step + 1);
              }}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Mejorar Características
            </button>
            
            <button 
              onClick={() => {
                setConfirmedFeat(selectedFeat);
              }}
              disabled={!selectedFeat}
              style={{
                backgroundColor: selectedFeat ? '#28a745' : '#ccc',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: selectedFeat ? 'pointer' : 'not-allowed'
              }}
            >
              Confirmar Dote
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar paso de subclase
  const renderSubclassStep = () => {
    const subclassLevel = getSubclassLevel(classesData.classes, className);
    const classData = classesData.classes[className];
    const subclasses = classData?.subclasses || {};
    
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: '#6c5ce7', marginBottom: '20px' }}>
          🎓 Subclase de {currentCharacterData.class} - Nivel {subclassLevel}
        </h3>
        
        <div style={{ 
          backgroundColor: '#f3e5f5', 
          border: '2px solid #9c27b0', 
          borderRadius: '8px', 
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#7b1fa2', marginBottom: '15px' }}>Elige tu subclase:</h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(subclasses).map(([subclassId, subclassData]) => (
              <label key={subclassId} style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center',
                padding: '12px',
                backgroundColor: pendingSubclass === subclassId ? '#e1bee7' : 'white',
                borderRadius: '6px',
                border: '2px solid',
                borderColor: pendingSubclass === subclassId ? '#9c27b0' : '#e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setPendingSubclass(subclassId)}
              >
                <input
                  type="radio"
                  name="subclass"
                  checked={pendingSubclass === subclassId}
                  onChange={() => setPendingSubclass(subclassId)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{subclassData.name}</span>
                  {subclassData.description && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                      {subclassData.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => setStep(step - 1)}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Atrás
          </button>
          <button 
            disabled={!pendingSubclass}
            onClick={() => setStep(step + 1)}
            style={{
              backgroundColor: pendingSubclass ? '#6c5ce7' : '#ccc',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: pendingSubclass ? 'pointer' : 'not-allowed'
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  };

  // Renderizar paso de conjuros
  const renderSpellsStep = () => {
    const nextLevel = currentLevel + 1;
    const fromInfo = getSpellInfoForLevel(currentLevel);
    const toInfo = getSpellInfoForLevel(nextLevel);
    const cantripOptions = getSpellOptions(nextLevel, true);
    const spellOptions = getSpellOptions(nextLevel, false);
   
    // Delta a aprender en ESTE salto de nivel
    const isPrepared = toInfo.isPreparedCaster;
    const deltaCantrips = Math.max(0, toInfo.cantripsKnown - fromInfo.cantripsKnown);
    const deltaSpells = isPrepared ? 0 : Math.max(0, toInfo.spellsKnown - fromInfo.spellsKnown);
    
    // Debug logs
    console.log('🔍 DEBUG - renderSpellsStep:');
    console.log('🔍 DEBUG - nextLevel:', nextLevel);
    console.log('🔍 DEBUG - fromInfo:', fromInfo);
    console.log('🔍 DEBUG - toInfo:', toInfo);
    console.log('🔍 DEBUG - cantripOptions count:', cantripOptions.length);
    console.log('🔍 DEBUG - spellOptions count:', spellOptions.length);
    console.log('🔍 DEBUG - deltaCantrips:', deltaCantrips);
    console.log('🔍 DEBUG - deltaSpells:', deltaSpells);
    console.log('🔍 DEBUG - isPrepared:', isPrepared);
     
          return (
       <div style={{ padding: '20px' }}>
         <h3 style={{ color: '#6c5ce7', marginBottom: '20px' }}>
           🪄 Conjuros - Nivel {nextLevel}
         </h3>

         {/* Información del sistema de conjuros */}
         <div style={{ 
           backgroundColor: '#e8f5e8', 
           border: '2px solid #4caf50', 
           borderRadius: '8px', 
           padding: '20px',
           marginBottom: '20px'
         }}>
           <h4 style={{ color: '#2e7d32', marginBottom: '15px' }}>📚 Sistema de Conjuros</h4>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
             <div style={{ 
               backgroundColor: 'white', 
               padding: '15px', 
               borderRadius: '6px',
               border: '1px solid #c8e6c9'
             }}>
               <strong>Clase:</strong> {currentCharacterData.class || 'Sin clase'}
             </div>
             <div style={{ 
               backgroundColor: 'white', 
               padding: '15px', 
               borderRadius: '6px',
               border: '1px solid #c8e6c9'
             }}>
               <strong>Característica de conjuros:</strong> {toInfo.spellcastingAbility || 'Sin especificar'}
             </div>
             <div style={{ 
               backgroundColor: 'white', 
               padding: '15px', 
               borderRadius: '6px',
               border: '1px solid #c8e6c9'
             }}>
               <strong>Tipo de lanzador:</strong> {toInfo.isPreparedCaster ? 'Preparado' : 'Conocido'}
             </div>
             <div style={{ 
               backgroundColor: 'white', 
               padding: '15px', 
               borderRadius: '6px',
               border: '1px solid #c8e6c9'
             }}>
               <strong>Trucos actuales:</strong> {fromInfo.cantripsKnown} → {toInfo.cantripsKnown}
             </div>
             <div style={{ 
               backgroundColor: 'white', 
               padding: '15px', 
               borderRadius: '6px',
               border: '1px solid #c8e6c9'
             }}>
               <strong>Conjuros actuales:</strong> {fromInfo.spellsKnown} → {toInfo.spellsKnown}
             </div>
           </div>
         </div>

                   {(toInfo.cantripsKnown > 0 || toInfo.spellsKnown > 0) ? (
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              border: '2px solid #6f42c1', 
              borderRadius: '8px', 
              padding: '30px',
              minHeight: '500px'
            }}>
                             <div style={{ display: 'flex', gap: '40px', height: '100%' }}>
                 {/* Columna izquierda - Lista de conjuros */}
                 <div style={{ flex: '4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Trucos */}
                  {toInfo.cantripsKnown > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ color: '#495057', marginBottom: '10px' }}>
                        🎭 Trucos (Cantrips) - Selecciona {toInfo.cantripsKnown}
                      </h4>
                      <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                        Puedes cambiar tus trucos actuales o agregar nuevos si tienes espacio disponible.
                      </div>
                      
                                             <div style={{ 
                         backgroundColor: 'white', 
                         border: '1px solid #dee2e6', 
                         borderRadius: '8px', 
                         padding: '16px',
                         maxHeight: '280px',
                         overflowY: 'auto',
                         flex: '1'
                       }}>
                         <div style={{ 
                           display: 'grid', 
                           gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                           gap: '15px' 
                         }}>
                          {cantripOptions.map(cantrip => (
                            <div key={cantrip.key} style={{
                              border: '2px solid',
                              borderColor: selectedCantrips.includes(cantrip.key) ? '#2196f3' : '#e9ecef',
                              borderRadius: '8px',
                              padding: '12px',
                              backgroundColor: selectedCantrips.includes(cantrip.key) ? '#e3f2fd' : 
                                             selectedSpellForDetails?.key === cantrip.key ? '#fff3cd' : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              fontSize: '14px',
                              position: 'relative'
                            }}
                                                         onClick={() => {
                               // Cambiar selección al hacer clic en la tarjeta
                               if (selectedCantrips.includes(cantrip.key)) {
                                 setSelectedCantrips(selectedCantrips.filter(c => c !== cantrip.key))
                               } else if (selectedCantrips.length < toInfo.cantripsKnown) {
                                 setSelectedCantrips([...selectedCantrips, cantrip.key])
                               }
                               
                               // Mostrar detalles
                               setSelectedSpellForDetails({
                                 key: cantrip.key,
                                 name: cantrip.name,
                                 description: cantrip.description,
                                 type: 'cantrip',
                                 level: 0
                               })
                             }}
                            >
                                                             <div style={{
                                 position: 'absolute',
                                 top: '8px',
                                 right: '8px',
                                 width: '20px',
                                 height: '20px',
                                 borderRadius: '50%',
                                 border: '2px solid',
                                 borderColor: selectedCantrips.includes(cantrip.key) ? '#2196f3' : '#e9ecef',
                                 backgroundColor: selectedCantrips.includes(cantrip.key) ? '#2196f3' : 'white',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 color: 'white',
                                 fontSize: '12px',
                                 fontWeight: 'bold'
                               }}>
                                 {selectedCantrips.includes(cantrip.key) && '✓'}
                               </div>
                              <div style={{ paddingRight: '25px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#495057' }}>
                                  {cantrip.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
                                  {cantrip.description.substring(0, 80)}...
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ 
                        marginTop: '10px', 
                        fontSize: '13px', 
                        fontWeight: 'bold',
                        color: selectedCantrips.length === toInfo.cantripsKnown ? '#28a745' : '#dc3545'
                      }}>
                        {selectedCantrips.length} de {toInfo.cantripsKnown} trucos seleccionados
                      </div>
                    </div>
                  )}
                  
                                     {/* Conjuros organizados por nivel */}
                   {toInfo.spellsKnown > 0 && (
                     <div>
                       <h4 style={{ color: '#495057', marginBottom: '10px' }}>
                         📚 Conjuros - Selecciona {toInfo.spellsKnown}
                       </h4>
                       <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                         Puedes cambiar tus conjuros actuales o agregar nuevos si tienes espacio disponible.
                       </div>
                       
                       {/* Filtro por nivel de conjuro */}
                       <div style={{ 
                         marginBottom: '15px', 
                         padding: '12px', 
                         backgroundColor: '#f8f9fa', 
                         borderRadius: '6px',
                         border: '1px solid #e9ecef'
                       }}>
                         <div style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           gap: '10px',
                           flexWrap: 'wrap'
                         }}>
                           <span style={{ 
                             fontSize: '14px', 
                             fontWeight: 'bold', 
                             color: '#495057' 
                           }}>
                             🔍 Filtrar por nivel:
                           </span>
                           <button
                             onClick={() => setSpellLevelFilter('all')}
                             style={{
                               padding: '6px 12px',
                               border: '2px solid',
                               borderColor: spellLevelFilter === 'all' ? '#6f42c1' : '#dee2e6',
                               backgroundColor: spellLevelFilter === 'all' ? '#6f42c1' : 'white',
                               color: spellLevelFilter === 'all' ? 'white' : '#495057',
                               borderRadius: '20px',
                               cursor: 'pointer',
                               fontSize: '12px',
                               fontWeight: 'bold',
                               transition: 'all 0.2s ease'
                             }}
                           >
                             Todos ({spellOptions.length})
                           </button>
                           {getAvailableSpellLevels(spellOptions).map(level => (
                             <button
                               key={level}
                               onClick={() => setSpellLevelFilter(level.toString())}
                               style={{
                                 padding: '6px 12px',
                                 border: '2px solid',
                                 borderColor: spellLevelFilter === level.toString() ? '#6f42c1' : '#dee2e6',
                                 backgroundColor: spellLevelFilter === level.toString() ? '#6f42c1' : 'white',
                                 color: spellLevelFilter === level.toString() ? 'white' : '#495057',
                                 borderRadius: '20px',
                                 cursor: 'pointer',
                                 fontSize: '12px',
                                 fontWeight: 'bold',
                                 transition: 'all 0.2s ease'
                               }}
                             >
                               Nivel {level} ({getFilteredSpells(spellOptions, level.toString()).length})
                             </button>
                           ))}
                         </div>
                       </div>
                      
                      <div style={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #dee2e6', 
                        borderRadius: '8px', 
                        padding: '16px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        flex: '1'
                      }}>
                                                 {/* Mostrar conjuros filtrados */}
                         {(() => {
                           const filteredSpells = getFilteredSpells(spellOptions, spellLevelFilter);
                           
                           if (spellLevelFilter === 'all') {
                             // Mostrar agrupados por nivel cuando no hay filtro
                             const spellsByLevel = {};
                             filteredSpells.forEach(spell => {
                               if (!spellsByLevel[spell.level]) {
                                 spellsByLevel[spell.level] = [];
                               }
                               spellsByLevel[spell.level].push(spell);
                             });
                             
                             return Object.keys(spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b)).map(level => (
                               <div key={level} style={{ marginBottom: '20px' }}>
                                 <h5 style={{ 
                                   color: '#6f42c1', 
                                   marginBottom: '12px', 
                                   padding: '8px 12px',
                                   backgroundColor: '#f8f9fa',
                                   borderRadius: '6px',
                                   border: '1px solid #e9ecef'
                                 }}>
                                   🪄 Conjuros de Nivel {level}
                                 </h5>
                                 <div style={{ 
                                   display: 'grid', 
                                   gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                   gap: '15px' 
                                 }}>
                                                                      {spellsByLevel[level].map(spell => (
                                     <div key={spell.key} style={{
                                       border: '2px solid',
                                       borderColor: selectedSpells.includes(spell.key) ? '#2196f3' : '#e9ecef',
                                       borderRadius: '8px',
                                       padding: '12px',
                                       backgroundColor: selectedSpells.includes(spell.key) ? '#e3f2fd' : 
                                                      selectedSpellForDetails?.key === spell.key ? '#fff3cd' : 'white',
                                       cursor: 'pointer',
                                       transition: 'all 0.2s ease',
                                       fontSize: '14px',
                                       position: 'relative'
                                     }}
                                     onClick={() => {
                                       // Cambiar selección al hacer clic en la tarjeta
                                       if (selectedSpells.includes(spell.key)) {
                                         setSelectedSpells(selectedSpells.filter(s => s !== spell.key))
                                       } else if (selectedSpells.length < toInfo.spellsKnown) {
                                         setSelectedSpells([...selectedSpells, spell.key])
                                       }
                                       
                                       // Mostrar detalles
                                       setSelectedSpellForDetails({
                                         key: spell.key,
                                         name: spell.name,
                                         description: spell.description,
                                         type: 'spell',
                                         level: spell.level
                                       })
                                     }}
                                     >
                                       <div style={{
                                         position: 'absolute',
                                         top: '8px',
                                         right: '8px',
                                         width: '20px',
                                         height: '20px',
                                         borderRadius: '50%',
                                         border: '2px solid',
                                         borderColor: selectedSpells.includes(spell.key) ? '#2196f3' : '#e9ecef',
                                         backgroundColor: selectedSpells.includes(spell.key) ? '#2196f3' : 'white',
                                         display: 'flex',
                                         alignItems: 'center',
                                         justifyContent: 'center',
                                         color: 'white',
                                         fontSize: '12px',
                                         fontWeight: 'bold'
                                       }}>
                                         {selectedSpells.includes(spell.key) && '✓'}
                                       </div>
                                       <div style={{ paddingRight: '25px' }}>
                                         <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#495057' }}>
                                           {spell.name}
                                         </div>
                                         <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
                                           {spell.description.substring(0, 80)}...
                                         </div>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             ));
                           } else {
                             // Mostrar solo los conjuros del nivel filtrado
                             return (
                               <div style={{ 
                                 display: 'grid', 
                                 gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                 gap: '15px' 
                               }}>
                                 {filteredSpells.map(spell => (
                                   <div key={spell.key} style={{
                                     border: '2px solid',
                                     borderColor: selectedSpells.includes(spell.key) ? '#2196f3' : '#e9ecef',
                                     borderRadius: '8px',
                                     padding: '12px',
                                     backgroundColor: selectedSpells.includes(spell.key) ? '#e3f2fd' : 
                                                    selectedSpellForDetails?.key === spell.key ? '#fff3cd' : 'white',
                                     cursor: 'pointer',
                                     transition: 'all 0.2s ease',
                                     fontSize: '14px',
                                     position: 'relative'
                                   }}
                                   onClick={() => {
                                     // Cambiar selección al hacer clic en la tarjeta
                                     if (selectedSpells.includes(spell.key)) {
                                       setSelectedSpells(selectedSpells.filter(s => s !== spell.key))
                                     } else if (selectedSpells.length < toInfo.spellsKnown) {
                                       setSelectedSpells([...selectedSpells, spell.key])
                                     }
                                     
                                     // Mostrar detalles
                                     setSelectedSpellForDetails({
                                       key: spell.key,
                                       name: spell.name,
                                       description: spell.description,
                                       type: 'spell',
                                       level: spell.level
                                     })
                                   }}
                                   >
                                     <div style={{
                                       position: 'absolute',
                                       top: '8px',
                                       right: '8px',
                                       width: '20px',
                                       height: '20px',
                                       borderRadius: '50%',
                                       border: '2px solid',
                                       borderColor: selectedSpells.includes(spell.key) ? '#2196f3' : '#e9ecef',
                                       backgroundColor: selectedSpells.includes(spell.key) ? '#2196f3' : 'white',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       color: 'white',
                                       fontSize: '12px',
                                       fontWeight: 'bold'
                                     }}>
                                       {selectedSpells.includes(spell.key) && '✓'}
                                     </div>
                                     <div style={{ paddingRight: '25px' }}>
                                       <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#495057' }}>
                                         {spell.name}
                                       </div>
                                       <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
                                         {spell.description.substring(0, 80)}...
                                       </div>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             );
                           }
                         })()}
                      </div>
                      
                      <div style={{ 
                        marginTop: '10px', 
                        fontSize: '13px', 
                        fontWeight: 'bold',
                        color: selectedSpells.length === toInfo.spellsKnown ? '#28a745' : '#dc3545'
                      }}>
                        {selectedSpells.length} de {toInfo.spellsKnown} conjuros seleccionados
                      </div>
                    </div>
                  )}
                </div>

                               {/* Columna derecha - Descripción detallada */}
                <div style={{ flex: '2', minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
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
                       textAlign: 'justify'
                     }}>
                       {selectedSpellForDetails.description}
                     </div>
                   </div>
                 ) : (
                   <div style={{
                     backgroundColor: 'white',
                     border: '2px solid #6f42c1',
                     borderRadius: '8px',
                     padding: '20px',
                     minHeight: '400px',
                     flex: '1',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: '#6c757d'
                   }}>
                     <div style={{ fontSize: '48px', marginBottom: '20px' }}>📖</div>
                     <p style={{ textAlign: 'center', margin: 0 }}>
                       Selecciona un truco o conjuro de la lista para ver su descripción completa
                     </p>
                   </div>
                 )}
               </div>
             </div>
           </div>
         ) : (
           <div style={{ 
             backgroundColor: '#f8f9fa', 
             border: '2px solid #000', 
             borderRadius: '8px', 
             padding: '20px',
             marginBottom: '20px',
             textAlign: 'center'
           }}>
             <p>No se pueden aprender nuevos conjuros en este nivel.</p>
           </div>
         )}
         
         <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
           <button 
             onClick={() => setStep(step - 1)}
             style={{
               backgroundColor: '#6c757d',
               color: 'white',
               padding: '10px 20px',
               border: 'none',
               borderRadius: '6px',
               cursor: 'pointer'
             }}
           >
             Atrás
           </button>
           <button 
                           onClick={() => {
                // Aplicar los hechizos seleccionados al personaje
                setCurrentCharacterData(prev => ({
                  ...prev, 
                  cantrips: selectedCantrips,
                  spells: selectedSpells
                }));
                setStep(step + 1);
              }}
             style={{
               backgroundColor: '#6c5ce7',
               color: 'white',
               padding: '10px 20px',
               border: 'none',
               borderRadius: '6px',
               cursor: 'pointer'
             }}
           >
             Continuar
           </button>
         </div>
       </div>
     )
   }

    // Renderizar paso de mejora de característica
  const renderAbilityScoreStep = () => {
    const nextLevel = currentLevel + 1;
    if (!hasAbilityScoreImprovement(nextLevel)) {
           return (
       <div style={{ padding: '20px' }}>
         <h3 style={{ color: '#6c5ce7', marginBottom: '20px' }}>
           📈 Mejora de Característica - Nivel {nextLevel}
         </h3>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            border: '2px solid #000', 
            borderRadius: '8px', 
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p>No hay mejora de característica disponible en este nivel.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => setStep(step - 1)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Atrás
            </button>
            <button 
              onClick={() => setStep(step + 1)}
              style={{
                backgroundColor: '#6c5ce7',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      )
    }
    
    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: '#6c5ce7', marginBottom: '20px' }}>
          📈 Mejora de Característica - Nivel {nextLevel}
        </h3>
        
        <div style={{ 
          backgroundColor: 'white', 
          border: '2px solid #000', 
          borderRadius: '8px', 
          padding: '20px',
          marginBottom: '20px'
        }}>
          <p>Puedes aumentar una característica en 2 puntos o dos características en 1 punto cada una.</p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            marginTop: '20px'
          }}>
            {getImprovableAbilities().map(ability => (
              <div key={ability.key} style={{
                border: '2px solid #000',
                borderRadius: '6px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <h4>{ability.name}</h4>
                <p>Valor actual: {ability.value}</p>
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => {
                      // Lógica para mejorar +1
                    }}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    +1
                  </button>
                  <button 
                    onClick={() => {
                      // Lógica para mejorar +2
                    }}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    +2
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => setStep(step - 1)}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Atrás
          </button>
          <button 
            onClick={() => setStep(step + 1)}
            style={{
              backgroundColor: '#6c5ce7',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

               // Finalizar el nivel actual y avanzar al siguiente
  const finishThisLevel = () => {
    const newHP = hasRolled ? rolledHP.totalHP : calculateNewHP()
    const next = currentLevel + 1;
    
    // Crear el personaje actualizado
    const updated = { ...currentCharacterData };
    
    // Aplicar subclase si se eligió una
    if (pendingSubclass && !updated.subclass) {
      updated.subclass = pendingSubclass;
    }
    
    // Aplicar mecánicas nuevas del nivel (clase base)
    const newMechs = getNewMechanicsAtLevel(className, next);
    updated.mechanics = { ...(updated.mechanics || {}), ...newMechs };
    
    // Aplicar características de subclase si tiene una
    if (updated.subclass) {
      const subclassFeatures = getAllSubclassFeaturesAt(classesData.classes, className, updated.subclass, next);
      updated.mechanics = { ...updated.mechanics, ...subclassFeatures };
    }
    
    // Aplicar dote si se confirmó una
    if (confirmedFeat) {
      const allFeats = getAllFeats();
      const feat = allFeats[confirmedFeat];
      if (feat) {
        const updatedWithFeat = applyFeatBenefits(feat, updated);
        updatedWithFeat.feats = updatedWithFeat.feats || [];
        updatedWithFeat.feats.push(confirmedFeat);
        Object.assign(updated, updatedWithFeat);
      }
    }
    
    // Actualizar HP y conjuros
    updated.level = next;
    updated.maxHP = (updated.maxHP || 0) + newHP;
    updated.currentHP = (updated.currentHP || 0) + newHP;
    updated.cantrips = selectedCantrips;
    updated.spells = selectedSpells;
    
    // Actualizar el estado
    setCurrentCharacterData(updated);
    
    // Reiniciar para el siguiente nivel
    setStep(0);
    setCurrentLevel(next);
    setHasRolled(false);
    setRolledHP(null);
    setSelectedFeat(null);
    setConfirmedFeat(null);
    setChoseFeatOverAbility(null);
    
    // Si llegamos al nivel objetivo, finalizar
    if (next >= targetLevel) {
      onLevelUpComplete?.(updated);
    }
  };

                       // Renderizar resumen final
   const renderSummaryStep = () => {
     const nextLevel = currentLevel + 1;
     const newHP = hasRolled ? rolledHP.totalHP : calculateNewHP()
     
     // Obtener acciones de subclase si tiene una
     const subclassActions = currentCharacterData.subclass ? 
       getAllSubclassActions(classesData.classes, className, currentCharacterData.subclass) : [];
     
     return (
       <div style={{ padding: '20px' }}>
                                    <h3 style={{ color: '#6c5ce7', marginBottom: '20px' }}>
             📋 Resumen - Subida a Nivel {nextLevel}
           </h3>
         
         <div style={{ 
           backgroundColor: 'white', 
           border: '2px solid #000', 
           borderRadius: '8px', 
           padding: '20px',
           marginBottom: '20px'
         }}>
           <h4>Cambios realizados:</h4>
                      <ul>
              <li><strong>HP:</strong> +{newHP} (Total: {currentCharacterData.maxHP})</li>
             {selectedCantrips.length > 0 && (
               <li><strong>Trucos aprendidos:</strong> {selectedCantrips.length}</li>
             )}
             {selectedSpells.length > 0 && (
               <li><strong>Conjuros aprendidos:</strong> {selectedSpells.length}</li>
             )}
                          {hasAbilityScoreImprovement(targetLevel) && !selectedFeat && (
               <li><strong>Mejora de característica:</strong> Disponible</li>
             )}
             {confirmedFeat && (
               <li><strong>Dote seleccionada:</strong> {getAllFeats()[confirmedFeat]?.name}</li>
             )}
           </ul>
         </div>

         {/* Sección de acciones de subclase */}
         {subclassActions.length > 0 && (
           <div style={{ 
             backgroundColor: '#f8f9fa', 
             border: '2px solid #6f42c1', 
             borderRadius: '8px', 
             padding: '20px',
             marginBottom: '20px'
           }}>
             <h4 style={{ color: '#6f42c1', marginBottom: '15px' }}>
               ⚔️ Acciones de Subclase - {currentCharacterData.subclass}
             </h4>
             
             <div style={{ 
               display: 'grid', 
               gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
               gap: '15px' 
             }}>
               {subclassActions.map((action, index) => (
                 <div key={action.id} style={{
                   backgroundColor: 'white',
                   border: '2px solid #e9ecef',
                   borderRadius: '8px',
                   padding: '15px',
                   boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                 }}>
                   <div style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     marginBottom: '8px'
                   }}>
                     <h5 style={{
                       margin: 0,
                       color: '#6f42c1',
                       fontSize: '14px',
                       fontWeight: 'bold'
                     }}>
                       {action.name}
                     </h5>
                     {action.cost && (
                       <span style={{
                         backgroundColor: '#6f42c1',
                         color: 'white',
                         padding: '2px 6px',
                         borderRadius: '10px',
                         fontSize: '10px',
                         fontWeight: 'bold'
                       }}>
                         {action.cost}
                       </span>
                     )}
                   </div>
                   
                   <p style={{
                     margin: '5px 0',
                     fontSize: '12px',
                     color: '#495057',
                     lineHeight: '1.4'
                   }}>
                     {action.description}
                   </p>
                   
                   {action.category && (
                     <div style={{
                       marginTop: '8px',
                       padding: '4px 8px',
                       backgroundColor: '#e9ecef',
                       borderRadius: '4px',
                       fontSize: '10px',
                       color: '#6c757d',
                       fontWeight: 'bold'
                     }}>
                       {action.category}
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </div>
         )}
         
         <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
           <button 
             onClick={() => setStep(step - 1)}
             style={{
               backgroundColor: '#6c757d',
               color: 'white',
               padding: '10px 20px',
               border: 'none',
               borderRadius: '6px',
               cursor: 'pointer'
             }}
           >
             Atrás
           </button>
                      <button 
              onClick={finishThisLevel}
             style={{
               backgroundColor: '#28a745',
               color: 'white',
               padding: '10px 20px',
               border: 'none',
               borderRadius: '6px',
               cursor: 'pointer'
             }}
           >
             Aplicar Cambios
           </button>
         </div>
       </div>
     )
   }

     // Manejar la finalización del proceso de subir de nivel
   const handleLevelUpComplete = (updatedCharacter) => {
     // Finalizar el proceso de subir de nivel
     onLevelUpComplete(updatedCharacter)
   }

  // Detectar si necesita elegir subclase
  const className = currentCharacterData.class?.toLowerCase();
  const nextLevel = currentLevel + 1;
  const needsSubclassChoice = (() => {
    const subclassLevel = getSubclassLevel(classesData.classes, className);
    if (!subclassLevel) return false;
    // Mostrar sólo si aún no tiene subclase y justo alcanzas el nivel de elección
    return !currentCharacterData.subclass && nextLevel === subclassLevel;
  })();

  // Determinar si puede tomar una dote
  const canTakeFeatThisLevel = canTakeFeat({ ...currentCharacterData, level: nextLevel });

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    console.log('🔍 DEBUG - LevelUpManager renderizando paso:', step)
    console.log('🔍 DEBUG - Clase del personaje:', currentCharacterData.class)
    console.log('🔍 DEBUG - Nivel actual:', currentLevel)
    console.log('🔍 DEBUG - Nivel objetivo:', targetLevel)
    console.log('🔍 DEBUG - Hit die:', getHitDieForClass(currentCharacterData.class), 'size:', getDieSize(getHitDieForClass(currentCharacterData.class)))
    console.log('🔍 DEBUG - Necesita subclase:', needsSubclassChoice)
    console.log('🔍 DEBUG - Puede tomar dote:', canTakeFeatThisLevel)
    
    switch (step) {
      case 0:
        return renderHPStep()
      case 1:
        return needsSubclassChoice ? renderSubclassStep() : renderSpellsStep()
      case 2:
        if (needsSubclassChoice) {
          return renderSpellsStep()
        } else if (canTakeFeatThisLevel) {
          return renderFeatOrAbilityChoiceStep()
        } else {
          return renderSummaryStep()
        }
      case 3:
        if (needsSubclassChoice) {
          return canTakeFeatThisLevel ? renderFeatOrAbilityChoiceStep() : renderSummaryStep()
        } else if (canTakeFeatThisLevel) {
          return choseFeatOverAbility === true ? renderFeatStep() : renderAbilityScoreStep()
        } else {
          return renderSummaryStep()
        }
      case 4:
        if (needsSubclassChoice && canTakeFeatThisLevel) {
          return choseFeatOverAbility === true ? renderFeatStep() : renderAbilityScoreStep()
        } else if (canTakeFeatThisLevel) {
          return renderSummaryStep()
        } else {
          return renderSummaryStep()
        }
      case 5:
        return renderSummaryStep()
      default:
        return <div>Error: Paso no válido</div>
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
             <div style={{
         backgroundColor: '#f8f9fa',
         borderRadius: '12px',
         maxWidth: '1400px', // Aumentado de 800px a 1400px
         width: '95%', // Aumentado de 90% a 95%
         maxHeight: '95vh', // Aumentado de 90vh a 95vh
         overflow: 'auto'
       }}>
        <div style={{
          backgroundColor: '#6c5ce7',
          color: 'white',
          padding: '20px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>
            {isCreationMode ? 'Creación de Personaje' : 'Subir de Nivel'}
          </h2>
                               <div style={{ fontSize: '14px', opacity: 0.9 }}>
            Nivel {currentLevel} → {currentLevel + 1} (Objetivo: {targetLevel})
          </div>
          {onCancel && (
            <button 
              onClick={onCancel}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid white',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          )}
        </div>
        
        {renderCurrentStep()}
      </div>
    </div>
  )
}

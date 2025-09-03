// Sistema de gestión del estado del turno para D&D 5e

// Estado inicial del turno
export const createInitialTurnState = (character) => {
  return {
    // Economía básica del turno
    actionUsed: false,
    bonusUsed: false,
    reactionAvailable: true,
    movementLeft: character.speed || 30,
    
    // Recursos de clase
    resources: {
      bardicInspiration: character.mechanics?.bardicInspiration || { maxUses: 2, currentUses: 0 },
      rage: character.mechanics?.rage || { maxUses: 2, currentUses: 0 },
      secondWind: character.mechanics?.secondWind || { used: false },
      // Agregar más recursos según la clase
    },
    
    // Condiciones del personaje
    conditions: character.conditions || [],
    
    // Estado del entorno
    environment: {
      lighting: 'normal', // normal, dim, dark
      rangeToTarget: null,
      cover: 'none', // none, half, three-quarters, full
      difficultTerrain: false,
      elevation: 0
    },
    
    // Historial de acciones del turno
    actionHistory: [],
    
    // Sugerencias de IA
    aiSuggestions: []
  }
}

// Función para actualizar el estado del turno
export const updateTurnState = (currentState, updates) => {
  return {
    ...currentState,
    ...updates,
    actionHistory: [
      ...currentState.actionHistory,
      {
        timestamp: new Date().toISOString(),
        action: updates.lastAction || 'unknown',
        details: updates.lastActionDetails || {}
      }
    ]
  }
}

// Función para usar una acción
export const useAction = (turnState, actionType) => {
  const updates = {}
  
  switch (actionType) {
    case 'action':
      if (turnState.actionUsed) {
        throw new Error('Acción ya usada este turno')
      }
      updates.actionUsed = true
      break
      
    case 'bonus':
      if (turnState.bonusUsed) {
        throw new Error('Acción adicional ya usada este turno')
      }
      updates.bonusUsed = true
      break
      
    case 'reaction':
      if (!turnState.reactionAvailable) {
        throw new Error('Reacción no disponible')
      }
      updates.reactionAvailable = false
      break
      
    default:
      throw new Error(`Tipo de acción desconocido: ${actionType}`)
  }
  
  return updateTurnState(turnState, {
    ...updates,
    lastAction: actionType,
    lastActionDetails: { type: 'use_action' }
  })
}

// Función para usar movimiento
export const useMovement = (turnState, distance) => {
  if (distance > turnState.movementLeft) {
    throw new Error(`No tienes suficiente movimiento. Disponible: ${turnState.movementLeft}`)
  }
  
  return updateTurnState(turnState, {
    movementLeft: turnState.movementLeft - distance,
    lastAction: 'movement',
    lastActionDetails: { distance }
  })
}

// Función para usar un recurso de clase
export const useClassResource = (turnState, resourceName) => {
  const resource = turnState.resources[resourceName]
  if (!resource) {
    throw new Error(`Recurso ${resourceName} no encontrado`)
  }
  
  if (resource.currentUses >= resource.maxUses) {
    throw new Error(`Recurso ${resourceName} agotado`)
  }
  
  const updatedResources = {
    ...turnState.resources,
    [resourceName]: {
      ...resource,
      currentUses: resource.currentUses + 1
    }
  }
  
  return updateTurnState(turnState, {
    resources: updatedResources,
    lastAction: 'use_resource',
    lastActionDetails: { resource: resourceName }
  })
}

// Función para resetear el turno (nuevo turno)
export const resetTurn = (character) => {
  return createInitialTurnState(character)
}

// Función para verificar si se puede realizar una acción
export const canPerformAction = (turnState, actionType) => {
  switch (actionType) {
    case 'action':
      return !turnState.actionUsed
    case 'bonus':
      return !turnState.bonusUsed
    case 'reaction':
      return turnState.reactionAvailable
    case 'movement':
      return turnState.movementLeft > 0
    default:
      return true
  }
}

// Función para obtener sugerencias de IA basadas en el contexto
export const generateAISuggestions = (character, turnState, gameContext) => {
  const suggestions = []
  const cls = (character.class || '').toLowerCase()
  
  // Sugerencias basadas en la clase
  if (cls === 'bardo' && !turnState.bonusUsed) {
    const bardicInsp = turnState.resources.bardicInspiration
    if (bardicInsp.currentUses < bardicInsp.maxUses) {
      suggestions.push({
        label: 'Inspirar + Atacar',
        intent: 'Inspiro a mi compañero y luego ataco al enemigo',
        actions: [
          { slot: 'bonus', id: 'bardic_inspiration' },
          { slot: 'action', id: 'attack_weapon1' }
        ]
      })
    }
  }
  
  if (cls === 'barbaro' && !turnState.bonusUsed) {
    const rage = turnState.resources.rage
    if (rage.currentUses < rage.maxUses) {
      suggestions.push({
        label: 'Furia + Ataque',
        intent: 'Entro en furia y ataco con ventaja',
        actions: [
          { slot: 'bonus', id: 'rage' },
          { slot: 'action', id: 'attack_weapon1' }
        ]
      })
    }
  }
  
  // Sugerencias basadas en el contexto del juego
  if (gameContext?.inCombat && !turnState.actionUsed) {
    suggestions.push({
      label: 'Ataque Defensivo',
      intent: 'Ataco pero me mantengo a la defensiva',
      actions: [
        { slot: 'action', id: 'dodge' }
      ]
    })
  }
  
  if (gameContext?.exploring && turnState.movementLeft > 0) {
    suggestions.push({
      label: 'Explorar Área',
      intent: 'Me muevo cuidadosamente explorando la zona',
      actions: [
        { slot: 'action', id: 'investigate' }
      ]
    })
  }
  
  return suggestions.slice(0, 3) // Máximo 3 sugerencias
}

// Función para procesar una acción y actualizar el estado
export const processAction = (turnState, action, character) => {
  let newState = { ...turnState }
  
  try {
    // Procesar según el tipo de acción
    switch (action.kind) {
      case 'attack':
        newState = useAction(newState, 'action')
        break
        
      case 'spell':
        newState = useAction(newState, 'action')
        // Gastar espacio de conjuro
        if (action.level > 0) {
          const spellSlots = character.spellSlots?.[action.level]
          if (spellSlots && spellSlots.used < spellSlots.total) {
            // Actualizar espacios de conjuro
            const updatedSpellSlots = {
              ...character.spellSlots,
              [action.level]: {
                ...spellSlots,
                used: spellSlots.used + 1
              }
            }
            character.spellSlots = updatedSpellSlots
          }
        }
        break
        
      case 'cantrip':
        // Los cantrips no gastan acciones de turno
        break
        
      case 'bonus_action':
        newState = useAction(newState, 'bonus')
        break
        
      case 'reaction':
        newState = useAction(newState, 'reaction')
        break
        
      case 'movement':
        newState = useMovement(newState, action.distance || 5)
        break
        
      case 'class_resource':
        newState = useClassResource(newState, action.resource)
        break
        
      default:
        // Acciones libres no gastan recursos
        break
    }
    
    return {
      success: true,
      newState,
      message: `Acción "${action.label}" ejecutada exitosamente`
    }
    
  } catch (error) {
    return {
      success: false,
      newState: turnState,
      message: error.message
    }
  }
}

// Función para validar una combinación de acciones
export const validateActionCombination = (actions, turnState) => {
  const errors = []
  const usedSlots = new Set()
  
  for (const action of actions) {
    const slot = action.slot || 'action'
    
    // Verificar si el slot ya fue usado
    if (usedSlots.has(slot)) {
      errors.push(`Slot ${slot} ya fue usado`)
      continue
    }
    
    // Verificar si el slot está disponible
    if (!canPerformAction(turnState, slot)) {
      errors.push(`Slot ${slot} no está disponible`)
      continue
    }
    
    usedSlots.add(slot)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Función para obtener un resumen del estado del turno
export const getTurnSummary = (turnState) => {
  return {
    actionAvailable: !turnState.actionUsed,
    bonusAvailable: !turnState.bonusUsed,
    reactionAvailable: turnState.reactionAvailable,
    movementLeft: turnState.movementLeft,
    resourcesUsed: Object.entries(turnState.resources)
      .filter(([_, resource]) => resource.currentUses > 0)
      .map(([name, resource]) => ({
        name,
        used: resource.currentUses,
        max: resource.maxUses
      })),
    actionCount: turnState.actionHistory.length
  }
}

// Función para exportar el estado para la IA
export const exportStateForAI = (character, turnState, gameContext = {}) => {
  return {
    intent: gameContext.currentIntent || "",
    selectedActions: gameContext.selectedActions || [],
    state: {
      turn: {
        actionFree: !turnState.actionUsed,
        bonusFree: !turnState.bonusUsed,
        reactionFree: turnState.reactionAvailable,
        moveLeft: turnState.movementLeft
      },
      resources: turnState.resources,
      conditions: turnState.conditions,
      environment: turnState.environment,
      character: {
        name: character.name,
        class: character.class,
        level: character.level,
        hp: {
          current: character.currentHP,
          max: character.maxHP,
          temp: character.tempHP || 0
        },
        spellSlots: character.spellSlots,
        equipment: {
          weapons: [character.weapon1, character.weapon2].filter(Boolean),
          armor: character.armor,
          shield: character.shield
        }
      },
      context: gameContext
    }
  }
}

import * as XLSX from 'xlsx'

// Generador de bitácora Excel según el prompt detallado
export const generateLogbook = (gameState, sessionData) => {
  const workbook = XLSX.utils.book_new()
  
  // Hoja 1: Campaña
  const campaignData = [
    ['Sistema', 'D&D 5e'],
    ['Tono_heridas', gameState.settings?.tone || 'medium'],
    ['Exploración', gameState.settings?.exploration || 'mixed'],
    ['Flanqueo', gameState.settings?.flanking ? 'Activado' : 'Desactivado'],
    ['Mapa_teatral', gameState.settings?.tacticalRepositioning ? 'Solo a petición' : 'Desactivado'],
    ['Logística', gameState.settings?.logisticsComplexity || 'detailed'],
    ['Notas', '']
  ]
  
  const campaignSheet = XLSX.utils.aoa_to_sheet(campaignData)
  XLSX.utils.book_append_sheet(workbook, campaignSheet, 'Campaña')
  
  // Hoja 2: Días
  const daysData = [
    ['Sesion_IRL', 'Dia_en_ficcion', 'Lugar_principal', 'Resumen_cinematografico', 'Notas']
  ]
  
  if (sessionData) {
    daysData.push([
      sessionData.sessionDate || new Date().toISOString().split('T')[0],
      sessionData.gameDay || 'Día 1',
      sessionData.mainLocation || gameState.world?.currentLocation || 'Desconocido',
      sessionData.cinematicSummary || 'Resumen de la sesión',
      sessionData.notes || ''
    ])
  }
  
  const daysSheet = XLSX.utils.aoa_to_sheet(daysData)
  XLSX.utils.book_append_sheet(workbook, daysSheet, 'Días')
  
  // Hoja 3: Tiradas
  const rollsData = [
    ['Sesion_IRL', 'Escena', 'Prueba', 'Objetivo', 'd20', 'Total', 'Resultado', 'Consecuencia']
  ]
  
  // Agregar tiradas de la sesión actual
  if (sessionData?.rolls) {
    sessionData.rolls.forEach(roll => {
      rollsData.push([
        roll.sessionDate || new Date().toISOString().split('T')[0],
        roll.scene || '',
        roll.test || '',
        roll.target || '',
        roll.d20 || '',
        roll.total || '',
        roll.result || '',
        roll.consequence || ''
      ])
    })
  }
  
  const rollsSheet = XLSX.utils.aoa_to_sheet(rollsData)
  XLSX.utils.book_append_sheet(workbook, rollsSheet, 'Tiradas')
  
  // Hoja 4: Recursos
  const resourcesData = [
    ['PG_inicio', 'PG_fin', 'Condiciones', 'Agotamiento', 'Oro', 'Municion_usada', 'Pociones_usadas', 'Slots_n', 'Notas']
  ]
  
  if (gameState.character) {
    const char = gameState.character
    resourcesData.push([
      char.maxHP || 0,
      char.currentHP || 0,
      char.conditions?.join(', ') || '',
      char.exhaustion || 0,
      char.gold || 0,
      sessionData?.ammoUsed || 0,
      sessionData?.potionsUsed || 0,
      char.spellSlots?.join(', ') || '',
      sessionData?.resourceNotes || ''
    ])
  }
  
  const resourcesSheet = XLSX.utils.aoa_to_sheet(resourcesData)
  XLSX.utils.book_append_sheet(workbook, resourcesSheet, 'Recursos')
  
  // Hoja 5: Facciones
  const factionsData = [
    ['Faccion', 'Reloj_tamano', 'Progreso', 'Ultima_actualizacion', 'Razon', 'Eventos_disparados']
  ]
  
  if (gameState.world?.factions) {
    Object.entries(gameState.world.factions).forEach(([factionName, faction]) => {
      factionsData.push([
        factionName,
        faction.clockSize || 6,
        faction.progress || 0,
        faction.lastUpdate || new Date().toISOString(),
        faction.reason || '',
        faction.triggeredEvents?.join(', ') || ''
      ])
    })
  }
  
  const factionsSheet = XLSX.utils.aoa_to_sheet(factionsData)
  XLSX.utils.book_append_sheet(workbook, factionsSheet, 'Facciones')
  
  // Hoja 6: PNJs
  const npcsData = [
    ['Nombre', 'Rol', 'Rasgos', 'Objetivos', 'Confianza', 'Tension', 'Ultimo_pensamiento', 'Notas']
  ]
  
  if (gameState.world?.npcs) {
    Object.entries(gameState.world.npcs).forEach(([npcName, npc]) => {
      npcsData.push([
        npcName,
        npc.role || '',
        npc.traits?.join(', ') || '',
        npc.objectives?.join(', ') || '',
        npc.trust || 0,
        npc.tension || 0,
        npc.lastThought || '',
        npc.notes || ''
      ])
    })
  }
  
  const npcsSheet = XLSX.utils.aoa_to_sheet(npcsData)
  XLSX.utils.book_append_sheet(workbook, npcsSheet, 'PNJs')
  
  // Hoja 7: Ganchos
  const hooksData = [
    ['Fecha_ficcion', 'Gancho', 'Estado', 'Recordatorios']
  ]
  
  if (gameState.world?.hooks) {
    gameState.world.hooks.forEach(hook => {
      hooksData.push([
        hook.date || '',
        hook.hook || '',
        hook.status || 'Abierto',
        hook.reminders || ''
      ])
    })
  }
  
  const hooksSheet = XLSX.utils.aoa_to_sheet(hooksData)
  XLSX.utils.book_append_sheet(workbook, hooksSheet, 'Ganchos')
  
  // Hoja 8: Equipo
  const equipmentData = [
    ['Item', 'Cantidad', 'Ubicacion', 'Notas']
  ]
  
  if (gameState.character?.inventory) {
    gameState.character.inventory.forEach(item => {
      equipmentData.push([
        item.name || '',
        item.quantity || 1,
        item.location || 'Inventario',
        item.notes || ''
      ])
    })
  }
  
  const equipmentSheet = XLSX.utils.aoa_to_sheet(equipmentData)
  XLSX.utils.book_append_sheet(workbook, equipmentSheet, 'Equipo')
  
  return workbook
}

// Función para exportar la bitácora
export const exportLogbook = async (gameState, sessionData) => {
  try {
    const workbook = generateLogbook(gameState, sessionData)
    
    // Si estamos en Electron, usar la API de Electron
    if (window.electronAPI) {
      const result = await window.electronAPI.exportExcel(gameState)
      if (result.success) {
        XLSX.writeFile(workbook, result.filePath)
        return { success: true, filePath: result.filePath }
      }
    } else {
      // Fallback para navegador
      const fileName = `bitacora_dnd_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
      return { success: true, fileName }
    }
  } catch (error) {
    console.error('Error al exportar bitácora:', error)
    return { success: false, error: error.message }
  }
}

// Función para registrar una tirada
export const logRoll = (sessionData, roll) => {
  if (!sessionData.rolls) {
    sessionData.rolls = []
  }
  
  sessionData.rolls.push({
    sessionDate: new Date().toISOString().split('T')[0],
    scene: roll.scene,
    test: roll.test,
    target: roll.target,
    d20: roll.d20,
    total: roll.total,
    result: roll.result,
    consequence: roll.consequence
  })
  
  return sessionData
}

// Función para actualizar relojes de facción
export const updateFactionClocks = (gameState, playerActions) => {
  if (!gameState.world.factions) return gameState
  
  Object.keys(gameState.world.factions).forEach(factionName => {
    const faction = gameState.world.factions[factionName]
    let progress = faction.progress || 0
    
    // Determinar avance basado en acciones del jugador
    if (playerActions.some(action => 
      action.includes('sigilo') || action.includes('discreto') || action.includes('cauteloso')
    )) {
      progress += Math.floor(Math.random() * 2) // 0-1 segmentos
    } else if (playerActions.some(action => 
      action.includes('violento') || action.includes('llamativo') || action.includes('fallo')
    )) {
      progress += 1 + Math.floor(Math.random() * 2) // 1-2 segmentos
    }
    
    // Verificar si el reloj se completa
    if (progress >= faction.clockSize) {
      // Disparar evento
      faction.triggeredEvents = faction.triggeredEvents || []
      faction.triggeredEvents.push(`Evento disparado: ${new Date().toISOString()}`)
      progress = 0 // Resetear reloj
    }
    
    faction.progress = progress
    faction.lastUpdate = new Date().toISOString()
  })
  
  return gameState
}

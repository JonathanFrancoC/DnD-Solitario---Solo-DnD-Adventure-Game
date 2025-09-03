import React, { useState, useMemo } from 'react'
import { Send, Zap, Sword, Shield, Heart, Target, Eye, MessageCircle, X } from 'lucide-react'
import spellsData from '../data/spells.json'

// ===== FUNCIONES HELPER (definidas ANTES del componente principal) =====

function groupTitle(group) {
  const titles = {
    action: 'Acción',
    bonus: 'Acción Adicional', 
    free: 'Acciones Libres',
    reaction: 'Reacción',
    class: 'Rasgos de Clase',
    spells: 'Conjuros'
  }
  return titles[group] || group
}

function isSlotSpent(group, turnState) {
  if (group === 'action') return !!turnState.actionUsed
  if (group === 'bonus') return !!turnState.bonusUsed
  if (group === 'reaction') return !turnState.reactionAvailable
  return false
}

function summarizeState(character, turnState) {
  return {
    turn: {
      actionFree: !turnState.actionUsed,
      bonusFree: !turnState.bonusUsed,
      reactionFree: turnState.reactionAvailable,
      moveLeft: turnState.movementLeft ?? 30
    },
    resources: character.mechanics?.resources || {},
    conditions: character.conditions || [],
    environment: turnState.environment || {}
  }
}

// Función para calcular las acciones disponibles
function calculateActionResources(character, turnState, selectedActions) {
  const cls = (character.class || '').toLowerCase()
  const level = character.level || 1
  
  // Contar acciones seleccionadas (incluyendo conjuros que cuestan acción)
  const selectedActionCount = selectedActions.filter(s => {
    const slot = s.key.split(':')[0]
    return slot === 'action' || slot === 'spells' // Los conjuros de acción van en 'spells'
  }).length
  
  const selectedBonusCount = selectedActions.filter(s => s.key.startsWith('bonus:')).length
  const selectedFreeCount = selectedActions.filter(s => s.key.startsWith('free:')).length
  const selectedReactionCount = selectedActions.filter(s => s.key.startsWith('reaction:')).length
  
  // Acción principal
  let actionTotal = 1
  let actionUsed = selectedActionCount
  let extraAttacks = 0
  
  // Action Surge (Guerrero nivel 2+)
  if (cls === 'guerrero' && character.mechanics?.actionSurge && !character.mechanics.actionSurge.used) {
    actionTotal += 1
  }
  
  // Bonus de acción del Ladrón (Pícaro subclase Ladrón) - va en acciones adicionales
  // if (cls === 'picaro' && character.subclass === 'ladron' && character.mechanics?.thiefBonusAction && !character.mechanics.thiefBonusAction.used) {
  //   actionTotal += 1
  // }
  
  // Ataque extra a nivel 5+ (Guerrero, Pícaro, etc.)
  if (level >= 5 && ['guerrero', 'picaro', 'ranger', 'paladin'].includes(cls)) {
    extraAttacks = 1
  }
  
  // Acciones adicionales disponibles
  let bonusTotal = 0
  let bonusUsed = selectedBonusCount
  
  // Second Wind (Guerrero) - da una acción adicional
  if (cls === 'guerrero' && character.mechanics?.secondWind && !character.mechanics.secondWind.used) {
    bonusTotal += 1
  }
  
  // Furia de Bárbaro - puede dar acciones adicionales
  if (cls === 'barbaro' && character.mechanics?.rage && character.mechanics.rage.currentUses < character.mechanics.rage.maxUses) {
    bonusTotal += 1
  }
  
  // Inspiración Bárdica - acción adicional
  if (cls === 'bardo' && character.mechanics?.bardicInspiration && character.mechanics.bardicInspiration.currentUses < character.mechanics.bardicInspiration.maxUses) {
    bonusTotal += 1
  }
  
  // Bonus de acción del Ladrón (Pícaro subclase Ladrón)
  if (cls === 'picaro' && character.subclass === 'ladron' && character.mechanics?.thiefBonusAction && !character.mechanics.thiefBonusAction.used) {
    bonusTotal += 1
  }
  
  // Haste, Action Surge, etc. (futuras expansiones)
  
  return {
    action: {
      total: actionTotal,
      used: actionUsed,
      extraAttacks: extraAttacks
    },
    bonus: {
      total: bonusTotal,
      used: bonusUsed
    },
    free: {
      total: 1,
      used: selectedFreeCount
    },
    reaction: {
      total: 1,
      used: selectedReactionCount
    }
  }
}

// Función helper para obtener nivel de conjuro
function getSpellLevel(spellName) {
  // Buscar en la base de datos de conjuros
  for (let level = 1; level <= 9; level++) {
    if (spellsData?.[`level${level}`]?.[spellName]) {
      return level
    }
  }
  return 1 // Por defecto
}

// Función helper para obtener el tiempo de lanzamiento de un conjuro
function getSpellCastingTime(spellName) {
  // Buscar en cantrips primero
  if (spellsData?.cantrips?.[spellName]) {
    return spellsData.cantrips[spellName].castingTime
  }
  
  // Buscar en conjuros de nivel
  for (let level = 1; level <= 9; level++) {
    if (spellsData?.[`level${level}`]?.[spellName]) {
      return spellsData[`level${level}`][spellName].castingTime
    }
  }
  
  return '1 acción' // Por defecto
}

// Función principal para construir la paleta de acciones
function buildActionPalette(character, turnState) {
  const out = { 
    action: { attacks: [], spells: [], actions: [] }, 
    bonus: [], 
    free: [], 
    reaction: [], 
    class: [], 
    spells: [] 
  }
  const cls = (character.class || '').toLowerCase()

  // === ACCIONES BÁSICAS ===
  
  // Ataques con armas
  if (character.weapon1) {
    out.action.attacks.push({
      id: 'attack_weapon1',
      label: `Atacar: ${character.weapon1}`,
      slot: 'action',
      kind: 'attack',
      weapon: character.weapon1,
      description: 'Realizar un ataque con tu arma principal'
    })
  }
  
  if (character.weapon2) {
    out.action.attacks.push({
      id: 'attack_weapon2',
      label: `Atacar: ${character.weapon2}`,
      slot: 'action',
      kind: 'attack',
      weapon: character.weapon2,
      description: 'Realizar un ataque con tu arma secundaria'
    })
  }

  // Acciones básicas
  const basicActions = [
    { id: 'dodge', label: 'Esquivar', slot: 'action', description: 'Ventaja en tiradas de Destreza' },
    { id: 'dash', label: 'Correr (Dash)', slot: 'action', description: 'Doble movimiento' },
    { id: 'disengage', label: 'Desenganchar', slot: 'action', description: 'No provocas ataques de oportunidad' },
    { id: 'help', label: 'Ayudar', slot: 'action', description: 'Dar ventaja a un aliado' },
    { id: 'hide', label: 'Ocultarse', slot: 'action', description: 'Hacer tirada de Sigilo' },
    { id: 'shove', label: 'Empujar', slot: 'action', description: 'Empujar o derribar objetivo' }
  ]
  
  out.action.actions.push(...basicActions)

  // === ACCIONES ADICIONALES ===
  
  // Inspiración Bárdica
  if (cls === 'bardo') {
    const bardicInsp = character.mechanics?.bardicInspiration
    if (bardicInsp && bardicInsp.currentUses < bardicInsp.maxUses) {
      out.bonus.push({
        id: 'bardic_inspiration',
        label: `Inspiración (${bardicInsp.maxUses - bardicInsp.currentUses}/${bardicInsp.maxUses})`,
        slot: 'bonus',
        resource: 'bardicInspiration',
        description: 'Otorgar inspiración bárdica a un aliado'
      })
    }
  }

  // Furia de Bárbaro
  if (cls === 'barbaro') {
    const rage = character.mechanics?.rage
    if (rage && rage.currentUses < rage.maxUses) {
      out.bonus.push({
        id: 'rage',
        label: `Furia (${rage.maxUses - rage.currentUses}/${rage.maxUses})`,
        slot: 'bonus',
        resource: 'rage',
        description: 'Entrar en estado de furia'
      })
    }
  }

  // Second Wind (Guerrero)
  if (cls === 'guerrero') {
    const secondWind = character.mechanics?.secondWind
    if (secondWind && !secondWind.used) {
      out.bonus.push({
        id: 'second_wind',
        label: 'Second Wind',
        slot: 'bonus',
        resource: 'secondWind',
        description: 'Recuperar 1d10 + nivel puntos de vida'
      })
    }
  }

  // === ACCIONES LIBRES ===
  
  out.free.push(
    { id: 'interact', label: 'Interactuar', slot: 'free', description: 'Interactuar con un objeto' },
    { id: 'speak', label: 'Hablar', slot: 'free', description: 'Decir algo breve' },
    { id: 'drop', label: 'Soltar', slot: 'free', description: 'Soltar un objeto' }
  )

  // === REACCIONES ===
  
  out.reaction.push(
    { id: 'opportunity_attack', label: 'Ataque de Oportunidad', slot: 'reaction', description: 'Atacar cuando un enemigo se aleja' },
    { id: 'shield', label: 'Escudo', slot: 'reaction', description: 'Usar el conjuro Escudo como reacción' }
  )

  // === RASGOS DE CLASE ===
  
  // Castigo Divino (Paladín) - Múltiples niveles de activación
  if (cls === 'paladin') {
    // Obtener slots de conjuro disponibles
    const spellSlots = character.spellSlots || {}
    
    // Crear un botón para cada nivel de conjuro disponible
    Object.keys(spellSlots).forEach(level => {
      const slotData = spellSlots[level]
      const availableSlots = slotData.total - slotData.used
      
      if (availableSlots > 0) {
        const isActive = character.mechanics?.divineSmite?.activeLevel === parseInt(level)
        out.class.push({
          id: `divine_smite_${level}`,
          label: `Castigo Lv${level} ${isActive ? '(ACTIVO)' : ''} (${availableSlots})`,
          slot: 'class',
          type: 'toggle',
          active: isActive,
          spellLevel: parseInt(level),
          availableSlots: availableSlots,
          description: `Activar para usar automáticamente Castigo Divino de nivel ${level} en ataques cuerpo a cuerpo exitosos`
        })
      }
    })
  }

  // Ataque Furtivo (Pícaro) - Botón de activación
  if (cls === 'picaro') {
    const isActive = character.mechanics?.sneakAttack?.active || false
    out.class.push({
      id: 'sneak_attack',
      label: `Ataque Furtivo ${isActive ? '(ACTIVO)' : ''}`,
      slot: 'class',
      type: 'toggle',
      active: isActive,
      description: 'Activar para que la IA evalúe si puedes usar ataque furtivo basándose en el contexto (ventaja, aliados cerca, etc.)'
    })
  }

  // Usar Ki (Monje) - Botón de activación
  if (cls === 'monje' && character.level >= 2) {
    const kiPoints = character.mechanics?.ki?.points || character.level
    const isActive = character.mechanics?.ki?.active || false
    out.class.push({
      id: 'use_ki',
      label: `Usar Ki ${isActive ? '(ACTIVO)' : ''} (${kiPoints})`,
      slot: 'class',
      type: 'toggle',
      active: isActive,
      resource: 'ki',
      points: kiPoints,
      description: 'Activar para que la IA use automáticamente puntos de ki en ataques y habilidades cuando sea apropiado'
    })
  }

  // Furia de Bárbaro - Botón de activación
  if (cls === 'barbaro') {
    const isActive = character.mechanics?.rage?.active || false
    const rageUses = character.mechanics?.rage?.currentUses || 0
    const maxRage = character.mechanics?.rage?.maxUses || 0
    out.class.push({
      id: 'rage_toggle',
      label: `Furia ${isActive ? '(ACTIVA)' : ''} (${maxRage - rageUses}/${maxRage})`,
      slot: 'class',
      type: 'toggle',
      active: isActive,
      resource: 'rage',
      description: 'Activar para que la IA use automáticamente la furia cuando sea apropiado en combate'
    })
  }

  // Inspiración Bárdica - Botón de activación
  if (cls === 'bardo') {
    const isActive = character.mechanics?.bardicInspiration?.active || false
    const inspUses = character.mechanics?.bardicInspiration?.currentUses || 0
    const maxInsp = character.mechanics?.bardicInspiration?.maxUses || 0
    out.class.push({
      id: 'bardic_inspiration_toggle',
      label: `Inspiración ${isActive ? '(ACTIVA)' : ''} (${maxInsp - inspUses}/${maxInsp})`,
      slot: 'class',
      type: 'toggle',
      active: isActive,
      resource: 'bardicInspiration',
      description: 'Activar para que la IA use automáticamente la inspiración bárdica cuando sea apropiado'
    })
  }

  // Second Wind (Guerrero) - Botón de activación
  if (cls === 'guerrero') {
    const isActive = character.mechanics?.secondWind?.active || false
    const canUse = character.mechanics?.secondWind && !character.mechanics.secondWind.used
    out.class.push({
      id: 'second_wind_toggle',
      label: `Second Wind ${isActive ? '(ACTIVO)' : ''} ${!canUse ? '(USADO)' : ''}`,
      slot: 'class',
      type: 'toggle',
      active: isActive,
      disabled: !canUse,
      description: 'Activar para que la IA use automáticamente Second Wind cuando sea apropiado'
    })
  }

    // === CONJUROS ===
  
  // Cantrips
  if (character.cantrips && character.cantrips.length > 0) {
    character.cantrips.forEach(cantrip => {
      // Buscar el nombre traducido en la base de datos de conjuros
      const spellData = spellsData?.cantrips?.[cantrip]
      const spellName = spellData?.name || cantrip
      const castingTime = getSpellCastingTime(cantrip)
      
             // Determinar el slot basado en el tiempo de lanzamiento
       if (castingTime.includes('acción bonus')) {
         out.bonus.push({
           id: `cantrip_${cantrip}`,
           label: spellName,
           slot: 'bonus',
           kind: 'cantrip',
           description: spellData?.description || 'Conjuro de nivel 0 (uso ilimitado)'
         })
       } else if (castingTime.includes('reacción')) {
         out.reaction.push({
           id: `cantrip_${cantrip}`,
           label: spellName,
           slot: 'reaction',
           kind: 'cantrip',
           description: spellData?.description || 'Conjuro de nivel 0 (uso ilimitado)'
         })
       } else if (castingTime.includes('1 acción')) {
         // Los cantrips de acción van a la subcategoría de conjuros en action
         out.action.spells.push({
           id: `cantrip_${cantrip}`,
           label: spellName,
           slot: 'action',
           kind: 'cantrip',
           description: spellData?.description || 'Conjuro de nivel 0 (uso ilimitado)'
         })
       } else {
         // Cantrips que no son de acción
         out.spells.push({
           id: `cantrip_${cantrip}`,
           label: spellName,
           slot: 'spells',
           kind: 'cantrip',
           description: spellData?.description || 'Conjuro de nivel 0 (uso ilimitado)'
         })
       }
    })
  }

  // Conjuros de nivel
  if (character.spells && character.spells.length > 0) {
    character.spells.forEach(spell => {
      const spellLevel = getSpellLevel(spell)
      const hasSlots = character.spellSlots?.[spellLevel]?.total > character.spellSlots?.[spellLevel]?.used
      
      if (hasSlots) {
        // Buscar el nombre traducido en la base de datos de conjuros
        const spellData = spellsData?.[`level${spellLevel}`]?.[spell]
        const spellName = spellData?.name || spell
        const castingTime = getSpellCastingTime(spell)
        
                 // Determinar el slot basado en el tiempo de lanzamiento
         if (castingTime.includes('acción bonus')) {
           out.bonus.push({
             id: `spell_${spell}`,
             label: `${spellName} (Nivel ${spellLevel})`,
             slot: 'bonus',
             kind: 'spell',
             spell: spell,
             level: spellLevel,
             description: spellData?.description || `Conjuro de nivel ${spellLevel}`
           })
         } else if (castingTime.includes('reacción')) {
           out.reaction.push({
             id: `spell_${spell}`,
             label: `${spellName} (Nivel ${spellLevel})`,
             slot: 'reaction',
             kind: 'spell',
             spell: spell,
             level: spellLevel,
             description: spellData?.description || `Conjuro de nivel ${spellLevel}`
           })
         } else if (castingTime.includes('1 acción')) {
           // Los conjuros de acción van a la subcategoría de conjuros en action
           out.action.spells.push({
             id: `spell_${spell}`,
             label: `${spellName} (Nivel ${spellLevel})`,
             slot: 'action',
             kind: 'spell',
             spell: spell,
             level: spellLevel,
             description: spellData?.description || `Conjuro de nivel ${spellLevel}`
           })
         } else {
           // Conjuros que no son de acción (rituales, etc.)
           out.spells.push({
             id: `spell_${spell}`,
             label: `${spellName} (Nivel ${spellLevel})`,
             slot: 'spells',
             kind: 'spell',
             spell: spell,
             level: spellLevel,
             description: spellData?.description || `Conjuro de nivel ${spellLevel}`
           })
         }
      }
    })
  }

  return out
}

// ===== COMPONENTES AUXILIARES (definidos ANTES del componente principal) =====

// Componente para mostrar recursos del turno
function TurnResource({ label, available, icon: Icon, value, color, used = 0, total = 1, extraAttacks = 0 }) {
  const isAction = label === 'Acción'
  const isBonus = label === 'Adicional'
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        flexDirection: isAction ? 'column' : 'row'
      }}>
        {/* Iconos principales */}
        {Array.from({ length: total }, (_, i) => (
          <Icon 
            key={i}
            size={isAction ? 20 : 16} 
            color={i < used ? '#95a5a6' : color} 
            style={{
              opacity: i < used ? 0.5 : 1,
              transition: 'all 0.3s ease'
            }}
          />
        ))}
        
        {/* Ataques extra (solo para Acción) */}
        {isAction && extraAttacks > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1px',
            marginTop: '2px'
          }}>
            {Array.from({ length: extraAttacks }, (_, i) => (
              <Icon 
                key={`extra-${i}`}
                size={12} 
                color={color}
                style={{
                  opacity: 0.8
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <span style={{ fontSize: '12px', color: '#bdc3c7' }}>{label}</span>
      {value ? (
        <span style={{ fontSize: '14px', fontWeight: 'bold', color }}>{value}</span>
      ) : (
        <span style={{ fontSize: '14px', fontWeight: 'bold', color }}>
          {available ? 'Libre' : 'Usado'}
        </span>
      )}
    </div>
  )
}

// Componente para grupos de acciones
function ActionGroup({ title, items, disabled, selected, onToggle, character }) {
  // Si items es un objeto con subcategorías (como action)
  if (items && typeof items === 'object' && !Array.isArray(items)) {
    const hasItems = Object.values(items).some(subItems => subItems.length > 0)
    if (!hasItems) return null

    return (
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '12px'
      }}>
        <h4 style={{
          margin: '0 0 10px 0',
          fontSize: '14px',
          color: disabled ? '#95a5a6' : '#ecf0f1',
          fontWeight: 'bold'
        }}>
          {title}
        </h4>
        
        {/* Subcategorías */}
        {items.attacks && items.attacks.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{
              margin: '0 0 6px 0',
              fontSize: '12px',
              color: '#bdc3c7',
              fontWeight: 'bold'
            }}>
              Ataques
            </h5>
            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap'
            }}>
              {items.attacks.map((action) => {
                const isSelected = selected.some(s => s.key === `${action.slot || 'action'}:${action.id}`)
                const isDisabled = disabled || (action.resource && action.resource.remaining === 0)
                
                return (
                  <button
                    key={action.id}
                    onClick={() => !isDisabled && onToggle(action)}
                    disabled={isDisabled}
                    style={{
                      background: isSelected 
                        ? 'rgba(46, 204, 113, 0.8)'
                        : isDisabled
                        ? 'rgba(149, 165, 166, 0.3)'
                        : 'rgba(52, 152, 219, 0.2)',
                      border: `1px solid ${isSelected ? '#2ecc71' : isDisabled ? '#95a5a6' : '#3498db'}`,
                      color: isSelected ? '#2ecc71' : isDisabled ? '#95a5a6' : '#3498db',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      transition: 'all 0.3s ease',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                    title={action.description || action.label}
                    onMouseOver={(e) => {
                      if (!isDisabled && !isSelected) {
                        e.target.style.background = 'rgba(52, 152, 219, 0.3)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isDisabled && !isSelected) {
                        e.target.style.background = 'rgba(52, 152, 219, 0.2)'
                      }
                    }}
                  >
                    {action.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {items.spells && items.spells.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <h5 style={{
              margin: '0 0 6px 0',
              fontSize: '12px',
              color: '#bdc3c7',
              fontWeight: 'bold'
            }}>
              Conjuros
            </h5>
            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap'
            }}>
              {items.spells.map((action) => {
                const isSelected = selected.some(s => s.key === `${action.slot || 'action'}:${action.id}`)
                const isDisabled = disabled || (action.resource && action.resource.remaining === 0)
                
                return (
                  <button
                    key={action.id}
                    onClick={() => !isDisabled && onToggle(action)}
                    disabled={isDisabled}
                    style={{
                      background: isSelected 
                        ? 'rgba(46, 204, 113, 0.8)'
                        : isDisabled
                        ? 'rgba(149, 165, 166, 0.3)'
                        : 'rgba(52, 152, 219, 0.2)',
                      border: `1px solid ${isSelected ? '#2ecc71' : isDisabled ? '#95a5a6' : '#3498db'}`,
                      color: isSelected ? '#2ecc71' : isDisabled ? '#95a5a6' : '#3498db',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      transition: 'all 0.3s ease',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                    title={action.description || action.label}
                    onMouseOver={(e) => {
                      if (!isDisabled && !isSelected) {
                        e.target.style.background = 'rgba(52, 152, 219, 0.3)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isDisabled && !isSelected) {
                        e.target.style.background = 'rgba(52, 152, 219, 0.2)'
                      }
                    }}
                  >
                    {action.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {items.actions && items.actions.length > 0 && (
          <div>
            <h5 style={{
              margin: '0 0 6px 0',
              fontSize: '12px',
              color: '#bdc3c7',
              fontWeight: 'bold'
            }}>
              Acciones
            </h5>
            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap'
            }}>
              {items.actions.map((action) => {
                const isSelected = selected.some(s => s.key === `${action.slot || 'action'}:${action.id}`)
                const isDisabled = disabled || (action.resource && action.resource.remaining === 0)
                
                return (
                  <button
                    key={action.id}
                    onClick={() => !isDisabled && onToggle(action)}
                    disabled={isDisabled}
                    style={{
                      background: isSelected 
                        ? 'rgba(46, 204, 113, 0.8)'
                        : isDisabled
                        ? 'rgba(149, 165, 166, 0.3)'
                        : 'rgba(52, 152, 219, 0.2)',
                      border: `1px solid ${isSelected ? '#2ecc71' : isDisabled ? '#95a5a6' : '#3498db'}`,
                      color: isSelected ? '#2ecc71' : isDisabled ? '#95a5a6' : '#3498db',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      transition: 'all 0.3s ease',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                    title={action.description || action.label}
                    onMouseOver={(e) => {
                      if (!isDisabled && !isSelected) {
                        e.target.style.background = 'rgba(52, 152, 219, 0.3)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isDisabled && !isSelected) {
                        e.target.style.background = 'rgba(52, 152, 219, 0.2)'
                      }
                    }}
                  >
                    {action.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Si items es un array normal
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '8px',
      padding: '12px'
    }}>
      <h4 style={{
        margin: '0 0 10px 0',
        fontSize: '14px',
        color: disabled ? '#95a5a6' : '#ecf0f1',
        fontWeight: 'bold'
      }}>
        {title}
      </h4>
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
                 {items.map((action) => {
           const isSelected = selected.some(s => s.key === `${action.slot || 'action'}:${action.id}`)
           const isDisabled = disabled || (action.resource && action.resource.remaining === 0) || action.disabled
           const isToggle = action.type === 'toggle'
           const isActive = action.active
          
          return (
            <button
              key={action.id}
              onClick={() => !isDisabled && onToggle(action)}
              disabled={isDisabled}
              style={{
                background: isToggle && isActive
                  ? 'rgba(155, 89, 182, 0.8)' // Púrpura para activado
                  : isSelected 
                  ? 'rgba(46, 204, 113, 0.8)'
                  : isDisabled
                  ? 'rgba(149, 165, 166, 0.3)'
                  : 'rgba(52, 152, 219, 0.2)',
                border: isToggle && isActive
                  ? '2px solid #9b59b6'
                  : `1px solid ${isSelected ? '#2ecc71' : isDisabled ? '#95a5a6' : '#3498db'}`,
                color: isToggle && isActive
                  ? '#9b59b6'
                  : isSelected ? '#2ecc71' : isDisabled ? '#95a5a6' : '#3498db',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                transition: 'all 0.3s ease',
                opacity: isDisabled ? 0.5 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
              title={action.description || action.label}
              onMouseOver={(e) => {
                if (!isDisabled && !isSelected && !isActive) {
                  e.target.style.background = 'rgba(52, 152, 219, 0.3)'
                }
              }}
              onMouseOut={(e) => {
                if (!isDisabled && !isSelected && !isActive) {
                  e.target.style.background = 'rgba(52, 152, 219, 0.2)'
                }
              }}
            >
              {/* Animación de línea giratoria cuando está activo */}
              {isToggle && isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: '2px solid transparent',
                  borderTop: '2px solid #e74c3c',
                  borderRadius: '6px',
                  animation: 'spin 2s linear infinite',
                  pointerEvents: 'none'
                }} />
              )}
              {action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ===== COMPONENTE PRINCIPAL =====

// Componente principal ActionBar
export default function ActionBar({
  character,
  turnState,
  onSend,
  suggestions = [],
  onTurnStateChange
}) {
  const [intent, setIntent] = useState("")
  const [selected, setSelected] = useState([])
  const [freeActionText, setFreeActionText] = useState("")

  // Agregar estilos CSS para la animación
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // Usar useMemo para construir la paleta de acciones
  const palette = useMemo(() => {
    return buildActionPalette(character, turnState)
  }, [character, turnState])

  const toggle = (action) => {
    // Manejar botones de activación (toggle)
    if (action.type === 'toggle') {
      // Actualizar el estado del personaje para reflejar la activación/desactivación
      if (onTurnStateChange) {
        const newMechanics = { ...character.mechanics }
        
                 switch (action.id) {
           case 'divine_smite':
             newMechanics.divineSmite = { 
               ...newMechanics.divineSmite, 
               active: !action.active 
             }
             break
           default:
             // Manejar múltiples niveles de Castigo Divino
             if (action.id.startsWith('divine_smite_')) {
               const level = action.spellLevel
               if (action.active) {
                 // Desactivar si ya está activo
                 newMechanics.divineSmite = { 
                   ...newMechanics.divineSmite, 
                   activeLevel: null 
                 }
               } else {
                 // Activar el nivel específico
                 newMechanics.divineSmite = { 
                   ...newMechanics.divineSmite, 
                   activeLevel: level 
                 }
               }
             }
             break
           case 'sneak_attack':
             newMechanics.sneakAttack = { 
               ...newMechanics.sneakAttack, 
               active: !action.active 
             }
             break
           case 'use_ki':
             newMechanics.ki = { 
               ...newMechanics.ki, 
               active: !action.active 
             }
             break
           case 'rage_toggle':
             newMechanics.rage = { 
               ...newMechanics.rage, 
               active: !action.active 
             }
             break
           case 'bardic_inspiration_toggle':
             newMechanics.bardicInspiration = { 
               ...newMechanics.bardicInspiration, 
               active: !action.active 
             }
             break
           case 'second_wind_toggle':
             newMechanics.secondWind = { 
               ...newMechanics.secondWind, 
               active: !action.active 
             }
             break
         }
        
        onTurnStateChange({
          ...character,
          mechanics: newMechanics
        })
      }
      return // No agregar a selected para botones de toggle
    }
    
    const key = `${action.slot || 'action'}:${action.id}`
    const slot = action.slot || 'action'
    
    setSelected(prev => {
      const exists = prev.find(s => s.key === key)
      if (exists) {
        return prev.filter(s => s.key !== key)
      } else {
        // Si es una acción principal, verificar si puede tener múltiples
        if (slot === 'action') {
          const hasActionSurge = character.mechanics?.actionSurge && !character.mechanics.actionSurge.used
          
          // Si no tiene Action Surge, solo una acción
          if (!hasActionSurge) {
            const otherActions = prev.filter(s => s.key.startsWith('action:'))
            const nonActions = prev.filter(s => !s.key.startsWith('action:'))
            return [...nonActions, { key, action }]
          }
          // Si tiene Action Surge, permitir múltiples
          else {
            return [...prev, { key, action }]
          }
        }
        // Si es una acción adicional, verificar si puede tener múltiples
        else if (slot === 'bonus') {
          const hasMultipleBonus = character.mechanics?.multipleBonusActions || false
          const hasThiefBonus = character.subclass === 'ladron' && character.mechanics?.thiefBonusAction && !character.mechanics.thiefBonusAction.used
          
          // Si no tiene múltiples acciones adicionales o bonus de Ladrón, solo una
          if (!hasMultipleBonus && !hasThiefBonus) {
            const otherBonus = prev.filter(s => s.key.startsWith('bonus:'))
            const nonBonus = prev.filter(s => !s.key.startsWith('bonus:'))
            return [...nonBonus, { key, action }]
          } else {
            return [...prev, { key, action }]
          }
        }
        // Para acciones libres y reacciones solo una por turno
        else if (slot === 'free' || slot === 'reaction') {
          const otherSameSlot = prev.filter(s => s.key.startsWith(`${slot}:`))
          const otherSlots = prev.filter(s => !s.key.startsWith(`${slot}:`))
          return [...otherSlots, { key, action }]
        }
        // Para otros tipos (class, spells, etc.) solo una
        else {
          const otherSameSlot = prev.filter(s => s.key.startsWith(`${slot}:`))
          const otherSlots = prev.filter(s => !s.key.startsWith(`${slot}:`))
          return [...otherSlots, { key, action }]
        }
      }
    })
  }

  const send = () => {
    if (!intent.trim() && selected.length === 0) return
    
    const state = summarizeState(character, turnState)
    const data = {
      intent: intent.trim(),
      freeActionText: freeActionText.trim(),
      selectedActions: selected.map(s => ({
        slot: s.key.split(':')[0],
        id: s.key.split(':')[1],
        action: s.action
      })),
      state
    }
    
    onSend(data)
    setIntent("")
    setSelected([])
    setFreeActionText("")
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const applySuggestion = (suggestion) => {
    setIntent(suggestion.intent || "")
    setSelected(suggestion.actions || [])
  }

  // Verificar si hay acciones libres seleccionadas
  const hasFreeActions = selected.some(s => s.key.startsWith('free:'))

  return (
    <div style={{
      background: 'rgba(0,0,0,0.8)',
      border: '1px solid #34495e',
      borderRadius: '12px',
      padding: '16px',
      margin: '16px 0',
      color: '#ecf0f1'
    }}>
      {/* Caja de Intención */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe tu intención (ej: 'intento pegarle por la espalda')"
          style={{
            flex: 1,
            background: 'rgba(52, 73, 94, 0.5)',
            border: '1px solid #34495e',
            borderRadius: '6px',
            padding: '8px',
            color: '#ecf0f1',
            fontSize: '14px',
            minHeight: '60px',
            resize: 'vertical'
          }}
        />
        <button
          onClick={send}
          disabled={!intent.trim() && selected.length === 0}
          style={{
            background: 'rgba(46, 204, 113, 0.8)',
            border: '1px solid #2ecc71',
            borderRadius: '6px',
            padding: '8px 16px',
            color: '#2ecc71',
            cursor: 'pointer',
            fontSize: '14px',
            alignSelf: 'flex-end'
          }}
        >
          <Send size={16} />
        </button>
      </div>

      {/* Atajos de acción */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {['/susurrar', '/investigar', '/mirar', '/moverse'].map(shortcut => (
          <button
            key={shortcut}
            onClick={() => setIntent(prev => prev + ' ' + shortcut)}
            style={{
              background: 'rgba(52, 152, 219, 0.2)',
              border: '1px solid #3498db',
              borderRadius: '4px',
              padding: '4px 8px',
              color: '#3498db',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {shortcut}
          </button>
        ))}
      </div>

             {/* Economía del Turno */}
       <div style={{
         display: 'flex',
         gap: '16px',
         marginBottom: '16px',
         padding: '12px',
         background: 'rgba(52, 73, 94, 0.3)',
         borderRadius: '8px'
       }}>
         {(() => {
           const resources = calculateActionResources(character, turnState, selected)
           return (
             <>
               <TurnResource
                 label="Acción"
                 available={resources.action.used < resources.action.total}
                 icon={Sword}
                 color="#2ecc71"
                 used={resources.action.used}
                 total={resources.action.total}
                 extraAttacks={resources.action.extraAttacks}
               />
               <TurnResource
                 label="Adicional"
                 available={resources.bonus.used < resources.bonus.total}
                 icon={Zap}
                 color="#f39c12"
                 used={resources.bonus.used}
                 total={resources.bonus.total}
               />
                               <TurnResource
                  label="Movimiento"
                  value={`${turnState.movementLeft || 30}/30`}
                  icon={Target}
                  color="#3498db"
                />
                <TurnResource
                  label="Libre"
                  available={resources.free.used < resources.free.total}
                  icon={Eye}
                  color="#9b59b6"
                  used={resources.free.used}
                  total={resources.free.total}
                />
                <TurnResource
                  label="Reacción"
                  available={resources.reaction.used < resources.reaction.total}
                  icon={Shield}
                  color={resources.reaction.used < resources.reaction.total ? '#9b59b6' : '#e74c3c'}
                  used={resources.reaction.used}
                  total={resources.reaction.total}
                />
             </>
           )
         })()}
       </div>

      {/* Paleta de Acciones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <ActionGroup
          title="Acción"
          items={palette.action}
          disabled={turnState.actionUsed}
          selected={selected}
          onToggle={toggle}
          character={character}
        />
        <ActionGroup
          title="Acción Adicional"
          items={palette.bonus}
          disabled={turnState.bonusUsed}
          selected={selected}
          onToggle={toggle}
          character={character}
        />
                 <ActionGroup
           title="Acciones Libres"
           items={palette.free}
           disabled={(() => {
             const resources = calculateActionResources(character, turnState, selected)
             return resources.free.used >= resources.free.total
           })()}
           selected={selected}
           onToggle={toggle}
           character={character}
         />
         <ActionGroup
           title="Reacción"
           items={palette.reaction}
           disabled={(() => {
             const resources = calculateActionResources(character, turnState, selected)
             return resources.reaction.used >= resources.reaction.total
           })()}
           selected={selected}
           onToggle={toggle}
           character={character}
         />
        <ActionGroup
          title="Rasgos de Clase"
          items={palette.class}
          disabled={false}
          selected={selected}
          onToggle={toggle}
          character={character}
        />
        <ActionGroup
          title="Conjuros"
          items={palette.spells}
          disabled={false}
          selected={selected}
          onToggle={toggle}
          character={character}
                 />
       </div>

       {/* Cuadro de texto para acciones libres */}
       {hasFreeActions && (
         <div style={{
           marginBottom: '12px',
           padding: '12px',
           background: 'rgba(155, 89, 182, 0.2)',
           borderRadius: '8px',
           border: '1px solid #9b59b6'
         }}>
           <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#9b59b6' }}>
             Describe tu acción libre:
           </h4>
           <textarea
             value={freeActionText}
             onChange={(e) => setFreeActionText(e.target.value)}
             placeholder="Ej: escribo y tiro de la palanca, abro la puerta, etc."
             style={{
               width: '100%',
               background: 'rgba(52, 73, 94, 0.5)',
               border: '1px solid #34495e',
               borderRadius: '6px',
               padding: '8px',
               color: '#ecf0f1',
               fontSize: '14px',
               minHeight: '60px',
               resize: 'vertical'
             }}
           />
         </div>
       )}

       {/* Sugerencias de IA */}
      {suggestions.length > 0 && (
        <div style={{
          marginBottom: '12px',
          padding: '12px',
          background: 'rgba(155, 89, 182, 0.2)',
          borderRadius: '8px',
          border: '1px solid #9b59b6'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#9b59b6' }}>
            Sugerencias de IA:
          </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => applySuggestion(suggestion)}
                style={{
                  background: 'rgba(155, 89, 182, 0.3)',
                  border: '1px solid #9b59b6',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  color: '#9b59b6',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

             {/* Acciones Seleccionadas */}
       {selected.length > 0 && (
         <div style={{
           padding: '12px',
           background: 'rgba(46, 204, 113, 0.2)',
           borderRadius: '8px',
           border: '1px solid #2ecc71',
           maxWidth: '100%',
           overflow: 'hidden'
         }}>
           <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#2ecc71' }}>
             Acciones Seleccionadas:
           </h4>
           <div style={{ 
             display: 'flex', 
             gap: '8px', 
             flexWrap: 'wrap',
             maxWidth: '100%',
             overflow: 'hidden'
           }}>
             {selected.map((item, index) => (
               <div
                 key={index}
                 style={{
                   background: 'rgba(46, 204, 113, 0.3)',
                   border: '1px solid #2ecc71',
                   borderRadius: '4px',
                   padding: '4px 8px',
                   color: '#2ecc71',
                   fontSize: '12px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '4px',
                   maxWidth: '200px',
                   overflow: 'hidden',
                   whiteSpace: 'nowrap',
                   textOverflow: 'ellipsis'
                 }}
                 title={item.action.label}
               >
                 <span style={{
                   overflow: 'hidden',
                   textOverflow: 'ellipsis',
                   whiteSpace: 'nowrap'
                 }}>
                   {item.action.label}
                 </span>
                 <button
                   onClick={() => toggle(item.action)}
                   style={{
                     background: 'none',
                     border: 'none',
                     color: '#2ecc71',
                     cursor: 'pointer',
                     padding: '0',
                     fontSize: '12px',
                     flexShrink: 0
                   }}
                 >
                   <X size={12} />
                 </button>
               </div>
             ))}
           </div>
         </div>
       )}
    </div>
  )
}

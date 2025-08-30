import React, { useState, useEffect } from 'react'
import { getAvailableMechanics } from '../data/classMechanics.js'

const ClassMechanicsManager = ({ characterData, onMechanicsChange }) => {
  const [mechanics, setMechanics] = useState(characterData.mechanics || {})
  const [sneakAttackActive, setSneakAttackActive] = useState(false)
  const [rageActive, setRageActive] = useState(false)
  const [wildShapeActive, setWildShapeActive] = useState(false)
  const [bardicInspirationUses, setBardicInspirationUses] = useState(0)

  const availableMechanics = getAvailableMechanics(characterData.class, characterData.level || 1)

  useEffect(() => {
    // Inicializar mecánicas si no existen
    const initialMechanics = {}
    Object.keys(availableMechanics).forEach(key => {
      if (!mechanics[key]) {
        const mechanic = availableMechanics[key]
        initialMechanics[key] = {
          isActive: false,
          currentUses: 0,
          maxUses: typeof mechanic.uses === 'object' 
            ? mechanic.uses[characterData.level || 1] || 0
            : mechanic.uses || 0
        }
      } else {
        initialMechanics[key] = mechanics[key]
      }
    })
    
    if (Object.keys(initialMechanics).length > 0) {
      setMechanics(initialMechanics)
      onMechanicsChange(initialMechanics)
    }
  }, [characterData.class, characterData.level])

  const toggleMechanic = (key) => {
    const mechanic = availableMechanics[key]
    const currentMechanic = mechanics[key] || {}
    
    let newState = { ...mechanics }
    
    switch (key) {
      case 'sneakAttack':
        // Para el daño furtivo, solo activamos/desactivamos
        setSneakAttackActive(!sneakAttackActive)
        newState[key] = {
          ...currentMechanic,
          isActive: !sneakAttackActive
        }
        break
        
      case 'rage':
        // Para la furia, activamos y reducimos usos
        if (!rageActive && currentMechanic.currentUses < currentMechanic.maxUses) {
          setRageActive(true)
          newState[key] = {
            ...currentMechanic,
            isActive: true,
            currentUses: currentMechanic.currentUses + 1
          }
        } else if (rageActive) {
          setRageActive(false)
          newState[key] = {
            ...currentMechanic,
            isActive: false
          }
        }
        break
        
      case 'wildShape':
        // Para forma salvaje, activamos y reducimos usos
        if (!wildShapeActive && currentMechanic.currentUses < currentMechanic.maxUses) {
          setWildShapeActive(true)
          newState[key] = {
            ...currentMechanic,
            isActive: true,
            currentUses: currentMechanic.currentUses + 1
          }
        } else if (wildShapeActive) {
          setWildShapeActive(false)
          newState[key] = {
            ...currentMechanic,
            isActive: false
          }
        }
        break
        
      case 'bardicInspiration':
        // Para inspiración bárdica, reducimos usos
        if (currentMechanic.currentUses < currentMechanic.maxUses) {
          newState[key] = {
            ...currentMechanic,
            currentUses: currentMechanic.currentUses + 1
          }
          setBardicInspirationUses(currentMechanic.currentUses + 1)
        }
        break
        
      default:
        // Para otras mecánicas, solo activamos/desactivamos
        newState[key] = {
          ...currentMechanic,
          isActive: !currentMechanic.isActive
        }
    }
    
    setMechanics(newState)
    onMechanicsChange(newState)
  }

  const resetMechanics = () => {
    const resetMechanics = {}
    Object.keys(availableMechanics).forEach(key => {
      const mechanic = availableMechanics[key]
      resetMechanics[key] = {
        isActive: false,
        currentUses: 0,
        maxUses: typeof mechanic.uses === 'object' 
          ? mechanic.uses[characterData.level || 1] || 0
          : mechanic.uses || 0
      }
    })
    
    setMechanics(resetMechanics)
    setSneakAttackActive(false)
    setRageActive(false)
    setWildShapeActive(false)
    setBardicInspirationUses(0)
    onMechanicsChange(resetMechanics)
  }

  const getMechanicButtonStyle = (key, isActive, canUse) => {
    const baseStyle = {
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      cursor: canUse ? 'pointer' : 'not-allowed',
      fontSize: '12px',
      fontWeight: 'bold',
      transition: 'all 0.2s ease',
      margin: '4px'
    }

    if (!canUse) {
      return {
        ...baseStyle,
        backgroundColor: '#f5f5f5',
        color: '#999'
      }
    }

    if (isActive) {
      return {
        ...baseStyle,
        backgroundColor: '#4caf50',
        color: 'white'
      }
    }

    return {
      ...baseStyle,
      backgroundColor: '#2196f3',
      color: 'white'
    }
  }

  const renderMechanicControl = (key, mechanic) => {
    const currentMechanic = mechanics[key] || {}
    const isActive = currentMechanic.isActive || false
    const currentUses = currentMechanic.currentUses || 0
    const maxUses = currentMechanic.maxUses || 0
    const canUse = currentUses < maxUses || !maxUses

    switch (key) {
      case 'sneakAttack':
        return (
          <div style={{ marginBottom: '10px' }}>
            <button
              style={getMechanicButtonStyle(key, isActive, true)}
              onClick={() => toggleMechanic(key)}
            >
              {isActive ? '🎯 Daño Furtivo ACTIVO' : '🎯 Activar Daño Furtivo'}
            </button>
            {isActive && (
              <div style={{
                fontSize: '11px',
                color: '#4caf50',
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                Daño adicional: {mechanic.damage?.[characterData.level || 1] || '1d6'}
              </div>
            )}
          </div>
        )

      case 'rage':
        return (
          <div style={{ marginBottom: '10px' }}>
            <button
              style={getMechanicButtonStyle(key, isActive, canUse)}
              onClick={() => toggleMechanic(key)}
            >
              {isActive ? '🔥 FURIA ACTIVA' : `🔥 Activar Furia (${currentUses}/${maxUses})`}
            </button>
            {isActive && (
              <div style={{
                fontSize: '11px',
                color: '#ff5722',
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                Daño adicional: +{mechanic.damageBonus?.[characterData.level || 1] || 2}
              </div>
            )}
          </div>
        )

      case 'wildShape':
        return (
          <div style={{ marginBottom: '10px' }}>
            <button
              style={getMechanicButtonStyle(key, isActive, canUse)}
              onClick={() => toggleMechanic(key)}
            >
              {isActive ? '🐺 FORMA SALVAJE ACTIVA' : `🐺 Transformarse (${currentUses}/${maxUses})`}
            </button>
            {isActive && (
              <div style={{
                fontSize: '11px',
                color: '#8bc34a',
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                CR máximo: {mechanic.maxCR?.[characterData.level || 1] || '1/4'}
              </div>
            )}
          </div>
        )

      case 'bardicInspiration':
        return (
          <div style={{ marginBottom: '10px' }}>
            <button
              style={getMechanicButtonStyle(key, false, canUse)}
              onClick={() => toggleMechanic(key)}
            >
              🎵 Usar Inspiración ({currentUses}/{maxUses})
            </button>
            <div style={{
              fontSize: '11px',
              color: '#9c27b0',
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              Dado: {mechanic.die?.[characterData.level || 1] || 'd6'}
            </div>
          </div>
        )

      default:
        return (
          <div style={{ marginBottom: '10px' }}>
            <button
              style={getMechanicButtonStyle(key, isActive, canUse)}
              onClick={() => toggleMechanic(key)}
            >
              {isActive ? '✅ ACTIVO' : '⚡ Activar'}
            </button>
          </div>
        )
    }
  }

  if (Object.keys(availableMechanics).length === 0) {
    return null
  }

  return (
    <div style={{
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#fff3e0',
      border: '2px solid #ff9800',
      borderRadius: '8px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{
          margin: '0',
          fontSize: '16px',
          color: '#e65100',
          textAlign: 'center'
        }}>
          ⚔️ Mecánicas de Clase
        </h3>
        <button
          onClick={resetMechanics}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🔄 Resetear
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px'
      }}>
        {Object.entries(availableMechanics).map(([key, mechanic]) => (
          <div 
            key={key}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ffcc80',
              borderRadius: '6px',
              padding: '12px',
              position: 'relative'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h4 style={{
                margin: '0',
                fontSize: '14px',
                color: '#e65100',
                fontWeight: 'bold'
              }}>
                {mechanic.name}
              </h4>
            </div>
            
            <p style={{
              fontSize: '12px',
              color: '#666',
              margin: '0 0 10px 0',
              lineHeight: '1.4'
            }}>
              {mechanic.description}
            </p>
            
            {renderMechanicControl(key, mechanic)}
            
            {mechanic.recovery && (
              <div style={{
                fontSize: '11px',
                color: '#ff9800',
                fontStyle: 'italic'
              }}>
                Recuperación: {mechanic.recovery}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClassMechanicsManager

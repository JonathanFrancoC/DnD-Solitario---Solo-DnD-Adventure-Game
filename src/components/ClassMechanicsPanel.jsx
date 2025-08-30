import React, { useState } from 'react'
import { getAvailableMechanics } from '../data/classMechanics.js'
import { getSpellcastingSummary } from '../data/spellcastingData.js'
import { spellsData, getSpellsForClassAndLevel, cantripsKnownAt } from '../data/spellsData.js'

// Helper functions for spell data access
const findSpellDataByKey = (key) => {
  return Object.entries(spellsData)
    .filter(([lvl]) => lvl !== 'cantrips')      // e.g., 'level1','level2',...
    .map(([, pool]) => pool || {})
    .reduce((found, pool) => found || pool[key], null);
};

const ClassMechanicsPanel = ({ characterData, onMechanicsUpdate }) => {
  const [activeMechanics, setActiveMechanics] = useState({})
  const [mechanicUses, setMechanicUses] = useState({})

  // Obtener mecánicas disponibles para la clase y nivel
  const availableMechanics = getAvailableMechanics(characterData.class, characterData.level || 1)

  // Obtener información de conjuros
  const spellInfo = getSpellcastingSummary(characterData.class, characterData.level || 1, 0)

  // Obtener conjuros disponibles para esta clase y nivel
  const availableSpells = getSpellsForClassAndLevel(characterData.class, characterData.level || 1)
  
  // Obtener conjuros conocidos del personaje
  const knownCantrips = characterData.cantrips || []
  const knownSpells = characterData.spells || []
  
  // Obtener número correcto de trucos conocidos según las reglas de D&D 5e
  const maxCantripsKnown = cantripsKnownAt(characterData.class, characterData.level || 1)

  // Función para activar/desactivar una mecánica
  const toggleMechanic = (mechanicKey) => {
    setActiveMechanics(prev => ({
      ...prev,
      [mechanicKey]: !prev[mechanicKey]
    }))
  }

  // Función para usar una mecánica (reducir usos)
  const useMechanic = (mechanicKey, mechanic) => {
    if (mechanic.uses && mechanic.uses[characterData.level]) {
      const currentUses = mechanicUses[mechanicKey] || 0
      const maxUses = mechanic.uses[characterData.level]
      
      if (currentUses < maxUses) {
        setMechanicUses(prev => ({
          ...prev,
          [mechanicKey]: currentUses + 1
        }))
      }
    }
  }

  // Función para recuperar usos (simular descanso)
  const recoverMechanic = (mechanicKey, mechanic) => {
    if (mechanic.uses && mechanic.uses[characterData.level]) {
      setMechanicUses(prev => ({
        ...prev,
        [mechanicKey]: 0
      }))
    }
  }

  // Función para obtener el valor actual de una mecánica
  const getMechanicValue = (mechanic, level) => {
    if (mechanic.uses && mechanic.uses[level]) {
      const used = mechanicUses[mechanic.name] || 0
      const total = mechanic.uses[level]
      return `${total - used}/${total}`
    }
    if (mechanic.damage && mechanic.damage[level]) {
      return mechanic.damage[level]
    }
    if (mechanic.bonus && mechanic.bonus[level]) {
      return `+${mechanic.bonus[level]}`
    }
    if (mechanic.die && mechanic.die[level]) {
      return mechanic.die[level]
    }
    if (mechanic.known && mechanic.known[level]) {
      return mechanic.known[level]
    }
    if (mechanic.maxCR && mechanic.maxCR[level]) {
      return `CR ${mechanic.maxCR[level]}`
    }
    if (mechanic.points) {
      return level
    }
    return null
  }

  // Función para renderizar una mecánica específica
  const renderMechanic = (key, mechanic) => {
    const value = getMechanicValue(mechanic, characterData.level || 1)
    const isActive = activeMechanics[key]
    const used = mechanicUses[mechanic.name] || 0
    const maxUses = mechanic.uses ? mechanic.uses[characterData.level || 1] : null
    const canUse = maxUses ? used < maxUses : true

    return (
      <div key={key} style={{
        backgroundColor: isActive ? '#e3f2fd' : 'white',
        border: `2px solid ${isActive ? '#2196f3' : '#dee2e6'}`,
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        transition: 'all 0.3s ease'
      }}>
        {/* Header de la mecánica */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h4 style={{
            margin: 0,
            color: isActive ? '#1976d2' : '#495057',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {mechanic.name}
          </h4>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {value && (
              <span style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {value}
              </span>
            )}
            
            {mechanic.uses && (
              <button
                onClick={() => recoverMechanic(key, mechanic)}
                style={{
                  backgroundColor: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
                title="Recuperar usos (descanso)"
              >
                🔄
              </button>
            )}
            
            <button
              onClick={() => toggleMechanic(key)}
              style={{
                backgroundColor: isActive ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
              title={isActive ? 'Desactivar' : 'Activar'}
            >
              {isActive ? '⏸️' : '▶️'}
            </button>
          </div>
        </div>

        {/* Descripción */}
        <p style={{
          fontSize: '12px',
          color: '#6c757d',
          marginBottom: '10px',
          lineHeight: '1.4'
        }}>
          {mechanic.description}
        </p>

        {/* Beneficios específicos */}
        {mechanic.benefits && (
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ fontSize: '11px', color: '#495057' }}>Beneficios:</strong>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '5px 0 0 0',
              fontSize: '11px'
            }}>
              {mechanic.benefits.map((benefit, index) => (
                <li key={index} style={{ color: '#6c757d', marginBottom: '2px' }}>
                  • {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Duración */}
        {mechanic.duration && (
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ fontSize: '11px', color: '#495057' }}>Duración:</strong>
            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '5px' }}>
              {mechanic.duration}
            </span>
          </div>
        )}

        {/* Restricciones */}
        {mechanic.restrictions && (
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ fontSize: '11px', color: '#495057' }}>Restricciones:</strong>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '5px 0 0 0',
              fontSize: '11px'
            }}>
              {mechanic.restrictions.map((restriction, index) => (
                <li key={index} style={{ color: '#dc3545', marginBottom: '2px' }}>
                  ⚠️ {restriction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Condiciones */}
        {mechanic.conditions && (
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ fontSize: '11px', color: '#495057' }}>Condiciones:</strong>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '5px 0 0 0',
              fontSize: '11px'
            }}>
              {mechanic.conditions.map((condition, index) => (
                <li key={index} style={{ color: '#6c757d', marginBottom: '2px' }}>
                  • {condition}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botón de uso */}
        {mechanic.uses && canUse && (
          <button
            onClick={() => useMechanic(key, mechanic)}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '11px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Usar {mechanic.name}
          </button>
        )}

        {/* Estado activo */}
        {isActive && (
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '8px',
            marginTop: '10px',
            fontSize: '11px',
            color: '#155724'
          }}>
            ✅ {mechanic.name} está activo
          </div>
        )}
      </div>
    )
  }

  if (Object.keys(availableMechanics).length === 0) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '2px solid #6c757d',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
          No hay mecánicas específicas disponibles para esta clase y nivel.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      border: '2px solid #6f42c1',
      borderRadius: '8px',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <span style={{ fontSize: '20px', marginRight: '10px' }}>⚔️</span>
        <h3 style={{ margin: 0, color: '#495057' }}>
          MECÁNICAS DE {characterData.class?.toUpperCase() || 'CLASE'}
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '15px'
      }}>
        {Object.entries(availableMechanics).map(([key, mechanic]) => 
          renderMechanic(key, mechanic)
        )}
      </div>

             {/* Información adicional */}
       <div style={{
         marginTop: '20px',
         padding: '15px',
         backgroundColor: '#fff3cd',
         border: '1px solid #ffeaa7',
         borderRadius: '6px'
       }}>
         <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#856404' }}>
           💡 Cómo usar las mecánicas:
         </h4>
         <ul style={{
           margin: 0,
           paddingLeft: '20px',
           fontSize: '12px',
           color: '#856404'
         }}>
           <li>▶️ Activa una mecánica para recordar que está en uso</li>
           <li>🔄 Usa el botón de recuperación para simular un descanso</li>
           <li>📊 Los contadores muestran usos restantes</li>
           <li>⚠️ Las restricciones aparecen en rojo</li>
         </ul>
       </div>

       {/* Sección de Conjuros Conocidos */}
       {spellInfo && spellInfo.casterType !== 'none' && (
         <div style={{
           marginTop: '20px',
           padding: '15px',
           backgroundColor: '#e8f5e8',
           border: '1px solid #4caf50',
           borderRadius: '6px'
         }}>
           <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2e7d32' }}>
             📚 Conjuros Conocidos
           </h4>
           
           <div style={{ display: 'flex', gap: '20px' }}>
             {/* Trucos */}
             <div style={{ flex: '1' }}>
                               <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#2e7d32' }}>
                  🎭 Trucos ({knownCantrips.length}/{maxCantripsKnown})
                </h5>
               {knownCantrips.length > 0 ? (
                 <div style={{
                   backgroundColor: 'white',
                   border: '1px solid #c8e6c9',
                   borderRadius: '4px',
                   padding: '8px',
                   maxHeight: '120px',
                   overflowY: 'auto'
                 }}>
                   {knownCantrips.map((cantripKey, index) => {
                     const cantripData = spellsData.cantrips?.[cantripKey]
                     return (
                       <div key={index} style={{
                         padding: '4px 8px',
                         marginBottom: '4px',
                         backgroundColor: '#f1f8e9',
                         borderRadius: '3px',
                         fontSize: '11px'
                       }}>
                         <strong>{cantripData?.name || cantripKey}</strong>
                       </div>
                     )
                   })}
                 </div>
               ) : (
                 <p style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                   No hay trucos conocidos
                 </p>
               )}
             </div>

             {/* Conjuros */}
             <div style={{ flex: '1' }}>
               <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#2e7d32' }}>
                 📖 Conjuros ({knownSpells.length}/{spellInfo.spellsKnown})
               </h5>
               {knownSpells.length > 0 ? (
                 <div style={{
                   backgroundColor: 'white',
                   border: '1px solid #c8e6c9',
                   borderRadius: '4px',
                   padding: '8px',
                   maxHeight: '120px',
                   overflowY: 'auto'
                 }}>
                   {knownSpells.map((spellKey, index) => {
                     // Buscar el conjuro en todos los niveles
                     const spellData = findSpellDataByKey(spellKey)
                     return (
                       <div key={index} style={{
                         padding: '4px 8px',
                         marginBottom: '4px',
                         backgroundColor: '#f1f8e9',
                         borderRadius: '3px',
                         fontSize: '11px'
                       }}>
                         <strong>{spellData?.name || spellKey}</strong>
                       </div>
                     )
                   })}
                 </div>
               ) : (
                 <p style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                   No hay conjuros conocidos
                 </p>
               )}
             </div>
           </div>
         </div>
       )}
    </div>
  )
}

export default ClassMechanicsPanel

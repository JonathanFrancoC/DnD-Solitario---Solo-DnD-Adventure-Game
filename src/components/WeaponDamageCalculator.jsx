import React, { useState, useEffect } from 'react'

const WeaponDamageCalculator = ({ characterData, mechanics, onDamageChange }) => {
  const [selectedWeapon, setSelectedWeapon] = useState('')
  const [baseDamage, setBaseDamage] = useState('')
  const [sneakAttackActive, setSneakAttackActive] = useState(false)
  const [calculatedDamage, setCalculatedDamage] = useState('')

  // Función para detectar automáticamente el arma del personaje
  const detectCharacterWeapon = () => {
    if (!characterData.equipment) return ''
    
    const equipment = characterData.equipment
    const weaponKeywords = {
      'estoque': ['estoque', 'rapier'],
      'espada larga': ['espada larga', 'longsword'],
      'espada corta': ['espada corta', 'shortsword'],
      'daga': ['daga', 'dagger'],
      'arco corto': ['arco corto', 'shortbow'],
      'arco largo': ['arco largo', 'longbow'],
      'ballesta ligera': ['ballesta ligera', 'light crossbow'],
      'ballesta pesada': ['ballesta pesada', 'heavy crossbow'],
      'bastón': ['bastón', 'quarterstaff'],
      'maza': ['maza', 'mace'],
      'cimitarra': ['cimitarra', 'scimitar'],
      'hacha a dos manos': ['hacha a dos manos', 'greataxe'],
      'hachas de mano': ['hachas de mano', 'handaxe'],
      'jabalina': ['jabalina', 'javelin'],
      'dardos': ['dardos', 'dart']
    }
    
    // Buscar en el equipo del personaje
    for (const [weaponKey, keywords] of Object.entries(weaponKeywords)) {
      for (const keyword of keywords) {
        if (equipment.some(item => 
          item.toLowerCase().includes(keyword.toLowerCase())
        )) {
          return weaponKey
        }
      }
    }
    
    return ''
  }

  // Inicializar con el arma del personaje si no hay una seleccionada
  useEffect(() => {
    if (!selectedWeapon && characterData.equipment) {
      const characterWeapon = detectCharacterWeapon()
      if (characterWeapon) {
        setSelectedWeapon(characterWeapon)
        const weaponData = WEAPONS_DB[characterWeapon]
        if (weaponData) {
          const totalDamage = calculateTotalDamage()
          setCalculatedDamage(totalDamage)
          onDamageChange(totalDamage, weaponData.type)
        }
      }
    }
  }, [characterData.equipment])

  // Base de datos de armas comunes
  const WEAPONS_DB = {
    'espada corta': { damage: '1d6', type: 'perforante', finesse: true },
    'espada larga': { damage: '1d8', type: 'cortante', versatile: '1d10' },
    'estoque': { damage: '1d8', type: 'perforante', finesse: true },
    'espada de dos manos': { damage: '2d6', type: 'cortante', heavy: true },
    'hacha de batalla': { damage: '1d8', type: 'cortante', versatile: '1d10' },
    'martillo de guerra': { damage: '1d8', type: 'contundente', versatile: '1d10' },
    'lanza': { damage: '1d6', type: 'perforante', thrown: true },
    'daga': { damage: '1d4', type: 'perforante', finesse: true, light: true, thrown: true },
    'arco corto': { damage: '1d6', type: 'perforante', ranged: true, ammunition: true },
    'arco largo': { damage: '1d8', type: 'perforante', ranged: true, ammunition: true, heavy: true },
    'ballesta ligera': { damage: '1d8', type: 'perforante', ranged: true, ammunition: true, loading: true },
    'ballesta pesada': { damage: '1d10', type: 'perforante', ranged: true, ammunition: true, loading: true, heavy: true },
    'bastón': { damage: '1d6', type: 'contundente', versatile: '1d8' },
    'maza': { damage: '1d6', type: 'contundente' },
    'espada ancha': { damage: '1d6', type: 'cortante', finesse: true, light: true },
    'cimitarra': { damage: '1d6', type: 'cortante', finesse: true, light: true },
    'hacha a dos manos': { damage: '1d12', type: 'cortante', heavy: true },
    'hachas de mano': { damage: '1d6', type: 'cortante', light: true, thrown: true },
    'jabalina': { damage: '1d6', type: 'perforante', thrown: true },
    'dardos': { damage: '1d4', type: 'perforante', ranged: true, ammunition: true, thrown: true }
  }

  // Obtener el modificador de fuerza o destreza según el arma
  const getAbilityModifier = (weapon) => {
    if (!weapon) return 0
    
    const weaponData = WEAPONS_DB[weapon]
    if (!weaponData) return 0

    // Si es un arma de precisión (finesse) o a distancia, usar destreza
    if (weaponData.finesse || weaponData.ranged) {
      return Math.floor((characterData.abilityScores?.dexterity || 10) - 10) / 2
    }
    
    // Si no, usar fuerza
    return Math.floor((characterData.abilityScores?.strength || 10) - 10) / 2
  }

  // Obtener el daño furtivo si está disponible
  const getSneakAttackDamage = () => {
    if (!sneakAttackActive || characterData.class !== 'picaro') return ''
    
    const level = characterData.level || 1
    const sneakAttackDice = {
      1: '1d6', 2: '1d6', 3: '2d6', 4: '2d6', 5: '3d6', 6: '3d6', 7: '4d6', 8: '4d6', 9: '5d6', 10: '5d6',
      11: '6d6', 12: '6d6', 13: '7d6', 14: '7d6', 15: '8d6', 16: '8d6', 17: '9d6', 18: '9d6', 19: '10d6', 20: '10d6'
    }
    
    return sneakAttackDice[level] || '1d6'
  }

  // Calcular el daño total
  const calculateTotalDamage = () => {
    if (!selectedWeapon && !baseDamage) return ''

    let totalDamage = ''
    const abilityMod = getAbilityModifier(selectedWeapon)
    
    if (selectedWeapon) {
      const weaponData = WEAPONS_DB[selectedWeapon]
      if (weaponData) {
        totalDamage = weaponData.damage
        if (abilityMod > 0) {
          totalDamage += ` + ${abilityMod}`
        } else if (abilityMod < 0) {
          totalDamage += ` ${abilityMod}`
        }
      }
    } else {
      totalDamage = baseDamage
      if (abilityMod > 0) {
        totalDamage += ` + ${abilityMod}`
      } else if (abilityMod < 0) {
        totalDamage += ` ${abilityMod}`
      }
    }

    // Agregar daño furtivo si está activo
    const sneakDamage = getSneakAttackDamage()
    if (sneakDamage) {
      totalDamage += ` + ${sneakDamage}`
    }

    return totalDamage
  }

  // Manejar cambios en el arma seleccionada
  const handleWeaponChange = (weapon) => {
    setSelectedWeapon(weapon)
    if (weapon) {
      setBaseDamage('')
      const weaponData = WEAPONS_DB[weapon]
      if (weaponData) {
        const totalDamage = calculateTotalDamage()
        setCalculatedDamage(totalDamage)
        onDamageChange(totalDamage, weaponData.type)
      }
    }
  }

  // Manejar cambios en el daño base
  const handleBaseDamageChange = (damage) => {
    setBaseDamage(damage)
    setSelectedWeapon('')
    const totalDamage = calculateTotalDamage()
    setCalculatedDamage(totalDamage)
    onDamageChange(totalDamage, 'personalizado')
  }

  // Manejar cambios en el daño furtivo
  const handleSneakAttackToggle = () => {
    const newSneakAttackActive = !sneakAttackActive
    setSneakAttackActive(newSneakAttackActive)
    
    // Actualizar el estado de mecánicas
    if (mechanics && mechanics.sneakAttack) {
      const updatedMechanics = {
        ...mechanics,
        sneakAttack: {
          ...mechanics.sneakAttack,
          isActive: newSneakAttackActive
        }
      }
      onDamageChange(calculatedDamage, selectedWeapon ? WEAPONS_DB[selectedWeapon]?.type : 'personalizado', updatedMechanics)
    }
    
    const totalDamage = calculateTotalDamage()
    setCalculatedDamage(totalDamage)
  }

  // Verificar si el daño furtivo está disponible
  const canUseSneakAttack = characterData.class === 'picaro' && mechanics?.sneakAttack

  return (
    <div style={{
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#e3f2fd',
      border: '2px solid #2196f3',
      borderRadius: '8px'
    }}>
      <h3 style={{
        margin: '0 0 15px 0',
        fontSize: '16px',
        color: '#1565c0',
        textAlign: 'center'
      }}>
        ⚔️ Calculadora de Daño
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px'
      }}>
        {/* Selección de arma */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #bbdefb',
          borderRadius: '6px',
          padding: '12px'
        }}>
                     <h4 style={{
             margin: '0 0 10px 0',
             fontSize: '14px',
             color: '#1565c0',
             fontWeight: 'bold'
           }}>
             🗡️ Seleccionar Arma
             {selectedWeapon && detectCharacterWeapon() === selectedWeapon && (
               <span style={{
                 fontSize: '11px',
                 color: '#4caf50',
                 marginLeft: '8px',
                 fontStyle: 'italic'
               }}>
                 (Arma del personaje)
               </span>
             )}
           </h4>
          
          <select
            value={selectedWeapon}
            onChange={(e) => handleWeaponChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px'
            }}
          >
            <option value="">-- Seleccionar arma --</option>
            {Object.keys(WEAPONS_DB).map(weapon => (
              <option key={weapon} value={weapon}>
                {weapon} ({WEAPONS_DB[weapon].damage} {WEAPONS_DB[weapon].type})
              </option>
            ))}
          </select>

          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '12px', color: '#666' }}>
              O ingresar daño personalizado:
            </label>
            <input
              type="text"
              value={baseDamage}
              onChange={(e) => handleBaseDamageChange(e.target.value)}
              placeholder="ej: 1d8, 2d6+1"
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '12px',
                marginTop: '4px'
              }}
            />
          </div>
        </div>

        {/* Daño furtivo */}
        {canUseSneakAttack && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #bbdefb',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#1565c0',
              fontWeight: 'bold'
            }}>
              🎯 Daño Furtivo
            </h4>
            
            <button
              onClick={handleSneakAttackToggle}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: sneakAttackActive ? '#4caf50' : '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {sneakAttackActive ? '🎯 Daño Furtivo ACTIVO' : '🎯 Activar Daño Furtivo'}
            </button>
            
            {sneakAttackActive && (
              <div style={{
                marginTop: '8px',
                fontSize: '11px',
                color: '#4caf50',
                fontStyle: 'italic'
              }}>
                Daño adicional: {getSneakAttackDamage()}
              </div>
            )}
          </div>
        )}

        {/* Resultado del daño */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #bbdefb',
          borderRadius: '6px',
          padding: '12px'
        }}>
          <h4 style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            color: '#1565c0',
            fontWeight: 'bold'
          }}>
            📊 Daño Total
          </h4>
          
          <div style={{
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: calculatedDamage ? '#1565c0' : '#999'
          }}>
            {calculatedDamage || 'Selecciona un arma o ingresa daño'}
          </div>
          
          {selectedWeapon && WEAPONS_DB[selectedWeapon] && (
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#666'
            }}>
              Tipo: {WEAPONS_DB[selectedWeapon].type}
              {WEAPONS_DB[selectedWeapon].finesse && ' (Precisión)'}
              {WEAPONS_DB[selectedWeapon].ranged && ' (A distancia)'}
              {WEAPONS_DB[selectedWeapon].thrown && ' (Arrojadiza)'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WeaponDamageCalculator

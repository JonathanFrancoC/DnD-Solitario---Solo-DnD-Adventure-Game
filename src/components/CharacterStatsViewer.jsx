import React, { useState, useEffect } from 'react'
import { X, User, Heart, Shield, Sword, Zap, ArrowLeft, Users as UsersIcon } from 'lucide-react'
import gameSaveService from '../utils/gameSaveService'

const CharacterStatsViewer = ({ onClose, campaignId, mainCharacter }) => {
  const [companions, setCompanions] = useState([])
  const [villains, setVillains] = useState([])
  const [campaignMainCharacter, setCampaignMainCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'detail'

  useEffect(() => {
    loadCharacters()
  }, [campaignId])

  const loadCharacters = async () => {
    try {
      setLoading(true)
      const [companionsData, villainsData, mainCharData] = await Promise.all([
        gameSaveService.loadCompanions(campaignId),
        gameSaveService.loadVillains(campaignId),
        gameSaveService.loadMainCharacter(campaignId)
      ])
      setCompanions(companionsData)
      setVillains(villainsData)
      setCampaignMainCharacter(mainCharData)
    } catch (error) {
      console.error('Error cargando personajes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular modificadores de características
  const getAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2)
  }

  // Función para obtener el color de la vida
  const getHealthColor = (current, max) => {
    const percentage = (current / max) * 100
    if (percentage > 60) return '#4CAF50'
    if (percentage > 25) return '#FF9800'
    return '#f44336'
  }

  const renderCharacterCard = (character, type) => (
    <div
      key={character.id}
      onClick={() => {
        setSelectedCharacter(character)
        setViewMode('detail')
      }}
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid #3498db',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.target.style.background = 'rgba(52, 152, 219, 0.2)'
        e.target.style.transform = 'scale(1.02)'
      }}
      onMouseOut={(e) => {
        e.target.style.background = 'rgba(0,0,0,0.3)'
        e.target.style.transform = 'scale(1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        {type === 'main' ? <User size={16} color="#3498db" /> : 
         type === 'companion' ? <UsersIcon size={16} color="#27ae60" /> : 
         <Sword size={16} color="#e74c3c" />}
        <h3 style={{ margin: 0, fontSize: '16px', color: '#ecf0f1' }}>
          {character.name}
        </h3>
      </div>
      <div style={{ fontSize: '14px', color: '#bdc3c7' }}>
        Nivel {character.level} {character.class} • {character.race}
      </div>
      <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
        {character.alignment} • {character.background}
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        marginTop: '8px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Heart size={14} color="#e74c3c" />
          <span style={{ color: '#ecf0f1' }}>
            {character.currentHP || character.maxHP || 0}/{character.maxHP || 0}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Shield size={14} color="#f39c12" />
          <span style={{ color: '#ecf0f1' }}>
            CA {character.armorClass || 10}
          </span>
        </div>
      </div>
      {/* Estado de vida/muerte */}
      {character.status && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px', 
          marginTop: '8px',
          fontSize: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: character.status.alive ? '#27ae60' : '#e74c3c'
          }} />
          <span style={{ 
            color: character.status.alive ? '#27ae60' : '#e74c3c',
            fontWeight: 'bold'
          }}>
            {character.status.alive ? 'VIVO' : 'MUERTO'}
          </span>
        </div>
      )}
    </div>
  )

  const renderCharacterDetail = (character, type) => (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid #3498db',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      {/* Header del personaje */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(52, 152, 219, 0.2)',
        borderRadius: '10px',
        border: '1px solid #3498db'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '5px' }}>
          {type === 'main' ? <User size={20} color="#3498db" /> : 
           type === 'companion' ? <UsersIcon size={20} color="#27ae60" /> : 
           <Sword size={20} color="#e74c3c" />}
          <h2 style={{ margin: 0, fontSize: '20px', color: '#3498db' }}>
            {character.name}
          </h2>
        </div>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#bdc3c7' }}>
          Nivel {character.level} {character.class}
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#95a5a6' }}>
          {character.race} • {character.alignment} • {character.background}
        </p>
        {/* Estado de vida/muerte en vista detallada */}
        {character.status && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px', 
            marginTop: '10px',
            padding: '8px 15px',
            background: character.status.alive ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)',
            borderRadius: '20px',
            border: `1px solid ${character.status.alive ? '#27ae60' : '#e74c3c'}`
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: character.status.alive ? '#27ae60' : '#e74c3c'
            }} />
            <span style={{ 
              color: character.status.alive ? '#27ae60' : '#e74c3c',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {character.status.alive ? 'VIVO' : 'MUERTO'}
            </span>
          </div>
        )}
      </div>

      {/* Vida */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '10px',
        border: '1px solid #e74c3c'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={16} />
          Puntos de Vida
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '14px' }}>Vida Actual</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {character.currentHP || 0} / {character.maxHP || 0}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '20px',
          background: '#2c3e50',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid #34495e'
        }}>
          <div style={{
            width: `${Math.min(100, ((character.currentHP || 0) / (character.maxHP || 1)) * 100)}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${getHealthColor(character.currentHP || 0, character.maxHP || 1)} 0%, ${getHealthColor(character.currentHP || 0, character.maxHP || 1)}80 100%)`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Características */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '10px',
        border: '1px solid #f39c12'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#f39c12' }}>
          Características
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { name: 'FUE', value: character.strength || 10, abbr: 'FUE' },
            { name: 'DES', value: character.dexterity || 10, abbr: 'DES' },
            { name: 'CON', value: character.constitution || 10, abbr: 'CON' },
            { name: 'INT', value: character.intelligence || 10, abbr: 'INT' },
            { name: 'SAB', value: character.wisdom || 10, abbr: 'SAB' },
            { name: 'CAR', value: character.charisma || 10, abbr: 'CAR' }
          ].map(ability => (
            <div key={ability.abbr} style={{
              textAlign: 'center',
              padding: '8px',
              background: 'rgba(52, 152, 219, 0.1)',
              borderRadius: '8px',
              border: '1px solid #3498db'
            }}>
              <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '2px' }}>
                {ability.name}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3498db' }}>
                {ability.value}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: getAbilityModifier(ability.value) >= 0 ? '#27ae60' : '#e74c3c',
                fontWeight: 'bold'
              }}>
                {getAbilityModifier(ability.value) >= 0 ? '+' : ''}{getAbilityModifier(ability.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combate */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '10px',
        border: '1px solid #e74c3c'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sword size={16} />
          Combate
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>
              Clase de Armadura
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#3498db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}>
              <Shield size={20} />
              {character.armorClass || 10}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>
              Iniciativa
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: character.initiative >= 0 ? '#27ae60' : '#e74c3c'
            }}>
              {character.initiative >= 0 ? '+' : ''}{character.initiative || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div style={{
        padding: '15px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '10px',
        border: '1px solid #27ae60'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#27ae60' }}>
          Información
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
            <strong>Velocidad:</strong> {character.speed || 30} pies
          </div>
          <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
            <strong>Dados de Golpe:</strong> {character.hitDice || '1d8'}
          </div>
          <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
            <strong>Bonificación de Competencia:</strong> +{character.proficiencyBonus || 2}
          </div>
          {character.passivePerception && (
            <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
              <strong>Percepción Pasiva:</strong> {character.passivePerception}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Cargando personajes...</div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        borderRadius: '15px',
        border: '2px solid #3498db',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(0,0,0,0.5)',
          padding: '20px',
          borderBottom: '2px solid #3498db',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {viewMode === 'detail' && (
              <button
                onClick={() => {
                  setViewMode('list')
                  setSelectedCharacter(null)
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h1 style={{ margin: 0, fontSize: '24px', color: '#3498db' }}>
              {viewMode === 'detail' ? selectedCharacter?.name : 'Estadísticas de Personajes'}
            </h1>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>
          {viewMode === 'list' ? (
            <div>
              {/* Personaje Principal */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ 
                  margin: '0 0 15px 0', 
                  fontSize: '18px', 
                  color: '#3498db',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <User size={20} />
                  Personaje Principal
                </h2>
                {campaignMainCharacter ? renderCharacterCard(campaignMainCharacter, 'main') : 
                 mainCharacter ? renderCharacterCard(mainCharacter, 'main') : (
                  <div style={{ 
                    padding: '15px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '10px',
                    color: '#95a5a6',
                    fontStyle: 'italic'
                  }}>
                    No hay personaje principal cargado
                  </div>
                )}
              </div>

              {/* Compañeros */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ 
                  margin: '0 0 15px 0', 
                  fontSize: '18px', 
                  color: '#27ae60',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <UsersIcon size={20} />
                  Compañeros ({companions.length})
                </h2>
                {companions.length > 0 ? (
                  companions.map(companion => renderCharacterCard(companion, 'companion'))
                ) : (
                  <div style={{ 
                    padding: '15px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '10px',
                    color: '#95a5a6',
                    fontStyle: 'italic'
                  }}>
                    No hay compañeros en esta campaña
                  </div>
                )}
              </div>

              {/* Villanos */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ 
                  margin: '0 0 15px 0', 
                  fontSize: '18px', 
                  color: '#e74c3c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sword size={20} />
                  Villanos ({villains.length})
                </h2>
                {villains.length > 0 ? (
                  villains.map(villain => renderCharacterCard(villain, 'villain'))
                ) : (
                  <div style={{ 
                    padding: '15px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '10px',
                    color: '#95a5a6',
                    fontStyle: 'italic'
                  }}>
                    No hay villanos en esta campaña
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {selectedCharacter && renderCharacterDetail(selectedCharacter, 
                selectedCharacter === campaignMainCharacter || selectedCharacter === mainCharacter ? 'main' : 
                companions.some(c => c.id === selectedCharacter.id) ? 'companion' : 'villain'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CharacterStatsViewer

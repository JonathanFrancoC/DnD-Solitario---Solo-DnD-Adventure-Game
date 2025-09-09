import React, { useState, useRef, useEffect } from 'react'
import { Send, Save, FolderOpen, Settings, Home, MessageCircle, X, ChevronLeft, ChevronRight, User, Heart, Shield, Sword, Zap, Users as UsersIcon } from 'lucide-react'
import { sendMessageToDM, sendMessageToAssistant } from '../utils/aiService'
import { useTranslation } from '../contexts/LanguageContext'
import gameSaveService from '../utils/gameSaveService'
import ActionBar from './ActionBar.jsx'
import { createInitialTurnState, generateAISuggestions, exportStateForAI } from '../utils/turnManager.js'

const GameArea = ({ gameState, updateGameState, onBackToMenu, onShowCharacterSheet, onViewCharacterStats, campaignId = null, gameOptions = {} }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(gameState?.messages || [])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sideChatOpen, setSideChatOpen] = useState(false)
  const [sideChatMessages, setSideChatMessages] = useState([])
  const [sideChatInput, setSideChatInput] = useState('')
  const [isSideChatLoading, setIsSideChatLoading] = useState(false)
  const [characterPanelOpen, setCharacterPanelOpen] = useState(false)
  const [actionButtons, setActionButtons] = useState({
    shortRest: { enabled: false, used: false },
    longRest: { enabled: false, used: false },
    levelUp: { enabled: false, used: false }
  })
  const character = gameState?.character
  const [turnState, setTurnState] = useState(() => createInitialTurnState(character))
  const [aiSuggestions, setAiSuggestions] = useState([])
  const messagesEndRef = useRef(null)
  const sideChatEndRef = useRef(null)

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

  // Función para obtener el color de la vida temporal
  const getTempHealthColor = () => {
    return '#9C27B0'
  }

  // Función para obtener el color de la inspiración
  const getInspirationColor = () => {
    return character?.inspiration ? '#FFD700' : '#ccc'
  }

  // Función para obtener el color de la armadura
  const getArmorClassColor = () => {
    const ac = character?.armorClass || 10
    if (ac >= 18) return '#4CAF50'
    if (ac >= 15) return '#FF9800'
    return '#f44336'
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollSideChatToBottom = () => {
    sideChatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    scrollSideChatToBottom()
  }, [sideChatMessages])

  // Auto-save cuando el estado del juego cambia
  useEffect(() => {
    if (campaignId && gameState && character) {
      const autoSave = async () => {
        try {
          // Guardar entrada en la bitácora diaria si hay cambios significativos
          if (gameState.messages && gameState.messages.length > 0) {
            const lastMessage = gameState.messages[gameState.messages.length - 1];
            if (lastMessage.role === 'assistant') {
              await gameSaveService.saveDailyLogEntry({
                type: 'game_progress',
                description: 'Progreso en la partida',
                message_preview: lastMessage.content.substring(0, 100) + '...',
                character_state: {
                  hp: character?.currentHP,
                  level: character?.level,
                  location: gameState?.world?.currentLocation
                }
              });
            }
          }
        } catch (error) {
          console.error('Error en auto-save:', error);
        }
      };

      // Auto-save cada 5 minutos
      const interval = setInterval(autoSave, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [campaignId, gameState, character])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    console.log('ENVIANDO MENSAJE A IA:'); // Sending message to AI
    console.log('   Mensaje:', inputMessage); // Message
    console.log('   Campaign ID:', campaignId); // Campaign ID
    console.log('   Game State:', gameState); // Game State
    console.log('   Personaje:', gameState?.character?.name); // Character

    const userMessage = {
      role: 'user',
      content: inputMessage,
        timestamp: new Date().toISOString()
      }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await sendMessageToDM(inputMessage, gameState, campaignId, gameOptions)
      
      const dmMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, dmMessage])

      // Detectar si la IA aprueba alguna acción
      detectActionApproval(response)
      
      // Actualizar el estado del juego con la nueva información
      const updatedGameState = {
        ...gameState,
        messages: [...messages, userMessage, dmMessage],
        lastUpdate: new Date().toISOString()
      }

      updateGameState(updatedGameState)
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      const errorMessage = {
        role: 'system',
        content: 'Error al comunicarse con el DM. Por favor, verifica tu conexión y API key.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar acciones del ActionBar
  const handleActionBarSend = async (actionData) => {
    if (isLoading) return

    const { intent, selectedActions, state } = actionData
    
    // Crear mensaje combinando intención y acciones
    const actionDescription = selectedActions.length > 0 
      ? `\n\nAcciones seleccionadas:\n${selectedActions.map(a => `- ${a.label}`).join('\n')}`
      : ''
    
    const fullMessage = intent + actionDescription

    const userMessage = {
      role: 'user',
      content: fullMessage,
      timestamp: new Date().toISOString(),
      actionData: actionData // Incluir datos estructurados para la IA
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Enviar a la IA con datos estructurados
      const response = await sendMessageToDM(fullMessage, gameState, campaignId, {
        ...gameOptions,
        turnState: state,
        selectedActions: selectedActions
      })
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Detectar aprobación de acciones especiales
      detectActionApproval(response)

      // Actualizar estado del juego
      const updatedGameState = {
        ...gameState,
        messages: [...messages, userMessage, assistantMessage],
        lastUpdated: new Date().toISOString()
      }
      
      updateGameState(updatedGameState)

      // Generar nuevas sugerencias de IA
      const newSuggestions = generateAISuggestions(character, turnState, {
        inCombat: gameState?.inCombat || false,
        exploring: gameState?.exploring || false,
        lastMessage: response
      })
      setAiSuggestions(newSuggestions)
      
      // Auto-save
      if (campaignId) {
        try {
          await gameSaveService.saveFullGameState(updatedGameState, character)
    } catch (error) {
          console.error('Error guardando estado del juego:', error)
        }
      }
      
    } catch (error) {
      console.error('Error enviando acción:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Lo siento, hubo un error procesando tu acción. Por favor, intenta de nuevo.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Función para actualizar el estado del turno y personaje
  const handleTurnStateChange = (newCharacter) => {
    // Si es un personaje actualizado, actualizar el estado del juego
    if (newCharacter && newCharacter.mechanics) {
      const updatedGameState = {
        ...gameState,
        character: newCharacter
      }
      updateGameState(updatedGameState)
    } else {
      // Si es solo el estado del turno
      setTurnState(newCharacter)
    }
  }

  const handleSideChatMessage = async () => {
    if (!sideChatInput.trim() || isSideChatLoading) return

    const userMessage = {
      role: 'user',
      content: sideChatInput,
      timestamp: new Date().toISOString()
    }

    setSideChatMessages(prev => [...prev, userMessage])
    setSideChatInput('')
    setIsSideChatLoading(true)

    try {
      const response = await sendMessageToAssistant(sideChatInput, gameState, campaignId, gameOptions)
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      setSideChatMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error al enviar mensaje al asistente:', error)
      const errorMessage = {
        role: 'system',
        content: 'Error al comunicarse con el asistente. Por favor, verifica tu conexión y API key.',
        timestamp: new Date().toISOString()
      }
      setSideChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSideChatLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSideChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSideChatMessage()
    }
  }

  // Función para detectar si la IA aprueba una acción
  const detectActionApproval = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Detectar aprobación de descanso corto
    if (lowerMessage.includes('descanso corto') && 
        (lowerMessage.includes('puedes') || lowerMessage.includes('puede') || lowerMessage.includes('aprobado') || lowerMessage.includes('aceptado'))) {
      setActionButtons(prev => ({
        ...prev,
        shortRest: { enabled: true, used: false }
      }));
    }
    
    // Detectar aprobación de descanso largo
    if (lowerMessage.includes('descanso largo') && 
        (lowerMessage.includes('puedes') || lowerMessage.includes('puede') || lowerMessage.includes('aprobado') || lowerMessage.includes('aceptado'))) {
      setActionButtons(prev => ({
        ...prev,
        longRest: { enabled: true, used: false }
      }));
    }
    
    // Detectar aprobación de subir de nivel
    if ((lowerMessage.includes('subir de nivel') || lowerMessage.includes('subir nivel') || lowerMessage.includes('nivel superior')) && 
        (lowerMessage.includes('puedes') || lowerMessage.includes('puede') || lowerMessage.includes('aprobado') || lowerMessage.includes('aceptado'))) {
      setActionButtons(prev => ({
        ...prev,
        levelUp: { enabled: true, used: false }
      }));
    }
  }

  // Función para manejar descanso corto
  const handleShortRest = () => {
    if (!actionButtons.shortRest.enabled || actionButtons.shortRest.used) return;
    
    // Restaurar algunos recursos (dados de golpe, algunas habilidades)
    const updatedCharacter = {
      ...character,
      currentHP: Math.min(character.maxHP, character.currentHP + Math.floor(character.maxHP * 0.25)),
      // Restaurar algunos usos de habilidades de clase
      mechanics: {
        ...character.mechanics,
        // Para bardo, restaurar inspiración bárdica
        ...(character.class === 'bardo' && {
          bardicInspiration: {
            ...character.mechanics?.bardicInspiration,
            currentUses: 0 // Resetear usos
          }
        })
      }
    };
    
    // Actualizar estado del juego
    const updatedGameState = {
      ...gameState,
      character: updatedCharacter,
      messages: [...messages, {
        role: 'system',
        content: 'Has tomado un descanso corto. Has recuperado algunos puntos de vida y recursos.',
        timestamp: new Date().toISOString()
      }]
    };
    
    updateGameState(updatedGameState);
    
    // Marcar como usado
    setActionButtons(prev => ({
      ...prev,
      shortRest: { enabled: false, used: true }
    }));
    
    // Mostrar notificación
    showNotification('Descanso corto completado', '#27ae60');
  }

  // Función para manejar descanso largo
  const handleLongRest = () => {
    if (!actionButtons.longRest.enabled || actionButtons.longRest.used) return;
    
    // Restaurar todos los recursos
    const updatedCharacter = {
      ...character,
      currentHP: character.maxHP,
      tempHP: 0,
      inspiration: true,
      // Restaurar todas las habilidades de clase
      mechanics: {
        ...character.mechanics,
        // Para bardo, restaurar inspiración bárdica
        ...(character.class === 'bardo' && {
          bardicInspiration: {
            ...character.mechanics?.bardicInspiration,
            currentUses: 0 // Resetear usos
          }
        })
      }
    };
    
    // Actualizar estado del juego
    const updatedGameState = {
      ...gameState,
      character: updatedCharacter,
      messages: [...messages, {
        role: 'system',
        content: 'Has tomado un descanso largo. Has recuperado todos tus puntos de vida y recursos.',
        timestamp: new Date().toISOString()
      }]
    };
    
    updateGameState(updatedGameState);
    
    // Marcar como usado
    setActionButtons(prev => ({
      ...prev,
      longRest: { enabled: false, used: true }
    }));
    
    // Mostrar notificación
    showNotification('Descanso largo completado', '#27ae60');
  }

  // Función para manejar subir de nivel
  const handleLevelUp = () => {
    if (!actionButtons.levelUp.enabled || actionButtons.levelUp.used) return;
    
    // Aquí podrías abrir un modal o navegar a la pantalla de subida de nivel
    // Por ahora, solo incrementar el nivel
    const newLevel = character.level + 1;
    const updatedCharacter = {
      ...character,
      level: newLevel,
      maxHP: character.maxHP + Math.floor(Math.random() * 8) + 1 + Math.floor((character.constitution - 10) / 2),
      currentHP: character.maxHP, // Restaurar vida al subir de nivel
      proficiencyBonus: Math.floor((newLevel - 1) / 4) + 2
    };
    
    // Actualizar estado del juego
    const updatedGameState = {
      ...gameState,
      character: updatedCharacter,
      messages: [...messages, {
        role: 'system',
        content: `¡Felicidades! Has subido al nivel ${newLevel}.`,
        timestamp: new Date().toISOString()
      }]
    };
    
    updateGameState(updatedGameState);
    
    // Marcar como usado
    setActionButtons(prev => ({
      ...prev,
      levelUp: { enabled: false, used: true }
    }));
    
    // Mostrar notificación
    showNotification(`¡Subiste al nivel ${newLevel}!`, '#f39c12');
  }

  // Función para mostrar notificaciones
  const showNotification = (message, color) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-weight: bold;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  const handleSaveGame = async () => {
    try {
      if (!campaignId) {
        console.log('No hay campaña activa para guardar');
        return;
      }

      // Guardar entrada en la bitácora de sesión
      await gameSaveService.saveSessionLogEntry({
        type: 'game_save',
        description: 'Guardado automático de la partida',
        character_state: {
          hp: character?.currentHP,
          level: character?.level,
          location: gameState?.world?.currentLocation
        }
      });

      // Guardar el estado completo del juego
      const success = await gameSaveService.saveFullGameState(
        gameState,
        character,
        gameState?.companions || [],
        gameState?.villains || []
      );

      if (success) {
        console.log('Partida guardada exitosamente');
        showNotification('Partida guardada', '#4CAF50');
      } else {
        console.error('Error al guardar la partida');
      }
    } catch (error) {
      console.error('Error en handleSaveGame:', error);
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Panel lateral izquierdo - Datos del personaje */}
      <div style={{
        position: 'fixed',
        left: characterPanelOpen ? '0' : '-350px',
        top: '0',
        width: '350px',
        height: '100vh',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        borderRight: '2px solid #3498db',
        transition: 'left 0.3s ease',
        zIndex: 1000,
        overflowY: 'auto',
        boxShadow: characterPanelOpen ? '2px 0 10px rgba(0,0,0,0.3)' : 'none'
      }}>
        {/* Botón para cerrar el panel */}
        <button
          onClick={() => setCharacterPanelOpen(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
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

        {/* Contenido del panel del personaje */}
        <div style={{ padding: '20px' }}>
          {/* Header del personaje */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '15px',
            background: 'rgba(52, 152, 219, 0.2)',
            borderRadius: '10px',
            border: '1px solid #3498db'
          }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#3498db' }}>
              {character?.name || 'Sin nombre'}
            </h2>
            <p style={{ margin: '0', fontSize: '14px', color: '#bdc3c7' }}>
              Nivel {character?.level || 1} {character?.class || 'Sin clase'}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#95a5a6' }}>
              {character?.race || 'Sin raza'} • {character?.alignment || 'Sin alineamiento'}
            </p>
            </div>

          {/* Vida y puntos temporales */}
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
            
            {/* Barra de vida principal */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '14px' }}>Vida Actual</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {character?.currentHP || 0} / {character?.maxHP || 0}
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
                  width: `${Math.min(100, ((character?.currentHP || 0) / (character?.maxHP || 1)) * 100)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${getHealthColor(character?.currentHP || 0, character?.maxHP || 1)} 0%, ${getHealthColor(character?.currentHP || 0, character?.maxHP || 1)}80 100%)`,
                  transition: 'width 0.3s ease'
                }} />
          </div>
        </div>
        
            {/* Puntos de vida temporales */}
            {character?.tempHP > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '14px' }}>Vida Temporal</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: getTempHealthColor() }}>
                    {character.tempHP}
            </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '15px',
                  background: '#2c3e50',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #34495e'
                }}>
                  <div style={{
                    width: `${Math.min(100, (character.tempHP / (character.maxHP || 1)) * 100)}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${getTempHealthColor()} 0%, ${getTempHealthColor()}80 100%)`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Características principales */}
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
                { name: 'FUE', value: character?.strength || 10, abbr: 'FUE' },
                { name: 'DES', value: character?.dexterity || 10, abbr: 'DES' },
                { name: 'CON', value: character?.constitution || 10, abbr: 'CON' },
                { name: 'INT', value: character?.intelligence || 10, abbr: 'INT' },
                { name: 'SAB', value: character?.wisdom || 10, abbr: 'SAB' },
                { name: 'CAR', value: character?.charisma || 10, abbr: 'CAR' }
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
              {/* Clase de Armadura */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>
                  Clase de Armadura
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: getArmorClassColor(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}>
                  <Shield size={20} />
                  {character?.armorClass || 10}
                </div>
              </div>

              {/* Iniciativa */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '5px' }}>
                  Iniciativa
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: character?.initiative >= 0 ? '#27ae60' : '#e74c3c'
                }}>
                  {character?.initiative >= 0 ? '+' : ''}{character?.initiative || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Inspiración */}
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            border: `1px solid ${getInspirationColor()}`
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: getInspirationColor(), display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} />
              Inspiración
            </h3>
            <div style={{
              width: '100%',
              height: '30px',
              background: character?.inspiration ? getInspirationColor() : '#2c3e50',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: character?.inspiration ? '#000' : '#95a5a6',
              border: `2px solid ${getInspirationColor()}`,
              transition: 'all 0.3s ease'
            }}>
              {character?.inspiration ? '✨ INSPIRADO' : 'Sin inspiración'}
            </div>
          </div>

          {/* Equipo */}
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            border: '1px solid #9b59b6'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#9b59b6' }}>
              Equipo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {character?.armor && (
                <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
                  <strong>Armadura:</strong> {character.armor}
                </div>
              )}
              {character?.shield && (
                <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
                  <strong>Escudo:</strong> {character.shield}
                </div>
              )}
              {character?.weapon1 && (
                <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
                  <strong>Arma 1:</strong> {character.weapon1}
                </div>
              )}
              {character?.weapon2 && (
                <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
                  <strong>Arma 2:</strong> {character.weapon2}
                </div>
              )}
              {!character?.armor && !character?.shield && !character?.weapon1 && !character?.weapon2 && (
                <div style={{ fontSize: '14px', color: '#95a5a6', fontStyle: 'italic' }}>
                  Sin equipo equipado
                </div>
              )}
            </div>
          </div>

          {/* Mecánicas de Clase */}
          {character?.class === 'bardo' && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              border: '1px solid #FFD700'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#FFD700' }}>
                🎵 Inspiración Bárdica
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
                  <strong>Usos restantes:</strong> {character?.mechanics?.bardicInspiration?.maxUses - (character?.mechanics?.bardicInspiration?.currentUses || 0) || 0} / {character?.mechanics?.bardicInspiration?.maxUses || (character?.level >= 5 ? 3 : 2)}
                </div>
                <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
                  <strong>Dado:</strong> {character?.level >= 5 ? 'd8' : 'd6'}
                </div>
                <div style={{ fontSize: '12px', color: '#95a5a6', fontStyle: 'italic' }}>
                  Se recupera con descanso largo
                </div>
              </div>
            </div>
          )}

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
                <strong>Velocidad:</strong> {character?.speed || 30} pies
              </div>
              <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
                <strong>Dados de Golpe:</strong> {character?.hitDice || '1d8'}
              </div>
              <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
                <strong>Bonificación de Competencia:</strong> +{character?.proficiencyBonus || 2}
              </div>
              <div style={{ fontSize: '14px', color: '#ecf0f1' }}>
                <strong>Percepción Pasiva:</strong> {character?.passivePerception || 10}
              </div>
            </div>
          </div>

          {/* Espacios de Conjuros */}
          {character?.spellSlots && Object.keys(character.spellSlots).length > 0 && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              border: '1px solid #e91e63'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#e91e63', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} />
                Espacios de Conjuros
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(character.spellSlots)
                  .filter(([level, slot]) => slot.total > 0)
                  .map(([level, slot]) => (
                    <div key={level} style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                                             <div style={{ 
                         fontSize: '14px', 
                         color: '#ecf0f1',
                         fontWeight: 'bold',
                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center'
                       }}>
                         <span>Nivel {level}</span>
                         <span style={{ 
                           color: slot.used >= slot.total ? '#e74c3c' : 
                                  slot.used > slot.total * 0.7 ? '#f39c12' : '#2ecc71',
                           fontSize: '12px'
                         }}>
                           {slot.total - slot.used} / {slot.total}
            </span>
                       </div>
                       
                       {/* Cuadrados estilo BG3 */}
                       <div style={{
                         display: 'flex',
                         gap: '4px',
                         flexWrap: 'wrap',
                         justifyContent: 'flex-start'
                       }}>
                         {Array.from({ length: slot.total }, (_, index) => (
                           <div
                             key={index}
                             style={{
                               width: '20px',
                               height: '20px',
                               border: '2px solid #3498db',
                               borderRadius: '3px',
                               background: index < slot.used 
                                 ? 'rgba(128, 128, 128, 0.5)' // Gris opaco cuando usado
                                 : 'rgba(52, 152, 219, 0.8)', // Azul brillante cuando disponible
                               transition: 'all 0.3s ease',
                               cursor: 'pointer',
                               position: 'relative'
                             }}
                             title={`Espacio ${index + 1} de nivel ${level} - ${index < slot.used ? 'Usado' : 'Disponible'}`}
                             onClick={() => {
                               // Aquí podrías agregar funcionalidad para usar/restaurar espacios
                               console.log(`Click en espacio ${index + 1} de nivel ${level}`);
                             }}
                           >
                             {/* Indicador visual adicional */}
                             {index < slot.used && (
                               <div style={{
                                 position: 'absolute',
                                 top: '50%',
                                 left: '50%',
                                 transform: 'translate(-50%, -50%)',
                                 width: '8px',
                                 height: '2px',
                                 background: '#666',
                                 borderRadius: '1px'
                               }} />
                             )}
                           </div>
                         ))}
                       </div>
                    </div>
                  ))}
                {Object.keys(character.spellSlots).filter(level => character.spellSlots[level].total > 0).length === 0 && (
                  <div style={{ fontSize: '14px', color: '#95a5a6', fontStyle: 'italic' }}>
                    Sin espacios de conjuro disponibles
          </div>
        )}
              </div>
            </div>
          )}

          {/* Botón para ver páginas del personaje */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            border: '1px solid #e74c3c'
          }}>
            <button
              onClick={onShowCharacterSheet}
              style={{
                width: '100%',
                background: 'rgba(231, 76, 60, 0.8)',
                border: 'none',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(231, 76, 60, 1)'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(231, 76, 60, 0.8)'
              }}
            >
              <FolderOpen size={16} />
              Ver Páginas del Personaje
            </button>
          </div>

          {/* Botón para ver estadísticas de personajes */}
          <div style={{
            marginTop: '10px',
            padding: '15px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            border: '1px solid #9b59b6'
          }}>
            <button
              onClick={() => onViewCharacterStats && onViewCharacterStats()}
              style={{
                width: '100%',
                background: 'rgba(155, 89, 182, 0.8)',
                border: 'none',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(155, 89, 182, 1)'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(155, 89, 182, 0.8)'
              }}
            >
              <UsersIcon size={16} />
              Ver Estadísticas de Personajes
            </button>
          </div>
        </div>
      </div>

      {/* Botón para abrir el panel del personaje */}
      <button
        onClick={() => setCharacterPanelOpen(true)}
        style={{
          position: 'fixed',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(52, 152, 219, 0.9)',
          border: 'none',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(52, 152, 219, 1)'
          e.target.style.transform = 'translateY(-50%) scale(1.1)'
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(52, 152, 219, 0.9)'
          e.target.style.transform = 'translateY(-50%) scale(1)'
        }}
      >
        <User size={20} />
      </button>

      {/* Chat principal */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: characterPanelOpen ? '350px' : '0',
        transition: 'margin-left 0.3s ease'
      }}>
                 {/* Header */}
         <div style={{
           background: 'rgba(0,0,0,0.8)',
           padding: '15px 20px',
           borderBottom: '2px solid #3498db',
           display: 'flex',
           flexDirection: 'column',
           gap: '10px'
         }}>
           {/* Título y botones principales */}
           <div style={{
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center'
           }}>
             <div>
               <h1 style={{ margin: 0, fontSize: '24px', color: '#3498db' }}>
                 🎮 D&D Solitario
               </h1>
               <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#bdc3c7' }}>
                 {t('game.playingAs')} {character?.name || 'Sin nombre'} - {gameState?.world?.currentLocation || 'Desconocido'}
               </p>
             </div>
             <div style={{ display: 'flex', gap: '10px' }}>
               <button
                 onClick={handleSaveGame}
                 style={{
                   background: 'rgba(255,255,255,0.1)',
                   border: 'none',
                   color: 'white',
                   padding: '8px 16px',
                   borderRadius: '6px',
                   cursor: 'pointer',
                   fontSize: '14px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '5px'
                 }}
               >
                 <Save size={16} />
                 Guardar
               </button>
               <button
                 onClick={onBackToMenu}
                 style={{
                   background: 'rgba(255,255,255,0.1)',
                   border: 'none',
                   color: 'white',
                   padding: '8px 16px',
                   borderRadius: '6px',
                   cursor: 'pointer',
                   fontSize: '14px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '5px'
                 }}
               >
                 <Home size={16} />
                 Menú
               </button>
             </div>
           </div>

           {/* Botones de acción especial */}
           <div style={{
             display: 'flex',
             gap: '10px',
             justifyContent: 'center'
           }}>
             <button
               onClick={handleShortRest}
               disabled={!actionButtons.shortRest.enabled || actionButtons.shortRest.used}
               style={{
                 background: actionButtons.shortRest.enabled && !actionButtons.shortRest.used 
                   ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
                   : 'rgba(255,255,255,0.1)',
                 border: 'none',
                 color: 'white',
                 padding: '8px 16px',
                 borderRadius: '6px',
                 cursor: actionButtons.shortRest.enabled && !actionButtons.shortRest.used ? 'pointer' : 'not-allowed',
                 fontSize: '12px',
                 fontWeight: 'bold',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '5px',
                 opacity: actionButtons.shortRest.enabled && !actionButtons.shortRest.used ? 1 : 0.5,
                 transition: 'all 0.3s ease'
               }}
               title={actionButtons.shortRest.used ? 'Ya usado' : 'Descanso corto - Recupera algunos recursos'}
             >
               ⏰ Descanso Corto
             </button>
             <button
               onClick={handleLongRest}
               disabled={!actionButtons.longRest.enabled || actionButtons.longRest.used}
               style={{
                 background: actionButtons.longRest.enabled && !actionButtons.longRest.used 
                   ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                   : 'rgba(255,255,255,0.1)',
                 border: 'none',
                 color: 'white',
                 padding: '8px 16px',
                 borderRadius: '6px',
                 cursor: actionButtons.longRest.enabled && !actionButtons.longRest.used ? 'pointer' : 'not-allowed',
                 fontSize: '12px',
                 fontWeight: 'bold',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '5px',
                 opacity: actionButtons.longRest.enabled && !actionButtons.longRest.used ? 1 : 0.5,
                 transition: 'all 0.3s ease'
               }}
               title={actionButtons.longRest.used ? 'Ya usado' : 'Descanso largo - Recupera todos los recursos'}
             >
               🌙 Descanso Largo
             </button>
             <button
               onClick={handleLevelUp}
               disabled={!actionButtons.levelUp.enabled || actionButtons.levelUp.used}
               style={{
                 background: actionButtons.levelUp.enabled && !actionButtons.levelUp.used 
                   ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
                   : 'rgba(255,255,255,0.1)',
                 border: 'none',
                 color: 'white',
                 padding: '8px 16px',
                 borderRadius: '6px',
                 cursor: actionButtons.levelUp.enabled && !actionButtons.levelUp.used ? 'pointer' : 'not-allowed',
                 fontSize: '12px',
                 fontWeight: 'bold',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '5px',
                 opacity: actionButtons.levelUp.enabled && !actionButtons.levelUp.used ? 1 : 0.5,
                 transition: 'all 0.3s ease'
               }}
               title={actionButtons.levelUp.used ? 'Ya usado' : 'Subir de nivel - Incrementa tu poder'}
             >
               ⭐ Subir de Nivel
             </button>
           </div>
      </div>

      {/* Área de mensajes */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
        {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#bdc3c7',
              fontStyle: 'italic'
            }}>
              <h3>¡Bienvenido a tu aventura!</h3>
              <p>Escribe un mensaje para comenzar a interactuar con el DM.</p>
              <p style={{ fontSize: '14px', marginTop: '20px' }}>
                Ejemplos: "Entro a la taberna", "Hablo con el tabernero", "Exploro la ciudad"
              </p>
          </div>
        ) : (
            messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '10px'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: message.role === 'user' 
                    ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                    : message.role === 'system'
                    ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
                    : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  border: message.role === 'system' ? '1px solid #e74c3c' : 'none'
                }}>
                  <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    {message.content}
                </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.7)',
                    marginTop: '5px',
                    textAlign: 'right'
                  }}>
                    {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '10px'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #3498db',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  El DM está pensando...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

        {/* Input del chat principal */}
        <div style={{
          padding: '20px',
          background: 'rgba(0,0,0,0.8)',
          borderTop: '2px solid #3498db'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end'
          }}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('messages.sendMessage')}
              style={{
                flex: 1,
                minHeight: '60px',
                maxHeight: '120px',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #3498db',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              style={{
                background: isLoading || !inputMessage.trim() 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                border: 'none',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.3s ease'
              }}
            >
              <Send size={16} />
              Enviar
            </button>
              </div>
              </div>
            </div>

      {/* Chat lateral derecho */}
      <div style={{
        position: 'fixed',
        right: sideChatOpen ? '0' : '-300px',
        top: '0',
        width: '300px',
        height: '100vh',
        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
        borderLeft: '2px solid #e74c3c',
        transition: 'right 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: sideChatOpen ? '-2px 0 10px rgba(0,0,0,0.3)' : 'none'
      }}>
        {/* Header del chat lateral */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '15px',
          borderBottom: '2px solid #e74c3c',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={16} />
            Asistente de Reglas
          </h3>
          <button
            onClick={() => setSideChatOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={14} />
          </button>
          </div>

        {/* Mensajes del chat lateral */}
        <div style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {sideChatMessages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#bdc3c7',
              fontStyle: 'italic'
            }}>
              <p>Pregunta sobre reglas, mecánicas o cualquier duda del juego.</p>
            </div>
          ) : (
            sideChatMessages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '8px'
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: message.role === 'user' 
                    ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
                    : message.role === 'system'
                    ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
                    : 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                  color: 'white',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {message.content}
                </div>
              </div>
            ))
          )}
          {isSideChatLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                color: 'white',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #e74c3c',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Pensando...
              </div>
            </div>
          )}
          <div ref={sideChatEndRef} />
        </div>

        {/* Input del chat lateral */}
        <div style={{
          padding: '15px',
          background: 'rgba(0,0,0,0.8)',
          borderTop: '2px solid #e74c3c'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end'
          }}>
            <textarea
              value={sideChatInput}
              onChange={(e) => setSideChatInput(e.target.value)}
              onKeyPress={handleSideChatKeyPress}
              placeholder="Pregunta sobre reglas..."
              style={{
                flex: 1,
                minHeight: '40px',
                maxHeight: '80px',
                padding: '8px',
                borderRadius: '6px',
                border: '2px solid #e74c3c',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '12px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          <button
              onClick={handleSideChatMessage}
              disabled={isSideChatLoading || !sideChatInput.trim()}
              style={{
                background: isSideChatLoading || !sideChatInput.trim() 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                border: 'none',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: isSideChatLoading || !sideChatInput.trim() ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Send size={12} />
          </button>
        </div>
      </div>
      </div>

      {/* Botón para abrir el chat lateral */}
      <button
        onClick={() => setSideChatOpen(true)}
        style={{
          position: 'fixed',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(231, 76, 60, 0.9)',
          border: 'none',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(231, 76, 60, 1)'
          e.target.style.transform = 'translateY(-50%) scale(1.1)'
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(231, 76, 60, 0.9)'
          e.target.style.transform = 'translateY(-50%) scale(1)'
        }}
      >
        <MessageCircle size={20} />
      </button>

      {/* ActionBar - Sistema de interacción avanzado */}
      <ActionBar
        character={character}
        turnState={turnState}
        onSend={handleActionBarSend}
        suggestions={aiSuggestions}
        onTurnStateChange={handleTurnStateChange}
      />

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default GameArea

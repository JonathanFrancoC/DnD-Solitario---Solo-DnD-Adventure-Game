import React, { useState, useRef, useEffect } from 'react'
import { Send, Save, FolderOpen, Settings, Home } from 'lucide-react'
import { sendMessageToDM } from '../utils/aiService'

const GameArea = ({ gameState, updateGameState, onBackToMenu, campaignId = null }) => {
  const [messages, setMessages] = useState(gameState?.messages || [])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (gameState?.messages) {
      setMessages(gameState.messages)
    } else if (messages.length === 0) {
      // Mensaje de bienvenida automático si no hay mensajes
      const welcomeMessage = {
        id: Date.now(),
        type: 'dm',
        content: `¡Bienvenido a tu aventura, ${gameState?.character?.name || 'valiente aventurero'}! 

Te encuentras en ${gameState?.world?.currentLocation || 'un lugar misterioso'}. El aire está cargado de posibilidades y peligros acechan en las sombras.

¿Qué te gustaría hacer? Puedes explorar tu entorno, interactuar con NPCs, revisar tu inventario, o embarcarte en cualquier acción que desees. Recuerda, esta es tu historia y cada decisión que tomes moldeará tu destino.

¡Que comience la aventura!`,
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
      
      // Actualizar el estado del juego con el mensaje de bienvenida
      const updatedGameState = {
        ...gameState,
        messages: [welcomeMessage],
        lastUpdate: new Date().toISOString()
      }
      updateGameState(updatedGameState)
    }
  }, [gameState])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const playerMessage = {
      id: Date.now(),
      type: 'player',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    // Agregar mensaje del jugador inmediatamente
    const newMessages = [...messages, playerMessage]
    setMessages(newMessages)
    setInputMessage('')
    setIsLoading(true)

    try {
      // Enviar mensaje al DM (IA)
      const dmResponse = await sendMessageToDM(inputMessage, gameState, campaignId)
      
      const dmMessage = {
        id: Date.now() + 1,
        type: 'dm',
        content: dmResponse,
        timestamp: new Date().toISOString()
      }

      const updatedMessages = [...newMessages, dmMessage]
      setMessages(updatedMessages)

      // Actualizar estado del juego
      const updatedGameState = {
        ...gameState,
        messages: updatedMessages,
        lastUpdate: new Date().toISOString()
      }
      updateGameState(updatedGameState)

    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: 'Error al comunicarse con el DM. Intenta de nuevo.',
        timestamp: new Date().toISOString()
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMessageStyle = (message) => {
    switch (message.type) {
      case 'dm':
        return 'chat-message dm-message'
      case 'player':
        return 'chat-message player-message'
      case 'system':
        return 'chat-message bg-yellow-800 text-white mx-auto'
      default:
        return 'chat-message bg-gray-600 text-white'
    }
  }

  return (
    <div className="h-full flex flex-col bg-dnd-dark">
      {/* Header del juego */}
      <div className="bg-dnd-brown p-4 border-b border-dnd-gold">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-dnd-gold">
              🐉 D&D Solitario
            </h1>
            <div className="text-dnd-light text-sm">
              Chat con el DM
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary p-2" title="Volver al menú" onClick={onBackToMenu}>
              <Home size={20} />
            </button>
            <button className="btn-secondary p-2" title="Guardar partida">
              <Save size={20} />
            </button>
            <button className="btn-secondary p-2" title="Cargar partida">
              <FolderOpen size={20} />
            </button>
            <button className="btn-secondary p-2" title="Configuración">
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        {/* Información del personaje */}
        {gameState?.character && (
          <div className="mt-2 text-sm">
            <span className="text-dnd-gold font-semibold">
              {gameState.character.name} 
            </span>
            <span className="text-dnd-light ml-2">
              Nivel {gameState.character.level} {gameState.character.class}
            </span>
            <span className="text-dnd-light ml-2">
              HP: {gameState.character.currentHP}/{gameState.character.maxHP}
            </span>
            {gameState.world?.currentLocation && (
              <span className="text-dnd-light ml-2">
                📍 {gameState.world.currentLocation}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-dnd-gold mt-12">
            <div className="text-6xl mb-4">🐉</div>
            <p className="text-2xl mb-4 font-bold">¡Bienvenido a tu aventura!</p>
            <p className="text-lg text-dnd-light mb-6">
              Escribe tu primera acción para comenzar tu historia...
            </p>
            <div className="bg-dnd-brown p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-dnd-gold font-semibold mb-2">Ejemplos de acciones:</p>
              <ul className="text-xs text-dnd-light space-y-1">
                <li>• "Exploro la taberna para buscar información"</li>
                <li>• "Me acerco al NPC misterioso"</li>
                <li>• "Reviso mi inventario"</li>
                <li>• "Camino hacia el bosque"</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={getMessageStyle(message)}>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-semibold">
                  {message.type === 'dm' ? '🐉 Dungeon Master' : 
                   message.type === 'player' ? '👤 Tú' : '⚙️ Sistema'}
                </div>
                <div className="text-xs opacity-50">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="chat-message dm-message">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-semibold">🐉 Dungeon Master</div>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse text-dnd-gold">Escribiendo la historia...</div>
              <div className="ml-2 flex space-x-1">
                <div className="w-2 h-2 bg-dnd-gold rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-dnd-gold rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-dnd-gold rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Área de entrada */}
      <div className="p-6 border-t border-dnd-brown bg-dnd-dark">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe tu acción, habla con NPCs, o realiza cualquier acción..."
              className="chat-input w-full resize-none text-base"
              rows="4"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-dnd-light">
                Presiona Enter para enviar, Shift+Enter para nueva línea
              </div>
              <div className="text-xs text-dnd-light">
                {inputMessage.length} caracteres
              </div>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="btn-primary self-end px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={20} />
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameArea

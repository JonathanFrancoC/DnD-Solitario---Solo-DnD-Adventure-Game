import React, { useState, useRef, useEffect } from 'react'
import { Send, HelpCircle, MessageCircle } from 'lucide-react'
import { sendMessageToAssistant } from '../utils/aiService'

const SideChat = ({ messages, addMessage, gameState, updateGameState }) => {
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    addMessage(userMessage)
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await sendMessageToAssistant(inputMessage, gameState)
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      addMessage(assistantMessage)
    } catch (error) {
      console.error('Error en chat lateral:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: 'Error al comunicarse con el asistente. Intenta de nuevo.',
        timestamp: new Date().toISOString()
      }
      addMessage(errorMessage)
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
      case 'assistant':
        return 'bg-blue-800 text-white ml-0'
      case 'user':
        return 'bg-green-700 text-white ml-auto'
      case 'system':
        return 'bg-yellow-800 text-white mx-auto'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const quickActions = [
    "¿Cómo funciona el combate?",
    "Necesito ayuda con las reglas",
    "¿Puedo cambiar mi personaje?",
    "¿Cómo guardar la partida?",
    "Explicar las mecánicas"
  ]

  return (
    <div className="h-full flex flex-col bg-dnd-dark">
      {/* Header del chat lateral */}
      <div className="bg-dnd-brown p-3 border-b border-dnd-gold">
        <div className="flex items-center gap-2">
          <HelpCircle size={20} className="text-dnd-gold" />
          <h2 className="text-lg font-bold text-dnd-gold">Asistente IA</h2>
        </div>
        <p className="text-xs text-dnd-light mt-1">
          Preguntas, dudas y ayuda fuera de la partida
        </p>
      </div>

      {/* Acciones rápidas */}
      <div className="p-3 border-b border-dnd-brown">
        <p className="text-xs text-dnd-gold mb-2 font-semibold">Acciones rápidas:</p>
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(action)}
              className="text-xs bg-dnd-dark border border-dnd-brown text-dnd-light px-2 py-1 rounded hover:bg-dnd-brown transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-dnd-gold mt-8">
            <MessageCircle size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">¿Tienes alguna pregunta sobre D&D?</p>
            <p className="text-xs text-dnd-light mt-1">
              Puedo ayudarte con reglas, mecánicas o cualquier duda
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`chat-message ${getMessageStyle(message)}`}>
              <div className="text-xs opacity-75 mb-1">
                {message.type === 'assistant' ? '🤖 Asistente' : 
                 message.type === 'user' ? '👤 Tú' : '⚙️ Sistema'}
              </div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="chat-message bg-blue-800 text-white ml-0">
            <div className="text-xs opacity-75 mb-1">🤖 Asistente</div>
            <div className="flex items-center">
              <div className="animate-pulse text-sm">Pensando</div>
              <div className="ml-2 flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Área de entrada */}
      <div className="p-3 border-t border-dnd-brown">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta o duda..."
            className="chat-input flex-1 resize-none text-sm"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="btn-primary self-end px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SideChat

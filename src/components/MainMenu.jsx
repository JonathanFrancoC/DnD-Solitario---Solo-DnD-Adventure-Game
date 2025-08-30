import React from 'react'
import { Play, BookOpen, Settings, Sword, Shield, Map } from 'lucide-react'

const MainMenu = ({ onNewGame, onContinueGame, onOpenSettings, hasSavedGame }) => {
  return (
    <div style={{ 
      height: '100vh', 
      background: 'linear-gradient(135deg, #2D1810 0%, #8B4513 20%, #2D1810 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-dnd-gold/10 text-8xl">🐉</div>
        <div className="absolute top-20 right-20 text-dnd-gold/10 text-6xl">⚔️</div>
        <div className="absolute bottom-20 left-20 text-dnd-gold/10 text-6xl">🛡️</div>
        <div className="absolute bottom-10 right-10 text-dnd-gold/10 text-8xl">🗺️</div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center">
        {/* Título principal */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#DAA520', 
            marginBottom: '16px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            D&D Solitario
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#F5F5DC', 
            maxWidth: '400px', 
            margin: '0 auto'
          }}>
            Embárcate en una aventura épica donde la Inteligencia Artificial 
            actúa como tu Dungeon Master personal
          </p>
        </div>

        {/* Menú de opciones */}
        <div className="space-y-6 max-w-md mx-auto">
          {/* Nueva Partida */}
          <button
            onClick={onNewGame}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #DC143C 0%, #B22222 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '24px 32px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #B22222 0%, #8B0000 100%)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #DC143C 0%, #B22222 100%)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <Play size={24} />
            <span>Nueva Partida</span>
          </button>

          {/* Continuar Partida */}
          <button
            onClick={onContinueGame}
            disabled={!hasSavedGame}
            className={`w-full group relative overflow-hidden font-bold py-6 px-8 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-4 ${
              hasSavedGame
                ? 'bg-gradient-to-r from-dnd-brown to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-dnd-gold/20 to-transparent opacity-0 transition-opacity duration-300 ${
              hasSavedGame ? 'group-hover:opacity-100' : ''
            }`}></div>
            <BookOpen size={24} className="relative z-10" />
            <span className="relative z-10 text-lg">
              {hasSavedGame ? 'Continuar Partida' : 'No hay partida guardada'}
            </span>
          </button>

          {/* Opciones */}
          <button
            onClick={onOpenSettings}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-dnd-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Settings size={24} className="relative z-10" />
            <span className="relative z-10 text-lg">Opciones</span>
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <div className="flex justify-center gap-8 text-dnd-light/60">
            <div className="flex items-center gap-2">
              <Sword size={16} />
              <span className="text-sm">Combate Épico</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span className="text-sm">Aventuras Únicas</span>
            </div>
            <div className="flex items-center gap-2">
              <Map size={16} />
              <span className="text-sm">Mundos Dinámicos</span>
            </div>
          </div>
        </div>

        {/* Versión */}
        <div className="mt-8 text-dnd-light/40 text-sm">
          Versión 1.0.0 - Desarrollado con React, Electron y OpenAI
        </div>
      </div>
    </div>
  )
}

export default MainMenu

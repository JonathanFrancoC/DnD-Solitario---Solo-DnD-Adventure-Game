import React, { useState, useEffect } from 'react'
import { X, Save, Settings } from 'lucide-react'

const SettingsModal = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    tone: 'medium',
    exploration: 'mixed',
    flanking: true,
    tacticalRepositioning: false,
    logisticsComplexity: 'detailed'
  })
  const [apiKey, setApiKey] = useState('')
  const [developerMode, setDeveloperMode] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      if (window.electronAPI) {
        const config = await window.electronAPI.getConfig()
        const key = await window.electronAPI.getApiKey()
        const devMode = await window.electronAPI.getDeveloperMode()
        setSettings(config || settings)
        setApiKey(key || '')
        setDeveloperMode(devMode || false)
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    }
  }

  const handleSave = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.saveConfig(settings)
        await window.electronAPI.saveApiKey(apiKey)
        await window.electronAPI.saveDeveloperMode(developerMode)
      }
      onSave({ settings, apiKey, developerMode })
      onClose()
    } catch (error) {
      console.error('Error al guardar configuración:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dnd-dark border border-dnd-gold rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dnd-gold flex items-center gap-2">
            <Settings size={24} />
            Configuración
          </h2>
          <button
            onClick={onClose}
            className="text-dnd-light hover:text-dnd-gold transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-dnd-gold font-semibold mb-2">
              API Key de OpenAI
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-3 border border-dnd-brown rounded-lg bg-dnd-dark text-dnd-light focus:outline-none focus:border-dnd-gold"
            />
            <p className="text-sm text-dnd-light mt-1">
              Obtén tu API key en{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dnd-gold hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>

          {/* Modo Desarrollador */}
          <div className="border-t border-dnd-brown pt-6">
            <h3 className="text-lg font-bold text-dnd-gold mb-4 flex items-center gap-2">
              <span className="text-red-500">🔧</span>
              Modo Desarrollador
            </h3>
            <div className="bg-dnd-brown bg-opacity-20 p-4 rounded-lg border border-dnd-brown">
              <label className="flex items-center gap-3 text-dnd-gold font-semibold mb-3">
                <input
                  type="checkbox"
                  checked={developerMode}
                  onChange={(e) => setDeveloperMode(e.target.checked)}
                  className="w-4 h-4 text-dnd-gold bg-dnd-dark border-dnd-brown rounded focus:ring-dnd-gold"
                />
                Activar modo desarrollador
              </label>
              <p className="text-sm text-dnd-light mb-3">
                <strong>⚠️ ADVERTENCIA:</strong> Este modo está destinado únicamente para pruebas de desarrollo.
              </p>
              <div className="text-sm text-dnd-light space-y-2">
                <p><strong>Cuando está activado:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>La IA recibirá un prompt especial indicando que está en modo de pruebas</li>
                  <li>El programador puede hacer preguntas directas sobre mecánicas</li>
                  <li>Se activan logs adicionales para debugging</li>
                  <li>Algunas restricciones de seguridad se relajan temporalmente</li>
                </ul>
                <p className="text-yellow-400 mt-3">
                  <strong>💡 Uso:</strong> Solo activar cuando necesites probar nuevas funcionalidades o debuggear problemas.
                </p>
              </div>
            </div>
          </div>

          {/* Tono de heridas/violencia */}
          <div>
            <label className="block text-dnd-gold font-semibold mb-2">
              Tono de heridas/violencia
            </label>
            <select
              value={settings.tone}
              onChange={(e) => setSettings({...settings, tone: e.target.value})}
              className="w-full p-3 border border-dnd-brown rounded-lg bg-dnd-dark text-dnd-light focus:outline-none focus:border-dnd-gold"
            >
              <option value="soft">Suave</option>
              <option value="medium">Medio</option>
              <option value="crude">Crudo</option>
            </select>
          </div>

          {/* Exploración */}
          <div>
            <label className="block text-dnd-gold font-semibold mb-2">
              Exploración
            </label>
            <select
              value={settings.exploration}
              onChange={(e) => setSettings({...settings, exploration: e.target.value})}
              className="w-full p-3 border border-dnd-brown rounded-lg bg-dnd-dark text-dnd-light focus:outline-none focus:border-dnd-gold"
            >
              <option value="random">Más aleatoria</option>
              <option value="narrative">Más narrativa</option>
              <option value="mixed">Mixto (por defecto)</option>
            </select>
          </div>

          {/* Flanqueo */}
          <div>
            <label className="flex items-center gap-3 text-dnd-gold font-semibold">
              <input
                type="checkbox"
                checked={settings.flanking}
                onChange={(e) => setSettings({...settings, flanking: e.target.checked})}
                className="w-4 h-4 text-dnd-gold bg-dnd-dark border-dnd-brown rounded focus:ring-dnd-gold"
              />
              Flanqueo (regla opcional de ventaja)
            </label>
          </div>

          {/* Reposiciones tácticas */}
          <div>
            <label className="flex items-center gap-3 text-dnd-gold font-semibold">
              <input
                type="checkbox"
                checked={settings.tacticalRepositioning}
                onChange={(e) => setSettings({...settings, tacticalRepositioning: e.target.checked})}
                className="w-4 h-4 text-dnd-gold bg-dnd-dark border-dnd-brown rounded focus:ring-dnd-gold"
              />
              Reposiciones tácticas (mapa teatral)
            </label>
            <p className="text-sm text-dnd-light mt-1">
              Solo si lo pides (distancias aprox., coberturas 1/2 y 3/4)
            </p>
          </div>

          {/* Complejidad logística */}
          <div>
            <label className="block text-dnd-gold font-semibold mb-2">
              Complejidad logística
            </label>
            <select
              value={settings.logisticsComplexity}
              onChange={(e) => setSettings({...settings, logisticsComplexity: e.target.value})}
              className="w-full p-3 border border-dnd-brown rounded-lg bg-dnd-dark text-dnd-light focus:outline-none focus:border-dnd-gold"
            >
              <option value="detailed">Rastreo exhaustivo (por defecto)</option>
              <option value="simplified">Simplificado (oro y objetos clave)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-dnd-brown text-dnd-light rounded hover:bg-dnd-brown transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-dnd-red text-white rounded hover:bg-red-800 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal

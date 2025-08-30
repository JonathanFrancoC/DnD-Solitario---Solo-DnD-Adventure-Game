// Utilidades para guardar y cargar el estado del juego

const STORAGE_KEY = 'dnd_solitario_game_state'

export const saveGameState = (gameState) => {
  try {
    const serializedState = JSON.stringify(gameState, null, 2)
    localStorage.setItem(STORAGE_KEY, serializedState)
    console.log('Estado del juego guardado exitosamente')
    return true
  } catch (error) {
    console.error('Error al guardar el estado del juego:', error)
    return false
  }
}

export const loadGameState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)
    if (!serializedState) {
      console.log('No se encontró estado guardado')
      return null
    }
    
    const gameState = JSON.parse(serializedState)
    console.log('Estado del juego cargado exitosamente')
    return gameState
  } catch (error) {
    console.error('Error al cargar el estado del juego:', error)
    return null
  }
}

export const clearGameState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Estado del juego eliminado')
    return true
  } catch (error) {
    console.error('Error al eliminar el estado del juego:', error)
    return false
  }
}

export const exportGameState = () => {
  try {
    const gameState = loadGameState()
    if (!gameState) return null
    
    const dataStr = JSON.stringify(gameState, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `dnd_solitario_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    return true
  } catch (error) {
    console.error('Error al exportar el estado del juego:', error)
    return false
  }
}

export const importGameState = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const gameState = JSON.parse(e.target.result)
        saveGameState(gameState)
        resolve(gameState)
      } catch (error) {
        reject(new Error('Archivo inválido'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }
    
    reader.readAsText(file)
  })
}

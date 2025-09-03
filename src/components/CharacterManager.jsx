import React, { useState, useEffect } from 'react';
import { 
  initializeFileSystem, 
  saveCharacterToFile, 
  loadCharactersFromFiles, 
  updateCharacterInFile, 
  deleteCharacterFromFile,
  isElectron 
} from '../utils/fileSystemUtils';

export default function CharacterManager({ characterData, onLoadCharacter, onStartGame }) {
  const [savedCharacters, setSavedCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [useFileSystem, setUseFileSystem] = useState(false);

  // Función para obtener la lista de personajes guardados
  const loadSavedCharacters = async () => {
    try {
      if (useFileSystem) {
        // Usar sistema de archivos
        const characters = await loadCharactersFromFiles();
        setSavedCharacters(characters);
      } else {
        // Usar localStorage como fallback
        const characters = JSON.parse(localStorage.getItem('savedCharacters') || '[]');
        setSavedCharacters(characters);
      }
    } catch (error) {
      console.error('Error al cargar personajes guardados:', error);
      setSavedCharacters([]);
    }
  };

  // Inicializar sistema de archivos y cargar personajes al montar el componente
  useEffect(() => {
    const initSystem = async () => {
      const fileSystemAvailable = await initializeFileSystem();
      setUseFileSystem(fileSystemAvailable);
      await loadSavedCharacters();
    };
    initSystem();
  }, [useFileSystem]);

  // Función para guardar un personaje
  const saveCharacter = async () => {
    if (!saveName.trim()) {
      alert('Por favor ingresa un nombre para el personaje');
      return;
    }

    try {
      // Crear una copia del personaje con el estado de vida/muerte
      const characterWithStatus = {
        ...characterData,
        status: {
          alive: true,
          lastUpdated: new Date().toISOString()
        }
      };

      if (useFileSystem) {
        // Usar sistema de archivos
        const success = await saveCharacterToFile(characterWithStatus, saveName.trim());
        if (success) {
          await loadSavedCharacters(); // Recargar lista
          setSaveName('');
          setShowSaveDialog(false);
          alert(`Personaje "${saveName}" guardado exitosamente en archivo`);
                 } else {
           alert('Error al guardar el personaje');
         }
       } else {
         // Usar localStorage como fallback silencioso
         const characterToSave = {
           id: Date.now().toString(),
           name: saveName.trim(),
           data: characterWithStatus,
           savedAt: new Date().toISOString(),
           lastModified: new Date().toISOString()
         };

         const existingCharacters = JSON.parse(localStorage.getItem('savedCharacters') || '[]');
         const updatedCharacters = [...existingCharacters, characterToSave];
         localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
         
         setSavedCharacters(updatedCharacters);
         setSaveName('');
         setShowSaveDialog(false);
         alert(`Personaje "${saveName}" guardado exitosamente`);
       }
    } catch (error) {
      console.error('Error al guardar personaje:', error);
      alert('Error al guardar el personaje');
    }
  };

  // Función para actualizar un personaje existente
  const updateCharacter = async (characterId) => {
    try {
      // Crear una copia del personaje con el estado de vida/muerte
      const characterWithStatus = {
        ...characterData,
        status: {
          alive: true,
          lastUpdated: new Date().toISOString()
        }
      };

      if (useFileSystem) {
        // Usar sistema de archivos
        const success = await updateCharacterInFile(characterId, characterWithStatus);
                 if (success) {
           await loadSavedCharacters(); // Recargar lista
           alert('Personaje actualizado exitosamente');
         } else {
           alert('Error al actualizar el personaje');
         }
       } else {
         // Usar localStorage como fallback silencioso
         const characterToUpdate = {
           ...savedCharacters.find(c => c.id === characterId),
           data: characterWithStatus,
           lastModified: new Date().toISOString()
         };

         const updatedCharacters = savedCharacters.map(c => 
           c.id === characterId ? characterToUpdate : c
         );
         localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
         setSavedCharacters(updatedCharacters);
         alert('Personaje actualizado exitosamente');
       }
    } catch (error) {
      console.error('Error al actualizar personaje:', error);
      alert('Error al actualizar el personaje');
    }
  };

  // Función para cargar un personaje
  const loadCharacter = (character) => {
    if (onLoadCharacter) {
      onLoadCharacter(character.data);
      setShowLoadDialog(false);
      alert(`Personaje "${character.name}" cargado exitosamente`);
    }
  };

  // Función para eliminar un personaje
  const deleteCharacter = async (characterId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este personaje?')) {
      try {
        if (useFileSystem) {
          // Usar sistema de archivos
          const success = await deleteCharacterFromFile(characterId);
                   if (success) {
           await loadSavedCharacters(); // Recargar lista
           alert('Personaje eliminado exitosamente');
         } else {
           alert('Error al eliminar el personaje');
         }
       } else {
         // Usar localStorage como fallback silencioso
         const updatedCharacters = savedCharacters.filter(c => c.id !== characterId);
         localStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
         setSavedCharacters(updatedCharacters);
         alert('Personaje eliminado exitosamente');
       }
      } catch (error) {
        console.error('Error al eliminar personaje:', error);
        alert('Error al eliminar el personaje');
      }
    }
  };

  // Función para exportar un personaje a JSON
  const exportCharacter = (character) => {
    const dataStr = JSON.stringify(character.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Función para importar un personaje desde JSON
  const importCharacter = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        const characterName = file.name.replace('.json', '').replace(/_/g, ' ');
        
        if (onLoadCharacter) {
          onLoadCharacter(importedData);
          alert(`Personaje "${characterName}" importado exitosamente`);
        }
      } catch (error) {
        console.error('Error al importar personaje:', error);
        alert('Error al importar el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Gestor de Personajes
      </h2>
      
             {/* Indicador del sistema de almacenamiento - Solo mostrar cuando está activo */}
       {useFileSystem && (
         <div style={{ 
           textAlign: 'center', 
           marginBottom: '15px', 
           padding: '8px 16px',
           backgroundColor: '#e8f5e8',
           border: '2px solid #4CAF50',
           borderRadius: '8px',
           fontSize: '14px',
           fontWeight: 'bold'
         }}>
           💾 Sistema de Archivos Activo
           <br />
           <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>
             Los personajes se guardan en archivos JSON en la carpeta del sistema
           </span>
         </div>
       )}

      {/* Botones principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '10px', 
        marginBottom: '30px' 
      }}>
        <button
          onClick={() => setShowSaveDialog(true)}
          style={{
            padding: '12px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          💾 Guardar Personaje Actual
        </button>

        <button
          onClick={() => setShowLoadDialog(true)}
          style={{
            padding: '12px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📂 Cargar Personaje
        </button>

        <label
          style={{
            padding: '12px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'block'
          }}
        >
          📥 Importar desde JSON
          <input
            type="file"
            accept=".json"
            onChange={importCharacter}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Diálogo de guardado */}
      {showSaveDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            minWidth: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Guardar Personaje</h3>
            <input
              type="text"
              placeholder="Nombre del personaje"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                marginBottom: '20px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && saveCharacter()}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={saveCharacter}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de carga */}
      {showLoadDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            minWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Cargar Personaje</h3>
            
            {savedCharacters.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                No hay personajes guardados
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedCharacters.map(character => (
                  <div
                    key={character.id}
                    style={{
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: '#333' }}>{character.name}</h4>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => loadCharacter(character)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Cargar
                        </button>
                        {onStartGame && (
                          <button
                            onClick={() => {
                              onStartGame(character.data);
                              setShowLoadDialog(false);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#9C27B0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            🎮 Jugar
                          </button>
                        )}
                        <button
                          onClick={() => updateCharacter(character.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Actualizar
                        </button>
                        <button
                          onClick={() => exportCharacter(character)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Exportar
                        </button>
                        <button
                          onClick={() => deleteCharacter(character.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>Clase: {character.data.class || 'No especificada'}</div>
                      <div>Nivel: {character.data.level || 1}</div>
                      <div>Guardado: {formatDate(character.savedAt)}</div>
                      <div>Última modificación: {formatDate(character.lastModified)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowLoadDialog(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de personajes guardados (vista previa) */}
      {savedCharacters.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Personajes Guardados</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '15px' 
          }}>
            {savedCharacters.slice(0, 6).map(character => (
              <div
                key={character.id}
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                onClick={() => {
                  setSelectedCharacter(character);
                  setShowLoadDialog(true);
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{character.name}</h4>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div>Clase: {character.data.class || 'No especificada'}</div>
                  <div>Nivel: {character.data.level || 1}</div>
                  <div>Última modificación: {formatDate(character.lastModified)}</div>
                </div>
              </div>
            ))}
          </div>
          {savedCharacters.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button
                onClick={() => setShowLoadDialog(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Ver todos los personajes ({savedCharacters.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

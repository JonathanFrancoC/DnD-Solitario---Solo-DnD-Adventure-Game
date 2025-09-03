# Funcionalidad de Copia de Personajes y Estado de Vida/Muerte

## Resumen

Se ha implementado un sistema que permite crear copias de personajes cuando se inicia una partida, manteniendo el personaje original intacto mientras que la copia en la campaña puede cambiar (subir de nivel, perder vida, morir, etc.). Además, se ha agregado un campo de estado "vivo o muerto" a todos los personajes.

## Características Implementadas

### 1. Copia de Personajes al Iniciar Partida

**Archivo modificado:** `src/App.jsx`

- **Función:** `handleStartGame`
- **Comportamiento:** 
  - Crea una copia profunda del personaje usando `JSON.parse(JSON.stringify(character))`
  - Agrega el campo `status` con `alive: true`
  - La copia se guarda en la carpeta de la campaña
  - El personaje original permanece sin cambios

```javascript
// Crear una copia del personaje para la campaña
let characterCopy = JSON.parse(JSON.stringify(character))

// Agregar estado de vida/muerte al personaje
characterCopy.status = {
  alive: true,
  lastUpdated: new Date().toISOString()
}
```

### 2. Campo de Estado "Vivo/Muerto"

**Archivos modificados:**
- `src/App.jsx` - `handleSaveCharacter`
- `src/components/CharacterManager.jsx` - `saveCharacter` y `updateCharacter`

**Estructura del campo status:**
```javascript
status: {
  alive: true, // o false
  lastUpdated: "2025-09-03T16:28:01.386Z"
}
```

### 3. Visualización del Estado en la Interfaz

**Archivo modificado:** `src/components/CharacterStatsViewer.jsx`

- **Vista de lista:** Muestra un indicador visual (punto verde/rojo) con texto "VIVO"/"MUERTO"
- **Vista detallada:** Muestra un badge prominente con el estado del personaje

### 4. Servicios de Gestión de Estado

**Archivo modificado:** `src/utils/gameSaveService.js`

**Nuevos métodos:**
- `loadMainCharacter(campaignId)` - Carga el personaje principal de la campaña
- `updateCharacterStatus(characterId, isAlive, characterType)` - Actualiza el estado de vida/muerte

**Métodos existentes mejorados:**
- `saveMainCharacter()` - Ahora maneja el campo status
- `saveCompanions()` - Ahora maneja el campo status
- `saveVillains()` - Ahora maneja el campo status

## Flujo de Funcionamiento

### 1. Creación de Personaje
1. El usuario crea un personaje
2. Al guardar, se agrega automáticamente `status: { alive: true, lastUpdated: timestamp }`
3. El personaje se guarda en la carpeta `characters/`

### 2. Inicio de Partida
1. El usuario selecciona un personaje existente
2. Se crea una copia profunda del personaje
3. La copia se guarda en `saves/campaign_name/character.json`
4. El personaje original permanece intacto

### 3. Durante el Juego
1. Los cambios (HP, nivel, etc.) se aplican solo a la copia en la campaña
2. El estado de vida/muerte se puede actualizar usando `updateCharacterStatus()`
3. El personaje original nunca se modifica

### 4. Visualización
1. En el visor de estadísticas se muestra el estado de todos los personajes
2. Los personajes muertos se muestran con indicadores rojos
3. Los personajes vivos se muestran con indicadores verdes

## Uso de la API

### Actualizar Estado de un Personaje

```javascript
import gameSaveService from './utils/gameSaveService';

// Marcar personaje principal como muerto
await gameSaveService.updateCharacterStatus('char-id', false, 'main');

// Marcar compañero como vivo
await gameSaveService.updateCharacterStatus('companion-id', true, 'companion');

// Marcar villano como muerto
await gameSaveService.updateCharacterStatus('villain-id', false, 'villain');
```

### Cargar Personaje de Campaña

```javascript
// Cargar personaje principal de la campaña actual
const mainChar = await gameSaveService.loadMainCharacter();

// Cargar personaje principal de una campaña específica
const mainChar = await gameSaveService.loadMainCharacter('campaign-id');
```

## Beneficios

1. **Preservación de Personajes Originales:** Los personajes creados nunca se pierden o modifican
2. **Múltiples Partidas:** Un mismo personaje puede usarse en diferentes campañas
3. **Trazabilidad:** Se puede rastrear el estado de vida/muerte de cada personaje
4. **Flexibilidad:** Los personajes pueden "morir" en una campaña pero seguir disponibles para otras
5. **Consistencia:** Todos los personajes (principal, compañeros, villanos) tienen el mismo sistema de estado

## Compatibilidad

- **Personajes Existentes:** Los personajes ya creados funcionarán normalmente, se les agregará el campo status al guardar
- **Campañas Existentes:** Las campañas existentes seguirán funcionando, los personajes se copiarán al iniciar nueva partida
- **Fallback:** Si no hay campo status, se asume que el personaje está vivo

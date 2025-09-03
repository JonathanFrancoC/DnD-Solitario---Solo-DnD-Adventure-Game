# Sistema de Guardado Estructurado - D&D Solitario

## Descripción General

El sistema de guardado estructurado permite organizar y persistir todos los datos de las partidas de D&D Solitario en una estructura de carpetas y archivos JSON bien definida. Esto facilita la gestión de múltiples campañas y proporciona una base de datos organizada para la IA.

## Estructura de Carpetas

```
saves/
├── campaign_name_1/
│   ├── manifest.json          # Metadatos de la campaña
│   ├── character.json         # Personaje principal
│   ├── companions.json        # Compañeros de la partida
│   ├── villains.json          # Villanos y enemigos
│   ├── world_state.json       # Estado del mundo
│   ├── game_state.json        # Estado general del juego
│   └── bitacora/
│       ├── daily_logs.json    # Eventos diarios
│       └── session_logs.json  # Sesiones de juego
└── campaign_name_2/
    └── ...
```

## Archivos y su Contenido

### manifest.json
Metadatos de la campaña:
```json
{
  "campaign": {
    "id": "campaign_id",
    "name": "Nombre de la Campaña",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_saved_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### character.json
Datos del personaje principal:
```json
{
  "main_character": {
    "name": "Nombre del Personaje",
    "class": "guerrero",
    "level": 1,
    "currentHP": 12,
    "maxHP": 12,
    "armorClass": 16,
    "mechanics": {
      "bardicInspiration": {
        "isActive": false,
        "currentUses": 0,
        "maxUses": 2
      }
    }
  },
  "saved_at": "2024-01-01T00:00:00.000Z"
}
```

### companions.json
Lista de compañeros:
```json
{
  "companions": [
    {
      "name": "Compañero 1",
      "class": "mago",
      "level": 1,
      "currentHP": 8,
      "maxHP": 8
    }
  ],
  "saved_at": "2024-01-01T00:00:00.000Z"
}
```

### villains.json
Lista de villanos y enemigos:
```json
{
  "villains": [
    {
      "name": "Villano 1",
      "class": "bandido",
      "level": 3,
      "currentHP": 20,
      "maxHP": 20
    }
  ],
  "saved_at": "2024-01-01T00:00:00.000Z"
}
```

### world_state.json
Estado del mundo y ubicaciones:
```json
{
  "world": {
    "currentLocation": "Taberna del Dragón Durmiente",
    "discoveredLocations": ["Taberna del Dragón Durmiente"],
    "quests": [],
    "npcs": {
      "Tabernero": {
        "name": "Gareth",
        "description": "Un hombre robusto y amigable",
        "disposition": "friendly",
        "known": true
      }
    },
    "weather": "Soleado",
    "timeOfDay": "Mediodía"
  },
  "saved_at": "2024-01-01T00:00:00.000Z"
}
```

### game_state.json
Estado general del juego:
```json
{
  "game_state": {
    "character": { /* datos del personaje */ },
    "world": { /* estado del mundo */ },
    "combat": {
      "isActive": false,
      "currentEnemies": [],
      "turn": 0,
      "initiative": [],
      "effects": []
    },
    "messages": [
      {
        "role": "assistant",
        "content": "¡Bienvenido a tu aventura!",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "lastUpdate": "2024-01-01T00:00:00.000Z"
  },
  "saved_at": "2024-01-01T00:00:00.000Z"
}
```

### bitacora/daily_logs.json
Registro de eventos diarios:
```json
{
  "logs": [
    {
      "id": "1",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "type": "game_progress",
      "description": "Progreso en la partida",
      "message_preview": "¡Bienvenido a tu aventura!...",
      "character_state": {
        "hp": 12,
        "level": 1,
        "location": "Taberna del Dragón Durmiente"
      }
    }
  ]
}
```

### bitacora/session_logs.json
Registro de sesiones de juego:
```json
{
  "sessions": [
    {
      "id": "1",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "type": "game_save",
      "description": "Guardado automático de la partida",
      "character_state": {
        "hp": 12,
        "level": 1,
        "location": "Taberna del Dragón Durmiente"
      }
    }
  ]
}
```

## Funcionalidades del Sistema

### 1. Gestión de Campañas
- **Crear campaña**: Crea una nueva campaña con estructura completa
- **Listar campañas**: Muestra todas las campañas disponibles
- **Cargar campaña**: Carga todos los datos de una campaña específica
- **Eliminar campaña**: Elimina una campaña completa

### 2. Guardado Automático
- **Auto-save**: Guarda automáticamente cada 5 minutos
- **Guardado manual**: Botón "Guardar" en la interfaz de juego
- **Bitácora automática**: Registra eventos importantes automáticamente

### 3. Persistencia de Datos
- **Personaje principal**: Guarda estado completo del personaje
- **Compañeros**: Lista de NPCs aliados
- **Villanos**: Lista de enemigos y antagonistas
- **Estado del mundo**: Ubicaciones, NPCs, clima, etc.
- **Historial de mensajes**: Conversación completa con la IA

### 4. Compatibilidad
- **Electron**: Usa sistema de archivos nativo
- **Navegador**: Fallback a localStorage
- **JSON**: Formato estándar para fácil lectura y edición

## Uso en la Aplicación

### Crear Nueva Campaña
1. Ir al "Gestor de Campañas"
2. Hacer clic en "+ Nueva Campaña"
3. Ingresar ID y nombre de la campaña
4. La estructura se crea automáticamente

### Cargar Campaña Existente
1. Ir al "Gestor de Campañas"
2. Seleccionar una campaña de la lista
3. Los datos se cargan automáticamente

### Guardar Durante el Juego
- **Automático**: Cada 5 minutos
- **Manual**: Botón "Guardar" en la interfaz
- **Al salir**: Guardado automático al cerrar

## Ventajas del Sistema

1. **Organización**: Estructura clara y lógica
2. **Escalabilidad**: Fácil agregar nuevas campañas
3. **Persistencia**: Datos seguros y organizados
4. **IA-friendly**: Estructura optimizada para la IA
5. **Portabilidad**: Archivos JSON fáciles de mover/copiar
6. **Debugging**: Fácil inspección de datos
7. **Backup**: Estructura simple para respaldos

## Archivos del Sistema

- `src/utils/gameSaveService.js`: Servicio principal de guardado
- `src/components/CampaignManager.jsx`: Gestor de campañas
- `src/components/GameArea.jsx`: Integración con el juego
- `src/App.jsx`: Orquestación del sistema

## Notas Técnicas

- Todos los archivos usan formato JSON con indentación de 2 espacios
- Timestamps en formato ISO 8601
- IDs únicos para cada entrada en las bitácoras
- Fallback automático a localStorage en navegador
- Manejo de errores robusto con logging
- Compatibilidad con Electron y navegador web

# Sistema de Carpeta de Personajes - Configuración

## Descripción

El sistema de carpeta de personajes permite que la aplicación D&D Solitario guarde automáticamente los personajes en archivos JSON en una carpeta local, en lugar de usar solo localStorage del navegador. Esto es especialmente útil para instaladores y aplicaciones Electron.

## Características

- **Detección automática**: La aplicación detecta automáticamente si está ejecutándose en Electron o navegador
- **Fallback inteligente**: Si no está disponible el sistema de archivos, usa localStorage como respaldo
- **Carpeta automática**: Crea automáticamente la carpeta `characters` si no existe
- **Compatibilidad**: Funciona tanto en modo navegador como en aplicaciones Electron

## Configuración Automática

### Para Desarrolladores

1. **Ejecutar el script de configuración**:
   ```bash
   npm run setup-characters
   # o
   node setup-characters-folder.js
   ```

2. **El script automáticamente**:
   - Crea la carpeta `characters` si no existe
   - Verifica permisos de escritura
   - Crea archivos de documentación (README.md, .gitignore)
   - Muestra estadísticas de la carpeta

### Para Instaladores

Si estás creando un instalador para la aplicación, incluye estos pasos:

1. **Después de instalar la aplicación**, ejecuta:
   ```bash
   node setup-characters-folder.js
   ```

2. **O integra la lógica en tu instalador**:
   ```javascript
   const fs = require('fs');
   const path = require('path');
   
   // Crear carpeta de personajes
   const charactersPath = path.join(installPath, 'characters');
   if (!fs.existsSync(charactersPath)) {
     fs.mkdirSync(charactersPath, { recursive: true });
   }
   ```

## Estructura de Archivos

```
proyecto/
├── characters/                    # Carpeta de personajes
│   ├── README.md                 # Documentación de la carpeta
│   ├── .gitignore               # Configuración de Git
│   ├── ejemplo_personaje.json   # Personaje de ejemplo
│   └── [otros personajes].json  # Personajes del usuario
├── setup-characters-folder.js   # Script de configuración
└── CHARACTERS_FOLDER_SETUP.md   # Esta documentación
```

## Formato de Personajes

Cada personaje se guarda como un archivo JSON con esta estructura:

```json
{
  "id": "1703123456789",
  "name": "Nombre del Personaje",
  "data": {
    "name": "Nombre del Personaje",
    "class": "Guerrero",
    "level": 5,
    "strength": 16,
    "dexterity": 14,
    // ... resto de datos del personaje
  },
  "savedAt": "2024-01-01T00:00:00.000Z",
  "lastModified": "2024-01-01T00:00:00.000Z"
}
```

## Funcionamiento de la Aplicación

### Detección de Entorno

La aplicación detecta automáticamente el entorno:

- **Electron**: Usa sistema de archivos local
- **Otros entornos**: Usa almacenamiento local como fallback silencioso

### Indicador Visual

La interfaz muestra el sistema de archivos cuando está disponible:

- 💾 **Sistema de Archivos Activo**: Verde - Personajes se guardan en archivos JSON
- Cuando no está disponible, funciona silenciosamente con almacenamiento local

### Operaciones Soportadas

- ✅ Guardar personaje nuevo
- ✅ Cargar personaje existente
- ✅ Actualizar personaje
- ✅ Eliminar personaje
- ✅ Exportar a JSON
- ✅ Importar desde JSON

## Ventajas del Sistema

### Para Usuarios
- **Persistencia**: Los personajes se mantienen entre sesiones
- **Portabilidad**: Pueden mover/copiar personajes fácilmente
- **Respaldo**: Fácil hacer copias de seguridad
- **Compartir**: Pueden compartir personajes con otros jugadores

### Para Desarrolladores
- **Flexibilidad**: Funciona en múltiples entornos
- **Escalabilidad**: No limitado por localStorage
- **Mantenimiento**: Fácil de debuggear y mantener
- **Instaladores**: Integración sencilla con instaladores

## Troubleshooting

### Problemas Comunes

1. **"Error de permisos"**
   - Verificar que la carpeta tenga permisos de escritura
   - Ejecutar como administrador si es necesario

2. **"Carpeta no encontrada"**
   - Ejecutar `npm run setup-characters`
   - Verificar que la ruta sea correcta

3. **"Personajes no se cargan"**
   - Verificar que los archivos JSON sean válidos
   - Revisar la consola del navegador para errores

### Logs de Debug

La aplicación muestra logs en la consola:
```
Sistema de archivos disponible - usando carpeta de personajes
Carpeta de personajes creada: /path/to/characters
Personaje guardado en archivo: /path/to/characters/nombre.json
```

## Integración con Instaladores

### NSIS (Windows)
```nsi
; Crear carpeta de personajes
CreateDirectory "$INSTDIR\characters"
SetOutPath "$INSTDIR\characters"
File "README.md"
File ".gitignore"
```

### Inno Setup (Windows)
```pascal
[Files]
Source: "characters\*"; DestDir: "{app}\characters"; Flags: recursesubdirs

[Dirs]
Name: "{app}\characters"
```

### DMG (macOS)
```bash
# En el script de instalación
mkdir -p "/Applications/D&D Solitario.app/Contents/Resources/characters"
```

### AppImage (Linux)
```bash
# En el script de instalación
mkdir -p "$HOME/.local/share/dnd-solitario/characters"
```

## Mantenimiento

### Limpieza Periódica
- Revisar archivos corruptos
- Eliminar personajes no utilizados
- Verificar permisos de carpeta

### Migración
- Los personajes existentes en localStorage se mantienen
- Pueden migrarse manualmente si es necesario
- La aplicación maneja ambos sistemas automáticamente

## Seguridad

- Los archivos JSON contienen solo datos del personaje
- No se almacenan contraseñas ni información sensible
- Los archivos pueden ser editados manualmente (con precaución)
- Se recomienda hacer copias de seguridad regulares

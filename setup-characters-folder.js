#!/usr/bin/env node

/**
 * Script de configuración para crear la carpeta de personajes
 * Ejecutar con: node setup-characters-folder.js
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Obtener la ruta del directorio raíz del proyecto
const projectRoot = __dirname;
const charactersFolderPath = path.join(projectRoot, 'characters');

log('🚀 Iniciando configuración de carpeta de personajes...', 'bright');

// Verificar si la carpeta ya existe
if (fs.existsSync(charactersFolderPath)) {
  logSuccess(`La carpeta 'characters' ya existe en: ${charactersFolderPath}`);
  
  // Verificar permisos de escritura
  try {
    const testFile = path.join(charactersFolderPath, '.test-write');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    logSuccess('Permisos de escritura verificados correctamente');
  } catch (error) {
    logError(`Error de permisos en la carpeta: ${error.message}`);
    process.exit(1);
  }
} else {
  // Crear la carpeta
  try {
    fs.mkdirSync(charactersFolderPath, { recursive: true });
    logSuccess(`Carpeta 'characters' creada en: ${charactersFolderPath}`);
  } catch (error) {
    logError(`Error al crear la carpeta: ${error.message}`);
    process.exit(1);
  }
}

// Crear archivo README en la carpeta de personajes
const readmePath = path.join(charactersFolderPath, 'README.md');
const readmeContent = `# Carpeta de Personajes

Esta carpeta contiene los personajes guardados de D&D Solitario.

## Estructura
- Los personajes se guardan como archivos JSON individuales
- Cada archivo contiene toda la información del personaje
- Los archivos se pueden importar/exportar fácilmente

## Formato de archivo
Cada personaje se guarda con la siguiente estructura:
\`\`\`json
{
  "id": "timestamp",
  "name": "Nombre del Personaje",
  "data": {
    // Datos completos del personaje
  },
  "savedAt": "2024-01-01T00:00:00.000Z",
  "lastModified": "2024-01-01T00:00:00.000Z"
}
\`\`\`

## Notas
- No elimines ni modifiques manualmente los archivos mientras la aplicación esté ejecutándose
- Los personajes se pueden compartir copiando los archivos JSON
- La aplicación detecta automáticamente esta carpeta al iniciar
`;

if (!fs.existsSync(readmePath)) {
  try {
    fs.writeFileSync(readmePath, readmeContent);
    logSuccess('Archivo README.md creado en la carpeta de personajes');
  } catch (error) {
    logWarning(`No se pudo crear el README.md: ${error.message}`);
  }
} else {
  logInfo('El archivo README.md ya existe en la carpeta de personajes');
}

// Crear archivo .gitignore en la carpeta de personajes si no existe
const gitignorePath = path.join(charactersFolderPath, '.gitignore');
const gitignoreContent = `# Ignorar todos los archivos de personajes por defecto
# Descomenta las líneas siguientes si quieres incluir personajes específicos en el repositorio

# Ignorar todos los personajes
*.json

# Para incluir personajes específicos, comenta la línea anterior y descomenta las siguientes:
# !ejemplo_personaje.json
# !personaje_demo.json
`;

if (!fs.existsSync(gitignorePath)) {
  try {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    logSuccess('Archivo .gitignore creado en la carpeta de personajes');
  } catch (error) {
    logWarning(`No se pudo crear el .gitignore: ${error.message}`);
  }
} else {
  logInfo('El archivo .gitignore ya existe en la carpeta de personajes');
}

// Verificar si hay personajes de ejemplo
const exampleCharacterPath = path.join(charactersFolderPath, 'ejemplo_personaje.json');
if (!fs.existsSync(exampleCharacterPath)) {
  logInfo('No se encontró personaje de ejemplo. Puedes crear uno manualmente o usar la aplicación para crear personajes.');
} else {
  logSuccess('Se encontró un personaje de ejemplo en la carpeta');
}

// Mostrar estadísticas
try {
  const files = fs.readdirSync(charactersFolderPath);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  const otherFiles = files.filter(file => !file.endsWith('.json'));
  
  logInfo(`\n📊 Estadísticas de la carpeta:`);
  logInfo(`   - Archivos JSON (personajes): ${jsonFiles.length}`);
  logInfo(`   - Otros archivos: ${otherFiles.length}`);
  
  if (jsonFiles.length > 0) {
    logInfo(`   - Personajes encontrados:`);
    jsonFiles.forEach(file => {
      logInfo(`     • ${file}`);
    });
  }
} catch (error) {
  logError(`Error al leer el contenido de la carpeta: ${error.message}`);
}

log('\n🎉 Configuración completada exitosamente!', 'bright');
logInfo('La aplicación ahora puede guardar y cargar personajes automáticamente.');
logInfo('Los personajes se guardarán en esta carpeta cuando uses la aplicación.');

// Mostrar instrucciones adicionales
log('\n📝 Instrucciones adicionales:', 'bright');
logInfo('1. Ejecuta la aplicación normalmente');
logInfo('2. Ve a "Cargar Personaje" en el menú principal');
logInfo('3. La aplicación detectará automáticamente esta carpeta');
logInfo('4. Los personajes se guardarán aquí automáticamente');

log('\n🔧 Para instaladores:', 'bright');
logInfo('Si estás creando un instalador, ejecuta este script después de instalar la aplicación');
logInfo('para asegurar que la carpeta de personajes esté disponible.');

// Datos de conjuros simplificados
import spellsJson from './spells.json'

// Exportar los datos directamente
export const spellsData = spellsJson.spells
export const classAvailability = spellsJson.classAvailability

// === MAPA de normalización de clases (es -> en y en -> es) ===
const CLASS_KEY_MAP = {
  // español -> inglés
  bardo: 'bard',
  brujo: 'warlock',
  mago: 'wizard',
  clerigo: 'cleric',
  druida: 'druid',
  hechicero: 'sorcerer',
  paladin: 'paladin',
  ranger: 'ranger',
  guerrero: 'fighter',
  picaro: 'rogue',
  barbaro: 'barbarian',
  monje: 'monk',
  // y al revés (inglés -> español), por si el JSON viene en inglés
  bard: 'bardo',
  warlock: 'brujo',
  wizard: 'mago',
  cleric: 'clerigo',
  druid: 'druida',
  sorcerer: 'hechicero',
  fighter: 'guerrero',
  rogue: 'picaro',
  barbarian: 'barbaro',
  monk: 'monje'
}

export function normalizeClassKey(input) {
  if (!input) return ''
  const k = String(input).toLowerCase()
  
  // Como las claves del JSON están en español, devuelvo la clave tal como está
  // Solo convierto si viene en inglés
  if (CLASS_KEY_MAP[k] && CLASS_KEY_MAP[k] !== k) {
    // Solo convierto si la clave original está en inglés (es más corta)
    const englishKeys = ['bard', 'warlock', 'wizard', 'cleric', 'druid', 'sorcerer', 'fighter', 'rogue', 'barbarian', 'monk']
    if (englishKeys.includes(k)) {
      return CLASS_KEY_MAP[k] // inglés -> español
    }
  }
  
  // Si no está en el mapa o ya está en español, la devuelvo tal como está
  return k
}

// Pasa todo classAvailability a claves en español
export function normalizeAvailability(av) {
  if (!av) return {}
  const out = {}
  for (const rawKey of Object.keys(av)) {
    const esKey = normalizeClassKey(rawKey)
    out[esKey] = av[rawKey]
  }
  return out
}

// === CONTEO DE TRUCOS POR NIVEL (PHB) ===
// Importar desde gameData.js para evitar duplicación
import { CANTRIPS_KNOWN } from './gameData.js'

export function cantripsKnownAt(classKey, level) {
  const func = CANTRIPS_KNOWN[normalizeClassKey(classKey)]
  if (!func) return 0
  return func(level)
}

// === CONTEO de CONJUROS CONOCIDOS por clase (para casters de "known spells")
// Importar desde gameData.js para evitar duplicación
import { SPELLS_KNOWN_BY_CLASS } from './gameData.js'

// Devolver "cuántos conjuros conocidos" a este nivel
export function spellsKnownAt(classKey, level) {
  const map = SPELLS_KNOWN_BY_CLASS[normalizeClassKey(classKey)]
  if (!map) return 0
  let known = 0
  for (const [lvlStr, val] of Object.entries(map)) {
    const lv = Number(lvlStr)
    if (level >= lv) known = val
  }
  return known
}

// Devuelve las claves disponibles (por clase/nivel) basadas en classAvailability
export function getAvailableSpellsForLevel(classKey, level, normalizedAvailability) {
  const esKey = normalizeClassKey(classKey)
  const classData = normalizedAvailability[esKey]
  if (!classData) return { cantrips: [], spells: [] }

  const available = { cantrips: [], spells: [] }

  if (classData.cantrips) {
    available.cantrips = Object.keys(classData.cantrips) // claves de tus cantrips
  }

  for (let spellLevel = 1; spellLevel <= 9; spellLevel++) {
    const bucket = `level${spellLevel}`
    if (classData[bucket]) {
      for (const [spellKey, unlockLevel] of Object.entries(classData[bucket])) {
        if (level >= unlockLevel) {
          available.spells.push({ key: spellKey, level: spellLevel, unlockLevel })
        }
      }
    }
  }
  return available
}

// Función para obtener conjuros disponibles para una clase y nivel específicos
export function getSpellsForClassAndLevel(className, level) {
  return getAvailableSpellsForLevel(className, level, classAvailability)
}

// Función para obtener información de un conjuro específico
export function getSpellInfo(spellKey) {
  // Buscar en trucos
  if (spellsData.cantrips && spellsData.cantrips[spellKey]) {
    return {
      ...spellsData.cantrips[spellKey],
      level: 0,
      type: 'cantrip'
    }
  }
  
  // Buscar en conjuros de nivel
  for (let level = 1; level <= 9; level++) {
    const bucket = `level${level}`
    if (spellsData[bucket] && spellsData[bucket][spellKey]) {
      return {
        ...spellsData[bucket][spellKey],
        level: level,
        type: 'spell'
      }
    }
  }
  
  return null
}

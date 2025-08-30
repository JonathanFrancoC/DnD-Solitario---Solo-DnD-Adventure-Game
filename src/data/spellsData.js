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
export const CANTRIPS_KNOWN_BY_CLASS = {
  bardo:   { 1:2, 4:3, 10:4 },
  brujo:   { 1:2, 4:3, 10:4 },
  mago:    { 1:3, 4:4, 10:5 },
  clerigo: { 1:3, 4:4, 10:5 },
  druida:  { 1:2, 4:3, 10:4 },
  hechicero: { 1:4, 4:5, 10:6 },
  paladin: { 1:0 }, ranger: { 1:0 },
  guerrero: { 1:0 }, picaro: { 1:0 }, barbaro: { 1:0 }, monje: { 1:0 },
}

export function cantripsKnownAt(classKey, level) {
  const map = CANTRIPS_KNOWN_BY_CLASS[normalizeClassKey(classKey)] || {}
  let known = 0
  for (const [lvlStr, val] of Object.entries(map)) {
    const lv = Number(lvlStr)
    if (level >= lv) known = val
  }
  return known
}

// === CONTEO de CONJUROS CONOCIDOS por clase (para casters de "known spells")
export const SPELLS_KNOWN_BY_CLASS = {
  // Valores PHB simplificados (ajústalos si usas otra progresión)
  bardo:     { 1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:14, 11:15, 12:15, 13:16, 14:18, 15:19, 16:19, 17:20, 18:22, 19:22, 20:22 },
  hechicero: { 1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:8, 8:9, 9:10, 10:11, 11:12, 12:12, 13:13, 14:13, 15:14, 16:14, 17:15, 18:15, 19:15, 20:15 },
  brujo:     { 1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:8, 8:9, 9:10, 10:10, 11:11, 12:11, 13:12, 14:12, 15:13, 16:13, 17:14, 18:14, 19:15, 20:15 },
  ranger:    { 1:0, 2:2, 3:3, 4:3, 5:4, 6:4, 7:5, 8:5, 9:5, 10:6, 11:6, 12:6, 13:7, 14:7, 15:7, 16:8, 17:8, 18:8, 19:9, 20:9 },
  paladin:   { 1:0, 2:2, 3:3, 4:3, 5:4, 6:4, 7:5, 8:5, 9:5, 10:6, 11:6, 12:6, 13:7, 14:7, 15:7, 16:8, 17:8, 18:8, 19:9, 20:9 },
}

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

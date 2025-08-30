// Servicio para la integración con ChatGPT

// Configuración de la API (deberás configurar tu API key)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'tu-api-key-aqui'
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

// Para aplicaciones de escritorio, el sistema de guardado se maneja directamente
// No necesitamos importaciones web aquí

// Prompt maestro detallado para el DM
const DM_PROMPT = `Eres un Dungeon Master (DM) experto de D&D 5ª edición para una campaña en solitario. Sigue estrictamente estas reglas:

## 0) PRINCIPIOS FUNDAMENTALES
- **Fidelidad 5e (RAW)**: Combate, habilidades, descansos, condiciones, muerte según reglas oficiales
- **Azar puro**: El jugador tira por su PJ; tú tiras por PNJs/aliados/enemigos. NO alteres resultados
- **Consecuencias reales**: Fallar genera complicaciones interesantes; NUNCA "no pasa nada"
- **Memoria y coherencia**: PNJs recuerdan acciones, rasgos y relaciones a lo largo del tiempo
- **Transparencia táctica a petición**: Da estado táctico completo solo cuando el jugador lo pida
- **Ambientación**: Era medieval cruda (sin pólvora/tecnología moderna)

## 1) FLUJO DE JUEGO
1. El jugador declara intención/acción de su PJ
2. Tú enmarcas la escena y pides tiradas cuando haya riesgo o incertidumbre (NO reveles la CD)
3. Resuelves con éxito/fallo/éxito parcial y consecuencias claras
4. El mundo reacciona (PNJs con agencia; facciones avanzan sus planes)

## 2) COMBATE (ESTRICTO 5e)
- **Iniciativa**: Todos tiran (mooks pueden compartir)
- **Turnos**: Especifica Acción, Acción adicional y Reacción cuando aplique
- **Ready (RAW)**: No existe Delay clásico
- **Sorpresa/sigilo**: Sigilo vs Percepción pasiva; si hay duda, tiradas enfrentadas
- **Ventaja/Desventaja**: Cuando proceda (luz, terreno, condiciones, etc.)
- **No letal**: Si lo declara con arma C/C, el objetivo estabiliza a 0 PG
- **Fin del combate**: Contempla rendición/retirada/negociación cuando tenga sentido

## 3) DIFICULTADES Y TIRADAS
- **CD guía**: 10 fácil, 12 moderada, 15 desafiante, 18 difícil, 20 muy difícil, 25 épica
- **Éxito parcial**: Si roza la CD, permite avance con coste/complicación clara
- **Herramientas/kits**: Aplícalos cuando tengan sentido

## 4) DESCANSO, FATIGA Y ENTORNO
- **Short rest**: 1h; gastar DG; rasgos que recuperan en SR
- **Long rest**: 8h (≥6 dormir, ≤2 actividad ligera)
- **Marcha forzada**: >8h/día → por hora extra, TS CON DC 10 +1/h; fallo = 1 Agotamiento
- **Dormir mal**: LR en frío/humedad/sin equipo → TS CON DC 12; fallo = sin beneficios
- **Clima severo**: cada 8h → TS CON DC 10–15; fallo = Agotamiento
- **Agotamiento (RAW)**: N1 pruebas–, N2 vel 1/2, N3 ataques/TS–, N4 PG máx 1/2, N5 vel 0, N6 muerte

## 5) EXPLORACIÓN Y VIAJES
- Alterna encuentros aleatorios y narrativos
- Especifica hora del día, clima, terreno, referencias y peligros
- Ritmo: lento/normal/rápido y sus efectos

## 6) ECONOMÍA Y EQUIPO
- Rastreo de oro y equipo clave visible
- Regateo: Persuasión/Engaño/Intimidación según abordaje
- Bienes dudosos: riesgo real de falsificación/mala calidad
- Identificación: Arcana/Investigación/Medicina/Kits según rareza

## 7) PROGRESIÓN Y NIVEL
- Subida por hitos narrativos (no solo matar)
- Todo el grupo sube junto
- Al subir, ayuda a elegir (pros/cons claros)

## 8) TONO Y SEGURIDAD
- PEGI 16: violencia moderada; evita gore innecesario
- Moral gris: decisiones con consecuencias sociales/políticas
- Nivel descriptivo ajustable a petición

## 9) PNJs CON AGENCIA
- PNJs con objetivos, manías, miedos y voz coherente
- Aliados actúan según su carácter
- Criminales/facciones duras son desconfiadas por defecto
- Acciones compasivas/incongruentes aumentan Sospecha

## 10) RELOJES DE FACCIÓN
- Cada facción/amenaza clave tiene un reloj de 4/6/8 segmentos
- Avance al final del día según acciones del jugador
- Al completarse un reloj, dispara evento

## 11) COMPORTAMIENTO TÁCTICO
Los enemigos y aliados actúan según atributos, trasfondo y moral:
- **Bruto (STR alta, INT baja)**: Carga, bloquea, empuja; rompe cobertura
- **Duelista/Velocista (DEX alta)**: Emboscada/ángulos; prioriza blandos
- **Muralla (CON alta)**: Línea/embudo; protege líderes/casters
- **Estratega (INT alta)**: Evalúa 1 ronda; prioriza control/terreno
- **Centinela (WIS alta)**: Vigila infiltración; niega sigilo
- **Líder/Carismático (CHA alta)**: Coordina/ayuda; parley si conviene

## 12) MAGIA Y CONDICIONES
- Prioriza control de campo cuando tenga sentido
- Aplica condiciones RAW (prone, grapple, restrained, blinded, frightened, etc.)
- Usa iluminación/humo/agua/estrechos según ficción

## 13) ANIMALES/COMPAÑEROS
- Con vínculo, permite órdenes simples con Manejo de Animales
- Terceros reaccionan con alarma/curiosidad/temor según criatura

## REGLAS ESPECÍFICAS PARA ESTA SESIÓN:
- Responde en español
- Sé descriptivo pero conciso
- Mantén un tono épico pero accesible
- Pide tiradas cuando haya riesgo o incertidumbre
- NO reveles la CD de las tiradas
- Mantén coherencia en PNJs y mundo

## SISTEMA DE GUARDADO Y CAMPAÑA:
- Si hay una campaña activa, tendrás acceso a todos los personajes guardados
- Los personajes se guardan automáticamente al completar su creación
- Puedes referenciar personajes existentes por nombre o ID
- El estado del mundo incluye ubicación actual, encuentros activos, etc.
- Usa la información de la campaña para mantener coherencia narrativa

Estado actual del juego:
`

// Función para obtener el estado completo de la campaña
// En aplicaciones de escritorio, esto se maneja directamente desde el componente principal
async function getCampaignState(campaignId) {
  // Para aplicaciones de escritorio, el estado de la campaña se pasa directamente
  // desde el componente principal que tiene acceso al sistema de archivos
  return {
    campaign: null,
    characters: [],
    worldState: null,
    error: 'Estado de campaña no disponible en esta versión'
  };
}

// Prompt para el asistente
const ASSISTANT_PROMPT = `Eres un asistente experto en D&D 5e. Tu trabajo es:

1. Responder preguntas sobre reglas y mecánicas del juego
2. Ayudar con la creación de personajes
3. Explicar conceptos del juego de manera clara
4. Sugerir estrategias y consejos
5. Resolver dudas sobre el sistema

Reglas importantes:
- Usa las reglas oficiales de D&D 5e
- Sé claro y conciso en tus explicaciones
- Responde en español
- Si no estás seguro de algo, dilo claramente
- Proporciona ejemplos cuando sea útil

`

export const sendMessageToDM = async (message, gameState, campaignId = null) => {
  try {
    // Obtener estado completo de la campaña si hay una activa
    let campaignState = null;
    if (campaignId) {
      campaignState = await getCampaignState(campaignId);
    }
    
    // Combinar el estado del juego con el estado de la campaña
    const fullGameState = {
      ...gameState,
      campaign: campaignState
    };
    
    const systemPrompt = DM_PROMPT + JSON.stringify(fullGameState, null, 2)
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Acción del jugador: ${message}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content

  } catch (error) {
    console.error('Error al comunicarse con el DM:', error)
    
    // Respuesta de fallback si no hay conexión a la API
    return `El DM está temporalmente indisponible. Tu acción "${message}" ha sido registrada. 

Por favor, intenta de nuevo en unos momentos o verifica tu conexión a internet.

Mientras tanto, puedes:
- Revisar tu inventario y estadísticas
- Planificar tu próxima acción
- Usar el chat lateral para hacer preguntas sobre las reglas`
  }
}

export const sendMessageToAssistant = async (message, gameState, campaignId = null) => {
  try {
    // Obtener estado completo de la campaña si hay una activa
    let campaignState = null;
    if (campaignId) {
      campaignState = await getCampaignState(campaignId);
    }
    
    // Combinar el estado del juego con el estado de la campaña
    const fullGameState = {
      ...gameState,
      campaign: campaignState
    };
    
    const systemPrompt = ASSISTANT_PROMPT + 
      (fullGameState ? `\nEstado actual del juego:\n${JSON.stringify(fullGameState, null, 2)}` : '')

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content

  } catch (error) {
    console.error('Error al comunicarse con el asistente:', error)
    
    // Respuesta de fallback
    return `Lo siento, el asistente está temporalmente indisponible. 

Algunas respuestas comunes a tu pregunta "${message}":

**Reglas básicas:**
- Para atacar: tira 1d20 + modificadores vs CA del objetivo
- Para salvar: tira 1d20 + modificador de la característica vs CD
- Para habilidades: tira 1d20 + modificador de la habilidad

**Creación de personajes:**
- Elige una raza y clase
- Distribuye 25 puntos en características (mínimo 8, máximo 18)
- Calcula HP, CA y modificadores
- Selecciona equipo inicial

Por favor, intenta de nuevo en unos momentos.`
  }
}

// Función para simular tiradas de dados (fallback)
export const rollDice = (diceNotation) => {
  const match = diceNotation.match(/(\d+)d(\d+)/)
  if (!match) return null
  
  const numDice = parseInt(match[1])
  const dieSize = parseInt(match[2])
  let total = 0
  
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * dieSize) + 1
  }
  
  return total
}

// Función para validar API key
export const validateAPIKey = async () => {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      })
    })
    
    return response.ok
  } catch (error) {
    return false
  }
}

// Funciones para aplicaciones de escritorio
// Estas funciones se manejan directamente desde el componente principal
export const updateWorldState = async (campaignId, worldState) => {
  console.log('Actualización de estado del mundo:', { campaignId, worldState });
  return true;
}

export const getCharacterInfo = async (campaignId, characterId) => {
  console.log('Obteniendo información del personaje:', { campaignId, characterId });
  return null;
}

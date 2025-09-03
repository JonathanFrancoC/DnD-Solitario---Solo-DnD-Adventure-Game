// Servicio para la integración con ChatGPT

// Configuración de la API
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

// Función para obtener la API key del usuario
const getApiKey = async () => {
  try {
    if (window.electronAPI) {
      // Para aplicaciones de escritorio
      return await window.electronAPI.getApiKey();
    } else {
      // Para versión web
      return localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY || '';
    }
  } catch (error) {
    console.error('Error al obtener API key:', error);
    return '';
  }
};

// Para aplicaciones de escritorio, el sistema de guardado se maneja directamente
// No necesitamos importaciones web aquí

// Prompt maestro detallado para el DM
const DM_PROMPT_BASE = `Eres un Dungeon Master (DM) experto de D&D 5ª edición para una campaña en solitario. Sigue estrictamente estas reglas:

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

## 14) ACCIONES ESPECIALES DEL JUGADOR
El jugador tiene acceso a tres acciones especiales que solo se pueden usar cuando tú las apruebes:

### DESCANSO CORTO
- **Cuándo aprobar**: Cuando el jugador esté en un lugar seguro, sin amenazas inmediatas, y haya pasado al menos 1 hora desde el último descanso corto
- **Condiciones**: El lugar debe ser relativamente tranquilo (taberna, campamento seguro, posada, etc.)
- **Frase de aprobación**: "Puedes tomar un descanso corto aquí" o "Es seguro tomar un descanso corto"
- **Efectos**: Recupera algunos puntos de vida y recursos limitados

### DESCANSO LARGO
- **Cuándo aprobar**: Cuando el jugador esté en un lugar completamente seguro, sin amenazas, y sea apropiado para dormir 8 horas
- **Condiciones**: Posada, campamento bien protegido, casa de aliados, etc.
- **Frase de aprobación**: "Puedes tomar un descanso largo aquí" o "Es seguro tomar un descanso largo"
- **Efectos**: Recupera todos los puntos de vida y recursos

### SUBIR DE NIVEL
- **Cuándo aprobar**: Cuando el jugador haya completado un hito narrativo significativo (derrotar un jefe, completar una misión importante, resolver un conflicto mayor)
- **Condiciones**: Debe haber una pausa natural en la acción, no en medio de combate o peligro
- **Frase de aprobación**: "Puedes subir de nivel" o "Es momento de subir de nivel"
- **Efectos**: Incrementa el nivel del personaje y sus capacidades

**IMPORTANTE**: Solo aprueba estas acciones cuando sea narrativamente apropiado. No las apruebes en medio de combate, en lugares peligrosos, o cuando no tenga sentido lógico.

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

## GENERACIÓN DE PERSONAJES POR IA:
- Puedes generar personajes NPC (compañeros o villanos) cuando sea narrativamente apropiado
- Para generar un compañero: "Generar compañero [clase opcional] [alineamiento opcional]"
- Para generar un villano: "Generar villano [clase opcional] [alineamiento opcional]"
- Los personajes se generan con personalidades basadas en su alineamiento y trasfondo
- Los personajes generados se guardan automáticamente en la carpeta correspondiente
- Usa estos personajes para enriquecer la narrativa y crear encuentros más dinámicos

`

// Función para generar modificadores de prompt basados en las opciones
const generatePromptModifiers = (gameOptions = {}) => {
  let modifiers = '';
  
  // Modificadores por clasificación de contenido
  switch (gameOptions.contentRating) {
    case 'Family':
      modifiers += '## TONO Y SEGURIDAD: PEGI 7 - Contenido familiar\n';
      modifiers += '- Violencia mínima, sin descripciones gráficas\n';
      modifiers += '- Enfoque en aventura y descubrimiento\n';
      modifiers += '- PNJs amigables y cooperativos\n';
      modifiers += '- Evita temas maduros o complejos\n\n';
      break;
    case 'PG-13':
      modifiers += '## TONO Y SEGURIDAD: PEGI 13 - Adolescente\n';
      modifiers += '- Violencia moderada, evita gore innecesario\n';
      modifiers += '- Contenido apropiado para adolescentes\n';
      modifiers += '- Moral gris pero accesible\n';
      modifiers += '- Nivel descriptivo moderado\n\n';
      break;
    case 'PG-16':
      modifiers += '## TONO Y SEGURIDAD: PEGI 16 - Maduro\n';
      modifiers += '- Violencia moderada, contenido maduro permitido\n';
      modifiers += '- Temas complejos y decisiones difíciles\n';
      modifiers += '- Moral ambigua y consecuencias reales\n';
      modifiers += '- Descripciones más detalladas\n\n';
      break;
    case 'PG-18':
      modifiers += '## TONO Y SEGURIDAD: PEGI 18 - Adulto\n';
      modifiers += '- Contenido adulto, violencia gráfica permitida\n';
      modifiers += '- Temas maduros y complejos\n';
      modifiers += '- Moral muy gris y consecuencias severas\n';
      modifiers += '- Descripciones detalladas y realistas\n\n';
      break;
  }

  // Modificadores por nivel de violencia
  switch (gameOptions.violenceLevel) {
    case 'minimal':
      modifiers += '## VIOLENCIA: Mínima\n';
      modifiers += '- Combate sin descripciones gráficas\n';
      modifiers += '- Enfoque en resolución pacífica\n';
      modifiers += '- Consecuencias no letales cuando sea posible\n\n';
      break;
    case 'moderate':
      modifiers += '## VIOLENCIA: Moderada\n';
      modifiers += '- Combate realista sin excesos\n';
      modifiers += '- Descripciones apropiadas para la edad\n';
      modifiers += '- Consecuencias reales pero no excesivas\n\n';
      break;
    case 'intense':
      modifiers += '## VIOLENCIA: Intensa\n';
      modifiers += '- Combate detallado y realista\n';
      modifiers += '- Descripciones vívidas de batalla\n';
      modifiers += '- Consecuencias severas y permanentes\n\n';
      break;
    case 'graphic':
      modifiers += '## VIOLENCIA: Gráfica\n';
      modifiers += '- Combate muy detallado y visceral\n';
      modifiers += '- Descripciones explícitas de daño\n';
      modifiers += '- Consecuencias extremas y traumáticas\n\n';
      break;
  }

  // Modificadores por estilo de mundo
  switch (gameOptions.worldStyle) {
    case 'medieval':
      modifiers += '## MUNDO: Medieval\n';
      modifiers += '- Era medieval cruda (sin pólvora/tecnología moderna)\n';
      modifiers += '- Sociedad feudal y jerárquica\n';
      modifiers += '- Tecnología básica y artesanal\n\n';
      break;
    case 'renaissance':
      modifiers += '## MUNDO: Renacimiento\n';
      modifiers += '- Renacimiento temprano con pólvora básica\n';
      modifiers += '- Sociedad en transición\n';
      modifiers += '- Tecnología emergente\n\n';
      break;
    case 'steampunk':
      modifiers += '## MUNDO: Steampunk\n';
      modifiers += '- Tecnología de vapor y engranajes\n';
      modifiers += '- Sociedad industrial temprana\n';
      modifiers += '- Magia y tecnología combinadas\n\n';
      break;
    case 'modern':
      modifiers += '## MUNDO: Moderno\n';
      modifiers += '- Época moderna con magia\n';
      modifiers += '- Tecnología actual disponible\n';
      modifiers += '- Sociedad contemporánea\n\n';
      break;
  }

  // Modificadores por dificultad
  switch (gameOptions.difficulty) {
    case 'easy':
      modifiers += '## DIFICULTAD: Fácil\n';
      modifiers += '- CD más bajas (8-12 para tareas normales)\n';
      modifiers += '- Enemigos más débiles y menos inteligentes\n';
      modifiers += '- Más oportunidades de recuperación\n';
      modifiers += '- Éxito parcial más generoso\n\n';
      break;
    case 'normal':
      modifiers += '## DIFICULTAD: Normal\n';
      modifiers += '- CD estándar según reglas (10-15 para tareas normales)\n';
      modifiers += '- Enemigos con inteligencia estándar\n';
      modifiers += '- Consecuencias balanceadas\n\n';
      break;
    case 'hard':
      modifiers += '## DIFICULTAD: Difícil\n';
      modifiers += '- CD más altas (12-18 para tareas normales)\n';
      modifiers += '- Enemigos más inteligentes y tácticos\n';
      modifiers += '- Consecuencias más severas\n';
      modifiers += '- Menos oportunidades de recuperación\n\n';
      break;
    case 'brutal':
      modifiers += '## DIFICULTAD: Brutal\n';
      modifiers += '- CD muy altas (15-25 para tareas normales)\n';
      modifiers += '- Enemigos extremadamente tácticos\n';
      modifiers += '- Consecuencias devastadoras\n';
      modifiers += '- Muerte frecuente\n\n';
      break;
  }

  // Modificadores por estilo de combate
  switch (gameOptions.combatStyle) {
    case 'cinematic':
      modifiers += '## COMBATE: Cinemático\n';
      modifiers += '- Acciones épicas y dramáticas\n';
      modifiers += '- Descripciones cinematográficas\n';
      modifiers += '- Énfasis en la narrativa sobre la táctica\n';
      modifiers += '- Momentos heroicos frecuentes\n\n';
      break;
    case 'tactical':
      modifiers += '## COMBATE: Táctico\n';
      modifiers += '- Énfasis en posicionamiento y estrategia\n';
      modifiers += '- Uso inteligente del terreno\n';
      modifiers += '- Coordinación entre enemigos\n';
      modifiers += '- Consecuencias tácticas reales\n\n';
      break;
    case 'realistic':
      modifiers += '## COMBATE: Realista\n';
      modifiers += '- Consecuencias reales y peligrosas\n';
      modifiers += '- Daño permanente frecuente\n';
      modifiers += '- Enemigos que huyen cuando es inteligente\n';
      modifiers += '- Efectos de heridas a largo plazo\n\n';
      break;
    case 'fast':
      modifiers += '## COMBATE: Rápido\n';
      modifiers += '- Combates dinámicos y fluidos\n';
      modifiers += '- Menos descripciones, más acción\n';
      modifiers += '- Resolución rápida de turnos\n';
      modifiers += '- Enfoque en la velocidad\n\n';
      break;
  }

  // Modificadores por nivel de magia
  switch (gameOptions.magicLevel) {
    case 'low':
      modifiers += '## MAGIA: Baja\n';
      modifiers += '- Magia rara y misteriosa\n';
      modifiers += '- Conjuros limitados y costosos\n';
      modifiers += '- Reacciones de miedo/sospecha hacia magos\n';
      modifiers += '- Enfoque en habilidades mundanas\n\n';
      break;
    case 'standard':
      modifiers += '## MAGIA: Estándar\n';
      modifiers += '- Magia común pero respetada\n';
      modifiers += '- Conjuros según reglas estándar\n';
      modifiers += '- Aceptación social de magos\n\n';
      break;
    case 'high':
      modifiers += '## MAGIA: Alta\n';
      modifiers += '- Magia abundante y poderosa\n';
      modifiers += '- Conjuros mejorados y variados\n';
      modifiers += '- Sociedad adaptada a la magia\n';
      modifiers += '- Soluciones mágicas frecuentes\n\n';
      break;
    case 'epic':
      modifiers += '## MAGIA: Épica\n';
      modifiers += '- Magia legendaria y transformadora\n';
      modifiers += '- Conjuros de poder increíble\n';
      modifiers += '- Mundo moldeado por la magia\n';
      modifiers += '- Efectos mágicos permanentes\n\n';
      break;
  }

  // Modificadores por estilo de exploración
  switch (gameOptions.explorationStyle) {
    case 'simple':
      modifiers += '## EXPLORACIÓN: Simple\n';
      modifiers += '- Encuentros directos y claros\n';
      modifiers += '- Pistas obvias y fáciles de seguir\n';
      modifiers += '- Menos detalles ambientales\n';
      modifiers += '- Navegación sencilla\n\n';
      break;
    case 'detailed':
      modifiers += '## EXPLORACIÓN: Detallada\n';
      modifiers += '- Descripciones ricas del entorno\n';
      modifiers += '- Pistas sutiles pero descubribles\n';
      modifiers += '- Ambiente inmersivo\n';
      modifiers += '- Múltiples rutas posibles\n\n';
      break;
    case 'immersive':
      modifiers += '## EXPLORACIÓN: Inmersiva\n';
      modifiers += '- Descripciones muy detalladas\n';
      modifiers += '- Pistas muy sutiles y complejas\n';
      modifiers += '- Ambiente altamente realista\n';
      modifiers += '- Exploración como actividad principal\n\n';
      break;
    case 'survival':
      modifiers += '## EXPLORACIÓN: Supervivencia\n';
      modifiers += '- Énfasis en recursos y supervivencia\n';
      modifiers += '- Peligros ambientales frecuentes\n';
      modifiers += '- Gestión de suministros crítica\n';
      modifiers += '- Exploración peligrosa y desafiante\n\n';
      break;
  }

  // Modificadores por estilo de rol
  switch (gameOptions.roleplayStyle) {
    case 'minimal':
      modifiers += '## ROL: Mínimo\n';
      modifiers += '- Enfoque en combate y aventura\n';
      modifiers += '- PNJs simples y directos\n';
      modifiers += '- Diálogos breves y funcionales\n';
      modifiers += '- Menos desarrollo de personajes\n\n';
      break;
    case 'balanced':
      modifiers += '## ROL: Equilibrado\n';
      modifiers += '- Balance entre acción y rol\n';
      modifiers += '- PNJs con personalidades definidas\n';
      modifiers += '- Diálogos naturales y significativos\n';
      modifiers += '- Desarrollo de personajes moderado\n\n';
      break;
    case 'heavy':
      modifiers += '## ROL: Pesado\n';
      modifiers += '- Énfasis en desarrollo de personajes\n';
      modifiers += '- PNJs complejos y memorables\n';
      modifiers += '- Diálogos extensos y significativos\n';
      modifiers += '- Arcos narrativos profundos\n\n';
      break;
    case 'theatrical':
      modifiers += '## ROL: Teatral\n';
      modifiers += '- Enfoque dramático y emocional\n';
      modifiers += '- PNJs muy expresivos y memorables\n';
      modifiers += '- Diálogos dramáticos y emotivos\n';
      modifiers += '- Momentos cinematográficos frecuentes\n\n';
      break;
  }

  // Modificadores por complejidad de IA
  switch (gameOptions.aiStyle) {
    case 'simple':
      modifiers += '## IA: Simple\n';
      modifiers += '- PNJs con motivaciones básicas\n';
      modifiers += '- Enemigos con tácticas simples\n';
      modifiers += '- Situaciones directas y claras\n';
      modifiers += '- Menos complejidad narrativa\n\n';
      break;
    case 'balanced':
      modifiers += '## IA: Equilibrada\n';
      modifiers += '- PNJs con personalidades coherentes\n';
      modifiers += '- Enemigos con tácticas inteligentes\n';
      modifiers += '- Situaciones con múltiples capas\n';
      modifiers += '- Complejidad narrativa moderada\n\n';
      break;
    case 'complex':
      modifiers += '## IA: Compleja\n';
      modifiers += '- PNJs con psicologías complejas\n';
      modifiers += '- Enemigos muy tácticos y adaptativos\n';
      modifiers += '- Situaciones con múltiples interpretaciones\n';
      modifiers += '- Alta complejidad narrativa\n\n';
      break;
    case 'mastermind':
      modifiers += '## IA: Maestra\n';
      modifiers += '- PNJs con psicologías muy complejas\n';
      modifiers += '- Enemigos geniales y manipuladores\n';
      modifiers += '- Situaciones con capas de engaño\n';
      modifiers += '- Máxima complejidad narrativa\n\n';
      break;
  }

  return modifiers;
};

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

// Importar el generador de personajes de IA
import aiCharacterGenerator from './aiCharacterGenerator.js';

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

export const sendMessageToDM = async (message, gameState, campaignId = null, gameOptions = {}) => {
  try {
    // Obtener la API key del usuario
    const apiKey = await getApiKey();
    if (!apiKey) {
      return `❌ Error: No se ha configurado la API key de OpenAI.

Para usar la IA del juego, necesitas:
1. Ir a las opciones del juego (⚙️)
2. Configurar tu API key de OpenAI
3. Obtener una key gratuita en https://platform.openai.com/api-keys

Sin la API key, la IA no puede funcionar.`;
    }

    // Verificar si el mensaje es una solicitud de generación de personaje
    const characterGenerationMatch = message.match(/^generar\s+(compañero|villano)(?:\s+(\w+))?(?:\s+([^,]+))?$/i);
    
    if (characterGenerationMatch && campaignId) {
      const role = characterGenerationMatch[1].toLowerCase();
      const classType = characterGenerationMatch[2] || null;
      const alignment = characterGenerationMatch[3] || null;
      
      try {
        const character = await generateAICharacter(role, campaignId, alignment);
        
        let response = `🎭 **Personaje ${role === 'compañero' ? 'aliado' : 'antagonista'} generado exitosamente!**\n\n`;
        response += `**Nombre:** ${character.name}\n`;
        response += `**Clase:** ${character.class}\n`;
        response += `**Raza:** ${character.race}\n`;
        response += `**Alineamiento:** ${character.alignment}\n`;
        response += `**Trasfondo:** ${character.background}\n\n`;
        response += `**Personalidad:**\n`;
        response += `- Rasgo: ${character.personalityTrait}\n`;
        response += `- Ideal: ${character.ideal}\n`;
        response += `- Vínculo: ${character.bond}\n`;
        response += `- Defecto: ${character.flaw}\n\n`;
        response += `**Historia:** ${character.backstory}\n\n`;
        response += `El personaje ha sido guardado automáticamente en la carpeta de ${role === 'compañero' ? 'compañeros' : 'villanos'} de la campaña.`;
        
        return response;
      } catch (error) {
        return `❌ Error generando personaje: ${error.message}`;
      }
    }

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
    
    // Generar modificadores de prompt basados en las opciones
    const promptModifiers = generatePromptModifiers(gameOptions);
    
    // Combinar el prompt base con los modificadores
    const systemPrompt = DM_PROMPT_BASE + promptModifiers + 
      `Estado actual del juego:\n${JSON.stringify(fullGameState, null, 2)}`;
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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

export const sendMessageToAssistant = async (message, gameState, campaignId = null, gameOptions = {}) => {
  try {
    // Obtener la API key del usuario
    const apiKey = await getApiKey();
    if (!apiKey) {
      return `❌ Error: No se ha configurado la API key de OpenAI.

Para usar el asistente de IA, necesitas:
1. Ir a las opciones del juego (⚙️)
2. Configurar tu API key de OpenAI
3. Obtener una key gratuita en https://platform.openai.com/api-keys

Sin la API key, el asistente no puede funcionar.`;
    }

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
    
    // Generar modificadores de prompt basados en las opciones
    const promptModifiers = generatePromptModifiers(gameOptions);
    
    const systemPrompt = ASSISTANT_PROMPT + promptModifiers + 
      (fullGameState ? `\nEstado actual del juego:\n${JSON.stringify(fullGameState, null, 2)}` : '')

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
    const apiKey = await getApiKey();
    if (!apiKey) {
      return false;
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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

// Función para generar un resumen de las opciones de juego
export const generateGameOptionsSummary = (gameOptions) => {
  const summaries = [];
  
  if (gameOptions.contentRating) {
    summaries.push(`🎭 ${gameOptions.contentRating}`);
  }
  if (gameOptions.violenceLevel) {
    summaries.push(`⚔️ ${gameOptions.violenceLevel}`);
  }
  if (gameOptions.worldStyle) {
    summaries.push(`🌍 ${gameOptions.worldStyle}`);
  }
  if (gameOptions.difficulty) {
    summaries.push(`📊 ${gameOptions.difficulty}`);
  }
  if (gameOptions.combatStyle) {
    summaries.push(`⚔️ ${gameOptions.combatStyle}`);
  }
  if (gameOptions.magicLevel) {
    summaries.push(`🔮 ${gameOptions.magicLevel}`);
  }
  if (gameOptions.explorationStyle) {
    summaries.push(`🗺️ ${gameOptions.explorationStyle}`);
  }
  if (gameOptions.roleplayStyle) {
    summaries.push(`🎭 ${gameOptions.roleplayStyle}`);
  }
  if (gameOptions.aiStyle) {
    summaries.push(`🤖 ${gameOptions.aiStyle}`);
  }
  
  return summaries.join(' | ');
};

// Función para verificar si la API key está configurada
export const isApiKeyConfigured = async () => {
  const apiKey = await getApiKey();
  return apiKey && apiKey.startsWith('sk-');
};

// Función para generar personajes por IA
export const generateAICharacter = async (role, campaignId, alignment = null) => {
  try {
    const character = aiCharacterGenerator.generateRandomCharacter(role, alignment);
    await aiCharacterGenerator.saveAICharacter(character, campaignId);
    return character;
  } catch (error) {
    console.error('Error generando personaje de IA:', error);
    throw error;
  }
};

// Función para generar múltiples personajes por IA
export const generateMultipleAICharacters = async (count, role, campaignId, alignment = null) => {
  try {
    const characters = await aiCharacterGenerator.generateMultipleCharacters(count, role, campaignId, alignment);
    return characters;
  } catch (error) {
    console.error('Error generando múltiples personajes de IA:', error);
    throw error;
  }
};

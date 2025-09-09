// Servicio para la integración con IA (OpenAI y Ollama) - Solo Electron

// Función para obtener la configuración de IA del usuario
const getAIConfig = async () => {
  try {
    if (window.electronAPI) {
      const config = await window.electronAPI.getAIConfig();
      return config;
    } else {
      throw new Error('Esta aplicación solo funciona en Electron');
    }
  } catch (error) {
    console.error('Error al obtener configuración de IA:', error);
    return { provider: 'openai', apiKey: '', ollamaUrl: 'http://localhost:11434' };
  }
};

// Sistema de guardado manejado directamente desde Electron

// Función para hacer llamadas a Ollama
const callOllama = async (message, systemPrompt, ollamaUrl = 'http://localhost:11434', model = 'llama3.2') => {
  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
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
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 2000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error de Ollama: ${response.status}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Error al comunicarse con Ollama:', error);
    throw error;
  }
};

// Función para reconocer funciones específicas del juego en el mensaje del jugador
const recognizeGameFunctions = (message, gameState) => {
  const functions = {
    diceRolls: [],
    combatActions: [],
    characterActions: [],
    worldInteractions: [],
    narrativeElements: []
  };

  // Reconocer tiradas de dados
  const dicePattern = /tir[ao]?\s+(\d*d\d+(?:\+\d+)?)/gi;
  const diceMatches = message.match(dicePattern);
  if (diceMatches) {
    functions.diceRolls = diceMatches.map(match => ({
      type: 'dice_roll',
      notation: match,
      context: 'player_requested'
    }));
  }

  // Reconocer acciones de combate
  const combatActions = ['atacar', 'defender', 'esquivar', 'correr', 'desenganchar', 'ayudar', 'ocultarse', 'empujar'];
  combatActions.forEach(action => {
    if (message.toLowerCase().includes(action)) {
      functions.combatActions.push({
        type: 'combat_action',
        action: action,
        context: 'player_declared'
      });
    }
  });

  // Reconocer habilidades de clase
  const classAbilities = ['furia', 'ki', 'inspiración', 'castigo divino', 'ataque furtivo', 'second wind'];
  classAbilities.forEach(ability => {
    if (message.toLowerCase().includes(ability)) {
      functions.characterActions.push({
        type: 'class_ability',
        ability: ability,
        context: 'player_activated'
      });
    }
  });

  // Reconocer interacciones con el mundo
  const worldInteractions = ['explorar', 'investigar', 'hablar', 'negociar', 'robar', 'persuadir', 'intimidar'];
  worldInteractions.forEach(interaction => {
    if (message.toLowerCase().includes(interaction)) {
      functions.worldInteractions.push({
        type: 'world_interaction',
        interaction: interaction,
        context: 'player_initiated'
      });
    }
  });

  return functions;
};

// Función para generar contexto específico basado en las funciones reconocidas
const generateFunctionContext = (recognizedFunctions, gameState) => {
  let context = '';

  if (recognizedFunctions.diceRolls.length > 0) {
    context += '\n## TIROS DE DADOS SOLICITADOS:\n';
    recognizedFunctions.diceRolls.forEach(roll => {
      context += `- ${roll.notation}: Solicitud del jugador\n`;
    });
    context += 'IMPORTANTE: Procesa estas tiradas y proporciona resultados detallados.\n';
  }

  if (recognizedFunctions.combatActions.length > 0) {
    context += '\n## ACCIONES DE COMBATE:\n';
    recognizedFunctions.combatActions.forEach(action => {
      context += `- ${action.action}: Acción declarada por el jugador\n`;
    });
    context += 'IMPORTANTE: Resuelve estas acciones según las reglas de D&D 5e.\n';
  }

  if (recognizedFunctions.characterActions.length > 0) {
    context += '\n## HABILIDADES DE CLASE ACTIVADAS:\n';
    recognizedFunctions.characterActions.forEach(ability => {
      context += `- ${ability.ability}: Habilidad activada por el jugador\n`;
    });
    context += 'IMPORTANTE: Aplica los efectos de estas habilidades correctamente.\n';
  }

  if (recognizedFunctions.worldInteractions.length > 0) {
    context += '\n## INTERACCIONES CON EL MUNDO:\n';
    recognizedFunctions.worldInteractions.forEach(interaction => {
      context += `- ${interaction.interaction}: Interacción iniciada por el jugador\n`;
    });
    context += 'IMPORTANTE: Resuelve estas interacciones con consecuencias apropiadas.\n';
  }

  return context;
};

// Prompt maestro detallado para el DM
const DM_PROMPT_BASE = `Eres un Dungeon Master (DM) experto de D&D 5ª edición para una campaña en solitario. Sigue estrictamente estas reglas:

## FUNCIONES DISPONIBLES DEL JUEGO:
Puedes usar estas funciones específicas del juego para mejorar la experiencia:

### FUNCIONES DE DADOS:
- **TIRAR DADOS**: Cuando necesites una tirada, usa el formato: "Tira [tipo de dado] para [acción]"
  - Ejemplo: "Tira 1d20 para atacar" o "Tira 2d6+3 para daño"
  - Tipos disponibles: d4, d6, d8, d10, d12, d20, d100
- **TIROS DE SALVACIÓN**: "Tira 1d20 + [modificador] para salvar de [efecto]"
- **TIROS DE HABILIDAD**: "Tira 1d20 + [modificador] para [habilidad]"

### FUNCIONES DE COMBATE:
- **INICIATIVA**: "Todos tiran iniciativa (1d20 + modificador de Destreza)"
- **ATAQUES**: "Tira 1d20 + [modificador de ataque] para golpear"
- **DAÑO**: "Tira [dados de daño] + [modificador] de daño"
- **CONDICIONES**: Aplica condiciones como "prone", "grappled", "frightened", etc.

### FUNCIONES DE PERSONAJE:
- **HABILIDADES DE CLASE**: Reconoce y usa habilidades específicas de cada clase
- **RECURSOS**: Gestiona puntos de vida, slots de conjuros, ki, furia, etc.
- **EQUIPO**: Considera armas, armadura, objetos mágicos en las acciones

### FUNCIONES DE MUNDO:
- **UBICACIÓN**: Mantén coherencia con la ubicación actual
- **TIEMPO**: Rastrea el paso del tiempo (días, horas, clima)
- **PNJs**: Mantén personalidades y memorias de personajes no jugadores
- **FACCIONES**: Avanza los planes de facciones según las acciones del jugador

### FUNCIONES DE NARRATIVA:
- **DESCRIPCIONES**: Proporciona descripciones ricas del entorno
- **DIÁLOGOS**: Crea diálogos naturales para PNJs
- **CONSECUENCIAS**: Aplica consecuencias lógicas a las acciones
- **PROGRESIÓN**: Sugiere hitos narrativos para subir de nivel

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
async function getCampaignState(campaignId) {
  try {
      console.log('CARGANDO ESTADO DE CAMPAÑA:', campaignId); // Loading campaign state
      
      if (!window.electronAPI || !campaignId) {
        console.log('No hay campaña activa o no estamos en Electron'); // No active campaign or not in Electron
      return {
        campaign: null,
        characters: [],
        worldState: null,
        error: 'No hay campaña activa o no estamos en Electron'
      };
    }

      // Importar el servicio de guardado / Import save service
      const gameSaveService = (await import('./gameSaveService.js')).default;
      
      console.log('Cargando datos de la campaña...'); // Loading campaign data
    
    // Cargar todos los datos de la campaña
    const [character, companions, villains, worldState, gameState] = await Promise.all([
      gameSaveService.loadMainCharacter(campaignId),
      gameSaveService.loadCompanions(campaignId),
      gameSaveService.loadVillains(campaignId),
      gameSaveService.loadWorldState(campaignId),
      gameSaveService.loadGameState(campaignId)
    ]);

      console.log('DATOS CARGADOS:'); // Data loaded
      console.log('   Personaje:', character?.name || 'No encontrado'); // Character: [name] or Not found
      console.log('   Compañeros:', companions?.length || 0); // Companions: [count]
      console.log('   Enemigos:', villains?.length || 0); // Enemies: [count]
      console.log('   Estado del mundo:', Object.keys(worldState || {}).length > 0 ? 'Cargado' : 'Vacío'); // World state: Loaded/Empty
      console.log('   Estado del juego:', Object.keys(gameState || {}).length > 0 ? 'Cargado' : 'Vacío'); // Game state: Loaded/Empty

    const result = {
      campaign: {
        id: campaignId,
        character: character,
        companions: companions || [],
        villains: villains || [],
        worldState: worldState || {},
        gameState: gameState || {}
      },
      characters: [character, ...(companions || [])].filter(Boolean),
      worldState: worldState || {},
      gameState: gameState || {},
      error: null
    };

    console.log('ESTADO DE CAMPAÑA COMPLETO:', result); // Complete campaign state
    return result;
  } catch (error) {
    console.error('Error cargando estado de campaña:', error); // Error loading campaign state
    return {
      campaign: null,
      characters: [],
      worldState: null,
      error: `Error cargando campaña: ${error.message}`
    };
  }
}

// Importar el generador de personajes de IA
import aiCharacterGenerator from './aiCharacterGenerator.js';

// Importar funciones específicas del juego para Ollama
import { recognizeGameFunction, generateFunctionPrompt, validateFunctionContext, getContextualFunctionSuggestions } from './ollamaGameFunctions.js';

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
    // Verificar si estamos en Electron
    if (!window.electronAPI) {
      return `❌ Error: Esta funcionalidad solo está disponible en la aplicación de escritorio.\n\nPor favor, ejecuta la aplicación desde Electron para usar la IA del juego.`;
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

    // Obtener configuración de IA
    const aiConfig = await getAIConfig();
    
    // Obtener estado completo de la campaña si hay una activa
    let campaignState = null;
    if (campaignId) {
      console.log('OBTENIENDO ESTADO DE CAMPAÑA PARA IA:', campaignId); // Getting campaign state for AI
      console.log('Verificando si window.electronAPI está disponible:', !!window.electronAPI); // Checking if window.electronAPI is available
      campaignState = await getCampaignState(campaignId);
      console.log('ESTADO DE CAMPAÑA OBTENIDO:', campaignState); // Campaign state obtained
    } else {
      console.log('No hay campaignId proporcionado'); // No campaignId provided
      console.log('gameState recibido:', gameState); // gameState received
    }
    
    // Combinar el estado del juego con el estado de la campaña
    const fullGameState = {
      ...gameState,
      campaign: campaignState,
      // Asegurar que el personaje esté disponible en el nivel principal
      character: gameState?.character || campaignState?.character,
      // Asegurar que los datos de la campaña estén disponibles
      campaignData: campaignState
    };
    
    console.log('ESTADO COMPLETO PARA IA:', fullGameState); // Complete state for AI
    console.log('VERIFICACIÓN DE ESTRUCTURA:'); // Structure verification
    console.log('   fullGameState.character:', fullGameState.character?.name);
    console.log('   fullGameState.campaign:', fullGameState.campaign ? 'Presente' : 'Ausente'); // Present : Absent
    console.log('   fullGameState.campaignData:', fullGameState.campaignData ? 'Presente' : 'Ausente'); // Present : Absent
    
    // Reconocer funciones específicas del juego en el mensaje
    const recognizedFunctions = recognizeGameFunction(message);
    const functionContext = generateFunctionPrompt(recognizedFunctions, fullGameState);
    
    // Obtener sugerencias contextuales
    const contextualSuggestions = getContextualFunctionSuggestions(fullGameState);
    
    // Generar modificadores de prompt basados en las opciones
    const promptModifiers = generatePromptModifiers(gameOptions);
    
    // Crear una sección específica para la información del personaje / Create specific section for character information
    let characterInfoSection = '';
    if (fullGameState?.character) {
      characterInfoSection = `\n\n## INFORMACIÓN DEL PERSONAJE PRINCIPAL - ACCESO DIRECTO:
**NOMBRE:** ${fullGameState.character.name}
**CLASE:** ${fullGameState.character.class}
**RAZA:** ${fullGameState.character.race}
**NIVEL:** ${fullGameState.character.level}
**PUNTOS DE VIDA:** ${fullGameState.character.currentHP}/${fullGameState.character.maxHP}
**CLASE DE ARMADURA:** ${fullGameState.character.armorClass}
**CARACTERÍSTICAS:**
- Fuerza: ${fullGameState.character.strength} (Mod: ${Math.floor((fullGameState.character.strength - 10) / 2)})
- Destreza: ${fullGameState.character.dexterity} (Mod: ${Math.floor((fullGameState.character.dexterity - 10) / 2)})
- Constitución: ${fullGameState.character.constitution} (Mod: ${Math.floor((fullGameState.character.constitution - 10) / 2)})
- Inteligencia: ${fullGameState.character.intelligence} (Mod: ${Math.floor((fullGameState.character.intelligence - 10) / 2)})
- Sabiduría: ${fullGameState.character.wisdom} (Mod: ${Math.floor((fullGameState.character.wisdom - 10) / 2)})
- Carisma: ${fullGameState.character.charisma} (Mod: ${Math.floor((fullGameState.character.charisma - 10) / 2)})

**INSTRUCCIÓN CRÍTICA:** Tienes acceso COMPLETO a la información de ${fullGameState.character.name}. Cuando el jugador pregunte sobre su personaje, usa esta información. NO digas que no tienes acceso.`;
    }

    // Crear instrucción inicial clara / Create clear initial instruction
    const initialInstruction = fullGameState?.character ? 
      `\n\nINSTRUCCIÓN INICIAL CRÍTICA: Tienes acceso COMPLETO a la información del personaje ${fullGameState.character.name}. Cuando el jugador pregunte sobre su personaje, usa la información proporcionada. NO digas que no tienes acceso.\n\n` : '';

    // Combinar el prompt base con los modificadores y contexto de funciones
    let systemPrompt = initialInstruction + DM_PROMPT_BASE + promptModifiers + functionContext + characterInfoSection + 
      `\n\nEstado actual del juego:\n${JSON.stringify(fullGameState, null, 2)}`;

    console.log('PROMPT DEL SISTEMA CONSTRUIDO:'); // System prompt constructed
    console.log('   Tamaño del prompt:', systemPrompt.length, 'caracteres'); // Prompt size in characters
    console.log('   Personaje en fullGameState:', fullGameState?.character?.name); // Character in fullGameState
    console.log('   Campaña en fullGameState:', fullGameState?.campaign?.character?.name); // Campaign in fullGameState
    console.log('   Sección de personaje incluida:', characterInfoSection ? 'Sí' : 'No'); // Character section included: Yes/No
    console.log('   Instrucción inicial incluida:', initialInstruction ? 'Sí' : 'No'); // Initial instruction included: Yes/No
    console.log('   Primeros 200 caracteres del prompt:', systemPrompt.substring(0, 200)); // First 200 characters of prompt

    // Agregar información del estado del turno si está disponible
    if (gameOptions.turnState) {
      systemPrompt += `\n\nESTADO DEL TURNO ACTUAL:\n${JSON.stringify(gameOptions.turnState, null, 2)}`;
    }
    
    // Agregar acciones seleccionadas si están disponibles
    if (gameOptions.selectedActions && gameOptions.selectedActions.length > 0) {
      systemPrompt += `\n\nACCIONES SELECCIONADAS POR EL JUGADOR:\n${JSON.stringify(gameOptions.selectedActions, null, 2)}`;
    }

    // Agregar información sobre habilidades activadas
    if (fullGameState?.character?.mechanics) {
      const activeAbilities = [];
      const mechanics = fullGameState.character.mechanics;
      
      if (mechanics.divineSmite?.activeLevel) {
        activeAbilities.push(`Castigo Divino Nivel ${mechanics.divineSmite.activeLevel} (Paladín) - ACTIVO: Evalúa si se puede usar en ataques cuerpo a cuerpo exitosos`);
      }
      if (mechanics.sneakAttack?.active) {
        activeAbilities.push('Ataque Furtivo (Pícaro) - ACTIVO: Evalúa si se puede usar (ventaja, aliado cerca, etc.)');
      }
      if (mechanics.ki?.active) {
        activeAbilities.push('Ki (Monje) - ACTIVO: Usa puntos de ki automáticamente en ataques y habilidades cuando sea apropiado');
      }
      if (mechanics.rage?.active) {
        activeAbilities.push('Furia (Bárbaro) - ACTIVO: Usa la furia automáticamente cuando sea apropiado en combate');
      }
      if (mechanics.bardicInspiration?.active) {
        activeAbilities.push('Inspiración Bárdica (Bardo) - ACTIVO: Usa la inspiración automáticamente cuando sea apropiado');
      }
      if (mechanics.secondWind?.active) {
        activeAbilities.push('Second Wind (Guerrero) - ACTIVO: Usa Second Wind automáticamente cuando sea apropiado');
      }
      
      if (activeAbilities.length > 0) {
        systemPrompt += `\n\nHABILIDADES ACTIVADAS POR EL JUGADOR:\n${activeAbilities.join('\n')}\n\nINSTRUCCIONES PARA HABILIDADES ACTIVADAS:\n- Evalúa el contexto de cada habilidad activada antes de usarla\n- Para Ataque Furtivo: Solo aplica si hay ventaja, aliado cerca, o condiciones apropiadas\n- Para Castigo Divino: Solo aplica en ataques cuerpo a cuerpo exitosos. Si el ataque falla, NO gastes el slot de conjuro. Solo gasta el slot cuando el ataque sea exitoso.\n- Para Ki: Usa puntos de ki cuando sea tácticamente beneficioso\n- Para Furia: Activa cuando el combate sea intenso o apropiado\n- Para Inspiración Bárdica: Usa cuando aliados necesiten ayuda o motivación\n- Para Second Wind: Usa cuando el personaje esté herido y sea seguro\n- SIEMPRE explica por qué usas o no usas una habilidad activada`;
      }
    }

    // Agregar información sobre funciones reconocidas
    if (recognizedFunctions.length > 0) {
      systemPrompt += `\n\nFUNCIONES RECONOCIDAS EN EL MENSAJE:\n${JSON.stringify(recognizedFunctions, null, 2)}`;
      systemPrompt += `\n\nINSTRUCCIONES ESPECIALES:\n- Procesa las funciones reconocidas de manera prioritaria\n- Proporciona respuestas específicas para cada función identificada\n- Mantén coherencia con las reglas de D&D 5e para cada función`;
    }
    
    // Agregar sugerencias contextuales
    if (contextualSuggestions.length > 0) {
      systemPrompt += `\n\nSUGERENCIAS CONTEXTUALES DISPONIBLES:\n${JSON.stringify(contextualSuggestions, null, 2)}`;
      systemPrompt += `\n\nNOTA: Estas son sugerencias basadas en el contexto actual. Puedes mencionarlas si son relevantes.`;
    }

    // Elegir proveedor de IA
    if (aiConfig.provider === 'ollama') {
      // Usar Ollama
      if (!aiConfig.ollamaUrl) {
        return `❌ Error: URL de Ollama no configurada.\n\nPor favor, configura la URL de Ollama en las opciones (por defecto: http://localhost:11434)`;
      }
      
      // Obtener modo desarrollador para Ollama
      let finalSystemPrompt = systemPrompt;
      if (window.electronAPI) {
        try {
          const developerMode = await window.electronAPI.getDeveloperMode();
          if (developerMode) {
            finalSystemPrompt += `\n\n🔧 MODO DESARROLLADOR ACTIVADO 🔧
            
ESTÁS EN MODO DE PRUEBAS - EL PROGRAMADOR TE VA A HABLAR

INSTRUCCIONES ESPECIALES PARA MODO DESARROLLADOR:
- El usuario que te está hablando es el programador desarrollando el juego
- Puede hacer preguntas directas sobre mecánicas, bugs, o funcionalidades
- Responde de manera técnica pero clara sobre el funcionamiento del sistema
- Si detectas problemas en las mecánicas, explícalos detalladamente
- Proporciona sugerencias de mejora cuando sea apropiado
- Puedes ser más directo y técnico en tus respuestas
- No necesitas mantener el rol de DM si el programador hace preguntas técnicas
- Ayuda a identificar problemas en las reglas de D&D 5e implementadas
- Sugiere mejoras en la implementación de mecánicas del juego

RECUERDA: En modo desarrollador, tu objetivo principal es ayudar al programador a mejorar el juego.`;
          }
        } catch (error) {
          console.error('Error obteniendo modo desarrollador:', error);
        }
      }
      
      try {
        const response = await callOllama(message, finalSystemPrompt, aiConfig.ollamaUrl, aiConfig.ollamaModel || 'llama3.2');
        return response;
      } catch (error) {
        return handleOllamaError(error, aiConfig.ollamaUrl, aiConfig.ollamaModel || 'llama3.2');
      }
    } else {
      // Usar OpenAI (método original)
      const result = await window.electronAPI.askOpenAI({
        message,
        gameState: fullGameState,
        campaignId,
        gameOptions: {
          ...gameOptions,
          systemPrompt
        }
      });

      if (result.error) {
        return result.message;
      }

      return result.message;
    }

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
    // Verificar si estamos en Electron
    if (!window.electronAPI) {
      return `❌ Error: Esta funcionalidad solo está disponible en la aplicación de escritorio.\n\nPor favor, ejecuta la aplicación desde Electron para usar el asistente de IA.`;
    }

    // Obtener configuración de IA
    const aiConfig = await getAIConfig();

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

    // Elegir proveedor de IA
    if (aiConfig.provider === 'ollama') {
      // Usar Ollama
      if (!aiConfig.ollamaUrl) {
        return `❌ Error: URL de Ollama no configurada.\n\nPor favor, configura la URL de Ollama en las opciones (por defecto: http://localhost:11434)`;
      }
      
      // Obtener modo desarrollador para Ollama
      let finalSystemPrompt = systemPrompt;
      if (window.electronAPI) {
        try {
          const developerMode = await window.electronAPI.getDeveloperMode();
          if (developerMode) {
            finalSystemPrompt += `\n\n🔧 MODO DESARROLLADOR ACTIVADO 🔧
            
ESTÁS EN MODO DE PRUEBAS - EL PROGRAMADOR TE VA A HABLAR

INSTRUCCIONES ESPECIALES PARA MODO DESARROLLADOR:
- El usuario que te está hablando es el programador desarrollando el juego
- Puede hacer preguntas directas sobre mecánicas, bugs, o funcionalidades
- Responde de manera técnica pero clara sobre el funcionamiento del sistema
- Si detectas problemas en las mecánicas, explícalos detalladamente
- Proporciona sugerencias de mejora cuando sea apropiado
- Puedes ser más directo y técnico en tus respuestas
- No necesitas mantener el rol de asistente si el programador hace preguntas técnicas
- Ayuda a identificar problemas en las reglas de D&D 5e implementadas
- Sugiere mejoras en la implementación de mecánicas del juego

RECUERDA: En modo desarrollador, tu objetivo principal es ayudar al programador a mejorar el juego.`;
          }
        } catch (error) {
          console.error('Error obteniendo modo desarrollador:', error);
        }
      }
      
      try {
        const response = await callOllama(message, finalSystemPrompt, aiConfig.ollamaUrl, aiConfig.ollamaModel || 'llama3.2');
        return response;
      } catch (error) {
        return handleOllamaError(error, aiConfig.ollamaUrl, aiConfig.ollamaModel || 'llama3.2');
      }
    } else {
      // Usar OpenAI (método original)
      const result = await window.electronAPI.askOpenAI({
        message,
        gameState: fullGameState,
        campaignId,
        gameOptions: {
          ...gameOptions,
          systemPrompt
        }
      });

      if (result.error) {
        return result.message;
      }

      return result.message;
    }

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

// Función para validar configuración de IA
export const validateAIConfig = async () => {
  try {
    if (!window.electronAPI) {
      return false;
    }
    
    const aiConfig = await getAIConfig();
    
    if (aiConfig.provider === 'ollama') {
      // Validar Ollama
      if (!aiConfig.ollamaUrl) {
        return false;
      }
      
      try {
        const response = await callOllama('test', 'Eres un asistente de prueba.', aiConfig.ollamaUrl, aiConfig.ollamaModel || 'llama3.2');
        return response && response.length > 0;
      } catch (error) {
        console.error('Error validando Ollama:', error);
        return false;
      }
    } else {
      // Validar OpenAI
      if (!aiConfig.apiKey) {
        return false;
      }

      // Validar a través del proceso main
      const result = await window.electronAPI.askOpenAI({
        message: 'test',
        gameState: {},
        campaignId: null,
        gameOptions: {}
      });
      
      return !result.error;
    }
  } catch (error) {
    return false;
  }
}

// Función para validar y diagnosticar problemas con Ollama
export const diagnoseOllamaConnection = async (ollamaUrl, model) => {
  const diagnostics = {
    connection: false,
    model: false,
    response: false,
    errors: []
  };

  try {
    // Probar conexión básica
    const healthResponse = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (healthResponse.ok) {
      diagnostics.connection = true;
      
      // Verificar si el modelo está disponible
      const tagsData = await healthResponse.json();
      const availableModels = tagsData.models || [];
      const modelExists = availableModels.some(m => m.name.includes(model));
      
      if (modelExists) {
        diagnostics.model = true;
        
        // Probar respuesta del modelo
        try {
          const testResponse = await callOllama(
            'Responde solo "OK" si puedes entender este mensaje.',
            'Eres un asistente de prueba. Responde solo "OK" si puedes entender el mensaje.',
            ollamaUrl,
            model
          );
          
          if (testResponse && testResponse.toLowerCase().includes('ok')) {
            diagnostics.response = true;
          } else {
            diagnostics.errors.push('El modelo responde pero no de manera esperada');
          }
        } catch (error) {
          diagnostics.errors.push(`Error en respuesta del modelo: ${error.message}`);
        }
      } else {
        diagnostics.errors.push(`Modelo '${model}' no encontrado. Modelos disponibles: ${availableModels.map(m => m.name).join(', ')}`);
      }
    } else {
      diagnostics.errors.push(`Error de conexión: ${healthResponse.status} ${healthResponse.statusText}`);
    }
  } catch (error) {
    diagnostics.errors.push(`Error de red: ${error.message}`);
  }

  return diagnostics;
}

// Función para obtener información detallada de Ollama
export const getOllamaInfo = async (ollamaUrl) => {
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        models: data.models || [],
        version: data.version || 'Desconocida'
      };
    } else {
      return {
        success: false,
        error: `Error ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para manejar errores específicos de Ollama
export const handleOllamaError = (error, ollamaUrl, model) => {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('fetch')) {
    return `❌ Error de conexión con Ollama en ${ollamaUrl}\n\nPosibles soluciones:\n1. Verifica que Ollama esté ejecutándose\n2. Comprueba que la URL sea correcta\n3. Asegúrate de que el puerto 11434 esté abierto`;
  }
  
  if (errorMessage.includes('404')) {
    return `❌ Modelo '${model}' no encontrado\n\nPosibles soluciones:\n1. Descarga el modelo: ollama pull ${model}\n2. Verifica el nombre del modelo\n3. Lista modelos disponibles: ollama list`;
  }
  
  if (errorMessage.includes('500')) {
    return `❌ Error interno del servidor Ollama\n\nPosibles soluciones:\n1. Reinicia Ollama\n2. Verifica que el modelo esté completamente descargado\n3. Comprueba los logs de Ollama`;
  }
  
  if (errorMessage.includes('timeout')) {
    return `❌ Timeout en la respuesta de Ollama\n\nPosibles soluciones:\n1. El modelo puede estar sobrecargado\n2. Intenta con un modelo más pequeño\n3. Aumenta el timeout en la configuración`;
  }
  
  return `❌ Error desconocido con Ollama: ${error.message}\n\nVerifica la configuración y el estado del servidor Ollama`;
}

// Funciones para aplicaciones de escritorio
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

// Función para verificar si la configuración de IA está configurada
export const isAIConfigured = async () => {
  const aiConfig = await getAIConfig();
  
  if (aiConfig.provider === 'ollama') {
    return aiConfig.ollamaUrl && aiConfig.ollamaUrl.length > 0;
  } else {
    return aiConfig.apiKey && aiConfig.apiKey.startsWith('sk-');
  }
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

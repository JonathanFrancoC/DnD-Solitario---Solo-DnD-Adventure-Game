// Funciones específicas del juego para integración con Ollama
// Este archivo contiene funciones que la IA puede reconocer y usar

export const GAME_FUNCTIONS = {
  // Funciones de dados
  dice: {
    roll: {
      description: "Tirar dados para acciones del juego",
      examples: ["tira 1d20 para atacar", "tira 2d6+3 para daño", "tira 1d100 para porcentaje"],
      parameters: {
        dice: "Notación de dados (ej: 1d20, 2d6+3)",
        action: "Acción que se está realizando"
      }
    },
    save: {
      description: "Tirada de salvación",
      examples: ["tira salvación de Fuerza", "tira salvación de Sabiduría"],
      parameters: {
        ability: "Característica para la salvación",
        dc: "Dificultad de la salvación"
      }
    },
    skill: {
      description: "Tirada de habilidad",
      examples: ["tira Percepción", "tira Investigación", "tira Sigilo"],
      parameters: {
        skill: "Habilidad a usar",
        dc: "Dificultad de la tirada"
      }
    }
  },

  // Funciones de combate
  combat: {
    initiative: {
      description: "Determinar iniciativa en combate",
      examples: ["todos tiran iniciativa", "iniciativa de combate"],
      parameters: {
        participants: "Lista de participantes en el combate"
      }
    },
    attack: {
      description: "Realizar un ataque",
      examples: ["ataco con mi espada", "lanzo un hechizo de ataque"],
      parameters: {
        weapon: "Arma o hechizo usado",
        target: "Objetivo del ataque",
        advantage: "Si hay ventaja o desventaja"
      }
    },
    damage: {
      description: "Calcular daño",
      examples: ["daño de espada", "daño de hechizo"],
      parameters: {
        weapon: "Arma o hechizo",
        dice: "Dados de daño",
        modifier: "Modificador de daño"
      }
    },
    condition: {
      description: "Aplicar condición",
      examples: ["aplicar prone", "aplicar frightened"],
      parameters: {
        condition: "Condición a aplicar",
        duration: "Duración de la condición"
      }
    }
  },

  // Funciones de personaje
  character: {
    ability: {
      description: "Usar habilidad de clase",
      examples: ["usar furia", "usar ki", "usar inspiración bárdica"],
      parameters: {
        ability: "Habilidad a usar",
        level: "Nivel de la habilidad"
      }
    },
    spell: {
      description: "Lanzar hechizo",
      examples: ["lanzo curación", "lanzo bola de fuego"],
      parameters: {
        spell: "Hechizo a lanzar",
        level: "Nivel del hechizo",
        target: "Objetivo del hechizo"
      }
    },
    rest: {
      description: "Tomar descanso",
      examples: ["descanso corto", "descanso largo"],
      parameters: {
        type: "Tipo de descanso (corto/largo)",
        location: "Ubicación del descanso"
      }
    }
  },

  // Funciones de mundo
  world: {
    explore: {
      description: "Explorar área",
      examples: ["exploro la habitación", "investigo el área"],
      parameters: {
        area: "Área a explorar",
        method: "Método de exploración"
      }
    },
    interact: {
      description: "Interactuar con PNJ",
      examples: ["hablo con el mercader", "negocio con el guardia"],
      parameters: {
        npc: "Personaje no jugador",
        action: "Tipo de interacción"
      }
    },
    travel: {
      description: "Viajar a nueva ubicación",
      examples: ["voy a la taberna", "camino hacia el bosque"],
      parameters: {
        destination: "Destino del viaje",
        method: "Método de viaje"
      }
    }
  },

  // Funciones de narrativa
  narrative: {
    describe: {
      description: "Describir escena o situación",
      examples: ["describe la habitación", "describe el clima"],
      parameters: {
        subject: "Sujeto a describir",
        detail: "Nivel de detalle"
      }
    },
    dialogue: {
      description: "Crear diálogo de PNJ",
      examples: ["el guardia dice", "el mercader responde"],
      parameters: {
        npc: "Personaje que habla",
        mood: "Estado de ánimo del personaje"
      }
    },
    consequence: {
      description: "Aplicar consecuencia a acción",
      examples: ["como consecuencia", "esto resulta en"],
      parameters: {
        action: "Acción que causó la consecuencia",
        severity: "Severidad de la consecuencia"
      }
    }
  }
};

// Función para reconocer funciones específicas en el mensaje
export const recognizeGameFunction = (message) => {
  const recognized = [];
  const lowerMessage = message.toLowerCase();

  // Buscar funciones de dados
  if (lowerMessage.includes('tira') || lowerMessage.includes('tirar')) {
    if (lowerMessage.includes('salvación') || lowerMessage.includes('salvar')) {
      recognized.push({
        category: 'dice',
        function: 'save',
        confidence: 0.9
      });
    } else if (lowerMessage.includes('percepción') || lowerMessage.includes('investigación') || 
               lowerMessage.includes('sigilo') || lowerMessage.includes('persuasión')) {
      recognized.push({
        category: 'dice',
        function: 'skill',
        confidence: 0.8
      });
    } else {
      recognized.push({
        category: 'dice',
        function: 'roll',
        confidence: 0.7
      });
    }
  }

  // Buscar funciones de combate
  if (lowerMessage.includes('atacar') || lowerMessage.includes('ataco')) {
    recognized.push({
      category: 'combat',
      function: 'attack',
      confidence: 0.9
    });
  }

  if (lowerMessage.includes('iniciativa')) {
    recognized.push({
      category: 'combat',
      function: 'initiative',
      confidence: 0.9
    });
  }

  if (lowerMessage.includes('daño')) {
    recognized.push({
      category: 'combat',
      function: 'damage',
      confidence: 0.8
    });
  }

  // Buscar funciones de personaje
  const classAbilities = ['furia', 'ki', 'inspiración', 'castigo divino', 'ataque furtivo', 'second wind'];
  classAbilities.forEach(ability => {
    if (lowerMessage.includes(ability)) {
      recognized.push({
        category: 'character',
        function: 'ability',
        ability: ability,
        confidence: 0.9
      });
    }
  });

  if (lowerMessage.includes('hechizo') || lowerMessage.includes('lanzo')) {
    recognized.push({
      category: 'character',
      function: 'spell',
      confidence: 0.8
    });
  }

  if (lowerMessage.includes('descanso')) {
    recognized.push({
      category: 'character',
      function: 'rest',
      confidence: 0.9
    });
  }

  // Buscar funciones de mundo
  if (lowerMessage.includes('explorar') || lowerMessage.includes('investigar')) {
    recognized.push({
      category: 'world',
      function: 'explore',
      confidence: 0.8
    });
  }

  if (lowerMessage.includes('hablar') || lowerMessage.includes('negociar') || 
      lowerMessage.includes('persuadir') || lowerMessage.includes('intimidar')) {
    recognized.push({
      category: 'world',
      function: 'interact',
      confidence: 0.8
    });
  }

  if (lowerMessage.includes('voy') || lowerMessage.includes('camino') || 
      lowerMessage.includes('viajo') || lowerMessage.includes('me dirijo')) {
    recognized.push({
      category: 'world',
      function: 'travel',
      confidence: 0.7
    });
  }

  return recognized;
};

// Función para generar contexto específico para funciones reconocidas
export const generateFunctionPrompt = (recognizedFunctions, gameState) => {
  let prompt = '';

  recognizedFunctions.forEach(func => {
    const functionDef = GAME_FUNCTIONS[func.category]?.[func.function];
    if (functionDef) {
      prompt += `\n## FUNCIÓN RECONOCIDA: ${func.category.toUpperCase()}.${func.function.toUpperCase()}\n`;
      prompt += `Descripción: ${functionDef.description}\n`;
      
      if (func.ability) {
        prompt += `Habilidad específica: ${func.ability}\n`;
      }
      
      prompt += `Confianza: ${(func.confidence * 100).toFixed(0)}%\n`;
      prompt += `Ejemplos: ${functionDef.examples.join(', ')}\n`;
      prompt += `IMPORTANTE: Procesa esta función según las reglas de D&D 5e.\n`;
    }
  });

  return prompt;
};

// Función para validar si una función es apropiada para el contexto actual
export const validateFunctionContext = (functionType, gameState) => {
  const context = gameState?.context || {};
  
  switch (functionType) {
    case 'combat.attack':
      return context.inCombat === true;
    
    case 'character.rest':
      return context.inCombat === false && context.safeLocation === true;
    
    case 'world.travel':
      return context.inCombat === false;
    
    case 'character.spell':
      return gameState?.character?.spellSlots && 
             Object.values(gameState.character.spellSlots).some(slots => slots > 0);
    
    default:
      return true;
  }
};

// Función para obtener sugerencias de funciones basadas en el contexto
export const getContextualFunctionSuggestions = (gameState) => {
  const suggestions = [];
  const context = gameState?.context || {};
  const character = gameState?.character || {};

  if (context.inCombat) {
    suggestions.push({
      function: 'combat.attack',
      description: 'Realizar un ataque',
      priority: 'high'
    });
    
    if (character.class?.toLowerCase() === 'barbaro' && !context.rageActive) {
      suggestions.push({
        function: 'character.ability',
        ability: 'furia',
        description: 'Activar furia',
        priority: 'medium'
      });
    }
  } else {
    suggestions.push({
      function: 'world.explore',
      description: 'Explorar el área actual',
      priority: 'medium'
    });
    
    if (context.safeLocation) {
      suggestions.push({
        function: 'character.rest',
        description: 'Tomar un descanso',
        priority: 'low'
      });
    }
  }

  return suggestions;
};

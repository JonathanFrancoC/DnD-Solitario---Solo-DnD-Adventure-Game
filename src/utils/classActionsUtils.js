// Utilidades para manejar acciones de clase
import classesData from '../data/classes.json';

/**
 * Obtiene las acciones de clase disponibles para un personaje
 */
export function getClassActions(className, level) {
  if (!className || !classesData.classes[className.toLowerCase()]) {
    return [];
  }

  const classData = classesData.classes[className.toLowerCase()];
  const actions = [];

  // Acciones base de la clase
  if (classData.actions) {
    Object.entries(classData.actions).forEach(([actionKey, action]) => {
      if (action.availableAt <= level) {
        actions.push({
          id: actionKey,
          name: action.name,
          description: action.description,
          availableAt: action.availableAt,
          uses: action.uses || null,
          recharge: action.recharge || null,
          type: 'class'
        });
      }
    });
  }

  // Acciones de subclase
  if (classData.subclasses) {
    Object.entries(classData.subclasses).forEach(([subclassKey, subclass]) => {
      if (subclass.actions) {
        Object.entries(subclass.actions).forEach(([actionKey, action]) => {
          if (action.availableAt <= level) {
            actions.push({
              id: `${subclassKey}_${actionKey}`,
              name: action.name,
              description: action.description,
              availableAt: action.availableAt,
              uses: action.uses || null,
              recharge: action.recharge || null,
              type: 'subclass',
              subclass: subclassKey
            });
          }
        });
      }
    });
  }

  return actions.sort((a, b) => a.availableAt - b.availableAt);
}

/**
 * Obtiene las acciones específicas de una subclase
 */
export function getSubclassActions(className, subclassName, level) {
  if (!className || !subclassName || !classesData.classes[className.toLowerCase()]) {
    return [];
  }

  const classData = classesData.classes[className.toLowerCase()];
  const subclass = classData.subclasses?.[subclassName.toLowerCase()];
  
  if (!subclass || !subclass.actions) {
    return [];
  }

  return Object.entries(subclass.actions)
    .filter(([_, action]) => action.availableAt <= level)
    .map(([actionKey, action]) => ({
      id: actionKey,
      name: action.name,
      description: action.description,
      availableAt: action.availableAt,
      uses: action.uses || null,
      recharge: action.recharge || null,
      type: 'subclass'
    }))
    .sort((a, b) => a.availableAt - b.availableAt);
}

/**
 * Calcula el número de usos de una acción basado en el nivel
 */
export function calculateActionUses(action, level) {
  if (!action.uses) return null;
  
  if (typeof action.uses === 'number') {
    return action.uses;
  }
  
  if (typeof action.uses === 'string') {
    // Formato: "1 por descanso corto", "2 por descanso largo", etc.
    const match = action.uses.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }
  
  if (typeof action.uses === 'function') {
    return action.uses(level);
  }
  
  return 1;
}

/**
 * Obtiene las acciones más comunes por clase
 */
export const commonClassActions = {
  bardo: {
    inspiration: {
      name: 'Inspiración Bárdica',
      description: 'Como acción, puedes inspirar a un aliado que pueda oírte. El objetivo puede usar tu dado de inspiración en su siguiente tirada de ataque, salvación o habilidad.',
      availableAt: 1,
      uses: '1 por descanso corto',
      type: 'class'
    }
  },
  barbaro: {
    rage: {
      name: 'Furia',
      description: 'En combate, puedes entrar en furia como acción. Mientras estés furioso, tienes ventaja en tiradas de Fuerza y resistencia al daño contundente, perforante y cortante.',
      availableAt: 1,
      uses: '2 por descanso largo',
      type: 'class'
    }
  },
  guerrero: {
    secondWind: {
      name: 'Segundo Aliento',
      description: 'Como acción, puedes recuperar 1d10 + tu nivel de puntos de golpe. Una vez por descanso corto.',
      availableAt: 1,
      uses: '1 por descanso corto',
      type: 'class'
    },
    actionSurge: {
      name: 'Impulso de Acción',
      description: 'Puedes tomar una acción adicional además de tu acción normal y una posible acción de reacción.',
      availableAt: 2,
      uses: '1 por descanso corto',
      type: 'class'
    }
  },
  clerigo: {
    channelDivinity: {
      name: 'Canalizar Divinidad',
      description: 'Puedes canalizar energía divina para usar efectos especiales.',
      availableAt: 2,
      uses: '1 por descanso corto',
      type: 'class'
    }
  },
  druida: {
    wildShape: {
      name: 'Forma Salvaje',
      description: 'Como acción, puedes transformarte en una bestia que hayas visto antes.',
      availableAt: 2,
      uses: '2 por descanso corto',
      type: 'class'
    }
  },
  monje: {
    ki: {
      name: 'Ki',
      description: 'Puedes gastar puntos de ki para usar técnicas especiales.',
      availableAt: 2,
      uses: 'Nivel por descanso corto',
      type: 'class'
    }
  },
  paladin: {
    layOnHands: {
      name: 'Imposición de Manos',
      description: 'Puedes curar heridas o eliminar enfermedades.',
      availableAt: 1,
      uses: 'Nivel × 5 puntos de golpe por descanso largo',
      type: 'class'
    },
    channelDivinity: {
      name: 'Canalizar Divinidad',
      description: 'Puedes canalizar energía divina para usar efectos especiales.',
      availableAt: 3,
      uses: '1 por descanso corto',
      type: 'class'
    }
  },
  ranger: {
    favoredEnemy: {
      name: 'Enemigo Favorecido',
      description: 'Tienes ventaja en tiradas de Inteligencia para recordar información sobre tus enemigos favorecidos.',
      availableAt: 1,
      uses: 'Pasivo',
      type: 'class'
    }
  },
  picaro: {
    sneakAttack: {
      name: 'Ataque Sorpresa',
      description: 'Puedes infligir daño extra a un objetivo cuando tienes ventaja en el ataque.',
      availableAt: 1,
      uses: '1 por turno',
      type: 'class'
    },
    cunningAction: {
      name: 'Acción Astuta',
      description: 'Puedes usar tu acción adicional para realizar una acción de Esprintar, Esconderse o Usar Objeto.',
      availableAt: 2,
      uses: '1 por turno',
      type: 'class'
    }
  }
};

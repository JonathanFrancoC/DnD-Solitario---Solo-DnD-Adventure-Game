// Mejores prácticas de equipamiento para D&D 5e
// Basado en análisis de optimización y estrategia

export const equipmentBestPractices = {
  // === ARMADURAS ===
  armor: {
    light: {
      name: 'Armadura Ligera',
      bestFor: ['bardo', 'picaro', 'brujo', 'mago', 'druida'],
      advantages: [
        'Sin penalización de sigilo',
        'Movilidad completa',
        'Permite máximo bonus de Destreza',
        'Ideal para clases que evitan combate directo'
      ],
      disadvantages: [
        'CA más baja',
        'Vulnerable en combate cuerpo a cuerpo'
      ],
      recommendations: [
        'Usar con clases que dependen de sigilo',
        'Combinar con posicionamiento táctico',
        'Priorizar evasión sobre defensa'
      ]
    },
    medium: {
      name: 'Armadura Media',
      bestFor: ['guerrero', 'ranger', 'clerigo', 'paladin'],
      advantages: [
        'Buena defensa sin penalizar movilidad',
        'Bonus de Destreza limitado pero útil',
        'Equilibrio entre protección y agilidad'
      ],
      disadvantages: [
        'CA intermedia',
        'No es óptima para sigilo'
      ],
      recommendations: [
        'Ideal para clases versátiles',
        'Permite adaptarse a diferentes situaciones',
        'Buena para combate mixto'
      ]
    },
    heavy: {
      name: 'Armadura Pesada',
      bestFor: ['guerrero', 'paladin'],
      advantages: [
        'Máxima protección',
        'No depende de Destreza',
        'Ideal para tanques'
      ],
      disadvantages: [
        'Penalización de sigilo',
        'Requiere Fuerza 13+',
        'Movilidad limitada'
      ],
      recommendations: [
        'Usar solo con Fuerza alta',
        'Ideal para roles de tanque',
        'Combinar con escudo para máxima defensa'
      ]
    }
  },

  // === ARMAS ===
  weapons: {
    melee: {
      simple: {
        best: ['Daga', 'Maza', 'Lanza'],
        reasoning: {
          daga: 'Versátil, se puede lanzar, discreta',
          maza: 'Efectiva contra armaduras, daño contundente',
          lanza: 'Alcance, se puede lanzar, versátil'
        }
      },
      martial: {
        best: ['Espada larga', 'Hacha de guerra', 'Estoque'],
        reasoning: {
          espadaLarga: 'Versátil, buen daño, elegante',
          hachaGuerra: 'Máximo daño, efectiva contra armaduras',
          estoque: 'Elegante, perforante, ideal para duelos'
        }
      }
    },
    ranged: {
      simple: {
        best: ['Arco corto', 'Ballesta ligera'],
        reasoning: {
          arcoCorto: 'Rápido, sin penalización de sigilo',
          ballestaLigera: 'Fácil de usar, buen daño'
        }
      },
      martial: {
        best: ['Arco largo', 'Ballesta pesada'],
        reasoning: {
          arcoLargo: 'Máximo alcance, daño consistente',
          ballestaPesada: 'Máximo daño a distancia'
        }
      }
    }
  },

  // === RECOMENDACIONES POR CLASE ===
  classSpecific: {
    bardo: {
      armor: 'Armadura de cuero',
      primaryWeapon: 'Estoque',
      secondaryWeapon: 'Ballesta ligera',
      reasoning: 'Los bardos necesitan movilidad para posicionarse y usar magia. Estoque para combate elegante, ballesta para distancia.'
    },
    barbaro: {
      armor: 'Sin armadura (Defensa sin Armadura)',
      primaryWeapon: 'Hacha de guerra a dos manos',
      secondaryWeapon: 'Hachas de mano (2)',
      reasoning: 'Los bárbaros usan Defensa sin Armadura que combina DES + CON. Hacha de guerra para máximo daño, hachas de mano para lanzar.'
    },
    guerrero: {
      armor: 'Cota de malla + Escudo',
      primaryWeapon: 'Espada larga + Escudo',
      secondaryWeapon: 'Ballesta pesada',
      reasoning: 'Los guerreros son versátiles. Cota de malla + escudo para defensa, espada larga para combate equilibrado, ballesta pesada para distancia.'
    },
    clerigo: {
      armor: 'Cota de malla',
      primaryWeapon: 'Maza de guerra',
      secondaryWeapon: 'Ballesta ligera',
      reasoning: 'Los clérigos necesitan defensa para mantener concentración en conjuros. Maza de guerra es efectiva contra armaduras, ballesta para distancia.'
    },
    picaro: {
      armor: 'Armadura de cuero',
      primaryWeapon: 'Espada corta',
      secondaryWeapon: 'Ballesta corta',
      reasoning: 'Los pícaros necesitan sigilo. Armadura de cuero para movilidad, espada corta para combate furtivo, ballesta corta para ataques a distancia silenciosos.'
    },
    ranger: {
      armor: 'Armadura de escamas',
      primaryWeapon: 'Espada larga',
      secondaryWeapon: 'Arco largo',
      reasoning: 'Los rangers necesitan versatilidad. Armadura de escamas para defensa sin perder movilidad, espada larga para combate, arco largo para distancia.'
    },
    brujo: {
      armor: 'Sin armadura',
      primaryWeapon: 'Vara arcana',
      secondaryWeapon: 'Daga',
      reasoning: 'Los brujos dependen de conjuros. Sin armadura para movilidad, vara arcana como foco, daga como último recurso.'
    },
    mago: {
      armor: 'Sin armadura',
      primaryWeapon: 'Vara arcana',
      secondaryWeapon: 'Daga',
      reasoning: 'Los magos son frágiles pero poderosos. Sin armadura para movilidad, vara arcana como foco, daga como último recurso.'
    },
    monje: {
      armor: 'Sin armadura (Defensa sin Armadura)',
      primaryWeapon: 'Espada corta',
      secondaryWeapon: 'Ataques desarmados',
      reasoning: 'Los monjes usan Defensa sin Armadura que combina DES + SAB. Espada corta como arma versátil, ataques desarmados como secundaria.'
    },
    paladin: {
      armor: 'Cota de malla + Escudo',
      primaryWeapon: 'Espada larga + Escudo',
      secondaryWeapon: 'Ballesta pesada',
      reasoning: 'Los paladines son guerreros sagrados. Cota de malla + escudo para defensa, espada larga para combate equilibrado, ballesta pesada para distancia.'
    },
    druida: {
      armor: 'Armadura de cuero + Escudo de madera',
      primaryWeapon: 'Bastón druídico',
      secondaryWeapon: 'Forma animal',
      reasoning: 'Los druidas usan materiales naturales. Armadura de cuero + escudo de madera para defensa natural, bastón druídico como arma, forma animal como secundaria.'
    }
  },

  // === SITUACIONES ESPECÍFICAS ===
  situational: {
    dungeon: {
      armor: 'Armadura media o pesada',
      weapons: 'Armas cuerpo a cuerpo + a distancia',
      reasoning: 'Espacios cerrados requieren defensa y versatilidad. Las armaduras pesadas son más efectivas en espacios limitados.'
    },
    wilderness: {
      armor: 'Armadura ligera o media',
      weapons: 'Arma a distancia + cuerpo a cuerpo',
      reasoning: 'Espacios abiertos permiten movilidad y combate a distancia. Las armaduras ligeras son mejores para exploración.'
    },
    urban: {
      armor: 'Armadura ligera',
      weapons: 'Armas discretas',
      reasoning: 'Entornos sociales requieren discreción. Evitar armaduras llamativas y armas grandes.'
    },
    underwater: {
      armor: 'Evitar armaduras pesadas',
      weapons: 'Armas perforantes',
      reasoning: 'El agua afecta la movilidad y efectividad de armas. Las armaduras pesadas pueden ser peligrosas.'
    },
    cold: {
      armor: 'Armadura pesada o gruesa',
      weapons: 'Armas contundentes',
      reasoning: 'El frío afecta la destreza. Las armaduras pesadas proporcionan aislamiento adicional.'
    },
    hot: {
      armor: 'Armadura ligera',
      weapons: 'Armas ligeras',
      reasoning: 'El calor afecta la resistencia. Las armaduras pesadas pueden causar agotamiento.'
    }
  },

  // === CONSEJOS GENERALES ===
  generalTips: {
    balance: [
      'Siempre llevar un arma a distancia',
      'No depender solo de armas cuerpo a cuerpo',
      'Considerar el peso del equipo',
      'Adaptar el equipamiento al entorno'
    ],
    optimization: [
      'Usar armas que aprovechen las fortalezas de la clase',
      'Considerar sinergias entre armas y habilidades de clase',
      'No sobrecargarse con equipamiento innecesario',
      'Mantener opciones para diferentes situaciones'
    ],
    roleplay: [
      'El equipamiento debe reflejar el trasfondo del personaje',
      'Considerar las restricciones culturales o religiosas',
      'Adaptar el estilo al alineamiento del personaje',
      'Mantener coherencia narrativa'
    ]
  },

  // === ERRORES COMUNES ===
  commonMistakes: {
    armor: [
      'Usar armadura pesada sin suficiente Fuerza',
      'Ignorar las penalizaciones de sigilo',
      'No considerar el entorno al elegir armadura',
      'Priorizar CA sobre movilidad cuando no es necesario'
    ],
    weapons: [
      'No llevar armas a distancia',
      'Usar solo armas de un tipo de daño',
      'Ignorar las propiedades especiales de las armas',
      'No considerar el alcance en espacios abiertos'
    ],
    general: [
      'Sobreoptimizar sin considerar el rol',
      'Ignorar el peso del equipo',
      'No adaptar el equipamiento a la campaña',
      'Copiar builds sin entender las razones'
    ]
  }
};

// Función para obtener recomendaciones específicas
export function getEquipmentRecommendations(className, situation = 'general') {
  const classRecs = equipmentBestPractices.classSpecific[className];
  const situationalRecs = equipmentBestPractices.situational[situation];
  
  return {
    class: classRecs,
    situation: situationalRecs,
    combined: {
      armor: situationalRecs?.armor || classRecs?.armor,
      primaryWeapon: classRecs?.primaryWeapon,
      secondaryWeapon: classRecs?.secondaryWeapon,
      reasoning: `${classRecs?.reasoning} ${situationalRecs?.reasoning || ''}`
    }
  };
}

// Función para validar equipamiento
export function validateEquipment(className, armor, weapon1, weapon2) {
  const recommendations = equipmentBestPractices.classSpecific[className];
  const issues = [];
  
  // Validar armadura
  if (armor && !armor.includes('Sin armadura') && className === 'barbaro') {
    issues.push('Los bárbaros obtienen mejor CA sin armadura usando Defensa sin Armadura');
  }
  
  if (armor && armor.includes('Armadura de placas') && className === 'picaro') {
    issues.push('Las armaduras pesadas impiden el uso de habilidades de sigilo');
  }
  
  // Validar armas
  if (!weapon2 || weapon2.includes('Sin arma')) {
    issues.push('Se recomienda llevar un arma a distancia como secundaria');
  }
  
  if (weapon1 && weapon1.includes('Arco') && weapon2 && weapon2.includes('Arco')) {
    issues.push('Considera diversificar: un arma cuerpo a cuerpo y una a distancia');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    recommendations: recommendations
  };
}

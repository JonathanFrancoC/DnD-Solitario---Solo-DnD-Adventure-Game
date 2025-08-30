// ===== MECÁNICAS ESPECÍFICAS DE CLASE =====
// Funciones y datos para las habilidades especiales de cada clase

// MECÁNICAS DEL BÁRBARO
export const barbarianMechanics = {
  // Furia - Rage
  rage: {
    name: "Furia",
    description: "Como acción bonus, puedes entrar en furia. Durante la furia:",
    benefits: [
      "Ventaja en tiradas de Fuerza y tiradas de salvación de Fuerza",
      "Daño adicional con armas cuerpo a cuerpo (+2 a nivel 1-8, +3 a nivel 9-15, +4 a nivel 16+)",
      "Resistencia contra daño cortante, perforante y contundente"
    ],
    duration: "Hasta que termines tu turno sin atacar o recibir daño, o hasta que pierdas la consciencia",
    uses: {
      1: 2, 2: 2, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4, 8: 4, 9: 4, 10: 4,
      11: 4, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 6, 18: 6, 19: 6, 20: 6
    },
    damageBonus: {
      1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 3, 10: 3,
      11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
    }
  },

  // Ataque Temerario - Reckless Attack
  recklessAttack: {
    name: "Ataque Temerario",
    description: "Puedes decidir atacar de forma temeraria. Hasta el final de tu turno, tienes ventaja en tiradas de ataque cuerpo a cuerpo con armas usando Fuerza, pero los ataques contra ti tienen ventaja hasta tu próximo turno.",
    availableFrom: 2
  },

  // Sentido del Peligro - Danger Sense
  dangerSense: {
    name: "Sentido del Peligro",
    description: "Tienes ventaja en tiradas de salvación de Destreza contra efectos que puedes ver, como trampas y conjuros.",
    availableFrom: 2
  }
}

// MECÁNICAS DEL DRUIDA
export const druidMechanics = {
  // Forma Salvaje - Wild Shape
  wildShape: {
    name: "Forma Salvaje",
    description: "Como acción, puedes asumir la forma de una bestia que hayas visto antes. Puedes usar esta característica dos veces por descanso corto o largo.",
    uses: {
      2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2,
      13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2
    },
    maxCR: {
      2: 0.25, 3: 0.25, 4: 0.5, 5: 0.5, 6: 0.5, 7: 0.5, 8: 1, 9: 1, 10: 1,
      11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1
    },
    restrictions: [
      "No puedes asumir la forma de una criatura con un Desafío superior a 1/4",
      "No puedes lanzar conjuros",
      "Mantienes tu Inteligencia, Sabiduría y Carisma"
    ]
  },

  // Druídico - Druidic
  druidic: {
    name: "Druídico",
    description: "Conoces el idioma secreto de los druidas. Puedes hablar el idioma y usar el idioma para dejar mensajes ocultos.",
    availableFrom: 1
  }
}

// MECÁNICAS DEL MONJE
export const monkMechanics = {
  // Ki
  ki: {
    name: "Ki",
    description: "Tu entrenamiento te permite canalizar la energía mística del ki. Tus puntos de ki son iguales a tu nivel de monje.",
    points: "Igual a tu nivel de monje",
    features: [
      "Golpe Aturdidor (1 punto de ki)",
      "Paso del Viento (1 punto de ki)",
      "Acción de Agilidad (1 punto de ki)",
      "Deflectar Proyectiles (1 punto de ki)"
    ]
  },

  // Artes Marciales - Martial Arts
  martialArts: {
    name: "Artes Marciales",
    description: "Puedes usar Destreza en lugar de Fuerza para los ataques y el daño de tus ataques desarmados y armas de monje.",
    availableFrom: 1
  },

  // Movimiento Sin Armadura - Unarmored Movement
  unarmoredMovement: {
    name: "Movimiento Sin Armadura",
    bonus: {
      2: 10, 3: 10, 4: 10, 5: 10, 6: 15, 7: 15, 8: 15, 9: 15, 10: 20,
      11: 20, 12: 20, 13: 20, 14: 25, 15: 25, 16: 25, 17: 25, 18: 30, 19: 30, 20: 30
    }
  }
}

// MECÁNICAS DEL HECHICERO
export const sorcererMechanics = {
  // Puntos de Hechicería - Sorcery Points
  sorceryPoints: {
    name: "Puntos de Hechicería",
    description: "Tienes puntos de hechicería iguales a tu nivel de hechicero. Puedes gastarlos para crear slots de conjuro o usar metamagia.",
    points: "Igual a tu nivel de hechicero",
    conversion: {
      "Crear slot de 1er nivel": 2,
      "Crear slot de 2do nivel": 3,
      "Crear slot de 3er nivel": 5,
      "Crear slot de 4to nivel": 6,
      "Crear slot de 5to nivel": 7
    }
  },

  // Metamagia
  metamagic: {
    name: "Metamagia",
    description: "Puedes modificar tus conjuros usando metamagia. Conoces 2 opciones de metamagia al nivel 3, y aprendes 1 adicional a los niveles 10 y 17.",
    known: {
      3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 3, 11: 3, 12: 3,
      13: 3, 14: 3, 15: 3, 16: 3, 17: 4, 18: 4, 19: 4, 20: 4
    },
    options: [
      "Cuidadoso (Careful Spell)",
      "Distante (Distant Spell)", 
      "Extendido (Extended Spell)",
      "Intensificado (Heightened Spell)",
      "Sutil (Subtle Spell)",
      "Trancado (Twinned Spell)"
    ]
  }
}

// MECÁNICAS DEL BRUJO
export const warlockMechanics = {
  // Invocaciones Místicas - Eldritch Invocations
  eldritchInvocations: {
    name: "Invocaciones Místicas",
    description: "Conoces invocaciones místicas que te otorgan capacidades permanentes.",
    known: {
      2: 2, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 10: 5, 11: 6, 12: 6,
      13: 7, 14: 7, 15: 8, 16: 8, 17: 9, 18: 9, 19: 10, 20: 10
    },
    examples: [
      "Rayo Arcano Mejorado (Agonizing Blast)",
      "Armadura de las Sombras (Armor of Shadows)",
      "Visión del Diablo (Devil's Sight)",
      "Máscara de Muchos Rostros (Mask of Many Faces)"
    ]
  },

  // Pacto Mágico - Pact Magic
  pactMagic: {
    name: "Pacto Mágico",
    description: "Tus slots de conjuro se recuperan con un descanso corto o largo.",
    slots: "Siempre del nivel más alto disponible",
    recovery: "Descanso corto o largo"
  }
}

// MECÁNICAS DEL GUERRERO
export const fighterMechanics = {
  // Oleada de Acción - Action Surge
  actionSurge: {
    name: "Oleada de Acción",
    description: "Puedes tomar una acción adicional además de tu acción normal y una posible acción bonus.",
    uses: {
      2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1,
      13: 1, 14: 1, 15: 1, 16: 1, 17: 2, 18: 2, 19: 2, 20: 2
    },
    recovery: "Descanso corto o largo"
  },

  // Segundo Aliento - Second Wind
  secondWind: {
    name: "Segundo Aliento",
    description: "Como acción bonus, puedes recuperar 1d10 + tu nivel de guerrero puntos de vida.",
    recovery: "Descanso corto o largo"
  },

  // Indomable - Indomitable
  indomitable: {
    name: "Indomable",
    description: "Puedes volver a lanzar una tirada de salvación fallida.",
    uses: {
      9: 1, 10: 1, 11: 1, 12: 1, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2
    },
    recovery: "Descanso largo"
  }
}

// MECÁNICAS DEL PALADÍN
export const paladinMechanics = {
  // Golpe Divino - Divine Smite
  divineSmite: {
    name: "Golpe Divino",
    description: "Cuando golpeas con un arma cuerpo a cuerpo, puedes gastar un slot de conjuro para hacer daño radiante adicional.",
    damage: "2d8 + 1d8 por cada nivel de slot por encima del 1er nivel",
    maxDamage: "5d8 (slot de 4to nivel o superior)"
  },

  // Canalizar Divinidad - Channel Divinity
  channelDivinity: {
    name: "Canalizar Divinidad",
    description: "Puedes canalizar energía divina para usar efectos especiales.",
    uses: {
      3: 1, 4: 1, 5: 1, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2,
      13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 3, 19: 3, 20: 3
    },
    recovery: "Descanso corto o largo"
  },

  // Aura de Protección - Aura of Protection
  auraOfProtection: {
    name: "Aura de Protección",
    description: "Tú y cualquier criatura amistosa dentro de 10 pies de ti obtienes un bonus a las tiradas de salvación igual a tu modificador de Carisma.",
    availableFrom: 6,
    range: "10 pies"
  }
}

// MECÁNICAS DEL PÍCARO
export const rogueMechanics = {
  // Ataque Furtivo - Sneak Attack
  sneakAttack: {
    name: "Ataque Furtivo",
    description: "Una vez por turno, puedes hacer daño adicional con un arma de precisión si tienes ventaja o si otro enemigo está a 5 pies del objetivo.",
    damage: {
      1: "1d6", 2: "1d6", 3: "2d6", 4: "2d6", 5: "3d6", 6: "3d6", 7: "4d6", 8: "4d6", 9: "5d6", 10: "5d6",
      11: "6d6", 12: "6d6", 13: "7d6", 14: "7d6", 15: "8d6", 16: "8d6", 17: "9d6", 18: "9d6", 19: "10d6", 20: "10d6"
    },
    conditions: [
      "Debes usar un arma de precisión",
      "Debes tener ventaja O un enemigo del objetivo debe estar a 5 pies"
    ]
  },

  // Acción Astuta - Cunning Action
  cunningAction: {
    name: "Acción Astuta",
    description: "Puedes usar tu acción bonus para realizar la acción de Esconderse, Esprintar o Esquivar.",
    availableFrom: 2
  },

  // Esquiva Asombrosa - Uncanny Dodge
  uncannyDodge: {
    name: "Esquiva Asombrosa", 
    description: "Cuando un atacante que puedes ver te golpea con un ataque, puedes usar tu reacción para reducir el daño a la mitad.",
    availableFrom: 5
  }
}

// MECÁNICAS DEL BÁRD
export const bardMechanics = {
  // Inspiración Bárdica - Bardic Inspiration
  bardicInspiration: {
    name: "Inspiración Bárdica",
    description: "Como acción bonus, puedes otorgar inspiración bárdica a una criatura que puedas ver dentro de 60 pies de ti. La criatura inspirada puede usar esta inspiración en los próximos 10 minutos para añadir un dado de inspiración (d6 a nivel 1-4, d8 a nivel 5-9, d10 a nivel 10-14, d12 a nivel 15+) a una tirada de ataque, tirada de salvación o tirada de habilidad. Una vez usado, la inspiración se pierde. Puedes usar esta habilidad un número limitado de veces por descanso largo.",
    die: {
      1: "d6", 2: "d6", 3: "d6", 4: "d6", 5: "d8", 6: "d8", 7: "d8", 8: "d8", 9: "d8", 10: "d10",
      11: "d10", 12: "d10", 13: "d10", 14: "d10", 15: "d12", 16: "d12", 17: "d12", 18: "d12", 19: "d12", 20: "d12"
    },
    uses: {
      1: 2, 2: 2, 3: 3, 4: 3, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4, 10: 4,
      11: 4, 12: 4, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5
    },
    recovery: "Descanso largo",
    availableFrom: 1
  },

  // Canto de Descanso - Song of Rest
  songOfRest: {
    name: "Canto de Descanso",
    description: "Si tú o cualquier criatura amistosa que pueda oírte gana puntos de vida al final de un descanso corto, esa criatura gana puntos de vida adicionales.",
    bonus: {
      2: "d6", 3: "d6", 4: "d6", 5: "d6", 6: "d6", 7: "d6", 8: "d6", 9: "d8", 10: "d8", 11: "d8",
      12: "d8", 13: "d8", 14: "d8", 15: "d8", 16: "d8", 17: "d10", 18: "d10", 19: "d10", 20: "d10"
    },
    availableFrom: 2
  }
}

// MECÁNICAS DEL CLÉRIGO
export const clericMechanics = {
  // Canalizar Divinidad - Channel Divinity
  channelDivinity: {
    name: "Canalizar Divinidad",
    description: "Puedes canalizar energía divina para usar efectos especiales.",
    uses: {
      2: 1, 3: 1, 4: 1, 5: 1, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2,
      13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 3, 19: 3, 20: 3
    },
    recovery: "Descanso corto o largo"
  },

  // Destruir No Muertos - Destroy Undead
  destroyUndead: {
    name: "Destruir No Muertos",
    description: "Cuando un no muerto de CR 1/2 o inferior falla su tirada de salvación contra tu Canalizar Divinidad: Destruir No Muertos, es destruido instantáneamente.",
    maxCR: {
      5: 0.5, 6: 0.5, 7: 0.5, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1, 14: 1,
      15: 1, 16: 1, 17: 2, 18: 2, 19: 2, 20: 2
    }
  }
}

// MECÁNICAS DEL MAGO
export const wizardMechanics = {
  // Recuperación Arcana - Arcane Recovery
  arcaneRecovery: {
    name: "Recuperación Arcana",
    description: "Una vez por día cuando termines un descanso corto, puedes recuperar slots de conjuro gastados.",
    slots: "Igual a la mitad de tu nivel de mago (redondeado hacia arriba)",
    maxLevel: "No puede ser superior a 5"
  },

  // Maestría de Conjuros - Spell Mastery
  spellMastery: {
    name: "Maestría de Conjuros",
    description: "Puedes lanzar un conjuro de 1er nivel y un conjuro de 2do nivel sin gastar slots de conjuro.",
    availableFrom: 18
  },

  // Conjuros Característicos - Signature Spells
  signatureSpells: {
    name: "Conjuros Característicos",
    description: "Puedes lanzar dos conjuros de 3er nivel sin gastar slots de conjuro.",
    availableFrom: 20
  }
}

// MECÁNICAS DEL RANGER
export const rangerMechanics = {
  // Enemigo Predilecto - Favored Enemy
  favoredEnemy: {
    name: "Enemigo Predilecto",
    description: "Tienes ventaja en tiradas de Inteligencia (Historia) relacionadas con tu enemigo predilecto.",
    availableFrom: 1
  },

  // Explorador Nato - Natural Explorer
  naturalExplorer: {
    name: "Explorador Nato",
    description: "Tienes ventaja en tiradas de Inteligencia (Naturaleza) y supervivencia relacionadas con tu terreno favorito.",
    availableFrom: 1
  }
}

// FUNCIÓN PARA OBTENER MECÁNICAS POR CLASE
export function getClassMechanics(className) {
  const mechanicsMap = {
    barbaro: barbarianMechanics,
    druida: druidMechanics,
    monje: monkMechanics,
    hechicero: sorcererMechanics,
    brujo: warlockMechanics,
    guerrero: fighterMechanics,
    paladin: paladinMechanics,
    picaro: rogueMechanics,
    bardo: bardMechanics,
    clerigo: clericMechanics,
    mago: wizardMechanics,
    ranger: rangerMechanics
  }
  
  return mechanicsMap[className] || {}
}

// FUNCIÓN PARA OBTENER MECÁNICAS DISPONIBLES POR NIVEL
export function getAvailableMechanics(className, level) {
  const mechanics = getClassMechanics(className)
  const available = {}
  
  Object.entries(mechanics).forEach(([key, mechanic]) => {
    if (mechanic.availableFrom && level >= mechanic.availableFrom) {
      available[key] = mechanic
    } else if (mechanic.uses && mechanic.uses[level]) {
      available[key] = mechanic
    } else if (mechanic.damage && mechanic.damage[level]) {
      available[key] = mechanic
    } else if (mechanic.bonus && mechanic.bonus[level]) {
      available[key] = mechanic
    } else if (mechanic.die && mechanic.die[level]) {
      available[key] = mechanic
    } else if (mechanic.known && mechanic.known[level]) {
      available[key] = mechanic
    } else if (mechanic.maxCR && mechanic.maxCR[level]) {
      available[key] = mechanic
    } else if (mechanic.maxDamage) {
      available[key] = mechanic
    } else if (mechanic.recovery) {
      available[key] = mechanic
    } else if (mechanic.points) {
      available[key] = mechanic
    } else if (mechanic.range) {
      available[key] = mechanic
    } else if (mechanic.restrictions) {
      available[key] = mechanic
    } else if (mechanic.features) {
      available[key] = mechanic
    } else if (mechanic.options) {
      available[key] = mechanic
    } else if (mechanic.examples) {
      available[key] = mechanic
    } else if (mechanic.conditions) {
      available[key] = mechanic
    } else if (mechanic.benefits) {
      available[key] = mechanic
    } else if (mechanic.duration) {
      available[key] = mechanic
    } else if (mechanic.conversion) {
      available[key] = mechanic
    }
  })
  
  return available
}

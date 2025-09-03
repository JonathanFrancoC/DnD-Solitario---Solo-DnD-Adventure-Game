export const classEquipment = {
  bardo: {
    name: 'Bardo',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Armadura de cuero', 'Instrumento musical (a elección)'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Estoque (arma elegante, +2/+2, 1d8 perforante)',
            'Espada corta (versátil, +2/+2, 1d6 perforante)',
            'Arco corto (a distancia, +2/+2, 1d6 perforante, 80/320)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Ballesta ligera + 20 virotes (a distancia, +2/+2, 1d8 perforante, 80/320)',
            'Daga (oculta, +2/+2, 1d4 perforante, 20/60)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete del diplomático (para interacciones sociales)',
            'Paquete del artista (para presentaciones)',
            'Paquete del erudito (para investigación)'
          ] 
        },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 2, spellsKnown: 4, list: 'bardo' }
    },
    recommendedLoadout: {
      armor: 'Armadura de cuero (CA 11 + DES, máximo +2)',
      primaryWeapon: 'Estoque (1d8 perforante, +2/+2)',
      secondaryWeapon: 'Ballesta ligera (1d8 perforante, 80/320)',
      reasoning: 'Los bardos necesitan movilidad para posicionarse y usar magia, por eso armadura ligera. Estoque para combate elegante y ballesta para distancia.'
    }
  },

  barbaro: {
    name: 'Bárbaro',
    hitDie: 'd12',
    startingEquipment: {
      fixed: ['Paquete de explorador', 'Jabalinas (4)'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Hacha de guerra a dos manos (daño máximo, +2/+2, 1d12 cortante)',
            'Espada larga a dos manos (versátil, +2/+2, 1d10 cortante)',
            'Maza de guerra (contra armaduras, +2/+2, 1d8 contundente)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Hachas de mano (2) (para lanzar, +2/+2, 1d6 cortante, 20/60)',
            'Arco largo (a distancia, +2/+2, 1d8 perforante, 150/600)'
          ] 
        },
      ]
    },
    recommendedLoadout: {
      armor: 'Sin armadura (CA 10 + DES + CON + escudo)',
      primaryWeapon: 'Hacha de guerra a dos manos (1d12 cortante)',
      secondaryWeapon: 'Hachas de mano (2) (1d6 cortante, 20/60)',
      reasoning: 'Los bárbaros usan Defensa sin Armadura que combina DES + CON. Hacha de guerra para máximo daño, hachas de mano para lanzar.'
    }
  },

  guerrero: {
    name: 'Guerrero',
    hitDie: 'd10',
    startingEquipment: {
      choices: [
        { 
          pick: 1, 
          options: [
            'Cota de malla + Escudo (defensa máxima, CA 16 + DES máx +2)',
            'Armadura de cuero + Arco largo + Carcaj (20 flechas) (versatilidad)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Espada larga + Escudo (equilibrio ataque/defensa, +2/+2, 1d8 cortante)',
            'Hacha de guerra + Escudo (daño, +2/+2, 1d8 cortante)',
            'Lanza + Escudo (alcance, +2/+2, 1d6 perforante, alcance)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Ballesta pesada + 20 virotes (a distancia, +2/+2, 1d10 perforante, 100/400)',
            'Arco largo + Carcaj (20 flechas) (a distancia, +2/+2, 1d8 perforante, 150/600)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete de explorador (exploración)',
            'Paquete de mazmorrero (combate en espacios cerrados)'
          ] 
        },
      ]
    },
    recommendedLoadout: {
      armor: 'Cota de malla + Escudo (CA 16 + DES máx +2)',
      primaryWeapon: 'Espada larga + Escudo (1d8 cortante)',
      secondaryWeapon: 'Ballesta pesada (1d10 perforante, 100/400)',
      reasoning: 'Los guerreros son versátiles. Cota de malla + escudo para defensa, espada larga para combate equilibrado, ballesta pesada para distancia.'
    }
  },

  clerigo: {
    name: 'Clérigo',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Símbolo sagrado (a elección)'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Cota de malla (defensa, CA 16 + DES máx +2)',
            'Armadura de cuero (movilidad, CA 11 + DES máx +2)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Maza de guerra (contra armaduras, +2/+2, 1d8 contundente)',
            'Martillo de guerra (versátil, +2/+2, 1d8 contundente)',
            'Espada corta (versátil, +2/+2, 1d6 perforante)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Ballesta ligera + 20 virotes (a distancia, +2/+2, 1d8 perforante, 80/320)',
            'Arco corto + Carcaj (20 flechas) (a distancia, +2/+2, 1d6 perforante, 80/320)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete del sacerdote (para rituales)',
            'Paquete del explorador (para aventuras)'
          ] 
        },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 3, spellsKnown: 2, list: 'clerigo' }
    },
    recommendedLoadout: {
      armor: 'Cota de malla (CA 16 + DES máx +2)',
      primaryWeapon: 'Maza de guerra (1d8 contundente)',
      secondaryWeapon: 'Ballesta ligera (1d8 perforante, 80/320)',
      reasoning: 'Los clérigos necesitan defensa para mantener concentración en conjuros. Maza de guerra es efectiva contra armaduras, ballesta para distancia.'
    }
  },

  picaro: {
    name: 'Pícaro',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Herramientas de ladrón', 'Ropa oscura'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Espada corta (sigilo, +2/+2, 1d6 perforante)',
            'Estoque (elegante, +2/+2, 1d8 perforante)',
            'Daga (oculta, +2/+2, 1d4 perforante, 20/60)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Ballesta corta + 20 virotes (sigilo, +2/+2, 1d6 perforante, 80/320)',
            'Arco corto + Carcaj (20 flechas) (versátil, +2/+2, 1d6 perforante, 80/320)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete del ladrón (para infiltración)',
            'Paquete del explorador (para aventuras)'
          ] 
        },
      ]
    },
    recommendedLoadout: {
      armor: 'Armadura de cuero (CA 11 + DES máx +2)',
      primaryWeapon: 'Espada corta (1d6 perforante)',
      secondaryWeapon: 'Ballesta corta (1d6 perforante, 80/320)',
      reasoning: 'Los pícaros necesitan sigilo. Armadura de cuero para movilidad, espada corta para combate furtivo, ballesta corta para ataques a distancia silenciosos.'
    }
  },

  ranger: {
    name: 'Ranger',
    hitDie: 'd10',
    startingEquipment: {
      fixed: ['Paquete de explorador'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Armadura de cuero (movilidad, CA 11 + DES máx +2)',
            'Armadura de escamas (defensa media, CA 14 + DES máx +2)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Espada larga (versátil, +2/+2, 1d8 cortante)',
            'Hacha de guerra (daño, +2/+2, 1d8 cortante)',
            'Lanza (alcance, +2/+2, 1d6 perforante, alcance)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Arco largo + Carcaj (20 flechas) (a distancia, +2/+2, 1d8 perforante, 150/600)',
            'Ballesta pesada + 20 virotes (a distancia, +2/+2, 1d10 perforante, 100/400)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete del cazador (para rastreo)',
            'Paquete del explorador (para supervivencia)'
          ] 
        },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 0, spellsKnown: 2, list: 'ranger' }
    },
    recommendedLoadout: {
      armor: 'Armadura de escamas (CA 14 + DES máx +2)',
      primaryWeapon: 'Espada larga (1d8 cortante)',
      secondaryWeapon: 'Arco largo (1d8 perforante, 150/600)',
      reasoning: 'Los rangers necesitan versatilidad. Armadura de escamas para defensa sin perder movilidad, espada larga para combate, arco largo para distancia.'
    }
  },

  brujo: {
    name: 'Brujo',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Componentes para conjuros'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Vara arcana (foco para conjuros)',
            'Daga (arma simple, +2/+2, 1d4 perforante, 20/60)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete del erudito (para investigación)',
            'Paquete del explorador (para aventuras)'
          ] 
        },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 2, spellsKnown: 2, list: 'brujo' }
    },
    recommendedLoadout: {
      armor: 'Sin armadura (CA 10 + DES)',
      primaryWeapon: 'Vara arcana (foco para conjuros)',
      secondaryWeapon: 'Daga (1d4 perforante, 20/60)',
      reasoning: 'Los brujos dependen de conjuros. Sin armadura para movilidad, vara arcana como foco, daga como último recurso.'
    }
  },

  mago: {
    name: 'Mago',
    hitDie: 'd6',
    startingEquipment: {
      fixed: ['Componentes para conjuros'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Vara arcana (foco para conjuros)',
            'Daga (arma simple, +2/+2, 1d4 perforante, 20/60)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete del erudito (para investigación)',
            'Paquete del explorador (para aventuras)'
          ] 
        },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 3, spellsKnown: 6, list: 'mago' }
    },
    recommendedLoadout: {
      armor: 'Sin armadura (CA 10 + DES)',
      primaryWeapon: 'Vara arcana (foco para conjuros)',
      secondaryWeapon: 'Daga (1d4 perforante, 20/60)',
      reasoning: 'Los magos son frágiles pero poderosos. Sin armadura para movilidad, vara arcana como foco, daga como último recurso.'
    }
  },

  monje: {
    name: 'Monje',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Paquete de explorador'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Espada corta (versátil, +2/+2, 1d6 perforante)',
            'Arma simple (a elección)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete del explorador (para aventuras)',
            'Paquete del erudito (para estudio)'
          ] 
        },
      ]
    },
    recommendedLoadout: {
      armor: 'Sin armadura (CA 10 + DES + SAB)',
      primaryWeapon: 'Espada corta (1d6 perforante)',
      secondaryWeapon: 'Sin arma (ataques desarmados)',
      reasoning: 'Los monjes usan Defensa sin Armadura que combina DES + SAB. Espada corta como arma versátil, ataques desarmados como secundaria.'
    }
  },

  paladin: {
    name: 'Paladín',
    hitDie: 'd10',
    startingEquipment: {
      fixed: ['Símbolo sagrado (a elección)'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Cota de malla (defensa, CA 16 + DES máx +2)',
            'Armadura de cuero + Arco largo + Carcaj (20 flechas) (versatilidad)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Espada larga + Escudo (equilibrio, +2/+2, 1d8 cortante)',
            'Martillo de guerra + Escudo (contra no muertos, +2/+2, 1d8 contundente)',
            'Lanza + Escudo (alcance, +2/+2, 1d6 perforante, alcance)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Ballesta pesada + 20 virotes (a distancia, +2/+2, 1d10 perforante, 100/400)',
            'Arco largo + Carcaj (20 flechas) (a distancia, +2/+2, 1d8 perforante, 150/600)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete del sacerdote (para rituales)',
            'Paquete del explorador (para aventuras)'
          ] 
        },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 0, spellsKnown: 2, list: 'paladin' }
    },
    recommendedLoadout: {
      armor: 'Cota de malla + Escudo (CA 16 + DES máx +2)',
      primaryWeapon: 'Espada larga + Escudo (1d8 cortante)',
      secondaryWeapon: 'Ballesta pesada (1d10 perforante, 100/400)',
      reasoning: 'Los paladines son guerreros sagrados. Cota de malla + escudo para defensa, espada larga para combate equilibrado, ballesta pesada para distancia.'
    }
  },

  druida: {
    name: 'Druida',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Símbolo druídico', 'Componentes para conjuros'],
      choices: [
        { 
          pick: 1, 
          options: [
            'Armadura de cuero (movilidad, CA 11 + DES máx +2)',
            'Escudo de madera (defensa natural)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Bastón druídico (arma natural, +2/+2, 1d6 contundente)',
            'Hoz (herramienta/arma, +2/+2, 1d4 cortante)'
          ] 
        },
        { 
          pick: 1, 
          options: [
            'Paquete del explorador (para supervivencia)',
            'Paquete del erudito (para conocimiento natural)'
          ] 
        },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 2, spellsKnown: 2, list: 'druida' }
    },
    recommendedLoadout: {
      armor: 'Armadura de cuero + Escudo de madera (CA 11 + DES máx +2 + 2)',
      primaryWeapon: 'Bastón druídico (1d6 contundente)',
      secondaryWeapon: 'Sin arma (forma animal)',
      reasoning: 'Los druidas usan materiales naturales. Armadura de cuero + escudo de madera para defensa natural, bastón druídico como arma, forma animal como secundaria.'
    }
  }
};

// Guía de equipamiento por tipo de armadura
export const armorGuide = {
  light: {
    name: 'Armadura Ligera',
    examples: ['Armadura de cuero', 'Ropa de viajero'],
    maxDexBonus: 'Sin límite',
    stealthDisadvantage: false,
    classes: ['bardo', 'picaro', 'brujo', 'mago', 'druida'],
    reasoning: 'Para clases que necesitan movilidad y sigilo'
  },
  medium: {
    name: 'Armadura Media',
    examples: ['Armadura de escamas', 'Cota de malla'],
    maxDexBonus: '+2',
    stealthDisadvantage: false,
    classes: ['guerrero', 'ranger', 'clerigo', 'paladin'],
    reasoning: 'Para clases que necesitan equilibrio entre defensa y movilidad'
  },
  heavy: {
    name: 'Armadura Pesada',
    examples: ['Armadura de placas', 'Armadura de bandas'],
    maxDexBonus: '0',
    stealthDisadvantage: true,
    classes: ['guerrero', 'paladin'],
    reasoning: 'Para clases que priorizan la defensa máxima'
  },
  none: {
    name: 'Sin Armadura',
    examples: ['Defensa sin Armadura'],
    maxDexBonus: 'Sin límite',
    stealthDisadvantage: false,
    classes: ['barbaro', 'monje'],
    reasoning: 'Para clases con defensas especiales'
  }
};

// Guía de armas por tipo
export const weaponGuide = {
  melee: {
    simple: ['Daga', 'Maza', 'Bastón', 'Lanza'],
    martial: ['Espada larga', 'Hacha de guerra', 'Martillo de guerra', 'Estoque'],
    reasoning: 'Armas cuerpo a cuerpo para combate directo'
  },
  ranged: {
    simple: ['Arco corto', 'Ballesta ligera', 'Jabalina'],
    martial: ['Arco largo', 'Ballesta pesada'],
    reasoning: 'Armas a distancia para combate desde lejos'
  },
  thrown: {
    simple: ['Daga', 'Jabalina', 'Hacha de mano'],
    martial: ['Lanza'],
    reasoning: 'Armas que se pueden lanzar'
  }
};

// Recomendaciones específicas por situación
export const situationalEquipment = {
  dungeon: {
    armor: 'Armadura media o pesada',
    weapons: 'Armas cuerpo a cuerpo + a distancia',
    reasoning: 'Espacios cerrados requieren defensa y versatilidad'
  },
  wilderness: {
    armor: 'Armadura ligera o media',
    weapons: 'Arma a distancia + cuerpo a cuerpo',
    reasoning: 'Espacios abiertos permiten movilidad y combate a distancia'
  },
  urban: {
    armor: 'Armadura ligera',
    weapons: 'Armas discretas',
    reasoning: 'Entornos sociales requieren discreción'
  },
  underwater: {
    armor: 'Evitar armaduras pesadas',
    weapons: 'Armas perforantes',
    reasoning: 'El agua afecta la movilidad y efectividad de armas'
  }
};

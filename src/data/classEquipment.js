export const classEquipment = {
  bardo: {
    name: 'Bardo',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Armadura de cuero', 'Instrumento musical (a elección)'],
      choices: [
        { pick: 1, options: ['Estoque', 'Espada larga', 'Arma simple'] },
        { pick: 1, options: ['Ballesta ligera + 20 virotes', 'Arma simple'] },
        { pick: 1, options: ['Paquete del diplomático', 'Paquete del artista'] },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 2, spellsKnown: 4, list: 'bardo' }
    }
  },

  barbaro: {
    name: 'Bárbaro',
    hitDie: 'd12',
    startingEquipment: {
      fixed: ['Paquete de explorador', 'Jabalinas (4)'],
      choices: [
        { pick: 1, options: ['Hacha a dos manos', 'Arma marcial de combate cuerpo a cuerpo'] },
        { pick: 1, options: ['Hachas de mano (2)', 'Arma simple'] },
      ]
    }
  },

  guerrero: {
    name: 'Guerrero',
    hitDie: 'd10',
    startingEquipment: {
      choices: [
        { pick: 1, options: ['Cota de malla', 'Armadura de cuero + Arco largo + Carcaj (20 flechas)'] },
        { pick: 1, options: ['Arma marcial + Escudo', 'Armas marciales (2)'] },
        { pick: 1, options: ['Ballesta ligera + 20 virotes', 'Hachas de mano (2)'] },
        { pick: 1, options: ['Paquete de explorador', 'Paquete de mazmorrero'] },
      ]
    }
  },

  clerigo: {
    name: 'Clérigo',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Escudo (si se elige)', 'Símbolo sagrado'],
      choices: [
        { pick: 1, options: ['Maza', 'Martillo de guerra (si es competente)'] },
        { pick: 1, options: ['Cota de escamas', 'Armadura de cuero', 'Cota de malla (si es competente)'] },
        { pick: 1, options: ['Ballesta ligera + 20 virotes', 'Arma simple'] },
        { pick: 1, options: ['Paquete de sacerdote', 'Paquete de explorador'] },
        { pick: 1, options: ['Escudo', '—'] },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 3, preparedFormula: 'MOD_SAB + nivel', list: 'clerigo', hasDomainSpells: true }
    }
  },

  druida: {
    name: 'Druida',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Armadura de cuero', 'Paquete de explorador', 'Enfoque druídico'],
      choices: [
        { pick: 1, options: ['Escudo de madera', 'Arma simple'] },
        { pick: 1, options: ['Cimitarra', 'Arma simple de combate cuerpo a cuerpo'] },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 2, preparedFormula: 'MOD_SAB + nivel', list: 'druida' }
    }
  },

  hechicero: {
    name: 'Hechicero',
    hitDie: 'd6',
    startingEquipment: {
      choices: [
        { pick: 1, options: ['Ballesta ligera + 20 virotes', 'Arma simple'] },
        { pick: 1, options: ['Bolsa de componentes', 'Enfoque arcano'] },
        { pick: 1, options: ['Paquete de mazmorrero', 'Paquete de explorador'] },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 4, spellsKnown: 2, list: 'hechicero' }
    }
  },

  mago: {
    name: 'Mago',
    hitDie: 'd6',
    startingEquipment: {
      fixed: ['Libro de conjuros'],
      choices: [
        { pick: 1, options: ['Bastón', 'Arma simple'] },
        { pick: 1, options: ['Bolsa de componentes', 'Enfoque arcano'] },
        { pick: 1, options: ['Paquete de erudito', 'Paquete de explorador'] },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 3, spellbookSpells: 6, list: 'mago' } // 6 conjuros de 1er nivel en el libro
    }
  },

  monje: {
    name: 'Monje',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Dardos (10)'],
      choices: [
        { pick: 1, options: ['Espada corta', 'Arma simple'] },
        { pick: 1, options: ['Paquete de mazmorrero', 'Paquete de explorador'] },
      ]
    }
  },

  paladin: {
    name: 'Paladín',
    hitDie: 'd10',
    startingEquipment: {
      choices: [
        { pick: 1, options: ['Arma marcial + Escudo', 'Armas marciales (2)'] },
        { pick: 1, options: ['Jabalinas (5)', 'Arma simple'] },
        { pick: 1, options: ['Paquete de sacerdote', 'Paquete de explorador'] },
      ],
      fixed: ['Cota de malla', 'Símbolo sagrado']
    },
    spellcasting: {
      // Paladín empieza a lanzar conjuros en nivel 2
      level1: null
    }
  },

  picaro: {
    name: 'Pícaro',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Armadura de cuero', 'Dagas (2)', 'Herramientas de ladrón'],
      choices: [
        { pick: 1, options: ['Estoque', 'Espada corta'] },
        { pick: 1, options: ['Arco corto + Carcaj (20 flechas)', 'Espada corta'] },
        { pick: 1, options: ['Paquete de ladrón', 'Paquete de mazmorrero', 'Paquete de explorador'] },
      ]
    }
  },

  ranger: {
    name: 'Ranger',
    hitDie: 'd10',
    startingEquipment: {
      choices: [
        { pick: 1, options: ['Cota de escamas', 'Armadura de cuero'] },
        { pick: 1, options: ['Espadas cortas (2)', 'Armas simples de combate cuerpo a cuerpo (2)'] },
        { pick: 1, options: ['Paquete de explorador', 'Paquete de mazmorrero'] },
      ],
      fixed: ['Arco largo', 'Carcaj (20 flechas)']
    },
    spellcasting: {
      // Ranger empieza a lanzar conjuros en nivel 2
      level1: null
    }
  },

  brujo: {
    name: 'Brujo',
    hitDie: 'd8',
    startingEquipment: {
      fixed: ['Armadura de cuero'],
      choices: [
        { pick: 1, options: ['Ballesta ligera + 20 virotes', 'Arma simple'] },
        { pick: 1, options: ['Bolsa de componentes', 'Enfoque arcano'] },
        { pick: 1, options: ['Paquete de erudito', 'Paquete de mazmorrero'] },
      ]
    },
    spellcasting: {
      level1: { cantripsKnown: 2, spellsKnown: 2, list: 'brujo' }
    }
  }
};

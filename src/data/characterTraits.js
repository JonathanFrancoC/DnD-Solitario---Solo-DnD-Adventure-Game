// CARACTERÍSTICAS DETALLADAS DE RAZAS, TRASFONDOS Y CLASES
// Para llenar la sección "RASGOS Y ATRIBUTOS" del personaje

// ===== CARACTERÍSTICAS DE RAZAS =====
export const raceTraits = {
  humano: {
    name: 'Humano',
    traits: [
      'Versatilidad: Puedes aumentar una característica de tu elección en 1.',
      'Idioma adicional: Puedes hablar, leer y escribir un idioma adicional de tu elección.'
    ],
    description: 'Los humanos son la raza más adaptable y ambiciosa. Su diversidad y ambición los ha llevado a colonizar casi todos los rincones del mundo.'
  },
  elfo: {
    name: 'Elfo',
    traits: [
      'Vista en la oscuridad: Puedes ver en penumbra hasta 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.',
      'Inmunidad al encantamiento: Tienes ventaja en las tiradas de salvación contra ser encantado.',
      'Trance: Los elfos no necesitan dormir. En lugar de eso, meditan profundamente, permaneciendo semiconscientes, durante 4 horas al día.'
    ],
    description: 'Los elfos son una raza mágica de gracia sobrenatural, viviendo en el mundo pero no completamente parte de él.'
  },
  enano: {
    name: 'Enano',
    traits: [
      'Vista en la oscuridad: Puedes ver en penumbra hasta 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.',
      'Resistencia al veneno: Tienes ventaja en las tiradas de salvación contra veneno.',
      'Proficiencia con herramientas: Eres competente con las herramientas de artesano de tu elección.'
    ],
    description: 'Los enanos son una raza robusta y resistente, conocidos por su habilidad en la guerra y su capacidad para resistir efectos físicos y mágicos.'
  },
  mediano: {
    name: 'Mediano',
    traits: [
      'Suerte: Cuando sacas un 1 en una tirada de ataque, habilidad o salvación, puedes volver a tirar el dado.',
      'Valiente: Tienes ventaja en las tiradas de salvación contra ser asustado.',
      'Agilidad natural: Puedes moverse a través del espacio de cualquier criatura que sea de un tamaño mayor que el tuyo.'
    ],
    description: 'Los medianos son una raza pequeña y ágil, conocidos por su suerte y su capacidad para evitar el peligro.'
  },
  dragonborn: {
    name: 'Dragonborn',
    traits: [
      'Aliento de dragón: Puedes usar tu acción para exhalar energía destructiva. El tipo de daño y el área de efecto dependen de tu ancestro draconiano.',
      'Resistencia al daño: Tienes resistencia al tipo de daño asociado con tu ancestro draconiano.'
    ],
    description: 'Los dragonborn son una raza orgullosa con rasgos draconianos, descendientes de dragones y conocidos por su honor y determinación.'
  },
  gnomo: {
    name: 'Gnomo',
    traits: [
      'Vista en la oscuridad: Puedes ver en penumbra hasta 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.',
      'Astucia gnómica: Tienes ventaja en todas las tiradas de Inteligencia, Sabiduría y Carisma contra magia.'
    ],
    description: 'Los gnomos son una raza pequeña y curiosa, conocidos por su ingenio y su amor por la invención y la magia.'
  },
  semielfo: {
    name: 'Semielfo',
    traits: [
      'Vista en la oscuridad: Puedes ver en penumbra hasta 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.',
      'Herencia feérica: Tienes ventaja en las tiradas de salvación contra ser encantado.'
    ],
    description: 'Los semielfos combinan lo mejor de dos mundos: la gracia y la magia de los elfos con la ambición y el vigor de los humanos.'
  },
  semiorco: {
    name: 'Semiorco',
    traits: [
      'Vista en la oscuridad: Puedes ver en penumbra hasta 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.',
      'Intimidación: Eres competente en la habilidad de Intimidación.',
      'Resistencia implacable: Cuando te reduces a 0 puntos de golpe pero no mueres inmediatamente, puedes elegir quedarte en 1 punto de golpe en su lugar.'
    ],
    description: 'Los semiorcos son una raza fuerte y feroz, heredando la fuerza de los orcos y la ambición de los humanos.'
  },
  tiefling: {
    name: 'Tiefling',
    traits: [
      'Vista en la oscuridad: Puedes ver en penumbra hasta 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.',
      'Resistencia al fuego: Tienes resistencia al daño por fuego.',
      'Herencia infernal: Conoces el truco Thaumaturgy. Una vez alcances el nivel 3, puedes lanzar el conjuro Hellish Rebuke una vez por día.'
    ],
    description: 'Los tieflings son una raza con sangre infernal, conocidos por su carisma y su conexión con el fuego y la magia.'
  }
};

// ===== CARACTERÍSTICAS DE TRASFONDOS =====
export const backgroundTraits = {
  acolito: {
    name: 'Acolito',
    traits: [
      'Personalidad del templo: Has pasado años en servicio de un templo, aprendiendo sus ritos y costumbres.',
      'Contactos del templo: Puedes obtener la ayuda de sacerdotes y otros servidores de tu templo.',
      'Idioma adicional: Puedes hablar, leer y escribir un idioma adicional de tu elección.'
    ],
    description: 'Has pasado tu vida en servicio de un templo, aprendiendo los ritos sagrados y las tradiciones de tu fe.'
  },
  criminal: {
    name: 'Criminal',
    traits: [
      'Contactos criminales: Tienes contactos confiables en el mundo criminal que pueden proporcionarte información.',
      'Personalidad criminal: Has vivido una vida de delitos menores, aprendiendo a sobrevivir en las calles.',
      'Herramientas de ladrón: Eres competente con las herramientas de ladrón.'
    ],
    description: 'Has vivido una vida de delitos menores, aprendiendo a sobrevivir en las calles y a evitar la ley.'
  },
  heroe: {
    name: 'Héroe del Pueblo',
    traits: [
      'Defensor del pueblo: Has defendido a tu pueblo de amenazas, ganando su respeto y gratitud.',
      'Personalidad heroica: Tu pueblo te considera un héroe y confía en ti para protegerlos.',
      'Herramientas de artesano: Eres competente con las herramientas de artesano de tu elección.'
    ],
    description: 'Has defendido a tu pueblo de amenazas, ganando su respeto y gratitud. Eres considerado un héroe local.'
  },
  sabio: {
    name: 'Sabio',
    traits: [
      'Investigador: Has dedicado tu vida a la búsqueda del conocimiento, especialmente en un campo específico.',
      'Personalidad erudita: Tu mente es tu arma más poderosa, y has dedicado años a estudiar.',
      'Idioma adicional: Puedes hablar, leer y escribir un idioma adicional de tu elección.'
    ],
    description: 'Has dedicado tu vida a la búsqueda del conocimiento, especialmente en un campo específico de estudio.'
  },
  soldado: {
    name: 'Soldado',
    traits: [
      'Experiencia militar: Has servido en el ejército, aprendiendo disciplina y tácticas de combate.',
      'Personalidad militar: Has vivido una vida de disciplina y servicio, aprendiendo a seguir órdenes.',
      'Herramientas de artesano: Eres competente con las herramientas de artesano de tu elección.'
    ],
    description: 'Has servido en el ejército, aprendiendo disciplina, tácticas de combate y el valor del trabajo en equipo.'
  },
  artesano: {
    name: 'Artesano del Gremio',
    traits: [
      'Miembro del gremio: Eres miembro de un gremio de artesanos, con contactos y recursos.',
      'Personalidad artesanal: Has dedicado tu vida a perfeccionar tu oficio, ganando respeto por tu habilidad.',
      'Herramientas de artesano: Eres competente con las herramientas de artesano de tu elección.'
    ],
    description: 'Eres miembro de un gremio de artesanos, habiendo dedicado tu vida a perfeccionar tu oficio.'
  },
  charlatan: {
    name: 'Charlatán',
    traits: [
      'Falso identidad: Has creado una identidad falsa que puedes usar para engañar a otros.',
      'Personalidad engañosa: Has vivido una vida de engaños y estafas, aprendiendo a manipular a otros.',
      'Herramientas de falsificador: Eres competente con las herramientas de falsificador.'
    ],
    description: 'Has vivido una vida de engaños y estafas, aprendiendo a manipular a otros y a crear identidades falsas.'
  },
  ermitaño: {
    name: 'Ermitaño',
    traits: [
      'Descubrimiento: Durante tu tiempo en soledad, has descubierto algo importante.',
      'Personalidad solitaria: Has vivido una vida de aislamiento, dedicando tiempo a la reflexión y el estudio.',
      'Idioma adicional: Puedes hablar, leer y escribir un idioma adicional de tu elección.'
    ],
    description: 'Has vivido una vida de aislamiento, dedicando tiempo a la reflexión, el estudio y la búsqueda de conocimiento.'
  },
  noble: {
    name: 'Noble',
    traits: [
      'Posición de privilegio: Tu nacimiento noble te otorga ciertos privilegios y contactos.',
      'Personalidad aristocrática: Has crecido en un ambiente de lujo y privilegio, aprendiendo las costumbres de la nobleza.',
      'Idioma adicional: Puedes hablar, leer y escribir un idioma adicional de tu elección.'
    ],
    description: 'Has crecido en un ambiente de lujo y privilegio, aprendiendo las costumbres de la nobleza y el arte de la diplomacia.'
  },
  salvaje: {
    name: 'Salvaje',
    traits: [
      'Cazador: Has vivido en la naturaleza, aprendiendo a cazar y sobrevivir en el desierto.',
      'Personalidad salvaje: Has crecido en la naturaleza, lejos de la civilización, aprendiendo a confiar en tus instintos.',
      'Herramientas de artesano: Eres competente con las herramientas de artesano de tu elección.'
    ],
    description: 'Has crecido en la naturaleza, lejos de la civilización, aprendiendo a cazar, rastrear y sobrevivir en el desierto.'
  },
  marinero: {
    name: 'Marinero',
    traits: [
      'Navegante: Eres un experto navegante, capaz de leer las estrellas y las corrientes.',
      'Personalidad marinera: Has pasado años en el mar, aprendiendo las costumbres de los marineros.',
      'Herramientas de artesano: Eres competente con las herramientas de artesano de tu elección.'
    ],
    description: 'Has pasado años en el mar, aprendiendo las costumbres de los marineros y el arte de la navegación.'
  },
  artista: {
    name: 'Artista',
    traits: [
      'Entretenedor: Eres un artista consumado, capaz de entretener y cautivar a tu audiencia.',
      'Personalidad artística: Has dedicado tu vida al arte, aprendiendo a expresarte a través de la música, la danza o la actuación.',
      'Herramientas de artesano: Eres competente con las herramientas de artesano de tu elección.'
    ],
    description: 'Eres un artista consumado, dedicando tu vida al entretenimiento y la expresión artística.'
  },
  gamberro: {
    name: 'Gamberro',
    traits: [
      'Superviviente urbano: Has aprendido a sobrevivir en las calles de la ciudad, desarrollando habilidades únicas.',
      'Personalidad callejera: Has crecido en las calles, aprendiendo a sobrevivir y prosperar en el entorno urbano.',
      'Herramientas de ladrón: Eres competente con las herramientas de ladrón.'
    ],
    description: 'Has crecido en las calles de la ciudad, aprendiendo a sobrevivir y prosperar en el entorno urbano.'
  }
};

// ===== CARACTERÍSTICAS DE CLASES =====
export const classTraits = {
  bardo: {
    name: 'Bardo',
    traits: [
      'Lanzamiento de conjuros: Puedes lanzar conjuros usando tu carisma como característica de lanzamiento.',
      'Inspiración bárdica: Puedes inspirar a otros a través de palabras o música, otorgándoles bonificaciones.',
      'Canto de descanso: Tu música puede ayudar a tus aliados a recuperarse durante los descansos.',
      'Jack of All Trades: Eres competente en todas las habilidades en las que no eres experto.',
      'Exaltación: Puedes elegir dos habilidades en las que eres competente para obtener doble bonificación de competencia.'
    ],
    description: 'Los bardos son artistas cuyo poder proviene de la magia de la música, la poesía y la narración.'
  },
  barbaro: {
    name: 'Bárbaro',
    traits: [
      'Furia: Puedes entrar en un estado de furia que te otorga resistencia al daño y bonificaciones de daño.',
      'Defensa sin armadura: Cuando no llevas armadura, tu CA es 10 + tu modificador de Destreza + tu modificador de Constitución.',
      'Ataque temerario: Puedes realizar ataques con ventaja, pero los ataques contra ti también tienen ventaja.',
      'Sentido del peligro: Tienes ventaja en las tiradas de iniciativa y no puedes ser sorprendido.'
    ],
    description: 'Los bárbaros son guerreros feroces que canalizan su ira en poder destructivo en el campo de batalla.'
  },
  guerrero: {
    name: 'Guerrero',
    traits: [
      'Estilo de combate: Eres un maestro de las artes marciales, con un estilo de combate especializado.',
      'Segundo aliento: Puedes usar tu acción de bonificación para recuperar puntos de golpe.',
      'Oleada de acción: Puedes realizar una acción adicional en tu turno.',
      'Indomable: Puedes repetir una tirada de salvación fallida.'
    ],
    description: 'Los guerreros son maestros del combate marcial, expertos en una amplia variedad de armas y armaduras.'
  },
  clerigo: {
    name: 'Clérigo',
    traits: [
      'Lanzamiento de conjuros: Puedes lanzar conjuros divinos usando tu sabiduría como característica de lanzamiento.',
      'Dominio divino: Tu conexión con tu deidad te otorga poderes especiales.',
      'Canalizar divinidad: Puedes canalizar la energía divina para crear efectos mágicos.',
      'Manos curativas: Puedes curar heridas tocando a otros.'
    ],
    description: 'Los clérigos son intermediarios entre el mundo mortal y los reinos divinos, sirviendo como conductos del poder divino.'
  },
  druida: {
    name: 'Druida',
    traits: [
      'Lanzamiento de conjuros: Puedes lanzar conjuros druídicos usando tu sabiduría como característica de lanzamiento.',
      'Druídico: Puedes hablar, leer y escribir druídico, y no puedes enseñar este idioma a otros.',
      'Forma salvaje: Puedes transformarte en animales, ganando sus capacidades.',
      'Círculo druídico: Eres miembro de un círculo druídico que te otorga poderes especiales.'
    ],
    description: 'Los druidas son guardianes de la naturaleza, capaces de transformarse en animales y lanzar magia natural.'
  },
  hechicero: {
    name: 'Hechicero',
    traits: [
      'Lanzamiento de conjuros: Puedes lanzar conjuros usando tu carisma como característica de lanzamiento.',
      'Origen mágico: Tu poder mágico proviene de una fuente sobrenatural, como el linaje draconiano.',
      'Fuente de magia: Puedes convertir puntos de golpe en puntos de hechicería para lanzar conjuros.',
      'Metamagia: Puedes modificar tus conjuros de maneras especiales.'
    ],
    description: 'Los hechiceros son lanzadores de conjuros innatos cuyo poder mágico proviene de una fuente sobrenatural.'
  },
  mago: {
    name: 'Mago',
    traits: [
      'Lanzamiento de conjuros: Puedes lanzar conjuros arcanos usando tu inteligencia como característica de lanzamiento.',
      'Libro de conjuros: Tienes un libro de conjuros que contiene tus conjuros conocidos.',
      'Recuperación arcana: Puedes recuperar espacios de conjuro durante un descanso corto.',
      'Tradición arcana: Eres miembro de una tradición arcana que te otorga poderes especiales.'
    ],
    description: 'Los magos son estudiosos del arte arcano, capaces de lanzar poderosos conjuros a través del estudio y la práctica.'
  },
  monje: {
    name: 'Monje',
    traits: [
      'Defensa sin armadura: Cuando no llevas armadura, tu CA es 10 + tu modificador de Destreza + tu modificador de Sabiduría.',
      'Artes marciales: Puedes usar Destreza en lugar de Fuerza para los ataques con armas cuerpo a cuerpo.',
      'Ki: Puedes usar puntos de ki para realizar técnicas especiales.',
      'Tradición monástica: Eres miembro de una tradición monástica que te otorga poderes especiales.'
    ],
    description: 'Los monjes son maestros de las artes marciales, capaces de realizar hazañas extraordinarias a través del control de su ki.'
  },
  paladin: {
    name: 'Paladín',
    traits: [
      'Sentido divino: Puedes detectar la presencia de criaturas buenas y malvadas.',
      'Manos curativas: Puedes curar heridas tocando a otros.',
      'Lanzamiento de conjuros: Puedes lanzar conjuros divinos usando tu carisma como característica de lanzamiento.',
      'Juramento sagrado: Has hecho un juramento sagrado que te otorga poderes especiales.'
    ],
    description: 'Los paladines son guerreros sagrados que combinan el poder marcial con la magia divina.'
  },
  picaro: {
    name: 'Pícaro',
    traits: [
      'Ataque furtivo: Puedes infligir daño extra cuando tienes ventaja en un ataque.',
      'Pericias: Eres experto en ciertas habilidades, obteniendo doble bonificación de competencia.',
      'Jerga ladina: Puedes hablar, leer y escribir jerga ladina.',
      'Arquetipo pícaro: Eres miembro de un arquetipo pícaro que te otorga poderes especiales.'
    ],
    description: 'Los pícaros son maestros del sigilo y la astucia, especializados en ataques furtivos y habilidades de infiltración.'
  },
  ranger: {
    name: 'Ranger',
    traits: [
      'Enemigo predilecto: Eres especialmente efectivo contra ciertos tipos de criaturas.',
      'Explorador nato: Eres experto en la navegación y la supervivencia en la naturaleza.',
      'Lanzamiento de conjuros: Puedes lanzar conjuros ranger usando tu sabiduría como característica de lanzamiento.',
      'Conclave: Eres miembro de un conclave ranger que te otorga poderes especiales.'
    ],
    description: 'Los rangers son guardianes de la naturaleza, expertos en la supervivencia y la caza de criaturas peligrosas.'
  },
  brujo: {
    name: 'Brujo',
    traits: [
      'Patrón sobrenatural: Has hecho un pacto con una entidad sobrenatural que te otorga poder.',
      'Pacto mágico: Puedes lanzar conjuros usando tu carisma como característica de lanzamiento.',
      'Invocaciones místicas: Tu patrón te otorga invocaciones místicas que te dan poderes especiales.',
      'Don del pacto: Tu patrón te otorga un don especial basado en la naturaleza de tu pacto.'
    ],
    description: 'Los brujos son lanzadores de conjuros que obtienen su poder a través de pactos con entidades sobrenaturales.'
  }
};

// ===== FUNCIÓN PARA OBTENER RASGOS COMPLETOS DEL PERSONAJE =====
export function getCharacterTraits(race, background, characterClass) {
  const raceInfo = raceTraits[race] || {};
  const backgroundInfo = backgroundTraits[background] || {};
  const classInfo = classTraits[characterClass] || {};

  const allTraits = [];

  // Agregar rasgos raciales
  if (raceInfo.traits) {
    allTraits.push(`=== RASGOS RACIALES (${raceInfo.name}) ===`);
    raceInfo.traits.forEach(trait => allTraits.push(`• ${trait}`));
    allTraits.push('');
  }

  // Agregar rasgos del trasfondo
  if (backgroundInfo.traits) {
    allTraits.push(`=== RASGOS DEL TRASFONDO (${backgroundInfo.name}) ===`);
    backgroundInfo.traits.forEach(trait => allTraits.push(`• ${trait}`));
    allTraits.push('');
  }

  // Agregar rasgos de clase
  if (classInfo.traits) {
    allTraits.push(`=== RASGOS DE CLASE (${classInfo.name}) ===`);
    classInfo.traits.forEach(trait => allTraits.push(`• ${trait}`));
    allTraits.push('');
  }

  return allTraits.join('\n');
}

// ===== FUNCIÓN PARA OBTENER DESCRIPCIONES =====
export function getCharacterDescription(race, background, characterClass) {
  const raceInfo = raceTraits[race] || {};
  const backgroundInfo = backgroundTraits[background] || {};
  const classInfo = classTraits[characterClass] || {};

  const descriptions = [];

  if (raceInfo.description) {
    descriptions.push(`Raza: ${raceInfo.description}`);
  }
  if (backgroundInfo.description) {
    descriptions.push(`Trasfondo: ${backgroundInfo.description}`);
  }
  if (classInfo.description) {
    descriptions.push(`Clase: ${classInfo.description}`);
  }

  return descriptions.join('\n\n');
}

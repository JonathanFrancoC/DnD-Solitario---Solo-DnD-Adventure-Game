// Nombres aleatorios por raza para D&D

const randomNames = {
  humano: {
    masculino: [
      "Aiden", "Brandon", "Caleb", "Derek", "Ethan", "Finn", "Gavin", "Hector", 
      "Ian", "Jace", "Kai", "Liam", "Mason", "Noah", "Owen", "Parker", 
      "Quinn", "Ryan", "Seth", "Tyler", "Ulysses", "Victor", "Wyatt", "Xander",
      "Zane", "Adrian", "Blake", "Cameron", "Dylan", "Evan", "Felix", "Grant"
    ],
    femenino: [
      "Aria", "Bella", "Chloe", "Diana", "Emma", "Faith", "Grace", "Hannah",
      "Iris", "Jade", "Kate", "Luna", "Maya", "Nora", "Olivia", "Piper",
      "Quinn", "Ruby", "Sophia", "Tara", "Uma", "Violet", "Willow", "Xena",
      "Zara", "Aurora", "Brielle", "Cora", "Dawn", "Eve", "Flora", "Gemma"
    ],
    noBinario: [
      "Alex", "Blake", "Casey", "Drew", "Emery", "Finley", "Gray", "Harper",
      "Indigo", "Jordan", "Kai", "Logan", "Morgan", "Nova", "Ocean", "Parker",
      "Quinn", "Riley", "Sage", "Taylor", "Unity", "Vale", "Winter", "Xen",
      "Zion", "Ash", "Blue", "Cedar", "Dove", "Echo", "Fern", "Gale"
    ]
  },
  elfo: {
    masculino: [
      "Aelar", "Baelorn", "Caelar", "Daelar", "Elaith", "Faerith", "Gaelar",
      "Haelar", "Iaelar", "Jaelar", "Kaelar", "Laelar", "Maelar", "Naelar",
      "Oaelar", "Paelar", "Qaelar", "Raelar", "Saelar", "Taelar", "Uaelar",
      "Vaelar", "Waelar", "Xaelar", "Yaelar", "Zaelar", "Aerith", "Beleth",
      "Celeth", "Deleth", "Ereth", "Feleth"
    ],
    femenino: [
      "Aelara", "Baelora", "Caelara", "Daelara", "Elaith", "Faerith", "Gaelara",
      "Haelara", "Iaelara", "Jaelara", "Kaelara", "Laelara", "Maelara", "Naelara",
      "Oaelara", "Paelara", "Qaelara", "Raelara", "Saelara", "Taelara", "Uaelara",
      "Vaelara", "Waelara", "Xaelara", "Yaelara", "Zaelara", "Aerith", "Beleth",
      "Celeth", "Deleth", "Ereth", "Feleth"
    ],
    noBinario: [
      "Ael", "Bael", "Cael", "Dael", "Ela", "Fae", "Gael", "Hael", "Iael",
      "Jael", "Kael", "Lael", "Mael", "Nael", "Oael", "Pael", "Qael", "Rael",
      "Sael", "Tael", "Uael", "Vael", "Wael", "Xael", "Yael", "Zael", "Aer",
      "Bel", "Cel", "Del", "Er", "Fel"
    ]
  },
  enano: {
    masculino: [
      "Balin", "Dwalin", "Bifur", "Bofur", "Bombur", "Dori", "Nori", "Ori",
      "Oin", "Gloin", "Thorin", "Thrain", "Thror", "Fundin", "Gror", "Farin",
      "Gimli", "Gloin", "Oin", "Balin", "Dwalin", "Bifur", "Bofur", "Bombur",
      "Dori", "Nori", "Ori", "Thorin", "Thrain", "Thror", "Fundin", "Gror"
    ],
    femenino: [
      "Dís", "Frida", "Hilda", "Ingrid", "Kara", "Lena", "Mara", "Nora",
      "Oda", "Pia", "Runa", "Saga", "Tora", "Ulla", "Vera", "Willa",
      "Ylva", "Zara", "Ada", "Bera", "Cora", "Dara", "Eira", "Fara",
      "Gara", "Hara", "Ira", "Jara", "Kara", "Lara", "Mara", "Nara"
    ],
    noBinario: [
      "Balin", "Dwalin", "Bifur", "Bofur", "Bombur", "Dori", "Nori", "Ori",
      "Oin", "Gloin", "Thorin", "Thrain", "Thror", "Fundin", "Gror", "Farin",
      "Gimli", "Gloin", "Oin", "Balin", "Dwalin", "Bifur", "Bofur", "Bombur",
      "Dori", "Nori", "Ori", "Thorin", "Thrain", "Thror", "Fundin", "Gror"
    ]
  },
  mediano: {
    masculino: [
      "Bilbo", "Frodo", "Samwise", "Merry", "Pippin", "Bilbo", "Frodo", "Sam",
      "Merry", "Pippin", "Bilbo", "Frodo", "Sam", "Merry", "Pippin", "Bilbo",
      "Frodo", "Sam", "Merry", "Pippin", "Bilbo", "Frodo", "Sam", "Merry",
      "Pippin", "Bilbo", "Frodo", "Sam", "Merry", "Pippin", "Bilbo", "Frodo"
    ],
    femenino: [
      "Bell", "Daisy", "Primula", "Rose", "Lily", "Marigold", "Poppy", "Iris",
      "Violet", "Dahlia", "Zinnia", "Aster", "Petunia", "Begonia", "Camellia",
      "Daffodil", "Eglantine", "Freesia", "Gardenia", "Holly", "Ivy", "Jasmine",
      "Kalmia", "Lavender", "Magnolia", "Narcissus", "Orchid", "Peony", "Quince",
      "Rhododendron", "Sunflower", "Tulip"
    ],
    noBinario: [
      "Bilbo", "Frodo", "Sam", "Merry", "Pippin", "Bell", "Daisy", "Primula",
      "Rose", "Lily", "Marigold", "Poppy", "Iris", "Violet", "Dahlia", "Zinnia",
      "Aster", "Petunia", "Begonia", "Camellia", "Daffodil", "Eglantine", "Freesia",
      "Gardenia", "Holly", "Ivy", "Jasmine", "Kalmia", "Lavender", "Magnolia",
      "Narcissus", "Orchid"
    ]
  },
  dragonborn: {
    masculino: [
      "Arjhan", "Balasar", "Bharash", "Donaar", "Ghesh", "Heskan", "Kriv",
      "Medrash", "Mehen", "Nadarr", "Pandjed", "Patrin", "Rhogar", "Shamash",
      "Shedinn", "Tarhun", "Torinn", "Akra", "Bara", "Cara", "Dara", "Era",
      "Fara", "Gara", "Hara", "Ira", "Jara", "Kara", "Lara", "Mara", "Nara", "Ora"
    ],
    femenino: [
      "Akra", "Biri", "Daar", "Farideh", "Harann", "Havilar", "Jheri", "Kava",
      "Korinn", "Mishann", "Nala", "Perra", "Raiann", "Sora", "Surina", "Thava",
      "Uadjit", "Vara", "Wara", "Xara", "Yara", "Zara", "Ara", "Bara", "Cara",
      "Dara", "Era", "Fara", "Gara", "Hara", "Ira", "Jara", "Kara"
    ],
    noBinario: [
      "Arjhan", "Balasar", "Bharash", "Donaar", "Ghesh", "Heskan", "Kriv",
      "Medrash", "Mehen", "Nadarr", "Pandjed", "Patrin", "Rhogar", "Shamash",
      "Shedinn", "Tarhun", "Torinn", "Akra", "Bara", "Cara", "Dara", "Era",
      "Fara", "Gara", "Hara", "Ira", "Jara", "Kara", "Lara", "Mara", "Nara", "Ora"
    ]
  },
  gnomo: {
    masculino: [
      "Alston", "Alvyn", "Boddynock", "Brocc", "Burgell", "Dimble", "Eldon",
      "Erky", "Fonkin", "Frug", "Gerbo", "Gimble", "Glim", "Jebeddo", "Kellen",
      "Namfoodle", "Orryn", "Roondar", "Seebo", "Sindri", "Warryn", "Wrenn",
      "Zook", "Alston", "Alvyn", "Boddynock", "Brocc", "Burgell", "Dimble",
      "Eldon", "Erky", "Fonkin"
    ],
    femenino: [
      "Bimpnottin", "Breena", "Caramip", "Carlin", "Donella", "Duvamil", "Ella",
      "Ellyjobell", "Ellywick", "Lilli", "Loopmottin", "Lorilla", "Mardnab",
      "Nissa", "Nyx", "Oda", "Orla", "Roywyn", "Shamil", "Tana", "Waywocket",
      "Zanna", "Zilla", "Bimpnottin", "Breena", "Caramip", "Carlin", "Donella",
      "Duvamil", "Ella", "Ellyjobell", "Ellywick", "Lilli"
    ],
    noBinario: [
      "Alston", "Alvyn", "Boddynock", "Brocc", "Burgell", "Dimble", "Eldon",
      "Erky", "Fonkin", "Frug", "Gerbo", "Gimble", "Glim", "Jebeddo", "Kellen",
      "Namfoodle", "Orryn", "Roondar", "Seebo", "Sindri", "Warryn", "Wrenn",
      "Zook", "Bimpnottin", "Breena", "Caramip", "Carlin", "Donella", "Duvamil",
      "Ella", "Ellyjobell", "Ellywick"
    ]
  },
  semielfo: {
    masculino: [
      "Adran", "Aelar", "Aramil", "Arannis", "Aust", "Beiro", "Berrian",
      "Carric", "Enialis", "Erdan", "Erevan", "Galinndan", "Hadarai", "Heian",
      "Himo", "Immeral", "Ivellios", "Laucian", "Mindartis", "Paelias",
      "Peren", "Quarion", "Riardon", "Rolen", "Soveliss", "Thamior", "Tharivol",
      "Theren", "Varis", "Adran", "Aelar", "Aramil"
    ],
    femenino: [
      "Adrie", "Althaea", "Anastrianna", "Andraste", "Antinua", "Bethrynna",
      "Birel", "Caelynn", "Drusilia", "Enna", "Felosial", "Ielenia", "Jelenneth",
      "Keyleth", "Leshanna", "Lia", "Meriele", "Mialee", "Naivara", "Quelenna",
      "Quillathe", "Sariel", "Shanairra", "Shava", "Silaqui", "Theirastra",
      "Thia", "Vadania", "Valanthe", "Xanaphia", "Adrie", "Althaea", "Anastrianna"
    ],
    noBinario: [
      "Adran", "Aelar", "Aramil", "Arannis", "Aust", "Beiro", "Berrian",
      "Carric", "Enialis", "Erdan", "Erevan", "Galinndan", "Hadarai", "Heian",
      "Himo", "Immeral", "Ivellios", "Laucian", "Mindartis", "Paelias",
      "Peren", "Quarion", "Riardon", "Rolen", "Soveliss", "Thamior", "Tharivol",
      "Theren", "Varis", "Adrie", "Althaea", "Anastrianna"
    ]
  },
  semiorco: {
    masculino: [
      "Dench", "Feng", "Gell", "Henk", "Holg", "Imsh", "Keth", "Krusk",
      "Mhurren", "Ront", "Shump", "Thokk", "Dench", "Feng", "Gell", "Henk",
      "Holg", "Imsh", "Keth", "Krusk", "Mhurren", "Ront", "Shump", "Thokk",
      "Dench", "Feng", "Gell", "Henk", "Holg", "Imsh", "Keth", "Krusk"
    ],
    femenino: [
      "Baggi", "Emen", "Engong", "Kansif", "Myev", "Neega", "Ovak", "Ownka",
      "Shautha", "Sutha", "Vola", "Volen", "Yevelda", "Baggi", "Emen", "Engong",
      "Kansif", "Myev", "Neega", "Ovak", "Ownka", "Shautha", "Sutha", "Vola",
      "Volen", "Yevelda", "Baggi", "Emen", "Engong", "Kansif", "Myev", "Neega"
    ],
    noBinario: [
      "Dench", "Feng", "Gell", "Henk", "Holg", "Imsh", "Keth", "Krusk",
      "Mhurren", "Ront", "Shump", "Thokk", "Baggi", "Emen", "Engong", "Kansif",
      "Myev", "Neega", "Ovak", "Ownka", "Shautha", "Sutha", "Vola", "Volen",
      "Yevelda", "Dench", "Feng", "Gell", "Henk", "Holg", "Imsh", "Keth"
    ]
  },
  tiefling: {
    masculino: [
      "Akmenos", "Amnon", "Barakas", "Damakos", "Ekemon", "Iados", "Kairon",
      "Leucis", "Melech", "Mordai", "Morthos", "Pelaios", "Skamos", "Therai",
      "Akmenos", "Amnon", "Barakas", "Damakos", "Ekemon", "Iados", "Kairon",
      "Leucis", "Melech", "Mordai", "Morthos", "Pelaios", "Skamos", "Therai",
      "Akmenos", "Amnon", "Barakas", "Damakos"
    ],
    femenino: [
      "Akta", "Anakis", "Bryseis", "Criella", "Damaia", "Ea", "Kallista",
      "Lerissa", "Makaria", "Nemeia", "Orianna", "Phelaia", "Rieta", "Akta",
      "Anakis", "Bryseis", "Criella", "Damaia", "Ea", "Kallista", "Lerissa",
      "Makaria", "Nemeia", "Orianna", "Phelaia", "Rieta", "Akta", "Anakis",
      "Bryseis", "Criella", "Damaia", "Ea", "Kallista"
    ],
    noBinario: [
      "Akmenos", "Amnon", "Barakas", "Damakos", "Ekemon", "Iados", "Kairon",
      "Leucis", "Melech", "Mordai", "Morthos", "Pelaios", "Skamos", "Therai",
      "Akta", "Anakis", "Bryseis", "Criella", "Damaia", "Ea", "Kallista",
      "Lerissa", "Makaria", "Nemeia", "Orianna", "Phelaia", "Rieta", "Akmenos",
      "Amnon", "Barakas", "Damakos", "Ekemon", "Iados"
    ]
  }
}

// Función para generar un nombre aleatorio
export const generateRandomName = (race, gender) => {
  if (!randomNames[race]) {
    return "Nombre"
  }
  
  const genderKey = gender || 'masculino'
  const names = randomNames[race][genderKey] || randomNames[race]['masculino']
  
  if (names && names.length > 0) {
    return names[Math.floor(Math.random() * names.length)]
  }
  
  return "Nombre"
}

export default randomNames

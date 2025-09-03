import React, { useState } from 'react'
import { ArrowLeft, Save, User, Shield, Sword, BookOpen, Zap, Heart, Target, CheckCircle, Star, ScrollText, Package, Crosshair, Eye, AlertTriangle, Circle } from 'lucide-react'

const CharacterSheet = ({ character, onBackToMenu, onCharacterCreated }) => {
  const [characterData, setCharacterData] = useState({
    name: '',
    class: '',
    level: 1,
    edition: '5e-2014',
    background: '',
    playerName: '',
    race: '',
    alignment: '',
    experience: 0,
    inspiration: false,
    proficiencyBonus: 2,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    maxHP: 10,
    currentHP: 10,
    tempHP: 0,
    hitDice: '1d10',
    hitDiceTotal: 1,
    personalityTraits: '',
    personalityTrait: '',
    ideals: '',
    ideal: '',
    bonds: '',
    bond: '',
    flaws: '',
    flaw: '',
    features: '',
    otherProficiencies: '',
    equipment: '',
    attacks: [
      { name: '', bonus: '', damage: '' },
      { name: '', bonus: '', damage: '' },
      { name: '', bonus: '', damage: '' }
    ],
    savingThrows: {
      strength: { proficient: false, modifier: 0 },
      dexterity: { proficient: false, modifier: 0 },
      constitution: { proficient: false, modifier: 0 },
      intelligence: { proficient: false, modifier: 0 },
      wisdom: { proficient: false, modifier: 0 },
      charisma: { proficient: false, modifier: 0 }
    },
    skills: {
      acrobatics: { proficient: false, modifier: 0 },
      athletics: { proficient: false, modifier: 0 },
      arcana: { proficient: false, modifier: 0 },
      deception: { proficient: false, modifier: 0 },
      history: { proficient: false, modifier: 0 },
      insight: { proficient: false, modifier: 0 },
      intimidation: { proficient: false, modifier: 0 },
      investigation: { proficient: false, modifier: 0 },
      medicine: { proficient: false, modifier: 0 },
      nature: { proficient: false, modifier: 0 },
      perception: { proficient: false, modifier: 0 },
      performance: { proficient: false, modifier: 0 },
      persuasion: { proficient: false, modifier: 0 },
      religion: { proficient: false, modifier: 0 },
      sleightOfHand: { proficient: false, modifier: 0 },
      stealth: { proficient: false, modifier: 0 },
      survival: { proficient: false, modifier: 0 }
    },
    deathSaves: { successes: 0, failures: 0 }
  })

  const editions = [
    { value: '5e-2014', name: 'D&D 5e (2014)' },
    { value: '5e-2024', name: 'D&D 5e (2024)' }
  ]

  const races = [
    { name: 'Humano', abilityBonus: { all: 1 } },
    { name: 'Elfo', abilityBonus: { dexterity: 2 } },
    { name: 'Enano', abilityBonus: { constitution: 2 } },
    { name: 'Mediano', abilityBonus: { dexterity: 2, constitution: 1 } },
    { name: 'Dragonborn', abilityBonus: { strength: 2, charisma: 1 } },
    { name: 'Gnomo', abilityBonus: { intelligence: 2 } },
    { name: 'Semielfo', abilityBonus: { charisma: 2, other: 1 } },
    { name: 'Semiorco', abilityBonus: { strength: 2, constitution: 1 } },
    { name: 'Tiefling', abilityBonus: { intelligence: 1, charisma: 2 } }
  ]

  const classes = [
    { name: 'Guerrero', hitDie: 10, recommendedStats: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 } },
    { name: 'Mago', hitDie: 6, recommendedStats: { strength: 8, dexterity: 14, constitution: 12, intelligence: 16, wisdom: 12, charisma: 10 } },
    { name: 'Clérigo', hitDie: 8, recommendedStats: { strength: 12, dexterity: 10, constitution: 14, intelligence: 10, wisdom: 16, charisma: 12 } },
    { name: 'Pícaro', hitDie: 8, recommendedStats: { strength: 8, dexterity: 16, constitution: 12, intelligence: 12, wisdom: 10, charisma: 14 } },
    { name: 'Ranger', hitDie: 10, recommendedStats: { strength: 12, dexterity: 16, constitution: 14, intelligence: 10, wisdom: 14, charisma: 8 } },
    { name: 'Paladín', hitDie: 10, recommendedStats: { strength: 16, dexterity: 10, constitution: 14, intelligence: 8, wisdom: 12, charisma: 16 } },
    { name: 'Bárbaro', hitDie: 12, recommendedStats: { strength: 16, dexterity: 14, constitution: 16, intelligence: 8, wisdom: 12, charisma: 10 } },
    { name: 'Bardo', hitDie: 8, recommendedStats: { strength: 8, dexterity: 14, constitution: 12, intelligence: 12, wisdom: 10, charisma: 16 } },
    { name: 'Druida', hitDie: 8, recommendedStats: { strength: 10, dexterity: 12, constitution: 14, intelligence: 12, wisdom: 16, charisma: 10 } },
    { name: 'Monje', hitDie: 8, recommendedStats: { strength: 10, dexterity: 16, constitution: 14, intelligence: 12, wisdom: 16, charisma: 8 } },
    { name: 'Hechicero', hitDie: 6, recommendedStats: { strength: 8, dexterity: 14, constitution: 12, intelligence: 12, wisdom: 10, charisma: 16 } },
    { name: 'Brujo', hitDie: 8, recommendedStats: { strength: 8, dexterity: 12, constitution: 14, intelligence: 12, wisdom: 10, charisma: 16 } }
  ]

  const backgrounds = [
    { name: 'Acólito', abilityBonus: { wisdom: 1, intelligence: 1 } },
    { name: 'Criminal', abilityBonus: { dexterity: 1, charisma: 1 } },
    { name: 'Ermitaño', abilityBonus: { wisdom: 1, constitution: 1 } },
    { name: 'Guardián', abilityBonus: { strength: 1, constitution: 1 } },
    { name: 'Noble', abilityBonus: { charisma: 1, intelligence: 1 } },
    { name: 'Orfebre', abilityBonus: { intelligence: 1, dexterity: 1 } },
    { name: 'Pícaro', abilityBonus: { dexterity: 1, charisma: 1 } },
    { name: 'Sabio', abilityBonus: { intelligence: 1, wisdom: 1 } },
    { name: 'Soldado', abilityBonus: { strength: 1, constitution: 1 } },
    { name: 'Urchin', abilityBonus: { dexterity: 1, wisdom: 1 } }
  ]

  const alignments = [
    'Legal Bueno', 'Neutral Bueno', 'Caótico Bueno',
    'Legal Neutral', 'Neutral', 'Caótico Neutral',
    'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado'
  ]

  const skills = [
    { name: 'Acrobacias', key: 'acrobatics', ability: 'dexterity' },
    { name: 'Atletismo', key: 'athletics', ability: 'strength' },
    { name: 'C. Arcano', key: 'arcana', ability: 'intelligence' },
    { name: 'Engaño', key: 'deception', ability: 'charisma' },
    { name: 'Historia', key: 'history', ability: 'intelligence' },
    { name: 'Interpretación', key: 'performance', ability: 'charisma' },
    { name: 'Intimidación', key: 'intimidation', ability: 'charisma' },
    { name: 'Investigación', key: 'investigation', ability: 'intelligence' },
    { name: 'Juego de Manos', key: 'sleightOfHand', ability: 'dexterity' },
    { name: 'Medicina', key: 'medicine', ability: 'wisdom' },
    { name: 'Naturaleza', key: 'nature', ability: 'intelligence' },
    { name: 'Percepción', key: 'perception', ability: 'wisdom' },
    { name: 'Perspicacia', key: 'insight', ability: 'wisdom' },
    { name: 'Persuasión', key: 'persuasion', ability: 'charisma' },
    { name: 'Religión', key: 'religion', ability: 'intelligence' },
    { name: 'Sigilo', key: 'stealth', ability: 'dexterity' },
    { name: 'Supervivencia', key: 'survival', ability: 'wisdom' },
    { name: 'T. con Animales', key: 'animalHandling', ability: 'wisdom' }
  ]

  const getAbilityModifier = (value) => {
    return Math.floor((value - 10) / 2)
  }

  const getAbilityModifierString = (value) => {
    const modifier = getAbilityModifier(value)
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  const getHitDieMax = (hitDie) => {
    // hitDie puede ser un string como "d6" o un número como 6
    if (typeof hitDie === 'string') {
      // Extraer el número del string "d6" -> 6
      const match = hitDie.match(/d(\d+)/)
      return match ? parseInt(match[1]) : 6
    }
    // Si ya es un número, devolverlo directamente
    return parseInt(hitDie) || 6
  }

  const getPassivePerception = () => {
    const wisdomModifier = getAbilityModifier(characterData.wisdom)
    return 10 + wisdomModifier
  }

  const handleInputChange = (field, value) => {
    setCharacterData(prev => ({
      ...prev,
      [field]: value
    }))

    if (field === 'class' && value) {
      const selectedClass = classes.find(c => c.name === value)
      if (selectedClass) {
        setCharacterData(prev => ({
          ...prev,
          [field]: value,
          ...selectedClass.recommendedStats,
          hitDice: `1d${selectedClass.hitDie}`,
          hitDiceTotal: 1,
          maxHP: getHitDieMax(selectedClass.hitDie) + getAbilityModifier(selectedClass.recommendedStats.constitution),
          currentHP: getHitDieMax(selectedClass.hitDie) + getAbilityModifier(selectedClass.recommendedStats.constitution),
          armorClass: 10 + getAbilityModifier(selectedClass.recommendedStats.dexterity)
        }))
      }
    }
  }

  const handleAbilityChange = (ability, value) => {
    const numValue = parseInt(value) || 0
    setCharacterData(prev => ({
      ...prev,
      [ability]: numValue
    }))
  }

  const handleSavingThrowChange = (ability, field, value) => {
    setCharacterData(prev => ({
      ...prev,
      savingThrows: {
        ...prev.savingThrows,
        [ability]: {
          ...prev.savingThrows[ability],
          [field]: field === 'proficient' ? value : parseInt(value) || 0
        }
      }
    }))
  }

  const handleSkillChange = (skillKey, field, value) => {
    setCharacterData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillKey]: {
          ...prev.skills[skillKey],
          [field]: field === 'proficient' ? value : parseInt(value) || 0
        }
      }
    }))
  }

  const handleDeathSaveChange = (type, value) => {
    setCharacterData(prev => ({
      ...prev,
      deathSaves: {
        ...prev.deathSaves,
        [type]: Math.min(Math.max(parseInt(value) || 0, 0), 3)
      }
    }))
  }

  const handleFinish = () => {
    onCharacterCreated(characterData)
  }

  const inputStyles = "w-full p-3 border-2 border-gray-700 rounded-lg text-black bg-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
  const selectStyles = "w-full p-3 border-2 border-gray-700 rounded-lg text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"

  const renderAbilityScore = (ability, label, icon) => {
    const Icon = icon
    return (
      <div className="bg-white border-2 border-gray-700 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Icon size={18} className="text-blue-600" />
          <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">{label}</span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          <input
            type="number"
            value={characterData[ability]}
            onChange={(e) => handleAbilityChange(ability, e.target.value)}
            className="w-16 text-center border-none bg-transparent text-3xl font-bold text-black focus:outline-none"
            min="1"
            max="20"
          />
        </div>
        <div className="text-lg text-blue-600 font-bold">
          {getAbilityModifierString(characterData[ability])}
        </div>
      </div>
    )
  }

  const renderSavingThrow = (ability, label) => {
    const modifier = getAbilityModifier(characterData[ability])
    const proficient = characterData.savingThrows[ability].proficient
    const totalModifier = proficient ? modifier + characterData.proficiencyBonus : modifier
    
    return (
      <div className="flex items-center gap-3 p-2 border-b border-gray-200 last:border-b-0">
        <input
          type="checkbox"
          checked={proficient}
          onChange={(e) => handleSavingThrowChange(ability, 'proficient', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-800 min-w-[80px]">{label}</span>
        <span className="text-sm text-gray-600 ml-auto">
          {totalModifier >= 0 ? `+${totalModifier}` : `${totalModifier}`}
        </span>
      </div>
    )
  }

  const renderSkill = (skill) => {
    const abilityModifier = getAbilityModifier(characterData[skill.ability])
    const proficient = characterData.skills[skill.key].proficient
    const totalModifier = proficient ? abilityModifier + characterData.proficiencyBonus : abilityModifier
    
    return (
      <div className="flex items-center gap-3 p-2 border-b border-gray-200 last:border-b-0">
        <input
          type="checkbox"
          checked={proficient}
          onChange={(e) => handleSkillChange(skill.key, 'proficient', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-800 min-w-[120px]">{skill.name}</span>
        <span className="text-xs text-gray-500">({skill.ability.charAt(0).toUpperCase() + skill.ability.slice(1)})</span>
        <span className="text-sm text-gray-600 ml-auto">
          {totalModifier >= 0 ? `+${totalModifier}` : `${totalModifier}`}
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onBackToMenu}
              className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-all duration-200 hover:scale-105"
              title="Volver al menú"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold tracking-wide">DUNGEONS & DRAGONS®</h1>
          </div>
          <button
            onClick={handleFinish}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Save size={24} />
            <span className="font-semibold">Crear Personaje</span>
          </button>
        </div>

        {/* Character Sheet */}
        <div className="p-8">
          {/* Top Section - Character Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Personaje</h2>
            <div className="grid grid-cols-9 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">EDICIÓN</label>
                <select
                  value={characterData.edition}
                  onChange={(e) => handleInputChange('edition', e.target.value)}
                  className={selectStyles}
                >
                  {editions.map(edition => (
                    <option key={edition.value} value={edition.value} className="text-black bg-white">
                      {edition.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-800 mb-2">NOMBRE DEL PERSONAJE</label>
                <input
                  type="text"
                  value={characterData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border-2 border-gray-700 rounded-lg text-lg font-bold text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Nombre del personaje"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">CLASE</label>
                <select
                  value={characterData.class}
                  onChange={(e) => handleInputChange('class', e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Seleccionar Clase</option>
                  {classes.map(cls => (
                    <option key={cls.name} value={cls.name} className="text-black bg-white">
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">NIVEL</label>
                <select
                  value={characterData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                  className={selectStyles}
                >
                  <option value={1}>Nivel 1</option>
                  <option value={3}>Nivel 3</option>
                  <option value={5}>Nivel 5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">TRASFONDO</label>
                <select
                  value={characterData.background}
                  onChange={(e) => handleInputChange('background', e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Seleccionar</option>
                  {backgrounds.map(bg => (
                    <option key={bg.name} value={bg.name} className="text-black bg-white">{bg.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">NOMBRE DEL JUGADOR</label>
                <input
                  type="text"
                  value={characterData.playerName}
                  onChange={(e) => handleInputChange('playerName', e.target.value)}
                  className={inputStyles}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">RAZA</label>
                <select
                  value={characterData.race}
                  onChange={(e) => handleInputChange('race', e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Seleccionar</option>
                  {races.map(race => (
                    <option key={race.name} value={race.name} className="text-black bg-white">{race.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">ALINEAMIENTO</label>
                <select
                  value={characterData.alignment}
                  onChange={(e) => handleInputChange('alignment', e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Seleccionar</option>
                  {alignments.map(alignment => (
                    <option key={alignment} value={alignment} className="text-black bg-white">{alignment}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">PUNTOS DE EXPERIENCIA</label>
                <input
                  type="number"
                  value={characterData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className={inputStyles}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* Left Column - Ability Scores & Skills */}
            <div className="space-y-6">
              {/* Inspiration & Proficiency Bonus */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Star size={20} className="text-yellow-500" />
                  <h3 className="text-lg font-bold text-gray-800">INSPIRACIÓN</h3>
                  <input
                    type="checkbox"
                    checked={characterData.inspiration}
                    onChange={(e) => handleInputChange('inspiration', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800">BONIFICADOR POR COMPETENCIA</span>
                  <input
                    type="number"
                    value={characterData.proficiencyBonus}
                    onChange={(e) => handleInputChange('proficiencyBonus', e.target.value)}
                    className="w-16 p-2 border-2 border-gray-700 rounded-lg text-center text-lg font-bold text-black bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Ability Scores */}
              <div className="space-y-3">
                {renderAbilityScore('strength', 'Fuerza', Sword)}
                {renderAbilityScore('dexterity', 'Destreza', Zap)}
                {renderAbilityScore('constitution', 'Constitución', Heart)}
                {renderAbilityScore('intelligence', 'Inteligencia', BookOpen)}
                {renderAbilityScore('wisdom', 'Sabiduría', User)}
                {renderAbilityScore('charisma', 'Carisma', User)}
              </div>

              {/* Saving Throws */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Shield size={20} className="text-green-600" />
                  TIRADAS DE SALVACIÓN
                </h3>
                <div className="space-y-1">
                  {renderSavingThrow('strength', 'Fuerza')}
                  {renderSavingThrow('dexterity', 'Destreza')}
                  {renderSavingThrow('constitution', 'Constitución')}
                  {renderSavingThrow('intelligence', 'Inteligencia')}
                  {renderSavingThrow('wisdom', 'Sabiduría')}
                  {renderSavingThrow('charisma', 'Carisma')}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Target size={20} className="text-purple-600" />
                  HABILIDADES
                </h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {skills.map(skill => renderSkill(skill))}
                </div>
              </div>

              {/* Passive Perception */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Eye size={20} className="text-blue-600" />
                  SABIDURÍA (PERCEPCIÓN) PASIVA
                </h3>
                <input
                  type="number"
                  value={getPassivePerception()}
                  readOnly
                  className="w-full p-3 border-2 border-gray-700 rounded-lg text-center text-xl font-bold text-black bg-white"
                />
              </div>

              {/* Other Proficiencies */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ScrollText size={20} className="text-orange-600" />
                  OTRAS COMPETENCIAS E IDIOMAS
                </h3>
                <textarea
                  value={characterData.otherProficiencies}
                  onChange={(e) => handleInputChange('otherProficiencies', e.target.value)}
                  className="w-full p-3 border-2 border-gray-700 rounded-lg h-32 resize-none text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Idiomas, herramientas, armas, armaduras..."
                />
              </div>
            </div>

            {/* Middle Column - Combat & Health */}
            <div className="space-y-6">
              {/* Combat Stats */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Shield size={20} className="text-red-600" />
                  ESTADÍSTICAS DE COMBATE
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <label className="block text-sm font-bold text-gray-800 mb-2">CLASE DE ARMADURA</label>
                    <input
                      type="number"
                      value={characterData.armorClass}
                      onChange={(e) => handleInputChange('armorClass', e.target.value)}
                      className="w-20 p-3 border-2 border-gray-700 rounded-lg text-center text-xl font-bold text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-bold text-gray-800 mb-2">INICIATIVA</label>
                    <input
                      type="number"
                      value={characterData.initiative}
                      onChange={(e) => handleInputChange('initiative', e.target.value)}
                      className="w-20 p-3 border-2 border-gray-700 rounded-lg text-center text-xl font-bold text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="text-center">
                    <label className="block text-sm font-bold text-gray-800 mb-2">VELOCIDAD</label>
                    <input
                      type="number"
                      value={characterData.speed}
                      onChange={(e) => handleInputChange('speed', e.target.value)}
                      className="w-20 p-3 border-2 border-gray-700 rounded-lg text-center text-xl font-bold text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Hit Points */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Heart size={20} className="text-red-600" />
                  PUNTOS DE GOLPE
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Puntos de golpe máximos</label>
                    <input
                      type="number"
                      value={characterData.maxHP}
                      onChange={(e) => handleInputChange('maxHP', e.target.value)}
                      className="w-24 p-3 border-2 border-gray-700 rounded-lg text-center text-lg font-bold text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">PUNTOS DE GOLPE ACTUALES</label>
                    <input
                      type="number"
                      value={characterData.currentHP}
                      onChange={(e) => handleInputChange('currentHP', e.target.value)}
                      className="w-full p-3 border-2 border-gray-700 rounded-lg text-center text-xl font-bold text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">PUNTOS DE GOLPE TEMPORALES</label>
                    <input
                      type="number"
                      value={characterData.tempHP}
                      onChange={(e) => handleInputChange('tempHP', e.target.value)}
                      className="w-full p-3 border-2 border-gray-700 rounded-lg text-center text-lg font-bold text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Hit Dice */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                     <Circle size={20} className="text-green-600" />
                  DADOS DE GOLPE
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Total</label>
                    <input
                      type="number"
                      value={characterData.hitDiceTotal}
                      onChange={(e) => handleInputChange('hitDiceTotal', e.target.value)}
                      className="w-full p-3 border-2 border-gray-700 rounded-lg text-center text-lg font-bold text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Tipo</label>
                    <input
                      type="text"
                      value={characterData.hitDice}
                      onChange={(e) => handleInputChange('hitDice', e.target.value)}
                      className="w-full p-3 border-2 border-gray-700 rounded-lg text-center text-lg font-bold text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="1d10"
                    />
                  </div>
                </div>
              </div>

              {/* Death Saves */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Crosshair size={20} className="text-red-600" />
                  SALVACIONES CONTRA MUERTE
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">ÉXITOS</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(num => (
                        <input
                          key={num}
                          type="checkbox"
                          checked={characterData.deathSaves.successes >= num}
                          onChange={(e) => handleDeathSaveChange('successes', e.target.checked ? num : num - 1)}
                          className="w-6 h-6 text-green-600 border-gray-300 rounded-full focus:ring-green-500"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">FALLOS</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(num => (
                        <input
                          key={num}
                          type="checkbox"
                          checked={characterData.deathSaves.failures >= num}
                          onChange={(e) => handleDeathSaveChange('failures', e.target.checked ? num : num - 1)}
                          className="w-6 h-6 text-red-600 border-gray-300 rounded-full focus:ring-red-500"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Personality & Features */}
            <div className="space-y-6">
              {/* Personality */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  RASGOS DE PERSONALIDAD
                </h3>
                <textarea
                  value={characterData.personalityTrait || characterData.personalityTraits}
                  onChange={(e) => handleInputChange('personalityTrait', e.target.value)}
                  className="w-full p-3 border-2 border-gray-700 rounded-lg h-24 resize-none text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Describe los rasgos de personalidad de tu personaje..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Star size={20} className="text-yellow-600" />
                  IDEALES
                </h3>
                <textarea
                  value={characterData.ideal || characterData.ideals}
                  onChange={(e) => handleInputChange('ideal', e.target.value)}
                  className="w-full p-3 border-2 border-gray-700 rounded-lg h-24 resize-none text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Los ideales que guían a tu personaje..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Heart size={20} className="text-red-600" />
                  VÍNCULOS
                </h3>
                <textarea
                  value={characterData.bond || characterData.bonds}
                  onChange={(e) => handleInputChange('bond', e.target.value)}
                  className="w-full p-3 border-2 border-gray-700 rounded-lg h-24 resize-none text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Las conexiones que tiene tu personaje..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-orange-600" />
                  DEFECTOS
                </h3>
                <textarea
                  value={characterData.flaw || characterData.flaws}
                  onChange={(e) => handleInputChange('flaw', e.target.value)}
                  className="w-full p-3 border-2 border-gray-700 rounded-lg h-24 resize-none text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Los defectos de tu personaje..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen size={20} className="text-green-600" />
                  RASGOS Y ATRIBUTOS
                </h3>
                <textarea
                  value={characterData.features}
                  onChange={(e) => handleInputChange('features', e.target.value)}
                  className="w-full p-3 border-2 border-gray-700 rounded-lg h-32 resize-none text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Rasgos raciales, de clase, y otros atributos..."
                />
              </div>
            </div>

            {/* Fourth Column - Attacks & Equipment */}
            <div className="space-y-6">
              {/* Attacks */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Sword size={20} className="text-red-600" />
                  ATAQUES Y LANZAMIENTO DE CONJUROS
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold text-gray-800 mb-2">
                    <span>NOMBRE</span>
                    <span>BONIFICADOR</span>
                    <span>DAÑO/TIPO</span>
                  </div>
                  {characterData.attacks.map((attack, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={attack.name}
                        onChange={(e) => {
                          const newAttacks = [...characterData.attacks]
                          newAttacks[index].name = e.target.value
                          setCharacterData(prev => ({ ...prev, attacks: newAttacks }))
                        }}
                        className="p-2 border-2 border-gray-700 rounded text-sm text-black bg-white focus:border-blue-500 focus:outline-none"
                        placeholder="Arma/Conjuro"
                      />
                      <input
                        type="text"
                        value={attack.bonus}
                        onChange={(e) => {
                          const newAttacks = [...characterData.attacks]
                          newAttacks[index].bonus = e.target.value
                          setCharacterData(prev => ({ ...prev, attacks: newAttacks }))
                        }}
                        className="p-2 border-2 border-gray-700 rounded text-sm text-black bg-white focus:border-blue-500 focus:outline-none"
                        placeholder="+5"
                      />
                      <input
                        type="text"
                        value={attack.damage}
                        onChange={(e) => {
                          const newAttacks = [...characterData.attacks]
                          newAttacks[index].damage = e.target.value
                          setCharacterData(prev => ({ ...prev, attacks: newAttacks }))
                        }}
                        className="p-2 border-2 border-gray-700 rounded text-sm text-black bg-white focus:border-blue-500 focus:outline-none"
                        placeholder="1d8+3"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={20} className="text-brown-600" />
                  EQUIPO
                </h3>
                <textarea
                  value={characterData.equipment}
                  onChange={(e) => handleInputChange('equipment', e.target.value)}
                  className="w-full p-3 border-2 border-gray-700 rounded-lg h-64 resize-none text-black bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Lista todo el equipo de tu personaje..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 text-center">
          <p className="text-sm opacity-90">TM y ©2014 Wizards of the Coast LLC. Tienes permiso para fotocopiar este documento para uso personal.</p>
        </div>
      </div>
    </div>
  )
}

export default CharacterSheet

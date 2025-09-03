import React, { useState, useEffect } from 'react';
import { isApiKeyConfigured } from '../utils/aiService';

const GameOptions = ({ onClose, onSave, currentOptions = {} }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState('checking'); // 'checking', 'configured', 'not-configured'
  const [options, setOptions] = useState({
    // Configuración de tono y contenido
    contentRating: currentOptions.contentRating || 'PG-13',
    violenceLevel: currentOptions.violenceLevel || 'moderate',
    descriptionLevel: currentOptions.descriptionLevel || 'moderate',
    
    // Configuración de dificultad
    difficulty: currentOptions.difficulty || 'normal',
    deathSaves: currentOptions.deathSaves || 'standard',
    criticalHits: currentOptions.criticalHits || 'standard',
    
    // Configuración de mundo
    worldStyle: currentOptions.worldStyle || 'medieval',
    magicLevel: currentOptions.magicLevel || 'standard',
    technologyLevel: currentOptions.technologyLevel || 'medieval',
    
    // Configuración de IA
    aiStyle: currentOptions.aiStyle || 'balanced',
    npcComplexity: currentOptions.npcComplexity || 'moderate',
    storyComplexity: currentOptions.storyComplexity || 'moderate',
    
    // Configuración de combate
    combatStyle: currentOptions.combatStyle || 'tactical',
    initiativeStyle: currentOptions.initiativeStyle || 'standard',
    healingStyle: currentOptions.healingStyle || 'standard',
    
    // Configuración de exploración
    explorationStyle: currentOptions.explorationStyle || 'detailed',
    travelStyle: currentOptions.travelStyle || 'realistic',
    weatherEffects: currentOptions.weatherEffects || 'moderate',
    
    // Configuración de economía
    economyStyle: currentOptions.economyStyle || 'realistic',
    itemRarity: currentOptions.itemRarity || 'standard',
    craftingSystem: currentOptions.craftingSystem || 'basic',
    
    // Configuración de rol
    roleplayStyle: currentOptions.roleplayStyle || 'balanced',
    socialComplexity: currentOptions.socialComplexity || 'moderate',
    politicalIntrigue: currentOptions.politicalIntrigue || 'moderate',
    
    // Configuración de progresión
    progressionStyle: currentOptions.progressionStyle || 'milestone',
    experienceRate: currentOptions.experienceRate || 'standard',
    levelCap: currentOptions.levelCap || '20',
    
    // Configuración de casa
    homebrewRules: currentOptions.homebrewRules || 'none',
    variantRules: currentOptions.variantRules || 'none',
    customContent: currentOptions.customContent || 'none'
  });

  // Cargar la API key al abrir el modal
  useEffect(() => {
    loadApiKey();
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const configured = await isApiKeyConfigured();
      setApiKeyStatus(configured ? 'configured' : 'not-configured');
    } catch (error) {
      console.error('Error al verificar estado de API key:', error);
      setApiKeyStatus('not-configured');
    }
  };

  const loadApiKey = async () => {
    try {
      if (window.electronAPI) {
        const key = await window.electronAPI.getApiKey();
        setApiKey(key || '');
      } else {
        // Para versión web, intentar cargar desde localStorage
        const savedKey = localStorage.getItem('openai_api_key');
        setApiKey(savedKey || '');
      }
    } catch (error) {
      console.error('Error al cargar API key:', error);
    }
  };

  const handleOptionChange = (category, value) => {
    setOptions(prev => ({
      ...prev,
      [category]: value
    }));
    setSelectedOption({ category, value });
  };

  // Función para obtener la descripción de cada opción
  // Función helper para obtener el estilo del select
  const getSelectStyle = (category, color) => ({
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: selectedOption?.category === category ? `2px solid ${color}` : '1px solid #34495e',
    backgroundColor: '#34495e',
    color: 'white',
    transition: 'all 0.3s ease'
  });

  const getOptionDescription = (category, value) => {
    const descriptions = {
      contentRating: {
        'Family': 'Contenido apropiado para toda la familia. Violencia mínima, sin descripciones gráficas, enfoque en aventura y descubrimiento.',
        'PG-13': 'Contenido apropiado para adolescentes. Violencia moderada, evita gore innecesario, moral gris pero accesible.',
        'PG-16': 'Contenido maduro. Violencia moderada, temas complejos y decisiones difíciles, moral ambigua.',
        'PG-18': 'Contenido adulto. Violencia gráfica permitida, temas maduros y complejos, consecuencias severas.'
      },
      violenceLevel: {
        'minimal': 'Violencia mínima. Combate sin descripciones gráficas, enfoque en resolución pacífica, consecuencias no letales cuando sea posible.',
        'moderate': 'Violencia moderada. Combate realista sin excesos, descripciones apropiadas para la edad, consecuencias reales pero no excesivas.',
        'intense': 'Violencia intensa. Combate detallado y realista, descripciones vívidas de batalla, consecuencias severas y permanentes.',
        'graphic': 'Violencia gráfica. Combate muy detallado y visceral, descripciones explícitas de daño, consecuencias extremas y traumáticas.'
      },
      worldStyle: {
        'medieval': 'Mundo medieval. Era medieval cruda sin pólvora o tecnología moderna, sociedad feudal y jerárquica, tecnología básica y artesanal.',
        'renaissance': 'Mundo renacentista. Renacimiento temprano con pólvora básica, sociedad en transición, tecnología emergente.',
        'steampunk': 'Mundo steampunk. Tecnología de vapor y engranajes, sociedad industrial temprana, magia y tecnología combinadas.',
        'modern': 'Mundo moderno. Época moderna con magia, tecnología actual disponible, sociedad contemporánea.'
      },
      difficulty: {
        'easy': 'Dificultad fácil. CD más bajas (8-12 para tareas normales), enemigos más débiles, más oportunidades de recuperación.',
        'normal': 'Dificultad normal. CD estándar según reglas (10-15 para tareas normales), enemigos con inteligencia estándar.',
        'hard': 'Dificultad difícil. CD más altas (12-18 para tareas normales), enemigos más inteligentes, consecuencias más severas.',
        'brutal': 'Dificultad brutal. CD muy altas (15-25 para tareas normales), enemigos extremadamente tácticos, muerte frecuente.'
      },
      combatStyle: {
        'cinematic': 'Combate cinemático. Acciones épicas y dramáticas, descripciones cinematográficas, énfasis en la narrativa sobre la táctica.',
        'tactical': 'Combate táctico. Énfasis en posicionamiento y estrategia, uso inteligente del terreno, coordinación entre enemigos.',
        'realistic': 'Combate realista. Consecuencias reales y peligrosas, daño permanente frecuente, enemigos que huyen cuando es inteligente.',
        'fast': 'Combate rápido. Combates dinámicos y fluidos, menos descripciones más acción, resolución rápida de turnos.'
      },
      magicLevel: {
        'low': 'Magia baja. Magia rara y misteriosa, conjuros limitados y costosos, reacciones de miedo hacia magos.',
        'standard': 'Magia estándar. Magia común pero respetada, conjuros según reglas estándar, aceptación social de magos.',
        'high': 'Magia alta. Magia abundante y poderosa, conjuros mejorados y variados, sociedad adaptada a la magia.',
        'epic': 'Magia épica. Magia legendaria y transformadora, conjuros de poder increíble, mundo moldeado por la magia.'
      },
      explorationStyle: {
        'simple': 'Exploración simple. Encuentros directos y claros, pistas obvias y fáciles de seguir, navegación sencilla.',
        'detailed': 'Exploración detallada. Descripciones ricas del entorno, pistas sutiles pero descubribles, ambiente inmersivo.',
        'immersive': 'Exploración inmersiva. Descripciones muy detalladas, pistas muy sutiles y complejas, exploración como actividad principal.',
        'survival': 'Exploración de supervivencia. Énfasis en recursos y supervivencia, peligros ambientales frecuentes, gestión de suministros crítica.'
      },
      roleplayStyle: {
        'minimal': 'Rol mínimo. Enfoque en combate y aventura, PNJs simples y directos, diálogos breves y funcionales.',
        'balanced': 'Rol equilibrado. Balance entre acción y rol, PNJs con personalidades definidas, diálogos naturales y significativos.',
        'heavy': 'Rol pesado. Énfasis en desarrollo de personajes, PNJs complejos y memorables, diálogos extensos y significativos.',
        'theatrical': 'Rol teatral. Enfoque dramático y emocional, PNJs muy expresivos y memorables, diálogos dramáticos y emotivos.'
      },
      aiStyle: {
        'simple': 'IA simple. NPCs básicos, respuestas directas, menos complejidad en las interacciones.',
        'balanced': 'IA equilibrada. NPCs desarrollados, respuestas contextuales, interacciones significativas.',
        'complex': 'IA compleja. NPCs con personalidades profundas, respuestas inteligentes, interacciones sofisticadas.',
        'mastermind': 'IA maestra. NPCs extremadamente inteligentes, estrategias complejas, interacciones de alto nivel.'
      }
    };
    
    return descriptions[category]?.[value] || 'Descripción no disponible.';
  };

  const handleSave = async () => {
    try {
      // Guardar la API key
      if (window.electronAPI) {
        await window.electronAPI.saveApiKey(apiKey);
      } else {
        // Para versión web, guardar en localStorage
        localStorage.setItem('openai_api_key', apiKey);
      }
      
      // Verificar el estado de la API key después de guardar
      await checkApiKeyStatus();
      
      // Guardar las opciones del juego
      onSave(options);
      onClose();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      alert('Error al guardar la configuración. Por favor, intenta de nuevo.');
    }
  };

  const getPromptModifier = () => {
    let promptModifier = '';
    
    // Modificadores por clasificación de contenido
    switch (options.contentRating) {
      case 'PG-13':
        promptModifier += 'TONO Y SEGURIDAD: PEGI 13 - violencia moderada, evita gore innecesario. ';
        break;
      case 'PG-16':
        promptModifier += 'TONO Y SEGURIDAD: PEGI 16 - violencia moderada, contenido maduro permitido. ';
        break;
      case 'PG-18':
        promptModifier += 'TONO Y SEGURIDAD: PEGI 18 - contenido adulto, violencia gráfica permitida. ';
        break;
      case 'Family':
        promptModifier += 'TONO Y SEGURIDAD: PEGI 7 - contenido familiar, violencia mínima. ';
        break;
    }

    // Modificadores por nivel de violencia
    switch (options.violenceLevel) {
      case 'minimal':
        promptModifier += 'VIOLENCIA: Mínima - combate sin descripciones gráficas. ';
        break;
      case 'moderate':
        promptModifier += 'VIOLENCIA: Moderada - combate realista sin excesos. ';
        break;
      case 'intense':
        promptModifier += 'VIOLENCIA: Intensa - combate detallado y realista. ';
        break;
      case 'graphic':
        promptModifier += 'VIOLENCIA: Gráfica - combate muy detallado y visceral. ';
        break;
    }

    // Modificadores por estilo de mundo
    switch (options.worldStyle) {
      case 'medieval':
        promptModifier += 'MUNDO: Era medieval cruda (sin pólvora/tecnología moderna). ';
        break;
      case 'renaissance':
        promptModifier += 'MUNDO: Renacimiento temprano con pólvora básica. ';
        break;
      case 'steampunk':
        promptModifier += 'MUNDO: Steampunk con tecnología de vapor. ';
        break;
      case 'modern':
        promptModifier += 'MUNDO: Época moderna con magia. ';
        break;
    }

    // Modificadores por dificultad
    switch (options.difficulty) {
      case 'easy':
        promptModifier += 'DIFICULTAD: Fácil - CD más bajas, enemigos más débiles. ';
        break;
      case 'normal':
        promptModifier += 'DIFICULTAD: Normal - CD estándar según reglas. ';
        break;
      case 'hard':
        promptModifier += 'DIFICULTAD: Difícil - CD más altas, enemigos más inteligentes. ';
        break;
      case 'brutal':
        promptModifier += 'DIFICULTAD: Brutal - CD muy altas, enemigos tácticos. ';
        break;
    }

    // Modificadores por estilo de combate
    switch (options.combatStyle) {
      case 'cinematic':
        promptModifier += 'COMBATE: Cinemático - acciones épicas y dramáticas. ';
        break;
      case 'tactical':
        promptModifier += 'COMBATE: Táctico - énfasis en posicionamiento y estrategia. ';
        break;
      case 'realistic':
        promptModifier += 'COMBATE: Realista - consecuencias reales y peligrosas. ';
        break;
      case 'fast':
        promptModifier += 'COMBATE: Rápido - combates dinámicos y fluidos. ';
        break;
    }

    return promptModifier;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
             <div style={{
         backgroundColor: '#2c3e50',
         borderRadius: '16px',
         padding: '32px',
         maxWidth: '1200px',
         width: '95vw',
         maxHeight: '95vh',
         overflow: 'auto',
         color: 'white',
         boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
       }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '2px solid #34495e',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, color: '#ecf0f1' }}>⚙️ Opciones de Partida</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ecf0f1',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Sección de Configuración de API */}
        <div style={{
          marginBottom: '32px',
          padding: '20px',
          backgroundColor: '#34495e',
          borderRadius: '12px',
          border: '2px solid #e74c3c'
        }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '16px', fontSize: '18px' }}>
            🔑 Configuración de OpenAI API
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              color: '#ecf0f1', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              API Key de OpenAI
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #2c3e50',
                  backgroundColor: '#2c3e50',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#bdc3c7',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p style={{ 
              fontSize: '12px', 
              color: '#bdc3c7', 
              marginTop: '8px',
              lineHeight: '1.4'
            }}>
              Obtén tu API key en{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#3498db', textDecoration: 'underline' }}
              >
                platform.openai.com
              </a>
              . Esta key es necesaria para que la IA funcione correctamente.
            </p>
            {/* Estado de la API Key */}
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: 
                apiKeyStatus === 'checking' ? '#f39c12' :
                apiKeyStatus === 'configured' ? '#27ae60' : '#e74c3c',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {apiKeyStatus === 'checking' && '⏳ Verificando API Key...'}
              {apiKeyStatus === 'configured' && '✅ API Key configurada y lista'}
              {apiKeyStatus === 'not-configured' && '❌ API Key no configurada'}
            </div>
            
            {apiKey && !apiKey.startsWith('sk-') && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#e74c3c',
                borderRadius: '6px',
                fontSize: '12px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                ⚠️ Formato de API Key inválido (debe empezar con "sk-")
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '24px' }}>
          {/* Columna Izquierda */}
          <div>
            {/* Clasificación de Contenido */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#3498db', marginBottom: '8px' }}>🎭 Clasificación de Contenido</h3>
              <select
                value={options.contentRating}
                onChange={(e) => handleOptionChange('contentRating', e.target.value)}
                style={getSelectStyle('contentRating', '#3498db')}
              >
                <option value="Family">👨‍👩‍👧‍👦 Familiar (PEGI 7)</option>
                <option value="PG-13">🎭 Adolescente (PEGI 13)</option>
                <option value="PG-16">🎭 Maduro (PEGI 16)</option>
                <option value="PG-18">🎭 Adulto (PEGI 18)</option>
              </select>
            </div>

            {/* Nivel de Violencia */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e74c3c', marginBottom: '8px' }}>⚔️ Nivel de Violencia</h3>
              <select
                value={options.violenceLevel}
                onChange={(e) => handleOptionChange('violenceLevel', e.target.value)}
                style={getSelectStyle('violenceLevel', '#e74c3c')}
              >
                <option value="minimal">🕊️ Mínima</option>
                <option value="moderate">⚔️ Moderada</option>
                <option value="intense">🔥 Intensa</option>
                <option value="graphic">💀 Gráfica</option>
              </select>
            </div>

            {/* Estilo de Mundo */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#f39c12', marginBottom: '8px' }}>🌍 Estilo de Mundo</h3>
              <select
                value={options.worldStyle}
                onChange={(e) => handleOptionChange('worldStyle', e.target.value)}
                style={getSelectStyle('worldStyle', '#f39c12')}
              >
                <option value="medieval">🏰 Medieval</option>
                <option value="renaissance">🎨 Renacimiento</option>
                <option value="steampunk">⚙️ Steampunk</option>
                <option value="modern">🏙️ Moderno</option>
              </select>
            </div>

            {/* Dificultad */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#9b59b6', marginBottom: '8px' }}>📊 Dificultad</h3>
              <select
                value={options.difficulty}
                onChange={(e) => handleOptionChange('difficulty', e.target.value)}
                style={getSelectStyle('difficulty', '#9b59b6')}
              >
                <option value="easy">😊 Fácil</option>
                <option value="normal">😐 Normal</option>
                <option value="hard">😰 Difícil</option>
                <option value="brutal">💀 Brutal</option>
              </select>
            </div>

            {/* Estilo de Combate */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e67e22', marginBottom: '8px' }}>⚔️ Estilo de Combate</h3>
              <select
                value={options.combatStyle}
                onChange={(e) => handleOptionChange('combatStyle', e.target.value)}
                style={getSelectStyle('combatStyle', '#e67e22')}
              >
                <option value="cinematic">🎬 Cinemático</option>
                <option value="tactical">🎯 Táctico</option>
                <option value="realistic">⚖️ Realista</option>
                <option value="fast">⚡ Rápido</option>
              </select>
            </div>
          </div>

          {/* Columna Derecha */}
          <div>
            {/* Nivel de Magia */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#8e44ad', marginBottom: '8px' }}>🔮 Nivel de Magia</h3>
              <select
                value={options.magicLevel}
                onChange={(e) => handleOptionChange('magicLevel', e.target.value)}
                style={getSelectStyle('magicLevel', '#8e44ad')}
              >
                <option value="low">🕯️ Baja</option>
                <option value="standard">✨ Estándar</option>
                <option value="high">🌟 Alta</option>
                <option value="epic">💫 Épica</option>
              </select>
            </div>

            {/* Estilo de Exploración */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#27ae60', marginBottom: '8px' }}>🗺️ Exploración</h3>
              <select
                value={options.explorationStyle}
                onChange={(e) => handleOptionChange('explorationStyle', e.target.value)}
                style={getSelectStyle('explorationStyle', '#27ae60')}
              >
                <option value="simple">🚶 Simple</option>
                <option value="detailed">🔍 Detallada</option>
                <option value="immersive">🌿 Inmersiva</option>
                <option value="survival">🏕️ Supervivencia</option>
              </select>
            </div>

            {/* Estilo de Rol */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#16a085', marginBottom: '8px' }}>🎭 Rol</h3>
              <select
                value={options.roleplayStyle}
                onChange={(e) => handleOptionChange('roleplayStyle', e.target.value)}
                style={getSelectStyle('roleplayStyle', '#16a085')}
              >
                <option value="minimal">📝 Mínimo</option>
                <option value="balanced">⚖️ Equilibrado</option>
                <option value="heavy">🎭 Pesado</option>
                <option value="theatrical">🎪 Teatral</option>
              </select>
            </div>

            {/* Progresión */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#f1c40f', marginBottom: '8px' }}>📈 Progresión</h3>
              <select
                value={options.progressionStyle}
                onChange={(e) => handleOptionChange('progressionStyle', e.target.value)}
                style={getSelectStyle('progressionStyle', '#f1c40f')}
              >
                <option value="milestone">🎯 Por Hitos</option>
                <option value="experience">📊 Por Experiencia</option>
                <option value="fast">⚡ Rápida</option>
                <option value="slow">🐌 Lenta</option>
              </select>
            </div>

            {/* Complejidad de IA */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e74c3c', marginBottom: '8px' }}>🤖 IA</h3>
              <select
                value={options.aiStyle}
                onChange={(e) => handleOptionChange('aiStyle', e.target.value)}
                style={getSelectStyle('aiStyle', '#e74c3c')}
              >
                <option value="simple">😊 Simple</option>
                <option value="balanced">⚖️ Equilibrada</option>
                <option value="complex">🧠 Compleja</option>
                <option value="mastermind">🎭 Maestra</option>
              </select>
            </div>
          </div>

                     {/* Columna de Descripciones */}
           <div style={{
             backgroundColor: '#34495e',
             borderRadius: '8px',
             padding: '20px',
             border: '1px solid #2c3e50',
             minHeight: '400px',
             display: 'flex',
             flexDirection: 'column'
           }}>
             <h3 style={{ color: '#3498db', marginBottom: '20px', textAlign: 'center', fontSize: '18px' }}>📖 Descripción Detallada</h3>
                         {selectedOption ? (
               <div style={{
                 flex: 1,
                 display: 'flex',
                 flexDirection: 'column'
               }}>
                 <div style={{
                   backgroundColor: '#2c3e50',
                   padding: '16px',
                   borderRadius: '8px',
                   marginBottom: '16px',
                   border: '1px solid #3498db'
                 }}>
                   <strong style={{ 
                     color: '#f39c12', 
                     fontSize: '16px',
                     display: 'block',
                     marginBottom: '8px'
                   }}>
                     {selectedOption.category === 'contentRating' && '🎭 Clasificación de Contenido'}
                     {selectedOption.category === 'violenceLevel' && '⚔️ Nivel de Violencia'}
                     {selectedOption.category === 'worldStyle' && '🌍 Estilo de Mundo'}
                     {selectedOption.category === 'difficulty' && '📊 Dificultad'}
                     {selectedOption.category === 'combatStyle' && '⚔️ Estilo de Combate'}
                     {selectedOption.category === 'magicLevel' && '🔮 Nivel de Magia'}
                     {selectedOption.category === 'explorationStyle' && '🗺️ Exploración'}
                     {selectedOption.category === 'roleplayStyle' && '🎭 Rol'}
                     {selectedOption.category === 'progressionStyle' && '📈 Progresión'}
                     {selectedOption.category === 'aiStyle' && '🤖 IA'}
                   </strong>
                   <div style={{ 
                     color: '#bdc3c7', 
                     fontSize: '12px',
                     fontStyle: 'italic'
                   }}>
                     Opción seleccionada: {selectedOption.value}
                   </div>
                 </div>
                 <div style={{
                   flex: 1,
                   backgroundColor: '#2c3e50',
                   padding: '20px',
                   borderRadius: '8px',
                   border: '1px solid #34495e'
                 }}>
                   <p style={{ 
                     margin: 0,
                     fontSize: '15px',
                     lineHeight: '1.8',
                     color: '#ecf0f1',
                     textAlign: 'justify'
                   }}>
                     {getOptionDescription(selectedOption.category, selectedOption.value)}
                   </p>
                 </div>
               </div>
                         ) : (
               <div style={{
                 flex: 1,
                 display: 'flex',
                 flexDirection: 'column',
                 justifyContent: 'center',
                 alignItems: 'center',
                 textAlign: 'center'
               }}>
                 <div style={{
                   fontSize: '48px',
                   marginBottom: '20px',
                   opacity: 0.5
                 }}>
                   📖
                 </div>
                 <div style={{
                   fontSize: '16px',
                   lineHeight: '1.6',
                   color: '#bdc3c7',
                   fontStyle: 'italic',
                   maxWidth: '300px'
                 }}>
                   Selecciona una opción de la izquierda para ver su descripción detallada y entender cómo afectará tu experiencia de juego.
                 </div>
               </div>
             )}
          </div>
        </div>

                 {/* Vista Previa del Prompt */}
         <div style={{
           marginTop: '24px',
           padding: '20px',
           backgroundColor: '#34495e',
           borderRadius: '8px',
           border: '1px solid #2c3e50'
         }}>
           <h4 style={{ color: '#3498db', marginBottom: '16px', fontSize: '16px' }}>🔧 Modificadores del Prompt:</h4>
           <div style={{
             fontSize: '13px',
             lineHeight: '1.6',
             color: '#bdc3c7',
             maxHeight: '120px',
             overflow: 'auto',
             padding: '12px',
             backgroundColor: '#2c3e50',
             borderRadius: '6px',
             border: '1px solid #34495e'
           }}>
             {getPromptModifier()}
           </div>
         </div>

        {/* Botones */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          marginTop: '24px',
          borderTop: '2px solid #34495e',
          paddingTop: '16px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid #34495e',
              backgroundColor: 'transparent',
              color: '#ecf0f1',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#27ae60',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            💾 Guardar Opciones
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOptions;

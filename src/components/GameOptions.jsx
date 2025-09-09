import React, { useState, useEffect } from 'react';
import { isAIConfigured } from '../utils/aiService';
import { hardwareAnalyzer } from '../utils/hardwareAnalyzer';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';

const GameOptions = ({ onClose, onSave, currentOptions = {} }) => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [selectedOption, setSelectedOption] = useState(null);
  const [aiProvider, setAiProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [aiConfigStatus, setAiConfigStatus] = useState('checking'); // 'checking', 'configured', 'not-configured'
  const [developerMode, setDeveloperMode] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [hardwareAnalysis, setHardwareAnalysis] = useState(null)
  const [analyzingHardware, setAnalyzingHardware] = useState(false)
  const [downloadingModel, setDownloadingModel] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')
  const [modelDirectory, setModelDirectory] = useState('')
  const [ollamaInstalled, setOllamaInstalled] = useState(false)
  const [foundModels, setFoundModels] = useState([])
  const [searchingModels, setSearchingModels] = useState(false)
  const [showFoundModels, setShowFoundModels] = useState(false)
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

  // Cargar la configuración de IA al abrir el modal
  useEffect(() => {
    loadAIConfig();
    checkAIConfigStatus();
    loadDeveloperMode();
  }, []);

  // Verificar instalación de Ollama cuando se cambia a Ollama
  useEffect(() => {
    if (aiProvider === 'ollama') {
      checkOllamaInstallation();
    }
  }, [aiProvider]);

  const checkAIConfigStatus = async () => {
    try {
      const configured = await isAIConfigured();
      setAiConfigStatus(configured ? 'configured' : 'not-configured');
    } catch (error) {
      console.error('Error al verificar estado de configuración de IA:', error);
      setAiConfigStatus('not-configured');
    }
  };

  const loadAIConfig = async () => {
    try {
      if (window.electronAPI) {
        const config = await window.electronAPI.getAIConfig();
        setAiProvider(config.provider || 'openai');
        setApiKey(config.apiKey || '');
        setOllamaUrl(config.ollamaUrl || 'http://localhost:11434');
        
        // Validar que el modelo de Ollama sea válido
        const ollamaModel = config.ollamaModel || 'llama3.2';
        const invalidModels = ['blobs', 'manifests', 'tmp', 'cache'];
        
        if (invalidModels.includes(ollamaModel.toLowerCase())) {
          console.warn(`Modelo inválido detectado: ${ollamaModel}. Reseteando a llama3.2`);
          setOllamaModel('llama3.2');
          // Guardar la configuración corregida
          await window.electronAPI.saveAIConfig({
            provider: config.provider || 'openai',
            apiKey: config.apiKey || '',
            ollamaUrl: config.ollamaUrl || 'http://localhost:11434',
            ollamaModel: 'llama3.2'
          });
        } else {
          setOllamaModel(ollamaModel);
        }
      } else {
        throw new Error('Esta aplicación solo funciona en Electron');
      }
    } catch (error) {
      console.error('Error al cargar configuración de IA:', error);
    }
  };

  const loadDeveloperMode = async () => {
    try {
      if (window.electronAPI) {
        const devMode = await window.electronAPI.getDeveloperMode();
        setDeveloperMode(devMode || false);
      }
    } catch (error) {
      console.error('Error al cargar modo desarrollador:', error);
    }
  };

  const testOllamaConnection = async () => {
    if (aiProvider !== 'ollama') return;
    
    setTestingConnection(true);
    try {
      // Importar las funciones de diagnóstico
      const { diagnoseOllamaConnection } = await import('../utils/aiService');
      
      const diagnostics = await diagnoseOllamaConnection(ollamaUrl, ollamaModel);
      
      if (diagnostics.connection && diagnostics.model && diagnostics.response) {
        setAiConfigStatus('configured');
        alert('✅ ¡Conexión exitosa con Ollama!\n\n' +
              `• Servidor: ${ollamaUrl}\n` +
              `• Modelo: ${ollamaModel}\n` +
              '• Estado: Listo para usar');
      } else {
        setAiConfigStatus('not-configured');
        const errorMessages = diagnostics.errors.join('\n• ');
        alert('❌ Error de conexión con Ollama:\n\n' +
              `• ${errorMessages}\n\n` +
              'Verifica que Ollama esté ejecutándose y el modelo esté descargado.');
      }
    } catch (error) {
      setAiConfigStatus('not-configured');
      alert('❌ Error al probar la conexión:\n\n' + error.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const analyzeHardware = async () => {
    setAnalyzingHardware(true);
    try {
      const analysis = await hardwareAnalyzer.analyzeSystem();
      setHardwareAnalysis(analysis);
      
      // Aplicar recomendación automáticamente si es Ollama
      if (aiProvider === 'ollama' && analysis.recommendations.primary) {
        setOllamaModel(analysis.recommendations.primary);
      }
    } catch (error) {
      console.error('Error analizando hardware:', error);
      alert('❌ Error al analizar el hardware:\n\n' + error.message);
    } finally {
      setAnalyzingHardware(false);
    }
  };

  const selectModelDirectory = async () => {
    try {
      const directory = await window.electronAPI.selectModelDirectory();
      if (directory) {
        setModelDirectory(directory);
      }
    } catch (error) {
      console.error('Error seleccionando directorio:', error);
      alert('❌ Error seleccionando directorio:\n\n' + error.message);
    }
  };

  const downloadModel = async () => {
    if (!ollamaModel) {
      alert('❌ Por favor selecciona un modelo primero');
      return;
    }

    setDownloadingModel(true);
    setDownloadProgress('Iniciando descarga...');
    
    try {
      // Configurar listener para progreso
      const progressListener = (event, data) => {
        if (data.type === 'progress') {
          setDownloadProgress(data.data);
        } else if (data.type === 'error') {
          setDownloadProgress('Error: ' + data.data);
        }
      };
      
      window.electronAPI.onOllamaDownloadProgress(progressListener);
      
      // Iniciar descarga
      const result = await window.electronAPI.downloadOllamaModel({
        model: ollamaModel,
        customPath: modelDirectory || null
      });
      
      if (result.success) {
        setDownloadProgress('✅ Descarga completada');
        alert(`✅ Modelo ${ollamaModel} descargado exitosamente!`);
        setAiConfigStatus('configured');
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('Error descargando modelo:', error);
      setDownloadProgress('❌ Error en descarga');
      alert('❌ Error descargando modelo:\n\n' + error.message);
    } finally {
      setDownloadingModel(false);
      // Limpiar listener
      window.electronAPI.removeAllListeners('ollama-download-progress');
    }
  };

  const checkOllamaInstallation = async () => {
    try {
      const installed = await window.electronAPI.checkOllamaInstalled();
      setOllamaInstalled(installed);
      return installed;
    } catch (error) {
      console.error('Error verificando instalación de Ollama:', error);
      setOllamaInstalled(false);
      return false;
    }
  };

  const searchExistingModels = async () => {
    setSearchingModels(true);
    try {
      const models = await window.electronAPI.searchOllamaModels();
      setFoundModels(models);
      setShowFoundModels(true);
      
      if (models.length === 0) {
        alert('🔍 No se encontraron modelos de Ollama instalados en el sistema.\n\nPuedes descargar un modelo nuevo usando el botón "Descargar Modelo".');
      } else {
        alert(`🔍 Se encontraron ${models.length} modelo(s) de Ollama instalado(s) en el sistema.\n\nRevisa la lista de modelos encontrados para usar uno existente.`);
      }
    } catch (error) {
      console.error('Error buscando modelos:', error);
      alert('❌ Error buscando modelos existentes:\n\n' + error.message);
    } finally {
      setSearchingModels(false);
    }
  };

  const useExistingModel = async (model) => {
    try {
      const result = await window.electronAPI.useExistingModel({
        modelPath: model.fullPath,
        modelName: model.name
      });
      
      if (result.success) {
        setOllamaModel(model.name);
        setModelDirectory(model.location);
        setAiConfigStatus('configured');
        alert(`✅ Modelo ${model.name} configurado exitosamente!\n\nUbicación: ${model.location}`);
        setShowFoundModels(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error usando modelo existente:', error);
      alert('❌ Error configurando modelo existente:\n\n' + error.message);
    }
  };

  const handleOptionChange = (category, value) => {
    setOptions(prev => ({
      ...prev,
      [category]: value
    }));
    setSelectedOption({ category, value });
  };

  const handleAIProviderChange = async (provider) => {
    setAiProvider(provider);
    // Actualizar el estado de configuración cuando se cambia el proveedor
    await checkAIConfigStatus();
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
      // Guardar la configuración de IA
      if (window.electronAPI) {
        await window.electronAPI.saveAIConfig({
          provider: aiProvider,
          apiKey: apiKey,
          ollamaUrl: ollamaUrl,
          ollamaModel: ollamaModel
        });
        await window.electronAPI.saveDeveloperMode(developerMode);
      } else {
        throw new Error('Esta aplicación solo funciona en Electron');
      }
      
      // Verificar el estado de la configuración después de guardar
      await checkAIConfigStatus();
      
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
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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
          <h2 style={{ margin: 0, color: '#ecf0f1' }}>⚙️ {t('options.title')}</h2>
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
        
        {/* Selector de idioma / Language selector */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#2c3e50',
          borderRadius: '8px',
          border: '1px solid #34495e'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: '#ecf0f1',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {t('options.language')}
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#ecf0f1',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="language"
                value="es"
                checked={language === 'es'}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{ margin: 0 }}
              />
              {t('options.spanish')}
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#ecf0f1',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="language"
                value="en"
                checked={language === 'en'}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{ margin: 0 }}
              />
              {t('options.english')}
            </label>
          </div>
        </div>

                 {/* Sección de Configuración de IA */}
         <div style={{
           marginBottom: '32px',
           padding: '20px',
           backgroundColor: '#34495e',
           borderRadius: '12px',
           border: '2px solid #e74c3c'
         }}>
           <h3 style={{ color: '#e74c3c', marginBottom: '16px', fontSize: '18px' }}>
             🤖 Configuración de IA
           </h3>
           
           {/* Selector de Proveedor */}
           <div style={{ marginBottom: '20px' }}>
             <label style={{ 
               display: 'block', 
               color: '#ecf0f1', 
               marginBottom: '12px',
               fontWeight: 'bold',
               fontSize: '16px'
             }}>
               🤖 {t('ai.provider')}
             </label>
             
             {/* Botones de selección */}
             <div style={{
               display: 'flex',
               gap: '12px',
               marginBottom: '16px'
             }}>
               <button
                 onClick={() => handleAIProviderChange('openai')}
               style={{
                   flex: 1,
                   padding: '16px 20px',
                   borderRadius: '12px',
                   border: aiProvider === 'openai' ? '3px solid #27ae60' : '2px solid #34495e',
                   backgroundColor: aiProvider === 'openai' ? 'rgba(39, 174, 96, 0.2)' : '#34495e',
                 color: 'white',
                   cursor: 'pointer',
                   fontSize: '14px',
                   fontWeight: 'bold',
                   transition: 'all 0.3s ease',
                   display: 'flex',
                   flexDirection: 'column',
                   alignItems: 'center',
                   gap: '8px'
                 }}
               >
                 <div style={{ fontSize: '24px' }}>🔑</div>
                 <div>{t('ai.openai')}</div>
                 <div style={{ 
                   fontSize: '11px', 
                   opacity: 0.8,
                   textAlign: 'center',
                   lineHeight: '1.3'
                 }}>
                   Requiere API Key<br/>
                   Más potente y rápido
                 </div>
               </button>
               
               <button
                 onClick={() => handleAIProviderChange('ollama')}
                 style={{
                   flex: 1,
                   padding: '16px 20px',
                   borderRadius: '12px',
                   border: aiProvider === 'ollama' ? '3px solid #27ae60' : '2px solid #34495e',
                   backgroundColor: aiProvider === 'ollama' ? 'rgba(39, 174, 96, 0.2)' : '#34495e',
                   color: 'white',
                   cursor: 'pointer',
                   fontSize: '14px',
                   fontWeight: 'bold',
                   transition: 'all 0.3s ease',
                   display: 'flex',
                   flexDirection: 'column',
                   alignItems: 'center',
                   gap: '8px'
                 }}
               >
                 <div style={{ fontSize: '24px' }}>🦙</div>
                 <div>Ollama (Local)</div>
                 <div style={{ 
                   fontSize: '11px', 
                   opacity: 0.8,
                   textAlign: 'center',
                   lineHeight: '1.3'
                 }}>
                   Gratuito y privado<br/>
                   Funciona offline
                 </div>
               </button>
             </div>
             
             {/* Información del proveedor seleccionado */}
             <div style={{
               padding: '12px 16px',
               backgroundColor: aiProvider === 'openai' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(155, 89, 182, 0.1)',
               border: `1px solid ${aiProvider === 'openai' ? '#3498db' : '#9b59b6'}`,
               borderRadius: '8px',
               fontSize: '13px',
               color: '#ecf0f1'
             }}>
               {aiProvider === 'openai' ? (
                 <>
                   <strong style={{ color: '#3498db' }}>🔑 {t('ai.openai')}</strong>
                   <div style={{ marginTop: '4px', lineHeight: '1.4' }}>
                     • Respuestas más rápidas y precisas<br/>
                     • Mejor comprensión del contexto<br/>
                     • Requiere conexión a internet<br/>
                     • Costo por uso (muy económico)
                   </div>
                 </>
               ) : (
                 <>
                   <strong style={{ color: '#9b59b6' }}>🦙 Ollama (Local)</strong>
                   <div style={{ marginTop: '4px', lineHeight: '1.4' }}>
                     • Completamente gratuito<br/>
                     • Funciona sin conexión a internet<br/>
                     • Datos privados (no se envían a servidores)<br/>
                     • Requiere instalación local
                   </div>
                 </>
               )}
             </div>
           </div>

           {/* Configuración de OpenAI */}
           {aiProvider === 'openai' && (
             <div style={{ marginBottom: '16px' }}>
               <label style={{ 
                 display: 'block', 
                 color: '#ecf0f1', 
                 marginBottom: '8px',
                 fontWeight: 'bold'
               }}>
                 {t('ai.apiKey')}
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
           )}

           {/* Configuración de Ollama */}
           {aiProvider === 'ollama' && (
             <div style={{ marginBottom: '16px' }}>
               <div style={{
                 padding: '16px',
                 backgroundColor: 'rgba(155, 89, 182, 0.1)',
                 border: '1px solid #9b59b6',
                 borderRadius: '8px',
                 marginBottom: '16px'
               }}>
                 <div style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'space-between',
                   marginBottom: '12px'
                 }}>
                   <h4 style={{ 
                     color: '#9b59b6', 
                     margin: '0',
                     fontSize: '14px',
                     fontWeight: 'bold'
                   }}>
                     🛠️ Configuración de Ollama
                   </h4>
                   
                   {/* Indicador de modo desarrollador para Ollama */}
                   {developerMode && (
                     <div style={{
                       display: 'flex',
                       alignItems: 'center',
                       gap: '6px',
                       padding: '4px 8px',
                       backgroundColor: 'rgba(231, 76, 60, 0.2)',
                       border: '1px solid #e74c3c',
                       borderRadius: '6px',
                       fontSize: '11px',
                       color: '#e74c3c',
                       fontWeight: 'bold'
                     }}>
                       <div style={{ fontSize: '12px' }}>🔧</div>
                       <span>Modo Dev</span>
                     </div>
                   )}
                 </div>
                 
                 {/* Nota sobre modo desarrollador para Ollama */}
                 {developerMode && (
                   <div style={{
                     padding: '8px 12px',
                     backgroundColor: 'rgba(231, 76, 60, 0.1)',
                     border: '1px solid #e74c3c',
                     borderRadius: '6px',
                     marginBottom: '12px',
                     fontSize: '11px',
                     color: '#ecf0f1',
                     lineHeight: '1.4'
                   }}>
                     <strong style={{ color: '#e74c3c' }}>🔧 Modo Desarrollador Activo para Ollama</strong><br/>
                     Ollama responderá de manera técnica y directa para ayudarte a probar mecánicas y desarrollar el juego.
                   </div>
                 )}
                 
               <div style={{ marginBottom: '12px' }}>
                 <label style={{ 
                   display: 'block', 
                   color: '#ecf0f1', 
                   marginBottom: '8px',
                     fontWeight: 'bold',
                     fontSize: '13px'
                 }}>
                     🌐 URL del Servidor Ollama
                 </label>
                 <input
                   type="text"
                   value={ollamaUrl}
                   onChange={(e) => setOllamaUrl(e.target.value)}
                   placeholder="http://localhost:11434"
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
                   <div style={{ 
                     fontSize: '11px', 
                     color: '#bdc3c7', 
                     marginTop: '4px'
                   }}>
                     Por defecto: http://localhost:11434
                   </div>
               </div>
               
               <div style={{ marginBottom: '12px' }}>
                 <label style={{ 
                   display: 'block', 
                   color: '#ecf0f1', 
                   marginBottom: '8px',
                     fontWeight: 'bold',
                     fontSize: '13px'
                 }}>
                     🦙 Modelo de IA
                 </label>
                 <select
                   value={ollamaModel}
                   onChange={(e) => setOllamaModel(e.target.value)}
                   style={{
                     width: '100%',
                     padding: '12px',
                     borderRadius: '8px',
                     border: '1px solid #2c3e50',
                     backgroundColor: '#2c3e50',
                     color: 'white',
                     fontSize: '14px'
                   }}
                 >
                     {/* Modelos Pequeños (1-8GB) */}
                     <optgroup label="🟢 Modelos Pequeños (1-8GB)">
                       <option value="gemma:2b">💎 Gemma 2B (1.6GB) - Muy rápido</option>
                       <option value="phi3:mini">Φ Phi-3 Mini (2.3GB) - Rápido</option>
                       <option value="llama3.2:3b">🦙 Llama 3.2 3B (2GB) - Equilibrado</option>
                       <option value="llama3.2">🦙 Llama 3.2 8B (4.7GB) - Recomendado</option>
                       <option value="mistral:7b">🌪️ Mistral 7B (4.1GB) - Bueno para código</option>
                       <option value="codellama:7b">💻 Code Llama 7B (3.8GB) - Especializado en código</option>
                     </optgroup>
                     
                     {/* Modelos Medianos (8-20GB) */}
                     <optgroup label="🟡 Modelos Medianos (8-20GB)">
                       <option value="llama3.1:8b">🦙 Llama 3.1 8B (4.7GB) - Mejorado</option>
                       <option value="llama3.2:8b">🦙 Llama 3.2 8B (4.7GB) - Más reciente</option>
                       <option value="mistral:8x7b">🌪️ Mistral 8x7B (12GB) - Muy potente</option>
                       <option value="qwen2.5:14b">🐉 Qwen 2.5 14B (8.4GB) - Multilingüe</option>
                       <option value="deepseek-coder:6.7b">🔍 DeepSeek Coder 6.7B (4.1GB) - Código avanzado</option>
                     </optgroup>
                     
                     {/* Modelos Grandes (20-40GB) */}
                     <optgroup label="🟠 Modelos Grandes (20-40GB)">
                       <option value="llama3.1:70b">🦙 Llama 3.1 70B (40GB) - Muy potente</option>
                       <option value="llama3.2:70b">🦙 Llama 3.2 70B (40GB) - Máximo rendimiento</option>
                       <option value="qwen2.5:32b">🐉 Qwen 2.5 32B (19GB) - Excelente calidad</option>
                       <option value="mistral-nemo:12b">🌪️ Mistral Nemo 12B (7.2GB) - Optimizado</option>
                     </optgroup>
                     
                     {/* Modelos Especializados */}
                     <optgroup label="🔵 Modelos Especializados">
                       <option value="llava:7b">👁️ LLaVA 7B (4.7GB) - Multimodal (texto + imagen)</option>
                       <option value="bakllava:7b">🎨 BakLLaVA 7B (4.7GB) - Análisis de imágenes</option>
                       <option value="nomic-embed-text">📝 Nomic Embed Text (274MB) - Embeddings</option>
                       <option value="solar:10.7b">☀️ Solar 10.7B (6.4GB) - Coreano/Inglés</option>
                     </optgroup>
                 </select>
                   <div style={{ 
                     fontSize: '11px', 
                     color: '#bdc3c7', 
                     marginTop: '4px',
                     lineHeight: '1.4'
                   }}>
                     💡 <strong>Recomendaciones de hardware:</strong><br/>
                     • Modelos pequeños: 8GB RAM mínimo<br/>
                     • Modelos medianos: 16GB RAM + GPU recomendada<br/>
                     • Modelos grandes: 32GB+ RAM + GPU potente (40GB+ VRAM)
                   </div>
                 </div>
               </div>
               
               {/* Botones de análisis y prueba */}
               <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                 <button
                   onClick={analyzeHardware}
                   disabled={analyzingHardware}
                   style={{
                     flex: 1,
                     padding: '12px 16px',
                     borderRadius: '8px',
                     border: 'none',
                     backgroundColor: analyzingHardware ? '#95a5a6' : '#9b59b6',
                     color: 'white',
                     cursor: analyzingHardware ? 'not-allowed' : 'pointer',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     transition: 'all 0.3s ease',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '8px'
                   }}
                 >
                   {analyzingHardware ? (
                     <>
                       <div style={{ 
                         width: '16px', 
                         height: '16px', 
                         border: '2px solid #fff',
                         borderTop: '2px solid transparent',
                         borderRadius: '50%',
                         animation: 'spin 1s linear infinite'
                       }}></div>
                       Analizando...
                     </>
                   ) : (
                     <>
                       🔍 Analizar Hardware
                     </>
                   )}
                 </button>
                 
                 <button
                   onClick={testOllamaConnection}
                   disabled={testingConnection}
                   style={{
                     flex: 1,
                     padding: '12px 16px',
                     borderRadius: '8px',
                     border: 'none',
                     backgroundColor: testingConnection ? '#95a5a6' : '#3498db',
                     color: 'white',
                     cursor: testingConnection ? 'not-allowed' : 'pointer',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     transition: 'all 0.3s ease',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '8px'
                   }}
                 >
                   {testingConnection ? (
                     <>
                       <div style={{ 
                         width: '16px', 
                         height: '16px', 
                         border: '2px solid #fff',
                         borderTop: '2px solid transparent',
                         borderRadius: '50%',
                         animation: 'spin 1s linear infinite'
                       }}></div>
                       Probando...
                     </>
                   ) : (
                     <>
                       🔗 Probar Conexión
                     </>
                   )}
                 </button>
               </div>

               {/* Sección de descarga de modelos */}
               <div style={{
                 padding: '16px',
                 backgroundColor: 'rgba(46, 204, 113, 0.1)',
                 border: '1px solid #2ecc71',
                 borderRadius: '8px',
                 marginBottom: '12px'
               }}>
                 <div style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: '8px',
                   marginBottom: '12px'
                 }}>
                   <div style={{ fontSize: '20px' }}>📥</div>
                   <strong style={{ color: '#2ecc71', fontSize: '14px' }}>
                     Descargar Modelo
                   </strong>
                 </div>
                 
                 {/* Estado de instalación de Ollama */}
                 <div style={{ marginBottom: '12px' }}>
                   <div style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '8px',
                     fontSize: '12px'
                   }}>
                     <div style={{ 
                       width: '8px', 
                       height: '8px', 
                       borderRadius: '50%',
                       backgroundColor: ollamaInstalled ? '#2ecc71' : '#e74c3c'
                     }}></div>
                     <span style={{ color: ollamaInstalled ? '#2ecc71' : '#e74c3c' }}>
                       {ollamaInstalled ? 'Ollama instalado' : 'Ollama no detectado'}
                     </span>
                   </div>
                 </div>
                 
                 {/* Selector de directorio */}
                 <div style={{ marginBottom: '12px' }}>
                   <label style={{ 
                     display: 'block',
                 fontSize: '12px', 
                 color: '#bdc3c7', 
                     marginBottom: '4px'
                   }}>
                     📁 Directorio de modelos (opcional)
                   </label>
                   <div style={{ display: 'flex', gap: '8px' }}>
                     <input
                       type="text"
                       value={modelDirectory}
                       placeholder="Por defecto: ~/.ollama/models"
                       readOnly
                       style={{
                         flex: 1,
                         padding: '8px 12px',
                         borderRadius: '6px',
                         border: '1px solid #2c3e50',
                         backgroundColor: '#34495e',
                         color: '#ecf0f1',
                         fontSize: '12px'
                       }}
                     />
                     <button
                       onClick={selectModelDirectory}
                       style={{
                         padding: '8px 12px',
                         borderRadius: '6px',
                         border: 'none',
                         backgroundColor: '#34495e',
                         color: '#ecf0f1',
                         cursor: 'pointer',
                         fontSize: '12px',
                         whiteSpace: 'nowrap'
                       }}
                     >
                       📁 Elegir
                     </button>
                   </div>
                 </div>
                 
                 {/* Botón de descarga */}
                 <button
                   onClick={downloadModel}
                   disabled={downloadingModel || !ollamaInstalled}
                   style={{
                     width: '100%',
                     padding: '12px 16px',
                     borderRadius: '8px',
                     border: 'none',
                     backgroundColor: downloadingModel || !ollamaInstalled ? '#95a5a6' : '#2ecc71',
                     color: 'white',
                     cursor: downloadingModel || !ollamaInstalled ? 'not-allowed' : 'pointer',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     transition: 'all 0.3s ease',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '8px'
                   }}
                 >
                   {downloadingModel ? (
                     <>
                       <div style={{ 
                         width: '16px', 
                         height: '16px', 
                         border: '2px solid #fff',
                         borderTop: '2px solid transparent',
                         borderRadius: '50%',
                         animation: 'spin 1s linear infinite'
                       }}></div>
                       Descargando...
                     </>
                   ) : (
                     <>
                       📥 Descargar {ollamaModel}
                     </>
                   )}
                 </button>
                 
                 {/* Progreso de descarga */}
                 {downloadProgress && (
                   <div style={{
                 marginTop: '8px',
                     padding: '8px 12px',
                     backgroundColor: 'rgba(0, 0, 0, 0.3)',
                     borderRadius: '6px',
                     fontSize: '11px',
                     color: '#ecf0f1',
                     fontFamily: 'monospace',
                     whiteSpace: 'pre-wrap',
                     maxHeight: '100px',
                     overflow: 'auto'
                   }}>
                     {downloadProgress}
                   </div>
                 )}
               </div>

               {/* Sección de búsqueda de modelos existentes */}
               <div style={{
                 padding: '16px',
                 backgroundColor: 'rgba(52, 152, 219, 0.1)',
                 border: '1px solid #3498db',
                 borderRadius: '8px',
                 marginBottom: '12px'
               }}>
                 <div style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: '8px',
                   marginBottom: '12px'
                 }}>
                   <div style={{ fontSize: '20px' }}>🔍</div>
                   <strong style={{ color: '#3498db', fontSize: '14px' }}>
                     Buscar Modelos Existentes
                   </strong>
                 </div>
                 
                 <div style={{ marginBottom: '12px' }}>
                   <p style={{ 
                     fontSize: '12px', 
                     color: '#bdc3c7', 
                     margin: '0 0 8px 0',
                 lineHeight: '1.4'
               }}>
                     Busca modelos de Ollama ya instalados en tu sistema para evitar descargas duplicadas.
                   </p>
                 </div>
                 
                 <button
                   onClick={searchExistingModels}
                   disabled={searchingModels}
                   style={{
                     width: '100%',
                     padding: '12px 16px',
                     borderRadius: '8px',
                     border: 'none',
                     backgroundColor: searchingModels ? '#95a5a6' : '#3498db',
                     color: 'white',
                     cursor: searchingModels ? 'not-allowed' : 'pointer',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     transition: 'all 0.3s ease',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '8px'
                   }}
                 >
                   {searchingModels ? (
                     <>
                       <div style={{ 
                         width: '16px', 
                         height: '16px', 
                         border: '2px solid #fff',
                         borderTop: '2px solid transparent',
                         borderRadius: '50%',
                         animation: 'spin 1s linear infinite'
                       }}></div>
                       Buscando...
                     </>
                   ) : (
                     <>
                       🔍 Buscar Modelos Instalados
                     </>
                   )}
                 </button>
               </div>

               {/* Lista de modelos encontrados */}
               {showFoundModels && foundModels.length > 0 && (
                 <div style={{
                   padding: '16px',
                   backgroundColor: 'rgba(155, 89, 182, 0.1)',
                   border: '1px solid #9b59b6',
                   borderRadius: '8px',
                   marginBottom: '12px'
                 }}>
                   <div style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'space-between',
                     marginBottom: '12px'
                   }}>
                     <div style={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       gap: '8px'
                     }}>
                       <div style={{ fontSize: '20px' }}>📦</div>
                       <strong style={{ color: '#9b59b6', fontSize: '14px' }}>
                         Modelos Encontrados ({foundModels.length})
                       </strong>
                     </div>
                     <button
                       onClick={() => setShowFoundModels(false)}
                       style={{
                         background: 'none',
                         border: 'none',
                         color: '#9b59b6',
                         cursor: 'pointer',
                         fontSize: '16px',
                         padding: '4px'
                       }}
                     >
                       ✕
                     </button>
                   </div>
                   
                   <div style={{ 
                     maxHeight: '200px', 
                     overflowY: 'auto',
                     display: 'flex',
                     flexDirection: 'column',
                     gap: '8px'
                   }}>
                     {foundModels.map((model, index) => (
                       <div
                         key={index}
                         style={{
                           padding: '12px',
                           backgroundColor: 'rgba(0, 0, 0, 0.2)',
                           borderRadius: '6px',
                           border: '1px solid #9b59b6'
                         }}
                       >
                         <div style={{ 
                           display: 'flex', 
                           justifyContent: 'space-between',
                           alignItems: 'flex-start',
                           marginBottom: '8px'
                         }}>
                           <div>
                             <div style={{ 
                               fontWeight: 'bold', 
                               color: '#ecf0f1',
                               fontSize: '13px'
                             }}>
                               {model.name}
                             </div>
                             <div style={{ 
                               fontSize: '11px', 
                               color: '#bdc3c7',
                               marginTop: '2px'
                             }}>
                               📁 {model.location}
                             </div>
                           </div>
                           <button
                             onClick={() => useExistingModel(model)}
                             style={{
                               padding: '6px 12px',
                               borderRadius: '4px',
                               border: 'none',
                               backgroundColor: '#9b59b6',
                               color: 'white',
                               cursor: 'pointer',
                               fontSize: '11px',
                               fontWeight: 'bold',
                               whiteSpace: 'nowrap'
                             }}
                           >
                             Usar
                           </button>
                         </div>
                         
                         <div style={{ 
                           display: 'flex', 
                           justifyContent: 'space-between',
                           fontSize: '11px',
                           color: '#95a5a6'
                         }}>
                           <span>📏 {model.size}</span>
                           <span>📅 {new Date(model.modified).toLocaleDateString()}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               {/* Resultados del análisis de hardware */}
               {hardwareAnalysis && (
                 <div style={{
                   padding: '16px',
                   backgroundColor: 'rgba(155, 89, 182, 0.1)',
                   border: '1px solid #9b59b6',
                   borderRadius: '8px',
                   fontSize: '13px',
                   color: '#ecf0f1',
                   lineHeight: '1.5',
                   marginBottom: '12px'
                 }}>
                   <div style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '8px',
                     marginBottom: '12px'
                   }}>
                     <div style={{ fontSize: '20px' }}>🔍</div>
                     <strong style={{ color: '#9b59b6', fontSize: '14px' }}>
                       Análisis de Hardware Completado
                     </strong>
                   </div>
                   
                   {/* Rating del sistema */}
                   <div style={{ marginBottom: '12px' }}>
                     <div style={{ 
                       color: hardwareAnalyzer.getSystemRatingDescription(hardwareAnalysis.recommendations.systemRating).color,
                       fontWeight: 'bold',
                       marginBottom: '4px'
                     }}>
                       {hardwareAnalyzer.getSystemRatingDescription(hardwareAnalysis.recommendations.systemRating).title}
                     </div>
                     <div style={{ fontSize: '12px', opacity: 0.9 }}>
                       {hardwareAnalyzer.getSystemRatingDescription(hardwareAnalysis.recommendations.systemRating).description}
                     </div>
                   </div>
                   
                   {/* Recomendación principal */}
                   <div style={{ marginBottom: '12px' }}>
                     <strong style={{ color: '#f39c12' }}>🎯 Recomendación Principal:</strong>
                     <div style={{ marginTop: '4px' }}>
                       {(() => {
                         const modelInfo = hardwareAnalyzer.getModelInfo(hardwareAnalysis.recommendations.primary);
                         return (
                           <div>
                             <strong>{modelInfo.name}</strong> ({modelInfo.size})<br/>
                             <div style={{ fontSize: '11px', opacity: 0.8 }}>
                               {modelInfo.description}<br/>
                               Requisitos: {modelInfo.requirements}
                             </div>
                           </div>
                         );
                       })()}
                     </div>
                   </div>
                   
                   {/* Alternativas */}
                   <div style={{ marginBottom: '12px' }}>
                     <strong style={{ color: '#3498db' }}>🔄 Alternativas:</strong>
                     <div style={{ marginTop: '4px', fontSize: '12px' }}>
                       {hardwareAnalysis.recommendations.alternatives.slice(0, 3).map((alt, index) => {
                         const modelInfo = hardwareAnalyzer.getModelInfo(alt);
                         return (
                           <div key={index} style={{ marginBottom: '2px' }}>
                             • {modelInfo.name} ({modelInfo.size})
                           </div>
                         );
                       })}
                     </div>
                   </div>
                   
                   {/* Advertencias */}
                   {hardwareAnalysis.recommendations.warnings.length > 0 && (
                     <div>
                       <strong style={{ color: '#e74c3c' }}>⚠️ Advertencias:</strong>
                       <div style={{ marginTop: '4px', fontSize: '12px' }}>
                         {hardwareAnalysis.recommendations.warnings.map((warning, index) => (
                           <div key={index} style={{ marginBottom: '2px' }}>
                             • {warning}
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               )}

               {/* Información sobre modelos grandes */}
               {ollamaModel.includes('70b') && (
                 <div style={{
                   padding: '12px 16px',
                   backgroundColor: 'rgba(231, 76, 60, 0.1)',
                   border: '1px solid #e74c3c',
                   borderRadius: '8px',
                   fontSize: '12px',
                   color: '#ecf0f1',
                   lineHeight: '1.5',
                   marginBottom: '12px'
                 }}>
                   <strong style={{ color: '#e74c3c' }}>⚠️ Modelo de Alto Rendimiento Seleccionado</strong>
                   <div style={{ marginTop: '8px' }}>
                     <strong>Requisitos mínimos para Llama 70B:</strong><br/>
                     • 32GB+ RAM (recomendado 64GB)<br/>
                     • GPU con 40GB+ VRAM (RTX 4090, A100, H100)<br/>
                     • SSD rápido para el modelo (40GB+ espacio)<br/>
                     • Descarga puede tomar 1-2 horas<br/>
                     • Primera ejecución puede ser lenta
                   </div>
                 </div>
               )}
               
               {/* Instrucciones de instalación */}
               <div style={{
                 padding: '12px 16px',
                 backgroundColor: 'rgba(52, 152, 219, 0.1)',
                 border: '1px solid #3498db',
                 borderRadius: '8px',
                 fontSize: '12px',
                 color: '#ecf0f1',
                 lineHeight: '1.5'
               }}>
                 <strong style={{ color: '#3498db' }}>📋 Instrucciones de Instalación:</strong>
                 <div style={{ marginTop: '8px' }}>
                   1. <a 
                   href="https://ollama.ai" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style={{ color: '#3498db', textDecoration: 'underline' }}
                 >
                     Descarga Ollama
                   </a> e instálalo en tu sistema<br/>
                   2. Abre una terminal y ejecuta: <code style={{ 
                     backgroundColor: '#2c3e50', 
                     padding: '2px 4px', 
                     borderRadius: '3px',
                     color: '#f39c12'
                   }}>ollama serve</code><br/>
                   3. En otra terminal, descarga el modelo: <code style={{ 
                     backgroundColor: '#2c3e50', 
                     padding: '2px 4px', 
                     borderRadius: '3px',
                     color: '#f39c12'
                   }}>ollama pull {ollamaModel}</code><br/>
                   4. <strong>Para modelos grandes (70B):</strong> Asegúrate de tener suficiente RAM y VRAM<br/>
                   5. Usa el botón "Probar Conexión" para verificar
                 </div>
               </div>
             </div>
           )}

           {/* Estado de la Configuración */}
           <div style={{
             marginTop: '16px',
             padding: '12px 16px',
             backgroundColor: 
               aiConfigStatus === 'checking' ? 'rgba(243, 156, 18, 0.2)' :
               aiConfigStatus === 'configured' ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)',
             border: `2px solid ${
               aiConfigStatus === 'checking' ? '#f39c12' :
               aiConfigStatus === 'configured' ? '#27ae60' : '#e74c3c'
             }`,
             borderRadius: '8px',
             fontSize: '13px',
             color: 'white',
             fontWeight: 'bold',
             display: 'flex',
             alignItems: 'center',
             gap: '12px'
           }}>
             <div style={{ fontSize: '20px' }}>
               {aiConfigStatus === 'checking' && '⏳'}
               {aiConfigStatus === 'configured' && '✅'}
               {aiConfigStatus === 'not-configured' && '❌'}
             </div>
             <div>
               {aiConfigStatus === 'checking' && (
                 <div>
                   <div>Verificando configuración de {aiProvider === 'openai' ? 'OpenAI' : 'Ollama'}...</div>
                   <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
                     Esto puede tomar unos segundos
                   </div>
                 </div>
               )}
               {aiConfigStatus === 'configured' && (
                 <div>
                   <div>{aiProvider === 'openai' ? '🔑 OpenAI' : '🦙 Ollama'} configurado y listo</div>
                   <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
                     {aiProvider === 'openai' 
                       ? 'La IA está lista para funcionar con GPT-4'
                       : 'La IA local está lista para funcionar'
                     }
                   </div>
                 </div>
               )}
               {aiConfigStatus === 'not-configured' && (
                 <div>
                   <div>{aiProvider === 'openai' ? '🔑 OpenAI' : '🦙 Ollama'} no configurado</div>
                   <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
                     {aiProvider === 'openai' 
                       ? 'Configura tu API Key para continuar'
                       : 'Instala Ollama y descarga un modelo'
                     }
                   </div>
                 </div>
               )}
             </div>
           </div>

          {/* Modo Desarrollador */}
          <div style={{ 
            marginTop: '24px',
            padding: '16px',
            border: '2px solid #e74c3c',
            borderRadius: '8px',
            backgroundColor: 'rgba(231, 76, 60, 0.1)'
          }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '16px', fontSize: '18px' }}>
              🔧 Modo Desarrollador
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                color: '#ecf0f1', 
                marginBottom: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={developerMode}
                  onChange={(e) => setDeveloperMode(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#e74c3c'
                  }}
                />
                Activar modo desarrollador
              </label>
              <div style={{ 
                fontSize: '12px', 
                color: '#bdc3c7', 
                marginBottom: '12px',
                padding: '8px',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderRadius: '4px'
              }}>
                <strong>⚠️ ADVERTENCIA:</strong> Este modo está destinado únicamente para pruebas de desarrollo.
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#bdc3c7', 
                lineHeight: '1.4'
              }}>
                <p><strong>Cuando está activado:</strong></p>
                <ul style={{ margin: '8px 0', paddingLeft: '16px' }}>
                  <li>La IA recibirá un prompt especial indicando que está en modo de pruebas</li>
                  <li>El programador puede hacer preguntas directas sobre mecánicas</li>
                  <li>Se activan logs adicionales para debugging</li>
                  <li>Algunas restricciones de seguridad se relajan temporalmente</li>
                </ul>
                <p style={{ 
                  color: '#f39c12', 
                  marginTop: '8px',
                  fontWeight: 'bold'
                }}>
                  <strong>💡 Uso:</strong> Solo activar cuando necesites probar nuevas funcionalidades o debuggear problemas.
                </p>
              </div>
            </div>
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
    </>
  );
};

export default GameOptions;

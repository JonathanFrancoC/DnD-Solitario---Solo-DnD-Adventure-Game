// Analizador de hardware para recomendar modelos de Ollama
// Este módulo detecta las capacidades del sistema y recomienda el mejor modelo

export class HardwareAnalyzer {
  constructor() {
    this.systemInfo = null;
    this.recommendations = null;
  }

  // Función principal para analizar el sistema
  async analyzeSystem() {
    try {
      const systemInfo = await this.gatherSystemInfo();
      const recommendations = this.generateRecommendations(systemInfo);
      
      this.systemInfo = systemInfo;
      this.recommendations = recommendations;
      
      return {
        systemInfo,
        recommendations
      };
    } catch (error) {
      console.error('Error analizando el sistema:', error);
      return this.getFallbackRecommendations();
    }
  }

  // Recopilar información del sistema
  async gatherSystemInfo() {
    const info = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      memory: null,
      cores: navigator.hardwareConcurrency || 4,
      gpu: null,
      storage: null
    };

    // Intentar obtener información de memoria
    if ('memory' in performance) {
      info.memory = {
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024 / 1024 * 100) / 100,
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 / 1024 * 100) / 100,
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024 / 1024 * 100) / 100
      };
    }

    // Detectar GPU
    info.gpu = await this.detectGPU();

    // Detectar almacenamiento
    info.storage = await this.detectStorage();

    // Detectar sistema operativo
    info.os = this.detectOS();

    return info;
  }

  // Detectar información de GPU
  async detectGPU() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return { available: false, vendor: 'No disponible', renderer: 'No disponible' };
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Desconocido';
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Desconocido';

      return {
        available: true,
        vendor: vendor,
        renderer: renderer,
        vram: this.estimateVRAM(renderer)
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  // Estimar VRAM basado en el renderer
  estimateVRAM(renderer) {
    const rendererLower = renderer.toLowerCase();
    
    // GPUs de alta gama
    if (rendererLower.includes('rtx 4090') || rendererLower.includes('a100') || rendererLower.includes('h100')) {
      return 40;
    }
    if (rendererLower.includes('rtx 4080') || rendererLower.includes('rtx 3090')) {
      return 24;
    }
    if (rendererLower.includes('rtx 4070') || rendererLower.includes('rtx 3080')) {
      return 12;
    }
    if (rendererLower.includes('rtx 4060') || rendererLower.includes('rtx 3070')) {
      return 8;
    }
    if (rendererLower.includes('rtx 3060') || rendererLower.includes('gtx 1660')) {
      return 6;
    }
    
    // GPUs integradas
    if (rendererLower.includes('intel') && rendererLower.includes('iris')) {
      return 2;
    }
    if (rendererLower.includes('amd') && rendererLower.includes('vega')) {
      return 2;
    }
    
    return 4; // Estimación conservadora
  }

  // Detectar información de almacenamiento
  async detectStorage() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          quota: Math.round(estimate.quota / 1024 / 1024 / 1024 * 100) / 100,
          usage: Math.round(estimate.usage / 1024 / 1024 / 1024 * 100) / 100,
          available: Math.round((estimate.quota - estimate.usage) / 1024 / 1024 / 1024 * 100) / 100
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Detectar sistema operativo
  detectOS() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) {
      return 'Windows';
    } else if (userAgent.includes('Mac')) {
      return 'macOS';
    } else if (userAgent.includes('Linux')) {
      return 'Linux';
    } else {
      return 'Desconocido';
    }
  }

  // Generar recomendaciones basadas en el análisis
  generateRecommendations(systemInfo) {
    const recommendations = {
      primary: null,
      alternatives: [],
      warnings: [],
      systemRating: 'unknown'
    };

    // Calcular rating del sistema
    const systemRating = this.calculateSystemRating(systemInfo);
    recommendations.systemRating = systemRating;

    // Generar recomendaciones basadas en el rating
    switch (systemRating) {
      case 'high-end':
        recommendations.primary = 'llama3.2:70b';
        recommendations.alternatives = [
          'qwen2.5:32b',
          'llama3.1:70b',
          'mistral:8x7b'
        ];
        break;

      case 'mid-high':
        recommendations.primary = 'qwen2.5:32b';
        recommendations.alternatives = [
          'llama3.2:8b',
          'mistral:8x7b',
          'qwen2.5:14b'
        ];
        break;

      case 'mid-range':
        recommendations.primary = 'llama3.2:8b';
        recommendations.alternatives = [
          'qwen2.5:14b',
          'mistral:7b',
          'llama3.1:8b'
        ];
        break;

      case 'low-mid':
        recommendations.primary = 'llama3.2:3b';
        recommendations.alternatives = [
          'phi3:mini',
          'gemma:2b',
          'mistral:7b'
        ];
        break;

      case 'low-end':
        recommendations.primary = 'phi3:mini';
        recommendations.alternatives = [
          'gemma:2b',
          'llama3.2:3b'
        ];
        recommendations.warnings.push('Tu sistema tiene recursos limitados. Considera cerrar otras aplicaciones para mejor rendimiento.');
        break;

      default:
        recommendations.primary = 'llama3.2:8b';
        recommendations.alternatives = [
          'llama3.2:3b',
          'phi3:mini'
        ];
        recommendations.warnings.push('No se pudo determinar completamente las capacidades de tu sistema. Usando recomendación conservadora.');
    }

    // Agregar advertencias específicas
    this.addSpecificWarnings(recommendations, systemInfo);

    return recommendations;
  }

  // Calcular rating del sistema
  calculateSystemRating(systemInfo) {
    let score = 0;

    // Puntuación por memoria
    if (systemInfo.memory && systemInfo.memory.limit) {
      if (systemInfo.memory.limit >= 32) score += 4;
      else if (systemInfo.memory.limit >= 16) score += 3;
      else if (systemInfo.memory.limit >= 8) score += 2;
      else score += 1;
    } else {
      // Estimación basada en user agent
      if (systemInfo.userAgent.includes('x64')) score += 3;
      else score += 2;
    }

    // Puntuación por GPU
    if (systemInfo.gpu && systemInfo.gpu.available) {
      if (systemInfo.gpu.vram >= 24) score += 4;
      else if (systemInfo.gpu.vram >= 12) score += 3;
      else if (systemInfo.gpu.vram >= 6) score += 2;
      else score += 1;
    } else {
      score += 1; // GPU integrada o no detectada
    }

    // Puntuación por cores
    if (systemInfo.cores >= 16) score += 2;
    else if (systemInfo.cores >= 8) score += 1;

    // Puntuación por almacenamiento
    if (systemInfo.storage && systemInfo.storage.available >= 50) score += 1;

    // Determinar rating final
    if (score >= 8) return 'high-end';
    if (score >= 6) return 'mid-high';
    if (score >= 4) return 'mid-range';
    if (score >= 2) return 'low-mid';
    return 'low-end';
  }

  // Agregar advertencias específicas
  addSpecificWarnings(recommendations, systemInfo) {
    // Advertencia por memoria limitada
    if (systemInfo.memory && systemInfo.memory.limit < 8) {
      recommendations.warnings.push('Memoria RAM limitada detectada. Los modelos grandes pueden causar problemas de rendimiento.');
    }

    // Advertencia por GPU limitada
    if (systemInfo.gpu && systemInfo.gpu.vram < 6) {
      recommendations.warnings.push('GPU con VRAM limitada detectada. El rendimiento puede ser más lento.');
    }

    // Advertencia por almacenamiento
    if (systemInfo.storage && systemInfo.storage.available < 20) {
      recommendations.warnings.push('Espacio de almacenamiento limitado. Los modelos grandes requieren 40GB+ de espacio libre.');
    }

    // Advertencia por sistema operativo
    if (systemInfo.os === 'Linux') {
      recommendations.warnings.push('Sistema Linux detectado. Asegúrate de tener los drivers de GPU actualizados.');
    }
  }

  // Obtener recomendaciones de fallback
  getFallbackRecommendations() {
    return {
      systemInfo: {
        platform: 'Desconocido',
        memory: null,
        gpu: { available: false },
        cores: 4,
        os: 'Desconocido'
      },
      recommendations: {
        primary: 'llama3.2:8b',
        alternatives: ['llama3.2:3b', 'phi3:mini'],
        warnings: ['No se pudo analizar completamente tu sistema. Usando recomendación conservadora.'],
        systemRating: 'unknown'
      }
    };
  }

  // Obtener descripción del rating del sistema
  getSystemRatingDescription(rating) {
    const descriptions = {
      'high-end': {
        title: '🚀 Sistema de Alto Rendimiento',
        description: 'Tu sistema puede ejecutar los modelos más potentes de Ollama con excelente rendimiento.',
        color: '#27ae60'
      },
      'mid-high': {
        title: '💪 Sistema Potente',
        description: 'Tu sistema puede ejecutar modelos medianos y grandes con buen rendimiento.',
        color: '#f39c12'
      },
      'mid-range': {
        title: '⚖️ Sistema Equilibrado',
        description: 'Tu sistema puede ejecutar modelos medianos con rendimiento adecuado.',
        color: '#3498db'
      },
      'low-mid': {
        title: '🔧 Sistema Básico',
        description: 'Tu sistema puede ejecutar modelos pequeños y medianos con rendimiento limitado.',
        color: '#e67e22'
      },
      'low-end': {
        title: '📱 Sistema Limitado',
        description: 'Tu sistema puede ejecutar modelos pequeños. Considera cerrar otras aplicaciones.',
        color: '#e74c3c'
      },
      'unknown': {
        title: '❓ Sistema Desconocido',
        description: 'No se pudo determinar completamente las capacidades de tu sistema.',
        color: '#95a5a6'
      }
    };

    return descriptions[rating] || descriptions['unknown'];
  }

  // Obtener información detallada del modelo recomendado
  getModelInfo(modelName) {
    const models = {
      'llama3.2:70b': {
        name: 'Llama 3.2 70B',
        size: '40GB',
        description: 'Máxima calidad de respuesta para D&D',
        requirements: '64GB RAM, GPU 40GB+ VRAM',
        performance: 'Excelente',
        downloadTime: '1-2 horas'
      },
      'qwen2.5:32b': {
        name: 'Qwen 2.5 32B',
        size: '19GB',
        description: 'Excelente calidad, muy bueno en español',
        requirements: '32GB RAM, GPU recomendada',
        performance: 'Muy bueno',
        downloadTime: '30-60 minutos'
      },
      'llama3.2:8b': {
        name: 'Llama 3.2 8B',
        size: '4.7GB',
        description: 'Mejor balance entre calidad y recursos',
        requirements: '8GB RAM',
        performance: 'Bueno',
        downloadTime: '10-20 minutos'
      },
      'llama3.2:3b': {
        name: 'Llama 3.2 3B',
        size: '2GB',
        description: 'Rápido y eficiente',
        requirements: '6GB RAM',
        performance: 'Adecuado',
        downloadTime: '5-10 minutos'
      },
      'phi3:mini': {
        name: 'Phi-3 Mini',
        size: '2.3GB',
        description: 'Optimizado por Microsoft, muy eficiente',
        requirements: '6GB RAM',
        performance: 'Adecuado',
        downloadTime: '5-10 minutos'
      },
      'gemma:2b': {
        name: 'Gemma 2B',
        size: '1.6GB',
        description: 'Muy rápido, ideal para sistemas básicos',
        requirements: '4GB RAM',
        performance: 'Básico',
        downloadTime: '3-5 minutos'
      }
    };

    return models[modelName] || {
      name: modelName,
      size: 'Desconocido',
      description: 'Modelo personalizado',
      requirements: 'Verificar requisitos',
      performance: 'Desconocido',
      downloadTime: 'Desconocido'
    };
  }
}

// Instancia singleton
export const hardwareAnalyzer = new HardwareAnalyzer();

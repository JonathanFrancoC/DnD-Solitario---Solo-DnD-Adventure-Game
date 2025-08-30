# 🐉 D&D Solitario - IA DM

Un sistema de Dungeons & Dragons en solitario donde la Inteligencia Artificial actúa como Dungeon Master, permitiéndote vivir aventuras épicas sin necesidad de otros jugadores.

## ✨ Características

- **IA como DM**: ChatGPT actúa como Dungeon Master, narrando tu aventura
- **Pantalla dividida**: Área principal para la partida (70%) y chat lateral para dudas (30%)
- **Guardado automático**: Tu progreso se guarda automáticamente en JSON
- **Interfaz moderna**: Diseño responsive con tema de D&D
- **Sistema completo**: Manejo de personajes, combate, inventario y más
- **Chat de ayuda**: Asistente IA para resolver dudas sobre reglas

## 🚀 Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- Una API key de OpenAI

### Pasos de instalación

1. **Clona o descarga el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd dnd-solitario
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura tu API key de OpenAI**
   - Copia el archivo `env.example` a `.env`
   - Edita `.env` y agrega tu API key:
   ```
   VITE_OPENAI_API_KEY=tu-api-key-real-aqui
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador**
   - Ve a `http://localhost:3000`
   - ¡Tu aventura está lista para comenzar!

## 🎮 Cómo jugar

### Iniciando una partida
1. La aplicación cargará automáticamente tu partida guardada o creará una nueva
2. Verás un mensaje de bienvenida del DM
3. Escribe tu primera acción en el área de texto principal

### Interfaz del juego
- **Área principal (izquierda)**: Aquí ocurre tu aventura
  - Chat con el DM (IA)
  - Información de tu personaje
  - Botones de guardado/carga
- **Chat lateral (derecha)**: Para dudas y ayuda
  - Preguntas sobre reglas
  - Ayuda con mecánicas
  - Acciones rápidas

### Comandos básicos
- **Acciones narrativas**: "Exploro la taberna", "Hablo con el tabernero"
- **Combate**: "Ataco al goblin con mi espada", "Lanzo bola de fuego"
- **Interacción**: "Busco trampas", "Investigo la habitación"
- **Inventario**: "Uso mi poción de curación", "Equipo mi armadura"

## 🔧 Configuración

### Variables de entorno
- `VITE_OPENAI_API_KEY`: Tu API key de OpenAI (requerida)

### Personalización
Puedes modificar:
- **Prompts**: Edita los prompts en `src/utils/aiService.js`
- **Estilos**: Modifica `src/index.css` y `tailwind.config.js`
- **Reglas**: Ajusta las mecánicas en `src/utils/gameInitializer.js`

## 📁 Estructura del proyecto

```
dnd-solitario/
├── src/
│   ├── components/
│   │   ├── GameArea.jsx      # Área principal del juego
│   │   └── SideChat.jsx      # Chat lateral
│   ├── utils/
│   │   ├── aiService.js      # Integración con ChatGPT
│   │   ├── gameStorage.js    # Guardado/carga de partidas
│   │   └── gameInitializer.js # Inicialización del juego
│   ├── App.jsx               # Componente principal
│   ├── main.jsx              # Punto de entrada
│   └── index.css             # Estilos globales
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 Funcionalidades

### Sistema de personajes
- Creación automática de personajes
- Estadísticas completas (Fuerza, Destreza, etc.)
- Inventario y equipo
- Hechizos y habilidades

### Mundo dinámico
- Ubicaciones que se descubren
- NPCs con personalidades
- Eventos y misiones
- Clima y tiempo

### Combate
- Sistema de iniciativa
- Tiradas de dados automáticas
- Efectos de estado
- Manejo de daño y curación

### Guardado
- Guardado automático en localStorage
- Exportación/importación de partidas
- Múltiples slots de guardado

## 🤖 Integración con IA

### DM (Dungeon Master)
- Narra la aventura de forma inmersiva
- Maneja combates y tiradas de dados
- Crea NPCs y situaciones dinámicas
- Mantiene coherencia en la historia

### Asistente
- Responde dudas sobre reglas
- Ayuda con creación de personajes
- Explica mecánicas del juego
- Proporciona consejos estratégicos

## 🛠️ Desarrollo

### Scripts disponibles
- `npm run dev`: Servidor de desarrollo
- `npm run build`: Construir para producción
- `npm run preview`: Vista previa de producción

### Tecnologías utilizadas
- **React 18**: Framework principal
- **Vite**: Herramienta de construcción
- **Tailwind CSS**: Estilos
- **OpenAI API**: Integración con ChatGPT
- **LocalStorage**: Persistencia de datos

## 🐛 Solución de problemas

### Error de API
- Verifica que tu API key sea válida
- Asegúrate de tener créditos en tu cuenta de OpenAI
- Revisa la consola del navegador para errores

### Problemas de rendimiento
- La aplicación funciona offline (sin IA)
- Los datos se guardan localmente
- Puedes continuar sin conexión

### Guardado no funciona
- Verifica que localStorage esté habilitado
- Intenta exportar manualmente tu partida
- Limpia el caché del navegador

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de modificarlo y distribuirlo.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:
- Revisa la documentación
- Busca en los issues existentes
- Crea un nuevo issue con detalles

---

¡Que tengas una aventura épica! 🐉⚔️

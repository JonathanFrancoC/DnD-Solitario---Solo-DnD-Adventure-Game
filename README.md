# D&D Solitario - Solo D&D Adventure Game

##  ¡Hola! Soy Jonathan

Hola, mi nombre es Jonathan, soy estudiante de programación. En los últimos meses he tenido la idea de poder jugar Calabozos y Dragones en solitario, y con el tiempo he notado que aunque la IA hace un buen trabajo en sesiones cortas, para un proyecto a largo plazo se necesitaría un poco más. Por esto he empezado este proyecto para jugar D&D en solitario.

He tenido unas cuantas dificultades en la creación de este proyecto, por esto he decidido abrirlo a los programadores expertos, para que si gustan y les interesa el proyecto puedan darme consejos o si gustan aportar, tomen el proyecto y puedan instalarlo ustedes.

Hasta ahora el proyecto está pensado originalmente para funcionar con ChatGPT como DM, pero por un problema de presupuesto he agregado la función de jugar con Ollama. El proyecto aún necesita muchas mejoras, que espero ir agregando a través del tiempo hasta tener el gran proyecto terminado.

Espero que les guste el proyecto y le den una oportunidad de probar lo poco que tengo implementado, y poder recibir retroalimentación de él.

---

##  Hello! I'm Jonathan

Hello, my name is Jonathan, I'm a programming student. In recent months I've had the idea of being able to play Dungeons & Dragons solo, and over time I've noticed that while AI does a good job in short sessions, for a long-term project you would need a bit more. That's why I started this project to play D&D solo.

I've had quite a few difficulties in creating this project, so I've decided to open it up to expert programmers, so that if you like and are interested in the project, you can give me advice or if you want to contribute, take the project and install it yourselves.

So far the project is originally designed to work with ChatGPT as DM, but due to budget issues I've added the function to play with Ollama. The project still needs many improvements, which I hope to add over time until the great project is finished.

I hope you like the project and give it a chance to try what little I have implemented, and be able to receive feedback from it.

---

A comprehensive desktop application for playing Dungeons & Dragons 5th Edition solo adventures with AI-powered Dungeon Master assistance.

##  Project Status & Current Implementation

###**What's Working:**
- **Character Creation System**: Complete D&D 5e character creation with guided step-by-step process
- **AI Integration**: Both OpenAI ChatGPT and Ollama local models supported
- **Save System**: Structured campaign saves with character progression
- **Basic Combat**: Turn-based combat mechanics
- **Spell System**: Spell selection and management for spellcasting classes
- **Equipment System**: Weapons, armor, and magical items
- **Multi-language Support**: Spanish interface (English implementation in progress)

### 🚧 **Currently In Development:**
- **English Language Support**: Character creation translation system (Step 1 completed, Steps 2-4 in progress)
- **Advanced Combat Features**: More detailed combat mechanics
- **Campaign Management**: Enhanced campaign organization
- **AI Context Optimization**: Better AI understanding of game state

### ⚠️ **Known Challenges & Difficulties:**
1. **React Error #31**: Successfully resolved - was caused by rendering objects directly in JSX instead of primitive values
2. **Translation System**: Complex dynamic content translation (backgrounds, skills, equipment) requiring custom mapping functions
3. **AI Context Management**: Maintaining consistent AI understanding across long campaigns
4. **Performance Optimization**: Large spell databases and character data affecting load times
5. **Cross-platform Compatibility**: Ensuring Electron app works consistently across different operating systems

### 🔧 **Technical Debt:**
- Some hardcoded Spanish text still needs translation system integration
- Character creation step navigation could be more intuitive
- Save file structure could be optimized for better performance
- AI response formatting needs standardization

## Features

### Core Gameplay
- **Character Creation**: Complete D&D 5e character creation with all races, classes, and backgrounds
- **AI Dungeon Master**: Powered by OpenAI GPT or local Ollama models for dynamic storytelling
- **Combat System**: Full D&D 5e combat mechanics with turn-based combat
- **Spell System**: Complete spell database with progression and management
- **Equipment Management**: Weapons, armor, and magical items with proper D&D 5e rules

### AI Integration
- **Dual AI Support**: Choose between OpenAI ChatGPT or local Ollama models
- **Hardware Analysis**: Automatic system analysis for optimal model recommendations
- **Model Management**: Download, search, and manage Ollama models
- **Developer Mode**: Technical responses for testing game mechanics
- **Context Awareness**: AI has full access to character data and game state

### Save System
- **Structured Campaigns**: Organized folder structure for each campaign
- **Character Data**: Complete character information with progression tracking
- **Companion System**: Support for NPC companions and allies
- **Enemy Management**: Track and manage encountered enemies
- **World State**: Persistent world information and story progression

### User Interface
- **Modern Design**: Clean, intuitive interface with dark theme
- **Responsive Layout**: Optimized for desktop gaming experience
- **Real-time Updates**: Live character sheet updates and combat tracking
- **Multi-language Support**: Spanish interface (English translation system in development)

## Technology Stack

- **Frontend**: React 18 with modern hooks and context
- **Desktop Framework**: Electron for cross-platform desktop application
- **AI Integration**: OpenAI API and Ollama local inference
- **Data Management**: JSON-based save system with structured folders
- **Styling**: CSS3 with modern design patterns

## Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/dnd-solitario.git
cd dnd-solitario

# Install dependencies
npm install

# Start the application
npm start
```

### AI Configuration

#### OpenAI Setup
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Enter your API key in the game options
3. Select ChatGPT as your AI provider

#### Ollama Setup
1. Install [Ollama](https://ollama.ai/) on your system
2. Download a recommended model (e.g., `llama3.2`)
3. Select Ollama as your AI provider in game options

## Project Structure

```
dnd-solitario/
├── electron/                 # Electron main process
│   ├── main.js              # Main process with IPC handlers
│   └── preload.js           # Secure context bridge
├── src/
│   ├── components/          # React components
│   │   ├── GameArea.jsx     # Main game interface
│   │   ├── CharacterCreation.jsx
│   │   ├── GameOptions.jsx  # AI and game configuration
│   │   └── CampaignManager.jsx
│   ├── utils/               # Utility functions
│   │   ├── aiService.js     # AI integration service
│   │   ├── gameSaveService.js
│   │   └── hardwareAnalyzer.js
│   ├── data/                # Game data and rules
│   └── App.jsx              # Main React application
├── saves/                   # Campaign save files
└── package.json
```

## Save System Structure

Each campaign creates a structured folder:
```
saves/
└── partida_[character_name]_[timestamp]/
    ├── character/           # Main character data
    ├── companions/          # NPC companions
    ├── enemies/             # Encountered enemies
    ├── data/                # World and game state
    └── bitacora/            # Session logs
```

##  Contributing & How You Can Help

### **What We Need Help With:**
1. **Translation System**: Help complete the English translation for character creation steps 2-4
2. **Code Review**: Review the codebase and suggest improvements
3. **Bug Fixes**: Help identify and fix any issues you encounter
4. **Feature Development**: Contribute new features or improvements
5. **Documentation**: Help improve documentation and guides
6. **Testing**: Test the application on different systems and report issues

### **How to Contribute:**
1. **Fork the repository** and clone it locally
2. **Create a feature branch** for your changes
3. **Make your changes** and test them thoroughly
4. **Submit a pull request** with a clear description of what you've done

### **Getting Started for Contributors:**
- Check the [Issues](https://github.com/yourusername/dnd-solitario/issues) for known problems
- Look at the [Project Status](#-project-status--current-implementation) to see what's in progress
- Join our [Discussions](https://github.com/yourusername/dnd-solitario/discussions) to ask questions or share ideas

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Install development dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Code Style
- Use Spanish for user-facing text
- Use English for code comments and documentation
- Follow React best practices
- Maintain consistent file structure

## AI Model Recommendations

### Hardware Requirements
- **Minimum**: 8GB RAM, 4GB VRAM
- **Recommended**: 16GB RAM, 8GB VRAM
- **Optimal**: 32GB RAM, 12GB+ VRAM

### Model Suggestions
- **Lightweight**: `llama3.2:3b` (2GB)
- **Balanced**: `llama3.2:8b` (4.7GB)
- **High Quality**: `llama3.2:70b` (40GB)
- **Specialized**: `dnd-ai` (custom fine-tuned model)

## 🗺️ Project Roadmap

### **Phase 1: Core Stability (Current)**
- ✅ Character creation system
- ✅ Basic AI integration
- ✅ Save system
- 🚧 English translation system (in progress)
- 🔄 Bug fixes and stability improvements

### **Phase 2: Enhanced Features (Next)**
- 📋 Advanced combat mechanics
- 📋 Improved AI context management
- 📋 Better campaign management
- 📋 Enhanced UI/UX

### **Phase 3: Advanced Features (Future)**
- 📋 Custom adventure modules
- 📋 Multiplayer support
- 📋 Advanced character customization
- 📋 Integration with D&D Beyond

### **Phase 4: Polish & Optimization (Long-term)**
- 📋 Performance optimization
- 📋 Advanced AI features
- 📋 Mobile companion app
- 📋 Community features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- D&D 5e rules and content (Wizards of the Coast)
- OpenAI for GPT integration
- Ollama for local AI inference
- React and Electron communities

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/dnd-solitario/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dnd-solitario/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/dnd-solitario/wiki)

---

**Note**: This is a fan project and is not affiliated with Wizards of the Coast. D&D is a trademark of Wizards of the Coast LLC.
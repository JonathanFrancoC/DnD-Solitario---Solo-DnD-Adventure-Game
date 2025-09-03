# Generación de Personajes por IA - D&D Solitario

## 🎭 Características Nuevas

El sistema de D&D Solitario ahora incluye un generador de personajes por IA que puede crear compañeros y villanos automáticamente con personalidades basadas en su alineamiento.

## 🚀 Cómo Usar

### En el Chat del DM

1. **Generar un compañero:**
   ```
   generar compañero
   ```

2. **Generar un villano:**
   ```
   generar villano
   ```

3. **Generar con clase específica:**
   ```
   generar compañero guerrero
   generar villano mago
   ```

4. **Generar con alineamiento específico:**
   ```
   generar compañero Legal Bueno
   generar villano Caótico Malvado
   ```

5. **Generar con clase y alineamiento:**
   ```
   generar compañero bardo Neutral Bueno
   generar villano paladin Legal Malvado
   ```

## 🎯 Alineamientos Disponibles

- **Legal Bueno:** Respetuoso de la ley, compasivo, responsable
- **Neutral Bueno:** Amable, generoso, altruista
- **Caótico Bueno:** Libre, espontáneo, rebelde
- **Legal Neutral:** Organizado, metódico, eficiente
- **Neutral:** Equilibrado, adaptable, pragmático
- **Caótico Neutral:** Impredecible, espontáneo, libre
- **Legal Malvado:** Manipulador, calculador, autoritario
- **Neutral Malvado:** Egoísta, pragmático, despiadado
- **Caótico Malvado:** Violento, impredecible, destructivo

## 🏗️ Fondos Adicionales

El sistema incluye nuevos fondos específicos para villanos y compañeros:

### Fondos para Villanos
- **Asesino:** Sigilo, Engaño, herramientas de ladrón
- **Mercenario:** Atletismo, Intimidación, armas de guerra
- **Cultista:** Religión, Engaño, símbolos del culto

### Fondos para Compañeros
- **Guardia:** Percepción, Atletismo, insignias de autoridad
- **Curandero:** Medicina, Perspicacia, kits de curación

## 📁 Estructura de Guardado

Los personajes generados se guardan automáticamente en la estructura de carpetas de la campaña:

```
saves/
  campaign_name/
    companions.json    # Compañeros generados por IA
    villains.json      # Villanos generados por IA
    character.json     # Personaje principal
    bitacora/          # Registros de juego
    world_state.json   # Estado del mundo
    game_state.json    # Estado del juego
```

## 🧠 Personalidades Basadas en Alineamiento

### Ejemplos de Personalidades

**Villano Legal Malvado:**
- Rasgo: "Mantengo el equipo impecable"
- Ideal: "Poder. Aspiro a guiar a mi congregación algún día"
- Vínculo: "El poder es mi verdadero hogar"
- Defecto: "Soy inflexible cuando creo tener razón moral"

**Compañero Neutral Bueno:**
- Rasgo: "Comparto sin dudar lo que tengo"
- Ideal: "Bondad. Ayudar a los necesitados es mi deber"
- Vínculo: "Los necesitados dependen de mí"
- Defecto: "Confío demasiado en la buena fe ajena"

## 🔧 Integración con la IA

Los personajes generados incluyen:

1. **Metadatos de IA:** Información sobre cómo la IA debe comportarse con el personaje
2. **Notas de comportamiento:** Guías para la IA sobre tácticas y personalidad
3. **Historia coherente:** Backstory que refleja el alineamiento y trasfondo
4. **Estadísticas balanceadas:** Basadas en las recomendaciones de clase

## 📊 Características Técnicas

### Generación Automática
- **Nombres:** Basados en raza y género usando el sistema existente
- **Estadísticas:** Aplicación de modificadores raciales a estadísticas recomendadas
- **Habilidades:** Selección automática basada en clase y trasfondo
- **Equipo:** Basado en el trasfondo seleccionado

### Guardado Inteligente
- **Detección de duplicados:** Evita crear personajes idénticos
- **Actualización:** Permite modificar personajes existentes
- **Compatibilidad:** Funciona tanto en Electron como en web (localStorage)

## 🎮 Uso en el Juego

### Para el DM (IA)
- Los personajes generados están disponibles para referenciar en la narrativa
- La IA puede usar la información de personalidad para crear diálogos coherentes
- Los personajes pueden aparecer en encuentros aleatorios o narrativos

### Para el Jugador
- Los compañeros pueden unirse al grupo temporal o permanentemente
- Los villanos pueden convertirse en antagonistas recurrentes
- Todos los personajes mantienen coherencia narrativa

## 🔄 Flujo de Trabajo

1. **Generación:** El jugador solicita un personaje en el chat
2. **Creación:** El sistema genera estadísticas, personalidad y historia
3. **Guardado:** El personaje se guarda automáticamente en la carpeta correspondiente
4. **Integración:** La IA puede referenciar el personaje en futuras sesiones
5. **Desarrollo:** El personaje puede evolucionar a través de la narrativa

## 🛠️ Configuración

### Requisitos
- API Key de OpenAI configurada
- Campaña activa
- Sistema de guardado funcionando

### Comandos Disponibles
- `generar compañero [clase] [alineamiento]`
- `generar villano [clase] [alineamiento]`

### Parámetros Opcionales
- **Clase:** Cualquier clase de D&D 5e
- **Alineamiento:** Cualquiera de los 9 alineamientos estándar

## 🎯 Beneficios

1. **Narrativa Rica:** Personajes con personalidades coherentes y memorables
2. **Flexibilidad:** Generación bajo demanda según las necesidades de la historia
3. **Consistencia:** Alineamiento y trasfondo influyen en comportamiento
4. **Inmersión:** Personajes que sienten reales y reactivos
5. **Eficiencia:** No más NPCs genéricos o inconsistentes

## 🔮 Futuras Mejoras

- **Generación por contexto:** Personajes específicos para situaciones
- **Evolución de personajes:** Cambios de alineamiento y desarrollo
- **Relaciones dinámicas:** Conexiones entre personajes generados
- **Personalización avanzada:** Más control sobre la generación
- **Integración con combate:** Tácticas específicas por personalidad

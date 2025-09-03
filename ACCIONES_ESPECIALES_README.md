# Sistema de Acciones Especiales - D&D Solitario

## Descripción General

El sistema de acciones especiales permite al jugador realizar tres acciones importantes que solo se pueden ejecutar cuando la IA (DM) las apruebe narrativamente. Esto añade una capa de control narrativo y realismo al juego.

## Acciones Disponibles

### 1. ⏰ Descanso Corto
- **Cuándo se desbloquea**: Cuando la IA dice que es seguro tomar un descanso corto
- **Condiciones de aprobación**: 
  - Lugar seguro y tranquilo
  - Sin amenazas inmediatas
  - Al menos 1 hora desde el último descanso corto
- **Efectos**:
  - Recupera 25% de los puntos de vida máximos
  - Restaura algunos recursos de clase (ej: inspiración bárdica)
- **Uso**: Una vez por aprobación

### 2. 🌙 Descanso Largo
- **Cuándo se desbloquea**: Cuando la IA dice que es seguro tomar un descanso largo
- **Condiciones de aprobación**:
  - Lugar completamente seguro
  - Sin amenazas
  - Apropiado para dormir 8 horas
- **Efectos**:
  - Recupera todos los puntos de vida
  - Restaura todos los recursos
  - Restaura inspiración
- **Uso**: Una vez por aprobación

### 3. ⭐ Subir de Nivel
- **Cuándo se desbloquea**: Cuando la IA dice que es momento de subir de nivel
- **Condiciones de aprobación**:
  - Hito narrativo significativo completado
  - Pausa natural en la acción
  - No en medio de combate o peligro
- **Efectos**:
  - Incrementa el nivel del personaje
  - Aumenta puntos de vida máximos
  - Mejora bonificación de competencia
- **Uso**: Una vez por aprobación

## Cómo Funciona

### Detección Automática
El sistema detecta automáticamente cuando la IA aprueba una acción buscando palabras clave en la respuesta:

- **Descanso corto**: "descanso corto" + ("puedes" o "puede" o "aprobado" o "aceptado")
- **Descanso largo**: "descanso largo" + ("puedes" o "puede" o "aprobado" o "aceptado")  
- **Subir de nivel**: ("subir de nivel" o "subir nivel" o "nivel superior") + ("puedes" o "puede" o "aprobado" o "aceptado")

### Estados de los Botones
- **🔒 Bloqueado**: Botón gris, no se puede usar
- **🟢 Habilitado**: Botón con color, se puede usar una vez
- **🔴 Usado**: Botón gris, ya se usó esta aprobación

### Ejemplos de Frases de Aprobación

#### Descanso Corto
- "Puedes tomar un descanso corto aquí"
- "Es seguro tomar un descanso corto"
- "La taberna es un buen lugar para un descanso corto"

#### Descanso Largo
- "Puedes tomar un descanso largo aquí"
- "Es seguro tomar un descanso largo"
- "La posada te permite un descanso largo"

#### Subir de Nivel
- "Puedes subir de nivel"
- "Es momento de subir de nivel"
- "Has ganado suficiente experiencia para subir de nivel"

## Interfaz de Usuario

### Ubicación
Los botones se encuentran en la parte superior del chat principal, debajo del título del juego.

### Diseño Visual
- **Colores**: Verde (descanso corto), Azul (descanso largo), Naranja (subir de nivel)
- **Iconos**: ⏰ 🌙 ⭐
- **Tooltips**: Muestran información sobre el estado y efectos de cada acción

### Notificaciones
Al usar una acción, aparece una notificación temporal confirmando la acción realizada.

## Integración con la IA

### Prompt Actualizado
El prompt de la IA incluye instrucciones específicas sobre cuándo aprobar cada acción:

```
## 14) ACCIONES ESPECIALES DEL JUGADOR
El jugador tiene acceso a tres acciones especiales que solo se pueden usar cuando tú las apruebes:

### DESCANSO CORTO
- **Cuándo aprobar**: Cuando el jugador esté en un lugar seguro, sin amenazas inmediatas
- **Frase de aprobación**: "Puedes tomar un descanso corto aquí"

### DESCANSO LARGO  
- **Cuándo aprobar**: Cuando el jugador esté en un lugar completamente seguro
- **Frase de aprobación**: "Puedes tomar un descanso largo aquí"

### SUBIR DE NIVEL
- **Cuándo aprobar**: Cuando el jugador haya completado un hito narrativo significativo
- **Frase de aprobación**: "Puedes subir de nivel"
```

## Ventajas del Sistema

1. **Control Narrativo**: La IA decide cuándo es apropiado realizar estas acciones
2. **Realismo**: No se pueden usar en situaciones inapropiadas
3. **Balance**: Limita el uso de recursos poderosos
4. **Inmersión**: Integra las acciones mecánicas con la narrativa
5. **Flexibilidad**: Se adapta a diferentes situaciones y contextos

## Consideraciones de Diseño

- **Una vez por aprobación**: Cada aprobación de la IA permite un solo uso
- **Detección inteligente**: Busca múltiples variaciones de frases de aprobación
- **Feedback visual**: Estados claros y notificaciones informativas
- **Integración seamless**: No interrumpe el flujo del juego

## Futuras Mejoras

- Sistema de subida de nivel más detallado
- Efectos específicos por clase
- Más acciones especiales (rituales, entrenamiento, etc.)
- Historial de acciones realizadas
- Configuración de sensibilidad de detección

/**
 * Prompts for material generation
 * Context: Secondary school level (Educación Secundaria)
 */

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4-6';
const ALT_MODEL = 'minimax/minimax-01';

/**
 * System prompt base for all materials
 */
const SYSTEM_PROMPT = `Eres un asistente educativo especializado para profesores de secundaria.
Tu objetivo es crear materiales pedagógicos de alta calidad adaptados a estudiantes de 12 a 18 años.
Responde siempre en formato markdown con:
- ## para títulos principales (Heading 2)
- ** para texto en negritas (bold)
- - para listas con viñetas
- 1. para listas numeradas
- Añade ejemplos concretos y accesibles para adolescentes
- Usa lenguaje claro y directo, evitando jerga académica innecesaria
- Cuando incluyas ejemplos, hazlos relevantes para la vida cotidiana de adolescentes`;

/**
 * Helper to create prompt strings
 */
function createPrompt(inputText, extraInstructions, baseContent) {
  const instructions = extraInstructions || '';
  return baseContent + '\n\n### Contenido del documento:\n' + inputText + '\n\n### Instrucciones específicas:\n' + (instructions || 'Sigue las instrucciones de la sección anterior.');
}

/**
 * Prompt templates for each material type
 */
const PROMPT_TEMPLATES = {
  /**
   * Guía de estudio - Resumen jerárquico con conceptos clave y ejemplos
   */
  guia: {
    name: 'Guía de Estudio',
    prompt: function(inputText, extraInstructions) {
      const base = `## Guía de Estudio

Crea una guía de estudio completa y estructurada del siguiente contenido.`;
      const instructions = `
Analiza el contenido y crea una guía que incluya:

1. **Resumen ejecutivo**: Síntesis del tema principal en 2-3 párrafos
2. **Conceptos clave**: Lista de 5-8 términos fundamentales con definiciones breves
3. **Ideas principales**: Estructura jerárquica de los temas más importantes
4. **Ejemplos prácticos**: 2-3 ejemplos concretos que ilustren los conceptos
5. **Puntos de verificación**: Preguntas de autoevaluación al final de cada sección

El nivel debe ser apropiado para estudiantes de secundaria (12-18 años).`;
      return createPrompt(inputText, extraInstructions, base) + '\n' + instructions;
    }
  },

  /**
   * Ejercicios y evaluación - 5 opción múltiple + 3 V/F + 2 desarrollo corto
   */
  ejercicios: {
    name: 'Ejercicios y Evaluación',
    prompt: function(inputText, extraInstructions) {
      const base = `## Ejercicios y Evaluación

Crea una evaluación completa basada en el siguiente contenido.`;
      const instructions = `
Crea una evaluación que incluya:

### Parte 1: Ejercicios de Opción Múltiple (5 preguntas)
- 4 opciones por pregunta (a, b, c, d)
- Solo una respuesta correcta
- Las preguntas deben evaluar comprensión, no solo memoria
- Incluye 2 preguntas de aplicación práctica

### Parte 2: Verdadero o Falso (3 afirmaciones)
- Indica claramente si cada afirmación es V o F
- Explica brevemente por qué en los casos falsos

### Parte 3: Respuesta Corta (2 preguntas)
- Preguntas de desarrollo que requieran explicar un concepto
- Espacio para que el estudiante escriba su respuesta

### Parte 4: Respuestas correctas
- Al final, incluye la clave de respuestas

Nivel: Educación secundaria (12-18 años).`;
      return createPrompt(inputText, extraInstructions, base) + '\n' + instructions;
    }
  },

  /**
   * Plan de clase - Inicio/desarrollo/cierre, 50 min, objetivos SMART
   */
  plan_clase: {
    name: 'Plan de Clase',
    prompt: function(inputText, extraInstructions) {
      const base = `## Plan de Clase (50 minutos)

Crea un plan de clase completo basado en:`;
      const instructions = `
El plan debe incluir:

### Información general
- **Título de la clase**: Nombre del tema
- **Objetivos SMART**: Específicos, Medibles, Alcanzables, Relevantes, con Tiempo definido
- **Curso/Nivel**: Para qué grado de secundaria
- **Duración**: 50 minutos

### Estructura de la clase

| Momento | Tiempo | Descripción | Recursos |
|---------|--------|-------------|----------|
| **Inicio** | 10 min | Activación de conocimientos previos, presentación del objetivo | |
| **Desarrollo** | 30 min | Explicación, actividades grupales, práctica guiada | |
| **Cierre** | 10 min | Resumen, evaluación formativa, tarea | |

### Detalle de actividades
Para cada momento incluye:
- Qué hace el docente
- Qué hacen los estudiantes
- Preguntas guía para promover el pensamiento crítico

### Materiales necesarios
- Lista de recursos (presentación, worksheets, vídeos, etc.)

Nivel: Educación secundaria.`;
      return createPrompt(inputText, extraInstructions, base) + '\n' + instructions;
    }
  },

  /**
   * Adaptación por nivel - Básico, estándar, avanzado
   */
  niveles: {
    name: 'Adaptación por Nivel',
    prompt: function(inputText, extraInstructions) {
      const base = `## Adaptación por Nivel

Crea tres versiones del mismo contenido para diferentes niveles de estudiantes:`;
      const instructions = `
Crea las siguientes versiones:

### Nivel Básico (Introducción)
- Para estudiantes que necesitan refuerzo
- Lenguaje muy claro y sencillo
- Explicaciones paso a paso
- Ejemplos muy concretos y cotidianos
- Actividades de práctica guiada
- Incluye vocabulario esencial con definiciones

### Nivel Estándar (Regular)
- Para el estudiante promedio de secundaria
- Profundidad media
- Conexión con conocimientos previos
- Ejemplos diversos
- Actividades de aplicación

### Nivel Avanzado (Profundización)
- Para estudiantes que necesitan más desafío
- Conceptualización más abstracta
- Conexiones interdisciplinarias
- Preguntas de pensamiento crítico
- Aplicaciones prácticas avanzadas

### Tabla comparativa
Al inicio, incluye una tabla que muestre las diferencias entre niveles:

| Aspecto | Básico | Estándar | Avanzado |
|---------|--------|----------|----------|
| Profundidad | Superficial | Media | Alta |
| Ejemplos | Cotidianos | Diversos | Complejos |
| Actividades | Guiadas | Autónomas | Investigativas |

Nivel: Educación secundaria (12-18 años).`;
      return createPrompt(inputText, extraInstructions, base) + '\n' + instructions;
    }
  },

  /**
   * Mapa conceptual - Jerarquía en formato tabla
   */
  mapa: {
    name: 'Mapa Conceptual',
    prompt: function(inputText, extraInstructions) {
      const base = `## Mapa Conceptual

Crea un mapa conceptual jerárquico del contenido:`;
      const instructions = `
El mapa debe incluir:

### Estructura jerárquica
Organiza el contenido en niveles:
- **Nivel 1 (Centro)**: Tema principal
- **Nivel 2**: Subtemas principales
- **Nivel 3**: Conceptos específicos
- **Nivel 4**: Detalles o ejemplos

### Formato de presentación
Usa un esquema como este (puedes adaptarlo al contenido):

    Tema Principal
    ├── Subtema 1
    │   ├── Concepto A → Ejemplo 1
    │   └── Concepto B
    └── Subtema 2
        └── ...

### Conexiones
- Indica las relaciones entre conceptos
- Ejemplo: "Concepto A se relaciona con Concepto B"

### Resumen textual
Al final, incluye un breve párrafo que resuma las relaciones principales.

Nivel: Educación secundaria.`;
      return createPrompt(inputText, extraInstructions, base) + '\n' + instructions;
    }
  },

  /**
   * Glosario - 10-15 definiciones en lenguaje adolescente
   */
  glosario: {
    name: 'Glosario de Términos',
    prompt: function(inputText, extraInstructions) {
      const base = `## Glosario de Términos

Crea un glosario con definiciones accesibles para adolescentes:`;
      const instructions = `
El glosario debe incluir:

### Términos clave (10-15 definiciones)
Para cada término incluye:
- **Término**: La palabra o concepto
- **Definición**: Explicación clara en lenguaje accesible
- **Ejemplo**: Un ejemplo cotidiano que ilustre el concepto
- **Relación**: Cómo se conecta con otros términos del glosario

### Formato recomendado

| Término | Definición | Ejemplo |
|---------|------------|---------|
| [Término 1] | [Definición clara y breve] | [Ejemplo cotidiano] |
| [Término 2] | [Definición clara y breve] | [Ejemplo cotidiano] |
| ... | ... | ... |

### Consejos de lenguaje
- Evita definiciones circulares
- Usa analogías con situaciones de la vida diaria de adolescentes
- Limita las definiciones a 2-3 oraciones máximo
- Si el término tiene varios significados, indica el más relevante para el contexto

### Índice alfabético
Organiza los términos en orden alfabético.

Nivel: Educación secundaria (12-18 años).`;
      return createPrompt(inputText, extraInstructions, base) + '\n' + instructions;
    }
  }
};

/**
 * Get prompt for a material type
 * @param {string} materialType - Type of material (guia, ejercicios, plan_clase, niveles, mapa, glosario)
 * @param {string} inputText - Extracted text from document
 * @param {string} extraInstructions - Optional user instructions
 * @returns {Object} - { model, messages }
 */
export function getPrompt(materialType, inputText, extraInstructions = '') {
  const template = PROMPT_TEMPLATES[materialType];
  
  if (!template) {
    throw new Error('Tipo de material desconocido: ' + materialType + '. Tipos válidos: ' + Object.keys(PROMPT_TEMPLATES).join(', '));
  }

  const promptText = template.prompt(inputText.trim(), extraInstructions);

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: promptText
    }
  ];

  return {
    model: DEFAULT_MODEL,
    altModel: ALT_MODEL,
    messages
  };
}

/**
 * Get all available material types
 * @returns {Array} - List of material types with their names
 */
export function getMaterialTypes() {
  return Object.entries(PROMPT_TEMPLATES).map(([key, value]) => ({
    id: key,
    name: value.name
  }));
}

export default {
  getPrompt,
  getMaterialTypes,
  DEFAULT_MODEL,
  ALT_MODEL
};
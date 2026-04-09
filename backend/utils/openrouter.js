import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Validate API key at startup
if (!OPENROUTER_API_KEY) {
  console.error('❌ ERROR: OPENROUTER_API_KEY no está configurada en las variables de entorno');
  process.exit(1);
}

console.log('✅ OpenRouter client inicializado con API key configurada');

/**
 * Generate stream from OpenRouter API
 * @param {string} model - Model ID (e.g., 'anthropic/claude-sonnet-4-6')
 * @param {Array} messages - Array of message objects
 * @returns {Promise<ReadableStream>} - Stream from OpenRouter
 */
export async function generateStream(model, messages) {
  const url = `${OPENROUTER_BASE_URL}/chat/completions`;
  
  const headers = {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:3001',
    'X-Title': 'TeacherTool'
  };

  const body = JSON.stringify({
    model,
    messages,
    stream: true
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    signal: AbortSignal.timeout(120000) // 2 minute timeout
  });

  // Handle HTTP errors
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = '';
    let errorCode = response.status;
    
    // Parse error response if possible
    let errorDetails = null;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      // Not JSON, use raw text
    }
    
    switch (response.status) {
      case 429:
        // Rate limit - incluye retry-after si está disponible
        const retryAfter = response.headers.get('Retry-After') || 60;
        errorMessage = `Límite de solicitudes alcanzado. Por favor, espera ${retryAfter} segundos antes de intentar de nuevo.`;
        break;
        
      case 503:
        // Modelo no disponible
        errorMessage = 'El modelo de IA no está disponible temporalmente. Por favor, intenta con otro modelo o más tarde.';
        break;
        
      case 401:
        // API key inválida
        errorMessage = 'La clave API no es válida. Por favor, verifica tu OPENROUTER_API_KEY en el archivo .env';
        break;
        
      case 400:
        // Bad request - puede ser prompt muy largo o parámetros inválidos
        if (errorDetails?.error?.message) {
          errorMessage = errorDetails.error.message;
        } else if (errorText.length < 200) {
          errorMessage = errorText;
        } else {
          errorMessage = 'La solicitud contiene parámetros inválidos. Por favor, verifica los datos enviados.';
        }
        break;
        
      case 413:
        // Payload too large - texto de entrada muy grande
        errorMessage = 'El documento es demasiado grande para procesar. Por favor, usa un archivo más pequeño o reduce el contenido.';
        break;
        
      case 500:
      case 502:
      case 504:
        // Errores del servidor de OpenRouter
        errorMessage = 'El servicio de IA está experimentando problemas temporales. Por favor, intenta de nuevo en unos momentos.';
        break;
        
      default:
        // Cualquier otro código de error
        if (errorDetails?.error?.message) {
          errorMessage = errorDetails.error.message;
        } else {
          errorMessage = `Error del servicio de IA (código: ${response.status}). Por favor, intenta de nuevo más tarde.`;
        }
    }
    
    // Log del error para debugging
    console.error(`❌ OpenRouter Error [${response.status}]:`, errorMessage);
    if (errorDetails) {
      console.error('📋 Detalles:', errorDetails);
    }
    
    throw new Error(errorMessage);
  }

  // Return the stream directly for piping
  return response.body;
}

/**
 * Get available models from OpenRouter
 * @returns {Promise<Array>} - List of available models
 */
export async function getAvailableModels() {
  const url = `${OPENROUTER_BASE_URL}/models`;
  
  const headers = {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`
  };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Error al obtener modelos: ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
}

export default {
  generateStream,
  getAvailableModels
};
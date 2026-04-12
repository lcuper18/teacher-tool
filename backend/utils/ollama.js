/**
 * Ollama Client - Integración con modelos locales
 * 
 * Proporciona una interfaz compatible con generate.js para usar
 * modelos locales de Ollama en lugar de OpenRouter
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:2b';

// Available Ollama models
export const OLLAMA_MODELS = [
  { id: 'ollama/gemma3:1b', name: 'Gemma 3 (1B)', size: '815 MB' },
  { id: 'ollama/qwen3.5:2b', name: 'Qwen 3.5 (2B)', size: '2.7 GB' },
  { id: 'ollama/granite4:3b', name: 'Granite 4 (3B)', size: '2.1 GB' }
];

/**
 * Check if Ollama service is running
 * @returns {Promise<boolean>}
 */
export async function isOllamaRunning() {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Ollama no está disponible:', error.message);
    return false;
  }
}

/**
 * Get list of available models from Ollama
 * @returns {Promise<Array>}
 */
export async function getOllamaModels() {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error getting Ollama models:', error);
    return [];
  }
}

/**
 * Extract model name from full ID (e.g., 'ollama/qwen3.5:2b' -> 'qwen3.5:2b')
 */
function extractOllamaModel(modelId) {
  if (modelId.startsWith('ollama/')) {
    return modelId.replace('ollama/', '');
  }
  return modelId;
}

/**
 * Generate stream from Ollama
 * @param {string} model - Model ID (e.g., 'ollama/qwen3.5:2b')
 * @param {Array} messages - Array of message objects
 * @returns {Promise<ReadableStream>} - Stream from Ollama
 */
export async function generateStream(model, messages) {
  const ollamaModel = extractOllamaModel(model);
  
  // Convert OpenAI format messages to Ollama format
  const ollamaMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  
  const url = `${OLLAMA_HOST}/api/chat`;
  
  const body = JSON.stringify({
    model: ollamaModel,
    messages: ollamaMessages,
    stream: true
  });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body,
    signal: AbortSignal.timeout(180000) // 3 minute timeout for local models
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error [${response.status}]: ${errorText}`);
  }
  
  // Transform Ollama stream to OpenAI-like format for compatibility
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const decoder = new TextDecoder();
      const text = decoder.decode(chunk, { stream: true });
      
      // Ollama sends JSON lines, transform to SSE format
      const lines = text.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          
          if (data.message && data.message.content) {
            // Transform to OpenAI format
            const openaiFormat = JSON.stringify({
              choices: [{
                delta: {
                  content: data.message.content
                }
              }]
            });
            controller.enqueue(new TextEncoder().encode(`data: ${openaiFormat}\n\n`));
          }
        } catch {
          // Skip non-JSON lines
        }
      }
    }
  });
  
  return response.body.pipeThrough(transformStream);
}

export default {
  isOllamaRunning,
  getOllamaModels,
  generateStream,
  OLLAMA_MODELS
};
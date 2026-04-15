import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/db.js';
import { getPrompt } from '../utils/prompts.js';
import { generateStream as generateOpenRouter } from '../utils/openrouter.js';
import { generateStream as generateOllama, isOllamaRunning } from '../utils/ollama.js';
import { generateDocx } from '../scripts/create_docx.js';

const router = Router();

// Detect provider based on model ID
function getProvider(model) {
  if (model && model.startsWith('ollama/')) {
    return 'ollama';
  }
  return 'openrouter';
}

// Progress messages by stage
const PROGRESS_MESSAGES = {
  0: 'Conectando con el modelo...',
  5: 'Conectando con el modelo...',
  10: 'Analizando contenido del documento...',
  20: 'Identificando conceptos clave...',
  35: 'Generando estructura del material...',
  55: 'Creando contenido y ejemplos...',
  75: 'Finalizando el material...',
  90: 'Generando documento DOCX...',
  100: '¡Material generado con éxito!'
};

/**
 * Get status message based on progress percentage
 * @param {number} progress - Progress percentage (0-100)
 * @returns {string} Status message
 */
function getStatusMessage(progress) {
  // Find the appropriate message for the current progress range
  const stages = Object.keys(PROGRESS_MESSAGES).map(Number).sort((a, b) => a - b);
  
  for (let i = stages.length - 1; i >= 0; i--) {
    if (progress >= stages[i]) {
      return PROGRESS_MESSAGES[stages[i]];
    }
  }
  
  return PROGRESS_MESSAGES[0];
}

/**
 * Send a progress SSE event to the client
 * @param {object} res - Express response object
 * @param {number} progress - Progress percentage (0-100)
 */
function sendProgress(res, progress) {
  const message = getStatusMessage(progress);
  console.log(`📡 Enviando progreso: ${progress}% - ${message}`);
  res.write(`data: ${JSON.stringify({ type: 'progress', progress, message })}\n\n`);
}

// POST /api/generate - Generate material with SSE streaming
router.post('/', async (req, res) => {
  const { model, material_type, input_text, extra_instructions, num_preguntas } = req.body;

  // Validate required fields
  if (!material_type) {
    return res.status(400).json({ error: 'El tipo de material es requerido' });
  }

  if (!input_text) {
    return res.status(400).json({ error: 'El texto de entrada es requerido' });
  }

  // Validate material_type
  const validTypes = ['guia', 'ejercicios', 'plan_clase', 'niveles', 'mapa', 'glosario', 'examen_seleccion'];
  if (!validTypes.includes(material_type)) {
    return res.status(400).json({ 
      error: `Tipo de material inválido. Tipos válidos: ${validTypes.join(', ')}` 
    });
  }

  // Validate num_preguntas if material_type is examen_seleccion
  if (material_type === 'examen_seleccion') {
    const num = parseInt(num_preguntas, 10);
    if (isNaN(num) || num < 5 || num > 50) {
      return res.status(400).json({ 
        error: 'El número de preguntas debe ser entre 5 y 50 para exámenes de selección única' 
      });
    }
    
    // Validate content length - minimum ~100 characters per question
    const minContentLength = num * 100;
    if (input_text.length < minContentLength) {
      return res.status(400).json({ 
        error: `El documento tiene muy poco contenido (${input_text.length} caracteres). Se necesitan al menos ${minContentLength} caracteres para generar ${num} preguntas.` 
      });
    }
  }

  // Get prompt with messages
  let promptData;
  try {
    const promptOptions = material_type === 'examen_seleccion' ? { numPreguntas: parseInt(num_preguntas, 10) } : {};
    promptData = getPrompt(material_type, input_text, extra_instructions || '', promptOptions);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  // Use specified model or default
  const selectedModel = model || promptData.model;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let sessionId = null;
  let outputText = '';
  let streamClosed = false;
  let chunksReceived = 0;
  let lastProgressSent = 0;

  // Detect client disconnection
  const clientAborted = () => {
    return res.writableEnded || streamClosed;
  };

  try {
    // Send initial progress - connecting to model
    sendProgress(res, 5);
    // Create session record (initially without output_text)
    sessionId = uuidv4();
    const db = getDb();
    
    // Generate title from material type and timestamp
    const materialNames = {
      guia: 'Guía de Estudio',
      ejercicios: 'Ejercicios',
      plan_clase: 'Plan de Clase',
      niveles: 'Adaptación por Nivel',
      mapa: 'Mapa Conceptual',
      glosario: 'Glosario',
      examen_seleccion: `Examen (${num_preguntas} preg.)`
    };
    const title = `${materialNames[material_type]} - ${new Date().toLocaleDateString('es-ES')}`;

    const insertSession = db.prepare(`
      INSERT INTO sessions (id, title, model, material_type, extra_instructions, input_filename, input_text, output_text, docx_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `);
    
    insertSession.run(sessionId, title, selectedModel, material_type, extra_instructions || '', 'documento.pdf', input_text, '');

    console.log(`📝 Sesión creada: ${sessionId}`);

    // Get stream from appropriate provider
    const provider = getProvider(selectedModel);
    console.log(`🤖 Proveedor de IA: ${provider} (modelo: ${selectedModel})`);
    
    let stream;
    if (provider === 'ollama') {
      // Check if Ollama is available
      const ollamaAvailable = await isOllamaRunning();
      if (!ollamaAvailable) {
        throw new Error('Ollama no está disponible. Asegúrate de que el servicio esté corriendo (ollama serve)');
      }
      stream = await generateOllama(selectedModel, promptData.messages);
    } else {
      stream = await generateOpenRouter(selectedModel, promptData.messages);
    }
    
    console.log('📡 Stream obtenido, iniciando lectura...');
    
    // Create reader to read the stream
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    // Process stream and send to client
    console.log('📡 Entrando al loop de lectura...');
    while (true) {
      if (clientAborted()) {
        console.log('⚠️ Cliente desconectado, cerrando stream...');
        await reader.cancel();
        streamClosed = true;
        
        // IMPORTANT: Do NOT delete the session here!
        // The stream may have already processed content.
        // Let the post-processing handle it - if there's output, save it.
        // If the session was truly cancelled (no output), it will be handled naturally.
        
        console.log(`📝 Cliente desconectado, manteniendo sesión: ${sessionId}`);
        break;
      }

      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Decode and parse the SSE data
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          // Check for [DONE] signal
          if (data === '[DONE]') {
            streamClosed = true;
            break;
          }

          // Try to parse JSON
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              outputText += content;
              chunksReceived++;
              
              // Calculate and send progress updates at thresholds
              // Progress ranges from 10% (start of content) to 75% (end of streaming)
              // We send updates at roughly every 5% progress to avoid flooding
              const estimatedProgress = Math.min(75, 10 + Math.floor(chunksReceived / 2));
              const progressToSend = Math.floor(estimatedProgress / 5) * 5; // Round to nearest 5
              
              if (progressToSend > lastProgressSent && progressToSend < 75) {
                lastProgressSent = progressToSend;
                sendProgress(res, progressToSend);
              }
              
              // Send SSE message to client
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {
            // Not JSON, might be raw text - skip
          }
        }
      }
    }

    // Stream completed - update session with output_text
    if (sessionId && outputText) {
      const updateSession = db.prepare(`
        UPDATE sessions 
        SET output_text = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      
      updateSession.run(outputText, sessionId);
      console.log(`✅ Sesión actualizada con contenido: ${sessionId}`);
      
      // Task 5.7: Generate DOCX and update SQLite with path
      // Send progress update before DOCX generation
      sendProgress(res, 90);
      
      try {
        const docxPath = await generateDocx(outputText, material_type, sessionId);
        
        console.log(`📄 DocxPath recibido: ${docxPath}`);
        console.log(`📄 SessionId char codes: ${JSON.stringify(Array.from(sessionId).map(c => c.charCodeAt(0)))}`);
        
        // Update session with DOCX path
        const updateDocxPath = db.prepare(`
          UPDATE sessions 
          SET docx_path = ?, updated_at = datetime('now')
          WHERE id = ?
        `);
        
        console.log(`📄 Ejecutando update con id=${sessionId} (${sessionId.length} chars)`);
        const updateResult = updateDocxPath.run(docxPath, sessionId);
        console.log(`📄 Update result: ${JSON.stringify(updateResult)}`);
        console.log(`✅ DOCX Path actualizado. Verificando en DB...`);
        
        // Verify the update
        const verifySession = db.prepare('SELECT id, docx_path FROM sessions WHERE id = ?');
        const savedSession = verifySession.get(sessionId);
        console.log(`📋 Verificación - ID: ${savedSession?.id}, docx_path: ${savedSession?.docx_path}`);
        console.log(`✅ DOCX generado y guardado: ${docxPath}`);
      } catch (docxError) {
        console.error('❌ Error al generar DOCX:', docxError.message);
        // Continue - the session still has the text, just no DOCX
      }
      
      // Send final progress update
      sendProgress(res, 100);
      
      // Send completion signal
      console.log(`✅ Enviando done con sessionId: ${sessionId}`);
      res.write(`data: ${JSON.stringify({ done: true, sessionId })}\n\n`);
    }

  } catch (error) {
    console.error('❌ Error en generación:', error.message);
    
    // Send error to client
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    
    // Instead of deleting, try to save partial content if we have any
    if (sessionId && outputText) {
      try {
        const db = getDb();
        
        // Save partial content
        const updateSession = db.prepare(`
          UPDATE sessions 
          SET output_text = ?, updated_at = datetime('now')
          WHERE id = ?
        `);
        updateSession.run(outputText, sessionId);
        console.log(`📝 Contenido parcial guardado: ${sessionId}`);
        
        // Try to generate DOCX from partial content
        try {
          sendProgress(res, 90);
          const docxPath = await generateDocx(outputText, material_type, sessionId);
          
          const updateDocxPath = db.prepare(`
            UPDATE sessions 
            SET docx_path = ?, updated_at = datetime('now')
            WHERE id = ?
          `);
          updateDocxPath.run(docxPath, sessionId);
          console.log(`✅ DOCX generado (contenido parcial): ${docxPath}`);
        } catch (docxError) {
          console.error('❌ Error al generar DOCX:', docxError.message);
        }
        
        // Send completion with the sessionId
        sendProgress(res, 100);
        res.write(`data: ${JSON.stringify({ done: true, sessionId })}\n\n`);
      } catch (saveError) {
        console.error('Error al guardar contenido parcial:', saveError.message);
      }
    } else if (sessionId) {
      // No content, delete the session
      try {
        const db = getDb();
        const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');
        deleteSession.run(sessionId);
        console.log(`🗑️ Sesión eliminada (sin contenido): ${sessionId}`);
      } catch (deleteError) {
        console.error('Error al eliminar sesión:', deleteError);
      }
    }
  } finally {
    // End the response
    if (!res.writableEnded) {
      res.end();
    }
  }
});

export default router;
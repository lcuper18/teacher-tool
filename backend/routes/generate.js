import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/db.js';
import { getPrompt } from '../utils/prompts.js';
import { generateStream } from '../utils/openrouter.js';

const router = Router();

// POST /api/generate - Generate material with SSE streaming
router.post('/', async (req, res) => {
  const { model, material_type, input_text, extra_instructions } = req.body;

  // Validate required fields
  if (!material_type) {
    return res.status(400).json({ error: 'El tipo de material es requerido' });
  }

  if (!input_text) {
    return res.status(400).json({ error: 'El texto de entrada es requerido' });
  }

  // Validate material_type
  const validTypes = ['guia', 'ejercicios', 'plan_clase', 'niveles', 'mapa', 'glosario'];
  if (!validTypes.includes(material_type)) {
    return res.status(400).json({ 
      error: `Tipo de material inválido. Tipos válidos: ${validTypes.join(', ')}` 
    });
  }

  // Get prompt with messages
  let promptData;
  try {
    promptData = getPrompt(material_type, input_text, extra_instructions || '');
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

  // Detect client disconnection
  const clientAborted = () => {
    return res.writableEnded || streamClosed;
  };

  try {
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
      glosario: 'Glosario'
    };
    const title = `${materialNames[material_type]} - ${new Date().toLocaleDateString('es-ES')}`;

    const insertSession = db.prepare(`
      INSERT INTO sessions (id, title, model, material_type, extra_instructions, input_text, output_text, docx_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `);
    
    insertSession.run(sessionId, title, selectedModel, material_type, extra_instructions || '', input_text, '');

    console.log(`📝 Sesión creada: ${sessionId}`);

    // Get stream from OpenRouter
    const stream = await generateStream(selectedModel, promptData.messages);
    
    // Create reader to read the stream
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    // Process stream and send to client
    while (true) {
      if (clientAborted()) {
        console.log('⚠️ Cliente desconectado, cerrando stream...');
        await reader.cancel();
        streamClosed = true;
        
        // Delete the session since generation was cancelled
        if (sessionId) {
          try {
            const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');
            deleteSession.run(sessionId);
            console.log(`🗑️ Sesión eliminada (cancelada): ${sessionId}`);
          } catch (deleteError) {
            console.error('Error al eliminar sesión:', deleteError);
          }
        }
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
      
      // Send completion signal
      res.write(`data: ${JSON.stringify({ done: true, sessionId })}\n\n`);
    }

  } catch (error) {
    console.error('❌ Error en generación:', error.message);
    
    // Send error to client
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    
    // Delete session if there was an error
    if (sessionId) {
      try {
        const db = getDb();
        const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');
        deleteSession.run(sessionId);
        console.log(`🗑️ Sesión eliminada por error: ${sessionId}`);
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
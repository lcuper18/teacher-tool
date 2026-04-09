import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();

// ============================================================
// CONFIGURACIÓN DE MULTER (límite 10MB)
// ============================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../storage/uploads');

// Asegurar que el directorio de uploads existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Usar memoryStorage para tener acceso al buffer para validación de magic bytes
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// ============================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Magic bytes (file signatures) para validación
const FILE_SIGNATURES = {
  // PDF: %PDF
  pdf: [0x25, 0x50, 0x44, 0x46],
  // DOCX: PK (ZIP format)
  docx: [0x50, 0x4B],
  // DOC: PK (ZIP - Office Open XML) o D0 CF (Office legacy)
  doc: [
    [0x50, 0x4B], // ZIP format (DOCX guardado como .doc)
    [0xD0, 0xCF]  // Legacy Office format
  ]
};

// ============================================================
// MIDDLEWARE DE VALIDACIÓN DE ARCHIVO
// ============================================================

/**
 * Valida el tipo de archivo mediante extensión, MIME type y magic bytes.
 * Se ejecuta DESPUÉS de multer (upload.single) para rechazar archivos inválidos.
 */
const validateFileMiddleware = (req, res, next) => {
  // Verificar que hay un archivo en la request (upload.single pone el archivo en req.file, no req.files)
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
  }

  const file = req.file;
  const filename = file.originalname;

  try {
    // 1. VALIDAR EXTENSIÓN (case-insensitive)
    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res.status(400).json({
        error: `Tipo de archivo no permitido: ${ext}`,
        message: `Solo se aceptan archivos con extensión .pdf, .doc o .docx`
      });
    }

    // 2. VALIDAR MIME TYPE del header
    const mimeType = file.mimetype;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({
        error: `Tipo MIME no permitido: ${mimeType}`,
        message: `El Content-Type del archivo no es válido para documentos PDF, DOC o DOCX`
      });
    }

    // 3. VERIFICAR FILE SIGNATURE (magic bytes)
    // Leer los primeros bytes del archivo del buffer
    const fileBuffer = file.buffer;
    if (!fileBuffer || fileBuffer.length < 4) {
      return res.status(400).json({
        error: 'Archivo vacío o corrupto',
        message: 'No se pudo leer el contenido del archivo'
      });
    }

    const signature = Array.from(fileBuffer.slice(0, 4)).map(b => b & 0xFF);

    let isValidSignature = false;
    
    if (ext === '.pdf') {
      // PDF debe comenzar con %PDF
      isValidSignature = matchesSignature(signature, FILE_SIGNATURES.pdf);
    } 
    else if (ext === '.docx') {
      // DOCX es ZIP, debe comenzar con PK
      isValidSignature = matchesSignature(signature, FILE_SIGNATURES.docx);
    } 
    else if (ext === '.doc') {
      // DOC puede ser ZIP (guardado como .doc) o formato legacy
      isValidSignature = matchesSignature(signature, FILE_SIGNATURES.doc[0]) || 
                         matchesSignature(signature, FILE_SIGNATURES.doc[1]);
    }

    if (!isValidSignature) {
      return res.status(400).json({
        error: 'Firma de archivo inválida',
        message: 'El contenido del archivo no corresponde con su extensión. El archivo puede estar corrupto o ser falso.'
      });
    }

    // 4. VERIFICAR TAMAÑO (redundante con multer, pero como capa adicional)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(413).json({
        error: 'Archivo demasiado grande',
        message: 'El archivo excede el límite máximo de 10 MB'
      });
    }

    // Si todo es válido, continuar
    next();

  } catch (error) {
    console.error('Error en validación de archivo:', error);
    return res.status(500).json({
      error: 'Error al validar el archivo',
      message: 'Ocurrió un error interno durante la validación'
    });
  }
};

/**
 * Compara los bytes leídos con la firma esperada.
 * @param {number[]} signature - Bytes leídos del archivo
 * @param {number[]|number[][]} expected - Firma esperada o array de firmas
 */
function matchesSignature(signature, expected) {
  if (Array.isArray(expected[0])) {
    // Array de firmas posibles (como para DOC)
    return expected.some(exp => 
      exp.length <= signature.length && 
      exp.every((byte, i) => byte === signature[i])
    );
  }
  return expected.length <= signature.length && 
         expected.every((byte, i) => byte === signature[i]);
}

/**
 * Sanitiza el nombre del archivo para prevenir path traversal y caracteres especiales.
 * @param {string} filename - Nombre original del archivo
 * @returns {string} Nombre sanitizado
 */
function sanitizeFilename(filename) {
  // Obtener solo el nombre base (eliminar path)
  let name = path.basename(filename);
  
  // Eliminar caracteres potencialmente peligrosos
  name = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Eliminar múltiples guiones bajos consecutivos
  name = name.replace(/__+/g, '_');
  
  // Eliminar puntos al inicio o fin
  name = name.replace(/^\.+|\.+$/g, '');
  
  // Si queda vacío, usar nombre por defecto
  if (!name || name.length === 0) {
    name = 'archivo';
  }
  
  return name;
}

// ============================================================
// RUTAS
// ============================================================

// Route: POST /api/upload
// Usa el middleware de validación DESPUÉS de que multer procesa el archivo
router.post('/', upload.single('file'), validateFileMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se proporcionó ningún archivo',
        message: 'El campo del formulario debe llamarse "file"'
      });
    }

    // Guardar el archivo desde memoria a disco para procesamiento
    const sanitized = sanitizeFilename(req.file.originalname);
    const uniqueFilename = `${Date.now()}-${sanitized}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Crear objeto de archivo simulado con path para el procesador
    const fileForProcessor = {
      ...req.file,
      path: filePath
    };

    // Importar el procesador de archivos
    const { processFile } = await import('../utils/fileProcessor.js');
    
    // Procesar el archivo (extraer texto)
    const result = await processFile(fileForProcessor);
    
    // Responder con el texto extraído
    res.json({
      success: true,
      text: result.text,
      filename: result.filename,
      pages: result.pages
    });

  } catch (error) {
    console.error('Error al procesar archivo:', error);
    
    // Manejar error específico de PDF escaneado
    if (error.message && error.message.includes('texto extraíble')) {
      return res.status(422).json({
        error: 'El archivo PDF no contiene texto seleccionable',
        message: 'Por favor, usa un PDF que contenga texto (no escaneado) o convierte el documento a DOCX.'
      });
    }
    
    res.status(500).json({
      error: 'Error al procesar el archivo',
      message: error.message || 'Ocurrió un error desconocido'
    });
  }
});

// Error handling específico para multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'Archivo demasiado grande',
        message: 'El archivo excede el límite máximo de 10 MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Campo de archivo inesperado',
        message: 'El campo del formulario debe llamarse "file"'
      });
    }
    return res.status(400).json({
      error: 'Error al subir archivo',
      message: err.message
    });
  }
  next(err);
});

export default router;

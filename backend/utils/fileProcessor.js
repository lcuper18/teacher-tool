import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Ruta al directorio de scripts
const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

// Python binario - usar el venv si existe, sino python3
const PYTHON_BIN = fs.existsSync('.venv/bin/python') 
    ? '.venv/bin/python' 
    : 'python3';

/**
 * Ejecuta un script Python y retorna el JSON parseado de su salida.
 * @param {string} scriptName - Nombre del script Python
 * @param {string[]} args - Argumentos para el script
 * @returns {Promise<object>} - Resultado parseado del JSON
 */
function runPythonScript(scriptName, args) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(SCRIPTS_DIR, scriptName);
        
        const pythonProcess = spawn(PYTHON_BIN, [scriptPath, ...args], {
            cwd: SCRIPTS_DIR === path.join(process.cwd(), 'scripts') 
                ? process.cwd() 
                : path.join(process.cwd()),
            shell: false
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Script exited with code ${code}: ${stderr}`));
                return;
            }

            try {
                const result = JSON.parse(stdout.trim());
                resolve(result);
            } catch (parseError) {
                reject(new Error(`Failed to parse JSON output: ${stdout}`));
            }
        });

        pythonProcess.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Extrae texto de un archivo PDF, DOCX o DOC.
 * Para DOC, primero convierte a DOCX usando LibreOffice.
 * 
 * @param {object} file - Archivo de multer con path, originalname, etc.
 * @returns {Promise<{text: string, filename: string, pages: number}>}
 */
export async function processFile(file) {
    if (!file || !file.path) {
        throw new Error('No se proporcionó un archivo válido');
    }

    const filePath = file.path;
    const originalName = file.originalname || path.basename(filePath);
    const ext = path.extname(originalName).toLowerCase();
    
    let docxPath = null;
    let finalPath = filePath;

    try {
        // Determinar el tipo de archivo por extensión
        if (ext === '.pdf') {
            // PDF: extraer directamente
            finalPath = filePath;
        } 
        else if (ext === '.doc') {
            // DOC: convertir primero a DOCX, luego extraer
            const convertResult = await runPythonScript('convert_doc.py', [filePath]);
            
            if (!convertResult.success) {
                throw new Error(convertResult.error || 'Error al convertir DOC a DOCX');
            }
            
            docxPath = convertResult.docx_path;
            finalPath = docxPath;
        } 
        else if (ext === '.docx') {
            // DOCX: extraer directamente
            finalPath = filePath;
        } 
        else {
            throw new Error(`Tipo de archivo no soportado: ${ext}. Solo se aceptan PDF, DOC y DOCX`);
        }

        // Extraer texto del archivo (PDF o DOCX)
        const extractResult = await runPythonScript('extract_text.py', [finalPath]);

        if (!extractResult.success) {
            throw new Error(extractResult.error || 'Error al extraer texto');
        }

        // Retornar el resultado
        return {
            text: extractResult.text,
            filename: extractResult.filename || originalName,
            pages: extractResult.pages || 1
        };

    } finally {
        // Limpieza: eliminar archivos temporales INMEDIATAMENTE después de extraer texto
        try {
            // Eliminar archivo original subidor por multer
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            // Si se creó un archivo DOCX temporal de la conversión, eliminarlo
            if (docxPath && docxPath !== filePath && fs.existsSync(docxPath)) {
                fs.unlinkSync(docxPath);
            }
        } catch (cleanupError) {
            console.error('Error al limpiar archivos temporales:', cleanupError);
        }
    }
}

/**
 * Valida que el tipo de archivo sea permitido.
 * @param {string} filename - Nombre del archivo
 * @throws {Error} Si el tipo no es permitido
 */
export function validateFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    
    if (!allowedExtensions.includes(ext)) {
        throw new Error(`Tipo de archivo no permitido: ${ext}. Solo se aceptan PDF, DOC y DOCX`);
    }
}

export default { processFile, validateFileType };
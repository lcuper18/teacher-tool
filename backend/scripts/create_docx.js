/**
 * DOCX Generator
 * Creates .docx files from markdown text using the docx library
 * 
 * Tasks 5.1 + 5.2: Create module + Parser markdown → DOCX
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration constants
const PAGE_SIZE = { width: 11906, height: 16838 }; // A4 in DXA
const PAGE_MARGIN = { top: 1440, right: 1440, bottom: 1440, left: 1440 }; // 1 inch

/**
 * Parse markdown text into DOCX elements
 * Handles: ## Heading, ### Heading, **bold**, - bullet list, 1. numbered list
 * @param {string} markdown - Raw markdown text from AI
 * @returns {Array} - Array of docx elements
 */
function parseMarkdown(markdown) {
  const lines = markdown.split('\n');
  const elements = [];
  
  // State tracking
  let inList = false;
  let listItems = [];
  let isOrderedList = false;
  let inTable = false;
  let tableRows = [];
  
  const flushList = () => {
    if (listItems.length > 0) {
      if (isOrderedList) {
        elements.push(...createOrderedList(listItems));
      } else {
        elements.push(...createBulletList(listItems));
      }
      listItems = [];
      inList = false;
      isOrderedList = false;
    }
  };
  
  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(createStyledTable(tableRows));
      tableRows = [];
      inTable = false;
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Empty line - flush pending content
    if (!trimmedLine) {
      flushList();
      flushTable();
      continue;
    }
    
    // Check for table separator line |---|---| (skip it)
    if (trimmedLine.match(/^[\|:\-]+\|*$/)) {
      continue;
    }
    
    // Table row detection | cell | cell | cell |
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      flushList();
      inTable = true;
      const cells = trimmedLine
        .slice(1, -1)
        .split('|')
        .map(cell => cell.trim());
      tableRows.push(cells);
      continue;
    }
    
    // Flush table when we hit a non-table line
    if (inTable && !trimmedLine.startsWith('|')) {
      flushTable();
    }
    
    // Heading levels
    if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(createHeading(trimmedLine.slice(3), 2));
      continue;
    }
    
    if (trimmedLine.startsWith('### ')) {
      flushList();
      elements.push(createHeading(trimmedLine.slice(4), 3));
      continue;
    }
    
    if (trimmedLine.startsWith('#### ')) {
      flushList();
      elements.push(createHeading(trimmedLine.slice(5), 4));
      continue;
    }
    
    if (trimmedLine.startsWith('# ')) {
      flushList();
      elements.push(createHeading(trimmedLine.slice(2), 1));
      continue;
    }
    
    // Bullet list items (- item or * item)
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (!inList) {
        flushList();
        inList = true;
        isOrderedList = false;
      } else if (isOrderedList) {
        flushList();
        inList = true;
        isOrderedList = false;
      }
      listItems.push(trimmedLine.slice(2));
      continue;
    }
    
    // Ordered list items (1. item, 2. item, etc.)
    const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      if (!inList) {
        flushList();
        inList = true;
        isOrderedList = true;
      } else if (!isOrderedList) {
        flushList();
        inList = true;
        isOrderedList = true;
      }
      listItems.push(orderedMatch[2]);
      continue;
    }
    
    // Check for table cell separators in regular text (not table rows)
    // Skip these lines as they're likely table-related
    
    // Regular paragraph with potential bold text
    flushList();
    elements.push(createParagraph(trimmedLine));
  }
  
  // Flush any remaining content
  flushList();
  flushTable();
  
  return elements;
}

/**
 * Create a heading paragraph
 * @param {string} text - Heading text
 * @param {number} level - Heading level (1-4)
 */
function createHeading(text, level) {
  let headingLevel;
  
  switch (level) {
    case 1:
      headingLevel = HeadingLevel.HEADING_1;
      break;
    case 2:
      headingLevel = HeadingLevel.HEADING_2;
      break;
    case 3:
      headingLevel = HeadingLevel.HEADING_3;
      break;
    default:
      headingLevel = HeadingLevel.HEADING_4;
  }
  
  return new Paragraph({
    text: text,
    heading: headingLevel,
    spacing: { before: 240, after: 120 }
  });
}

/**
 * Create a paragraph with bold support
 * Parses **text** for bold
 * @param {string} text - Text with potential bold markers
 */
function createParagraph(text) {
  // Split by bold markers **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  
  if (parts.length === 1) {
    // No bold, simple text
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          font: 'Arial',
          size: 24 // 12pt = 24 half-points
        })
      ],
      spacing: { after: 120 }
    });
  }
  
  // Has bold markers
  const runs = parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Bold text
      return new TextRun({
        text: part.slice(2, -2),
        bold: true,
        font: 'Arial',
        size: 24
      });
    } else if (part) {
      // Regular text
      return new TextRun({
        text: part,
        font: 'Arial',
        size: 24
      });
    }
    return null;
  }).filter(Boolean);
  
  return new Paragraph({
    children: runs,
    spacing: { after: 120 }
  });
}

/**
 * Create bullet list items
 * @param {Array<string>} items - Array of list items
 */
function createBulletList(items) {
  return items.map(item => {
    // Parse bold in list items
    const parts = item.split(/(\*\*[^*]+\*\*)/);
    const runs = parts.map(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({
          text: part.slice(2, -2),
          bold: true,
          font: 'Arial',
          size: 24
        });
      } else if (part) {
        return new TextRun({
          text: part,
          font: 'Arial',
          size: 24
        });
      }
      return null;
    }).filter(Boolean);
    
    return new Paragraph({
      children: runs,
      bullet: { level: 0 },
      indent: { left: 720 },
      spacing: { after: 60 }
    });
  });
}

/**
 * Create ordered (numbered) list items
 * @param {Array<string>} items - Array of list items
 */
function createOrderedList(items) {
  return items.map((item, index) => {
    const parts = item.split(/(\*\*[^*]+\*\*)/);
    const runs = parts.map(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({
          text: part.slice(2, -2),
          bold: true,
          font: 'Arial',
          size: 24
        });
      } else if (part) {
        return new TextRun({
          text: part,
          font: 'Arial',
          size: 24
        });
      }
      return null;
    }).filter(Boolean);
    
    return new Paragraph({
      children: runs,
      numbering: {
        reference: 'ordered-list',
        level: 0
      },
      indent: { left: 720 },
      spacing: { after: 60 }
    });
  });
}

/**
 * Create a styled table from markdown table rows
 * @param {Array<Array<string>>} rows - Array of rows (each row is array of cells)
 */
function createStyledTable(rows) {
  // Filter out separator rows
  const filteredRows = rows.filter(row => {
    const cellText = row.join('');
    return !cellText.match(/^[\|:\-]+$/);
  });
  
  // First row as header
  const isHeaderRow = filteredRows.length > 0;
  
  const tableRows = filteredRows.map((rowCells, rowIndex) => {
    const cells = rowCells.map(cellText => {
      // Parse bold in table cells
      const parts = cellText.split(/(\*\*[^*]+\*\*)/);
      const runs = parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return new TextRun({
            text: part.slice(2, -2),
            bold: true,
            font: 'Arial',
            size: 24
          });
        } else if (part) {
          return new TextRun({
            text: part,
            font: 'Arial',
            size: 24
          });
        }
        return null;
      }).filter(Boolean);
      
      const cell shading = rowIndex === 0 ? { fill: 'e6e6e6' } : { fill: 'ffffff' };
      
      return new TableCell({
        children: [
          new Paragraph({
            children: runs,
            spacing: { after: 60 }
          })
        ],
        shading: shading,
        borders: {
          top: { style: BorderStyle.SINGLE, size: 8, color: 'cccccc' },
          bottom: { style: BorderStyle.SINGLE, size: 8, color: 'cccccc' },
          left: { style: BorderStyle.SINGLE, size: 8, color: 'cccccc' },
          right: { style: BorderStyle.SINGLE, size: 8, color: 'cccccc' }
        }
      });
    });
    
    return new TableRow({
      children: cells
    });
  });
  
  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE }
  });
}

/**
 * Get configuration values (school name, teacher name)
 */
function getConfig() {
  try {
    const db = getDb();
    const getSchoolName = db.prepare('SELECT value FROM config WHERE key = ?');
    const getTeacherName = db.prepare('SELECT value FROM config WHERE key = ?');
    
    const schoolRow = getSchoolName.get('school_name');
    const teacherRow = getTeacherName.get('teacher_name');
    
    return {
      schoolName: schoolRow?.value || '',
      teacherName: teacherRow?.value || ''
    };
  } catch (error) {
    console.error('Error getting config:', error.message);
    return { schoolName: '', teacherName: '' };
  }
}

/**
 * Format current date
 */
function formatDate() {
  const now = new Date();
  return now.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Generate DOCX file from markdown
 * @param {string} markdownText - The markdown text to convert
 * @param {string} materialType - Type of material (guia, ejercicios, etc.)
 * @param {string} sessionId - Session ID for filename
 * @returns {Promise<string>} - Path to the generated DOCX file
 */
export async function generateDocx(markdownText, materialType, sessionId) {
  const config = getConfig();
  
  // Parse markdown into elements
  const elements = parseMarkdown(markdownText);
  
  // Material type display names
  const materialNames = {
    guia: 'Guía de Estudio',
    ejercicios: 'Ejercicios y Evaluación',
    plan_clase: 'Plan de Clase',
    niveles: 'Adaptación por Nivel',
    mapa: 'Mapa Conceptual',
    glosario: 'Glosario de Términos'
  };
  
  const materialName = materialNames[materialType] || 'Material';
  
  // Build document children
  const children = [];
  
  // Header with school name
  if (config.schoolName) {
    children.push(new Paragraph({
      text: config.schoolName,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }
    }));
  }
  
  // Teacher name
  if (config.teacherName) {
    children.push(new Paragraph({
      text: config.teacherName,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 }
    }));
  }
  
  // Material title
  children.push(new Paragraph({
    text: materialName,
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 360 }
  }));
  
  // Date
  children.push(new Paragraph({
    text: formatDate(),
    alignment: AlignmentType.CENTER,
    spacing: { after: 360 },
    color: '666666'
  }));
  
  // Separator line
  children.push(new Paragraph({
    children: [
      new TextRun({
        text: '─'.repeat(40),
        color: 'cccccc'
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 360 }
  }));
  
  // Add parsed markdown elements
  children.push(...elements);
  
  // Footer with page number placeholder
  children.push(new Paragraph({
    text: `Fecha de generación: ${formatDate()}`,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 720 },
    color: '888888'
  }));
  
  // Create the document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: PAGE_SIZE,
          margin: PAGE_MARGIN
        }
      },
      children: children
    }]
  });
  
  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  
  // Ensure directory exists
  const storageDir = path.join(__dirname, '..', 'storage', 'generated');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  
  // Save file
  const filePath = path.join(storageDir, `${sessionId}.docx`);
  fs.writeFileSync(filePath, buffer);
  
  console.log(`✅ DOCX generado: ${filePath}`);
  
  return filePath;
}

export default {
  generateDocx
};
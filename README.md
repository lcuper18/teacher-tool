# Teacher Tool

Herramienta web local para docentes de secundaria que genera materiales de estudio a partir de documentos PDF/DOC/DOCX usando inteligencia artificial.

---

## Estado del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Estructura del proyecto y configuración | ✅ Completado |
| 2 | Backend: servidor Express + SQLite | ✅ Completado |
| 3 | Backend: procesamiento de archivos | ✅ Completado |
| 4 | Backend: integración OpenRouter (streaming) | ✅ Completado |
| 5 | Backend: generación de archivos DOCX | ✅ Completado |
| 6 | Frontend: estructura base + diseño | ✅ Completado |
| 7 | Frontend: componentes principales | ✅ Completado |
| 8 | Frontend: historial de sesiones (sidebar) | ✅ Completado |
| 9 | Frontend: streaming visible al generar | ✅ Completado |
| 10 | Integración completa + pruebas | ✅ Completado |
| 8 | Frontend: historial de sesiones (sidebar) | ⬜ Pendiente |
| 9 | Frontend: streaming visible al generar | ⬜ Pendiente |
| 10 | Integración completa + pruebas | ⬜ Pendiente |

---

## Requisitos del sistema

| Requisito | Versión mínima |
|----------|----------------|
| Node.js | 18.x |
| Python | 3.12 |
| LibreOffice | 24.2.7.2 |

### Dependencias necesarias

**Python (pip):**
```
pdfplumber pypdf python-docx
```

**Node.js:**las dependencias se instalarán automáticamente via `npm run install:all`.

---

## Configuración previa

### 1. Variables de entorno

Crear un archivo `.env` en la raíz del proyecto (copiar desde `.env.example`):

```bash
# Clave API para OpenRouter (ya configurada en el sistema como variable de entorno)
OPENROUTER_API_KEY=

# Puerto del servidor backend
PORT=3001

# Ruta de la base de datos SQLite
DB_PATH=./database/teacher_tool.db

# Ruta para archivos subidos y generados
STORAGE_PATH=./storage

# Ruta de LibreOffice (ya installed en /usr/bin/libreoffice)
LIBREOFFICE_PATH=/usr/bin/libreoffice
```

### 2. API Key de OpenRouter

El proyecto usa **OpenRouter** como proxy para modelos de IA. Puedes obtener una API key en:
https://openrouter.ai/

Modelos disponibles:
- **Claude Sonnet 4.6** (predeterminado)
- **MiniMax 2.7** (alternativo)

---

## Instalación

```bash
# Primera vez: instalar todas las dependencias
npm run install:all
```

Este comando instala:
- Dependencias del backend (`backend/package.json`)
- Dependencias del frontend (`frontend/package.json`)
- Dependencias Python (`pdfplumber`, `pypdf`, `python-docx`)

---

## Ejecución

### Desarrollo (backend + frontend

```bash
npm run dev
```

Esto inicia:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### Solo backend

```bash
npm run dev:backend
```

### Solo frontend

```bash
npm run dev:frontend
```

### Build de producción

```bash
npm run build
```

Genera los archivos estáticos optimizados en `frontend/dist/`.

---

## Uso de la aplicación

### Flujo de trabajo

1. **Subir archivo** — Arrastrar un archivo PDF, DOC o DOCX al área de drop
2. **Seleccionar tipo de material** — Elegir entre:
   - Guía de estudio
   - Ejercicios y evaluación
   - Plan de clase
   - Adaptación por nivel
   - Mapa conceptual
   - Glosario de términos
3. **Configurar opciones** — Opcionalmente agregar instrucciones extra
4. **Generar** — El contenido se genera en tiempo real con streaming visible
5. **Descargar** — Descargar el material generado en formato DOCX

### Configuración global

Desde el botón de configuración en el header, puedes establecer:
- Nombre del colegio (aparece en el header del DOCX)
- Nombre del docente (aparece en el header del DOCX)

Esta configuración se guarda y persiste entre sesiones.

---

## Estructura del proyecto

```
teacher-tool/
├─�� .env.example          # Plantilla de variables de entorno
├── .gitignore
├── package.json         # Scripts raíz
├── PLAN.md            # Plan de desarrollo
├── README.md          # Este archivo
│
├── backend/
│   ├── package.json
│   ├── server.js              # Servidor Express
│   ├── database/
│   │   ├── db.js             # Conexión SQLite
│   │   └── migrations.js    # Esquema de tablas
│   ├── routes/
│   │   ├── upload.js         # POST /api/upload
│   │   ├── generate.js       # POST /api/generate
│   │   ├── sessions.js      # CRUD de sesiones
│   │   └── settings.js     # GET/PUT /api/settings
│   ├── utils/
│   │   ├── openrouter.js   # Cliente OpenRouter + SSE
│   │   ├── prompts.js     # Prompts por tipo de material
│   │   └── fileProcessor.js # Orchestration de extracción
│   ├── scripts/
│   │   ├── extract_text.py # Extracción PDF/DOCX
│   │   ├── convert_doc.py  # Conversión DOC → DOCX
│   │   └── create_docx.js   # Generación DOCX
│   └── storage/
│       ├── uploads/        # Archivos subidos (temporales)
│       └── generated/     # DOCX generados
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── DropZone.jsx
    │   │   ├── MaterialSelector.jsx
    │   │   ├── ExtraInstructions.jsx
    │   │   ├── ResultViewer.jsx
    │   │   ├── DownloadButton.jsx
    │   │   ├── SettingsModal.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── SessionItem.jsx
    │   │   └── ui/
    │   │       ├── Button.jsx
    │   │       ├── Spinner.jsx
    │   │       └── Badge.jsx
    │   └── hooks/
    │       ├── useSessions.js
    │       └── useGenerate.js
    └── dist/              # Build de producción
```

---

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/upload` | Sube archivo (max 10 MB), retorna texto extraído |
| `POST` | `/api/generate` | Genera material — streaming SSE |
| `GET` | `/api/sessions` | Lista historial (paginado) |
| `GET` | `/api/sessions/:id` | Detalle de sesión |
| `GET` | `/api/sessions/:id/download` | Descarga DOCX generado |
| `DELETE` | `/api/sessions/:id` | Elimina sesión |
| `GET` | `/api/settings` | Lee configuración global |
| `PUT` | `/api/settings` | Actualiza configuración global |

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Express, SQLite (better-sqlite3), Node.js |
| Frontend | React, Vite, TailwindCSS, react-markdown |
| IA | OpenRouter (Claude Sonnet 4.6 / MiniMax 2.7) |
| Extracción texto | Python (pdfplumber, python-docx) |
| DOCX | Librería `docx` (npm) |

---

## Notas

- Todo corre **100% local** — sin servidor externo más allá de OpenRouter para la IA
- Los archivos subidos se eliminan automáticamente tras extraer el texto
- Los DOCX generados se guardan en `backend/storage/generated/`
- La base de datos SQLite se crea automáticamente en `backend/database/`

---

## Licencia

MIT
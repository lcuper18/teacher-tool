# Teacher Tool — Plan de Desarrollo
> Herramienta web local para docentes de secundaria que genera materiales de estudio a partir de documentos PDF/DOC/DOCX usando IA (DeepSeek V3.2 / MiniMax 2.7 via OpenRouter + modelos locales Ollama).

---

## Estado general

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Estructura del proyecto y configuración | ✅ Completado |
| 2 | Backend: servidor Express + SQLite | ✅ Completado |
| 3 | Backend: procesamiento de archivos | ✅ Completado |
| 4 | Backend: integración OpenRouter (streaming) | ✅ Completado |
| 5 | Backend: generación de archivos DOCX | ✅ Completado |
| 6 | Frontend: estructura base + diseño (estilo moderno) | ✅ Completado |
| 7 | Frontend: componentes principales | ✅ Completado |
| 8 | Frontend: historial de sesiones (sidebar) | ✅ Completado |
| 9 | Frontend: streaming visible al generar | ✅ Completado |
| 10 | Integración completa + pruebas | ✅ Completado |
| 11 | Indicador de progreso + mensajes de estado | ✅ Completado |

---

## Fase 1 — Estructura del proyecto y configuración

### Tareas
- [ ] 1.1 Crear `package.json` raíz con scripts `dev`, `install:all`, `build`
- [ ] 1.2 Crear `backend/package.json` con dependencias Node.js
- [ ] 1.3 Crear `frontend/package.json` con dependencias React + Vite
- [ ] 1.4 Crear `.env.example` con variables requeridas
- [ ] 1.5 Crear `.gitignore` adecuado
- [ ] 1.6 Instalar dependencias Python (`pdfplumber`, `pypdf`, `python-docx`)
- [ ] 1.7 Instalar dependencias backend (`express`, `cors`, `multer`, `better-sqlite3`, `docx`, `uuid`, `dotenv`)
- [ ] 1.8 Instalar dependencias frontend (`react`, `vite`, `tailwindcss`, `react-dropzone`, `lucide-react`)

### Dependencias

**Backend (npm):**
```
express cors multer dotenv
better-sqlite3
docx
uuid
```

**Frontend (npm):**
```
react react-dom
vite @vitejs/plugin-react
tailwindcss autoprefixer postcss
react-dropzone
lucide-react
react-markdown
```

**Python (pip):**
```
pdfplumber pypdf python-docx
```

---

## Fase 2 — Backend: servidor Express + SQLite

### Tareas
- [ ] 2.1 Crear `backend/server.js` (Express, puerto 3001, CORS habilitado)
- [ ] 2.2 Crear `backend/database/db.js` (conexión SQLite con better-sqlite3)
- [ ] 2.3 Crear `backend/database/migrations.js` (tablas en primer arranque)
- [ ] 2.4 Crear rutas: `upload.js`, `generate.js`, `sessions.js`
- [ ] 2.5 Crear directorios `backend/storage/uploads/` y `backend/storage/generated/`

### Esquema SQLite

```sql
CREATE TABLE sessions (
    id               TEXT PRIMARY KEY,
    title            TEXT NOT NULL,
    model            TEXT NOT NULL,
    material_type    TEXT NOT NULL,
    extra_instructions TEXT,
    input_filename   TEXT NOT NULL,
    input_text       TEXT,
    output_text      TEXT,
    docx_path        TEXT,
    created_at       DATETIME DEFAULT (datetime('now')),
    updated_at       DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_sessions_created  ON sessions(created_at DESC);
CREATE INDEX idx_sessions_material ON sessions(material_type);

-- Configuración global (nombre colegio, docente)
CREATE TABLE config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Valores por defecto
INSERT INTO config (key, value) VALUES ('school_name', '');
INSERT INTO config (key, value) VALUES ('teacher_name', '');
```

### Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/upload` | Sube archivo (max 10 MB), retorna texto extraído |
| `POST` | `/api/generate` | Genera material — SSE streaming via `fetch` + `ReadableStream` |
| `GET` | `/api/sessions` | Lista historial (paginado, page size: 20, offset-based) |
| `GET` | `/api/sessions/:id` | Detalle de sesión |
| `GET` | `/api/sessions/:id/download` | Descarga DOCX generado |
| `DELETE` | `/api/sessions/:id` | Elimina sesión y su archivo DOCX asociado |
| `GET` | `/api/settings` | Lee configuración global (nombre colegio, docente) |
| `PUT` | `/api/settings` | Actualiza configuración global |

---

## Fase 3 — Backend: procesamiento de archivos

### Tareas
- [ ] 3.1 Crear `backend/scripts/extract_text.py` — extrae texto de PDF y DOCX
- [ ] 3.2 Crear `backend/scripts/convert_doc.py` — convierte .doc → .docx con LibreOffice
- [ ] 3.3 Crear `backend/utils/fileProcessor.js` — orquesta extracción según tipo MIME
- [ ] 3.4 Validar tipos permitidos: `.pdf`, `.doc`, `.docx` — rechazar con error 400 si otro tipo
- [ ] 3.5 Limpieza automática de archivos en `uploads/` **inmediatamente** después de extraer el texto (no se conserva el original)
- [ ] 3.6 Si el PDF no contiene texto extraíble (PDF escaneado), retornar error claro: `{ error: "El archivo no contiene texto extraíble. Usa un PDF con texto seleccionable." }`

### Flujo de procesamiento

```
Archivo recibido (multer)
        │
        ├─ .pdf  ──► extract_text.py  (pdfplumber)
        ├─ .docx ──► extract_text.py  (python-docx)
        └─ .doc  ──► convert_doc.py (LibreOffice)
                            │
                            └─► extract_text.py (python-docx)
                                        │
                                        ▼
                               { text, filename, pages }
```

### LibreOffice (ya instalado en el sistema)
- Ruta: `/usr/bin/libreoffice`
- Versión: 24.2.7.2
- Uso: `libreoffice --headless --convert-to docx archivo.doc --outdir /tmp/`

---

## Fase 4 — Backend: integración OpenRouter (streaming)

### Tareas
- [ ] 4.1 Crear `backend/utils/openrouter.js` — cliente HTTP con fetch y SSE hacia OpenRouter
- [ ] 4.2 Crear `backend/utils/prompts.js` — prompts por tipo de material
- [ ] 4.3 Implementar `POST /api/generate` con SSE (Server-Sent Events): el backend hace pipe del stream de OpenRouter al cliente
- [ ] 4.4 El frontend consume el stream con `fetch` + `ReadableStream` (NO `EventSource`, que solo soporta GET)
- [ ] 4.5 Manejar errores de API (rate limit, timeout, modelo no disponible)
- [ ] 4.6 Si el usuario cancela la generación: la sesión **no se guarda** en SQLite (descartada limpiamente)

### Modelos disponibles

| Nombre visible | ID OpenRouter | Estado |
|----------------|---------------|--------|
| DeepSeek V3.2 | `deepseek/deepseek-v3.2` | ✅ Activo |
| MiniMax 2.7 | `minimax/minimax-01` | ✅ Disponible |

### Configuración OpenRouter

```
URL base:    https://openrouter.ai/api/v1
Auth:        Bearer $OPENROUTER_API_KEY
Endpoint:    /chat/completions
Streaming:   stream: true
```

### Prompts por tipo de material (nivel secundaria)

| Tipo | `material_type` | Enfoque del prompt |
|------|----------------|--------------------|
| Guía de estudio | `guia` | Resumen jerárquico, conceptos clave, ejemplos accesibles |
| Ejercicios y evaluación | `ejercicios` | 5 opción múltiple + 3 V/F + 2 desarrollo corto |
| Plan de clase | `plan_clase` | Inicio/desarrollo/cierre, 50 min, objetivos SMART |
| Adaptación por nivel | `niveles` | Versión básica, estándar y avanzada |
| Mapa conceptual | `mapa` | Jerarquía en formato tabla/texto estructurado |
| Glosario de términos | `glosario` | 10-15 definiciones en lenguaje adolescente |

---

## Fase 5 — Backend: generación de archivos DOCX

### Tareas
- [ ] 5.1 Crear `backend/scripts/create_docx.js` — usa librería `docx` de npm
- [ ] 5.2 Parsear el markdown devuelto por la IA (`##` → Heading2, `**texto**` → Bold, `- item` → lista) antes de construir el DOCX
- [ ] 5.3 Implementar formato diferenciado por tipo de material:
  - Guía: headings, listas, párrafos
  - Ejercicios: numeración, espacios para respuesta
  - Plan de clase: tabla 3 columnas (momento / actividad / tiempo)
  - Niveles: sección separada por nivel con color de encabezado
  - Mapa: tabla jerarquía visual
  - Glosario: tabla término / definición
- [ ] 5.4 Header con nombre del colegio y docente leídos desde tabla `config` en SQLite
- [ ] 5.5 Footer con número de página y fecha de generación
- [ ] 5.6 Guardar DOCX en `backend/storage/generated/{session_id}.docx`
- [ ] 5.7 Actualizar registro SQLite con ruta del DOCX

### Configuración DOCX
```
Tamaño página: A4 (11906 x 16838 DXA)
Márgenes:      1 inch (1440 DXA) todos los lados
Fuente:        Arial 12pt
Color acento:  #c96442 (naranja — coherente con interfaz)
```

---

## Fase 6 — Frontend: estructura base + diseño

### Tareas
- [ ] 6.1 Configurar Vite + React + TailwindCSS
- [ ] 6.2 Definir variables CSS globales (paleta de colores estilo moderno)
- [ ] 6.3 Configurar proxy en `vite.config.js` (`/api` → `localhost:3001`)
- [ ] 6.4 Crear `src/index.css` con estilos base
- [ ] 6.5 Crear layout principal en `App.jsx` (sidebar + main area)

### Paleta de colores (estilo moderno)

| Variable CSS | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#1a1a1a` | Fondo principal |
| `--bg-sidebar` | `#141414` | Fondo sidebar |
| `--bg-card` | `#2a2a2a` | Cards de material |
| `--bg-input` | `#242424` | Inputs y dropzone |
| `--accent` | `#c96442` | Botones, hover, selección activa |
| `--accent-hover` | `#e0714a` | Hover en botones primarios |
| `--text-primary` | `#e8e0d5` | Texto principal |
| `--text-secondary` | `#9b9589` | Texto secundario, labels |
| `--border` | `#333333` | Bordes sutiles |
| `--border-accent` | `#c96442` | Borde de elemento seleccionado |

### Layout general

```
┌────────────────────────────────────────────────────────────────┐
│  Header: Logo "Teacher Tool"       [Modelo ▼]  [Nueva sesión]  │
├───────────────┬────────────────────────────────────────────────┤
│               │                                                  │
│   Sidebar     │              Área principal                      │
│   260px fijo  │              flex-1                              │
│               │                                                  │
│   [Buscar]    │   Estado vacío → pantalla de carga              │
│               │   Con archivo  → configuración + generar        │
│   Hoy         │   Generando    → streaming visible              │
│   › sesión 1  │   Completado   → preview + descarga             │
│   › sesión 2  │                                                  │
│               │                                                  │
│   Ayer        │                                                  │
│   › sesión 3  │                                                  │
│               │                                                  │
└───────────────┴────────────────────────────────────────────────┘
```

---

## Fase 7 — Frontend: componentes principales

### Tareas
- [ ] 7.1 `Header.jsx` — logo, selector de modelo, botón nueva sesión, botón de configuración (abre SettingsModal)
- [ ] 7.2 `DropZone.jsx` — drag & drop con react-dropzone, preview del archivo
- [ ] 7.3 `MaterialSelector.jsx` — 6 cards de tipo de material con iconos lucide
- [ ] 7.4 `ExtraInstructions.jsx` — textarea con contador de caracteres
- [ ] 7.5 `ResultViewer.jsx` — área de preview del texto generado renderizado con `react-markdown`
- [ ] 7.6 `DownloadButton.jsx` — botón de descarga del DOCX
- [ ] 7.7 `SettingsModal.jsx` — modal con inputs para nombre del colegio y nombre del docente; guarda via `PUT /api/settings`
- [ ] 7.8 Componentes UI reutilizables: `Button.jsx`, `Spinner.jsx`, `Badge.jsx`

### Cards de material (iconos lucide-react)

| Card | Icono | Color badge |
|------|-------|-------------|
| Guía de estudio | `BookOpen` | azul |
| Ejercicios | `PenLine` | verde |
| Plan de clase | `CalendarDays` | morado |
| Adaptación por nivel | `BarChart2` | amarillo |
| Mapa conceptual | `GitBranch` | cian |
| Glosario | `BookMarked` | naranja |

---

## Fase 8 — Frontend: historial de sesiones (sidebar)

### Tareas
- [ ] 8.1 Crear `hooks/useSessions.js` — carga y refresca historial desde API
- [ ] 8.2 Crear `Sidebar.jsx` — lista agrupada por fecha (Hoy / Ayer / Esta semana / Anterior)
- [ ] 8.3 Crear `SessionItem.jsx` — ítem con título, tipo de material (badge), fecha relativa
- [ ] 8.4 Búsqueda en sidebar (filtra por título de archivo)
- [ ] 8.5 Click en sesión → carga resultado previo en el área principal
- [ ] 8.6 Botón eliminar sesión (con confirmación modal)
- [ ] 8.7 Indicador de sesión activa en sidebar

---

## Fase 9 — Frontend: streaming visible al generar

### Tareas
- [ ] 9.1 Crear `hooks/useGenerate.js` — maneja EventSource + estado de generación
- [ ] 9.2 Mostrar texto apareciendo en tiempo real (efecto "escribiendo")
- [ ] 9.3 Indicador de progreso visual durante la generación
- [ ] 9.4 Botón "Cancelar" durante la generación
- [ ] 9.5 Manejo de errores con mensaje amigable al usuario
- [ ] 9.6 Una vez completado: mostrar botón "Descargar DOCX" y "Nueva sesión"

---

## Fase 10 — Integración completa + pruebas

### Tareas
- [ ] 10.1 Prueba end-to-end con archivo PDF real
- [ ] 10.2 Prueba end-to-end con archivo DOCX real
- [ ] 10.3 Prueba end-to-end con archivo DOC (conversión LibreOffice)
- [ ] 10.4 Verificar que el DOCX generado abre correctamente en LibreOffice
- [ ] 10.5 Verificar historial: crear, leer, eliminar sesiones
- [ ] 10.6 Verificar cambio de modelo (Claude ↔ MiniMax)
- [ ] 10.7 Verificar comportamiento con archivo sin texto (PDF escaneado)
- [ ] 10.8 Crear `README.md` con instrucciones de arranque
- [ ] 10.9 Script de arranque único: `npm run dev`

---

## Tabla de tareas y responsables

| ID | Tarea | Descripción | Rol | Estado |
|----|-------|-------------|-----|-------|
| 1.1 | Crear `package.json` raíz | Definir scripts `dev`, `install:all`, `build` que orquestan backend y frontend en paralelo con `concurrently` | Programador | ✅ |
| 1.2 | Crear `backend/package.json` | Declarar dependencias Node.js del servidor: express, cors, multer, better-sqlite3, docx, uuid, dotenv | Programador | ✅ |
| 1.3 | Crear `frontend/package.json` | Declarar dependencias React + Vite + TailwindCSS + react-markdown + lucide-react + react-dropzone | FrontendDev | ✅ |
| 1.4 | Crear `.env.example` | Documentar todas las variables de entorno requeridas con valores de ejemplo y comentarios explicativos | DevOps | ✅ |
| 1.5 | Crear `.gitignore` | Excluir `node_modules`, `.env`, archivos SQLite, uploads y archivos generados del control de versiones | ExpertGit | ✅ |
| 1.6 | Instalar dependencias Python | Instalar `pdfplumber`, `pypdf`, `python-docx` en el entorno Python del sistema | Programador | ✅ |
| 1.7 | Instalar dependencias backend | Ejecutar `npm install` en `backend/` con todas las dependencias definidas | Programador | ✅ |
| 1.8 | Instalar dependencias frontend | Ejecutar `npm install` en `frontend/` con todas las dependencias definidas | FrontendDev | ✅ |
| 2.1 | Crear `backend/server.js` | Configurar Express en puerto 3001, habilitar CORS, registrar todas las rutas y arrancar el servidor | Programador | ✅ |
| 2.2 | Crear `backend/database/db.js` | Inicializar conexión SQLite con better-sqlite3, exportar instancia singleton reutilizable | ExpertSQL | ✅ |
| 2.3 | Crear `backend/database/migrations.js` | Crear tablas `sessions` y `config` con índices e insertar valores por defecto en primer arranque | ExpertSQL | ✅ |
| 2.4 | Crear rutas API | Implementar archivos `upload.js`, `generate.js`, `sessions.js` con todos los endpoints del plan | Programador | ✅ |
| 2.5 | Crear directorios de almacenamiento | Crear `backend/storage/uploads/` y `backend/storage/generated/` con permisos adecuados | DevOps | ✅ |
| 3.1 | Crear `extract_text.py` | Script Python que extrae texto de PDF (pdfplumber) y DOCX (python-docx), imprime JSON al stdout | Programador | ✅ |
| 3.2 | Crear `convert_doc.py` | Script Python que convierte `.doc` a `.docx` invocando LibreOffice headless y retorna la ruta del archivo convertido | Programador | ✅ |
| 3.3 | Crear `fileProcessor.js` | Módulo Node.js que orquesta la extracción según el tipo MIME, invoca los scripts Python como subprocesos | Programador | ✅ |
| 3.4 | Validar tipos de archivo | Rechazar con error 400 cualquier archivo que no sea `.pdf`, `.doc` o `.docx`; validar tanto extensión como MIME type | CyberSecurity | ✅ |
| 3.5 | Limpieza de uploads | Eliminar el archivo temporal de `uploads/` inmediatamente tras extraer el texto, sin esperar fin de sesión | Programador | ✅ |
| 3.6 | Manejo de PDFs escaneados | Detectar cuando pdfplumber no extrae texto y retornar error descriptivo al usuario con código 422 | Programador | ✅ |
| 4.1 | Crear `openrouter.js` | Cliente HTTP que llama a OpenRouter con fetch, maneja autenticación y re-transmite el stream SSE | Programador | ✅ |
| 4.2 | Crear `prompts.js` | Definir los 6 prompts de materiales con contexto de nivel secundaria, instrucciones de formato markdown | Programador | ✅ |
| 4.3 | Implementar `POST /api/generate` | Endpoint que recibe parámetros, construye el prompt, abre stream con OpenRouter y hace pipe SSE al cliente | Programador | ✅ |
| 4.4 | Consumo de stream en frontend | Implementar la lectura del stream en el cliente usando `fetch` + `ReadableStream` (no EventSource) | FrontendDev | ✅ |
| 4.5 | Manejo de errores de API | Capturar y responder rate limit (429), timeout, modelo no disponible con mensajes claros | CyberSecurity | ✅ |
| 4.6 | Cancelación limpia | Al abortar la generación, cerrar el stream y descartar la sesión sin escribir en SQLite | Programador | ✅ |
| 5.1 | Crear `create_docx.js` | Módulo que recibe texto markdown y tipo de material, y genera un archivo `.docx` usando la librería `docx` | Programador | ✅ |
| 5.2 | Parser markdown → DOCX | Parsear `##`, `**texto**` y `- item` del output de la IA para traducirlos a elementos Heading, Bold y List del DOCX | Programador | ✅ |
| 5.3 | Formato diferenciado por tipo | Implementar estructura visual específica para cada uno de los 6 tipos de material en el DOCX | Programador | ✅ |
| 5.4 | Header DOCX con config | Leer `school_name` y `teacher_name` desde la tabla `config` de SQLite e incluirlos en el encabezado del DOCX | ExpertSQL | ✅ |
| 5.5 | Footer DOCX | Agregar footer con número de página automático y fecha de generación en formato legible | Programador | ✅ |
| 5.6 | Guardar DOCX en storage | Escribir el archivo en `backend/storage/generated/{session_id}.docx` con manejo de errores de escritura | DevOps | ✅ |
| 5.7 | Actualizar SQLite con ruta DOCX | Ejecutar UPDATE en la tabla `sessions` para registrar el `docx_path` una vez generado el archivo | ExpertSQL | ✅ |
| 6.1 | Configurar Vite + React + Tailwind | Inicializar proyecto Vite con plugin React, configurar TailwindCSS con PostCSS y autoprefixer | FrontendDev | ✅ |
| 6.2 | Variables CSS globales | Definir la paleta de 10 colores en `:root` dentro de `index.css` siguiendo el estilo visual moderno | FrontendDev | ✅ |
| 6.3 | Proxy Vite → backend | Configurar en `vite.config.js` que las rutas `/api` se redirijan a `http://localhost:3001` en desarrollo | FrontendDev | ✅ |
| 6.4 | Estilos base `index.css` | Definir reset, tipografía base, scrollbar personalizado y clases utilitarias globales | FrontendDev | ✅ |
| 6.5 | Layout principal `App.jsx` | Implementar la estructura sidebar fijo (260px) + área principal flexible con sus estados de pantalla | FrontendDev | ✅ |
| 7.1 | Componente `Header.jsx` | Barra superior con logo, selector de modelo IA, botón nueva sesión y botón que abre el SettingsModal | FrontendDev | ✅ |
| 7.2 | Componente `DropZone.jsx` | Zona de arrastre con react-dropzone, visualización del archivo cargado y botón para cambiarlo | FrontendDev | ✅ |
| 7.3 | Componente `MaterialSelector.jsx` | Grid de 6 cards seleccionables con iconos lucide-react, estado activo resaltado con color acento | FrontendDev | ✅ |
| 7.4 | Componente `ExtraInstructions.jsx` | Textarea opcional con contador de caracteres visible y límite de 500 caracteres | FrontendDev | ✅ |
| 7.5 | Componente `ResultViewer.jsx` | Área de previsualización del output renderizado con `react-markdown`, tipografía legible y scroll propio | FrontendDev | ✅ |
| 7.6 | Componente `DownloadButton.jsx` | Botón que dispara la descarga del DOCX via `GET /api/sessions/:id/download`, con estado de carga | FrontendDev | ✅ |
| 7.7 | Componente `SettingsModal.jsx` | Modal con inputs para nombre del colegio y docente; lee configuración actual y guarda via `PUT /api/settings` | FrontendDev | ✅ |
| 7.8 | Componentes UI reutilizables | Crear `Button.jsx`, `Spinner.jsx` y `Badge.jsx` con variantes de estilo coherentes con la paleta | FrontendDev | ✅ |
| 8.1 | Hook `useSessions.js` | Custom hook que carga el historial paginado, expone funciones de refresh, delete y selección de sesión | FrontendDev | ✅ |
| 8.2 | Componente `Sidebar.jsx` | Lista del historial agrupada por fecha (Hoy / Ayer / Esta semana / Anterior) con buscador integrado | FrontendDev | ✅ |
| 8.3 | Componente `SessionItem.jsx` | Ítem de sesión con título del archivo, badge de tipo de material, fecha relativa y botón de eliminar | FrontendDev | ✅ |
| 8.4 | Búsqueda en sidebar | Filtrar sesiones en tiempo real por nombre de archivo al escribir en el campo de búsqueda | FrontendDev | ✅ |
| 8.5 | Click para cargar sesión | Al seleccionar una sesión, cargar su `output_text` en el ResultViewer y marcarla como activa en sidebar | FrontendDev | ✅ |
| 8.6 | Eliminar sesión con confirmación | Modal de confirmación antes de llamar a `DELETE /api/sessions/:id`; actualizar lista tras eliminar | FrontendDev | ✅ |
| 8.7 | Indicador de sesión activa | Resaltar visualmente en el sidebar la sesión actualmente cargada en el área principal | FrontendDev | ✅ |
| 9.1 | Hook `useGenerate.js` | Custom hook que gestiona el ciclo de generación: inicio, recepción de chunks, cancelación y finalización | FrontendDev | ✅ |
| 9.2 | Streaming visible en UI | Mostrar los chunks de texto conforme llegan, acumulando el contenido con efecto de escritura progresiva | FrontendDev | ✅ |
| 9.3 | Indicador de progreso | Mostrar spinner o barra de progreso animada mientras la generación está en curso | FrontendDev | ✅ |
| 9.4 | Botón cancelar generación | Abortar el fetch en curso con `AbortController`, limpiar el estado y volver a pantalla de configuración | FrontendDev | ✅ |
| 9.5 | Manejo de errores en UI | Mostrar mensajes de error amigables ante fallos de API, timeout o archivo inválido | FrontendDev | ✅ |
| 9.6 | Acciones post-generación | Al finalizar, mostrar botones "Descargar DOCX" y "Nueva sesión", y actualizar el historial en sidebar | FrontendDev | ✅ |
| 10.1 | Prueba E2E con PDF | Verificar flujo completo: subir PDF → seleccionar material → generar → descargar DOCX | QA | ✅ |
| 10.2 | Prueba E2E con DOCX | Verificar flujo completo con archivo .docx como entrada | QA | ✅ |
| 10.3 | Prueba E2E con DOC | Verificar conversión LibreOffice y flujo completo con archivo .doc como entrada | QA | ✅ |
| 10.4 | Verificar DOCX generado | Abrir el DOCX resultante en LibreOffice y validar formato, header, footer y contenido estructurado | QA | ✅ |
| 10.5 | Pruebas de historial CRUD | Crear sesiones, listarlas, cargarlas al hacer click y eliminarlas; verificar persistencia en SQLite | QA | ✅ |
| 10.6 | Prueba cambio de modelo | Cambiar entre DeepSeek V3.2 y MiniMax 2.7 y verificar que ambos generan correctamente | QA | ✅ |
| 10.7 | Prueba PDF escaneado | Subir un PDF sin texto seleccionable y verificar que el error llega limpiamente a la UI | QA | ✅ |
| 10.8 | Crear `README.md` | Documentar requisitos del sistema, pasos de instalación, configuración del `.env` y comandos de arranque | ProjectManager | ✅ |
| 10.9 | Script de arranque único | Verificar que `npm run dev` levanta backend y frontend en paralelo y ambos están operativos | DevOps | ✅ |
| 11.1 | Eventos SSE de progreso en backend | Agregar evento `progress` al stream SSE en `generate.js` con tipo, porcentaje y mensaje de estado | Programador | ⬜ |
| 11.2 | Mensajes de estado dinámicos | Crear mapa de mensajes por etapa: 0-10% Analizando, 30-50% Generando, 70-90% Finalizando, etc. | Programador | ⬜ |
| 11.3 | Componente `ProgressBar.jsx` | Crear componente visual con barra de progreso animada, porcentaje y mensaje de estado | FrontendDev | ⬜ |
| 11.4 | Integrar ProgressBar en App.jsx | Conectar eventos SSE de progreso al componente ProgressBar durante la generación | FrontendDev | ⬜ |
| 11.5 | Animación de "pensando" pre-generación | Mostrar pulso/spinner antes de recibir el primer chunk (latencia inicial del modelo) | FrontendDev | ⬜ |
| 11.6 | Prueba con todos los modelos | Verificar que el indicador funciona con DeepSeek, MiniMax, Gemma, Qwen y Granite | QA | ⬜ |

---

## Fase 11 — Indicador de progreso + mensajes de estado

### Objetivo
Proporcionar al usuario retroalimentación visual en tiempo real durante la generación de materiales, mostrando una barra de progreso animada y mensajes de estado descriptivos que indiquen en qué etapa del proceso se encuentra el modelo.

### Contexto técnico

El backend ya usa **SSE (Server-Sent Events)** para enviar chunks de texto al frontend. La estrategia consiste en agregar un nuevo tipo de evento `progress` al stream SSE, paralelo al evento `content` existente.

```
Stream SSE actual:
  data: {"content": "## Guía..."}  →  frontend acumula texto

Stream SSE propuesto:
  data: {"type": "progress", "progress": 25, "message": "Generando estructura..."}
  data: {"type": "content", "content": "## Guía..."}
  data: {"type": "done", "sessionId": "xxx"}
```

### Estimación de progreso

El porcentaje se estima en base a **chunks recibidos vs estimado** según tipo de material:

| Tipo de material | Tokens estimados | Porcentaje por chunk |
|-----------------|-----------------|----------------------|
| Guía de Estudio | ~1500 tokens | 0.07% por chunk |
| Ejercicios | ~1200 tokens | 0.08% por chunk |
| Plan de Clase | ~1000 tokens | 0.10% por chunk |
| Niveles | ~1800 tokens | 0.05% por chunk |
| Mapa Conceptual | ~800 tokens | 0.12% por chunk |
| Glosario | ~700 tokens | 0.14% por chunk |

### Mensajes de estado por etapa

| Progreso | Mensaje |
|----------|---------|
| 0% | Conectando con el modelo... |
| 1-10% | Analizando contenido del documento... |
| 10-30% | Identificando conceptos clave... |
| 30-50% | Generando estructura del material... |
| 50-70% | Creando contenido y ejemplos... |
| 70-90% | Finalizando el material... |
| 90-99% | Generando documento DOCX... |
| 100% | ¡Material generado con éxito! |

### Tareas

| ID | Tarea | Descripción | Archivos | Encargado | Estado |
|----|-------|-------------|---------|----------|--------|
| 11.1 | Eventos SSE de progreso | Agregar evento `progress` al stream SSE en `generate.js` con tipo, porcentaje y mensaje | `backend/routes/generate.js` | Programador | ✅ |
| 11.2 | Mensajes de estado dinámicos | Crear mapa de mensajes por etapa y función que calcule porcentaje según chunks recibidos | `backend/routes/generate.js` | Programador | ✅ |
| 11.3 | Componente `ProgressBar.jsx` | Crear componente visual con barra animada, porcentaje numérico y mensaje de estado | `frontend/src/components/ProgressBar.jsx` | FrontendDev | ✅ |
| 11.4 | Integrar ProgressBar en App.jsx | Conectar eventos `progress` del SSE al estado del componente ProgressBar | `frontend/src/App.jsx` | FrontendDev | ✅ |
| 11.5 | Animación pre-generación | Mostrar pulso/spinner antes del primer chunk (latencia inicial del modelo) | `frontend/src/App.jsx` | FrontendDev | ✅ |
| 11.6 | Prueba con todos los modelos | Verificar que el indicador funciona con DeepSeek, MiniMax, Gemma, Qwen y Granite | — | QA | ✅ |

### Diseño visual propuesto

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   🤖  Generando material con DeepSeek V3.2            │
│                                                            │
│   Identificando conceptos clave...                         │
│                                                            │
│   ████████████████░░░░░░░░░░░░░░░░░░░░░  42%              │
│                                                            │
│                              [ Cancelar ]                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

| Decisión | Elección | Motivo |
|----------|----------|--------|
| Base de datos | SQLite (better-sqlite3) | Persistencia local sin servidor extra |
| Streaming backend→frontend | Server-Sent Events (SSE) | Simple en Express, pipe directo desde OpenRouter |
| Streaming frontend (consumo) | `fetch` + `ReadableStream` | `EventSource` nativo solo soporta GET; `fetch` permite POST con body JSON |
| Generación DOCX | librería `docx` (npm) | Soporte completo de formato Word |
| Parseo markdown → DOCX | Parser propio mínimo (regex) | Evitar dependencia pesada; el formato de salida es controlado por el prompt |
| Extracción PDF | pdfplumber (Python) | Mejor extracción de texto + tablas |
| Conversión DOC | LibreOffice headless | Ya instalado en el sistema |
| Frontend | React + Vite + Tailwind | Rapidez de desarrollo + rendimiento |
| Render markdown en UI | `react-markdown` | Muestra el output formateado con headings, listas y negritas |
| Configuración DOCX header | Tabla `config` en SQLite + `SettingsModal` en UI | El docente configura nombre una vez; persiste entre sesiones |
| Límite de upload | 10 MB (multer) | Cubre documentos de clase estándar sin riesgo de memoria |
| Paginación historial | Offset-based, page size 20 | Simple de implementar con SQLite LIMIT/OFFSET |
| Cancelación de generación | Sesión descartada (no se guarda) | Evita sesiones parciales o corruptas en el historial |
| PDFs sin texto | Error descriptivo al usuario | Guía al docente a usar un PDF con texto seleccionable |
| API IA | OpenRouter | Permite usar DeepSeek y MiniMax con una sola key |
| Puerto backend | 3001 | No conflicto con otros servicios |
| Puerto frontend | 5173 | Default de Vite |

---

## Variables de entorno

```bash
# .env (backend)
OPENROUTER_API_KEY=   # Leída del entorno del sistema (ya configurada)
PORT=3001
DB_PATH=./database/teacher_tool.db
STORAGE_PATH=./storage
LIBREOFFICE_PATH=/usr/bin/libreoffice
```

---

## Comandos de arranque

```bash
# Desde /home/dw/workspace/teacher-tool/

# Primera vez: instalar dependencias
npm run install:all

# Desarrollo (inicia backend + frontend en paralelo)
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend

# Build de producción del frontend
npm run build
```

---

## Registro de cambios

| Fecha | Fase | Descripción | Estado |
|-------|------|-------------|--------|
| 2026-04-09 | — | Plan inicial creado | ✅ |
| 2026-04-09 | — | Decisiones técnicas complementarias agregadas | ✅ |
| 2026-04-09 | 1-4 | Fases 1-4 completadas (config, servidor, archivos, IA streaming) | ✅ |
| 2026-04-09 | 5.1-5.2 | Fase 5 iniciada: create_docx.js + parser markdown → DOCX | ✅ |
| 2026-04-12 | 5.7 | Fase 5 completada: integración DOCX con ruta generate.js | ✅ |
| 2026-04-12 | 6 | Fase 6 completada: estructura base Vite + React + Tailwind | ✅ |
| 2026-04-12 | 7 | Fase 7 completada: componentes principales | ✅ |
| 2026-04-12 | 8 | Fase 8 completada: historial sesiones (Sidebar) | ✅ |
| 2026-04-12 | 9 | Fase 9 completada: streaming visible en generar | ✅ |
| 2026-04-12 | 10 | Fase 10 completada: pruebas E2E (10.1-10.7) | ✅ |
| 2026-04-12 | 11 | Fase 11 completada: indicador de progreso + mensajes de estado | ✅ |

---

## Notas

- El nivel educativo de los alumnos es **secundaria** — todos los prompts deben ajustarse a este nivel.
- El modelo predeterminado es **DeepSeek V3.2** (`deepseek/deepseek-v3.2`).
- MiniMax 2.7 está disponible como alternativa en la nube.
- **Modelos locales Ollama:** Gemma 3 (1B), Qwen 3.5 (2B), Granite 4 (3B) disponibles si Ollama está instalado.
- LibreOffice 24.2.7.2 está instalado en `/usr/bin/libreoffice`.
- Python 3.12.3 y Node.js 24.9.0 disponibles en el sistema.
- La `OPENROUTER_API_KEY` ya está configurada como variable de entorno del sistema.

# Teacher Tool — Plan de Desarrollo

> Herramienta web local para docentes de secundaria que genera materiales de estudio a partir de documentos PDF/DOC/DOCX usando IA (DeepSeek V3.2 / MiniMax 2.7 via OpenRouter + modelos locales Ollama).

---

## Estado general

| Fase | Descripción                                         | Estado             |
| ---- | --------------------------------------------------- | ------------------ |
| 1    | Estructura del proyecto y configuración             | ✅ Completado      |
| 2    | Backend: servidor Express + SQLite                  | ✅ Completado      |
| 3    | Backend: procesamiento de archivos                  | ✅ Completado      |
| 4    | Backend: integración OpenRouter (streaming)         | ✅ Completado      |
| 5    | Backend: generación de archivos DOCX                | ✅ Completado      |
| 6    | Frontend: estructura base + diseño (estilo moderno) | ✅ Completado      |
| 7    | Frontend: componentes principales                   | ✅ Completado      |
| 8    | Frontend: historial de sesiones (sidebar)           | ✅ Completado      |
| 9    | Frontend: streaming visible al generar              | ✅ Completado      |
| 10   | Integración completa + pruebas                      | ✅ Completado      |
| 11   | Indicador de progreso + mensajes de estado          | ✅ Completado      |
| 12   | Scripts de instalación y ejecución                  | ✅ Completado      |
| 13   | Examen de selección única (nueva funcionalidad)     | ✅ Completado      |
| 14   | **Mejoras de calidad y optimización**               | ⏳ **En progreso** |

---

## Fase 14 — Mejoras de calidad y optimización

### **Objetivo**

Implementar mejoras críticas identificadas en el plan de QA (76% completado, 61/80 pruebas) para elevar la calidad, confiabilidad y rendimiento del sistema Teacher Tool.

### **Contexto**

Basado en los resultados del plan de QA ejecutado el 15/04/2026:

- **Cobertura total:** 76% (61/80 pruebas)
- **Pruebas omitidas:** 25 (31% del plan)
- **Áreas críticas:** Generación con IA (0% probada), UI interactiva (41% no probada)
- **Problemas identificados:** Timeouts en generaciones largas, falta de pruebas de navegador, dependencia crítica de servicios externos

### **Estrategia de implementación por fases**

#### **FASE 14.1: CRÍTICO (1-2 semanas)**

**Objetivo:** Resolver problemas de alta prioridad identificados en QA

| ID     | Tarea                                 | Descripción                                                                              | Archivos                     | Encargado     | Estado |
| ------ | ------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------- | ------------- | ------ |
| 14.1.1 | Ejecutar pruebas de generación con IA | Ejecutar las 16 pruebas de generación omitidas (API-03 a API-17) con timeouts extendidos | `test-ai-generation.sh`      | QA            | ⬜     |
| 14.1.2 | Implementar timeout configurables     | Timeouts específicos por tipo de material en backend                                     | `backend/routes/generate.js` | Programador   | ⬜     |
| 14.1.3 | Validación estricta de archivos       | Mejorar validación de tamaño, tipo y contenido de archivos                               | `backend/routes/upload.js`   | CyberSecurity | ⬜     |
| 14.1.4 | Sistema de backup automático          | Backup diario de base de datos SQLite                                                    | `scripts/backup.sh`          | DevOps        | ⬜     |
| 14.1.5 | Manejo robusto de errores             | Mejorar mensajes de error y logging en generaciones fallidas                             | `backend/routes/generate.js` | Programador   | ⬜     |

#### **FASE 14.2: ALTA (2-4 semanas)**

**Objetivo:** Mejorar experiencia de usuario y resiliencia

| ID     | Tarea                               | Descripción                                                   | Archivos                         | Encargado   | Estado |
| ------ | ----------------------------------- | ------------------------------------------------------------- | -------------------------------- | ----------- | ------ |
| 14.2.1 | Pruebas E2E con Playwright          | Configurar Playwright para pruebas de navegador automatizadas | `tests/e2e/`                     | QA          | ⬜     |
| 14.2.2 | Circuit breaker para OpenRouter     | Implementar patrón circuit breaker para servicios externos    | `backend/utils/openrouter.js`    | Programador | ⬜     |
| 14.2.3 | Optimizar procesamiento de archivos | Mejorar performance para archivos grandes (>5MB)              | `backend/utils/fileProcessor.js` | Programador | ⬜     |
| 14.2.4 | Queue de generaciones               | Implementar sistema de colas para generaciones concurrentes   | `backend/utils/queue.js`         | Programador | ⬜     |
| 14.2.5 | Mejorar accesibilidad UI            | Validar y mejorar accesibilidad en componentes frontend       | `frontend/src/components/`       | FrontendDev | ⬜     |

#### **FASE 14.3: MEDIA (4-8 semanas)**

**Objetivo:** Optimizar rendimiento y escalabilidad

| ID     | Tarea                        | Descripción                                       | Archivos                    | Encargado   | Estado |
| ------ | ---------------------------- | ------------------------------------------------- | --------------------------- | ----------- | ------ |
| 14.3.1 | Soporte para modelos locales | Mejorar integración con Ollama y modelos locales  | `backend/utils/ollama.js`   | Programador | ⬜     |
| 14.3.2 | Caché de prompts/respuestas  | Implementar caché para respuestas similares       | `backend/utils/cache.js`    | Programador | ⬜     |
| 14.3.3 | Logs estructurados           | Mejorar sistema de logs para análisis y debugging | `backend/utils/logger.js`   | DevOps      | ⬜     |
| 14.3.4 | Métricas de performance      | Dashboard con métricas clave del sistema          | `backend/routes/metrics.js` | DevOps      | ⬜     |
| 14.3.5 | Pruebas de carga             | Validar performance bajo carga concurrente        | `tests/load/`               | QA          | ⬜     |

#### **FASE 14.4: BAJA (8+ semanas)**

**Objetivo:** Modernizar arquitectura y procesos

| ID     | Tarea                         | Descripción                                   | Archivos             | Encargado   | Estado |
| ------ | ----------------------------- | --------------------------------------------- | -------------------- | ----------- | ------ |
| 14.4.1 | Refactorizar a microservicios | Separar servicios: upload, generate, sessions | `services/`          | Arquitecto  | ⬜     |
| 14.4.2 | CI/CD completo                | Pipeline automatizado de testing y despliegue | `.github/workflows/` | DevOps      | ⬜     |
| 14.4.3 | Internacionalización          | Soporte para múltiples idiomas en UI          | `frontend/src/i18n/` | FrontendDev | ⬜     |
| 14.4.4 | Documentación API completa    | Documentación OpenAPI/Swagger                 | `docs/api/`          | Tech Writer | ⬜     |
| 14.4.5 | Monitoreo avanzado            | Integración con herramientas de monitoreo     | `monitoring/`        | DevOps      | ⬜     |

### **Detalles técnicos por área**

#### **Backend API (36% → 95% cobertura)**

1. **Timeout configurables:**

   ```javascript
   // En backend/routes/generate.js
   const GENERATION_TIMEOUTS = {
     guia: 30000, // 30s
     ejercicios: 45000, // 45s
     examen_seleccion: 60000, // 60s
     plan_clase: 35000, // 35s
     mapa: 25000, // 25s
     glosario: 20000, // 20s
   };
   ```

2. **Circuit breaker pattern:**
   - Estado: CLOSED, OPEN, HALF_OPEN
   - Fallback a modelos locales cuando OpenRouter falle
   - Métricas de disponibilidad por proveedor

3. **Queue de generaciones:**
   - Máximo 3 generaciones concurrentes
   - Prioridad por tipo de material
   - Timeout global por generación

#### **Frontend UI (59% → 95% cobertura)**

1. **Configuración Playwright:**

   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Pruebas de navegador:**
   - Tests para drag-and-drop de archivos
   - Validación de formularios en tiempo real
   - Estados de carga y error
   - Responsive design en múltiples viewports

3. **Mejoras de accesibilidad:**
   - Validar ARIA labels en todos los componentes
   - Navegación por teclado completa
   - Contraste de colores WCAG AA compliant

#### **Infraestructura (100% → 100% con mejoras)**

1. **Monitoreo mejorado:**
   - Health checks para servicios externos (OpenRouter, LibreOffice)
   - Métricas de uso de CPU/memoria/disk
   - Alertas para fallos críticos (Slack/Email)

2. **Backup y recuperación:**
   - Backup automático diario de SQLite
   - Script de restauración paso a paso
   - Pruebas de recuperación de desastres mensuales

3. **CI/CD pipeline:**
   - Tests unitarios en cada commit
   - Tests E2E en pull requests
   - Despliegue automático a staging
   - Despliegue manual a producción

### **Métricas de seguimiento**

| Métrica                      | Línea Base   | Objetivo Fase 14.1 | Objetivo Fase 14.2 | Objetivo Final |
| ---------------------------- | ------------ | ------------------ | ------------------ | -------------- |
| **Cobertura de pruebas**     | 76%          | 85%                | 92%                | 95%+           |
| **Tiempo generación (guía)** | ~10s         | < 25s              | < 20s              | < 15s          |
| **Disponibilidad API**       | No medida    | 98%                | 99%                | 99.5%          |
| **Tasa de error generación** | 0% (muestra) | < 5%               | < 2%               | < 1%           |
| **Uso memoria pico**         | ~108MB       | < 150MB            | < 130MB            | < 120MB        |
| **Tiempo respuesta UI**      | No medida    | < 100ms            | < 50ms             | < 30ms         |

### **Riesgos identificados y mitigación**

| Riesgo                             | Impacto | Probabilidad | Mitigación                                         |
| ---------------------------------- | ------- | ------------ | -------------------------------------------------- |
| **Timeout en generaciones largas** | Alto    | Alta         | Timeouts configurables, queue de procesamiento     |
| **Dependencia de OpenRouter**      | Alto    | Media        | Circuit breaker, modelos locales de fallback       |
| **Falta de pruebas UI reales**     | Medio   | Alta         | Playwright/Cypress, pruebas automatizadas          |
| **Archivos maliciosos**            | Medio   | Baja         | Validación estricta, sandboxing, límites de tamaño |
| **Pérdida de datos**               | Alto    | Baja         | Backup automático, recovery testing, replicación   |
| **Performance bajo carga**         | Medio   | Media        | Queue de generaciones, límites de concurrencia     |
| **Compatibilidad navegadores**     | Bajo    | Media        | Testing cross-browser, polyfills necesarios        |

### **Checklist de implementación**

#### **Semana 1-2 (Crítico)**

- [ ] Ejecutar `test-ai-generation.sh` con timeouts extendidos (60s)
- [ ] Analizar logs de errores de timeout en generaciones
- [ ] Implementar timeout configurables en `generate.js`
- [ ] Agregar validación de tamaño máximo de archivos (configurable)
- [ ] Configurar backup automático de SQLite
- [ ] Mejorar mensajes de error para usuarios

#### **Semana 3-4 (Alta)**

- [ ] Instalar y configurar Playwright
- [ ] Crear 10+ pruebas de navegador críticas
- [ ] Implementar circuit breaker para OpenRouter
- [ ] Optimizar procesamiento de PDFs grandes
- [ ] Diseñar e implementar queue de generaciones
- [ ] Validar accesibilidad de componentes UI

#### **Semana 5-8 (Media)**

- [ ] Mejorar integración con Ollama (modelos locales)
- [ ] Implementar caché de prompts/respuestas
- [ ] Configurar logs estructurados (JSON format)
- [ ] Crear dashboard de métricas básico
- [ ] Ejecutar pruebas de carga básicas
- [ ] Documentar API con OpenAPI/Swagger

#### **Semana 9+ (Baja)**

- [ ] Diseñar arquitectura de microservicios
- [ ] Implementar pipeline CI/CD completo
- [ ] Agregar soporte para internacionalización
- [ ] Integrar con herramientas de monitoreo (Prometheus/Grafana)
- [ ] Crear documentación completa para desarrolladores

### **Criterios de éxito**

La Fase 14 se considerará exitosa cuando:

1. ✅ **95%+ cobertura de pruebas** (76/80 pruebas ejecutadas)
2. ✅ **< 1% tasa de error** en generaciones de materiales
3. ✅ **< 30s tiempo máximo** para cualquier generación
4. ✅ **100% pruebas UI automatizadas** con Playwright
5. ✅ **Sistema de backup funcionando** con recovery testing
6. ✅ **Dashboard de métricas** con datos en tiempo real
7. ✅ **Documentación completa** de API y troubleshooting
8. ✅ **Circuit breaker implementado** para servicios externos
9. ✅ **Queue de generaciones** funcionando con límites de concurrencia
10. ✅ **Logs estructurados** para análisis y debugging

### **Recursos requeridos**

| Recurso                 | Cantidad         | Duración      | Justificación                        |
| ----------------------- | ---------------- | ------------- | ------------------------------------ |
| **Programador Backend** | 1                | 8 semanas     | Implementación de mejoras críticas   |
| **Frontend Developer**  | 1                | 4 semanas     | Pruebas de navegador y accesibilidad |
| **QA Engineer**         | 1                | 6 semanas     | Ejecución de pruebas y validación    |
| **DevOps Engineer**     | 0.5              | 4 semanas     | Infraestructura y monitoreo          |
| **Total esfuerzo**      | **3.5 personas** | **8 semanas** |                                      |

### **Consideraciones técnicas**

1. **Compatibilidad con versiones anteriores:** Todas las mejoras deben mantener compatibilidad con la API existente
2. **Performance:** No degradar performance actual en ningún escenario
3. **Seguridad:** Mantener o mejorar medidas de seguridad existentes
4. **Usabilidad:** Mejoras no deben complicar la experiencia de usuario
5. **Mantenibilidad:** Código debe ser fácil de mantener y extender

### **Próximos pasos inmediatos**

1. **Prioridad 1:** Ejecutar pruebas de generación con IA omitidas para identificar bottlenecks reales
2. **Prioridad 2:** Implementar timeout configurables para prevenir bloqueos en generaciones largas
3. **Prioridad 3:** Configurar Playwright para pruebas de navegador básicas
4. **Prioridad 4:** Crear sistema de backup automático de base de datos

### **Scripts de testing creados**

Como parte del plan de QA, se han creado los siguientes scripts automatizados:

| Script               | Descripción                       | Pruebas cubiertas         |
| -------------------- | --------------------------------- | ------------------------- |
| `test-infra.sh`      | Pruebas de infraestructura        | INF-01 a INF-08           |
| `test-api.sh`        | Pruebas de API backend            | API-01 a API-25 (parcial) |
| `test-ui.sh`         | Pruebas de validación de frontend | UI-01 a UI-28 (parcial)   |
| `test-e2e-simple.sh` | Pruebas E2E simplificadas         | E2E-01 a E2E-08 (parcial) |
| `test-errors.sh`     | Pruebas de manejo de errores      | ERR-01 a ERR-07           |
| `test-perf.sh`       | Pruebas de rendimiento            | PERF-01 a PERF-04         |
| `test-phase13.sh`    | Pruebas de calidad de contenido   | QUAL-01 a QUAL-11         |

**Uso recomendado:**

```bash
# Ejecutar todas las pruebas (excepto generación con IA)
./test-infra.sh
./test-api.sh
./test-ui.sh
./test-e2e-simple.sh
./test-errors.sh
./test-perf.sh
```

**Para pruebas de generación con IA (requiere tiempo):**

```bash
# Ejecutar con timeout extendido
timeout 300 ./test-phase13.sh  # 5 minutos máximo
```

---

**Nota:** Esta fase se basa en los resultados del plan de QA ejecutado el 15/04/2026 que identificó brechas críticas en cobertura de pruebas, problemas de performance y oportunidades de mejora en la arquitectura del sistema.

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

| Método   | Endpoint                     | Descripción                                                    |
| -------- | ---------------------------- | -------------------------------------------------------------- |
| `POST`   | `/api/upload`                | Sube archivo (max 10 MB), retorna texto extraído               |
| `POST`   | `/api/generate`              | Genera material — SSE streaming via `fetch` + `ReadableStream` |
| `GET`    | `/api/sessions`              | Lista historial (paginado, page size: 20, offset-based)        |
| `GET`    | `/api/sessions/:id`          | Detalle de sesión                                              |
| `GET`    | `/api/sessions/:id/download` | Descarga DOCX generado                                         |
| `DELETE` | `/api/sessions/:id`          | Elimina sesión y su archivo DOCX asociado                      |
| `GET`    | `/api/settings`              | Lee configuración global (nombre colegio, docente)             |
| `PUT`    | `/api/settings`              | Actualiza configuración global                                 |

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

| Nombre visible | ID OpenRouter            | Estado        |
| -------------- | ------------------------ | ------------- |
| DeepSeek V3.2  | `deepseek/deepseek-v3.2` | ✅ Activo     |
| MiniMax 2.7    | `minimax/minimax-01`     | ✅ Disponible |

### Configuración OpenRouter

```
URL base:    https://openrouter.ai/api/v1
Auth:        Bearer $OPENROUTER_API_KEY
Endpoint:    /chat/completions
Streaming:   stream: true
```

### Prompts por tipo de material (nivel secundaria)

| Tipo                    | `material_type` | Enfoque del prompt                                       |
| ----------------------- | --------------- | -------------------------------------------------------- |
| Guía de estudio         | `guia`          | Resumen jerárquico, conceptos clave, ejemplos accesibles |
| Ejercicios y evaluación | `ejercicios`    | 5 opción múltiple + 3 V/F + 2 desarrollo corto           |
| Plan de clase           | `plan_clase`    | Inicio/desarrollo/cierre, 50 min, objetivos SMART        |
| Adaptación por nivel    | `niveles`       | Versión básica, estándar y avanzada                      |
| Mapa conceptual         | `mapa`          | Jerarquía en formato tabla/texto estructurado            |
| Glosario de términos    | `glosario`      | 10-15 definiciones en lenguaje adolescente               |

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

| Variable CSS       | Valor     | Uso                              |
| ------------------ | --------- | -------------------------------- |
| `--bg-primary`     | `#1a1a1a` | Fondo principal                  |
| `--bg-sidebar`     | `#141414` | Fondo sidebar                    |
| `--bg-card`        | `#2a2a2a` | Cards de material                |
| `--bg-input`       | `#242424` | Inputs y dropzone                |
| `--accent`         | `#c96442` | Botones, hover, selección activa |
| `--accent-hover`   | `#e0714a` | Hover en botones primarios       |
| `--text-primary`   | `#e8e0d5` | Texto principal                  |
| `--text-secondary` | `#9b9589` | Texto secundario, labels         |
| `--border`         | `#333333` | Bordes sutiles                   |
| `--border-accent`  | `#c96442` | Borde de elemento seleccionado   |

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

| Card                 | Icono          | Color badge |
| -------------------- | -------------- | ----------- |
| Guía de estudio      | `BookOpen`     | azul        |
| Ejercicios           | `PenLine`      | verde       |
| Plan de clase        | `CalendarDays` | morado      |
| Adaptación por nivel | `BarChart2`    | amarillo    |
| Mapa conceptual      | `GitBranch`    | cian        |
| Glosario             | `BookMarked`   | naranja     |

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

| ID   | Tarea                                  | Descripción                                                                                                          | Rol            | Estado |
| ---- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------- | ------ |
| 1.1  | Crear `package.json` raíz              | Definir scripts `dev`, `install:all`, `build` que orquestan backend y frontend en paralelo con `concurrently`        | Programador    | ✅     |
| 1.2  | Crear `backend/package.json`           | Declarar dependencias Node.js del servidor: express, cors, multer, better-sqlite3, docx, uuid, dotenv                | Programador    | ✅     |
| 1.3  | Crear `frontend/package.json`          | Declarar dependencias React + Vite + TailwindCSS + react-markdown + lucide-react + react-dropzone                    | FrontendDev    | ✅     |
| 1.4  | Crear `.env.example`                   | Documentar todas las variables de entorno requeridas con valores de ejemplo y comentarios explicativos               | DevOps         | ✅     |
| 1.5  | Crear `.gitignore`                     | Excluir `node_modules`, `.env`, archivos SQLite, uploads y archivos generados del control de versiones               | ExpertGit      | ✅     |
| 1.6  | Instalar dependencias Python           | Instalar `pdfplumber`, `pypdf`, `python-docx` en el entorno Python del sistema                                       | Programador    | ✅     |
| 1.7  | Instalar dependencias backend          | Ejecutar `npm install` en `backend/` con todas las dependencias definidas                                            | Programador    | ✅     |
| 1.8  | Instalar dependencias frontend         | Ejecutar `npm install` en `frontend/` con todas las dependencias definidas                                           | FrontendDev    | ✅     |
| 2.1  | Crear `backend/server.js`              | Configurar Express en puerto 3001, habilitar CORS, registrar todas las rutas y arrancar el servidor                  | Programador    | ✅     |
| 2.2  | Crear `backend/database/db.js`         | Inicializar conexión SQLite con better-sqlite3, exportar instancia singleton reutilizable                            | ExpertSQL      | ✅     |
| 2.3  | Crear `backend/database/migrations.js` | Crear tablas `sessions` y `config` con índices e insertar valores por defecto en primer arranque                     | ExpertSQL      | ✅     |
| 2.4  | Crear rutas API                        | Implementar archivos `upload.js`, `generate.js`, `sessions.js` con todos los endpoints del plan                      | Programador    | ✅     |
| 2.5  | Crear directorios de almacenamiento    | Crear `backend/storage/uploads/` y `backend/storage/generated/` con permisos adecuados                               | DevOps         | ✅     |
| 3.1  | Crear `extract_text.py`                | Script Python que extrae texto de PDF (pdfplumber) y DOCX (python-docx), imprime JSON al stdout                      | Programador    | ✅     |
| 3.2  | Crear `convert_doc.py`                 | Script Python que convierte `.doc` a `.docx` invocando LibreOffice headless y retorna la ruta del archivo convertido | Programador    | ✅     |
| 3.3  | Crear `fileProcessor.js`               | Módulo Node.js que orquesta la extracción según el tipo MIME, invoca los scripts Python como subprocesos             | Programador    | ✅     |
| 3.4  | Validar tipos de archivo               | Rechazar con error 400 cualquier archivo que no sea `.pdf`, `.doc` o `.docx`; validar tanto extensión como MIME type | CyberSecurity  | ✅     |
| 3.5  | Limpieza de uploads                    | Eliminar el archivo temporal de `uploads/` inmediatamente tras extraer el texto, sin esperar fin de sesión           | Programador    | ✅     |
| 3.6  | Manejo de PDFs escaneados              | Detectar cuando pdfplumber no extrae texto y retornar error descriptivo al usuario con código 422                    | Programador    | ✅     |
| 4.1  | Crear `openrouter.js`                  | Cliente HTTP que llama a OpenRouter con fetch, maneja autenticación y re-transmite el stream SSE                     | Programador    | ✅     |
| 4.2  | Crear `prompts.js`                     | Definir los 6 prompts de materiales con contexto de nivel secundaria, instrucciones de formato markdown              | Programador    | ✅     |
| 4.3  | Implementar `POST /api/generate`       | Endpoint que recibe parámetros, construye el prompt, abre stream con OpenRouter y hace pipe SSE al cliente           | Programador    | ✅     |
| 4.4  | Consumo de stream en frontend          | Implementar la lectura del stream en el cliente usando `fetch` + `ReadableStream` (no EventSource)                   | FrontendDev    | ✅     |
| 4.5  | Manejo de errores de API               | Capturar y responder rate limit (429), timeout, modelo no disponible con mensajes claros                             | CyberSecurity  | ✅     |
| 4.6  | Cancelación limpia                     | Al abortar la generación, cerrar el stream y descartar la sesión sin escribir en SQLite                              | Programador    | ✅     |
| 5.1  | Crear `create_docx.js`                 | Módulo que recibe texto markdown y tipo de material, y genera un archivo `.docx` usando la librería `docx`           | Programador    | ✅     |
| 5.2  | Parser markdown → DOCX                 | Parsear `##`, `**texto**` y `- item` del output de la IA para traducirlos a elementos Heading, Bold y List del DOCX  | Programador    | ✅     |
| 5.3  | Formato diferenciado por tipo          | Implementar estructura visual específica para cada uno de los 6 tipos de material en el DOCX                         | Programador    | ✅     |
| 5.4  | Header DOCX con config                 | Leer `school_name` y `teacher_name` desde la tabla `config` de SQLite e incluirlos en el encabezado del DOCX         | ExpertSQL      | ✅     |
| 5.5  | Footer DOCX                            | Agregar footer con número de página automático y fecha de generación en formato legible                              | Programador    | ✅     |
| 5.6  | Guardar DOCX en storage                | Escribir el archivo en `backend/storage/generated/{session_id}.docx` con manejo de errores de escritura              | DevOps         | ✅     |
| 5.7  | Actualizar SQLite con ruta DOCX        | Ejecutar UPDATE en la tabla `sessions` para registrar el `docx_path` una vez generado el archivo                     | ExpertSQL      | ✅     |
| 6.1  | Configurar Vite + React + Tailwind     | Inicializar proyecto Vite con plugin React, configurar TailwindCSS con PostCSS y autoprefixer                        | FrontendDev    | ✅     |
| 6.2  | Variables CSS globales                 | Definir la paleta de 10 colores en `:root` dentro de `index.css` siguiendo el estilo visual moderno                  | FrontendDev    | ✅     |
| 6.3  | Proxy Vite → backend                   | Configurar en `vite.config.js` que las rutas `/api` se redirijan a `http://localhost:3001` en desarrollo             | FrontendDev    | ✅     |
| 6.4  | Estilos base `index.css`               | Definir reset, tipografía base, scrollbar personalizado y clases utilitarias globales                                | FrontendDev    | ✅     |
| 6.5  | Layout principal `App.jsx`             | Implementar la estructura sidebar fijo (260px) + área principal flexible con sus estados de pantalla                 | FrontendDev    | ✅     |
| 7.1  | Componente `Header.jsx`                | Barra superior con logo, selector de modelo IA, botón nueva sesión y botón que abre el SettingsModal                 | FrontendDev    | ✅     |
| 7.2  | Componente `DropZone.jsx`              | Zona de arrastre con react-dropzone, visualización del archivo cargado y botón para cambiarlo                        | FrontendDev    | ✅     |
| 7.3  | Componente `MaterialSelector.jsx`      | Grid de 6 cards seleccionables con iconos lucide-react, estado activo resaltado con color acento                     | FrontendDev    | ✅     |
| 7.4  | Componente `ExtraInstructions.jsx`     | Textarea opcional con contador de caracteres visible y límite de 500 caracteres                                      | FrontendDev    | ✅     |
| 7.5  | Componente `ResultViewer.jsx`          | Área de previsualización del output renderizado con `react-markdown`, tipografía legible y scroll propio             | FrontendDev    | ✅     |
| 7.6  | Componente `DownloadButton.jsx`        | Botón que dispara la descarga del DOCX via `GET /api/sessions/:id/download`, con estado de carga                     | FrontendDev    | ✅     |
| 7.7  | Componente `SettingsModal.jsx`         | Modal con inputs para nombre del colegio y docente; lee configuración actual y guarda via `PUT /api/settings`        | FrontendDev    | ✅     |
| 7.8  | Componentes UI reutilizables           | Crear `Button.jsx`, `Spinner.jsx` y `Badge.jsx` con variantes de estilo coherentes con la paleta                     | FrontendDev    | ✅     |
| 8.1  | Hook `useSessions.js`                  | Custom hook que carga el historial paginado, expone funciones de refresh, delete y selección de sesión               | FrontendDev    | ✅     |
| 8.2  | Componente `Sidebar.jsx`               | Lista del historial agrupada por fecha (Hoy / Ayer / Esta semana / Anterior) con buscador integrado                  | FrontendDev    | ✅     |
| 8.3  | Componente `SessionItem.jsx`           | Ítem de sesión con título del archivo, badge de tipo de material, fecha relativa y botón de eliminar                 | FrontendDev    | ✅     |
| 8.4  | Búsqueda en sidebar                    | Filtrar sesiones en tiempo real por nombre de archivo al escribir en el campo de búsqueda                            | FrontendDev    | ✅     |
| 8.5  | Click para cargar sesión               | Al seleccionar una sesión, cargar su `output_text` en el ResultViewer y marcarla como activa en sidebar              | FrontendDev    | ✅     |
| 8.6  | Eliminar sesión con confirmación       | Modal de confirmación antes de llamar a `DELETE /api/sessions/:id`; actualizar lista tras eliminar                   | FrontendDev    | ✅     |
| 8.7  | Indicador de sesión activa             | Resaltar visualmente en el sidebar la sesión actualmente cargada en el área principal                                | FrontendDev    | ✅     |
| 9.1  | Hook `useGenerate.js`                  | Custom hook que gestiona el ciclo de generación: inicio, recepción de chunks, cancelación y finalización             | FrontendDev    | ✅     |
| 9.2  | Streaming visible en UI                | Mostrar los chunks de texto conforme llegan, acumulando el contenido con efecto de escritura progresiva              | FrontendDev    | ✅     |
| 9.3  | Indicador de progreso                  | Mostrar spinner o barra de progreso animada mientras la generación está en curso                                     | FrontendDev    | ✅     |
| 9.4  | Botón cancelar generación              | Abortar el fetch en curso con `AbortController`, limpiar el estado y volver a pantalla de configuración              | FrontendDev    | ✅     |
| 9.5  | Manejo de errores en UI                | Mostrar mensajes de error amigables ante fallos de API, timeout o archivo inválido                                   | FrontendDev    | ✅     |
| 9.6  | Acciones post-generación               | Al finalizar, mostrar botones "Descargar DOCX" y "Nueva sesión", y actualizar el historial en sidebar                | FrontendDev    | ✅     |
| 10.1 | Prueba E2E con PDF                     | Verificar flujo completo: subir PDF → seleccionar material → generar → descargar DOCX                                | QA             | ✅     |
| 10.2 | Prueba E2E con DOCX                    | Verificar flujo completo con archivo .docx como entrada                                                              | QA             | ✅     |
| 10.3 | Prueba E2E con DOC                     | Verificar conversión LibreOffice y flujo completo con archivo .doc como entrada                                      | QA             | ✅     |
| 10.4 | Verificar DOCX generado                | Abrir el DOCX resultante en LibreOffice y validar formato, header, footer y contenido estructurado                   | QA             | ✅     |
| 10.5 | Pruebas de historial CRUD              | Crear sesiones, listarlas, cargarlas al hacer click y eliminarlas; verificar persistencia en SQLite                  | QA             | ✅     |
| 10.6 | Prueba cambio de modelo                | Cambiar entre DeepSeek V3.2 y MiniMax 2.7 y verificar que ambos generan correctamente                                | QA             | ✅     |
| 10.7 | Prueba PDF escaneado                   | Subir un PDF sin texto seleccionable y verificar que el error llega limpiamente a la UI                              | QA             | ✅     |
| 10.8 | Crear `README.md`                      | Documentar requisitos del sistema, pasos de instalación, configuración del `.env` y comandos de arranque             | ProjectManager | ✅     |
| 10.9 | Script de arranque único               | Verificar que `npm run dev` levanta backend y frontend en paralelo y ambos están operativos                          | DevOps         | ✅     |

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
| ---------------- | ---------------- | -------------------- |
| Guía de Estudio  | ~1500 tokens     | 0.07% por chunk      |
| Ejercicios       | ~1200 tokens     | 0.08% por chunk      |
| Plan de Clase    | ~1000 tokens     | 0.10% por chunk      |
| Niveles          | ~1800 tokens     | 0.05% por chunk      |
| Mapa Conceptual  | ~800 tokens      | 0.12% por chunk      |
| Glosario         | ~700 tokens      | 0.14% por chunk      |

### Mensajes de estado por etapa

| Progreso | Mensaje                               |
| -------- | ------------------------------------- |
| 0%       | Conectando con el modelo...           |
| 1-10%    | Analizando contenido del documento... |
| 10-30%   | Identificando conceptos clave...      |
| 30-50%   | Generando estructura del material...  |
| 50-70%   | Creando contenido y ejemplos...       |
| 70-90%   | Finalizando el material...            |
| 90-99%   | Generando documento DOCX...           |
| 100%     | ¡Material generado con éxito!         |

### Tareas

| ID     | Tarea                                  | Descripción                                                                               | Archivos                                        | Encargado      | Estado |
| ------ | -------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------- | ------ |
| 11.1   | Eventos SSE de progreso                | Agregar evento `progress` al stream SSE en `generate.js` con tipo, porcentaje y mensaje   | `backend/routes/generate.js`                    | Programador    | ✅     |
| 11.2   | Mensajes de estado dinámicos           | Crear mapa de mensajes por etapa y función que calcule porcentaje según chunks recibidos  | `backend/routes/generate.js`                    | Programador    | ✅     |
| 11.3   | Componente `ProgressBar.jsx`           | Crear componente visual con barra animada, porcentaje numérico y mensaje de estado        | `frontend/src/components/ProgressBar.jsx`       | FrontendDev    | ✅     |
| 11.4   | Integrar ProgressBar en App.jsx        | Conectar eventos `progress` del SSE al estado del componente ProgressBar                  | `frontend/src/App.jsx`                          | FrontendDev    | ✅     |
| 11.5   | Animación pre-generación               | Mostrar pulso/spinner antes del primer chunk (latencia inicial del modelo)                | `frontend/src/App.jsx`                          | FrontendDev    | ✅     |
| 11.6   | Prueba con todos los modelos           | Verificar que el indicador funciona con DeepSeek, MiniMax, Gemma, Qwen y Granite          | —                                               | QA             | ✅     |
| 12.1   | Crear `scripts/install.sh`             | Script que verifica prerequisites, instala dependencias, configura entorno Python y npm   | `scripts/install.sh`                            | DevOps         | ✅     |
| 12.2   | Crear `scripts/run.sh`                 | Script que inicia backend + frontend, gestiona procesos, verifica estado y abre navegador | `scripts/run.sh`                                | DevOps         | ✅     |
| 12.3   | Agregar scripts al `.gitignore`        | Excluir archivos temporales (.pid, logs) del control de versiones                         | `.gitignore`                                    | ExpertGit      | ✅     |
| 12.4   | Documentar uso de scripts              | Agregar sección en README.md sobre instalación y ejecución con scripts                    | `README.md`                                     | ProjectManager | ✅     |
| 12.5   | Probar scripts en diferentes entornos  | Verificar funcionamiento en Linux, macOS y WSL                                            | —                                               | QA             | ✅     |
| 13.1.1 | Agregar opción en MaterialSelector.jsx | Nueva card para "Examen de Selección Única" con icono CheckSquare, color indigo           | `frontend/src/components/MaterialSelector.jsx`  | FrontendDev    | ✅     |
| 13.1.2 | Modificar ExtraInstructions.jsx        | Agregar campo numérico para número de preguntas (5-50, default: 10)                       | `frontend/src/components/ExtraInstructions.jsx` | FrontendDev    | ✅     |
| 13.1.3 | Actualizar App.jsx                     | Manejar nuevo materialType 'examen_seleccion' y parámetro numPreguntas                    | `frontend/src/App.jsx`                          | FrontendDev    | ✅     |
| 13.1.4 | Validación frontend                    | Validar rango 5-50 preguntas en campo numérico                                            | `frontend/src/components/ExtraInstructions.jsx` | FrontendDev    | ✅     |
| 13.2.1 | Agregar prompt en prompts.js           | Template para examen de selección única que recibe número de preguntas                    | `backend/utils/prompts.js`                      | Programador    | ✅     |
| 13.2.2 | Modificar routes/generate.js           | Recibir parámetro num_preguntas en request body                                           | `backend/routes/generate.js`                    | Programador    | ✅     |
| 13.2.3 | Actualizar prompts.js                  | Función que genera prompt específico para examen con N preguntas                          | `backend/utils/prompts.js`                      | Programador    | ✅     |
| 13.2.4 | Validación backend                     | Verificar que documento tenga suficiente contenido para preguntas solicitadas             | `backend/routes/generate.js`                    | Programador    | ✅     |
| 13.3.1 | Actualizar create_docx.js              | Función parseExamenMarkdown() para formato específico de examen                           | `backend/scripts/create_docx.js`                | Programador    | ✅     |
| 13.3.2 | Formato preguntas DOCX                 | Negrita para pregunta, opciones con letras (a, b, c), espacio para respuesta              | `backend/scripts/create_docx.js`                | Programador    | ✅     |
| 13.3.3 | Espacio para respuestas                | Checkboxes (□) para que estudiante marque opción correcta                                 | `backend/scripts/create_docx.js`                | Programador    | ✅     |
| 13.3.4 | Hoja de respuestas                     | Page break + tabla con clave de respuestas para el profesor                               | `backend/scripts/create_docx.js`                | Programador    | ✅     |
| 13.4.1 | Extender endpoint /api/generate        | Agregar parámetro num_preguntas al request body                                           | `backend/routes/generate.js`                    | Programador    | ⬜     |
| 13.4.2 | Esquema SQLite                         | Ya soporta material_type, solo agregar nuevo valor 'examen_seleccion'                     | —                                               | ExpertSQL      | ⬜     |
| 13.4.3 | Validación contenido                   | Documento debe tener suficiente texto para generar N preguntas                            | `backend/routes/generate.js`                    | Programador    | ⬜     |
| 13.5.1 | Pruebas unitarias                      | Validar generación de preguntas con diferentes números de preguntas                       | —                                               | QA             | ✅     |
| 13.5.2 | Pruebas E2E                            | Flujo completo: upload → seleccionar examen → especificar preguntas → generar → download  | —                                               | QA             | ✅     |
| 13.5.3 | Validación calidad                     | Preguntas no triviales, opciones balanceadas, solo una correcta por pregunta              | —                                               | QA             | ✅     |
| 13.5.4 | Pruebas límite                         | Mínimo 5, máximo 50 preguntas, documentos con poco contenido                              | —                                               | QA             | ✅     |

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

| Decisión                     | Elección                                         | Motivo                                                                      |
| ---------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| Base de datos                | SQLite (better-sqlite3)                          | Persistencia local sin servidor extra                                       |
| Streaming backend→frontend   | Server-Sent Events (SSE)                         | Simple en Express, pipe directo desde OpenRouter                            |
| Streaming frontend (consumo) | `fetch` + `ReadableStream`                       | `EventSource` nativo solo soporta GET; `fetch` permite POST con body JSON   |
| Generación DOCX              | librería `docx` (npm)                            | Soporte completo de formato Word                                            |
| Parseo markdown → DOCX       | Parser propio mínimo (regex)                     | Evitar dependencia pesada; el formato de salida es controlado por el prompt |
| Extracción PDF               | pdfplumber (Python)                              | Mejor extracción de texto + tablas                                          |
| Conversión DOC               | LibreOffice headless                             | Ya instalado en el sistema                                                  |
| Frontend                     | React + Vite + Tailwind                          | Rapidez de desarrollo + rendimiento                                         |
| Render markdown en UI        | `react-markdown`                                 | Muestra el output formateado con headings, listas y negritas                |
| Configuración DOCX header    | Tabla `config` en SQLite + `SettingsModal` en UI | El docente configura nombre una vez; persiste entre sesiones                |
| Límite de upload             | 10 MB (multer)                                   | Cubre documentos de clase estándar sin riesgo de memoria                    |
| Paginación historial         | Offset-based, page size 20                       | Simple de implementar con SQLite LIMIT/OFFSET                               |
| Cancelación de generación    | Sesión descartada (no se guarda)                 | Evita sesiones parciales o corruptas en el historial                        |
| PDFs sin texto               | Error descriptivo al usuario                     | Guía al docente a usar un PDF con texto seleccionable                       |
| API IA                       | OpenRouter                                       | Permite usar DeepSeek y MiniMax con una sola key                            |
| Puerto backend               | 3001                                             | No conflicto con otros servicios                                            |
| Puerto frontend              | 5173                                             | Default de Vite                                                             |

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

| Fecha      | Fase    | Descripción                                                      | Estado |
| ---------- | ------- | ---------------------------------------------------------------- | ------ |
| 2026-04-09 | —       | Plan inicial creado                                              | ✅     |
| 2026-04-09 | —       | Decisiones técnicas complementarias agregadas                    | ✅     |
| 2026-04-09 | 1-4     | Fases 1-4 completadas (config, servidor, archivos, IA streaming) | ✅     |
| 2026-04-09 | 5.1-5.2 | Fase 5 iniciada: create_docx.js + parser markdown → DOCX         | ✅     |
| 2026-04-12 | 5.7     | Fase 5 completada: integración DOCX con ruta generate.js         | ✅     |
| 2026-04-12 | 6       | Fase 6 completada: estructura base Vite + React + Tailwind       | ✅     |
| 2026-04-12 | 7       | Fase 7 completada: componentes principales                       | ✅     |
| 2026-04-12 | 8       | Fase 8 completada: historial sesiones (Sidebar)                  | ✅     |
| 2026-04-12 | 9       | Fase 9 completada: streaming visible en generar                  | ✅     |
| 2026-04-12 | 10      | Fase 10 completada: pruebas E2E (10.1-10.7)                      | ✅     |
| 2026-04-12 | 11      | Fase 11 completada: indicador de progreso + mensajes de estado   | ✅     |

---

---

## Fase 12 — Scripts de instalación y ejecución

### Objetivo

Crear scripts automatizados para facilitar la instalación y ejecución de Teacher Tool, mejorando la experiencia de usuario y simplificando el despliegue.

### Tareas

- [ ] 12.1 Crear `scripts/install.sh` — Verifica prerequisites, instala dependencias, configura entorno
- [ ] 12.2 Crear `scripts/run.sh` — Inicia backend + frontend, gestiona procesos, verifica estado
- [ ] 12.3 Agregar scripts al `.gitignore` — Excluir archivos temporales (.pid, logs)
- [ ] 12.4 Documentar uso de scripts en README.md
- [ ] 12.5 Probar scripts en diferentes entornos (Linux, macOS)

### Características de los scripts

- **install.sh:** Verifica Node.js 18+, Python 3.12+, npm, LibreOffice, Ollama
- **run.sh:** Inicia servicios, verifica salud, abre navegador, gestión de PIDs
- **Logs:** `logs/backend.log`, `logs/frontend.log`
- **Estado:** `./scripts/run.sh --check` verifica sistema completo

---

## Fase 13 — Examen de selección única (nueva funcionalidad)

### Objetivo

Agregar funcionalidad para generar exámenes de selección única con 3 opciones por pregunta, donde solo una es correcta. El usuario especifica el número de preguntas deseado.

### Especificaciones

- **Entrada:** Documento/guía de estudio (PDF/DOC/DOCX)
- **Parámetro:** Número de preguntas (5-50, valor por defecto: 10)
- **Salida:** Examen en formato DOCX con preguntas de selección única
- **Formato:** 3 opciones por pregunta (a, b, c), solo una correcta
- **Nivel:** Educación secundaria (12-18 años)

### Flujo de usuario

1. Subir documento → extraer texto
2. Seleccionar "Examen de Selección Única"
3. Especificar número de preguntas (input numérico)
4. Opcional: agregar instrucciones adicionales
5. Generar → streaming visible
6. Descargar DOCX con examen formateado

### Tareas

#### 13.1 Frontend — Interfaz de usuario

- [ ] 13.1.1 Agregar opción en `MaterialSelector.jsx` — Icono `CheckSquare`, color `indigo`
- [ ] 13.1.2 Modificar `ExtraInstructions.jsx` — Agregar campo numérico para número de preguntas
- [ ] 13.1.3 Actualizar `App.jsx` — Manejar nuevo `materialType: 'examen_seleccion'`
- [ ] 13.1.4 Validación frontend — Rango 5-50 preguntas, valor por defecto 10

#### 13.2 Backend — Lógica de negocio

- [ ] 13.2.1 Agregar prompt en `prompts.js` — Template para examen de selección única
- [ ] 13.2.2 Modificar `routes/generate.js` — Recibir parámetro `num_preguntas`
- [ ] 13.2.3 Actualizar `utils/prompts.js` — Función que recibe número de preguntas
- [ ] 13.2.4 Validación backend — Verificar contenido suficiente para preguntas solicitadas

#### 13.3 Generación DOCX — Formato específico

- [ ] 13.3.1 Actualizar `scripts/create_docx.js` — Función `formatExamenSeleccion()`
- [ ] 13.3.2 Formato preguntas — Negrita para pregunta, opciones con letras (a, b, c)
- [ ] 13.3.3 Espacio para respuestas — Checkboxes (□) o líneas para marcar
- [ ] 13.3.4 Hoja de respuestas — Tabla opcional para profesor

#### 13.4 API y base de datos

- [ ] 13.4.1 Extender endpoint `/api/generate` — Parámetro `num_preguntas` en request body
- [ ] 13.4.2 Esquema SQLite — Ya soporta `material_type`, solo agregar nuevo valor
- [ ] 13.4.3 Validación — Documento debe tener suficiente contenido para preguntas solicitadas

#### 13.5 Testing y validación

- [ ] 13.5.1 Pruebas unitarias — Validar generación de preguntas
- [ ] 13.5.2 Pruebas E2E — Flujo completo con diferentes documentos
- [ ] 13.5.3 Validación calidad — Preguntas no triviales, opciones balanceadas
- [ ] 13.5.4 Pruebas límite — Mínimo 5, máximo 50 preguntas

### Formato de salida esperado (markdown)

```
## Examen de Selección Única

### Instrucciones:
Responde marcando con una X la opción correcta.

### Pregunta 1:
[Texto de la pregunta - basado en contenido del documento]

a) [Opción A - incorrecta pero plausible]
b) [Opción B - correcta]
c) [Opción C - incorrecta]

### Pregunta 2:
...

### Hoja de respuestas (para el profesor):
1. b
2. a
3. c
...
```

### Prompt específico para IA

```
Crea un examen de selección única con [N] preguntas basado en el contenido proporcionado.

Requisitos:
- [N] preguntas de selección única
- 3 opciones por pregunta (a, b, c)
- Solo UNA opción correcta por pregunta
- Las opciones incorrectas deben ser plausibles pero claramente erróneas
- Las preguntas deben evaluar comprensión, no solo memoria
- Incluye 2-3 preguntas de aplicación práctica
- Nivel: educación secundaria (12-18 años)

Formato de salida:
## Examen de Selección Única
### Instrucciones: [instrucciones para estudiante]
### Pregunta 1: [pregunta]
a) [opción A]
b) [opción B]
c) [opción C]
...
```

### Consideraciones técnicas

- **Integración con modelos IA:** Prompt debe generar preguntas balanceadas y no ambiguas
- **Validación:** Garantizar que solo una opción sea correcta por pregunta
- **Experiencia usuario:** Feedback durante generación, preview antes de descargar
- **Rendimiento:** Optimizar para documentos largos con muchas preguntas

### Archivos a modificar

```
frontend/
├── src/components/MaterialSelector.jsx     (+1 opción: examen_seleccion)
├── src/components/ExtraInstructions.jsx   (+campo numérico: num_preguntas)
├── src/App.jsx                            (manejo estado y parámetros)
└── src/hooks/useGenerate.js               (extender parámetros)

backend/
├── utils/prompts.js                       (+nuevo prompt: examen_seleccion)
├── routes/generate.js                     (+parámetro: num_preguntas)
└── scripts/create_docx.js                 (+formato específico examen)
```

### Timeline estimado

| Componente      | Horas    | Prioridad |
| --------------- | -------- | --------- |
| Frontend UI     | 2-3      | Alta      |
| Backend lógica  | 2-3      | Alta      |
| Generación DOCX | 1-2      | Media     |
| Testing         | 1-2      | Media     |
| **Total**       | **6-10** |           |

---

## Notas

- El nivel educativo de los alumnos es **secundaria** — todos los prompts deben ajustarse a este nivel.
- El modelo predeterminado es **DeepSeek V3.2** (`deepseek/deepseek-v3.2`).
- MiniMax 2.7 está disponible como alternativa en la nube.
- **Modelos locales Ollama:** Gemma 3 (1B), Qwen 3.5 (2B), Granite 4 (3B) disponibles si Ollama está instalado.
- LibreOffice 24.2.7.2 está instalado en `/usr/bin/libreoffice`.
- Python 3.12.3 y Node.js 24.9.0 disponibles en el sistema.
- La `OPENROUTER_API_KEY` ya está configurada como variable de entorno del sistema.

# Teacher Tool - System Health Checklist

## Overview

This checklist verifies that the Teacher Tool system is properly configured and running. Use the automated script (`./check-system.sh`) for quick verification, or use this manual checklist for detailed inspection.

---

## 1. Backend Server ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| Port 3001 listening | `lsof -i:3001` | Shows node/express process |
| API responds | `curl http://localhost:3001/api/sessions` | JSON response |
| Sessions endpoint | `curl http://localhost:3001/api/sessions` | `{"sessions": [...]}` |

**Manual test:**
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"material_type":"guia","input_text":"test"}'
# Should return SSE stream (even if API key is missing)
```

---

## 2. Database ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| File exists | `ls -la backend/database/teacher_tool.db` | File exists, size > 0 |
| Tables exist | `sqlite3 backend/database/teacher_tool.db ".tables"` | `sessions config` |
| Can query | `sqlite3 backend/database/teacher_tool.db "SELECT COUNT(*) FROM sessions;"` | Number |

**Manual test:**
```bash
sqlite3 backend/database/teacher_tool.db "SELECT * FROM sessions LIMIT 1;"
# Should return session data or empty if no sessions
```

---

## 3. Frontend ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| Port 5173 listening | `lsof -i:5173` | Shows vite/node process |
| Page loads | Open http://localhost:5173 | Teacher Tool UI appears |

---

## 4. Ollama (Local Models) ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| Service running | `curl http://localhost:11434/api/tags` | JSON with models |
| Models available | `curl -s http://localhost:11434/api/tags \| grep name` | gemma3:1b, qwen3.5:2b, granite4:3b |

**Manual test:**
```bash
curl http://localhost:11434/api/tags
# Should return: {"models":[{"name":"gemma3:1b",...},...]}
```

---

## 5. OpenRouter (Cloud Models) ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| API key set | `echo $OPENROUTER_API_KEY` | Non-empty string |
| API accessible | `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/models` | `200` |

**Manual test:**
```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
# Should return list of available models
```

---

## 6. Python Dependencies ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| pdfplumber | `python3 -c "import pdfplumber; print('OK')"` | `OK` |
| pypdf | `python3 -c "import pypdf; print('OK')"` | `OK` |
| docx | `python3 -c "import docx; print('OK')"` | `OK` |

---

## 7. Node Dependencies ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| backend/node_modules | `ls backend/node_modules/express/package.json` | File exists |
| frontend/node_modules | `ls frontend/node_modules/vite/package.json` | File exists |

---

## 8. Storage Directories ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| uploads/ | `ls -la backend/storage/uploads/` | Directory exists |
| generated/ | `ls -la backend/storage/generated/` | Directory exists |

---

## 9. Environment Variables ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| OPENROUTER_API_KEY | `echo $OPENROUTER_API_KEY` | Your API key |
| PORT (optional) | `echo $PORT` | `3001` (default) |

---

## 10. LibreOffice ✅/❌

| Check | How to Verify | Expected |
|-------|---------------|----------|
| Installed | `libreoffice --version` | Version 24.x |
| Path | `which libreoffice` | `/usr/bin/libreoffice` |

---

## Quick Verification Commands

Run these commands in sequence to verify the entire system:

```bash
# 1. Check processes
lsof -i:3001  # Backend
lsof -i:5173  # Frontend
lsof -i:11434 # Ollama

# 2. Check API endpoints
curl http://localhost:3001/api/sessions
curl http://localhost:11434/api/tags

# 3. Check database
sqlite3 backend/database/teacher_tool.db "SELECT COUNT(*) FROM sessions;"

# 4. Check environment
echo "OpenRouter Key: ${OPENROUTER_API_KEY:0:10}..."
```

---

## Automated Script

Run the automated health check:

```bash
./check-system.sh
```

This script checks all items automatically and provides a summary.

---

## Troubleshooting

### Backend won't start
```bash
cd backend
npm install
npm start
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

### Ollama not available
```bash
ollama serve  # Start Ollama
ollama pull gemma3:1b  # Download a model
```

### Database locked
```bash
# Kill any lingering processes
pkill -f "node.*backend"
rm backend/database/teacher_tool.db
npm start  # Recreates database
```
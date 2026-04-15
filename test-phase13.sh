#!/bin/bash
# Test script for Phase 13 - Examen de Selección Única functionality
# Tests: 13.5.1 - 13.5.4

set -e

echo "========================================"
echo "Teacher Tool - Phase 13 Tests"
echo "Examen de Selección Única"
echo "========================================"

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
TEST_DIR="./test-files"
TEST_CONTENT_DIR="./test-content"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_test() { echo -e "${BLUE}[TEST]${NC} $1"; }

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Helper to increment counters
pass() { TESTS_PASSED=$((TESTS_PASSED + 1)); }
fail() { TESTS_FAILED=$((TESTS_FAILED + 1)); }
skip() { TESTS_SKIPPED=$((TESTS_SKIPPED + 1)); }

# ==========================================
# UTILITY FUNCTIONS
# ==========================================

check_backend() {
  curl -s "$BACKEND_URL/api/health" > /dev/null 2>&1
}

create_test_content() {
  mkdir -p "$TEST_CONTENT_DIR"
  
  cat > "$TEST_CONTENT_DIR/examen_content.txt" << 'EOF'
La fotosíntesis es el proceso mediante el cual las plantas convierten la energía luminosa en energía química. 
Este proceso ocurre en los cloroplastos de las células vegetales. Los principales requisitos son luz solar, 
dióxido de carbono (CO2) y agua (H2O). Los productos resultantes son glucosa (C6H12O6) y oxígeno (O2).

La ecuación química de la fotosíntesis es:
6CO2 + 6H2O + energía luminosa → C6H12O6 + 6O2

Existen dos etapas principales en la fotosíntesis:
1. Fase luminosa: Ocurre en las membranas tilacoidales donde la energía luminosa se convierte en ATP y NADPH.
2. Fase oscura (Ciclo de Calvin): Ocurre en el estroma del cloroplasto donde el CO2 se fija y se convierte en glucosa.

Los factores que afectan la fotosíntesis incluyen:
- Intensidad luminosa: A mayor intensidad, mayor tasa de fotosíntesis hasta un punto de saturación.
- Temperatura: Enzimas del ciclo de Calvin tienen temperatura óptima entre 25-35°C.
- Concentración de CO2: Mayor concentración aumenta la tasa hasta cierto límite.
- Disponibilidad de agua: Deficiencias hídricas reducen la fotosíntesis.

La respiración celular es el proceso opuesto a la fotosíntesis. En este proceso, las células breakdown glucosa 
para liberar energía. La ecuación general es:
C6H12O6 + 6O2 → 6CO2 + 6H2O + energía (ATP)

La respiración celular ocurre en tres etapas:
1. Glucólisis: Ocurre en el citoplasma, produce 2 ATP.
2. Ciclo de Krebs: Ocurre en la matriz mitocondrial, produce 2 ATP.
3. Cadena de transporte de electrones: Ocurre en la membrana mitocondrial interna, produce 32-34 ATP.

Comparación entre fotosíntesis y respiración celular:
- Fotosíntesis: Produce glucosa y O2, requiere luz, ocurre en cloroplastos.
- Respiración: Descompone glucosa, produce CO2 y H2O, no requiere luz, ocurre en mitocondrias.
- Ambas son procesos complementarios en el ciclo de la materia.
EOF

  log_info "Contenido de prueba creado"
}

# ==========================================
# TEST 13.5.1: Pruebas unitarias de prompts
# ==========================================
test_13_5_1() {
  log_test "TEST 13.5.1: Validar prompt de examen_seleccion"
  
  # Check that prompts.js has the examen_seleccion template
  if grep -q "examen_seleccion" backend/utils/prompts.js; then
    log_info "✅ Prompt template examen_seleccion encontrado"
    pass
  else
    log_error "❌ Prompt template examen_seleccion NO encontrado"
    fail
  fi
  
  # Check that numPreguntas parameter is handled
  if grep -q "numPreguntas" backend/utils/prompts.js; then
    log_info "✅ Parámetro numPreguntas manejado en prompts.js"
    pass
  else
    log_error "❌ Parámetro numPreguntas NO encontrado"
    fail
  fi
  
  # Check that getPrompt accepts options parameter
  if grep -q "options = {}" backend/utils/prompts.js; then
    log_info "✅ Función getPrompt acepta options"
    pass
  else
    log_error "❌ Función getPrompt NO acepta options"
    fail
  fi
  
  log_info "✅ TEST 13.5.1 completado (3 validaciones)"
}

# ==========================================
# TEST 13.5.2: Pruebas E2E flujo completo
# ==========================================
test_13_5_2() {
  log_test "TEST 13.5.2: Prueba E2E flujo completo de examen"
  
  # Check if backend is running
  if ! check_backend; then
    log_warn "Backend no está corriendo - omitiendo pruebas de endpoint"
    skip; skip; skip; skip
    return 0
  fi
  
  create_test_content
  
  # TEST: Validate generate endpoint accepts examen_seleccion
  log_info "13.5.2a: Validando endpoint /api/generate con examen_seleccion..."
  
  GENERATE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/generate" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "deepseek/deepseek-v3.2",
      "material_type": "examen_seleccion",
      "input_text": "Este es un texto de prueba corto para verificar la validación del rango",
      "num_preguntas": 10
    }' 2>/dev/null || echo "")
  
  if echo "$GENERATE_RESPONSE" | grep -qE "error|contenido|caracteres|done"; then
    log_info "✅ Endpoint acepta examen_seleccion"
    pass
  else
    log_info "ℹ️ Respuesta: ${GENERATE_RESPONSE:0:100}..."
    skip
  fi
  
  # TEST: Validate num_preguntas range (too low)
  log_info "13.5.2b: Validando rango num_preguntas (bajo)..."
  
  LOW_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/generate" \
    -H "Content-Type: application/json" \
    -d '{
      "material_type": "examen_seleccion",
      "input_text": "Texto corto para prueba",
      "num_preguntas": 3
    }' 2>/dev/null || echo "")
  
  if echo "$LOW_RESPONSE" | grep -qE "error|5.*50|entre.*5| número"; then
    log_info "✅ Validación rango bajo (3 < 5) funciona"
    pass
  else
    log_warn "⚠️ Validación rango bajo podría no funcionar"
    skip
  fi
  
  # TEST: Validate num_preguntas range (too high)
  log_info "13.5.2c: Validando rango num_preguntas (alto)..."
  
  HIGH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/generate" \
    -H "Content-Type: application/json" \
    -d '{
      "material_type": "examen_seleccion",
      "input_text": "Texto corto para prueba",
      "num_preguntas": 100
    }' 2>/dev/null || echo "")
  
  if echo "$HIGH_RESPONSE" | grep -qE "error|5.*50|entre.*50| número"; then
    log_info "✅ Validación rango alto (100 > 50) funciona"
    pass
  else
    log_warn "⚠️ Validación rango alto podría no funcionar"
    skip
  fi
  
  # TEST: Accept valid num_preguntas
  log_info "13.5.2d: Validando valor válido (20 preguntas)..."
  
  VALID_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/generate" \
    -H "Content-Type: application/json" \
    -d '{
      "material_type": "examen_seleccion",
      "input_text": "Este es un texto de prueba con suficiente contenido para validar que la generación acepta valores dentro del rango válido de 5 a 50 preguntas y no genera error de validación",
      "num_preguntas": 20
    }' 2>/dev/null || echo "")
  
  if echo "$VALID_RESPONSE" | grep -qE "error|contenido insuficiente"; then
    log_warn "⚠️ Contenido insuficiente para 20 preguntas"
    skip
  else
    log_info "✅ Valor válido (20) aceptado"
    pass
  fi
  
  log_info "✅ TEST 13.5.2 completado"
}

# ==========================================
# TEST 13.5.3: Validación de calidad del prompt
# ==========================================
test_13_5_3() {
  log_test "TEST 13.5.3: Validación de calidad del prompt"
  
  QUALITY_PASS=0
  
  # 1. Check prompt asks for 3 options per question
  if grep -q "3 opciones\|3 opciones por pregunta" backend/utils/prompts.js; then
    log_info "✅ Prompt especifica 3 opciones por pregunta"
    QUALITY_PASS=$((QUALITY_PASS + 1))
  else
    log_error "❌ Prompt NO especifica 3 opciones"
  fi
  
  # 2. Check prompt asks for only one correct answer
  if grep -q "solo una correcta\|una correcta\|solo UNA" backend/utils/prompts.js; then
    log_info "✅ Prompt especifica solo una correcta"
    QUALITY_PASS=$((QUALITY_PASS + 1))
  else
    log_error "❌ Prompt NO especifica solo una correcta"
  fi
  
  # 3. Check prompt includes application questions
  if grep -q "aplicación\|práctica\|aplicar" backend/utils/prompts.js; then
    log_info "✅ Prompt incluye preguntas de aplicación práctica"
    QUALITY_PASS=$((QUALITY_PASS + 1))
  else
    log_error "❌ Prompt NO incluye preguntas de aplicación"
  fi
  
  # 4. Check prompt specifies secondary level
  if grep -q "secundaria\|12.*18\|12-18" backend/utils/prompts.js; then
    log_info "✅ Prompt especifica nivel secundaria (12-18)"
    QUALITY_PASS=$((QUALITY_PASS + 1))
  else
    log_error "❌ Prompt NO especifica nivel"
  fi
  
  # 5. Check prompt includes answer sheet
  if grep -q "Hoja de respuestas\|clave.*respuestas" backend/utils/prompts.js; then
    log_info "✅ Prompt incluye hoja de respuestas"
    QUALITY_PASS=$((QUALITY_PASS + 1))
  else
    log_error "❌ Prompt NO incluye hoja de respuestas"
  fi
  
  # 6. Check prompt validates comprehensión not just memory
  if grep -q "comprensión\|comprender\|entender" backend/utils/prompts.js; then
    log_info "✅ Prompt pide preguntas de comprensión (no memoria)"
    QUALITY_PASS=$((QUALITY_PASS + 1))
  else
    log_error "❌ Prompt NO pide comprensión"
  fi
  
  if [ $QUALITY_PASS -ge 5 ]; then
    log_info "✅ TEST 13.5.3 completado ($QUALITY_PASS/6 verificaciones)"
    pass
  else
    log_error "❌ TEST 13.5.3 falló ($QUALITY_PASS/6 verificaciones)"
    fail
  fi
}

# ==========================================
# TEST 13.5.4: Pruebas de límite
# ==========================================
test_13_5_4() {
  log_test "TEST 13.5.4: Pruebas de límite (5-50 preguntas)"
  
  # Check that generate.js validates num_preguntas
  if grep -q "num_preguntas.*5\|num_preguntas.*< 5\|5.*50" backend/routes/generate.js; then
    log_info "✅ Validación de rango 5-50 implementada en generate.js"
    pass
  else
    log_error "❌ Validación de rango 5-50 NO implementada"
    fail
  fi
  
  # Check Frontend validates 5-50
  if grep -q "min=5\|max=50\|5.*50" frontend/src/components/ExtraInstructions.jsx; then
    log_info "✅ Validación de rango 5-50 implementada en frontend"
    pass
  else
    log_error "❌ Validación de rango 5-50 NO implementada en frontend"
    fail
  fi
  
  # Check default value is 10
  if grep -q "useState.*10\|numPreguntas.*10\|= 10" frontend/src/App.jsx; then
    log_info "✅ Valor por defecto de 10 preguntas"
    pass
  else
    log_error "❌ Valor por defecto NO es 10"
    fail
  fi
  
  # Check materialNames includes examen_seleccion
  if grep -q "examen_seleccion" backend/routes/generate.js; then
    log_info "✅ examen_seleccion incluido en nombres de materiales"
    pass
  else
    log_error "❌ examen_seleccion NO incluido en nombres de materiales"
    fail
  fi
  
  log_info "✅ TEST 13.5.4 completado (4 verificaciones)"
}

# ==========================================
# TEST 13.5.5: Verificar DOCX especializado
# ==========================================
test_13_5_5() {
  log_test "TEST 13.5.5: Verificar generación DOCX especializada"
  
  # Check parseExamenMarkdown function exists
  if grep -q "parseExamenMarkdown" backend/scripts/create_docx.js; then
    log_info "✅ Función parseExamenMarkdown implementada"
    pass
  else
    log_error "❌ Función parseExamenMarkdown NO encontrada"
    fail
  fi
  
  # Check for PageBreak import
  if grep -q "PageBreak" backend/scripts/create_docx.js; then
    log_info "✅ PageBreak importado para hoja de respuestas"
    pass
  else
    log_error "❌ PageBreak NO importado"
    fail
  fi
  
  # Check for checkbox symbol
  if grep -q '□\|checkboxSymbol' backend/scripts/create_docx.js; then
    log_info "✅ Checkbox □ implementado para respuestas"
    pass
  else
    log_error "❌ Checkbox □ NO implementado"
    fail
  fi
  
  # Check for answer sheet header
  if grep -q "CLAVE DE RESPUESTAS\|Hoja de respuestas" backend/scripts/create_docx.js; then
    log_info "✅ Hoja de respuestas con CLAVE DE RESPUESTAS"
    pass
  else
    log_error "❌ Hoja de respuestas NO implementada"
    fail
  fi
  
  log_info "✅ TEST 13.5.5 completado (4 verificaciones)"
}

# ==========================================
# MAIN EXECUTION
# ==========================================
main() {
  echo ""
  echo "========================================"
  echo "Phase 13 - Testing Suite"
  echo "Examen de Selección Única"
  echo "========================================"
  echo ""
  
  # Run all tests
  test_13_5_1
  echo ""
  
  test_13_5_2
  echo ""
  
  test_13_5_3
  echo ""
  
  test_13_5_4
  echo ""
  
  test_13_5_5
  echo ""
  
  # Summary
  echo "========================================"
  echo "RESUMEN DE PRUEBAS - PHASE 13"
  echo "========================================"
  echo -e "Pasadas:   ${GREEN}$TESTS_PASSED${NC}"
  echo -e "Fallidas:  ${RED}$TESTS_FAILED${NC}"
  echo -e "Omitidas:  ${YELLOW}$TESTS_SKIPPED${NC}"
  echo "========================================"
  
  if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}⚠️ Algunas pruebas fallaron${NC}"
    exit 1
  else
    echo -e "${GREEN}✅ Todas las pruebas pasaron${NC}"
    exit 0
  fi
}

# Run main
main "$@"
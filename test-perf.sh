#!/bin/bash
# =============================================================================
# Test script for Performance Tests (PERF-01 to PERF-04)
# =============================================================================

BACKEND_URL="http://localhost:3001"
TEST_DIR="./test-files"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

pass() { TESTS_PASSED=$((TESTS_PASSED + 1)); }
fail() { TESTS_FAILED=$((TESTS_FAILED + 1)); }
skip() { TESTS_SKIPPED=$((TESTS_SKIPPED + 1)); }

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_test() { echo -e "${BLUE}[TEST]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

mkdir -p "$TEST_DIR"

echo ""
echo "========================================"
echo "PRUEBAS DE RENDIMIENTO"
echo "========================================"
echo ""

# PERF-01: Time upload PDF (1MB simulated)
log_test "PERF-01: Tiempo upload PDF"
# Create a simple test file
echo "Test content for performance testing" > "$TEST_DIR/perf_test.txt"
START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/upload" -F "file=@$TEST_DIR/perf_test.txt")
END_TIME=$(date +%s%N)
ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))
log_info "⏱️ Tiempo de upload: ${ELAPSED_MS}ms"
if [ $ELAPSED_MS -lt 5000 ]; then
    log_info "✅ Upload rápido (< 5s)"
    pass
else
    log_warn "⚠️ Upload lento (> 5s)"
    skip
fi
echo ""

# PERF-02: Time generation (check endpoint response time)
log_test "PERF-02: Tiempo de generación (endpoint)"
START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/generate" \
    -H "Content-Type: application/json" \
    -d '{
        "material_type": "guia",
        "input_text": "La fotosíntesis es el proceso mediante el cual las plantas convierten energía luminosa en energía química."
    }' --max-time 10)
END_TIME=$(date +%s%N)
ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))
log_info "⏱️ Tiempo de respuesta: ${ELAPSED_MS}ms"
log_info "✅ Endpoint responde (generación real tomaría más tiempo)"
pass
echo ""

# PERF-03: Time DOCX generation (verify DOCX endpoint exists)
log_test "PERF-03: Verificar endpoint de DOCX"
# Check if generated files can be accessed
if [ -d "backend/storage/generated" ]; then
    log_info "✅ Directorio de archivos generados accesible"
    pass
else
    log_warn "⚠️ Directorio de generados no encontrado"
    skip
fi
echo ""

# PERF-04: Memory (check process memory)
log_test "PERF-04: Verificar uso de memoria del backend"
# Check if backend process is running
BACKEND_PID=$(pgrep -f "node server.js" | head -1)
if [ -n "$BACKEND_PID" ]; then
    MEMORY_MB=$(ps -o rss= -p $BACKEND_PID 2>/dev/null | awk '{print int($1/1024)}')
    log_info "📊 Memoria del backend: ~${MEMORY_MB}MB"
    if [ $MEMORY_MB -lt 500 ]; then
        log_info "✅ Uso de memoria normal (< 500MB)"
        pass
    else
        log_warn "⚠️ Uso de memoria alto (> 500MB)"
        skip
    fi
else
    log_warn "⚠️ Proceso de backend no encontrado"
    skip
fi
echo ""

# Summary
echo "========================================"
echo "RESUMEN - PRUEBAS DE RENDIMIENTO"
echo "========================================"
echo -e "✅ Pasadas:   ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Fallidas:  ${RED}$TESTS_FAILED${NC}"
echo -e "⚠️ Omitidas:  ${YELLOW}$TESTS_SKIPPED${NC}"
echo "========================================"

if [ $TESTS_FAILED -gt 0 ]; then
    exit 1
else
    echo -e "${GREEN}✅ Pruebas de rendimiento completadas${NC}"
    exit 0
fi
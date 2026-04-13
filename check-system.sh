#!/bin/bash
# Teacher Tool - System Health Check Script
# Usage: ./check-system.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3001"
FRONTEND_BASE="http://localhost:5173"
DB_PATH="./backend/database/teacher_tool.db"

echo "=============================================="
echo "  Teacher Tool - System Health Check"
echo "=============================================="
echo ""

# Counter for passed/failed checks
PASSED=0
FAILED=0

# Helper function to print status
print_check() {
    if [ "$1" = "OK" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# ============================================
# 1. BACKEND SERVER
# ============================================
echo "--- Backend Server ---"

# Check if backend port is listening
if lsof -i:3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_check "OK" "Backend server running on port 3001"
else
    print_check "FAIL" "Backend server NOT running on port 3001"
fi

# Check if backend API responds
if curl -s -f -o /dev/null "${API_BASE}/api/sessions"; then
    print_check "OK" "Backend API responding (sessions endpoint)"
else
    print_check "FAIL" "Backend API not responding"
fi

# ============================================
# 2. DATABASE
# ============================================
echo ""
echo "--- Database ---"

if [ -f "$DB_PATH" ]; then
    print_check "OK" "Database file exists: $DB_PATH"
    
    # Check database size
    DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
    print_info "Database size: $DB_SIZE"
    
    # Check if we can query the database
    if sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sessions;" >/dev/null 2>&1; then
        SESSION_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sessions;")
        print_check "OK" "Database queries work (sessions count: $SESSION_COUNT)"
    else
        print_check "FAIL" "Cannot query database"
    fi
else
    print_check "FAIL" "Database file not found: $DB_PATH"
fi

# ============================================
# 3. FRONTEND
# ============================================
echo ""
echo "--- Frontend ---"

if lsof -i:5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_check "OK" "Frontend dev server running on port 5173"
else
    print_check "FAIL" "Frontend dev server NOT running on port 5173"
fi

# Check if frontend is accessible
if curl -s -f -o /dev/null "${FRONTEND_BASE}"; then
    print_check "OK" "Frontend is accessible at $FRONTEND_BASE"
else
    print_check "FAIL" "Frontend not accessible"
fi

# ============================================
# 4. OLLAMA (Local Models)
# ============================================
echo ""
echo "--- Ollama (Local Models) ---"

# Check if Ollama service is running
if curl -s -f -o /dev/null http://localhost:11434/api/tags; then
    print_check "OK" "Ollama service is running on port 11434"
    
    # Get list of available models
    print_info "Available Ollama models:"
    curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | while read model; do
        echo "     - $model"
    done
else
    print_check "FAIL" "Ollama service NOT running"
    print_info "Install and start Ollama with: curl -fsSL https://ollama.com/install.sh | sh && ollama serve"
fi

# ============================================
# 5. OPENROUTER (Cloud Models)
# ============================================
echo ""
echo "--- OpenRouter (Cloud Models) ---"

# Check API key environment variable
if [ -n "$OPENROUTER_API_KEY" ]; then
    print_check "OK" "OPENROUTER_API_KEY is configured"
    
    # Check OpenRouter API connectivity
    if curl -s -f -o /dev/null -H "Authorization: Bearer $OPENROUTER_API_KEY" "https://openrouter.ai/api/v1/models"; then
        print_check "OK" "OpenRouter API is accessible"
    else
        print_check "FAIL" "Cannot reach OpenRouter API (check internet connection)"
    fi
else
    print_check "FAIL" "OPENROUTER_API_KEY not set in environment"
    print_info "Set with: export OPENROUTER_API_KEY=your_key_here"
fi

# ============================================
# 6. PYTHON DEPENDENCIES
# ============================================
echo ""
echo "--- Python Dependencies ---"

REQUIRED_PKGS=("pdfplumber" "pypdf" "docx")
for pkg in "${REQUIRED_PKGS[@]}"; do
    if python3 -c "import $pkg" 2>/dev/null; then
        print_check "OK" "Python package: $pkg"
    else
        print_check "FAIL" "Python package missing: $pkg"
        print_info "Install with: pip install $pkg"
    fi
done

# ============================================
# 7. NODE DEPENDENCIES
# ============================================
echo ""
echo "--- Node Dependencies ---"

if [ -f "./backend/node_modules/express/package.json" ]; then
    print_check "OK" "Node modules installed in backend"
else
    print_check "FAIL" "Node modules not installed in backend"
    print_info "Run: npm run install:all"
fi

if [ -f "./frontend/node_modules/vite/package.json" ]; then
    print_check "OK" "Node modules installed in frontend"
else
    print_check "FAIL" "Node modules not installed in frontend"
    print_info "Run: npm run install:all"
fi

# ============================================
# 8. STORAGE DIRECTORIES
# ============================================
echo ""
echo "--- Storage Directories ---"

STORAGE_DIRS=(
    "./backend/storage/uploads"
    "./backend/storage/generated"
)

for dir in "${STORAGE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_check "OK" "Storage directory exists: $dir"
    else
        print_check "FAIL" "Storage directory missing: $dir"
        print_info "Create with: mkdir -p $dir"
    fi
done

# ============================================
# 9. ENVIRONMENT VARIABLES
# ============================================
echo ""
echo "--- Environment Variables ---"

ENV_VARS=("OPENROUTER_API_KEY" "PORT")
for var in "${ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        print_check "OK" "$var is set"
    else
        print_info "$var not set (may use defaults)"
    fi
done

# ============================================
# 10. LIBREOFFICE
# ============================================
echo ""
echo "--- LibreOffice ---"

if command -v libreoffice &> /dev/null; then
    LO_VERSION=$(libreoffice --version 2>/dev/null | head -1)
    print_check "OK" "LibreOffice installed: $LO_VERSION"
else
    print_check "FAIL" "LibreOffice not installed"
    print_info "Install with: sudo apt install libreoffice"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "=============================================="
echo "  Summary"
echo "=============================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed! System is ready.${NC}"
    echo ""
    echo "To start the application:"
    echo "  npm run dev"
else
    echo -e "${YELLOW}Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - Backend not running: cd backend && npm start"
    echo "  - Frontend not running: cd frontend && npm run dev"
    echo "  - Ollama not running: ollama serve"
fi
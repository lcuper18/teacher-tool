#!/bin/bash
# =============================================================================
# Teacher Tool - Script de Instalación
# =============================================================================
# Este script instala todas las dependencias necesarias para Teacher Tool
# Usage: ./scripts/install.sh
# =============================================================================

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_step() {
    echo -e "${BLUE}➤ $*${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $*${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $*${NC}"
}

print_error() {
    echo -e "${RED}✗ $*${NC}"
}

# Detectar SO
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            echo "debian"
        elif command -v dnf &> /dev/null; then
            echo "fedora"
        elif command -v pacman &> /dev/null; then
            echo "arch"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Verificar prerequisites
check_prerequisites() {
    print_step "Verificando prerequisites..."

    local errors=0

    # Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$node_version" -ge 18 ]]; then
            print_success "Node.js $(node --version) ✓"
        else
            print_error "Node.js $(node --version) - Se requiere versión 18+"
            errors=$((errors + 1))
        fi
    else
        print_error "Node.js no instalado"
        errors=$((errors + 1))
    fi

    # Python
    if command -v python3 &> /dev/null; then
        local py_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f2)
        if [[ "$py_version" -ge 12 ]]; then
            print_success "Python $(python3 --version) ✓"
        else
            print_warning "Python $(python3 --version) - Se recomienda versión 3.12+"
        fi
    else
        print_error "Python 3 no instalado"
        errors=$((errors + 1))
    fi

    # npm
    if command -v npm &> /dev/null; then
        print_success "npm $(npm --version) ✓"
    else
        print_error "npm no instalado"
        errors=$((errors + 1))
    fi

    if [[ $errors -gt 0 ]]; then
        print_error "Faltan prerequisites necesarios"
        exit 1
    fi

    echo ""
}

# Crear directorio .venv si no existe
setup_python_venv() {
    print_step "Configurando entorno Python..."

    if [[ ! -d ".venv" ]]; then
        python3 -m venv .venv
        print_success "Entorno virtual .venv creado"
    else
        print_success "Entorno virtual .venv ya existe"
    fi

    # Activar venv e instalar dependencias
    source .venv/bin/activate
    pip install --upgrade pip -q
    pip install pdfplumber pypdf python-docx -q
    print_success "Dependencias Python instaladas"

    deactivate
    echo ""
}

# Instalar dependencias npm
install_npm_deps() {
    print_step "Instalando dependencias npm..."

    # Root dependencies
    if [[ -f "package.json" ]]; then
        npm install
        print_success "Dependencias root instaladas"
    fi

    # Backend dependencies
    if [[ -f "backend/package.json" ]]; then
        cd backend && npm install
        print_success "Dependencias backend instaladas"
        cd ..
    fi

    # Frontend dependencies
    if [[ -f "frontend/package.json" ]]; then
        cd frontend && npm install
        print_success "Dependencias frontend instaladas"
        cd ..
    fi

    echo ""
}

# Verificar LibreOffice
check_libreoffice() {
    print_step "Verificando LibreOffice..."

    if command -v libreoffice &> /dev/null; then
        local lo_version=$(libreoffice --version 2>/dev/null | head -1 || echo "desconocida")
        print_success "LibreOffice $lo_version ✓"
    else
        print_warning "LibreOffice no encontrado - La conversión de .doc no funcionará"
        print_warning "Instalar con: sudo apt-get install libreoffice (Debian/Ubuntu)"
        print_warning "O descargar desde: https://www.libreoffice.org/download/"
    fi
    echo ""
}

# Verificar/crear archivo .env
setup_env_file() {
    print_step "Configurando archivo .env..."

    if [[ -f ".env" ]]; then
        print_success "Archivo .env ya existe"
    elif [[ -f ".env.example" ]]; then
        cp .env.example .env
        print_success "Archivo .env creado desde .env.example"
        print_warning "Recuerda configurar OPENROUTER_API_KEY en .env"
    else
        print_warning "No se encontró .env.example"
    fi
    echo ""
}

# Verificar Ollama (opcional)
check_ollama() {
    print_step "Verificando Ollama (opcional)..."

    if command -v ollama &> /dev/null; then
        local ollama_version=$(ollama --version 2>/dev/null || echo "desconocida")
        print_success "Ollama $ollama_version ✓"

        # Verificar si está corriendo
        if curl -s http://localhost:11434/api/tags &>/dev/null; then
            print_success "Servicio Ollama está corriendo"

            # Listar modelos
            echo -e "\n${BLUE}  Modelos Ollama disponibles:${NC}"
            ollama list 2>/dev/null | grep -E "NAME|qwen|gemma|granite" || echo "    (ninguno de Teacher Tool)"
        else
            print_warning "Ollama instalado pero no está corriendo"
            print_warning "Iniciar con: ollama serve"
        fi
    else
        print_warning "Ollama no instalado (opcional - para modelos locales)"
        print_warning "Instalar con: curl -fsSL https://ollama.ai/install.sh | sh"
    fi
    echo ""
}

# Main
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║            Teacher Tool - Script de Instalación             ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""

    local os=$(detect_os)
    echo -e "${BLUE}  Sistema detectado: $os${NC}"
    echo ""

    check_prerequisites
    setup_python_venv
    install_npm_deps
    check_libreoffice
    setup_env_file
    check_ollama

    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                 Instalación completada!                       ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "  Para ejecutar:"
    echo "    ./scripts/run.sh"
    echo ""
    echo "  O manualmente:"
    echo "    npm run dev"
    echo ""
}

main "$@"
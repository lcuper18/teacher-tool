#!/bin/bash
# =============================================================================
# Teacher Tool - Script de Ejecución
# =============================================================================
# Este script inicia Teacher Tool (backend + frontend)
# Usage: ./scripts/run.sh [opciones]
# Options:
#   --backend-only   Solo backend
#   --frontend-only  Solo frontend
#   --check          Verificar estado sin iniciar
# =============================================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuración
BACKEND_PORT=${PORT:-3001}
FRONTEND_PORT=${VITE_PORT:-5173}
BACKEND_URL="http://localhost:$BACKEND_PORT"
FRONTEND_URL="http://localhost:$FRONTEND_PORT"

# Funciones
print_status() {
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

# Verificar que el backend está listo
wait_for_backend() {
    print_status "Esperando que el backend esté listo..."
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -s --max-time 2 "$BACKEND_URL/api/health" &>/dev/null; then
            print_success "Backend listo!"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done

    print_error "Backend no respondió después de $max_attempts segundos"
    return 1
}

# Verificar estado del sistema
check_status() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║              Teacher Tool - Estado del Sistema              ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""

    local has_errors=0

    # Backend
    print_status "Backend ($BACKEND_URL)..."
    if curl -s --max-time 3 "$BACKEND_URL/api/health" &>/dev/null; then
        local health=$(curl -s "$BACKEND_URL/api/health")
        local db_status=$(echo "$health" | grep -o '"database":{"status":"[^"]*"' | cut -d'"' -f4)
        local ollama_status=$(echo "$health" | grep -o '"ollama":{"status":"[^"]*"' | cut -d'"' -f4)
        local openrouter_status=$(echo "$health" | grep -o '"openrouter":{"status":"[^"]*"' | cut -d'"' -f4)

        if [[ "$db_status" == "ok" ]]; then
            print_success "Base de datos ✓"
        else
            print_error "Base de datos ✗"
            has_errors=$((has_errors + 1))
        fi

        if [[ "$openrouter_status" == "ok" ]]; then
            print_success "OpenRouter API ✓"
        else
            print_warning "OpenRouter API: configurar OPENROUTER_API_KEY"
        fi

        if [[ "$ollama_status" == "ok" ]]; then
            print_success "Ollama (modelos locales) ✓"
        else
            print_warning "Ollama: no disponible (opcional)"
        fi
    else
        print_error "Backend no corriendo ✗"
        print_warning "Ejecutar: ./scripts/run.sh"
        has_errors=$((has_errors + 1))
    fi

    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                      URLs de Acceso                           ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "  Frontend:  ${CYAN}$FRONTEND_URL${NC}"
    echo -e "  Backend:   ${CYAN}$BACKEND_URL${NC}"
    echo -e "  Health:    ${CYAN}$BACKEND_URL/api/health${NC}"
    echo ""

    if [[ $has_errors -gt 0 ]]; then
        echo "  Estado: ${YELLOW}Revisar configuración${NC}"
    else
        echo "  Estado: ${GREEN}Listo para usar${NC}"
    fi
    echo ""

    return $has_errors
}

# Iniciar backend
start_backend() {
    print_status "Iniciando backend..."
    cd backend
    nohup node server.js > ../logs/backend.log 2>&1 &
    local backend_pid=$!
    cd ..
    print_success "Backend iniciado (PID: $backend_pid)"
    echo $backend_pid > .backend.pid
}

# Iniciar frontend
start_frontend() {
    print_status "Iniciando frontend..."
    cd frontend
    nohup npm run dev -- --port $FRONTEND_PORT > ../logs/frontend.log 2>&1 &
    local frontend_pid=$!
    cd ..
    print_success "Frontend iniciado (PID: $frontend_pid)"
    echo $frontend_pid > .frontend.pid
}

# Detener servicios
stop_services() {
    print_status "Deteniendo servicios..."

    if [[ -f .backend.pid ]]; then
        local backend_pid=$(cat .backend.pid)
        if kill -0 $backend_pid 2>/dev/null; then
            kill $backend_pid 2>/dev/null
            print_success "Backend detenido"
        fi
        rm .backend.pid
    fi

    if [[ -f .frontend.pid ]]; then
        local frontend_pid=$(cat .frontend.pid)
        if kill -0 $frontend_pid 2>/dev/null; then
            kill $frontend_pid 2>/dev/null
            print_success "Frontend detenido"
        fi
        rm .frontend.pid
    fi

    # Limpiar cualquier proceso huérfano
    pkill -f "node server.js" 2>/dev/null && print_success "Procesos huérfanos limpiados" || true
    pkill -f "vite" 2>/dev/null && print_success "Procesos Vite limpiados" || true

    echo ""
}

# Abrir navegador
open_browser() {
    local url="$FRONTEND_URL"

    case "$(uname -s)" in
        Linux*)
            if command -v xdg-open &> /dev/null; then
                xdg-open "$url" &>/dev/null
            elif command -v gnome-open &> /dev/null; then
                gnome-open "$url" &>/dev/null
            fi
            ;;
        Darwin*)
            command -v open &>/dev/null && open "$url" &>/dev/null
            ;;
        CYGWIN*|MINGW*)
            start "$url" &>/dev/null
            ;;
    esac
}

# Mostrar ayuda
show_help() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                Teacher Tool - Script de Ejecución           ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Uso: ./scripts/run.sh [opciones]"
    echo ""
    echo "Opciones:"
    echo "  (sin opciones)     Iniciar backend + frontend"
    echo "  --check            Verificar estado del sistema"
    echo "  --backend-only     Iniciar solo el backend"
    echo "  --frontend-only    Iniciar solo el frontend"
    echo "  --stop             Detener todos los servicios"
    echo "  --restart          Reiniciar servicios"
    echo "  --help             Mostrar esta ayuda"
    echo ""
    echo "Variables de entorno (opcionales):"
    echo "  PORT=$BACKEND_PORT           Puerto del backend"
    echo "  VITE_PORT=$FRONTEND_PORT     Puerto del frontend"
    echo ""
}

# Main
main() {
    # Crear directorio de logs
    mkdir -p logs

    # Parsear argumentos
    case "${1:-}" in
        --check)
            check_status
            exit $?
            ;;
        --backend-only)
            start_backend
            wait_for_backend
            check_status
            ;;
        --frontend-only)
            start_backend
            wait_for_backend
            start_frontend
            open_browser
            ;;
        --stop)
            stop_services
            print_success "Servicios detenidos"
            exit 0
            ;;
        --restart)
            stop_services
            sleep 2
            main
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        "")
            stop_services  # Limpiar cualquier proceso anterior
            sleep 1

            echo ""
            echo "╔═══════════════════════════════════════════════════════════════╗"
            echo "║                  Teacher Tool - Iniciando                    ║"
            echo "╚═══════════════════════════════════════════════════════════════╝"
            echo ""

            start_backend
            wait_for_backend || exit 1
            start_frontend

            echo ""
            echo "╔═══════════════════════════════════════════════════════════════╗"
            echo "║                    ¡Teacher Tool listo!                     ║"
            echo "╚═══════════════════════════════════════════════════════════════╝"
            echo ""
            echo "  Accede a: $FRONTEND_URL"
            echo ""
            echo "  Presiona Ctrl+C para detener"
            echo ""

            # Abrir navegador automáticamente
            sleep 2
            open_browser

            # Mantener script ejecutándose
            wait
            ;;
        *)
            print_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
}

# Trap para limpiar al salir
trap 'stop_services; exit 0' INT TERM

main "$@"
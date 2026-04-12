#!/bin/bash
# =====================================================
# Teacher Tool - Script de Instalación e Inicio
# =====================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  Teacher Tool - Instalación e Inicio${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Función para mostrar mensajes
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =====================================================
# FUNCIÓN: Instalar dependencias
# =====================================================
install_deps() {
  log_info "Instalando dependencias..."
  
  # Instalar dependencias del proyecto raíz
  if [ -f "$PROJECT_DIR/package.json" ]; then
    log_info "Instalando dependencias del proyecto raíz..."
    cd "$PROJECT_DIR"
    npm install
  fi
  
  # Instalar dependencias del backend
  if [ -f "$BACKEND_DIR/package.json" ]; then
    log_info "Instalando dependencias del backend..."
    cd "$BACKEND_DIR"
    npm install
    
    # Compilar módulos nativos
    log_info "Compilando módulos nativos (better-sqlite3)..."
    npm rebuild better-sqlite3 || log_warn "Advertencia: Error al compilar better-sqlite3"
  fi
  
  # Instalar dependencias del frontend
  if [ -f "$FRONTEND_DIR/package.json" ]; then
    log_info "Instalando dependencias del frontend..."
    cd "$FRONTEND_DIR"
    npm install
  fi
  
  cd "$PROJECT_DIR"
  log_info "✅ Dependencias instaladas correctamente"
}

# =====================================================
# FUNCIÓN: Iniciar aplicación
# =====================================================
start_app() {
  log_info "Iniciando Teacher Tool..."
  
  # Verificar que las dependencias están instaladas
  if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    log_error "Las dependencias no están instaladas. Ejecuta primero: $0 install"
    exit 1
  fi
  
  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    log_error "Las dependencias del frontend no están instaladas. Ejecuta primero: $0 install"
    exit 1
  fi
  
  # Verificar que better-sqlite3 está compilado
  if [ ! -f "$BACKEND_DIR/node_modules/better-sqlite3/build/Release/better_sqlite3.node" ] && \
     [ ! -f "$BACKEND_DIR/node_modules/better-sqlite3/prebuilds/linux-x64/node-v108/better_sqlite3.node" ]; then
    log_warn "better-sqlite3 no está compilado. Ejecutando npm rebuild..."
    cd "$BACKEND_DIR"
    npm rebuild better-sqlite3
    cd "$PROJECT_DIR"
  fi
  
  echo ""
  log_info "Iniciando backend y frontend..."
  log_info "  Backend: http://localhost:3001"
  log_info "  Frontend: http://localhost:5173"
  echo ""
  log_warn "Presiona Ctrl+C para detener"
  echo ""
  
  # Iniciar aplicación
  cd "$PROJECT_DIR"
  npm run dev
}

# =====================================================
# FUNCIÓN: Solo iniciar backend
# =====================================================
start_backend() {
  log_info "Iniciando solo el backend..."
  
  cd "$BACKEND_DIR"
  node server.js
}

# =====================================================
# FUNCIÓN: Solo iniciar frontend
# =====================================================
start_frontend() {
  log_info "Iniciando solo el frontend..."
  
  cd "$FRONTEND_DIR"
  npm run dev
}

# =====================================================
# FUNCIÓN: Verificar estado
# =====================================================
status_check() {
  log_info "Verificando estado de Teacher Tool..."
  
  # Verificar backend
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "  Backend:  ${GREEN}✅ Corriendo${NC} (http://localhost:3001)"
  else
    echo -e "  Backend:  ${RED}❌ Detenido${NC}"
  fi
  
  # Verificar frontend
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "  Frontend: ${GREEN}✅ Corriendo${NC} (http://localhost:5173)"
  else
    echo -e "  Frontend: ${RED}❌ Detenido${NC}"
  fi
  
  # Verificar sesiones
  SESSIONS=$(curl -s http://localhost:3001/api/sessions 2>/dev/null | grep -o '"total":[0-9]*' | cut -d: -f2)
  if [ -n "$SESSIONS" ]; then
    echo -e "  Sesiones: ${GREEN}$SESSIONS${NC} en base de datos"
  fi
}

# =====================================================
# FUNCIÓN: Limpiar installation
# =====================================================
clean() {
  log_warn "Limpiando instalación..."
  
  rm -rf "$BACKEND_DIR/node_modules"
  rm -rf "$FRONTEND_DIR/node_modules"
  rm -rf "$BACKEND_DIR/database"
  rm -rf "$BACKEND_DIR/storage/uploads"
  rm -rf "$BACKEND_DIR/storage/generated"
  rm -rf "$FRONTEND_DIR/dist"
  
  log_info "✅ Limpieza completada"
}

# =====================================================
# MENÚ PRINCIPAL
# =====================================================
case "${1:-help}" in
  install)
    install_deps
    ;;
  start)
    start_app
    ;;
  backend)
    start_backend
    ;;
  frontend)
    start_frontend
    ;;
  status)
    status_check
    ;;
  clean)
    clean
    ;;
  help|*)
    echo "Uso: $0 <comando>"
    echo ""
    echo "Comandos disponibles:"
    echo "  install   - Instalar todas las dependencias"
    echo "  start     - Iniciar backend + frontend"
    echo "  backend   - Iniciar solo el backend"
    echo "  frontend  - Iniciar solo el frontend"
    echo "  status    - Verificar estado de la aplicación"
    echo "  clean     - Eliminar archivos temporales"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 install    # Instalar todo"
    echo "  $0 start      # Iniciar aplicación"
    echo "  $0 status     # Ver estado"
    ;;
esac
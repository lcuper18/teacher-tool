import { FileText, Trash2, Clock } from 'lucide-react';
import Badge from './ui/Badge.jsx';

function SessionItem({ session, isActive, onClick, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const materialColors = {
    guia: 'blue',
    ejercicios: 'green',
    plan_clase: 'purple',
    niveles: 'yellow',
    mapa: 'cyan',
    glosario: 'accent'
  };

  const materialNames = {
    guia: 'Guía',
    ejercicios: 'Ejercicios',
    plan_clase: 'Plan',
    niveles: 'Nivel',
    mapa: 'Mapa',
    glosario: 'Glosario'
  };

  return (
    <div
      onClick={() => onClick(session)}
      className={`
        group flex items-center justify-between p-3 rounded-lg cursor-pointer
        transition-colors duration-200
        ${isActive 
          ? 'bg-accent/20 border border-accent' 
          : 'hover:bg-bg-card border border-transparent'
        }
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 flex-shrink-0 text-text-secondary" />
          <span className="text-sm text-text-primary truncate">
            {session.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge color={materialColors[session.material_type] || 'accent'}>
            {materialNames[session.material_type] || session.material_type}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Clock className="w-3 h-3" />
            {formatDate(session.created_at)}
          </span>
        </div>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-text-secondary hover:text-red-400 hover:bg-bg-input transition-all"
        title="Eliminar sesión"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default SessionItem;
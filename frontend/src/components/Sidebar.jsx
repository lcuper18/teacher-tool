import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Clock } from 'lucide-react';
import SessionItem from './SessionItem.jsx';
import Spinner from './ui/Spinner.jsx';

function Sidebar({ sessions, selectedId, onSelectSession, onDeleteSession, onRefresh, loading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Group sessions by date
  const groupByDate = useCallback((sessions) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: []
    };

    if (!sessions || sessions.length === 0) {
      return groups;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    sessions.forEach(session => {
      const sessionDate = new Date(session.created_at);
      
      if (sessionDate >= today) {
        groups.today.push(session);
      } else if (sessionDate >= yesterday) {
        groups.yesterday.push(session);
      } else if (sessionDate >= weekAgo) {
        groups.thisWeek.push(session);
      } else {
        groups.earlier.push(session);
      }
    });

    return groups;
  }, []);

  // Filter sessions by search query
  const filteredSessions = searchQuery
    ? sessions.filter(s => 
        s.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  const groupedSessions = groupByDate(filteredSessions);

  const handleDelete = (session) => {
    setShowDeleteConfirm(session);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      await onDeleteSession(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  const renderGroup = (title, groupSessions) => {
    if (groupSessions.length === 0) {
      return null;
    }

    return (
      <div className="mb-4">
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {groupSessions.map(session => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={selectedId === session.id}
              onClick={() => onSelectSession(session)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-bg-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-2 bg-bg-input rounded-lg text-sm text-text-primary placeholder:text-text-secondary border border-border focus:outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-auto p-3">
        {loading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="medium" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-secondary">
            <Clock className="w-8 h-8 mb-2" />
            <p className="text-sm">No hay sesiones</p>
          </div>
        ) : (
          <>
            {renderGroup('Hoy', groupedSessions.today)}
            {renderGroup('Ayer', groupedSessions.yesterday)}
            {renderGroup('Esta semana', groupedSessions.thisWeek)}
            {renderGroup('Anterior', groupedSessions.earlier)}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-card rounded-lg p-4 mx-4 max-w-sm">
            <h3 className="text-text-primary font-medium mb-2">Eliminar sesión</h3>
            <p className="text-text-secondary text-sm mb-4">
              ¿Estás seguro de que quieres eliminar "{showDeleteConfirm.title}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
import { useState, useCallback } from 'react';

const API_BASE = '/api';

export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch all sessions (paginated)
  const fetchSessions = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/sessions?page=${pageNum}&limit=20`);
      
      if (!res.ok) {
        throw new Error('Error al cargar sesiones');
      }

      const data = await res.json();
      
      if (pageNum === 1) {
        setSessions(data.sessions || []);
      } else {
        setSessions(prev => [...prev, ...(data.sessions || [])]);
      }
      
      setHasMore((data.sessions || []).length === 20);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more sessions (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchSessions(page + 1);
    }
  }, [loading, hasMore, page, fetchSessions]);

  // Refresh sessions
  const refresh = useCallback(() => {
    setPage(1);
    fetchSessions(1);
  }, [fetchSessions]);

  // Get single session
  const getSession = useCallback(async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
      
      if (!res.ok) {
        throw new Error('Error al cargar sesión');
      }

      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Error al eliminar sesión');
      }

      // Remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Group sessions by date
  const groupByDate = useCallback((sessions) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: []
    };

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

  return {
    sessions,
    loading,
    error,
    hasMore,
    page,
    fetchSessions,
    loadMore,
    refresh,
    getSession,
    deleteSession,
    groupByDate
  };
}

export default useSessions;
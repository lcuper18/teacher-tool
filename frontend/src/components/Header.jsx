import { useState } from 'react';
import { BookOpen, Settings, Cloud, HardDrive, Activity } from 'lucide-react';
import SettingsModal from './SettingsModal.jsx';

function Header({ model, onModelChange, onNewSession }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // OpenRouter models (cloud)
  const openRouterModels = [
    { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'cloud', icon: Cloud },
    { id: 'minimax/minimax-01', name: 'MiniMax 2.7', provider: 'cloud', icon: Cloud }
  ];
  
  // Ollama models (local)
  const ollamaModels = [
    { id: 'ollama/gemma3:1b', name: 'Gemma 3 (1B)', provider: 'local', icon: HardDrive },
    { id: 'ollama/qwen3.5:2b', name: 'Qwen 3.5 (2B)', provider: 'local', icon: HardDrive },
    { id: 'ollama/granite4:3b', name: 'Granite 4 (3B)', provider: 'local', icon: HardDrive }
  ];

  // Check system status
  const checkSystemStatus = async () => {
    setStatusLoading(true);
    setShowStatus(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setSystemStatus(data);
    } catch (err) {
      setSystemStatus({ status: 'error', message: 'No se pudo conectar al servidor' });
    }
    setStatusLoading(false);
  };

  // Get status color
  const getStatusColor = (check) => {
    if (!check) return 'bg-gray-400';
    if (check.status === 'ok') return 'bg-green-500';
    if (check.status === 'offline') return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <>
      <header className="h-14 bg-bg-sidebar border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-accent" />
          <h1 className="text-lg font-semibold text-text-primary">Teacher Tool</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-bg-input text-text-primary px-3 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent"
          >
            <optgroup label="Modelos en la nube (OpenRouter)">
              {openRouterModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
            <optgroup label="Modelos locales (Ollama)">
              {ollamaModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
          </select>
          
          <button
            onClick={checkSystemStatus}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors relative"
            title="Estado del sistema"
          >
            <Activity className="w-5 h-5" />
          </button>
          
          {showStatus && (
            <div className="absolute top-12 right-4 w-72 bg-bg-card border border-border rounded-lg shadow-xl z-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Estado del Sistema</span>
                <button 
                  onClick={() => setShowStatus(false)}
                  className="text-text-secondary hover:text-text-primary text-xs"
                >
                  ✕
                </button>
              </div>
              {statusLoading ? (
                <div className="text-text-secondary text-xs">Verificando...</div>
              ) : systemStatus?.checks ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.checks.server)}`}></span>
                    <span className="text-text-secondary">Servidor:</span>
                    <span className="text-text-primary">{systemStatus.checks.server.message}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.checks.database)}`}></span>
                    <span className="text-text-secondary">Base de datos:</span>
                    <span className="text-text-primary">{systemStatus.checks.database.message}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.checks.openrouter)}`}></span>
                    <span className="text-text-secondary">OpenRouter:</span>
                    <span className="text-text-primary">{systemStatus.checks.openrouter.message}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.checks.ollama)}`}></span>
                    <span className="text-text-secondary">Ollama:</span>
                    <span className="text-text-primary">{systemStatus.checks.ollama.message}</span>
                  </div>
                </div>
              ) : (
                <div className="text-red-400 text-xs">Error al cargar estado</div>
              )}
            </div>
          )}
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            title="Configuración"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={onNewSession}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Nueva sesión
          </button>
        </div>
      </header>
      
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}

export default Header;
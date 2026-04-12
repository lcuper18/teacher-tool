import { BookOpen } from 'lucide-react';

function Header({ model, onModelChange, onNewSession }) {
  const models = [
    { id: 'anthropic/claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
    { id: 'minimax/minimax-01', name: 'MiniMax 2.7' }
  ];
  
  return (
    <header className="h-14 bg-bg-sidebar border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-accent" />
        <h1 className="text-lg font-semibold text-text-primary">Teacher Tool</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="bg-bg-input text-text-primary px-3 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent"
        >
          {models.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        
        <button
          onClick={onNewSession}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          Nueva sesión
        </button>
      </div>
    </header>
  );
}

export default Header;
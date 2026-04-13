import Spinner from './ui/Spinner.jsx';

function ProgressBar({ progress = 0, message = '', model = '', onCancel }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="bg-bg-card rounded-lg p-8 w-full max-w-md">
        {/* Header with model info */}
        <div className="flex items-center justify-center mb-6">
          <span className="text-2xl mr-3">🤖</span>
          <span className="text-text-primary font-medium">
            Generando material{model && ` con ${model}`}
          </span>
        </div>
        
        {/* Status message */}
        <div className="text-center mb-4">
          <p className="text-text-secondary text-sm">
            {message || 'Preparando...'}
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="relative w-full h-3 bg-bg-input rounded-full overflow-hidden mb-2">
          <div 
            className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        
        {/* Progress percentage */}
        <div className="text-center mb-6">
          <span className="text-text-primary font-medium text-lg">
            {Math.min(100, Math.max(0, Math.round(progress)))}%
          </span>
        </div>
        
        {/* Cancel button */}
        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 
                     bg-transparent hover:bg-bg-input text-text-secondary hover:text-text-primary
                     border border-border"
          >
            Cancelar
          </button>
        </div>
      </div>
      
      {/* Streaming content preview (smaller, below the progress card) */}
      <div className="mt-4 w-full max-w-md">
        <div className="bg-bg-card rounded-lg p-4 opacity-50">
          <div className="flex items-center gap-2">
            <Spinner size="small" />
            <span className="text-text-secondary text-xs">Recibiendo contenido...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
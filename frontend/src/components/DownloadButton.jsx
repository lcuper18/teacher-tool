import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

function DownloadButton({ sessionId, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/download`);
      
      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `material_${sessionId}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleDownload}
        disabled={loading || !sessionId}
        className="
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          bg-accent hover:bg-accent-hover text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Descargando...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Descargar DOCX</span>
          </>
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

export default DownloadButton;
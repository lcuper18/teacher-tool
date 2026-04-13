import { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import DropZone from './components/DropZone.jsx';
import MaterialSelector from './components/MaterialSelector.jsx';
import ExtraInstructions from './components/ExtraInstructions.jsx';
import ResultViewer from './components/ResultViewer.jsx';
import DownloadButton from './components/DownloadButton.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Button from './components/ui/Button.jsx';
import Spinner from './components/ui/Spinner.jsx';

const API_BASE = '/api';

// Helper to get display name from model ID
function getModelDisplayName(modelId) {
  const modelNames = {
    'deepseek/deepseek-v3.2': 'DeepSeek V3.2',
    'minimax/minimax-01': 'MiniMax 2.7',
    'ollama/gemma3:1b': 'Gemma 3 (1B)',
    'ollama/qwen3.5:2b': 'Qwen 3.5 (2B)',
    'ollama/granite4:3b': 'Granite 4 (3B)'
  };
  return modelNames[modelId] || modelId.split('/').pop();
}

function App() {
  // App states
  const [appState, setAppState] = useState('empty'); // empty, file-loaded, generating, completed
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentModel, setCurrentModel] = useState('deepseek/deepseek-v3.2');
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Material selection state
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [extraInstructions, setExtraInstructions] = useState('');
  
  // Generation state
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generationProgress, setGenerationProgress] = useState({ progress: 0, message: '' });
  
  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);
  
  // Handle new session button
  const handleNewSession = () => {
    setAppState('empty');
    setSelectedSession(null);
    setUploadedFile(null);
    setExtractedText('');
    setSelectedMaterial(null);
    setExtraInstructions('');
    setGeneratedContent('');
    setUploadError(null);
    setGenerationError(null);
    setGenerationProgress({ progress: 0, message: '' });
  };
  
  // Handle session selection from sidebar
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setAppState('completed');
    setGeneratedContent(session.output_text || '');
    setExtractedText(session.input_text || '');
    // Set default material type
    setSelectedMaterial(session.material_type);
  };
  
  // Handle delete session
  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        throw new Error('Error al eliminar sesión');
      }
      
      // If the deleted session was selected, reset the view
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setAppState('empty');
        setGeneratedContent('');
        setExtractedText('');
        setSelectedMaterial(null);
      }
      
      // Refresh the session list
      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };
  
  // Load sessions from API
  const loadSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (file) => {
    setUploadLoading(true);
    setUploadError(null);
    setUploadedFile(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al subir archivo');
      }
      
      setExtractedText(data.text);
      setAppState('file-loaded');
    } catch (error) {
      setUploadError(error.message);
      setUploadedFile(null);
      setAppState('empty');
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Handle generation
  const handleGenerate = async () => {
    if (!selectedMaterial || !extractedText) return;
    
    setGenerating(true);
    setGenerationError(null);
    setGeneratedContent('');
    setAppState('generating');
    setGenerationProgress({ progress: 0, message: 'Conectando con el modelo...' });
    
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentModel,
          material_type: selectedMaterial,
          input_text: extractedText,
          extra_instructions: extraInstructions
        })
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            console.log('📡 Frontend recibió:', data.substring(0, 100));
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              
              // Handle progress events
              if (parsed.type === 'progress') {
                console.log('📊 Progreso:', parsed.progress, parsed.message);
                setGenerationProgress({
                  progress: parsed.progress,
                  message: parsed.message
                });
              }
              
              // Handle content events
              if (parsed.content) {
                setGeneratedContent(prev => prev + parsed.content);
              }
              
              // Handle completion
              if (parsed.done) {
                console.log('✅ Completado:', parsed.sessionId);
                setAppState('completed');
                setSelectedSession(parsed.sessionId);
                loadSessions(); // Refresh session list
                setGenerationProgress({ progress: 100, message: '¡Material generado con éxito!' });
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
    } catch (error) {
      setGenerationError(error.message);
      setAppState('file-loaded');
      setGenerationProgress({ progress: 0, message: '' });
    } finally {
      setGenerating(false);
    }
  };
  
  // Handle cancel generation
  const handleCancel = () => {
    setAppState('file-loaded');
    setGeneratedContent('');
    setGenerationProgress({ progress: 0, message: '' });
  };
  
  // Render main area content based on state
  const renderMainContent = () => {
    if (uploadLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spinner size="large" />
          <span className="ml-3 text-text-secondary">Procesando archivo...</span>
        </div>
      );
    }
    
    if (uploadError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-red-400 mb-4">{uploadError}</div>
          <Button onClick={() => setAppState('empty')}>Intentar de nuevo</Button>
        </div>
      );
    }
    
    if (appState === 'empty' || !uploadedFile) {
      return (
        <DropZone onFileSelect={handleFileUpload} />
      );
    }
    
    if (appState === 'generating' || generating) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto p-6">
            <ProgressBar
              progress={generationProgress.progress}
              message={generationProgress.message}
              model={getModelDisplayName(currentModel)}
              onCancel={handleCancel}
            />
            {generatedContent && (
              <div className="mt-4 prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-text-primary">{generatedContent}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (appState === 'completed' || generatedContent) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto p-6">
            <ResultViewer content={generatedContent} />
          </div>
          {selectedSession && (
            <div className="p-4 border-t border-border flex gap-4">
              <DownloadButton sessionId={selectedSession} />
              <Button variant="secondary" onClick={handleNewSession}>
                Nueva sesión
              </Button>
            </div>
          )}
        </div>
      );
    }
    
    // File uploaded, show configuration
    return (
      <div className="flex flex-col h-full p-6 space-y-6">
        <MaterialSelector
          selected={selectedMaterial}
          onSelect={setSelectedMaterial}
        />
        
        <ExtraInstructions
          value={extraInstructions}
          onChange={setExtraInstructions}
          maxLength={500}
        />
        
        {selectedMaterial && (
          <Button onClick={handleGenerate}>
            Generar material
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header
        model={currentModel}
        onModelChange={setCurrentModel}
        onNewSession={handleNewSession}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sessions={sessions}
          selectedId={selectedSession}
          onSelectSession={handleSessionSelect}
          onDeleteSession={handleDeleteSession}
          onRefresh={loadSessions}
        />
        
        <main className="flex-1 overflow-auto bg-bg-primary">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
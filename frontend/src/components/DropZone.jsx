import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FileText } from 'lucide-react';

function DropZone({ onFileSelect, accept = ['.pdf', '.doc', '.docx'] }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`
        flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed cursor-pointer
        transition-colors duration-200
        ${isDragActive 
          ? 'border-accent bg-accent/10' 
          : 'border-border hover:border-text-secondary hover:bg-bg-card'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <Upload className="w-12 h-12 text-text-secondary mb-4" />
      
      <p className="text-text-primary text-lg mb-2">
        {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo aquí'}
      </p>
      
      <p className="text-text-secondary text-sm">
        o haz clic para seleccionar
      </p>
      
      <p className="text-text-secondary text-xs mt-4">
        Formatos soportados: PDF, DOC, DOCX (máx 10 MB)
      </p>
    </div>
  );
}

export default DropZone;
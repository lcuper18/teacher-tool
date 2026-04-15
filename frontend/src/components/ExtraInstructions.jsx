import { useState, useEffect } from 'react';

function ExtraInstructions({
  value,
  onChange,
  maxLength = 500,
  showNumPreguntas = false,
  numPreguntas,
  onNumPreguntasChange
}) {
  const charCount = value?.length || 0;
  const isNearLimit = charCount > maxLength * 0.8;
  const isAtLimit = charCount >= maxLength;

  // Validation for numPreguntas
  const [error, setError] = useState('');

  useEffect(() => {
    if (showNumPreguntas && numPreguntas !== undefined) {
      if (numPreguntas < 5) {
        setError('Mínimo 5 preguntas');
      } else if (numPreguntas > 50) {
        setError('Máximo 50 preguntas');
      } else {
        setError('');
      }
    }
  }, [numPreguntas, showNumPreguntas]);

  const handleNumPreguntasChange = (e) => {
    const rawValue = e.target.value;
    // Only allow numeric values
    if (rawValue === '' || /^\d+$/.test(rawValue)) {
      const numValue = rawValue === '' ? undefined : parseInt(rawValue, 10);
      onNumPreguntasChange(numValue);
    }
  };

  const isValidNumPreguntas = numPreguntas >= 5 && numPreguntas <= 50;

  return (
    <div className="space-y-4">
      {/* Number of questions input - only shown for examen_seleccion */}
      {showNumPreguntas && (
        <div className="space-y-2">
          <label htmlFor="num-preguntas" className="text-text-primary text-sm font-medium">
            Número de preguntas
          </label>
          <input
            id="num-preguntas"
            type="number"
            min="5"
            max="50"
            value={numPreguntas || ''}
            onChange={handleNumPreguntasChange}
            placeholder="10"
            className="
              w-full h-12 px-4 rounded-lg
              bg-bg-input border border-border
              text-text-primary placeholder:text-text-secondary
              focus:outline-none focus:border-accent
              transition-colors duration-200
            "
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary">
              Rango: 5 - 50 preguntas
            </span>
            {error && (
              <span className="text-xs text-red-400">{error}</span>
            )}
          </div>
        </div>
      )}

      {/* Extra instructions textarea */}
      <div className="space-y-2">
        <label htmlFor="extra-instructions" className="text-text-primary text-sm font-medium">
          Instrucciones adicionales (opcional)
        </label>

        <textarea
          id="extra-instructions"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="Agrega instrucciones específicas para el material..."
          className="
            w-full h-32 p-3 rounded-lg resize-none
            bg-bg-input border border-border
            text-text-primary placeholder:text-text-secondary
            focus:outline-none focus:border-accent
            transition-colors duration-200
          "
        />

        <div className="flex justify-end">
          <span className={`text-xs ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-text-secondary'}`}>
            {charCount} / {maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ExtraInstructions;
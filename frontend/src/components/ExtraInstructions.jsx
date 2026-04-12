function ExtraInstructions({ value, onChange, maxLength = 500 }) {
  const charCount = value?.length || 0;
  const isNearLimit = charCount > maxLength * 0.8;
  const isAtLimit = charCount >= maxLength;

  return (
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
  );
}

export default ExtraInstructions;
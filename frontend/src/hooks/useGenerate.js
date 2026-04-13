import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for generating materials with streaming support
 * Uses fetch + ReadableStream (NOT EventSource) for SSE
 */
export const useGenerate = () => {
  const [status, setStatus] = useState('idle'); // idle, generating, completed, error
  const [output, setOutput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Generate material with streaming
   * @param {Object} params - Generation parameters
   * @param {string} params.model - Model ID
   * @param {string} params.materialType - Type of material
   * @param {string} params.inputText - Extracted text from document
   * @param {string} params.extraInstructions - Optional user instructions
   */
  const generate = useCallback(async ({ model, materialType, inputText, extraInstructions }) => {
    // Reset state
    setOutput('');
    setSessionId(null);
    setError(null);
    setStatus('generating');

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'deepseek/deepseek-v3.2',
          material_type: materialType,
          input_text: inputText,
          extra_instructions: extraInstructions || '',
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la generación');
      }

      // Read the stream using ReadableStream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed = JSON.parse(data);

              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.content) {
                // Append content to output (typing effect handled by UI)
                setOutput((prev) => prev + parsed.content);
              }

              if (parsed.done) {
                setSessionId(parsed.sessionId);
                setStatus('completed');
              }
            } catch (e) {
              // Not valid JSON, might be [DONE] - ignore
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Cancelled by user
        setStatus('idle');
        setOutput('');
        setSessionId(null);
      } else {
        // Error from server or network
        setError(err.message);
        setStatus('error');
      }
    }
  }, []);

  /**
   * Cancel ongoing generation
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Reset to idle state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setOutput('');
    setSessionId(null);
    setError(null);
  }, []);

  return {
    status,
    output,
    sessionId,
    error,
    generate,
    cancel,
    reset,
    isGenerating: status === 'generating',
    isCompleted: status === 'completed',
    isError: status === 'error',
  };
};

export default useGenerate;
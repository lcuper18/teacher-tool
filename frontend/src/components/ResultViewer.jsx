import ReactMarkdown from 'react-markdown';

function ResultViewer({ content }) {
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        No hay contenido para mostrar
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-text-primary mb-4 mt-6">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-text-primary mb-3 mt-5 border-b border-border pb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-text-primary mb-2 mt-4">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium text-text-primary mb-2 mt-3">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-text-primary mb-3 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-text-primary">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-text-primary">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-text-primary">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-text-primary">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-text-secondary">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent pl-4 my-4 text-text-secondary italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-border">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-bg-card">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-text-primary border border-border font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-text-primary border border-border">{children}</td>
          ),
          hr: () => (
            <hr className="my-6 border-border" />
          ),
          code: ({ children }) => (
            <code className="bg-bg-input px-1 py-0.5 rounded text-sm font-mono text-accent">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-bg-input p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono">
              {children}
            </pre>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default ResultViewer;
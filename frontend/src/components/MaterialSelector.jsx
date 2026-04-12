import { BookOpen, PenLine, CalendarDays, BarChart2, GitBranch, Bookmark } from 'lucide-react';

const MATERIALS = [
  { id: 'guia', name: 'Guía de Estudio', icon: BookOpen, color: 'blue', description: 'Resumen jerárquico con conceptos clave' },
  { id: 'ejercicios', name: 'Ejercicios y Evaluación', icon: PenLine, color: 'green', description: '5 opción múltiple + 3 V/F + 2 desarrollo' },
  { id: 'plan_clase', name: 'Plan de Clase', icon: CalendarDays, color: 'purple', description: 'Inicio/desarrollo/cierre, 50 minutos' },
  { id: 'niveles', name: 'Adaptación por Nivel', icon: BarChart2, color: 'yellow', description: 'Básico, estándar y avanzado' },
  { id: 'mapa', name: 'Mapa Conceptual', icon: GitBranch, color: 'cyan', description: 'Jerarquía visual de conceptos' },
  { id: 'glosario', name: 'Glosario de Términos', icon: Bookmark, color: 'accent', description: '10-15 definiciones en lenguaje adolescente' }
];

function MaterialSelector({ selected, onSelect }) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
    green: 'border-green-500 bg-green-500/10 text-green-400',
    purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
    yellow: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    cyan: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
    accent: 'border-accent bg-accent/10 text-accent'
  };

  return (
    <div className="space-y-4">
      <h2 className="text-text-primary text-lg font-medium">Selecciona el tipo de material</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MATERIALS.map((material) => {
          const Icon = material.icon;
          const isSelected = selected === material.id;
          
          return (
            <button
              key={material.id}
              onClick={() => onSelect(material.id)}
              className={`
                flex flex-col items-start p-4 rounded-lg border-2 text-left
                transition-all duration-200 hover:scale-[1.02]
                ${isSelected 
                  ? `${colorClasses[material.color]} border-current` 
                  : 'border-border hover:border-text-secondary bg-bg-card'
                }
              `}
            >
              <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-current' : 'text-text-secondary'}`} />
              
              <span className={`font-medium ${isSelected ? 'text-current' : 'text-text-primary'}`}>
                {material.name}
              </span>
              
              <span className="text-xs mt-1 text-text-secondary">
                {material.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MaterialSelector;
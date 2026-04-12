function Badge({ children, color = 'accent', className = '' }) {
  const colors = {
    accent: 'bg-accent/20 text-accent',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    cyan: 'bg-cyan-500/20 text-cyan-400'
  };
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
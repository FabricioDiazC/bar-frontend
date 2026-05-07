import { FaEraser } from 'react-icons/fa';

export default function BotonLimpiarFiltros({ hayFiltros, onLimpiar }) {
  // Si no hay filtros activos no se va a mostrar nada
  if (!hayFiltros) return <div className="h-9"></div>; 

  return (
    <button
      onClick={onLimpiar}
      className="flex items-center gap-2 text-xs text-bar-muted hover:text-bar-accent transition-all duration-300 cursor-pointer group"
    >
      <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg group-hover:border-bar-accent/50 transition-colors">
        <FaEraser size={12} />
      </div>
      <span className="uppercase tracking-widest font-light">Limpiar Filtros</span>
    </button>
  );
}
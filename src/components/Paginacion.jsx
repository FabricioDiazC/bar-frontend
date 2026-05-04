import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';


export default function Paginacion({ paginaActual, total, limite, onPageChange }) {

  const totalPaginas = Math.ceil(total / limite);

  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8 pb-10">
      <button 
        disabled={paginaActual === 1}
        onClick={() => onPageChange(paginaActual - 1)}
        className="p-2 rounded-full bg-bar-card border border-zinc-800 text-bar-muted hover:text-bar-accent disabled:opacity-30 transition cursor-pointer"
      >
        <FaChevronLeft />
      </button>

      <span className="text-sm text-bar-muted">
        Página <span className="text-bar-text font-medium">{paginaActual}</span> de {totalPaginas}
      </span>

      <button 
        disabled={paginaActual === totalPaginas}
        onClick={() => onPageChange(paginaActual + 1)}
        className="p-2 rounded-full bg-bar-card border border-zinc-800 text-bar-muted hover:text-bar-accent disabled:opacity-30 transition cursor-pointer"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}
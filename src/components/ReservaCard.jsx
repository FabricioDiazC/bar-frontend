import { FaClock, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';

export default function ReservaCard({ reserva, onDelete, onEdit }) {
  const formatFecha = (fechaStr) => {
    const opciones = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(fechaStr + 'T00:00:00').toLocaleDateString('es-ES', opciones);
  };

  return (
    <div className="bg-bar-card border border-zinc-800 rounded-xl p-5 shadow-sm hover:border-zinc-600 transition flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl text-bar-text font-medium">{reserva.cliente_nombre}</h3>
          <span className="text-xs px-2 py-1 rounded bg-zinc-900 text-bar-accent border border-zinc-700 uppercase tracking-wider">
            {reserva.estado.replace('_', ' ')}
          </span>
        </div>
        
        <div className="text-bar-muted text-sm space-y-2 mt-4">
          <p className="flex items-center gap-2">
            <FaClock className="text-zinc-500"/> 
            {formatFecha(reserva.fecha)} • 
            {reserva.hora_inicio?.slice(0,5)} 
            {reserva.hora_fin ? ` a ${reserva.hora_fin.slice(0,5)}` : ''}
          </p>
          <p className="flex items-center gap-2">
            <FaUsers className="text-zinc-500"/> 
            {reserva.cantidad_personas} Personas
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end gap-3">
        <button onClick={() => onEdit(reserva)} className="text-zinc-400 hover:text-white transition cursor-pointer" title="Editar">
          <FaEdit size={18} />
        </button>
        <button onClick={() => onDelete(reserva.id)} className="text-red-500 hover:text-red-400 transition cursor-pointer" title="Eliminar">
          <FaTrash size={18} />
        </button>
      </div>
    </div>
  );
}
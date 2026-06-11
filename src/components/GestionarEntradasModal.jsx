import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTimes, FaTrash, FaSave, FaTicketAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function GestionarEntradasModal({ isOpen, onClose, repreNombre, entradasDelRepre, onActualizar }) {
  const [entradasLocales, setEntradasLocales] = useState([]);

  useEffect(() => {
    // Clonamos los datos para editarlos sin afectar la tabla de fondo hasta que se guarde
    if (isOpen && entradasDelRepre) {
      setEntradasLocales(entradasDelRepre.map(e => ({ ...e })));
    }
  }, [isOpen, entradasDelRepre]);

  const handleCambio = (id, campo, valor) => {
    setEntradasLocales(prev => prev.map(e => e.id === id ? { ...e, [campo]: valor } : e));
  };

  const guardarCambio = async (entrada) => {
    try {
      await api.put(`entradas/${entrada.id}/`, {
        representante: entrada.representante,
        fecha: entrada.fecha,
        tipo: entrada.tipo,
        cantidad_personas: parseInt(entrada.cantidad_personas),
        vouchers: entrada.vouchers // para mantener los vouchers intactos
      });
      toast.success("Cantidad actualizada correctamente");
      onActualizar(); // Refresca la tabla principal
    } catch (error) {
      toast.error("Error al actualizar el registro");
    }
  };

  const borrarRegistro = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta carga de entradas?")) {
      try {
        await api.delete(`entradas/${id}/`);
        toast.success("Registro eliminado");
        onActualizar(); // Refresca la tabla principal
        
        // Lo sacamos de la vista local también
        setEntradasLocales(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        toast.error("Error al eliminar el registro");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-bar-text">
      <div className="bg-bar-card border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer transition-colors"><FaTimes size={20} /></button>

        <div className="p-8">
          <h2 className="text-xl font-light text-bar-accent mb-2 uppercase tracking-widest flex items-center gap-2">
            <FaTicketAlt /> Registros de {repreNombre}
          </h2>
          <p className="text-xs text-bar-muted mb-6">Aquí puedes corregir la cantidad de cada carga individual o eliminar cargas erróneas.</p>

          <div className="space-y-4">
            {entradasLocales.length > 0 ? (
              entradasLocales.map((ent, i) => (
                <div key={ent.id} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Carga #{i + 1}</span>
                    <select 
                      value={ent.tipo} 
                      onChange={(e) => handleCambio(ent.id, 'tipo', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-lg p-2 text-sm focus:border-bar-accent outline-none appearance-none"
                    >
                      <option value="free">Free</option>
                      <option value="cobrada_con_consumible">Cobrada con consumición</option>
                      <option value="cobrada_sin_consumible">Cobrada sin consumición</option>
                    </select>
                  </div>
                  
                  <div className="w-full md:w-32">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Cantidad</span>
                    <input 
                      type="number" min="1" 
                      value={ent.cantidad_personas} 
                      onChange={(e) => handleCambio(ent.id, 'cantidad_personas', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-lg p-2 text-center text-sm font-bold focus:border-bar-accent outline-none"
                    />
                  </div>

                  <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-5">
                    <button 
                      onClick={() => guardarCambio(ent)} 
                      className="flex-1 md:flex-none bg-bar-accent text-black p-2.5 rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                      title="Guardar Cambios"
                    >
                      <FaSave />
                    </button>
                    <button 
                      onClick={() => borrarRegistro(ent.id)} 
                      className="flex-1 md:flex-none bg-zinc-800 text-red-500 p-2.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 border border-zinc-700 transition-colors"
                      title="Eliminar Registro"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 italic py-6">No quedan registros.</p>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-800 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
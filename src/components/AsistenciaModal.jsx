import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTimes, FaSearch, FaCheckCircle, FaClock,FaUsers } from 'react-icons/fa';

export default function AsistenciaModal({ isOpen, onClose, onConfirm }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [embajadoraSeleccionada, setEmbajadoraSeleccionada] = useState(null);
  
  //Campos para horasde Ingreaso y Egreso
  const [horaIngreso, setHoraIngreso] = useState('');
  const [horaEgreso, setHoraEgreso] = useState('');
  //Campo para cantidad de acompañantes
  const [acompanantes, setAcompanantes] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (busqueda.length > 1 && !embajadoraSeleccionada) {
        try {
          const res = await api.get(`representantes/?search=${busqueda}`);
          const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
          setResultados(data.filter(r => r.estado === 'activo'));
          setMostrarResultados(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setResultados([]);
        setMostrarResultados(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, embajadoraSeleccionada]);

  const seleccionar = (repre) => {
    setEmbajadoraSeleccionada(repre);
    setBusqueda(repre.nombre + (repre.apodo ? ` (${repre.apodo})` : ''));
    setMostrarResultados(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!embajadoraSeleccionada) return;

    onConfirm({
      representante_id: embajadoraSeleccionada.id,
      hora_ingreso: horaIngreso || null,
      hora_egreso: horaEgreso || null,
      cantidad_acompanantes: acompanantes !== '' ? parseInt(acompanantes) : null 
    });

    handleClose();
  };

  const handleClose = () => {
    setBusqueda('');
    setEmbajadoraSeleccionada(null);
    setHoraIngreso('');
    setHoraEgreso(''); 
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-bar-text">
      <div className="bg-bar-card border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer transition-colors"><FaTimes size={20} /></button>

        <div className="p-8">
          <h2 className="text-xl font-light text-bar-accent mb-6 uppercase tracking-widest text-center border-b border-zinc-800 pb-4">Anotar en Lista</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Buscador de Embajadora */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2">Nombre Embajadora *</label>
              <div className="relative group">
                <FaSearch className="absolute left-3 top-3.5 text-zinc-600" size={12} />
                <input 
                  type="text" placeholder="Buscar por nombre..." 
                  value={busqueda} 
                  onChange={(e) => { setBusqueda(e.target.value); setEmbajadoraSeleccionada(null); }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-9 text-sm focus:border-bar-accent outline-none transition-all" 
                />
              </div>
              {mostrarResultados && (
                <ul className="absolute z-50 w-full bg-zinc-900 border border-zinc-800 mt-2 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                  {resultados.map(r => (
                    <li key={r.id} onClick={() => seleccionar(r)} className="p-4 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 flex justify-between items-center text-sm font-light">
                      <span>{r.nombre}</span>
                      <span className="text-xs text-bar-accent">{r.apodo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Horas ingreso y egreso */}
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2">Ingreso</label>
                    <input type="time" value={horaIngreso} onChange={e => setHoraIngreso(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm focus:border-bar-accent outline-none [color-scheme:dark]"/>
                </div>
                <div className="relative">
                    <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2">Egreso</label>
                    <input type="time" value={horaEgreso} onChange={e => setHoraEgreso(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm focus:border-bar-accent outline-none [color-scheme:dark]"/>
                </div>
            </div>

            {/* Cantidad Acompañantes*/}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2 flex justify-between">
                <span>Cantidad Acompañantes</span>
                <span className="text-zinc-600 italic">Opcional</span>
              </label>
              <div className="relative flex items-center">
                  <FaUsers className="absolute left-3 text-zinc-600 pointer-events-none" size={14} />
                  <input 
                    type="number" 
                    min="1" 
                    placeholder="Mínimo 2..."
                    value={acompanantes} 
                    onChange={e => setAcompanantes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-9 text-bar-text focus:border-bar-accent transition-all outline-none text-sm"
                  />
              </div>
              <p className="text-[9px] text-zinc-500 mt-1 italic">* Si trae acompañantes, el número debe ser superior a 1.</p>
            </div>

            <div className="pt-4 flex justify-between gap-3 border-t border-zinc-800 mt-4">
              <button type="button" onClick={handleClose} className="w-1/3 py-3 text-zinc-500 hover:text-white transition-colors cursor-pointer text-[10px] uppercase tracking-widest">Cancelar</button>
              <button type="submit" disabled={!embajadoraSeleccionada} className="w-2/3 bg-bar-accent hover:bg-yellow-600 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all shadow-lg uppercase tracking-widest text-[10px]">
                Confirmar Asistencia
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
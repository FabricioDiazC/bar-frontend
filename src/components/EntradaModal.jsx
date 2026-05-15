import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTimes, FaSearch, FaCheckCircle, FaTicketAlt, FaHashtag } from 'react-icons/fa';

export default function EntradaModal({ isOpen, onClose, onConfirm }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [repreSeleccionado, setRepreSeleccionado] = useState(null);

  const [tipoEntrada, setTipoEntrada] = useState('free');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (busqueda.length > 1 && !repreSeleccionado) {
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
  }, [busqueda, repreSeleccionado]);

  const seleccionar = (repre) => {
    setRepreSeleccionado(repre);
    setBusqueda(repre.nombre + (repre.apodo ? ` (${repre.apodo})` : ''));
    setMostrarResultados(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!repreSeleccionado) return;

    // Pasar los datos al back
    onConfirm({
      representante: repreSeleccionado.id,
      tipo: tipoEntrada,
      cantidad_personas: parseInt(cantidad)
    });

    handleClose();
  };

  const handleClose = () => {
    setBusqueda('');
    setRepreSeleccionado(null);
    setTipoEntrada('free');
    setCantidad(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-bar-card border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl relative text-bar-text">
        <button onClick={handleClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer transition-colors"><FaTimes size={20} /></button>

        <div className="p-8">
          <h2 className="text-xl font-light text-bar-accent mb-6 uppercase tracking-widest text-center border-b border-zinc-800 pb-4">Cargar Entradas</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2 flex justify-between">
                <span>Representante *</span>
                {repreSeleccionado && <span className="text-green-500 flex items-center gap-1"><FaCheckCircle size={10}/> Seleccionado</span>}
              </label>
              <div className="relative group">
                <FaSearch className="absolute left-3 top-3.5 text-zinc-600" size={12} />
                <input 
                  type="text" placeholder="Buscar por nombre o apodo..." 
                  value={busqueda} 
                  onChange={(e) => { setBusqueda(e.target.value); setRepreSeleccionado(null); }}
                  className={`w-full bg-zinc-900 border ${repreSeleccionado ? 'border-green-900/40' : 'border-zinc-700'} rounded-xl p-3 pl-9 text-sm focus:border-bar-accent outline-none transition-all`} 
                />
              </div>
              {mostrarResultados && resultados.length > 0 && (
                <ul className="absolute z-50 w-full bg-zinc-900 border border-zinc-800 mt-2 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                  {resultados.map(r => (
                    <li key={r.id} onClick={() => seleccionar(r)} className="p-4 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 flex justify-between items-center text-sm font-light">
                      <span>{r.nombre}</span>
                      <span className="text-xs text-bar-accent">{r.apodo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2">Tipo de Entrada *</label>
              <div className="relative flex items-center">
                  <FaTicketAlt className="absolute left-3 text-zinc-600 pointer-events-none" size={14} />
                  <select 
                    value={tipoEntrada} 
                    onChange={e => setTipoEntrada(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-9 text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="cobrada_con_consumible">Cobrada con consumición</option>
                    <option value="cobrada_sin_consumible">Cobrada sin consumición</option>
                  </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2">Cantidad Entregada *</label>
              <div className="relative flex items-center">
                  <FaHashtag className="absolute left-3 text-zinc-600 pointer-events-none" size={14} />
                  <input 
                    type="number" min="1" required
                    value={cantidad} 
                    onChange={e => setCantidad(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-9 text-bar-text focus:outline-none focus:border-bar-accent transition-all font-bold"
                  />
              </div>
            </div>

            <div className="pt-4 flex justify-between gap-3 border-t border-zinc-800 mt-6 pt-6">
              <button type="button" onClick={handleClose} className="w-1/3 py-3 text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-widest">Cancelar</button>
              <button type="submit" disabled={!repreSeleccionado || cantidad < 1} className="w-2/3 bg-bar-accent hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg uppercase tracking-widest text-xs">
                Cargar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
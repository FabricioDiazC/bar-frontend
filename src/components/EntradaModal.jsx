import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTimes, FaSearch, FaCheckCircle, FaTicketAlt, FaHashtag, FaGift } from 'react-icons/fa';

export default function EntradaModal({ isOpen, onClose, onConfirm }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [repreSeleccionado, setRepreSeleccionado] = useState(null);

  const [tipoEntrada, setTipoEntrada] = useState('free');
  const [cantidad, setCantidad] = useState(1);
  //Estados para vouchers
  const [vouchersDisponibles, setVouchersDisponibles] = useState([]);
  const [vouchersSeleccionados, setVouchersSeleccionados] = useState([]);

  useEffect(() => {
    if (isOpen) cargarCatalogos();
  }, [isOpen]);

  const cargarCatalogos = async () => {
    try {
      const res = await api.get('vouchers/');
      const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
      setVouchersDisponibles(data.filter(v => v.estado === 'activo'));
    } catch (error) {
      console.error("Error al cargar vouchers", error);
    }
  };


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


  const handleVoucherToggle = (id) => {
    setVouchersSeleccionados(prev => 
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

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
      cantidad_personas: parseInt(cantidad),
      vouchers: vouchersSeleccionados
    });

    handleClose();
  };

  const handleClose = () => {
    setBusqueda('');
    setRepreSeleccionado(null);
    setTipoEntrada('free');
    setCantidad(1);
    setVouchersSeleccionados([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-bar-text">
      <div className="bg-bar-card border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={handleClose} className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors cursor-pointer p-1">
          <FaTimes size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-light text-bar-accent mb-8 uppercase tracking-[0.2em] border-b border-zinc-800 pb-4">Cargar Entradas</h2>

          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* Buscador Representante */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2 flex justify-between">
                <span>Representante / Embajadora *</span>
                {repreSeleccionado && <span className="text-green-500 flex items-center gap-1"><FaCheckCircle size={10}/> Seleccionado</span>}
              </label>
              <div className="relative group">
                <FaSearch className="absolute left-3 top-3 text-zinc-600 group-focus-within:text-bar-accent transition-colors" size={14} />
                <input 
                  type="text" placeholder="Escribe el nombre..." 
                  value={busqueda} 
                  onChange={(e) => { setBusqueda(e.target.value); setRepreSeleccionado(null); }}
                  className={`w-full bg-zinc-900 border ${repreSeleccionado ? 'border-green-900/30' : 'border-zinc-700'} rounded-xl p-3 pl-10 text-sm focus:border-bar-accent outline-none transition-all`} 
                />
              </div>
              {mostrarResultados && resultados.length > 0 && (
                <ul className="absolute z-50 w-full bg-zinc-900 border border-zinc-800 mt-2 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                  {resultados.map(r => (
                    <li key={r.id} onClick={() => { setRepreSeleccionado(r); setBusqueda(r.nombre); setMostrarResultados(false); }} 
                        className="p-4 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 flex justify-between items-center text-sm font-light">
                      <span>{r.nombre}</span>
                      <span className="text-xs text-bar-accent">{r.apodo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tipo y Cantidad en la misma fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2 flex items-center gap-2">
                  <FaTicketAlt className="text-bar-accent" /> Tipo de Acceso
                </label>
                <select value={tipoEntrada} onChange={e => setTipoEntrada(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm focus:border-bar-accent outline-none appearance-none cursor-pointer">
                  <option value="free">Free</option>
                  <option value="cobrada_con_consumible">Cobrada con consumición</option>
                  <option value="cobrada_sin_consumible">Cobrada sin consumición</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2 flex items-center gap-2">
                  <FaHashtag className="text-bar-accent" /> Cantidad Entregada
                </label>
                <input type="number" min="1" required value={cantidad} onChange={e => setCantidad(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-center focus:border-bar-accent outline-none font-bold text-lg" />
              </div>
            </div>

            {/*Vouhcers*/}
            <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/50">
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-4 flex items-center gap-2">
                <FaGift className="text-bar-accent" size={14} /> Vouchers Disponibles
              </label>
              
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vouchersDisponibles.map(v => (
                  <label 
                    key={v.id} 
                    className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer transition-all duration-300 group
                      ${vouchersSeleccionados.includes(v.id) 
                        ? 'bg-bar-accent/10 border-bar-accent' 
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                      }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={vouchersSeleccionados.includes(v.id)}
                      onChange={() => handleVoucherToggle(v.id)}
                      className="w-4 h-4 accent-bar-accent cursor-pointer"
                    />
                    <span className={`text-[11px] uppercase tracking-tight font-medium transition-colors
                      ${vouchersSeleccionados.includes(v.id) ? 'text-bar-accent' : 'text-zinc-400 group-hover:text-bar-text'}
                    `}>
                      {v.nombre}
                    </span>
                  </label>
                ))}
                
                {vouchersDisponibles.length === 0 && (
                  <div className="col-span-full py-4 text-center">
                    <p className="text-[10px] text-zinc-600 italic uppercase tracking-widest">No hay vouchers activos en el sistema</p>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-6 border-t border-zinc-800 flex justify-end gap-4">
              <button type="button" onClick={handleClose} className="px-6 py-3 text-zinc-500 hover:text-white text-[10px] uppercase tracking-widest transition-colors cursor-pointer">
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={!repreSeleccionado} 
                className="bg-bar-accent hover:bg-bar-accent/80 disabled:opacity-30 text-black font-black px-10 py-3 rounded-xl shadow-lg uppercase tracking-widest text-xs transition-all active:scale-95 cursor-pointer"
              >
                Confirmar Carga
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTicketAlt, FaCalendarAlt } from 'react-icons/fa';
import EntradaModal from '../components/EntradaModal';
import { toast } from 'react-toastify';

export default function Entradas() {
  const getToday = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('-');
    return `${day}/${month}/${year}`;
  };

  const [fechaFiltro, setFechaFiltro] = useState(getToday());
  const [listaEntradas, setListaEntradas] = useState([]);
  const [representantesMap, setRepresentantesMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Cargar catálogo de representantes (para traducir los IDs a nombres)
  const fetchRepresentantes = async () => {
    try {
      const res = await api.get('representantes/');
      const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
      const mapa = {};
      data.forEach(repre => {
        mapa[repre.id] = repre;
      });
      setRepresentantesMap(mapa);
    } catch (error) {
      console.error(error);
    }
  };

  // 2. Cargar Entradas desde la base de datos
  const fetchEntradas = async () => {
    try {
      const res = await api.get(`entradas/?fecha=${fechaFiltro}`);
      const datosRecibidos = res.data.results || (Array.isArray(res.data) ? res.data : []);
      setListaEntradas(datosRecibidos);
    } catch (error) {
      console.error(error);
      setListaEntradas([]);
    }
  };

  useEffect(() => { fetchRepresentantes(); }, []);
  useEffect(() => { fetchEntradas(); }, [fechaFiltro]);

  const handleConfirmar = async (nuevaEntrada) => {
    try {
      // Le agregamos la fecha actual de la planilla al objeto que enviamos
      const payload = {
        ...nuevaEntrada,
        fecha: fechaFiltro
      };

      await api.post('entradas/', payload);
      toast.success('Entradas cargadas en el servidor correctamente.');
      fetchEntradas(); // Recargamos para que aparezca
    } catch (error) {
      console.error(error.response?.data);
      toast.error('Error al guardar las entradas. Revisa el servidor.');
    }
  };

  // --- AGRUPACIÓN INTELIGENTE PARA LA PLANILLA ---
  const planilla = listaEntradas.reduce((acc, curr) => {
    const repreId = curr.representante;
    const repreKey = repreId || 'sin_repre'; 
    
    if (!acc[repreKey]) {
      const repreData = representantesMap[repreId] || {};
      acc[repreKey] = {
        nombre: repreId ? (repreData.nombre || 'Cargando...') : 'Sin Representante',
        free: 0,
        cobrada_cc: 0,
        cobrada_sc: 0,
        total_repre: 0
      };
    }
    
    // Sumar según el tipo
    const cant = curr.cantidad_personas || 0;
    if (curr.tipo === 'free') acc[repreKey].free += cant;
    if (curr.tipo === 'cobrada_con_consumible') acc[repreKey].cobrada_cc += cant;
    if (curr.tipo === 'cobrada_sin_consumible') acc[repreKey].cobrada_sc += cant;

    acc[repreKey].total_repre += cant;
    return acc;
  }, {});

  // Convertimos el objeto en una lista ordenada por los que vendieron más
  const filasPlanilla = Object.values(planilla).sort((a, b) => b.total_repre - a.total_repre);

  // Matematicas hijo
  const totalFree = filasPlanilla.reduce((sum, f) => sum + f.free, 0);
  const totalCobradaCC = filasPlanilla.reduce((sum, f) => sum + f.cobrada_cc, 0);
  const totalCobradaSC = filasPlanilla.reduce((sum, f) => sum + f.cobrada_sc, 0);
  const granTotal = totalFree + totalCobradaCC + totalCobradaSC;

  return (
    <div className="pb-10 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 px-2 md:px-0">
        <div>
          <h2 className="text-3xl font-light text-bar-text flex items-center gap-3">
            <FaTicketAlt className="text-bar-accent" /> Control de Entradas
          </h2>
          <p className="text-bar-muted text-sm mt-1 uppercase tracking-widest">
            {fechaFiltro === getToday() ? "Planilla de Hoy" : `Planilla del ${formatearFecha(fechaFiltro)}`}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-bar-accent hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold transition shadow-lg w-full sm:w-auto cursor-pointer uppercase tracking-widest text-xs"
        >
          + Cargar Entradas
        </button>
      </div>

      {/* FILTRO DE FECHA */}
      <div className="bg-bar-card p-4 rounded-xl border border-zinc-800 shadow-xl mb-8 mx-2 md:mx-0 flex items-center gap-4">
        <div className="relative w-full sm:w-64">
          <label className="text-[10px] uppercase text-zinc-500 absolute -top-2 left-2 bg-bar-card px-1">Fecha de Planilla</label>
          <div className="flex items-center">
            <FaCalendarAlt className="absolute left-3 text-zinc-500 pointer-events-none" size={14} />
            <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-9 pr-3 text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark] cursor-pointer text-sm" 
            />
          </div>
        </div>
        {fechaFiltro !== getToday() && (
          <button onClick={() => setFechaFiltro(getToday())} className="text-xs text-bar-muted hover:text-bar-accent transition-colors underline cursor-pointer">
            Volver a Hoy
          </button>
        )}
      </div>

      {/* PLANILLA */}
      <div className="bg-zinc-100 rounded-xl overflow-hidden shadow-2xl mx-2 md:mx-0">
        
        {/* Cabecera */}
        <div className="bg-zinc-800 text-white flex border-b-4 border-zinc-900 overflow-x-auto">
          <div className="min-w-[200px] flex-1 py-4 px-6 font-bold tracking-widest text-xs border-r border-zinc-700">REPRESENTANTE</div>
          <div className="w-32 py-4 text-center font-bold tracking-widest text-[10px] uppercase border-r border-zinc-700">Free</div>
          <div className="w-32 py-4 text-center font-bold tracking-widest text-[10px] uppercase border-r border-zinc-700 leading-tight">Cobrada<br/>c/ Consum.</div>
          <div className="w-32 py-4 text-center font-bold tracking-widest text-[10px] uppercase border-r border-zinc-700 leading-tight">Cobrada<br/>s/ Consum.</div>
          <div className="w-32 py-4 text-center font-bold tracking-widest text-xs text-bar-accent">TOTAL</div>
        </div>

        {/* Filas */}
        <div className="divide-y border-zinc-300">
          {filasPlanilla.length > 0 ? (
            filasPlanilla.map((fila, index) => (
              <div key={index} className="flex bg-white hover:bg-zinc-50 transition-colors overflow-x-auto">
                <div className="min-w-[200px] flex-1 py-4 px-6 font-medium text-zinc-800 border-r border-zinc-200">
                  {fila.nombre}
                </div>
                <div className="w-32 py-4 flex justify-center items-center font-mono text-zinc-600 border-r border-zinc-200">
                  {fila.free > 0 ? fila.free : '-'}
                </div>
                <div className="w-32 py-4 flex justify-center items-center font-mono text-zinc-600 border-r border-zinc-200">
                  {fila.cobrada_cc > 0 ? fila.cobrada_cc : '-'}
                </div>
                <div className="w-32 py-4 flex justify-center items-center font-mono text-zinc-600 border-r border-zinc-200">
                  {fila.cobrada_sc > 0 ? fila.cobrada_sc : '-'}
                </div>
                <div className="w-32 py-4 flex justify-center items-center font-mono font-bold text-zinc-900 bg-zinc-100">
                  {fila.total_repre}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-zinc-400 bg-white">
              <p className="italic text-lg mb-2">No hay entradas registradas para el {formatearFecha(fechaFiltro)}.</p>
              <p className="text-sm">Toca el botón "+ CARGAR ENTRADAS" para comenzar.</p>
            </div>
          )}
        </div>

        {/* FOOTER: TOTALES */}
        <div className="bg-zinc-800 text-white flex border-t-4 border-zinc-900 overflow-x-auto">
          <div className="min-w-[200px] flex-1 py-5 px-30 font-bold tracking-widest text-sm text-right text-bar-accent border-r border-zinc-700">
            TOTALES DEL DÍA
          </div>
          <div className="w-32 py-5 text-center font-mono font-bold text-lg border-r border-zinc-700 text-zinc-300">
            {totalFree}
          </div>
          <div className="w-32 py-5 text-center font-mono font-bold text-lg border-r border-zinc-700 text-zinc-300">
            {totalCobradaCC}
          </div>
          <div className="w-32 py-5 text-center font-mono font-bold text-lg border-r border-zinc-700 text-zinc-300">
            {totalCobradaSC}
          </div>
          <div className="w-32 py-5 text-center font-mono font-bold text-2xl text-bar-accent bg-black/30 shadow-inner">
            {granTotal}
          </div>
        </div>

      </div>

      <EntradaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmar} />
    </div>
  );
}
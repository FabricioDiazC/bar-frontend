import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTrash, FaClipboardList, FaRegClock, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import AsistenciaEmbajadoraModal from '../components/AsistenciaEmbajadoraModal';
import EmbajadoraFormModal from '../components/EmbajadoraFormModal';
import { toast } from 'react-toastify';

export default function EmbajadorasPosta() {
  const getToday = () => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('-');
    return `${day}/${month}/${year}`;
  };

  const [fechaFiltro, setFechaFiltro] = useState(getToday());
  const [listaAsistencia, setListaAsistencia] = useState([]);
  
  // Guardará el mapeo de ID a Objeto Embajador
  const [embajadoresMap, setEmbajadoresMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false); 

  const fetchEmbajadores = async () => {
    try {
      const res = await api.get('embajadores/');
      const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
      const mapa = {};
      data.forEach(emb => { mapa[emb.id] = emb; });
      setEmbajadoresMap(mapa);
    } catch (error) { console.error(error); }
  };

  const fetchAsistencias = async () => {
    try {
      // LLAMAMOS AL ENDPOINT CORRECTO DE ASISTENCIAS DE EMBAJADORES
      const res = await api.get(`asistencias-embajadores/?fecha=${fechaFiltro}`);
      const datosRecibidos = res.data.results || (Array.isArray(res.data) ? res.data : []);
      setListaAsistencia(datosRecibidos);
    } catch (error) { setListaAsistencia([]); }
  };

  useEffect(() => { fetchEmbajadores(); }, []);
  useEffect(() => { fetchAsistencias(); }, [fechaFiltro]);

  const handleConfirmar = async (datos) => {
    // IMPORTANTE: el backend usa la variable 'embajador' en lugar de 'representante'
    const yaExiste = listaAsistencia.some(a => a.embajador === datos.embajadora_id);
    if (yaExiste) {
      toast.warning("Esta embajadora ya está anotada hoy.");
      return; 
    }

    try {
      const payload = {
        embajador: datos.embajadora_id, 
        fecha: fechaFiltro,
        presente: true,
        hora_ingreso: datos.hora_ingreso,
        hora_egreso: datos.hora_egreso,
        acompañantes: datos.acompañantes 
      };

      await api.post('asistencias-embajadores/', payload);
      toast.success(`Embajadora agregada a la lista.`);
      fetchAsistencias(); 
    } catch (error) {
      toast.error("Error al guardar en el servidor.");
    }
  };

  const eliminarDeLista = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar el registro?')) {
      try {
        await api.delete(`asistencias-embajadores/${id}/`);
        fetchAsistencias();
        toast.success("Registro eliminado.");
      } catch (error) { toast.error("Error al eliminar."); }
    }
  };

  return (
    <div className="pb-10 max-w-5xl mx-auto">
      {/* HEADER  */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 px-2 md:px-0">
        <div>
          <h2 className="text-3xl font-light text-bar-text flex items-center gap-3">
            <FaClipboardList className="text-bar-accent" /> Control Puerta (Embajadoras)
          </h2>
          <p className="text-bar-muted text-sm mt-1 uppercase tracking-widest">
            {fechaFiltro === getToday() ? "Planilla de Hoy" : `Planilla del ${formatearFecha(fechaFiltro)}`}
          </p>
        </div>

        {/* BOTON */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={() => setIsCrearModalOpen(true)} className="flex justify-center items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-bar-text border border-zinc-700 px-5 py-3 rounded-xl font-bold transition shadow-lg w-full sm:w-auto cursor-pointer uppercase tracking-widest text-[10px]">
            <FaPlus /> Nueva Embajadora
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-bar-accent hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold transition shadow-lg w-full sm:w-auto cursor-pointer uppercase tracking-widest text-xs">
            Anotar Asistencia
          </button>
        </div>
      </div>

      <div className="bg-bar-card p-4 rounded-xl border border-zinc-800 shadow-xl mb-8 mx-2 md:mx-0 flex items-center gap-4">
        <div className="relative w-full sm:w-64">
          <label className="text-[10px] uppercase text-zinc-500 absolute -top-2 left-2 bg-bar-card px-1">Fecha de Planilla</label>
          <div className="flex items-center">
            <FaCalendarAlt className="absolute left-3 text-zinc-500 pointer-events-none" size={14} />
            <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-9 pr-3 text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark] cursor-pointer text-sm" />
          </div>
        </div>
        {fechaFiltro !== getToday() && (
          <button onClick={() => setFechaFiltro(getToday())} className="text-xs text-bar-muted hover:text-bar-accent transition-colors underline cursor-pointer">Volver a Hoy</button>
        )}
      </div>

      <div className="bg-zinc-100 rounded-xl overflow-hidden shadow-2xl mx-2 md:mx-0 overflow-x-auto">
        <div className="bg-zinc-800 text-white flex border-b-4 border-zinc-900 min-w-[700px]">
          <div className="w-12 py-3 text-center font-bold border-r border-zinc-700">#</div>
          <div className="flex-1 py-3 px-6 font-bold tracking-widest text-xs border-r border-zinc-700 uppercase">Nombre Embajadora</div>
          <div className="w-16 py-3 text-center font-bold tracking-widest text-[10px] border-r border-zinc-700">ACC.</div>
          <div className="w-24 py-3 text-center font-bold tracking-widest text-[10px] border-r border-zinc-700 uppercase">Ingreso</div>
          <div className="w-24 py-3 text-center font-bold tracking-widest text-[10px] border-l border-zinc-700 uppercase">Egreso</div>
          <div className="w-12 py-3 border-l border-zinc-700"></div> 
        </div>

        <div className="divide-y border-zinc-300 min-w-[700px]">
          {listaAsistencia.length > 0 ? (
            listaAsistencia.map((asistencia, index) => {
              // Busqueda en embajadores
              const embData = embajadoresMap[asistencia.embajador] || {};
              const acc = asistencia.acompañantes;

              return (
                <div key={asistencia.id} className="flex bg-white hover:bg-zinc-50 transition-colors">
                  <div className="w-12 py-4 flex justify-center items-center text-zinc-500 border-r border-zinc-200 font-mono text-sm">{index + 1}</div>
                  <div className="flex-1 py-4 px-6 flex flex-col justify-center border-r border-zinc-200">
                    <span className="font-medium text-zinc-800 text-lg leading-tight">{embData.nombre || '...'}</span>
                    {embData.apodo && <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Alias: {embData.apodo}</span>}
                  </div>
                  <div className="w-16 py-4 flex justify-center items-center border-r border-zinc-200 font-bold text-zinc-700">
                    {acc ? `+${acc}` : '-'}
                  </div>
                  <div className="w-24 py-4 flex justify-center items-center border-r border-zinc-200">
                    {asistencia.hora_ingreso ? <span className="text-sm font-mono font-bold text-green-700">{asistencia.hora_ingreso.slice(0,5)}</span> : '-'}
                  </div>
                  <div className="w-24 py-4 flex justify-center items-center border-l border-zinc-200">
                    {asistencia.hora_egreso ? <span className="text-sm font-mono font-bold text-red-700">{asistencia.hora_egreso.slice(0,5)}</span> : '-'}
                  </div>
                  <div className="w-12 flex justify-center items-center border-l border-zinc-100">
                    <button onClick={() => eliminarDeLista(asistencia.id)} className="text-zinc-300 hover:text-red-500 p-2 cursor-pointer transition-colors"><FaTrash size={14} /></button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center text-zinc-400 bg-white">
              <p className="italic text-lg mb-2">La planilla está vacía.</p>
            </div>
          )}
        </div>
      </div>

      <AsistenciaEmbajadoraModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmar} />

    {/* MODAL DE CREACION DE EMBAJADORA */}
      <EmbajadoraFormModal 
        isOpen={isCrearModalOpen} 
        onClose={() => setIsCrearModalOpen(false)} 
        onSuccess={fetchEmbajadores} />
    </div>
  );
}
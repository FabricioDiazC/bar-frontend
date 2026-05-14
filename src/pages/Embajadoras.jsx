import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTrash, FaClipboardList, FaRegClock, FaCalendarAlt } from 'react-icons/fa';
import AsistenciaModal from '../components/AsistenciaModal';
import { toast } from 'react-toastify';

export default function Embajadoras() {
  // Horario de Arg
  const getToday = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  //Función para mostrar la fecha en formato dia/mes/año
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('-');
    return `${day}/${month}/${year}`;
  };

  const [fechaFiltro, setFechaFiltro] = useState(getToday());
  const [listaAsistencia, setListaAsistencia] = useState([]);
  const [representantesMap, setRepresentantesMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      console.error("Error al cargar diccionario de representantes", error);
    }
  };

  const fetchAsistencias = async () => {
    try {
      const res = await api.get(`asistencias/?fecha=${fechaFiltro}`);
      const datosRecibidos = res.data.results || (Array.isArray(res.data) ? res.data : []);
      setListaAsistencia(datosRecibidos);
    } catch (error) {
      console.error("Error al cargar la planilla", error);
      setListaAsistencia([]);
    }
  };

  useEffect(() => {
    fetchRepresentantes();
  }, []);

  useEffect(() => {
    fetchAsistencias();
  }, [fechaFiltro]);

  const handleConfirmar = async (datos) => {
    try {
      const payload = {
        representante: datos.representante_id,
        fecha: fechaFiltro,
        presente: true
      };

      await api.post('asistencias/', payload);
      toast.success(`Embajadora agregada a la lista.`);
      fetchAsistencias(); 
    } catch (error) {
      toast.error("Posiblemente ya esté cargada en la lista de hoy.");
    }
  };

  const eliminarDeLista = async (id) => {
    if (window.confirm('¿Seguro que deseas quitar a esta embajadora de la planilla?')) {
      try {
        await api.delete(`asistencias/${id}/`);
        fetchAsistencias();
      } catch (error) {
        toast.error("Error al eliminar el registro.");
      }
    }
  };

  const formatearHora = (fechaString) => {
    if (!fechaString) return "-";
    const date = new Date(fechaString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 px-2 md:px-0">
        <div>
          <h2 className="text-3xl font-light text-bar-text flex items-center gap-3">
            <FaClipboardList className="text-bar-accent" /> Lista de Puerta
          </h2>
          <p className="text-bar-muted text-sm mt-1 uppercase tracking-widest">
            {fechaFiltro === getToday() ? "Planilla de Hoy" : `Planilla del ${formatearFecha(fechaFiltro)}`}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-bar-accent hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold transition shadow-lg w-full sm:w-auto cursor-pointer uppercase tracking-widest text-xs"
        >
          + Agregar a la lista
        </button>
      </div>

      {/* FILTRO DE FECHA */}
      <div className="bg-bar-card p-4 rounded-xl border border-zinc-800 shadow-xl mb-8 mx-2 md:mx-0 flex items-center gap-4">
        <div className="relative w-full sm:w-64">
          <label className="text-[10px] uppercase text-zinc-500 absolute -top-2 left-2 bg-bar-card px-1">Fecha de Planilla</label>
          <div className="flex items-center">
            <FaCalendarAlt className="absolute left-3 text-zinc-500 pointer-events-none" size={14} />
            <input 
              type="date" 
              value={fechaFiltro} 
              onChange={e => setFechaFiltro(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-9 pr-3 text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark] cursor-pointer text-sm" 
            />
          </div>
        </div>
        
        {fechaFiltro !== getToday() && (
          <button 
            onClick={() => setFechaFiltro(getToday())}
            className="text-xs text-bar-muted hover:text-bar-accent transition-colors underline cursor-pointer"
          >
            Volver a Hoy
          </button>
        )}
      </div>

      {/* PLANILLA*/}
      <div className="bg-zinc-100 rounded-xl overflow-hidden shadow-2xl mx-2 md:mx-0">
        <div className="bg-zinc-800 text-white flex border-b-4 border-zinc-900">
          <div className="w-16 py-3 text-center font-bold border-r border-zinc-700">#</div>
          <div className="flex-1 py-3 px-6 font-bold tracking-widest text-sm">NOMBRE Y APELLIDO</div>
          <div className="w-24 py-3 text-center font-bold tracking-widest text-sm border-l border-zinc-700">HORA</div>
          <div className="w-16 py-3 border-l border-zinc-700"></div> 
        </div>

        <div className="divide-y border-zinc-300">
          {listaAsistencia.length > 0 ? (
            listaAsistencia.map((asistencia, index) => {
              const repreData = representantesMap[asistencia.representante] || {};
              const nombreAMostrar = repreData.nombre || 'Cargando...';
              const apodoAMostrar = repreData.apodo || '';

              return (
                <div key={asistencia.id} className="flex bg-white hover:bg-zinc-50 transition-colors">
                  <div className="w-16 py-4 flex justify-center items-center text-zinc-500 border-r border-zinc-200 font-mono text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 py-4 px-6 flex flex-col justify-center">
                    <span className="font-medium text-zinc-800 text-lg leading-tight">
                      {nombreAMostrar}
                    </span>
                    {apodoAMostrar && (
                      <span className="text-xs font-light text-zinc-500 mt-1 uppercase tracking-widest">
                        Alias: {apodoAMostrar}
                      </span>
                    )}
                  </div>
                  <div className="w-24 py-4 flex justify-center items-center border-l border-zinc-200">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono font-bold flex items-center gap-1">
                      <FaRegClock size={10} /> {formatearHora(asistencia.creado_en)}
                    </span>
                  </div>
                  <div className="w-16 flex justify-center items-center border-l border-zinc-100">
                    <button 
                      onClick={() => eliminarDeLista(asistencia.id)} 
                      className="text-zinc-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-full transition-colors cursor-pointer"
                      title="Quitar de la lista"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center text-zinc-400 bg-white">
              <p className="italic text-lg mb-2">La planilla del {formatearFecha(fechaFiltro)} está en blanco.</p>
              <p className="text-sm">Toca el botón "+ AGREGAR A LA LISTA" para comenzar.</p>
            </div>
          )}
        </div>
      </div>

      <AsistenciaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmar} />
    </div>
  );
}
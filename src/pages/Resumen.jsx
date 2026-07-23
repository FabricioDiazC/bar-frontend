import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaChartBar, FaCalendarAlt, FaArrowRight, FaUsers, FaCheckCircle, FaTimesCircle, FaPercent, FaClipboardList } from 'react-icons/fa';
import { toast } from 'react-toastify';
import BotonLimpiarFiltros from '../components/BotonLimpiarFiltros';

export default function Resumen() {
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

  const [fechaDesde, setFechaDesde] = useState(getToday());
  const [fechaHasta, setFechaHasta] = useState(getToday());
  
  // Estado para guardar el JSON 
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchResumen = async () => {
    setLoading(true);
    try {
      let url = 'reportes/reservas/';
      
      if (fechaDesde && fechaHasta) {
        if (fechaDesde === fechaHasta) {
          url += `?fecha=${fechaDesde}`; // Si es el mismo día
        } else {
          url += `?desde=${fechaDesde}&hasta=${fechaHasta}`; // Si es un rango
        }
      }

      const res = await api.get(url);
      setReporte(res.data);
    } catch (error) {
      console.error("Error al cargar el resumen:", error);
      toast.error("Hubo un error al cargar los datos del resumen.");
      setReporte(null);
    } finally {
      setLoading(false);
    }
  };

  // Recarga cuando cambian las fechas
  useEffect(() => {
    fetchResumen();
  }, [fechaDesde, fechaHasta]);

  // Color para el porcentaje (si no funca el porcentaje revisar esto, borrarlo y hacerlo a lo criollo)
  const getColorPorcentaje = (porcentaje) => {
    if (porcentaje >= 70) return 'text-green-500';
    if (porcentaje >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="pb-20 max-w-6xl mx-auto space-y-8 px-2 md:px-0 text-bar-text">
      
      {/*Header*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-light flex items-center gap-3 italic text-bar-text">
            <FaChartBar className="text-bar-accent" /> Resumen
          </h2>
          <p className="text-bar-muted text-xs uppercase tracking-[0.3em] mt-1">
            {fechaDesde === fechaHasta 
              ? `Reporte del ${formatearFecha(fechaDesde)}`
              : `Periodo: ${formatearFecha(fechaDesde)} al ${formatearFecha(fechaHasta)}`}
          </p>
        </div>
      </div>

      {/*Filtro de fechas*/}
      <div className="bg-bar-card p-5 rounded-2xl border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <FaCalendarAlt className="text-zinc-600" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Filtrar:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <input 
            type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark] cursor-pointer" 
          />
          <FaArrowRight className="text-zinc-700 hidden sm:block" />
          <input 
            type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark] cursor-pointer" 
          />
        </div>

        <BotonLimpiarFiltros 
          hayFiltros={fechaDesde !== getToday() || fechaHasta !== getToday()} 
          onLimpiar={() => {setFechaDesde(getToday()); setFechaHasta(getToday());}} 
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-bar-accent animate-pulse tracking-widest uppercase text-sm font-bold">
          Calculando Métricas...
        </div>
      ) : reporte ? (
        <>
          {/*Metricas Generales*/}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
              <FaClipboardList className="text-zinc-600 mb-2" size={24} />
              <span className="text-3xl font-black text-bar-text">{reporte.resumen.cantidad_reservas}</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Reservas Totales</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
              <FaUsers className="text-blue-500/70 mb-2" size={24} />
              <span className="text-3xl font-black text-blue-400">{reporte.resumen.esperados}</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Personas Esperadas</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
              <FaCheckCircle className="text-green-500/70 mb-2" size={24} />
              <span className="text-3xl font-black text-green-400">{reporte.resumen.reales}</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Asistieron Real</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
              <FaTimesCircle className="text-red-500/70 mb-2" size={24} />
              <span className="text-3xl font-black text-red-400">{reporte.resumen.faltaron}</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Faltaron</span>
            </div>

            <div className="bg-bar-card border border-bar-accent/30 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center col-span-2 lg:col-span-1">
              <FaPercent className={`${getColorPorcentaje(reporte.resumen.porcentaje_asistencia)} mb-2`} size={24} />
              <span className={`text-3xl font-black ${getColorPorcentaje(reporte.resumen.porcentaje_asistencia)}`}>
                {reporte.resumen.porcentaje_asistencia}%
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1 font-bold">Efectividad Noche</span>
            </div>
            
          </section>

          {/*Tabla por representante*/}
          <section className="pt-6">
            <h3 className="text-sm font-bold text-bar-accent uppercase tracking-widest px-2 md:px-0 flex items-center gap-2 mb-4">
              <FaUsers /> Desglose por Representante
            </h3>
            
            <div className="bg-zinc-100 rounded-2xl overflow-hidden shadow-2xl border-b-4 border-zinc-300 overflow-x-auto">
              <div className="bg-zinc-800 text-white flex min-w-[700px] text-[10px] uppercase font-black tracking-tighter">
                <div className="flex-1 py-4 px-6 border-r border-zinc-700 tracking-widest">Representante</div>
                <div className="w-24 py-4 text-center border-r border-zinc-700">Cant. Res.</div>
                <div className="w-24 py-4 text-center border-r border-zinc-700 text-blue-300">Esperados</div>
                <div className="w-24 py-4 text-center border-r border-zinc-700 text-green-400">Reales</div>
                <div className="w-24 py-4 text-center border-r border-zinc-700 text-red-400">Faltaron</div>
                <div className="w-24 py-4 text-center text-bar-accent">% Asistencia</div>
              </div>
              
              <div className="divide-y divide-zinc-200 min-w-[700px]">
                {reporte.representantes.length > 0 ? (
                  reporte.representantes.map((repre, i) => (
                    <div key={i} className="flex bg-white hover:bg-zinc-50 transition-colors text-zinc-800 text-sm">
                      <div className="flex-1 py-4 px-6 border-r border-zinc-100 font-medium">
                        {repre.nombre} 
                        {repre.apodo && <span className="text-[10px] text-zinc-500 uppercase ml-2 tracking-widest bg-zinc-200 px-2 py-0.5 rounded">Alias: {repre.apodo}</span>}
                      </div>
                      <div className="w-24 py-4 text-center border-r border-zinc-100 font-mono text-zinc-500">{repre.cantidad_reservas}</div>
                      <div className="w-24 py-4 text-center border-r border-zinc-100 font-mono font-bold text-blue-900 bg-blue-50/50">{repre.esperados}</div>
                      <div className="w-24 py-4 text-center border-r border-zinc-100 font-mono font-bold text-green-700 bg-green-50/50">{repre.reales}</div>
                      <div className="w-24 py-4 text-center border-r border-zinc-100 font-mono font-bold text-red-700 bg-red-50/50">{repre.faltaron}</div>
                      <div className={`w-24 py-4 text-center font-black bg-zinc-100 ${getColorPorcentaje(repre.porcentaje_asistencia)}`}>
                        {repre.porcentaje_asistencia}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-zinc-500 bg-white italic text-sm">
                    No hay datos de representantes para este periodo.
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="text-center py-20 text-zinc-500 italic text-sm">No hay datos disponibles para las fechas seleccionadas.</div>
      )}
    </div>
  );
}
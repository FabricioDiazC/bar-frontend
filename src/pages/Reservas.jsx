import { useState, useEffect } from 'react';
//import axios from 'axios';
import api from '../api/axios'; 
import ReservaCard from '../components/ReservaCard';
import ReservaFormModal from '../components/ReservaFormModal';
import ReservaEditModal from '../components/ReservaEditModal';
import BotonLimpiarFiltros from '../components/BotonLimpiarFiltros';
import { FaSearch, FaCalendarAlt, FaArrowRight, FaFilter, FaUserTie, FaClock} from 'react-icons/fa';
import { confirmDelete, toastAlert } from '../utils/alerts';
import { toast } from 'react-toastify';
import Paginacion from '../components/Paginacion';

export default function Reservas() {
  //Funcion para obtener la fecha de hoy en formato AÑO-MES-DIA
  const getToday = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  //Funcion para formatear la fecha a dia/mes/año
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('-');
    return `${day}/${month}/${year}`;
  };
  //Inicializacion de ambos filtros con la fecha de hoy
  const [fechaDesde, setFechaDesde] = useState(getToday());
  const [fechaHasta, setFechaHasta] = useState(getToday());
  //Estado para el turno (tarde,noche o tarde/noche)
  const [turno, setTurno] = useState('');

  const [reservas, setReservas] = useState([]);
  //Busqueda por nombre
  const [searchTexto, setSearchTexto] = useState('');
  //const [searchFecha, setSearchFecha] = useState('');
  //Estado para buscar por representatnte
  const [searchRepre, setSearchRepre] = useState('');
  //Funciones de modales para abrir nueva reserva y editar reserva
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reservaToEdit, setReservaToEdit] = useState(null);
  //PaGINADO
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  //Estado para el contador
  const [contadorHoy, setContadorHoy] = useState(0);
  

//Funcion para calcular las reservas esperadas para hoy
const actualizarContadorHoy = async () => {
    try {
      const hoy = getToday();
      let paginaActual = 1;
      let todasLasReservas = [];
      let hayMas = true;

      // bucle por si hay muchas reservas y el backend las pagina
      while (hayMas) {
        const res = await api.get(`reservas/?fecha_desde=${hoy}&fecha_hasta=${hoy}&page=${paginaActual}`);
        const data = res.data.results || (Array.isArray(res.data) ? res.data : []);
        todasLasReservas = [...todasLasReservas, ...data];
        
        if (res.data.next) {
          paginaActual++;
        } else {
          hayMas = false;
        }
      }

      // Filtracion de reservas
      const esperadas = todasLasReservas.filter(r => {
        if (!r.hora_inicio) return false;
        const hora = r.hora_inicio.slice(0, 5); // Cortamos a HH:MM
        
        // No cuento las canceladas (tener en cuenta esto)
        const activa = r.estado !== 'cancelado'; 
        
        
        return hora >= "18:00" && hora <= "22:30" && activa;
      });

      setContadorHoy(esperadas.length);
    } catch (error) {
      console.error("Error al cargar el contador de hoy:", error);
    }
  };

  // Cargar el contador al entrar a la pagina
  useEffect(() => {
    actualizarContadorHoy();
  }, []);


  const fetchReservas = async () => {
    try {
      // Construimos la URL con el rango de fechas
      let url = `reservas/?search=${searchTexto}&page=${pagina}&fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}&representante=${searchRepre}`;
      
      if (turno) {
        url += `&turno=${turno}`;
      }
      const res = await api.get(url);
      const datosRecibidos = res.data.results || (Array.isArray(res.data) ? res.data : []);
      const conteoTotal = res.data.count || datosRecibidos.length;

      setReservas(datosRecibidos);
      setTotal(conteoTotal);
    } catch (error) {
      console.error("Error al cargar reservas", error);
      setReservas([]);
    }
  };

  // Este efecto hace que cuando se cambie la fecha o texto se vuelva a la pagina 1
  useEffect(() => {
    setPagina(1);
  }, [searchTexto, searchRepre, fechaDesde, fechaHasta, turno]);

  useEffect(() => {
    fetchReservas();
  }, [searchTexto, searchRepre, fechaDesde, fechaHasta, pagina, turno]);

  const limpiarFiltros = () => {
    setSearchTexto('');
    setSearchRepre('');
    setFechaDesde(getToday());
    setFechaHasta(getToday());
    setTurno('');
    setPagina(1);
    toast.info("Filtros de reservas restablecidos");
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirmDelete('esta reserva');

    if (isConfirmed) {
      try {
        await api.delete(`reservas/${id}/`);
        fetchReservas();
        
        toast.success('Reserva eliminada con éxito');
        actualizarContadorHoy(); // Se actuializa el contador por si se borra una reserva de hoy
        
      } catch (error) {
        console.error("Error al eliminar", error);
        toast.error('Error al intentar eliminar la reserva');
      }
    }
  };

  const handleOpenEdit = (reserva) => {
    setReservaToEdit(reserva);
    setIsEditModalOpen(true);
  };

  // Función que llamamos cuando se crea o edita una reserva con éxito
  const recargarTodo = () => {
    fetchReservas();
    actualizarContadorHoy();
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 px-2 md:px-0">
        <div>
          <h2 className="text-3xl font-light text-bar-text">Reservas</h2>
          <p className="text-bar-muted text-sm mt-1 uppercase tracking-widest">
            {fechaDesde === fechaHasta && fechaDesde === getToday() 
              ? "Agenda de hoy" 
              : `Periodo: ${formatearFecha(fechaDesde)} al ${formatearFecha(fechaHasta)}`}
          </p>
        </div>
        {/* NUEVO: CONTADOR DE RESERVAS DE HOY */}
        <div className="bg-zinc-900 border border-zinc-700 px-5 py-2 rounded-xl shadow-lg flex flex-col justify-center items-center flex-1 md:flex-none">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 flex items-center gap-1 mb-0.5">
              <FaClock size={8} /> Hoy (18:00 - 22:30)
            </span>
            <span className="text-xl font-black text-bar-accent leading-none">
              {contadorHoy} <span className="text-[10px] font-light text-zinc-400 uppercase tracking-widest">Esperadas</span>
            </span>
          </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-bar-accent hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold transition shadow-lg w-full md:w-auto cursor-pointer"
        >
          + NUEVA RESERVA
        </button>
      </div>

      {/* BARRA DE FILTROS  */}
      <div className="bg-bar-card p-5 rounded-2xl border border-zinc-800 shadow-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          
          {/* Buscador Cliente */}
          <div className="relative">
            <FaSearch className="absolute top-3.5 left-3 text-zinc-600" size={12}/>
            <input 
              type="text" placeholder="Buscar Cliente..."
              value={searchTexto} onChange={e => setSearchTexto(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-bar-text focus:border-bar-accent focus:outline-none" 
            />
          </div>

          {/* Buscador Representante */}
          <div className="relative">
            <FaUserTie className="absolute top-3.5 left-3 text-zinc-600" size={12}/>
            <input 
              type="text" placeholder="Buscar Representante..."
              value={searchRepre} onChange={e => setSearchRepre(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-bar-text focus:border-bar-accent focus:outline-none" 
            />
          </div>

          {/* Selector de Turno */}
          <div className="relative">
            <FaFilter className="absolute top-3.5 left-3 text-zinc-600" size={10} />
            <select 
              value={turno} 
              onChange={e => setTurno(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-9 pr-4 text-sm text-bar-text focus:border-bar-accent focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">Cualquier Turno</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
              <option value="ambos">Tarde/Noche</option>
            </select>
          </div>

          {/* Rango de fechas */}
          <div className="xl:col-span-2 flex flex-col sm:flex-row items-center gap-3">
            <input 
              type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark]" 
            />
            <FaArrowRight className="text-zinc-700 hidden sm:block" />
            <input 
              type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark]" 
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <BotonLimpiarFiltros 
            hayFiltros={!!(searchTexto || searchRepre || turno || fechaDesde !== getToday() || fechaHasta !== getToday())} 
            onLimpiar={limpiarFiltros} 
          />
        </div>
      </div>

      {/* Grilla de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-0">
        {reservas?.length > 0 ? (
          reservas.map(reserva => (
            <ReservaCard 
              key={reserva.id} 
              reserva={reserva} 
              onDelete={handleDelete} 
              onEdit={(r) => { setReservaToEdit(r); setIsEditModalOpen(true); }} 
            />
          ))
        ) : (
          <div className="col-span-full bg-zinc-900/30 border border-zinc-800 border-dashed rounded-2xl p-16 text-center">
             <FaCalendarAlt className="mx-auto text-zinc-800 text-5xl mb-4" />
             <p className="text-bar-muted italic">No se encontraron reservas con estos criterios.</p>
          </div>
        )}
      </div>

      <Paginacion paginaActual={pagina} total={total} limite={20} onPageChange={setPagina} />

      <ReservaFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={recargarTodo} />
      
      <ReservaEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setReservaToEdit(null); }} 
        onSuccess={recargarTodo} 
        reserva={reservaToEdit} 
      />
    </div>
  );
}
import { useState, useEffect } from 'react';
//import axios from 'axios';
import api from '../api/axios'; 
import ReservaCard from '../components/ReservaCard';
import ReservaFormModal from '../components/ReservaFormModal';
import ReservaEditModal from '../components/ReservaEditModal';
import { FaSearch, FaCalendarAlt, FaArrowRight  } from 'react-icons/fa';
import { confirmDelete, toastAlert } from '../utils/alerts';
import { toast } from 'react-toastify';
import Paginacion from '../components/Paginacion';

export default function Reservas() {
  //Funcion para obtener la fecha de hoy en formato AÑO-MES-DIA
  const getToday = () => new Date().toISOString().split('T')[0];
  //Inicializacion de ambos filtros con la fecha de hoy
  const [fechaDesde, setFechaDesde] = useState(getToday());
  const [fechaHasta, setFechaHasta] = useState(getToday());

  const [reservas, setReservas] = useState([]);
  //Busqueda por nombre
  const [searchTexto, setSearchTexto] = useState('');
  //const [searchFecha, setSearchFecha] = useState('');
  //Funciones de modales para abrir nueva reserva y editar reserva
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reservaToEdit, setReservaToEdit] = useState(null);
  //PaGINADO
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  

  const fetchReservas = async () => {
    try {
      // Construimos la URL con el rango de fechas
      let url = `reservas/?search=${searchTexto}&page=${pagina}&fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`;
      
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
  }, [searchTexto, fechaDesde, fechaHasta]);

  useEffect(() => {
    fetchReservas();
  }, [searchTexto, fechaDesde, fechaHasta, pagina]);

  const handleDelete = async (id) => {
    const isConfirmed = await confirmDelete('esta reserva');

    if (isConfirmed) {
      try {
        await api.delete(`reservas/${id}/`);
        fetchReservas();
        
        toast.success('Reserva eliminada con éxito');
        
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

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-light text-bar-text">Reservas</h2>
          <p className="text-bar-muted text-sm mt-1">
            {fechaDesde === fechaHasta && fechaDesde === getToday() 
              ? "Mostrando reservas de hoy" 
              : `Reservas entre ${fechaDesde} y ${fechaHasta}`}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-bar-accent hover:bg-yellow-600 text-black px-5 py-2 rounded font-bold transition shadow-lg"
        >
          + NUEVA RESERVA
        </button>
      </div>

      {/* BARRA DE FILTROS AVANZADA */}
      <div className="bg-bar-card p-5 rounded-xl border border-zinc-800 shadow-xl mb-8 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Buscador de texto */}
          <div className="relative">
            <FaSearch className="absolute top-3 left-3 text-zinc-500" />
            <input 
              type="text" placeholder="Cliente o Teléfono"
              value={searchTexto} onChange={e => setSearchTexto(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded py-2 pl-10 pr-4 text-bar-text focus:border-bar-accent focus:outline-none" 
            />
          </div>

          {/* Rango de fechas */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <label className="text-[10px] uppercase text-zinc-500 absolute -top-2 left-2 bg-bar-card px-1">Desde</label>
              <input 
                type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded py-2 px-3 text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark]" 
              />
            </div>
            
            <FaArrowRight className="text-zinc-700 hidden sm:block" />

            <div className="flex-1 w-full relative">
              <label className="text-[10px] uppercase text-zinc-500 absolute -top-2 left-2 bg-bar-card px-1">Hasta</label>
              <input 
                type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded py-2 px-3 text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark]" 
              />
            </div>

            <button 
              onClick={() => {setSearchTexto(''); setFechaDesde(getToday()); setFechaHasta(getToday());}} 
              className="bg-zinc-800 hover:bg-zinc-700 text-bar-muted px-4 py-2 rounded transition text-sm whitespace-nowrap"
            >
              Hoy
            </button>
          </div>
        </div>
      </div>

      {/* Grilla de Reservas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="col-span-full bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl p-20 text-center">
             <FaCalendarAlt className="mx-auto text-zinc-700 text-4xl mb-4" />
             <p className="text-bar-muted italic">No hay reservas registradas para este periodo.</p>
          </div>
        )}
      </div>

      <Paginacion paginaActual={pagina} total={total} limite={20} onPageChange={setPagina} />

      <ReservaFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchReservas} />
      
      <ReservaEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setReservaToEdit(null); }} 
        onSuccess={fetchReservas} 
        reserva={reservaToEdit} 
      />
    </div>
  );
}
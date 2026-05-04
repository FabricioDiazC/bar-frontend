import { useState, useEffect } from 'react';
//import axios from 'axios';
import api from '../api/axios'; 
import ReservaCard from '../components/ReservaCard';
import ReservaFormModal from '../components/ReservaFormModal';
import ReservaEditModal from '../components/ReservaEditModal';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { confirmDelete, toastAlert } from '../utils/alerts';
import { toast } from 'react-toastify';
import Paginacion from '../components/Paginacion';

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [searchTexto, setSearchTexto] = useState('');
  const [searchFecha, setSearchFecha] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reservaToEdit, setReservaToEdit] = useState(null);
  //PaGINADO
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  

  const fetchReservas = async () => {
    try {
      let url = `reservas/?search=${searchTexto}&page=${pagina}`;
      if (searchFecha) url += `&fecha=${searchFecha}`;
      
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

  // Resetear página al buscar
  useEffect(() => {
    setPagina(1);
  }, [searchTexto, searchFecha]);

  useEffect(() => {
    fetchReservas();
  }, [searchTexto, searchFecha, pagina]);

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
        <h2 className="text-3xl font-light">Reservas</h2>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-bar-accent hover:bg-yellow-600 text-black px-5 py-2 rounded font-medium transition"
        >
          + Nueva Reserva
        </button>
      </div>

      {/* Barra de Búsqueda y Calendario */}
      <div className="bg-bar-card p-4 rounded-lg border border-zinc-800 flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <FaSearch className="absolute top-3 left-3 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o teléfono..."
            value={searchTexto}
            onChange={e => setSearchTexto(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded py-2 pl-10 pr-4 text-bar-text focus:border-bar-accent focus:outline-none"
          />
        </div>
        <div className="flex-1 relative">
          {/* El input type="date" levanta el calendario nativo del navegador */}
          <input 
            type="date" 
            value={searchFecha}
            onChange={e => setSearchFecha(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded py-2 px-4 text-bar-text focus:border-bar-accent focus:outline-none [color-scheme:dark]"
          />
        </div>
        <button 
          onClick={() => {setSearchTexto(''); setSearchFecha('');}}
          className="bg-zinc-800 hover:bg-zinc-700 text-bar-muted px-4 py-2 rounded transition"
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Grilla de Cards de Reservas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservas?.length > 0 ? (
          reservas.map(reserva => (
            <ReservaCard 
              key={reserva.id} 
              reserva={reserva} 
              onDelete={handleDelete}
              onEdit={handleOpenEdit}
            />
          ))
        ) : (
          <p className="text-bar-muted col-span-full text-center py-10">No se encontraron reservas para estos filtros.</p>
        )}
      </div>
      <div>

    </div>
    <Paginacion paginaActual={pagina} total={total} limite={20} onPageChange={setPagina} />
      {/* Renderizado del Modal*/}
      <ReservaFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchReservas} 
      />

      <ReservaEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setReservaToEdit(null); 
        }}
        onSuccess={fetchReservas}
        reserva={reservaToEdit} 
      />
    </div>
  );
}
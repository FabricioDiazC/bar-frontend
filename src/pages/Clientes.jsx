import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaWhatsapp, FaTrash, FaPlus, FaSearch, FaEdit, FaFilter } from 'react-icons/fa'; 
import { toast } from 'react-toastify';
import { confirmDelete } from '../utils/alerts'; 
import ClienteForm from '../components/ClienteForm'; 
import ClienteEditModal from '../components/ClienteEditModal';
import Paginacion from '../components/Paginacion';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  //Estado para el modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null)
  //Paginacion
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  //Estado para el filtrado turno
  const [turno, setTurno] = useState('');
  

  // Traer clientes de la API
  const fetchClientes = async () => {
    try {
      let url = `clientes/?search=${search}&page=${pagina}`;
      if (turno) {
        url += `&turno=${turno}`;
      }

      const res = await api.get(url);
      
      const datosRecibidos = res.data.results || (Array.isArray(res.data) ? res.data : []);
      const conteoTotal = res.data.count || datosRecibidos.length;

      setClientes(datosRecibidos);
      setTotal(conteoTotal);
    } catch (error) {
      console.error("Error al cargar clientes", error);
      setClientes([]);
    }
  };

  useEffect(() => {
    setPagina(1);
  }, [search, turno]);

  useEffect(() => {
    fetchClientes();
  }, [search, pagina, turno]);

  // Función para eliminar
  const handleDelete = async (id) => {
    const isConfirmed = await confirmDelete('este cliente');
    if (isConfirmed) {
      try {
        await api.delete(`clientes/${id}/`);
        fetchClientes();
        toast.success('Cliente eliminado');
      } catch (error) {
        toast.error('Hubo un problema al eliminar el cliente');
      }
    }
  };

  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleOpenEdit = (cliente) => {
    setClienteToEdit(cliente);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <h2 className="text-3xl font-light mb-6 text-bar-text">Gestión de Clientes</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <ClienteForm onSuccess={fetchClientes} />

        {/* BUSCADOR Y FILTROS */}
        <div className="bg-bar-card p-6 rounded-lg border border-zinc-800 flex flex-col justify-center gap-4">
          <h3 className="text-xl text-bar-accent flex items-center gap-2">
            <FaSearch /> Filtros de Búsqueda
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input de texto */}
            <input 
              type="text" placeholder="Nombre o teléfono..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-3 text-bar-text focus:outline-none focus:border-bar-accent transition-all" 
            />

            {/* Selector de Turno */}
            <div className="relative flex items-center">
              <FaFilter className="absolute left-3 text-zinc-500 pointer-events-none" size={12}/>
              <select 
                value={turno} 
                onChange={e => setTurno(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded p-3 pl-8 text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="">Todos los turnos</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
              </select>
            </div>
          </div>

          {(search || turno) && (
            <button 
              onClick={() => {setSearch(''); setTurno('');}}
              className="text-xs text-zinc-500 hover:text-bar-accent transition self-end"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="bg-bar-card rounded-lg overflow-hidden border border-zinc-800">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-bar-muted">
            <tr>
              <th className="p-4 font-normal">Nombre</th>
              <th className="p-4 font-normal">Teléfono</th>
              <th className="p-4 font-normal">Turno</th>
              <th className="p-4 text-right font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes?.length > 0 ? (
              clientes.map(cli => (
                <tr key={cli.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                  <td className="p-4 font-medium">{cli.nombre}</td>
                  <td className="p-4 text-bar-muted">{cli.telefono}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 bg-zinc-900 border border-zinc-700 rounded uppercase">
                      {cli.turno}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-3">
                    <button onClick={() => openWhatsApp(cli.telefono)} className="text-green-500 hover:text-green-400 p-2 bg-zinc-900 rounded-full transition" title="WhatsApp"><FaWhatsapp size={18} /></button>
                    <button onClick={() => { setClienteToEdit(cli); setIsEditModalOpen(true); }} className="text-zinc-400 hover:text-white p-2 bg-zinc-900 rounded-full transition" title="Editar"><FaEdit size={18} /></button>
                    <button onClick={() => handleDelete(cli.id)} className="text-red-500 hover:text-red-400 p-2 bg-zinc-900 rounded-full transition" title="Eliminar"><FaTrash size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="p-10 text-center text-bar-muted">No se encontraron clientes con esos filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Paginacion 
        paginaActual={pagina} 
        total={total}
        limite={20}
        onPageChange={(p) => setPagina(p)} 
      />
      <ClienteEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setClienteToEdit(null);
        }}
        onSuccess={fetchClientes}
        cliente={clienteToEdit}
      />
    </div>
  );
}
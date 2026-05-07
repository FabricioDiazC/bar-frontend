import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaWhatsapp, FaTrash, FaPlus, FaSearch, FaEdit, FaFilter, FaBirthdayCake  } from 'react-icons/fa'; 
import { toast } from 'react-toastify';
import { confirmDelete } from '../utils/alerts'; 
import ClienteForm from '../components/ClienteForm'; 
import ClienteEditModal from '../components/ClienteEditModal';
import Paginacion from '../components/Paginacion';
import BotonLimpiarFiltros from '../components/BotonLimpiarFiltros';

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
  //Estado para el filtro de cumpleaños
  const [fechaCumple, setFechaCumple] = useState('');
  //Funcion para limpiar todos los estados de una vez y por ende los filtros activos
  const limpiarTodo = () => {
      setSearch('');
      setTurno('');
      setFechaCumple('');
      setPagina(1);
      toast.info("Filtros restablecidos");
    };


  // Traer clientes de la API
  const fetchClientes = async () => {
    try {
      // Construimos la URL con todos los filtros
      let url = `clientes/?search=${search}&page=${pagina}`;
      if (turno) url += `&turno=${turno}`; //Linea para enviar el tuno(dia, noche)
      if (fechaCumple) url += `&cumpleanios=${fechaCumple}`; // Linea para enviar la fecha del cumple

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
  }, [search, turno, fechaCumple]);

  useEffect(() => {
    fetchClientes();
  }, [search, pagina, turno, fechaCumple]);

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

        {/* BUSCADOR Y FILTROS AVANZADOS */}
        <div className="bg-bar-card p-6 rounded-lg border border-zinc-800 flex flex-col justify-center gap-4">
          <h3 className="text-xl text-bar-accent flex items-center gap-2">
            <FaSearch /> Filtros de Búsqueda
          </h3>
          
          <div className="flex flex-col gap-3">
            {/* Input de texto (Nombre/Tel) */}
            <input 
              type="text" placeholder="Nombre o teléfono..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-bar-text focus:outline-none focus:border-bar-accent transition-all" 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Selector de Turno */}
              <div className="relative flex items-center">
                <FaFilter className="absolute left-3 text-zinc-500 pointer-events-none" size={12}/>
                <select 
                  value={turno} 
                  onChange={e => setTurno(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 pl-8 text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer"
                >
                  <option value="">Todos los turnos</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                  <option value="ambos">Tarde/Noche</option>
                </select>
              </div>

              {/* Filtro de Cumpleaños */}
              <div className="relative flex items-center">
                <FaBirthdayCake className="absolute left-3 text-zinc-500 pointer-events-none" size={14}/>
                <input 
                  type="date" 
                  value={fechaCumple}
                  onChange={e => setFechaCumple(e.target.value)}
                  title="Filtrar por cumpleaños"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 pl-9 text-bar-text focus:outline-none focus:border-bar-accent [color-scheme:dark] cursor-pointer"
                />
              </div>
            </div>
          </div>
        
          <div className="mt-4 flex justify-end">
                <BotonLimpiarFiltros 
                  hayFiltros={!!(search || turno || fechaCumple)} 
                  onLimpiar={limpiarTodo} 
                />
                </div>
              </div>
          </div>
      {/* Botòn de Borrar Filtros */}
      <div className="bg-bar-card rounded-lg overflow-hidden border border-zinc-800 shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-bar-muted">
            <tr>
              <th className="p-4 font-normal">Nombre</th>
              <th className="p-4 font-normal">Teléfono</th>
              <th className="p-4 font-normal text-center">Cumpleaños</th>
              <th className="p-4 text-right font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes?.length > 0 ? (
              clientes.map(cli => (
                <tr key={cli.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                  <td className="p-4 font-medium">{cli.nombre}</td>
                  <td className="p-4 text-bar-muted">{cli.telefono}</td>
                  <td className="p-4 text-center">
                    {cli.cumpleanios ? (
                      <span className="text-sm text-bar-accent flex items-center justify-center gap-2">
                        <FaBirthdayCake size={12}/> {cli.cumpleanios}
                      </span>
                    ) : (
                      <span className="text-zinc-700 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4 flex justify-end gap-3">
                    <button onClick={() => openWhatsApp(cli.telefono)} className="text-green-500 hover:text-green-400 p-2 bg-zinc-900 rounded-full transition" title="WhatsApp"><FaWhatsapp size={18} /></button>
                    <button onClick={() => { setClienteToEdit(cli); setIsEditModalOpen(true); }} className="text-zinc-400 hover:text-white p-2 bg-zinc-900 rounded-full transition" title="Editar"><FaEdit size={18} /></button>
                    <button onClick={() => handleDelete(cli.id)} className="text-red-500 hover:text-red-400 p-2 bg-zinc-900 rounded-full transition" title="Eliminar"><FaTrash size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="p-10 text-center text-bar-muted italic">No se encontraron clientes para mostrar.</td></tr>
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
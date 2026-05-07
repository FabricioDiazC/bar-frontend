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
    <div className="pb-10">
      <h2 className="text-3xl font-light mb-6 text-bar-text px-2 md:px-0">Gestión de Clientes</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ClienteForm onSuccess={fetchClientes} />

        <div className="bg-bar-card p-6 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <h3 className="text-xl text-bar-accent flex items-center gap-2">
              <FaSearch /> Filtros de Búsqueda
            </h3>
            
            <div className="flex flex-col gap-3">
              <input 
                type="text" placeholder="Nombre o teléfono..." 
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-bar-text focus:outline-none focus:border-bar-accent" 
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative flex items-center">
                  <FaFilter className="absolute left-3 text-zinc-500 pointer-events-none" size={12}/>
                  <select 
                    value={turno} onChange={e => setTurno(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 pl-8 text-bar-text focus:outline-none focus:border-bar-accent appearance-none"
                  >
                    <option value="">Todos los turnos</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                  </select>
                </div>

                <div className="relative flex items-center">
                  <FaBirthdayCake className="absolute left-3 text-zinc-500 pointer-events-none" size={14}/>
                  <input 
                    type="date" value={fechaCumple} onChange={e => setFechaCumple(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 pl-9 text-bar-text focus:outline-none focus:border-bar-accent [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <BotonLimpiarFiltros 
              hayFiltros={!!(search || turno || fechaCumple)} 
              onLimpiar={() => {setSearch(''); setTurno(''); setFechaCumple('');}} 
            />
          </div>
        </div>
      </div>

      {/* --- VISTA PARA TABLETS Y COMPUTADORAS --- */}
      <div className="hidden md:block bg-bar-card rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-bar-muted text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Teléfono</th>
              <th className="p-4 font-medium text-center">Cumpleaños</th>
              <th className="p-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes?.map(cli => (
              <tr key={cli.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="p-4 font-medium text-bar-text">{cli.nombre}</td>
                <td className="p-4 text-bar-muted">{cli.telefono}</td>
                <td className="p-4 text-center text-sm">{cli.cumpleanios || '-'}</td>
                <td className="p-4 flex justify-end gap-3">
                  <button onClick={() => openWhatsApp(cli.telefono)} className="text-green-500 hover:bg-green-500/10 p-2 rounded-full transition-all"><FaWhatsapp size={18} /></button>
                  <button onClick={() => { setClienteToEdit(cli); setIsEditModalOpen(true); }} className="text-zinc-400 hover:bg-zinc-100/10 p-2 rounded-full transition-all"><FaEdit size={18} /></button>
                  <button onClick={() => handleDelete(cli.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-all"><FaTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VISTA PARA CELULARES (Mobile) --- */}
      <div className="md:hidden space-y-4 px-2">
        {clientes?.length > 0 ? (
          clientes.map(cli => (
            <div key={cli.id} className="bg-bar-card border border-zinc-800 rounded-2xl p-5 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-bar-text leading-tight">{cli.nombre}</h4>
                  <p className="text-bar-muted text-sm mt-1">{cli.telefono}</p>
                </div>
                <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md uppercase tracking-tighter text-zinc-500">
                  {cli.turno || 'Sin turno'}
                </span>
              </div>

              {/* Botonera Mobile: Botones grandes y fáciles de tocar */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/50">
                <button 
                  onClick={() => openWhatsApp(cli.telefono)}
                  className="flex flex-col items-center justify-center gap-1 bg-zinc-900 py-3 rounded-xl text-green-500 active:bg-green-500/10 transition-colors"
                >
                  <FaWhatsapp size={22} />
                  <span className="text-[9px] uppercase font-bold text-zinc-500">WhatsApp</span>
                </button>
                
                <button 
                  onClick={() => { setClienteToEdit(cli); setIsEditModalOpen(true); }}
                  className="flex flex-col items-center justify-center gap-1 bg-zinc-900 py-3 rounded-xl text-bar-accent active:bg-bar-accent/10 transition-colors"
                >
                  <FaEdit size={20} />
                  <span className="text-[9px] uppercase font-bold text-zinc-500">Editar</span>
                </button>

                <button 
                  onClick={() => handleDelete(cli.id)}
                  className="flex flex-col items-center justify-center gap-1 bg-zinc-900 py-3 rounded-xl text-red-500 active:bg-red-500/10 transition-colors"
                >
                  <FaTrash size={18} />
                  <span className="text-[9px] uppercase font-bold text-zinc-500">Borrar</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-bar-muted py-10 italic">No hay clientes con estos filtros.</p>
        )}
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
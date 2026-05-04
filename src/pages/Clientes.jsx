import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaTrash, FaPlus, FaSearch, FaEdit } from 'react-icons/fa'; 
import { toast } from 'react-toastify';
import { confirmDelete } from '../utils/alerts'; 
import ClienteForm from '../components/ClienteForm'; 
import ClienteEditModal from '../components/ClienteEditModal';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null)

  // Traer clientes de la API
  const fetchClientes = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/clientes/?search=${search}`);
      setClientes(res.data);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [search]);

  // Función para eliminar
  const handleDelete = async (id) => {
    const isConfirmed = await confirmDelete('este cliente');
    if (isConfirmed) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/clientes/${id}/`);
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
      <h2 className="text-3xl font-light mb-6">Gestión de Clientes</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        
        {/* Renderizamos el componente y le pasamos la función para que recargue la tabla */}
        <ClienteForm onSuccess={fetchClientes} />

        {/* Buscador */}
        <div className="bg-bar-card p-6 rounded-lg border border-zinc-800 flex flex-col justify-center">
          <h3 className="text-xl mb-4 text-bar-accent flex items-center gap-2">
            <FaSearch /> Buscar Cliente
          </h3>
          <input 
            type="text" placeholder="Buscar por nombre o teléfono..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-bar-text focus:outline-none focus:border-bar-accent"
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-bar-card rounded-lg overflow-hidden border border-zinc-800">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-bar-muted">
            <tr>
              <th className="p-4 font-normal">Nombre</th>
              <th className="p-4 font-normal">Teléfono</th>
              <th className="p-4 font-normal">Estado Contacto</th>
              <th className="p-4 text-right font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map(cli => (
                <tr key={cli.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                  <td className="p-4">{cli.nombre}</td>
                  <td className="p-4 font-mono text-sm">{cli.telefono}</td>
                  <td className="p-4 text-sm text-bar-muted uppercase tracking-wider text-xs">
                    {cli.estado_contacto.replace('_', ' ')}
                  </td>
                  <td className="p-4 flex justify-end gap-3">
                    <button onClick={() => openWhatsApp(cli.telefono)} className="text-green-500 hover:text-green-400 p-2 bg-zinc-900 rounded-full transition border border-zinc-800 cursor-pointer" title="WhatsApp">
                      <FaWhatsapp size={18} />
                    </button>
                    <button onClick={() => handleOpenEdit(cli)} className="text-zinc-400 hover:text-white p-2 bg-zinc-900 rounded-full transition" title="Editar">
                    <FaEdit size={18} />
                  </button>
                    <button onClick={() => handleDelete(cli.id)} className="text-red-500 hover:text-red-400 p-2 bg-zinc-900 rounded-full transition border border-zinc-800 cursor-pointer" title="Eliminar">
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-6 text-center text-bar-muted">No se encontraron clientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
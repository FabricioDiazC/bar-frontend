import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { confirmDelete, toastAlert } from '../utils/alerts'

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  
  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  const fetchClientes = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/clientes/?search=${search}`);
      setClientes(res.data);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    }
  };

  //Revisar
  useEffect(() => {
    fetchClientes();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/clientes/', { nombre, telefono });
      setNombre('');
      setTelefono('');
      fetchClientes();
    } catch (error) {
      alert('Error al crear cliente. Verifica el número (puede estar duplicado).');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirmDelete('este cliente');
    if (isConfirmed) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/clientes/${id}/`);
        fetchClientes();
        toastAlert('success', 'Cliente eliminado');
      } catch (error) {
        toastAlert('error', 'No se pudo eliminar al cliente');
      }
    }
  };

  // Limpia el número para la API de WhatsApp
  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div>
      <h2 className="text-3xl font-light mb-6">Gestión de Clientes</h2>

      {/* Contenedor Superior: Buscador y Formulario */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        
        {/* Crear Cliente */}
        <div className="bg-bar-card p-6 rounded-lg border border-zinc-800">
          <h3 className="text-xl mb-4 text-bar-accent flex items-center gap-2">
            <FaPlus /> Nuevo Cliente
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" placeholder="Nombre completo" required
              value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent"
            />
            <input 
              type="text" placeholder="Teléfono (Ej: +549...)" required
              value={telefono} onChange={e => setTelefono(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent"
            />
            <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-bar-text px-4 py-2 rounded transition w-full">
              Guardar Cliente
            </button>
          </form>
        </div>

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
              <th className="p-4 font-normal">Estado</th>
              <th className="p-4 text-right font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cli => (
              <tr key={cli.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                <td className="p-4">{cli.nombre}</td>
                <td className="p-4">{cli.telefono}</td>
                <td className="p-4 text-sm text-bar-muted">{cli.estado_contacto.replace('_', ' ')}</td>
                <td className="p-4 flex justify-end gap-3">
                  <button onClick={() => openWhatsApp(cli.telefono)} className="text-green-500 hover:text-green-400 p-2 bg-zinc-900 rounded-full transition" title="WhatsApp">
                    <FaWhatsapp size={20} />
                  </button>
                  <button onClick={() => handleDelete(cli.id)} className="text-red-500 hover:text-red-400 p-2 bg-zinc-900 rounded-full transition" title="Eliminar">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
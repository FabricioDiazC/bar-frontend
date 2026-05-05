import { useState } from 'react';
import api from '../api/axios'; 
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ClienteForm({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ahora enviamos el teléfono tal cual se escribió en el input
      await api.post('clientes/', { 
        nombre: nombre, 
        telefono: telefono 
      });
      
      // Limpiar campos
      setNombre('');
      setTelefono('');
      
      toast.success('¡Cliente agregado exitosamente!');
      
      // Refrescar la lista de clientes en la página principal
      onSuccess(); 
    } catch (error) {
      console.error(error.response?.data);
      // Django dará error si el teléfono ya existe (unique=True)
      toast.error('Error al crear. Verifica que el número no esté duplicado.');
    }
  };

  return (
    <div className="bg-bar-card p-6 rounded-lg border border-zinc-800 flex flex-col justify-center shadow-md">
      <h3 className="text-xl mb-4 text-bar-accent flex items-center gap-2">
        <FaPlus /> Nuevo Cliente
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Campo Nombre */}
        <div>
          <label className="block text-sm text-bar-muted mb-1 font-light uppercase tracking-wider">
            Nombre Completo *
          </label>
          <input 
            type="text" 
            placeholder="Ej: Juan Perez" 
            required
            value={nombre} 
            onChange={e => setNombre(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent transition-colors"
          />
        </div>
        
        {/* Campo Teléfono Único */}
        <div>
          <label className="block text-sm text-bar-muted mb-1 font-light uppercase tracking-wider">
            Teléfono / WhatsApp *
          </label>
          <input 
            type="text" 
            placeholder="Ej: 3512345678" 
            required
            value={telefono} 
            onChange={e => setTelefono(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent transition-colors"
          />
        </div>

        {/* Botón Guardar */}
        <button 
          type="submit" 
          className="bg-bar-accent hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded transition w-full mt-2 cursor-pointer"
        >
          GUARDAR CLIENTE
        </button>
      </form>
    </div>
  );
}
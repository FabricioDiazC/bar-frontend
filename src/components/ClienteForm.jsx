import { useState } from 'react';
//import axios from 'axios';
import api from '../api/axios';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Lista de códigos de área
const countryCodes = [
  { code: '+54',  label: '🇦🇷 +54 (Arg)' },
  { code: '+56',  label: '🇨🇱 +56 (Chile)' },
  { code: '+598', label: '🇺🇾 +598 (Uruguay)' },
  { code: '+55',  label: '🇧🇷 +55 (Brasil)' },
  { code: '+52',  label: '🇲🇽 +52 (México)' },
  { code: '+57',  label: '🇨🇴 +57 (Colombia)' },
  { code: '+34',  label: '🇪🇸 +34 (España)' },
  { code: '+1',   label: '🇺🇸 +1 (USA)' },
];


export default function ClienteForm({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [codigoArea, setCodigoArea] = useState('+54');
  const [numeroLocal, setNumeroLocal] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const telefonoCompleto = `${codigoArea}${numeroLocal}`;

      await api.post('clientes/', { 
        nombre: nombre, 
        telefono: telefonoCompleto 
      });
      
      setNombre('');
      setNumeroLocal('');
      
      toast.success('¡Cliente agregado exitosamente!');
      

      onSuccess(); 
    } catch (error) {
      console.error(error.response?.data);
      toast.error('Error al crear. Verifica que el número no esté duplicado.');
    }
  };

  return (
    <div className="bg-bar-card p-6 rounded-lg border border-zinc-800 flex flex-col justify-center">
      <h3 className="text-xl mb-4 text-bar-accent flex items-center gap-2">
        <FaPlus /> Nuevo Cliente
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-bar-muted mb-1">Nombre Completo *</label>
          <input 
            type="text" placeholder="Ej: Juan Perez" required
            value={nombre} onChange={e => setNombre(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent"
          />
        </div>
        
        <div>
          <label className="block text-sm text-bar-muted mb-1">Teléfono / WhatsApp *</label>
          <div className="flex gap-2">
            <select 
              value={codigoArea} 
              onChange={e => setCodigoArea(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent w-1/3 md:w-2/5"
            >
              {countryCodes.map(country => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
            <input 
              type="text" placeholder="Ej: 3512345678" required
              value={numeroLocal} onChange={e => setNumeroLocal(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent flex-1"
            />
          </div>
        </div>

        <button type="submit" className="bg-bar-accent hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded transition w-full mt-2 cursor-pointer">
          Guardar Cliente
        </button>
      </form>
    </div>
  );
}
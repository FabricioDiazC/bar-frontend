import { useState } from 'react';
import api from '../api/axios'; 
import { FaPlus, FaBirthdayCake } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ClienteForm({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  //Estados para el cumpleaños
  const [mes, setMes] = useState('');
  const [dia, setDia] = useState('');
  const meses = [
    { v: "1", n: "Enero" }, { v: "2", n: "Febrero" }, { v: "3", n: "Marzo" },
    { v: "4", n: "Abril" }, { v: "5", n: "Mayo" }, { v: "6", n: "Junio" },
    { v: "7", n: "Julio" }, { v: "8", n: "Agosto" }, { v: "9", n: "Septiembre" },
    { v: "10", n: "Octubre" }, { v: "11", n: "Noviembre" }, { v: "12", n: "Diciembre" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validacion para que el usuario ponga tanto el mes como el dia
    if ((mes && !dia) || (!mes && dia)) {
      return toast.warning("Debes seleccionar el día y el mes del cumpleaños, o dejar ambos vacíos.");
    }
    try {
      // Esto es re rebuscado pero como el backend me tira error si no pongo el año pusepara que siempre quede seteado en 2000 el año (Año 2000 + Mes + Día)
      let cumpleaniosToSend = null;
      if (mes && dia) {
        // padStart(2, '0') hace que el mes 5 se convierta en 05 para que el gorra puesta de django lo acepte
        const mesFormateado = mes.padStart(2, '0');
        const diaFormateado = dia.padStart(2, '0');
        cumpleaniosToSend = `2000-${mesFormateado}-${diaFormateado}`;
      }
      // Se envia el teléfono tal cual se escribió en el input
      const res = await api.post('clientes/', { 
        nombre: nombre, 
        telefono: telefono,
        cumpleanios: cumpleaniosToSend
      });
      
      // Limpiar campos
      setNombre('');
      setTelefono('');
      setMes('');
      setDia('');
      
      toast.success('Cliente agregado exitosamente');
      
      // Refrescar la lista de clientes en la página principal
      onSuccess(res.data); 
    } catch (error) {
      console.error(error.response?.data);
      // Django va a dar error si el teléfono ya existe (unique=True)
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
        
        {/* Campo Teléfono (Tiene que ser unico) */}
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

        {/* Campo Cumpleaños*/}
        <div>
          <label className="block text-[10px] text-bar-muted mb-1.5 font-bold uppercase tracking-widest flex items-center gap-2">
            <FaBirthdayCake className="text-bar-accent" size={12} /> Cumpleaños <span className="text-zinc-600 font-light lowercase tracking-normal">{/*(Opcional)*/}</span>
          </label>
          <div className="flex gap-3">
            <select 
              value={dia} 
              onChange={e => setDia(e.target.value)}
              className="w-1/3 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer"
            >
              <option value="">Día</option>
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
            
            <select 
              value={mes} 
              onChange={e => setMes(e.target.value)}
              className="w-2/3 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer"
            >
              <option value="">Mes</option>
              {meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
            </select>
          </div>
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
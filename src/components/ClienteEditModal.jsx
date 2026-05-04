import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

export default function ClienteEditModal({ isOpen, onClose, onSuccess, cliente }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    cumpleanios: '',
    estado_contacto: 'no_contesto',
    turno: 'ambos',
    aprobado: true,
    observaciones: ''
  });

  // Rellenar el formulario cuando se abre el modal con un cliente seleccionado
  useEffect(() => {
    if (isOpen && cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        telefono: cliente.telefono || '',
        cumpleanios: cliente.cumpleanios || '', 
        estado_contacto: cliente.estado_contacto || 'no_contesto',
        turno: cliente.turno || 'ambos',
        aprobado: cliente.aprobado !== undefined ? cliente.aprobado : true,
        observaciones: cliente.observaciones || ''
      });
    }
  }, [isOpen, cliente]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Si cumpleaños está vacío, lo mandamos como null para que Django no de error
      const dataToSend = { ...formData };
      if (!dataToSend.cumpleanios) dataToSend.cumpleanios = null;

      await axios.put(`http://127.0.0.1:8000/api/clientes/${cliente.id}/`, dataToSend);
      onSuccess(); 
      onClose();  
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el cliente. Revisa los datos.");
    }
  };

  if (!isOpen || !cliente) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-bar-card border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition">
          <FaTimes size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-light text-bar-accent mb-6">Editar Cliente</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nombre y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Nombre *</label>
                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Teléfono *</label>
                <input type="text" name="telefono" required value={formData.telefono} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none" />
              </div>
            </div>

            {/* Cumpleaños y Turno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Cumpleaños</label>
                <input type="date" name="cumpleanios" value={formData.cumpleanios} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Turno</label>
                <select name="turno" value={formData.turno} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none">
                  <option value="ambos">Tarde/Noche</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                </select>
              </div>
            </div>

            {/* Estado Contacto y Checkbox Aprobado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Estado de Contacto</label>
                <select name="estado_contacto" value={formData.estado_contacto} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none">
                  <option value="no_contesto">No contestó</option>
                  <option value="reservo">Reservó</option>
                  <option value="no_reservo">No reservó</option>
                </select>
              </div>
              <div className="flex items-center h-[42px] px-2">
                <label className="flex items-center space-x-2 cursor-pointer text-sm">
                  <input type="checkbox" name="aprobado" checked={formData.aprobado} onChange={handleChange}
                    className="accent-bar-accent w-4 h-4" />
                  <span>Aprobado (Por aspecto)</span>
                </label>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm text-bar-muted mb-1">Observaciones</label>
              <textarea name="observaciones" rows="3" value={formData.observaciones} onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none resize-none"></textarea>
            </div>

            {/* Botones */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-bar-muted hover:text-white transition">Cancelar</button>
              <button type="submit" className="bg-bar-accent hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded transition">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
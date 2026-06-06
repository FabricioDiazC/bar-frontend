import { useState } from 'react';
import api from '../api/axios';
import { FaTimes, FaStar, FaPhoneAlt, FaUserTag } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function EmbajadoraFormModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apodo: '',
    telefono: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('embajadores/', formData);
      toast.success("¡Embajadora creada exitosamente!");
      setFormData({ nombre: '', apodo: '', telefono: '' });
      onSuccess(); // Actualiza el diccionario en la pagina principal
      onClose();
    } catch (error) {
      console.error(error.response?.data);
      toast.error("Error al crear. Verifica que el teléfono no esté duplicado.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 text-bar-text">
      <div className="bg-bar-card border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer p-1">
          <FaTimes size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-xl font-light text-bar-accent mb-6 uppercase tracking-widest text-center border-b border-zinc-800 pb-4">
            Nueva Embajadora
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2">Nombre Completo *</label>
              <div className="relative">
                <FaStar className="absolute left-3 top-3.5 text-zinc-600" />
                <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} placeholder="Ej: Martina Alonso"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-9 text-sm focus:border-bar-accent outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2 flex justify-between">
                <span>Apodo / Alias</span><span className="italic text-zinc-600">Opcional</span>
              </label>
              <div className="relative">
                <FaUserTag className="absolute left-3 top-3.5 text-zinc-600" />
                <input type="text" name="apodo" value={formData.apodo} onChange={handleChange} placeholder="Ej: Tincha"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-9 text-sm focus:border-bar-accent outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-bar-muted mb-2">Teléfono / WhatsApp *</label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-3 top-3.5 text-zinc-600" />
                <input type="text" name="telefono" required value={formData.telefono} onChange={handleChange} placeholder="Ej: 3512345678"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-9 text-sm focus:border-bar-accent outline-none transition-all" />
              </div>
            </div>

            <div className="pt-4 flex justify-between gap-3 border-t border-zinc-800 mt-4">
              <button type="button" onClick={onClose} className="w-1/3 py-3 text-zinc-500 hover:text-white transition-colors cursor-pointer text-[10px] uppercase tracking-widest border border-zinc-800 rounded-xl hover:bg-zinc-800">Cancelar</button>
              <button type="submit" className="w-2/3 bg-bar-accent hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition-all shadow-lg uppercase tracking-widest text-[10px] cursor-pointer">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
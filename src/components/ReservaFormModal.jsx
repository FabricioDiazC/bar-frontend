import { useState, useEffect } from 'react';
//import axios from 'axios';
import api from '../api/axios';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ReservaFormModal({ isOpen, onClose, onSuccess }) {
  // Estados para las listas desplegables
  const [clientes, setClientes] = useState([]);
  const [representantes, setRepresentantes] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    cliente: '',
    representante: '',
    vouchers: [], 
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    cantidad_personas: 1,
    estado: 'reservado',
    observaciones: ''
  });

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    try {
      const [resClientes, resRepre, resVouchers] = await Promise.all([
        api.get('clientes/'),
        api.get('representantes/'),
        api.get('vouchers/')
      ]);

      setClientes(resClientes.data);
      setRepresentantes(resRepre.data.filter(r => r.estado === 'activo'));
      setVouchers(resVouchers.data.filter(v => v.estado === 'activo'));
    } catch (error) {
      console.error("Error al cargar los datos para el formulario", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar checkboxes de vouchers
  const handleVoucherChange = (id) => {
    setFormData((prev) => {
      const isSelected = prev.vouchers.includes(id);
      return {
        ...prev,
        vouchers: isSelected 
          ? prev.vouchers.filter(vId => vId !== id) 
          : [...prev.vouchers, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.representante) dataToSend.representante = null;

      await api.post('reservas/', dataToSend);
      
      setFormData({ /* ... se limpian los datos ... */ });
      onSuccess(); 
      onClose();   

      // DISPARAM EL TOAST DE ÉXITO
      toast.success('¡Reserva creada exitosamente!');

    } catch (error) {
      console.error(error.response?.data);
      toast.error('Error al crear la reserva. Revisa los datos.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      {/* Contenedor del Modal */}
      <div className="bg-bar-card border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Botón cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition">
          <FaTimes size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-light text-bar-accent mb-6">Nueva Reserva</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cliente y Personas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Cliente *</label>
                <select name="cliente" required value={formData.cliente} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none">
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.telefono})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Cant. Personas *</label>
                <input type="number" name="cantidad_personas" min="1" required value={formData.cantidad_personas} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Dia y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Fecha *</label>
                <input type="date" name="fecha" required value={formData.fecha} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Hora Inicio *</label>
                <input type="time" name="hora_inicio" required value={formData.hora_inicio} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Hora Fin *</label>
                <input type="time" name="hora_fin" required value={formData.hora_fin} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Estado y Representante (CONSULTAR CON AGUS)*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Estado de la Reserva *</label>
                <select name="estado" required value={formData.estado} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none">
                  <option value="a_confirmar">Falta confirmar</option>
                  <option value="reservado">Reservado</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Representante (Opcional)</label>
                <select name="representante" value={formData.representante} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none">
                  <option value="">Ninguno</option>
                  {representantes.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre} {r.apodo ? `(${r.apodo})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/*Vouchers */}
            <div>
              <label className="block text-sm text-bar-muted mb-2">Vouchers (Opcionales)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vouchers.map(v => (
                  <label key={v.id} className="flex items-center space-x-2 bg-zinc-900 border border-zinc-700 p-2 rounded cursor-pointer hover:border-zinc-500 transition">
                    <input type="checkbox" checked={formData.vouchers.includes(v.id)} onChange={() => handleVoucherChange(v.id)}
                      className="accent-bar-accent w-4 h-4"
                    />
                    <span className="text-sm">{v.nombre}</span>
                  </label>
                ))}
                {vouchers.length === 0 && <span className="text-sm text-zinc-500">No hay vouchers activos.</span>}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm text-bar-muted mb-1">Observaciones</label>
              <textarea name="observaciones" rows="3" value={formData.observaciones} onChange={handleChange}
                placeholder="Alergias, vergano"
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none resize-none"
              ></textarea>
            </div>
            {/* Botón Guardar */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-bar-muted hover:text-white transition">
                Cancelar
              </button>
              <button type="submit" className="bg-bar-accent hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded transition">
                Guardar Reserva
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
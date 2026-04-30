import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

export default function ReservaEditModal({ isOpen, onClose, onSuccess, reserva }) {
  const [clientes, setClientes] = useState([]);
  const [representantes, setRepresentantes] = useState([]);
  const [vouchers, setVouchers] = useState([]);

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

  // 1. Cargar las listas (Clientes, Reps, Vouchers)
  useEffect(() => {
    if (isOpen) {
      const cargarDatos = async () => {
        try {
          const [resClientes, resRepre, resVouchers] = await Promise.all([
            axios.get('http://127.0.0.1:8000/api/clientes/'),
            axios.get('http://127.0.0.1:8000/api/representantes/'),
            axios.get('http://127.0.0.1:8000/api/vouchers/')
          ]);
          setClientes(resClientes.data);
          setRepresentantes(resRepre.data.filter(r => r.estado === 'activo'));
          setVouchers(resVouchers.data.filter(v => v.estado === 'activo'));
        } catch (error) {
          console.error("Error al cargar los datos", error);
        }
      };
      cargarDatos();
    }
  }, [isOpen]);

  // 2. Rellenar el formulario con los datos de la reserva seleccionada
  useEffect(() => {
    if (isOpen && reserva) {
      setFormData({
        cliente: reserva.cliente || '',
        representante: reserva.representante || '',
        vouchers: reserva.vouchers || [],
        fecha: reserva.fecha || '',
        // Cortamos los segundos (ej: "21:00:00" -> "21:00") para el input type="time"
        hora_inicio: reserva.hora_inicio ? reserva.hora_inicio.slice(0, 5) : '',
        hora_fin: reserva.hora_fin ? reserva.hora_fin.slice(0, 5) : '',
        cantidad_personas: reserva.cantidad_personas || 1,
        estado: reserva.estado || 'reservado',
        observaciones: reserva.observaciones || ''
      });
    }
  }, [isOpen, reserva]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVoucherChange = (id) => {
    setFormData((prev) => {
      const isSelected = prev.vouchers.includes(id);
      return {
        ...prev,
        vouchers: isSelected ? prev.vouchers.filter(vId => vId !== id) : [...prev.vouchers, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.representante) dataToSend.representante = null;

      // Hacemos PUT a la URL específica del ID de esta reserva
      await axios.put(`http://127.0.0.1:8000/api/reservas/${reserva.id}/`, dataToSend);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la reserva.");
    }
  };

  if (!isOpen || !reserva) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-bar-card border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition">
          <FaTimes size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-light text-bar-accent mb-6">Editar Reserva</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Cliente *</label>
                <select name="cliente" required value={formData.cliente} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none">
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Cant. Personas *</label>
                <input type="number" name="cantidad_personas" min="1" required value={formData.cantidad_personas} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Fecha *</label>
                <input type="date" name="fecha" required value={formData.fecha} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Hora Inicio *</label>
                <input type="time" name="hora_inicio" required value={formData.hora_inicio} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Hora Fin *</label>
                <input type="time" name="hora_fin" required value={formData.hora_fin} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none [color-scheme:dark]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Estado de la Reserva *</label>
                <select name="estado" required value={formData.estado} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none">
                  <option value="a_confirmar">Falta confirmar</option>
                  <option value="reservado">Reservado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="completado">Completado</option>
                  <option value="no_show">No asistió</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Representante (Opcional)</label>
                <select name="representante" value={formData.representante} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none">
                  <option value="">Ninguno</option>
                  {representantes.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-bar-muted mb-2">Vouchers</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vouchers.map(v => (
                  <label key={v.id} className="flex items-center space-x-2 bg-zinc-900 border border-zinc-700 p-2 rounded cursor-pointer hover:border-zinc-500 transition">
                    <input type="checkbox" checked={formData.vouchers.includes(v.id)} onChange={() => handleVoucherChange(v.id)} className="accent-bar-accent w-4 h-4" />
                    <span className="text-sm">{v.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-bar-muted mb-1">Observaciones</label>
              <textarea name="observaciones" rows="3" value={formData.observaciones} onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:border-bar-accent focus:outline-none resize-none"></textarea>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-bar-muted hover:text-white transition">Cancelar</button>
              <button type="submit" className="bg-bar-accent hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded transition">Actualizar Reserva</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
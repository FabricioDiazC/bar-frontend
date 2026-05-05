import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTimes, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ReservaEditModal({ isOpen, onClose, onSuccess, reserva }) {
  const [representantes, setRepresentantes] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [clienteConfirmado, setClienteConfirmado] = useState(false);

  const [formData, setFormData] = useState({
    cliente: '',
    representante: '',
    vouchers: [],
    fecha: '',
    hora_inicio: '',
    cantidad_personas: 1,
    cantidad_personas_reales: 0,
    estado: 'reservado',
    observaciones: ''
  });

  useEffect(() => {
    if (isOpen) {
      const cargarDatosBase = async () => {
        try {
          const [resRepre, resVouchers] = await Promise.all([
            api.get('representantes/'),
            api.get('vouchers/')
          ]);
          const listaRepre = resRepre.data.results || resRepre.data;
          const listaVouchers = resVouchers.data.results || resVouchers.data;
          setRepresentantes(listaRepre.filter(r => r.estado === 'activo'));
          setVouchers(listaVouchers.filter(v => v.estado === 'activo'));
        } catch (error) { console.error(error); }
      };
      cargarDatosBase();
    }
  }, [isOpen]);

  // CORRECCIÓN 1: Carga de datos más segura
  useEffect(() => {
    if (isOpen && reserva) {
      setFormData({
        cliente: reserva.cliente || '',
        representante: reserva.representante || '',
        vouchers: reserva.vouchers || [],
        fecha: reserva.fecha || '',
        hora_inicio: reserva.hora_inicio ? reserva.hora_inicio.slice(0, 5) : '',
        cantidad_personas: reserva.cantidad_personas || 1,
        // Usamos el valor que viene del backend, si no existe ponemos 0
        cantidad_personas_reales: reserva.cantidad_personas_reales ?? 0, 
        estado: reserva.estado || 'reservado',
        observaciones: reserva.observaciones || ''
      });
      setBusqueda(reserva.cliente_nombre || '');
      setClienteConfirmado(true);
    }
  }, [isOpen, reserva]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (busqueda.length > 1 && !clienteConfirmado) {
        try {
          const res = await api.get(`clientes/?search=${busqueda}`);
          setResultados(res.data.results || res.data);
          setMostrarResultados(true);
        } catch (error) { console.error(error); }
      } else {
        setResultados([]);
        setMostrarResultados(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, clienteConfirmado]);

  const seleccionarCliente = (cliente) => {
    setFormData({ ...formData, cliente: cliente.id });
    setBusqueda(cliente.nombre);
    setClienteConfirmado(true);
    setMostrarResultados(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVoucherChange = (id) => {
    setFormData((prev) => {
      const isSelected = prev.vouchers.includes(id);
      return { ...prev, vouchers: isSelected ? prev.vouchers.filter(vId => vId !== id) : [...prev.vouchers, id] };
    });
  };

  // CORRECCIÓN 2: Conversión estricta a número antes de enviar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente || !clienteConfirmado) return toast.warning("Selecciona un cliente válido");

    try {
      // Creamos una copia de los datos y convertimos los números a Integer
      const dataToSend = { 
        ...formData,
        cantidad_personas: parseInt(formData.cantidad_personas),
        cantidad_personas_reales: parseInt(formData.cantidad_personas_reales || 0)
      };

      if (!dataToSend.representante) dataToSend.representante = null;

      await api.put(`reservas/${reserva.id}/`, dataToSend);
      toast.success("Reserva actualizada correctamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error.response?.data);
      toast.error("Error al actualizar la reserva");
    }
  };

  if (!isOpen || !reserva) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-bar-card border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"><FaTimes size={20} /></button>

        <div className="p-6">
          <h2 className="text-2xl font-light text-bar-accent mb-6">Editar Reserva</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Buscador de Cliente */}
            <div className="relative">
              <label className="block text-sm text-bar-muted mb-1 flex justify-between">
                <span>Cliente *</span>
                {clienteConfirmado && <span className="text-green-500 text-xs flex items-center gap-1"><FaCheckCircle /> Confirmado</span>}
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-zinc-500" />
                <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setClienteConfirmado(false); }}
                  className={`w-full bg-zinc-900 border ${clienteConfirmado ? 'border-green-900/50' : 'border-zinc-700'} rounded p-2 pl-10 focus:outline-none focus:border-bar-accent`} />
              </div>
              {mostrarResultados && resultados.length > 0 && (
                <ul className="absolute z-50 w-full bg-zinc-900 border border-zinc-800 mt-1 rounded shadow-2xl max-h-48 overflow-y-auto">
                  {resultados.map(c => (
                    <li key={c.id} onClick={() => seleccionarCliente(c)} className="p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 flex justify-between">
                      <span className="text-sm">{c.nombre}</span>
                      <span className="text-xs text-bar-muted">{c.telefono}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Fila: Personas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1 uppercase text-[10px] tracking-widest">Cant. Personas (Reserva)</label>
                <input type="number" name="cantidad_personas" min="1" required value={formData.cantidad_personas} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent" />
              </div>
              <div>
                <label className="block text-sm text-bar-accent mb-1 uppercase text-[10px] tracking-widest font-bold">Cant. Real Personas (Asistieron)</label>
                <input type="number" name="cantidad_personas_reales" min="0" value={formData.cantidad_personas_reales} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-bar-accent/50 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent" />
              </div>
            </div>

            {/* Fila: Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1 uppercase text-[10px]">Fecha *</label>
                <input type="date" name="fecha" required value={formData.fecha} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:outline-none focus:border-bar-accent [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1 uppercase text-[10px]">Hora Inicio *</label>
                <input type="time" name="hora_inicio" required value={formData.hora_inicio} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:outline-none focus:border-bar-accent [color-scheme:dark]" />
              </div>
            </div>

            {/* Estado y Representante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1 uppercase text-[10px]">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:outline-none focus:border-bar-accent">
                  <option value="a_confirmar">Falta confirmar</option>
                  <option value="reservado">Reservado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="completado">Completado</option>
                  <option value="no_show">No asistió</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1 uppercase text-[10px]">Representante</label>
                <select name="representante" value={formData.representante} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:outline-none focus:border-bar-accent">
                  <option value="">Ninguno</option>
                  {representantes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* Vouchers y Observaciones */}
            <div>
              <label className="block text-sm text-bar-muted mb-2 uppercase text-[10px]">Vouchers</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vouchers.map(v => (
                  <label key={v.id} className="flex items-center space-x-2 bg-zinc-900 border border-zinc-700 p-2 rounded cursor-pointer hover:border-zinc-500 transition">
                    <input type="checkbox" checked={formData.vouchers.includes(v.id)} onChange={() => handleVoucherChange(v.id)} className="accent-bar-accent" />
                    <span className="text-sm">{v.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-bar-muted mb-1 uppercase text-[10px]">Observaciones</label>
              <textarea name="observaciones" rows="2" value={formData.observaciones} onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 focus:outline-none focus:border-bar-accent resize-none"></textarea>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-bar-muted hover:text-white cursor-pointer">Cancelar</button>
              <button type="submit" className="bg-bar-accent hover:bg-yellow-600 text-black font-bold px-8 py-2 rounded transition cursor-pointer">ACTUALIZAR</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
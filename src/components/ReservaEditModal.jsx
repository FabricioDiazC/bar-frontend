import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTimes, FaSearch, FaCheckCircle, FaClock  } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ReservaEditModal({ isOpen, onClose, onSuccess, reserva }) {
  const [representantes, setRepresentantes] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [clienteConfirmado, setClienteConfirmado] = useState(false);

  // Lista de horarios permitidos
  const horariosPermitidos = [
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", 
    "21:00", "21:30", "22:00", "22:30", "23:00"
  ];

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

  //Logica del buscador de clientes
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

  // Conversión estricta a número antes de enviar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente || !clienteConfirmado) return toast.warning("Selecciona un cliente válido");

    try {
      // Se crea una copia de los datos y se convierten los números a Integer
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
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer transition-colors">
          <FaTimes size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-light text-bar-accent mb-6">Editar Reserva</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Buscador de Cliente */}
            <div className="relative">
              <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1 flex justify-between">
                <span>Cliente *</span>
                {clienteConfirmado && <span className="text-green-500 text-[10px] flex items-center gap-1"><FaCheckCircle /> Confirmado</span>}
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-zinc-500" />
                <input 
                  type="text" 
                  value={busqueda} 
                  onChange={(e) => { setBusqueda(e.target.value); setClienteConfirmado(false); }}
                  className={`w-full bg-zinc-900 border ${clienteConfirmado ? 'border-green-900/50' : 'border-zinc-700'} rounded-lg p-2.5 pl-10 text-bar-text focus:outline-none focus:border-bar-accent transition-all`} 
                />
              </div>
              {mostrarResultados && resultados.length > 0 && (
                <ul className="absolute z-50 w-full bg-zinc-900 border border-zinc-800 mt-1 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                  {resultados.map(c => (
                    <li key={c.id} onClick={() => seleccionarCliente(c)} className="p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 flex justify-between items-center">
                      <span className="text-sm font-medium">{c.nombre}</span>
                      <span className="text-xs text-bar-muted">{c.telefono}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Fila: Personas Planificadas, Reales y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Personas *</label>
                <input type="number" name="cantidad_personas" min="1" required value={formData.cantidad_personas} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-bar-text focus:outline-none focus:border-bar-accent" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-bar-accent mb-1 font-bold">Real Vinieron</label>
                <input type="number" name="cantidad_personas_reales" min="0" value={formData.cantidad_personas_reales} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-bar-accent/40 rounded-lg p-2.5 text-bar-text focus:outline-none focus:border-bar-accent" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Fecha *</label>
                <input type="date" name="fecha" required value={formData.fecha} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-bar-text focus:outline-none focus:border-bar-accent [color-scheme:dark]" />
              </div>
            </div>

            {/* Fila: Horario, Estado y Representante */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* SELECTOR DE HORA (Igual al de Crear) */}
               <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Hora *</label>
                <div className="relative flex items-center">
                   <FaClock className="absolute left-3 text-zinc-500 pointer-events-none" size={14} />
                   <select 
                    name="hora_inicio" 
                    required 
                    value={formData.hora_inicio} 
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 pl-9 text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer"
                   >
                     <option value="">Seleccionar...</option>
                     {horariosPermitidos.map(h => (
                       <option key={h} value={h}>{h} hs</option>
                     ))}
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer">
                  <option value="a_confirmar">Falta confirmar</option>
                  <option value="reservado">Reservado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="completado">Completado</option>
                  <option value="no_show">No asistió</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Representante</label>
                <select name="representante" value={formData.representante} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer">
                  <option value="">Ninguno</option>
                  {representantes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* Vouchers */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-bar-muted mb-2">Vouchers Aplicados</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vouchers.map(v => (
                  <label key={v.id} className="flex items-center space-x-2 bg-zinc-900 border border-zinc-700 p-2.5 rounded-lg cursor-pointer hover:border-zinc-500 transition-colors">
                    <input type="checkbox" checked={formData.vouchers.includes(v.id)} onChange={() => handleVoucherChange(v.id)} className="accent-bar-accent w-4 h-4" />
                    <span className="text-sm text-bar-text font-light">{v.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Observaciones</label>
              <textarea name="observations" rows="2" value={formData.observaciones} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-bar-text focus:outline-none focus:border-bar-accent resize-none h-20"></textarea>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-bar-muted hover:text-white transition-colors cursor-pointer text-sm font-medium">Cancelar</button>
              <button type="submit" className="bg-bar-accent hover:bg-yellow-600 text-black font-bold px-8 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95">ACTUALIZAR DATOS</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
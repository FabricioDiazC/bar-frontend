import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTimes, FaSearch, FaCheckCircle, FaClock, FaTicketAlt   } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ReservaFormModal({ isOpen, onClose, onSuccess }) {
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

  // Opciones para el Tipo de Entrada 
  const opcionesEntrada = [
    { id: 'free_con_representante', label: 'Free con Representante' },
    { id: 'free_sin_representante', label: 'Free sin representante' },
    { id: 'cobrada_con_consumible', label: 'Cobrada con consumible' },
    { id: 'cobrada_sin_consumible', label: 'Cobrada sin consumible' },
    { id: 'a_bailar', label: 'A bailar' },
    { id: 'a_cenar', label: 'A cenar' }
  ];

  const [formData, setFormData] = useState({
    cliente: '',
    representante: '',
    vouchers: [],
    fecha: '',
    hora_inicio: '',
    cantidad_personas: 1,
    estado: 'reservado',
    observaciones: '',
    tipo_entrada: ''
  });

  useEffect(() => {
    if (isOpen) cargarDatosBase();
  }, [isOpen]);

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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (busqueda.length > 1 && !clienteConfirmado) {
        try {
          const res = await api.get(`clientes/?search=${busqueda}`);
          setResultados(res.data.results || res.data);
          setMostrarResultados(true);
        } catch (error) {
          console.error(error);
        }
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

  const resetForm = () => {
    setFormData({ cliente: '', representante: '', vouchers: [], fecha: '', hora_inicio: '', cantidad_personas: 1, estado: 'reservado', observaciones: '', tipo_entrada: ''});
    setBusqueda('');
    setClienteConfirmado(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente || !clienteConfirmado) return toast.warning("Selecciona un cliente de la lista");
    if (!formData.hora_inicio) return toast.warning("Por favor selecciona un horario");

    try {
      const dataToSend = { ...formData };
      if (!dataToSend.representante) dataToSend.representante = null;
      // 3. SOLUCIÓN DEFINITIVA: Si tipo_entrada es una cadena vacía, ELIMINAR el campo del objeto.
      // De esta forma, el backend no recibe nada y no se queja de la cadena vacía.
      if (!dataToSend.tipo_entrada) {
        delete dataToSend.tipo_entrada;
      }

      await api.post('reservas/', dataToSend);
      toast.success("Reserva creada");
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al crear la reserva");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-bar-card border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={() => { resetForm(); onClose(); }} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer transition-colors">
          <FaTimes size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-light text-bar-accent mb-6">Nueva Reserva</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Buscador de Cliente */}
            <div className="relative">
              <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1 flex justify-between">
                <span>Cliente *</span>
                {clienteConfirmado && <span className="text-green-500 text-[10px] flex items-center gap-1"><FaCheckCircle /> Confirmado</span>}
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-zinc-500" />
                <input type="text" placeholder="Escribe nombre o teléfono..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setClienteConfirmado(false); }}
                  className={`w-full bg-zinc-900 border ${clienteConfirmado ? 'border-green-900/50' : 'border-zinc-700'} rounded-lg p-2.5 pl-10 text-bar-text focus:outline-none focus:border-bar-accent transition-all`} />
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

            {/* Fila: Personas, Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Personas *</label>
                <input type="number" name="cantidad_personas" min="1" required value={formData.cantidad_personas} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-bar-text focus:outline-none focus:border-bar-accent" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Fecha *</label>
                <input type="date" name="fecha" required value={formData.fecha} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-bar-text focus:outline-none focus:border-bar-accent [color-scheme:dark]" />
              </div>
              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Hora *</label>
                <div className="relative flex items-center">
                   <FaClock className="absolute left-3 text-zinc-500 pointer-events-none" size={14} />
                   <select name="hora_inicio" required value={formData.hora_inicio} onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 pl-9 text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer">
                     <option value="">Seleccionar...</option>
                     {horariosPermitidos.map(h => <option key={h} value={h}>{h} hs</option>)}
                   </select>
                </div>
              </div>
            </div>

            {/* Estado y Representante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-bar-text focus:outline-none focus:border-bar-accent appearance-none cursor-pointer">
                  <option value="a_confirmar">Falta confirmar</option>
                  <option value="reservado">Reservado</option>
                  <option value="completado">Completado</option>
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
              <label className="block text-xs uppercase tracking-widest text-bar-muted mb-2">Vouchers Disponibles</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vouchers.map(v => (
                  <label key={v.id} className="flex items-center space-x-2 bg-zinc-900 border border-zinc-700 p-2.5 rounded-lg cursor-pointer hover:border-zinc-500 transition-colors">
                    <input type="checkbox" checked={formData.vouchers.includes(v.id)} onChange={() => handleVoucherChange(v.id)} className="accent-bar-accent w-4 h-4" />
                    <span className="text-sm text-bar-text font-light">{v.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* TIPO DE ENTRADA */}
            <div className="pt-2">
              <label className="block text-xs uppercase tracking-widest text-bar-muted mb-3 flex items-center gap-2">
                <FaTicketAlt className="text-bar-accent" /> Tipo de Entrada
              </label>
              <div className="flex flex-wrap gap-4 px-2">
                {opcionesEntrada.map((opcion) => (
                  <label key={opcion.id} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="tipo_entrada" 
                      value={opcion.id}
                      checked={formData.tipo_entrada === opcion.id}
                      onChange={handleChange}
                      className="w-4 h-4 accent-bar-accent bg-zinc-900 border-zinc-700" 
                    />
                    <span className="text-sm text-bar-text font-light group-hover:text-bar-accent transition-colors">
                      {opcion.label}
                    </span>
                  </label>
                ))}
                {/* Botón para desmarcar */}
                {formData.tipo_entrada && (
                   <button 
                    type="button" 
                    onClick={() => setFormData({...formData, tipo_entrada: ''})}
                    className="text-[12px] text-zinc-600 hover:text-red-500 uppercase tracking-tighter ml-auto"
                   >
                     Limpiar Selección
                   </button>
                )}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-bar-muted mb-1">Observaciones</label>
              <textarea name="observaciones" rows="2" value={formData.observaciones} onChange={handleChange} placeholder="Detalles de la mesa..." className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-bar-text focus:outline-none focus:border-bar-accent resize-none h-20"></textarea>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button type="button" onClick={() => { resetForm(); onClose(); }} className="px-5 py-2.5 text-bar-muted hover:text-white transition-colors cursor-pointer text-sm font-medium">Cancelar</button>
              <button type="submit" className="bg-bar-accent hover:bg-yellow-600 text-black font-bold px-8 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95">GUARDAR RESERVA</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTimes, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ReservaFormModal({ isOpen, onClose, onSuccess }) {
  const [representantes, setRepresentantes] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  // ESTADOS PARA EL BUSCADOR DE CLIENTES
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
    hora_fin: '',
    cantidad_personas: 1,
    estado: 'reservado',
    observaciones: ''
  });

  // 1. Cargar Representantes y Vouchers al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarDatosBase();
    }
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
      console.error("Error al cargar catálogos", error);
    }
  };

  // 2. Lógica del Buscador en tiempo real (Debounce de 300ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (busqueda.length > 1 && !clienteConfirmado) {
        try {
          const res = await api.get(`clientes/?search=${busqueda}`);
          setResultados(res.data.results || res.data);
          setMostrarResultados(true);
        } catch (error) {
          console.error("Error buscando clientes", error);
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
      return {
        ...prev,
        vouchers: isSelected ? prev.vouchers.filter(vId => vId !== id) : [...prev.vouchers, id]
      };
    });
  };

  const resetForm = () => {
    setFormData({
      cliente: '', representante: '', vouchers: [], fecha: '',
      hora_inicio: '', hora_fin: '', cantidad_personas: 1,
      estado: 'reservado', observaciones: ''
    });
    setBusqueda('');
    setClienteConfirmado(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente || !clienteConfirmado) {
      return toast.warning("Debes seleccionar un cliente de la lista de resultados");
    }

    try {
      const dataToSend = { ...formData };
      if (!dataToSend.representante) dataToSend.representante = null;

      await api.post('reservas/', dataToSend);
      toast.success("¡Reserva creada con éxito!");
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la reserva. Verifica los datos.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-bar-card border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button 
          onClick={() => { resetForm(); onClose(); }} 
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <FaTimes size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-light text-bar-accent mb-6">Nueva Reserva</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* BUSCADOR DE CLIENTE (Autocomplete) */}
            <div className="relative">
              <label className="block text-sm text-bar-muted mb-1 flex justify-between">
                <span>Cliente *</span>
                {clienteConfirmado && (
                  <span className="text-green-500 text-xs flex items-center gap-1">
                    <FaCheckCircle /> Seleccionado
                  </span>
                )}
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Escribe el nombre del cliente..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setClienteConfirmado(false);
                  }}
                  className={`w-full bg-zinc-900 border ${clienteConfirmado ? 'border-green-900/50' : 'border-zinc-700'} rounded p-2 pl-10 text-bar-text focus:outline-none focus:border-bar-accent transition-colors`}
                />
              </div>

              {/* Resultados del buscador */}
              {mostrarResultados && resultados.length > 0 && (
                <ul className="absolute z-50 w-full bg-zinc-900 border border-zinc-800 mt-1 rounded shadow-2xl max-h-48 overflow-y-auto">
                  {resultados.map(c => (
                    <li 
                      key={c.id} 
                      onClick={() => seleccionarCliente(c)}
                      className="p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 flex justify-between items-center"
                    >
                      <span className="text-sm font-medium">{c.nombre}</span>
                      <span className="text-xs text-bar-muted">{c.telefono}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Fila: Personas y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Cant. Personas *</label>
                <input 
                  type="number" name="cantidad_personas" min="1" required 
                  value={formData.cantidad_personas} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent" 
                />
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Fecha *</label>
                <input 
                  type="date" name="fecha" required 
                  value={formData.fecha} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent [color-scheme:dark]" 
                />
              </div>
            </div>

            {/* Fila: Horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Hora Inicio *</label>
                <input 
                  type="time" name="hora_inicio" required 
                  value={formData.hora_inicio} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent [color-scheme:dark]" 
                />
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Hora Fin *</label>
                <input 
                  type="time" name="hora_fin" required 
                  value={formData.hora_fin} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent [color-scheme:dark]" 
                />
              </div>
            </div>

            {/* Fila: Estado y Representante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-bar-muted mb-1">Estado</label>
                <select 
                  name="estado" value={formData.estado} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent"
                >
                  <option value="a_confirmar">Falta confirmar</option>
                  <option value="reservado">Reservado</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-bar-muted mb-1">Representante (Opcional)</label>
                <select 
                  name="representante" value={formData.representante} onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent"
                >
                  <option value="">Ninguno</option>
                  {representantes.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vouchers */}
            <div>
              <label className="block text-sm text-bar-muted mb-2">Vouchers Disponibles</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vouchers.map(v => (
                  <label key={v.id} className="flex items-center space-x-2 bg-zinc-900 border border-zinc-700 p-2 rounded cursor-pointer hover:border-zinc-500 transition">
                    <input 
                      type="checkbox" 
                      checked={formData.vouchers.includes(v.id)} 
                      onChange={() => handleVoucherChange(v.id)} 
                      className="accent-bar-accent w-4 h-4" 
                    />
                    <span className="text-sm">{v.nombre}</span>
                  </label>
                ))}
                {vouchers.length === 0 && <span className="text-xs text-zinc-600">No hay vouchers activos</span>}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm text-bar-muted mb-1">Observaciones</label>
              <textarea 
                name="observaciones" rows="3" 
                value={formData.observaciones} onChange={handleChange}
                placeholder="Detalles sobre la mesa, festejos, etc..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-bar-text focus:outline-none focus:border-bar-accent resize-none"
              ></textarea>
            </div>

            {/* Botones de acción */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => { resetForm(); onClose(); }} 
                className="px-4 py-2 text-bar-muted hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="bg-bar-accent hover:bg-yellow-600 text-black font-medium px-6 py-2 rounded transition cursor-pointer"
              >
                Guardar Reserva
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
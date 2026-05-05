import { useState, useEffect } from 'react';
//import axios from 'axios';
import api from '../api/axios';
import { FaTimes, FaSearch  } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ReservaFormModal({ isOpen, onClose, onSuccess }) {
  // Estados para las listas desplegables
  const [clientes, setClientes] = useState([]);
  const [representantes, setRepresentantes] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  // ESTADOS PARA EL BUSCADOR DE CLIENTES
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

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
      cargarDatosIniciales();
    }
  }, [isOpen]);

  // Buscar clientes cuando el usuario escribe
  useEffect(() => {
    const buscarClientes = async () => {
      if (busqueda.length > 1) { // Empezar a buscar tras 2 letras
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
    };

    const timeoutId = setTimeout(buscarClientes, 300); // Pequeña espera para no saturar la API
    return () => clearTimeout(timeoutId);
  }, [busqueda]);

  const cargarDatosIniciales = async () => {
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

  const seleccionarCliente = (c) => {
    setClienteSeleccionado(c);
    setFormData({ ...formData, cliente: c.id });
    setBusqueda(c.nombre); // Ponemos el nombre en el input
    setMostrarResultados(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente) return alert("Por favor selecciona un cliente de la lista");
    try {
      await api.post('reservas/', formData);
      setFormData({ cliente: '', representante: '', vouchers: [], fecha: '', hora_inicio: '', hora_fin: '', cantidad_personas: 1, estado: 'reservado', observaciones: '' });
      setBusqueda('');
      setClienteSeleccionado(null);
      onSuccess();
      onClose();
    } catch (error) {
      alert("Error al crear reserva");
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
             <div className="relative">
              <label className="block text-sm text-bar-muted mb-1">Buscar Cliente *</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Escribe nombre o teléfono..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    if (clienteSeleccionado) setFormData({...formData, cliente: ''}); // Si borra se deselecciona
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 pl-10 focus:border-bar-accent focus:outline-none"
                />
              </div>

              {/* Lista de Sugerencias */}
              {mostrarResultados && resultados.length > 0 && (
                <ul className="absolute z-10 w-full bg-zinc-900 border border-zinc-700 mt-1 rounded shadow-xl max-h-40 overflow-y-auto">
                  {resultados.map(c => (
                    <li 
                      key={c.id} 
                      onClick={() => seleccionarCliente(c)}
                      className="p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800 last:border-0 flex justify-between"
                    >
                      <span>{c.nombre}</span>
                      <span className="text-bar-muted text-xs">{c.telefono}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Cantidad Personas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Alergias, dieta especial, etc."
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
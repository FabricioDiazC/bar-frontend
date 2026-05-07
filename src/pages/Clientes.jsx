import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaWhatsapp, FaTrash, FaPlus, FaSearch, FaEdit, FaFilter, FaBirthdayCake  } from 'react-icons/fa'; 
import { toast } from 'react-toastify';
import { confirmDelete } from '../utils/alerts'; 
import ClienteForm from '../components/ClienteForm'; 
import ClienteEditModal from '../components/ClienteEditModal';
import Paginacion from '../components/Paginacion';
import BotonLimpiarFiltros from '../components/BotonLimpiarFiltros';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  //Estado para el modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null)
  //Paginacion
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  //Estado para el filtrado turno
  const [turno, setTurno] = useState('');
  //Estado para el filtro de cumpleaños
  const [mesCumple, setMesCumple] = useState('');
  const [diaCumple, setDiaCumple] = useState('');

  const meses = [
    { v: "1", n: "Enero" }, { v: "2", n: "Febrero" }, { v: "3", n: "Marzo" },
    { v: "4", n: "Abril" }, { v: "5", n: "Mayo" }, { v: "6", n: "Junio" },
    { v: "7", n: "Julio" }, { v: "8", n: "Agosto" }, { v: "9", n: "Septiembre" },
    { v: "10", n: "Octubre" }, { v: "11", n: "Noviembre" }, { v: "12", n: "Diciembre" }
  ];

  //Funcion para limpiar todos los estados de una vez y por ende los filtros activos
  const limpiarTodo = () => {
    setSearch(''); 
    setTurno(''); 
    setMesCumple(''); 
    setDiaCumple(''); 
    setPagina(1);
    toast.info("Filtros restablecidos");
  };


  // Traer clientes de la API
  const fetchClientes = async () => {
    try {
      // URL con todos los filtros
      let url = `clientes/?search=${search}&page=${pagina}`;
      //Filtro para el turno
      if (turno) url += `&turno=${turno}`;
      //Filtros para mes y dia
      if (mesCumple) url += `&mes=${mesCumple}`;
      if (diaCumple) url += `&dia=${diaCumple}`;

      const res = await api.get(url);
      
      const datosRecibidos = res.data.results || (Array.isArray(res.data) ? res.data : []);
      const conteoTotal = res.data.count || datosRecibidos.length;

      setClientes(datosRecibidos);
      setTotal(conteoTotal);
    } catch (error) {
      console.error("Error al cargar clientes", error);
      setClientes([]);
    }
  };

  useEffect(() => {
    setPagina(1);
  }, [search, turno,  mesCumple, diaCumple]);

  useEffect(() => {
    fetchClientes();
  }, [search, pagina, turno, mesCumple, diaCumple]);

  // Función para eliminar
  const handleDelete = async (id) => {
    const isConfirmed = await confirmDelete('este cliente');
    if (isConfirmed) {
      try {
        await api.delete(`clientes/${id}/`);
        fetchClientes();
        toast.success('Cliente eliminado');
      } catch (error) {
        toast.error('Hubo un problema al eliminar el cliente');
      }
    }
  };

  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleOpenEdit = (cliente) => {
    setClienteToEdit(cliente);
    setIsEditModalOpen(true);
  };

  return (
    <div className="pb-10">
      <h2 className="text-3xl font-light mb-6 text-bar-text px-2 md:px-0">Gestión de Clientes</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ClienteForm onSuccess={fetchClientes} />

        <div className="bg-bar-card p-6 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <h3 className="text-xl text-bar-accent flex items-center gap-2">
              <FaSearch /> Filtros de Búsqueda
            </h3>
            
            <div className="space-y-3">
              <input 
                type="text" placeholder="Nombre o teléfono..." 
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-bar-text focus:outline-none focus:border-bar-accent" 
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Filtro Turno */}
                <div className="relative flex items-center">
                  <FaFilter className="absolute left-3 text-zinc-500 pointer-events-none" size={10}/>
                  <select value={turno} onChange={e => setTurno(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 pl-8 text-sm text-bar-text focus:outline-none focus:border-bar-accent appearance-none">
                    <option value="">Turno</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                  </select>
                </div>

                {/* Filtro Mes */}
                <div className="relative flex items-center">
                  <FaBirthdayCake className="absolute left-3 text-zinc-500 pointer-events-none" size={12}/>
                  <select value={mesCumple} onChange={e => setMesCumple(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 pl-9 text-sm text-bar-text focus:outline-none focus:border-bar-accent appearance-none">
                    <option value="">Mes</option>
                    {meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                  </select>
                </div>

                {/* Filtro Día */}
                <div className="relative flex items-center">
                  <select value={diaCumple} onChange={e => setDiaCumple(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 px-3 text-sm text-bar-text focus:outline-none focus:border-bar-accent appearance-none">
                    <option value="">Día</option>
                    {[...Array(31)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <BotonLimpiarFiltros 
              hayFiltros={!!(search || turno || mesCumple || diaCumple)} 
              onLimpiar={limpiarTodo} 
            />
          </div>
        </div>
      </div>

      {/* --- TABLA DESKTOP --- */}
      <div className="hidden md:block bg-bar-card rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-bar-muted text-xs uppercase tracking-widest">
            <tr>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Teléfono</th>
              <th className="p-4 font-medium text-center">Cumpleaños</th>
              <th className="p-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes?.map(cli => (
              <tr key={cli.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="p-4 font-medium text-bar-text">{cli.nombre}</td>
                <td className="p-4 text-bar-muted">{cli.telefono}</td>
                <td className="p-4 text-center">
                  {cli.cumpleanios ? (
                    <span className="text-bar-accent text-sm">
                      {/* Mostramos solo Día y Mes al usuario */}
                      {new Date(cli.cumpleanios + 'T00:00:00').toLocaleDateString('es-ES', {day: 'numeric', month: 'long'})}
                    </span>
                  ) : '-'}
                </td>
                <td className="p-4 flex justify-end gap-3">
                  <button onClick={() => openWhatsApp(cli.telefono)} className="text-green-500 hover:bg-green-500/10 p-2 rounded-full transition-all"><FaWhatsapp size={18} /></button>
                  <button onClick={() => { setClienteToEdit(cli); setIsEditModalOpen(true); }} className="text-zinc-400 hover:bg-zinc-100/10 p-2 rounded-full transition-all"><FaEdit size={18} /></button>
                  <button onClick={() => {if(window.confirm('¿Borrar?')) api.delete(`clientes/${cli.id}/`).then(()=>fetchClientes())}} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-all"><FaTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- CARDS MOBILE --- */}
      <div className="md:hidden space-y-4 px-2">
        {clientes?.map(cli => (
          <div key={cli.id} className="bg-bar-card border border-zinc-800 rounded-2xl p-5 shadow-lg">
             <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold text-bar-text">{cli.nombre}</h4>
             </div>
             <p className="text-bar-muted text-sm">{cli.telefono}</p>
             <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-800/50">
                <button onClick={() => openWhatsApp(cli.telefono)} className="flex justify-center bg-zinc-900 py-3 rounded-xl text-green-500"><FaWhatsapp size={20} /></button>
                <button onClick={() => { setClienteToEdit(cli); setIsEditModalOpen(true); }} className="flex justify-center bg-zinc-900 py-3 rounded-xl text-bar-accent"><FaEdit size={20} /></button>
                <button onClick={() => {if(window.confirm('¿Borrar?')) api.delete(`clientes/${cli.id}/`).then(()=>fetchClientes())}} className="flex justify-center bg-zinc-900 py-3 rounded-xl text-red-500"><FaTrash size={20} /></button>
             </div>
          </div>
        ))}
      </div>
      <Paginacion 
        paginaActual={pagina} 
        total={total}
        limite={20}
        onPageChange={(p) => setPagina(p)} 
      />
      <ClienteEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setClienteToEdit(null);
        }}
        onSuccess={fetchClientes}
        cliente={clienteToEdit}
      />
    </div>
  );
}
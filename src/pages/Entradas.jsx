import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaTicketAlt, FaCalendarAlt, FaGift } from 'react-icons/fa';
import EntradaModal from '../components/EntradaModal';
import { toast } from 'react-toastify';

export default function Entradas() {
  const getToday = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('-');
    return `${day}/${month}/${year}`;
  };

  const [fechaFiltro, setFechaFiltro] = useState(getToday());
  const [listaEntradas, setListaEntradas] = useState([]);
  const [representantesMap, setRepresentantesMap] = useState({});
  const [vouchersMap, setVouchersMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar Catálogos (Repres y Vouchers)
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [resR, resV] = await Promise.all([api.get('representantes/'), api.get('vouchers/')]);
        const mapR = {};
        (resR.data.results || resR.data).forEach(r => mapR[r.id] = r);
        setRepresentantesMap(mapR);

        const mapV = {};
        (resV.data.results || resV.data).forEach(v => mapV[v.id] = v);
        setVouchersMap(mapV);
      } catch (e) { console.error(e); }
    };
    cargarCatalogos();
  }, []);

  const fetchEntradas = async () => {
    try {
      const res = await api.get(`entradas/?fecha=${fechaFiltro}`);
      setListaEntradas(res.data.results || res.data || []);
    } catch (e) { setListaEntradas([]); }
  };

  useEffect(() => { fetchEntradas(); }, [fechaFiltro]);

  const handleConfirmar = async (payload) => {
    try {
      await api.post('entradas/', { ...payload, fecha: fechaFiltro });
      toast.success('Carga exitosa');
      fetchEntradas();
    } catch (e) { toast.error('Error al guardar'); }
  };

  // --- Agrupacion para tabla 1: Entradas ---
  const planillaEntradas = listaEntradas.reduce((acc, curr) => {
    const rId = curr.representante;
    if (!acc[rId]) {
      acc[rId] = { nombre: representantesMap[rId]?.nombre || '...', free: 0, cobrada_cc: 0, cobrada_sc: 0, total: 0 };
    }
    const cant = curr.cantidad_personas || 0;
    if (curr.tipo === 'free') acc[rId].free += cant;
    if (curr.tipo === 'cobrada_con_consumible') acc[rId].cobrada_cc += cant;
    if (curr.tipo === 'cobrada_sin_consumible') acc[rId].cobrada_sc += cant;
    acc[rId].total += cant;
    return acc;
  }, {});

  // --- Agrupoacio para tabla 2: Vouchers ---
  const planillaVouchers = listaEntradas.reduce((acc, curr) => {
    const rId = curr.representante;
    if (!curr.vouchers || curr.vouchers.length === 0) return acc;
    
    if (!acc[rId]) {
      acc[rId] = { nombre: representantesMap[rId]?.nombre || '...', vouchersEntregados: {}, totalRepreV: 0 };
    }

    curr.vouchers.forEach(vId => {
      const vNombre = vouchersMap[vId]?.nombre || 'Desconocido';
      // Cantidad de vouchers = cantidad de personas de esa entrada (CONSULTAR BIEN ESTO PORLAS)
      const cantVoucher = 1; 
      acc[rId].vouchersEntregados[vNombre] = (acc[rId].vouchersEntregados[vNombre] || 0) + cantVoucher;
      acc[rId].totalRepreV += cantVoucher;
    });
    return acc;
  }, {});

  // Obtener todos los tipos de vouchers que se usaron hoy para las columnas
  const tiposDeVouchersActivos = [...new Set(listaEntradas.flatMap(e => e.vouchers || []).map(id => vouchersMap[id]?.nombre).filter(Boolean))];

  // Totales Generales de Accesos
  const totalFree = Object.values(planillaEntradas).reduce((sum, f) => sum + f.free, 0);
  const totalCobradaCC = Object.values(planillaEntradas).reduce((sum, f) => sum + f.cobrada_cc, 0);
  const totalCobradaSC = Object.values(planillaEntradas).reduce((sum, f) => sum + f.cobrada_sc, 0);
  const granTotal = totalFree + totalCobradaCC + totalCobradaSC;

  return (
    <div className="pb-20 max-w-6xl mx-auto space-y-12 px-2 md:px-0 text-bar-text">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-light flex items-center gap-3 italic text-bar-text">
            <FaTicketAlt className="text-bar-accent" /> Control de Accesos
          </h2>
          <p className="text-bar-muted text-xs uppercase tracking-[0.3em] mt-1">{formatearFecha(fechaFiltro)}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-bar-accent hover:bg-yellow-600 text-black px-8 py-3 rounded-xl font-bold shadow-lg w-full sm:w-auto transition-all cursor-pointer uppercase text-xs">
          + Cargar Entradas
        </button>
      </div>

      {/* Filtro */}
      <div className="bg-bar-card p-4 rounded-2xl border border-zinc-800 flex items-center gap-4 shadow-xl">
        <FaCalendarAlt className="text-zinc-600 ml-2" />
        <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="bg-transparent text-bar-text outline-none cursor-pointer [color-scheme:dark] text-sm" />
      </div>

      {/* TABLA 1: Entradas */}
      <div className="bg-zinc-100 rounded-2xl overflow-hidden shadow-2xl border-b-4 border-zinc-300">
        <div className="bg-zinc-800 text-white flex min-w-[600px] text-[10px] uppercase font-black">
          <div className="flex-1 py-4 px-6 border-r border-zinc-700 tracking-widest">Representante</div>
          <div className="w-24 py-4 text-center border-r border-zinc-700">Free</div>
          <div className="w-24 py-4 text-center border-r border-zinc-700">C/ Cons.</div>
          <div className="w-24 py-4 text-center border-r border-zinc-700">S/ Cons.</div>
          <div className="w-24 py-4 text-center text-bar-accent">Total</div>
        </div>
        <div className="divide-y divide-zinc-200">
          {Object.values(planillaEntradas).map((f, i) => (
            <div key={i} className="flex bg-white text-zinc-800 text-sm font-medium italic min-w-[600px]">
              <div className="flex-1 py-4 px-6 border-r border-zinc-100">{f.nombre}</div>
              <div className="w-24 py-4 text-center border-r border-zinc-100 text-zinc-500">{f.free || '-'}</div>
              <div className="w-24 py-4 text-center border-r border-zinc-100 text-zinc-500">{f.cobrada_cc || '-'}</div>
              <div className="w-24 py-4 text-center border-r border-zinc-100 text-zinc-500">{f.cobrada_sc || '-'}</div>
              <div className="w-24 py-4 text-center font-black bg-zinc-50">{f.total}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABLA 2: Vouchers */}
      <section className="space-y-4 pt-4 border-t border-zinc-800">
        <h3 className="text-sm font-bold text-bar-accent uppercase tracking-widest px-2 md:px-0 flex items-center gap-2"><FaGift /> Planilla de Vouchers Entregados</h3>
        <div className="bg-zinc-100 rounded-2xl overflow-hidden shadow-2xl mx-2 md:mx-0 border-b-4 border-zinc-300 overflow-x-auto">
          <div className="bg-zinc-800 text-white flex min-w-[600px] text-[10px] uppercase font-black tracking-tighter">
            <div className="flex-1 py-4 px-6 border-r border-zinc-700 tracking-widest">Representante</div>
            {tiposDeVouchersActivos.map(vName => (
              <div key={vName} className="w-32 py-4 text-center border-r border-zinc-700">{vName}</div>
            ))}
            <div className="w-24 py-4 text-center text-bar-accent">Total V.</div>
          </div>
          <div className="divide-y divide-zinc-200 min-w-[600px]">
            {Object.values(planillaVouchers).length > 0 ? (
              Object.values(planillaVouchers).map((f, i) => (
                <div key={i} className="flex bg-white text-zinc-800 text-sm font-medium min-w-[600px]">
                  <div className="flex-1 py-4 px-6 border-r border-zinc-100 italic">{f.nombre}</div>
                  {tiposDeVouchersActivos.map(vName => (
                    <div key={vName} className="w-32 py-4 text-center border-r border-zinc-100 text-zinc-600 font-mono">
                      {f.vouchersEntregados[vName] || '-'}
                    </div>
                  ))}
                  <div className="w-24 py-4 text-center font-black bg-yellow-50 text-bar-accent">{f.totalRepreV}</div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-zinc-400 bg-white italic text-xs">No se registraron vouchers para esta fecha.</div>
            )}
            
            {/* TOTAL FINAL VOUCHERS */}
            {Object.values(planillaVouchers).length > 0 && (
               <div className="bg-zinc-900 text-bar-accent flex min-w-[600px] font-black uppercase text-[10px]">
                  <div className="flex-1 py-5 px-6 text-right tracking-[0.2em] border-r border-zinc-800">Total Vouchers del día</div>
                  {tiposDeVouchersActivos.map(vName => (
                    <div key={vName} className="w-32 py-5 text-center border-r border-zinc-800">
                      {Object.values(planillaVouchers).reduce((s,f) => s + (f.vouchersEntregados[vName] || 0), 0)}
                    </div>
                  ))}
                  <div className="w-24 py-5 text-center text-xl bg-bar-accent text-black">
                    {Object.values(planillaVouchers).reduce((s,f) => s + f.totalRepreV, 0)}
                  </div>
               </div>
            )}
          </div>
        </div>
      </section>

      <EntradaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmar} />
    </div>
  );
}
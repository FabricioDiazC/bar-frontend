import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos el hook de autenticación
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import logoImg from '../assets/logo.png';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation(); // Para saber en qué página estamos y resaltar el link

  // Función para dar estilo a los links activos
  const linkStyle = (path) => `
    text-[11px] uppercase tracking-[0.2em] transition-all duration-300
    ${location.pathname === path 
      ? 'text-bar-accent font-bold' 
      : 'text-zinc-500 hover:text-bar-text'}
  `;

  return (
    <nav className="bg-bar-card border-b border-zinc-800/50 p-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* LADO IZQUIERDO: LOGO */}
        <Link to={isAuthenticated ? "/reservas" : "/login"} className="flex items-center group">
          <img 
            src={logoImg} 
            alt="Logo Bar" 
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* LADO DERECHO: NAVEGACIÓN (Solo si está logueado) */}
        {isAuthenticated ? (
          <div className="flex items-center gap-4 md:gap-8">
            
            {/* Enlaces de escritorio (Se ocultan en móviles muy pequeños si quieres) */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/reservas" className={linkStyle('/reservas')}>Reservas</Link>
              <Link to="/clientes" className={linkStyle('/clientes')}>Clientes</Link>
              <Link to="/embajadoras" className={linkStyle('/embajadoras')}>Embajadoras</Link>
              <Link to="/entradas" className={linkStyle('/entradas')}>Entradas</Link>
            </div>

            {/* Separador visual */}
            <div className="h-6 w-[1px] bg-zinc-800 hidden lg:block"></div>

            {/* BOTÓN CERRAR SESIÓN */}
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-red-500/70 hover:text-red-500 hover:border-red-500/30 transition-all cursor-pointer group active:scale-95"
              title="Cerrar Sesión"
            >
              <span className="hidden md:inline text-[10px] uppercase tracking-widest font-bold">Salir</span>
              <FaSignOutAlt size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ) : (
          /* SI NO ESTÁ LOGUEADO: Mostrar solo un icono o texto de bienvenida */
          <div className="flex items-center gap-2 text-zinc-600">
            <FaUserCircle size={20} />
            <span className="text-[10px] uppercase tracking-widest">Portal Staff</span>
          </div>
        )}

      </div>

      {/* MENÚ MÓVIL (Opcional: Links debajo en pantallas pequeñas) */}
      {isAuthenticated && (
        <div className="lg:hidden flex justify-center gap-4 mt-4 pt-3 border-t border-zinc-800/50">
           <Link to="/reservas" className={linkStyle('/reservas')}>Res.</Link>
           <Link to="/clientes" className={linkStyle('/clientes')}>Cli.</Link>
           <Link to="/embajadoras" className={linkStyle('/embajadoras')}>Emb.</Link>
           <Link to="/entradas" className={linkStyle('/entradas')}>Ent.</Link>
        </div>
      )}
    </nav>
  );
}
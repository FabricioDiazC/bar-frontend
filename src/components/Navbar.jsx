import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png'; 

export default function Navbar() {
  return (
    <nav className="bg-bar-card border-b border-zinc-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
         <Link to="/reservas" className="flex items-center">
          <img 
            src={logoImg} 
            alt="Logo Bar 414" 
            className="h-14 md:h-18 w-auto object-contain transition-transform hover:scale-105"
          />
        </Link>
        <div className="space-x-6">
          <Link to="/clientes" className="hover:text-bar-accent transition">Clientes</Link>
          <Link to="/reservas" className="hover:text-bar-accent transition">Reservas</Link>
          <Link to="/embajadoras" className="text-bar-text hover:text-bar-accent font-light tracking-wide transition">
          Embajadoras
          </Link>
          <Link to="/entradas" className="text-bar-text hover:text-bar-accent font-light tracking-wide transition">
  Entradas
</Link>
        </div>
      </div>
    </nav>
  );
}
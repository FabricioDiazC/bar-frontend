import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-bar-card border-b border-zinc-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest text-bar-accent">BAR 414</h1>
        <div className="space-x-6">
          <Link to="/clientes" className="hover:text-bar-accent transition">Clientes</Link>
          <Link to="/reservas" className="hover:text-bar-accent transition">Reservas</Link>
        </div>
      </div>
    </nav>
  );
}
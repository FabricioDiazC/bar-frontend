import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock } from 'react-icons/fa';
import logoImg from '../assets/logo.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      toast.success("¡Acceso concedido!");
      navigate('/reservas');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-bar-card border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <img src={logoImg} alt="Logo" className="h-16 mb-4" />
          <h2 className="text-xl font-light text-bar-accent uppercase tracking-[0.3em]">Acceso Staff</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-4 top-4 text-zinc-600" />
            <input 
              type="text" placeholder="Usuario" required 
              value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-bar-text focus:border-bar-accent outline-none transition-all"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-zinc-600" />
            <input 
              type="password" placeholder="Contraseña" required 
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-bar-text focus:border-bar-accent outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-bar-accent hover:bg-yellow-600 text-black font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest cursor-pointer"
          >
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
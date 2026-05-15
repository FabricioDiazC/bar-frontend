import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Clientes from './pages/Clientes';
import Reservas from './pages/Reservas';
import Embajadoras from './pages/Embajadoras';
import Entradas from './pages/Entradas';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Navbar />
        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/reservas" />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/embajadoras" element={<Embajadoras />} />
          </Routes>
        </main>
         <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          theme="dark" 
        />
      </div>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Reservas from './pages/Reservas';
import Embajadoras from './pages/Embajadoras';
import EmbajadorasPosta from './pages/EmbajadorasPosta';
import Entradas from './pages/Entradas';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
        <Router>
          <div className="min-h-screen font-sans">
            <Navbar />
            <main className="container mx-auto p-6">
              <Routes>
                {/* Ruta Publica para que se logeen (no se como se escribe en ese tiempo verbal wacho) */}
                <Route path="/login" element={<Login />} />

                {/* Rutas Protegidas */}
                <Route element={<PrivateRoute />}>
                  {/* <Route path="/" element={<Navigate to="/reservas" />} />*/}
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/reservas" element={<Reservas />} />
                  <Route path="/entradas" element={<Entradas />} />
                  <Route path="/embajadoras" element={<Embajadoras />} />
                  <Route path="/embajadoras-posta" element={<EmbajadorasPosta />} />
                </Route>

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/reservas" />} />
              </Routes>
            </main>
            <ToastContainer 
              position="bottom-right" 
              autoClose={3000} 
              theme="dark" 
            />
          </div>
        </Router>
    </AuthProvider>
  );
}

export default App;
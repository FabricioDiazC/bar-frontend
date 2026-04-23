import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Clientes from './pages/Clientes';
import Reservas from './pages/Reservas';

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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
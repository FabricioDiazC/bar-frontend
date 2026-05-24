import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificacion de si hay un token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log("Intentando login para:", username);

      const res = await api.post('/token/', { username, password });

      console.log("Respuesta del servidor:", res.data);

      if (res.data.token) {
        const receivedToken = res.data.token;
        localStorage.setItem('token', res.data.token); // Se guarda primero en storage
        setToken(res.data.token); // Luego se actualiza el estado
        console.log("Token guardado en LocalStorage");
        return { success: true };
      }else {
        console.error("El servidor no envio un token en la respuesta");
        return { success: false, message: "Error en el formato de respuesta" };
      }
    } catch (error) {
      console.error("Error capturado en el login:", error.response?.data || error.message);
      return { 
        success: false, 
        message: "Usuario o contraseña incorrectos" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    // Usamos location.href para limpiar todo el estado de la app al salir
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token, loading }}>
      {/* Solo renderizamos la app cuando dejamos de cargar el estado inicial */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
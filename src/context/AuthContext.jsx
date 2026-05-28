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

      const res = await api.post('token/', { username, password });

      console.log("Respuesta del servidor:", res.data);

      if (res.data.access) {
        //const receivedToken = res.data.access;
        localStorage.setItem('token', res.data.access); // Se guarda en storage el token
        localStorage.setItem('refresh_token', res.data.refresh); //Se guarda un token de repuesto
        setToken(res.data.access); // Luego se actualiza el estado
        console.log("Token guardado en LocalStorage");
        return { success: true };
      }else {
        console.error("El servidor no envio un token en la respuesta");
        return { success: false, message: "Error en el formato de respuesta" };
      }
    } catch (error) {
      console.error("Error en el login:", error);
      return { 
        success: false, 
        message: "Usuario o contraseña incorrectos" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
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
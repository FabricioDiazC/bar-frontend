import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Para pegar el Token en cada petición

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/*
// Opcional: Si el servidor responde 401 (Token vencido), desloguear automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
*/
// Interceptor de Entrada (Ataja los errores 401 y hace el Refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (Expiró) y NO hemos intentado refrescarlo ya (para evitar bucle infinito)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error("No hay refresh token disponible");
        }

        // 1. Pedimos un nuevo Access Token enviando el Refresh Token
        // Usamos axios puro aquí para evitar caer en el interceptor nuevamente
        const response = await axios.post(`${import.meta.env.VITE_API_URL}token/refresh/`, {
          refresh: refreshToken
        });

        const newAccessToken = response.data.access;

        // 2. Guardamos la nueva llave en el LocalStorage
        localStorage.setItem('token', newAccessToken);

        // Opcional: Simple JWT a veces rota también el refresh token, si lo manda lo actualizamos
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }

        // 3. Modificamos la petición original que había fallado, poniéndole la llave nueva
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 4. Volvemos a disparar la petición original
        return api(originalRequest);

      } catch (refreshError) {
        console.error("El Refresh Token también expiró. Por favor inicia sesión nuevamente.");
        // Si el refresh también falla, borramos todo y mandamos al login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
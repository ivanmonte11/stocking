'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔍 Verifica si hay token en la cookie al montar el componente
  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    console.log('TOKEN:', token); // solo para debug
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  // ✅ Observa cambios en auth y redirige si es false
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsAuthenticated(false);
    // No es necesario router.push aquí: lo maneja el useEffect
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

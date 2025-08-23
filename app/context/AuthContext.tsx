'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  tenantId: number;
  accesoHasta?: string;
  status?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch('/api/session', { credentials: 'include' });
        if (!res.ok) throw new Error('Sesión no válida');

        const data = await res.json();
        if (!data.user || typeof data.user !== 'object') {
          throw new Error('Usuario no encontrado en sesión');
        }

        const userData = data.user as UserData;

        // Validación editorial
        if (userData.status !== 'active') throw new Error('Cuenta no activada');

        const acceso = new Date(userData.accesoHasta || '');
        if (isNaN(acceso.getTime()) || acceso < new Date()) {
          throw new Error('Licencia vencida o inválida');
        }

        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Fallback editorial solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
          try {
            const storedUser = localStorage.getItem('userData');
            if (storedUser) {
              const userData = JSON.parse(storedUser) as UserData;
              setUser(userData);
              setIsAuthenticated(true);
              return;
            }
          } catch (e) {
            console.warn('Fallback localStorage falló:', e);
          }
        }

        console.warn('Sesión inválida:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = (token: string, userData: UserData) => {
    setUser(userData);
    setIsAuthenticated(true);

    // Guardar en localStorage solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('userData');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

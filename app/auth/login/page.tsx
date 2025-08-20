'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estadoPendiente, setEstadoPendiente] = useState(false);
  const [emailPendiente, setEmailPendiente] = useState('');

  const handleLogin = async (data: { email: string; password: string }) => {
    console.log('[FRONT] Iniciando login con datos:', data);
    setIsSubmitting(true);
    setError('');
    setEstadoPendiente(false);
    setEmailPendiente('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();
      console.log('[FRONT] Respuesta del servidor:', result);

      if (!response.ok) {
        let mensaje = 'Error al iniciar sesión';

        if (result.error?.includes('no activada')) {
          mensaje = 'Tu cuenta fue registrada pero no está activa. Podés completar el pago ahora para acceder.';
          setEstadoPendiente(true);
          setEmailPendiente(result.email);
        } else if (result.error?.includes('Licencia vencida')) {
          mensaje = 'Tu licencia venció. Renovala para seguir usando el sistema.';
        } else if (result.error?.includes('Credenciales inválidas')) {
          mensaje = 'Email o contraseña incorrectos.';
        }

        setError(mensaje);
        return;
      }

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      login(result.token, result.user);
      router.push('/dashboard/user');
    } catch (err: any) {
      console.error('[FRONT] Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>

        {error && (
          <div className="text-red-600 text-center flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <p>{error}</p>
            </div>

            {estadoPendiente && (
              <button
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => router.push(`/pago?email=${emailPendiente}`)}
              >
                Reanudar pago
              </button>
            )}
          </div>
        )}

        <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />

        <p className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

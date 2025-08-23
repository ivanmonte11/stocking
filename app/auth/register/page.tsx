'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import ActivationOptions from '@/components/ActivationOptions';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [plan, setPlan] = useState<'initial' | 'annual' | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const selected = searchParams.get('plan');
    if (selected === 'initial' || selected === 'annual') {
      setPlan(selected);
      localStorage.setItem('planSeleccionado', selected);
    } else {
      setPlan(null);
    }
  }, [searchParams]);

  const handleRegister = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, plan }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar');
      }

      // Validación editorial
      if (!result.user || !result.token) {
        throw new Error('Respuesta incompleta del servidor');
      }

      // Poblar contexto y localStorage en desarrollo
      login(result.token, result.user);

      localStorage.setItem('planSeleccionado', plan || 'initial');
      router.push('/activacion');
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!plan) {
    return <ActivationOptions />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">
          Crear cuenta — {plan === 'initial' ? 'Acceso inicial' : 'Plan anual'}
        </h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <RegisterForm 
          onSubmit={handleRegister} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}

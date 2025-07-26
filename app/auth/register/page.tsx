'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar');
      }
  
      // Redirigir a login después de registro exitoso
      router.push('/auth/login?registered=true');
      
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <RegisterForm 
          onSubmit={handleRegister} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ActivacionPage() {
  const router = useRouter();
  const { user } = useAuth();


  const [plan, setPlan] = useState<'mensual' | 'anual' | null>(null);
  const [loading, setLoading] = useState(false);

  const email = user?.email || localStorage.getItem('emailPendiente');

  useEffect(() => {
    if (!email) {
      console.warn('No se detectó email. Redirigiendo al login.');
      router.push('/login');
    }
  }, [email, router]);

  const handleCheckout = async () => {
    if (!email || !plan) return;

    setLoading(true);

    try {
      const res = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      });

      const data = await res.json();

      if (!data?.init_point || typeof data.init_point !== 'string') {
        console.error('init_point inválido:', data);
        alert('Hubo un problema al generar el enlace de pago. Intentá nuevamente.');
        setLoading(false);
        return;
      }

      router.push(data.init_point);
    } catch (error) {
      console.error('Error en handleCheckout:', error);
      alert('Error inesperado. Intentá más tarde.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Activación de tu cuenta</h1>

      <p className="mb-6 text-center">
        Seleccioná un plan para completar la activación. Tu correo: <strong>{email}</strong>
      </p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setPlan('mensual')}
          className={`px-4 py-2 rounded border ${
            plan === 'mensual' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
          }`}
        >
          Plan Mensual
        </button>
        <button
          onClick={() => setPlan('anual')}
          className={`px-4 py-2 rounded border ${
            plan === 'anual' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
          }`}
        >
          Plan Anual
        </button>
      </div>

      <button
        onClick={handleCheckout}
        disabled={!plan || loading}
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Cargando...' : 'Proceder al pago'}
      </button>
    </div>
  );
}

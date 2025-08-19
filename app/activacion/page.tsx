'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ActivacionPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  const handleCheckout = async () => {
    if (!user?.email) return;

    const res = await fetch('/api/mercadopago/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: user.email })
    });

    const data = await res.json();

    if (!data?.init_point || typeof data.init_point !== 'string') {
      console.error('init_point inválido:', data);
      alert('Hubo un problema al generar el enlace de pago. Intentá nuevamente.');
      return;
    }

    router.push(data.init_point);
  };

  if (loading) return <p>Cargando...</p>;
  if (!isAuthenticated || !user) return <p>No estás autenticado.</p>;

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4 text-center">🎉 ¡Tu cuenta fue creada con éxito!</h1>
      <p className="text-lg mb-6 text-center">
        Para comenzar a usar el sistema, activá tu cuenta mediante la suscripción mensual. Este paso habilita el acceso completo a la plataforma y garantiza trazabilidad institucional.
      </p>

      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-8">
        <ul className="space-y-2 text-sm">
          <li><strong>Estado actual:</strong> Cuenta pendiente de activación</li>
          <li><strong>Acceso:</strong> Bloqueado hasta confirmar suscripción</li>
          <li><strong>Licencia de uso:</strong> $25.000 ARS / mes</li>
          <li><strong>Correo asociado:</strong> {user.email}</li>
        </ul>
      </div>

      <div className="text-center">
        <button
          onClick={handleCheckout}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition"
        >
          Activar suscripción
        </button>
      </div>
    </div>
  );
}

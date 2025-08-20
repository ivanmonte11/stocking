'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [estado, setEstado] = useState<'verificando' | 'aprobado' | 'rechazado'>('verificando');

  useEffect(() => {
    const verificar = async () => {
      if (!email) return setEstado('rechazado');

      const res = await fetch(`/api/mercadopago/verificar-pago?email=${email}`);
      const data = await res.json();

      if (data.licenciaActiva) {
        setEstado('aprobado');
      } else {
        setEstado('rechazado');
      }
    };

    verificar();
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-xl text-center space-y-6">
        {estado === 'verificando' && <p className="text-gray-500 animate-pulse">Verificando pago...</p>}

        {estado === 'aprobado' && (
          <>
            <div className="text-green-600 text-5xl flex justify-center"><FiCheckCircle /></div>
            <h1 className="text-2xl font-bold text-gray-800">¡Pago aprobado!</h1>
            <p className="text-gray-600 text-sm">Tu cuenta fue activada correctamente. Ya podés ingresar al sistema.</p>
          </>
        )}

        {estado === 'rechazado' && (
          <>
            <div className="text-red-500 text-5xl flex justify-center"><FiAlertTriangle /></div>
            <h1 className="text-2xl font-bold text-gray-800">Pago no verificado</h1>
            <p className="text-gray-600 text-sm">No pudimos confirmar tu pago. Si ya lo realizaste, puede tardar unos minutos.</p>
          </>
        )}
      </div>
    </div>
  );
}

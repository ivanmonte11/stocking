'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiLock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';


export default function PagoPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const emailParam = searchParams.get('email');


  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initPoint, setInitPoint] = useState('');
  const [error, setError] = useState('');

  //  Recuperar email desde el backend usando payment_id
  useEffect(() => {
  const recuperarEmail = async () => {
    if (paymentId) {
      // flujo actual
      try {
        const res = await fetch(`/api/mercadopago/email?payment_id=${paymentId}`);
        const data = await res.json();
        if (!res.ok || !data.email) {
          setError(data.error || 'No se pudo recuperar el email');
        } else {
          setEmail(data.email);
        }
      } catch (err) {
        console.error('[FRONT] Error al recuperar email:', err);
        setError('Error interno al recuperar el email');
      }
    } else if (emailParam) {
      // nuevo flujo editorial
      setEmail(emailParam);
    } else {
      setError('No se proporcionó el payment_id ni el email');
    }

    setLoading(false);
  };

  recuperarEmail();
}, [paymentId, emailParam]);


  //  Generar preferencia de pago una vez que se recupera el email
  useEffect(() => {
    const generarPreferencia = async () => {
      if (!email) return;

      try {
        const res = await fetch('/api/mercadopago/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (!res.ok || !data.init_point) {
          setError(data.error || 'No se pudo generar el enlace de pago');
        } else {
          setInitPoint(data.init_point);
        }
      } catch (err) {
        console.error('[FRONT] Error al generar preferencia:', err);
        setError('Error interno al generar el pago');
      } finally {
        setLoading(false);
      }
    };

    generarPreferencia();
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-xl border border-indigo-200 animate-fade-in space-y-6 text-center">
        <div className="flex justify-center text-indigo-500 text-5xl">
          <FiLock />
        </div>

        <h1 className="text-3xl font-bold text-gray-800">¡Estás a un paso de activar tu cuenta!</h1>

        <p className="text-gray-600 text-sm">
          Registramos tu acceso correctamente. Solo falta completar el pago para desbloquear todas las funcionalidades del sistema.
        </p>

        {loading && (
          <p className="text-indigo-500 font-medium animate-pulse">Generando enlace de pago...</p>
        )}

        {error && (
          <div className="text-red-600 flex items-center justify-center gap-2 text-sm">
            <FiAlertTriangle />
            <span>{error}</span>
          </div>
        )}

        {initPoint && (
          <a
            href={initPoint}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 text-white px-5 py-3 rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-md"
          >
            Activar ahora con MercadoPago
          </a>
        )}

        <div className="text-xs text-gray-400 mt-2">
          <FiCheckCircle className="inline mr-1" />
          El acceso se activa automáticamente al aprobar el pago.
        </div>
      </div>
    </div>
  );
}

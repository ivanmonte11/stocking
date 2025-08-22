'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiLock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function PagoPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState<string | null>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const recuperarEmail = async () => {
      if (paymentId) {
        try {
          const res = await fetch(`/api/mercadopago/email?payment_id=${paymentId}`);
          const data = await res.json();
          if (!res.ok || !data.email) {
            setError(data.error || 'No se pudo recuperar el email');
          } else {
            setEmail(data.email);
          }
        } catch {
          setError('Error interno al recuperar el email');
        }
      } else if (emailParam) {
        setEmail(emailParam);
      } else {
        setError('No se proporcionó el payment_id ni el email');
      }
    };

    recuperarEmail();
  }, [paymentId, emailParam]);

  const generarPreferencia = async () => {
    if (!email || !planSeleccionado) {
      setError('Falta el email o el plan seleccionado');
      return;
    }

    const planBackend = planSeleccionado === 'premium' ? 'annual' : 'initial';

    setLoading(true);
    try {
      const res = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: planBackend })
      });

      const data = await res.json();
      if (!res.ok || !data.init_point) {
        setError(data.error || 'No se pudo generar el enlace de pago');
      } else {
        window.location.href = data.init_point;
      }
    } catch {
      setError('Error interno al generar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-xl border border-indigo-200 animate-fade-in space-y-6 text-center">
        <div className="flex justify-center text-indigo-500 text-5xl">
          <FiLock />
        </div>

        <h1 className="text-3xl font-bold text-gray-800"> ¡Estás a un paso de activar tu cuenta!</h1>

        <p className="text-gray-600 text-sm">
          Registramos tu acceso correctamente. Solo falta elegir tu plan y completar el pago para desbloquear todas las funcionalidades del sistema.
        </p>

        <div className="grid gap-4">
          <div
            onClick={() => setPlanSeleccionado('standard')}
            className={`cursor-pointer border rounded-lg p-4 text-left transition ${
              planSeleccionado === 'standard' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
            }`}
          >
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">🔹 Acceso inicial — $15.000 ARS</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Activación inmediata del sistema</li>
              <li>Tenant propio y acceso institucional</li>
              <li>Soporte editorial durante el primer mes</li>
              <li>Constancia institucional de activación</li>
            </ul>
          </div>

          <div
            onClick={() => setPlanSeleccionado('premium')}
            className={`cursor-pointer border rounded-lg p-4 text-left transition ${
              planSeleccionado === 'premium' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
            }`}
          >
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">🔵 Plan anual — $144.000 ARS</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Acceso completo por 12 meses</li>
              <li>20% de descuento sobre la tarifa mensual</li>
              <li>Prioridad editorial en soporte y actualizaciones</li>
              <li>Constancia institucional de activación anual</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="text-red-600 flex items-center justify-center gap-2 text-sm">
            <FiAlertTriangle />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={generarPreferencia}
          disabled={loading || !planSeleccionado}
          className="inline-block bg-indigo-600 text-white px-5 py-3 rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-md disabled:opacity-50"
        >
          {loading ? 'Generando enlace de pago...' : 'Activar ahora con MercadoPago'}
        </button>

        <div className="text-xs text-gray-400 mt-2">
          <FiCheckCircle className="inline mr-1" />
          El acceso se activa automáticamente al aprobar el pago.
        </div>
      </div>
    </div>
  );
}

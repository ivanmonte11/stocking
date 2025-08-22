'use client';
import { useState, useEffect } from 'react';

export default function AvisoRenovacion({ accesoHasta }: { accesoHasta: string }) {
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hoy = new Date();
    const hasta = new Date(accesoHasta);
    const diff = Math.ceil((hasta.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    setDiasRestantes(diff);

    if (diff < 0) {
      setMensaje('Tu licencia venció. Necesitás renovarla para seguir usando el sistema.');
    } else if (diff <= 5) {
      setMensaje(`Tu licencia vence en ${diff} día${diff === 1 ? '' : 's'}. Podés renovarla ahora.`);
    }
  }, [accesoHasta]);

  const renovar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/renovar', { method: 'POST' });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point; // redirige a MercadoPago
      }
    } catch (err) {
      console.error('Error al renovar:', err);
    } finally {
      setLoading(false);
    }
  };

  if (diasRestantes === null || diasRestantes > 5) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded mb-4">
      <p className="text-yellow-800 font-medium">{mensaje}</p>
      <button
        onClick={renovar}
        disabled={loading}
        className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        {loading ? 'Redirigiendo...' : 'Renovar ahora'}
      </button>
    </div>
  );
}

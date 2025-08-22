'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const ActivationOptions: React.FC = () => {
  const router = useRouter();

  const handleSelect = (plan: 'initial' | 'annual') => {
    router.push(`/auth/register?plan=${plan}`);
  };

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-xl p-8 shadow-sm">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">🧾 Activá tu acceso a Stocking</h2>
      <p className="text-center text-gray-600 mb-10">
        Elegí cómo querés comenzar. Ambos planes incluyen activación automática y constancia institucional.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">🔹 Acceso inicial — $15.000 ARS</h3>
          <ul className="text-sm text-gray-700 mb-6 space-y-2 list-disc list-inside">
            <li>Activación inmediata del sistema</li>
            <li>Tenant propio y acceso institucional</li>
            <li>Soporte editorial durante el primer mes</li>
          </ul>
          <Button size="lg" onClick={() => handleSelect('initial')}>Activar acceso inicial</Button>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition">
          <h3 className="text-xl font-semibold text-teal-900 mb-4">🔵 Plan anual — $144.000 ARS</h3>
          <ul className="text-sm text-gray-700 mb-6 space-y-2 list-disc list-inside">
            <li>Acceso completo por 12 meses</li>
            <li>20% de descuento sobre la tarifa mensual</li>
            <li>Prioridad editorial en soporte y actualizaciones</li>
            <li>Constancia institucional de activación anual</li>
          </ul>
          <Button size="lg" onClick={() => handleSelect('annual')}>Activar plan anual</Button>
        </div>
      </div>
    </div>
  );
};

export default ActivationOptions;

'use client';

import { useState } from 'react';

type PlanKey = 'initial' | 'annual';

type Props = {
  onSelect?: (plan: PlanKey) => void;
};

export default function PlanSelector({ onSelect }: Props) {
  const [plan, setPlan] = useState<PlanKey | ''>('');

  const handleSelect = (value: PlanKey) => {
    setPlan(value);
    localStorage.setItem('planSeleccionado', value);
    if (onSelect) onSelect(value);
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow text-center space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Seleccioná tu plan</h2>

      <div className="flex flex-col gap-3">
        <button
          className={`px-4 py-3 rounded border text-left ${
            plan === 'initial' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'
          }`}
          onClick={() => handleSelect('initial')}
        >
          <div className="font-semibold">Plan Básico</div>
          <div className="text-sm text-gray-500">Licencia mensual · $15.000</div>
        </button>

        <button
          className={`px-4 py-3 rounded border text-left ${
            plan === 'annual' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'
          }`}
          onClick={() => handleSelect('annual')}
        >
          <div className="font-semibold">Plan Premium</div>
          <div className="text-sm text-gray-500">Licencia anual · $144.000</div>
        </button>
      </div>

      {plan && (
        <p className="text-sm text-gray-600 mt-2">
          Seleccionaste: <strong>{plan === 'initial' ? 'Plan Básico' : 'Plan Premium'}</strong>
        </p>
      )}
    </div>
  );
}

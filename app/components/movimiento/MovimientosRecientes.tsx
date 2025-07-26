'use client';

import { DataTable } from '../ui/DataTable';
import { Button } from '../ui/Button';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

interface Movimiento {
  id: number;
  fecha: string;
  producto: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
}

export function MovimientosRecientes() {
  const { data: movimientos, isLoading, error } = useQuery({
    queryKey: ['movimientos-recientes'],
    queryFn: async () => {
      const { data } = await apiClient.get('/movimientos?limit=5');
      return data;
    },
  });

  if (isLoading) return <div>Cargando movimientos...</div>;
  if (error) return <div>Error al cargar movimientos</div>;

  return (
    <section className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Movimientos recientes</h2>
        <Button variant="outline" size="sm">
          Ver todos
        </Button>
      </div>
      
      <DataTable headers={['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Motivo']}>
        {movimientos.map((mov: Movimiento) => (
          <tr key={mov.id}>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
              {new Date(mov.fecha).toLocaleDateString()}
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
              {mov.producto}
            </td>
            <td className="px-4 py-2 whitespace-nowrap">
              <span className={`px-2 py-1 text-xs rounded-full ${
                mov.tipo === 'entrada' 
                  ? 'bg-green-100 text-green-800' 
                  : mov.tipo === 'salida' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {mov.tipo}
              </span>
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
              {mov.cantidad}
            </td>
            <td className="px-4 py-2 text-sm text-gray-500">
              {mov.motivo || '-'}
            </td>
          </tr>
        ))}
      </DataTable>
    </section>
  );
}
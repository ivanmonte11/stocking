'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Movimiento {
  id: number;
  fecha: Date;
  producto: string;  // Ahora es string directamente
  tipo: string;
  cantidad: number;
  motivo: string | null;
  usuario: string;
}

export default function HistorialMovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const res = await axios.get('/api/movimientos');
        setMovimientos(res.data);
      } catch (error) {
        console.error('Error al cargar movimientos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovimientos();
  }, []);

  if (loading) {
    return <div className="p-6">Cargando movimientos...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Historial de Movimientos</h1>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2 border">Producto</th>
            <th className="px-4 py-2 border">Cantidad</th>
            <th className="px-4 py-2 border">Tipo</th>
            <th className="px-4 py-2 border">Fecha</th>
            <th className="px-4 py-2 border">Motivo</th>
            <th className="px-4 py-2 border">Usuario</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((mov) => (
            <tr key={mov.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 border">{mov.producto}</td>
              <td className="px-4 py-2 border">{mov.cantidad}</td>
              <td className="px-4 py-2 border">{mov.tipo}</td>
              <td className="px-4 py-2 border">
                {new Date(mov.fecha).toLocaleString()}
              </td>
              <td className="px-4 py-2 border">{mov.motivo || '-'}</td>
              <td className="px-4 py-2 border">{mov.usuario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
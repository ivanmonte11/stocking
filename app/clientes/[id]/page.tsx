'use client';

export const dynamic = 'force-dynamic'; 

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface Venta {
  id: number;
  cantidad: number;
  fecha: string;
  variante: {
    producto: {
      nombre: string;
      precio: number;
    };
  };
}

interface Cliente {
  nombre: string;
  ventas: Venta[];
}

export default function ClienteHistorialPage() {
  const params = useParams();
  const clienteId = params.id;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  const formatoMoneda = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });

  useEffect(() => {
    if (!clienteId) return;

    const fetchCliente = async () => {
      try {
        const res = await axios.get(`/api/clientes/${clienteId}`);
        setCliente(res.data);
      } catch (error) {
        console.error('Error al obtener cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [clienteId]);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!cliente) return <div className="p-6 text-red-600">Cliente no encontrado.</div>;

  const total = cliente.ventas.reduce((sum, venta) => {
    return sum + venta.variante.producto.precio * venta.cantidad;
  }, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Historial de ventas de {cliente.nombre}
      </h1>

      {cliente.ventas.length === 0 ? (
        <p className="text-gray-500">Este cliente aún no tiene ventas registradas.</p>
      ) : (
        <>
          <table className="w-full border border-gray-300 rounded table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Producto</th>
                <th className="px-4 py-2 border">Precio Unitario</th>
                <th className="px-4 py-2 border">Cantidad</th>
                <th className="px-4 py-2 border">Total Línea</th>
                <th className="px-4 py-2 border">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {cliente.ventas.map((venta) => (
                <tr key={venta.id}>
                  <td className="px-4 py-2 border">{venta.variante.producto.nombre}</td>
                  <td className="px-4 py-2 border">
                    {formatoMoneda.format(venta.variante.producto.precio)}
                  </td>
                  <td className="px-4 py-2 border">{venta.cantidad}</td>
                  <td className="px-4 py-2 border">
                    {formatoMoneda.format(venta.variante.producto.precio * venta.cantidad)}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(venta.fecha).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-right font-bold mt-4">
            Total gastado: {formatoMoneda.format(total)}
          </p>
        </>
      )}
    </div>
  );
}

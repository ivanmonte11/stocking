'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  ventas: {
    id: number;
    cantidad: number;
    fecha: string;
    productoId: number;
  }[];
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    axios.get('/api/clientes').then((res) => {
      setClientes(res.data);
    });
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Clientes Registrados</h1>

      {clientes.length === 0 ? (
        <p className="text-gray-600 text-center">No hay clientes registrados aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-300 rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Teléfono</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Ventas</th>
                <th className="px-4 py-2 border text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{cliente.nombre}</td>
                  <td className="px-4 py-2 border">{cliente.telefono || '—'}</td>
                  <td className="px-4 py-2 border">{cliente.email || '—'}</td>
                  <td className="px-4 py-2 border">{cliente.ventas.length}</td>
                  <td className="px-4 py-2 border text-center">
                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver historial
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

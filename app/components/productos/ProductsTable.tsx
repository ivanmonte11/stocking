'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { Pagination } from '@/components/ui/pagination';

interface ProductsTableProps {
  productos: Array<{
    id: number;
    codigoBarra: string;
    nombre: string;
    precio: number;
    stock: number;
    categoria: string | null;
  }>;
  currentPage: number;
  totalPages: number;
  modoArchivado?: boolean;
}

export const ProductsTable = ({ productos, currentPage, totalPages, modoArchivado }: ProductsTableProps) => {
  const router = useRouter();

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto) => (
              <tr key={producto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.codigoBarra}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link href={`/products/${producto.id}`} className="text-blue-600 hover:text-blue-900">
                    {producto.nombre}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.categoria || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${producto.precio.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/products/${producto.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => router.push(`/products/${producto.id}/edit`)}
                      className="text-green-600 hover:text-green-900"
                      title="Editar"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('¿Estás seguro de eliminar este producto?')) {
                          try {
                            const response = await fetch(`/api/productos/${producto.id}`, {
                              method: 'DELETE',
                            });

                            if (response.ok) {
                              router.refresh();
                            }
                          } catch (error) {
                            console.error('Error:', error);
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>

                    {modoArchivado && (
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/productos/${producto.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ estado: 'activo' }),
                            });

                            if (response.ok) {
                              router.refresh();
                            } else {
                              console.error('Error al activar producto');
                            }
                          } catch (error) {
                            console.error('Error al activar producto:', error);
                          }
                        }}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Activar"
                      >
                        Activar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

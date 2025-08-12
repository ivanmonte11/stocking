'use client';

import { FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';

interface Variante {
  color: string | null;
  talla: string | null;
  stock: number;
}

interface ProductDetailProps {
  producto: {
    id: number;
    codigoBarra: string | null;
    nombre: string;
    descripcion: string | null;
    precio: number;
    costo: number;
    categoria: string | null;
    variantes?: Variante[];
  };
}

export const ProductDetail = ({ producto }: ProductDetailProps) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const response = await fetch(`/api/productos/${producto.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      toast.success('Producto eliminado exitosamente');
      router.push('/products');
    } catch (error) {
      toast.error('Error al eliminar el producto');
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <FiArrowLeft className="mr-2" /> Volver
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/products/${producto.id}/edit`)}
          >
            <FiEdit className="mr-2" /> Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <FiTrash2 className="mr-2" /> Eliminar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold">{producto.nombre}</h2>
          <p className="text-gray-500">{producto.codigoBarra ?? 'No disponible'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Información Básica</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <span className="font-medium">Categoría:</span> {producto.categoria || 'N/A'}
              </li>
            </ul>

            {producto.variantes && producto.variantes.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Variantes</h3>
                <table className="w-full mt-2 text-sm border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Color</th>
                      <th className="p-2 border">Talla</th>
                      <th className="p-2 border">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {producto.variantes.map((v, i) => (
                      <tr key={i}>
                        <td className="p-2 border">{v.color}</td>
                        <td className="p-2 border">{v.talla}</td>
                        <td className="p-2 border">{v.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Información Financiera</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <span className="font-medium">Precio:</span> ${producto.precio.toFixed(2)}
              </li>
              <li>
                <span className="font-medium">Costo:</span> ${producto.costo.toFixed(2)}
              </li>
              <li>
                <span className="font-medium">Margen:</span>{' '}
                {((producto.precio - producto.costo) / producto.costo * 100).toFixed(2)}%
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-medium text-gray-700">Stock</h3>
            <div className="mt-2">
              <p className="text-2xl font-bold">
                {producto.variantes?.reduce((total, v) => total + v.stock, 0) || 0} unidades
              </p>
            </div>
          </div>

          {producto.descripcion && (
            <div className="md:col-span-2">
              <h3 className="font-medium text-gray-700">Descripción</h3>
              <p className="mt-2 text-gray-600">{producto.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

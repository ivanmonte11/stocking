'use client'

import { DataTable } from '@/components/ui/DataTable';
import { useProductos } from '@/lib/hooks/useProductos';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ProductosPage() {
  const { data: productos, isLoading, error } = useProductos();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar productos</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/productos/nuevo">
          <Button>Nuevo Producto</Button>
        </Link>
      </div>
      
      <DataTable 
        headers={['Código', 'Nombre', 'Categoría', 'Talla', 'Color', 'Stock', 'Precio', 'Acciones']}
      >
        {productos.map((producto: any) => (
          <tr key={producto.id}>
            <td className="px-6 py-4 whitespace-nowrap">{producto.codigoBarras}</td>
            <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
            <td className="px-6 py-4 whitespace-nowrap">{producto.categoria}</td>
            <td className="px-6 py-4 whitespace-nowrap">{producto.talla}</td>
            <td className="px-6 py-4 whitespace-nowrap">{producto.color}</td>
            <td className="px-6 py-4 whitespace-nowrap">{producto.stock}</td>
            <td className="px-6 py-4 whitespace-nowrap">${producto.precio.toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Link href={`/productos/${producto.id}`}>
                <Button variant="outline">Editar</Button>
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { ProductoForm } from '@/components/productos/ProductoForm';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockTotal, setStockTotal] = useState<number>(0);

  // En tu EditProductPage
useEffect(() => {
  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/productos/${params.id}`);
      if (!response.ok) throw new Error('Producto no encontrado');

      const data = await response.json();

      // Calcular stock total desde variantes
      const total = data.variantes?.reduce(
        (acc: number, v: any) => acc + (v.stock ?? 0),
        0
      ) ?? 0;
      setStockTotal(total);

      // Formatear correctamente los datos para el formulario
      setInitialData({
        ...data,
        precio: data.precio.toString(),
        costo: data.costo.toString(),
        // Las variantes vienen sin ID del backend
        variantes: data.variantes?.map((v: any) => ({
          color: v.color || '',
          talla: v.talla || '',
          stock: v.stock.toString() // Convertir a string para el formulario
        })) || []
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el producto');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [params.id, router]);

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch(`/api/productos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Error al actualizar el producto');

      toast.success('Producto actualizado exitosamente');
      router.push(`/products/${params.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse bg-gray-200 h-8 w-1/3 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-12 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar Producto</h1>

        {stockTotal > 0 && (
          <div className="mb-4 text-sm text-gray-700 italic">
            🔢 Stock total actual: <strong>{stockTotal}</strong> unidades
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          {initialData && (
            <ProductoForm
              initialData={initialData}
              onSubmit={handleSubmit}
              isSubmitting={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

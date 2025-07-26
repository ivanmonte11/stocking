'use client';

import { useRouter } from 'next/navigation';
import { ProductoForm } from '@/components/productos/ProductoForm.';
import { toast } from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }

      const data = await response.json();
      toast.success('Producto creado exitosamente');
      router.push(`/products/${data.producto.id}`);
    } catch (error) {
      toast.error('Error al crear el producto');
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Añadir Nuevo Producto</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <ProductoForm 
            onSubmit={handleSubmit} 
            isSubmitting={false}
          />
        </div>
      </div>
    </div>
  );
}
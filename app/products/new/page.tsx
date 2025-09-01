'use client';

import { useRouter } from 'next/navigation';
import { ProductoForm } from '@/components/productos/ProductoForm';
import { toast } from 'react-hot-toast';
import useApi from '@/lib/hooks/useApi';
import { useState } from 'react';

export default function NewProductPage() {
  const router = useRouter();
  const { fetchAuthed } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);

    const payload = {
      ...values,
      estado: values.estado?.trim() || 'activo', // ← blindaje editorial
    };

    console.log('📦 Payload enviado a /api/productos:', payload);

    try {
      const data = await fetchAuthed('/api/productos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('Producto creado exitosamente');
      router.push(`/products/${data.producto.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el producto');
      console.error('🛑 Error en creación de producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Añadir Nuevo Producto</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <ProductoForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

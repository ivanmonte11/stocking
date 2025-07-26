'use client';

import { ProductoForm } from '@/components/productos/ProductoForm.';
import { useProducto, useUpdateProducto } from '@/lib/hooks/useProductos';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';

export default function EditarProductoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: producto, isLoading, error } = useProducto(Number(params.id));
  const { mutate: updateProducto, isPending } = useUpdateProducto();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar el producto.</div>;
if (!producto) return <div>No se encontró el producto.</div>;


  const handleSubmit = (values: any) => {
    updateProducto(
      { id: Number(params.id), ...values },
      {
        onSuccess: () => {
          router.push('/productos');
        },
      }
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Producto</h1>
      <ProductoForm 
        initialData={producto} 
        onSubmit={handleSubmit} 
        isSubmitting={isPending} 
      />
    </div>
  );
}
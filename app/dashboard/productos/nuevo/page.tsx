'use client';

import { ProductoForm } from '@/components/productos/ProductoForm.';
import { useCreateProducto } from '@/lib/hooks/useProductos';
import { useRouter } from 'next/navigation';

export default function NuevoProductoPage() {
  const router = useRouter();
  const { mutate: createProducto, isPending } = useCreateProducto();

  const handleSubmit = (values: any) => {
    createProducto(values, {
      onSuccess: () => {
        router.push('/productos');
      },
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Nuevo Producto</h1>
      <ProductoForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
}
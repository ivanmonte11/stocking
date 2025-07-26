// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ProductDetail } from '@/components/productos/ProductDetail';

const prisma = new PrismaClient();

interface Props {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: Props) {
  const productId = parseInt(params.id);
  if (isNaN(productId)) {
    return notFound();
  }

  // Buscar producto incluyendo variantes
  const producto = await prisma.producto.findUnique({
    where: { id: productId },
    include: {
      variantes: true, // Esto es clave para traer color, talla, stock
    },
  });

  if (!producto) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <ProductDetail producto={producto} />
      </div>
    </div>
  );
}

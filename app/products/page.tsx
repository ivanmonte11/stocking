import { PrismaClient } from '@prisma/client';
import { ProductsTable } from '@/components/productos/ProductsTable';
import { getTokenData } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function getUserToken() {
  const token = cookies().get('token')?.value;
  if (!token) throw new Error('No autorizado');
  return await getTokenData(token);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getUserToken();
  
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 10;

  // ✅ Filtrar por tenantId
  const productos = await prisma.producto.findMany({
    where: { tenantId: user.tenantId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { fechaCreacion: 'desc' },
    include: { variantes: true },
  });

  const total = await prisma.producto.count({
    where: { tenantId: user.tenantId },
  });

  const productosConStock = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    codigoBarra: p.codigoBarra ?? '',
    precio: p.precio,
    stock: p.variantes.reduce((acc, v) => acc + v.stock, 0),
    categoria: p.categoria,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <a 
          href="/products/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Añadir Producto
        </a>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ProductsTable 
          productos={productosConStock} 
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
        />
      </div>
    </div>
  );
}

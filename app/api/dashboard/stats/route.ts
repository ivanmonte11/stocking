import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getTokenData } from '@/lib/auth';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const user = await getTokenData(token);
    if (!user?.tenantId) return NextResponse.json({ error: 'Tenant no definido' }, { status: 400 });

    const { tenantId } = user;

    // 📦 Productos
    const totalProducts = await prisma.producto.count({
      where: { tenantId }
    });

    const lowStockItems = await prisma.producto.count({
      where: {
        tenantId,
        variantes: {
          some: {
            stock: { lt: 5 }
          }
        }
      }
    });

    // 🔄 Movimientos de stock de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayTransactions = await prisma.transaccion.count({
      where: {
        tenantId,
        fecha: {
          gte: today,
          lte: endOfToday,
        },
      },
    });

    // 📅 Fechas clave
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 🧾 Ventas del mes actual
    const ventasDelMes = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        variante: {
          producto: {
            tenantId,
          },
        },
      },
      include: {
        variante: {
          include: {
            producto: true,
          },
        },
      },
    });

    const monthlySales = ventasDelMes.length;

    const monthlyRevenue = ventasDelMes.reduce((total, venta) => {
      const precio = venta.variante?.producto?.precio || 0;
      return total + venta.cantidad * precio;
    }, 0);

    const monthlyProfit = ventasDelMes.reduce((total, venta) => {
      const precio = venta.variante?.producto?.precio || 0;
      const costo = venta.variante?.producto?.costo || 0;
      return total + venta.cantidad * (precio - costo);
    }, 0);

    // 🧾 Ventas del mes anterior
    const ventasMesAnterior = await prisma.venta.count({
      where: {
        fecha: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        variante: {
          producto: {
            tenantId,
          },
        },
      },
    });

    const ventasMesAnteriorDetalladas = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        variante: {
          producto: {
            tenantId,
          },
        },
      },
      include: {
        variante: {
          include: {
            producto: true,
          },
        },
      },
    });

    const revenueLastMonth = ventasMesAnteriorDetalladas.reduce((total, venta) => {
      const precio = venta.variante?.producto?.precio || 0;
      return total + venta.cantidad * precio;
    }, 0);

    const profitLastMonth = ventasMesAnteriorDetalladas.reduce((total, venta) => {
      const precio = venta.variante?.producto?.precio || 0;
      const costo = venta.variante?.producto?.costo || 0;
      return total + venta.cantidad * (precio - costo);
    }, 0);

    const revenueGrowth =
      revenueLastMonth > 0
        ? ((monthlyRevenue - revenueLastMonth) / revenueLastMonth) * 100
        : monthlyRevenue > 0
        ? 100
        : 0;

    const profitGrowth =
      profitLastMonth > 0
        ? ((monthlyProfit - profitLastMonth) / profitLastMonth) * 100
        : monthlyProfit > 0
        ? 100
        : 0;

    // 🧍‍♂️ Clientes
    const totalCustomers = await prisma.cliente.count({
      where: { tenantId }
    });

    const customersThisMonth = await prisma.cliente.count({
      where: {
        tenantId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const customersLastMonth = await prisma.cliente.count({
      where: {
        tenantId,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    const salesGrowth =
      ventasMesAnterior > 0
        ? ((monthlySales - ventasMesAnterior) / ventasMesAnterior) * 100
        : monthlySales > 0
        ? 100
        : 0;

    const customersGrowth =
      customersLastMonth > 0
        ? ((customersThisMonth - customersLastMonth) / customersLastMonth) * 100
        : customersThisMonth > 0
        ? 100
        : 0;

    return NextResponse.json({
      totalProducts,
      lowStockItems,
      todayMovements: todayTransactions,
      totalCustomers,
      monthlySales,
      monthlyRevenue,
      monthlyProfit,
      salesGrowth,
      customersGrowth,
      revenueGrowth,
      profitGrowth,
    });
  } catch (error) {
    console.error('[DASHBOARD_STATS_ERROR]', error);
    return NextResponse.json(
      { error: 'Error cargando estadísticas del dashboard' },
      { status: 500 }
    );
  }
}

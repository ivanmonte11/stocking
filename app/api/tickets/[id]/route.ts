import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

const prisma = new PrismaClient();

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const transaccionId = parseInt(id);

  if (isNaN(transaccionId)) {
    return new Response('ID inválido', { status: 400 });
  }

  const transaccion = await prisma.transaccion.findUnique({
    where: { id: transaccionId },
    include: {
      cliente: true,
      ventas: {
        include: { variante: true },
      },
    },
  });

  if (!transaccion) {
    return new Response('Transacción no encontrada', { status: 404 });
  }

  const stream = new PassThrough();
  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(stream);

  // ✨ No fonts, no images, no fancy styling
  doc.fontSize(16).text('Ticket de Venta', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Fecha: ${new Date(transaccion.fecha).toLocaleString()}`);
  doc.text(`Transacción ID: ${transaccion.id}`);
  doc.text(`Cliente: ${transaccion.cliente?.nombre ?? 'No registrado'}`);
  doc.moveDown().text('Detalle:');

  let total = 0;

 transaccion.ventas.forEach(
  (venta: typeof transaccion.ventas[number], i: number) => {
    const color = venta.variante?.color ?? '-';
    const talle = venta.variante?.talla ?? '-';
    doc.text(`${i + 1}. Variante ${venta.varianteId} - ${color} / ${talle} x${venta.cantidad}`);
    total += venta.cantidad;
  }
);


  doc.moveDown().text(`Total unidades: ${total}`, { align: 'right' });
  doc.end();

  const readableStream = new ReadableStream({
    start(controller) {
      stream.on('data', chunk => controller.enqueue(chunk));
      stream.on('end', () => controller.close());
      stream.on('error', err => controller.error(err));
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=ticket-${transaccion.id}.pdf`,
    },
  });
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TicketPDF from '@/components/TicketPDF';

interface Producto {
  id: number;
  nombre: string;
}

interface Variante {
  id: number;
  color: string | null;
  talla: string | null;
  stock: number;
}

interface LineaVenta {
  productoId: string;
  varianteId: string;
  cantidad: number;
  precio: number;
}

export default function NuevaVentaPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [variantesPorProducto, setVariantesPorProducto] = useState<{ [id: string]: Variante[] }>({});
  const [lineasVenta, setLineasVenta] = useState<LineaVenta[]>([
  { productoId: '', varianteId: '', cantidad: 1, precio: 0 },
]);


  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    email: '',
  });

  const [ultimaTransaccion, setUltimaTransaccion] = useState<any>(null);

  useEffect(() => {
    axios.get('/api/productos').then((res) => {
      setProductos(Array.isArray(res.data) ? res.data : res.data.data);
    });
  }, []);

  const cargarVariantes = async (productoId: string) => {
    if (!productoId || variantesPorProducto[productoId]) return;
    try {
      const res = await axios.get(`/api/productos/${productoId}/variantes`);
      setVariantesPorProducto(prev => ({
        ...prev,
        [productoId]: res.data,
      }));
    } catch (err) {
      console.error('Error al cargar variantes', err);
    }
  };

  const agregarLinea = () => {
    setLineasVenta([...lineasVenta, { productoId: '', varianteId: '', cantidad: 1, precio: 0 }]);
  };

  const eliminarLinea = (index: number) => {
    const actualizadas = lineasVenta.filter((_, i) => i !== index);
    setLineasVenta(actualizadas);
  };

  const actualizarLinea = async (
  index: number,
  campo: keyof LineaVenta,
  valor: string | number
) => {
  const actualizadas = [...lineasVenta];
  actualizadas[index] = {
    ...actualizadas[index],
    [campo]: campo === 'cantidad' ? Number(valor) : valor,
  };

  if (campo === 'productoId') {
    actualizadas[index].varianteId = '';
    actualizadas[index].precio = 0;
    cargarVariantes(valor as string);
  }

  if (campo === 'varianteId' && valor) {
    try {
      const res = await axios.get(`/api/variantes/${valor}`);
      actualizadas[index].precio = res.data?.precio ?? 0;
    } catch (err) {
      console.error('Error al cargar precio de variante:', err);
      actualizadas[index].precio = 0;
    }
  }

  setLineasVenta(actualizadas);
};


  const calcularTotal = () =>
    lineasVenta.reduce((acc, l) => acc + l.cantidad * (l.precio || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const variantes = lineasVenta.map(l => ({
      varianteId: parseInt(l.varianteId, 10),
      cantidad: l.cantidad,
      precio_unitario: l.precio,
    }));

    if (
      !cliente.nombre ||
      variantes.some(v => !v.varianteId || v.cantidad <= 0)
    ) {
      alert('Por favor completá todos los campos requeridos');
      return;
    }

    try {
      const res = await axios.post('/api/ventas', {
        variantes,
        motivo: 'Venta realizada',
        usuario: 'admin',
        cliente,
      });

      const transaccion = res.data?.transaccion;
      if (transaccion) {
        setUltimaTransaccion(transaccion);
      }

      setCliente({ nombre: '', telefono: '', email: '' });
      setLineasVenta([{ productoId: '', varianteId: '', cantidad: 1, precio: 0 }]);
    } catch (err) {
      console.error('Error al registrar venta', err);
      alert('Error al registrar la venta');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registrar Nueva Venta</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {lineasVenta.map((linea, index) => (
          <div key={index} className="border p-4 rounded shadow-sm bg-white">
            <h3 className="font-semibold mb-2">Variante #{index + 1}</h3>

            <label className="block font-medium mb-1">Producto</label>
            <select
              className="w-full border rounded px-3 py-2 mb-3"
              value={linea.productoId}
              onChange={(e) => actualizarLinea(index, 'productoId', e.target.value)}
              required
            >
              <option value="">-- Selecciona producto --</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>

            {linea.productoId && variantesPorProducto[linea.productoId] && (
              <>
                <label className="block font-medium mb-1">Variante</label>
                <select
                  className="w-full border rounded px-3 py-2 mb-3"
                  value={linea.varianteId}
                  onChange={(e) => actualizarLinea(index, 'varianteId', e.target.value)}
                  required
                >
                  <option value="">-- Selecciona variante --</option>
                  {variantesPorProducto[linea.productoId].map((v) => (
                    <option key={v.id} value={v.id}>
                      {`${v.color ?? 'Sin color'} / ${v.talla ?? 'Sin talle'} (stock: ${v.stock})`}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="block font-medium mb-1">Cantidad</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded px-3 py-2"
              value={linea.cantidad}
              onChange={(e) => actualizarLinea(index, 'cantidad', e.target.value)}
              required
            />

            {linea.precio > 0 && (
              <p className="text-sm text-gray-700 mt-2">
                Subtotal: {linea.cantidad} × ${linea.precio.toFixed(2)} = <strong>${(linea.cantidad * linea.precio).toFixed(2)}</strong>
              </p>
            )}

            {lineasVenta.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarLinea(index)}
                className="text-red-600 text-sm mt-2"
              >
                Eliminar esta línea
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={agregarLinea}
          className="text-blue-600 text-sm"
        >
          ➕ Agregar otra variante
        </button>

        {calcularTotal() > 0 && (
          <div className="text-right text-lg font-semibold text-green-700 mt-4">
            🧾 Total estimado: ${calcularTotal().toFixed(2)}
          </div>
        )}

        <hr className="my-4" />
        <h2 className="text-xl font-semibold mb-2">Datos del Cliente</h2>

        <div>
          <label className="block font-medium">Nombre</label>
          <input
            type="text"
            value={cliente.nombre}
            onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Teléfono</label>
          <input
            type="text"
            value={cliente.telefono}
            onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            value={cliente.email}
            onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Registrar Venta
        </button>

      </form>
      {ultimaTransaccion && (
        <div className="mt-6 text-right">
          <PDFDownloadLink
            document={<TicketPDF transaccion={ultimaTransaccion} />}
            fileName={`ticket-${ultimaTransaccion.id}.pdf`}
          >
            {({ loading }) =>
              loading ? 'Generando ticket...' : '🧾 Descargar Ticket de Venta'
            }
          </PDFDownloadLink>
        </div>
      )}


    </div>
  );
}

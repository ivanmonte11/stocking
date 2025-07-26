'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Movimiento {
  varianteId: string;
  cantidad: number;
}

export default function RegistrarMovimientoPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [productoId, setProductoId] = useState('');
  const [variantes, setVariantes] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([{ varianteId: '', cantidad: 0 }]);
  const [tipoMovimiento, setTipoMovimiento] = useState('ENTRADA');
  const [motivo, setMotivo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [mensaje, setMensaje] = useState('');

  const actualizarMovimiento = (
    index: number,
    campo: keyof Movimiento,
    valor: string | number
  ) => {
    const nuevos = [...movimientos];
    nuevos[index] = {
      ...nuevos[index],
      [campo]: campo === 'cantidad' ? Number(valor) : valor,
    };
    setMovimientos(nuevos);
  };

  // (todo lo demás permanece igual)


  // Cargar productos
  useEffect(() => {
    axios.get('/api/productos')
      .then((res) => {
        setProductos(Array.isArray(res.data) ? res.data : res.data.data);
      })
      .catch((err) => console.error('Error al cargar productos:', err));
  }, []);

  // Cargar variantes al cambiar el producto
  useEffect(() => {
    if (!productoId) {
      setVariantes([]);
      setMovimientos([{ varianteId: '', cantidad: 0 }]);
      return;
    }

    axios.get(`/api/productos/${productoId}/variantes`)
      .then(res => {
        setVariantes(res.data);
        setMovimientos([{ varianteId: '', cantidad: 0 }]); // Reset
      })
      .catch(err => {
        console.error('Error al cargar variantes:', err);
        setVariantes([]);
        setMovimientos([{ varianteId: '', cantidad: 0 }]);
      });
  }, [productoId]);

  // Agregar una nueva línea de variante
  const agregarMovimiento = () => {
    setMovimientos([...movimientos, { varianteId: '', cantidad: 0 }]);
  };

  const eliminarMovimiento = (index: number) => {
    const nuevos = movimientos.filter((_, i) => i !== index);
    setMovimientos(nuevos);
  };


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!productoId || !usuario || movimientos.length === 0) {
    setMensaje('Completa todos los campos requeridos.');
    return;
  }

  if (movimientos.some(mov => !mov.varianteId || mov.cantidad <= 0)) {
    setMensaje('Todas las variantes deben estar completas y tener cantidad válida.');
    return;
  }

  try {
    // Asegúrate de que esta URL coincida con tu backend
    await axios.post('/api/movimientos', {
      producto_id: productoId,
      tipo_movimiento: tipoMovimiento,
      motivo,
      usuario,
      variantes: movimientos,
    });

    setMensaje('Movimiento registrado correctamente ✅');
    
    // Resetear formulario
    setProductoId('');
    setVariantes([]);
    setMovimientos([{ varianteId: '', cantidad: 0 }]);
    setTipoMovimiento('ENTRADA');
    setMotivo('');
    setUsuario('');
  } catch (error: any) {
    setMensaje(error.response?.data?.error || 'Error al registrar movimiento ❌');
  }
};


  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">Registrar Movimiento</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Producto */}
        <div>
          <label className="block mb-1 font-medium">Producto</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            required
          >
            <option value="">-- Selecciona un producto --</option>
            {productos.map((producto: any) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Variantes dinámicas */}
        {movimientos.map((mov, index) => (
          <div key={index} className="border p-3 rounded mb-3">
            <label className="block mb-1 font-medium">Variante #{index + 1}</label>
            <select
              className="w-full border rounded px-3 py-2 mb-2"
              value={mov.varianteId}
              onChange={(e) => actualizarMovimiento(index, 'varianteId', e.target.value)}
              required
            >
              <option value="">-- Selecciona una variante --</option>
              {variantes.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {`${v.color ?? 'Sin color'} / ${v.talla ?? 'Sin talla'}`}
                </option>
              ))}
            </select>

            <label className="block mb-1 font-medium">Cantidad</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={mov.cantidad}
              onChange={(e) => actualizarMovimiento(index, 'cantidad', e.target.value)}
              required
              min={1}
            />

            {movimientos.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarMovimiento(index)}
                className="text-red-600 text-sm mt-2"
              >
                Eliminar variante
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={agregarMovimiento}
          className="text-blue-600 text-sm mb-4"
        >
          ➕ Agregar otra variante
        </button>

        {/* Tipo de movimiento */}
        <div>
          <label className="block mb-1 font-medium">Tipo de Movimiento</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={tipoMovimiento}
            onChange={(e) => setTipoMovimiento(e.target.value)}
            required
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
          </select>
        </div>

        {/* Motivo */}
        <div>
          <label className="block mb-1 font-medium">Motivo (opcional)</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        {/* Usuario */}
        <div>
          <label className="block mb-1 font-medium">Usuario</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Registrar Movimiento
        </button>
      </form>

      {mensaje && (
        <div
          className={`text-center text-sm mt-4 ${
            mensaje.includes('correctamente') ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {mensaje}
        </div>
      )}
    </div>
  );
}

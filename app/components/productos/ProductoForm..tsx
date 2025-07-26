'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductoFormValues, productoSchema } from '../../lib/validations/productoSchema';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import { FieldError } from 'react-hook-form';
import axios from 'axios';
import { AgregarVarianteModal } from './AgregarVarianteModal';


interface ProductoFormProps {
  initialData?: any;
  onSubmit: (values: ProductoFormValues) => void;
  isSubmitting: boolean;
}

function getFieldError(error: any): FieldError | undefined {
  return error && typeof error === 'object' && 'message' in error ? (error as FieldError) : undefined;
}

export const ProductoForm = ({ initialData, onSubmit, isSubmitting }: ProductoFormProps) => {
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(initialData?.categoria || '');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [colores, setColores] = useState<string[]>([]);
  const [tallas, setTallas] = useState<string[]>([]);

  const [camposPersonalizados, setCamposPersonalizados] = useState<
    { index: number; tipo: 'color' | 'talla' }[]
  >([]);

  const [mostrarVarianteModal, setMostrarVarianteModal] = useState(false);


  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: initialData || {
      precio: 0,
      costo: 0,
      variantes: [{ color: '', talla: '', stock: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variantes',
  });

  useEffect(() => {
    axios.get('/api/productos/categorias')
      .then((res) => setCategorias(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategorias([]));

    axios.get('/api/productos/colores')
      .then((res) => setColores(Array.isArray(res.data) ? res.data : []))
      .catch(() => setColores([]));

    axios.get('/api/productos/tallas')
      .then((res) => setTallas(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTallas([]));
  }, []);

  const generarCodigo = () => {
    const nuevoCodigo = uuidv4().slice(0, 12).replace(/-/g, '').toUpperCase();
    setValue('codigo_barra', nuevoCodigo);
    setCodigoGenerado(nuevoCodigo);
  };

  const handleCategoriaChange = (value: string) => {
    setCategoriaSeleccionada(value);
    if (value !== '__nueva__') {
      setValue('categoria', value);
    } else {
      setValue('categoria', '');
    }
  };

  const handleNuevaCategoriaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nueva = e.target.value;
    setNuevaCategoria(nueva);
    setValue('categoria', nueva);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Código de Barras"
            id="codigo_barra"
            register={register}
            error={getFieldError(errors.codigo_barra)}
            required
          />
          <Button type="button" onClick={generarCodigo} className="mt-2" variant="outline">
            Generar Código
          </Button>
          {codigoGenerado && (
            <p className="text-sm text-gray-500 mt-1">
              Código generado: <strong>{codigoGenerado}</strong>
            </p>
          )}
        </div>

        <Input label="Nombre" id="nombre" register={register} error={getFieldError(errors.nombre)} required />
        <Input label="Precio" id="precio" type="number" step="0.01" register={register} error={getFieldError(errors.precio)} required />
        <Input label="Costo" id="costo" type="number" step="0.01" register={register} error={getFieldError(errors.costo)} required />

        <div>
          <label className="block font-medium mb-1">Categoría</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={categoriaSeleccionada}
            onChange={(e) => handleCategoriaChange(e.target.value)}
          >
            <option value="">-- Selecciona categoría --</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="__nueva__">➕ Agregar nueva categoría</option>
          </select>

          {categoriaSeleccionada === '__nueva__' && (
            <input
              type="text"
              placeholder="Nueva categoría"
              className="mt-2 w-full border rounded px-3 py-2"
              value={nuevaCategoria}
              onChange={handleNuevaCategoriaInput}
              required
            />
          )}
          {getFieldError(errors.categoria) && (
            <p className="text-sm text-red-600 mt-1">{getFieldError(errors.categoria)?.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700">Variantes</label>
        {fields.map((field, index) => {
          const colorSeleccionado = watch(`variantes.${index}.color`);
          const tallaSeleccionada = watch(`variantes.${index}.talla`);

          const mostrarInputColor = camposPersonalizados.some(
            (v) => v.index === index && v.tipo === 'color'
          );
          const mostrarInputTalla = camposPersonalizados.some(
            (v) => v.index === index && v.tipo === 'talla'
          );

          return (
            <div key={field.id} className="border rounded p-4 mb-2 space-y-2">
              {/* Select de color */}
              <select
                className="w-full border rounded px-3 py-2"
                {...register(`variantes.${index}.color`)}
                value={colorSeleccionado}
                onChange={(e) => {
                  const value = e.target.value;
                  setValue(`variantes.${index}.color`, value);
                  if (value === '__nuevo__') {
                    setCamposPersonalizados((prev) => [
                      ...prev,
                      { index, tipo: 'color' },
                    ]);
                    setValue(`variantes.${index}.color`, '');
                  } else {
                    setCamposPersonalizados((prev) =>
                      prev.filter((v) => !(v.index === index && v.tipo === 'color'))
                    );
                  }
                }}
              >
                <option value="">-- Selecciona un color --</option>
                {colores.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
                <option value="__nuevo__">➕ Agregar nuevo color</option>
              </select>

              {mostrarInputColor && (
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mt-2"
                  placeholder="Nuevo color"
                  value={colorSeleccionado}
                  onChange={(e) =>
                    setValue(`variantes.${index}.color`, e.target.value)
                  }
                  required
                />
              )}

              {/* Select de talla */}
              <select
                className="w-full border rounded px-3 py-2"
                {...register(`variantes.${index}.talla`)}
                value={tallaSeleccionada}
                onChange={(e) => {
                  const value = e.target.value;
                  setValue(`variantes.${index}.talla`, value);
                  if (value === '__nuevo__') {
                    setCamposPersonalizados((prev) => [
                      ...prev,
                      { index, tipo: 'talla' },
                    ]);
                    setValue(`variantes.${index}.talla`, '');
                  } else {
                    setCamposPersonalizados((prev) =>
                      prev.filter((v) => !(v.index === index && v.tipo === 'talla'))
                    );
                  }
                }}
              >
                <option value="">-- Selecciona una talla --</option>
                {tallas.map((talla) => (
                  <option key={talla} value={talla}>
                    {talla}
                  </option>
                ))}
                <option value="__nuevo__">➕ Agregar nueva talla</option>
              </select>

              {mostrarInputTalla && (
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mt-2"
                  placeholder="Nueva talla"
                  value={tallaSeleccionada}
                  onChange={(e) =>
                    setValue(`variantes.${index}.talla`, e.target.value)
                  }
                  required
                />
              )}

              {/* Stock */}
              <Input
                label="Stock"
                id={`variantes.${index}.stock`}
                type="number"
                register={register}
                error={(errors.variantes as any)?.[index]?.stock}
                required
              />

              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
                className="mt-1"
              >
                Eliminar Variante
              </Button>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ color: '', talla: '', stock: 0 })}
        >
          Agregar Variante
        </Button>
      </div>


      <Input
        label="Descripción"
        id="descripcion"
        register={register}
        error={getFieldError(errors.descripcion)}
        multiline
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </Button>

      {initialData?.id && (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={() => setMostrarVarianteModal(true)}
          >
            ➕ Agregar variante a este producto
          </Button>

          {mostrarVarianteModal && (
            <AgregarVarianteModal
              productoId={initialData.id}
              onClose={() => setMostrarVarianteModal(false)}
              onSuccess={() => {
                setMostrarVarianteModal(false);
                // Podés refrescar variantes, reconsultar API, etc.
              }}
            />
          )}
        </>
      )}

    </form>


  );

};



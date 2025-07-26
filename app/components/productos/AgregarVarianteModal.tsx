'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AgregarVarianteModalProps {
  productoId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const AgregarVarianteModal = ({ productoId, onClose, onSuccess }: AgregarVarianteModalProps) => {
  const { register, handleSubmit, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setMensaje('');
    try {
      await axios.post(`/api/productos/${productoId}/variantes`, {
        ...data,
        stock: parseInt(data.stock),
        usuario: data.usuario || 'admin',
      });

      setMensaje('Variante agregada correctamente ✅');
      onSuccess();
      reset();
    } catch (err: any) {
      setMensaje(err.response?.data?.error || 'Error al agregar variante ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl font-bold">&times;</button>
        <h2 className="text-xl font-bold mb-4">➕ Agregar Variante</h2>

        {/* ⛔ Evitamos <form> dentro del <form principal> */}
        <div role="form" className="space-y-3">
          <Input label="Color" id="color" register={register} required />
          <Input label="Talla" id="talla" register={register} required />
          <Input label="Stock inicial" id="stock" type="number" register={register} required />
          <Input label="Usuario" id="usuario" register={register} required />

          <Button type="button" disabled={isSubmitting} onClick={handleSubmit(onSubmit)} className="w-full">
            {isSubmitting ? 'Agregando...' : 'Agregar'}
          </Button>
        </div>

        {mensaje && <p className="text-sm text-center mt-2 text-gray-700">{mensaje}</p>}
      </div>
    </div>
  );
};

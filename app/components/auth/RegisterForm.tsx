'use client';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import Link from 'next/link';

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm({ onSubmit, isSubmitting }: {
  onSubmit: (data: FormValues) => void,
  isSubmitting: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-purple-50 border border-purple-100 rounded-xl p-8 shadow-md">
      <Input
        label="Nombre completo"
        id="name"
        register={register}
        error={errors.name}
        required
        validate={(value) => {
          if (!value) return 'Nombre es requerido';
          if (value.length < 2) return 'Mínimo 2 caracteres';
          return true;
        }}
      />

      <Input
        label="Correo electrónico"
        id="email"
        type="email"
        register={register}
        error={errors.email}
        required
        validate={(value) => {
          if (!value) return 'Email es requerido';
          if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
            return 'Email inválido';
          }
          return true;
        }}
      />

      <Input
        label="Contraseña"
        id="password"
        type="password"
        register={register}
        error={errors.password}
        required
        validate={(value) => {
          if (!value) return 'Contraseña es requerida';
          if (value.length < 6) return 'Mínimo 6 caracteres';
          return true;
        }}
      />

      <Input
        label="Confirmar contraseña"
        id="confirmPassword"
        type="password"
        register={register}
        error={errors.confirmPassword}
        required
        validate={(value) => {
          if (!value) return 'Confirma tu contraseña';
          if (value !== password) return 'Las contraseñas no coinciden';
          return true;
        }}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
      </Button>

      <div className="text-center text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-500">
          Inicia sesión
        </Link>
      </div>
    </form>
  );
}
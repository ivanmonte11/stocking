'use client';

import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

type FormValues = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

export default function LoginForm({ onSubmit, isSubmitting }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
      <Input
  id="email"
  label="Correo electrónico"
  type="email"
  autoComplete="email"
  register={register}
  error={errors.email}
  required
  validate={(value) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) || 'Correo electrónico inválido'
  }
/>

<Input
  id="password"
  label="Contraseña"
  type="password"
  autoComplete="current-password"
  register={register}
  error={errors.password}
  required
  validate={(value) =>
    value.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
  }
/>

      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Recordarme
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </div>
    </form>
  );
}
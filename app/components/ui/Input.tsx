import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface BaseInputProps {
  label: string;
  id: string;
  register?: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  multiline?: boolean;
  validate?: (value: any) => boolean | string;
}

type InputProps = BaseInputProps & (
  | {
      multiline?: false;
    } & InputHTMLAttributes<HTMLInputElement>
  | {
      multiline: true;
    } & TextareaHTMLAttributes<HTMLTextAreaElement>
);

export const Input = ({
  label,
  id,
  register,
  error,
  required = false,
  multiline = false,
  validate,
  ...props
}: InputProps) => {
  const inputClasses = `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  const registerProps = register
    ? register(id, {
        required: required ? 'Este campo es requerido' : false,
        validate: validate,
        valueAsNumber: !multiline && (props as InputHTMLAttributes<HTMLInputElement>).type === 'number',
      })
    : {};

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          {...registerProps}
          {...props as TextareaHTMLAttributes<HTMLTextAreaElement>}
          className={inputClasses}
        />
      ) : (
        <input
          id={id}
          {...registerProps}
          {...props as InputHTMLAttributes<HTMLInputElement>}
          className={inputClasses}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

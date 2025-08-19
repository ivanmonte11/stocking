import { z } from 'zod';

const numberLike = z.union([
  z.number(),
  z.string().transform((val, ctx) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe ser un número',
      });
      return z.NEVER;
    }
    return parsed;
  }),
]).pipe(z.number().min(0));

export const varianteSchema = z.object({
  color: z.string().optional(),
  talla: z.string().optional(),
  stock: numberLike,
});

export const productoSchema = z.object({
  codigoBarra: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  precio: numberLike,
  costo: numberLike,
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
  variantes: z.array(
    z.object({
      color: z.string().optional(),
      talla: z.string().optional(),
      stock: numberLike,
    })
  ),
   estado: z.enum(['activo', 'archivado']),
});


export type ProductoFormValues = z.infer<typeof productoSchema>;
export type VarianteFormValues = z.infer<typeof varianteSchema>;

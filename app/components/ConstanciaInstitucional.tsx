import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

interface User {
  accesoHasta?: string;
  status?: string;
}

export default function ConstanciaInstitucional({ user }: { user: User }) {
  if (user.status !== 'active' || !user.accesoHasta) return null;

  const fecha = new Date(user.accesoHasta);
  if (isNaN(fecha.getTime()) || fecha < new Date()) return null;

  return (
    <section className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheckIcon className="h-5 w-5 text-green-600" />
        <h2 className="text-lg font-semibold text-neutral-800">
          Constancia Institucional
        </h2>
      </div>

      <p className="text-sm text-neutral-600 mb-1">
        Usuario habilitado hasta el{' '}
        <strong className="text-neutral-800">
          {format(fecha, "dd 'de' MMMM yyyy", { locale: es })}
        </strong>
      </p>
      <p className="text-sm text-neutral-600">
        Activación vigente. Acceso completo al sistema y soporte editorial disponible.
      </p>
    </section>
  );
}

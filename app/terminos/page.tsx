'use client';

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 space-y-6 text-sm text-gray-700">
      <h1 className="text-2xl font-bold text-gray-900">Términos y condiciones</h1>

      <p>Stocking SaaS es una plataforma institucional para la gestión de negocios. Al registrarte y utilizar el sistema, aceptás los siguientes términos:</p>

      <ul className="list-disc pl-5 space-y-2">
        <li>El acceso está sujeto a licencias mensuales o anuales, según el plan elegido.</li>
        <li>Está prohibido el uso fraudulento, automatizado o fuera del marco comercial previsto.</li>
        <li>MonteStack se reserva el derecho de modificar precios, funciones o condiciones sin previo aviso.</li>
        <li>El sistema puede suspender o limitar el acceso ante incumplimientos o falta de pago.</li>
        <li>Ante cualquier conflicto, se aplicará la legislación vigente en Argentina.</li>
      </ul>

      <p>Estos términos pueden actualizarse. Te recomendamos revisarlos periódicamente.</p>
    </div>
  );
}

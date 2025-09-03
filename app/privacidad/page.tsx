'use client';

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 space-y-6 text-sm text-gray-700">
      <h1 className="text-2xl font-bold text-gray-900">Política de privacidad</h1>

      <p>En Stocking SaaS protegemos tu información con trazabilidad editorial y blindaje técnico. Al usar el sistema, aceptás esta política:</p>

      <ul className="list-disc pl-5 space-y-2">
        <li>Recopilamos tu email, actividad en el sistema y datos de pago para garantizar el acceso y soporte.</li>
        <li>Usamos tokens seguros, cifrado y validación en cada capa para proteger tu sesión.</li>
        <li>Compartimos datos solo con proveedores confiables como MercadoPago y Resend, exclusivamente para operar el sistema.</li>
        <li>No vendemos ni cedemos tu información a terceros con fines comerciales.</li>
        <li>Podés solicitar acceso, modificación o eliminación de tus datos escribiendo a <a href="mailto:montestacksoft@gmail.com" className="text-blue-600 hover:underline">montestacksoft@gmail.com</a>.</li>
      </ul>

      <p>Esta política puede actualizarse. Te recomendamos revisarla periódicamente.</p>
    </div>
  );
}

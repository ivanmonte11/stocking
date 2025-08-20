'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FailurePage() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('payment_id');
    const [motivo, setMotivo] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const consultar = async () => {
            if (!paymentId) return;

            const res = await fetch(`/api/mercadopago/estado?payment_id=${paymentId}`);
            const data = await res.json();
            setMotivo(data.motivo || 'No pudimos confirmar el motivo del rechazo');
            setEmail(data.email || '');
        };

        consultar();
    }, [paymentId]);


    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-xl text-center space-y-6">
                <h1 className="text-2xl font-bold text-red-600">Pago rechazado</h1>
                <p className="text-gray-600 text-sm">{motivo}</p>
                <a href={`/app/pago?email=${encodeURIComponent(email)}`} className="text-blue-600 underline">
                    Reintentar pago
                </a>



            </div>
        </div>
    );
}

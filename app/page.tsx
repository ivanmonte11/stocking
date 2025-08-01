'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

const FeatureCard = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className="bg-white/5 p-6 rounded-xl hover:bg-white/10 transition">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-300">{desc}</p>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center border-b border-white/10 sticky top-0 z-50 bg-black/30 backdrop-blur">
  <div className="flex items-center ">
    <Image 
      src="/images/stocking.png" 
      alt="Logo de Stocking" 
      width={52} 
      height={42} 
      priority 
    />
    <span className="text-2xl font-bold text-blue-400">Stocking</span>
  </div>
  <nav className="space-x-4 text-sm">
    <Link href="/auth/login" className="hover:text-blue-300 transition">Ingresar</Link>
    <Link href="/auth/register" className="hover:text-blue-300 transition">Registrarse</Link>
  </nav>
</header>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <h2 className="text-5xl font-extrabold tracking-tight mb-6">Gestioná tu stock con precisión</h2>
        <p className="text-lg text-gray-400 mb-10">
          Controlá productos, variantes y movimientos con una plataforma intuitiva y lista para escalar.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/auth/register">
            <Button size="lg">Probar ahora</Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg">Ver Demo</Button>
          </Link>
        </div>
      </section>

      {/* Tarjetas informativas */}
      <section className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-6 px-6 mb-24">
        <FeatureCard
          icon="📦"
          title="Control de inventario"
          desc="Gestioná entradas, salidas y ajustes con total claridad."
        />
        <FeatureCard
          icon="📊"
          title="Reportes al instante"
          desc="Visualizá movimientos, totales y rendimiento sin esfuerzo."
        />
        <FeatureCard
          icon="🧩"
          title="Productos con variantes"
          desc="Organizá por talla, color o formato en pocos clics."
        />
        <FeatureCard
          icon="🛠️"
          title="Flujos personalizados"
          desc="Adaptá la plataforma a tu forma de trabajar."
        />
        <FeatureCard
          icon="📱"
          title="Responsive y simple"
          desc="Accedé desde cualquier dispositivo, sin instalaciones."
        />
        <FeatureCard
          icon="🔐"
          title="Seguridad primero"
          desc="Tus datos siempre protegidos y accesibles para vos."
        />
      </section>

      {/* ¿Por qué StockManager? */}
      <section className="px-6 py-20 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">¿Por qué elegir Stocking?</h3>
          <p className="text-gray-300 mb-8">
            Porque entendemos el caos del día a día. Y diseñamos algo que lo resuelve sin complicarte.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <FeatureCard
              icon="⚡"
              title="Rápido"
              desc="Cargá, filtrá y mové productos sin cargar planillas eternas."
            />
            <FeatureCard
              icon="🧠"
              title="Inteligente"
              desc="Aprovechá reportes automáticos para mejorar tus decisiones."
            />
            <FeatureCard
              icon="🧘‍♂️"
              title="Tranquilo"
              desc="Sabé que tu stock está en orden. Todo el tiempo."
            />
          </div>
        </div>
      </section>

      {/* Logos de negocios */}
      <section className="py-16 px-6 text-center">
        <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-6">Confiado por negocios como</h3>
        <div className="flex justify-center gap-10 flex-wrap opacity-70">
          <img src="/logos/logo1.svg" alt="Tienda Bruma" className="h-8" />
          <img src="/logos/logo2.svg" alt="Cebra Moda" className="h-8" />
          <img src="/logos/logo3.svg" alt="Local 93" className="h-8" />
          <img src="/logos/logo4.svg" alt="Indumentaria Sur" className="h-8" />
        </div>
      </section>

      {/* Testimonio */}
      <section className="px-6 py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-center text-white">
        <p className="text-xl font-medium italic max-w-2xl mx-auto mb-4">
          “Desde que usamos Stocking, nuestro depósito dejó de ser un misterio. Todo está a un clic.”
        </p>
        <p className="text-sm text-blue-100">— Sofía Rinaldi, Encargada de Tienda Bruma</p>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t border-gray-800">
        © {new Date().getFullYear()} Stocking. Desarrollado por MonteStack.
      </footer>
    </div>
  );
}
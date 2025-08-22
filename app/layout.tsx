'use client';

import '@/globals.css';
import { QueryProvider } from './providers/QueryProvider';
import { Navbar } from '@/components/NavBar';
import { AuthProvider } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      {/* El Navbar decide internamente si se muestra o no */}
      <Navbar />

      <main className={isHome ? 'flex-grow p-0' : 'flex-grow p-4 md:p-6'}>
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

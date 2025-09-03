'use client';

import '@/globals.css';
import { QueryProvider } from './providers/QueryProvider';
import { Navbar } from '@/components/NavBar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <Navbar />}
      <main className={isHome ? 'flex-grow p-0' : 'flex-grow p-4 md:p-6'}>
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
  <link rel="icon" href="/favicon.ico" />
  <title>Stocking</title>
</head>


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

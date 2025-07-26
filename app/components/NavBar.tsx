'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiPackage, FiList, FiHome, FiUsers, FiDollarSign } from 'react-icons/fi';

export const Navbar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link 
              href="/dashboard/user" 
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/dashboard') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            >
              <FiHome className="mr-2" /> Inicio
            </Link>
            <Link 
              href="/products/" 
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/products') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            >
              <FiPackage className="mr-2" /> Productos
            </Link>
            <Link 
              href="/clientes" 
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/customers') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            >
              <FiUsers className="mr-2" /> Clientes
            </Link>
            <Link 
              href="/sales" 
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/sales') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            >
              <FiDollarSign className="mr-2" /> Ventas
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
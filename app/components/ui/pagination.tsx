'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  const searchParams = useSearchParams();
  
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
      </div>
      
      <div className="flex space-x-2">
        {currentPage > 1 && (
          <Link
            href={createPageURL(currentPage - 1)}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Anterior
          </Link>
        )}
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={createPageURL(page)}
            className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}
          >
            {page}
          </Link>
        ))}
        
        {currentPage < totalPages && (
          <Link
            href={createPageURL(currentPage + 1)}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
};
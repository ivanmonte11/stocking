import SalesList from '@/components/sales/SalesList';

export default function SalesPage() {
  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Ventas</h1>
      <SalesList />
    </div>
  );
}

interface CardProps {
    titulo: string;
    valor: string;
    icono: string;
    alerta?: boolean;
  }
  
  export function CardResumen({ titulo, valor, icono, alerta = false }: CardProps) {
    return (
      <div className={`p-4 rounded-lg border ${alerta ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between">
          <h3 className="text-gray-500 text-sm font-medium">{titulo}</h3>
          <span className="text-lg">{icono}</span>
        </div>
        <p className={`mt-2 text-2xl font-bold ${alerta ? 'text-red-600' : 'text-gray-900'}`}>
          {valor}
        </p>
      </div>
    );
  }
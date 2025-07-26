'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function VentasMensualesChart() {
  const [datosGrafico, setDatosGrafico] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Salidas (Ventas)',
        data: [] as number[],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 1)'
      },
    ],
  });

  const opciones = {
    responsive: true,
    maintainAspectRatio: false, // Permite ajustar altura/ancho libremente
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 16
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45, // Para evitar superposición en móviles
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/movimientos/ventas-mensuales');
        const data = await res.json();

        // Ordenar los datos por mes si es necesario
        const mesesOrden = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const datosOrdenados = [...data].sort((a, b) => 
          mesesOrden.indexOf(a.mes) - mesesOrden.indexOf(b.mes)
        );

        setDatosGrafico(prev => ({
          labels: datosOrdenados.map(item => item.mes),
          datasets: [{
            ...prev.datasets[0],
            data: datosOrdenados.map(item => item.cantidad)
          }]
        }));
      } catch (error) {
        console.error('Error al cargar las ventas mensuales:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Ventas Mensuales</h2>
      <div className="w-full h-[400px]"> {/* Altura aumentada */}
        <Bar 
          data={datosGrafico} 
          options={opciones} 
          className="w-full h-full"
        />
      </div>
    </section>
  );
}
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { DashboardData } from '@/types';
import { formatCurrency } from '@/utils/calculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DebtSavingsChartProps {
  dashboardData: DashboardData;
}

const DebtSavingsChart: React.FC<DebtSavingsChartProps> = ({ dashboardData }) => {
  const { totalOutstandingDebt, totalSavings } = dashboardData;

  // Doughnut chart data for debt vs savings
  const doughnutData = {
    labels: ['Outstanding Debt', 'Total Savings'],
    datasets: [
      {
        data: [totalOutstandingDebt, totalSavings],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)', // Red for debt
          'rgba(34, 197, 94, 0.8)', // Green for savings
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Bar chart data for loan breakdown
  const barData = {
    labels: dashboardData.loans.filter(loan => loan.isActive).map(loan => loan.name),
    datasets: [
      {
        label: 'Outstanding Amount',
        data: dashboardData.loans
          .filter(loan => loan.isActive)
          .map(loan => loan.currentPrincipal),
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${formatCurrency(context.parsed || context.raw)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="glass-card">
      <h3 className="text-xl font-semibold text-white mb-6">Financial Overview</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debt vs Savings Doughnut Chart */}
        <div className="h-64">
          <h4 className="text-lg font-medium text-white/90 mb-4 text-center">
            Debt vs Savings
          </h4>
          {totalOutstandingDebt > 0 || totalSavings > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-white/60">
              No data available
            </div>
          )}
        </div>

        {/* Loan Breakdown Bar Chart */}
        <div className="h-64">
          <h4 className="text-lg font-medium text-white/90 mb-4 text-center">
            Loan Breakdown
          </h4>
          {dashboardData.loans.filter(loan => loan.isActive).length > 0 ? (
            <Bar data={barData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-white/60">
              No active loans
            </div>
          )}
        </div>
      </div>

      {/* Net Worth Indicator */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <div className="text-center">
          <p className="text-white/70 text-sm">Net Worth</p>
          <p className={`text-2xl font-bold ${
            totalSavings - totalOutstandingDebt >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {formatCurrency(totalSavings - totalOutstandingDebt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebtSavingsChart;

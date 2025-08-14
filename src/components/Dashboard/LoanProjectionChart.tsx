import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { DashboardData } from '@/types';
import { getCombinedLoanProjection, formatCurrency } from '@/utils/calculations';
import { TrendingDown, BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface LoanProjectionChartProps {
  dashboardData: DashboardData;
}

const LoanProjectionChart: React.FC<LoanProjectionChartProps> = ({ dashboardData }) => {
  const projectionData = getCombinedLoanProjection(dashboardData.loans);

  if (projectionData.length === 0) {
    return (
      <div className="glass-card text-center py-12">
        <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white/70 mb-2">No Projection Data</h3>
        <p className="text-white/50">Add loans to see monthly payment projections</p>
      </div>
    );
  }

  // Prepare data for the combo chart
  const labels = projectionData.map(data => `Month ${data.month}`);

  const barData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Principal Payment',
        data: projectionData.map(data => data.totalPrincipalPayment),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Interest Payment',
        data: projectionData.map(data => data.totalInterestPayment),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Remaining Principal',
        data: projectionData.map(data => data.totalRemainingPrincipal),
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y1',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
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
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y || context.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          maxTicksLimit: 12,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        title: {
          display: true,
          text: 'Monthly Payments',
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Remaining Principal',
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
  };

  // Calculate summary stats
  const totalPrincipalOverPeriod = projectionData.reduce((sum, data) => sum + data.totalPrincipalPayment, 0);
  const totalInterestOverPeriod = projectionData.reduce((sum, data) => sum + data.totalInterestPayment, 0);
  const principalToInterestRatio = totalPrincipalOverPeriod / (totalInterestOverPeriod || 1);

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingDown className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">Payment Projection</h3>
            <p className="text-white/70 text-sm">Next {projectionData.length} months breakdown</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-white/70 text-xs">Principal:Interest Ratio</p>
          <p className="text-lg font-bold text-purple-400">
            {principalToInterestRatio.toFixed(2)}:1
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <Bar data={barData} options={chartOptions} />
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-white/70 text-sm">Total Principal Payments</span>
          </div>
          <p className="text-lg font-bold text-green-400">
            {formatCurrency(totalPrincipalOverPeriod)}
          </p>
          <p className="text-white/60 text-xs">Over next {projectionData.length} months</p>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-white/70 text-sm">Total Interest Payments</span>
          </div>
          <p className="text-lg font-bold text-red-400">
            {formatCurrency(totalInterestOverPeriod)}
          </p>
          <p className="text-white/60 text-xs">Over next {projectionData.length} months</p>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-white/70 text-sm">Final Remaining Balance</span>
          </div>
          <p className="text-lg font-bold text-purple-400">
            {formatCurrency(projectionData[projectionData.length - 1]?.totalRemainingPrincipal || 0)}
          </p>
          <p className="text-white/60 text-xs">After {projectionData.length} months</p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2">💡 Key Insights:</h4>
        <ul className="text-white/80 text-sm space-y-1">
          <li>• Early months have higher interest payments, later months have higher principal payments</li>
          <li>• The purple line shows your debt decreasing over time</li>
          <li>• Making part payments can significantly reduce the interest portion</li>
        </ul>
      </div>
    </div>
  );
};

export default LoanProjectionChart;

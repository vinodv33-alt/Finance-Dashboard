import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/useFinance';
import DebtSavingsChart from './DebtSavingsChart';
import LoanTable from './LoanTable';
import SummaryCards from './SummaryCards';
import { formatCurrency, formatDate } from '@/utils/calculations';

const Dashboard: React.FC = () => {
  const { dashboardData, lastRefresh } = useDashboard();

  return (
    <div className="space-y-8">
      {/* Auto-refresh indicator */}
      {lastRefresh && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card text-center"
        >
          <p className="text-white/70 text-sm">
            Last auto-refreshed on {formatDate(lastRefresh)} • Next refresh: 5th of next month
          </p>
        </motion.div>
      )}

      {/* Summary Cards */}
      <SummaryCards dashboardData={dashboardData} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <DebtSavingsChart dashboardData={dashboardData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Financial Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-white/70">Total Outstanding Debt</span>
              <span className="text-2xl font-bold text-red-400">
                {formatCurrency(dashboardData.totalOutstandingDebt)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-white/70">Total Savings</span>
              <span className="text-2xl font-bold text-green-400">
                {formatCurrency(dashboardData.totalSavings)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-white/70">Monthly EMI</span>
              <span className="text-xl font-semibold text-orange-400">
                {formatCurrency(dashboardData.monthlyEmi)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-white/70">Next EMI Date</span>
              <span className="text-lg font-medium text-blue-400">
                {formatDate(dashboardData.nextEmiDate)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Loan Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <LoanTable loans={dashboardData.loans} />
      </motion.div>
    </div>
  );
};

export default Dashboard;

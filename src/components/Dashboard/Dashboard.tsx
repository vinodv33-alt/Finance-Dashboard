import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '@/hooks/useFinance';
import DebtSavingsChart from './DebtSavingsChart';
import LoanTable from './LoanTable';
import SummaryCards from './SummaryCards';
import { formatCurrency, formatDate } from '@/utils/calculations';
import LoanProjectionChart from './LoanProjectionChart';
import PartPaymentForm from '@/components/LoanManagement/PartPaymentForm';

const Dashboard: React.FC = () => {
  const { dashboardData, lastRefresh, addPartPayment, removeLastPartPayment, reorderLoans } = useDashboard();
  const [partPaymentLoanId, setPartPaymentLoanId] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const selectedLoan = partPaymentLoanId
    ? dashboardData.loans.find(l => l.id === partPaymentLoanId) || null
    : null;

  return (
    <div className="space-y-8" onClick={() => setSelectedLoanId(null)}>
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

      {/* Payment Projection Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {/* Hint: show when a particular loan is selected */}
        {selectedLoanId && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg flex items-center justify-between">
            <div className="text-white/80 text-sm">
              Showing projection for: <span className="font-semibold text-white">{dashboardData.loans.find(l => l.id === selectedLoanId)?.name || 'Loan'}</span>
              <span className="text-white/60"> — click outside to view all</span>
            </div>
            <div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedLoanId(null); }}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-md text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        <LoanProjectionChart dashboardData={dashboardData} selectedLoanId={selectedLoanId} />
      </motion.div>

      {/* Loan Table with Part Payment action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <LoanTable
          loans={dashboardData.loans}
          onPartPayment={(loan) => setPartPaymentLoanId(loan.id)}
          onUndoLastPartPayment={(loan) => {
            if (confirm('Undo the last part payment for this loan?')) {
              removeLastPartPayment(loan.id);
            }
          }}
          onSelect={(loanId) => {
            // toggle selection: select clicked loan or deselect if same
            setSelectedLoanId(prev => (prev === loanId ? null : loanId));
          }}
          onReorder={reorderLoans}
          selectedLoanId={selectedLoanId}
          showActions={true}
        />
      </motion.div>

      {/* Part Payment Modal */}
      {selectedLoan && partPaymentLoanId && (
        <PartPaymentForm
          loanId={partPaymentLoanId}
          loan={selectedLoan}
          onSubmit={(data) => {
            addPartPayment(partPaymentLoanId, data);
            setPartPaymentLoanId(null);
          }}
          onCancel={() => setPartPaymentLoanId(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;

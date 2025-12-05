import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLoans } from '@/hooks/useFinance';
import { Loan, PartPayment } from '@/types';
import LoanForm from './LoanForm';
import LoanTable from '../Dashboard/LoanTable';
import PartPaymentForm from './PartPaymentForm';
import { Plus, Calculator, CreditCard } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const LoanManagement: React.FC = () => {
  const { loans, addLoan, updateLoan, deleteLoan, addPartPayment, removeLastPartPayment, reorderLoans } = useLoans();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [showPartPaymentForm, setShowPartPaymentForm] = useState<string | null>(null);

  const handleAddLoan = (loanData: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: uuidv4(),
    };
    addLoan(newLoan);
    setShowAddForm(false);
  };

  const handleEditLoan = (loanData: Omit<Loan, 'id'>) => {
    if (editingLoan) {
      // Preserve existing loan properties that shouldn't be reset unless user changed them
      const shouldUpdateCurrentPrincipal = Number(loanData.principalAmount) !== Number(editingLoan.principalAmount);

      const updatedLoanData: Partial<Loan> = {
        ...loanData,
        // If user changed principal amount in the edit, assume they intended to update outstanding as well
        currentPrincipal: shouldUpdateCurrentPrincipal ? Number(loanData.principalAmount) : editingLoan.currentPrincipal,
        partPayments: editingLoan.partPayments, // Keep existing part payments
        interestRateChanges: editingLoan.interestRateChanges, // Keep rate change history
        lastEmiDate: editingLoan.lastEmiDate, // Keep last EMI date if it exists
      };

      updateLoan(editingLoan.id, updatedLoanData);
      setEditingLoan(null);
    }
  };

  const handleDeleteLoan = (loanId: string) => {
    if (confirm('Are you sure you want to delete this loan?')) {
      deleteLoan(loanId);
    }
  };

  const handlePartPayment = (loanId: string, partPaymentData: Omit<PartPayment, 'id'>) => {
    const partPayment: PartPayment = {
      ...partPaymentData,
      id: uuidv4(),
    };
    addPartPayment(loanId, partPayment);
    setShowPartPaymentForm(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Loan Management</h2>
          <p className="text-white/70">Add, edit, and manage your loans</p>
        </div>
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="glass-button flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          <span>Add New Loan</span>
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card text-center"
        >
          <CreditCard className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Total Loans</p>
          <p className="text-2xl font-bold text-white">{loans.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card text-center"
        >
          <Calculator className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Active Loans</p>
          <p className="text-2xl font-bold text-white">
            {loans.filter(loan => loan.isActive).length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card text-center"
        >
          <Plus className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Part Payments</p>
          <p className="text-2xl font-bold text-white">
            {loans.reduce((total, loan) => total + loan.partPayments.length, 0)}
          </p>
        </motion.div>
      </div>

      {/* Loan Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <LoanTable
          loans={loans}
          onEdit={setEditingLoan}
          onDelete={handleDeleteLoan}
          onPartPayment={(loan) => setShowPartPaymentForm(loan.id)}
          onUndoLastPartPayment={(loan) => {
            if (confirm('Undo the last part payment for this loan?')) {
              removeLastPartPayment(loan.id);
            }
          }}
          showActions={true}
          onReorder={(fromId, toId) => reorderLoans(fromId, toId)}
        />
      </motion.div>

      {/* Part Payment Actions */}
      {loans.filter(loan => loan.isActive).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loans.filter(loan => loan.isActive).map(loan => (
              <button
                key={loan.id}
                onClick={() => setShowPartPaymentForm(loan.id)}
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
              >
                <h4 className="font-medium text-white">{loan.name}</h4>
                <p className="text-white/70 text-sm">Make part payment</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Loan Modal */}
      {showAddForm && (
        <LoanForm
          onSubmit={handleAddLoan}
          onCancel={() => setShowAddForm(false)}
          title="Add New Loan"
        />
      )}

      {/* Edit Loan Modal */}
      {editingLoan && (
        <LoanForm
          loan={editingLoan}
          onSubmit={handleEditLoan}
          onCancel={() => setEditingLoan(null)}
          title="Edit Loan"
        />
      )}

      {/* Part Payment Modal */}
      {showPartPaymentForm && (
        <PartPaymentForm
          loanId={showPartPaymentForm}
          loan={loans.find(l => l.id === showPartPaymentForm)!}
          onSubmit={(data) => handlePartPayment(showPartPaymentForm, data)}
          onCancel={() => setShowPartPaymentForm(null)}
        />
      )}
    </div>
  );
};

export default LoanManagement;

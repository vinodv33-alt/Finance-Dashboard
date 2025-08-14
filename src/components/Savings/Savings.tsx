import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSavings } from '@/hooks/useFinance';
import { SavingsAccount, SavingsCategory } from '@/types';
import SavingsForm from './SavingsForm';
import SavingsCard from './SavingsCard';
import { Plus, PiggyBank, TrendingUp, Target } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { v4 as uuidv4 } from 'uuid';

const Savings: React.FC = () => {
  const { savings, totalSavings, addSavingsAccount, updateSavingsAccount, deleteSavingsAccount } = useSavings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);

  const handleAddSavings = (accountData: Omit<SavingsAccount, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    const newAccount: SavingsAccount = {
      ...accountData,
      id: uuidv4(),
      dateAdded: new Date(),
      lastUpdated: new Date(),
    };
    addSavingsAccount(newAccount);
    setShowAddForm(false);
  };

  const handleEditSavings = (accountData: Omit<SavingsAccount, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    if (editingAccount) {
      updateSavingsAccount(editingAccount.id, {
        ...accountData,
        lastUpdated: new Date(),
      });
      setEditingAccount(null);
    }
  };

  const handleDeleteSavings = (accountId: string) => {
    if (confirm('Are you sure you want to delete this savings account?')) {
      deleteSavingsAccount(accountId);
    }
  };

  // Group savings by category
  const savingsByCategory = savings.reduce((acc, account) => {
    if (!acc[account.category]) {
      acc[account.category] = [];
    }
    acc[account.category].push(account);
    return acc;
  }, {} as Record<SavingsCategory, SavingsAccount[]>);

  const categoryTotals = Object.entries(savingsByCategory).map(([category, accounts]) => ({
    category: category as SavingsCategory,
    total: accounts.reduce((sum, account) => sum + account.amount, 0),
    count: accounts.length
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Savings Management</h2>
          <p className="text-white/70">Track and manage your savings across different categories</p>
        </div>
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="glass-button flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          <span>Add Savings Account</span>
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card text-center"
        >
          <PiggyBank className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Total Savings</p>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(totalSavings)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card text-center"
        >
          <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Savings Accounts</p>
          <p className="text-3xl font-bold text-blue-400">{savings.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card text-center"
        >
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Categories</p>
          <p className="text-3xl font-bold text-purple-400">{categoryTotals.length}</p>
        </motion.div>
      </div>

      {/* Category Overview */}
      {categoryTotals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Savings by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTotals.map(({ category, total, count }) => (
              <div key={category} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white">{category}</h4>
                  <span className="text-white/60 text-xs">{count} account{count !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-lg font-bold text-green-400">{formatCurrency(total)}</p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(total / totalSavings) * 100}%` }}
                  />
                </div>
                <p className="text-white/60 text-xs mt-1">
                  {((total / totalSavings) * 100).toFixed(1)}% of total savings
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Savings Accounts */}
      {savings.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white">Your Savings Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savings.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <SavingsCard
                  account={account}
                  onEdit={() => setEditingAccount(account)}
                  onDelete={() => handleDeleteSavings(account.id)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card text-center py-12"
        >
          <PiggyBank className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">No Savings Accounts</h3>
          <p className="text-white/50 mb-6">Start tracking your savings by adding your first account</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="glass-button"
          >
            Add Your First Savings Account
          </button>
        </motion.div>
      )}

      {/* Add Savings Modal */}
      {showAddForm && (
        <SavingsForm
          onSubmit={handleAddSavings}
          onCancel={() => setShowAddForm(false)}
          title="Add Savings Account"
        />
      )}

      {/* Edit Savings Modal */}
      {editingAccount && (
        <SavingsForm
          account={editingAccount}
          onSubmit={handleEditSavings}
          onCancel={() => setEditingAccount(null)}
          title="Edit Savings Account"
        />
      )}
    </div>
  );
};

export default Savings;

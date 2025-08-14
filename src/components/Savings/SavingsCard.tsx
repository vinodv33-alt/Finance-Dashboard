import React from 'react';
import { motion } from 'framer-motion';
import { SavingsAccount } from '@/types';
import { formatCurrency, formatDate } from '@/utils/calculations';
import { Edit, Trash2, PiggyBank, Calendar, Tag } from 'lucide-react';

interface SavingsCardProps {
  account: SavingsAccount;
  onEdit: () => void;
  onDelete: () => void;
}

const categoryIcons = {
  'Emergency Fund': '🚨',
  'Fixed Deposit': '🏦',
  'Mutual Funds': '📈',
  'Savings Account': '💰',
  'PPF': '🛡️',
  'Other': '💼'
};

const categoryColors = {
  'Emergency Fund': 'text-red-400 bg-red-500/10',
  'Fixed Deposit': 'text-blue-400 bg-blue-500/10',
  'Mutual Funds': 'text-green-400 bg-green-500/10',
  'Savings Account': 'text-yellow-400 bg-yellow-500/10',
  'PPF': 'text-purple-400 bg-purple-500/10',
  'Other': 'text-gray-400 bg-gray-500/10'
};

const SavingsCard: React.FC<SavingsCardProps> = ({ account, onEdit, onDelete }) => {
  const categoryColor = categoryColors[account.category];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card group relative overflow-hidden"
    >
      {/* Category badge */}
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColor}`}>
        <span>{categoryIcons[account.category]}</span>
        <span>{account.category}</span>
      </div>

      {/* Account name and amount */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{account.name}</h3>
        <p className="text-2xl font-bold text-green-400">{formatCurrency(account.amount)}</p>
      </div>

      {/* Description */}
      {account.description && (
        <p className="text-white/70 text-sm mb-4 line-clamp-2">{account.description}</p>
      )}

      {/* Dates */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-white/60 text-xs">
          <Calendar className="w-3 h-3" />
          <span>Added: {formatDate(account.dateAdded)}</span>
        </div>
        <div className="flex items-center space-x-2 text-white/60 text-xs">
          <Tag className="w-3 h-3" />
          <span>Updated: {formatDate(account.lastUpdated)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 text-white/60 hover:text-blue-400 transition-colors"
          title="Edit Account"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-white/60 hover:text-red-400 transition-colors"
          title="Delete Account"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-50" />
      <PiggyBank className="absolute bottom-2 right-2 w-6 h-6 text-white/10" />
    </motion.div>
  );
};

export default SavingsCard;

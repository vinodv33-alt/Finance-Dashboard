import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { SavingsAccount, SavingsCategory } from '@/types';
import { X } from 'lucide-react';

interface SavingsFormProps {
  account?: SavingsAccount;
  onSubmit: (data: Omit<SavingsAccount, 'id' | 'dateAdded' | 'lastUpdated'>) => void;
  onCancel: () => void;
  title: string;
}

interface FormData {
  name: string;
  category: SavingsCategory;
  amount: number;
  description: string;
}

const savingsCategories: SavingsCategory[] = [
  'Emergency Fund',
  'Fixed Deposit',
  'Mutual Funds',
  'Savings Account',
  'PPF',
  'Other'
];

const SavingsForm: React.FC<SavingsFormProps> = ({ account, onSubmit, onCancel, title }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: account?.name || '',
      category: account?.category || 'Savings Account',
      amount: account?.amount || 0,
      description: account?.description || ''
    }
  });

  const handleFormSubmit = (data: FormData) => {
    const formattedData = {
      ...data,
      amount: Number(data.amount)
    };
    onSubmit(formattedData);
  };

  // Render the form
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Account Name */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Account Name *
            </label>
            <input
              {...register('name', { required: 'Account name is required' })}
              className="glass-input w-full"
              placeholder="e.g., Emergency Fund, SBI FD"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Category *
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="glass-input w-full"
            >
              {savingsCategories.map(category => (
                <option key={category} value={category} className="bg-slate-800">
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Amount (₹) *
            </label>
            <input
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0, message: 'Amount must be positive' }
              })}
              type="number"
              className="glass-input w-full"
              placeholder="50000"
            />
            {errors.amount && (
              <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              className="glass-input w-full h-20 resize-none"
              placeholder="Additional details about this savings account..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="glass-button flex-1 bg-green-500/20 hover:bg-green-500/30"
            >
              {account ? 'Update Account' : 'Add Account'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="glass-button flex-1 bg-gray-500/20 hover:bg-gray-500/30"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SavingsForm;

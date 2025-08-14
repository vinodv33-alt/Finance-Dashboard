import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Loan, PartPayment } from '@/types';
import { calculateLoanDetails, calculatePartPaymentSavings, formatCurrency } from '@/utils/calculations';
import { X, TrendingDown, Calculator } from 'lucide-react';

interface PartPaymentFormProps {
  loanId: string;
  loan: Loan;
  onSubmit: (data: Omit<PartPayment, 'id'>) => void;
  onCancel: () => void;
}

interface FormData {
  amount: number;
  date: string;
  description: string;
}

const PartPaymentForm: React.FC<PartPaymentFormProps> = ({
  loan,
  onSubmit,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    }
  });

  const watchedAmount = watch('amount');
  const loanDetails = calculateLoanDetails(loan);
  const potentialSavings = watchedAmount > 0
    ? calculatePartPaymentSavings(loan, watchedAmount)
    : 0;

  const handleFormSubmit = (data: FormData) => {
    const partPayment: Omit<PartPayment, 'id'> = {
      amount: data.amount,
      date: new Date(data.date),
      description: data.description || `Part payment of ${formatCurrency(data.amount)}`
    };

    onSubmit(partPayment);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Make Part Payment</h3>
            <p className="text-white/70 text-sm">{loan.name}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Outstanding Principal</p>
            <p className="text-lg font-semibold text-red-400">
              {formatCurrency(loanDetails.remainingPrincipal)}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">Current EMI</p>
            <p className="text-lg font-semibold text-blue-400">
              {formatCurrency(loanDetails.emiAmount)}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 text-sm">EMIs Remaining</p>
            <p className="text-lg font-semibold text-orange-400">
              {loanDetails.remainingEmis}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Part Payment Amount */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Part Payment Amount (₹) *
            </label>
            <input
              {...register('amount', {
                required: 'Part payment amount is required',
                min: { value: 1000, message: 'Minimum part payment is ₹1,000' },
                max: {
                  value: loanDetails.remainingPrincipal,
                  message: `Cannot exceed outstanding principal of ${formatCurrency(loanDetails.remainingPrincipal)}`
                }
              })}
              type="number"
              className="glass-input w-full"
              placeholder="50000"
            />
            {errors.amount && (
              <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Payment Date *
            </label>
            <input
              {...register('date', { required: 'Payment date is required' })}
              type="date"
              className="glass-input w-full"
            />
            {errors.date && (
              <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>
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
              placeholder="Reason for part payment..."
            />
          </div>

          {/* Impact Analysis */}
          {watchedAmount > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Impact Analysis</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-white/70 text-sm">Potential Interest Savings</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(potentialSavings)}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">New Outstanding Balance</p>
                  <p className="text-xl font-bold text-blue-400">
                    {formatCurrency(loanDetails.remainingPrincipal - watchedAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-white/5 rounded-lg">
                <p className="text-white/80 text-sm">
                  💡 This part payment could save you <strong>{formatCurrency(potentialSavings)}</strong> in
                  interest over the loan tenure and help you become debt-free faster!
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="glass-button flex-1 bg-green-500/20 hover:bg-green-500/30"
              disabled={!watchedAmount || watchedAmount < 1000}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Make Part Payment
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

export default PartPaymentForm;

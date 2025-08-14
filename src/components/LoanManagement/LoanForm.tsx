import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Loan } from '@/types';
import { calculateEMI } from '@/utils/calculations';
import { X, Calculator } from 'lucide-react';
import { addMonths } from 'date-fns';

interface LoanFormProps {
  loan?: Loan;
  onSubmit: (data: Omit<Loan, 'id'>) => void;
  onCancel: () => void;
  title: string;
}

interface FormData {
  name: string;
  principalAmount: number;
  interestRate: number;
  tenure: number;
  startDate: string;
  customEmi?: number;
  useCustomEmi: boolean;
}

const LoanForm: React.FC<LoanFormProps> = ({ loan, onSubmit, onCancel, title }) => {
  // Check if the existing loan has a custom EMI (different from calculated EMI)
  const hasCustomEmi = loan ? (() => {
    const calculatedEmi = calculateEMI(loan.principalAmount, Number(loan.interestRate), loan.tenure);
    return Math.abs(Number(loan.emiAmount) - calculatedEmi) > 1; // Allow small rounding differences
  })() : false;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: loan?.name || '',
      principalAmount: Number(loan?.principalAmount) || 0,
      interestRate: Number(loan?.interestRate) || 0,
      tenure: Number(loan?.tenure) || 0,
      startDate: loan?.startDate ? loan.startDate.toISOString().split('T')[0] : '',
      customEmi: loan?.useCustomEmi
        ? (Number(loan?.customEmi ?? loan?.emiAmount) || 0)
        : (Number(loan?.emiAmount) || 0),
      useCustomEmi: loan?.useCustomEmi ?? hasCustomEmi
    }
  });

  const watchedValues = watch(['principalAmount', 'interestRate', 'tenure', 'useCustomEmi', 'customEmi']);
  const [principal, rate, tenure, useCustomEmi, customEmi] = watchedValues;

  // Calculate EMI automatically
  const calculatedEmi = principal && rate && tenure
    ? calculateEMI(principal, rate, tenure)
    : 0;

  const handleFormSubmit = (data: FormData) => {
    const startDate = new Date(data.startDate);

    // Use custom EMI if selected, otherwise use calculated EMI
    const emiAmount = data.useCustomEmi && data.customEmi ? Number(data.customEmi) : calculatedEmi;

    const loanData: Omit<Loan, 'id'> = {
      name: data.name,
      principalAmount: Number(data.principalAmount),
      currentPrincipal: loan ? loan.currentPrincipal : Number(data.principalAmount),
      interestRate: Number(data.interestRate),
      emiAmount: Number(emiAmount),
      // persist custom EMI settings
      useCustomEmi: Boolean(data.useCustomEmi),
      customEmi: data.useCustomEmi ? Number(data.customEmi) || Number(emiAmount) : undefined,
      startDate,
      tenure: Number(data.tenure),
      nextEmiDate: addMonths(startDate, 1),
      isActive: true,
      partPayments: loan?.partPayments || [],
      interestRateChanges: loan?.interestRateChanges || []
    };

    onSubmit(loanData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
          {/* Loan Name */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Loan Name *
            </label>
            <input
              {...register('name', { required: 'Loan name is required' })}
              className="glass-input w-full"
              placeholder="e.g., Home Loan, Car Loan"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Principal Amount */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Principal Amount (₹) *
            </label>
            <input
              {...register('principalAmount', {
                required: 'Principal amount is required',
                min: { value: 1000, message: 'Minimum amount is ₹1,000' }
              })}
              type="number"
              className="glass-input w-full"
              placeholder="1000000"
            />
            {errors.principalAmount && (
              <p className="text-red-400 text-sm mt-1">{errors.principalAmount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interest Rate */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Interest Rate (% p.a.) *
              </label>
              <input
                {...register('interestRate', {
                  required: 'Interest rate is required',
                  min: { value: 0.1, message: 'Minimum rate is 0.1%' },
                  max: { value: 50, message: 'Maximum rate is 50%' }
                })}
                type="number"
                step="0.01"
                className="glass-input w-full"
                placeholder="8.5"
              />
              {errors.interestRate && (
                <p className="text-red-400 text-sm mt-1">{errors.interestRate.message}</p>
              )}
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Tenure (Months) *
              </label>
              <input
                {...register('tenure', {
                  required: 'Tenure is required',
                  min: { value: 1, message: 'Minimum tenure is 1 month' },
                  max: { value: 360, message: 'Maximum tenure is 360 months' }
                })}
                type="number"
                className="glass-input w-full"
                placeholder="240"
              />
              {errors.tenure && (
                <p className="text-red-400 text-sm mt-1">{errors.tenure.message}</p>
              )}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Start Date *
            </label>
            <input
              {...register('startDate', { required: 'Start date is required' })}
              type="date"
              className="glass-input w-full"
            />
            {errors.startDate && (
              <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>
            )}
          </div>

          {/* EMI Calculation */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-5 h-5 text-blue-400" />
              <span className="text-white/90 font-medium">EMI Calculation</span>
            </div>

            {calculatedEmi > 0 && (
              <div className="mb-4">
                <p className="text-white/70 text-sm">Calculated EMI:</p>
                <p className="text-2xl font-bold text-blue-400">
                  ₹{calculatedEmi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            )}

            {/* Show current EMI selection */}
            <div className="mb-4 p-3 bg-white/10 rounded-lg">
              <p className="text-white/70 text-sm">Selected EMI:</p>
              <p className="text-xl font-bold text-green-400">
                ₹{(useCustomEmi ? (Number(customEmi) || calculatedEmi) : calculatedEmi).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="flex items-center space-x-2 mb-3">
              <input
                {...register('useCustomEmi')}
                type="checkbox"
                className="rounded"
              />
              <label className="text-white/90 text-sm">Use custom EMI amount</label>
            </div>

            {useCustomEmi && (
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Custom EMI Amount (₹)
                </label>
                <input
                  {...register('customEmi', {
                    required: useCustomEmi ? 'Custom EMI is required' : false,
                    min: { value: 100, message: 'Minimum EMI is ₹100' }
                  })}
                  type="number"
                  className="glass-input w-full"
                  placeholder={calculatedEmi.toString()}
                />
                {errors.customEmi && (
                  <p className="text-red-400 text-sm mt-1">{errors.customEmi.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="glass-button flex-1 bg-blue-500/20 hover:bg-blue-500/30"
            >
              {loan ? 'Update Loan' : 'Add Loan'}
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

export default LoanForm;

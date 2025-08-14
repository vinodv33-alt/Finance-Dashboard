import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard, useLoans } from '@/hooks/useFinance';
import { formatCurrency, calculateLoanDetails, calculatePartPaymentSavings } from '@/utils/calculations';
import {
  Lightbulb,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Clock,
  Zap
} from 'lucide-react';

const Suggestions: React.FC = () => {
  const { suggestions } = useDashboard();
  const { loans } = useLoans();

  const priorityColors = {
    high: 'border-red-500/30 bg-red-500/10',
    medium: 'border-orange-500/30 bg-orange-500/10',
    low: 'border-green-500/30 bg-green-500/10'
  };

  const priorityIcons = {
    high: AlertTriangle,
    medium: Clock,
    low: CheckCircle
  };

  // Generate detailed loan analysis
  const loanAnalysis = loans
    .filter(loan => loan.isActive)
    .map(loan => {
      const details = calculateLoanDetails(loan);
      const partPaymentSavings = calculatePartPaymentSavings(loan, 100000); // ₹1L part payment

      return {
        loan,
        details,
        partPaymentSavings,
        efficiency: loan.interestRate > 10 ? 'Poor' : loan.interestRate > 7 ? 'Average' : 'Good',
        recommendation: loan.interestRate > 12 ? 'Consider prepayment or refinancing' :
                      loan.interestRate > 8 ? 'Monitor for rate reduction opportunities' :
                      'Maintain current strategy'
      };
    })
    .sort((a, b) => b.loan.interestRate - a.loan.interestRate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Financial Suggestions</h2>
          <p className="text-white/70">
            AI-powered recommendations to optimize your financial portfolio
          </p>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card text-center"
        >
          <Lightbulb className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Total Suggestions</p>
          <p className="text-2xl font-bold text-yellow-400">{suggestions.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card text-center"
        >
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">High Priority</p>
          <p className="text-2xl font-bold text-red-400">
            {suggestions.filter(s => s.priority === 'high').length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card text-center"
        >
          <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Potential Savings</p>
          <p className="text-2xl font-bold text-blue-400">
            {formatCurrency(
              suggestions.reduce((total, s) => total + (s.potentialSavings || 0), 0)
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card text-center"
        >
          <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm">Action Items</p>
          <p className="text-2xl font-bold text-purple-400">
            {suggestions.filter(s => s.type === 'part_payment').length}
          </p>
        </motion.div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <span>Personalized Recommendations</span>
          </h3>

          <div className="space-y-4">
            {suggestions.map((suggestion, index) => {
              const PriorityIcon = priorityIcons[suggestion.priority];

              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`glass-card border ${priorityColors[suggestion.priority]}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${priorityColors[suggestion.priority]}`}>
                      <PriorityIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{suggestion.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          suggestion.priority === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {suggestion.priority.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-white/80 mb-3">{suggestion.description}</p>

                      {suggestion.potentialSavings && (
                        <div className="flex items-center space-x-2 text-green-400">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">
                            Potential savings: {formatCurrency(suggestion.potentialSavings)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card text-center py-12"
        >
          <Lightbulb className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">No Suggestions Available</h3>
          <p className="text-white/50">Add some loans to get personalized financial recommendations</p>
        </motion.div>
      )}

      {/* Loan Analysis */}
      {loanAnalysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <TrendingDown className="w-6 h-6 text-blue-400" />
            <span>Loan Portfolio Analysis</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loanAnalysis.map((analysis, index) => (
              <motion.div
                key={analysis.loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">{analysis.loan.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    analysis.efficiency === 'Good' ? 'bg-green-500/20 text-green-400' :
                    analysis.efficiency === 'Average' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {analysis.efficiency}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Interest Rate:</span>
                    <span className="text-white font-medium">{analysis.loan.interestRate}% p.a.</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Outstanding:</span>
                    <span className="text-red-400 font-medium">
                      {formatCurrency(analysis.details.remainingPrincipal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">EMIs Remaining:</span>
                    <span className="text-orange-400 font-medium">{analysis.details.remainingEmis}</span>
                  </div>

                  {analysis.partPaymentSavings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">₹1L prepayment saves:</span>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(analysis.partPaymentSavings)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-white/80 text-xs">💡 {analysis.recommendation}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* General Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <span>General Financial Tips</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-white font-medium">Emergency Fund Priority</h4>
                <p className="text-white/70 text-sm">Maintain 6-12 months of expenses before aggressive debt repayment.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-white font-medium">High-Interest First</h4>
                <p className="text-white/70 text-sm">Pay off loans with interest rates above 12% first.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-white font-medium">Regular Monitoring</h4>
                <p className="text-white/70 text-sm">Review your financial portfolio monthly on the 5th.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-white font-medium">Refinancing Opportunities</h4>
                <p className="text-white/70 text-sm">Consider refinancing loans with rates above market average.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-white font-medium">Tax Benefits</h4>
                <p className="text-white/70 text-sm">Maximize tax-saving investments before loan prepayments.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="text-white font-medium">Diversified Savings</h4>
                <p className="text-white/70 text-sm">Spread savings across different categories for better returns.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Suggestions;

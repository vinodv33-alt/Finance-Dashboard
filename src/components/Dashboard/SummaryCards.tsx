import React from 'react';
import { motion } from 'framer-motion';
import { DashboardData } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface SummaryCardsProps {
  dashboardData: DashboardData;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ dashboardData }) => {
  const cards = [
    {
      title: 'Total Outstanding Debt',
      value: dashboardData.totalOutstandingDebt,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      trend: null,
    },
    {
      title: 'Total Savings',
      value: dashboardData.totalSavings,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      trend: null,
    },
    {
      title: 'Monthly EMI',
      value: dashboardData.monthlyEmi,
      icon: DollarSign,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      trend: null,
    },
    {
      title: 'Active Loans',
      value: dashboardData.loans.filter(loan => loan.isActive).length,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: null,
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card hover:scale-105 transition-transform duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white/70 text-sm font-medium">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color} mt-2`}>
                {card.isCount ? card.value : formatCurrency(card.value)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;

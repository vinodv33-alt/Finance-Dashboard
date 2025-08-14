export interface Loan {
  id: string;
  name: string;
  principalAmount: number;
  currentPrincipal: number;
  interestRate: number;
  emiAmount: number;
  startDate: Date;
  tenure: number; // in months
  lastEmiDate?: Date;
  nextEmiDate: Date;
  isActive: boolean;
  partPayments: PartPayment[];
  interestRateChanges: InterestRateChange[];
  // Custom EMI support (optional for backward compatibility)
  useCustomEmi?: boolean;
  customEmi?: number;
}

export interface PartPayment {
  id: string;
  amount: number;
  date: Date;
  description?: string;
}

export interface InterestRateChange {
  id: string;
  oldRate: number;
  newRate: number;
  effectiveDate: Date;
  reason?: string;
}

export interface SavingsAccount {
  id: string;
  name: string;
  category: SavingsCategory;
  amount: number;
  dateAdded: Date;
  lastUpdated: Date;
  description?: string;
}

export type SavingsCategory =
  | 'Emergency Fund'
  | 'Fixed Deposit'
  | 'Mutual Funds'
  | 'Savings Account'
  | 'PPF'
  | 'Other';

export interface DashboardData {
  totalOutstandingDebt: number;
  totalSavings: number;
  monthlyEmi: number;
  loans: Loan[];
  savings: SavingsAccount[];
  nextEmiDate: Date;
}

export interface FinancialSuggestion {
  id: string;
  type: 'part_payment' | 'rate_change' | 'savings' | 'general';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  potentialSavings?: number;
  loanId?: string;
}

export interface LoanCalculation {
  emiAmount: number;
  totalInterest: number;
  totalAmount: number;
  remainingEmis: number;
  remainingPrincipal: number;
  nextEmiDate: Date;
}

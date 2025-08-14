import { Loan, LoanCalculation, FinancialSuggestion } from '@/types';
import { addMonths, differenceInMonths, format, startOfMonth } from 'date-fns';

/**
 * Calculate EMI using the standard formula
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): number => {
  const monthlyRate = annualRate / 100 / 12;
  if (tenureMonths <= 0 || principal <= 0 || monthlyRate <= 0) return 0;
  const compound = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * compound) / (compound - 1);
};

// Choose the EMI to use for display/calculation (custom when enabled)
const getSelectedEmi = (loan: Loan): number => {
  if (loan.useCustomEmi && loan.customEmi && loan.customEmi > 0) {
    return Number(loan.customEmi);
  }
  // Use original generated EMI (based on original inputs)
  return calculateEMI(Number(loan.principalAmount), Number(loan.interestRate), Number(loan.tenure));
};

// Count how many EMIs have been paid based on the 5th-of-month schedule
const getEmisPaid = (loan: Loan, today: Date): number => {
  const firstDueBase = new Date(loan.startDate.getFullYear(), loan.startDate.getMonth(), 5);
  const firstDue = loan.startDate.getDate() > 5 ? addMonths(firstDueBase, 1) : firstDueBase;

  // If loan hasn't reached first due date yet
  if (today < firstDue) return 0;

  // Determine last paid anchor (5th). On/after 5th => current month; before 5th => previous month
  const lastPaidAnchor = today.getDate() >= 5
    ? new Date(today.getFullYear(), today.getMonth(), 5)
    : new Date(today.getFullYear(), today.getMonth() - 1, 5);

  const monthsBetween = differenceInMonths(lastPaidAnchor, firstDue);
  const emisPaid = monthsBetween + 1; // include both endpoints
  return Math.max(0, Math.min(emisPaid, Number(loan.tenure)));
};

/**
 * Calculate remaining EMIs and other loan details
 */
export const calculateLoanDetails = (loan: Loan): LoanCalculation => {
  const today = new Date();

  // Scheduled EMIs paid so far
  const emisPaid = getEmisPaid(loan, today);
  const remainingEmis = Math.max(0, Number(loan.tenure) - emisPaid);

  const monthlyRate = Number(loan.interestRate) / 100 / 12;
  const selectedEmi = getSelectedEmi(loan);

  // Start from current principal (already reduced by part-payments via app logic)
  let remainingPrincipal = Math.max(0, Number(loan.currentPrincipal));

  // Reduce principal by already-paid EMIs (principal portion only)
  for (let m = 0; m < emisPaid && remainingPrincipal > 0 && selectedEmi > 0; m++) {
    const interestPortion = remainingPrincipal * monthlyRate;
    const principalPortion = Math.max(0, selectedEmi - interestPortion);
    if (principalPortion <= 0) break; // underpayment safety
    remainingPrincipal = Math.max(0, remainingPrincipal - principalPortion);
  }

  // Next EMI date (5th of current or next month)
  let nextEmiDate = new Date(today.getFullYear(), today.getMonth(), 5);
  if (today.getDate() >= 5) {
    nextEmiDate = addMonths(nextEmiDate, 1);
  }

  // Estimate total future interest from now
  let totalInterest = 0;
  if (remainingPrincipal > 0 && selectedEmi > 0 && remainingEmis > 0) {
    let rp = remainingPrincipal;
    for (let i = 0; i < remainingEmis && rp > 0; i++) {
      const interest = rp * monthlyRate;
      const principalPay = Math.max(0, selectedEmi - interest);
      totalInterest += interest;
      rp = Math.max(0, rp - principalPay);
      if (principalPay <= 0) break;
    }
  }

  const totalAmount = remainingPrincipal + totalInterest;

  return {
    emiAmount: selectedEmi,
    totalInterest: Math.max(0, totalInterest),
    totalAmount: Math.max(0, totalAmount),
    remainingEmis,
    remainingPrincipal: Math.max(0, remainingPrincipal),
    nextEmiDate
  };
};

/**
 * Calculate total outstanding debt across all loans
 */
export const calculateTotalDebt = (loans: Loan[]): number => {
  return loans
    .filter(loan => loan.isActive)
    .reduce((total, loan) => {
      const details = calculateLoanDetails(loan);
      return total + details.remainingPrincipal;
    }, 0);
};

/**
 * Calculate total monthly EMI
 */
export const calculateTotalMonthlyEMI = (loans: Loan[]): number => {
  return loans
    .filter(loan => loan.isActive)
    .reduce((total, loan) => {
      const details = calculateLoanDetails(loan);
      return total + (details.remainingEmis > 0 ? details.emiAmount : 0);
    }, 0);
};

/**
 * Generate financial suggestions based on loan portfolio
 */
export const generateSuggestions = (loans: Loan[]): FinancialSuggestion[] => {
  const suggestions: FinancialSuggestion[] = [];
  const activeLoans = loans.filter(loan => loan.isActive);

  if (activeLoans.length === 0) return suggestions;

  // Sort loans by interest rate (highest first) for part payment suggestions
  const sortedByRate = [...activeLoans].sort((a, b) => Number(b.interestRate) - Number(a.interestRate));

  // Suggest part payment for highest interest rate loan
  if (sortedByRate.length > 0) {
    const highestRateLoan = sortedByRate[0];
    const details = calculateLoanDetails(highestRateLoan);

    if (details.remainingEmis > 12) { // Only suggest if more than 1 year remaining
      const potentialSavings = calculatePartPaymentSavings(highestRateLoan, 50000);

      suggestions.push({
        id: `part-payment-${highestRateLoan.id}`,
        type: 'part_payment',
        title: `Consider Part Payment for ${highestRateLoan.name}`,
        description: `Making a part payment on your highest interest loan (${Number(highestRateLoan.interestRate)}% p.a.) can save significant interest.`,
        priority: 'high',
        potentialSavings,
        loanId: highestRateLoan.id
      });
    }
  }

  // Suggest focusing on shortest tenure high-rate loans
  const shortTermHighRate = activeLoans.filter(loan => {
    const details = calculateLoanDetails(loan);
    return details.remainingEmis <= 24 && Number(loan.interestRate) > 8;
  });

  if (shortTermHighRate.length > 0) {
    suggestions.push({
      id: 'focus-short-term',
      type: 'general',
      title: 'Focus on Short-term High-rate Loans',
      description: 'Consider paying off loans with less than 2 years remaining and high interest rates first.',
      priority: 'medium'
    });
  }

  // Emergency fund suggestion
  suggestions.push({
    id: 'emergency-fund',
    type: 'savings',
    title: 'Maintain Emergency Fund',
    description: 'Ensure you have 6-12 months of expenses saved before aggressive debt repayment.',
    priority: 'high'
    });

  return suggestions;
};

/**
 * Calculate potential savings from part payment
 */
export const calculatePartPaymentSavings = (loan: Loan, partPaymentAmount: number): number => {
  const currentDetails = calculateLoanDetails(loan);

  if (currentDetails.remainingPrincipal <= partPaymentAmount) {
    return currentDetails.totalInterest;
  }

  const newPrincipal = currentDetails.remainingPrincipal - partPaymentAmount;
  const newEMI = getSelectedEmi(loan, newPrincipal, currentDetails.remainingEmis);

  // Simulate new total interest with same remaining months
  const monthlyRate = Number(loan.interestRate) / 100 / 12;
  let rp = newPrincipal;
  let totalInterest = 0;
  for (let i = 0; i < currentDetails.remainingEmis && rp > 0; i++) {
    const interest = rp * monthlyRate;
    const principalPay = Math.max(0, newEMI - interest);
    totalInterest += interest;
    rp = Math.max(0, rp - principalPay);
    if (principalPay <= 0) break;
  }

  return Math.max(0, currentDetails.totalInterest - totalInterest);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return format(date, 'dd MMM yyyy');
};

/**
 * Check if dashboard should auto-refresh (5th of every month)
 */
export const shouldAutoRefresh = (): boolean => {
  const today = new Date();
  const lastRefresh = localStorage.getItem('lastDashboardRefresh');

  if (!lastRefresh) return true;

  const lastRefreshDate = new Date(lastRefresh);
  const currentMonth = startOfMonth(today);
  const lastRefreshMonth = startOfMonth(lastRefreshDate);

  return currentMonth > lastRefreshMonth && today.getDate() >= 5;
};

/**
 * Calculate monthly loan projection data for charts
 */
export const calculateLoanProjection = (loan: Loan): {
  month: number;
  principalPayment: number;
  interestPayment: number;
  remainingPrincipal: number;
}[] => {
  const details = calculateLoanDetails(loan);
  const monthlyRate = Number(loan.interestRate) / 100 / 12;
  let remainingPrincipal = details.remainingPrincipal;
  const projection = [] as { month: number; principalPayment: number; interestPayment: number; remainingPrincipal: number; }[];

  for (let month = 1; month <= Math.min(details.remainingEmis, 60); month++) { // Show max 5 years
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = Math.max(0, details.emiAmount - interestPayment);
    remainingPrincipal = Math.max(0, remainingPrincipal - principalPayment);

    projection.push({
      month,
      principalPayment,
      interestPayment,
      remainingPrincipal
    });

    if (remainingPrincipal <= 0) break;
  }

  return projection;
};

/**
 * Get combined projection data for all active loans
 */
export const getCombinedLoanProjection = (loans: Loan[]): {
  month: number;
  totalPrincipalPayment: number;
  totalInterestPayment: number;
  totalRemainingPrincipal: number;
}[] => {
  const activeLoans = loans.filter(loan => loan.isActive);
  const maxMonths = 60; // 5 years
  const combinedData = [] as { month: number; totalPrincipalPayment: number; totalInterestPayment: number; totalRemainingPrincipal: number; }[];

  for (let month = 1; month <= maxMonths; month++) {
    let totalPrincipalPayment = 0;
    let totalInterestPayment = 0;
    let totalRemainingPrincipal = 0;

    activeLoans.forEach(loan => {
      const projection = calculateLoanProjection(loan);
      const monthData = projection.find(p => p.month === month);

      if (monthData) {
        totalPrincipalPayment += monthData.principalPayment;
        totalInterestPayment += monthData.interestPayment;
        totalRemainingPrincipal += monthData.remainingPrincipal;
      }
    });

    if (totalRemainingPrincipal <= 0 && month > 1) break;

    combinedData.push({
      month,
      totalPrincipalPayment,
      totalInterestPayment,
      totalRemainingPrincipal
    });
  }

  return combinedData;
};

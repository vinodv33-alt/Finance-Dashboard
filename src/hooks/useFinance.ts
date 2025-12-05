import { useState, useEffect, useCallback } from 'react';
import { Loan, SavingsAccount, DashboardData, FinancialSuggestion } from '@/types';
import { storage, autoRefresh } from '@/utils/storage';
import {
  calculateTotalDebt,
  calculateTotalMonthlyEMI,
  generateSuggestions,
  calculateLoanDetails,
  calculateEMI,
  simulateRemainingEmis
} from '@/utils/calculations';

/**
 * Custom hook for managing loan data
 */
export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLoans = () => {
      try {
        const storedLoans = storage.getLoans();
        setLoans(storedLoans);
      } catch (error) {
        console.error('Error loading loans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, []);

  const addLoan = useCallback((loan: Loan) => {
    const updatedLoans = [...loans, loan];
    setLoans(updatedLoans);
    storage.saveLoans(updatedLoans);
  }, [loans]);

  const updateLoan = useCallback((loanId: string, updates: Partial<Loan>) => {
    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        // Merge updates
        const merged: Loan = { ...loan, ...updates } as Loan;

        // Normalize numeric fields
        merged.principalAmount = Number(merged.principalAmount) || 0;
        merged.currentPrincipal = merged.currentPrincipal != null ? Number(merged.currentPrincipal) : Number(merged.principalAmount) || 0;
        merged.interestRate = Number(merged.interestRate) || 0;
        merged.tenure = merged.tenure != null ? Number(merged.tenure) : 0;
        merged.emiAmount = merged.emiAmount != null ? Number(merged.emiAmount) : 0;

        // If principalAmount was edited and currentPrincipal wasn't explicitly provided in updates,
        // assume user updated the outstanding to the new principal amount.
        if (updates.principalAmount != null && updates.currentPrincipal == null) {
          merged.currentPrincipal = Number(updates.principalAmount) || merged.currentPrincipal || 0;
        }

        // Determine whether the user provided specific fields so we can decide what to recompute.
        const editedPrincipal = updates.principalAmount != null;
        const editedEmi = updates.emiAmount != null || updates.customEmi != null || updates.useCustomEmi != null;
        const editedRate = updates.interestRate != null;
        const editedTenure = updates.tenure != null;

        // Respect custom EMI preference if set; prefer explicit customEmi when useCustomEmi true
        let selectedEmi = 0;
        if (merged.useCustomEmi) {
          if (merged.customEmi && Number(merged.customEmi) > 0) {
            selectedEmi = Number(merged.customEmi);
          } else if (merged.emiAmount && Number(merged.emiAmount) > 0) {
            selectedEmi = Number(merged.emiAmount);
          }
        } else {
          // If EMI was edited explicitly use that
          if (editedEmi && merged.emiAmount && Number(merged.emiAmount) > 0) {
            selectedEmi = Number(merged.emiAmount);
          }
        }

        const principalForCalc = Number(merged.currentPrincipal || merged.principalAmount || 0);
        const annualRate = Number(merged.interestRate || 0);

        // Recompute EMI in these cases:
        // - Interest rate changed and user isn't forcing a custom EMI
        // - Tenure was changed (user expects EMI to reflect tenure)
        // - No explicit EMI provided but tenure exists
        if (!merged.useCustomEmi) {
          if (editedRate || editedTenure || (!selectedEmi && merged.tenure > 0)) {
            if (merged.tenure > 0) {
              selectedEmi = calculateEMI(principalForCalc, annualRate, merged.tenure);
            }
          }
        }

        // If still no selectedEmi but merged.emiAmount exists, use it
        if (!selectedEmi && merged.emiAmount && Number(merged.emiAmount) > 0) {
          selectedEmi = Number(merged.emiAmount);
        }

        // If user explicitly edited EMI (e.g., via form), prefer that value and, if using custom, persist it
        if (editedEmi) {
          if (merged.useCustomEmi && merged.customEmi) {
            selectedEmi = Number(merged.customEmi);
          } else if (merged.emiAmount) {
            selectedEmi = Number(merged.emiAmount);
          }
        }

        // Finalize selected EMI
        merged.emiAmount = Number(selectedEmi || 0);
        if (merged.useCustomEmi && merged.customEmi) {
          merged.customEmi = Number(merged.customEmi);
        } else {
          merged.customEmi = undefined;
        }

        // Recompute remaining EMIs (tenure) based on current outstanding, selected EMI and interest rate
        const remaining = simulateRemainingEmis(principalForCalc, Number(merged.emiAmount || 0), annualRate);
        if (remaining > 0) {
          merged.tenure = Number(remaining);
        } else {
          // If remaining could not be computed (e.g., EMI too low), keep existing tenure if present
          merged.tenure = merged.tenure || 0;
        }

        return merged;
      }
      return loan;
    });

    setLoans(updatedLoans);
    storage.saveLoans(updatedLoans);
  }, [loans]);

  const deleteLoan = useCallback((loanId: string) => {
    const updatedLoans = loans.filter(loan => loan.id !== loanId);
    setLoans(updatedLoans);
    storage.saveLoans(updatedLoans);
  }, [loans]);

  const addPartPayment = useCallback((loanId: string, partPayment: any) => {
    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        const amt = Number(partPayment?.amount) || 0;
        // Use amortized outstanding as baseline
        const details = calculateLoanDetails(loan);
        const baselineOutstanding = Number(details.remainingPrincipal) || Number(loan.currentPrincipal) || 0;
        return {
          ...loan,
          partPayments: [...loan.partPayments, { ...partPayment, amount: amt }],
          currentPrincipal: Math.max(0, baselineOutstanding - amt)
        };
      }
      return loan;
    });
    setLoans(updatedLoans);
    storage.saveLoans(updatedLoans);
  }, [loans]);

  const removeLastPartPayment = useCallback((loanId: string) => {
    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        if (loan.partPayments.length === 0) return loan;
        const last = loan.partPayments[loan.partPayments.length - 1];
        const amt = Number(last?.amount) || 0;
        const restored = Number(loan.currentPrincipal) + amt;
        const capped = Math.min(restored, Number(loan.principalAmount));
        return {
          ...loan,
          partPayments: loan.partPayments.slice(0, -1),
          currentPrincipal: capped
        };
      }
      return loan;
    });
    setLoans(updatedLoans);
    storage.saveLoans(updatedLoans);
  }, [loans]);

  const reorderLoans = useCallback((fromId: string, toId: string | null) => {
    const fromIndex = loans.findIndex(l => l.id === fromId);
    if (fromIndex === -1) return;
    const newLoans = [...loans];
    const [item] = newLoans.splice(fromIndex, 1);
    if (!toId) {
      // move to end
      newLoans.push(item);
    } else {
      const toIndex = newLoans.findIndex(l => l.id === toId);
      if (toIndex === -1) {
        newLoans.push(item);
      } else {
        newLoans.splice(toIndex, 0, item);
      }
    }
    setLoans(newLoans);
    storage.saveLoans(newLoans);
  }, [loans]);

  return {
    loans,
    loading,
    addLoan,
    updateLoan,
    deleteLoan,
    addPartPayment,
    removeLastPartPayment,
    reorderLoans
  };
};

/**
 * Custom hook for managing savings data
 */
export const useSavings = () => {
  const [savings, setSavings] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavings = () => {
      try {
        const storedSavings = storage.getSavings();
        setSavings(storedSavings);
      } catch (error) {
        console.error('Error loading savings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavings();
  }, []);

  const addSavingsAccount = useCallback((account: SavingsAccount) => {
    const updatedSavings = [...savings, account];
    setSavings(updatedSavings);
    storage.saveSavings(updatedSavings);
  }, [savings]);

  const updateSavingsAccount = useCallback((accountId: string, updates: Partial<SavingsAccount>) => {
    const updatedSavings = savings.map(account =>
      account.id === accountId ? { ...account, ...updates } : account
    );
    setSavings(updatedSavings);
    storage.saveSavings(updatedSavings);
  }, [savings]);

  const deleteSavingsAccount = useCallback((accountId: string) => {
    const updatedSavings = savings.filter(account => account.id !== accountId);
    setSavings(updatedSavings);
    storage.saveSavings(updatedSavings);
  }, [savings]);

  const totalSavings = savings.reduce((total, account) => total + account.amount, 0);

  return {
    savings,
    totalSavings,
    loading,
    addSavingsAccount,
    updateSavingsAccount,
    deleteSavingsAccount
  };
};

/**
 * Custom hook for dashboard data and auto-refresh
 */
export const useDashboard = () => {
  const { loans, addPartPayment, removeLastPartPayment, reorderLoans } = useLoans();
  const { savings, totalSavings } = useSavings();
  const [suggestions, setSuggestions] = useState<FinancialSuggestion[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Determine next EMI date as the earliest among active loans
  const activeLoans = loans.filter(l => l.isActive);
  const nextEmiDate = activeLoans.length
    ? activeLoans
        .map(l => calculateLoanDetails(l).nextEmiDate)
        .sort((a, b) => a.getTime() - b.getTime())[0]
    : new Date(new Date().getFullYear(), new Date().getMonth(), 5);

  const dashboardData: DashboardData = {
    totalOutstandingDebt: calculateTotalDebt(loans),
    totalSavings,
    monthlyEmi: calculateTotalMonthlyEMI(loans),
    loans,
    savings,
    nextEmiDate
  };

  useEffect(() => {
    // Generate suggestions when loans change
    const newSuggestions = generateSuggestions(loans);
    setSuggestions(newSuggestions);
  }, [loans]);

  useEffect(() => {
    // Check for auto-refresh
    const shouldRefresh = autoRefresh.checkAndRefresh();
    if (shouldRefresh) {
      setLastRefresh(new Date());
      // Trigger any refresh logic here
    }

    const storedLastRefresh = storage.getLastRefresh();
    setLastRefresh(storedLastRefresh);
  }, []);

  return {
    dashboardData,
    suggestions,
    lastRefresh,
    addPartPayment,
    removeLastPartPayment,
    reorderLoans
  };
};

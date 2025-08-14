import { useState, useEffect, useCallback } from 'react';
import { Loan, SavingsAccount, DashboardData, FinancialSuggestion } from '@/types';
import { storage, autoRefresh } from '@/utils/storage';
import {
  calculateTotalDebt,
  calculateTotalMonthlyEMI,
  generateSuggestions,
  calculateLoanDetails
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
        const updatedLoan = { ...loan, ...updates };
        return updatedLoan;
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
        return {
          ...loan,
          partPayments: [...loan.partPayments, partPayment],
          currentPrincipal: loan.currentPrincipal - partPayment.amount
        };
      }
      return loan;
    });
    setLoans(updatedLoans);
    storage.saveLoans(updatedLoans);
  }, [loans]);

  return {
    loans,
    loading,
    addLoan,
    updateLoan,
    deleteLoan,
    addPartPayment
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
  const { loans } = useLoans();
  const { savings, totalSavings } = useSavings();
  const [suggestions, setSuggestions] = useState<FinancialSuggestion[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const dashboardData: DashboardData = {
    totalOutstandingDebt: calculateTotalDebt(loans),
    totalSavings,
    monthlyEmi: calculateTotalMonthlyEMI(loans),
    loans,
    savings,
    nextEmiDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5)
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
    lastRefresh
  };
};

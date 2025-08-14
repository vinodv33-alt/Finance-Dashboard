import { Loan, SavingsAccount, DashboardData } from '@/types';

const STORAGE_KEYS = {
  LOANS: 'finance_dashboard_loans',
  SAVINGS: 'finance_dashboard_savings',
  LAST_REFRESH: 'lastDashboardRefresh'
};

/**
 * Local storage utilities for data persistence
 */
export const storage = {
  // Loan operations
  getLoans: (): Loan[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOANS);
      if (!stored) return [];

      const loans = JSON.parse(stored);
      return loans.map((loan: any) => {
        const normalizedPartPayments = Array.isArray(loan.partPayments)
          ? loan.partPayments.map((pp: any) => ({
              ...pp,
              amount: Number(pp?.amount) || 0,
              date: new Date(pp.date)
            }))
          : [];

        const normalizedInterestRateChanges = Array.isArray(loan.interestRateChanges)
          ? loan.interestRateChanges.map((irc: any) => ({
              ...irc,
              oldRate: Number(irc?.oldRate) || 0,
              newRate: Number(irc?.newRate) || 0,
              effectiveDate: new Date(irc.effectiveDate)
            }))
          : [];

        return {
          ...loan,
          principalAmount: Number(loan?.principalAmount) || 0,
          currentPrincipal: Number(loan?.currentPrincipal) || 0,
          interestRate: Number(loan?.interestRate) || 0,
          emiAmount: Number(loan?.emiAmount) || 0,
          tenure: Number(loan?.tenure) || 0,
          customEmi: loan?.customEmi != null ? Number(loan.customEmi) : undefined,
          startDate: new Date(loan.startDate),
          nextEmiDate: new Date(loan.nextEmiDate),
          lastEmiDate: loan.lastEmiDate ? new Date(loan.lastEmiDate) : undefined,
          partPayments: normalizedPartPayments,
          interestRateChanges: normalizedInterestRateChanges
        } as Loan;
      });
    } catch (error) {
      console.error('Error loading loans:', error);
      return [];
    }
  },

  saveLoans: (loans: Loan[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    } catch (error) {
      console.error('Error saving loans:', error);
    }
  },

  // Savings operations
  getSavings: (): SavingsAccount[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVINGS);
      if (!stored) return [];

      const savings = JSON.parse(stored);
      return savings.map((account: any) => ({
        ...account,
        amount: Number(account?.amount) || 0,
        dateAdded: new Date(account.dateAdded),
        lastUpdated: new Date(account.lastUpdated)
      }));
    } catch (error) {
      console.error('Error loading savings:', error);
      return [];
    }
  },

  saveSavings: (savings: SavingsAccount[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savings));
    } catch (error) {
      console.error('Error saving savings:', error);
    }
  },

  // Auto-refresh tracking
  getLastRefresh: (): Date | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_REFRESH);
      return stored ? new Date(stored) : null;
    } catch (error) {
      return null;
    }
  },

  setLastRefresh: (date: Date): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_REFRESH, date.toISOString());
    } catch (error) {
      console.error('Error saving last refresh date:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Export all data
  exportData: (): string => {
    const loans = storage.getLoans();
    const savings = storage.getSavings();
    const lastRefresh = storage.getLastRefresh();

    const exportData = {
      loans,
      savings,
      lastRefresh,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  },

  // Import data from JSON string
  importData: (jsonData: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (!data.loans || !data.savings) {
        return { success: false, message: 'Invalid data format' };
      }

      // Clear existing data
      storage.clearAll();

      // Import loans
      if (Array.isArray(data.loans)) {
        // Normalize before saving
        const normalized = data.loans.map((loan: any) => ({
          ...loan,
          principalAmount: Number(loan?.principalAmount) || 0,
          currentPrincipal: Number(loan?.currentPrincipal) || 0,
          interestRate: Number(loan?.interestRate) || 0,
          emiAmount: Number(loan?.emiAmount) || 0,
          tenure: Number(loan?.tenure) || 0,
          customEmi: loan?.customEmi != null ? Number(loan.customEmi) : undefined,
          partPayments: Array.isArray(loan.partPayments)
            ? loan.partPayments.map((pp: any) => ({ ...pp, amount: Number(pp?.amount) || 0 }))
            : []
        }));
        storage.saveLoans(normalized);
      }

      // Import savings
      if (Array.isArray(data.savings)) {
        const normalizedSavings = data.savings.map((s: any) => ({
          ...s,
          amount: Number(s?.amount) || 0
        }));
        storage.saveSavings(normalizedSavings);
      }

      // Import last refresh
      if (data.lastRefresh) {
        storage.setLastRefresh(new Date(data.lastRefresh));
      }

      return { success: true, message: 'Data imported successfully!' };
    } catch (error) {
      return { success: false, message: 'Failed to import data. Please check the file format.' };
    }
  }
};

/**
 * Auto-refresh functionality
 */
export const autoRefresh = {
  checkAndRefresh: (): boolean => {
    const today = new Date();
    const lastRefresh = storage.getLastRefresh();

    // Auto-refresh on 5th of every month
    if (today.getDate() === 5) {
      if (!lastRefresh || lastRefresh.getMonth() !== today.getMonth()) {
        storage.setLastRefresh(today);
        return true;
      }
    }

    return false;
  },

  scheduleNextRefresh: (): Date => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 5);
    return nextMonth;
  }
};

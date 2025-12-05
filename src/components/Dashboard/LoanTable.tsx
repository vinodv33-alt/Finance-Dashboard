import React from 'react';
import { motion } from 'framer-motion';
import { Loan } from '@/types';
import { calculateLoanDetails, formatCurrency, formatDate } from '@/utils/calculations';
import { Edit, Trash2, DollarSign, TrendingDown, RotateCcw } from 'lucide-react';

interface LoanTableProps {
  loans: Loan[];
  onEdit?: (loan: Loan) => void;
  onDelete?: (loanId: string) => void;
  onPartPayment?: (loan: Loan) => void;
  onUndoLastPartPayment?: (loan: Loan) => void;
  onSelect?: (loanId: string | null) => void;
  selectedLoanId?: string | null;
  showActions?: boolean;
  onReorder?: (fromId: string, toId: string | null) => void;
}

const LoanTable: React.FC<LoanTableProps> = ({
  loans,
  onEdit,
  onDelete,
  onPartPayment,
  onUndoLastPartPayment,
  onSelect,
  selectedLoanId = null,
  showActions = false,
  onReorder
}) => {
  const activeLoans = loans.filter(loan => loan.isActive);

  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [hoverId, setHoverId] = React.useState<string | null>(null);

  if (activeLoans.length === 0) {
    return (
      <div className="glass-card text-center py-12">
        <DollarSign className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white/70 mb-2">No Active Loans</h3>
        <p className="text-white/50">Add your first loan to get started with tracking</p>
      </div>
    );
  }

  const getRowIdFromEvent = (e: React.DragEvent | React.DragEvent<HTMLTableRowElement>) => {
    let el = e.target as HTMLElement | null;
    while (el && el.tagName !== 'TR') {
      el = el.parentElement;
    }
    return el ? el.getAttribute('data-loan-id') : null;
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Loan Details</h3>
        <span className="text-white/70 text-sm">
          {activeLoans.length} active loan{activeLoans.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-6 text-white/90 font-semibold">Loan Name</th>
              <th className="text-right py-4 px-6 text-white/90 font-semibold">Principal Amount</th>
              <th className="text-right py-4 px-6 text-white/90 font-semibold">Interest Rate</th>
              <th className="text-right py-4 px-6 text-white/90 font-semibold">EMI Amount</th>
              <th className="text-right py-4 px-6 text-white/90 font-semibold">EMIs Remaining</th>
              <th className="text-right py-4 px-6 text-white/90 font-semibold">Next EMI Date</th>
              <th className="text-right py-4 px-6 text-white/90 font-semibold">Outstanding</th>
              {showActions && (
                <th className="text-center py-4 px-6 text-white/90 font-semibold">Actions</th>
              )}
            </tr>
          </thead>
          <tbody
            onDragOver={(e) => {
              // Allow dropping to move to end of list
              e.preventDefault();
            }}
            onDrop={(e) => {
              // Drop on tbody -> move to end
              e.preventDefault();
              const fromId = e.dataTransfer.getData('text/plain');
              if (fromId && onReorder) {
                onReorder(fromId, null);
              }
              setDraggingId(null);
              setHoverId(null);
            }}
          >
            {activeLoans.map((loan, index) => {
              const details = calculateLoanDetails(loan);
              const isSelected = selectedLoanId === loan.id;
              const isDragging = draggingId === loan.id;
              const isHover = hoverId === loan.id && draggingId !== loan.id;
              return (
                <motion.tr
                  key={loan.id}
                  data-loan-id={loan.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', loan.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggingId(loan.id);
                    setHoverId(null);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setHoverId(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    const overId = getRowIdFromEvent(e);
                    if (overId && overId !== draggingId) {
                      setHoverId(overId);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromId = e.dataTransfer.getData('text/plain');
                    const toId = getRowIdFromEvent(e) || null;
                    if (fromId && onReorder) {
                      // If dropped on itself, no-op
                      if (fromId !== toId) onReorder(fromId, toId);
                    }
                    setDraggingId(null);
                    setHoverId(null);
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${isSelected ? 'bg-white/10 ring-1 ring-purple-400/40' : ''} ${isDragging ? 'opacity-50' : ''} ${isHover ? 'bg-white/8' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onSelect?.(loan.id); }}
                >
                  <td className="py-4 px-6">
                    <div>
                      <span className="text-white font-medium">{loan.name}</span>
                      {loan.partPayments.length > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          {loan.partPayments.length} part payment{loan.partPayments.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right text-white/80">
                    {formatCurrency(loan.principalAmount)}
                  </td>
                  <td className="py-4 px-6 text-right text-white/80">
                    {Number(loan.interestRate).toFixed(2)}%
                  </td>
                  <td className="py-4 px-6 text-right text-white/80">
                    {formatCurrency(details.emiAmount)}
                  </td>
                  <td className="py-4 px-6 text-right text-white/80">
                    <span className={`${details.remainingEmis <= 12 ? 'text-orange-400' : 'text-white/80'}`}>
                      {details.remainingEmis}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-white/80">
                    {formatDate(details.nextEmiDate)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-red-400 font-semibold">
                      {formatCurrency(details.remainingPrincipal)}
                    </span>
                  </td>
                  {showActions && (
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        {onEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit?.(loan); }}
                            className="p-2 text-white/60 hover:text-blue-400 transition-colors"
                            title="Edit Loan"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onPartPayment && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onPartPayment?.(loan); }}
                            className="p-2 text-white/60 hover:text-green-400 transition-colors"
                            title="Make Part Payment"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>
                        )}
                        {onUndoLastPartPayment && loan.partPayments.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onUndoLastPartPayment?.(loan); }}
                            className="p-2 text-white/60 hover:text-yellow-400 transition-colors"
                            title="Undo Last Part Payment"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(loan.id); }}
                            className="p-2 text-white/60 hover:text-red-400 transition-colors"
                            title="Delete Loan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary row */}
      <div className="border-t border-white/10 mt-4 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-white/70 font-medium">Total Outstanding Debt:</span>
          <span className="text-xl font-bold text-red-400">
            {formatCurrency(
              activeLoans.reduce((total, loan) => {
                const d = calculateLoanDetails(loan);
                return total + d.remainingPrincipal;
              }, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoanTable;

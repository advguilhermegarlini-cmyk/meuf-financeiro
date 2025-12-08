import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, X, ArrowRightLeft } from 'lucide-react';

interface FloatingActionButtonProps {
  onExpenseClick: () => void;
  onIncomeClick: () => void;
  onTransferClick?: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onExpenseClick, onIncomeClick, onTransferClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Modal de Transações Rápidas */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-github-bg rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 border border-github-border animate-in zoom-in-95 slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-github-text">Nova Transação</h2>
              <button 
                onClick={handleClose}
                className="text-github-muted hover:text-github-text transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Botão Despesa */}
              <button
                onClick={() => {
                  onExpenseClick();
                  handleClose();
                }}
                className="w-full p-4 rounded-lg bg-github-surface border-2 border-github-danger hover:bg-github-danger/10 transition-all flex items-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-github-danger/20 flex items-center justify-center group-hover:bg-github-danger/30 transition-colors">
                  <ArrowDownCircle size={24} className="text-github-danger" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-github-text">Despesa</p>
                  <p className="text-xs text-github-muted">Registrar gasto</p>
                </div>
              </button>

              {/* Botão Receita */}
              <button
                onClick={() => {
                  onIncomeClick();
                  handleClose();
                }}
                className="w-full p-4 rounded-lg bg-github-surface border-2 border-github-success hover:bg-github-success/10 transition-all flex items-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-github-success/20 flex items-center justify-center group-hover:bg-github-success/30 transition-colors">
                  <ArrowUpCircle size={24} className="text-github-success" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-github-text">Receita</p>
                  <p className="text-xs text-github-muted">Registrar entrada</p>
                </div>
              </button>

              {/* Botão Transferência */}
              {onTransferClick && (
                <button
                  onClick={() => {
                    onTransferClick();
                    handleClose();
                  }}
                  className="w-full p-4 rounded-lg bg-github-surface border-2 border-github-primary hover:bg-github-primary/10 transition-all flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-github-primary/20 flex items-center justify-center group-hover:bg-github-primary/30 transition-colors">
                    <ArrowRightLeft size={24} className="text-github-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-github-text">Transferência</p>
                    <p className="text-xs text-github-muted">Mover entre contas</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botão Principal Flutuante */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all transform ${
            isOpen 
              ? 'bg-github-surface text-github-text scale-110' 
              : 'bg-gradient-to-br from-github-success to-github-danger hover:shadow-2xl hover:scale-110 text-white'
          }`}
          title={isOpen ? "Fechar" : "Nova Transação"}
        >
          {isOpen ? (
            <X size={28} />
          ) : (
            <div className="flex items-center justify-center">
              <div className="text-2xl font-bold">+</div>
            </div>
          )}
        </button>
      </div>
    </>
  );
};

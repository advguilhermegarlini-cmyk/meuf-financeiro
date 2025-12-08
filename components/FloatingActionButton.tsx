import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';

interface FloatingActionButtonProps {
  onExpenseClick: () => void;
  onIncomeClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onExpenseClick, onIncomeClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Buttons que aparecem quando expandido */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 animate-in fade-in zoom-in-75">
          {/* Botão Receita (Verde) */}
          <button
            onClick={() => {
              onIncomeClick();
              setIsOpen(false);
            }}
            className="w-14 h-14 rounded-full bg-github-success hover:bg-green-600 text-white shadow-lg flex items-center justify-center transition-all transform hover:scale-110 group relative"
            title="Nova Receita"
          >
            <ArrowUpCircle size={24} />
            <span className="absolute right-full mr-3 bg-github-surface text-github-text text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Receita
            </span>
          </button>

          {/* Botão Despesa (Vermelho) */}
          <button
            onClick={() => {
              onExpenseClick();
              setIsOpen(false);
            }}
            className="w-14 h-14 rounded-full bg-github-danger hover:bg-red-600 text-white shadow-lg flex items-center justify-center transition-all transform hover:scale-110 group relative"
            title="Nova Despesa"
          >
            <ArrowDownCircle size={24} />
            <span className="absolute right-full mr-3 bg-github-surface text-github-text text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Despesa
            </span>
          </button>
        </div>
      )}

      {/* Botão Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all transform ${
          isOpen 
            ? 'bg-github-surface text-github-text' 
            : 'bg-gradient-to-br from-github-success to-github-danger hover:shadow-2xl hover:scale-110 text-white'
        }`}
        title={isOpen ? "Fechar" : "Nova Transação"}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <div className="flex items-center justify-center">
            <div className="text-xl font-bold">+</div>
          </div>
        )}
      </button>
    </div>
  );
};

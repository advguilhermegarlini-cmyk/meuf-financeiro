import React, { useState, useEffect } from 'react';
import { useApp, SYSTEM_CATEGORY_ID } from '../context';
import { Card, Button } from './Layout';
import { X, Plus } from 'lucide-react';
import { TransactionType, Transaction } from '../types';

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense' | 'transfer';
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({ isOpen, onClose, initialType = 'expense' }) => {
  const { transactions, categories, banks, addTransaction, addCategory, addBank } = useApp();
  const [tab, setTab] = useState<'income' | 'expense' | 'transfer'>(initialType);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    bankId: '',
    toBankId: '',
    installments: 1,
    isRecurring: false,
    frequency: 'monthly',
    recurrenceTimes: 12
  });

  const [showQuickAddCategory, setShowQuickAddCategory] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [showQuickAddBank, setShowQuickAddBank] = useState(false);
  const [quickBankName, setQuickBankName] = useState('');
  const [quickBankType, setQuickBankType] = useState<'checking' | 'savings' | 'credit'>('checking');

  useEffect(() => {
    if (initialType) {
      setTab(initialType);
    }
  }, [initialType, isOpen]);

  const visibleCategories = categories.filter(c => {
    if (tab === 'transfer') return false;
    if (tab === 'income') return c.type === 'income';
    if (tab === 'expense') return c.type === 'expense';
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const selectedBank = banks.find(b => b.id === formData.bankId);
  const showInstallments = tab === 'expense' && selectedBank?.type === 'credit';

  const handleQuickAddCategory = async () => {
    if (!quickCategoryName.trim()) return;
    try {
      await addCategory(quickCategoryName, tab === 'income' ? 'income' : 'expense');
      setQuickCategoryName('');
      setShowQuickAddCategory(false);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria. Tente novamente.');
    }
  };

  const handleQuickAddBank = async () => {
    if (!quickBankName.trim()) return;
    try {
      await addBank({
        name: quickBankName,
        type: quickBankType,
        balance: 0
      });
      setQuickBankName('');
      setQuickBankType('checking');
      setShowQuickAddBank(false);
    } catch (error) {
      console.error('Erro ao criar banco:', error);
      alert('Erro ao criar banco. Tente novamente.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.bankId || isSaving) return;

    const bank = banks.find(b => b.id === formData.bankId);
    const isCredit = bank?.type === 'credit';
    const category = categories.find(c => c.id === formData.categoryId);

    let finalDescription = formData.description.trim();
    if (!finalDescription) {
      if (tab === 'transfer') {
        finalDescription = 'Transferência';
      } else if (category) {
        finalDescription = category.name;
      } else {
        finalDescription = 'Sem descrição';
      }
    }

    const payload = {
      description: finalDescription,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
      type: tab as TransactionType,
      categoryId: tab === 'transfer' ? SYSTEM_CATEGORY_ID : formData.categoryId,
      bankId: formData.bankId,
      toBankId: tab === 'transfer' ? formData.toBankId : undefined,
      isCreditCard: isCredit,
      isReconciled: !isCredit,
      installments: isCredit && tab === 'expense' ? formData.installments : 1
    };

    setIsSaving(true);
    try {
      const recurrence = formData.isRecurring ? {
        frequency: formData.frequency,
        times: formData.recurrenceTimes
      } : undefined;

      await addTransaction(payload, recurrence);
      
      // Reset e fecha
      setFormData({
        description: '', amount: '', date: new Date().toISOString().split('T')[0],
        categoryId: '', bankId: '', toBankId: '', installments: 1,
        isRecurring: false, frequency: 'monthly', recurrenceTimes: 12
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-github-border bg-github-surface shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-github-surface pb-3 sm:pb-4 border-b border-github-border">
          <h3 className="text-base sm:text-lg font-semibold text-github-text">Nova Transação</h3>
          <button 
            onClick={onClose}
            className="text-github-muted hover:text-github-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
          {/* Tabs */}
          <div className="flex bg-github-bg rounded p-1 border border-github-border w-full gap-1 sm:gap-0">
            <button 
              type="button"
              onClick={() => { setTab('expense'); setFormData(prev => ({...prev, categoryId: ''})); }} 
              className={`flex-1 px-2 sm:px-3 py-2 sm:py-1 rounded text-xs sm:text-sm transition-colors ${tab === 'expense' ? 'bg-github-danger text-white' : 'text-github-muted hover:text-github-text'}`}
            >
              Despesa
            </button>
            <button 
              type="button"
              onClick={() => { setTab('income'); setFormData(prev => ({...prev, categoryId: ''})); }} 
              className={`flex-1 px-2 sm:px-3 py-2 sm:py-1 rounded text-xs sm:text-sm transition-colors ${tab === 'income' ? 'bg-github-success text-white' : 'text-github-muted hover:text-github-text'}`}
            >
              Receita
            </button>
            <button 
              type="button"
              onClick={() => { setTab('transfer'); setFormData(prev => ({...prev, categoryId: ''})); }} 
              className={`flex-1 px-2 sm:px-3 py-2 sm:py-1 rounded text-xs sm:text-sm transition-colors ${tab === 'transfer' ? 'bg-github-primary text-white' : 'text-github-muted hover:text-github-text'}`}
            >
              Transferência
            </button>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs sm:text-sm text-github-muted block mb-1">Descrição (Opcional)</label>
            <input 
              className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text focus:border-github-primary outline-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder={tab === 'transfer' ? 'Ex: Transferência para Investimento' : 'Vazio = Nome da Categoria'}
            />
          </div>

          {/* Valor */}
          <div>
            <label className="text-xs sm:text-sm text-github-muted block mb-1">Valor (R$)</label>
            <input 
              required type="number" step="0.01" min="0.01"
              className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text focus:border-github-primary outline-none"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          {/* Categoria e Banco */}
          {tab !== 'transfer' ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-1 gap-2">
                  <label className="text-xs sm:text-sm text-github-muted">Categoria ({tab === 'income' ? 'Receita' : 'Despesa'})</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCategory(true)}
                    className="text-xs text-github-primary hover:text-github-success transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus size={14} /> Criar
                  </button>
                </div>
                <select 
                  required
                  className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text outline-none"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {visibleCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 gap-2">
                  <label className="text-xs sm:text-sm text-github-muted">Conta / Cartão</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddBank(true)}
                    className="text-xs text-github-primary hover:text-github-success transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus size={14} /> Criar
                  </button>
                </div>
                <select 
                  required
                  className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text outline-none"
                  value={formData.bankId}
                  onChange={e => setFormData({...formData, bankId: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {banks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type === 'credit' ? 'Crédito' : 'Conta'})</option>)}
                </select>
              </div>
              {showInstallments && (
                <div>
                  <label className="text-xs sm:text-sm text-github-muted block mb-1">Parcelamento</label>
                  <select
                    className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text outline-none"
                    value={String(formData.installments)}
                    onChange={e => setFormData({...formData, installments: parseInt(e.target.value || '1', 10)})}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                      <option key={n} value={n}>{n}x</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <div className="flex justify-between items-center mb-1 gap-2">
                  <label className="text-xs sm:text-sm text-github-muted">De (Origem)</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddBank(true)}
                    className="text-xs text-github-primary hover:text-github-success transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus size={14} /> Criar
                  </button>
                </div>
                <select 
                  required
                  className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text outline-none"
                  value={formData.bankId}
                  onChange={e => setFormData({...formData, bankId: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {banks.filter(b => b.type !== 'credit').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 gap-2">
                  <label className="text-xs sm:text-sm text-github-muted">Para (Destino)</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddBank(true)}
                    className="text-xs text-github-primary hover:text-github-success transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus size={14} /> Criar
                  </button>
                </div>
                <select 
                  required
                  className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text outline-none"
                  value={formData.toBankId}
                  onChange={e => setFormData({...formData, toBankId: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {banks.filter(b => b.id !== formData.bankId && b.type !== 'credit').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Data */}
          <div>
            <label className="text-xs sm:text-sm text-github-muted block mb-1">Data</label>
            <input 
              type="date" required
              className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text outline-none"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 sm:gap-3 justify-end border-t border-github-border pt-4 mt-6 sticky bottom-0 bg-github-surface">
            <Button type="button" onClick={onClose} variant="secondary" className="min-w-fit" disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="min-w-fit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>

        {/* Modal Quick Add Category */}
        {showQuickAddCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-github-border bg-github-surface shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-github-text">Criar Nova Categoria</h3>
                <button 
                  onClick={() => setShowQuickAddCategory(false)}
                  className="text-github-muted hover:text-github-text flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleQuickAddCategory(); }} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="text-xs sm:text-sm text-github-muted block mb-2">Nome da Categoria</label>
                  <input
                    autoFocus
                    type="text"
                    className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text focus:border-github-primary outline-none"
                    placeholder="Ex: Alimentação, Transporte..."
                    value={quickCategoryName}
                    onChange={(e) => setQuickCategoryName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 sm:gap-3 justify-end">
                  <Button 
                    type="button"
                    onClick={() => setShowQuickAddCategory(false)} 
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={!quickCategoryName.trim()}
                  >
                    Criar
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal Quick Add Bank */}
        {showQuickAddBank && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-github-border bg-github-surface shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-github-text">Criar Nova Conta/Cartão</h3>
                <button 
                  onClick={() => setShowQuickAddBank(false)}
                  className="text-github-muted hover:text-github-text flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleQuickAddBank(); }} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="text-xs sm:text-sm text-github-muted block mb-2">Nome</label>
                  <input
                    autoFocus
                    type="text"
                    className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text focus:border-github-primary outline-none"
                    placeholder="Ex: Banco do Brasil, Nubank..."
                    value={quickBankName}
                    onChange={(e) => setQuickBankName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-github-muted block mb-2">Tipo</label>
                  <select
                    className="w-full bg-github-bg border border-github-border rounded-lg p-2 sm:p-3 text-sm sm:text-base text-github-text outline-none"
                    value={quickBankType}
                    onChange={(e) => setQuickBankType(e.target.value as 'checking' | 'savings' | 'credit')}
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Conta Poupança</option>
                    <option value="credit">Cartão de Crédito</option>
                  </select>
                </div>
                <div className="flex gap-2 sm:gap-3 justify-end">
                  <Button 
                    type="button"
                    onClick={() => setShowQuickAddBank(false)} 
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={!quickBankName.trim()}
                  >
                    Criar
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};

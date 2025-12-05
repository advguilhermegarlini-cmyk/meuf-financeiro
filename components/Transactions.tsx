
import React, { useState, useEffect } from 'react';
import { useApp, SYSTEM_CATEGORY_ID } from '../context';
import { Card, Button } from './Layout';
import { formatCurrency, formatDate } from '../utils';
import { Plus, Filter, Trash2, Search, ArrowRightLeft, CreditCard, Pencil, ChevronLeft, ChevronRight, Repeat, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { TransactionType, Transaction } from '../types';

export const Transactions = () => {
  const { transactions, categories, banks, addTransaction, deleteTransaction, updateTransaction, payInvoice, getInvoiceStats, getBankBalanceAtDate } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showPayInvoice, setShowPayInvoice] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  // Date Filtering
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');

  // Form States
  const [tab, setTab] = useState<'income'|'expense'|'transfer'>('expense');
  const [editingId, setEditingId] = useState<string|null>(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    bankId: '',
    toBankId: '',
    installments: 1,
    // Recurrence fields
    isRecurring: false,
    frequency: 'monthly',
    recurrenceTimes: 12
  });

  // Invoice Payment State
  const [invoiceForm, setInvoiceForm] = useState({
    cardId: '',
    amount: '',
    sourceBankId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'full' as 'full' | 'partial',
    calculatedTotal: 0
  });

  const [deleteModal, setDeleteModal] = useState<{show: boolean, txId: string, isSeries: boolean}>({show: false, txId: '', isSeries: false});

  // Auto-calculate invoice amount when card/date changes in modal
  useEffect(() => {
    if (showPayInvoice && invoiceForm.cardId) {
        // Use the date selected in the modal, or default to current date
        const payDate = new Date(invoiceForm.date);
        const stats = getInvoiceStats(invoiceForm.cardId, payDate);
        
        // Update the form with the Calculated Total
        setInvoiceForm(prev => ({
            ...prev,
            calculatedTotal: stats.total,
            // If type is full, enforce amount = total
            amount: prev.type === 'full' ? stats.total.toFixed(2) : prev.amount
        }));
    }
  }, [showPayInvoice, invoiceForm.cardId, invoiceForm.date, invoiceForm.type]);


  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month] = e.target.value.split('-');
      const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      setSelectedDate(newDate);
    }
  };

  const handleEdit = (t: Transaction) => {
      setEditingId(t.id);
      setFormData({
          description: t.description,
          amount: t.amount.toString(),
          date: t.date.split('T')[0],
          categoryId: t.categoryId === SYSTEM_CATEGORY_ID ? '' : t.categoryId,
          bankId: t.bankId,
          toBankId: t.toBankId || '',
          installments: t.installments || 1,
          isRecurring: false, 
          frequency: 'monthly',
          recurrenceTimes: 12
      });
      setTab(t.type as any);
      setShowEdit(true);
      setShowForm(false);
  }

  const handleDeleteRequest = (t: Transaction) => {
      if (t.recurrenceGroupId) {
          setDeleteModal({ show: true, txId: t.id, isSeries: true });
      } else {
          if (window.confirm('Excluir esta transação?')) {
              deleteTransaction(t.id);
          }
      }
  }

  const confirmDeleteSeries = (deleteFuture: boolean) => {
      deleteTransaction(deleteModal.txId, deleteFuture);
      setDeleteModal({ show: false, txId: '', isSeries: false });
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.bankId) return;
    
    const bank = banks.find(b => b.id === formData.bankId);
    const isCredit = bank?.type === 'credit';
    const category = categories.find(c => c.id === formData.categoryId);

    // Handle optional description
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

    if (showEdit && editingId) {
        updateTransaction({ ...payload, id: editingId, installmentNumber: 1, isReconciled: false });
        setShowEdit(false);
        setEditingId(null);
    } else {
        const recurrence = formData.isRecurring ? {
            frequency: formData.frequency,
            times: formData.recurrenceTimes
        } : undefined;

        addTransaction(payload, recurrence);
        setShowForm(false);
    }
    
    // Reset
    setFormData({
        description: '', amount: '', date: new Date().toISOString().split('T')[0],
        categoryId: '', bankId: '', toBankId: '', installments: 1,
        isRecurring: false, frequency: 'monthly', recurrenceTimes: 12
    });
  };

  const handlePayInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.cardId || !invoiceForm.amount || !invoiceForm.sourceBankId) return;
    
    const isFull = invoiceForm.type === 'full';
    
    payInvoice(
        invoiceForm.cardId, 
        parseFloat(invoiceForm.amount), 
        new Date(invoiceForm.date), 
        invoiceForm.sourceBankId,
        isFull
    );
    setShowPayInvoice(false);
  };

  const filtered = transactions.filter(t => {
    const tDate = new Date(t.date);
    const matchMonth = tDate.getUTCMonth() === selectedDate.getMonth() &&
                       tDate.getUTCFullYear() === selectedDate.getFullYear();

    const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType && matchMonth;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const visibleCategories = categories.filter(c => {
      if (tab === 'transfer') return false; 
      if (tab === 'income') return c.type === 'income';
      if (tab === 'expense') return c.type === 'expense';
      return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-github-text">Transações</h2>
        
        {/* Date Selector */}
        <div className="flex items-center bg-github-surface border border-github-border rounded-lg p-1 order-2 md:order-none">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-github-border rounded-md text-github-muted hover:text-github-text transition-colors">
            <ChevronLeft size={20} />
          </button>
          
          <div className="relative px-4 text-center group cursor-pointer">
             <span className="text-sm font-medium capitalize block w-32 text-github-text">
                {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
             </span>
             <input 
               type="month" 
               className="absolute inset-0 opacity-0 cursor-pointer"
               onChange={handleDateChange}
               value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
             />
          </div>

          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-github-border rounded-md text-github-muted hover:text-github-text transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex gap-2 order-3 md:order-none">
            <Button onClick={() => setShowPayInvoice(!showPayInvoice)} variant="secondary" className="flex items-center space-x-2">
                <CreditCard size={18} />
                <span>Pagar Fatura</span>
            </Button>
            <Button onClick={() => { setShowForm(!showForm); setShowEdit(false); }} variant="primary" className="flex items-center space-x-2">
                <Plus size={18} />
                <span>Nova Transação</span>
            </Button>
        </div>
      </div>

      {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="max-w-md p-6 border-github-danger">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-github-danger">
                      <AlertTriangle size={24} /> Excluir Recorrência
                  </h3>
                  <p className="text-github-muted mb-4">Esta transação faz parte de uma série recorrente.</p>
                  <div className="flex flex-col gap-2">
                      <Button onClick={() => confirmDeleteSeries(false)} variant="secondary">Excluir apenas esta</Button>
                      <Button onClick={() => confirmDeleteSeries(true)} variant="danger">Excluir esta e futuras</Button>
                      <Button onClick={() => setDeleteModal({show:false, txId:'', isSeries:false})} variant="ghost">Cancelar</Button>
                  </div>
              </Card>
          </div>
      )}

      {/* Invoice Payment Modal */}
      {showPayInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <Card className="w-full max-w-lg p-6 border-github-warning border shadow-2xl relative">
              <button onClick={() => setShowPayInvoice(false)} className="absolute top-4 right-4 text-github-muted hover:text-github-text">
                  <span className="text-xl">&times;</span>
              </button>
              
              <h3 className="text-lg font-semibold mb-6 text-github-warning flex items-center gap-2">
                  <CreditCard /> Pagamento de Fatura
              </h3>
              
              <form onSubmit={handlePayInvoice} className="space-y-4">
                  {/* Card Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-github-muted">Cartão</label>
                        <select 
                            required className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none"
                            value={invoiceForm.cardId}
                            onChange={e => setInvoiceForm(prev => ({...prev, cardId: e.target.value}))}
                        >
                            <option value="">Selecione o Cartão...</option>
                            {banks.filter(b => b.type === 'credit').map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-github-muted">Mês da Fatura</label>
                        <input 
                            type="date" required
                            className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none"
                            value={invoiceForm.date}
                            onChange={e => setInvoiceForm({...invoiceForm, date: e.target.value})}
                        />
                    </div>
                  </div>
                  
                  {/* Info Box */}
                  <div className="bg-github-surface p-4 rounded border border-github-border flex justify-between items-center">
                       <div>
                           <p className="text-xs text-github-muted">Valor em Aberto (Restante)</p>
                           <p className="text-xl font-bold font-mono text-github-text">
                               {formatCurrency(invoiceForm.calculatedTotal)}
                           </p>
                       </div>
                       {invoiceForm.calculatedTotal <= 0 && (
                           <span className="flex items-center gap-1 text-github-success text-sm font-medium px-2 py-1 bg-github-success/10 rounded">
                               <CheckCircle size={14}/> Fatura Paga
                           </span>
                       )}
                  </div>

                  {/* Payment Type Toggle */}
                  <div className="space-y-2">
                      <label className="text-xs text-github-muted block">Tipo de Pagamento</label>
                      <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                  type="radio" 
                                  checked={invoiceForm.type === 'full'}
                                  onChange={() => setInvoiceForm(prev => ({...prev, type: 'full'}))}
                                  className="text-github-primary focus:ring-github-primary"
                              />
                              <span className="text-sm text-github-text">Valor Total</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                  type="radio" 
                                  checked={invoiceForm.type === 'partial'}
                                  onChange={() => setInvoiceForm(prev => ({...prev, type: 'partial'}))}
                                  className="text-github-primary focus:ring-github-primary"
                              />
                              <span className="text-sm text-github-text">Outro Valor (Parcial)</span>
                          </label>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-xs text-github-muted">Conta de Pagamento</label>
                        <select 
                            required className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none"
                            value={invoiceForm.sourceBankId}
                            onChange={e => setInvoiceForm({...invoiceForm, sourceBankId: e.target.value})}
                        >
                            <option value="">Selecione a Conta...</option>
                            {banks.filter(b => b.type !== 'credit').map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({formatCurrency(getBankBalanceAtDate(b.id, new Date()))})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-github-muted">Valor a Pagar</label>
                        <input 
                            required type="number" step="0.01"
                            disabled={invoiceForm.type === 'full'}
                            className={`w-full border rounded p-2 text-github-text outline-none ${
                                invoiceForm.type === 'full' 
                                ? 'bg-github-surface border-github-border text-github-muted cursor-not-allowed' 
                                : 'bg-github-bg border-github-primary'
                            }`}
                            value={invoiceForm.amount}
                            onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                        />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-github-border">
                      <Button onClick={() => setShowPayInvoice(false)} variant="secondary">Cancelar</Button>
                      <Button type="submit" variant="primary" disabled={invoiceForm.calculatedTotal <= 0 && invoiceForm.type === 'full'}>
                          Confirmar Pagamento
                      </Button>
                  </div>
              </form>
          </Card>
          </div>
      )}

      {/* Transaction Form (Add/Edit) */}
      {(showForm || showEdit) && (
        <Card className="p-6 border-github-primary border animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-github-text">{showEdit ? 'Editar Transação' : 'Nova Transação'}</h3>
            <div className="flex bg-github-bg rounded p-1 border border-github-border">
                <button onClick={() => { setTab('expense'); setFormData(prev => ({...prev, categoryId: ''})); }} className={`px-3 py-1 rounded text-sm ${tab === 'expense' ? 'bg-github-danger text-white' : 'text-github-muted hover:text-github-text'}`}>Despesa</button>
                <button onClick={() => { setTab('income'); setFormData(prev => ({...prev, categoryId: ''})); }} className={`px-3 py-1 rounded text-sm ${tab === 'income' ? 'bg-github-success text-white' : 'text-github-muted hover:text-github-text'}`}>Receita</button>
                <button onClick={() => { setTab('transfer'); setFormData(prev => ({...prev, categoryId: ''})); }} className={`px-3 py-1 rounded text-sm ${tab === 'transfer' ? 'bg-github-primary text-white' : 'text-github-muted hover:text-github-text'}`}>Transferência</button>
            </div>
          </div>
          
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-github-muted">Descrição (Opcional)</label>
              <input 
                className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text focus:border-github-primary outline-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder={tab === 'transfer' ? 'Ex: Transferência para Investimento' : 'Vazio = Nome da Categoria'}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-github-muted">Valor (R$)</label>
              <input 
                required type="number" step="0.01" min="0.01"
                className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text focus:border-github-primary outline-none"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>

            {/* Account Selection */}
            {tab !== 'transfer' ? (
                <>
                    <div className="space-y-1">
                    <label className="text-xs text-github-muted">Categoria ({tab === 'income' ? 'Receita' : 'Despesa'})</label>
                    <select 
                        required
                        className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none"
                        value={formData.categoryId}
                        onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {visibleCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    </div>

                    <div className="space-y-1">
                    <label className="text-xs text-github-muted">Conta / Cartão</label>
                    <select 
                        required
                        className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none"
                        value={formData.bankId}
                        onChange={e => setFormData({...formData, bankId: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {banks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type === 'credit' ? 'Crédito' : 'Conta'})</option>)}
                    </select>
                    </div>
                </>
            ) : (
                <>
                    <div className="space-y-1">
                    <label className="text-xs text-github-muted">De (Origem)</label>
                    <select 
                        required
                        className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none"
                        value={formData.bankId}
                        onChange={e => setFormData({...formData, bankId: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {banks.filter(b => b.type !== 'credit').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    </div>
                    <div className="space-y-1">
                    <label className="text-xs text-github-muted">Para (Destino)</label>
                    <select 
                        required
                        className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none"
                        value={formData.toBankId}
                        onChange={e => setFormData({...formData, toBankId: e.target.value})}
                    >
                        <option value="">Selecione...</option>
                        {banks.filter(b => b.id !== formData.bankId && b.type !== 'credit').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    </div>
                </>
            )}

            <div className="space-y-1">
              <label className="text-xs text-github-muted">Data</label>
              <input 
                type="date" required
                className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            {/* Installments Input (Only for Credit Card Expenses) */}
            {tab === 'expense' && banks.find(b => b.id === formData.bankId)?.type === 'credit' && !showEdit && !formData.isRecurring && (
                <div className="space-y-1">
                    <label className="text-xs text-github-muted">Parcelas</label>
                    <select 
                        className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none"
                        value={formData.installments}
                        onChange={e => setFormData({...formData, installments: parseInt(e.target.value)})}
                    >
                        <option value={1}>À vista (1x)</option>
                        {[...Array(11)].map((_, i) => (
                            <option key={i+2} value={i+2}>{i+2}x</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Recurrence Toggle (Not for Credit Cards) */}
            {!showEdit && tab !== 'transfer' && !(banks.find(b => b.id === formData.bankId)?.type === 'credit') && (
                <div className="md:col-span-2 border-t border-github-border pt-3 mt-1">
                    <div className="flex items-center gap-2 mb-3">
                        <input 
                            type="checkbox" id="isRecurring" 
                            checked={formData.isRecurring} 
                            onChange={e => setFormData({...formData, isRecurring: e.target.checked})}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isRecurring" className="text-sm font-medium text-github-text cursor-pointer flex items-center gap-1">
                            <Repeat size={14} /> Repetir lançamento
                        </label>
                    </div>

                    {formData.isRecurring && (
                        <div className="flex gap-4 animate-in fade-in">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs text-github-muted">Frequência</label>
                                <select 
                                    className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none text-sm"
                                    value={formData.frequency}
                                    onChange={e => setFormData({...formData, frequency: e.target.value})}
                                >
                                    <option value="daily">Diário</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensal</option>
                                    <option value="yearly">Anual</option>
                                </select>
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-xs text-github-muted">Repetir (vezes)</label>
                                <input 
                                    type="number" min="2" max="60"
                                    className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none text-sm"
                                    value={formData.recurrenceTimes}
                                    onChange={e => setFormData({...formData, recurrenceTimes: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <Button onClick={() => { setShowForm(false); setShowEdit(false); setEditingId(null); }} variant="secondary">Cancelar</Button>
              <Button type="submit" variant="primary">Salvar</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-github-muted" size={16} />
          <input 
            placeholder="Buscar transações..." 
            className="w-full pl-9 pr-4 py-2 bg-github-surface border border-github-border rounded-md text-sm outline-none focus:border-github-primary text-github-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-github-surface border border-github-border rounded-md px-4 py-2 text-sm outline-none text-github-text"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="all">Todos os Tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
          <option value="transfer">Transferências</option>
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-github-bg text-github-muted uppercase border-b border-github-border">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Conta / Origem</th>
                <th className="px-6 py-3 text-right">Valor</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-github-border">
              {filtered.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                const bank = banks.find(b => b.id === t.bankId);
                const toBank = banks.find(b => b.id === t.toBankId);
                const isExp = t.type === 'expense';
                
                return (
                  <tr key={t.id} className="hover:bg-github-bg/50 group">
                    <td className="px-6 py-4 whitespace-nowrap text-github-muted">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-6 py-4 font-medium text-github-text">
                      <div className="flex items-center gap-2">
                        {t.description}
                        {t.recurrenceGroupId && (
                          <span title="Recorrente">
                            <Repeat size={12} className="text-github-primary" />
                          </span>
                        )}
                      </div>
                      {t.isCreditCard && !t.isReconciled && t.type === 'expense' && <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded border border-github-warning text-github-warning">Fatura</span>}
                      {t.type === 'income' && t.isCreditCard && <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded border border-github-success text-github-success">Pgto Fatura</span>}
                      {t.installments && t.installments > 1 && (
                          <span className="ml-2 text-xs text-github-muted">({t.installmentNumber}/{t.installments})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-github-text">
                      {t.categoryId === SYSTEM_CATEGORY_ID ? (
                         <div className="flex items-center gap-2 text-github-muted">
                             <Settings size={14} /> Sistema / Ajuste
                         </div>
                      ) : t.type === 'transfer' ? (
                          <div className="flex items-center gap-2 text-github-muted">
                              <ArrowRightLeft size={14} /> Transferência
                          </div>
                      ) : (
                        <div className="flex items-center gap-2">
                            {cat ? (
                                <>
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                {cat.name}
                                </>
                            ) : (
                                <span className="text-github-muted italic">Sem categoria</span>
                            )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-github-muted">
                        {bank?.name} {t.type === 'transfer' && toBank && <span> → {toBank.name}</span>}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-medium ${
                        t.type === 'transfer' ? 'text-github-text' : 
                        isExp ? 'text-github-danger' : 'text-github-success'
                    }`}>
                      {t.type === 'transfer' ? '' : (isExp ? '-' : '+')}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                        <button 
                            onClick={() => handleEdit(t)}
                            className="text-github-muted hover:text-github-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Editar"
                        >
                            <Pencil size={16} />
                        </button>
                        <button 
                            onClick={() => handleDeleteRequest(t)}
                            className="text-github-muted hover:text-github-danger opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Excluir"
                        >
                            <Trash2 size={16} />
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-github-muted">
            Nenhuma transação encontrada para este mês.
          </div>
        )}
      </Card>
    </div>
  );
};

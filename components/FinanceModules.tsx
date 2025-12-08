
import React, { useState } from 'react';
import { useApp } from '../context';
import { Card, Button } from './Layout';
import { formatCurrency, GITHUB_COLORS } from '../utils';
import { Wallet, Plus, Trash2, Pencil, Calendar, TrendingUp, PiggyBank, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock, Eye, EyeOff, CreditCard, Lock } from 'lucide-react';
import { Bank, Category, Investment } from '../types';

// --- Credit Card Invoice View ---
const InvoiceCard: React.FC<{ card: Bank }> = ({ card }) => {
    const { updateBank, deleteBank, getInvoiceStats } = useApp();
    const [viewDate, setViewDate] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ 
        name: card.name, 
        limit: card.limit || 0, 
        closing: card.creditCardClosingDay || 1, 
        due: card.creditCardDueDay || 10,
        color: card.color || '#111'
    });

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    // Use Centralized Invoice Logic
    const stats = getInvoiceStats(card.id, viewDate);
    const invoiceItems = stats.items;

    const statusConfig = {
        open: { label: 'Aberta', color: 'text-github-primary', icon: Clock },
        closed: { label: 'Fechada', color: 'text-github-warning', icon: Lock },
        paid: { label: 'Paga', color: 'text-github-success', icon: CheckCircle },
        overdue: { label: 'Vencida', color: 'text-github-danger', icon: AlertCircle },
        future: { label: 'Futura', color: 'text-github-muted', icon: Calendar }
    };

    const currentStatus = statusConfig[stats.status];

    const handleUpdate = () => {
        updateBank({
            ...card,
            name: editForm.name,
            limit: editForm.limit,
            creditCardClosingDay: editForm.closing,
            creditCardDueDay: editForm.due,
            color: editForm.color
        });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if(window.confirm('Tem certeza? O cartão será removido, mas o histórico de transações permanece.')) {
            deleteBank(card.id);
        }
    };

    if (isEditing) {
        return (
            <Card className="p-4 border-github-primary border h-full">
                <div className="space-y-3">
                    <h3 className="font-bold text-github-text">Editar Cartão</h3>
                    <div className="flex gap-2 items-center">
                         <input 
                            type="color" 
                            value={editForm.color} 
                            onChange={e => setEditForm({...editForm, color: e.target.value})} 
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                         />
                         <input className="flex-1 bg-github-bg border border-github-border rounded p-2 text-sm text-github-text outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Nome" />
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] text-github-muted">Fechamento</label>
                            <input type="number" className="w-full bg-github-bg border border-github-border rounded p-2 text-sm text-github-text outline-none" value={editForm.closing} onChange={e => setEditForm({...editForm, closing: parseInt(e.target.value)})} />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-github-muted">Vencimento</label>
                            <input type="number" className="w-full bg-github-bg border border-github-border rounded p-2 text-sm text-github-text outline-none" value={editForm.due} onChange={e => setEditForm({...editForm, due: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                         <label className="text-[10px] text-github-muted">Limite</label>
                         <input type="number" className="w-full bg-github-bg border border-github-border rounded p-2 text-sm text-github-text outline-none" value={editForm.limit} onChange={e => setEditForm({...editForm, limit: parseFloat(e.target.value)})} />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button onClick={() => setIsEditing(false)} variant="secondary" className="text-xs">Cancelar</Button>
                        <Button onClick={handleUpdate} variant="primary" className="text-xs">Salvar</Button>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col h-[420px]" style={{ borderTop: `4px solid ${card.color || '#333'}` }}>
            <div className="p-4 border-b border-github-border flex justify-between items-center bg-github-surface/30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: card.color || '#333' }}>
                        <CreditCard size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-github-text text-sm leading-tight flex items-center gap-2">
                            {card.name}
                        </h3>
                        <p className="text-[10px] text-github-muted">Fecha dia {card.creditCardClosingDay} • Vence dia {card.creditCardDueDay}</p>
                    </div>
                </div>
                
                <div className="flex gap-1">
                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-github-muted hover:text-github-text hover:bg-github-bg rounded transition-colors"><Pencil size={14}/></button>
                    <button onClick={handleDelete} className="p-1.5 text-github-muted hover:text-github-danger hover:bg-github-bg rounded transition-colors"><Trash2 size={14}/></button>
                </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2 bg-github-bg border-b border-github-border">
                 <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-github-surface rounded text-github-muted hover:text-github-text"><ChevronLeft size={18}/></button>
                 <div className="text-center">
                    <span className="text-sm font-semibold text-github-text block capitalize">
                        {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className={`text-[10px] font-medium flex items-center justify-center gap-1 ${currentStatus.color}`}>
                        <currentStatus.icon size={10} /> {currentStatus.label}
                    </span>
                 </div>
                 <button onClick={() => changeMonth(1)} className="p-1 hover:bg-github-surface rounded text-github-muted hover:text-github-text"><ChevronRight size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-github-bg/30">
                {invoiceItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-github-muted opacity-50">
                        <Calendar size={32} className="mb-2" />
                        <p className="text-xs">Sem lançamentos</p>
                    </div>
                ) : (
                    invoiceItems.map(t => (
                        <div key={t.id} className="flex justify-between items-center p-2 hover:bg-github-surface rounded text-xs group border-b border-github-border/40 last:border-0 transition-colors">
                            <div className="flex-1 min-w-0 pr-2">
                                <p className={`truncate font-medium ${t.isReconciled ? 'text-github-muted line-through' : 'text-github-text'}`}>
                                    {t.description}
                                </p>
                                <p className="text-[10px] text-github-muted">
                                    {new Date(t.date).toLocaleDateString('pt-BR')} 
                                    {t.installments && t.installments > 1 && ` • ${t.installmentNumber}/${t.installments}`}
                                </p>
                            </div>
                            <span className={`font-mono ${t.isReconciled ? 'text-github-muted' : 'text-github-text'}`}>
                                {formatCurrency(t.amount)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-github-border bg-github-surface/50 mt-auto">
                <div className="flex justify-between items-end">
                    <div className="text-xs text-github-muted">
                        <p>Limite: {formatCurrency(card.limit || 0)}</p>
                        <p className="mt-0.5">Disp: {formatCurrency((card.limit || 0) - stats.total)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-github-muted uppercase tracking-wider mb-0.5">Total da Fatura</p>
                        <p className="text-lg font-bold font-mono text-github-text">
                            {formatCurrency(stats.total)}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export const CreditCardsModule = () => {
  const { banks, addBank } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
      name: '', 
      limit: 0, 
      closing: 1, 
      due: 10, 
      color: '#0969da' 
  });

  const creditCards = banks.filter(b => b.type === 'credit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBank({
        name: formData.name,
        type: 'credit',
        balance: 0,
        color: formData.color,
        creditCardClosingDay: formData.closing,
        creditCardDueDay: formData.due,
        limit: Number(formData.limit)
    });
    setShowForm(false);
    setFormData({ name: '', limit: 0, closing: 1, due: 10, color: '#0969da' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-github-text">Faturas de Cartão</h2>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
            <Plus size={18} className="mr-2 inline" /> Novo Cartão
        </Button>
      </div>

      {showForm && (
          <Card className="p-6 border-github-primary border mb-6 animate-in slide-in-from-top-2">
              <h3 className="font-bold mb-4 text-github-text">Novo Cartão</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex gap-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-github-muted">Cor</label>
                        <input 
                            type="color" 
                            value={formData.color} 
                            onChange={e => setFormData({...formData, color: e.target.value})} 
                            className="h-10 w-12 bg-transparent border border-github-border rounded cursor-pointer p-0"
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-github-muted">Nome</label>
                        <input required placeholder="Ex: Nubank, Inter..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none" />
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-github-muted">Limite Total</label>
                        <input required type="number" placeholder="R$ 0,00" value={formData.limit} onChange={e => setFormData({...formData, limit: parseFloat(e.target.value)})} className="bg-github-bg border border-github-border rounded p-2 text-github-text outline-none" />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-github-muted">Dia Fechamento</label>
                        <input type="number" min="1" max="31" value={formData.closing} onChange={e => setFormData({...formData, closing: parseInt(e.target.value)})} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-github-muted">Dia Vencimento</label>
                        <input type="number" min="1" max="31" value={formData.due} onChange={e => setFormData({...formData, due: parseInt(e.target.value)})} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none" />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                      <Button onClick={() => setShowForm(false)} variant="secondary">Cancelar</Button>
                      <Button type="submit" variant="primary">Salvar</Button>
                  </div>
              </form>
          </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map(card => (
            <InvoiceCard key={card.id} card={card} />
        ))}
      </div>
      
      {creditCards.length === 0 && !showForm && (
        <div className="text-center p-12 bg-github-surface rounded-lg border border-github-border border-dashed">
          <CreditCard size={48} className="mx-auto text-github-muted mb-4 opacity-50" />
          <p className="text-github-muted">Nenhum cartão cadastrado.</p>
        </div>
      )}
    </div>
  );
};

export const BanksModule = () => {
  const { banks, addBank, updateBank, deleteBank, getBankBalanceAtDate } = useApp();
  const [bankForm, setBankForm] = useState({ 
      id: '', 
      name: '', 
      type: 'checking', 
      balance: '0', 
      color: '#0969da', 
      isActive: true 
  });
  const [showBankForm, setShowBankForm] = useState(false);
  const [today] = useState(new Date());
  
  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: bankForm.name,
      type: bankForm.type as any,
      balance: parseFloat(bankForm.balance),
      color: bankForm.color,
      isActive: bankForm.isActive
    };

    if (bankForm.id) {
        const existing = banks.find(b => b.id === bankForm.id);
        if (existing) updateBank({ ...existing, ...payload });
    } else {
        addBank(payload);
    }
    setShowBankForm(false);
    resetForm();
  };

  const resetForm = () => {
      setBankForm({ id: '', name: '', type: 'checking', balance: '0', color: '#0969da', isActive: true });
  }

  const startEditBank = (b: Bank) => {
      setBankForm({
          id: b.id, 
          name: b.name, 
          type: b.type, 
          balance: b.balance.toString(), 
          color: b.color,
          isActive: b.isActive !== false
      });
      setShowBankForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-github-text">Minhas Contas</h2>
        <Button onClick={() => { resetForm(); setShowBankForm(!showBankForm); }} variant="primary" className="flex items-center gap-2">
          <Plus size={18} /> Nova Conta
        </Button>
      </div>

      {showBankForm && (
        <Card className="p-6 mb-6 border-github-primary border max-w-xl animate-in slide-in-from-top-2">
          <h3 className="font-bold text-github-text mb-4">{bankForm.id ? 'Editar Conta' : 'Nova Conta'}</h3>
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div className="flex gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-github-muted">Cor</label>
                    <div className="relative w-12 h-10 overflow-hidden rounded border border-github-border">
                        <input 
                            type="color" 
                            value={bankForm.color} 
                            onChange={e => setBankForm({...bankForm, color: e.target.value})} 
                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                     <label className="text-xs text-github-muted">Nome da Conta</label>
                     <input 
                        placeholder="Ex: NuConta, Itaú..." 
                        className="w-full bg-github-bg border border-github-border rounded p-2 text-sm text-github-text focus:border-github-primary outline-none"
                        value={bankForm.name} onChange={e => setBankForm({...bankForm, name: e.target.value})} required
                     />
                </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-1">
                 <label className="text-xs text-github-muted">Tipo de Conta</label>
                 <select 
                    className="bg-github-bg border border-github-border rounded p-2 text-sm text-github-text outline-none"
                    value={bankForm.type} onChange={e => setBankForm({...bankForm, type: e.target.value})}
                >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="investment">Corretora (Investimento)</option>
                    <option value="wallet">Carteira (Dinheiro)</option>
                </select>
              </div>
              
              <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-github-muted">Saldo Inicial</label>
                  <input 
                      type="number" step="0.01" className="bg-github-bg border border-github-border rounded p-2 text-sm text-github-text outline-none"
                      value={bankForm.balance} onChange={e => setBankForm({...bankForm, balance: e.target.value})}
                  />
              </div>
            </div>

            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="isActive"
                    checked={bankForm.isActive} 
                    onChange={e => setBankForm({...bankForm, isActive: e.target.checked})}
                    className="w-4 h-4 rounded border-github-border bg-github-bg"
                />
                <label htmlFor="isActive" className="text-sm text-github-text cursor-pointer select-none">
                    Conta Ativa (Exibir em listagens)
                </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-github-border mt-2">
                 <Button onClick={() => setShowBankForm(false)} variant="secondary">Cancelar</Button>
                 <Button type="submit" variant="primary">Salvar</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.filter(b => b.type !== 'credit').map(bank => {
            const isHidden = bank.isActive === false;
            // Use the cash flow calculation for the displayed balance
            const currentBalance = getBankBalanceAtDate(bank.id, today);
            
            return (
                <Card 
                    key={bank.id} 
                    className={`p-6 flex flex-col justify-between group hover:border-github-muted transition-colors h-40 relative overflow-hidden ${isHidden ? 'opacity-60 grayscale' : ''}`}
                    style={{ borderLeft: `4px solid ${bank.color}` }}
                >
                    <div className="flex justify-between items-start z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-github-surface border border-github-border shadow-sm" style={{ color: bank.color }}>
                            <Wallet size={24} />
                        </div>
                        <div>
                        <p className="font-bold text-lg text-github-text flex items-center gap-2">
                            {bank.name}
                            {isHidden && <EyeOff size={14} className="text-github-muted" />}
                        </p>
                        <p className="text-xs text-github-muted capitalize">
                            {bank.type === 'checking' ? 'Corrente' : bank.type === 'savings' ? 'Poupança' : 'Investimento'}
                        </p>
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-github-surface p-1 rounded border border-github-border shadow-sm">
                        <button onClick={() => startEditBank(bank)} className="p-1.5 text-github-muted hover:text-github-primary rounded" title="Editar"><Pencil size={14} /></button>
                        <button onClick={() => deleteBank(bank.id)} className="p-1.5 text-github-muted hover:text-github-danger rounded" title="Excluir"><Trash2 size={14} /></button>
                    </div>
                    </div>
                    
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 pointer-events-none" style={{ backgroundColor: bank.color }}></div>

                    <div className="z-10 mt-auto">
                        <p className="text-xs text-github-muted">Saldo Atual (Hoje)</p>
                        <p className={`font-mono text-2xl font-medium ${currentBalance < 0 ? 'text-github-danger' : 'text-github-success'}`}>
                            {formatCurrency(currentBalance)}
                        </p>
                    </div>
                </Card>
            );
        })}
      </div>
    </div>
  );
};

export const CategoriesModule = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useApp();
    const [catType, setCatType] = useState<'expense' | 'income'>('expense');
    const [catForm, setCatForm] = useState({ id: '', name: '', color: '' });
    const [editingCatId, setEditingCatId] = useState<string|null>(null);

    const handleCatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(editingCatId) {
            const existing = categories.find(c => c.id === editingCatId);
            if(existing) updateCategory({...existing, name: catForm.name, color: catForm.color || existing.color });
            setEditingCatId(null);
        } else {
            addCategory(catForm.name, catType);
        }
        setCatForm({ id: '', name: '', color: '' });
    };

    const startEditCat = (c: Category) => {
        setEditingCatId(c.id);
        setCatForm({ id: c.id, name: c.name, color: c.color });
    }

    const handleTabChange = (type: 'expense' | 'income') => {
        setCatType(type);
        setCatForm({ id: '', name: '', color: '' });
        setEditingCatId(null);
    }

    const filteredCats = categories.filter(c => c.type === catType).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-github-text">Categorias</h2>
                <div className="flex bg-github-surface rounded p-1 border border-github-border">
                    <button onClick={() => handleTabChange('expense')} className={`px-4 py-2 text-sm rounded transition-colors font-medium ${catType === 'expense' ? 'bg-github-danger text-white' : 'text-github-muted hover:text-github-text'}`}>Despesas</button>
                    <button onClick={() => handleTabChange('income')} className={`px-4 py-2 text-sm rounded transition-colors font-medium ${catType === 'income' ? 'bg-github-success text-white' : 'text-github-muted hover:text-github-text'}`}>Receitas</button>
                </div>
            </div>
            
            <Card className="p-4 border-github-border max-w-2xl mx-auto">
                <form onSubmit={handleCatSubmit} className="flex gap-2">
                {editingCatId ? (
                    <div className="flex gap-2 flex-1 animate-in fade-in">
                        <input type="color" value={catForm.color} onChange={e => setCatForm({...catForm, color: e.target.value})} className="h-10 w-12 bg-transparent border border-github-border rounded cursor-pointer self-center" />
                        <input 
                            className="flex-1 bg-github-bg border border-github-border rounded px-4 py-2 text-github-text focus:border-github-primary outline-none"
                            value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} autoFocus
                        />
                        <Button type="submit" variant="primary" className="px-4"><Pencil size={18}/></Button>
                        <Button onClick={() => { setEditingCatId(null); setCatForm({id:'', name:'', color:''}) }} variant="secondary" className="px-4">X</Button>
                    </div>
                ) : (
                    <>
                        <input 
                            className="flex-1 bg-github-bg border border-github-border rounded px-4 py-2 text-github-text focus:border-github-primary outline-none"
                            placeholder={`Nova categoria de ${catType === 'expense' ? 'Despesa' : 'Receita'}...`}
                            value={catForm.name}
                            onChange={e => setCatForm({...catForm, name: e.target.value})}
                        />
                        <Button type="submit" variant="secondary"><Plus size={18} /></Button>
                    </>
                )}
                </form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCats.map(cat => (
                <div key={cat.id} className="group flex items-center justify-between p-4 bg-github-surface border border-github-border rounded-lg hover:border-github-muted transition-colors shadow-sm">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></div>
                    <span className="font-medium truncate text-github-text">{cat.name}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditCat(cat)} className="text-github-muted hover:text-github-text"><Pencil size={14}/></button>
                    <button onClick={() => { if(window.confirm('Excluir categoria?')) deleteCategory(cat.id); }} className="text-github-muted hover:text-red-500"><Trash2 size={14}/></button>
                </div>
                </div>
            ))}
            </div>
        </div>
    );
};

export const InvestmentsModule = () => {
  const { banks, investments, addInvestment, updateInvestment, deleteInvestment, handleInvestmentTransaction } = useApp();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  
  const [transactModal, setTransactModal] = useState<{show: boolean, type: 'in' | 'out', invId: string}>({ show: false, type: 'in', invId: '' });
  const [transactAmount, setTransactAmount] = useState('');

  const [form, setForm] = useState({
      bankId: '',
      name: '',
      principal: '',
      rate: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      color: '#bc8cff'
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const payload = {
          bankId: form.bankId,
          name: form.name,
          principal: parseFloat(form.principal),
          rate: parseFloat(form.rate),
          frequency: form.frequency as 'daily'|'monthly'|'yearly',
          startDate: new Date(form.startDate).toISOString(),
          color: form.color
      };

      if(editingId) {
          updateInvestment({ ...payload, id: editingId });
      } else {
          addInvestment(payload);
      }
      resetForm();
  };

  const handleTransact = (e: React.FormEvent) => {
      e.preventDefault();
      if(!transactAmount || !transactModal.invId) return;
      handleInvestmentTransaction(transactModal.invId, parseFloat(transactAmount), transactModal.type);
      setTransactModal({ show: false, type: 'in', invId: '' });
      setTransactAmount('');
  }

  const resetForm = () => {
      setShowForm(false);
      setEditingId(null);
      setForm({
          bankId: '', name: '', principal: '', rate: '', frequency: 'monthly',
          startDate: new Date().toISOString().split('T')[0], color: '#bc8cff'
      });
  };

  const startEdit = (inv: Investment) => {
      setEditingId(inv.id);
      setForm({
          bankId: inv.bankId,
          name: inv.name,
          principal: inv.principal.toString(),
          rate: inv.rate.toString(),
          frequency: inv.frequency,
          startDate: inv.startDate.split('T')[0],
          color: inv.color || '#bc8cff'
      });
      setShowForm(true);
  };

  const calculateTotal = (inv: Investment) => {
    if (!inv.startDate) return { interest: 0, total: inv.principal };
    const start = new Date(inv.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let interest = 0;
    const rateDecimal = inv.rate / 100;
    
    if (inv.principal > 0) {
        if (inv.frequency === 'daily') {
            interest = inv.principal * Math.pow((1 + rateDecimal), diffDays) - inv.principal;
        } else if (inv.frequency === 'monthly') {
            const diffMonths = diffDays / 30;
            interest = inv.principal * Math.pow((1 + rateDecimal), diffMonths) - inv.principal;
        } else {
            const diffYears = diffDays / 365;
            interest = inv.principal * Math.pow((1 + rateDecimal), diffYears) - inv.principal;
        }
    }
    return {
        interest,
        total: inv.principal + interest
    };
  }

  const investmentsByBank = banks.map(bank => {
      const bankInvs = investments.filter(i => i.bankId === bank.id);
      if (bankInvs.length === 0) return null;
      return { bank, items: bankInvs };
  }).filter((group): group is { bank: Bank, items: Investment[] } => group !== null);

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-github-text">Investimentos</h2>
            <Button onClick={() => setShowForm(true)} variant="primary">
                <Plus size={18} className="mr-2 inline" /> Novo Investimento
            </Button>
        </div>

        {showForm && (
            <Card className="p-6 border-github-primary border mb-6 animate-in slide-in-from-top-2">
                <h3 className="font-bold mb-4 text-github-text">{editingId ? 'Editar Investimento' : 'Novo Investimento'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs text-github-muted mb-1 block">Nome do Investimento</label>
                        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none" placeholder="Ex: CDB Nubank" />
                    </div>
                    
                    <div>
                         <label className="text-xs text-github-muted mb-1 block">Banco Vinculado</label>
                         <select required value={form.bankId} onChange={e => setForm({...form, bankId: e.target.value})} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none">
                             <option value="">Selecione...</option>
                             {banks.filter(b => b.type !== 'credit').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                         </select>
                    </div>

                    <div>
                         <label className="text-xs text-github-muted mb-1 block">Valor Inicial (Principal)</label>
                         <input required type="number" step="0.01" value={form.principal} onChange={e => setForm({...form, principal: e.target.value})} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none" />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-github-muted mb-1 block">Taxa de Juros (%)</label>
                            <input required type="number" step="0.01" value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none" />
                        </div>
                         <div className="flex-1">
                            <label className="text-xs text-github-muted mb-1 block">Frequência</label>
                            <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none">
                                <option value="daily">Diário</option>
                                <option value="monthly">Mensal</option>
                                <option value="yearly">Anual</option>
                            </select>
                        </div>
                    </div>

                    <div>
                         <label className="text-xs text-github-muted mb-1 block">Data de Início</label>
                         <input required type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none" />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        <Button onClick={resetForm} variant="secondary">Cancelar</Button>
                        <Button type="submit" variant="primary">Salvar</Button>
                    </div>
                </form>
            </Card>
        )}

        {transactModal.show && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md p-6 border-github-border">
                    <h3 className="text-lg font-bold mb-4 text-github-text">
                        {transactModal.type === 'in' ? 'Novo Aporte' : 'Resgatar Valor'}
                    </h3>
                    <form onSubmit={handleTransact} className="space-y-4">
                        <div>
                            <label className="text-xs text-github-muted mb-1 block">Valor</label>
                            <input autoFocus required type="number" step="0.01" value={transactAmount} onChange={e => setTransactAmount(e.target.value)} className="w-full bg-github-bg border border-github-border rounded p-2 text-github-text outline-none text-lg" placeholder="R$ 0,00" />
                        </div>
                        <p className="text-xs text-github-muted">
                            {transactModal.type === 'in' 
                                ? 'O valor será debitado do saldo da conta vinculada.' 
                                : 'O valor será creditado no saldo da conta vinculada.'}
                        </p>
                        <div className="flex justify-end gap-2">
                             <Button onClick={() => setTransactModal({show:false, type:'in', invId:''})} variant="secondary">Cancelar</Button>
                             <Button type="submit" variant="primary" className={transactModal.type === 'out' ? 'bg-github-danger hover:bg-red-600 border-red-800' : ''}>Confirmar</Button>
                        </div>
                    </form>
                </Card>
            </div>
        )}

        {investmentsByBank.length === 0 && !showForm && (
             <div className="text-center p-12 bg-github-surface rounded-lg border border-github-border border-dashed">
                <PiggyBank size={48} className="mx-auto text-github-muted mb-4 opacity-50" />
                <p className="text-github-muted">Você ainda não possui investimentos cadastrados.</p>
            </div>
        )}

        {investmentsByBank.map((group) => (
            <div key={group.bank.id} className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-github-text">
                    <Wallet size={18} /> {group.bank.name}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {group.items.map((inv) => {
                        const { interest, total } = calculateTotal(inv);
                        return (
                            <Card key={inv.id} className="p-4 border-l-4" style={{ borderLeftColor: inv.color || '#bc8cff' }}>
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-lg text-github-text">{inv.name}</h4>
                                            <span className="text-[10px] bg-github-bg px-2 py-0.5 rounded border border-github-border text-github-muted">
                                                {inv.rate}% {inv.frequency === 'daily' ? 'a.d.' : inv.frequency === 'monthly' ? 'a.m.' : 'a.a.'}
                                            </span>
                                        </div>
                                        <div className="flex gap-6 text-sm">
                                            <div>
                                                <p className="text-github-muted text-xs">Aplicado</p>
                                                <p className="font-mono text-github-text">{formatCurrency(inv.principal)}</p>
                                            </div>
                                            <div>
                                                <p className="text-github-muted text-xs">Rendimento (Est.)</p>
                                                <p className="font-mono text-github-success">+{formatCurrency(interest)}</p>
                                            </div>
                                             <div>
                                                <p className="text-github-muted text-xs">Total Atual</p>
                                                <p className="font-mono font-bold text-github-text">{formatCurrency(total)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={() => setTransactModal({show: true, type: 'in', invId: inv.id})} variant="secondary" className="px-3 py-1 text-xs flex items-center gap-1">
                                            <ArrowUpCircle size={14}/> Aportar
                                        </Button>
                                        <Button onClick={() => setTransactModal({show: true, type: 'out', invId: inv.id})} variant="secondary" className="px-3 py-1 text-xs flex items-center gap-1">
                                            <ArrowDownCircle size={14}/> Resgatar
                                        </Button>
                                        <button onClick={() => startEdit(inv)} className="p-2 text-github-muted hover:text-github-text bg-github-bg rounded border border-github-border transition-colors">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => deleteInvestment(inv.id)} className="p-2 text-github-muted hover:text-red-500 bg-github-bg rounded border border-github-border transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
  );
};

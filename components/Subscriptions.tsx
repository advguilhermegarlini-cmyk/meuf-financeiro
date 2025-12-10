import React, { useState } from 'react';
import { Trash2, Plus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context';
import { Subscription, Bank } from '../types';
import { formatCurrency } from '../utils';

export const SubscriptionsComponent: React.FC<{ cardId: string }> = ({ cardId }) => {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, categories, banks } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    categoryId: '',
    dayOfMonth: 1,
    frequency: 'monthly' as 'monthly' | 'yearly',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const cardSubscriptions = subscriptions.filter(s => s.cardId === cardId);
  const card = banks.find(b => b.id === cardId);

  const handleAddSubscription = async () => {
    if (!formData.name || !formData.amount || !formData.categoryId) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await addSubscription({
        cardId,
        name: formData.name,
        amount: formData.amount,
        categoryId: formData.categoryId,
        dayOfMonth: formData.dayOfMonth,
        frequency: formData.frequency,
        notes: formData.notes,
        startDate: formData.startDate,
        isActive: true,
      });
      
      setFormData({
        name: '',
        amount: 0,
        categoryId: '',
        dayOfMonth: 1,
        frequency: 'monthly',
        notes: '',
        startDate: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
    } catch (error) {
      alert('Erro ao adicionar assinatura');
      console.error(error);
    }
  };

  const handleToggleActive = async (sub: Subscription) => {
    try {
      await updateSubscription({
        ...sub,
        isActive: !sub.isActive,
      });
    } catch (error) {
      alert('Erro ao atualizar assinatura');
      console.error(error);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta assinatura?')) return;
    
    try {
      await deleteSubscription(id);
    } catch (error) {
      alert('Erro ao deletar assinatura');
      console.error(error);
    }
  };

  const upcomingSubscriptions = cardSubscriptions.filter(s => s.isActive).map(s => {
    const today = new Date();
    const nextDue = new Date(today.getFullYear(), today.getMonth(), s.dayOfMonth);
    
    // Se o dia já passou neste mês, próxima cobrança é próximo mês
    if (nextDue < today) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    
    return { ...s, nextDue };
  }).sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());

  const monthlyTotal = cardSubscriptions
    .filter(s => s.isActive && s.frequency === 'monthly')
    .reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-github-fg">Assinaturas</h3>
          {monthlyTotal > 0 && (
            <p className="text-sm text-github-fg-muted">
              {formatCurrency(monthlyTotal)}/mês
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-2 bg-github-accent text-white rounded-lg hover:opacity-90 transition text-sm"
        >
          <Plus size={16} />
          Nova Assinatura
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-github-surface border border-github-border rounded-lg p-4 space-y-3">
          <div>
            <label className="text-sm text-github-fg-muted">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Netflix, Spotify..."
              className="w-full mt-1 px-3 py-2 bg-github-bg border border-github-border rounded text-github-fg focus:outline-none focus:border-github-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-github-fg-muted">Valor</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                placeholder="0.00"
                step="0.01"
                className="w-full mt-1 px-3 py-2 bg-github-bg border border-github-border rounded text-github-fg focus:outline-none focus:border-github-accent"
              />
            </div>

            <div>
              <label className="text-sm text-github-fg-muted">Dia do Mês</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.dayOfMonth}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-github-bg border border-github-border rounded text-github-fg focus:outline-none focus:border-github-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-github-fg-muted">Categoria</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-github-bg border border-github-border rounded text-github-fg focus:outline-none focus:border-github-accent"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-github-fg-muted">Frequência</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'monthly' | 'yearly' })}
                className="w-full mt-1 px-3 py-2 bg-github-bg border border-github-border rounded text-github-fg focus:outline-none focus:border-github-accent"
              >
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-github-fg-muted">Notas (opcional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Plano Premium..."
              className="w-full mt-1 px-3 py-2 bg-github-bg border border-github-border rounded text-github-fg focus:outline-none focus:border-github-accent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddSubscription}
              className="flex-1 px-4 py-2 bg-github-accent text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-github-border text-github-fg rounded-lg hover:bg-github-surface transition text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Subscriptions */}
      {upcomingSubscriptions.length > 0 && (
        <div className="bg-github-surface border border-github-border rounded-lg p-3">
          <h4 className="text-sm font-semibold text-github-fg-muted mb-3">Próximas Cobranças</h4>
          <div className="space-y-2">
            {upcomingSubscriptions.slice(0, 3).map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-2 bg-github-bg rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-github-fg">{sub.name}</p>
                  <p className="text-xs text-github-fg-muted">
                    Dia {sub.dayOfMonth} · {formatCurrency(sub.amount)}
                  </p>
                </div>
                <p className="text-xs text-github-accent font-medium">
                  {sub.nextDue.toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Subscriptions */}
      <div className="space-y-2">
        {cardSubscriptions.map(sub => (
          <div key={sub.id} className="bg-github-surface border border-github-border rounded-lg p-3">
            <div
              onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sub.color || '#6e40aa' }}
                  />
                  <h4 className="font-medium text-github-fg">{sub.name}</h4>
                  {!sub.isActive && (
                    <span className="text-xs px-2 py-0.5 bg-github-border text-github-fg-muted rounded">
                      Inativa
                    </span>
                  )}
                </div>
                <p className="text-sm text-github-fg-muted mt-1">
                  {formatCurrency(sub.amount)} • Dia {sub.dayOfMonth} • {sub.frequency === 'monthly' ? 'Mensal' : 'Anual'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(sub);
                  }}
                  className="p-2 hover:bg-github-bg rounded transition"
                  title={sub.isActive ? 'Desativar' : 'Ativar'}
                >
                  {sub.isActive ? (
                    <Eye size={16} className="text-github-accent" />
                  ) : (
                    <EyeOff size={16} className="text-github-fg-muted" />
                  )}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubscription(sub.id);
                  }}
                  className="p-2 hover:bg-github-bg rounded transition"
                  title="Deletar"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === sub.id && (
              <div className="mt-3 pt-3 border-t border-github-border space-y-2 text-sm">
                {sub.notes && (
                  <p className="text-github-fg-muted">
                    <span className="font-medium">Notas:</span> {sub.notes}
                  </p>
                )}
                <p className="text-github-fg-muted">
                  <span className="font-medium">Categoria:</span> {categories.find(c => c.id === sub.categoryId)?.name}
                </p>
                <p className="text-github-fg-muted">
                  <span className="font-medium">Iniciada em:</span> {new Date(sub.startDate).toLocaleDateString('pt-BR')}
                </p>
                {sub.endDate && (
                  <p className="text-github-fg-muted">
                    <span className="font-medium">Encerrada em:</span> {new Date(sub.endDate).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {cardSubscriptions.length === 0 && !showForm && (
        <div className="text-center py-6 text-github-fg-muted">
          <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p>Nenhuma assinatura cadastrada</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsComponent;

/**
 * TransactionsList Component
 * 
 * Componente para listar, criar e deletar transações.
 * Suporta transações simples e parceladas.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getTransactionsByUserId,
  createTransaction,
  createInstallmentTransaction,
  deleteInstallmentGroup,
  deleteTransaction,
} from '../services/transactions';
import { getCardsByUserId } from '../services/cards';
import { formatCurrency, formatDate } from '../helpers';

export const TransactionsList = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: 'expense', // income | expense
    cardId: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    installments: 1,
  });

  // Carrega dados ao montar
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txData, cardData] = await Promise.all([
        getTransactionsByUserId(user.uid),
        getCardsByUserId(user.uid),
      ]);
      setTransactions(txData);
      setCards(cardData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.cardId || formData.amount <= 0) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const transactionData = {
        description: formData.description,
        amount: formData.amount,
        type: formData.type,
        cardId: formData.cardId,
        category: formData.category,
        date: new Date(formData.date),
      };

      // Cria transação parcelada ou simples
      if (formData.installments > 1) {
        await createInstallmentTransaction(
          user.uid,
          transactionData,
          formData.installments
        );
      } else {
        await createTransaction(user.uid, transactionData);
      }

      // Reseta formulário e recarrega
      setFormData({
        description: '',
        amount: 0,
        type: 'expense',
        cardId: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        installments: 1,
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transaction) => {
    if (
      !window.confirm(
        `Tem certeza que deseja deletar esta ${
          transaction.totalInstallments ? 'série de transações' : 'transação'
        }?`
      )
    )
      return;

    try {
      setLoading(true);
      if (transaction.groupId) {
        // Deleta todas as parcelas
        await deleteInstallmentGroup(user.uid, transaction.groupId);
      } else {
        // Deleta transação individual
        await deleteTransaction(user.uid, transaction.id);
      }
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Transações</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Descrição"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2"
            required
          />

          <input
            type="number"
            placeholder="Valor"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) })
            }
            className="border border-gray-300 rounded px-3 py-2"
            required
          />

          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>

          <select
            value={formData.cardId}
            onChange={(e) =>
              setFormData({ ...formData, cardId: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Selecione um cartão</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Categoria"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2"
          />

          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2"
            required
          />

          <input
            type="number"
            placeholder="Parcelas"
            min="1"
            value={formData.installments}
            onChange={(e) =>
              setFormData({
                ...formData,
                installments: parseInt(e.target.value) || 1,
              })
            }
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Salvando...' : 'Adicionar Transação'}
        </button>
      </form>

      {/* Lista de Transações */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Descrição</th>
              <th className="px-4 py-3 text-left">Categoria</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3 text-center">Parcelas</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{formatDate(tx.date)}</td>
                <td className="px-4 py-3">{tx.description}</td>
                <td className="px-4 py-3">{tx.category || '-'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      tx.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tx.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  {tx.totalInstallments ? (
                    <span className="text-sm text-gray-600">
                      {tx.installmentNumber}/{tx.totalInstallments}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(tx)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-8">
            Nenhuma transação registrada
          </p>
        )}
      </div>
    </div>
  );
};

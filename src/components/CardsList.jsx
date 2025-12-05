/**
 * CardsList Component
 * 
 * Componente para listar, criar e deletar cartões.
 * Exemplo de uso dos serviços de cartões.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getCardsByUserId,
  createCard,
  deleteCard,
  updateCard,
} from '../services/cards';
import { formatCurrency, formatDate } from '../helpers';

export const CardsList = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    balance: 0,
    limit: 0,
    expiryDate: '',
  });
  const [editingId, setEditingId] = useState(null);

  // Carrega cartões ao montar
  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await getCardsByUserId(user.uid);
      setCards(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.number) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await updateCard(user.uid, editingId, formData);
      } else {
        await createCard(user.uid, formData);
      }
      setFormData({ name: '', number: '', balance: 0, limit: 0, expiryDate: '' });
      setEditingId(null);
      await loadCards();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm('Tem certeza que deseja deletar este cartão?')) return;

    try {
      setLoading(true);
      await deleteCard(user.uid, cardId);
      await loadCards();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (card) => {
    setFormData(card);
    setEditingId(card.id);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Meus Cartões</h2>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Nome do Cartão"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Número do Cartão"
            value={formData.number}
            onChange={(e) =>
              setFormData({ ...formData, number: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Saldo"
            value={formData.balance}
            onChange={(e) =>
              setFormData({ ...formData, balance: parseFloat(e.target.value) })
            }
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Limite"
            value={formData.limit}
            onChange={(e) =>
              setFormData({ ...formData, limit: parseFloat(e.target.value) })
            }
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Data de Expiração (MM/YY)"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                number: '',
                balance: 0,
                limit: 0,
                expiryDate: '',
              });
            }}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{card.name}</h3>
            <p className="text-gray-600 mb-2">
              <strong>Número:</strong> {card.number}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Saldo:</strong> {formatCurrency(card.balance)}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Limite:</strong> {formatCurrency(card.limit)}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Expiração:</strong> {card.expiryDate}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(card)}
                className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(card.id)}
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && !loading && (
        <p className="text-gray-500 text-center mt-8">
          Nenhum cartão cadastrado
        </p>
      )}
    </div>
  );
};

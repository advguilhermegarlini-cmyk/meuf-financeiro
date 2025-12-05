/**
 * UsersList Component
 * 
 * Componente para listar usuários (apenas exemplo para admin).
 * Em produção, isso deveria estar em uma área protegida.
 */

import { useState, useEffect } from 'react';
import { getAllUsers } from '../services/users';
import { formatDate } from '../helpers';

export const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Usuários</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-600">Carregando...</p>}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Cadastrado em</th>
              <th className="px-4 py-3 text-left">Atualizado em</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  {user.displayName || 'Sem nome'}
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  {user.createdAt ? formatDate(user.createdAt) : '-'}
                </td>
                <td className="px-4 py-3">
                  {user.updatedAt ? formatDate(user.updatedAt) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-8">Nenhum usuário</p>
        )}
      </div>
    </div>
  );
};

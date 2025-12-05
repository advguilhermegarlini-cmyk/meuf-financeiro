/**
 * Debug Component - Diagnóstico de Sincronização
 * 
 * Adicione ao seu App.tsx para debugging:
 * import DebugPanel from '@/components/DebugPanel'
 * <DebugPanel />
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getCardsByUserId } from '../services/cards';
import { getTransactionsByUserId } from '../services/transactions';
import { getUserById } from '../services/users';

export function DebugPanel() {
  const { user, userData } = useAuth();
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    // Carrega dados para debug
    Promise.all([
      getCardsByUserId(user.uid).catch(err => {
        setErrors(prev => ({ ...prev, cards: err.message }));
        return [];
      }),
      getTransactionsByUserId(user.uid).catch(err => {
        setErrors(prev => ({ ...prev, transactions: err.message }));
        return [];
      }),
    ]).then(([cardsData, txnsData]) => {
      setCards(cardsData || []);
      setTransactions(txnsData || []);
    });
  }, [user?.uid]);

  if (!user) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        maxWidth: '400px',
        background: '#1e1e1e',
        color: '#00ff00',
        border: '2px solid #00ff00',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxHeight: expanded ? '600px' : '50px',
        overflowY: 'auto',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '8px',
          background: '#00ff00',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: expanded ? '8px' : '0',
        }}
      >
        {expanded ? 'Fechar Debug' : 'Abrir Debug'}
      </button>

      {expanded && (
        <>
          <hr style={{ borderColor: '#00ff00', margin: '8px 0' }} />

          <div>
            <strong>AUTH</strong>
            <p>UID: {user.uid}</p>
            <p>Email: {user.email}</p>
            <p>Verificado: {user.emailVerified ? 'SIM' : 'NAO'}</p>
          </div>

          <hr style={{ borderColor: '#00ff00', margin: '8px 0' }} />

          <div>
            <strong>USER DATA (Firestore)</strong>
            {userData ? (
              <>
                <p>Nome: {userData.displayName || 'N/A'}</p>
                <p>Criado: {new Date(userData.createdAt).toLocaleString()}</p>
              </>
            ) : (
              <p style={{ color: '#ff6600' }}>Nao carregado</p>
            )}
          </div>

          <hr style={{ borderColor: '#00ff00', margin: '8px 0' }} />

          <div>
            <strong>CARTOES ({cards.length})</strong>
            {errors.cards && <p style={{ color: '#ff0000' }}>ERRO: {errors.cards}</p>}
            {cards.length > 0 ? (
              cards.map(card => (
                <p key={card.id}>
                  - {card.cardName} ({card.number})
                </p>
              ))
            ) : (
              <p style={{ color: '#ff9900' }}>Nenhum cartao</p>
            )}
          </div>

          <hr style={{ borderColor: '#00ff00', margin: '8px 0' }} />

          <div>
            <strong>TRANSACOES ({transactions.length})</strong>
            {errors.transactions && (
              <p style={{ color: '#ff0000' }}>ERRO: {errors.transactions}</p>
            )}
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map(txn => (
                <p key={txn.id}>
                  - {txn.description} (R$ {txn.amount})
                </p>
              ))
            ) : (
              <p style={{ color: '#ff9900' }}>Nenhuma transacao</p>
            )}
          </div>

          <hr style={{ borderColor: '#00ff00', margin: '8px 0' }} />

          <div>
            <strong>ACOES</strong>
            <button
              onClick={() => {
                console.log('=== DEBUG INFO ===');
                console.log('User:', user);
                console.log('UserData:', userData);
                console.log('Cards:', cards);
                console.log('Transactions:', transactions);
              }}
              style={{
                width: '100%',
                padding: '6px',
                marginTop: '4px',
                background: '#0066ff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Log No Console (F12)
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '6px',
                marginTop: '4px',
                background: '#ff6600',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Recarregar Pagina
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default DebugPanel;

/**
 * SyncStatus Component
 * 
 * Componente que exibe status de sincronizacao e operacoes pendentes
 * Mostra notificacoes visual ao usuario sobre conectividade
 */

import React, { useState, useEffect } from 'react';
import useOfflineSync from '../hooks/useOfflineSync';

export const SyncStatus = () => {
  const { isOnline, isSyncing, pendingCount, getPendingOperations } = useOfflineSync();
  const [showDetails, setShowDetails] = useState(false);
  const pendingOps = getPendingOperations();

  // Auto-hide quando tudo sincronizado
  useEffect(() => {
    if (isOnline && !isSyncing && pendingCount === 0) {
      const timer = setTimeout(() => setShowDetails(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isSyncing, pendingCount]);

  // Modo offline - mostrar sempre
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <div>
            <p className="font-bold">Sem conexao</p>
            <p className="text-sm">{pendingCount} mudancas aguardando sincronizacao</p>
          </div>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            {showDetails ? 'Ocultar' : 'Ver'} detalhes
          </button>
        )}
        {showDetails && (
          <div className="mt-3 text-xs bg-white bg-opacity-50 p-2 rounded">
            {pendingOps.map((op, i) => (
              <p key={i}>{op.name || 'Operacao desconhecida'}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Modo sincronizando
  if (isSyncing || pendingCount > 0) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-spin"></div>
          <div>
            <p className="font-bold">Sincronizando</p>
            <p className="text-sm">{pendingCount} mudancas sendo enviadas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Modo sincronizado - mostrar brevemente
  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <p className="font-bold">Sincronizado</p>
      </div>
    </div>
  );
};

/**
 * Versao minimalista - apenas indicator
 */
export const SyncIndicator = () => {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync();

  if (!isOnline) {
    return (
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Sem conexao">
      </div>
    );
  }

  if (isSyncing || pendingCount > 0) {
    return (
      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-spin" title="Sincronizando...">
      </div>
    );
  }

  return (
    <div className="w-3 h-3 bg-green-500 rounded-full" title="Sincronizado">
    </div>
  );
};

export default SyncStatus;

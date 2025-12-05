/**
 * useOfflineSync Hook
 * 
 * Hook para monitorar status de sincronização offline
 * e exibir feedback ao usuário
 */

import { useState, useEffect } from 'react';
import { offlineSync } from '../utils/offlineSync';

export const useOfflineSync = () => {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
  });

  useEffect(() => {
    // Atualiza status inicialmente
    const updateStatus = () => {
      setStatus(offlineSync.getStatus());
    };

    updateStatus();

    // Cria listener para mudanças
    const handleStatusChange = () => {
      updateStatus();
    };

    // Monitora eventos de online/offline
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Monitora periodicamente
    const interval = setInterval(updateStatus, 1000);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    pendingCount: status.pendingCount,
    addPendingOperation: (operation, metadata) => 
      offlineSync.addPendingOperation(operation, metadata),
    syncNow: () => offlineSync.syncPendingOperations(),
    getPendingOperations: () => status.pendingOperations || [],
    clearPending: () => offlineSync.clearPendingOperations(),
  };
};

export default useOfflineSync;

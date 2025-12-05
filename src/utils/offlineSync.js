/**
 * Offline Sync Manager
 * 
 * Gerencia sincronização de dados quando a conexão é restaurada.
 * Monitora mudanças de conectividade e sincroniza operações pendentes.
 */

import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../firebase';

class OfflineSyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingOperations = [];
    this.isSyncing = false;
    this.setupListeners();
  }

  /**
   * Configura listeners para mudanças de conectividade
   */
  setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Tambem testa conectividade periodicamente
    setInterval(() => this.checkConnectivity(), 30000);
  }

  /**
   * Trata quando volta online
   */
  async handleOnline() {
    console.log('[ONLINE] Volta online - iniciando sincronizacao');
    this.isOnline = true;
    
    try {
      await enableNetwork(db);
      console.log('[FIRESTORE] Habilitado');
      
      // Aguarda um pouco antes de sincronizar
      setTimeout(() => this.syncPendingOperations(), 1000);
    } catch (error) {
      console.error('[ERROR] Erro ao habilitar Firestore:', error);
    }
  }

  /**
   * Trata quando fica offline
   */
  async handleOffline() {
    console.log('[OFFLINE] Ficou offline - desabilitando Firestore');
    this.isOnline = false;
    
    try {
      await disableNetwork(db);
      console.log('[FIRESTORE] Desabilitado');
    } catch (error) {
      console.error('[ERROR] Erro ao desabilitar Firestore:', error);
    }
  }

  /**
   * Verifica conectividade fazendo ping
   */
  async checkConnectivity() {
    try {
      // Tenta fetch de um arquivo muito pequeno
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        no_cors: true,
      });
      
      const wasOnline = this.isOnline;
      this.isOnline = response.ok || response.status === 0;
      
      if (!wasOnline && this.isOnline) {
        await this.handleOnline();
      } else if (wasOnline && !this.isOnline) {
        await this.handleOffline();
      }
    } catch (error) {
      // Se falhar, considera offline
      if (this.isOnline) {
        await this.handleOffline();
      }
    }
  }

  /**
   * Adiciona operacao a fila de sincronizacao
   */
  addPendingOperation(operation, metadata = {}) {
    const id = `${Date.now()}_${Math.random()}`;
    this.pendingOperations.push({
      id,
      operation,
      metadata,
      timestamp: Date.now(),
      retries: 0,
    });

    console.log(`[PENDING] Operacao adicionada (total: ${this.pendingOperations.length})`);
    
    // Se esta online, sincroniza imediatamente
    if (this.isOnline && !this.isSyncing) {
      this.syncPendingOperations();
    }

    return id;
  }

  /**
   * Sincroniza todas as operacoes pendentes
   */
  async syncPendingOperations() {
    if (this.isSyncing || !this.isOnline || this.pendingOperations.length === 0) {
      return;
    }

    this.isSyncing = true;
    console.log(`[SYNC] Iniciando sincronizacao (${this.pendingOperations.length} operacoes)`);

    const operationsToSync = [...this.pendingOperations];
    this.pendingOperations = [];

    for (const item of operationsToSync) {
      try {
        console.log(`[SYNC] Sincronizando: ${item.metadata.name || item.id}`);
        await item.operation();
        console.log(`[SUCCESS] Sincronizado: ${item.metadata.name || item.id}`);
      } catch (error) {
        console.error(`[ERROR] Erro ao sincronizar ${item.metadata.name}:`, error);

        item.retries++;
        if (item.retries < 5) {
          // Coloca de volta na fila para tentar novamente
          this.pendingOperations.push(item);
          console.log(`[RETRY] Operacao sera retentada (tentativa ${item.retries}/5)`);
        } else {
          console.error(`[DISCARD] Operacao descartada apos 5 tentativas: ${item.metadata.name}`);
        }
      }
    }

    this.isSyncing = false;
    console.log(`[COMPLETE] Sincronizacao concluida (${this.pendingOperations.length} pendentes)`);
  }

  /**
   * Obtem status de sincronizacao
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.pendingOperations.length,
      pendingOperations: this.pendingOperations.map((op) => op.metadata),
    };
  }

  /**
   * Limpa todas as operacoes pendentes
   */
  clearPendingOperations() {
    console.log(`[CLEAR] Limpando ${this.pendingOperations.length} operacoes`);
    this.pendingOperations = [];
  }
}

// Exporta instancia unica
export const offlineSync = new OfflineSyncManager();

// Exporta tambem a classe para testes
export default OfflineSyncManager;


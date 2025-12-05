/**
 * Cards Service
 * 
 * CRUD para gerenciar cartões de crédito do usuário.
 * Coleção: users/{uid}/cards
 * 
 * Inclui retry automático, tratamento de offline e cache local
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  enableNetwork,
  disableNetwork,
  getFirestore,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getServerTimestamp } from '../helpers';

// Configuração de retry
const RETRY_CONFIG = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

// Cache local para sincronização offline
const localCache = new Map();
const pendingOperations = [];

/**
 * Aguarda com backoff exponencial
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calcula delay com backoff exponencial
 */
const getBackoffDelay = (attempt) => {
  const exponentialDelay = RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(exponentialDelay, RETRY_CONFIG.maxDelay);
};

/**
 * Tenta uma operação com retry automático
 */
const executeWithRetry = async (operation, operationName) => {
  let lastError;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Não retry para erros de autenticação ou permissão
      if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
        throw error;
      }
      
      // Se foi última tentativa, lança erro
      if (attempt === RETRY_CONFIG.maxRetries) {
        console.error(`${operationName} falhou após ${RETRY_CONFIG.maxRetries} tentativas:`, error);
        throw error;
      }
      
      // Aguarda antes de tentar novamente
      const backoffDelay = getBackoffDelay(attempt);
      console.warn(`${operationName} falhou (tentativa ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}), aguardando ${backoffDelay}ms...`);
      await delay(backoffDelay);
    }
  }
  
  throw lastError;
};

/**
 * Verifica se está online
 */
const isOnline = () => navigator.onLine;

/**
 * Habilita reconexão com Firestore
 */
export const reconnectFirebase = async () => {
  try {
    await enableNetwork(db);
    console.log('Firestore reconectado');
    // Sincroniza operações pendentes
    await syncPendingOperations();
  } catch (error) {
    console.error('Erro ao reconectar Firestore:', error);
  }
};

/**
 * Sincroniza operações pendentes
 */
const syncPendingOperations = async () => {
  while (pendingOperations.length > 0) {
    const operation = pendingOperations.shift();
    try {
      await operation();
      console.log('Operação sincronizada com sucesso');
    } catch (error) {
      console.error('Erro ao sincronizar operação:', error);
      // Coloca de volta na fila se falhar
      pendingOperations.unshift(operation);
      throw error;
    }
  }
};

// Monitora conexão online/offline
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Volta online - sincronizando dados');
    reconnectFirebase();
  });
  
  window.addEventListener('offline', () => {
    console.log('Ficou offline');
    disableNetwork(db).catch(console.error);
  });
}

/**
 * Obtém a referência da subcoleção de cartões do usuário
 */
const getCardsCollection = (uid) => {
  return collection(db, 'users', uid, 'cards');
};

/**
 * Cria um novo cartão para o usuário
 */
export const createCard = async (uid, cardData) => {
  const operation = async () => {
    const cardsRef = getCardsCollection(uid);
    const docRef = await addDoc(cardsRef, {
      ...cardData,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
      synced: true,
    });
    
    // Salva no cache local
    localCache.set(`card_${docRef.id}`, {
      id: docRef.id,
      ...cardData,
      createdAt: new Date(),
    });
    
    return docRef.id;
  };
  
  try {
    return await executeWithRetry(operation, 'createCard');
  } catch (error) {
    // Se falhar, salva como pendente para sincronizar depois
    if (!isOnline()) {
      console.warn('Offline: salvando cartão localmente para sincronizar depois');
      const tempId = `temp_${Date.now()}`;
      localCache.set(`card_${tempId}`, { id: tempId, ...cardData, synced: false });
      pendingOperations.push(operation);
      return tempId;
    }
    throw error;
  }
};

/**
 * Obtém todos os cartões do usuário
 */
export const getCardsByUserId = async (uid) => {
  const operation = async () => {
    const cardsRef = getCardsCollection(uid);
    const q = query(cardsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const cards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Atualiza cache
    cards.forEach((card) => {
      localCache.set(`card_${card.id}`, card);
    });
    
    return cards;
  };
  
  try {
    return await executeWithRetry(operation, 'getCardsByUserId');
  } catch (error) {
    // Retorna cache local se falhar
    console.warn('Usando cache local para cartões');
    const cachedCards = Array.from(localCache.entries())
      .filter(([key]) => key.startsWith('card_'))
      .map(([, value]) => value)
      .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
    
    if (cachedCards.length > 0) {
      return cachedCards;
    }
    throw error;
  }
};

/**
 * Obtém um cartão específico por ID
 */
export const getCardById = async (uid, cardId) => {
  const operation = async () => {
    // Tenta primeiro no cache
    const cached = localCache.get(`card_${cardId}`);
    if (cached) return cached;
    
    const cardRef = doc(db, 'users', uid, 'cards', cardId);
    const cardDoc = await getDoc(cardRef);
    if (cardDoc.exists()) {
      const card = { id: cardDoc.id, ...cardDoc.data() };
      localCache.set(`card_${cardId}`, card);
      return card;
    }
    return null;
  };
  
  try {
    return await executeWithRetry(operation, 'getCardById');
  } catch (error) {
    // Retorna do cache se falhar
    const cached = localCache.get(`card_${cardId}`);
    if (cached) return cached;
    throw error;
  }
};

/**
 * Atualiza um cartão existente
 */
export const updateCard = async (uid, cardId, updates) => {
  const operation = async () => {
    const cardRef = doc(db, 'users', uid, 'cards', cardId);
    await updateDoc(cardRef, {
      ...updates,
      updatedAt: getServerTimestamp(),
      synced: true,
    });
    
    // Atualiza cache
    const cached = localCache.get(`card_${cardId}`) || {};
    localCache.set(`card_${cardId}`, {
      ...cached,
      ...updates,
      updatedAt: new Date(),
      synced: true,
    });
    
    return cardId;
  };
  
  try {
    return await executeWithRetry(operation, 'updateCard');
  } catch (error) {
    if (!isOnline()) {
      console.warn('Offline: salvando atualização localmente');
      const cached = localCache.get(`card_${cardId}`) || {};
      localCache.set(`card_${cardId}`, {
        ...cached,
        ...updates,
        updatedAt: new Date(),
        synced: false,
      });
      pendingOperations.push(operation);
      return cardId;
    }
    throw error;
  }
};

/**
 * Deleta um cartão
 */
export const deleteCard = async (uid, cardId) => {
  const operation = async () => {
    const cardRef = doc(db, 'users', uid, 'cards', cardId);
    await deleteDoc(cardRef);
    
    // Remove do cache
    localCache.delete(`card_${cardId}`);
    
    return cardId;
  };
  
  try {
    return await executeWithRetry(operation, 'deleteCard');
  } catch (error) {
    if (!isOnline()) {
      console.warn('Offline: deletação será sincronizada quando voltar online');
      pendingOperations.push(operation);
      return cardId;
    }
    throw error;
  }
};

/**
 * Obtém o saldo total de todos os cartões
 */
export const getTotalCardBalance = async (uid) => {
  const operation = async () => {
    const cards = await getCardsByUserId(uid);
    return cards.reduce((total, card) => total + (card.balance || 0), 0);
  };
  
  try {
    return await executeWithRetry(operation, 'getTotalCardBalance');
  } catch (error) {
    console.error('Erro ao calcular saldo:', error);
    throw error;
  }
};

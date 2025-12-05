/**
 * Transactions Service
 * 
 * CRUD para gerenciar transações do usuário, incluindo suporte a parcelamento.
 * Coleção: users/{uid}/transactions
 * 
 * Para transações parceladas, criamos múltiplos documentos (um por parcela)
 * com datas diferentes, vinculados por um groupId.
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
  where,
  orderBy,
  writeBatch,
  enableNetwork,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getServerTimestamp, addMonthsToDate, generateId } from '../helpers';

// Configuração de retry (mesma do cards.js)
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
      
      if (attempt === RETRY_CONFIG.maxRetries) {
        console.error(`${operationName} falhou após ${RETRY_CONFIG.maxRetries} tentativas:`, error);
        throw error;
      }
      
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
 * Obtém a referência da subcoleção de transações do usuário
 */
const getTransactionsCollection = (uid) => {
  return collection(db, 'users', uid, 'transactions');
};

/**
 * Cria uma transação simples (sem parcelamento)
 */
export const createTransaction = async (uid, transactionData) => {
  const operation = async () => {
    const txRef = getTransactionsCollection(uid);
    const docRef = await addDoc(txRef, {
      ...transactionData,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
      synced: true,
    });
    
    // Salva no cache local
    localCache.set(`txn_${docRef.id}`, {
      id: docRef.id,
      ...transactionData,
      createdAt: new Date(),
      synced: true,
    });
    
    return docRef.id;
  };
  
  try {
    return await executeWithRetry(operation, 'createTransaction');
  } catch (error) {
    if (!isOnline()) {
      console.warn('Offline: salvando transação localmente');
      const tempId = `temp_${Date.now()}`;
      localCache.set(`txn_${tempId}`, { id: tempId, ...transactionData, synced: false });
      pendingOperations.push(operation);
      return tempId;
    }
    throw error;
  }
};

/**
 * Cria uma transação parcelada (multiple installments)
 * 
 * Cria N documentos separados, cada um representando uma parcela,
 * com datas corretas para cada mês.
 */
export const createInstallmentTransaction = async (
  uid,
  transactionData,
  installments = 1
) => {
  try {
    if (installments <= 0) {
      throw new Error('Número de parcelas deve ser maior que 0');
    }

    const groupId = generateId(); // ID para vincular as parcelas
    const txRef = getTransactionsCollection(uid);
    const batch = writeBatch(db);

    const baseAmount = transactionData.amount / installments;
    const baseDate = new Date(transactionData.date);

    for (let i = 0; i < installments; i++) {
      // Calcula a data correta para cada parcela
      const installmentDate = addMonthsToDate(baseDate, i);

      const docRef = doc(txRef);
      batch.set(docRef, {
        ...transactionData,
        amount: baseAmount,
        installmentNumber: i + 1,
        totalInstallments: installments,
        groupId, // Vincula todas as parcelas
        date: installmentDate.toISOString(),
        createdAt: getServerTimestamp(),
        updatedAt: getServerTimestamp(),
      });
    }

    await batch.commit();
    return groupId;
  } catch (error) {
    console.error('Erro ao criar transação parcelada:', error);
    throw error;
  }
};

/**
 * Obtém todas as transações do usuário
 */
export const getTransactionsByUserId = async (uid) => {
  try {
    const txRef = getTransactionsCollection(uid);
    const q = query(txRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter transações:', error);
    throw error;
  }
};

/**
 * Obtém transações filtradas por intervalo de datas
 */
export const getTransactionsByDateRange = async (uid, startDate, endDate) => {
  try {
    const txRef = getTransactionsCollection(uid);
    const q = query(
      txRef,
      where('date', '>=', startDate.toISOString()),
      where('date', '<=', endDate.toISOString()),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter transações por data:', error);
    throw error;
  }
};

/**
 * Obtém transações filtradas por tipo (income, expense)
 */
export const getTransactionsByType = async (uid, type) => {
  try {
    const txRef = getTransactionsCollection(uid);
    const q = query(txRef, where('type', '==', type), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter transações por tipo:', error);
    throw error;
  }
};

/**
 * Obtém uma transação específica por ID
 */
export const getTransactionById = async (uid, transactionId) => {
  try {
    const txRef = doc(db, 'users', uid, 'transactions', transactionId);
    const txDoc = await getDoc(txRef);
    if (txDoc.exists()) {
      return { id: txDoc.id, ...txDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter transação:', error);
    throw error;
  }
};

/**
 * Obtém todas as parcelas vinculadas a um groupId
 */
export const getInstallmentsByGroupId = async (uid, groupId) => {
  try {
    const txRef = getTransactionsCollection(uid);
    const q = query(txRef, where('groupId', '==', groupId), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter parcelas:', error);
    throw error;
  }
};

/**
 * Atualiza uma transação
 */
export const updateTransaction = async (uid, transactionId, updates) => {
  try {
    const txRef = doc(db, 'users', uid, 'transactions', transactionId);
    await updateDoc(txRef, {
      ...updates,
      updatedAt: getServerTimestamp(),
    });
    return transactionId;
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    throw error;
  }
};

/**
 * Deleta uma transação individual
 */
export const deleteTransaction = async (uid, transactionId) => {
  try {
    const txRef = doc(db, 'users', uid, 'transactions', transactionId);
    await deleteDoc(txRef);
    return transactionId;
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    throw error;
  }
};

/**
 * Deleta todas as parcelas de uma transação parcelada
 */
export const deleteInstallmentGroup = async (uid, groupId) => {
  try {
    const installments = await getInstallmentsByGroupId(uid, groupId);
    const batch = writeBatch(db);

    installments.forEach((installment) => {
      const txRef = doc(db, 'users', uid, 'transactions', installment.id);
      batch.delete(txRef);
    });

    await batch.commit();
    return groupId;
  } catch (error) {
    console.error('Erro ao deletar grupo de parcelas:', error);
    throw error;
  }
};

/**
 * Calcula o total de despesas/receitas por mês
 */
export const getSummaryByMonth = async (uid, year, month) => {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const transactions = await getTransactionsByDateRange(uid, startDate, endDate);

    const summary = {
      income: 0,
      expense: 0,
      total: 0,
      transactionCount: transactions.length,
    };

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        summary.income += tx.amount;
      } else if (tx.type === 'expense') {
        summary.expense += tx.amount;
      }
    });

    summary.total = summary.income - summary.expense;

    return summary;
  } catch (error) {
    console.error('Erro ao calcular resumo mensal:', error);
    throw error;
  }
};

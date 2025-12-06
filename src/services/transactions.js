/**
 * Transactions Service
 * 
 * CRUD para gerenciar transações do usuário, incluindo suporte a parcelamento.
 * Coleção: users/{uid}/transactions
 * 
 * Para transações parceladas, criamos múltiplos documentos (um por parcela)
 * com datas diferentes, vinculados por um groupId.
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
} from 'firebase/firestore';
import { db } from '../firebase';
import { getServerTimestamp, addMonthsToDate, generateId } from '../helpers';

/**
 * Remove campos undefined e inválidos do objeto
 * Firebase não permite undefined, e precisamos validar tipos básicos
 */
const cleanData = (obj) => {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Pular undefined
    if (value === undefined) continue;
    
    // Validar tipos básicos
    if (key === 'amount' && typeof value !== 'number') {
      console.warn(`⚠️ Campo 'amount' deve ser number, recebido: ${typeof value}`);
      continue;
    }
    
    if (key === 'type' && !['income', 'expense', 'transfer'].includes(value)) {
      console.warn(`⚠️ Campo 'type' inválido: ${value}`);
      continue;
    }
    
    if (key === 'description' && (typeof value !== 'string' || value.trim() === '')) {
      console.warn(`⚠️ Campo 'description' deve ser string não vazia`);
      continue;
    }
    
    // Se passou nas validações, inclui
    cleaned[key] = value;
  }
  
  return cleaned;
};

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
  try {
    console.log(`🚀 [createTransaction] Iniciando para UID: ${uid}`);
    console.log(`📦 [createTransaction] Dados recebidos:`, transactionData);
    
    // Validações críticas
    if (!uid) throw new Error('UID do usuário é obrigatório');
    if (!transactionData.description) throw new Error('Descrição é obrigatória');
    if (typeof transactionData.amount !== 'number' || transactionData.amount <= 0) {
      throw new Error('Valor deve ser um número positivo');
    }
    if (!['income', 'expense', 'transfer'].includes(transactionData.type)) {
      throw new Error(`Tipo inválido: ${transactionData.type}`);
    }
    if (!transactionData.date) throw new Error('Data é obrigatória');
    if (!transactionData.categoryId && transactionData.type !== 'transfer') {
      throw new Error('Categoria é obrigatória para este tipo');
    }
    if (!transactionData.bankId) throw new Error('Banco/conta é obrigatória');
    
    const txRef = getTransactionsCollection(uid);
    const cleanedData = cleanData(transactionData);
    console.log(`✂️ [createTransaction] Dados após limpar:`, cleanedData);
    
    // Garantir que date é string ISO ou será convertido
    let dateToSave = cleanedData.date;
    if (dateToSave instanceof Date) {
      dateToSave = dateToSave.toISOString();
      console.log(`📅 [createTransaction] Convertido Date para ISO: ${dateToSave}`);
    } else if (typeof dateToSave !== 'string') {
      dateToSave = new Date(dateToSave).toISOString();
      console.log(`📅 [createTransaction] Convertido para ISO: ${dateToSave}`);
    }
    
    const dataToSave = {
      ...cleanedData,
      date: dateToSave,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
    };
    console.log(`📝 [createTransaction] Dados a salvar no Firestore:`, dataToSave);
    
    const docRef = await addDoc(txRef, dataToSave);
    console.log(`✅ [createTransaction] Transação salva com ID: ${docRef.id}`);
    
    // Retorna com o ID correto do Firestore
    return { 
      id: docRef.id, 
      ...cleanedData, 
      date: dateToSave,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
  } catch (error) {
    console.error(`❌ [createTransaction] ERRO CRÍTICO:`, error);
    console.error(`   Mensagem: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
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
      const installmentData = cleanData({
        ...transactionData,
        amount: baseAmount,
        installmentNumber: i + 1,
        totalInstallments: installments,
        groupId, // Vincula todas as parcelas
        date: installmentDate.toISOString(),
        createdAt: getServerTimestamp(),
        updatedAt: getServerTimestamp(),
      });
      batch.set(docRef, installmentData);
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
 * Normaliza os tipos de data para garantir consistência
 */
export const getTransactionsByUserId = async (uid) => {
  try {
    const txRef = getTransactionsCollection(uid);
    const q = query(txRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Normalizar date: garantir que é sempre string ISO
      let normalizedDate = data.date;
      if (data.date && typeof data.date.toDate === 'function') {
        // É um Firestore Timestamp
        normalizedDate = data.date.toDate().toISOString();
      } else if (data.date instanceof Date) {
        // É um Date object
        normalizedDate = data.date.toISOString();
      } else if (typeof data.date !== 'string') {
        // Tentar converter
        normalizedDate = new Date(data.date).toISOString();
      }
      
      return {
        id: doc.id,
        ...data,
        date: normalizedDate, // Sempre string ISO
      };
    });
    
    console.log(`📊 Carregadas ${transactions.length} transações para ${uid}`);
    return transactions;
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
    
    // Remove o ID do updates (não pode ser atualizado)
    const { id, ...updateFields } = updates;
    console.log('🟠 updateTransaction - updateFields:', updateFields);
    
    const cleanedUpdates = cleanData({
      ...updateFields,
      updatedAt: getServerTimestamp(),
    });
    console.log('🟠 updateTransaction - cleanedUpdates:', cleanedUpdates);
    
    await updateDoc(txRef, cleanedUpdates);
    console.log('🟠 updateTransaction - updated ID:', transactionId);
    
    // Retorna a transação atualizada completa
    const updatedDoc = await getDoc(txRef);
    if (updatedDoc.exists()) {
      const result = { id: updatedDoc.id, ...updatedDoc.data() };
      console.log('🟠 updateTransaction - result from Firestore:', result);
      return result;
    }
    console.log('🟠 updateTransaction - doc not found, returning updateFields');
    return { id: transactionId, ...updateFields };
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

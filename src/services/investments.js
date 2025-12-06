/**
 * Investments Service (Firestore)
 * 
 * CRUD para gerenciar investimentos do usuário
 * Coleção: users/{uid}/investments
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getServerTimestamp } from '../helpers';

/**
 * Obtém a referência da subcoleção de investimentos do usuário
 */
const getInvestmentsCollection = (uid) => {
  return collection(db, 'users', uid, 'investments');
};

/**
 * Cria um novo investimento
 */
export const createInvestment = async (uid, investmentData) => {
  try {
    const invRef = getInvestmentsCollection(uid);
    const docRef = await addDoc(invRef, {
      ...investmentData,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
    });
    return { id: docRef.id, ...investmentData };
  } catch (error) {
    console.error('Erro ao criar investimento:', error);
    throw error;
  }
};

/**
 * Obtém todos os investimentos do usuário
 */
export const getInvestmentsByUserId = async (uid) => {
  try {
    const invRef = getInvestmentsCollection(uid);
    const q = query(invRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter investimentos:', error);
    throw error;
  }
};

/**
 * Atualiza um investimento
 */
export const updateInvestment = async (uid, investmentId, updates) => {
  try {
    const invRef = doc(db, 'users', uid, 'investments', investmentId);
    await updateDoc(invRef, {
      ...updates,
      updatedAt: getServerTimestamp(),
    });
    return { id: investmentId, ...updates };
  } catch (error) {
    console.error('Erro ao atualizar investimento:', error);
    throw error;
  }
};

/**
 * Deleta um investimento
 */
export const deleteInvestment = async (uid, investmentId) => {
  try {
    const invRef = doc(db, 'users', uid, 'investments', investmentId);
    await deleteDoc(invRef);
    return investmentId;
  } catch (error) {
    console.error('Erro ao deletar investimento:', error);
    throw error;
  }
};

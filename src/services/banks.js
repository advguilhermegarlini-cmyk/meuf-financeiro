/**
 * Banks Service (Firestore)
 * 
 * CRUD para gerenciar bancos e cartões do usuário
 * Coleção: users/{uid}/banks
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
 * Obtém a referência da subcoleção de bancos do usuário
 */
const getBanksCollection = (uid) => {
  return collection(db, 'users', uid, 'banks');
};

/**
 * Cria um novo banco/cartão
 */
export const createBank = async (uid, bankData) => {
  try {
    const banksRef = getBanksCollection(uid);
    const docRef = await addDoc(banksRef, {
      ...bankData,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
    });
    return { id: docRef.id, ...bankData };
  } catch (error) {
    console.error('Erro ao criar banco:', error);
    throw error;
  }
};

/**
 * Obtém todos os bancos/cartões do usuário
 */
export const getBanksByUserId = async (uid) => {
  try {
    const banksRef = getBanksCollection(uid);
    const q = query(banksRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter bancos:', error);
    throw error;
  }
};

/**
 * Atualiza um banco/cartão
 */
export const updateBank = async (uid, bankId, updates) => {
  try {
    const bankRef = doc(db, 'users', uid, 'banks', bankId);
    await updateDoc(bankRef, {
      ...updates,
      updatedAt: getServerTimestamp(),
    });
    return { id: bankId, ...updates };
  } catch (error) {
    console.error('Erro ao atualizar banco:', error);
    throw error;
  }
};

/**
 * Deleta um banco/cartão
 */
export const deleteBank = async (uid, bankId) => {
  try {
    const bankRef = doc(db, 'users', uid, 'banks', bankId);
    await deleteDoc(bankRef);
    return bankId;
  } catch (error) {
    console.error('Erro ao deletar banco:', error);
    throw error;
  }
};

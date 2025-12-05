/**
 * Users Service
 * 
 * CRUD para gerenciar usuários no Firestore.
 * Coleção: users/{uid}
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getServerTimestamp } from '../helpers';

const usersCollection = collection(db, 'users');

/**
 * Cria ou atualiza o perfil do usuário
 */
export const createOrUpdateUser = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        ...userData,
        updatedAt: getServerTimestamp(),
      },
      { merge: true }
    );
    return uid;
  } catch (error) {
    console.error('Erro ao criar/atualizar usuário:', error);
    throw error;
  }
};

/**
 * Obtém o perfil do usuário por UID
 */
export const getUserById = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    throw error;
  }
};

/**
 * Obtém todos os usuários (apenas para admin/demo)
 */
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    throw error;
  }
};

/**
 * Atualiza dados do usuário
 */
export const updateUser = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: getServerTimestamp(),
    });
    return uid;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

/**
 * Deleta um usuário (soft delete recomendado em produção)
 */
export const deleteUser = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    return uid;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};

/**
 * Obtém usuários por email (útil para busca)
 */
export const getUsersByEmail = async (email) => {
  try {
    const q = query(usersCollection, where('email', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao buscar por email:', error);
    throw error;
  }
};

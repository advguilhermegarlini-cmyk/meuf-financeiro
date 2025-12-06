/**
 * Categories Service (Firestore)
 * 
 * CRUD para gerenciar categorias do usuário
 * Coleção: users/{uid}/categories
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
 * Obtém a referência da subcoleção de categorias do usuário
 */
const getCategoriesCollection = (uid) => {
  return collection(db, 'users', uid, 'categories');
};

/**
 * Cria uma nova categoria
 */
export const createCategory = async (uid, categoryData) => {
  try {
    const catRef = getCategoriesCollection(uid);
    const docRef = await addDoc(catRef, {
      ...categoryData,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
    });
    return { id: docRef.id, ...categoryData };
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

/**
 * Obtém todas as categorias do usuário
 */
export const getCategoriesByUserId = async (uid) => {
  try {
    const catRef = getCategoriesCollection(uid);
    const q = query(catRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter categorias:', error);
    throw error;
  }
};

/**
 * Atualiza uma categoria
 */
export const updateCategory = async (uid, categoryId, updates) => {
  try {
    const catRef = doc(db, 'users', uid, 'categories', categoryId);
    await updateDoc(catRef, {
      ...updates,
      updatedAt: getServerTimestamp(),
    });
    return { id: categoryId, ...updates };
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

/**
 * Deleta uma categoria
 */
export const deleteCategory = async (uid, categoryId) => {
  try {
    const catRef = doc(db, 'users', uid, 'categories', categoryId);
    await deleteDoc(catRef);
    return categoryId;
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    throw error;
  }
};

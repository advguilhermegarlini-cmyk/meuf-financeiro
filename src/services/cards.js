/**
 * Cards Service
 * 
 * CRUD para gerenciar cartões de crédito do usuário.
 * Coleção: users/{uid}/cards
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
} from 'firebase/firestore';
import { db } from '../firebase';
import { getServerTimestamp } from '../helpers';

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
  try {
    const cardsRef = getCardsCollection(uid);
    const docRef = await addDoc(cardsRef, {
      ...cardData,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar cartão:', error);
    throw error;
  }
};

/**
 * Obtém todos os cartões do usuário
 */
export const getCardsByUserId = async (uid) => {
  try {
    const cardsRef = getCardsCollection(uid);
    const q = query(cardsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao obter cartões:', error);
    throw error;
  }
};

/**
 * Obtém um cartão específico por ID
 */
export const getCardById = async (uid, cardId) => {
  try {
    const cardRef = doc(db, 'users', uid, 'cards', cardId);
    const cardDoc = await getDoc(cardRef);
    if (cardDoc.exists()) {
      return { id: cardDoc.id, ...cardDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter cartão:', error);
    throw error;
  }
};

/**
 * Atualiza um cartão existente
 */
export const updateCard = async (uid, cardId, updates) => {
  try {
    const cardRef = doc(db, 'users', uid, 'cards', cardId);
    await updateDoc(cardRef, {
      ...updates,
      updatedAt: getServerTimestamp(),
    });
    return cardId;
  } catch (error) {
    console.error('Erro ao atualizar cartão:', error);
    throw error;
  }
};

/**
 * Deleta um cartão
 */
export const deleteCard = async (uid, cardId) => {
  try {
    const cardRef = doc(db, 'users', uid, 'cards', cardId);
    await deleteDoc(cardRef);
    return cardId;
  } catch (error) {
    console.error('Erro ao deletar cartão:', error);
    throw error;
  }
};

/**
 * Obtém o saldo total de todos os cartões
 */
export const getTotalCardBalance = async (uid) => {
  try {
    const cards = await getCardsByUserId(uid);
    return cards.reduce((total, card) => total + (card.balance || 0), 0);
  } catch (error) {
    console.error('Erro ao calcular saldo:', error);
    throw error;
  }
};
